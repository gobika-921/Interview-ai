import { HRQuestion } from '../types';

export const LOCAL_HR_QUESTIONS: HRQuestion[] = [
  {
    id: 'hr-1',
    question: 'Tell me about yourself, your background, and what drives your passion for technology.',
    category: 'Introduction & Background',
    intent: 'Assess clarity of communication, career trajectory, enthusiasm, and self-awareness.',
    idealElements: ['education or career foundation', 'key projects or accomplishments', 'technical passion', 'future aspirations'],
    tips: 'Use the Present-Past-Future structure to keep your answer structured and impactful.'
  },
  {
    id: 'hr-2',
    question: 'Describe a situation where you encountered a major obstacle or tight deadline in a project. How did you handle it?',
    category: 'Problem Solving & Resilience',
    intent: 'Evaluate problem-solving under stress, prioritization, and resilience.',
    idealElements: ['situation context', 'specific actions taken', 'stakeholder communication', 'positive quantifiable outcome'],
    tips: 'Apply the STAR technique (Situation, Task, Action, Result).'
  },
  {
    id: 'hr-3',
    question: 'Tell me about a time when you disagreed with a teammate or lead on a technical approach. How did you resolve the conflict?',
    category: 'Collaboration & Conflict Resolution',
    intent: 'Measure interpersonal diplomacy, receptive listening, and team-first orientation.',
    idealElements: ['respectful listening', 'data-driven reasoning', 'compromise/consensus', 'team unity'],
    tips: 'Focus on how you separated ideas from egos and reached an objective agreement.'
  },
  {
    id: 'hr-4',
    question: 'Why do you want to join our organization specifically, and how do you envision contributing to our engineering goals?',
    category: 'Culture Fit & Motivation',
    intent: 'Assess genuine motivation, research about the company values, and alignment with mission.',
    idealElements: ['company products/impact', 'matching values', 'skills match', 'long-term vision'],
    tips: 'Connect your personal growth with the value you bring to the team.'
  },
  {
    id: 'hr-5',
    question: 'Tell me about a time you made a mistake or experienced failure in your work. What did you learn from it?',
    category: 'Accountability & Growth Mindset',
    intent: 'Evaluate honesty, accountability, blameless reflection, and continuous learning.',
    idealElements: ['owning the mistake', 'immediate mitigation', 'root cause analysis', 'preventative systems implemented'],
    tips: 'Show that failure was converted into lasting institutional wisdom or personal growth.'
  },
  {
    id: 'hr-6',
    question: 'Where do you see yourself professionally in the next 3 to 5 years?',
    category: 'Career Vision',
    intent: 'Gauge ambition, stability, and realistic career planning.',
    idealElements: ['mastery of engineering craft', 'mentorship or leadership', 'business impact', 'adaptability'],
    tips: 'Show ambition alongside a commitment to mastering your current discipline.'
  }
];

export function getLocalHRQuestions(count: number = 4): HRQuestion[] {
  const shuffled = [...LOCAL_HR_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
