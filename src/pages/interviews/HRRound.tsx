import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { geminiService } from '../../services/gemini';
import { createInterview } from '../../lib/firestoreUtils';
import { getLocalHRQuestions } from '../../data/hrQuestions';
import { evaluateHRAnswer, generateFeedbackData } from '../../lib/evaluator';
import { HRQuestion } from '../../types';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Play, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Trophy, 
  MessageSquare, 
  Smile, 
  Zap, 
  Info,
  Type,
  Wifi,
  WifiOff,
  RotateCcw,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function HRRound() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'setup' | 'interview' | 'feedback'>('setup');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<HRQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  const [responses, setResponses] = useState<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
    strengths?: string[];
    weaknesses?: string[];
  }[]>([]);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);
  const [usedLocalQuestions, setUsedLocalQuestions] = useState(true);

  // Video & camera detection
  const videoRef = useRef<HTMLVideoElement>(null);
  const [confidence, setConfidence] = useState(88);
  const [webcamActive, setWebcamActive] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Clean up media streams
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleWebcamToggle = async () => {
    if (webcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamActive(true);
      } catch (err) {
        console.warn('Webcam permission not granted or device unavailable:', err);
        setWebcamActive(false);
      }
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const startInterview = async () => {
    setLoading(true);
    let loadedQs: HRQuestion[] = [];
    let isLocal = true;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
        throw new Error('Using local question bank.');
      }
      const remoteQs = await geminiService.generateHRQuestions(
        userProfile?.domain || 'General',
        userProfile?.skills || []
      );
      if (Array.isArray(remoteQs) && remoteQs.length > 0) {
        loadedQs = remoteQs.map((q: string, i: number) => ({
          id: 'hr-ai-' + i,
          question: q,
          category: 'Behavioral & Role Fit',
          intent: 'Assess behavioral alignment and communication.',
          idealElements: ['STAR method', 'action orientation', 'results']
        }));
        isLocal = false;
      } else {
        throw new Error('Empty AI response');
      }
    } catch {
      loadedQs = getLocalHRQuestions(4);
      isLocal = true;
    }

    setQuestions(loadedQs);
    setUsedLocalQuestions(isLocal);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setTypedAnswer('');
    resetTranscript();
    setLoading(false);
    setGameState('interview');
    speak(loadedQs[0]?.question || '');
  };

  const activeAnswer = inputMode === 'voice' ? (transcript || typedAnswer) : (typedAnswer || transcript);

  const submitAnswer = async () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ || !activeAnswer.trim()) return;

    setLoading(true);

    const evalResult = evaluateHRAnswer(currentQ, activeAnswer);
    const newResponses = [
      ...responses,
      {
        question: currentQ.question,
        answer: activeAnswer.trim(),
        score: evalResult.score,
        feedback: evalResult.feedback,
        strengths: evalResult.strengths,
        weaknesses: evalResult.weaknesses
      }
    ];

    setResponses(newResponses);
    setTypedAnswer('');
    resetTranscript();

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      speak(questions[nextIndex]?.question || '');
      setLoading(false);
    } else {
      await finishInterview(newResponses);
      setLoading(false);
    }
  };

  const finishInterview = async (finalResponses: typeof responses) => {
    const total = finalResponses.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = finalResponses.length > 0 ? Math.round(total / finalResponses.length) : 0;

    const uid = currentUser?.uid || userProfile?.uid;
    if (uid) {
      const feedbackData = generateFeedbackData('hr', avgScore, { responses: finalResponses });
      try {
        const id = await createInterview({
          userId: uid,
          type: 'hr',
          title: 'HR Behavioral Interview',
          status: 'completed',
          score: avgScore,
          feedback: `Behavioral and communication efficiency index: ${avgScore}%. Completed ${finalResponses.length} situational questions.`,
          feedbackData,
          details: {
            questions: questions.map(q => q.question),
            responses: finalResponses,
            usedLocalQuestions,
            webcamActive
          }
        });
        setSavedInterviewId(id);
      } catch (err) {
        console.error('Failed to save HR interview:', err);
      }
    }

    setGameState('feedback');
  };

  const handleRetry = () => {
    setGameState('setup');
    setQuestions([]);
    setResponses([]);
    setCurrentQuestionIndex(0);
    setTypedAnswer('');
    resetTranscript();
  };

  const avgScore = responses.length > 0
    ? Math.round(responses.reduce((a, b) => a + b.score, 0) / responses.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto w-full">
      <AnimatePresence mode="wait">

        {/* ── Setup Screen ──────────────────────────────────────────────── */}
        {gameState === 'setup' && (
          <motion.div key="setup" {...fadeInUp} className="max-w-xl mx-auto glass p-12 rounded-[40px] text-center">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
              <Users className="text-indigo-400 w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">HR Behavioral Round</h1>
            <p className="text-slate-400 font-light mb-10">
              Simulate situational and culture-fit behavioral questions. You can respond with voice speech or typed answers.
            </p>

            <div className="space-y-4 mb-10">
              {/* Camera toggle (optional, non-blocking) */}
              <div className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${webcamActive ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-500'}`}>
                    {webcamActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                     <p className="text-sm font-bold text-white uppercase tracking-tight">Camera Feed</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                       {webcamActive ? 'ENABLED (ACTIVE)' : 'OPTIONAL (DISABLED)'}
                     </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleWebcamToggle}
                  className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${webcamActive ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}
                >
                  {webcamActive ? 'DISABLE' : 'ENABLE'}
                </button>
              </div>

              {/* Mode indicator */}
              <div className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className="text-sm font-bold text-white uppercase tracking-tight">Input Mode</p>
                     <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Voice Speech + Text Input</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">READY</span>
              </div>
            </div>

            <button 
              onClick={startInterview}
              disabled={loading}
              id="hr-start-btn"
              className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'START INTERVIEW'}
              {!loading && <Play className="w-5 h-5" />}
            </button>
            <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estimated duration: 10-15 mins</p>
          </motion.div>
        )}

        {/* ── Interview Session ─────────────────────────────────────────── */}
        {gameState === 'interview' && questions.length > 0 && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Question Card */}
              <div className="glass p-10 rounded-[40px] border-b-8 border-indigo-600/20 min-h-[260px] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                      {questions[currentQuestionIndex]?.category}
                    </span>
                    {usedLocalQuestions ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <WifiOff className="w-2.5 h-2.5" /> Local
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <Wifi className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold leading-tight text-white mb-4">
                  {questions[currentQuestionIndex]?.question}
                </h2>
                {questions[currentQuestionIndex]?.tips && (
                  <p className="text-xs text-slate-400 italic">
                    💡 Tip: {questions[currentQuestionIndex].tips}
                  </p>
                )}
              </div>

              {/* Response Card */}
              <div className="glass p-8 rounded-[40px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <button
                       type="button"
                       onClick={() => setInputMode('text')}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                         inputMode === 'text' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-900 text-slate-400'
                       }`}
                     >
                       <Type className="w-3.5 h-3.5" /> Type Answer
                     </button>
                     {browserSupportsSpeechRecognition && (
                       <button
                         type="button"
                         onClick={() => setInputMode('voice')}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                           inputMode === 'voice' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-900 text-slate-400'
                         }`}
                       >
                         <Mic className="w-3.5 h-3.5" /> Voice Mic
                       </button>
                     )}
                   </div>

                   {inputMode === 'voice' && (
                     <div className="flex items-center gap-2">
                       <button 
                         type="button"
                         onClick={() => SpeechRecognition.startListening({ continuous: true })}
                         className={`p-2.5 rounded-xl transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                       >
                         <Mic className="w-4 h-4" />
                       </button>
                       <button 
                         type="button"
                         onClick={SpeechRecognition.stopListening} 
                         className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl"
                       >
                         <MicOff className="w-4 h-4" />
                       </button>
                     </div>
                   )}
                </div>

                {inputMode === 'text' ? (
                  <textarea
                    rows={5}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your response here. For behavioral questions, consider the STAR approach: Situation, Task, Action, and Result..."
                    className="w-full p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-light leading-relaxed resize-none"
                  />
                ) : (
                  <div className="min-h-[140px] p-6 bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-300 font-light italic leading-relaxed">
                    {transcript || "Your speech transcript will appear here. Click the mic button to start speaking..."}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                     {activeAnswer.split(/\s+/).filter(Boolean).length} words
                   </span>

                   <button 
                    onClick={submitAnswer}
                    disabled={loading || activeAnswer.trim().length < 3}
                    id="hr-submit-btn"
                    className="px-10 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 text-xs tracking-widest"
                   >
                     {loading ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : currentQuestionIndex === questions.length - 1 ? (
                       'FINISH INTERVIEW'
                     ) : (
                       'NEXT QUESTION'
                     )}
                     <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>

            {/* Sidebar Feed */}
            <div className="space-y-6">
              {/* Media Feed or Placeholder */}
              <div className="glass rounded-[40px] overflow-hidden aspect-[4/3] relative bg-slate-950 shadow-2xl border border-white/10 flex items-center justify-center">
                {webcamActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover grayscale opacity-90"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-slate-600">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Virtual Room</p>
                    <p className="text-[10px] text-slate-600">Audio & response transcription active.</p>
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded uppercase">LIVE</div>
                  <div className="text-[10px] text-white font-bold uppercase tracking-widest">BEHAVIORAL ENGINE</div>
                </div>
              </div>

              {/* Status Board */}
              <div className="glass p-6 rounded-[32px]">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-indigo-400" />
                   </div>
                   <p className="text-xs font-bold text-white uppercase tracking-tight">Session Parameters</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Framework</span>
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">STAR Method</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questions Remaining</span>
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                         {questions.length - currentQuestionIndex - 1} left
                       </span>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Feedback Screen ───────────────────────────────────────────── */}
        {gameState === 'feedback' && (
          <motion.div key="feedback" {...fadeInUp} className="max-w-4xl mx-auto glass p-12 rounded-[40px] text-center">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
              <Trophy className="text-emerald-500 w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">Interview Summary</h1>
            <p className="text-slate-400 font-light mb-12">Congratulations on completing your HR behavioral round. Here is your evaluation.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Score</p>
                 <p className="text-5xl font-black text-indigo-400">{avgScore}%</p>
               </div>
               <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Questions Completed</p>
                 <p className="text-5xl font-black text-white">{responses.length}</p>
               </div>
               <div className="p-8 bg-slate-950 border border-slate-800 rounded-[32px]">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Readiness</p>
                 <p className="text-3xl font-black text-emerald-400 uppercase tracking-tight">
                   {avgScore >= 75 ? 'Qualified' : avgScore >= 50 ? 'Developing' : 'Needs Practice'}
                 </p>
               </div>
            </div>

            <div className="space-y-4 mb-12">
              {responses.map((resp, i) => (
                <div key={i} className="text-left p-6 glass rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                     <p className="font-bold text-sm text-indigo-400 uppercase tracking-tight">Q{i + 1}: {resp.question}</p>
                     <span className="text-xs font-black text-white px-2 py-0.5 bg-indigo-600/20 rounded-md border border-indigo-500/30">
                       {resp.score}/100
                     </span>
                  </div>
                  <p className="text-slate-300 text-xs italic font-light">"{resp.answer}"</p>
                  <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex gap-3">
                    <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{resp.feedback}</p>
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
