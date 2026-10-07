import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-lg flex items-center justify-center font-bold text-slate-950 transition-transform group-hover:scale-110">
            iA
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-display">Intervu<span className="text-indigo-400">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-indigo-400 transition-colors">Features</a>
          <a href="#mock" className="text-sm font-medium hover:text-indigo-400 transition-colors text-indigo-400">Mock Interview</a>
          <a href="#companies" className="text-sm font-medium hover:text-indigo-400 transition-colors">Companies</a>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          {currentUser ? (
            <Link to="/dashboard" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-indigo-500/20 transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium hover:text-indigo-400 transition-colors">Login</Link>
              <Link to="/auth?mode=signup" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-indigo-500/20 transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          {currentUser ? (
            <Link to="/dashboard" className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth?mode=signup" className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
              Sign Up
            </Link>
          )}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-white/10 px-6 py-4 space-y-4">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-indigo-400 py-1"
          >
            Features
          </a>
          <a 
            href="#mock" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-indigo-400 py-1"
          >
            Mock Interview
          </a>
          <a 
            href="#companies" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-indigo-400 py-1"
          >
            Companies
          </a>
          <div className="pt-2 border-t border-slate-800 flex gap-4">
            {currentUser ? (
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-900 border border-slate-800 text-white text-sm font-medium rounded-xl"
                >
                  Login
                </Link>
                <Link 
                  to="/auth?mode=signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
