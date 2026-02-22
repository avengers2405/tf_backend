import { Router } from "express";
import {
	getAllStudents,
	updateStudentSkills,
	getStudentSkills,
	getMyStudentProfile,
	updateMyStudentField,
	updateMyStudentProfile,
} from "../controller/student.controller.js";
import jwtAuth from "../middleware/jwtAuth.js";
import requireRole from "../middleware/requireRole.js";
const router = Router();

router.get("/students", getAllStudents);
router.put("/students/update-skills", updateStudentSkills);
// this gets the skills for a specific student, using username as a parameter
router.post('/get-skills', getStudentSkills)

router.get("/students/me", jwtAuth, requireRole("student"), getMyStudentProfile);
router.put("/students/me/field", jwtAuth, requireRole("student"), updateMyStudentField);
router.put("/students/me", jwtAuth, requireRole("student"), updateMyStudentProfile);

export default router;