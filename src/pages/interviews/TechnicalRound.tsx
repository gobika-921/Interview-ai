import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createInterview } from '../../lib/firestoreUtils';
import { getLocalTechnicalQuestions } from '../../data/technicalQuestions';
import { evaluateTechnicalAnswer, generateFeedbackData } from '../../lib/evaluator';
import { TechnicalQuestion } from '../../types';
import { 
  Terminal, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  ArrowRight, 
  RotateCcw, 
  WifiOff, 
  Lightbulb, 
  Code2, 
  MessageSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type GameState = 'info' | 'interview' | 'result';

export default function TechnicalRound() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('info');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
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

  const startInterview = () => {
    setLoading(true);
    const domain = userProfile?.domain || 'Web Development';
    const loaded = getLocalTechnicalQuestions(domain, 5);

    setQuestions(loaded);
    setAnswers(new Array(loaded.length).fill(''));
    setCurrentIndex(0);
    setTimeLeft(900);
    setShowHint(false);
    setLoading(false);
    setGameState('interview');
    startTimer();
  };

  const handleAnswerChange = (val: string) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = val;
      return next;
    });
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      finishInterview();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowHint(false);
    }
  };

  const finishInterview = async () => {
    stopTimer();
    timeTakenRef.current = 900 - timeLeft;

    const evals = questions.map((q, i) => {
      return evaluateTechnicalAnswer(q, answers[i] || '');
    });

    setEvaluations(evals);

    const totalScore = evals.reduce((sum, item) => sum + item.score, 0);
    const avgScore = evals.length > 0 ? Math.round(totalScore / evals.length) : 0;
    setScore(avgScore);

    const uid = currentUser?.uid || userProfile?.uid;
    if (uid) {
      const feedbackData = generateFeedbackData('technical', avgScore, { evaluations: evals });
      try {
        const id = await createInterview({
          userId: uid,
          type: 'technical',
          title: `Technical Round: ${userProfile?.domain || 'Core Systems'}`,
          status: 'completed',
          score: avgScore,
          feedback: `Technical competency evaluated at ${avgScore}%. Handled ${questions.length} core architectural concepts.`,
          feedbackData,
          details: {
            domain: userProfile?.domain || 'General',
            questions,
            answers,
            evaluations: evals,
            timeTaken: timeTakenRef.current
          }
        });
        setSavedInterviewId(id);
      } catch (err) {
        console.error('Failed to save technical interview:', err);
      }
    }

    setGameState('result');
  };

  const handleRetry = () => {
    stopTimer();
    setQuestions([]);
    setAnswers([]);
    setEvaluations([]);
    setCurrentIndex(0);
    setScore(0);
    setSavedInterviewId(null);
    setGameState('info');
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <AnimatePresence mode="wait">

        {/* ── Info / Intro Screen ────────────────────────────────────────── */}
        {gameState === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-12 rounded-[40px] text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
              <Terminal className="text-emerald-400 w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 text-white">
              Technical Architecture Round
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto font-light mb-12">
              Assess your engineering depth, system fundamentals, and architectural tradeoffs tailored for{' '}
              <span className="text-emerald-400 font-bold">{userProfile?.domain || 'Software Engineering'}</span>.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: Clock, label: '15 Minutes', text: 'Timed Session' },
                { icon: Terminal, label: '5 Questions', text: 'Domain Depth' },
                { icon: Code2, label: 'Typed Answers', text: 'Explanations' },
                { icon: Trophy, label: 'Concepts', text: 'Auto-Evaluated' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <item.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white block">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              id="tech-start-btn"
              className="px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-2 mx-auto uppercase tracking-widest text-sm"
            >
              START TECHNICAL ROUND
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* ── Interview Question Screen ─────────────────────────────────── */}
        {gameState === 'interview' && questions.length > 0 && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between glass p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Terminal className="text-emerald-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                  <p className="font-bold text-white uppercase tracking-tight">
                    {questions[currentIndex]?.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Local Evaluator</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                  <span className={`font-mono font-bold text-sm ${timeLeft < 120 ? 'text-red-500' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question card */}
            <div className="glass p-10 rounded-[40px] border-b-8 border-emerald-600/20 space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                  {questions[currentIndex]?.difficulty} Difficulty
                </span>
                {questions[currentIndex]?.hint && (
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHint ? 'Hide Concept Hint' : 'View Concept Hint'}
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-bold leading-relaxed text-white">
                {questions[currentIndex]?.question}
              </h2>

              {showHint && questions[currentIndex]?.hint && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs">
                  💡 Hint: {questions[currentIndex].hint}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Your Technical Explanation
                </label>
                <textarea
                  rows={7}
                  value={answers[currentIndex] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Provide your technical answer here. Detail the underlying architecture, data structures, trade-offs, and how you would explain this to a principal engineer..."
                  className="w-full p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-light leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center px-2">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="px-8 py-3 bg-slate-900 text-slate-400 font-bold rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs border border-slate-800"
              >
                ← Previous
              </button>

              <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                {answers.filter(a => a.trim().length > 0).length} / {questions.length} answered
              </span>

              <button
                onClick={goToNext}
                disabled={!(answers[currentIndex] || '').trim()}
                className="px-10 py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                {currentIndex === questions.length - 1 ? 'FINISH ROUND' : 'NEXT QUESTION'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Result Screen ─────────────────────────────────────────────── */}
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
              Technical Assessment Complete
            </h1>
            <p className="text-slate-400 font-light mb-12">
              Here is your technical conceptual depth and architectural accuracy review.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Technical Index</p>
                <p className="text-5xl font-black text-emerald-400">{score}%</p>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Questions Answered</p>
                <p className="text-5xl font-black text-white">{questions.length}</p>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Readiness</p>
                <p className="text-3xl font-black text-emerald-400 uppercase tracking-tight">
                  {score >= 75 ? 'Qualified' : score >= 50 ? 'Intermediate' : 'Foundational'}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-12 text-left">
              {evaluations.map((ev, i) => (
                <div key={i} className="p-6 glass rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-emerald-400 uppercase tracking-tight">
                      Q{i + 1}: {questions[i]?.question}
                    </p>
                    <span className="text-xs font-black text-white px-2.5 py-1 bg-emerald-600/20 rounded-md border border-emerald-500/30">
                      {ev.score}/100
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs italic font-light">"{answers[i]}"</p>
                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-1">{ev.feedback}</p>
                      {ev.matchedConcepts && ev.matchedConcepts.length > 0 && (
                        <p className="text-[10px] text-emerald-400 font-bold">
                          Covered: {ev.matchedConcepts.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-8 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-800 text-sm tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> RETRY ROUND
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
                className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
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
