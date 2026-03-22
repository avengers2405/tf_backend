import express from "express";
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  applyForInternship,
  getInternshipsByRecruiter,
  getStudentApplications,

  selectStudent,
  checkIfPlaced

} from "../../controller/Opportunities/internshipController.js";

const router = express.Router();

// Get all internships
router.get("/", getAllInternships)

// Get internship by ID
router.get("/:id", getInternshipById)

//get internship by recruiter ID
router.get("/:userId", getInternshipsByRecruiter)

// Post internship
router.post("/", createInternship)
router.post("/:id/apply", applyForInternship)
router.get("/applications/:id",getStudentApplications)

router.get("/check-placed/:userId", checkIfPlaced);
router.put("/applications/:id/select", selectStudent);
export default router