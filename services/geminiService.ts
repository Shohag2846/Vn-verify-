
import { GoogleGenAI, Type } from "@google/genai";
import { DocType, VerificationResult } from "../types";

export async function simulateVerification(
  docType: DocType,
  passport: string,
  email: string
): Promise<VerificationResult> {
  // Always use {apiKey: process.env.API_KEY} as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Simulate an official Vietnamese government document verification for a ${docType}. 
      The user provided Passport Number: ${passport} and registered Email: ${email}. 
      Generate a realistic verification result. 
      The status must be one of: 'valid', 'invalid', or 'pending'.
      Return the response strictly as a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "valid, invalid, or pending" },
            documentId: { type: Type.STRING },
            ownerName: { type: Type.STRING },
            issueDate: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["status", "documentId", "message"]
        }
      }
    });

    let jsonStr = response.text.trim();
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Verification simulation failed", error);
    throw error; // Let the component handle the fallback
  }
}
