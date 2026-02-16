import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

export const fileUpload = upload.single('resume');