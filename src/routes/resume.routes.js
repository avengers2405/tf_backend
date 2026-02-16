import { uploadResume } from "../controller/resume.controller.js";
import { fileUpload } from "../middleware/fileUpload.js";
import { Router } from "express";
const router = Router();

// Route for uploading a resume
/* 
  returns: JSON {skills: String[], success: boolean}
*/
router.post("/upload", fileUpload, uploadResume);

export default router;