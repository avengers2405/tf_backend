 import fileStorageService from "../services/fileStorageService.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import logger from "../services/logger.js";
import prisma from "../db/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a random alphanumeric string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} - Random alphanumeric string
 */
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Upload resume handler
 * Accepts a resume PDF file from form data and stores it in /resume folder
 */
export const uploadResume = async (req, res) => {
  logger.log("Endpoint has been hit: ", "/resume/upload");
  
  // Check if user is a student
  if (req.cookies.user_role !== 'student' || !req.student?.registration_number) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only students are allowed to access this endpoint'
    });
  }
  
  try {
    // Check if file is present in the request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided. Please upload a file in the "resume" field.'
      });
    }

    // Generate random 8-character alphanumeric string for resume name
    const randomName = generateRandomString(8);
    const fileName = `/resume/${randomName}.pdf`;

    // Store the file using fileStorageService
    const filePath = await fileStorageService.storeFile(fileName, req.file.buffer);

    // Run the analyze.js script with fileName as argument
    const scriptPath = path.join(__dirname, '../services/resume/analyze.js');
    
    await new Promise((resolve, reject) => {
      const nodeProcess = spawn('node', [scriptPath, fileName]);
      
      nodeProcess.stdout.on('data', (data) => {
        logger.log(`analyze.js output: ${data}`);
      });
      
      nodeProcess.stderr.on('data', (data) => {
        console.error(`analyze.js error: ${data}`);
      });
      
      nodeProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`analyze.js exited with code ${code}`));
        } else {
          resolve();
        }
      });
      
      nodeProcess.on('error', (error) => {
        reject(error);
      });
    });

    // Store resume details in Document table
    const document = await prisma.document.create({
      data: {
        student_registration_number: req.student.registration_number,
        name: `${randomName}.pdf`,
        document_description: { type: "resume" },
        document_url: fileName
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileName: `${randomName}.pdf`,
        filePath: fileName,
        storedAt: filePath,
        documentId: document.id
      }
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload resume',
      error: error.message
    });
  }
};

/**
 * List all resumes/documents handler
 * Fetches all documents from the database for a student
 * 
 * Access Control:
 * - Students: Can only see their own documents
 * - Teachers: Must provide student_id query parameter to view a student's documents
 * 
 * Query Parameters:
 * - student_id (required for teachers): The registration number of the student
 * 
 * Response Format:
 * {
 *   success: boolean,
 *   documents: [
 *     {
 *       id: string,                    // Document primary key (cuid)
 *       name: string,                   // Document filename
 *       document_description: object,   // JSON object with metadata (e.g., { type: "resume" })
 *       document_url: string,           // File path/URL
 *       created_at: string              // ISO timestamp
 *     }
 *   ]
 * }
 */
export const listResume = async (req, res) => {
  logger.log("Endpoint has been hit: ", "/resume/list");
  
  // Check if user is a student or teacher
  if (
    (req.cookies.user_role !== 'student' && req.cookies.user_role !== 'teacher') ||
    (req.cookies.user_role === 'student' && !req.student?.registration_number) ||
    (req.cookies.user_role === 'teacher' && !req.teacher?.id)
  ) {
    logger.error("student details: ", req.cookies.user_role, req.student);
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only students and teachers are allowed to access this endpoint'
    });
  }
  
  let registration_number;
  
  // Determine the registration number based on user role
  if (req.cookies.user_role === 'teacher') {
    // Teachers must provide student_id in query parameters
    const student_id = req.query.student_id;
    if (!student_id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Teachers must provide student_id query parameter'
      });
    }
    registration_number = student_id;
  } else {
    // Students can only access their own documents
    registration_number = req.student.registration_number;
  }

  logger.info("Resume list demanded for: ", registration_number);
  
  try {
    // Fetch all documents for the student from database
    const documents = await prisma.document.findMany({
      where: {
        student_registration_number: registration_number
      },
      select: {
        id: true,
        name: true,
        document_description: true,
        document_url: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return res.status(200).json({
      success: true,
      documents: documents
    });
    
  } catch (error) {
    console.error('Error listing resumes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list resumes',
      error: error.message
    });
  }
};

/**
 * Download resume handler
 * Returns the PDF file as a buffer for a given document ID
 * 
 * Access Control:
 * - Students: Can only download their own documents
 * - Teachers: Must provide student_id query parameter to download a student's documents
 * 
 * URL Parameters:
 * - id: The document ID (primary key - cuid)
 * 
 * Query Parameters:
 * - student_id (required for teachers): The registration number of the student
 * 
 * Response:
 * - Success: Returns PDF file with appropriate headers
 * - Error 403: User not authorized or missing student_id for teachers
 * - Error 404: Document not found or not associated with the specified student
 * - Error 500: Server error
 */
export const downloadResume = async (req, res) => {
  logger.log("Endpoint has been hit: ", "/resume/download/:id");
  
  // Check if user is a student or teacher
  if (
    (req.cookies.user_role !== 'student' && req.cookies.user_role !== 'teacher') ||
    (req.cookies.user_role === 'student' && !req.student?.registration_number) ||
    (req.cookies.user_role === 'teacher' && !req.teacher?.id)
  ) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only students and teachers are allowed to access this endpoint'
    });
  }
  
  let registration_number;
  
  // Determine the registration number based on user role
  if (req.cookies.user_role === 'teacher') {
    // Teachers must provide student_id in query parameters
    const student_id = req.query.student_id;
    if (!student_id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Teachers must provide student_id query parameter'
      });
    }
    registration_number = student_id;
  } else {
    // Students can only access their own documents
    registration_number = req.student.registration_number;
  }

  logger.info("Resume demanded for: ", registration_number);
  
  try {
    const { id } = req.params;
    
    // Check if anonymized parameter is true
    const isAnonymized = req.query.anonymized === 'true';
    
    // Fetch document from database and verify it belongs to the student
    const document = await prisma.document.findFirst({
      where: {
        id: id,
        student_registration_number: registration_number
      },
      select: {
        document_url: true,
        name: true
      }
    });
    
    // If document not found or doesn't belong to the student
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or not associated with the specified student'
      });
    }
    
    // Construct the file path based on anonymized parameter
    // Use the document_url from DB but adjust the folder based on isAnonymized
    const resumePath = isAnonymized
      ? path.join(__dirname, '../../uploads/anonymized', path.basename(document.document_url))
      : path.join(__dirname, '../../uploads', document.document_url);
    
    // Check if file exists on filesystem
    try {
      await fs.access(resumePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }
    
    // Read the PDF file
    const pdfBuffer = await fs.readFile(resumePath);
    
    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.name || 'resume.pdf'}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF buffer
    return res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error downloading resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
    });
  }
};


export const listAllResumes = async (req, res) => {
  logger.log("Endpoint has been hit: ", "/resume/list-all");
  
  // Strict check: Only teachers should be able to pull every student's resume
  // if (req.cookies.user_role !== 'teacher' || !req.teacher?.id) {
    // logger.error("Unauthorized access attempt to listAllResumes by role: ", req.cookies.user_role);
    // return res.status(403).json({
    //   success: false,
    //   message: 'Forbidden: Only teachers are allowed to access the global resume list'
    // });
  // }
  
  try {
    // Fetch all documents from the database
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        student_registration_number: true, // Crucial for identifying the owner
        name: true,
        document_description: true,
        document_url: true,
        created_at: true,
        skills:true
      },
      // Group them logically by student, then sort by newest first
      orderBy: [
        { student_registration_number: 'asc' },
        { created_at: 'desc' }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: documents.length,
      documents: documents
    });
    
  } catch (error) {
    console.error('Error listing all resumes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list all resumes',
      error: error.message
    });
  }
};