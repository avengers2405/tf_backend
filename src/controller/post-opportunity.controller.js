// controllers/opportunityController.js
import { prisma } from "../db/index.js";

export const postOpportunity = async (req, res) => {
  const { 
    title, 
    company, 
    type, 
    description, 
    skills, 
    min_cgpa, 
    registration_deadline,
    teacher_id // Assumed passed from auth middleware or body
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Logic for Project Mapping
      if (type === 'project') {
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        return await tx.project.create({
          data: {
            title,
            description,
            technology_stack: skills.join(', '), // Mapping array to string for DB
            academic_year: academicYear,
            supervisor_id: teacher_id, // Linking the posting teacher
          }
        });
      } 
      
      // 2. Logic for Internship/Fulltime (Company Drive)
      else {
        return await tx.company_Drive.create({
          data: {
            company_name: company,
            min_cgpa: parseFloat(min_cgpa) || 0,
            registration_deadline: new Date(registration_deadline),
          }
        });
      }
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Opportunity Creation Error:", error);
    res.status(500).json({ error: "Failed to post opportunity" });
  }
};