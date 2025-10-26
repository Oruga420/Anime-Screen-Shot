
import { GoogleGenAI } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const cleanJsonString = (text: string): string => {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  return match ? match[1] : text;
}

export const identifyAnimeFromImage = async (file: File): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: "Identify the anime shown in this image. Provide only the name of the anime. If you cannot identify it, respond with 'Unknown'." },
        imagePart,
      ]
    }
  });
  
  const animeName = result.text.trim();
  if (animeName.toLowerCase() === 'unknown') {
      throw new Error("Could not identify the anime from the image.");
  }
  return animeName;
};


export const getAnimeDetails = async (animeName: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
For the anime titled "${animeName}", provide the following information based on web searches, including community discussions on Reddit. Please format the output as a single JSON object inside a \`\`\`json markdown block.

The JSON object must have these exact keys:
- "animeName": The official name of the anime.
- "plotSummary": A concise summary of the anime's plot.
- "animeType": An array of strings representing the genres/categories (e.g., ["Isekai", "Shonen", "Adventure"]).
- "streamingPlatformCanada": A string indicating where the show can be streamed in Canada. If multiple, list them separated by commas. If unknown, state "Not found".
- "redditRating": A summary of the community rating or general sentiment from Reddit, presented as a string (e.g., "Highly Recommended", "Mixed Reviews", "Generally Positive").

Do not include any text outside of the JSON markdown block.
`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const cleanedJson = cleanJsonString(result.text);
  try {
    const parsed = JSON.parse(cleanedJson);
    // Basic validation
    if(parsed.animeName && parsed.plotSummary && Array.isArray(parsed.animeType)) {
        return parsed;
    } else {
        throw new Error("Parsed JSON is missing required fields.");
    }
  } catch (error) {
    console.error("Failed to parse JSON from Gemini response:", error);
    console.error("Original response text:", result.text);
    throw new Error("Failed to get valid structured data from the web search.");
  }
};
