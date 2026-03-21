import { Router } from "express";
import { createAcademicProject, getAcademicProjectById , getAllAcademicProjects} from  "../../controller/Opportunities/academicProject.controller.js";

const router = Router();

// Route to post a new opportunity (project/internship/fulltime)
router.post("/", createAcademicProject);
router.get("/:userid", getAcademicProjectById);
router.get('/', getAllAcademicProjects);

export default router;