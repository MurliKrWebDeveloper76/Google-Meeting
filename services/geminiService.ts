
import { GoogleGenAI } from "@google/genai";

// Enhanced safe access to environment variables with error tracking
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment check failed, using fallback.");
  }
  return "";
};

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;
  const key = getApiKey();
  if (key) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: key });
      return aiInstance;
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
    }
  }
  return null;
};

export const getMeetingAssistantAdvice = async (topic: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AI Assistant is currently offline (Key missing). Proceeding with meeting...";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-performance meeting assistant. For the topic "${topic}", provide exactly 3 bullet points for a concise agenda. Keep it professional and high-level.`,
      config: {
        temperature: 0.6,
        maxOutputTokens: 200
      }
    });
    return response.text || "Focus on the core objectives and next steps.";
  } catch (error) {
    console.warn("Gemini Service Error:", error);
    return "Ensure clear objectives are discussed during the session.";
  }
};
