
import { GoogleGenAI, Type } from "@google/genai";
import { DocType, VerificationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function simulateVerification(
  docType: DocType,
  passport: string,
  email: string
): Promise<VerificationResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Simulate a government document verification for a ${docType}. 
      User provided Passport: ${passport} and Email: ${email}. 
      Generate a realistic status (Valid/Invalid) and details. 
      Return purely JSON.`,
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Verification failed", error);
    return {
      status: 'pending',
      documentId: 'ERR-500',
      message: 'System is currently undergoing maintenance. Please try again later.'
    };
  }
}
