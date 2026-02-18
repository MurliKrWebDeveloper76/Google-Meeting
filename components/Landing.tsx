import React, { useState, useEffect } from 'react';
import { getMeetingAssistantAdvice } from '../services/geminiService';

interface LandingProps {
  onJoin: (room: string, name: string, agenda?: string) => void;
  initialRoomId?: string;
  defaultName: string;
}

const Landing: React.FC<LandingProps> = ({ onJoin, initialRoomId, defaultName }) => {
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [userName, setUserName] = useState(defaultName || '');
  const [topic, setTopic] = useState('');
  const [aiAgenda, setAiAgenda] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialRoomId) setRoomId(initialRoomId);
  }, [initialRoomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && userName) {
      onJoin(roomId, userName, aiAgenda || undefined);
    }
  };

  const generateAIAgenda = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const agenda = await getMeetingAssistantAdvice(topic);
      setAiAgenda(agenda);
    } finally {
      setIsGenerating(false);
    }
  };

  const createRandomRoom = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoomId(random);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Uplink Active: {defaultName}
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
          Future of <br />
          <span className="gradient-text">Collaboration.</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-xl leading-relaxed font-medium">
          NexusMeet AI transcends standard video calls. We integrate Gemini AI directly into your secure P2P stream to handle the heavy lifting while you focus on what matters.
        </p>

        <div className="grid grid-cols-3 gap-4 md:gap-6">
          <div className="p-6 rounded-3xl glass border-white/5 group hover:border-indigo-500/30 transition-all duration-500 shadow-xl">
            <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">4K</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2 group-hover:text-indigo-400 transition-colors">Ultra-HD Stream</div>
          </div>
          <div className="p-6 rounded-3xl glass border-white/5 group hover:border-indigo-500/30 transition-all duration-500 shadow-xl">
            <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">P2P</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2 group-hover:text-indigo-400 transition-colors">Direct Mesh</div>
          </div>
          <div className="p-6 rounded-3xl glass border-white/5 group hover:border-indigo-500/30 transition-all duration-500 shadow-xl">
            <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">AI</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2 group-hover:text-indigo-400 transition-colors">Neural Co-Pilot</div>
          </div>
        </div>
      </div>

      <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[2.5rem] blur opacity-20 animate-pulse-slow"></div>
        <div className="relative glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {initialRoomId ? 'Secure Entry' : 'New Session'}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initialization Protocol</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">Confirm Display Identity</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">Session Identifier</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="e.g. ALPHA-X"
                    required
                    className="flex-1 bg-slate-900/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono uppercase tracking-widest"
                  />
                  {!initialRoomId && (
                    <button 
                      type="button"
                      onClick={createRandomRoom}
                      className="px-5 py-4 bg-slate-800/50 text-slate-400 rounded-2xl border border-white/10 hover:bg-slate-700/50 hover:text-white transition-all shadow-lg active:scale-95"
                      title="Generate Random Room"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] ml-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                AI Meeting Planner (Optional)
              </label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic for automated agenda..."
                  className="flex-1 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl px-6 py-4 text-white placeholder:text-indigo-900/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                />
                <button 
                  type="button"
                  onClick={generateAIAgenda}
                  disabled={isGenerating || !topic}
                  className="px-6 bg-indigo-600 disabled:opacity-50 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 active:scale-95 flex items-center justify-center min-w-[80px]"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Prep'}
                </button>
              </div>
              
              {aiAgenda && (
                <div className="p-6 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-xs text-slate-300 animate-in fade-in slide-in-from-top-4 duration-500 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Neural Output: Agenda</span>
                    <button type="button" onClick={() => setAiAgenda(null)} className="text-slate-600 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="space-y-2 font-medium leading-relaxed italic opacity-80">
                    {aiAgenda.split('\n').filter(l => l.trim()).map((line, i) => (
                      <p key={i} className="flex gap-3 items-start">
                        <span className="text-indigo-500 shrink-0 mt-1">●</span>
                        {line.replace(/^[-\d.]\s*/, '')}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-sm group"
            >
              <span className="group-hover:tracking-[0.3em] transition-all duration-500">Establish Neural Link</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;