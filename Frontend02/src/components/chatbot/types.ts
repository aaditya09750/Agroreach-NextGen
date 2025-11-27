export interface Question {
  id: string;
  text: string;
  category: string;
}

export interface Conversation {
  answer: string;
  relatedQuestions: Question[];
}

export interface ChatbotData {
  initialQuestions: Question[];
  conversations: {
    [key: string]: Conversation;
  };
}

export interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  currentQuestions: Question[];
  conversationStack: string[];
}
