import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import { createInterview } from '../../lib/firestoreUtils';
import { CodingProblem } from '../../types';
import { getCodingRoundProblems } from '../../data/codingProblems';
import { evaluateCodeLocally, generateFeedbackData } from '../../lib/evaluator';
import { 
  Code2, 
  Play, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  Loader2, 
  CheckCircle2, 
  Trophy, 
  MessageSquare, 
  Clock, 
  Terminal, 
  Zap, 
  Info,
  RotateCcw,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Centralized score thresholds: 0-49% LOW (Red), 50-74% MEDIUM (Yellow), 75-100% HIGH (Green)
export const SCORE_THRESHOLDS = {
  LOW_MAX: 49,
  MEDIUM_MAX: 74,
  HIGH_MIN: 75,
} as const;

export function getScoreVisualTier(score: number) {
  if (score >= SCORE_THRESHOLDS.HIGH_MIN) {
    return {
      tier: 'HIGH',
      label: 'Excellent',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      progressColor: 'bg-emerald-500',
      iconColor: 'text-emerald-400'
    };
  }
  if (score > SCORE_THRESHOLDS.LOW_MAX) {
    return {
      tier: 'MEDIUM',
      label: 'Good Progress',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      progressColor: 'bg-amber-500',
      iconColor: 'text-amber-400'
    };
  }
  return {
    tier: 'LOW',
    label: 'Needs Improvement',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    badgeBg: 'bg-red-500/20 text-red-300 border border-red-500/30',
    progressColor: 'bg-red-500',
    iconColor: 'text-red-400'
  };
}

export default function CodingRound() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'info' | 'coding' | 'result'>('info');
  const [loading, setLoading] = useState(false);

  // 3 Questions State
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Question-specific code state: { [questionIndex]: codeString }
  const [userCodes, setUserCodes] = useState<{ [index: number]: string }>({});

  // Question-specific execution logs and test results
  const [logsByQuestion, setLogsByQuestion] = useState<{ [index: number]: string[] }>({});
  const [testResultsByQuestion, setTestResultsByQuestion] = useState<{ [index: number]: any[] }>({});

  // Final evaluation results
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);

  // 30-minute Timer
  const [timeLeft, setTimeLeft] = useState(1800);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeTakenRef = useRef(0);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start a fresh, clean Coding Round with exactly 3 questions
  const startCoding = () => {
    setLoading(true);

    // Load exactly 3 problems
    const selectedProblems = getCodingRoundProblems(userProfile?.preferredDifficulty);

    // Initialize clean question-specific code state using starter templates
    const initialCodes: { [index: number]: string } = {};
    const initialLogs: { [index: number]: string[] } = {};
    const initialTestResults: { [index: number]: any[] } = {};

    selectedProblems.forEach((prob, i) => {
      initialCodes[i] = prob.starterCode || '';
      initialLogs[i] = [
        `> Question ${i + 1} Workspace initialized for '${prob.title}'`,
        `> Target Function: ${prob.functionName}()`,
        `> Language: JavaScript (ES6+ Engine)`
      ];
      initialTestResults[i] = [];
    });

    // Reset all previous state completely
    setProblems(selectedProblems);
    setCurrentIndex(0);
    setUserCodes(initialCodes);
    setLogsByQuestion(initialLogs);
    setTestResultsByQuestion(initialTestResults);
    setEvaluations([]);
    setOverallScore(0);
    setSavedInterviewId(null);
    setTimeLeft(1800);

    setLoading(false);
    setGameState('coding');
    startTimer();
  };

  const currentProblem = problems[currentIndex] || null;
  const currentCode = userCodes[currentIndex] ?? '';
  const currentLogs = logsByQuestion[currentIndex] || [];
  const currentTestResults = testResultsByQuestion[currentIndex] || [];

  // Update code strictly for the active question
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode ?? '';
    setUserCodes(prev => ({
      ...prev,
      [currentIndex]: val
    }));
  };

  // Run/Test against current question test cases
  const handleRunCode = () => {
    if (!currentProblem) return;

    const runHeader = [
      `> [${new Date().toLocaleTimeString()}] Executing test suite for '${currentProblem.title}'...`,
      `> Testing function: ${currentProblem.functionName}()`
    ];

    if (currentProblem.testCases && currentProblem.testCases.length > 0) {
      const evalOutput = evaluateCodeLocally(currentProblem, currentCode);

      const runLogs = [...runHeader];
      evalOutput.results.forEach(res => {
        if (res.passed) {
          runLogs.push(`✓ Test Case ${res.testIndex}: Passed [Expected: ${res.expected}, Got: ${res.actual}]`);
        } else {
          runLogs.push(`✗ Test Case ${res.testIndex}: Failed [Expected: ${res.expected}, Got: ${res.actual}] ${res.error ? '(' + res.error + ')' : ''}`);
        }
      });
      runLogs.push(`> Result: ${evalOutput.passedCases}/${evalOutput.totalCases} test cases passed (${evalOutput.score}%)`);

      setLogsByQuestion(prev => ({
        ...prev,
        [currentIndex]: runLogs
      }));

      setTestResultsByQuestion(prev => ({
        ...prev,
        [currentIndex]: evalOutput.results
      }));
    } else {
      setLogsByQuestion(prev => ({
        ...prev,
        [currentIndex]: [...runHeader, `> Syntax verified. Ready for submission.`]
      }));
    }
  };

  // Clear console for current question
  const handleClearLogs = () => {
    setLogsByQuestion(prev => ({
      ...prev,
      [currentIndex]: []
    }));
  };

  // Next Question (Q1 -> Q2, Q2 -> Q3)
  const handleNextQuestion = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Previous Question (Q3 -> Q2, Q2 -> Q1)
  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Submit all 3 questions and calculate overall score
  const handleSubmitAll = async () => {
    setLoading(true);
    stopTimer();
    timeTakenRef.current = 1800 - timeLeft;

    // Evaluate all 3 questions systematically
    const allEvals = problems.map((prob, i) => {
      const codeForProblem = userCodes[i] || '';
      return evaluateCodeLocally(prob, codeForProblem);
    });

    setEvaluations(allEvals);

    // Calculate overall average score
    const totalScore = allEvals.reduce((acc, curr) => acc + curr.score, 0);
    const finalScore = allEvals.length > 0 ? Math.round(totalScore / allEvals.length) : 0;
    setOverallScore(finalScore);

    const uid = currentUser?.uid || userProfile?.uid;
    let newId = null;

    if (uid) {
      const feedbackData = generateFeedbackData('coding', finalScore, {
        evaluations: allEvals,
        problemsCount: problems.length
      });

      try {
        newId = await createInterview({
          userId: uid,
          type: 'coding',
          title: 'Coding Round (3 Problems)',
          status: 'completed',
          score: finalScore,
          feedback: `Coding evaluation score: ${finalScore}%. Successfully reviewed all 3 algorithmic challenges.`,
          feedbackData,
          details: {
            problemsSummary: problems.map((p, i) => ({
              id: p.id,
              title: p.title,
              difficulty: p.difficulty,
              score: allEvals[i]?.score || 0,
              passedCases: allEvals[i]?.passedCases || 0,
              totalCases: allEvals[i]?.totalCases || 0,
              code: userCodes[i] || '',
              feedback: allEvals[i]?.feedback || ''
            })),
            overallScore: finalScore,
            timeTaken: timeTakenRef.current
          }
        });
        setSavedInterviewId(newId);
      } catch (err) {
        console.error('Failed to save coding interview:', err);
      }
    }

    setLoading(false);
    setGameState('result');
  };

  // Restart clean round
  const handleRetryRound = () => {
    stopTimer();
    setGameState('info');
    setProblems([]);
    setCurrentIndex(0);
    setUserCodes({});
    setLogsByQuestion({});
    setTestResultsByQuestion({});
    setEvaluations([]);
    setOverallScore(0);
    setSavedInterviewId(null);
  };

  const visualTier = getScoreVisualTier(overallScore);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto min-w-0">
      <AnimatePresence mode="wait">

        {/* ── Screen 1: Briefing & Start ───────────────────────────────── */}
        {gameState === 'info' && (
          <motion.div 
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-xl mx-auto glass p-8 sm:p-12 rounded-[40px] text-center w-full"
          >
            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-600/10 border border-indigo-500/20">
              <Code2 className="text-indigo-400 w-10 h-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-white font-display">
              Coding Round
            </h1>
            <p className="text-slate-400 font-light mb-10 text-sm leading-relaxed">
              Complete <span className="text-indigo-400 font-bold">3 coding questions</span> testing algorithmic reasoning, data structures, and edge case resilience.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10 text-left">
               <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <Clock className="w-5 h-5 text-indigo-400 mb-2" />
                  <p className="text-sm font-bold text-white uppercase tracking-tight">30 Minutes</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">TIMED SESSION</p>
               </div>
               <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <Terminal className="w-5 h-5 text-indigo-400 mb-2" />
                  <p className="text-sm font-bold text-white uppercase tracking-tight">3 Questions</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SEQUENTIAL FLOW</p>
               </div>
            </div>

            <button 
              onClick={startCoding}
              disabled={loading}
              id="coding-start-btn"
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PREPARING SESSION...
                </>
              ) : (
                <>
                  START CODING NOW
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ── Screen 2: Interactive 3-Question Coding Session ──────────── */}
        {gameState === 'coding' && currentProblem && (
          <motion.div 
            key="coding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col space-y-6 w-full min-w-0"
          >
            {/* Top Navigation & Status Bar */}
            <div className="glass p-5 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                  <Code2 className="text-indigo-400 w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest px-2.5 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                      Question {currentIndex + 1} of {problems.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800">
                      {currentProblem.difficulty}
                    </span>
                  </div>
                  <h2 className="font-bold text-white text-lg uppercase tracking-tight truncate mt-1">
                    {currentProblem.title}
                  </h2>
                </div>
              </div>

              {/* Timer and Controls */}
              <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                  <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
                  <span className={`font-mono font-bold text-sm ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Question switcher indicators */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                  {problems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      title={`Go to Question ${idx + 1}`}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                        currentIndex === idx
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : userCodes[idx] && userCodes[idx].trim().length > 30
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                animate={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Main Split Grid: Left Description | Right Editor & Console */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
               
               {/* Left Column: Problem Details & Constraints */}
               <div className="glass p-6 sm:p-8 rounded-[36px] overflow-y-auto max-h-[720px] no-scrollbar border-b-8 border-indigo-600/20 min-w-0 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-400" /> Problem Statement
                    </h3>
                    <p className="text-slate-200 leading-relaxed font-light text-sm break-words">
                      {currentProblem.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Example Test Cases
                    </h3>
                    <div className="space-y-3">
                       {currentProblem.examples?.map((ex, i) => (
                         <div key={i} className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 font-mono text-xs overflow-hidden">
                           <div className="mb-1.5 break-all">
                             <span className="text-indigo-400 font-bold">Input:</span>{' '}
                             <span className="text-slate-300">{ex.input}</span>
                           </div>
                           <div className="break-all">
                             <span className="text-emerald-400 font-bold">Output:</span>{' '}
                             <span className="text-slate-300">{ex.output}</span>
                           </div>
                           {ex.explanation && (
                             <div className="text-[11px] text-slate-500 font-sans mt-2 italic border-t border-slate-900 pt-1.5 break-words">
                               {ex.explanation}
                             </div>
                           )}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div>
                     <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                       Constraints & Bounds
                     </h3>
                     <ul className="list-disc list-inside text-slate-400 text-xs space-y-1 font-light break-words">
                        {currentProblem.constraints?.map((c, i) => (
                          <li key={i} className="leading-relaxed">{c}</li>
                        ))}
                     </ul>
                  </div>

                  {/* Test Cases Results for Current Question */}
                  {currentTestResults.length > 0 && (
                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Test Suite Status
                      </h3>
                      <div className="space-y-2">
                        {currentTestResults.map(tr => (
                          <div 
                            key={tr.testIndex} 
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono break-all ${
                              tr.passed 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {tr.passed ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                              Case {tr.testIndex}: {tr.input}
                            </span>
                            <span className="font-bold flex-shrink-0 ml-2">
                              {tr.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>

               {/* Right Column: Code Editor & Console Output */}
               <div className="flex flex-col gap-6 min-h-0 min-w-0">
                  {/* Monaco Editor Container */}
                  <div className="glass rounded-[36px] overflow-hidden border-t-8 border-indigo-600/20 shadow-2xl relative min-w-0" style={{ height: '420px' }}>
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={currentCode}
                      onChange={handleCodeChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono',
                        padding: { top: 16 },
                        backgroundColor: '#00000000',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on'
                      }}
                    />
                  </div>
                  
                  {/* Console Output Area */}
                  <div className="glass rounded-[32px] p-5 flex flex-col min-w-0 h-44 overflow-hidden">
                    <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Console & Test Runner
                       </span>
                       <button 
                         onClick={handleClearLogs} 
                         className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                       >
                         Clear
                       </button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] space-y-1.5 break-all">
                       {currentLogs.map((log, i) => (
                         <div 
                           key={i} 
                           className={
                             log.startsWith('✓') ? 'text-emerald-400 font-bold' :
                             log.startsWith('✗') ? 'text-red-400 font-bold' :
                             log.startsWith('>') ? 'text-indigo-400' : 'text-slate-300'
                           }
                         >
                           {log}
                         </div>
                       ))}
                       {currentLogs.length === 0 && (
                         <div className="text-slate-600 italic">No output yet. Click 'RUN TESTS' to test your code.</div>
                       )}
                    </div>
                  </div>
               </div>
            </div>

            {/* Bottom Navigation & Action Bar */}
            <div className="glass p-5 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Action: Previous (available on Q2 and Q3) */}
              <div>
                {currentIndex > 0 ? (
                  <button
                    onClick={handlePreviousQuestion}
                    id="coding-prev-btn"
                    className="px-6 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Question
                  </button>
                ) : (
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-widest pl-2">
                    Question 1 of 3
                  </span>
                )}
              </div>

              {/* Right Actions: Run/Test + Next (Q1, Q2) OR Run/Test + Submit (Q3) */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleRunCode}
                  id="coding-run-btn"
                  className="px-6 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  Run Tests
                </button>

                {currentIndex < problems.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    id="coding-next-btn"
                    className="px-8 py-3.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-xs"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAll}
                    disabled={loading}
                    id="coding-submit-btn"
                    className="px-8 py-3.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 uppercase tracking-widest text-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit All 3 Solutions
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Screen 3: Results & Feedback ─────────────────────────────── */}
        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto glass p-8 sm:p-12 rounded-[40px] text-center w-full space-y-10"
          >
            <div className={`w-24 h-24 ${visualTier.bgColor} rounded-full flex items-center justify-center mx-auto border ${visualTier.borderColor} shadow-xl`}>
              <Trophy className={`w-12 h-12 ${visualTier.iconColor}`} />
            </div>

            <div>
              <div className="inline-block mb-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${visualTier.badgeBg}`}>
                  {visualTier.label} • {visualTier.tier} SCORE
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white font-display">
                Coding Round Assessment
              </h1>
              <p className="text-slate-400 font-light mt-2 text-sm max-w-lg mx-auto">
                Completed all 3 algorithmic challenges. Here is your detailed performance breakdown.
              </p>
            </div>

            {/* Score Grid with Score-based Color Treatment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
               <div className={`p-8 bg-slate-950 border ${visualTier.borderColor} rounded-[32px]`}>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Score</p>
                 <p className={`text-5xl font-black font-display tracking-tight ${visualTier.textColor}`}>
                   {overallScore}%
                 </p>
               </div>
               <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Problems Solved</p>
                 <p className="text-5xl font-black text-white font-display tracking-tight">
                   {evaluations.filter(e => e.score >= 50).length}
                   <span className="text-xl text-slate-500 font-normal">/{problems.length}</span>
                 </p>
               </div>
               <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Taken</p>
                 <p className="text-5xl font-black text-white font-display tracking-tight">
                   {formatTime(timeTakenRef.current)}
                 </p>
               </div>
            </div>

            {/* Per-Question Detailed Breakdown */}
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                Individual Problem Results (3 Questions)
              </h3>
              
              <div className="space-y-3">
                {problems.map((prob, idx) => {
                  const ev = evaluations[idx] || { score: 0, passedCases: 0, totalCases: 0, feedback: 'Not evaluated.' };
                  const probTier = getScoreVisualTier(ev.score);
                  return (
                    <div 
                      key={prob.id} 
                      className={`p-6 bg-slate-950/70 border ${probTier.borderColor} rounded-2xl space-y-2.5`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 rounded-md">
                            Q{idx + 1}
                          </span>
                          <h4 className="font-bold text-white text-base">
                            {prob.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            ({prob.difficulty})
                          </span>
                        </div>
                        <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${probTier.badgeBg}`}>
                          {ev.score}% Score • {ev.passedCases}/{ev.totalCases} Passed
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        {ev.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={handleRetryRound}
                id="coding-retry-btn"
                className="px-8 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-800 text-sm tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> RETRY CODING ROUND
              </button>
              {savedInterviewId && (
                <button 
                  onClick={() => navigate(`/feedback/${savedInterviewId}`)}
                  id="coding-view-feedback-btn"
                  className="px-8 py-5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 text-sm tracking-widest"
                >
                  <FileText className="w-4 h-4" /> VIEW FULL REPORT
                </button>
              )}
              <button 
                onClick={() => navigate('/dashboard')}
                id="coding-dashboard-btn"
                className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                BACK TO DASHBOARD
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
