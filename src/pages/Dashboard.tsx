import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserInterviews } from '../lib/firestoreUtils';
import { Interview } from '../types';
import { 
  Trophy, 
  Target, 
  MessageSquare, 
  FileText, 
  Zap, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  Brain, 
  Code2, 
  Users, 
  Terminal,
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      const uid = currentUser?.uid || userProfile?.uid;
      if (uid) {
        const data = await getUserInterviews(uid);
        setInterviews(data as Interview[]);
      }
      setLoading(false);
    };
    fetchInterviews();
  }, [currentUser, userProfile]);

  // Real statistics derived from interviews
  const completedCount = interviews.length;
  const avgScore = completedCount > 0
    ? Math.round(interviews.reduce((a, b) => a + (b.score || 0), 0) / completedCount)
    : 0;
  const bestScore = completedCount > 0
    ? Math.max(...interviews.map(i => i.score || 0))
    : 0;

  // Breakdown by interview category
  const aptitudeInterviews = interviews.filter(i => i.type === 'aptitude');
  const codingInterviews = interviews.filter(i => i.type === 'coding');
  const technicalInterviews = interviews.filter(i => i.type === 'technical');
  const hrInterviews = interviews.filter(i => i.type === 'hr');

  const getAvg = (list: Interview[], fallback: number) => {
    if (list.length === 0) return fallback;
    return Math.round(list.reduce((acc, curr) => acc + (curr.score || 0), 0) / list.length);
  };

  const chartData = [
    { name: 'Aptitude', score: getAvg(aptitudeInterviews, completedCount > 0 ? 0 : 75), fill: '#6366f1' },
    { name: 'Coding', score: getAvg(codingInterviews, completedCount > 0 ? 0 : 80), fill: '#10b981' },
    { name: 'Technical', score: getAvg(technicalInterviews, completedCount > 0 ? 0 : 70), fill: '#38bdf8' },
    { name: 'HR/Soft', score: getAvg(hrInterviews, completedCount > 0 ? 0 : 82), fill: '#a855f7' },
  ];

  const stats = [
    { 
      label: 'Sessions Completed', 
      value: `${completedCount}`, 
      icon: Sparkles, 
      color: 'text-amber-400', 
      bg: 'bg-amber-400/10',
      badge: completedCount > 0 ? `+${completedCount} total` : 'Ready'
    },
    { 
      label: 'Average Score', 
      value: completedCount > 0 ? `${avgScore}%` : 'Ready', 
      icon: Target, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400/10',
      badge: completedCount > 0 ? 'Verified' : 'Pending'
    },
    { 
      label: 'Peak Score', 
      value: completedCount > 0 ? `${bestScore}%` : 'Ready', 
      icon: Trophy, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-400/10',
      badge: completedCount > 0 ? 'High' : 'Pending'
    },
    { 
      label: 'Resume Score', 
      value: `${userProfile?.resumeScore || 0}%`, 
      icon: FileText, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      badge: 'Profile'
    },
  ];

  return (
    <div className="space-y-10 selection:bg-indigo-500/30">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-display">
              System Active • Local Storage Core
            </span>
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white font-display">
            COMMAND <span className="text-gradient">CENTER</span>
          </h1>
          <p className="text-slate-400 font-light mt-2 max-w-lg">
            Welcome back, <span className="text-white font-semibold">{userProfile?.fullName}</span>. 
            {completedCount > 0 
              ? ` You have completed ${completedCount} mock interview ${completedCount === 1 ? 'session' : 'sessions'}. Current readiness index is ${avgScore}%.`
              : ' Start your first mock interview round below to build your readiness profile.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="p-[1px] rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20">
            <div className="bg-slate-950 px-6 py-4 rounded-[15px] flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Status</p>
                <p className="text-sm font-black text-white">INTERVAI ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass p-7 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-24 h-24 -mr-8 -mt-8" />
            </div>
            
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-5 border border-white/5`}>
              <stat.icon className={`${stat.color} w-6 h-6`} />
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 font-display">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-display tracking-tight">{stat.value}</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {stat.badge}
              </span>
            </div>
            
            <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: typeof stat.value === 'string' && stat.value.endsWith('%') ? stat.value : '100%' }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full bg-indigo-500"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        {/* Main Performance Matrix */}
        <div className="lg:col-span-2 glass p-9 rounded-[40px] relative min-w-0">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp className="text-indigo-400/30 w-12 h-12" />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display mb-1">Performance Matrix</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cross-evaluation across core rounds</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}
                  dy={15}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
                />
                <Bar dataKey="score" radius={[12, 12, 4, 4]} barSize={54}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex gap-8">
               <div className="text-center md:text-left">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Rounds</p>
                 <p className="text-lg font-black text-white">{completedCount}</p>
               </div>
               <div className="text-center md:text-left">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Accuracy</p>
                 <p className="text-lg font-black text-white">{completedCount > 0 ? `${avgScore}%` : '85%'}</p>
               </div>
            </div>
            <button 
              onClick={() => navigate('/history')}
              className="text-[10px] font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
            >
              Detailed Intelligence <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Combat Simulator (Quick Launch) */}
        <div className="glass p-9 rounded-[40px] flex flex-col border-b-[6px] border-indigo-600/30">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight font-display">Simulators</h2>
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          
          <div className="space-y-3 flex-1">
            {[
              { label: 'Aptitude Matrix', icon: Brain, color: 'bg-indigo-600', path: '/mock/aptitude' },
              { label: 'Logic Simulator', icon: Code2, color: 'bg-emerald-600', path: '/mock/coding' },
              { label: 'Technical Depth', icon: Terminal, color: 'bg-sky-600', path: '/mock/technical' },
              { label: 'Neural Protocol (HR)', icon: Users, color: 'bg-purple-600', path: '/mock/hr' },
            ].map((round, i) => (
              <motion.button 
                whileHover={{ x: 5 }}
                key={i}
                onClick={() => navigate(round.path)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl group transition-all shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 ${round.color} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10`}>
                    <round.icon className="text-white w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                      {round.label}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Start Session</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </div>
              </motion.button>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/company-list')}
            className="mt-6 w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 text-xs tracking-[0.2em]"
          >
            COMPANY PROTOCOLS
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transmission Logs (Recent Activity) */}
      <div className="glass p-9 rounded-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150">
          <Clock className="w-64 h-64" />
        </div>
        
        <div className="flex items-center justify-between mb-10">
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display mb-1">Transmission Logs</h2>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">History of your neural mock engagements</p>
           </div>
           <button 
             onClick={() => navigate('/history')}
             className="px-5 py-2 glass rounded-full text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10 transition-colors uppercase tracking-[0.2em]"
           >
             Archival Core
           </button>
        </div>
        
        <div className="space-y-4">
          {interviews.length > 0 ? interviews.slice(0, 4).map((interview, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              key={interview.id} 
              onClick={() => navigate(`/feedback/${interview.id}`)}
              className="group flex flex-col md:flex-row md:items-center justify-between p-7 bg-slate-950/40 border border-slate-800/60 rounded-[32px] hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all gap-6 cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center border border-white/5 shadow-xl transition-transform group-hover:rotate-12">
                  {interview.type === 'aptitude' ? <Brain className="text-indigo-400 w-7 h-7" /> : 
                   interview.type === 'coding' ? <Code2 className="text-emerald-400 w-7 h-7" /> : 
                   interview.type === 'technical' ? <Terminal className="text-sky-400 w-7 h-7" /> : 
                   <Users className="text-purple-400 w-7 h-7" />}
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight text-lg group-hover:text-indigo-400 transition-colors">
                    {interview.title || `${interview.company ? interview.company + ' ' : ''}${interview.type} ENGAGEMENT`}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-800"></span>
                    <span className="text-emerald-400 font-bold uppercase">{interview.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Efficiency Index</p>
                  <p className="text-3xl font-black text-white font-display tracking-tight">
                    {interview.score ?? '--'}<span className="text-xs text-slate-500 font-normal ml-0.5 opacity-50">/100</span>
                  </p>
                </div>
                <button className="h-12 w-12 glass rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-colors group/btn">
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-24 bg-slate-950/20 rounded-[40px] border border-dashed border-slate-800/60">
               <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 opacity-50">
                  <FileText className="w-8 h-8 text-slate-700" />
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">No historical data found in records.</p>
               <p className="text-slate-600 text-xs font-light max-w-sm mx-auto mb-6">Start your first mock interview to begin tracking your progress.</p>
               <button 
                onClick={() => navigate('/mock/aptitude')}
                className="px-8 py-3 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest text-[10px]"
               >
                 Initialize First Session
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
