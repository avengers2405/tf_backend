import { Router } from "express";
import { projectController } from "../controller/post-opportunity.controller.js";

const router = Router();
router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

export default router;