import React, { useState, useEffect } from 'react';
import { Language, DiscoveryMode, DiscoveryResult } from '../types';
import { X, Sparkles, Settings, ChevronLeft, Languages, LogOut, Plus, MessageCircle } from 'lucide-react';

interface ChatHistory {
  id: string;
  mode: DiscoveryMode;
  modeLabel: string;
  questionCount: number;
  lastMessage: string;
  timestamp: number;
  result?: DiscoveryResult;
  isComplete: boolean;
}

interface ChatSidebarProps {
  language: Language;
  isOpen: boolean;
  onOpen: () => void;
  mode: DiscoveryMode | null;
  modeLabel: string;
  intensity: string;
  questionCount: number;
  currentHistoryId?: string;
  onStartNew: () => void;
  onOpenSettings: () => void;
  onOpenPhilosopherIntro: () => void;
  onReset: () => void;
  onChangeLang: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  language, 
  isOpen,
  onOpen,
  mode,
  modeLabel,
  intensity,
  questionCount,
  currentHistoryId,
  onStartNew,
  onOpenSettings,
  onOpenPhilosopherIntro,
  onReset,
  onChangeLang
}) => {
  const isZh = language === 'zh';
  const [history, setHistory] = useState<ChatHistory[]>([]);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('explorer_compass_history');
    if (saved && isOpen) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp).slice(0, 30));
      } catch (e) {}
    }
  }, [isOpen]);

  // 删除单条记录
  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = localStorage.getItem('explorer_compass_history');
    if (saved) {
      let parsed: ChatHistory[] = JSON.parse(saved);
      parsed = parsed.filter(h => h.id !== id);
      localStorage.setItem('explorer_compass_history', JSON.stringify(parsed));
      setHistory(parsed);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return isZh ? '今天' : 'Today';
    if (days === 1) return isZh ? '昨天' : 'Yesterday';
    if (days < 7) return isZh ? `${days}天前` : `${days}d ago`;
    return date.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onOpen}
        className="fixed top-4 left-4 z-50 p-3 bg-white shadow-lg rounded-xl text-slate-600 hover:shadow-xl transition-all"
      >
        <Plus size={20} />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onOpen} />
      
      <div className="fixed left-0 top-0 h-full w-64 bg-[#171717] z-50 flex flex-col">
        {/* 头部按钮 */}
        <div className="p-2">
          <button 
            onClick={onOpen}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors text-white"
          >
            <Plus size={18} />
            <span className="text-sm">{isZh ? '新对话' : 'New Chat'}</span>
          </button>
        </div>

        {/* 历史记录列表 - 类似 ChatGPT */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <p className="px-3 py-2 text-xs text-[#8E8E8E] font-medium">
            {isZh ? '历史记录' : 'History'}
          </p>
          
          {history.length === 0 ? (
            <div className="px-3 py-4 text-sm text-[#8E8E8E] text-center">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p>{isZh ? '暂无历史' : 'No history'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map(h => (
                <div 
                  key={h.id}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors ${
                    currentHistoryId === h.id ? 'bg-[#2A2A2A]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm text-[#E5E5E5] truncate">{h.modeLabel}</p>
                    <p className="text-xs text-[#8E8E8E]">
                      {h.questionCount} {isZh ? '题' : 'Q'} • {formatTime(h.timestamp)}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => deleteHistory(h.id, e)}
                    className="p-1.5 rounded hover:bg-[#4A4A4A] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} className="text-[#8E8E8E]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部菜单 */}
        <div className="p-2 border-t border-[#2A2A2A] space-y-1">
          <button 
            onClick={() => { onOpenPhilosopherIntro(); onOpen(); }}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm text-[#E5E5E5]"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span>{isZh ? '虚拟哲学家' : 'Philosophers'}</span>
          </button>

          <button 
            onClick={() => { onOpenSettings(); onOpen(); }}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm text-[#E5E5E5]"
          >
            <Settings size={16} className="text-amber-400" />
            <span>{isZh ? '设置' : 'Settings'}</span>
          </button>

          <button 
            onClick={() => { onChangeLang(); onOpen(); }}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm text-[#E5E5E5]"
          >
            <Languages size={16} className="text-green-400" />
            <span>{isZh ? '切换语言' : 'Switch Language'}</span>
          </button>

          <hr className="my-2 border-[#2A2A2A]" />

          <button 
            onClick={() => { 
              if (window.confirm(isZh ? '确定结束对话？' : 'End chat?')) {
                onReset();
                onOpen();
              }
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm text-red-400"
          >
            <LogOut size={16} />
            <span>{isZh ? '结束对话' : 'End Chat'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
