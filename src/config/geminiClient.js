import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "../services/gemini-token.js";

export function createGeminiClient() {
  const apiKey = process.env.AASTHA_API_KEY;
    // getGeminiApiKey() || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_7;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Set GEMINI_API_KEY_0 (or GEMINI_API_KEY)."
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

export function createGeminiModel({ model, systemInstruction }) {
  const client = createGeminiClient();
  return client.getGenerativeModel({ model, systemInstruction });
}
