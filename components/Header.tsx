
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 glass border-b border-white/5 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Nexus<span className="text-indigo-400">Meet</span></span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Solutions</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Enterprise</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm font-semibold text-white px-4 py-2 hover:bg-white/5 rounded-full transition-all">
          Sign In
        </button>
        <button className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
          Get Started
        </button>
      </div>
    </header>
  );
};

export default Header;
