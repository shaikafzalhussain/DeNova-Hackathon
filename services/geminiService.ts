
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysis, Job } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESUME_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Score from 0-100 based on how well the candidate fits the job requirements." },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical strengths found." },
    risk_flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential red flags or missing requirements." },
    role_relevance: { type: Type.STRING, description: "Explanation of relevance to the specific job role." },
    experience_level: { type: Type.STRING, description: "Estimated seniority level." }
  },
  required: ["score", "strengths", "risk_flags", "role_relevance", "experience_level"]
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
};

// Fix: Added analyzeResume for general verification use cases required by CandidateFlow
export const analyzeResume = async (file: File): Promise<ResumeAnalysis> => {
  try {
    const base64Data = await fileToBase64(file);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type || 'application/pdf' } },
            { text: `Analyze this resume. 
              Provide a professional recruitment score and analysis in JSON format, including strengths, risk flags, role relevance, and estimated seniority level.` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_ANALYSIS_SCHEMA,
        systemInstruction: "You are an elite technical recruiter. Analyze candidates for verification purposes. Be critical but fair."
      }
    });

    return JSON.parse(response.text || '{}') as ResumeAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const analyzeResumeForJob = async (file: File, job: Job): Promise<ResumeAnalysis> => {
  try {
    const base64Data = await fileToBase64(file);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type || 'application/pdf' } },
            { text: `Analyze this resume for the following job opening:
              Title: ${job.title}
              Role: ${job.role}
              Description: ${job.description}
              Required Skills: ${job.skills.join(', ')}
              
              Provide a professional recruitment score and analysis in JSON format.` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_ANALYSIS_SCHEMA,
        systemInstruction: "You are an elite technical recruiter. Analyze candidates strictly based on their fitness for a specific job description. Be critical but fair."
      }
    });

    return JSON.parse(response.text || '{}') as ResumeAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
