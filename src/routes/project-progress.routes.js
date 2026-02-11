import { Router } from "express";
import { getCommitsByProjectId } from "../controller/project-progress.controller.js";
import { getProjectDataByProjectId } from "../controller/project-progress.controller.js";
const router = Router();

router.get("/:projectId/commits", getCommitsByProjectId);

router.get("/:projectId/projectData", getProjectDataByProjectId);

export default router;