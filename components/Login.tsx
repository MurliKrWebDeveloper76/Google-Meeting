
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-slate-950">
      {/* Animated background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20"></div>
        <div className="relative glass p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 mt-2">Sign in to start your next meeting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Your Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to NexusMeet's <br />
              <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
