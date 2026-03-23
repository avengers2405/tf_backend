import { Router } from "express";
import {  applyProjectTeam , getGroupsByProject, updateGroupApplicationStatus} from "../controller/groupProject.controller.js";
 
const router = Router();

router.post("/apply", applyProjectTeam);
router.get("/:project_id/groups" , getGroupsByProject)
router.put("/:project_id/groups/:group_id/status",updateGroupApplicationStatus)

 

export default router;