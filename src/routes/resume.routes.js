import { uploadResume, listResume, downloadResume , listAllResumes} from "../controller/resume.controller.js";
import { fileUpload } from "../middleware/fileUpload.js";
import { Router } from "express";
import jwtAuth from "../middleware/jwtAuth.js";
const router = Router();

// Route for uploading a resume
/* 
  returns: JSON {skills: String[], success: boolean}
*/
router.post("/upload", jwtAuth, fileUpload, uploadResume);

// Route for getting list of resumes
/*
  returns: JSON {resumes: [{id: String, filename: String, uploadDate: Date}]}
*/
router.get("/list", jwtAuth, listResume);
router.get("/listall", listAllResumes);

// Route for downloading a resume by ID
/*
  returns: PDF file as buffer
*/
router.get("/download/:id", jwtAuth, downloadResume);

export default router;