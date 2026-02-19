import { Router} from "express";
import { createTeam , getMyTeams} from "../controller/team-builder.controller.js";
const router = Router();

router.post("/create-team", createTeam);
router.get("/get-my-teams/:userId", getMyTeams);
export default router;