//this is basically for the academic project 
// controllers/opportunityController.js
import { prisma } from "../../db/index.js";

export const createAcademicProject = async (req, res) => {
  const { 
    title, 
    company, 
    type, 
    description, 
    skills, 
    min_cgpa, 
    registration_deadline,
    userid // Coming from the frontend payload
  } = req.body;

  console.log("backend recieved  : ",req.body);
  // --- 1. Strict Validation ---
  if (!title || !type || !description || !userid) {
    return res.status(400).json({ error: "Missing required fields: title, type, description, or userid." });
  }

  if (type === 'project' && (!skills || !Array.isArray(skills))) {
    return res.status(400).json({ error: "Projects require a skills array for the technology stack." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      // --- 2. Get Teacher ID from User ID ---
      const teacher = await tx.teacher.findUnique({
        where: { user_id: userid },
        select: { id: true }
      });

      if (!teacher) {
        console.error(`No teacher profile found for user_id: ${userid}`);
        throw new Error("TEACHER_NOT_FOUND");
      }

      // --- 3. Logic for Project Mapping ---
      if (type === 'project') {
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        const newProject = await tx.project.create({
          data: {
            title,
            description,
            technology_stack: skills.join(', '), 
            academic_year: academicYear,
            supervisor_id: teacher.id, // Using the found Teacher ID
          },
          select: { project_id: true } // Only return the project_id as requested
        });

        return { project_id: newProject.project_id };
      } 
      
      // --- 4. Logic for Company Drive ---
      else {
        if (!registration_deadline) throw new Error("DEADLINE_REQUIRED");
        
        const drive = await tx.company_Drive.create({
          data: {
            company_name: company || "N/A",
            min_cgpa: parseFloat(min_cgpa) || 0,
            registration_deadline: new Date(registration_deadline),
          }
        });
        return { drive_id: drive.drive_id };
      }
    });

    res.status(201).json({ success: true, ...result });

  } catch (error) {
    console.error("Opportunity Creation Error:", error);

    // Handle specific business logic errors
    if (error.message === "TEACHER_NOT_FOUND") {
      return res.status(404).json({ error: "The provided User ID is not associated with a Teacher profile." });
    }
    if (error.message === "DEADLINE_REQUIRED") {
      return res.status(400).json({ error: "Company drives require a registration deadline." });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAcademicProjectById = async (req, res) => {
  const { userid } = req.params; // or req.query depending on your route

  if (!userid) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    // 1. Find the Teacher record linked to this User
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userid },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found for this user." });
    }

    // 2. Get all projects supervised by this teacher
    const opportunities = await prisma.project.findMany({
      where: {
        supervisor_id: teacher.id
      },
      orderBy: {
        project_id: 'desc' // Newest projects first
      }
    });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });

  } catch (error) {
    console.error("Error fetching teacher opportunities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllAcademicProjects = async (req, res) => {
  try {
    // Get all project opportunities for students to view
    const opportunities = await prisma.project.findMany({
      include: {
        supervisor: {
          select: {
            first_name: true,
            last_name: true,
            department: true
          }
        },
        _count: {
          select: {
            groups: true // Count of groups working on this project
          }
        }
      },
      orderBy: {
        project_id: 'desc' // Newest projects first
      }
    });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });

  } catch (error) {
    console.error("Error fetching all opportunities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};