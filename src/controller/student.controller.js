// controllers/studentController.js
import { prisma } from "../db/index.js";

const NON_EDITABLE_FIELDS = new Set([
  "registration_number",
  "user_id",
  "created_at",
  "updated_at",
]);

const NUMERIC_FIELDS = new Set([
  "cgpa",
  "batch",
  "x_class",
  "x_class_passing_year",
  "x_gap_year",
  "xii_class",
  "xii_class_passing_year",
  "xii_gap_year",
  "diploma",
  "diploma_passing_year",
  "diploma_gap_year",
  "cet_percentile",
  "jee_percentile",
  "amcat_marks",
  "active_backlog",
  "passive_backlog",
]);

const BOOLEAN_FIELDS = new Set(["yd", "higher_education_plans"]);
const DATE_FIELDS = new Set(["date_of_birth"]);
const JSON_FIELDS = new Set([
  "current_address",
  "permanent_address",
  "amcat_details",
]);
const ARRAY_FIELDS = new Set(["skills"]);
const ENUM_GENDER_VALUES = new Set(["Male", "Female", "Other"]);

const REQUIRED_FIELDS = new Set([
  "cgpa",
  "date_of_birth",
  "primary_email",
  "skills",
]);

const normalizeEmptyValue = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  return value;
};

const parseBooleanValue = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  throw new Error("Boolean value expected");
};

const parseNumberValue = (value) => {
  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      throw new Error("Numeric value expected");
    }
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      throw new Error("Numeric value expected");
    }
    return numeric;
  }

  throw new Error("Numeric value expected");
};

const parseDateValue = (value) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Valid date expected");
    }
    return parsed;
  }

  throw new Error("Valid date expected");
};

const parseJsonValue = (value) => {
  if (value === null || typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("Valid JSON expected");
    }
  }

  throw new Error("Valid JSON expected");
};

const parseArrayValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    if (value.trim() === "") {
      return [];
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new Error("Array value expected");
};

const coerceFieldValue = (field, rawValue) => {
  const normalized = normalizeEmptyValue(rawValue);

  if (normalized === undefined) {
    return undefined;
  }

  if (normalized === null) {
    if (REQUIRED_FIELDS.has(field)) {
      throw new Error(`Field ${field} cannot be empty`);
    }
    return null;
  }

  if (field === "gender") {
    const value = String(normalized);
    if (!ENUM_GENDER_VALUES.has(value)) {
      throw new Error("Gender must be one of: Male, Female, Other");
    }
    return value;
  }

  if (BOOLEAN_FIELDS.has(field)) {
    return parseBooleanValue(normalized);
  }

  if (NUMERIC_FIELDS.has(field)) {
    return parseNumberValue(normalized);
  }

  if (DATE_FIELDS.has(field)) {
    return parseDateValue(normalized);
  }

  if (JSON_FIELDS.has(field)) {
    return parseJsonValue(normalized);
  }

  if (ARRAY_FIELDS.has(field)) {
    return parseArrayValue(normalized);
  }

  return normalized;
};

const sanitizeStudentResponse = (student) => {
  if (!student) {
    return student;
  }

  return {
    ...student,
    date_of_birth: student.date_of_birth ? student.date_of_birth.toISOString().split("T")[0] : null,
  };
};

const getUserIdFromRequest = (req) => req.user?.sub;

export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    console.log("Students",students);
    const formattedStudents = students.map(s => ({
      id: s.registration_number,
      registration_number: s.registration_number,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
      department: s.department,
      year: s.be_roll_number ? "4" : "3",
      cgpa: s.cgpa,

      // ✅ Directly from Student model
      skills: s.skills || [],

      // UI placeholder (safe to keep)
      domains: [
        { name: "Web Development", value: 70 },
        { name: "AI / Machine Learning", value: 30 },
        { name: "Cybersecurity", value: 90 },
        { name: "App Development", value: 50 },
        { name: "Competitive Programming", value: 60 }
      ]
    }));

    res.status(200).json(formattedStudents);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      error: "Failed to fetch students from database"
    });
  }
};

export const updateStudentSkills = async (req, res) => {
  try {
    const { username, skills } = req.body;
    console.log("Update Student",username);
    if (!username || !skills) {
      return res.status(400).json({ error: "Username and skills required" });
    }

    const updatedStudent = await prisma.student.update({
      where: {
        user_id: username, // ⚠️ change if using different unique field
      },
      data: {
        skills: skills, // must be String[] in Prisma schema
      },
    });

    res.status(200).json({
      success: true,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update skills error:", error);
    res.status(500).json({ error: "Failed to update skills" });
  }
};

// controllers/studentController.js

export const getStudentSkills = async (req, res) => {
  try {
    // Extract username from the request body (similar to updateStudentSkills)
    const { username } = req.body; 
    console.log("Get skills for student:", username);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Fetch only the skills field for efficiency
    const student = await prisma.student.findUnique({
      where: {
        user_id: username, 
      },
      select: {
        skills: true, 
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({
      success: true,
      skills: student.skills || [],
    });
  } catch (error) {
    console.error("Get student skills error:", error);
    res.status(500).json({ error: "Failed to fetch student skills" });
  }
};

export const getMyStudentProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const student = await prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    return res.status(200).json({
      success: true,
      student: sanitizeStudentResponse(student),
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    return res.status(500).json({ error: "Failed to fetch student profile" });
  }
};

export const updateMyStudentField = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { field, value } = req.body;

    if (!field || typeof field !== "string") {
      return res.status(400).json({ error: "field is required" });
    }

    if (NON_EDITABLE_FIELDS.has(field)) {
      return res.status(400).json({ error: `Field ${field} cannot be updated` });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { user_id: userId },
      select: { registration_number: true, [field]: true },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    if (!(field in existingStudent)) {
      return res.status(400).json({ error: `Unknown field: ${field}` });
    }

    let parsedValue;
    try {
      parsedValue = coerceFieldValue(field, value);
    } catch (parseError) {
      return res.status(400).json({ error: parseError.message });
    }

    const updatedStudent = await prisma.student.update({
      where: { user_id: userId },
      data: { [field]: parsedValue },
    });

    return res.status(200).json({
      success: true,
      student: sanitizeStudentResponse(updatedStudent),
    });
  } catch (error) {
    console.error("Update student field error:", error);
    return res.status(500).json({ error: "Failed to update student field" });
  }
};

export const updateMyStudentProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const entries = Object.entries(payload);
    if (entries.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const dataToUpdate = {};
    for (const [field, rawValue] of entries) {
      if (NON_EDITABLE_FIELDS.has(field)) {
        continue;
      }

      if (!(field in existingStudent)) {
        continue;
      }

      try {
        const parsedValue = coerceFieldValue(field, rawValue);
        if (parsedValue !== undefined) {
          dataToUpdate[field] = parsedValue;
        }
      } catch (parseError) {
        return res.status(400).json({ error: `Invalid value for ${field}: ${parseError.message}` });
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No valid fields provided to update" });
    }

    const updatedStudent = await prisma.student.update({
      where: { user_id: userId },
      data: dataToUpdate,
    });

    return res.status(200).json({
      success: true,
      student: sanitizeStudentResponse(updatedStudent),
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    return res.status(500).json({ error: "Failed to update student profile" });
  }
};