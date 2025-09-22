import React, { useState, useEffect, useCallback } from 'react';
import Lobby from './components/Lobby';
import CallView from './components/CallView';
import { Participant, Message, VirtualBackground } from './types';
import ErrorNotification from './components/ErrorNotification';
import useVirtualBackground from './hooks/useVirtualBackground';

const App: React.FC = () => {
  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  
  const [rawLocalStream, setRawLocalStream] = useState<MediaStream | null>(null);
  const [backgroundSettings, setBackgroundSettings] = useState<VirtualBackground>({ type: 'none' });
  const [participants, setParticipants] = useState<Participant[]>([]);

  const localParticipant = participants.find(p => p.isLocal);
  const isVideoOn = localParticipant ? !localParticipant.isVideoOff : false;

  const { processedStream, isProcessing } = useVirtualBackground(rawLocalStream, backgroundSettings, isVideoOn);
  
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localStream = backgroundSettings.type === 'none' ? rawLocalStream : processedStream;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (isInCall && userName) {
        const streamToUse = backgroundSettings.type === 'none' ? rawLocalStream : (processedStream || rawLocalStream);
        
        const localParticipant: Participant = {
            id: 'local',
            name: userName,
            stream: streamToUse ?? undefined,
            isMuted: !rawLocalStream?.getAudioTracks()[0]?.enabled,
            isVideoOff: !rawLocalStream?.getVideoTracks()[0]?.enabled,
            isLocal: true,
            isScreenShare: isSharingScreen,
        };

        setParticipants(prev => {
            const existingLocal = prev.find(p => p.isLocal);
            if (existingLocal) {
                return prev.map(p => p.isLocal ? { ...localParticipant, name: p.name, stream: streamToUse ?? p.stream } : p);
            }
            // Mock other participants only on initial join
            const mockParticipants: Participant[] = [
                { id: '1', name: 'Alex', isMuted: true, isVideoOff: false },
                { id: '2', name: 'Brenda', isMuted: false, isVideoOff: true },
                { id: '3', name: 'Charlie', isMuted: false, isVideoOff: false },
            ];
            return [localParticipant, ...mockParticipants];
        });

    }
  }, [isInCall, userName, rawLocalStream, processedStream, backgroundSettings.type, isSharingScreen]);


  const handleJoinCall = useCallback((name: string, stream: MediaStream, background: VirtualBackground) => {
    setUserName(name);
    setRawLocalStream(stream);
    setBackgroundSettings(background);
    setIsInCall(true);

    // Add a welcome message
    setMessages([{
        id: Date.now(),
        senderId: 'system',
        senderName: 'System',
        text: `Welcome to the call, ${name}!`,
        timestamp: new Date(),
    }]);

  }, []);

  const handleLeaveCall = useCallback(() => {
    rawLocalStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    setRawLocalStream(null);
    setScreenStream(null);
    setIsSharingScreen(false);
    setIsInCall(false);
    setParticipants([]);
    setMessages([]);
    setUserName('');
    setBackgroundSettings({ type: 'none' });
  }, [rawLocalStream, screenStream]);

  const handleSendMessage = (text: string) => {
    try {
      if (!text.trim()) return;
      const localParticipant = participants.find(p => p.isLocal);
      if (!localParticipant) {
        throw new Error("Local participant not found.");
      };

      const newMessage: Message = {
        id: Date.now(),
        senderId: localParticipant.id,
        senderName: localParticipant.name,
        text,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Could not send message. Please try again.");
    }
  };
  
  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach(track => track.stop());
    setScreenStream(null);
    setIsSharingScreen(false);
    setParticipants(prev =>
      prev.map(p => (p.isLocal ? { ...p, isScreenShare: false } : p))
    );
  }, [screenStream]);

  const handleToggleScreenShare = useCallback(async () => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        stream.getVideoTracks()[0].onended = stopScreenShare;
        
        setScreenStream(stream);
        setIsSharingScreen(true);
        setParticipants(prev =>
          prev.map(p => (p.isLocal ? { ...p, isScreenShare: true } : p))
        );

      } catch (err) {
        console.error('Error starting screen share:', err);
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
            setError('Screen share permission was denied or cancelled.');
        } else {
            setError('An unknown error occurred while trying to share the screen.');
        }
      }
    }
  }, [isSharingScreen, stopScreenShare]);

  const handleToggleMic = useCallback(() => {
    if (!rawLocalStream) return;
    const enabled = !rawLocalStream.getAudioTracks()[0]?.enabled;
    rawLocalStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
    setParticipants(prev =>
      prev.map(p => (p.isLocal ? { ...p, isMuted: !enabled } : p))
    );
  }, [rawLocalStream]);

  const handleToggleCamera = useCallback(() => {
    if (!rawLocalStream) return;
    const enabled = !rawLocalStream.getVideoTracks()[0]?.enabled;
    rawLocalStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
    setParticipants(prev =>
      prev.map(p => (p.isLocal ? { ...p, isVideoOff: !enabled } : p))
    );
  }, [rawLocalStream]);

  const handleRenameParticipant = (participantId: string, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    setParticipants(prev =>
      prev.map(p => (p.id === participantId ? { ...p, name: trimmedName } : p))
    );
    
    if (participantId === 'local') {
      setUserName(trimmedName);
    }
  };


  useEffect(() => {
    // Clean up streams on component unmount
    return () => {
      rawLocalStream?.getTracks().forEach(track => track.stop());
      screenStream?.getTracks().forEach(track => track.stop());
    };
  }, [rawLocalStream, screenStream]);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
      <ErrorNotification message={error} onClose={() => setError(null)} />
      {!isInCall ? (
        <Lobby onJoin={handleJoinCall} />
      ) : (
        <CallView 
          participants={participants}
          setParticipants={setParticipants}
          messages={messages}
          onSendMessage={handleSendMessage}
          onLeaveCall={handleLeaveCall}
          isSharingScreen={isSharingScreen}
          onToggleScreenShare={handleToggleScreenShare}
          screenStream={screenStream}
          onToggleMic={handleToggleMic}
          onToggleCamera={handleToggleCamera}
          onRenameParticipant={handleRenameParticipant}
          backgroundSettings={backgroundSettings}
          onBackgroundChange={setBackgroundSettings}
          isVirtualBackgroundLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default App;