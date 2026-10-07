export const DOMAINS = [
  "Web Development",
  "AI/ML",
  "Cybersecurity",
  "Cloud",
  "Data Science",
  "Java Developer",
  "Python Developer",
  "Full Stack Developer",
  "Mobile App Development"
];

export const EXPERIENCE_LEVELS = [
  "Fresher",
  "Beginner",
  "Intermediate",
  "Experienced"
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const ROUNDS = [
  { id: "aptitude", name: "Aptitude Round", icon: "Brain", path: "/mock/aptitude" },
  { id: "coding", name: "Coding Round", icon: "Code2", path: "/mock/coding" },
  { id: "technical", name: "Technical Round", icon: "Terminal", path: "/mock/technical" },
  { id: "hr", name: "HR Round", icon: "Users", path: "/mock/hr" }
];


export const COMPANIES = [
  { id: "tcs", name: "TCS", type: "Service-based", rounds: ["Aptitude Round", "Coding Round", "Technical Round", "HR Round"] },
  { id: "zoho", name: "Zoho", type: "Product-based", rounds: ["Round 1: Written", "Round 2: Basic Programming", "Round 3: Advanced Programming", "Round 4: Technical HR", "Round 5: General HR"] },
  { id: "accenture", name: "Accenture", type: "Service-based", rounds: ["Cognitive Assessment", "Technical Assessment", "Communication Round", "Interview Round"] },
  { id: "google", name: "Google", type: "Product-based", rounds: ["Phone Screen", "Technical Round 1", "Technical Round 2", "Technical Round 3", "Leadership Round"] },
];

export const STORAGE_KEYS = {
  USERS: 'intervai_users',
  CURRENT_USER: 'intervai_current_user',
  USER_PROFILES: 'intervai_user_profiles',
  INTERVIEWS: 'intervai_interviews',
} as const;

