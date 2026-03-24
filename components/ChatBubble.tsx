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
  const textRef = useRef(text);
  const completedRef = useRef('');

  useEffect(() => {
    // 如果已完成且文本没变，直接显示
    if (completedRef.current === text && isComplete) {
      return;
    }
    
    textRef.current = text;
    
    if (skipTyping) {
      setDisplayText(text);
      setIsComplete(true);
      completedRef.current = text;
      return;
    }
    
    // 只有当文本真正改变时才重置
    if (displayText === text) {
      return;
    }
    
    setDisplayText('');
    setIsComplete(false);
    hasCalledComplete.current = false;
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < textRef.current.length) {
        setDisplayText(textRef.current.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        completedRef.current = textRef.current;
        if (onComplete && !hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onComplete();
        }
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, skipTyping]); // 移除 onComplete 依赖

  // 完成后直接显示完整文本
  if (isComplete) {
    return <span>{text}</span>;
  }

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
  
  // 简单文本渲染
  const renderSimpleText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };
  
  // 审判机内容格式化 - 简单分段
  const renderJudgeContent = (text: string) => {
    // 按句号、问号、换行分割段落
    const paragraphs = text
      .replace(/([。？？])\s*/g, '$1\n')
      .split('\n')
      .filter(p => p.trim());
    
    return paragraphs.map((para, index) => {
      const trimmed = para.trim();
      if (!trimmed) return null;
      
      // 判断是否是核心问题（以问号结尾）
      const isQuestion = trimmed.endsWith('？') || trimmed.endsWith('?');
      
      // 提取选项（A. B.）
      const optionMatch = trimmed.match(/[AB]\.\s*([^\n]+)/g);
      
      if (optionMatch) {
        return (
          <div key={index} className="space-y-3 mt-4">
            {optionMatch.map((opt, i) => {
              const content = opt.replace(/^[AB]\.\s*/, '').split('[SEP]')[0].trim();
              return (
                <div 
                  key={i} 
                  className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-blue-600 shrink-0">
                    {opt.startsWith('A.') ? 'A' : 'B'}
                  </span>
                  <span className="font-medium text-slate-700">
                    {content}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }
      
      // 段落判断
      const isTransition = trimmed.includes('问你') || trimmed.includes('问你：') || trimmed.includes('问你：');
      
      // 普通段落
      return (
        <p key={index} className={`mb-4 ${isQuestion ? 'font-bold text-slate-900 text-center text-lg' : isTransition ? 'text-center text-slate-500 mt-4' : 'text-slate-700 text-center'}`}>
          {trimmed}
        </p>
      );
    });
  };

  // ===== 审判机样式 =====
  if (isJudge) {
    return (
      <div className="flex w-full mb-6 justify-center">
        <div className="max-w-[95%] md:max-w-[80%]">
          {/* 角色标识 - 居中 */}
          <div className="flex flex-col items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg ring-4 ring-blue-500/10">
              <span className="text-lg">⚖️</span>
            </div>
            <span className="text-sm font-bold text-slate-700 mt-2">
              {language === 'zh' ? '审判机' : 'THE JUDGE'}
            </span>
          </div>
          
          {/* 消息气泡 - 白色背景 + 左边框强调 */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-l-blue-600">
            <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-slate-800 font-serif text-center">
              {renderJudgeContent(rawContent)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPhilosopher) {
    const philosopherKey = Object.keys(philosopherAvatars).find(k => message.speaker?.includes(k));
    const avatar = philosopherKey ? philosopherAvatars[philosopherKey] : { emoji: '🧑‍🏫', bg: 'bg-white', border: 'border-purple-200' };
    
    return (
      <div className="flex w-full mb-5 justify-start">
        <div className="max-w-[85%]">
          <div className="flex items-center gap-2 mb-2 ml-2">
            <div className={`w-9 h-9 rounded-full ${avatar.bg} border-2 border-purple-200 flex items-center justify-center shadow-sm`}>
              <span className="text-lg">{avatar.emoji}</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{message.speaker}</span>
          </div>
          
          {/* 消息气泡 - 白色背景 + 紫色左边框强调 */}
          <div className="relative group">
            <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-l-purple-500 pl-5">
              {/* 引号装饰 */}
              <div className="absolute top-0 left-2 text-4xl text-purple-200 font-serif leading-none select-none">"</div>
              
              {/* 提取主要内容和动作描写 - 支持中文和英文括号 */}
              {(() => {
                // 匹配末尾的中文括号或英文括号
                const actionMatch = rawContent.match(/[（\(][^）\)]+[）\)]$/);
                if (actionMatch) {
                  const mainContent = rawContent.slice(0, actionMatch.index).trim();
                  return (
                    <>
                      <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 pl-3 font-sans">
                        {shouldUseTypewriter ? (
                          <TypewriterText text={mainContent} speed={20} onComplete={handleTypingComplete} />
                        ) : (
                          renderSimpleText(mainContent)
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400 italic">
                          {actionMatch[0]}
                        </span>
                      </div>
                    </>
                  );
                }
                return (
                  <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 pl-3 font-sans">
                    {shouldUseTypewriter ? (
                      <TypewriterText text={rawContent} speed={20} onComplete={handleTypingComplete} />
                    ) : (
                      renderSimpleText(rawContent)
                    )}
                  </div>
                );
              })()}
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
              <div className="text-base leading-relaxed whitespace-pre-wrap text-white font-sans">
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
        <div className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-800">
            {shouldUseTypewriter ? (
              <TypewriterText text={rawContent} onComplete={handleTypingComplete} />
            ) : (
              renderSimpleText(rawContent)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
