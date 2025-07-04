import React, { useState } from 'react';
import ChatImageUpload from './ChatImageUpload.tsx';

interface ChatInputProps {
  onSend: (content: string) => void;
  onImageSend?: (imageUrl: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onImageSend }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    if (onImageSend) {
      onImageSend(imageUrl);
    }
  };

  return (
    <div className="flex-shrink-0 px-4 py-3 bg-brand-pink-50 border-t border-brand-pink-200/50">
      <form onSubmit={handleSend} className="relative flex items-center bg-white rounded-full shadow-sm p-1 border border-brand-pink-100">
        {/* Image Upload Button */}
        <div className="relative">
          <ChatImageUpload 
            onImageUpload={handleImageUpload}
            className="flex-shrink-0"
          />
        </div>
        
        {/* Text Input */}
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Message" 
          className="flex-1 bg-transparent px-2 py-1.5 focus:outline-none text-brand-pink-900 placeholder-brand-pink-400/70"
        />
        
        {/* Send Button */}
        <button 
          type="submit" 
          className="flex-shrink-0 p-2 text-white bg-brand-pink-500 rounded-full hover:bg-brand-pink-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
