import fs from "fs";
import mammoth from "mammoth";
import skillMap from "../skills.js";

/* --------------------------------------------------
   Load pdf-parse WITHOUT triggering test files
-------------------------------------------------- */
async function loadPdfParse() {
  const module = await import("pdf-parse/lib/pdf-parse.js");
  return module.default;
}

/* --------------------
   HELPERS
-------------------- */
function cleanText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAllSkills(rawText) {
  const found = [];
  const cleanedText = cleanText(rawText);

  for (const category in skillMap) {
    for (const skill of skillMap[category]) {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|\\s)${escapedSkill}(?:\\s|$)`, "i");

      if (regex.test(cleanedText)) {
        found.push({ skill, category });
      }
    }
  }

  return Array.from(
    new Map(found.map(s => [`${s.skill}-${s.category}`, s])).values()
  );
}

/* --------------------
   CONTROLLER
-------------------- */
export const parseResume = async (req, res) => {
  let filePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    filePath = req.file.path;
    const type = req.file.mimetype;
    let rawText = "";

    /* ---------- PDF ---------- */
    if (type.includes("pdf")) {
      const buffer = fs.readFileSync(filePath);

      const pdfParse = await loadPdfParse();
      const data = await pdfParse(buffer);

      rawText = data.text;
    }

    /* ---------- DOCX ---------- */
    else if (
      type.includes("word") ||
      type.includes("officedocument")
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    }

    else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const skills = extractAllSkills(rawText);
    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      filename: req.file.originalname,
      skills,
      domainSummary: Object.keys(skillMap).map(cat => ({
        name: cat,
        count: skills.filter(s => s.category === cat).length
      }))
    });

  } catch (err) {
    console.error("RESUME PARSER ERROR:", err);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(500).json({
      error: "Parsing failed",
      details: err.message
    });
  }
};

// import fs from "fs";
// import mammoth from "mammoth";
// import skillMap from "../skills.js";

// /* --------------------------------------------------
//    pdf-parse loader (ESM-safe, Windows-safe)
// -------------------------------------------------- */
// async function loadPdfParse() {
//   const module = await import("pdf-parse");
//   return module.default; // always correct in ESM
// }

// /* --------------------
//    HELPER FUNCTIONS
// -------------------- */
// function cleanText(text) {
//   if (!text) return "";
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9+.#\s]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function extractAllSkills(rawText) {
//   const found = [];
//   const cleanedText = cleanText(rawText);

//   if (!skillMap) return [];

//   for (const category in skillMap) {
//     for (const skill of skillMap[category]) {
//       const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//       const regex = new RegExp(`(?:^|\\s)${escapedSkill}(?:\\s|$)`, "i");

//       if (regex.test(cleanedText)) {
//         found.push({ skill, category });
//       }
//     }
//   }

//   return Array.from(
//     new Map(found.map(item => [`${item.skill}-${item.category}`, item])).values()
//   );
// }

// /* --------------------
//    CONTROLLER
// -------------------- */
// export const parseResume = async (req, res) => {
//   let filePath = null;

//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     filePath = req.file.path;
//     const fileType = req.file.mimetype;
//     let rawText = "";

//     /* ---------- PDF ---------- */
//     if (fileType.includes("pdf")) {
//       const buffer = fs.readFileSync(filePath);

//       const pdfParse = await loadPdfParse();
//       const data = await pdfParse(buffer);

//       rawText = data.text;
//     }

//     /* ---------- DOCX ---------- */
//     else if (
//       fileType.includes("word") ||
//       fileType.includes("officedocument")
//     ) {
//       const result = await mammoth.extractRawText({ path: filePath });
//       rawText = result.value;
//     }

//     /* ---------- Unsupported ---------- */
//     else {
//       fs.unlinkSync(filePath);
//       return res.status(400).json({
//         error: "Unsupported file type. Upload PDF or DOCX."
//       });
//     }

//     const skills = extractAllSkills(rawText);

//     fs.unlinkSync(filePath);

//     return res.json({
//       success: true,
//       filename: req.file.originalname,
//       skills,
//       domainSummary: Object.keys(skillMap).map(cat => ({
//         name: cat,
//         count: skills.filter(s => s.category === cat).length
//       }))
//     });

//   } catch (error) {
//     console.error("RESUME PARSER ERROR:", error);

//     if (filePath && fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     return res.status(500).json({
//       error: "Parsing failed",
//       details: error.message
//     });
//   }
// };
