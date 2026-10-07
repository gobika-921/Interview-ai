import { Question } from '../types';

/**
 * Local aptitude question bank.
 * Used as fallback when the Gemini API key is not configured or the API call fails.
 * Questions cover Quantitative, Logical, and Verbal reasoning across domains.
 */

export const APTITUDE_QUESTION_BANK: Question[] = [
  // --- Quantitative Reasoning ---
  {
    question: 'If a train travels 360 km in 4 hours, what is its speed in km/h?',
    options: ['80 km/h', '90 km/h', '100 km/h', '120 km/h'],
    correctAnswerIndex: 1,
    category: 'Quantitative',
  },
  {
    question: 'A shopkeeper marks up an item by 25% and then offers a 20% discount. What is the net percentage profit or loss?',
    options: ['0% (no change)', '5% profit', '5% loss', '10% loss'],
    correctAnswerIndex: 0,
    category: 'Quantitative',
  },
  {
    question: 'What is 15% of 480?',
    options: ['62', '68', '72', '78'],
    correctAnswerIndex: 2,
    category: 'Quantitative',
  },
  {
    question: 'Two pipes A and B can fill a tank in 12 hours and 18 hours respectively. In how many hours will both pipes together fill the tank?',
    options: ['6 hours', '7 hours', '7.2 hours', '8 hours'],
    correctAnswerIndex: 2,
    category: 'Quantitative',
  },
  {
    question: 'If the simple interest on a sum of ₹5000 for 3 years at 8% per annum is:',
    options: ['₹1000', '₹1200', '₹1500', '₹1800'],
    correctAnswerIndex: 1,
    category: 'Quantitative',
  },

  // --- Logical Reasoning ---
  {
    question: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '48'],
    correctAnswerIndex: 1,
    category: 'Logical',
  },
  {
    question: 'If all Roses are Flowers, and some Flowers are Red, which conclusion is definitely true?',
    options: [
      'All Roses are Red',
      'Some Roses are Red',
      'All Red things are Flowers',
      'Some Flowers are Roses',
    ],
    correctAnswerIndex: 3,
    category: 'Logical',
  },
  {
    question: 'In a certain code, COMPUTER is written as RFUVQNPC. How is MONITOR written in that code?',
    options: ['RPMTNPM', 'NPOJUPS', 'LMJUPNO', 'RMNUJPS'],
    correctAnswerIndex: 1,
    category: 'Logical',
  },
  {
    question: 'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. How is A related to D?',
    options: ['Grandmother', 'Granddaughter', 'Daughter', 'Great-granddaughter'],
    correctAnswerIndex: 1,
    category: 'Logical',
  },
  {
    question: 'Pointing to a person, a man says "His mother is the only daughter of my mother." How is the man related to the person?',
    options: ['Father', 'Brother', 'Uncle', 'Grandfather'],
    correctAnswerIndex: 0,
    category: 'Logical',
  },

  // --- Verbal Reasoning ---
  {
    question: 'Choose the word that is opposite in meaning to BENEVOLENT:',
    options: ['Kind', 'Generous', 'Malevolent', 'Charitable'],
    correctAnswerIndex: 2,
    category: 'Verbal',
  },
  {
    question: 'Select the correctly spelt word:',
    options: ['Accomodate', 'Accommodate', 'Accomdate', 'Acommodate'],
    correctAnswerIndex: 1,
    category: 'Verbal',
  },
  {
    question: 'Choose the word most similar in meaning to EPHEMERAL:',
    options: ['Permanent', 'Eternal', 'Transient', 'Robust'],
    correctAnswerIndex: 2,
    category: 'Verbal',
  },

  // --- Data Interpretation / Numerical ---
  {
    question: 'If A can do a piece of work in 10 days and B can do it in 15 days, in how many days can they together finish the work?',
    options: ['5 days', '6 days', '8 days', '12 days'],
    correctAnswerIndex: 1,
    category: 'Quantitative',
  },
  {
    question: 'A car depreciates at 10% per year. If its current value is ₹1,00,000, what will it be worth after 2 years?',
    options: ['₹80,000', '₹81,000', '₹82,000', '₹90,000'],
    correctAnswerIndex: 1,
    category: 'Quantitative',
  },

  // --- Technical Aptitude ---
  {
    question: 'What is the time complexity of binary search on a sorted array of n elements?',
    options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
    correctAnswerIndex: 2,
    category: 'Technical Aptitude',
  },
  {
    question: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctAnswerIndex: 1,
    category: 'Technical Aptitude',
  },
  {
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Sequential Query Language',
      'Standard Query Language',
    ],
    correctAnswerIndex: 0,
    category: 'Technical Aptitude',
  },
  {
    question: 'What is the output of: 2 ** 10 in Python?',
    options: ['20', '100', '512', '1024'],
    correctAnswerIndex: 3,
    category: 'Technical Aptitude',
  },
  {
    question: 'Which of the following is NOT a valid HTTP method?',
    options: ['GET', 'POST', 'FETCH', 'DELETE'],
    correctAnswerIndex: 2,
    category: 'Technical Aptitude',
  },
];

/**
 * Returns a shuffled selection of `count` questions from the bank.
 * Domain and difficulty are used for ordering preference if Gemini is unavailable.
 */
export function getLocalAptitudeQuestions(count = 10): Question[] {
  const shuffled = [...APTITUDE_QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
