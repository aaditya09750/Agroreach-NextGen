import React, { useEffect, useRef } from 'react';
import ChatbotMessage from './ChatbotMessage';
import { Message } from './types';

interface ChatbotMessagesProps {
  messages: Message[];
}

const ChatbotMessages: React.FC<ChatbotMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
      {messages.map((message) => (
        <ChatbotMessage key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatbotMessages;
