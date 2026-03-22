import { prisma } from "../db/index.js";
import logger from "../services/logger.js";

const MAX_GROUPS_PER_STUDENT = 2;

// export const createTeam = async (req, res) => {
//   try {
//     logger.log("Entered create grp");
//     const { group_name, student_ids, creator_user_id } = req.body;

//     if (!group_name || !student_ids || !creator_user_id) {
//       return res.status(400).json({ error: "Missing required fields." });
//     }

//     // 1. Fetch the registration_number for the creator
//     logger.log("Fetching creator student reg");
//     const creatorStudent = await prisma.student.findUnique({
//       where: { user_id: creator_user_id },
//       select: { registration_number: true }
//     });

//     if (!creatorStudent) {
//       return res.status(404).json({ error: "Student profile not found." });
//     }

//     const creatorRegNo = creatorStudent.registration_number;
//     const uniqueStudentRegNos = [...new Set([...student_ids, creatorRegNo])];

//     // 2. Run Transaction using Prisma's auto-incrementing ID
//     logger.log("Starting transaction");
//     const newGroup = await prisma.$transaction(async (tx) => {
//       // Create the group (Prisma/DB generates the ID here)
//       const group = await tx.group.create({
//         data: { group_name },
//       });

//       // Prepare associations using the newly generated group.group_id
//       logger.log("Running assocaition");
//       const associations = uniqueStudentRegNos.map((regNo) => ({
//         student_id: regNo,
//         group_id: group.group_id, 
//       }));

//       await tx.student_Group_Association.createMany({
//         data: associations,
//       });

//       return group;
//     });

//     // 3. Return the response
//     res.status(201).json({
//       group_id: newGroup.group_id,
//       group_name: newGroup.group_name
//     });

//   } catch (error) {
//     console.error("Team Creation Error:", error);
//     res.status(500).json({ error: "Internal Server Error", details: error.message });
//   }
// };

export const createTeam = async (req, res) => {
  try {
    logger.log("Entered create grp");
    const { group_name, creator_user_id } = req.body;

    if (!group_name || !creator_user_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const creatorStudent = await prisma.student.findUnique({
      where: { user_id: creator_user_id },
      select: { registration_number: true }
    });

    if (!creatorStudent) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const creatorRegNo = creatorStudent.registration_number;

    const existingGroupCount = await prisma.student_Group_Association.count({
      where: { student_id: creatorRegNo }
    });

    if (existingGroupCount >= MAX_GROUPS_PER_STUDENT) {
      return res.status(400).json({
        error: `You can be part of at most ${MAX_GROUPS_PER_STUDENT} groups.`
      });
    }

    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          group_name,
          leader_id: creatorRegNo, // store the leader
        },
      });

      await tx.student_Group_Association.create({
        data: {
          student_id: creatorRegNo,
          group_id: group.group_id,
        },
      });

      return group;
    });

    res.status(201).json({
      group_id: newGroup.group_id,
      group_name: newGroup.group_name,
      leader_id: newGroup.leader_id,
    });

  } catch (error) {
    console.error("Team Creation Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

//get all the teams of a student as a leader
export const getTeamsByLeaderId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing from the request URL." });
    }

    // Resolve user_id -> registration_number
    const studentProfile = await prisma.student.findUnique({
      where: { user_id: userId },
      select: { registration_number: true }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const groups = await prisma.group.findMany({
      where: {
        leader_id: studentProfile.registration_number
      },
      include: {
        students: {
          include: {
            student: {
              select: {
                registration_number: true,
                first_name: true,
                last_name: true,
                user_id: true,
                department: true
              }
            }
          }
        }
      }
    });

    const formattedTeams = groups.map(g => ({
      id: g.group_id,
      name: g.group_name || `Unnamed Team ${g.group_id}`,
      leader_id: g.leader_id,
      members: g.students.map(assoc => ({
        id: assoc.student.user_id,
        registration_number: assoc.student.registration_number,
        name: `${assoc.student.first_name || ''} ${assoc.student.last_name || ''}`.trim() || "Unknown Student",
        department: assoc.student.department
      }))
    }));

    return res.status(200).json({
      count: formattedTeams.length,
      teams: formattedTeams
    });

  } catch (error) {
    console.error("Error fetching teams by leader:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const getMyTeams = async (req, res) => {
//   try {
//     const { userId } = req.params; // The User.id from your context/auth

//     // 1. First, get the student's registration number from the user_id
//     const studentProfile = await prisma.student.findUnique({
//       where: { user_id: userId },
//       select: { registration_number: true }
//     });

//     if (!studentProfile) {
//       return res.status(404).json({ error: "Student profile not found" });
//     }

//     // 2. Find all groups where this student is a member
//     // We fetch the Groups, and for each group, include the list of all members
//     const groups = await prisma.group.findMany({
//       where: {
//         students: {
//           some: {
//             student_id: studentProfile.registration_number
//           }
//         }
//       },
//       include: {
//         students: {
//           include: {
//             student: {
//               select: {
//                 registration_number: true,
//                 first_name: true,
//                 last_name: true,
//                 user_id: true, // Needed for frontend key/id
//                 department: true
//               }
//             }
//           }
//         }
//       }
//     });

//     // 3. Transform Prisma's nested structure into the format your UI expects
//     const formattedTeams = groups.map(g => ({
//       id: g.group_id,
//       name: g.group_name || `Unnamed Team ${g.group_id}`,
//       members: g.students.map(assoc => ({
//         id: assoc.student.user_id,
//         registration_number: assoc.student.registration_number,
//         name: `${assoc.student.first_name || ''} ${assoc.student.last_name || ''}`.trim() || "Unknown Student",
//         department: assoc.student.department
//       }))
//     }));

//     return res.status(200).json(formattedTeams);
//   } catch (error) {
//     console.error("Error fetching teams:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getMyTeams = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Get the student's registration number from the user_id
    const studentProfile = await prisma.student.findUnique({
      where: { user_id: userId },
      select: { registration_number: true }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const userRegNo = studentProfile.registration_number;

    // 2. Find all groups where this student is a member
    const groups = await prisma.group.findMany({
      where: {
        students: {
          some: {
            student_id: userRegNo
          }
        }
      },
      include: {
        // Include invitations to check who the sender (creator) is
        invitations: {
          take: 1,
          select: { sender_id: true }
        },
        students: {
          include: {
            student: {
              select: {
                registration_number: true,
                first_name: true,
                last_name: true,
                user_id: true,
                department: true
              }
            }
          }
        }
      }
    });

    // 3. Transform and determine 'isCreator'
    const formattedTeams = groups.map(g => {
      /**
       * In your schema, the 'sender_id' in Group_Invitation is the creator.
       * We check if the sender of invitations for this group matches the logged-in user.
       * Note: If a group was created but no invites sent yet, you might need a 
       * 'creator_id' field on the Group model itself for 100% reliability.
       */
      // const creatorIdFromInvites = g.invitations[0]?.sender_id;
      
      return {
        id: g.group_id,
        name: g.group_name || `Unnamed Team ${g.group_id}`,
        // Logic: User is creator if their reg number matches the invitation sender_id
       isCreator: g.leader_id === userRegNo,
        members: g.students.map(assoc => ({
          id: assoc.student.user_id,
          registration_number: assoc.student.registration_number,
          name: `${assoc.student.first_name || ''} ${assoc.student.last_name || ''}`.trim() || "Unknown Student",
          department: assoc.student.department
        }))
      };
    });

    return res.status(200).json(formattedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getStudentGroups = async (req, res) => {
    try {
        // 1. Extract the target student's ID from the URL
        const { studentRegId } = req.params;
        
        // 2. SAFETY CHECK: Prevent Prisma from fetching all records if the param is missing
        if (!studentRegId) {
            return res.status(400).json({ error: "Student Registration ID is missing from the request URL." });
        }

        // 3. Fetch only the associations for this specific student
        const associations = await prisma.student_Group_Association.findMany({
            where: { 
                student_id: studentRegId 
            },
            select: {
                group: {
                    select: {
                        group_id: true,
                        group_name: true
                    }
                }
            }
        });

        // 4. Format the response
        const groups = associations.map(assoc => ({
            group_id: assoc.group.group_id,
            group_name: assoc.group.group_name
        }));

        // 5. Return the count and the group details
        res.status(200).json({
            count: groups.length,
            groups: groups
        });

    } catch (error) {
        console.error("Error fetching student groups:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

