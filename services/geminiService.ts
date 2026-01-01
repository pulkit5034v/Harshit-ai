
import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio } from "../types";

export const extractImagePrompts = async (text: string, apiKey: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this text and extract a series of distinct, visually interesting scenes or concepts for image generation. 
      For short texts, extract at least 1-2 scenes. For long stories, extract up to 10-15 key moments. 
      Each item should be a detailed visual prompt based on the content.
      
      TEXT: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A visually descriptive prompt extracted from the text."
          }
        },
      },
    });

    const prompts = JSON.parse(response.text || "[]");
    return Array.isArray(prompts) ? prompts : [text.slice(0, 100)];
  } catch (error) {
    console.error("Analysis error:", error);
    // Fallback: Split by sentences if AI analysis fails
    return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  }
};

export const generateSingleImage = async (
  prompt: string, 
  aspectRatio: AspectRatio,
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from API");
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
