//In this all the functions are written related to internship
import { prisma } from "../../db/index.js";


export const getAllInternships = async (req, res) => {
  const { user_id } = req.query; 
  console.log("User ID",user_id);

  try {
    const filterCondition = user_id ? { postedBy: { user_id: user_id } } : {};
    console.log("Filer Condition",filterCondition);
    const internships = await prisma.internship.findMany({
      where: filterCondition,
      orderBy: { posted_date: "desc" },
      include: {
        postedBy: {
          select: {
            id: true,             // This is the Recruiter table ID
            user_id: true,        // <--- ADD THIS! This is the global User ID
            first_name: true,
            last_name: true,
            company_name: true,
          },
        },
      },
    });
    
    res.status(200).json(internships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch internships" });
  }
};

// Get internship by ID (Includes applied students for TNP/Recruiters)
export const getInternshipById = async (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ message: "Internship id is required" })
  }

  try {
    const internship = await prisma.internship.findUnique({
      where: { id: String(id) },
      include: {
        postedBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company_name: true,
            email: true,
          },
        },
        // REMOVED the status: "APPLIED" filter here
        applications: {
          include: {
            student: {
              select: {
                user_id: true,
                registration_number: true,
                first_name: true,
                last_name: true,
                primary_email: true,
                department: true,
                cgpa: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      },
    })

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" })
    }

    res.status(200).json(internship)
  } catch (error) {
    console.error("getInternshipById error", { id, error: error.message })
    res.status(500).json({ message: "Failed to fetch internship", error: error.message })
  }
}

// Post internship
export const createInternship = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      stipend,
      duration,
      skills,
      tags,
      min_cgpa,
      departments,
      years,
      deadline,
      posted_by,
    } = req.body;

    console.log("Request at backend is: ",req.body);
    if (!posted_by) {
      return res.status(400).json({ message: "Missing posted by" });
    }

    // ✅ OPTIONAL: validate user exists
    const user = await prisma.user.findUnique({
      where: { id: posted_by },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const internship = await prisma.internship.create({
      data: {
        title,
        company,
        description,
        stipend,
        duration,
        skills,
        tags,
        min_cgpa,
        departments,
        years,
        deadline: new Date(deadline),

        // ✅ relation handled via FK
          postedBy: {
      connect: { id: posted_by }
    },
      },

      // ✅ include user in response (optional but useful)
      include: {
        postedBy: true,
      },
    });

    res.status(201).json({
      message: "Internship created successfully",
      internship,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create internship" });
  }
};

// Apply for an internship
export const applyForInternship = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const student = await prisma.student.findUnique({
      where: { user_id: userId }
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found. Make sure your profile is complete." });
    }

    const existingApplication = await prisma.internshipApplication.findFirst({
      where: {
        studentId: student.registration_number,
        internshipId: id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this internship." });
    }

    // Creates the application with the exact "APPLIED" status
    const application = await prisma.internshipApplication.create({
      data: {
        studentId: student.registration_number,
        internshipId: id,
        status: "APPLIED"
      }
    });

    await prisma.internship.update({
      where: { id },
      data: { applicants: { increment: 1 } }
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
}

// Get all applications for a specific student
// export const getStudentApplications = async (req, res) => {
//   console.log("Response",req.params);
//   const { userId } = req.params.id; // The global User ID
//   console.log("User Id",userId);
//   try {
//     // 1. Find the student record
//     const student = await prisma.student.findUnique({
//       where: { user_id: userId }
//     });
//     if (!student) {
//       return res.status(404).json({ message: "Student record not found" });
//     }

//     // 2. Fetch applications for this student
//     const applications = await prisma.internshipApplication.findMany({
//       where: {
//         studentId: student.registration_number
//       },
//       include: {
//         internship: {
//           select: {
//             id: true,
//             title: true,
//             company: true,
//             posted_date: true,
//             deadline: true,
//             // add any other fields you want to show in the list
//           }
//         }
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     res.status(200).json(applications);
//   } catch (error) {
//     console.error("Fetch applications error:", error);
//     res.status(500).json({ message: "Failed to fetch applications" });
//   }
// };
// internshipController.js
export const getStudentApplications = async (req, res) => {
  const { id } = req.params; 
  
  console.log("Fetching APPLIED applications for User ID:", id);

  try {
    // 1. Find the student record using the ID from the URL
    const student = await prisma.student.findUnique({
      where: { user_id: id } 
    });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // 2. Fetch applications for this student FILTERED by status
    const applications = await prisma.internshipApplication.findMany({
      where: {
        studentId: student.registration_number,
        status: "APPLIED" // <--- Added this filter
      },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            company: true,
            posted_date: true,
            deadline: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Fetch applications error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
}


export const selectStudent = async (req, res) => {
  console.log("Inside the select student function");
  try {
    const { id } = req.params;

    // Update application status
    const application = await prisma.internshipApplication.update({
      where: { id },
      data: {
        status: "SELECTED",
      },
    });

    // Mark student as placed
    await prisma.student.update({
      where: {
        registration_number: application.studentId,
      },
      data: {
        isPlaced: true,
      },
    });

    res.json({ message: "Student selected successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error selecting student" });
  }
};

export const checkIfPlaced = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      console.warn("checkIfPlaced called without userId param");
      return res.status(400).json({ isPlaced: false, message: "userId is required" });
    }

    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      select: { isPlaced: true },
    });

    if (!student) {
      return res.json({ isPlaced: false });
    }

    res.json({ isPlaced: student.isPlaced });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isPlaced: false });

  }
}