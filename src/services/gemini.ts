import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  // Analyze Resume
  async analyzeResume(text: string, targetRole: string = "Software Engineer") {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Extract the following details from this resume text:
      Skills, Projects, Internships, Experience, Certifications, Technologies.
      
      Compare the candidate's profile against the Target Role: ${targetRole}.
      
      Also provide:
      - A summary of the candidate's profile.
      - A resume score (0-100) based on suitability for the Target Role.
      - Skill Gap Analysis: Identify missing skills specifically for the Target Role.
      - For each missing skill, suggest 1-2 learning resources or courses (provide names and platforms like Coursera, Udemy, etc.).
      - ATS suggestions.
      - Improvement recommendations.
      
      Resume text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            projects: { type: Type.ARRAY, items: { type: Type.STRING } },
            internships: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: { type: Type.ARRAY, items: { type: Type.STRING } },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            score: { type: Type.NUMBER },
            skillGapAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  gap: { type: Type.STRING },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            atsSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["skills", "score", "summary", "skillGapAnalysis"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  // Generate Aptitude Questions
  async generateAptitudeQuestions(domain: string, difficulty: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 10 aptitude questions for a ${domain} role with ${difficulty} difficulty.
      Include Quantitative, Logical, and Verbal reasoning.
      Return a JSON array of objects with: question, options[], correctAnswerIndex, category.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "category"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  // Generate HR Questions
  async generateHRQuestions(domain: string, skills: string[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 HR interview questions specifically tailored for this candidate profile:
      Domain: ${domain}
      Skills: ${skills.join(', ')}
      
      Questions should cover behavior, situational challenges, and "Why should we hire you?"
      Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  // Generate Coding Problem
  async generateCodingProblem(domain: string, difficulty: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a coding interview problem for a ${domain} role with ${difficulty} difficulty.
      Include title, description, constraints, examples, and starterCode.
      Return a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            examples: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  output: { type: Type.STRING }
                }
              }
            },
            starterCode: { type: Type.STRING }
          },
          required: ["title", "description", "difficulty", "constraints", "examples", "starterCode"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  // Evaluate Answer
  async evaluateAnswer(question: string, answer: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Question: ${question}
      Candidate Answer: ${answer}
      
      Evaluate the answer. Provide a score (0-100) and brief feedback.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  // Evaluate Code
  async evaluateCode(problem: string, code: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Problem: ${problem}
      Candidate Code: ${code}
      
      Evaluate the code for logic, efficiency, and quality. 
      Provide a score (0-100), brief feedback, and complexity (e.g. O(n)).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            complexity: { type: Type.STRING }
          },
          required: ["score", "feedback", "complexity"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
};
