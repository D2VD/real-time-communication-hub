import React, { useState } from 'react';
import { Participant, Message, VirtualBackground } from '../types';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import ControlBar from './ControlBar';
import ScreenShareIndicator from './ScreenShareIndicator';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import VirtualBackgroundPanel from './VirtualBackgroundPanel';


interface CallViewProps {
    participants: Participant[];
    setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onLeaveCall: () => void;
    isSharingScreen: boolean;
    onToggleScreenShare: () => void;
    screenStream: MediaStream | null;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onRenameParticipant: (participantId: string, newName: string) => void;
    backgroundSettings: VirtualBackground;
    onBackgroundChange: (bg: VirtualBackground) => void;
    isVirtualBackgroundLoading: boolean;
}

const CallView: React.FC<CallViewProps> = ({ 
    participants, 
    setParticipants, 
    messages, 
    onSendMessage, 
    onLeaveCall, 
    isSharingScreen, 
    onToggleScreenShare,
    screenStream,
    onToggleMic,
    onToggleCamera,
    onRenameParticipant,
    backgroundSettings,
    onBackgroundChange,
    isVirtualBackgroundLoading
}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isBgPanelOpen, setIsBgPanelOpen] = useState(false);
    const [volume, setVolume] = useState(1);
    
    const localParticipant = participants.find(p => p.isLocal);
    const hasRemoteParticipants = participants.some(p => !p.isLocal);

    return (
        <div className="flex h-full w-full relative overflow-hidden">
            {isSharingScreen && localParticipant?.isScreenShare && (
              <ScreenShareIndicator onStopSharing={onToggleScreenShare} />
            )}
            
            <main className={`flex-1 transition-all duration-300 ease-in-out ${isChatOpen ? 'pr-[320px]' : 'pr-0'}`}>
                <div className="h-full flex flex-col relative">
                    <VideoGrid 
                        participants={participants} 
                        screenStream={screenStream} 
                        onRenameParticipant={onRenameParticipant}
                        isVirtualBackgroundLoading={isVirtualBackgroundLoading}
                        volume={volume}
                    />
                    {isBgPanelOpen && (
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                             <VirtualBackgroundPanel
                                onBackgroundChange={onBackgroundChange}
                                onClose={() => setIsBgPanelOpen(false)}
                            />
                        </div>
                    )}
                    <ControlBar
                        isMuted={localParticipant?.isMuted ?? false}
                        isVideoOff={localParticipant?.isVideoOff ?? false}
                        isChatOpen={isChatOpen}
                        isSharingScreen={isSharingScreen}
                        isBgPanelOpen={isBgPanelOpen}
                        hasBackground={backgroundSettings.type !== 'none'}
                        volume={volume}
                        onVolumeChange={setVolume}
                        showVolumeControl={hasRemoteParticipants}
                        onToggleMute={onToggleMic}
                        onToggleVideo={onToggleCamera}
                        onToggleChat={() => setIsChatOpen(!isChatOpen)}
                        onToggleScreenShare={onToggleScreenShare}
                        onToggleBgPanel={() => setIsBgPanelOpen(prev => !prev)}
                        onEndCall={onLeaveCall}
                    />
                </div>
            </main>
            <div className={`absolute top-0 right-0 h-full w-[320px] bg-gray-800/80 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <ChatPanel 
                    messages={messages} 
                    onSendMessage={onSendMessage} 
                    onClose={() => setIsChatOpen(false)} 
                    participants={participants}
                    onRenameParticipant={onRenameParticipant}
                 />
            </div>
             <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`absolute top-1/2 -translate-y-1/2 z-20 p-2 bg-gray-700/80 hover:bg-gray-600 rounded-l-full transition-all duration-300 ease-in-out ${isChatOpen ? 'right-[320px]' : 'right-0'}`}
                title={isChatOpen ? "Close Chat" : "Open Chat"}
            >
                {isChatOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
        </div>
    );
};

export default CallView;