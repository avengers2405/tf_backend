import { Router } from "express";
import { createAcademicProject, getAcademicProjectByTeacherId , getAllAcademicProjects , getAcademicProjectByProjectId} from  "../../controller/Opportunities/academicProject.controller.js";

const router = Router();

// Route to post a new opportunity (project/internship/fulltime)
router.post("/", createAcademicProject); 
router.get("/:id",getAcademicProjectByProjectId);
router.get("/by-userid/:userid", getAcademicProjectByTeacherId);
router.get('/', getAllAcademicProjects);

export default router;