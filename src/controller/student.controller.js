// controllers/studentController.js
import { prisma } from "../db/index.js";

export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    console.log("Students",students);
    const formattedStudents = students.map(s => ({
      id: s.registration_number,
      registration_number: s.registration_number,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
      department: s.department,
      year: s.be_roll_number ? "4" : "3",
      cgpa: s.cgpa,

      // ✅ Directly from Student model
      skills: s.skills || [],

      // UI placeholder (safe to keep)
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
    console.error("Get students error:", error);
    res.status(500).json({
      error: "Failed to fetch students from database"
    });
  }
};

export const updateStudentSkills = async (req, res) => {
  try {
    const { username, skills } = req.body;
    console.log("Update Student",username);
    if (!username || !skills) {
      return res.status(400).json({ error: "Username and skills required" });
    }

    const updatedStudent = await prisma.student.update({
      where: {
        user_id: username, // ⚠️ change if using different unique field
      },
      data: {
        skills: skills, // must be String[] in Prisma schema
      },
    });

    res.status(200).json({
      success: true,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update skills error:", error);
    res.status(500).json({ error: "Failed to update skills" });
  }
};

// controllers/studentController.js

export const getStudentSkills = async (req, res) => {
  try {
    // Extract username from the request body (similar to updateStudentSkills)
    const { username } = req.body; 
    console.log("Get skills for student:", username);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Fetch only the skills field for efficiency
    const student = await prisma.student.findUnique({
      where: {
        user_id: username, 
      },
      select: {
        skills: true, 
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({
      success: true,
      skills: student.skills || [],
    });
  } catch (error) {
    console.error("Get student skills error:", error);
    res.status(500).json({ error: "Failed to fetch student skills" });
  }
};