import React from 'react';
import { Participant } from '../types.ts';
import VideoTile from './VideoTile.tsx';
import { MicOffIcon, VideoOffIcon } from './Icons.tsx';
import EditableName from './EditableName.tsx';

interface VideoGridProps {
  participants: Participant[];
  screenStream: MediaStream | null;
  onRenameParticipant: (participantId: string, newName: string) => void;
  isVirtualBackgroundLoading?: boolean;
  volume: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({ participants, screenStream, onRenameParticipant, isVirtualBackgroundLoading, volume }) => {
  const screenSharer = participants.find(p => p.isScreenShare);

  // If a participant is sharing their screen, use a dedicated layout
  if (screenSharer && screenStream) {
    const screenShareVirtualParticipant: Participant = {
      ...screenSharer,
      id: `${screenSharer.id}-screen`,
      stream: screenStream,
      isVideoOff: false, // Override isVideoOff to ensure screen share is visible
    };
    
    const thumbnailParticipants = participants;

    return (
      <div className="flex flex-col h-full w-full p-4 gap-4">
        {/* Main view for the screen share */}
        <div className="flex-grow relative">
          <VideoTile participant={screenShareVirtualParticipant} onRenameParticipant={onRenameParticipant} />
        </div>
        {/* Scrollable thumbnail strip for other participants */}
        {thumbnailParticipants.length > 0 && (
          <div className="flex-shrink-0 h-36">
            <div className="flex space-x-4 h-full w-full overflow-x-auto pb-2">
              {thumbnailParticipants.map((participant) => {
                if (participant.isLocal && participant.isScreenShare) {
                  return (
                    <div key={participant.id} className="h-full aspect-video flex-shrink-0">
                      <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="mt-2 text-sm font-semibold">Sharing Screen</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <div className="flex items-center space-x-2">
                            {participant.isMuted && <MicOffIcon />}
                            {participant.isVideoOff && <VideoOffIcon />}
                            <EditableName
                              initialName={participant.name}
                              onNameChange={(newName) => onRenameParticipant(participant.id, newName)}
                              className="font-semibold text-white shadow-black/50 text-shadow"
                              inputClassName="w-full bg-transparent text-white font-semibold outline-none border-b border-blue-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={participant.id} className="h-full aspect-video flex-shrink-0">
                     <VideoTile 
                        participant={participant} 
                        onRenameParticipant={onRenameParticipant} 
                        isVirtualBackgroundLoading={isVirtualBackgroundLoading}
                        volume={volume}
                     />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, use an optimized grid layout
  const participantCount = participants.length;
  let gridLayout = '';

  switch (participantCount) {
    case 0:
      return null; // Render nothing if no participants
    case 1:
      gridLayout = 'grid-cols-1 grid-rows-1';
      break;
    case 2:
      gridLayout = 'grid-cols-2 grid-rows-1';
      break;
    case 3:
      gridLayout = 'grid-cols-3 grid-rows-1';
      break;
    case 4:
      gridLayout = 'grid-cols-2 grid-rows-2';
      break;
    case 5:
    case 6:
      gridLayout = 'grid-cols-3 grid-rows-2';
      break;
    case 7:
    case 8:
    case 9:
      gridLayout = 'grid-cols-3 grid-rows-3';
      break;
    default:
      // For more than 9 participants, create a 4-column grid and let it wrap
      gridLayout = 'grid-cols-4';
      break;
  }

  return (
    <div className={`flex-grow p-4 grid gap-4 ${gridLayout}`}>
      {participants.map((participant) => (
        <VideoTile 
            key={participant.id} 
            participant={participant} 
            onRenameParticipant={onRenameParticipant} 
            isVirtualBackgroundLoading={isVirtualBackgroundLoading}
            volume={volume}
        />
      ))}
    </div>
  );
};

export default VideoGrid;