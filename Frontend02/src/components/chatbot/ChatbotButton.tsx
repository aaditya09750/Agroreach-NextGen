import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ isOpen, onClick, unreadCount = 0 }) => {
  return (
    <>
      {!isOpen && (
        <button
          onClick={onClick}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-[999] animate-pulse hover:animate-none"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-sale text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </>
  );
};

export default ChatbotButton;
