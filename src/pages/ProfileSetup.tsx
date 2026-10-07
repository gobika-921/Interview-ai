import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { geminiService } from '../services/gemini';
import { DOMAINS, EXPERIENCE_LEVELS, DIFFICULTIES } from '../constants';
import { FileText, Upload, CheckCircle2, ChevronRight, Brain, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function ProfileSetup() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || currentUser?.name || userProfile?.fullName || '',
    experienceLevel: userProfile?.experienceLevel || 'Fresher',
    domain: userProfile?.domain || 'Web Development',
    targetRole: userProfile?.targetRole || '',
    preferredDifficulty: userProfile?.preferredDifficulty || 'Medium',
    skills: userProfile?.skills || ([] as string[]),
    resumeData: userProfile?.resumeData || null,
  });

  const extractTextFromPDF = async (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedarray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedarray).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(" ");
          }
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      const analysis = await geminiService.analyzeResume(text);
      setFormData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...(analysis.skills || [])])],
        resumeData: analysis
      }));
    } catch (error) {
      console.error("Resume Parsing Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateUserProfile({
        ...formData,
        fullName: formData.fullName || currentUser.name || currentUser.displayName || 'Candidate',
        email: currentUser.email,
        uid: currentUser.uid,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Profile Setup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="max-w-3xl mx-auto w-full px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase text-white">Welcome to Intervu<span className="text-indigo-400">AI</span></h1>
        <p className="text-slate-400 font-light">Let's set up your professional profile to tailor your experience.</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border-slate-800 text-slate-500'}`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 glass p-10 rounded-[40px]"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full py-4 pr-6 pl-14 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 font-light"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Domain</label>
                <select 
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full py-4 px-6 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer font-light"
                >
                  {DOMAINS.map(d => <option key={d} value={d} className="bg-slate-950">{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Experience Level</label>
                <select 
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full py-4 px-6 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer font-light"
                >
                  {EXPERIENCE_LEVELS.map(level => <option key={level} value={level} className="bg-slate-950">{level}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Target Job Role</label>
              <input 
                type="text" 
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full py-4 px-6 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 font-light"
                placeholder="Senior React Developer"
              />
            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.fullName || !formData.targetRole}
              className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2 shadow-xl tracking-widest text-sm"
            >
              CONTINUE
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 glass p-10 rounded-[40px]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FileText className="text-indigo-400 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">Upload Your Resume</h2>
              <p className="text-slate-400 font-light">Our AI will analyze your resume to generate better questions.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${loading ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-white/5'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf"
              />
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 mx-auto"></div>
                  <p className="font-bold text-indigo-400 tracking-widest uppercase text-xs">AI is analyzing your resume...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                    <Upload className="text-slate-500 w-8 h-8" />
                  </div>
                  {formData.resumeData ? (
                    <div className="text-indigo-400 font-bold flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      RESUME ANALYZED SUCCESSFULLY
                    </div>
                  ) : (
                    <p className="text-slate-400 font-medium">Click or drag & drop PDF resume</p>
                  )}
                </div>
              )}
            </div>

            {formData.resumeData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-[0.2em] text-[10px] text-slate-500">Resume Score</span>
                  <span className="text-2xl font-black text-indigo-400">{formData.resumeData.score}%</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.slice(0, 8).map(s => (
                    <span key={s} className="px-3 py-1 bg-indigo-600/10 border border-indigo-600/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase">{s}</span>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-950 text-slate-400 font-bold rounded-2xl hover:bg-slate-900 transition-all border border-slate-800 tracking-widest text-sm">BACK</button>
              <button 
                onClick={nextStep} 
                className="flex-1 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl tracking-widest text-sm"
              >
                CONTINUE
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 glass p-10 rounded-[40px]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Brain className="text-indigo-400 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">Initial Mock Settings</h2>
              <p className="text-slate-400 font-light">Choose your preferred difficulty to start practicing.</p>
            </div>

            <div className="flex flex-col gap-4">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => setFormData({ ...formData, preferredDifficulty: diff as any })}
                  className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group ${formData.preferredDifficulty === diff ? 'border-indigo-600 bg-indigo-600/10' : 'border-slate-800 hover:border-slate-700'}`}
                >
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-white">{diff}</h3>
                    <p className="text-sm text-slate-500 font-light">{diff === 'Easy' ? 'Basic concepts and foundational questions.' : diff === 'Medium' ? 'Core logic and technical depth.' : 'Advanced challenges and architectural problems.'}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.preferredDifficulty === diff ? 'border-indigo-500 bg-indigo-500' : 'border-slate-800'}`}>
                    {formData.preferredDifficulty === diff && <CheckCircle2 className="text-white w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-950 text-slate-400 font-bold rounded-2xl hover:bg-slate-900 transition-all border border-slate-800 tracking-widest text-sm">BACK</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-2 tracking-widest text-sm"
              >
                {loading ? 'SAVING...' : 'FINISH SETUP'}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
