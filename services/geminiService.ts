
import { GoogleGenAI } from "@google/genai";
import { Resolution } from "../types";

export const generateWallpaper = async (
  prompt: string, 
  aspectRatio: "1:1" | "9:16" | "16:9" = "9:16",
  imageSize: Resolution = "1K"
): Promise<string> => {
  // Always create a new instance to pick up the latest API key from the environment
  // Fix: Use process.env.API_KEY directly without fallbacks or modifications
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `High-resolution, premium smartphone wallpaper: ${prompt}. Cinematic lighting, ultra-detailed, professionally shot.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }

    if (!imageUrl) throw new Error('No image was generated in the response parts.');
    return imageUrl;
  } catch (error: any) {
    console.error('Error generating wallpaper:', error);
    // If request fails with entity not found, it might be an invalid/expired key project
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};
