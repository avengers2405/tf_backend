import s3Client from "../db/s3.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import logger from "./logger.js";
import { pipeline } from "stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class S3FileStorageService {
  constructor() {
    // Base uploads directory relative to project root
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  /**
 * Uploads a document to an AWS S3 bucket from a file path.
 * 
 * @async
 * @param {string} filePath - The local file path to the document to be uploaded
 * @param {string} bucketName - The name of the S3 bucket where the file will be stored
 * @param {string} targetFileName - The key/name for the file in the S3 bucket
 * @returns {Promise<Object>} The AWS S3 response object containing upload metadata
 * @throws {Error} Throws an error if the file upload fails
 * 
 * @example
 * const response = await uploadDocumentFromDisk('./resume.pdf', 'my-bucket', 'resumes/john-resume.pdf');
 */
  async uploadDocumentFromDisk(filePath, bucketName, targetFilePath = undefined) {
    const normalizedFilePath = filePath.startsWith('/')
      ? filePath.substring(1)
      : filePath;
    
    if (targetFilePath) {
      // normalize
      targetFilePath = targetFilePath.startsWith('/')
        ? targetFilePath.substring(1)
        : targetFilePath;
    } else {
      targetFilePath = normalizedFilePath;
    }
    
    const fullFilePath = path.join(this.uploadsDir, normalizedFilePath);

    const fileStream = fs.createReadStream(fullFilePath);

    const uploadParams = {
      Bucket: bucketName,
      Key: targetFilePath,
      Body: fileStream
    }

    try {
      const command = new PutObjectCommand(uploadParams);
      const response = await s3Client.send(command);
      logger.info(`File uploaded successfully. S3 response: ${JSON.stringify(response)}`);
      return response;
    } catch (err) {
      logger.error(`Error uploading file to S3: ${err}`);
      throw err;
    }
  }

  /**
   * Uploads a document to an AWS S3 bucket from a file buffer (in-memory data).
   * 
   * This function allows uploading files that are already in memory as a Buffer, without
   * needing to save them to disk first. Useful for processing uploaded files directly.
   * 
   * @async
   * @param {Buffer} fileBuffer - The file contents as a Buffer object
   * @param {string} bucketName - The name of the S3 bucket where the file will be stored
   * @param {string} targetFilePath - The key/name for the file in the S3 bucket (required)
   * @returns {Promise<Object>} The AWS S3 response object containing upload metadata
   * @throws {Error} Throws an error if targetFilePath is not provided or if the upload fails
   * 
   * @example
   * const fileBuffer = await fs.promises.readFile('./resume.pdf');
   * const response = await service.uploadDocumentFromBuffer(fileBuffer, 'my-bucket', 'resumes/john-resume.pdf');
   */
  async uploadDocumentFromBuffer(fileBuffer, bucketName, targetFilePath) {
    if (!targetFilePath) throw new Error('targetFilePath is required for buffer uploads');

    // normalize
    targetFilePath = targetFilePath.startsWith('/')
      ? targetFilePath.substring(1)
      : targetFilePath;
    
    const uploadParams = {
      Bucket: bucketName,
      Key: targetFilePath,
      Body: fileBuffer
    }

    try {
      const command = new PutObjectCommand(uploadParams);
      const response = await s3Client.send(command);
      logger.info(`File uploaded successfully. S3 response: ${JSON.stringify(response)}`);
      return response;
    } catch (err) {
      logger.error(`Error uploading file to S3: ${err}`);
      throw err;
    }
  }

  /**
   * Retrieves a document from an AWS S3 bucket as a readable file stream.
   * 
   * @async
   * @param {string} bucketName - The name of the S3 bucket containing the file
   * @param {string} targetFileName - The key/name of the file in the S3 bucket
   * @returns {Promise<Stream>} A readable stream of the file contents from S3
   * @throws {Error} Throws an error if the file retrieval fails
   * 
   * @example
   * const fileStream = await retrieveDocumentToFileStream('my-bucket', 'resumes/john-resume.pdf');
   * fileStream.pipe(responseStream);
   */
  async retrieveDocumentToFileStream(bucketName, targetFileName) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: targetFileName
    })

    const response = await s3Client.send(command);
    return response.Body;
  }

  /**
   * Retrieves a document from an AWS S3 bucket and saves it to a specified local file path.
   * 
   * This function downloads the file from S3 and writes it to the local filesystem using streams
   * for efficient memory usage with large files.
   * 
   * @async
   * @param {string} bucketName - The name of the S3 bucket containing the file
   * @param {string} targetFileName - The key/name of the file in the S3 bucket
   * @param {string} downloadPath - The local file path where the downloaded file will be saved
   * @returns {Promise<void>} Completes when the file has been successfully downloaded and written
   * @throws {Error} Throws an error if the file retrieval or writing to disk fails
   * 
   * @example
   * await retrieveDocumentToFilePath('my-bucket', 'resumes/john-resume.pdf', './downloaded-resume.pdf');
   */
  async retrieveDocumentToFilePath(bucketName, targetFileName, downloadPath) {
    try {
      const fileStream = await this.retrieveDocumentToFileStream(bucketName, targetFileName);
      const writeStream = fs.createWriteStream(downloadPath);
      await pipeline(fileStream, writeStream);
      logger.info(`File downloaded successfully to ${downloadPath}`);
    } catch (err) {
      logger.error(`Error downloading file from S3: ${err}`);
      throw err;
    }
  }
}

const s3FileStorageService = new S3FileStorageService();
export default s3FileStorageService;