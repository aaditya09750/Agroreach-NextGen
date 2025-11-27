import React, { useState, useEffect } from 'react';
import ChatbotButton from './ChatbotButton';
import ChatbotHeader from './ChatbotHeader';
import ChatbotMessages from './ChatbotMessages';
import ChatbotQuestions from './ChatbotQuestions';
import { ChatbotData, Message, Question } from './types';
import chatbotDataRaw from '../../data/chatbotData.json';

const chatbotData: ChatbotData = chatbotDataRaw as ChatbotData;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [conversationStack, setConversationStack] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'bot',
      content: "Hi! 👋 Welcome to Agroreach. I'm here to help you with any questions about buying fresh vegetables, prices, quality, and more. What would you like to know?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setCurrentQuestions(chatbotData.initialQuestions);
    setConversationStack([]);
  };

  const handleQuestionClick = (questionId: string, questionText: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: questionText,
      timestamp: new Date(),
    };

    // Get conversation data
    const conversation = chatbotData.conversations[questionId];
    
    if (conversation) {
      // Add bot response
      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        type: 'bot',
        content: conversation.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);
      setCurrentQuestions(conversation.relatedQuestions);
      setConversationStack((prev) => [...prev, questionId]);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentQuestions([]);
    setConversationStack([]);
    initializeChat();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <ChatbotButton isOpen={isOpen} onClick={handleOpen} />
      
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-border-color flex flex-col z-[1000] animate-slide-up">
          <ChatbotHeader onClose={handleClose} onReset={handleReset} />
          <ChatbotMessages messages={messages} />
          <ChatbotQuestions
            questions={currentQuestions}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;
