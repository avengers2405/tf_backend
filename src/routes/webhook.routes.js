import { Router } from "express";
import { handleGitHubWebhook } from "../controller/webhook.controller.js";

const router = Router();

router.post("/git", handleGitHubWebhook);

export default router;