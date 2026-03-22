import { prisma } from "../db/index.js";
import { createGeminiModel } from "../config/geminiClient.js";
import { countAvailableKeys } from "../services/gemini-token.js";
import {
  ingestProject,
  retrieveRelevantChunks,
  formatChunksForPrompt,
} from "../services/rag/ragService.js";

// ✅ Static import — same module instance as ragService.js uses
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

function isGeminiQuotaError(error) {
  const message = error?.message || "";
  return (
    error?.status === 429 ||
    /quota|too many requests|rate limit/i.test(message)
  );
}

async function generateGeminiResponse(systemInstruction, finalPrompt) {
  const attempts = Math.max(1, countAvailableKeys());
  let lastError = null;

  for (let i = 0; i < attempts; i++) {
    try {
      const model = createGeminiModel({
        model: "gemini-2.0-flash",
        systemInstruction,
      });
      const result = await model.generateContent(finalPrompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (!isGeminiQuotaError(error)) throw error;
      console.warn(
        `[Chat] Gemini quota/rate-limit on attempt ${i + 1}/${attempts}.`
      );
    }
  }

  throw lastError;
}

// ─── Main controller ──────────────────────────────────────────────────────────

export const chatWithProjectContext = async (req, res) => {
  try {
    const { messages, project_id, force_reindex = false } = req.body;

    if (!project_id || !messages?.length) {
      return res
        .status(400)
        .json({ content: "project_id and messages are required." });
    }

    const projectId = Number(project_id);
    const latestMessage = messages[messages.length - 1]?.content?.trim();

    if (!latestMessage) {
      return res.status(400).json({ content: "Last message is empty." });
    }

    // ── Step 1: Fetch project ─────────────────────────────────────────────────
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        git_logs: { orderBy: { commit_timestamp: "desc" }, take: 100 },
        phases: true,
      },
    });

    if (!project) {
      return res.status(404).json({ content: "Project data not found." });
    }

    // ── Step 2: Ingest if needed ──────────────────────────────────────────────
    let alreadyIndexed = false;

    if (isSupabaseConfigured) {
      alreadyIndexed = await projectHasEmbeddings(projectId);

      if (!alreadyIndexed || force_reindex) {
        console.log(
          `[Chat] ${force_reindex ? "Forced re-index" : "First-time index"} for project ${projectId}`
        );
        try {
          await ingestProject(project);
        } catch (ingestErr) {
          console.warn("[Chat] RAG ingestion skipped:", ingestErr.message);
        }
      }
    } else {
      console.warn(
        "[Chat] Supabase not configured — answering without RAG context."
      );
    }

    // ── Step 3: Retrieve relevant chunks ─────────────────────────────────────
    let relevantChunks = [];

    if (isSupabaseConfigured) {
      try {
        relevantChunks = await retrieveRelevantChunks(latestMessage, projectId, {
          matchCount: 6,
          matchThreshold: 0.4,
        });
      } catch (retrievalErr) {
        console.warn("[Chat] RAG retrieval failed:", retrievalErr.message);
      }
    }

    const retrievedContext = formatChunksForPrompt(relevantChunks);

    // ── Step 4: Build grounded system prompt ──────────────────────────────────
    const systemInstruction = `
You are an AI Teaching Assistant helping a teacher evaluate student project progress.
Answer ONLY based on the retrieved project context below.
If the context does not contain enough information, say so clearly.
Do not hallucinate commits, phases, or metrics not present in the context.
Keep answers concise, analytical, and professional.
When referencing anomalies, cite the specific commit and reason.

Retrieved Project Context:
──────────────────────────
${retrievedContext}
──────────────────────────

Project Metadata:
- Title: ${project.title}
- Tech Stack: ${project.technology_stack ?? "Not specified"}
`.trim();

    // ── Step 5: Call Gemini ───────────────────────────────────────────────────
    const finalPrompt = `Teacher's question: ${latestMessage}`;
    let responseText;
    console.log("Above system prompt");
    try {
      responseText = await generateGeminiResponse(systemInstruction, finalPrompt);
    } catch (aiError) {
      if (isGeminiQuotaError(aiError)) {
        return res.status(200).json({
          content:
            "Gemini quota is currently exhausted. Please try again in a few minutes or switch to a billed API key.",
          rag_meta: {
            chunks_retrieved: relevantChunks.length,
            top_similarity: relevantChunks[0]?.similarity ?? null,
            was_indexed: isSupabaseConfigured
              ? !alreadyIndexed || force_reindex
              : false,
            ai_fallback: "quota_exceeded",
          },
        });
      }
      throw aiError;
    }

    // ── Step 6: Return answer ─────────────────────────────────────────────────
    return res.json({
      content: responseText,
      rag_meta: {
        chunks_retrieved: relevantChunks.length,
        top_similarity: relevantChunks[0]?.similarity ?? null,
        was_indexed: isSupabaseConfigured
          ? !alreadyIndexed || force_reindex
          : false,
      },
    });
  } catch (error) {
    console.error("[Chat] Controller error:", error);
    return res.status(500).json({
      content: "Sorry, I encountered an error. Please try again.",
    });
  }
};

// ─── Ingestion endpoint ───────────────────────────────────────────────────────

export const ingestProjectEmbeddings = async (req, res) => {
  try {
    const projectId = Number(req.params.project_id);

    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        git_logs: { orderBy: { commit_timestamp: "desc" } },
        phases: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const result = await ingestProject(project);

    return res.json({
      message: "Ingestion complete.",
      project_id: projectId,
      ...result,
    });
  } catch (error) {
    console.error("[Ingest] Error:", error);
    return res
      .status(500)
      .json({ message: "Ingestion failed.", error: error.message });
  }
};