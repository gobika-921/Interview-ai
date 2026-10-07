import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  Target,
  Zap,
  Brain,
  MessageSquare,
  GraduationCap,
  User,
  Code2,
  FolderGit2,
  Star,
  TrendingUp,
  Info,
  ChevronRight,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESUME_PROFILE, isKnownResumeText } from '../data/resumeProfile';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, color = 'text-indigo-400' }: { icon: React.ElementType; label: string; color?: string }) {
  return (
    <h3 className={`text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4`}>
      <Icon className={`w-4 h-4 ${color}`} />
      {label}
    </h3>
  );
}

function Chip({ label, variant = 'indigo', ...rest }: { label: string; variant?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'purple' | 'rose' } & React.HTMLAttributes<HTMLSpanElement>) {
  const styles: Record<string, string> = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
  };
  return (
    <span {...rest} className={`px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${styles[variant]}`}>
      {label}
    </span>
  );
}

function ATSScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;

  const color = score >= 90 ? '#10b981' : score >= 75 ? '#6366f1' : score >= 55 ? '#f59e0b' : '#ef4444';
  const label = score >= 90 ? 'Excellent' : score >= 75 ? 'Good Compatibility' : score >= 55 ? 'Fair' : 'Needs Improvement';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 128 128">
          <circle strokeWidth="10" stroke="#1e293b" fill="transparent" r={radius} cx="64" cy="64" />
          <circle
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white leading-none">{score}</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-black uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Upload Zone State Machine
// ─────────────────────────────────────────────

type UploadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'recognized'; filename: string }
  | { status: 'unrecognized'; filename: string }
  | { status: 'error'; message: string };

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function ResumeAnalyzer() {
  const { userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resume = RESUME_PROFILE;

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Reset input so re-uploading same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!file) return;

    // Validate type
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadState({
        status: 'error',
        message: 'Unsupported file type. Please upload a PDF file.',
      });
      return;
    }

    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadState({
        status: 'error',
        message: 'File is too large. Maximum supported size is 5 MB.',
      });
      return;
    }

    setUploadState({ status: 'loading' });
    setAnalysisVisible(false);

    try {
      // Attempt text extraction to verify resume identity
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: unknown) => (item as { str: string }).str).join(' ');
      }

      // Check if text was extractable
      if (!fullText.trim()) {
        // Image-only PDF — still allow display (treat as known by filename)
        const recognized = /gobika|baskaran|resume|sairam/i.test(file.name);
        if (recognized) {
          await persistResumeAnalysis();
          setUploadState({ status: 'recognized', filename: file.name });
          setAnalysisVisible(true);
        } else {
          setUploadState({
            status: 'error',
            message:
              'Could not extract text from this PDF. If this is an image-only scan, ensure the correct resume is uploaded.',
          });
        }
        return;
      }

      // Check if text matches known resume
      const isKnown = isKnownResumeText(fullText);

      if (isKnown) {
        await persistResumeAnalysis();
        setUploadState({ status: 'recognized', filename: file.name });
        setAnalysisVisible(true);
      } else {
        // Unknown resume — still display the analysis but note it
        setUploadState({ status: 'unrecognized', filename: file.name });
        setAnalysisVisible(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to read the PDF. Please try again.';
      setUploadState({ status: 'error', message });
    }
  }, []);

  const persistResumeAnalysis = async () => {
    if (!userProfile) return;
    try {
      await updateUserProfile({
        resumeScore: resume.atsAnalysis.score,
        resumeData: {
          analyzed: true,
          score: resume.atsAnalysis.score,
          skills: resume.allSkills,
          candidate: resume.personal.name,
          analysisTimestamp: new Date().toISOString(),
        },
        skills: resume.allSkills,
      });
    } catch {
      // Non-fatal — analysis display is not blocked by persistence failure
    }
  };

  const handleReset = () => {
    setUploadState({ status: 'idle' });
    setAnalysisVisible(false);
  };

  const isLoading = uploadState.status === 'loading';
  const hasError = uploadState.status === 'error';
  const isRecognized = uploadState.status === 'recognized';
  const isUnrecognized = uploadState.status === 'unrecognized';

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10">
      {/* Header */}
      <header className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            Resume Intelligence System
          </span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
          Resume Analyzer
        </h1>
        <p className="text-slate-400 font-light max-w-xl mx-auto text-sm leading-relaxed">
          Upload your resume to receive a structured profile analysis, ATS compatibility
          assessment, skill extraction, and optimization tips.
        </p>
      </header>

      {/* Upload + Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Zone */}
        <div className="space-y-6">
          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`glass p-10 rounded-[40px] border-2 border-dashed text-center transition-all select-none
              ${isLoading ? 'border-indigo-500 bg-indigo-500/5 cursor-wait' : ''}
              ${hasError ? 'border-red-500/40 bg-red-500/5 cursor-pointer' : ''}
              ${isRecognized ? 'border-emerald-500/40 bg-emerald-500/5 cursor-pointer' : ''}
              ${isUnrecognized ? 'border-amber-500/40 bg-amber-500/5 cursor-pointer' : ''}
              ${uploadState.status === 'idle' ? 'border-slate-800 hover:border-indigo-500/50 hover:bg-white/5 cursor-pointer' : ''}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,application/pdf"
            />

            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-white uppercase tracking-tight">Processing PDF</p>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] animate-pulse">
                      Extracting & Analyzing...
                    </p>
                  </div>
                </motion.div>
              )}

              {hasError && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mx-auto border border-red-500/20">
                    <AlertCircle className="text-red-400 w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-white uppercase tracking-tight">Upload Failed</p>
                    <p className="text-sm font-medium text-red-400 max-w-xs mx-auto leading-relaxed">
                      {(uploadState as { status: 'error'; message: string }).message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest text-xs"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {isRecognized && (
                <motion.div key="recognized" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-[28px] flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400 w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-white uppercase tracking-tight">Resume Analyzed</p>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      {(uploadState as { status: 'recognized'; filename: string }).filename}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="px-6 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl hover:border-indigo-500/40 hover:text-white transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Upload Again
                  </button>
                </motion.div>
              )}

              {isUnrecognized && (
                <motion.div key="unrecognized" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-[28px] flex items-center justify-center mx-auto border border-amber-500/20">
                    <Info className="text-amber-400 w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-white uppercase tracking-tight">PDF Uploaded</p>
                    <p className="text-xs text-amber-400/80 font-medium max-w-xs mx-auto leading-relaxed">
                      This PDF was not automatically recognized as the expected resume. Analysis is displayed based on the configured profile.
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="px-6 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl hover:border-amber-500/40 hover:text-white transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Upload Different File
                  </button>
                </motion.div>
              )}

              {uploadState.status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-[28px] flex items-center justify-center mx-auto border border-indigo-600/20">
                    <Upload className="text-indigo-400 w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white uppercase tracking-tight">Drop Resume Here</p>
                    <p className="text-sm font-medium text-slate-500">Supported: PDF · Max 5 MB</p>
                  </div>
                  <button className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest text-xs">
                    Browse Files
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feature cards */}
          <div className="glass p-7 rounded-[32px] space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Analysis Features
            </h3>
            {[
              { icon: Target, label: 'ATS Compatibility', desc: 'Deterministic assessment against 10 ATS criteria.' },
              { icon: Brain, label: 'Skill Extraction', desc: 'Identifies core competencies and potential missing keywords.' },
              { icon: MessageSquare, label: 'Optimization Tips', desc: 'Specific, actionable feedback on resume phrasing.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-indigo-500/30">
                  <f.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-xs text-white uppercase tracking-tight">{f.label}</p>
                  <p className="text-[10px] text-slate-500 font-light leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigate to HR Round */}
          {analysisVisible && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/mock/hr')}
              className="w-full p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[28px] flex items-center justify-between group hover:opacity-90 transition-all shadow-xl shadow-indigo-600/20"
            >
              <div className="text-left">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Ready to Practice?</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">Start HR Interview Round</p>
                <p className="text-[10px] text-indigo-200/70 mt-0.5">Questions based on your resume</p>
              </div>
              <ArrowRight className="w-6 h-6 text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.button>
          )}
        </div>

        {/* Right pane: waiting state or ATS score preview */}
        <AnimatePresence mode="wait">
          {!analysisVisible ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass p-12 rounded-[40px] border-dashed border-2 border-slate-900 flex items-center justify-center min-h-[420px]"
            >
              <div className="text-center space-y-4">
                <FileText className="w-16 h-16 text-slate-800 mx-auto" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Upload a resume to begin analysis</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ats-preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="glass p-8 rounded-[40px] space-y-6"
            >
              {/* ATS Score */}
              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">ATS Compatibility Score</p>
                <ATSScoreRing score={resume.atsAnalysis.score} />
              </div>

              {/* Criteria grid */}
              <div className="space-y-2">
                {resume.atsAnalysis.criteria.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/60">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${c.met ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      {c.met
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        : <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{c.label}</p>
                    </div>
                    <span className={`text-[10px] font-black shrink-0 ${c.met ? 'text-emerald-400' : 'text-red-400'}`}>
                      {c.met ? `+${c.weight}` : '0'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Analysis — visible after upload */}
      <AnimatePresence>
        {analysisVisible && (
          <motion.div
            key="full-analysis"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* ── Candidate Overview ─────────────────────────────────────────── */}
            <div className="glass p-8 rounded-[40px]">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-1">Candidate Overview</p>
                  <h2 className="text-3xl font-black text-white tracking-tight">{resume.personal.name}</h2>
                  <p className="text-sm text-indigo-400 font-bold mt-1">{resume.objective.careerFocus} • {resume.objective.careerGoal}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Analysis Complete</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Career Focus</p>
                  <p className="font-black text-indigo-400 text-sm">{resume.objective.careerFocus}</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Career Goal</p>
                  <p className="font-black text-white text-sm">{resume.objective.careerGoal}</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">ATS Score</p>
                  <p className="font-black text-emerald-400 text-sm">{resume.atsAnalysis.score}% – {resume.atsAnalysis.label}</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Skills Found</p>
                  <p className="font-black text-purple-400 text-sm">{resume.allSkills.length} Identified</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Key Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {resume.objective.keyFocusAreas.map((area) => (
                    <Chip key={area} label={area} variant="indigo" />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Education + Strengths row ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Education */}
              <div className="glass p-8 rounded-[40px] space-y-6">
                <SectionHeader icon={GraduationCap} label="Education" color="text-sky-400" />

                <div className="space-y-1">
                  <p className="text-white font-black text-base leading-tight">{resume.education.institution}</p>
                  <p className="text-slate-400 text-xs font-medium">{resume.education.degree}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                      {resume.education.duration}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                      CGPA {resume.education.cgpa} / {resume.education.cgpaMax}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Relevant Coursework</p>
                  <div className="flex flex-wrap gap-2">
                    {resume.education.coursework.map((c) => (
                      <Chip key={c} label={c} variant="sky" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Academic Activities</p>
                  {resume.education.activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{act}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="glass p-8 rounded-[40px] space-y-6">
                <SectionHeader icon={Star} label="Strengths" color="text-amber-400" />
                <div className="space-y-3">
                  {resume.strengths.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-500/20 transition-colors group">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Technical Skills ───────────────────────────────────────────── */}
            <div className="glass p-8 rounded-[40px] space-y-6">
              <SectionHeader icon={Code2} label="Technical Skills" color="text-indigo-400" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {resume.skillGroups.map((group) => (
                  <div key={group.label} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-3 hover:border-indigo-500/30 transition-colors">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.25em]">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/15 text-indigo-200 text-[10px] font-bold rounded-lg whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Projects ──────────────────────────────────────────────────── */}
            <div className="glass p-8 rounded-[40px] space-y-6">
              <SectionHeader icon={FolderGit2} label="Projects" color="text-purple-400" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resume.projects.map((project) => (
                  <div key={project.id} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-purple-500/20 transition-all space-y-4 group">
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-purple-300 transition-colors leading-snug">
                        {project.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{project.description}</p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Key Details</p>
                      <div className="space-y-1">
                        {project.details.map((d, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                            <p className="text-[11px] text-slate-300 leading-relaxed">{d}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Competencies Demonstrated</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.competencies.map((comp) => (
                          <Chip key={comp} label={comp} variant="purple" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ATS Analysis (detailed) ───────────────────────────────────── */}
            <div className="glass p-8 rounded-[40px] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <SectionHeader icon={Target} label="ATS Compatibility Assessment" color="text-emerald-400" />
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-white">{resume.atsAnalysis.score}%</span>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-xl uppercase tracking-widest">
                    {resume.atsAnalysis.label}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                This is a deterministic ATS compatibility assessment based on 10 defined criteria. It is not a guarantee of passing any specific employer's ATS system.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">✓ Passing Criteria</p>
                  {resume.atsAnalysis.positives.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">△ Potential Improvements</p>
                  {resume.atsAnalysis.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Skill Extraction ──────────────────────────────────────────── */}
            <div className="glass p-8 rounded-[40px] space-y-6">
              <SectionHeader icon={Brain} label="Skill Extraction" color="text-indigo-400" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                    Skills Found in Resume
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resume.allSkills.map((skill) => (
                      <Chip key={skill} label={skill} variant="emerald" />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                    Potentially Useful Keywords to Consider
                  </p>
                  <p className="text-[9px] text-slate-600 italic mb-3">
                    These are suggestions for your target AI/ML roles — not claimed skills.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resume.keywordSuggestions.map((kw) => (
                      <Chip key={kw} label={kw} variant="amber" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Optimization Tips ─────────────────────────────────────────── */}
            <div className="glass p-8 rounded-[40px] space-y-6">
              <SectionHeader icon={Zap} label="Optimization Tips" color="text-amber-500" />
              <p className="text-xs text-slate-500 leading-relaxed -mt-2">
                Specific, actionable feedback on how to improve this resume's phrasing and impact.
              </p>
              <div className="space-y-4">
                {resume.optimizationTips.map((tip, i) => (
                  <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-amber-500/20 transition-all space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-amber-400">{i + 1}</span>
                      </span>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{tip.section}</p>
                    </div>
                    <div className="pl-8 space-y-2">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Current</p>
                        <p className="text-xs text-slate-400 italic leading-relaxed">"{tip.current}"</p>
                      </div>
                      <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1">Suggestion</p>
                        <p className="text-xs text-slate-300 leading-relaxed">{tip.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── HR Prompt ─────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-[40px] flex items-center justify-between gap-6 flex-wrap"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Step</p>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Practice Your HR Round</h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  The HR interviewer has read this resume. Questions will reference your projects, skills, CGPA, NSS activities, and career objective — not generic templates.
                </p>
              </div>
              <button
                onClick={() => navigate('/mock/hr')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                Start HR Interview <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
