 import { prisma } from "../db/index.js";

export const applyProjectTeam = async (req, res) => {
  const { project_id, group_id } = req.body;

  // Basic validation
  if (!project_id || !group_id) {
    return res.status(400).json({ error: "project_id and group_id are required." });
  }

  try {
    // 1. Check if the project exists
    const project = await prisma.project.findUnique({
      where: { project_id: Number(project_id) },
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // 2. Check if the group exists
    const group = await prisma.group.findUnique({
      where: { group_id: Number(group_id) },
      include: { students: { include: { student: true } } },
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    // 3. Check registration deadline
    if (project.registration_deadline && new Date() > new Date(project.registration_deadline)) {
      return res.status(400).json({ error: "Registration deadline has passed." });
    }

    // 4. Check min CGPA for all members
    if (project.min_cgpa !== null && project.min_cgpa !== undefined) {
      const failingStudents = group.students.filter(
        (s) => s.student.cgpa < project.min_cgpa
      );
      if (failingStudents.length > 0) {
        return res.status(400).json({
          error: `Some team members do not meet the minimum CGPA of ${project.min_cgpa}.`,
        });
      }
    }

    // 5. Check if this group already applied to this project
    const existing = await prisma.project_Group_Association.findUnique({
      where: {
        project_id_group_id: {
          project_id: Number(project_id),
          group_id: Number(group_id),
        },
      },
    });
    if (existing) {
      return res.status(409).json({ error: "This team has already applied for this project." });
    }

    // 6. Create the association
    const association = await prisma.project_Group_Association.create({
      data: {
        project_id: Number(project_id),
        group_id: Number(group_id),
      },
    });

    return res.status(201).json({
      message: "Application submitted successfully.",
      association,
    });
  } catch (error) {
    console.error("Error applying to project:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getGroupsByProject = async (req, res) => {
  const { project_id } = req.params;

  if (!project_id) {
    return res.status(400).json({ error: "project_id is required." });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { project_id: Number(project_id) },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const associations = await prisma.project_Group_Association.findMany({
      where: { project_id: Number(project_id) },
      include: {
        group: {
          include: {
            leader: {
              select: {
                registration_number: true,
                first_name: true,
                last_name: true,
                primary_email: true,
                cgpa: true,
                department: true,
              },
            },
            students: {
              include: {
                student: {
                  select: {
                    registration_number: true,
                    first_name: true,
                    last_name: true,
                    primary_email: true,
                    cgpa: true,
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const groups = associations.map((assoc) => ({
  group_id: assoc.group.group_id,
  group_name: assoc.group.group_name,
  status: assoc.status,           // ← add these two
  applied_at: assoc.applied_at,   // ← 
  reviewed_at: assoc.reviewed_at, // ←
  leader: assoc.group.leader,
  members: assoc.group.students.map((s) => s.student),
  member_count: assoc.group.students.length,
}));

    return res.status(200).json({
      project_id: Number(project_id),
      total_groups: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching groups for project:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const updateGroupApplicationStatus = async (req, res) => {
  const { project_id, group_id } = req.params;
  const { status } = req.body; // "ACCEPTED" or "REJECTED"

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Status must be ACCEPTED or REJECTED." });
  }

  try {
    const association = await prisma.project_Group_Association.findUnique({
      where: {
        project_id_group_id: {
          project_id: Number(project_id),
          group_id: Number(group_id),
        },
      },
    });

    if (!association) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (association.status !== "PENDING") {
      return res.status(400).json({ error: "Application has already been reviewed." });
    }

    const updated = await prisma.project_Group_Association.update({
      where: {
        project_id_group_id: {
          project_id: Number(project_id),
          group_id: Number(group_id),
        },
      },
      data: {
        status,
        // reviewed_at: new Date(),
      },
    });

    return res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getGroupStatusByProject = async (req, res) => {
  console.log("backend hit");
  const { project_id } = req.params;
  console.log("project is: ",project_id);
  const userId = req.query.userId;
  console.log("userid ",userId)

  if (!project_id || !userId) {
    return res.status(400).json({ error: "project_id and userId are required." });
  }

  try {
    // Find association for this project where the group's leader's user_id matches
    const association = await prisma.project_Group_Association.findFirst({
      where: {
        project_id: Number(project_id),
        group: {
          leader: {
            user_id: userId, // Group → leader (Student) → user_id
          },
        },
      },
      include: {
        group: {
          select: {
            group_id: true,
            group_name: true,
            students: {
              include: {
                student: {
                  select: {
                    registration_number: true,
                    first_name: true,
                    last_name: true,
                    primary_email: true,
                    cgpa: true,
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!association) {
      console.log("Not association");
      return res.status(200).json({ data: null });
    }

    return res.status(200).json({
      
      data: {
        status: association.status,
        group_id: association.group.group_id,
        group_name: association.group.group_name,
        is_leader: true,
        members: association.group.students.map((s) => s.student),
        member_count: association.group.students.length,
      },
    });
  } catch (error) {
    console.error("Error fetching group status by project:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};