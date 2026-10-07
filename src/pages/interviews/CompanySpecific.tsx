import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COMPANIES } from '../../constants';
import { getCompanyAssessment, CompanyInterviewQuestion } from '../../data/companyInterviews';
import { useAuth } from '../../context/AuthContext';
import { createInterview } from '../../lib/firestoreUtils';
import { generateFeedbackData } from '../../lib/evaluator';
import { 
  Building2, 
  ChevronRight, 
  Play, 
  Clock, 
  Trophy, 
  ArrowLeft, 
  Zap, 
  Layout, 
  CheckCircle2, 
  Lock,
  RotateCcw,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Mode = 'overview' | 'simulation' | 'result';

export default function CompanySpecific() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const company = COMPANIES.find(c => c.id === companyId);
  const assessment = companyId ? getCompanyAssessment(companyId) : null;

  const [mode, setMode] = useState<Mode>('overview');
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [questions, setQuestions] = useState<CompanyInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
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

  if (!company) {
    return (
      <div className="max-w-md mx-auto text-center py-20 glass rounded-[32px] p-8 space-y-4">
        <h2 className="text-xl font-bold text-white">Company Not Found</h2>
        <p className="text-slate-400 text-sm">The requested enterprise profile is not registered.</p>
        <button
          onClick={() => navigate('/company-list')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
        >
          Back to Giants
        </button>
      </div>
    );
  }

  // Start Simulation for full assessment or specific round
  const startSimulation = (roundIdx: number = 0) => {
    setSelectedRoundIndex(roundIdx);
    let qList: CompanyInterviewQuestion[] = [];

    if (assessment && assessment.rounds[roundIdx]) {
      qList = assessment.rounds[roundIdx].questions;
    } else {
      // Fallback questions for custom rounds
      qList = [
        {
          id: 'gen-1',
          type: 'multiple-choice',
          category: 'Enterprise Engineering',
          question: `In ${company.name}'s engineering workflow, what strategy best balances zero-downtime deployment with fast rollback?`,
          options: ['Blue-Green Deployment', 'In-place database replacement', 'Manual FTP overwrite', 'Rebooting servers during peak hours'],
          correctAnswerIndex: 0,
          explanation: 'Blue-Green deployments maintain two identical environments, enabling instantaneous traffic switching and clean rollback.'
        },
        {
          id: 'gen-2',
          type: 'multiple-choice',
          category: 'System Scalability',
          question: 'When optimizing database read throughput under heavy concurrent load, which pattern is recommended first?',
          options: ['Read-replica pooling and distributed caching (Redis)', 'Dropping database indexes', 'Writing directly to CSV files', 'Running single-threaded queries'],
          correctAnswerIndex: 0,
          explanation: 'Read-replicas and distributed caches offload read pressure from primary transactional databases.'
        }
      ];
    }

    setQuestions(qList);
    setAnswers(new Array(qList.length).fill(-1));
    setCurrentQuestionIndex(0);
    setTimeLeft(assessment ? assessment.durationMinutes * 60 : 900);
    setMode('simulation');
    startTimer();
  };

  const handleSelectOption = (idx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQuestionIndex] = idx;
      return next;
    });
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishSimulation();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishSimulation = async () => {
    stopTimer();
    const duration = assessment ? assessment.durationMinutes * 60 : 900;
    timeTakenRef.current = duration - timeLeft;

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) correct++;
    });

    const calculatedScore = questions.length > 0
      ? Math.round((correct / questions.length) * 100)
      : 0;

    setScore(calculatedScore);

    const uid = currentUser?.uid || userProfile?.uid;
    if (uid) {
      const feedbackData = generateFeedbackData('company', calculatedScore, {
        company: company.name,
        correct,
        total: questions.length
      });

      try {
        const id = await createInterview({
          userId: uid,
          type: 'company',
          company: company.name,
          title: `${company.name} Mock Simulation`,
          status: 'completed',
          score: calculatedScore,
          feedback: `Completed ${company.name} official hiring assessment round with ${calculatedScore}% efficiency index.`,
          feedbackData,
          details: {
            companyId: company.id,
            companyName: company.name,
            questions,
            answers,
            correctCount: correct,
            totalQuestions: questions.length,
            timeTaken: timeTakenRef.current,
            passingScore: assessment?.passingScore || 65
          }
        });
        setSavedInterviewId(id);
      } catch (err) {
        console.error('Failed to save company interview:', err);
      }
    }

    setMode('result');
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-12">
      <AnimatePresence mode="wait">

        {/* ── Mode 1: Company Overview & Pipeline ──────────────────────── */}
        {mode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <button 
              onClick={() => navigate('/company-list')}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Giants
            </button>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                 <div className="w-32 h-32 bg-slate-950 border border-slate-800 rounded-[40px] flex items-center justify-center text-4xl font-black text-white shadow-2xl relative overflow-hidden group">
                    {company.name.charAt(0)}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className="text-5xl font-black tracking-tighter uppercase text-white">{company.name}</h1>
                       <div className="px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                         VERIFIED PATTERN
                       </div>
                    </div>
                    <p className="text-slate-400 font-light text-xl leading-relaxed max-w-xl">
                       {assessment?.overview || `Official hiring pattern for ${company.name} engineering roles.`}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => startSimulation(0)}
                id="company-start-simulation-btn"
                className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 flex items-center gap-3 uppercase tracking-widest text-sm"
              >
                 START FULL SIMULATION
                 <Zap className="w-5 h-5" />
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Layout className="w-6 h-6 text-indigo-400" /> Hiring Pipeline & Assessment Modules
                 </h2>
                 
                 <div className="space-y-4">
                    {company.rounds.map((round, i) => (
                      <div 
                        key={i} 
                        onClick={() => startSimulation(i < (assessment?.rounds.length || 0) ? i : 0)}
                        className="group relative flex items-center gap-6 p-8 glass rounded-[32px] hover:border-indigo-500/30 transition-all cursor-pointer"
                      >
                        <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                          0{i + 1}
                        </div>
                        <div className="flex-1">
                           <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                             {round}
                           </h3>
                           <p className="text-sm text-slate-500 font-light mt-1">
                             Simulate the exact difficulty and constraints of this assessment round.
                           </p>
                        </div>
                        <button className="px-6 py-3 bg-white/5 border border-white/5 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-slate-400 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                           <Play className="w-4 h-4" /> Start
                        </button>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="glass p-10 rounded-[40px] border-b-8 border-indigo-600/20">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Round Statistics</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Duration</span>
                          <span className="text-sm font-bold text-white">{assessment?.durationMinutes || 15} Mins</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Target Score</span>
                          <span className="text-sm font-bold text-amber-500">{assessment?.passingScore || 65}%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Format</span>
                          <span className="text-sm font-bold text-emerald-500">Curated Pattern</span>
                       </div>
                    </div>
                 </div>

                 <div className="glass p-8 rounded-[40px] space-y-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Lock className="w-4 h-4 text-amber-500" /> Key Focus Areas
                    </h3>
                    <div className="space-y-4">
                       {[
                         'Algorithmic Accuracy & Edge Cases',
                         'Enterprise Scalability Concepts',
                         'Behavioral & Culture Fit'
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between group">
                            <span className="text-sm text-slate-400">{item}</span>
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Mode 2: Interactive Simulation ──────────────────────────── */}
        {mode === 'simulation' && questions.length > 0 && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between glass p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center font-bold text-indigo-400">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {company.name} Mock • Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <p className="font-bold text-white uppercase tracking-tight">
                    {questions[currentQuestionIndex]?.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
                  <span className={`font-mono font-bold text-sm ${timeLeft < 120 ? 'text-red-500' : 'text-white'}`}>
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
                {questions[currentQuestionIndex]?.options?.map((option, i) => {
                  const isSelected = answers[currentQuestionIndex] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
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
                {currentQuestionIndex === questions.length - 1 ? 'FINISH SIMULATION' : 'NEXT QUESTION'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Mode 3: Simulation Results ──────────────────────────────── */}
        {mode === 'result' && (
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
              {company.name} Simulation Completed
            </h1>
            <p className="text-slate-400 font-light mb-12">
              Here is your candidate evaluation report for {company.name} assessment standards.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Efficiency Index</p>
                <p className="text-5xl font-black text-indigo-400">{score}%</p>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Benchmark</p>
                <p className="text-5xl font-black text-amber-400">{assessment?.passingScore || 65}%</p>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hiring Decision</p>
                <p className={`text-3xl font-black uppercase tracking-tight ${score >= (assessment?.passingScore || 65) ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {score >= (assessment?.passingScore || 65) ? 'Qualified' : 'Needs Practice'}
                </p>
              </div>
            </div>

            {/* Answer Review */}
            <div className="space-y-4 mb-12 text-left">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400" /> Questions Breakdown
              </h3>
              {questions.map((q, i) => {
                const userAns = answers[i];
                const isCorrect = userAns === q.correctAnswerIndex;
                return (
                  <div key={i} className="p-6 glass rounded-2xl border border-white/5 space-y-2">
                    <p className="text-sm font-medium text-white">{q.question}</p>
                    <div className="flex flex-col sm:flex-row gap-2 text-xs">
                      <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        Your answer: {userAns !== -1 && q.options ? q.options[userAns] : 'Not answered'}
                      </span>
                      {!isCorrect && q.options && q.correctAnswerIndex !== undefined && (
                        <>
                          <span className="text-slate-600 hidden sm:block">•</span>
                          <span className="text-emerald-400 font-bold">
                            Correct: {q.options[q.correctAnswerIndex]}
                          </span>
                        </>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-slate-400 italic pt-1">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setMode('overview')}
                className="px-8 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-800 text-sm tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> RESTART PIPELINE
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
