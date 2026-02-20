import { Router } from "express";

import jwtAuth from '../middleware/jwtAuth.js';
import { 
	getLogs, 
	getLogsByIdentifier, 
	getLogsByType, 
	getLogsBySource 
} from '../controller/logs.controller.js';

const router = Router();

// Get all logs with pagination
router.get('/', getLogs);

// Get logs by identifier
router.get('/identifier/:identifier', jwtAuth, getLogsByIdentifier);

// Get logs by type
router.get('/type/:type', jwtAuth, getLogsByType);

// Get logs by source
router.get('/source/:source', jwtAuth, getLogsBySource);

export default router;

