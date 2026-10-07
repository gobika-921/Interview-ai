import { CodingProblem } from '../types';

export const LOCAL_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    domain: 'General',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices in ascending order.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    starterCode: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
    functionName: 'twoSum',
    testCases: [
      {
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        displayInput: 'nums = [2, 7, 11, 15], target = 9',
        displayOutput: '[0, 1]'
      },
      {
        input: [[3, 2, 4], 6],
        expected: [1, 2],
        displayInput: 'nums = [3, 2, 4], target = 6',
        displayOutput: '[1, 2]'
      },
      {
        input: [[3, 3], 6],
        expected: [0, 1],
        displayInput: 'nums = [3, 3], target = 6',
        displayOutput: '[0, 1]'
      }
    ]
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    domain: 'Web Development',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      }
    ],
    starterCode: `function isPalindrome(s) {
  // Write your solution here
  
}`,
    functionName: 'isPalindrome',
    testCases: [
      {
        input: ['A man, a plan, a canal: Panama'],
        expected: true,
        displayInput: 's = "A man, a plan, a canal: Panama"',
        displayOutput: 'true'
      },
      {
        input: ['race a car'],
        expected: false,
        displayInput: 's = "race a car"',
        displayOutput: 'false'
      },
      {
        input: [' '],
        expected: true,
        displayInput: 's = " "',
        displayOutput: 'true'
      }
    ]
  },
  {
    id: 'reverse-words',
    title: 'Reverse Words in a String',
    difficulty: 'Medium',
    domain: 'Full Stack Developer',
    description: 'Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space, with no leading or trailing spaces.',
    constraints: [
      '1 <= s.length <= 10^4',
      's contains English letters, digits, and spaces.',
      'There is at least one word in s.'
    ],
    examples: [
      {
        input: 's = "the sky is blue"',
        output: '"blue is sky the"',
        explanation: 'The reversed order of words.'
      },
      {
        input: 's = "  hello world  "',
        output: '"world hello"',
        explanation: 'Your reversed string should not contain leading or trailing spaces.'
      }
    ],
    starterCode: `function reverseWords(s) {
  // Write your solution here
  
}`,
    functionName: 'reverseWords',
    testCases: [
      {
        input: ['the sky is blue'],
        expected: 'blue is sky the',
        displayInput: 's = "the sky is blue"',
        displayOutput: '"blue is sky the"'
      },
      {
        input: ['  hello world  '],
        expected: 'world hello',
        displayInput: 's = "  hello world  "',
        displayOutput: '"world hello"'
      },
      {
        input: ['a good   example'],
        expected: 'example good a',
        displayInput: 's = "a good   example"',
        displayOutput: '"example good a"'
      }
    ]
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane\'s)',
    difficulty: 'Medium',
    domain: 'Data Science',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      }
    ],
    starterCode: `function maxSubArray(nums) {
  // Write your solution here
  
}`,
    functionName: 'maxSubArray',
    testCases: [
      {
        input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expected: 6,
        displayInput: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        displayOutput: '6'
      },
      {
        input: [[1]],
        expected: 1,
        displayInput: 'nums = [1]',
        displayOutput: '1'
      },
      {
        input: [[5, 4, -1, 7, 8]],
        expected: 23,
        displayInput: 'nums = [5, 4, -1, 7, 8]',
        displayOutput: '23'
      }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    domain: 'General',
    description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'Matching round brackets.'
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets closed in correct order.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Bracket type mismatch.'
      }
    ],
    starterCode: `function isValid(s) {
  // Write your solution here
  
}`,
    functionName: 'isValid',
    testCases: [
      {
        input: ['()'],
        expected: true,
        displayInput: 's = "()"',
        displayOutput: 'true'
      },
      {
        input: ['()[]{}'],
        expected: true,
        displayInput: 's = "()[]{}"',
        displayOutput: 'true'
      },
      {
        input: ['(]'],
        expected: false,
        displayInput: 's = "(]"',
        displayOutput: 'false'
      }
    ]
  }
];

export function getLocalCodingProblems(): CodingProblem[] {
  return LOCAL_CODING_PROBLEMS;
}

export function getCodingProblemById(id: string): CodingProblem | undefined {
  return LOCAL_CODING_PROBLEMS.find(p => p.id === id);
}

/**
 * Returns exactly 3 diverse coding problems for the Coding Round session.
 */
export function getCodingRoundProblems(preferredDifficulty?: string): CodingProblem[] {
  // Pick 3 problems
  const problems = [...LOCAL_CODING_PROBLEMS];
  // Stable selection: 1 Easy, 1 Medium, 1 Easy/Medium
  const easy = problems.filter(p => p.difficulty === 'Easy');
  const medium = problems.filter(p => p.difficulty === 'Medium');

  const selected: CodingProblem[] = [];
  if (easy.length > 0) selected.push(easy[0]);
  if (medium.length > 0) selected.push(medium[0]);
  if (easy.length > 1) selected.push(easy[1]);
  else if (medium.length > 1) selected.push(medium[1]);
  else selected.push(problems[2]);

  return selected.slice(0, 3);
}

export function getRandomCodingProblem(difficulty?: string): CodingProblem {
  let filtered = LOCAL_CODING_PROBLEMS;
  if (difficulty) {
    const matched = LOCAL_CODING_PROBLEMS.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    if (matched.length > 0) filtered = matched;
  }
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}
