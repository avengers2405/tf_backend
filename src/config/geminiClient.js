// import "dotenv/config";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { getGeminiApiKey } from "../services/gemini-token.js";

// export function createGeminiClient() {
//   const apiKey = process.env.AASTHA_API_KEY;
//     // getGeminiApiKey() || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_7;

//   if (!apiKey) {
//     throw new Error(
//       "Gemini API key is missing. Set GEMINI_API_KEY_0 (or GEMINI_API_KEY)."
//     );
//   }

//   return new GoogleGenerativeAI(apiKey);
// }

// export function createGeminiModel({ model, systemInstruction }) {
//   const client = createGeminiClient();
//   return client.getGenerativeModel({ model, systemInstruction });
// }

import "dotenv/config";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Drop-in replacement for createGeminiModel().
 * Returns an object with the same generateContent() surface so
 * chatController.js needs zero changes.
 *
 * @param {{ systemInstruction: string }} options
 */
export function createGeminiModel({ systemInstruction }) {
  return {
    async generateContent(userPrompt) {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile", // fast, free, high quality
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user",   content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      });

      const text = completion.choices[0]?.message?.content ?? "";

      // Match the Gemini response shape so the controller works unchanged
      return { response: { text: () => text } };
    },
  };
}