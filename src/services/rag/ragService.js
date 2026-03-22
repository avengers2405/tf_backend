// services/ragService.js
// Handles:
//   1. buildChunks()   — turn Prisma project data into embeddable text chunks
//   2. ingestProject() — embed chunks and upsert them into Supabase pgvector
//   3. retrieveChunks() — embed a query and similarity-search the vector store

import { supabase } from "../../config/supabaseClient.js";
import { generateEmbedding } from "./embeddingService.js";

// ─── 1. Chunking ──────────────────────────────────────────────────────────────

/**
 * Converts a full Prisma project record into discrete text chunks.
 * Each chunk gets a stable `chunk_id` so we can upsert safely.
 *
 * Chunk types produced:
 *   • "metadata"  — project title + tech stack (1 chunk)
 *   • "phase"     — one chunk per project phase
 *   • "commit"    — one chunk per git log entry
 *
 * @param {object} project - Raw Prisma project object with phases & git_logs.
 * @returns {{ chunk_id: string, chunk_type: string, content: string, metadata: object }[]}
 */
export function buildChunks(project) {
  const chunks = [];
  const pid = project.project_id;

  // ── Metadata chunk ──────────────────────────────────────────────────────
  chunks.push({
    chunk_id: `project-${pid}-metadata`,
    chunk_type: "metadata",
    content: [
      `Project: ${project.title}`,
      `Technology Stack: ${project.technology_stack || "Not specified"}`,
      `Description: ${project.description || "No description provided"}`,
    ].join("\n"),
    metadata: {
      title: project.title,
      stack: project.technology_stack,
    },
  });

  // ── Phase chunks ────────────────────────────────────────────────────────
  for (const phase of project.phases ?? []) {
    chunks.push({
      chunk_id: `project-${pid}-phase-${phase.phase_id}`,
      chunk_type: "phase",
      content: [
        `Phase: ${phase.phase_name}`,
        `Status: ${phase.status}`,
        `Comments: ${phase.comments || "None"}`,
        `Due date: ${phase.due_date ? new Date(phase.due_date).toDateString() : "Not set"}`,
      ].join("\n"),
      metadata: {
        phase_id: phase.phase_id,
        phase_name: phase.phase_name,
        status: phase.status,
      },
    });
  }

  // ── Commit chunks ────────────────────────────────────────────────────────
  for (const log of project.git_logs ?? []) {
    const anomalyNote = log.is_anomaly
      ? ` Anomaly detected: ${log.anomaly_reason}`
      : "No anomaly";

    chunks.push({
      chunk_id: `project-${pid}-commit-${log.id}`,
      chunk_type: "commit",
      content: [
        `Commit by ${log.pusher_name} on ${new Date(log.commit_timestamp).toDateString()}`,
        `Message: ${log.commit_message}`,
        `Files changed: ${log.files_changed ?? "unknown"}`,
        anomalyNote,
      ].join("\n"),
      metadata: {
        log_id: log.id,
        pusher_name: log.pusher_name,
        is_anomaly: log.is_anomaly,
        anomaly_reason: log.anomaly_reason ?? null,
        commit_timestamp: log.commit_timestamp,
      },
    });
  }

  return chunks;
}

// ─── 2. Ingestion ─────────────────────────────────────────────────────────────

/**
 * Embeds all chunks for a project and upserts them into `project_embeddings`.
 * Safe to call multiple times — stale chunks are overwritten via `chunk_id`.
 *
 * @param {object} project - Full Prisma project record (with phases & git_logs).
 * @returns {Promise<{ inserted: number, errors: number }>}
 */
export async function ingestProject(project) {
  const chunks = buildChunks(project);
  let inserted = 0;
  let errors = 0;

  console.log(
    `[RAG] Ingesting ${chunks.length} chunks for project ${project.project_id}…`
  );

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content);
      const now = new Date().toISOString();
      const { error } = await supabase.from("project_embeddings").upsert(
        {
          project_id: project.project_id,
          chunk_type: chunk.chunk_type,
          chunk_id: chunk.chunk_id,
          content: chunk.content,
          metadata: chunk.metadata,
          embedding,
          updated_at: now, 
          created_at: now,
        },
        { onConflict: "project_id,chunk_id" } // matches the UNIQUE constraint
      );

      if (error) {
        console.error(`[RAG] Upsert error for chunk ${chunk.chunk_id}:`, error);
        errors++;
      } else {
        inserted++;
      }
    } catch (err) {
      console.error(`[RAG] Failed to embed chunk ${chunk.chunk_id}:`, err);
      errors++;
    }
  }

  console.log(`[RAG] Done. Inserted/updated: ${inserted}, Errors: ${errors}`);
  return { inserted, errors };
}

// ─── 3. Retrieval ─────────────────────────────────────────────────────────────

/**
 * Embeds the teacher's query and returns the most relevant stored chunks.
 *
 * @param {string}  query         - The teacher's question.
 * @param {number}  projectId     - Scope the search to a single project.
 * @param {object}  [options]
 * @param {number}  [options.matchCount=5]        - Max chunks to return.
 * @param {number}  [options.matchThreshold=0.45] - Cosine similarity floor (0–1).
 * @param {string}  [options.filterType]          - 'phase' | 'commit' | 'metadata' | null.
 * @returns {Promise<Array>}  Ranked chunks with similarity scores.
 */
export async function retrieveRelevantChunks(query, projectId, options = {}) {
  const {
    matchCount = 5,
    matchThreshold = 0.45,
    filterType = null,
  } = options;

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_project_chunks", {
    query_embedding: queryEmbedding,
    match_project_id: projectId,
    match_threshold: matchThreshold,
    match_count: matchCount,
    filter_type: filterType,
  });

  if (error) {
    console.error("[RAG] Retrieval RPC error:", error);
    throw new Error(`RAG retrieval failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Formats retrieved chunks into a compact string for the LLM system prompt.
 *
 * @param {Array} chunks - Output of retrieveRelevantChunks()
 * @returns {string}
 */
export function formatChunksForPrompt(chunks) {
  if (!chunks.length) return "No relevant context found in the knowledge base.";

  return chunks
    .map(
      (c, i) =>
        `[Chunk ${i + 1} | Type: ${c.chunk_type} | Similarity: ${(
          c.similarity * 100
        ).toFixed(1)}%]\n${c.content}`
    )
    .join("\n\n---\n\n");
}