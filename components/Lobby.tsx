import React, { useState, useEffect, useRef } from 'react';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, UserIcon, SparklesIcon } from './Icons';
import { VirtualBackground } from '../types';
import useVirtualBackground from '../hooks/useVirtualBackground';
import VirtualBackgroundPanel from './VirtualBackgroundPanel';

interface LobbyProps {
  onJoin: (name: string, stream: MediaStream, background: VirtualBackground) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  const [name, setName] = useState<string>('');
  const [rawStream, setRawStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [backgroundSettings, setBackgroundSettings] = useState<VirtualBackground>({ type: 'none' });
  const [isBgPanelOpen, setIsBgPanelOpen] = useState(false);

  const { processedStream, isProcessing } = useVirtualBackground(rawStream, backgroundSettings, !isVideoOff);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const displayStream = backgroundSettings.type === 'none' ? rawStream : processedStream;

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        
        stream.getAudioTracks()[0].enabled = !isMuted;
        stream.getVideoTracks()[0].enabled = !isVideoOff;
        
        setRawStream(stream);
      } catch (err) {
        console.error('Error accessing media devices.', err);
        if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError') {
                setError('Camera and microphone access was denied. Please enable permissions in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera or microphone found. Please ensure your devices are connected and enabled.');
            } else {
                setError('An error occurred while accessing your camera and microphone.');
            }
        } else {
            setError('Could not access camera and microphone due to an unknown error.');
        }
      }
    };
    getMedia();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && displayStream) {
        videoRef.current.srcObject = displayStream;
    }
  }, [displayStream]);


  const handleJoin = () => {
    if (name.trim() && rawStream) {
      onJoin(name, rawStream, backgroundSettings);
    } else if (!name.trim()) {
      setError('Please enter your name.');
    } else {
       setError('Media stream is not ready.');
    }
  };

  const handleToggleMic = () => {
    if (rawStream) {
      const newMutedState = !isMuted;
      rawStream.getAudioTracks().forEach(track => (track.enabled = !newMutedState));
      setIsMuted(newMutedState);
    }
  };

  const handleToggleCamera = () => {
    if (rawStream) {
      const newVideoOffState = !isVideoOff;
      rawStream.getVideoTracks().forEach(track => (track.enabled = !newVideoOffState));
      setIsVideoOff(newVideoOffState);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 space-y-6 relative">
        <h1 className="text-3xl font-bold text-center text-white">Join Call</h1>
        
        <div className={`relative w-full aspect-video bg-black rounded-md overflow-hidden border-2 transition-colors ${error ? 'border-red-500' : 'border-gray-700'}`}>
          {error ? (
            <div className="flex items-center justify-center h-full text-center text-red-400 p-4">{error}</div>
          ) : isVideoOff ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <UserIcon />
              {name && <span className="mt-2 text-xl font-semibold">{name}</span>}
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scaleX-[-1]"></video>
              {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-white font-semibold">Applying effect...</div>
                  </div>
              )}
            </>
          )}

          {rawStream && !error && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-3">
              <button
                onClick={handleToggleMic}
                title={isMuted ? 'Unmute' : 'Mute'}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700/80 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </button>
              <button
                onClick={handleToggleCamera}
                title={isVideoOff ? 'Turn video on' : 'Turn video off'}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700/80 hover:bg-gray-600'
                }`}
              >
                {isVideoOff ? <VideoOffIcon /> : <VideoIcon />}
              </button>
              <button
                onClick={() => setIsBgPanelOpen(prev => !prev)}
                title="Virtual Background"
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  backgroundSettings.type !== 'none' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700/80 hover:bg-gray-600'
                }`}
              >
                <SparklesIcon />
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim() || !rawStream}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            Join Call
          </button>
        </div>

        {isBgPanelOpen && (
            <div className="absolute bottom-full mb-4 left-0 right-0 z-10">
                <VirtualBackgroundPanel 
                    onBackgroundChange={setBackgroundSettings}
                    onClose={() => setIsBgPanelOpen(false)}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;