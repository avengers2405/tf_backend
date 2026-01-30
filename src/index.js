import express from "express";
import "dotenv/config";
import multer from "multer";
import fs from "fs";
import mammoth from "mammoth";
import skillMap from "./skills.js";
import cors from "cors";
import { createRequire } from "module";
import {  mongoose, prisma } from './db/index.js';

// --- FAIL-SAFE PDF-PARSE IMPORT ---
// pdf-parse is a CommonJS module, so we use createRequire to import it
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ dest: "uploads/" });

/* --------------------
   TEXT CLEANING
-------------------- */
function cleanText(text) {
    return text
        .toLowerCase()
        // Keeps alphanumeric and symbols used in programming like C++, C#, .NET
        .replace(/[^a-z0-9+.#\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/* --------------------
   SKILL EXTRACTION LOGIC
-------------------- */
function extractAllSkills(rawText) {
    const found = [];
    const cleanedText = cleanText(rawText);

    for (const category in skillMap) {
        for (const skill of skillMap[category]) {
            // Escape special characters (like C++) and use word boundaries
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // \b ensures we match "Java" but not the "Java" inside "JavaScript"
            // However, for skills like C++, boundaries work differently, so we use a flexible regex
            const regex = new RegExp(`(?:^|\\s)${escapedSkill}(?:\\s|$)`, 'i');

            if (regex.test(cleanedText)) {
                found.push({
                    skill: skill,
                    category: category
                });
            }
        }
    }

    return Array.from(new Set(found.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
}

/* --------------------
   RESUME PARSE ROUTE
-------------------- */
app.post("/parse-resume", upload.single("resume"), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        filePath = req.file.path;
        const fileType = req.file.mimetype;
        let rawText = "";

        // 1. Extract Raw Text based on file type
        if (fileType.includes("pdf")) {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            rawText = data.text;
        }
        else if (fileType.includes("word") || fileType.includes("officedocument")) {
            const result = await mammoth.extractRawText({ path: filePath });
            rawText = result.value;
        }
        else {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: "Unsupported file type. Please upload PDF or DOCX." });
        }

        // 2. Extract skills from the entire text (Experience + Skills sections)
        const allSkills = extractAllSkills(rawText);

        // 3. Cleanup: Delete the file from the server for privacy
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // 4. Return the organized skill set
        // ... (rest of index.js remains the same as provided before)

        // Update the return object slightly for easier frontend mapping
        return res.json({
            success: true,
            filename: req.file.originalname,
            skills: allSkills, // Array of { skill: 'react', category: 'frontend' }
            // Provide a summary for the chart
            domainSummary: Object.keys(skillMap).map(cat => ({
                name: cat,
                count: allSkills.filter(s => s.category === cat).length
            }))
        });

    } catch (error) {
        console.error("RESUME PARSER ERROR:", error);
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: "Parsing failed", details: error.message });
    }
});

app.get('/ping', (req, res) => {
    console.log("[INFO]: GET at '/ping'")

    res.send('pong', 200);
})

app.get('/health', async (req, res) => {
    console.log("[INFO]: GET at '/health'")
    console.log("[INFO]: Checking MongoDB connection...")
    const mongoState = mongoose.connection.readyState;
    if (mongoState === 1) console.log("[INFO]: MongoDB connection is active");
    else console.log("[WARN]: MongoDB connection state is not active");

    console.log("[INFO]: Checking PostgreSQL connection...")
    // console.log("[DEBUG] query result: ", (await prisma.$queryRaw`SELECT 1 as result`)[0]);
    const { result } = (await prisma.$queryRaw`SELECT 1 as result`)[0];
    if (result === 1) console.log("[INFO]: PostgreSQL connection is active");
    else console.log("[WARN]: PostgreSQL connection state is not active");

    res.send("Health Checks done. Check logs for more info.", 200);
})

app.listen(PORT, () => {
    console.log(`Backend flying on port ${PORT}`);
})

