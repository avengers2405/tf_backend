import express from "express"
import {
  getAllInternships,
  getInternshipById,
  createInternship,
} from "../controller/internshipController.js";

const router = express.Router()

// Get all internships
router.get("/", getAllInternships)

// Get internship by ID
router.get("/:id", getInternshipById)

// Post internship
router.post("/", createInternship)

export default router