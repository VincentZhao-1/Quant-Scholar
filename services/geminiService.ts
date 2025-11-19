import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StructuredAnalysis } from "../types";

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the paper" },
    authors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of authors" },
    journalFit: { type: Type.STRING, description: "Which top journal (e.g., Marketing Science, JMR, AER) does this fit and why?" },
    researchQuestion: { type: Type.STRING, description: "The core research question or puzzle addressed." },
    methodology: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: "e.g., Game Theory, Empirical structural, Reduced form" },
        keyAssumptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Crucial modeling assumptions (e.g. linear demand, uniform distribution)" },
        modelSetup: { type: Type.STRING, description: "Brief description of the players and the game." }
      }
    },
    keyFindings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Main propositions or empirical results." },
    theoreticalContribution: { type: Type.STRING, description: "Explain the theoretical novelty. How does it change our understanding of the market mechanism? Use specific terminology." },
    managerialImplications: { type: Type.STRING, description: "Practical takeaways for firms or policy." },
    critique: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        reviewerPerspective: { type: Type.STRING, description: "Anticipate a critique from a tough reviewer." }
      }
    }
  },
  required: ["title", "researchQuestion", "methodology", "theoreticalContribution", "critique"]
};

export const analyzePaper = async (base64Data: string, mimeType: string): Promise<StructuredAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `You are a distinguished Professor of Quantitative Marketing and Microeconomics. 
            Your student (a 1st year PhD) has uploaded this paper. 
            
            Your task:
            1. Deconstruct this paper rigorously.
            2. Focus heavily on the ANALYTICAL MODEL (Game Theory). Identify the setup, the tension, and the resolution.
            3. Help the student build "taste" by explaining WHY this paper is publishable in a top journal (or why it might struggle).
            4. Extract key model mechanics (utility functions, profit maximization conditions).
            
            Output JSON matching the schema.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2 // Low temperature for factual extraction
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as StructuredAnalysis;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const createChatSession = (base64Data: string, mimeType: string) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are an expert academic mentor in Quantitative Marketing and Economics. 
      You are discussing a specific paper uploaded by the user (context provided in history).
      
      Tone: Encouraging, rigorous, highly technical but explanatory.
      Focus: Game theory, econometrics, identification strategies, and publishing strategy.
      
      When the user asks about an equation or proposition, explain the *intuition* behind the math.
      Use LaTeX formatting for math (wrap in single $ for inline, double $$ for block).
      
      Always encourage the student to think about the "mechanism" driving the results.`,
    },
    history: [
        {
            role: 'user',
            parts: [{
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            { text: "I have read this paper. I am ready to discuss it." }
        ]
        },
        {
            role: 'model',
            parts: [{ text: "Excellent. I have analyzed the paper. What specific part of the model or the empirical strategy would you like to discuss? We can dig into the propositions or the intuition behind the results." }]
        }
    ]
  });
};
