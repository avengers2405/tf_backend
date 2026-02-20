import prisma from '../db/prisma.js';

class Logger {
	/**
	 * Helper function to extract options from arguments
	 * @private
	 */
	_extractOptions(args) {
		const lastArg = args[args.length - 1];
		
		// Check if last argument is an options object with source or identifier
		if (
			lastArg && 
			typeof lastArg === 'object' && 
			!Array.isArray(lastArg) &&
			('source' in lastArg || 'identifier' in lastArg)
		) {
			const options = args.pop();
			return {
				dataArgs: args,
				source: options.source || null,
				identifier: options.identifier || null
			};
		}
		
		return {
			dataArgs: args,
			source: null,
			identifier: null
		};
	}

	/**
	 * Convert arguments to string representation for DB storage
	 * @private
	 */
	_argsToString(args) {
		return args.map(arg => {
			if (typeof arg === 'object') {
				try {
					return JSON.stringify(arg);
				} catch (e) {
					return String(arg);
				}
			}
			return String(arg);
		}).join(' ');
	}

	/**
	 * Log a message or data to the database
	 * @param {...any} args - Any number of arguments to log
	 * @returns {Promise<object>} The created log entry
	 * @example
	 * logger.log("string1", "string2", "string3")
	 * logger.log("error occurred", { code: 500 }, { source: "api", identifier: "error-123" })
	 */
	async log(...args) {
		try {
			// Make a copy to avoid mutating the original
			const argsCopy = [...args];
			
			// Extract options and data
			const { dataArgs, source, identifier } = this._extractOptions(argsCopy);
			
			// Log to console like console.log()
			console.log(...dataArgs);

			// Prepare data for DB storage
			const concatenatedString = this._argsToString(dataArgs);
			const logData = {
				message: concatenatedString,
				args: dataArgs
			};

			// Create log entry in database
			const logEntry = await prisma.logs.create({
				data: {
					data: logData,
					identifier: identifier,
					type: 'INFO',
					source: source
				}
			});

			return logEntry;
		} catch (error) {
			// If database logging fails, at least log to console
			console.error('Failed to write log to database:', error);
			console.log('Original log args:', args);
			throw error;
		}
	}

	/**
	 * Log an info message
	 * @param {...any} args - Any number of arguments to log
	 */
	async info(...args) {
		const argsCopy = [...args];
		const { dataArgs, source, identifier } = this._extractOptions(argsCopy);
		
		console.log(...dataArgs);
		
		const concatenatedString = this._argsToString(dataArgs);
		const logData = {
			message: concatenatedString,
			args: dataArgs
		};

		return await prisma.logs.create({
			data: {
				data: logData,
				identifier: identifier,
				type: 'INFO',
				source: source
			}
		});
	}

	/**
	 * Log an error message
	 * @param {...any} args - Any number of arguments to log
	 */
	async error(...args) {
		const argsCopy = [...args];
		const { dataArgs, source, identifier } = this._extractOptions(argsCopy);
		
		console.error(...dataArgs);
		
		const concatenatedString = this._argsToString(dataArgs);
		const logData = {
			message: concatenatedString,
			args: dataArgs
		};

		return await prisma.logs.create({
			data: {
				data: logData,
				identifier: identifier,
				type: 'ERROR',
				source: source
			}
		});
	}

	/**
	 * Log a warning message
	 * @param {...any} args - Any number of arguments to log
	 */
	async warning(...args) {
		const argsCopy = [...args];
		const { dataArgs, source, identifier } = this._extractOptions(argsCopy);
		
		console.warn(...dataArgs);
		
		const concatenatedString = this._argsToString(dataArgs);
		const logData = {
			message: concatenatedString,
			args: dataArgs
		};

		return await prisma.logs.create({
			data: {
				data: logData,
				identifier: identifier,
				type: 'WARNING',
				source: source
			}
		});
	}

	/**
	 * Log a debug message
	 * @param {...any} args - Any number of arguments to log
	 */
	async debug(...args) {
		const argsCopy = [...args];
		const { dataArgs, source, identifier } = this._extractOptions(argsCopy);
		
		console.debug(...dataArgs);
		
		const concatenatedString = this._argsToString(dataArgs);
		const logData = {
			message: concatenatedString,
			args: dataArgs
		};

		return await prisma.logs.create({
			data: {
				data: logData,
				identifier: identifier,
				type: 'DEBUG',
				source: source
			}
		});
	}
}

// Export a singleton instance
const logger = new Logger();

export default logger;