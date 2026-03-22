import { Router} from "express";
import { createTeam , getMyTeams, getStudentGroups , getTeamsByLeaderId} from "../controller/team-builder.controller.js";
import { sendGroupInvitation, acceptGroupInvitation, getPendingInvitations, declineGroupInvitation, getSentInvitations , } from "../controller/group-invitation.controller.js";
const router = Router();

router.post("/create-team", createTeam);
router.get("/get-my-teams/:userId", getMyTeams);
router.get("/get-teams-by-Leader/:userId",getTeamsByLeaderId);
router.get("/get-student-groups/:studentRegId", getStudentGroups);
router.post("/invite", sendGroupInvitation);
router.post("/accept-invite", acceptGroupInvitation);
router.post("/decline-invite", declineGroupInvitation);
router.get("/get-sent-invitations/:userId", getSentInvitations);
router.get("/get-pending-invitations/:userId", getPendingInvitations);
export default router;