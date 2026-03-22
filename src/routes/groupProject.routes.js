import { Router } from "express";
import {  applyProjectTeam } from "../controller/groupProject.controller.js";
 
const router = Router();

router.post("/apply", applyProjectTeam);

 

export default router;