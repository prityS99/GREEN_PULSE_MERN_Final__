// server/app/services/ai/aiService.js
const { GoogleGenAI } = require("@google/genai");

// Initialize Google Gen AI instead of OpenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// If your app is using an exported function here, update it to use Gemini:
const summarizeDescription = async (description) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an operational data assistant. Summarize the following NGO description into a highly engaging, professional executive summary that is strictly under 50 words: "${description}"`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini runtime error:", error);
    throw error;
  }
};

module.exports = { summarizeDescription };