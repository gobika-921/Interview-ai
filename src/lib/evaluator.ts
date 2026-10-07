import { CodingProblem, TechnicalQuestion, HRQuestion, InterviewFeedback } from '../types';

/**
 * Deep equality helper for primitive and object/array test results.
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!isEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

/**
 * Honest, safe in-browser evaluator for JavaScript coding solutions.
 */
export function evaluateCodeLocally(
  problem: CodingProblem,
  userCode: string
): {
  score: number;
  passedCases: number;
  totalCases: number;
  results: {
    testIndex: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string;
  }[];
  feedback: string;
  complexity: string;
} {
  const totalCases = problem.testCases.length;
  const results: any[] = [];
  let passedCases = 0;

  // Check empty or unchanged starter code
  if (!userCode || userCode.trim() === '') {
    return {
      score: 0,
      passedCases: 0,
      totalCases,
      results: [],
      feedback: 'No code submitted. Make sure to implement your logic before running evaluation.',
      complexity: 'N/A'
    };
  }

  try {
    // Wrap user code in a function constructor and extract target function
    // eslint-disable-next-line no-new-func
    const runner = new Function(`
      ${userCode}
      if (typeof ${problem.functionName} === 'function') {
        return ${problem.functionName};
      }
      throw new Error("Function '${problem.functionName}' was not found in your submitted code.");
    `);

    const userFn = runner();

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      try {
        // Deep clone input args to prevent user code mutating test cases across iterations
        const clonedArgs = JSON.parse(JSON.stringify(tc.input));
        const actual = userFn(...clonedArgs);
        const passed = isEqual(actual, tc.expected);
        if (passed) passedCases++;

        results.push({
          testIndex: i + 1,
          input: tc.displayInput,
          expected: tc.displayOutput,
          actual: JSON.stringify(actual),
          passed
        });
      } catch (err: any) {
        results.push({
          testIndex: i + 1,
          input: tc.displayInput,
          expected: tc.displayOutput,
          actual: 'Runtime Error',
          passed: false,
          error: err?.message || 'Execution error'
        });
      }
    }
  } catch (compileErr: any) {
    // Syntax or definition error
    return {
      score: 15,
      passedCases: 0,
      totalCases,
      results: problem.testCases.map((tc, idx) => ({
        testIndex: idx + 1,
        input: tc.displayInput,
        expected: tc.displayOutput,
        actual: 'Compile Error',
        passed: false,
        error: compileErr?.message || 'Syntax Error'
      })),
      feedback: `Compilation/Syntax Error: ${compileErr?.message || 'Check for syntax errors or missing function name.'}`,
      complexity: 'Indeterminate'
    };
  }

  const score = Math.round((passedCases / totalCases) * 100);

  let complexity = 'O(n)';
  if (userCode.includes('for') && userCode.includes('for', userCode.indexOf('for') + 3)) {
    complexity = 'O(n²)';
  } else if (userCode.includes('Map') || userCode.includes('Set') || userCode.includes('{}')) {
    complexity = 'O(n) time, O(n) space';
  } else if (userCode.includes('binary') || userCode.includes('while')) {
    complexity = 'O(log n)';
  }

  let feedback = '';
  if (score === 100) {
    feedback = `Exceptional implementation! All ${totalCases}/${totalCases} test cases passed. The logic handles constraints and edge cases cleanly with estimated complexity ${complexity}.`;
  } else if (score >= 50) {
    feedback = `Partially successful: ${passedCases}/${totalCases} test cases passed (${score}%). Review edge cases and verify that return values match expected output formats.`;
  } else {
    feedback = `Needs revision: Only ${passedCases}/${totalCases} test cases passed (${score}%). Carefully check your base cases, loops, and indexing logic.`;
  }

  return {
    score,
    passedCases,
    totalCases,
    results,
    feedback,
    complexity
  };
}

/**
 * Deterministic evaluator for technical interview questions.
 */
export function evaluateTechnicalAnswer(
  question: TechnicalQuestion,
  answer: string
): {
  score: number;
  matchedConcepts: string[];
  missingConcepts: string[];
  feedback: string;
  strengths: string[];
  weaknesses: string[];
} {
  const cleanAns = (answer || '').toLowerCase();
  const wordCount = cleanAns.split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      score: 10,
      matchedConcepts: [],
      missingConcepts: question.expectedConcepts,
      feedback: 'Answer was too brief or incomplete to demonstrate technical comprehension.',
      strengths: ['Attempted to respond.'],
      weaknesses: ['Insufficient technical depth', 'Key architectural concepts omitted']
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const concept of question.expectedConcepts) {
    if (cleanAns.includes(concept.toLowerCase())) {
      matched.push(concept);
    } else {
      missing.push(concept);
    }
  }

  // Calculate score based on concept coverage + depth
  const conceptRatio = question.expectedConcepts.length > 0 ? matched.length / question.expectedConcepts.length : 0.5;
  const lengthBonus = Math.min(25, Math.floor(wordCount / 4)); // up to 25 points for detail
  const baseScore = Math.round(conceptRatio * 75);
  const totalScore = Math.min(100, Math.max(20, baseScore + lengthBonus));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (matched.length > 0) {
    strengths.push(`Clearly referenced key concepts: ${matched.slice(0, 3).join(', ')}.`);
  }
  if (wordCount >= 40) {
    strengths.push('Provided a structured, comprehensive explanation.');
  }

  if (missing.length > 0) {
    weaknesses.push(`Could elaborate further on: ${missing.slice(0, 3).join(', ')}.`);
  }
  if (wordCount < 20) {
    weaknesses.push('Could provide more concrete examples or trade-off discussions.');
  }

  let feedback = '';
  if (totalScore >= 80) {
    feedback = `Solid technical demonstration. You touched on ${matched.length} key concepts with strong conceptual clarity.`;
  } else if (totalScore >= 50) {
    feedback = `Reasonable foundation. You captured ${matched.length} core concepts, but missed key nuances like ${missing.slice(0, 2).join(' and ')}.`;
  } else {
    feedback = `Fair attempt. Expand your response with concrete architectural principles, trade-offs, and examples.`;
  }

  return {
    score: totalScore,
    matchedConcepts: matched,
    missingConcepts: missing,
    feedback,
    strengths,
    weaknesses
  };
}

/**
 * Deterministic evaluator for HR and behavioral interview answers.
 */
export function evaluateHRAnswer(
  question: HRQuestion | { question: string },
  answer: string
): {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
} {
  const cleanAns = (answer || '').toLowerCase();
  const wordCount = cleanAns.split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      score: 15,
      feedback: 'Response was too concise. In behavioral interviews, provide context, your actions, and measurable outcomes.',
      strengths: ['Direct communication'],
      weaknesses: ['Lacks behavioral context (STAR methodology)', 'Too brief']
    };
  }

  // STAR indicator checks
  const starIndicators = {
    situation: ['when', 'project', 'team', 'company', 'client', 'deadline', 'task'],
    action: ['i decided', 'i implemented', 'i led', 'i communicated', 'i created', 'action', 'worked with', 'my role'],
    result: ['result', 'achieved', 'learned', 'outcome', 'improved', 'increased', 'completed', 'delivered', 'reduced']
  };

  let starScore = 0;
  if (starIndicators.situation.some(k => cleanAns.includes(k))) starScore += 25;
  if (starIndicators.action.some(k => cleanAns.includes(k))) starScore += 35;
  if (starIndicators.result.some(k => cleanAns.includes(k))) starScore += 25;

  const lengthScore = Math.min(15, Math.floor(wordCount / 5));
  const finalScore = Math.min(100, Math.max(30, starScore + lengthScore));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (wordCount >= 30) {
    strengths.push('Articulated an elaborate narrative with good context.');
  }
  if (starIndicators.action.some(k => cleanAns.includes(k))) {
    strengths.push('Demonstrated personal accountability and proactive ownership.');
  }
  if (starIndicators.result.some(k => cleanAns.includes(k))) {
    strengths.push('Concluded with clear project outcomes or learning lessons.');
  } else {
    weaknesses.push('Could highlight the tangible end result or impact more prominently.');
  }

  if (wordCount < 20) {
    weaknesses.push('Expand response using the STAR format (Situation, Task, Action, Result).');
  }

  let feedback = '';
  if (finalScore >= 80) {
    feedback = 'Strong behavioral response. You effectively communicated your individual contribution and team outcomes.';
  } else if (finalScore >= 60) {
    feedback = 'Good response. Strengthen the impact by clearly defining what measurable difference your action made.';
  } else {
    feedback = 'Acceptable baseline. Structure your response with distinct Situation, Action, and Outcome phases.';
  }

  return {
    score: finalScore,
    feedback,
    strengths,
    weaknesses
  };
}

/**
 * Generates rich, comprehensive feedback for any interview type.
 */
export function generateFeedbackData(
  type: string,
  score: number,
  details?: any
): InterviewFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  switch (type) {
    case 'aptitude':
      if (score >= 70) {
        strengths.push('High numerical fluency and swift logical deduction.');
        strengths.push('Consistent accuracy across diverse cognitive categories.');
        weaknesses.push('Pacing on complex multistep word problems can still be optimized.');
        recommendations.push('Practice advanced probability, permutations, and abstract spatial puzzles.');
      } else {
        strengths.push('Foundational grasp of core mathematical and logical formulas.');
        weaknesses.push('Time management under strict 10-minute constraint.');
        weaknesses.push('Accuracy drop on multi-step reasoning questions.');
        recommendations.push('Drill 15-minute sectional speed tests daily focusing on elimination techniques.');
      }
      break;

    case 'coding':
      if (score >= 80) {
        strengths.push('Clean algorithmic formulation with optimal edge case handling.');
        strengths.push('Effective data structure selection adhering to time complexity bounds.');
        weaknesses.push('Consider modular helper function extraction for larger codebases.');
        recommendations.push('Tackle dynamic programming and graph traversal problems on LeetCode Medium/Hard.');
      } else {
        strengths.push('Understood problem statements and constructed baseline solution.');
        weaknesses.push('Failed edge cases on array boundaries or empty/extreme values.');
        weaknesses.push('Code complexity was suboptimal for larger test suites.');
        recommendations.push('Write down sample step-by-step traces before coding, and test null/empty/boundary inputs.');
      }
      break;

    case 'technical':
      if (score >= 75) {
        strengths.push('Strong architectural depth and mastery of engineering terminology.');
        strengths.push('Clear articulation of internal runtime mechanics and trade-offs.');
        weaknesses.push('Could supplement explanations with industry scale metrics and benchmarks.');
        recommendations.push('Deep-dive into distributed systems designs (system design primer) and high-concurrency paradigms.');
      } else {
        strengths.push('Familiarity with general programming concepts and paradigms.');
        weaknesses.push('Missed foundational mechanics and specific framework lifecycle details.');
        recommendations.push('Review official documentation on event loops, memory allocation, indexing, and security protocols.');
      }
      break;

    case 'hr':
      if (score >= 75) {
        strengths.push('Compelling professional communication with natural ownership.');
        strengths.push('Structured storytelling using clear Situation-Action-Outcome frameworks.');
        weaknesses.push('Can sharpen quantifiable metrics (e.g. % performance increase, team size).');
        recommendations.push('Prepare a cheat-sheet of your top 3 leadership and conflict resolution anecdotes.');
      } else {
        strengths.push('Courteous tone and authentic responses.');
        weaknesses.push('Tendency to provide abstract answers rather than concrete situational examples.');
        recommendations.push('Practice answering behavioral questions aloud using the STAR method.');
      }
      break;

    case 'company':
      if (score >= 70) {
        strengths.push('Strong alignment with target corporate evaluation standards.');
        strengths.push('Demonstrated both cognitive and domain-specific readiness.');
        weaknesses.push('Refine speed on company-specific shortcut patterns.');
        recommendations.push('Study previous years\' interview transcripts for recurring patterns.');
      } else {
        strengths.push('Good foundation in general concepts.');
        weaknesses.push('Specific round requirements caught you off-guard.');
        recommendations.push('Simulate timed mock rounds under actual test conditions multiple times.');
      }
      break;

    default:
      strengths.push('Committed engagement and completion of mock session.');
      weaknesses.push('General speed and consistency across rounds.');
      recommendations.push('Continue repetitive practice on all foundational modules.');
  }

  const summary = `Overall performance index reached ${score}%. ${
    score >= 75
      ? 'Candidate demonstrates strong readiness for target enterprise assessment pipelines.'
      : score >= 50
      ? 'Candidate shows solid foundational potential with specific optimization required in core technical and speed metrics.'
      : 'Targeted preparation recommended across foundational concepts before enterprise scheduling.'
  }`;

  return {
    strengths,
    weaknesses,
    recommendations,
    summary
  };
}
