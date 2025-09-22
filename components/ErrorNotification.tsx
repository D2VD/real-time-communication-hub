import React from 'react';
import { XIcon } from './Icons.tsx';

interface ErrorNotificationProps {
  message: string | null;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-down">
      <span>{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-red-700 transition-colors">
        <XIcon />
      </button>
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ErrorNotification;