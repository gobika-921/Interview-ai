export interface User {
  uid: string;
  fullName: string;
  email: string;
  experienceLevel: "Fresher" | "Beginner" | "Intermediate" | "Experienced";
  domain: string;
  targetRole: string;
  skills: string[];
  preferredDifficulty: "Easy" | "Medium" | "Hard";
  resumeScore?: number;
  resumeData?: any;
  createdAt: string;
  updatedAt: string;
}

export type UserProfile = User;

export interface AuthUser {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  createdAt?: string;
}

export interface LocalUser {
  uid: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface InterviewFeedback {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary?: string;
}

export interface Interview {
  id: string;
  userId: string;
  type: "aptitude" | "coding" | "technical" | "hr" | "company";
  title?: string;
  company?: string;
  status: "ongoing" | "completed" | "terminated";
  score?: number;
  feedback?: string;
  feedbackData?: InterviewFeedback;
  details?: any;
  createdAt: string;
  completedAt?: string;
}

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
  explanation?: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  constraints: string | string[];
  testCases: { input: string; output: string }[];
  starterCode?: string;
}

export interface CodingTestCase {
  input: any[];
  expected: any;
  displayInput: string;
  displayOutput: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  domain?: string;
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  functionName: string;
  testCases: CodingTestCase[];
}

export interface TechnicalQuestion {
  id: string;
  domain: string;
  category: string;
  question: string;
  expectedConcepts: string[];
  sampleAnswer?: string;
  hint?: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface HRQuestion {
  id: string;
  question: string;
  category: string;
  intent: string;
  idealElements: string[];
  tips?: string;
}

