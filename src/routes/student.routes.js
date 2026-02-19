import { Router } from "express";
import { getAllStudents } from "../controller/student.controller.js";
const router = Router();

router.get("/students", getAllStudents);
export default router;