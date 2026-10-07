import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, User as UserIcon, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleGoogleSignInClick = () => {
    setInfoMessage('Google sign-in will be available in the production authentication setup. Please sign in with email and password below.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (!isLogin) {
      const cleanName = fullName.trim();
      if (!cleanName) {
        setError('Please enter your name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        const hasProfile = await signIn(cleanEmail, password);
        if (hasProfile) {
          navigate('/dashboard');
        } else {
          navigate('/profile-setup');
        }
      } else {
        await signUp(fullName.trim(), cleanEmail, password);
        navigate('/profile-setup');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = (newModeIsLogin: boolean) => {
    setIsLogin(newModeIsLogin);
    setError(null);
    setInfoMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <Briefcase className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">{isLogin ? 'WELCOME BACK' : 'JOIN INTERVAI'}</h2>
          <p className="text-slate-400 font-light">Master your interviews with AI intelligence.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-semibold"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </motion.div>
        )}

        {infoMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center gap-3 text-indigo-300 text-xs font-semibold"
          >
            <Info className="w-5 h-5 shrink-0 text-indigo-400" />
            <span>{infoMessage}</span>
          </motion.div>
        )}

        <div className="space-y-2 mb-8">
          <button 
            type="button"
            onClick={handleGoogleSignInClick}
            className="w-full py-4 px-6 bg-white/90 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-semibold pt-1">
            Google sign-in will be available in the production authentication setup.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">OR EMAIL</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name" 
                className="w-full py-4 pr-6 pl-14 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-light"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" 
              className="w-full py-4 pr-6 pl-14 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-light"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full py-4 pr-14 pl-14 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 mt-4 tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm font-light">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button"
            onClick={() => toggleMode(!isLogin)}
            className="text-indigo-400 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

