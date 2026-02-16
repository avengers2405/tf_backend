import express from "express";
import cors from "cors";
import "dotenv/config";
import webhookRoutes from "./routes/webhook.routes.js";
import projectRoutes from "./routes/project-progress.routes.js";
import { verifyGitHubSignature } from "./middleware/verifyGithub.js";
import { createRequire } from "module";
import { mongoose, prisma } from './db/index.js';
import emailActionController from './controller/emailActionController.js';
import driveController from './controller/driveController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

app.use("/webhook", express.json({
  verify: (req, res, buf) => {
    if (req.headers["x-hub-signature-256"]) {
      verifyGitHubSignature(req, res, buf);
    }
  }
}));

// All resume routes will now start with /api/resumes
//app.use("/api/resumes", resumeRoutes); 

// All webhook routes will start with /webhook
app.use("/webhook", webhookRoutes);

app.use("/project-progress", projectRoutes);

app.use("/project-progress", projectRoutes);

app.get('/email-action', (req, res) =>
  emailActionController.handleEmailConfirmation(req, res)
);

app.post('/drives', (req, res) =>
  driveController.createDrive(req, res)
);

app.listen(PORT, () => {
  console.log(`🚀 Enterprise Server running on port ${PORT}`);
});

