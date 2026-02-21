import { Router } from "express";
import { postOpportunity, getProjectOpportunitiesById , getAllOpportunities} from "../controller/post-opportunity.controller.js";

const router = Router();

// Route to post a new opportunity (project/internship/fulltime)
router.post("/project", postOpportunity);
router.get("/project/:userid", getProjectOpportunitiesById);
router.get('/project', getAllOpportunities);

export default router;