import "dotenv/config";
import logger from "./logger.js";

// Count available keys in .env
function countAvailableKeys() {
  let count = 0;
  while (process.env[`GEMINI_API_KEY_${count}`]?.trim()) {
    count++;
  }
  return count;
}

// Initialize queue with available key indices
const NUM_KEYS = 3; //countAvailableKeys();
const keyQueue = Array.from({ length: NUM_KEYS }, (_, i) => i);

/**
 * Returns the next available Gemini API key using round-robin
 * @returns {string} Gemini API key
 */
export function getGeminiApiKey() {
  if (keyQueue.length === 0) {
    throw new Error('No Gemini API keys available');
  }

  // Get key from front of queue
  const keyIndex = keyQueue.shift();
  
  // Push it to the back for next use
  keyQueue.push(keyIndex);
  
  const apiKey = process.env[`GEMINI_API_KEY_${keyIndex}`];
  
  logger.log(`Using GEMINI_API_KEY_${keyIndex}, Queue: [${keyQueue.join(', ')}]`);
  
  return apiKey;
}
