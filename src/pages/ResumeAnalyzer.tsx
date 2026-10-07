import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { geminiService } from '../services/gemini';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Loader2,
  Trophy,
  Target,
  Zap,
  Layout,
  Layers,
  Brain,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ResumeAnalyzer() {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => (item as any).str).join(' ');
      }

      if (!fullText.trim()) {
        throw new Error("Could not extract text from this PDF. Please ensure it's not an image-only scan.");
      }

      const result = await geminiService.analyzeResume(fullText, targetRole);
      setAnalysis(result);

      // Update user profile in local auth storage
      if (userProfile?.uid) {
        await updateUserProfile({
          ...userProfile,
          resumeData: result,
          resumeScore: result.score,
          skills: result.skills
        });
      }
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-white">AI Resume Intelligence</h1>
        <p className="text-slate-400 font-light max-w-2xl mx-auto text-lg leading-relaxed">
          Upload your resume and let our AI evaluate your profile against current industry standards. Get a detailed score and expert optimization tips.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Upload Zone */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Target Protocol
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Job Role</span>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Data Scientist"
                  className="w-full mt-2 px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold placeholder:text-slate-700 focus:border-indigo-500/50 transition-all outline-none"
                />
              </label>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic px-1">
                The AI will calibrate your resume score and skill gap analysis against this specific role.
              </p>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`glass p-12 rounded-[40px] border-2 border-dashed text-center cursor-pointer transition-all ${loading ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-white/5'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf"
            />
            {loading ? (
              <div className="space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black text-white uppercase tracking-tight">Processing PDF</p>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Running Neural Analysis...</p>
                </div>
              </div>
            ) : error ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/20 shadow-xl shadow-red-500/10">
                  <AlertCircle className="text-red-400 w-10 h-10" />
                </div>
                <div className="space-y-2">
                   <p className="text-2xl font-black text-white uppercase tracking-tight">Upload Failed</p>
                   <p className="text-sm font-medium text-red-500 max-w-xs mx-auto">{error}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                  className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest text-xs"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-[32px] flex items-center justify-center mx-auto border border-indigo-600/20 shadow-xl shadow-indigo-600/10">
                  <Upload className="text-indigo-400 w-10 h-10" />
                </div>
                <div className="space-y-2">
                   <p className="text-2xl font-black text-white uppercase tracking-tight">Drop Resume Here</p>
                   <p className="text-sm font-medium text-slate-500">Supported formats: PDF (Max 5MB)</p>
                </div>
                <button className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest text-xs">Browse Files</button>
              </div>
            )}
          </div>

          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Key Features
            </h3>
            <div className="grid grid-cols-1 gap-4">
               {[
                 { icon: Target, label: 'ATS Compatibility', desc: 'Checks if your resume passes automated systems.' },
                 { icon: Brain, label: 'Skill Extraction', desc: 'Identifies core competencies and missing keywords.' },
                 { icon: MessageSquare, label: 'Optimization Tips', desc: 'Detailed feedback on how to improve your phrasing.' }
               ].map((f, i) => (
                 <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-indigo-500/30">
                       <f.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-white uppercase tracking-tight">{f.label}</p>
                       <p className="text-xs text-slate-500 font-light">{f.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Results Pane */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="glass p-10 rounded-[40px] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <div className="px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ANALYSIS COMPLETE</span>
                   </div>
                </div>
                
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-4">Overall Score</p>
                <div className="relative inline-block mb-10">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                    <circle 
                      className="text-indigo-500" 
                      strokeWidth="8" 
                      strokeDasharray={364} 
                      strokeDashoffset={364 - (364 * analysis.score) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="58" 
                      cx="64" 
                      cy="64" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-white">{analysis.score}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                      <p className={`font-black uppercase tracking-tight ${analysis.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{analysis.score >= 80 ? 'EXCELLENT' : 'OPTIMIZABLE'}</p>
                   </div>
                   <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Keywords</p>
                      <p className="font-black text-indigo-400 uppercase tracking-tight">{analysis.skills.length} FOUND</p>
                   </div>
                </div>
              </div>

              <div className="glass p-10 rounded-[40px] space-y-8">
                 <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Identified Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((s: string) => (
                        <span key={s} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-xl uppercase tracking-widest">{s}</span>
                      ))}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                       <Layers className="w-5 h-5 text-indigo-400" /> Skill Gap Analysis
                    </h3>
                    <div className="space-y-4">
                       {analysis.skillGapAnalysis?.map((item: any, i: number) => (
                         <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                               <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
                                  {item.skill}
                               </span>
                               <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Missing
                               </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mb-4 leading-relaxed">{item.gap}</p>
                            
                            <div className="space-y-2">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Suggested Missions (Resources)</p>
                               <div className="flex flex-col gap-2">
                                  {item.resources?.map((res: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 text-[11px] text-indigo-300/80 hover:text-indigo-300 transition-colors cursor-pointer">
                                       <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                       {res}
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                       <Zap className="w-5 h-5 text-amber-500" /> ATS Optimization Tips
                    </h3>
                    <div className="space-y-3">
                       {analysis.atsSuggestions?.map((s: string, i: number) => (
                         <div key={i} className="flex gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                            <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                               <span className="text-[10px] font-bold text-slate-500">{i + 1}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-light">{s}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {!analysis && !loading && (
             <div className="h-full flex items-center justify-center glass p-12 rounded-[40px] border-dashed border-2 border-slate-900">
                <div className="text-center space-y-4">
                   <Layout className="w-16 h-16 text-slate-800 mx-auto" />
                   <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Waiting for upload...</p>
                </div>
             </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
