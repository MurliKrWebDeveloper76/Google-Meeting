import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Landing from './components/Landing';
import MeetingRoom from './components/MeetingRoom';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('nexusmeet_user'));
  const [meetingState, setMeetingState] = useState<{
    isInCall: boolean;
    roomId: string;
    userName: string;
  }>({
    isInCall: false,
    roomId: '',
    userName: '',
  });

  // Check for room ID in URL on load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setMeetingState(prev => ({ ...prev, roomId: urlRoom }));
      }
    } catch (e) {
      console.warn('URL parsing failed', e);
    }
  }, []);

  const handleLogin = (name: string) => {
    localStorage.setItem('nexusmeet_user', name);
    setUser(name);
  };

  const handleJoin = (roomId: string, userName: string) => {
    // Update URL to include the room ID so it's bookmarkable/shareable
    // Wrap in try-catch to prevent SecurityError in restricted environments (blob urls)
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomId);
      window.history.pushState({}, '', url);
    } catch (e) {
      console.warn('URL update restricted in this environment', e);
    }

    setMeetingState({
      isInCall: true,
      roomId,
      userName,
    });
  };

  const handleLeave = () => {
    // Remove room from URL on leave
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.pushState({}, '', url);
    } catch (e) {
      console.warn('URL reset restricted in this environment', e);
    }

    setMeetingState(prev => ({
      ...prev,
      isInCall: false,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('nexusmeet_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {!meetingState.isInCall && (
        <>
          <Header />
          <div className="fixed top-24 right-6 z-50">
            <button 
              onClick={handleLogout}
              className="glass px-4 py-2 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {user} (Logout)
            </button>
          </div>
        </>
      )}
      
      <main>
        {meetingState.isInCall ? (
          <MeetingRoom 
            roomId={meetingState.roomId} 
            userName={meetingState.userName} 
            onLeave={handleLeave} 
          />
        ) : (
          <Landing 
            onJoin={handleJoin} 
            initialRoomId={meetingState.roomId}
            defaultName={user}
          />
        )}
      </main>

      {!meetingState.isInCall && (
        <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>© 2025 NexusMeet AI. Secure P2P communication powered by ZegoCloud & Gemini AI.</p>
        </footer>
      )}
    </div>
  );
};

export default App;