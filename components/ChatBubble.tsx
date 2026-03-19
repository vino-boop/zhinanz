import React, { useState, useEffect, useRef } from 'react';
import { Message, Language } from '../types';

interface ChatBubbleProps {
  message: Message;
  language: Language;
  onTyping?: () => void;
  skipTyping?: boolean;
}

const philosopherAvatars: Record<string, { emoji: string; bg: string; border: string }> = {
  '加缪': { emoji: '😤', bg: 'bg-amber-50', border: 'border-amber-200' },
  '萨特': { emoji: '☕', bg: 'bg-brown-50', border: 'border-amber-100' },
  '尼采': { emoji: '🔥', bg: 'bg-red-50', border: 'border-red-200' },
  '康德': { emoji: '📜', bg: 'bg-slate-50', border: 'border-slate-200' },
  '叔本华': { emoji: '🌧️', bg: 'bg-gray-50', border: 'border-gray-200' },
  '马可·奥勒留': { emoji: '🏛️', bg: 'bg-amber-50', border: 'border-amber-200' },
  '克尔凯郭尔': { emoji: '😰', bg: 'bg-blue-50', border: 'border-blue-200' },
  '边沁': { emoji: '📊', bg: 'bg-green-50', border: 'border-green-200' },
  '罗尔斯': { emoji: '⚖️', bg: 'bg-blue-50', border: 'border-blue-200' },
  '亚里士多德': { emoji: '🎓', bg: 'bg-purple-50', border: 'border-purple-200' },
  '马克思': { emoji: '🔨', bg: 'bg-red-50', border: 'border-red-200' },
  '柏拉图': { emoji: '🏛️', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  '休谟': { emoji: '🤔', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '笛卡尔': { emoji: '💭', bg: 'bg-purple-50', border: 'border-purple-200' },
  '释迦牟尼': { emoji: '🧘', bg: 'bg-orange-50', border: 'border-orange-200' },
  '洛克': { emoji: '📝', bg: 'bg-blue-50', border: 'border-blue-200' },
  '黑格尔': { emoji: '⚡', bg: 'bg-slate-50', border: 'border-slate-200' },
  '海德格尔': { emoji: '🌊', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  '斯宾诺莎': { emoji: '✨', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '庄子': { emoji: '🦋', bg: 'bg-green-50', border: 'border-green-200' },
  '维特根斯坦': { emoji: '📖', bg: 'bg-amber-50', border: 'border-amber-200' },
  '列维纳斯': { emoji: '🤝', bg: 'bg-blue-50', border: 'border-blue-200' },
  '德里达': { emoji: '🔀', bg: 'bg-pink-50', border: 'border-pink-200' },
  '波普尔': { emoji: '❌', bg: 'bg-red-50', border: 'border-red-200' },
  '威廉·詹姆斯': { emoji: '🔧', bg: 'bg-blue-50', border: 'border-blue-200' },
  '皮尔士': { emoji: '🔍', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  '杜威': { emoji: '🎯', bg: 'bg-green-50', border: 'border-green-200' },
  '贝克莱': { emoji: '👁️', bg: 'bg-purple-50', border: 'border-purple-200' },
  '博斯特罗姆': { emoji: '🖥️', bg: 'bg-slate-50', border: 'border-slate-200' },
  '普特南': { emoji: '🧠', bg: 'bg-blue-50', border: 'border-blue-200' },
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void; skipTyping?: boolean }> = ({ 
  text, 
  speed = 25,
  onComplete,
  skipTyping = false
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    if (skipTyping) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }
    
    setDisplayText('');
    setIsComplete(false);
    hasCalledComplete.current = false;
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        if (onComplete && !hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onComplete();
        }
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, skipTyping, speed, onComplete]);

  return (
    <span>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-slate-400 ml-0.5 animate-pulse align-middle"></span>
      )}
    </span>
  );
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, language, onTyping, skipTyping = false }) => {
  const isAssistant = message.role === 'assistant';
  const isJudge = message.speaker === 'Judge';
  const isPhilosopher = isAssistant && !isJudge && message.speaker;
  
  const rawContent = message.content.trim();
  const shouldUseTypewriter = !skipTyping;
  
  const handleTypingComplete = () => {
    onTyping?.();
  };
  
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (isJudge) {
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="max-w-[90%] md:max-w-[75%]">
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
              <span className="text-sm">⚖️</span>
            </div>
            <span className="text-xs text-slate-500 font-medium tracking-wide">
              {language === 'zh' ? '审判机' : 'The Judge'}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          </div>
          
          <div className="bg-gradient-to-br from-[#f5f0e6] to-[#ebe4d4] border-2 border-slate-200/60 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full"></div>
            <div className="border-b border-slate-300/40 mb-4 pb-3"></div>
            
            <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-gray-800 font-serif">
              {renderFormattedText(rawContent)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPhilosopher) {
    const philosopherKey = Object.keys(philosopherAvatars).find(k => message.speaker?.includes(k));
    const avatar = philosopherKey ? philosopherAvatars[philosopherKey] : { emoji: '🧑‍🏫', bg: 'bg-gray-50', border: 'border-gray-200' };
    
    return (
      <div className="flex w-full mb-5 justify-start">
        <div className="max-w-[85%]">
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div className={`w-8 h-8 rounded-full ${avatar.bg} ${avatar.border} border flex items-center justify-center shadow-sm`}>
              <span className="text-sm">{avatar.emoji}</span>
            </div>
            <span className="text-sm font-medium text-slate-600">{message.speaker}</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          </div>
          
          <div className="relative group">
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-r-8 border-b-8 border-r-transparent border-t-transparent border-b-transparent"></div>
            <div className={`${avatar.bg} px-5 py-4 rounded-2xl shadow-sm border ${avatar.border} relative`}>
              <div className="absolute -top-2 -left-1 text-4xl text-slate-300/50 font-serif leading-none">"</div>
              
              <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-800 pl-3 font-heiti">
                {shouldUseTypewriter ? (
                  <TypewriterText text={rawContent} speed={20} onComplete={handleTypingComplete} />
                ) : (
                  renderFormattedText(rawContent)
                )}
              </div>
              
              {rawContent.includes('（') && rawContent.includes('）') && (
                <div className="mt-2 text-xs text-slate-400/60 italic pl-3 font-heiti">
                  {rawContent.match(/（[^）]+）/)?.[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAssistant) {
    return (
      <div className="flex w-full mb-5 justify-end">
        <div className="max-w-[85%]">
          <div className="flex items-center justify-end gap-2 mb-2 mr-2">
            <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          </div>
          <div className="relative group">
            <div className="absolute -right-2 top-4 w-0 h-0 border-t-8 border-l-8 border-b-8 border-l-transparent border-t-transparent border-b-transparent"></div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4 rounded-2xl shadow-lg">
              <div className="text-base leading-relaxed whitespace-pre-wrap text-white font-heiti">
                {shouldUseTypewriter ? (
                  <TypewriterText text={rawContent} speed={15} onComplete={handleTypingComplete} />
                ) : (
                  rawContent
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-2 ml-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-sm">✨</span>
          </div>
          <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
        </div>
        <div className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-800">
            {shouldUseTypewriter ? (
              <TypewriterText text={rawContent} onComplete={handleTypingComplete} />
            ) : (
              renderFormattedText(rawContent)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
