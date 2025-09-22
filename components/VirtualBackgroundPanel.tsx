import React, { useRef } from 'react';
import { VirtualBackground } from '../types.ts';
import { XIcon } from './Icons.tsx';

interface VirtualBackgroundPanelProps {
  onBackgroundChange: (bg: VirtualBackground) => void;
  onClose: () => void;
}

const presetImages = [
    { name: 'Office', url: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Cafe', url: 'https://images.pexels.com/photos/1684151/pexels-photo-1684151.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Abstract', url: 'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

const OptionButton: React.FC<{ onClick: () => void; children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="w-20 h-12 bg-gray-600 rounded-lg overflow-hidden flex items-center justify-center text-sm font-semibold hover:ring-2 ring-blue-400 focus:outline-none focus:ring-2 ring-blue-400 transition"
    >
        {children}
    </button>
);


const VirtualBackgroundPanel: React.FC<VirtualBackgroundPanelProps> = ({ onBackgroundChange, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onBackgroundChange({ type: 'image', url });
        }
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    return (
        <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 w-96 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Virtual Background</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                    <XIcon />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <OptionButton onClick={() => onBackgroundChange({ type: 'none' })} title="No background">
                    <span>None</span>
                </OptionButton>
                <OptionButton onClick={() => onBackgroundChange({ type: 'blur' })} title="Blur background">
                    <span>Blur</span>
                </OptionButton>
                 <OptionButton onClick={handleUploadClick} title="Upload image">
                    <span>Upload</span>
                </OptionButton>
                
                {presetImages.map(img => (
                    <button 
                        key={img.name}
                        title={img.name}
                        onClick={() => onBackgroundChange({ type: 'image', url: img.url })}
                        className="w-20 h-12 rounded-lg overflow-hidden hover:ring-2 ring-blue-400 focus:outline-none focus:ring-2 ring-blue-400 transition"
                    >
                         <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
             <style>{`
                @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default VirtualBackgroundPanel;