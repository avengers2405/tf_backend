import { Router } from "express";
import { postOpportunity, getProjectOpportunitiesById, getAllOpportunities } from "../controller/post-opportunity.controller.js";

const router = Router();

// Route to post a new opportunity (project/internship/fulltime)
router.post("/opportunities", postOpportunity);
router.get("/getProjectOpportunitiesById/:userid", getProjectOpportunitiesById);
router.get("/getAllOpportunities", getAllOpportunities);

export default router;