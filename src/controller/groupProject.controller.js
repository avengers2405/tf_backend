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