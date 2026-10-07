import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Brain, 
  Code2, 
  Users, 
  Zap, 
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#020617] overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Decorative Elements - Cyber Atmosphere */}
      <div className="absolute top-20 right-[-200px] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-[10%] w-[2px] h-[40%] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"></div>
      <main className="relative pt-10 md:pt-16 pb-24 md:pb-32 px-6 md:px-16 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/50 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence v3.0 Deployment Active
            </motion.div>
            
            <div className="space-y-4">
              <motion.h1 
                className="text-7xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter font-display"
                {...fadeInUp}
              >
                BREACH THE <br/>
                <span className="text-gradient">INTERFACE</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-slate-400 leading-relaxed max-w-lg font-light tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Neural-adaptive interview simulation. Practise aptitude, logic, and behavioral rounds filtered through the lens of industry giants.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/auth?mode=signup" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-widest group">
                Begin Simulation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/resume-analyzer" className="w-full sm:w-auto px-10 py-5 bg-slate-900/50 backdrop-blur-xl border border-white/5 text-slate-300 font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center uppercase tracking-widest text-[11px]">
                Parse Artifacts (Resume)
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-12 pt-8 border-t border-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="space-y-1">
                <p className="text-3xl font-black text-white font-display">24k+</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">Neural Engagements</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white font-display">99.2%</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">Placement Velocity</p>
              </div>
            </motion.div>
          </div>

          {/* Right Preview Card - The Nexus Interface */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, rotateY: -20, rotateX: 10 }}
            animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            style={{ perspective: "1000px" }}
          >
            <div className="w-full aspect-[4/3] glass rounded-[40px] p-8 relative overflow-hidden border-t-[8px] border-indigo-600/20 shadow-[-20px_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-display">Analyzing Current Vector...</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono tracking-tighter opacity-50">TX_PROTOCOL_882</div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 rounded-3xl bg-slate-950/50 border border-white/5 relative group cursor-default">
                  <div className="absolute top-2 right-4 text-[10px] font-black text-emerald-400">+12%</div>
                  <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Logic Factor</div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} transition={{ delay: 1, duration: 1 }} className="h-full bg-indigo-500" />
                  </div>
                  <div className="text-3xl font-black text-white font-display">0.88</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-950/50 border border-white/5 relative">
                   <div className="absolute top-2 right-4 text-[10px] font-black text-indigo-400">STABLE</div>
                  <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Confidence</div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ delay: 1.2, duration: 1 }} className="h-full bg-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-white font-display">0.94</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 p-5 bg-indigo-600/10 border border-indigo-600/20 rounded-3xl rounded-tl-none animate-float">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">System Feedback</p>
                    <p className="text-[12px] text-slate-300 leading-relaxed font-light italic">
                      "Neural patterns suggest high suitability for <span className="text-white font-bold tracking-tight">System Architect</span> protocols. Efficiency increased by <span className="text-emerald-400 font-bold">14.2%</span>."
                    </p>
                  </div>
                </div>
                
                <div className="relative w-full h-40 rounded-[30px] overflow-hidden bg-slate-950 flex items-center justify-center border border-white/5">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/20"></div>
                   
                   <div className="relative flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-2 border-indigo-500/20 flex items-center justify-center animate-pulse">
                        <div className="w-14 h-14 rounded-full border border-indigo-500/40 flex items-center justify-center bg-slate-900/50 backdrop-blur-md">
                           <Target className="w-6 h-6 text-indigo-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-red-500 animate-ping"></div>
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE SCANNING</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">EYE_TRACKING: ACTIVE</div>
                        <div className="text-[9px] text-slate-500 font-mono">PULSE: 72 BPM</div>
                      </div>
                   </div>

                   <div className="absolute bottom-4 left-6 flex items-center gap-4">
                     <div className="flex flex-col gap-1">
                        <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-4/5 bg-indigo-500"></div>
                        </div>
                        <div className="h-1 w-8 bg-slate-800 rounded-full"></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Float Elements */}
            <div className="absolute -bottom-8 -right-8 p-6 bg-[#020617] border border-white/10 rounded-[30px] shadow-2xl z-20 hidden lg:block transform hover:scale-110 transition-transform">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Next Protocol</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                   <p className="text-sm font-black text-white uppercase tracking-tight">FAANG Tier</p>
                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Verified Ready</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Corporate Grid */}
      <section className="h-32 bg-black/40 backdrop-blur-md flex items-center justify-center border-y border-white/5 relative z-20">
        <div className="px-10 flex flex-col md:flex-row items-center gap-8 md:gap-20">
          <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] whitespace-nowrap">Integrated with Industry Standards</p>
          <div className="flex items-center gap-10 md:gap-16 opacity-20 grayscale transition-all overflow-x-auto no-scrollbar scroll-smooth">
            {['GOOGLE', 'META', 'AMAZON', 'NETFLIX', 'MICROSOFT', 'ZOHO'].map(company => (
              <span key={company} className="text-2xl font-black text-white tracking-widest transition-all hover:opacity-100 cursor-default">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
           <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">Functional Modules</p>
           <h2 className="text-5xl font-black text-white uppercase tracking-tighter font-display">Core <span className="text-gradient">Capabilites</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: Brain, title: "Cognitive Aptitude", desc: "Adaptive testing algorithms that evolve based on your logical processing speed and accuracy." },
            { icon: Code2, title: "Logic Synthesis", desc: "Production-grade IDE simulator supporting all major technical stacks with automated logic verification." },
            { icon: Users, title: "Humanoid HR", desc: "Sentiment analysis and biometric tracking to master the nuances of executive communication." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-10 rounded-[40px] glass hover:border-indigo-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all"></div>
              
              <div className="w-16 h-16 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                <feature.icon className="text-indigo-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight font-display">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-light text-sm">{feature.desc}</p>
              
              <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Configure Module <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 px-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] gap-6">
         <div className="flex items-center gap-8">
            <span className="text-white font-black tracking-tighter underline underline-offset-4 decoration-indigo-500">INTERVU.AI</span>
            <span>Privacy Protocol</span>
            <span>Security Core</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            ALL SYSTEMS OPERATIONAL
         </div>
      </footer>
    </div>
  );
}
