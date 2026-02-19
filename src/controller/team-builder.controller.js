import { prisma } from "../db/index.js";

export const createTeam = async (req, res) => {
  try {
    console.log("Entered create grp");
    const { group_name, student_ids, creator_user_id } = req.body;

    if (!group_name || !student_ids || !creator_user_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 1. Fetch the registration_number for the creator
    console.log("Fetching creator student reg");
    const creatorStudent = await prisma.student.findUnique({
      where: { user_id: creator_user_id },
      select: { registration_number: true }
    });

    if (!creatorStudent) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const creatorRegNo = creatorStudent.registration_number;
    const uniqueStudentRegNos = [...new Set([...student_ids, creatorRegNo])];

    // 2. Run Transaction using Prisma's auto-incrementing ID
    console.log("Starting transaction");
    const newGroup = await prisma.$transaction(async (tx) => {
      // Create the group (Prisma/DB generates the ID here)
      const group = await tx.group.create({
        data: { group_name },
      });

      // Prepare associations using the newly generated group.group_id
      console.log("Running assocaition");
      const associations = uniqueStudentRegNos.map((regNo) => ({
        student_id: regNo,
        group_id: group.group_id, 
      }));

      await tx.student_Group_Association.createMany({
        data: associations,
      });

      return group;
    });

    // 3. Return the response
    res.status(201).json({
      group_id: newGroup.group_id,
      group_name: newGroup.group_name
    });

  } catch (error) {
    console.error("Team Creation Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const { userId } = req.params; // The User.id from your context/auth

    // 1. First, get the student's registration number from the user_id
    const studentProfile = await prisma.student.findUnique({
      where: { user_id: userId },
      select: { registration_number: true }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // 2. Find all groups where this student is a member
    // We fetch the Groups, and for each group, include the list of all members
    const groups = await prisma.group.findMany({
      where: {
        students: {
          some: {
            student_id: studentProfile.registration_number
          }
        }
      },
      include: {
        students: {
          include: {
            student: {
              select: {
                registration_number: true,
                first_name: true,
                last_name: true,
                user_id: true, // Needed for frontend key/id
                department: true
              }
            }
          }
        }
      }
    });

    // 3. Transform Prisma's nested structure into the format your UI expects
    const formattedTeams = groups.map(g => ({
      id: g.group_id,
      name: g.group_name || `Unnamed Team ${g.group_id}`,
      members: g.students.map(assoc => ({
        id: assoc.student.user_id,
        registration_number: assoc.student.registration_number,
        name: `${assoc.student.first_name || ''} ${assoc.student.last_name || ''}`.trim() || "Unknown Student",
        department: assoc.student.department
      }))
    }));

    return res.status(200).json(formattedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};