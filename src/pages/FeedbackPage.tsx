import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInterviewById, getUserInterviews } from '../lib/firestoreUtils';
import { Interview } from '../types';
import { 
  Trophy, 
  Brain, 
  Code2, 
  Users, 
  Terminal, 
  Building2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ArrowLeft,
  Share2,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function FeedbackPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const uid = currentUser?.uid || userProfile?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }

      if (interviewId) {
        const data = await getInterviewById(interviewId);
        if (data && data.userId === uid) {
          setInterview(data);
          setLoading(false);
          return;
        }
      }

      // If no ID or not found, try to fetch the most recent interview for the user
      const userInterviews = await getUserInterviews(uid);
      if (userInterviews && userInterviews.length > 0) {
        setInterview(userInterviews[0]);
      }
      setLoading(false);
    };

    loadSession();
  }, [interviewId, currentUser, userProfile]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-md mx-auto text-center py-20 glass rounded-[40px] p-10 space-y-4">
        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-slate-600">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase text-white tracking-tight">No Session Data Found</h2>
        <p className="text-slate-400 text-sm font-light">
          We could not locate this interview report. Complete a mock round to generate comprehensive feedback.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const score = interview.score ?? 0;
  const feedback = interview.feedbackData;

  const getTypeIcon = () => {
    switch (interview.type) {
      case 'aptitude': return <Brain className="w-6 h-6 text-indigo-400" />;
      case 'coding': return <Code2 className="w-6 h-6 text-emerald-400" />;
      case 'technical': return <Terminal className="w-6 h-6 text-emerald-400" />;
      case 'hr': return <Users className="w-6 h-6 text-purple-400" />;
      case 'company': return <Building2 className="w-6 h-6 text-amber-400" />;
      default: return <Trophy className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-10">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest text-[10px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </button>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 glass rounded-full text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          View All History
        </button>
      </div>

      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-8 border-indigo-600/20"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center shadow-xl">
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                {interview.type.toUpperCase()} ROUND
              </span>
              {interview.company && (
                <span className="px-3 py-0.5 bg-amber-500/10 text-amber-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                  {interview.company}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              {interview.title || `${interview.type.toUpperCase()} Assessment Report`}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-light">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(interview.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                Status: {interview.status}
              </span>
            </div>
          </div>
        </div>

        {/* Score badge */}
        <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800/80 text-center min-w-[160px]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Efficiency Index</p>
          <p className="text-5xl font-black text-white font-display">
            {score}<span className="text-xl text-slate-500 font-normal">/100</span>
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            score >= 75
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : score >= 50
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {score >= 75 ? 'Qualified' : score >= 50 ? 'Competent' : 'Developing'}
          </span>
        </div>
      </motion.div>

      {/* Structured Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="glass p-8 rounded-[36px] space-y-4 border-t-4 border-emerald-500/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-tight text-sm">Key Strengths</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-light leading-relaxed">
            {feedback?.strengths && feedback.strengths.length > 0 ? (
              feedback.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">Consistent foundational execution observed.</li>
            )}
          </ul>
        </div>

        {/* Weaknesses / Improvement Areas */}
        <div className="glass p-8 rounded-[36px] space-y-4 border-t-4 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-tight text-sm">Focus Areas</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-light leading-relaxed">
            {feedback?.weaknesses && feedback.weaknesses.length > 0 ? (
              feedback.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">Pacing and precision under test pressure.</li>
            )}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="glass p-8 rounded-[36px] space-y-4 border-t-4 border-indigo-500/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-tight text-sm">Next Steps</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-light leading-relaxed">
            {feedback?.recommendations && feedback.recommendations.length > 0 ? (
              feedback.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">Continue routine mock simulation sessions.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Summary statement */}
      {feedback?.summary && (
        <div className="p-8 glass rounded-[36px] border border-white/5 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Diagnostic Summary</p>
          <p className="text-slate-300 text-sm font-light leading-relaxed">{feedback.summary}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        >
          RETURN TO DASHBOARD
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/history')}
          className="px-8 py-5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-2xl transition-colors uppercase tracking-widest text-xs"
        >
          VIEW HISTORICAL TRANSMISSIONS
        </button>
      </div>
    </div>
  );
}
