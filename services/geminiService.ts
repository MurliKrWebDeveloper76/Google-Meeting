import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      return new GoogleGenAI({ apiKey });
    }
  } catch (e) {
    console.warn("NexusMeet: AI Engine restricted or missing credentials.");
  }
  return null;
};

export interface AIResponse {
  text: string;
  sources?: { title: string; uri: string }[];
}

/**
 * Generates a high-level meeting agenda using the fast Gemini 3 Flash model.
 */
export const getMeetingAssistantAdvice = async (topic: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Focus on key objectives and define immediate next steps.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional meeting architect. Create a high-impact 3-point agenda for a session about: "${topic}". Keep it brief and professional.`,
      config: { 
        temperature: 0.7,
        topP: 0.95,
        topK: 64
      }
    });
    
    return response.text || "1. Align on objectives\n2. Resource allocation\n3. Timeline definition";
  } catch (error) {
    console.error("Gemini Agenda Error:", error);
    return "Establish core goals and align on strategic execution.";
  }
};

/**
 * Provides deep-dive research and insights with Google Search grounding using Gemini 3 Pro.
 */
export const getRealtimeAdvice = async (transcript: string, currentContext?: string): Promise<AIResponse> => {
  const ai = getAI();
  if (!ai) return { text: "AI research interface is currently in offline mode." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: `Current Context: ${currentContext || 'Active Video Discussion'}
      Participant Inquiry: "${transcript}"
      Provide a precise, data-driven response. If the query involves facts, current events, or industry trends, use Google Search to provide grounded information.`,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      }
    });
    
    const text = response.text || "I'm processing the discussion context. How can I assist further?";
    
    // Extract search grounding metadata for source transparency
    const sources: { title: string; uri: string }[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { text, sources: sources.length > 0 ? sources : undefined };
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return { text: "Neural link is stabilizing. Please re-state your request." };
  }
};

/**
 * Synthesizes a comprehensive meeting summary using Gemini 3 Flash.
 */
export const generateMeetingSummary = async (transcript: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Summary generator is currently restricted.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize a professional executive summary with key decisions and actionable takeaways from the following context: "${transcript}"`,
      config: { temperature: 0.4 }
    });
    return response.text || "No actionable data could be extracted from the current session context.";
  } catch (error) {
    console.error("Gemini Synthesis Error:", error);
    return "Failed to synthesize session recap. Please try again later.";
  }
};