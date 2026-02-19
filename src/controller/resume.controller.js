import fileStorageService from "../services/fileStorageService.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

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
  console.log("Endpoint has been hit: ", "/resume/upload");
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
        console.log(`analyze.js output: ${data}`);
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

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileName: `${randomName}.pdf`,
        filePath: fileName,
        storedAt: filePath
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
 * List all resumes handler
 * Returns a list of all resumes in the uploads/resume or uploads/anonymized directory
 * Query parameter: anonymized=true/false (default: false)
 */
export const listResume = async (req, res) => {
  console.log("Endpoint has been hit: ", "/resume/list");
  try {
    // Check if anonymized parameter is true
    const isAnonymized = req.query.anonymized === 'true';
    
    // Construct path to resume directory based on anonymized parameter
    const resumeDir = isAnonymized 
      ? path.join(__dirname, '../../uploads/anonymized')
      : path.join(__dirname, '../../uploads/resume');
    
    // Read all files in the directory
    const files = await fs.readdir(resumeDir);
    
    // Get current timestamp for uploadDate
    const currentTime = new Date().toISOString();
    
    // Map files to the required format
    const resumes = files
      .filter(file => file.endsWith('.pdf')) // Only include PDF files
      .map(filename => ({
        id: filename.replace('.pdf', ''), // Use filename without extension as ID
        filename: filename,
        uploadDate: currentTime
      }));
    
    return res.status(200).json({
      resumes: resumes
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
 * Returns the PDF file as a buffer for a given resume ID (filename without extension)
 * Query parameter: anonymized=true/false (default: false)
 */
export const downloadResume = async (req, res) => {
  console.log("Endpoint has been hit: ", "/resume/download/:id");
  try {
    const { id } = req.params;
    
    // Check if anonymized parameter is true
    const isAnonymized = req.query.anonymized === 'true';
    
    // Construct the filename from the ID
    const filename = `${id}.pdf`;
    const resumePath = isAnonymized
      ? path.join(__dirname, '../../uploads/anonymized', filename)
      : path.join(__dirname, '../../uploads/resume', filename);
    
    // Check if file exists
    try {
      await fs.access(resumePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    // Read the PDF file
    const pdfBuffer = await fs.readFile(resumePath);
    
    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
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