import React, { useState, useEffect, useRef } from 'react';
import { Message, Language } from '../types';
import { Scale } from 'lucide-react';

// 导入增强主题
import { JUDGE_THEME, PHILOSOPHER_AVATARS, getPhilosopherTheme } from './CharacterThemes';

interface ChatBubbleProps {
  message: Message;
  language: Language;
  onTyping?: () => void;
  skipTyping?: boolean;
}

// 格式化时间
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

// 打字机组件
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

  // ===== 审判机样式 - 增强版 =====
  if (isJudge) {
    const theme = JUDGE_THEME;
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="max-w-[90%] md:max-w-[75%]">
          {/* 角色标识 - 带金色光晕 */}
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-sm">⚖️</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700 tracking-wide">
                {language === 'zh' ? '审判机' : 'THE JUDGE'}
              </span>
              <span className="text-[10px] text-amber-600/70 uppercase tracking-widest">
                {language === 'zh' ? '命运审判者' : 'DESTINY ARBITER'}
              </span>
            </div>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          </div>
          
          {/* 消息气泡 - 羊皮纸风格 + 金色装饰 */}
          <div className={`
            ${theme.bubble.bg} border-2 ${theme.bubble.border} rounded-2xl p-5 
            ${theme.bubble.shadow} relative overflow-hidden
          `}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-tr-full"></div>
            
            <div className="border-b border-slate-300/40 mb-4 pb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500/60" />
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/40 to-transparent" />
            </div>
            
            <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-gray-800 font-serif relative z-10">
              {renderFormattedText(rawContent)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== 哲学家样式 - 增强版 =====
  if (isPhilosopher) {
    const philosopherKey = Object.keys(PHILOSOPHER_AVATARS).find(k => message.speaker?.includes(k));
    const theme = getPhilosopherTheme(message.speaker);
    const avatar = philosopherKey ? PHILOSOPHER_AVATARS[philosopherKey] : { 
      emoji: '🧑‍🏫', 
      bg: 'bg-gray-50', 
      border: 'border-gray-200', 
      gradient: 'from-purple-500 to-indigo-500', 
      accent: 'text-purple-600' 
    };
    
    return (
      <div className="flex w-full mb-5 justify-start">
        <div className="max-w-[85%]">
          {/* 角色标识 - 带主题色光晕 */}
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div className="relative">
              <div className={`w-9 h-9 rounded-full ${avatar.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-lg">{avatar.emoji}</span>
              </div>
              <div className={`absolute inset-0 rounded-full ${avatar.accent.replace('text-', 'bg-')}/30 blur-md animate-pulse`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${theme.role.nameColor}`}>{message.speaker}</span>
              <span className={`text-[10px] ${theme.role.nameEnColor} uppercase tracking-widest`}>
                {language === 'zh' ? '哲学回应' : 'PHILOSOPHICAL RESPONSE'}
              </span>
            </div>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          </div>
          
          {/* 消息气泡 - 主题色装饰 */}
          <div className="relative group">
            <div className={`absolute -left-2 top-4 w-0 h-0 border-t-8 border-r-8 border-b-8 border-r-transparent border-t-transparent border-b-transparent ${avatar.bg}`}></div>
            
            <div className={`
              ${avatar.bg} px-5 py-4 rounded-2xl shadow-md border-2 ${avatar.border} 
              relative overflow-hidden transition-all duration-300 group-hover:shadow-lg
            `}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${avatar.gradient}`} />
              <div className={`absolute -top-1 -left-1 text-5xl ${avatar.accent} font-serif leading-none opacity-30`}>"</div>
              
              <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-800 pl-4 font-heiti relative z-10">
                {shouldUseTypewriter ? (
                  <TypewriterText text={rawContent} speed={20} onComplete={handleTypingComplete} />
                ) : (
                  renderFormattedText(rawContent)
                )}
              </div>
              
              {/* 动作描写 */}
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

  // ===== 用户消息 =====
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

  // ===== 默认助手样式 =====
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
