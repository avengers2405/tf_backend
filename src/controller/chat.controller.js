// import { prisma } from "../db/index.js";
// import { createGeminiModel } from "../config/geminiClient.js";
// import { countAvailableKeys } from "../services/gemini-token.js";
// import {
//   ingestProject,
//   retrieveRelevantChunks,
//   formatChunksForPrompt,
// } from "../services/rag/ragService.js";
// import { supabase, isSupabaseConfigured } from "../config/supabaseClient.js";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// async function projectHasEmbeddings(projectId) {
//   try {
//     const { count, error } = await supabase
//       .from("project_embeddings")
//       .select("id", { count: "exact", head: true })
//       .eq("project_id", projectId);
//     if (error) return false;
//     return (count ?? 0) > 0;
//   } catch {
//     return false;
//   }
// }

// function isGeminiQuotaError(error) {
//   const msg = error?.message || "";
//   // covers both Gemini (status 429) and Groq (rate_limit_exceeded)
//   return (
//     error?.status === 429 ||
//     error?.error?.type === "rate_limit_exceeded" ||
//     /quota|too many requests|rate limit/i.test(msg)
//   );
// }

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// async function generateGeminiResponse(systemInstruction, finalPrompt) {
//   const attempts = Math.max(1, countAvailableKeys());
//   let lastError = null;

//   for (let i = 0; i < attempts; i++) {
//     try {
//       const model = createGeminiModel({
//         model: "gemini-2.0-flash",
//         systemInstruction,
//       });
//       const result = await model.generateContent(finalPrompt);
//       return result.response.text();
//     } catch (error) {
//       lastError = error;

//       // ✅ FIX: was inverted — non-quota errors should throw immediately,
//       // quota errors should sleep and let the loop rotate to the next key.
//       if (!isGeminiQuotaError(error)) {
//         throw error; // non-quota (auth, network, etc.) → fail fast
//       }

//       console.warn(`[Chat] Quota hit on attempt ${i + 1}/${attempts}. Rotating key…`);
//       await sleep(Math.pow(2, i) * 500); // 500ms, 1s, 2s … backoff between key rotations
//       // loop continues → createGeminiModel() calls getGeminiApiKey() which round-robins
//     }
//   }

//   throw lastError; // all keys exhausted
// }

// // ─── Main controller ──────────────────────────────────────────────────────────

// export const chatWithProjectContext = async (req, res) => {
//   try {
//     const { messages, project_id, force_reindex = false } = req.body;

//     if (!project_id || !messages?.length) {
//       return res.status(400).json({ content: "project_id and messages are required." });
//     }

//     const projectId = Number(project_id);
//     const latestMessage = messages[messages.length - 1]?.content?.trim();

//     if (!latestMessage) {
//       return res.status(400).json({ content: "Last message is empty." });
//     }

//     // ── Step 1: Fetch project ──────────────────────────────────────────────────
//     // For ingestion fetch all commits; we only need recent ones for context.
//     const project = await prisma.project.findUnique({
//       where: { project_id: projectId },
//       include: {
//         // 50 commits for the vector store — enough signal without being excessive
//         git_logs: { orderBy: { commit_timestamp: "desc" }, take: 50 },
//         phases: true,
//       },
//     });

//     if (!project) {
//       return res.status(404).json({ content: "Project data not found." });
//     }

//     // ── Step 2: Ingest if needed ───────────────────────────────────────────────
//     let alreadyIndexed = false;

//     if (isSupabaseConfigured) {
//       alreadyIndexed = await projectHasEmbeddings(projectId);

//       if (!alreadyIndexed || force_reindex) {
//         console.log(`[Chat] ${force_reindex ? "Forced re-index" : "First-time index"} for project ${projectId}`);
//         try {
//           await ingestProject(project);
//         } catch (ingestErr) {
//           console.warn("[Chat] RAG ingestion skipped:", ingestErr.message);
//         }
//       }
//     } else {
//       console.warn("[Chat] Supabase not configured — answering without RAG context.");
//     }

//     // ── Step 3: Retrieve relevant chunks ──────────────────────────────────────
//     let relevantChunks = [];

//     if (isSupabaseConfigured) {
//       try {
//         relevantChunks = await retrieveRelevantChunks(latestMessage, projectId, {
//           matchCount: 4,       // max 4 chunks → keeps context tight
//           matchThreshold: 0.45,
//         });
//       } catch (retrievalErr) {
//         console.warn("[Chat] RAG retrieval failed:", retrievalErr.message);
//       }
//     }

//     const retrievedContext = formatChunksForPrompt(relevantChunks);
//     const totalChars = retrievedContext.length;
//     console.log(`[Chat] Context: ${relevantChunks.length} chunks, ~${Math.round(totalChars / 4)} tokens`);

//     // ── Step 4: Build grounded system prompt ──────────────────────────────────
//     // Kept intentionally short — system prompt tokens count against the quota too.
//     const systemInstruction = [
//       "You are an AI assistant helping a teacher review student project progress.",
//       "Answer using ONLY the context below. Be concise and analytical.",
//       "If the context lacks enough detail, say so. Do not invent data.",
//       "For anomalies, cite the exact commit and reason.",
//       "",
//       `Project: ${project.title} | Stack: ${project.technology_stack ?? "N/A"}`,
//       "",
//       "Context:",
//       retrievedContext,
//     ].join("\n");

//     // ── Step 5: Call Gemini ────────────────────────────────────────────────────
//     const finalPrompt = `Question: ${latestMessage}`;
//     console.log(`[Chat] Total prompt: ~${Math.round((systemInstruction.length + finalPrompt.length) / 4)} tokens`);

//     let responseText;
//     try {
//       responseText = await generateGeminiResponse(systemInstruction, finalPrompt);
//     } catch (aiError) {
//       if (isGeminiQuotaError(aiError)) {
//         return res.status(200).json({
//           content: "All Gemini API keys are quota-exhausted. Please try again later.",
//           rag_meta: {
//             chunks_retrieved: relevantChunks.length,
//             top_similarity: relevantChunks[0]?.similarity ?? null,
//             ai_fallback: "quota_exceeded",
//           },
//         });
//       }
//       throw aiError;
//     }

//     // ── Step 6: Return answer ──────────────────────────────────────────────────
//     return res.json({
//       content: responseText,
//       rag_meta: {
//         chunks_retrieved: relevantChunks.length,
//         top_similarity: relevantChunks[0]?.similarity ?? null,
//         was_indexed: isSupabaseConfigured ? !alreadyIndexed || force_reindex : false,
//       },
//     });
//   } catch (error) {
//     console.error("[Chat] Controller error:", error);
//     return res.status(500).json({ content: "Sorry, an error occurred. Please try again." });
//   }
// };

// // ─── Ingestion endpoint ────────────────────────────────────────────────────────

// export const ingestProjectEmbeddings = async (req, res) => {
//   try {
//     const projectId = Number(req.params.project_id);

//     const project = await prisma.project.findUnique({
//       where: { project_id: projectId },
//       include: {
//         git_logs: { orderBy: { commit_timestamp: "desc" }, take: 100 },
//         phases: true,
//       },
//     });

//     if (!project) {
//       return res.status(404).json({ message: "Project not found." });
//     }

//     const result = await ingestProject(project);
//     return res.json({ message: "Ingestion complete.", project_id: projectId, ...result });
//   } catch (error) {
//     console.error("[Ingest] Error:", error);
//     return res.status(500).json({ message: "Ingestion failed.", error: error.message });
//   }
// };

import { prisma } from "../db/index.js";
import { createGeminiModel } from "../config/geminiClient.js";
import {
  ingestProject,
  retrieveRelevantChunks,
  formatChunksForPrompt,
} from "../services/rag/ragService.js";
import { supabase, isSupabaseConfigured } from "../config/supabaseClient.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function projectHasEmbeddings(projectId) {
  try {
    const { count, error } = await supabase
      .from("project_embeddings")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (error) return false;
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

function isRateLimitError(error) {
  const msg = error?.message || "";
  return (
    error?.status === 429 ||
    error?.error?.type === "rate_limit_exceeded" ||
    /quota|too many requests|rate limit/i.test(msg)
  );
}

// ─── Main controller ──────────────────────────────────────────────────────────

export const chatWithProjectContext = async (req, res) => {
  try {
    const { messages, project_id, force_reindex = false } = req.body;

    if (!project_id || !messages?.length) {
      return res.status(400).json({ content: "project_id and messages are required." });
    }

    const projectId = Number(project_id);
    const latestMessage = messages[messages.length - 1]?.content?.trim();

    if (!latestMessage) {
      return res.status(400).json({ content: "Last message is empty." });
    }

    // ── Step 1: Fetch project ──────────────────────────────────────────────────
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        git_logs: { orderBy: { commit_timestamp: "desc" }, take: 50 },
        phases: true,
      },
    });

    if (!project) {
      return res.status(404).json({ content: "Project data not found." });
    }

    // ── Step 2: Ingest if needed ───────────────────────────────────────────────
    let wasReIndexed = false;

    if (isSupabaseConfigured) {
      const alreadyIndexed = await projectHasEmbeddings(projectId);

      if (!alreadyIndexed || force_reindex) {
        console.log(`[Chat] ${force_reindex ? "Forced re-index" : "First-time index"} for project ${projectId}`);
        try {
          await ingestProject(project);
          wasReIndexed = true;
        } catch (ingestErr) {
          console.warn("[Chat] RAG ingestion failed:", ingestErr.message);
        }
      } else {
        console.log(`[Chat] Project ${projectId} already indexed — skipping ingestion.`);
      }
    } else {
      console.warn("[Chat] Supabase not configured — answering without RAG context.");
    }

    // ── Step 3: Retrieve relevant chunks ──────────────────────────────────────
    let relevantChunks = [];

    if (isSupabaseConfigured) {
      try {
        relevantChunks = await retrieveRelevantChunks(latestMessage, projectId, {
          matchCount: 5,
          matchThreshold: 0.1,  // low threshold — MiniLM similarity for generic queries is 0.1–0.35
        });
      } catch (retrievalErr) {
        console.warn("[Chat] RAG retrieval failed:", retrievalErr.message);
      }
    }

    const retrievedContext = formatChunksForPrompt(relevantChunks);
    console.log(`[Chat] Context: ${relevantChunks.length} chunks, ~${Math.round(retrievedContext.length / 4)} tokens`);

    // ── Step 4: Build system prompt ────────────────────────────────────────────
    const systemInstruction = [
      "You are an AI assistant helping a teacher review student project progress.",
      "Answer using ONLY the context below. Be concise and analytical.",
      "If the context lacks enough detail, say so. Do not invent data.",
      "For anomalies, cite the exact commit and reason.",
      "",
      `Project: ${project.title} | Stack: ${project.technology_stack ?? "N/A"}`,
      "",
      "Context:",
      retrievedContext,
    ].join("\n");

    const finalPrompt = `Question: ${latestMessage}`;
    console.log(`[Chat] Total prompt: ~${Math.round((systemInstruction.length + finalPrompt.length) / 4)} tokens`);

    // ── Step 5: Call LLM (Groq) ───────────────────────────────────────────────
    let responseText;
    try {
      const model = createGeminiModel({ systemInstruction });
      const result = await model.generateContent(finalPrompt);
      responseText = result.response.text();
    } catch (aiError) {
      console.error("[Chat] LLM error:", aiError?.message);

      if (isRateLimitError(aiError)) {
        return res.status(429).json({
          content: "Rate limit hit. Please wait a moment and try again.",
          rag_meta: { chunks_retrieved: relevantChunks.length },
        });
      }
      throw aiError;
    }

    // ── Step 6: Return answer ──────────────────────────────────────────────────
    return res.json({
      content: responseText,
      rag_meta: {
        chunks_retrieved: relevantChunks.length,
        top_similarity: relevantChunks[0]?.similarity ?? null,
        was_indexed: wasReIndexed,
      },
    });
  } catch (error) {
    console.error("[Chat] Controller error:", error);
    return res.status(500).json({ content: "Sorry, an error occurred. Please try again." });
  }
};

// ─── Ingestion endpoint ────────────────────────────────────────────────────────

export const ingestProjectEmbeddings = async (req, res) => {
  try {
    const projectId = Number(req.params.project_id);

    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        git_logs: { orderBy: { commit_timestamp: "desc" }, take: 100 },
        phases: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const result = await ingestProject(project);
    return res.json({ message: "Ingestion complete.", project_id: projectId, ...result });
  } catch (error) {
    console.error("[Ingest] Error:", error);
    return res.status(500).json({ message: "Ingestion failed.", error: error.message });
  }
};