// controllers/groupController.js
import { prisma } from "../db/index.js"

// app/api/students/route.ts
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        student_skills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Consistent mapping for the Frontend Card UI
    const formattedStudents = students.map(s => ({
      id: s.registration_number, 
      registration_number: s.registration_number,
      name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      department: s.department,
      year: s.be_roll_number ? "4" : "3", 
      skills: s.student_skills.map(assoc => assoc.skill.name),
      domains: [
        { name: "Web Development", value: 70 },
        { name: "AI / Machine Learning", value: 30 },
        { name: "Cybersecurity", value: 90 },
        { name: "App Development", value: 50 },
        { name: "Competitive Programming", value: 60 }
      ]
    }));

    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students from database." });
  }
};