
import React from 'react';
import { Message, Language } from '../types';

interface ChatBubbleProps {
  message: Message;
  language: Language;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, language }) => {
  const isAssistant = message.role === 'assistant';
  
  const renderFormattedText = (text: string) => {
    // 简单的 Markdown 粗体转换 (**text** -> <b>text</b>)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getDisplayContent = (text: string) => {
    if (!isAssistant) return text;
    
    let parts = text.split('[SEP]');
    if (parts.length < 2) {
      parts = text.split(' / ');
    }
    
    if (parts.length < 2) return text;
    
    const content = language === 'zh' ? parts[0] : parts[1];
    return content.trim();
  };

  const displayContent = getDisplayContent(message.content);

  return (
    <div className={`flex w-full mb-8 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[90%] md:max-w-[75%] px-8 py-5 rounded-[2rem] shadow-sm transition-all duration-500 hover:shadow-md ${
          isAssistant 
            ? 'bg-white text-gray-800 border border-indigo-50/50 rounded-tl-none font-heiti' 
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}
      >
        <div className={`text-lg md:text-xl leading-relaxed tracking-wide whitespace-pre-wrap ${isAssistant ? 'italic' : ''}`}>
          {renderFormattedText(displayContent)}
        </div>
        <div className={`mt-3 flex items-center gap-2 opacity-40 text-[10px] ${isAssistant ? 'text-gray-400' : 'text-indigo-200'}`}>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isAssistant && <div className="w-1 h-1 rounded-full bg-indigo-300" />}
        </div>
      </div>
    </div>
  );
};
