import express from "express";
import multer from "multer";
import { parseResume } from "../controller/resumeParserController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/parse-resume",
  upload.single("resume"),
  parseResume
);

export default router;