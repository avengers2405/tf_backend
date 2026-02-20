import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import webhookRoutes from "./routes/webhook.routes.js";
import projectRoutes from "./routes/project-progress.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import authRoutes from './routes/auth.routes.js';
import { verifyGitHubSignature } from "./middleware/verifyGithub.js";
import emailActionController from './controller/emailActionController.js';
import driveController from './controller/driveController.js';
import resumeParserRoutes from "./routes/resumeParserRoutes.js";
import { validateAuthConfig } from './config/authConfig.js';
import studentRoutes from "./routes/student.routes.js";
import teamBuilderRoutes from "./routes/team-builder.routes.js";
import postOpportunity from "./routes/post-opportunity.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

validateAuthConfig();

// Middleware configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());
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

app.use('/auth', authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/team-builder", teamBuilderRoutes);

app.use("/api", studentRoutes);

app.use("/post-opportunity", postOpportunity);

app.use("/post-opportunity", postOpportunity);

app.get('/email-action', (req, res) =>
  emailActionController.handleEmailConfirmation(req, res)
);

app.get('/drives/confirm-interest', (req, res) =>
  emailActionController.verifyEmailConfirmation(req, res)
);

app.post('/drives', (req, res) =>
  driveController.createDrive(req, res)
);

app.use("/resumeParser", resumeParserRoutes);
app.use("/resume", resumeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Enterprise Server running on port ${PORT}`);
});

