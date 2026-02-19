import { Router } from "express";
import { postOpportunity } from "../controller/post-opportunity.controller";

const router = Router();

// Route to post a new opportunity (project/internship/fulltime)
router.post("/opportunities", postOpportunity);

export default router;