import express from "express"
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  applyForInternship,
  getStudentApplications
} from "../controller/internshipController.js";

const router = express.Router()

// Get all internships
router.get("/", getAllInternships)

// Get internship by ID
router.get("/:id", getInternshipById)

// Post internship
router.post("/", createInternship)
router.post("/:id/apply", applyForInternship)
router.get("/applications/:id",getStudentApplications)

export default router