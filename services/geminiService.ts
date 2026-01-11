import { GoogleGenAI } from "@google/genai";

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry logic with exponential backoff
const retryWithBackoff = async <T>(operation: () => Promise<T>, retries = 2, baseDelay = 1000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    await delay(baseDelay);
    return retryWithBackoff(operation, retries - 1, baseDelay * 2);
  }
};

const handleApiError = (error: any): never => {
  console.error("Gemini API Error:", error);
  const msg = error.message || error.toString();
  if (msg.includes('429')) throw new Error("API 调用频率过高，请稍后重试。");
  if (msg.includes('400')) throw new Error("请求参数无效或被拦截。");
  throw new Error(msg);
};

const getClient = (apiKey?: string) => {
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("Missing API Key. Please configure it in settings or environment.");
    return new GoogleGenAI({ apiKey: key });
};

export const generateJSON = async <T>(prompt: string, schema: any, apiKey?: string, modelName: string = 'gemini-2.5-flash'): Promise<T> => {
  try {
    return await retryWithBackoff(async () => {
        const ai = getClient(apiKey);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        
        let text = response.text || '{}';
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        return JSON.parse(text) as T;
    });
  } catch (error: any) {
    handleApiError(error);
    return {} as T;
  }
};

export const generateText = async (prompt: string, modelName: string = 'gemini-2.5-flash', apiKey?: string): Promise<string> => {
    try {
        return await retryWithBackoff(async () => {
            const ai = getClient(apiKey);
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt
            });
            return response.text || '';
        });
    } catch (error: any) {
        handleApiError(error);
        return '';
    }
};

export const generateImage = async (prompt: string, apiKey?: string, modelName: string = 'gemini-2.5-flash-image'): Promise<string> => {
    try {
        const ai = getClient(apiKey);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [{ text: prompt }]
            },
            // Note: responseMimeType and responseSchema are not supported for image models
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image generated in response");
    } catch (error: any) {
        handleApiError(error);
        return '';
    }
};