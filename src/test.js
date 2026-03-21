import s3FileStorageService from "./services/s3FileStorageService.js";
import fileStorageService from "./services/fileStorageService.js";

// s3FileStorageService.uploadDocumentFromDisk('/resume/3Y8X1bIq.pdf', 'uploaded-documents-katana');
// s3FileStorageService.retrieveDocumentToFilePath('uploaded-documents-katana', 'resume/3Y8X1bIq.pdf', '/s3/downloaded-resume.pdf')

const buffer = await s3FileStorageService.retrieveDocumentToFileBuffer('uploaded-documents-katana', 'resume/3Y8X1bIq.pdf');
fileStorageService.storeFile('/s3/test.pdf', buffer);