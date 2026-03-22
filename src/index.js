import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import webhookRoutes from "./routes/webhook.routes.js";
import projectRoutes from "./routes/project-progress.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import authRoutes from './routes/auth.routes.js';
import logsRoutes from "./routes/logs.routes.js";
import { verifyGitHubSignature } from "./middleware/verifyGithub.js";
import emailActionController from './controller/emailActionController.js';
import driveController from './controller/driveController.js';
import resumeParserRoutes from "./routes/resumeParserRoutes.js";
import { validateAuthConfig } from './config/authConfig.js';
import studentRoutes from "./routes/student.routes.js";
import teamBuilderRoutes from "./routes/team-builder.routes.js";
import logger from "./services/logger.js";
import AcademicProjectRoutes from "./routes/Opportunities/academicProjectRoutes.js";
import internshipRoutes from "./routes/Opportunities/internshipRoutes.js";
import inviteRoutes from "./routes/invite.routes.js";
import groupProjectRoutes from "./routes/groupProject.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

validateAuthConfig();

// Centralized CORS configuration for all APIs
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_STUDENT,
  process.env.FRONTEND_URL_ADMIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (e.g., Postman) with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
// Express 5 uses path-to-regexp v6; use regex instead of "*" to avoid Missing parameter errors
app.options(/.*/, cors(corsOptions));

logger.log("Using CORS with origins:", allowedOrigins);
logger.log("NODE_ENV:", process.env.NODE_ENV);
logger.log("AUTH_COOKIE_SAMESITE:", process.env.AUTH_COOKIE_SAMESITE);

app.use(cookieParser());
app.use(express.json());

app.use("/webhook", express.json({
  verify: (req, res, buf) => {
    if (req.headers["x-hub-signature-256"]) {
      verifyGitHubSignature(req, res, buf);
    }
  }
}));

app.use('/auth', authRoutes);
app.use('/invites', inviteRoutes);

// All resume routes will now start with /api/resumes
//app.use("/api/resumes", resumeRoutes); 

// All webhook routes will start with /webhook
app.use("/webhook", webhookRoutes);

app.use("/project-progress", projectRoutes);

app.use('/auth', authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/project-group",groupProjectRoutes);

app.use("/api/team-builder", teamBuilderRoutes);

app.use("/api", studentRoutes);

app.use("/api/academic-project", AcademicProjectRoutes);

 
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
app.use("/api/internships", internshipRoutes)
app.use("/logs", logsRoutes);

app.listen(PORT, () => {
  logger.log(`🚀 Enterprise Server running on port ${PORT}`);
});
