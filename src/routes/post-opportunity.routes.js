import { Router } from "express";
import { postOpportunity, getProjectOpportunitiesById } from "../controller/post-opportunity.controller.js";

const router = Router();

// Route to post a new opportunity (project/internship/fulltime)
router.post("/opportunities", postOpportunity);
router.get("/getProjectOpportunitiesById/:userid", getProjectOpportunitiesById);

export default router;