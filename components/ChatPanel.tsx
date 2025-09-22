
import React, { useState, useRef, useEffect } from 'react';
import { Message, Participant } from '../types.ts';
import { XIcon, SendIcon } from './Icons.tsx';
import EditableName from './EditableName.tsx';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  participants: Participant[];
  onRenameParticipant: (participantId: string, newName: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onClose, participants, onRenameParticipant }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-800 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Chat</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
          <XIcon />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => {
            const sender = participants.find(p => p.id === msg.senderId);
            const currentSenderName = sender ? sender.name : msg.senderName;
            
            return (
              <div key={msg.id} className="flex flex-col items-start">
                <div className="flex items-baseline space-x-2">
                  {msg.senderId === 'system' ? (
                    <span className="font-bold text-gray-400">{currentSenderName}</span>
                  ) : (
                    <EditableName
                      initialName={currentSenderName}
                      onNameChange={(newName) => onRenameParticipant(msg.senderId, newName)}
                      className="font-bold text-blue-400"
                      inputClassName="w-full max-w-[150px] bg-gray-700 text-blue-400 font-bold outline-none border-b border-blue-500"
                    />
                  )}
                  <span className="text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="bg-gray-700 rounded-lg px-3 py-2 mt-1">{msg.text}</p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPanel;