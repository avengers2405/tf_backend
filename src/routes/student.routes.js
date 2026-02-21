import { Router } from "express";
import { getAllStudents ,updateStudentSkills ,getStudentSkills  } from "../controller/student.controller.js";
const router = Router();

router.get("/students", getAllStudents);
router.put("/students/update-skills", updateStudentSkills); 
// this gets the skills for a specific student, using username as a parameter
router.get('/get-skills', getStudentSkills)
export default router;