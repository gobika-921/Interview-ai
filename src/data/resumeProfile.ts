/**
 * Shared structured resume profile for Gobika Baskaran.
 *
 * This is the SINGLE SOURCE OF TRUTH for resume data used by:
 *  - Resume Analyzer (display, ATS scoring, skill extraction, optimization tips)
 *  - HR Round (question generation based on actual resume content)
 *
 * Do NOT create separate resume datasets in other files.
 * Do NOT invent facts, companies, certifications, or accomplishments not present here.
 */

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ResumePersonal {
  name: string;
  email: string;
  phone: string;
}

export interface ResumeObjective {
  raw: string;
  careerFocus: string;
  careerGoal: string;
  keyFocusAreas: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  duration: string;
  cgpa: string;
  cgpaMax: string;
  coursework: string[];
  activities: string[];
}

export interface ResumeSkillGroup {
  label: string;
  skills: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  details: string[];
  competencies: string[];
}

export interface ATSCriterion {
  id: string;
  label: string;
  met: boolean;
  weight: number;
  feedback: string;
}

export interface ATSAnalysis {
  criteria: ATSCriterion[];
  score: number;
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  positives: string[];
  improvements: string[];
}

export interface OptimizationTip {
  section: string;
  current: string;
  suggestion: string;
}

export interface ResumeProfile {
  personal: ResumePersonal;
  objective: ResumeObjective;
  education: ResumeEducation;
  skillGroups: ResumeSkillGroup[];
  allSkills: string[];
  projects: ResumeProject[];
  strengths: string[];
  atsAnalysis: ATSAnalysis;
  keywordSuggestions: string[];
  optimizationTips: OptimizationTip[];
}

// ─────────────────────────────────────────────
// ATS Criteria (deterministic scoring)
// ─────────────────────────────────────────────

const ATS_CRITERIA: ATSCriterion[] = [
  {
    id: 'section-headings',
    label: 'Clear Section Headings',
    met: true,
    weight: 12,
    feedback: 'Resume has clearly identifiable sections: Objective, Education, Skills, Projects, Activities.'
  },
  {
    id: 'contact-info',
    label: 'Contact Information Present',
    met: true,
    weight: 10,
    feedback: 'Email and phone number are present and accessible.'
  },
  {
    id: 'career-objective',
    label: 'Career Objective Present',
    met: true,
    weight: 8,
    feedback: 'A clear career objective targeting AI/ML internship is stated.'
  },
  {
    id: 'education',
    label: 'Education Section Present',
    met: true,
    weight: 12,
    feedback: 'Institution, duration, and CGPA are clearly listed.'
  },
  {
    id: 'technical-skills',
    label: 'Technical Skills Clearly Listed',
    met: true,
    weight: 14,
    feedback: 'Technical skills including Python, TensorFlow, PyTorch, and ML fundamentals are present.'
  },
  {
    id: 'projects',
    label: 'Projects Section Present',
    met: true,
    weight: 12,
    feedback: 'Two projects are listed with descriptions: Cotton Leaf Disease Detection and Mock Interview Assistance System.'
  },
  {
    id: 'relevant-keywords',
    label: 'Relevant Keywords Present',
    met: true,
    weight: 10,
    feedback: 'Keywords such as Machine Learning, Deep Learning, Python, TensorFlow, PyTorch, and Data Preprocessing are included.'
  },
  {
    id: 'quantifiable-outcomes',
    label: 'Quantifiable Project Outcomes',
    met: false,
    weight: 10,
    feedback: 'Project descriptions lack measurable results such as accuracy percentages or dataset sizes.'
  },
  {
    id: 'action-verbs',
    label: 'Strong Action Verbs in Descriptions',
    met: true,
    weight: 6,
    feedback: 'Descriptions use action-oriented phrasing such as "worked on", "performed", "developed".'
  },
  {
    id: 'consistent-formatting',
    label: 'Consistent Formatting',
    met: true,
    weight: 6,
    feedback: 'Resume formatting appears consistent across sections.'
  },
];

function calculateATSScore(criteria: ATSCriterion[]): number {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const earnedWeight = criteria.filter(c => c.met).reduce((sum, c) => sum + c.weight, 0);
  return Math.round((earnedWeight / totalWeight) * 100);
}

function getATSLabel(score: number): ATSAnalysis['label'] {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Needs Improvement';
}

const atsScore = calculateATSScore(ATS_CRITERIA);

// ─────────────────────────────────────────────
// Shared Resume Profile
// ─────────────────────────────────────────────

export const RESUME_PROFILE: ResumeProfile = {
  personal: {
    name: 'Gobika Baskaran',
    email: 'radhagobika921@gmail.com',
    phone: '7401325584',
  },

  objective: {
    raw: 'Aspiring AI/ML enthusiast with academic project exposure in machine learning and image classification, seeking an internship opportunity to strengthen practical skills in intelligent system development and contribute through continuous learning and analytical thinking.',
    careerFocus: 'AI / Machine Learning',
    careerGoal: 'Internship Opportunity',
    keyFocusAreas: [
      'Machine Learning',
      'Image Classification',
      'Intelligent System Development',
      'Analytical Thinking',
    ],
  },

  education: {
    institution: 'Sri Sairam Institute of Technology – West Tambaram',
    degree: 'B.E. / B.Tech (Engineering)',
    duration: '2024 – 2028',
    cgpa: '9.2',
    cgpaMax: '10',
    coursework: [
      'Data Structures',
      'Database Management Systems',
      'Operating Systems',
      'Python Programming',
    ],
    activities: [
      'Coordinated activities through National Service Scheme (NSS), strengthening teamwork and communication.',
      'Participated in hackathon-based project development focused on practical problem solving.',
      'Participated in a 24-hour hackathon involving AI-oriented solution development.',
    ],
  },

  skillGroups: [
    {
      label: 'Programming',
      skills: ['Python', 'Java (Basic)', 'SQL / Database (Basic)'],
    },
    {
      label: 'Machine Learning / AI',
      skills: [
        'Machine Learning Fundamentals',
        'Deep Learning',
        'TensorFlow',
        'PyTorch',
        'Data Preprocessing',
      ],
    },
    {
      label: 'Tools / Platforms',
      skills: ['Google Colab', 'Kaggle'],
    },
    {
      label: 'Design',
      skills: ['UI/UX'],
    },
  ],

  allSkills: [
    'Python',
    'Java (Basic)',
    'SQL / Database (Basic)',
    'Machine Learning Fundamentals',
    'Deep Learning',
    'TensorFlow',
    'PyTorch',
    'Data Preprocessing',
    'Google Colab',
    'Kaggle',
    'UI/UX',
  ],

  projects: [
    {
      id: 'cotton-leaf',
      title: 'Cotton Leaf Disease Detection using Deep Learning',
      description:
        'Worked on image-based disease classification for cotton leaf conditions. Performed preprocessing, training, validation, and confusion matrix evaluation.',
      details: [
        'Image-based disease classification for cotton leaf conditions',
        'Performed data preprocessing on the dataset',
        'Trained and validated a deep learning classification model',
        'Evaluated model performance using confusion matrix',
      ],
      competencies: [
        'Image Classification',
        'Deep Learning',
        'Data Preprocessing',
        'Model Training',
        'Model Validation',
        'Confusion Matrix Evaluation',
      ],
    },
    {
      id: 'mock-interview',
      title: 'Mock Interview Assistance System',
      description:
        'Developed concept for a beginner-friendly interview support and feedback generation system.',
      details: [
        'Designed to support beginners preparing for technical interviews',
        'Focused on interview support and feedback generation',
        'Problem-solving oriented design approach',
      ],
      competencies: [
        'Interview Assistance',
        'Feedback Generation',
        'Problem Solving',
      ],
    },
  ],

  strengths: [
    'Strong analytical thinking',
    'Fast learner',
    'Good communication skills',
    'Adaptable in team environments',
  ],

  atsAnalysis: {
    criteria: ATS_CRITERIA,
    score: atsScore,
    label: getATSLabel(atsScore),
    positives: [
      'Clear section structure throughout the resume',
      'Relevant technical skills clearly listed (Python, TensorFlow, PyTorch, ML)',
      'Projects are explicitly described with context',
      'Education details are easy to identify',
      'Career objective is present and focused on AI/ML',
      'Contact information is present',
    ],
    improvements: [
      'Add measurable outcomes to project descriptions (e.g., model accuracy, dataset size, validation score).',
      'Use more specific technical keywords where appropriate (e.g., CNN, classification model type).',
      'Make individual project contributions more explicit — clarify your specific role.',
      'Where possible, separate beginner-level skills from stronger working knowledge for precision.',
    ],
  },

  /**
   * These are POTENTIAL keywords to consider — NOT claimed skills.
   * The candidate is NOT stated to know these.
   */
  keywordSuggestions: [
    'Computer Vision',
    'Model Deployment',
    'Feature Engineering',
    'Model Evaluation',
    'Data Visualization',
    'Git / Version Control',
    'REST APIs',
    'NumPy / Pandas',
    'Scikit-learn',
    'Jupyter Notebook',
  ],

  optimizationTips: [
    {
      section: 'Project: Cotton Leaf Disease Detection',
      current: 'Worked on image-based disease classification for cotton leaf conditions.',
      suggestion:
        'Specify the deep learning architecture used (e.g., CNN), the dataset source or size, and include a measurable result such as validation accuracy if available.',
    },
    {
      section: 'Cotton Leaf Project – Model Evaluation',
      current: 'Performed preprocessing, training, validation, and confusion matrix evaluation.',
      suggestion:
        'If you have accuracy, precision, recall, or F1 scores from the confusion matrix evaluation, include them. Quantifiable results dramatically improve ATS ranking and recruiter interest.',
    },
    {
      section: 'Project: Mock Interview Assistance System',
      current: 'Developed concept for beginner-friendly interview support and feedback generation.',
      suggestion:
        'Clarify your specific contribution: Did you design the UI, define the question logic, or prototype the feedback mechanism? Mention any tool or technology used, even if basic.',
    },
    {
      section: 'Skills – Proficiency Clarity',
      current: 'Python, SQL and Database (basic), Java (basic), TensorFlow, PyTorch...',
      suggestion:
        'Group skills by proficiency level to help recruiters and ATS quickly identify your strongest areas. Separate "Proficient: Python, TensorFlow, PyTorch" from "Familiar: Java, SQL".',
    },
    {
      section: 'Hackathon Experience',
      current: 'Participated in a 24-hour hackathon involving AI-oriented solution development.',
      suggestion:
        'Briefly describe what problem you tackled and what solution you built or prototyped. One sentence of context makes this significantly more compelling to recruiters.',
    },
    {
      section: 'Career Objective',
      current: 'Aspiring AI/ML enthusiast with academic project exposure...',
      suggestion:
        'Make the objective more specific by naming the type of role or industry (e.g., "AI/ML intern focused on computer vision or NLP"). Specific objectives perform better with ATS keyword matching.',
    },
  ],
};

// ─────────────────────────────────────────────
// Resume Validation Helpers
// ─────────────────────────────────────────────

/**
 * Text fragments from this resume used for lightweight recognition.
 * If any fragment is found in extracted PDF text, the resume is considered known.
 */
const KNOWN_RESUME_TEXT_FRAGMENTS: string[] = [
  'Gobika',
  'Baskaran',
  'Sri Sairam',
  'Cotton Leaf',
  'Mock Interview Assistance',
  'radhagobika',
];

/**
 * Returns true if extracted PDF text contains recognisable resume fragments.
 * This is a best-effort check — any PDF is allowed through the upload flow.
 */
export function isKnownResumeText(text: string): boolean {
  const lower = text.toLowerCase();
  return KNOWN_RESUME_TEXT_FRAGMENTS.some(frag => lower.includes(frag.toLowerCase()));
}

// ─────────────────────────────────────────────
// Resume-specific HR Questions
// ─────────────────────────────────────────────

/**
 * HR questions generated from the actual resume content.
 * These are imported into hrQuestions.ts and used in HRRound.tsx.
 *
 * RULE: Every question here references only facts that exist in RESUME_PROFILE.
 * Do NOT invent companies, internships, certifications, or numeric results.
 */
import type { HRQuestion } from '../types';

export const RESUME_HR_QUESTIONS: HRQuestion[] = [
  // ── Introduction ─────────────────────────────────────────────────────────
  {
    id: 'resume-hr-intro-1',
    question:
      'Tell me about yourself — your background, your academic journey, and what specifically drew you to AI and machine learning.',
    category: 'Introduction',
    intent: 'Assess self-awareness, communication clarity, and genuine interest in AI/ML.',
    idealElements: [
      'Academic background at Sri Sairam Institute of Technology',
      'Interest in AI/ML and image classification',
      'Mention of projects or learning activities',
      'Future aspirations around internship and intelligent systems',
    ],
    tips: 'Use a Present–Past–Future structure. Connect your coursework and projects to your AI/ML interest.',
  },
  {
    id: 'resume-hr-intro-2',
    question:
      'Your objective mentions you are an aspiring AI/ML enthusiast. What specifically attracted you to this field?',
    category: 'Introduction',
    intent: 'Evaluate depth of interest and motivation behind the career choice.',
    idealElements: [
      'Personal motivation or inspiration',
      'Specific areas of interest within AI/ML (image classification, deep learning)',
      'Connection to academic project work',
    ],
    tips: 'Be specific — connect your answer to real experiences like your Cotton Leaf project or course exposure.',
  },

  // ── Education ────────────────────────────────────────────────────────────
  {
    id: 'resume-hr-edu-1',
    question:
      'You are currently pursuing your degree at Sri Sairam Institute of Technology. Which coursework has been most useful for your AI/ML interests so far?',
    category: 'Education',
    intent: 'Assess how academic learning connects to practical AI/ML skills.',
    idealElements: [
      'Python Programming as foundational skill',
      'Data Structures for algorithmic thinking',
      'DBMS for data handling knowledge',
      'Connection to ML project work',
    ],
    tips: 'Mention specific courses and explain how they enabled you to work on your deep learning project.',
  },
  {
    id: 'resume-hr-edu-2',
    question:
      'You have maintained a CGPA of 9.2 out of 10. How do you balance academic performance with project work and extracurricular activities like NSS?',
    category: 'Education',
    intent: 'Evaluate time management, discipline, and prioritization skills.',
    idealElements: [
      'Structured study habits',
      'Time management approach',
      'Balancing NSS commitments with academics and projects',
    ],
    tips: 'Show that high academic performance and practical project involvement are not in conflict — explain how you manage both.',
  },

  // ── Technical Skills ─────────────────────────────────────────────────────
  {
    id: 'resume-hr-tech-1',
    question:
      'You have listed both TensorFlow and PyTorch in your technical skills. What is your experience with each of these frameworks?',
    category: 'Technical Skills',
    intent: 'Assess the depth and honesty of technical skill self-assessment.',
    idealElements: [
      'Honest description of exposure level',
      'Any specific use within academic or project work',
      'Awareness of the difference between the frameworks',
    ],
    tips: 'Be honest about your level of experience. Mentioning how you used them in coursework or your deep learning project is better than overstating expertise.',
  },
  {
    id: 'resume-hr-tech-2',
    question:
      'Python is one of your listed programming skills. How have you used Python in your academic projects or coursework?',
    category: 'Technical Skills',
    intent: 'Evaluate practical programming experience and project application.',
    idealElements: [
      'Use in deep learning project (Cotton Leaf Detection)',
      'Data preprocessing work',
      'Familiarity with relevant Python libraries',
    ],
    tips: 'Connect Python usage directly to your Cotton Leaf project — mention preprocessing, model building, or evaluation scripts.',
  },
  {
    id: 'resume-hr-tech-3',
    question:
      'You mentioned Google Colab and Kaggle as tools you have used. How have you utilized these platforms in your work?',
    category: 'Technical Skills',
    intent: 'Evaluate hands-on familiarity with standard ML development environments.',
    idealElements: [
      'Using Google Colab for model training and experiments',
      'Kaggle for datasets or learning challenges',
      'Any specific project where these tools were central',
    ],
    tips: 'Describe how Colab or Kaggle supported your Cotton Leaf project specifically — dataset sourcing, training environment, etc.',
  },

  // ── Projects ─────────────────────────────────────────────────────────────
  {
    id: 'resume-hr-project-cotton-1',
    question:
      'Can you explain your Cotton Leaf Disease Detection using Deep Learning project? What was the goal and how did you approach it?',
    category: 'Projects',
    intent: 'Assess project depth, technical understanding, and communication of complex work.',
    idealElements: [
      'Goal: classify cotton leaf disease conditions from images',
      'Approach: data preprocessing, model training, validation',
      'Evaluation: confusion matrix',
      'Deep learning as the core methodology',
    ],
    tips: 'Walk through the project end to end: problem → data → model → evaluation. Be specific about what you did at each step.',
  },
  {
    id: 'resume-hr-project-cotton-2',
    question:
      'What preprocessing steps did you perform in your Cotton Leaf Disease Detection project?',
    category: 'Projects',
    intent: 'Evaluate understanding of data preparation in machine learning pipelines.',
    idealElements: [
      'Data preprocessing as a deliberate step before training',
      'Understanding of why preprocessing matters for model performance',
      'Any specific transformations or cleaning applied to the image data',
    ],
    tips: 'Explain what preprocessing means in the context of image classification — even if your specific steps were standard, show you understand why they matter.',
  },
  {
    id: 'resume-hr-project-cotton-3',
    question:
      'You mentioned using confusion matrix evaluation for your deep learning model. Can you explain what a confusion matrix is and what it told you about your model?',
    category: 'Projects',
    intent: 'Assess conceptual understanding of model evaluation in classification problems.',
    idealElements: [
      'Definition: a table showing predicted vs actual class labels',
      'Metrics derived: accuracy, precision, recall, F1',
      'What it revealed about model performance on cotton leaf classes',
    ],
    tips: 'Explain the concept clearly even if you cannot cite specific numbers. Show that you understand what each cell in the matrix represents.',
  },
  {
    id: 'resume-hr-project-mock-1',
    question:
      'Can you explain the idea behind your Mock Interview Assistance System? What problem were you trying to solve?',
    category: 'Projects',
    intent: 'Assess problem identification skills and motivation behind the project concept.',
    idealElements: [
      'Target audience: beginners preparing for interviews',
      'Problem: lack of structured, beginner-friendly interview practice',
      'Solution concept: support and feedback generation system',
    ],
    tips: 'Focus on the problem you identified and why a beginner-friendly approach specifically was the right solution.',
  },
  {
    id: 'resume-hr-project-mock-2',
    question:
      'What was your specific contribution to the Mock Interview Assistance System?',
    category: 'Projects',
    intent: 'Clarify individual ownership and contribution in the project.',
    idealElements: [
      'Honest description of scope of work',
      'Whether it was a solo or team project',
      'Specific design or conceptual decisions you made',
    ],
    tips: 'Be specific and honest about what you personally did — whether it was system design, the feedback logic, or user interface planning.',
  },

  // ── Hackathon ─────────────────────────────────────────────────────────────
  {
    id: 'resume-hr-hackathon-1',
    question:
      'You mentioned participating in a 24-hour hackathon focused on AI-oriented solution development. What did you learn from that experience?',
    category: 'Hackathon Experience',
    intent: 'Evaluate learning agility, team collaboration, and performance under time pressure.',
    idealElements: [
      'Key skills or insights gained in a fast-paced environment',
      'How you approached problem-solving under time constraints',
      'Teamwork and communication during the hackathon',
    ],
    tips: 'Focus on what you personally learned — technical, collaborative, or problem-solving lessons — rather than just describing the event.',
  },

  // ── Teamwork / NSS ────────────────────────────────────────────────────────
  {
    id: 'resume-hr-nss-1',
    question:
      'You mentioned coordinating activities through the National Service Scheme (NSS). What did that experience teach you about teamwork and communication?',
    category: 'Teamwork',
    intent: 'Assess interpersonal and organizational skills developed through NSS.',
    idealElements: [
      'Coordination and organizational experience',
      'Communication with diverse groups',
      'Lessons about working in a structured team environment',
    ],
    tips: 'Connect the soft skills developed in NSS to how they help you in technical team settings — coordination, communication, and accountability.',
  },

  // ── Strengths ─────────────────────────────────────────────────────────────
  {
    id: 'resume-hr-strength-1',
    question:
      'You describe yourself as a fast learner. Can you give a specific example where you had to learn something new quickly and apply it?',
    category: 'Strengths',
    intent: 'Validate the self-described strength with a concrete example.',
    idealElements: [
      'A specific instance of rapid learning — e.g., a new library, tool, or concept',
      'How you approached the learning challenge',
      'The outcome of applying what you learned',
    ],
    tips: 'Use a concrete example — it could be learning TensorFlow/PyTorch for the Cotton Leaf project or picking up a concept during a hackathon.',
  },
  {
    id: 'resume-hr-strength-2',
    question:
      'You mention strong analytical thinking as one of your strengths. How has analytical thinking helped you in your academic or project work?',
    category: 'Strengths',
    intent: 'Evaluate whether the self-described strength is backed by real examples.',
    idealElements: [
      'A specific situation requiring analysis',
      'How you broke down a complex problem',
      'The result of your analytical approach',
    ],
    tips: 'Reference your deep learning project — debugging model performance, interpreting the confusion matrix, or deciding on a preprocessing approach are all analytical activities.',
  },

  // ── Career Goals ──────────────────────────────────────────────────────────
  {
    id: 'resume-hr-goals-1',
    question:
      'Your objective mentions seeking an internship to strengthen practical AI/ML skills. Where do you see yourself within AI/ML in the next two to three years?',
    category: 'Career Goals',
    intent: 'Gauge ambition, clarity of vision, and realistic career planning.',
    idealElements: [
      'Short-term goal: gain practical experience through internship',
      'Growth into specific AI/ML subdomain (e.g., computer vision, NLP)',
      'Long-term contribution aspiration',
    ],
    tips: 'Be specific about the area of AI/ML you want to deepen — drawing from your image classification project experience is a natural connection.',
  },
  {
    id: 'resume-hr-goals-2',
    question:
      'Why should we consider you for an AI/ML internship, given that you are early in your academic journey?',
    category: 'Career Goals',
    intent: 'Assess confidence, self-awareness, and value proposition.',
    idealElements: [
      'High CGPA demonstrating academic commitment',
      'Relevant project work in deep learning and image classification',
      'Fast learning ability and analytical thinking',
      'NSS and hackathon experience showing initiative beyond academics',
    ],
    tips: 'Do not just list your resume points — explain why these experiences together make you a strong candidate for an internship in AI/ML.',
  },
];
