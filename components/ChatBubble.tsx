
import React, { useState, useEffect, useRef } from 'react';
import { Message, Language } from '../types';

interface ChatBubbleProps {
  message: Message;
  language: Language;
  onTyping?: () => void;
  skipTyping?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, language }) => {
  const isAssistant = message.role === 'assistant';
  
  const rawContent = message.content.trim();
  
  const renderFormattedText = (text: string) => {
    return renderBasicMarkdown(text);
  };

  const renderBasicMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderSpeakerHeader = () => {
    if (!message.speaker) return null;
    
    if (message.speaker === 'Judge') {
      return (
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-widest uppercase mb-3 pb-3 border-b border-slate-100">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-[12px]">⚖️</span>
          </div>
          {language === 'zh' ? '审判机' : 'The Judge'}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-widest uppercase mb-3 pb-3 border-b border-indigo-50/50">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-[12px]">🎭</span>
        </div>
        {message.speaker}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-8 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[90%] md:max-w-[75%] px-8 py-5 rounded-[2rem] shadow-sm transition-all duration-500 hover:shadow-md ${
          isAssistant 
            ? 'bg-white text-gray-800 border border-indigo-50/50 rounded-tl-none font-heiti' 
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}
      >
        {renderSpeakerHeader()}
        <div className={`text-lg md:text-xl leading-relaxed tracking-wide whitespace-pre-wrap ${isAssistant ? 'italic' : ''}`}>
          {renderFormattedText(rawContent)}
        </div>
        <div className={`mt-3 flex items-center gap-2 opacity-40 text-[10px] ${isAssistant ? 'text-gray-400' : 'text-indigo-200'}`}>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isAssistant && <div className="w-1 h-1 rounded-full bg-indigo-300" />}
        </div>
      </div>
    </div>
  );
};
