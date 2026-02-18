
import React, { useState, useEffect } from 'react';
import { getMeetingAssistantAdvice } from '../services/geminiService';

interface LandingProps {
  onJoin: (room: string, name: string) => void;
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
      onJoin(roomId, userName);
    }
  };

  const generateAIAgenda = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const agenda = await getMeetingAssistantAdvice(topic);
    setAiAgenda(agenda);
    setIsGenerating(false);
  };

  const createRandomRoom = () => {
    const random = Math.random().toString(36).substring(2, 10);
    setRoomId(random);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Authenticated as {defaultName}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Seamless Calls. <br />
          <span className="gradient-text">AI Powered.</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
          Experience the next generation of video collaboration. Crystal clear 4K calling with integrated AI assistants to handle your agendas, notes, and summaries.
        </p>

        <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
          <div className="p-4 rounded-2xl glass border-white/5">
            <div className="text-xl md:text-2xl font-bold text-white">4K</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Video</div>
          </div>
          <div className="p-4 rounded-2xl glass border-white/5">
            <div className="text-xl md:text-2xl font-bold text-white">256b</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Encrypted</div>
          </div>
          <div className="p-4 rounded-2xl glass border-white/5">
            <div className="text-xl md:text-2xl font-bold text-white">AI</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Planner</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25"></div>
        <div className="relative glass p-6 md:p-10 rounded-3xl shadow-2xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {initialRoomId ? 'Join Invited Room' : 'Create a Room'}
            </h2>
            <p className="text-sm text-slate-400">Welcome back, {defaultName}. Ready to meet?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Display Name</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Room ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter Room ID"
                    required
                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  {!initialRoomId && (
                    <button 
                      type="button"
                      onClick={createRandomRoom}
                      className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl border border-white/10 hover:bg-slate-700 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-4">
              <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                AI Meeting Planner
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Meeting topic for AI agenda..."
                  className="flex-1 bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-white placeholder:text-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
                <button 
                  type="button"
                  onClick={generateAIAgenda}
                  disabled={isGenerating || !topic}
                  className="px-4 bg-indigo-600 disabled:opacity-50 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Plan'}
                </button>
              </div>
              {aiAgenda && (
                <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-sm text-slate-300 animate-in fade-in slide-in-from-top-2">
                  <div className="prose prose-invert prose-sm">
                    {aiAgenda.split('\n').map((line, i) => <p key={i} className="my-1">{line}</p>)}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              Enter Meeting
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;
