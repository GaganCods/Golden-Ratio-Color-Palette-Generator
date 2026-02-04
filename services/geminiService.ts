import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: We create the instance per request in the component if we need to handle key updates, 
// but for the service helper we can use a factory or pass the key.
// To adhere to guidelines, we assume process.env.API_KEY is available or handled by the caller if we were building a full key picker.
// Here we will just use the env.

const getAI = () => new GoogleGenAI({ apiKey });

export const generatePaletteFromText = async (prompt: string): Promise<string[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a color palette of 5-7 hex codes based on this description: "${prompt}". Return ONLY a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text || "[]";
    const colors = JSON.parse(text);
    return Array.isArray(colors) ? colors.slice(0, 9) : [];
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
};

export const extractColorsFromImage = async (base64Image: string): Promise<string[]> => {
  const ai = getAI();
  try {
    // Remove header if present (data:image/...)
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming png/jpeg for simplicity, strict checking can be added
              data: cleanBase64
            }
          },
          {
            text: "Extract the dominant 5 to 7 colors from this image as HEX codes. Return ONLY a JSON array of strings."
          }
        ]
      },
      // Note: responseSchema/MimeType might not be fully supported on vision models in all regions yet, 
      // but standard text prompting works well for JSON output.
    });

    // Try to parse JSON from the text, handling potential markdown wrappers
    let text = response.text || "[]";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find array in text if extra text exists
    const match = text.match(/\[.*\]/s);
    if (match) {
        text = match[0];
    }

    const colors = JSON.parse(text);
    return Array.isArray(colors) ? colors.slice(0, 9) : [];
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return [];
  }
};
