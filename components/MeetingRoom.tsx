
import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface MeetingRoomProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomId, userName, onLeave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isTroubleshooting, setIsTroubleshooting] = useState(false);

  const inviteUrl = window.location.origin + window.location.pathname + '?room=' + roomId;

  // Proactive permission check
  const requestPermissions = async () => {
    setInitError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      setHasPermissions(true);
    } catch (err: any) {
      console.error("Permission request failed:", err);
      setHasPermissions(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setInitError("Permission Denied: Camera and microphone access was blocked. Please click the camera icon in your browser's address bar to reset permissions and reload.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setInitError("Hardware Not Found: We couldn't detect a camera or microphone connected to your device.");
      } else {
        setInitError("Access Error: " + (err.message || "Unable to access media devices."));
      }
    }
  };

  useEffect(() => {
    // Initial check on mount
    const checkStatus = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideo = devices.some(d => d.kind === 'videoinput' && d.label !== '');
          const hasAudio = devices.some(d => d.kind === 'audioinput' && d.label !== '');
          
          if (hasVideo && hasAudio) {
            setHasPermissions(true);
          } else {
            setHasPermissions(null);
          }
        } catch (e) {
          setHasPermissions(null);
        }
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    let zpInstance: any = null;
    let isMounted = true;

    const initMeeting = async () => {
      if (!containerRef.current || !isMounted || !hasPermissions) return;

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setInitError("WebRTC requires a Secure Context (HTTPS or localhost).");
        return;
      }

      try {
        const appID = 1137215650; 
        const serverSecret = "c82eee809ddcf29679d77b2ca46cb724";
        const userID = userName === "Murlikumar" ? "Murlikumar" : `user_${Math.floor(Math.random() * 10000)}`;
        
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userID,
          userName
        );

        if (!isMounted) return;

        zpInstance = ZegoUIKitPrebuilt.create(kitToken);
        
        zpInstance.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          sharedLinks: [{
            name: 'Invite Link',
            url: inviteUrl,
          }],
          showScreenSharingButton: true,
          showTextChat: true,
          showUserHideUserList: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          onLeaveRoom: () => {
            if (isMounted) onLeave();
          },
        });
      } catch (err) {
        if (isMounted) {
          console.error("ZegoCloud Init Error:", err);
          setInitError(err instanceof Error ? err.message : "Failed to connect to video services.");
        }
      }
    };

    if (hasPermissions) {
      const timeoutId = setTimeout(initMeeting, 400);
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        if (zpInstance && typeof zpInstance.destroy === 'function') {
          zpInstance.destroy();
        }
      };
    }
  }, [roomId, userName, onLeave, inviteUrl, hasPermissions]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'NexusMeet AI', url: inviteUrl });
      } catch (e) { handleCopyLink(); }
    } else { handleCopyLink(); }
  };

  // Permission UI logic
  if (hasPermissions === false || (hasPermissions === null && !initError)) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 glass p-10 rounded-3xl border border-indigo-500/20 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 relative">
             <svg className={`w-10 h-10 ${hasPermissions === false ? 'text-red-400' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {hasPermissions === false && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              {hasPermissions === false ? 'Permission Blocked' : 'Equipment Authorization'}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {hasPermissions === false 
                ? "You've previously blocked camera access. To join, you must manually reset permissions in your browser settings."
                : "NexusMeet requires access to your camera and microphone to begin the secure video session."
              }
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={requestPermissions}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              {hasPermissions === false ? 'Try Again' : 'Grant Access & Join'}
            </button>
            
            {hasPermissions === false && (
              <button 
                onClick={() => setIsTroubleshooting(!isTroubleshooting)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-semibold transition-all"
              >
                {isTroubleshooting ? 'Hide Guide' : 'How to unblock?'}
              </button>
            )}

            <button onClick={onLeave} className="text-slate-500 text-sm hover:text-white transition-colors font-medium py-2">
              Cancel & Go Back
            </button>
          </div>

          {isTroubleshooting && (
            <div className="text-left bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4 animate-in slide-in-from-top-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                <p className="text-xs text-slate-400">Look at the right side of your address bar (or the left lock icon).</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                <p className="text-xs text-slate-400">Click the <span className="text-white font-bold">Camera Icon</span> or <span className="text-white font-bold">Site Settings</span>.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                <p className="text-xs text-slate-400">Change "Blocked" to <span className="text-indigo-400 font-bold">"Allow"</span> for camera and microphone.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">4</div>
                <p className="text-xs text-slate-400">Reload the page to apply changes.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6 glass p-10 rounded-3xl border border-red-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{String(initError)}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { setInitError(null); setHasPermissions(null); }}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold"
            >
              Try Again
            </button>
            <button onClick={onLeave} className="w-full py-3 bg-white/5 text-slate-400 rounded-2xl font-bold">Return to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative flex flex-col overflow-hidden">
      <div className="absolute top-6 left-6 z-20 flex gap-3">
        <button onClick={onLeave} className="p-3 px-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 backdrop-blur-xl transition-all flex items-center gap-2 font-bold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>Leave</span>
        </button>
        <button onClick={() => setShowInvite(!showInvite)} className={`p-3 px-5 glass text-white rounded-xl border transition-all flex items-center gap-2 font-bold ${showInvite ? 'border-indigo-500/50 text-indigo-400' : 'border-white/10'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          <span>Invite</span>
        </button>
      </div>

      {showInvite && (
        <div className="absolute top-24 left-6 z-30 w-full max-w-xs animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="glass p-6 rounded-2xl border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className