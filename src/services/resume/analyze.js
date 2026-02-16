import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get pdf_path from command line argument or use default
const pdf_path = process.argv[2] || "resume.pdf";

// console.log("🚀 ~ env.GEMINI_API_KEY:", process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractPIIFromResume() {
  try {
    // Read PDF file
    const pdfPath = path.join(__dirname, "./data/" + pdf_path);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = pdfBuffer.toString("base64");

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Send to Gemini API
    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Pdf,
          mimeType: "application/pdf",
        },
      },
      {
        text: `Extract PII from this resume. Return ONLY a JSON object with these exact keys:
{
    "names": [array of ALL name instances as they appear, including variations like "first-last", "first middle last", etc.],
    "leetcodeHandle": "handle or null",
    "linkedinProfile": "URL or null",
    "githubProfile": "URL or null",
    "codechefProfile: "URL or null",
    "stackoverflowProfile": "URL or null",
    "email": "email or null",
    "phone": "phone or null",
    "other_profiles": [array of all other usernames or handles found],
}

Important: For names, include EVERY variation found in the resume, preserving exact capitalization and formatting.`,
      },
    ]);

    // Parse response
    const content = response.response.text();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const piiData = JSON.parse(jsonMatch[0]);

    // Extract all values from piiData into a single array
    const allValues = [];
    for (const key in piiData) {
      const value = piiData[key];
      if (Array.isArray(value)) {
        // If it's an array, add all its elements
        allValues.push(...value);
      } else if (value !== null && value !== "null") {
        // If it's a string (and not null), add it
        allValues.push(value);
      }
    }

    console.log("\nAll PII values in array:");
    console.log(allValues);

    // console.log("Extracted PII from Resume:");
    // console.log(JSON.stringify(piiData, null, 2));

    // Invoke Python script with the array of values
    const tempDataFile = path.join(__dirname, "temp_pii_data.json");
    fs.writeFileSync(tempDataFile, JSON.stringify(allValues));
    const pythonScript = path.join(__dirname, "anonymize.py");

    try {
      const result = execSync(`python "${pythonScript}" "${tempDataFile}" "${pdf_path}"`, {
        encoding: 'utf-8',
        cwd: __dirname
      });
      console.log(result);
      // Clean up temp file
      fs.unlinkSync(tempDataFile);
    } catch (err) {
      console.error("Error running Python script:", err.message);
      // Clean up temp file even on error
      if (fs.existsSync(tempDataFile)) {
        fs.unlinkSync(tempDataFile);
      }
    }

    return allValues;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

extractPIIFromResume();

