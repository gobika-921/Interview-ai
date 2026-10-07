import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserInterviews, deleteInterview } from '../lib/firestoreUtils';
import { Interview } from '../types';
import { 
  Brain, 
  Code2, 
  Users, 
  Terminal, 
  Building2, 
  Clock, 
  ChevronRight, 
  Trophy, 
  FileText, 
  Trash2, 
  Filter, 
  Search, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HistoryPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const uid = currentUser?.uid || userProfile?.uid;
    if (uid) {
      const list = await getUserInterviews(uid);
      setInterviews(list as Interview[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser, userProfile]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this interview record?')) {
      await deleteInterview(id);
      loadData();
    }
  };

  const filtered = interviews.filter(item => {
    const matchType = selectedType === 'all' || item.type === selectedType;
    const matchSearch = searchQuery.trim() === '' || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const avgScore = interviews.length > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / interviews.length)
    : 0;

  const bestScore = interviews.length > 0
    ? Math.max(...interviews.map(i => i.score || 0))
    : 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'aptitude': return <Brain className="text-indigo-400 w-6 h-6" />;
      case 'coding': return <Code2 className="text-emerald-400 w-6 h-6" />;
      case 'technical': return <Terminal className="text-emerald-400 w-6 h-6" />;
      case 'hr': return <Users className="text-purple-400 w-6 h-6" />;
      case 'company': return <Building2 className="text-amber-400 w-6 h-6" />;
      default: return <FileText className="text-slate-400 w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest text-[10px] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Command Center
          </button>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white font-display">
            Archival <span className="text-gradient">Core</span>
          </h1>
          <p className="text-slate-400 font-light mt-2 text-sm">
            Complete transmission records of your mock interviews, algorithmic evaluations, and diagnostic reports.
          </p>
        </div>

        {/* Quick stat cards */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 glass rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Completed</span>
            <span className="text-2xl font-black text-white">{interviews.length}</span>
          </div>
          <div className="px-5 py-3 glass rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Average</span>
            <span className="text-2xl font-black text-indigo-400">{avgScore}%</span>
          </div>
          <div className="px-5 py-3 glass rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Best</span>
            <span className="text-2xl font-black text-emerald-400">{bestScore}%</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'aptitude', label: 'Aptitude' },
            { id: 'coding', label: 'Coding' },
            { id: 'technical', label: 'Technical' },
            { id: 'hr', label: 'HR Behavioral' },
            { id: 'company', label: 'Enterprise' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="pl-11 pr-4 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Records list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/feedback/${item.id}`)}
                className="group flex flex-col md:flex-row md:items-center justify-between p-7 bg-slate-950/50 border border-slate-800/80 rounded-[32px] hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all gap-6 cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center border border-white/5 shadow-xl transition-transform group-hover:scale-105">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-white uppercase tracking-tight text-lg group-hover:text-indigo-400 transition-colors">
                        {item.title || `${item.company ? item.company + ' • ' : ''}${item.type} Engagement`}
                      </h3>
                      {item.company && (
                        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-md text-[9px] font-bold uppercase tracking-widest border border-amber-500/20">
                          {item.company}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-800"></span>
                      <span className="text-emerald-400">{item.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Efficiency Index</p>
                    <p className="text-3xl font-black text-white font-display tracking-tight">
                      {item.score ?? '--'}<span className="text-xs text-slate-500 font-normal ml-0.5">/100</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Delete record"
                      className="h-11 w-11 glass rounded-2xl flex items-center justify-center text-slate-600 hover:text-red-400 hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="h-12 w-12 glass rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all text-slate-400">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-24 glass rounded-[40px] border border-dashed border-slate-800">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">No Records Found</h3>
            <p className="text-slate-500 text-xs font-light max-w-sm mx-auto mb-6">
              {searchQuery || selectedType !== 'all'
                ? 'No interview sessions matched your active filters. Try resetting the search or filter.'
                : 'No interviews completed yet. Start your first mock interview to begin tracking your progress.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors"
            >
              Start First Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
