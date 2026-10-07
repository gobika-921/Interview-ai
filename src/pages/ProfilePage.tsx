import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  FileText, 
  LogOut,
  Settings,
  ChevronRight,
  TrendingUp,
  Brain,
  Code2,
  Users as UsersIcon,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="w-32 h-32 bg-indigo-600 rounded-[40px] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-indigo-600/20 border-4 border-white/10 group overflow-hidden relative">
            {userProfile?.fullName?.charAt(0) || <User />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase text-white mb-2">{userProfile?.fullName}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
               <div className="flex items-center gap-2">
                 <Mail className="w-3.5 h-3.5 text-indigo-400" />
                 <span>{userProfile?.email}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                 <span>{userProfile?.targetRole}</span>
               </div>
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                 <span className="text-emerald-400">Verified Professional</span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={handleLogout} className="px-8 py-4 bg-red-600/10 border border-red-600/20 text-red-500 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
             <LogOut className="w-4 h-4" /> Sign Out
           </button>
           <button className="p-4 glass rounded-2xl text-slate-400 hover:text-white transition-all">
             <Settings className="w-6 h-6" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Sidebar Stats */}
         <div className="lg:col-span-1 space-y-8">
            <div className="glass p-10 rounded-[40px] text-center border-b-8 border-indigo-600/20">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-4">Resume Health</p>
               <div className="relative inline-block mb-6">
                  <div className="text-6xl font-black text-white">{userProfile?.resumeScore || 0}%</div>
               </div>
               <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                  <TrendingUp className="w-3.5 h-3.5" /> Improved 12%
               </div>
            </div>

            <div className="glass p-8 rounded-[40px] space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Zap className="w-4 h-4 text-indigo-400" /> Skills Inventory
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile?.skills?.map(skill => (
                    <span key={skill} className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">{skill}</span>
                  ))}
                </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="lg:col-span-2 space-y-8">
            <div className="glass p-10 rounded-[40px] relative overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Interview Readiness</h2>
                  <CheckCircle2 className="text-emerald-400 w-6 h-6" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Aptitude', score: 85, icon: Brain, color: 'bg-indigo-600' },
                    { label: 'Technical', score: 92, icon: Code2, color: 'bg-emerald-600' },
                    { label: 'Soft Skills', score: 78, icon: UsersIcon, color: 'bg-purple-600' }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-950/50 border border-slate-800 rounded-3xl group hover:border-indigo-500/30 transition-all">
                       <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                          <stat.icon className="text-white w-5 h-5" />
                       </div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="text-3xl font-black text-white uppercase">{stat.score}%</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass p-10 rounded-[40px]">
               <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Professional Summary</h2>
               <div className="space-y-6">
                  <div className="flex gap-6 items-start p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center shrink-0 border border-indigo-600/20">
                        <FileText className="text-indigo-400 w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-bold text-white uppercase tracking-tight mb-1">Career Goal</h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">Transitioning into a {userProfile?.targetRole} position, focusing on complex architecture and team leadership.</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-6 items-start p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center shrink-0 border border-emerald-600/20">
                        <Zap className="text-emerald-400 w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-bold text-white uppercase tracking-tight mb-1">Experience Focus</h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">Specializing in {userProfile?.domain} systems with {userProfile?.experienceLevel} level expertise.</p>
                     </div>
                  </div>
               </div>
               
               <button 
                 onClick={() => navigate('/profile-setup')}
                 className="w-full mt-8 py-5 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 hover:text-white hover:border-indigo-500/50 transition-all font-bold uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2"
               >
                 Re-Analyze Profile Sequence <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
