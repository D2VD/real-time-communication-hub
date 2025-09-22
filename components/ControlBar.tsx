import React from 'react';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneMissedCallIcon, ChatIcon, ScreenShareIcon, SparklesIcon, VolumeUpIcon, VolumeOffIcon } from './Icons.tsx';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isChatOpen: boolean;
  isSharingScreen: boolean;
  isBgPanelOpen: boolean;
  hasBackground: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  showVolumeControl: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onToggleScreenShare: () => void;
  onToggleBgPanel: () => void;
  onEndCall: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode; title: string }> = ({ onClick, className = '', children, title }) => {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white ${className}`}
        >
            {children}
        </button>
    );
};


const ControlBar: React.FC<ControlBarProps> = ({ 
    isMuted, 
    isVideoOff, 
    isChatOpen, 
    isSharingScreen, 
    isBgPanelOpen,
    hasBackground,
    volume,
    onVolumeChange,
    showVolumeControl,
    onToggleMute, 
    onToggleVideo, 
    onToggleChat, 
    onToggleScreenShare, 
    onToggleBgPanel,
    onEndCall 
}) => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm p-3 rounded-full">
        {showVolumeControl && (
          <>
            <div className="flex items-center space-x-2 group px-2">
              <div className="text-white">
                {volume > 0 ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(e.target.valueAsNumber)}
                className="w-0 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 group-hover:w-24 transition-all duration-300"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
          </>
        )}
        
        <ControlButton 
            onClick={onToggleMute}
            className={isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
            title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </ControlButton>
        
        <ControlButton 
            onClick={onToggleVideo}
            className={isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
            title={isVideoOff ? "Turn video on" : "Turn video off"}
        >
          {isVideoOff ? <VideoOffIcon /> : <VideoIcon />}
        </ControlButton>

        <ControlButton
          onClick={onToggleScreenShare}
          className={isSharingScreen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}
          title={isSharingScreen ? "Stop sharing" : "Share screen"}
        >
          <ScreenShareIcon />
        </ControlButton>

        <ControlButton
          onClick={onToggleBgPanel}
          className={isBgPanelOpen || hasBackground ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}
          title="Effects"
        >
            <SparklesIcon />
        </ControlButton>

        <ControlButton
          onClick={onToggleChat}
          className={isChatOpen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}
          title={isChatOpen ? "Close chat" : "Open chat"}
        >
          <ChatIcon />
        </ControlButton>

        <div className="w-px h-8 bg-gray-600 mx-2"></div>
        
        <ControlButton
          onClick={onEndCall}
          className="bg-red-500 hover:bg-red-600"
          title="End call"
        >
          <PhoneMissedCallIcon />
        </ControlButton>
      </div>
    </div>
  );
};

export default ControlBar;