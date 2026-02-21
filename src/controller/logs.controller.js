import { prisma } from "../db/index.js";

/**
 * Get logs with pagination
 * @route GET /api/logs
 * @param {string} req.query.start - Optional datetime to get logs before (ISO 8601 format)
 * @param {number} req.query.offset - Optional number of logs to skip (default: 0)
 * @returns {Array} 100 logs before the start time, skipping offset logs
 */
export const getLogs = async (req, res) => {
	try {
		// Extract query parameters
		const { start, offset } = req.query;

		// Parse start time or use current datetime
		const startTime = start ? new Date(start) : new Date();
		
		// Parse offset or use 0
		const skipCount = offset ? parseInt(offset, 10) : 0;

		// Validate parsed values
		if (isNaN(startTime.getTime())) {
			return res.status(400).json({ 
				error: "Invalid start time format. Use ISO 8601 format (e.g., 2026-02-20T10:30:00Z)" 
			});
		}

		if (isNaN(skipCount) || skipCount < 0) {
			return res.status(400).json({ 
				error: "Invalid offset value. Must be a non-negative number." 
			});
		}

		// Query logs from database
		const logs = await prisma.logs.findMany({
			where: {
				created_at: {
					lt: startTime // Less than (before) the start time
				}
			},
			orderBy: {
				created_at: 'desc' // Most recent first
			},
			skip: skipCount,
			take: 100
		});

		// Return logs in JSON format
		res.status(200).json({
			success: true,
			count: logs.length,
			start: startTime.toISOString(),
			offset: skipCount,
			logs: logs
		});

	} catch (error) {
		console.error("Error fetching logs:", error);
		res.status(500).json({ 
			success: false,
			error: "Failed to fetch logs from database.",
			message: error.message 
		});
	}
};

/**
 * Get logs by identifier
 * @route GET /api/logs/identifier/:identifier
 * @param {string} req.params.identifier - The identifier tag to filter logs
 * @returns {Array} Logs matching the identifier
 */
export const getLogsByIdentifier = async (req, res) => {
	try {
		const { identifier } = req.params;
		const { start, offset } = req.query;

		const startTime = start ? new Date(start) : new Date();
		const skipCount = offset ? parseInt(offset, 10) : 0;

		const logs = await prisma.logs.findMany({
			where: {
				identifier: identifier,
				created_at: {
					lt: startTime
				}
			},
			orderBy: {
				created_at: 'desc'
			},
			skip: skipCount,
			take: 100
		});

		res.status(200).json({
			success: true,
			count: logs.length,
			identifier: identifier,
			start: startTime.toISOString(),
			offset: skipCount,
			logs: logs
		});

	} catch (error) {
		console.error("Error fetching logs by identifier:", error);
		res.status(500).json({ 
			success: false,
			error: "Failed to fetch logs from database.",
			message: error.message 
		});
	}
};

/**
 * Get logs by type
 * @route GET /api/logs/type/:type
 * @param {string} req.params.type - The log type to filter (INFO, ERROR, WARNING, DEBUG)
 * @returns {Array} Logs matching the type
 */
export const getLogsByType = async (req, res) => {
	try {
		const { type } = req.params;
		const { start, offset } = req.query;

		const startTime = start ? new Date(start) : new Date();
		const skipCount = offset ? parseInt(offset, 10) : 0;

		const logs = await prisma.logs.findMany({
			where: {
				type: type.toUpperCase(),
				created_at: {
					lt: startTime
				}
			},
			orderBy: {
				created_at: 'desc'
			},
			skip: skipCount,
			take: 100
		});

		res.status(200).json({
			success: true,
			count: logs.length,
			type: type.toUpperCase(),
			start: startTime.toISOString(),
			offset: skipCount,
			logs: logs
		});

	} catch (error) {
		console.error("Error fetching logs by type:", error);
		res.status(500).json({ 
			success: false,
			error: "Failed to fetch logs from database.",
			message: error.message 
		});
	}
};

/**
 * Get logs by source
 * @route GET /api/logs/source/:source
 * @param {string} req.params.source - The source to filter logs
 * @returns {Array} Logs matching the source
 */
export const getLogsBySource = async (req, res) => {
	try {
		const { source } = req.params;
		const { start, offset } = req.query;

		const startTime = start ? new Date(start) : new Date();
		const skipCount = offset ? parseInt(offset, 10) : 0;

		const logs = await prisma.logs.findMany({
			where: {
				source: source,
				created_at: {
					lt: startTime
				}
			},
			orderBy: {
				created_at: 'desc'
			},
			skip: skipCount,
			take: 100
		});

		res.status(200).json({
			success: true,
			count: logs.length,
			source: source,
			start: startTime.toISOString(),
			offset: skipCount,
			logs: logs
		});

	} catch (error) {
		console.error("Error fetching logs by source:", error);
		res.status(500).json({ 
			success: false,
			error: "Failed to fetch logs from database.",
			message: error.message 
		});
	}
};
