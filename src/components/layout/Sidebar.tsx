import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Brain, 
  Code2, 
  Users, 
  FileText, 
  Building2, 
  UserCircle, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Terminal,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mock/aptitude', label: 'Aptitude Test', icon: Brain },
    { to: '/mock/coding', label: 'Coding Round', icon: Code2 },
    { to: '/mock/technical', label: 'Technical Depth', icon: Terminal },
    { to: '/mock/hr', label: 'HR Interview', icon: Users },
    { to: '/history', label: 'Transmission Logs', icon: History },
    { to: '/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
    { to: '/company-list', label: 'Companies', icon: Building2 },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile Header (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30 font-display text-sm">
            iA
          </div>
          <span className="text-xl font-black tracking-tighter text-white font-display uppercase italic">
            Intervu<span className="text-indigo-500">AI</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#020617]/98 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <NavLink 
              to="/dashboard" 
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-sm">
                iA
              </div>
              <span className="text-xl font-black tracking-tighter text-white font-display uppercase italic">
                Intervu<span className="text-indigo-500">AI</span>
              </span>
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 px-2">Main Protocols</p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }: { isActive: boolean }) => cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold uppercase tracking-tight text-xs",
                  isActive 
                    ? "bg-indigo-600/10 text-white border border-indigo-500/30" 
                    : "hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-5 h-5 text-indigo-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Core</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-80 bg-[#020617] border-r border-white/5 flex flex-col hidden lg:flex h-screen sticky top-0 overflow-y-auto no-scrollbar">
        <div className="p-10">
          <NavLink to="/dashboard" className="flex items-center gap-3 mb-16 px-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/30 font-display">
              iA
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-display uppercase italic">Intervu<span className="text-indigo-500">AI</span></span>
          </NavLink>

          <nav className="space-y-2">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 px-4">Main Protocols</p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) => cn(
                  "flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group font-bold uppercase tracking-tight text-xs",
                  isActive 
                    ? "bg-indigo-600/10 text-white border border-indigo-500/30 shadow-2xl shadow-indigo-500/10" 
                    : "hover:bg-white/5 text-slate-500 hover:text-slate-200 border border-transparent"
                )}
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <div className="flex items-center gap-4">
                      <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400")} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="active-pill" className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10">
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl mb-6">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Link Active</span>
             </div>
             <p className="text-[10px] text-slate-400 font-light leading-relaxed">System ready for haptic simulation.</p>
          </div>
          
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-black uppercase tracking-widest border border-transparent hover:border-red-400/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout Core</span>
          </button>
        </div>
      </aside>
    </>
  );
}

