import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly when initializing the client.
export async function analyzeMaintenanceRequest(description: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following maintenance issue and provide a structured JSON response with: 
      - category (Electrical, Plumbing, HVAC, Carpentry, Masonry, Other)
      - priority (Low, Medium, High)
      - potentialCause (one sentence)
      - requiredTools (array of strings)
      - troubleshootingSteps (array of strings)

      Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            potentialCause: { type: Type.STRING },
            requiredTools: { type: Type.ARRAY, items: { type: Type.STRING } },
            troubleshootingSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["category", "priority", "potentialCause", "requiredTools", "troubleshootingSteps"]
        }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return JSON.stringify({
      category: "Other",
      priority: "Medium",
      potentialCause: "Undetermined",
      requiredTools: [],
      troubleshootingSteps: ["Contact supervisor for detailed assessment."]
    });
  }
}

// Use process.env.API_KEY directly when initializing the client.
export async function getInventoryInsights(materials: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Review this inventory data and provide 3 actionable insights or warnings for a facility manager: 
      ${JSON.stringify(materials)}`,
    });
    return response.text;
  } catch (error) {
    return "Could not generate inventory insights.";
  }
}