import express from "express";
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  applyForInternship,

  getStudentApplications,

  selectStudent,
  checkIfPlaced

} from "../../controller/Opportunities/internshipController.js";

const router = express.Router();

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