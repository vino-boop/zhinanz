import React, { useState, useEffect } from 'react';
import { Language, DiscoveryMode, DiscoveryResult } from '../types';
import { X, Sparkles, Settings, ChevronLeft, ChevronRight, Languages, LogOut, Plus, MessageCircle, LayoutGrid, Zap, GraduationCap } from 'lucide-react';

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
  user?: {id: number; username: string; email: string; role: string} | null;
  userTokens?: number;
  onStartNew: () => void;
  onOpenSettings: () => void;
  onOpenAllModes: () => void;
  onReset: () => void;
  onChangeLang: () => void;
  historyRefreshKey?: number;
  onSelectHistory?: (history: ChatHistory) => void;
  onOpenVIP?: () => void;
  onOpenPhilosophers?: () => void;
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
  user,
  onStartNew,
  onOpenSettings,
  onOpenAllModes,
  onReset,
  onChangeLang,
  historyRefreshKey,
  onSelectHistory,
  userTokens = 0,
  onOpenVIP,
  onOpenPhilosophers,
}) => {
  const isZh = language === 'zh';
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // 加载历史记录 - 优先从数据库加载（登录用户），否则从本地存储
  useEffect(() => {
    const loadHistory = async () => {
      if (!isOpen) return;
  // 获取模式的中文名称
  const getModeLabelZh = (mode: string) => {
    const labels: Record<string, string> = {
      'LIFE_MEANING': '生命意义',
      'JUSTICE': '社会正义',
      'SELF_IDENTITY': '自我认同',
      'FREE_WILL': '自由意志',
      'SIMULATION': '虚拟现实',
      'OTHER_MINDS': '他心问题',
      'LANGUAGE': '语言哲学',
      'SCIENCE': '科学哲学',
    };
    return isZh ? (labels[mode] || mode) : mode;
  };
      
      // 如果用户已登录，从数据库加载
      if (user && user.id) {
        try {
          const res = await fetch(`https://backend.vinolab.tech/api/philosophy/user-histories/${user.id}`);
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            // 转换数据库历史为本地格式
            const dbHistory: ChatHistory[] = data.history.map((h: any) => ({
              id: h.session_id,
              mode: h.mode,
              modeLabel: getModeLabelZh(h.mode),
              questionCount: h.question_count || 0,
              lastMessage: h.answer_content?.slice(0, 50) || '',
              timestamp: new Date(h.create_time).getTime(),
              result: null,
              isComplete: false
            }));
            // 合并报告
            if (data.reports && data.reports.length > 0) {
              const reportHistory: ChatHistory[] = data.reports.map((r: any) => ({
                id: r.session_id,
                mode: r.mode,
                modeLabel: getModeLabelZh(r.mode),
                questionCount: 0,
                lastMessage: r.title?.slice(0, 50) || '',
                timestamp: new Date(r.create_time).getTime(),
                result: r,
                isComplete: true
              }));
              setHistory([...reportHistory, ...dbHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30));
              return;
            }
            setHistory(dbHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, 30));
            return;
          }
        } catch (e) {
          console.error('加载数据库历史失败:', e);
        }
      }
      
      // 否则从本地存储加载
      const saved = localStorage.getItem('explorer_compass_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHistory(parsed.sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp).slice(0, 30));
        } catch (e) {}
      }
    };
    
    loadHistory();
  }, [isOpen, lastRefresh, historyRefreshKey, user, language]);

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

  return (
    <div 
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-16'
      }`}
      style={{ 
        background: slotMachineColors.bg,
      }}
    >
      {/* 收起模式：只显示Logo和图标 */}
      {!isOpen ? (
        <div className="flex flex-col items-center py-4 h-full">
          {/* Logo - 点击展开侧边栏 */}
          <button 
            onClick={() => { onOpen(); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ background: `linear-gradient(135deg, ${slotMachineColors.accent} 0%, #4f46e5 100%)` }}
            title={isZh ? '展开菜单' : 'Open Menu'}
          >
            <Sparkles size={20} />
          </button>
          
          {/* 底部图标区域 */}
          <div className="mt-auto flex flex-col gap-3 pb-4">
            {/* 查看哲学家 */}
            <button 
              onClick={() => { onOpenPhilosophers?.(); }}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: slotMachineColors.text }}
              title={isZh ? '查看哲学家' : 'View Philosophers'}
            >
              <GraduationCap size={20} />
            </button>
            
            {/* 查看全部问题 */}
            <button 
              onClick={() => { onOpenAllModes(); }}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: slotMachineColors.text }}
              title={isZh ? '查看全部问题' : 'View All Themes'}
            >
              <LayoutGrid size={20} />
            </button>
            
            {/* 设置 */}
            <button 
              onClick={() => { onOpenSettings(); }}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: slotMachineColors.text }}
              title={isZh ? '设置' : 'Settings'}
            >
              <Settings size={20} />
            </button>
            
            {/* 展开按钮 */}
            <button 
              onClick={onOpen}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: slotMachineColors.text }}
              title={isZh ? '展开' : 'Expand'}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* 展开模式：完整侧边栏 */}
      {/* 头部 - 新对话按钮和收起按钮同一排 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button 
          onClick={() => { onStartNew(); }}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-colors text-white font-medium"
          style={{ background: `linear-gradient(135deg, ${slotMachineColors.accent} 0%, #4f46e5 100%)` }}
        >
          <Plus size={18} />
          <span className="text-sm">{isZh ? '新对话' : 'New Chat'}</span>
        </button>
        <button 
          onClick={onOpen}
          className="p-2 rounded-lg transition-all hover:scale-110 flex-shrink-0"
          style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
        >
          <ChevronLeft size={18} />
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
                  onClick={() => onSelectHistory?.(h)}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm truncate" style={{ color: slotMachineColors.text }}>
                      {isZh 
                        ? (h.mode === 'LIFE_MEANING' ? '生命意义' 
                          : h.mode === 'JUSTICE' ? '社会正义'
                          : h.mode === 'SELF_IDENTITY' ? '自我认同'
                          : h.mode === 'FREE_WILL' ? '自由意志'
                          : h.mode === 'SIMULATION' ? '虚拟与真实'
                          : h.mode === 'OTHER_MINDS' ? '他心问题'
                          : h.mode === 'LANGUAGE' ? '语言与意义'
                          : h.mode === 'SCIENCE' ? '科学哲学'
                          : h.modeLabel)
                        : h.modeLabel}
                    </p>
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
          {/* 先令展示 - 点击可购买会员 */}
          {user && userTokens !== undefined && (
            <button 
              onClick={() => onOpenVIP?.()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-colors text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Zap size={16} />
              <span>{userTokens} {isZh ? '先令' : 'Shi ling'}</span>
            </button>
          )}
          
          <button 
            onClick={() => { onOpenAllModes(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium"
            style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
          >
            <LayoutGrid size={16} style={{ color: slotMachineColors.accent }} />
            <span>{isZh ? '查看全部问题' : 'View All Themes'}</span>
          </button>

          <button 
            onClick={() => { onOpenPhilosophers?.(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium"
            style={{ background: slotMachineColors.card, color: slotMachineColors.text }}
          >
            <GraduationCap size={16} style={{ color: slotMachineColors.accent }} />
            <span>{isZh ? '查看哲学家' : 'View Philosophers'}</span>
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
        </>
      )}
      </div>
  );
};

export default ChatSidebar;
