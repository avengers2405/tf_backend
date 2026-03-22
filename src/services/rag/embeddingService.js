// services/embeddingService.js
// Singleton wrapper around @xenova/transformers gte-small (384 dims)
// The pipeline is loaded once and reused for all subsequent calls.

import { pipeline } from "@xenova/transformers";

let _pipelineInstance = null;
let _loadingPromise = null;

/**
 * Returns the singleton feature-extraction pipeline.
 * Safe to call concurrently — the first call loads, subsequent calls wait.
 */
async function getPipeline() {
  if (_pipelineInstance) return _pipelineInstance;

  // Prevent multiple simultaneous loads
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = pipeline("feature-extraction", "Supabase/gte-small").then(
    (p) => {
      _pipelineInstance = p;
      _loadingPromise = null;
      console.log("[EmbeddingService] gte-small pipeline loaded.");
      return p;
    }
  );

  return _loadingPromise;
}

/**
 * Generate a normalized mean-pooled embedding for a text string.
 *
 * @param {string} text - Input text to embed.
 * @returns {Promise<number[]>} 384-dimensional float array.
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("[EmbeddingService] Cannot embed empty or non-string text.");
  }

  const extractor = await getPipeline();

  const output = await extractor(text.trim(), {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data); // plain JS array — ready for pgvector
}

/**
 * Batch-embed an array of texts.
 * Runs sequentially to stay within memory limits of the local model.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function generateEmbeddingsBatch(texts) {
  const results = [];
  for (const text of texts) {
    results.push(await generateEmbedding(text));
  }
  return results;
}