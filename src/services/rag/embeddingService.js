// services/rag/embeddingService.js
// Uses Xenova/all-MiniLM-L6-v2 — same 384 dims as gte-small but
// significantly faster on CPU (no heavy cross-encoder overhead).

import { pipeline } from "@xenova/transformers";

let _pipelineInstance = null;
let _loadingPromise = null;

// Switch from "Supabase/gte-small" → "Xenova/all-MiniLM-L6-v2"
// Both output 384-dim vectors so the DB schema and match function are unchanged.
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

async function getPipeline() {
  if (_pipelineInstance) return _pipelineInstance;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = pipeline("feature-extraction", MODEL_NAME).then((p) => {
    _pipelineInstance = p;
    _loadingPromise = null;
    console.log(`[EmbeddingService] ${MODEL_NAME} pipeline loaded.`);
    return p;
  });

  return _loadingPromise;
}

/**
 * Embed a single string → 384-dim float array.
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("[EmbeddingService] Cannot embed empty text.");
  }

  const extractor = await getPipeline();
  const output = await extractor(text.trim(), { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/**
 * Embed multiple strings in one pipeline pass.
 * Transformers.js batches them internally → faster than calling one-by-one.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function generateEmbeddingsBatch(texts) {
  if (!texts?.length) return [];

  const extractor = await getPipeline();

  // Pass the whole array at once — the pipeline handles batching internally.
  const output = await extractor(texts, { pooling: "mean", normalize: true });

  // output.data is a flat Float32Array of length (n_texts * 384).
  // Slice it back into per-text arrays.
  const DIM = 384;
  const results = [];
  for (let i = 0; i < texts.length; i++) {
    results.push(Array.from(output.data.slice(i * DIM, (i + 1) * DIM)));
  }
  return results;
}