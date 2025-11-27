import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from './types';

interface ChatbotMessageProps {
  message: Message;
}

const ChatbotMessage: React.FC<ChatbotMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      {isBot && (
        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isBot
            ? 'bg-gray-100 text-text-dark rounded-tl-sm'
            : 'bg-primary text-white rounded-tr-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isBot ? 'text-text-muted' : 'text-white/80'}`}>
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      {!isBot && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatbotMessage;
