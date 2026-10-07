import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { geminiService } from '../../services/gemini';
import { createInterview } from '../../lib/firestoreUtils';
import { Question } from '../../types';
import { getLocalAptitudeQuestions } from '../../data/aptitudeQuestions';
import { generateFeedbackData } from '../../lib/evaluator';
import {
  Brain,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type GameState = 'info' | 'quiz' | 'result';

export default function AptitudeRound() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('info');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usedLocalQuestions, setUsedLocalQuestions] = useState(false);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeTakenRef = useRef(0);

  // ── Timer management ─────────────────────────────────────────────────────────
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

  // Auto-finish when timer hits 0
  useEffect(() => {
    if (gameState === 'quiz' && timeLeft === 0) {
      finishQuiz(answers, questions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Load questions ────────────────────────────────────────────────────────────
  const startQuiz = async () => {
    setLoading(true);
    setLoadError(null);
    setUsedLocalQuestions(false);

    let loadedQuestions: Question[] = [];
    let usedLocal = false;

    // Try Gemini API first; fall back to local bank on any failure
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
        throw new Error('Gemini API key not configured — using local questions.');
      }
      loadedQuestions = await geminiService.generateAptitudeQuestions(
        userProfile?.domain || 'General',
        userProfile?.preferredDifficulty || 'Medium'
      );
      if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
        throw new Error('Gemini returned empty question list — using local questions.');
      }
    } catch (err: any) {
      console.info('[AptitudeRound] Using local question bank:', err?.message || err);
      loadedQuestions = getLocalAptitudeQuestions(10);
      usedLocal = true;
    }

    if (!loadedQuestions || loadedQuestions.length === 0) {
      setLoadError('Unable to load aptitude questions. Please try again.');
      setLoading(false);
      return;
    }

    // Initialise quiz state
    setQuestions(loadedQuestions);
    setAnswers(new Array(loadedQuestions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setTimeLeft(600);
    setUsedLocalQuestions(usedLocal);
    setLoading(false);
    setGameState('quiz');
    startTimer();
  };

  // ── Answer selection ──────────────────────────────────────────────────────────
  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQuestionIndex] = optionIndex;
      return next;
    });
  };

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      stopTimer();
      finishQuiz(answers, questions);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // ── Scoring & save ────────────────────────────────────────────────────────────
  const finishQuiz = async (finalAnswers: number[], finalQuestions: Question[]) => {
    stopTimer();

    // Calculate score using the final snapshot (avoids stale closure issues)
    let correct = 0;
    finalQuestions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswerIndex) correct++;
    });

    const percentage = finalQuestions.length > 0
      ? Math.round((correct / finalQuestions.length) * 100)
      : 0;

    timeTakenRef.current = 600 - timeLeft;

    setCorrectCount(correct);
    setScore(percentage);
    setGameState('result');

    // Save to localStorage using existing interview system
    const uid = currentUser?.uid || userProfile?.uid;
    if (uid) {
      const feedbackData = generateFeedbackData('aptitude', percentage, {
        correctCount: correct,
        totalQuestions: finalQuestions.length
      });
      try {
        const id = await createInterview({
          userId: uid,
          type: 'aptitude',
          title: 'Aptitude Reasoning Matrix',
          status: 'completed',
          score: percentage,
          feedback: `Aptitude test completed with ${percentage}% score (${correct}/${finalQuestions.length} correct).`,
          feedbackData,
          details: {
            questions: finalQuestions,
            answers: finalAnswers,
            correctCount: correct,
            totalQuestions: finalQuestions.length,
            timeTaken: timeTakenRef.current,
            usedLocalQuestions,
          },
        });
        setSavedInterviewId(id);
      } catch (saveErr) {
        console.error('[AptitudeRound] Failed to save interview result:', saveErr);
      }
    }
  };

  // ── Retry ─────────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    stopTimer();
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(600);
    setLoadError(null);
    setUsedLocalQuestions(false);
    setGameState('info');
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto w-full">
      <AnimatePresence mode="wait">

        {/* ── Info / Start Screen ─────────────────────────────────────── */}
        {gameState === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-12 rounded-[40px] text-center"
          >
            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Brain className="text-indigo-400 w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 text-white">
              Aptitude Awareness Round
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto font-light mb-12">
              This round tests your logical, quantitative and verbal reasoning skills
              {userProfile?.domain ? (
                <> tailored to the <span className="text-indigo-400 font-bold">{userProfile.domain}</span> domain.</>
              ) : '.'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: Clock, label: '10 Minutes', text: 'Timed Test' },
                { icon: Brain, label: '10 Qs', text: 'Mixed Topics' },
                { icon: Trophy, label: '+10 Score', text: 'Per Question' },
                { icon: AlertCircle, label: 'No Negative', text: 'Marking' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <item.icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white block">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.text}</p>
                </div>
              ))}
            </div>

            {loadError && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium text-left">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{loadError}</span>
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={loading}
              id="aptitude-start-btn"
              className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-2 mx-auto uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  LOADING QUESTIONS...
                </>
              ) : (
                <>
                  START TEST NOW
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ── Quiz Screen ─────────────────────────────────────────────── */}
        {gameState === 'quiz' && questions.length > 0 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between glass p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                  <Brain className="text-indigo-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <p className="font-bold text-white uppercase tracking-tight">
                    {questions[currentQuestionIndex]?.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Source badge */}
                {usedLocalQuestions ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <WifiOff className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Offline Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">AI Generated</span>
                  </div>
                )}

                {/* Timer */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
                  <span className={`font-mono font-bold text-sm ${timeLeft < 60 ? 'text-red-500' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question card */}
            <div className="glass p-10 rounded-[40px] border-b-8 border-indigo-600/20">
              <h2 className="text-2xl font-bold leading-tight mb-10 text-white">
                {questions[currentQuestionIndex]?.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestionIndex]?.options.map((option, i) => {
                  const isSelected = answers[currentQuestionIndex] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswerSelect(i)}
                      className={`p-6 text-left rounded-3xl border-2 transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600/10 shadow-lg shadow-indigo-600/10'
                          : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/40'
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {option}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="text-white w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center px-2">
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className="px-8 py-3 bg-slate-900 text-slate-400 font-bold rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs border border-slate-800"
              >
                ← Previous
              </button>

              <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                {answers.filter(a => a !== -1).length} / {questions.length} answered
              </span>

              <button
                onClick={goToNext}
                disabled={answers[currentQuestionIndex] === -1}
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                {currentQuestionIndex === questions.length - 1 ? 'FINISH TEST' : 'NEXT QUESTION'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Result Screen ────────────────────────────────────────────── */}
        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-12 rounded-[40px] text-center"
          >
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <Trophy className="text-emerald-500 w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">
              Test Completed
            </h1>
            <p className="text-slate-400 font-light mb-12">
              Here is how you performed in this round.
            </p>

            {/* Score grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Score</p>
                <p className="text-5xl font-black text-indigo-400">{score}%</p>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Correct</p>
                <p className="text-5xl font-black text-emerald-400">{correctCount}<span className="text-xl text-slate-500">/{questions.length}</span></p>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Time Taken</p>
                <p className="text-5xl font-black text-white">{formatTime(timeTakenRef.current)}</p>
              </div>
            </div>

            {/* Result label */}
            <div className={`mb-8 inline-flex items-center gap-3 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm ${
              score >= 70
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : score >= 50
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {score >= 70 ? '🎯 QUALIFIED' : score >= 50 ? '📈 NEEDS IMPROVEMENT' : '📚 NEEDS PRACTICE'}
            </div>

            {/* Incorrect answers breakdown */}
            {questions.length > 0 && (
              <div className="mb-10 text-left glass rounded-[32px] p-8 space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Incorrect Answers Review
                </h3>
                {questions.map((q, i) => {
                  const userAnswer = answers[i];
                  const isCorrect = userAnswer === q.correctAnswerIndex;
                  if (isCorrect) return null;
                  return (
                    <div key={i} className="p-5 bg-slate-950/60 border border-red-500/10 rounded-2xl space-y-2">
                      <p className="text-sm font-medium text-slate-300">{q.question}</p>
                      <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <span className="text-red-400 font-bold">
                          Your answer: {userAnswer === -1 ? 'Not answered' : q.options[userAnswer]}
                        </span>
                        <span className="text-slate-600 hidden sm:block">•</span>
                        <span className="text-emerald-400 font-bold">
                          Correct: {q.options[q.correctAnswerIndex]}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {questions.every((q, i) => answers[i] === q.correctAnswerIndex) && (
                  <p className="text-emerald-400 font-bold text-sm text-center">🎉 All answers correct!</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-8 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-800 text-sm tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> RETRY TEST
              </button>
              {savedInterviewId && (
                <button
                  onClick={() => navigate(`/feedback/${savedInterviewId}`)}
                  className="px-8 py-5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 text-sm tracking-widest"
                >
                  <FileText className="w-4 h-4" /> VIEW FULL FEEDBACK
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 text-sm tracking-widest"
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
