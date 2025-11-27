import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Question } from './types';

interface ChatbotQuestionsProps {
  questions: Question[];
  onQuestionClick: (questionId: string, questionText: string) => void;
}

const ChatbotQuestions: React.FC<ChatbotQuestionsProps> = ({ questions, onQuestionClick }) => {
  if (questions.length === 0) return null;

  return (
    <div className="px-4 pb-4 bg-white border-t border-border-color">
      <p className="text-xs text-text-muted mb-3 pt-3">Choose a question:</p>
      <div className="grid grid-cols-1 gap-2">
        {questions.map((question) => (
          <button
            key={question.id}
            onClick={() => onQuestionClick(question.id, question.text)}
            className="w-full text-left px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary-light transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-dark group-hover:text-primary transition-colors">
                  {question.text}
                </p>
                <p className="text-xs text-text-muted mt-1">{question.category}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatbotQuestions;
