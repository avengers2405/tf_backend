import { Router } from "express";
import {  applyProjectTeam , getGroupsByProject} from "../controller/groupProject.controller.js";
 
const router = Router();

router.post("/apply", applyProjectTeam);
router.get("/:project_id/groups" , getGroupsByProject)

 

export default router;