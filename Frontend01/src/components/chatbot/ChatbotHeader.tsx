import React from 'react';
import { X, Bot, RotateCcw } from 'lucide-react';

interface ChatbotHeaderProps {
  onClose: () => void;
  onReset: () => void;
}

const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({ onClose, onReset }) => {
  return (
    <div className="bg-primary text-white px-4 py-4 rounded-t-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Agroreach Assistant</h3>
          <p className="text-xs text-primary-light">Always here to help</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          aria-label="Reset chat"
          title="Start new conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close chatbot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatbotHeader;
