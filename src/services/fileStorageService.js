import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileStorageService {
  constructor() {
    // Base uploads directory relative to project root
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  /**
   * Stores a file in the uploads directory with support for nested folders
   * @param {string} fileName - The file path (e.g., 'file.pdf' or 'folder1/folder2/file.pdf')
   * @param {Buffer|string} fileContent - The file content (Buffer for binary files, string for text)
   * @returns {Promise<string>} - The absolute path where the file was stored
   */
  async storeFile(fileName, fileContent) {
    try {
      // Remove leading slash if present and normalize path
      const normalizedFileName = fileName.startsWith('/')
        ? fileName.substring(1)
        : fileName;

      // Construct full file path
      const fullFilePath = path.join(this.uploadsDir, normalizedFileName);

      // Get directory path
      const directory = path.dirname(fullFilePath);

      // Create directory if it doesn't exist (recursive)
      await fs.mkdir(directory, { recursive: true });

      // Write file
      await fs.writeFile(fullFilePath, fileContent);

      logger.log(`File stored successfully at: ${fullFilePath}`);
      return fullFilePath;
    } catch (error) {
      console.error('Failed to store file:', error);
      throw new Error(`File storage failed: ${error.message}`);
    }
  }

  /**
   * Retrieves a file from the uploads directory
   * @param {string} fileName - The file path relative to uploads directory
   * @returns {Promise<Buffer>} - The file content as a Buffer
   */
  async getFile(fileName) {
    try {
      const normalizedFileName = fileName.startsWith('/')
        ? fileName.substring(1)
        : fileName;

      const fullFilePath = path.join(this.uploadsDir, normalizedFileName);

      // Check if file exists
      await fs.access(fullFilePath);

      // Read and return file
      const fileContent = await fs.readFile(fullFilePath);
      return fileContent;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${fileName}`);
      }
      console.error('Failed to retrieve file:', error);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }
}

// Export singleton instance
const fileStorageService = new FileStorageService();
export default fileStorageService;
