import fileStorageService from "../services/fileStorageService.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

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