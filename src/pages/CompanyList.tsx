import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPANIES } from '../constants';
import { 
  Building2, 
  Users, 
  ArrowRight,
  Search,
  LayoutGrid,
  Filter,
  Star,
  Layers,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CompanyList() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white mb-2">Target Companies</h1>
          <p className="text-slate-400 font-light text-lg">Pick a company to simulate their specific hiring pattern and assessment rounds.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter giants..."
              className="bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pr-6 pl-14 text-white outline-none focus:border-indigo-500/50 transition-all font-light min-w-[300px]"
            />
          </div>
          <button className="p-4 glass rounded-2xl text-slate-400 hover:text-white transition-colors">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COMPANIES.map((company, i) => (
          <motion.div 
            key={company.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/company/${company.id}`)}
            className="group cursor-pointer glass rounded-[40px] p-8 hover:border-indigo-500/50 transition-all relative overflow-hidden"
          >
            {/* Decorative Corner */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-opacity opacity-5 ${i % 2 === 0 ? 'from-indigo-500 to-purple-500' : 'from-emerald-500 to-blue-500'}`} />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black text-white">{company.name.charAt(0)}</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-amber-500 mb-1">
                   <Star className="w-3.5 h-3.5 fill-amber-500" />
                   <span className="text-xs font-bold">4.8</span>
                </div>
                <div className="px-3 py-1 bg-indigo-500/10 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                  {company.rounds.length} ROUNDS
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">{company.name}</h2>
              
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-8">
                <MapPin className="w-3.5 h-3.5" />
                <span>Global Hiring Ready</span>
              </div>

              <div className="space-y-3 mb-8">
                {company.rounds.slice(0, 3).map((round, j) => (
                  <div key={j} className="flex items-center gap-3 text-slate-400 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <span className="font-light">{round}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-slate-950 border border-slate-800 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/20 rounded-2xl text-slate-400 font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]">
                Simulate Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
