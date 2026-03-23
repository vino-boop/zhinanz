import React, { useState, useEffect } from 'react';
import { Language, DiscoveryMode, DiscoveryResult } from '../types';
import { X, Sparkles, Settings, ChevronLeft, Languages, LogOut, Plus, MessageCircle, LayoutGrid } from 'lucide-react';

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
  onOpenAllModes: () => void;
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
  onOpenAllModes,
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

  // 老虎机配色
  const slotMachineColors = {
    bg: '#1e293b',      // slate-800 深蓝灰
    card: '#334155',    // slate-700
    cardHover: '#475569', // slate-600
    text: '#f8fafc',    // slate-50
    textMuted: '#94a3b8', // slate-400
    accent: '#6366f1',   // indigo-500
    border: '#475569',   // slate-600
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onOpen}
        className="fixed top-4 left-4 z-50 p-3 shadow-lg rounded-xl text-white transition-all"
        style={{ background: `linear-gradient(135deg, ${slotMachineColors.accent} 0%, #4f46e5 100%)` }}
      >
        <Menu size={20} />
      </button>
    );
  }

  return (
    <div className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col" style={{ background: slotMachineColors.bg }}>
      {/* 头部 - 关闭按钮 */}
      <div className="flex justify-end p-4">
        <button 
          onClick={onOpen}
          className="p-2 rounded-lg transition-colors"
          style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
        >
          <X size={18} />
        </button>
      </div>
      
      {/* 头部按钮 */}
      <div className="px-4 pb-4">
        <button 
          onClick={onOpen}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-colors text-white font-medium"
          style={{ background: `linear-gradient(135deg, ${slotMachineColors.accent} 0%, #4f46e5 100%)` }}
        >
          <Plus size={18} />
          <span className="text-sm">{isZh ? '新对话' : 'New Chat'}</span>
        </button>
      </div>

        {/* 历史记录列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <p className="px-3 py-2 text-xs font-medium" style={{ color: slotMachineColors.textMuted }}>
            {isZh ? '历史记录' : 'History'}
          </p>
          
          {history.length === 0 ? (
            <div className="px-3 py-4 text-sm text-center" style={{ color: slotMachineColors.textMuted }}>
              <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p>{isZh ? '暂无历史' : 'No history'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(h => (
                <div 
                  key={h.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    currentHistoryId === h.id ? '' : ''
                  }`}
                  style={{ background: currentHistoryId === h.id ? slotMachineColors.card : 'transparent' }}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm truncate" style={{ color: slotMachineColors.text }}>{h.modeLabel}</p>
                    <p className="text-xs" style={{ color: slotMachineColors.textMuted }}>
                      {h.questionCount} {isZh ? '题' : 'Q'} • {formatTime(h.timestamp)}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => deleteHistory(h.id, e)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: slotMachineColors.cardHover }}
                  >
                    <X size={14} style={{ color: slotMachineColors.textMuted }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部菜单 - 统一颜色 */}
        <div className="p-4 space-y-2">
          <button 
            onClick={() => { onOpenPhilosopherIntro(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium"
            style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
          >
            <Sparkles size={16} style={{ color: slotMachineColors.accent }} />
            <span>{isZh ? '虚拟哲学家' : 'Philosophers'}</span>
          </button>

          <button 
            onClick={() => { onOpenAllModes(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium"
            style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
          >
            <LayoutGrid size={16} style={{ color: slotMachineColors.accent }} />
            <span>{isZh ? '查看全部问题' : 'View All Themes'}</span>
          </button>

          <button 
            onClick={() => { onOpenSettings(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium"
            style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
          >
            <Settings size={16} style={{ color: slotMachineColors.accent }} />
            <span>{isZh ? '设置' : 'Settings'}</span>
          </button>
        </div>
      </div>
  );
};

export default ChatSidebar;
