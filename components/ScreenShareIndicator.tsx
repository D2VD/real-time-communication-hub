import React from 'react';

interface ScreenShareIndicatorProps {
  onStopSharing: () => void;
}

const ScreenShareIndicator: React.FC<ScreenShareIndicatorProps> = ({ onStopSharing }) => {
  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="flex items-center justify-center space-x-4 bg-gray-800/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-sm">You are sharing your screen</span>
        </div>
        <button
          onClick={onStopSharing}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors"
        >
          Stop Sharing
        </button>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ScreenShareIndicator;
