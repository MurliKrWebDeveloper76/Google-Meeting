import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { getRealtimeAdvice, AIResponse, generateMeetingSummary } from '../services/geminiService';

interface MeetingRoomProps {
  roomId: string;
  userName: string;
  initialAgenda?: string;
  onLeave: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomId, userName, initialAgenda, onLeave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiData, setAiData] = useState<AIResponse>({ 
    text: initialAgenda 
      ? `Nexus Intelligence: Objectives Loaded\n${initialAgenda}` 
      : 'Neural link established. I am monitoring for data requests, research, or session summaries.' 
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  const requestPermissions = async () => {
    setInitError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support media capture or is in an insecure context.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermissions(true);
    } catch (err: any) {
      setHasPermissions(false);
      if (err.name === 'NotAllowedError') {
        setInitError("Access Denied: Please enable camera and microphone permissions in your browser.");
      } else {
        setInitError("Hardware Error: Unable to locate a valid camera or microphone device.");
      }
    }
  };

  useEffect(() => {
    const checkMedia = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (devices.some(d => d.kind === 'videoinput' && d.label !== '')) {
          setHasPermissions(true);
        }
      } catch (e) { 
        console.warn("NexusMeet: Permission probe incomplete.", e); 
      }
    };
    checkMedia();
  }, []);

  useEffect(() => {
    let zp: any = null;
    let mounted = true;

    const initializeSession = async () => {
      if (!containerRef.current || !mounted || !hasPermissions) return;
      try {
        const appID = 1137215650; 
        const serverSecret = "c82eee809ddcf29679d77b2ca46cb724";
        const userID = `user_${Math.floor(Math.random() * 10000)}`;
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, userID, userName);
        
        if (!mounted) return;
        
        zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: containerRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
          sharedLinks: [{ name: 'Session Uplink', url: inviteUrl }],
          showScreenSharingButton: true,
          showTextChat: true,
          showUserHideUserList: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          onLeaveRoom: () => { if (mounted) onLeave(); },
          onJoinRoom: () => { if (mounted) setIsJoined(true); }
        });
      } catch (err) {
        if (mounted) setInitError("Nexus Protocol: Failed to establish secure cloud bridge.");
      }
    };

    if (hasPermissions) {
      const tid = setTimeout(initializeSession, 600);
      return () => {
        mounted = false;
        clearTimeout(tid);
        if (zp?.destroy) zp.destroy();
      };
    }
  }, [roomId, userName, onLeave, inviteUrl, hasPermissions]);

  const askAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim() || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const res = await getRealtimeAdvice(aiMessage, initialAgenda);
      setAiData(res);
      setAiMessage('');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSummary = async () => {
    setIsAiLoading(true);
    try {
      const summary = await generateMeetingSummary(`Meeting Topic: ${initialAgenda || 'None'}. Room ID: ${roomId}. User ${userName} requested a final synthesis.`);
      setAiData({ text: summary });
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (hasPermissions === false) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md glass p-10 rounded-[2.5rem] border border-indigo-500/20 space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 shadow-2xl">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Required</h2>
            <p className="text-slate-400 text-sm leading-relaxed">Hardware permissions are necessary to establish a secure peer-to-peer visual handshake.</p>
          </div>
          <button onClick={requestPermissions} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
            Authorize Hardware
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative flex flex-col overflow-hidden">
      {/* Session Controls HUD */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={onLeave} className="p-3.5 px-6 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl border border-red-500/20 backdrop-blur-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl">
            Terminate Call
          </button>
          <button 
            onClick={() => { setShowInvite(!showInvite); setShowAISidebar(false); }} 
            className={`p-3.5 px-6 glass text-white rounded-2xl border transition-all text-[10px] uppercase font-black tracking-[0.2em] shadow-2xl ${showInvite ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10'}`}
          >
            Invite Guests
          </button>
        </div>
        
        <button 
          onClick={() => { setShowAISidebar(!showAISidebar); setShowInvite(false); }} 
          className={`p-3.5 px-7 glass rounded-2xl border transition-all flex items-center gap-3 font-black shadow-2xl pointer-events-auto ${showAISidebar ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-white/10 text-white'}`}
        >
          <span className={`w-2 h-2 rounded-full ${showAISidebar ? 'bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-white/40'}`}></span>
          <span className="text-[10px] tracking-[0.25em] uppercase">Intelligence</span>
        </button>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef} 
        className={`w-full h-full z-10 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${showAISidebar ? 'pr-[360px]' : ''} ${!isJoined ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
      />

      {/* Neural Handshake Loading Overlay */}
      {!isJoined && !initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-0">
          <div className="flex flex-col items-center gap-10 animate-in fade-in duration-1000">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-2 border-indigo-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-purple-500/10 rounded-full"></div>
              <div className="absolute inset-4 border-b-2 border-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-indigo-400 font-black tracking-[0.5em] text-[11px] uppercase animate-pulse">Establishing Nexus Uplink</p>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Securing Peer-to-Peer Mesh</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Neural Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-[360px] glass border-l border-white/10 z-30 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${showAISidebar ? 'translate-x-0' : 'translate-x-full shadow-[-30px_0_60px_rgba(0,0,0,0.5)]'}`}>
        <div className="flex flex-col h-full p-8 pt-24">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Neural Interface</h3>
              <p className="text-[9px] text-purple-400 font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-purple-400 animate-ping"></span>
                Insights Active
              </p>
            </div>
            <button onClick={() => setShowAISidebar(false)} className="text-slate-500 hover:text-white transition-all p-2 bg-white/5 rounded-xl border border-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-2 scrollbar-hide">
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-3xl p-7 text-xs text-slate-300 relative overflow-hidden group min-h-[180px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-all duration-700"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-[11px] text-white font-black shadow-xl">AI</div>
                  <span className="font-black text-[10px] text-purple-100 uppercase tracking-widest">Gemini Engine</span>
                </div>
                <button 
                  onClick={handleSummary} 
                  className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest bg-purple-500/5 px-3 py-1.5 rounded-lg border border-purple-500/10 transition-all active:scale-95"
                >
                  Recap
                </button>
              </div>
              
              {isAiLoading ? (
                <div className="space-y-4 py-4 relative z-10 animate-pulse">
                  <div className="h-2.5 bg-white/5 rounded-full w-full"></div>
                  <div className="h-2.5 bg-white/5 rounded-full w-4/5"></div>
                  <div className="h-2.5 bg-white/5 rounded-full w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="whitespace-pre-wrap leading-relaxed font-medium text-slate-200 text-[13px]">{aiData.text}</p>
                  
                  {aiData.sources && (
                    <div className="pt-5 border-t border-white/10 space-y-3">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Grounding Data:
                      </p>
                      <div className="grid gap-2">
                        {aiData.sources.map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-900 rounded-2xl text-[11px] text-slate-400 hover:text-white transition-all border border-white/5 group/link">
                            <svg className="w-3.5 h-3.5 text-purple-500 group-hover/link:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            <span className="truncate font-bold">{s.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={askAI} className="space-y-4 relative z-10">
            <div className="relative group">
              <textarea 
                value={aiMessage} 
                onChange={(e) => setAiMessage(e.target.value)} 
                placeholder="Request research, trends, or data..." 
                className="w-full bg-slate-900/60 border border-white/5 rounded-3xl p-6 text-[13px] text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500/50 h-36 resize-none transition-all shadow-2xl" 
              />
              <div className="absolute bottom-5 right-5 text-[9px] text-slate-700 font-black uppercase tracking-widest group-focus-within:text-purple-500/50 transition-colors">
                Gemini Pro v3
              </div>
            </div>
            <button 
              disabled={isAiLoading || !aiMessage.trim()} 
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 text-white rounded-2xl text-[11px] font-black tracking-[0.3em] uppercase transition-all shadow-2xl shadow-purple-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isAiLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Synthesizing
                </>
              ) : 'Execute Query'}
            </button>
          </form>
        </div>
      </div>

      {/* Invitations Panel Overlay */}
      {showInvite && (
        <div className="absolute top-24 left-6 z-30 w-full max-w-[320px] animate-in fade-in slide-in-from-left-6 duration-500">
          <div className="glass p-10 rounded-[2.5rem] border border-indigo-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2.5 h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Session Entry</h3>
              <button onClick={() => setShowInvite(false)} className="text-slate-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-950/80 border border-white/5 rounded-2xl mb-8 shadow-inner">
              <input type="text" readOnly value={inviteUrl} className="bg-transparent text-[10px] text-slate-500 outline-none w-full truncate font-mono select-all" />
              <button onClick={copyLink} className={`p-3 rounded-xl transition-all shadow-xl active:scale-90 ${copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                {copied ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                )}
              </button>
            </div>
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest font-black">{copied ? 'Identity Uplink Copied' : 'Share this URL with collaborators'}</p>
          </div>
        </div>
      )}

      {/* Critical Handshake Error State */}
      {initError && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-50 text-center backdrop-blur-xl">
          <div className="max-w-md glass p-12 rounded-[3rem] border border-red-500/20 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500 mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Neural Handshake Failed</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">{initError}</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600/20 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Restart Uplink Protocol</button>
            <button onClick={onLeave} className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-8 block mx-auto hover:text-white transition-all">Abort To Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;