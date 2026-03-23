// // services/rag/ragService.js

// import { supabase } from "../../config/supabaseClient.js";
// import { generateEmbedding, generateEmbeddingsBatch } from "./embeddingService.js";

// // ─── helpers ──────────────────────────────────────────────────────────────────

// /** Hard-truncate a string and append "…" if it was cut. */
// function trunc(str, max) {
//   if (!str) return "";
//   const s = String(str).trim();
//   return s.length <= max ? s : s.slice(0, max) + "…";
// }

// // ─── 1. Chunking ──────────────────────────────────────────────────────────────

// /**
//  * Converts a Prisma project record into lean embeddable text chunks.
//  *
//  * Optimization vs previous version:
//  *  - Commit content reduced from ~200 chars → ~120 chars
//  *  - "No anomaly" line removed (adds tokens, zero retrieval value)
//  *  - Phase comments truncated to 80 chars
//  *  - Metadata description truncated to 120 chars
//  *  - Date formatted as YYYY-MM-DD (shorter than toDateString)
//  */
// export function buildChunks(project) {
//   const chunks = [];
//   const pid = project.project_id;

//   const fmt = (d) => d ? new Date(d).toISOString().split("T")[0] : "not set";

//   // ── 1 metadata chunk ──────────────────────────────────────────────────────
//   chunks.push({
//     chunk_id: `project-${pid}-metadata`,
//     chunk_type: "metadata",
//     content: [
//       `Project: ${project.title}`,
//       `Stack: ${project.technology_stack || "unspecified"}`,
//       `Desc: ${trunc(project.description, 120)}`,
//     ].join(" | "),
//     metadata: { title: project.title, stack: project.technology_stack },
//   });

//   // ── 1 chunk per phase ─────────────────────────────────────────────────────
//   for (const phase of project.phases ?? []) {
//     chunks.push({
//       chunk_id: `project-${pid}-phase-${phase.phase_id}`,
//       chunk_type: "phase",
//       content: [
//         `Phase: ${phase.phase_name}`,
//         `Status: ${phase.status}`,
//         phase.comments ? `Notes: ${trunc(phase.comments, 80)}` : null,
//         `Due: ${fmt(phase.due_date)}`,
//       ]
//         .filter(Boolean)
//         .join(" | "),
//       metadata: {
//         phase_id: phase.phase_id,
//         phase_name: phase.phase_name,
//         status: phase.status,
//       },
//     });
//   }

//   // ── 1 chunk per commit ────────────────────────────────────────────────────
//   for (const log of project.git_logs ?? []) {
//     const lines = [
//       `Commit ${fmt(log.commit_timestamp)} by ${log.pusher_name}`,
//       `Msg: ${trunc(log.commit_message, 120)}`,
//       `Files: ${log.files_changed ?? 0}`,
//     ];

//     // Only include anomaly info when it exists — "No anomaly" wastes tokens
//     if (log.is_anomaly && log.anomaly_reason) {
//       lines.push(`ANOMALY: ${trunc(log.anomaly_reason, 100)}`);
//     }

//     chunks.push({
//       chunk_id: `project-${pid}-commit-${log.id}`,
//       chunk_type: "commit",
//       content: lines.join(" | "),
//       metadata: {
//         log_id: log.id,
//         pusher_name: log.pusher_name,
//         is_anomaly: log.is_anomaly,
//         anomaly_reason: log.anomaly_reason ?? null,
//         commit_timestamp: log.commit_timestamp,
//       },
//     });
//   }

//   return chunks;
// }

// // ─── 2. Ingestion ─────────────────────────────────────────────────────────────

// /**
//  * Embeds all chunks in one batch call then upserts them into project_embeddings.
//  * Using batch embedding is faster than one-by-one and reduces total CPU time.
//  */
// export async function ingestProject(project) {
//   const chunks = buildChunks(project);
//   let inserted = 0;
//   let errors = 0;

//   console.log(`[RAG] Ingesting ${chunks.length} chunks for project ${project.project_id}…`);

//   // ── Batch-embed all chunk texts in one pass ────────────────────────────────
//   let embeddings;
//   try {
//     embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.content));
//   } catch (err) {
//     console.error("[RAG] Batch embedding failed:", err.message);
//     return { inserted: 0, errors: chunks.length };
//   }

//   // ── Upsert each chunk with its embedding ──────────────────────────────────
//   for (let i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i];
//     try {
//       const { error } = await supabase.from("project_embeddings").upsert(
//         {
//           project_id: project.project_id,
//           chunk_type: chunk.chunk_type,
//           chunk_id: chunk.chunk_id,
//           content: chunk.content,
//           metadata: chunk.metadata,
//           embedding: embeddings[i],
//           updated_at: new Date().toISOString()
//         },
//         { onConflict: "project_id,chunk_id" }
//       );

//       if (error) {
//         console.error(`[RAG] Upsert error for ${chunk.chunk_id}:`, error.message);
//         errors++;
//       } else {
//         inserted++;
//       }
//     } catch (err) {
//       console.error(`[RAG] Failed to upsert ${chunk.chunk_id}:`, err.message);
//       errors++;
//     }
//   }

//   console.log(`[RAG] Done. Inserted/updated: ${inserted}, Errors: ${errors}`);
//   return { inserted, errors };
// }

// // ─── 3. Retrieval ─────────────────────────────────────────────────────────────

// /**
//  * Embeds the query and returns the top-K most relevant chunks via pgvector RPC.
//  */
// export async function retrieveRelevantChunks(query, projectId, options = {}) {
//   const {
//     matchCount = 4,       // reduced from 6 — fewer chunks = fewer tokens to Gemini
//     matchThreshold = 0.45, // tighter threshold — only confident matches
//     filterType = null,
//   } = options;

//   const queryEmbedding = await generateEmbedding(query);

//   const { data, error } = await supabase.rpc("match_project_chunks", {
//     query_embedding: queryEmbedding,
//     match_project_id: projectId,
//     match_threshold: matchThreshold,
//     match_count: matchCount,
//     filter_type: filterType,
//   });

//   if (error) {
//     console.error("[RAG] Retrieval RPC error:", error);
//     throw new Error(`RAG retrieval failed: ${error.message}`);
//   }

//   return data ?? [];
// }

// /**
//  * Formats retrieved chunks into a compact string for the LLM system prompt.
//  * Similarity score is omitted — it's internal bookkeeping, not useful to Gemini.
//  */
// export function formatChunksForPrompt(chunks) {
//   if (!chunks.length) return "No relevant context found.";

//   return chunks
//     .map((c, i) => `[${i + 1}][${c.chunk_type}] ${c.content}`)
//     .join("\n");
// }

// services/rag/ragService.js

import { supabase } from "../../config/supabaseClient.js";
import { generateEmbedding } from "./embeddingService.js";

function trunc(str, max) {
  if (!str) return "";
  const s = String(str).trim();
  return s.length <= max ? s : s.slice(0, max) + "…";
}

// ─── 1. Chunking ──────────────────────────────────────────────────────────────

export function buildChunks(project) {
  const chunks = [];
  const pid = project.project_id;
  const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : "not set");

  // Metadata chunk
  chunks.push({
    chunk_id: `project-${pid}-metadata`,
    chunk_type: "metadata",
    content: [
      `Project: ${project.title}`,
      `Stack: ${project.technology_stack || "unspecified"}`,
      `Desc: ${trunc(project.description, 120)}`,
    ].join(" | "),
    metadata: { title: project.title, stack: project.technology_stack },
  });

  // Phase chunks
  // ✅ BUG FIX 1: Schema uses "end_date" not "due_date"
  // The Prisma model Project_Phase has end_date, NOT due_date.
  for (const phase of project.phases ?? []) {
    chunks.push({
      chunk_id: `project-${pid}-phase-${phase.phase_id}`,
      chunk_type: "phase",
      content: [
        `Phase: ${phase.phase_name}`,
        `Status: ${phase.status}`,
        phase.comments ? `Notes: ${trunc(phase.comments, 80)}` : null,
        `End: ${fmt(phase.end_date)}`,  // ← was phase.due_date (undefined in schema)
      ]
        .filter(Boolean)
        .join(" | "),
      metadata: {
        phase_id: phase.phase_id,
        phase_name: phase.phase_name,
        status: phase.status,
      },
    });
  }

  // Commit chunks
  for (const log of project.git_logs ?? []) {
    const lines = [
      `Commit ${fmt(log.commit_timestamp)} by ${log.pusher_name}`,
      `Msg: ${trunc(log.commit_message, 120)}`,
      `Files: ${log.files_changed ?? 0}`,
    ];
    if (log.is_anomaly && log.anomaly_reason) {
      lines.push(`ANOMALY: ${trunc(log.anomaly_reason, 100)}`);
    }
    chunks.push({
      chunk_id: `project-${pid}-commit-${log.id}`,
      chunk_type: "commit",
      content: lines.join(" | "),
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

export async function ingestProject(project) {
  const chunks = buildChunks(project);
  let inserted = 0;
  let errors = 0;

  console.log(`[RAG] Ingesting ${chunks.length} chunks for project ${project.project_id}…`);

  // ✅ BUG FIX 2: Embed one-by-one instead of batch.
  //
  // The previous batch approach called extractor(texts_array, ...) and then
  // sliced output.data assuming shape [n * 384]. BUT @xenova/transformers
  // pipeline batch output shape is [n, seq_len, 384] before pooling — after
  // pooling it becomes [n, 384], but the flat slice assumes the library
  // collapses it correctly. In practice many versions return only the LAST
  // text's embedding for the whole array, silently.
  //
  // Ingestion runs only ONCE per project so the perf difference is negligible.
  // Sequential embedding is guaranteed correct.

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content);

      const { error } = await supabase.from("project_embeddings").upsert(
        {
          project_id: project.project_id,
          chunk_type: chunk.chunk_type,
          chunk_id: chunk.chunk_id,
          content: chunk.content,
          metadata: chunk.metadata,
          embedding,
          updated_at: new Date().toISOString()
        },
        { onConflict: "project_id,chunk_id" }
      );

      if (error) {
        console.error(`[RAG] Upsert error for ${chunk.chunk_id}:`, error.message);
        errors++;
      } else {
        inserted++;
      }
    } catch (err) {
      console.error(`[RAG] Failed to embed/upsert ${chunk.chunk_id}:`, err.message);
      errors++;
    }
  }

  console.log(`[RAG] Done. Inserted/updated: ${inserted}, Errors: ${errors}`);
  return { inserted, errors };
}

// ─── 3. Retrieval ─────────────────────────────────────────────────────────────

export async function retrieveRelevantChunks(query, projectId, options = {}) {
  const {
    matchCount = 5,
    // ✅ BUG FIX 3: 0.45 threshold was filtering out ALL results.
    //
    // MiniLM-L6-v2 cosine similarity for a generic query like "Give update"
    // vs short commit/phase chunks typically lands between 0.15–0.35.
    // 0.45 is the similarity you'd expect for near-identical sentences.
    // Using 0.1 captures anything even loosely related to the query.
    matchThreshold = 0.1,
    filterType = null,
  } = options;

  const queryEmbedding = await generateEmbedding(query);

  console.log(`[RAG] Querying with threshold=${matchThreshold}, matchCount=${matchCount}`);

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

  console.log(`[RAG] Retrieved ${data?.length ?? 0} chunks. Top similarity: ${data?.[0]?.similarity?.toFixed(3) ?? "n/a"}`);
  return data ?? [];
}

export function formatChunksForPrompt(chunks) {
  if (!chunks.length) return "No relevant context found.";
  return chunks
    .map((c, i) => `[${i + 1}][${c.chunk_type}] ${c.content}`)
    .join("\n");
}