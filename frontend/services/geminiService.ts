import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Default API key from environment variables
const DEFAULT_API_KEY = import.meta.env.GEMINI_API_KEY;

// This service can use either a provided API key or fall back to the default
const getBotResponse = async (prompt: string, apiKey?: string): Promise<string> => {
    const effectiveApiKey = apiKey || DEFAULT_API_KEY;
    
    if (!effectiveApiKey || effectiveApiKey === 'PLACEHOLDER_API_KEY') {
        console.error("Gemini API key is missing or not configured.");
        return "🤖 Hi there! I'm the Gemini bot, but I need to be configured with a valid API key to work properly.\n\n" +
               "To set me up:\n" +
               "1. Get a Gemini API key from Google AI Studio\n" +
               "2. Add it to your .env.local file as GEMINI_API_KEY\n" +
               "3. Or create a custom bot with your own API key\n\n" +
               "Sorry for the inconvenience! 😊";
    }

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Provide a user-friendly error message in the chat for common issues.
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                 return "Sorry, there seems to be an issue with the API key configuration. Please check the key and try again.";
            }
             if (error.message.includes('fetch')) {
                return "I'm having trouble connecting to the network. Please check your connection and try again.";
            }
        }
        return "Sorry, I encountered an unexpected error. Please try again later.";
    }
};

export const geminiService = {
    getBotResponse,
};