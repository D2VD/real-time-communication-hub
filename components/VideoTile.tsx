import React, { useEffect, useRef } from 'react';
import { Participant } from '../types.ts';
import { MicOffIcon, UserIcon, VideoOffIcon } from './Icons.tsx';
import EditableName from './EditableName.tsx';

interface VideoTileProps {
  participant: Participant;
  onRenameParticipant: (participantId: string, newName: string) => void;
  isVirtualBackgroundLoading?: boolean;
  volume?: number;
}

const VideoTile: React.FC<VideoTileProps> = ({ participant, onRenameParticipant, isVirtualBackgroundLoading, volume }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      // Don't re-attach stream if it's the same object, prevents flickering
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
    } else if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, [participant.stream]);

  useEffect(() => {
    if (videoRef.current && !participant.isLocal && volume !== undefined) {
      videoRef.current.volume = volume;
    }
  }, [volume, participant.isLocal]);

  const showVideo = participant.stream && !participant.isVideoOff;
  const isLoading = participant.isLocal && isVirtualBackgroundLoading && !participant.isVideoOff;

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg flex items-center justify-center h-full w-full">
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={`w-full h-full object-cover ${participant.isLocal && !participant.isScreenShare ? 'transform scaleX-[-1]' : ''}`}
        ></video>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full">
           <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
            <UserIcon className="w-14 h-14 text-gray-500" />
           </div>
          <span className="mt-4 text-xl font-semibold">{participant.name}</span>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white font-semibold">Applying effect...</div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center space-x-2">
           {participant.isMuted && <MicOffIcon />}
           {participant.isVideoOff && !showVideo && <VideoOffIcon />}
           <EditableName
              initialName={participant.name}
              onNameChange={(newName) => onRenameParticipant(participant.id, newName)}
              className="font-semibold text-white shadow-black/50 text-shadow"
              inputClassName="w-full bg-transparent text-white font-semibold outline-none border-b border-blue-400"
            />
        </div>
      </div>
    </div>
  );
};

export default VideoTile;