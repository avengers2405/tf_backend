import express from "express";
import cors from "cors";
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  applyForInternship,

  getStudentApplications

  selectStudent,
  checkIfPlaced

} from "../controller/internshipController.js";

const router = express.Router();

// Add CORS middleware
router.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Get all internships
router.get("/", getAllInternships)

// Get internship by ID
router.get("/:id", getInternshipById)

// Post internship
router.post("/", createInternship)
router.post("/:id/apply", applyForInternship)
router.get("/applications/:id",getStudentApplications)

router.get("/check-placed/:userId", checkIfPlaced);
router.put("/applications/:id/select", selectStudent);
export default router