// // import { prisma } from "../db/index.js";

// // // Get all internships
// // export const getAllInternships = async (req, res) => {
// //   console.log("Inside the fucntion");
// //   try {
// //     const internships = await prisma.internship.findMany({
// //       orderBy: { posted_date: "desc" },
// //       include: {
// //         postedBy: {
// //           select: {
// //             id: true,
// //             first_name: true,
// //             last_name: true,
// //             company_name: true,
// //           },
// //         },
// //       },
// //     })
// //     console.log("Internships",internships);
// //     res.status(200).json(internships)
// //   } catch (error) {
// //     console.error(error)
// //     res.status(500).json({ message: "Failed to fetch internships" })
// //   }
// // }

// // // Get internship by ID
// // export const getInternshipById = async (req, res) => {
// //   const { id } = req.params

// //   try {
// //     const internship = await prisma.internship.findUnique({
// //       where: { id },
// //       include: {
// //         postedBy: {
// //           select: {
// //             id: true,
// //             first_name: true,
// //             last_name: true,
// //             company_name: true,
// //             email: true,
// //           },
// //         },
// //       },
// //     })

// //     if (!internship) {
// //       return res.status(404).json({ message: "Internship not found" })
// //     }

// //     res.status(200).json(internship)
// //   } catch (error) {
// //     console.error(error)
// //     res.status(500).json({ message: "Failed to fetch internship" })
// //   }
// // }

// // // Post internship
// // export const createInternship = async (req, res) => {
// //   try {
// //     const {
// //       title,
// //       company,
// //       description,
// //       stipend,
// //       duration,
// //       skills,
// //       tags,
// //       min_cgpa,
// //       departments,
// //       years,
// //       deadline,
// //       posted_by,
// //     } = req.body

// //     if (!title || !company || !description || !deadline || !posted_by) {
// //       return res.status(400).json({ message: "Missing required fields" })
// //     }

// //     const internship = await prisma.internship.create({
// //       data: {
// //         title,
// //         company,
// //         description,
// //         stipend,
// //         duration,
// //         skills,
// //         tags,
// //         min_cgpa,
// //         departments,
// //         years,
// //         deadline: new Date(deadline),
// //         posted_by,
// //       },
// //     })

// //     res.status(201).json({
// //       message: "Internship created successfully",
// //       internship,
// //     })
// //   } catch (error) {
// //     console.error(error)
// //     res.status(500).json({ message: "Failed to create internship" })
// //   }
// // }
// import { prisma } from "../db/index.js";

// // Get all internships
// export const getAllInternships = async (req, res) => {
//   try {
//     const internships = await prisma.internship.findMany({
//       orderBy: { posted_date: "desc" },
//       include: {
//         postedBy: {
//           select: {
//             id: true,
//             first_name: true,
//             last_name: true,
//             company_name: true,
//           },
//         },
//       },
//     })
//     res.status(200).json(internships)
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Failed to fetch internships" })
//   }
// }

// // Get internship by ID (UPDATED to include applications for TNP)
// export const getInternshipById = async (req, res) => {
//   const { id } = req.params

//   try {
//     const internship = await prisma.internship.findUnique({
//       where: { id },
//       include: {
//         postedBy: {
//           select: {
//             id: true,
//             first_name: true,
//             last_name: true,
//             company_name: true,
//             email: true,
//           },
//         },
//         // Fetch the students who applied to show to TNP
//         applications: {
//           include: {
//             student: {
//               select: {
//                 user_id: true,
//                 registration_number: true,
//                 first_name: true,
//                 last_name: true,
//                 primary_email: true,
//                 department: true,
//                 cgpa: true,
//               }
//             }
//           },
//           orderBy: { createdAt: 'desc' }
//         }
//       },
//     })

//     if (!internship) {
//       return res.status(404).json({ message: "Internship not found" })
//     }

//     res.status(200).json(internship)
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Failed to fetch internship" })
//   }
// }

// // Post internship
// export const createInternship = async (req, res) => {
//   try {
//     const { title, company, description, stipend, duration, skills, tags, min_cgpa, departments, years, deadline, posted_by } = req.body

//     if (!title || !company || !description || !deadline || !posted_by) {
//       return res.status(400).json({ message: "Missing required fields" })
//     }

//     const internship = await prisma.internship.create({
//       data: {
//         title, company, description, stipend, duration, skills, tags, min_cgpa, departments, years, deadline: new Date(deadline), posted_by,
//       },
//     })

//     res.status(201).json({ message: "Internship created successfully", internship })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Failed to create internship" })
//   }
// }

// // NEW: Apply for an internship
// export const applyForInternship = async (req, res) => {
//   const { id } = req.params; // Internship ID
//   const { userId } = req.body; // Student's user ID from frontend

//   try {
//     // 1. Find the student record using the user_id
//     const student = await prisma.student.findUnique({
//       where: { user_id: userId }
//     });

//     if (!student) {
//       return res.status(404).json({ message: "Student profile not found. Make sure your profile is complete." });
//     }

//     // 2. Check if the student has already applied
//     const existingApplication = await prisma.internshipApplication.findFirst({
//       where: {
//         studentId: student.registration_number,
//         internshipId: id
//       }
//     });

//     if (existingApplication) {
//       return res.status(400).json({ message: "You have already applied for this internship." });
//     }

//     // 3. Create the application
//     const application = await prisma.internshipApplication.create({
//       data: {
//         studentId: student.registration_number,
//         internshipId: id,
//         status: "APPLIED"
//       }
//     });

//     // 4. Increment the applicant count on the Internship
//     await prisma.internship.update({
//       where: { id },
//       data: { applicants: { increment: 1 } }
//     });

//     res.status(201).json({ message: "Application submitted successfully", application });
//   } catch (error) {
//     console.error("Apply error:", error);
//     res.status(500).json({ message: "Failed to submit application" });
//   }
// }
import { prisma } from "../db/index.js";

// Get all internships
export const getAllInternships = async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      orderBy: { posted_date: "desc" },
      include: {
        postedBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            company_name: true,
          },
        },
      },
    })
    res.status(200).json(internships)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch internships" })
  }
}

// Get internship by ID (Includes applied students for TNP/Recruiters)
export const getInternshipById = async (req, res) => {
  const { id } = req.params

  try {
    const internship = await prisma.internship.findUnique({
      where: { id },
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
        // THIS IS THE FILTER: It only fetches rows where status is exactly "APPLIED"
        applications: {
          where: {
            status: "APPLIED" 
          },
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
          orderBy: { createdAt: 'desc' }
        }
      },
    })

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" })
    }

    res.status(200).json(internship)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch internship" })
  }
}

// Post internship
export const createInternship = async (req, res) => {
  try {
    const { title, company, description, stipend, duration, skills, tags, min_cgpa, departments, years, deadline, posted_by } = req.body

    if (!title || !company || !description || !deadline || !posted_by) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const internship = await prisma.internship.create({
      data: {
        title, company, description, stipend, duration, skills, tags, min_cgpa, departments, years, deadline: new Date(deadline), posted_by,
      },
    })

    res.status(201).json({ message: "Internship created successfully", internship })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to create internship" })
  }
}

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