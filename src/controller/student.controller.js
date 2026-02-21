// controllers/groupController.js
import { prisma } from "../db/index.js"

export const getAllStudents = async (req, res) => {
  try {
    console.log("Fetching all students...");
    
    // 1. Remove the 'include' block. 
    // The 'skills' field (String[]) is fetched automatically.
    const students = await prisma.student.findMany();

    console.log("Students fetched, now mapping. Count:", students);

    const formattedStudents = students.map(s => ({
      id: s.registration_number, 
      registration_number: s.registration_number,
      name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      department: s.department,
      year: s.be_roll_number ? "4" : "3", 
      // 2. Access the array directly from the student object
      skills: s.skills || [], 
      domains: [
        { name: "Web Development", value: 70 },
        { name: "AI / Machine Learning", value: 30 },
        { name: "Cybersecurity", value: 90 },
        { name: "App Development", value: 50 },
        { name: "Competitive Programming", value: 60 }
      ]
    }));

    console.log("Sending students");
    res.status(200).json(formattedStudents);
  } catch (error) {
    // 3. Log the ACTUAL error to your terminal so you can see why it failed
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch students from database.", details: error.message });
  }
};