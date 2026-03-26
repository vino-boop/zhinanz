import React, { useState, useEffect } from 'react';
import { Language, DiscoveryMode, DiscoveryResult } from '../types';
import { X, Clock, CheckCircle, MessageCircle, Trash2, ChevronRight, History } from 'lucide-react';
import { philosophyApi } from '../services/apiClient';

// mode -> 中文标签映射
const MODE_LABELS_ZH: Record<string, string> = {
  LIFE_MEANING: '生命意义',
  JUSTICE: '何为正义',
  SELF_IDENTITY: '自我认同',
  FREE_WILL: '自由意志',
  SIMULATION: '模拟世界',
  OTHER_MINDS: '他心问题',
  LANGUAGE: '语言哲学',
  SCIENCE: '科学哲学'
};

const MODE_LABELS_EN: Record<string, string> = {
  LIFE_MEANING: 'Life Meaning',
  JUSTICE: 'Justice',
  SELF_IDENTITY: 'Self Identity',
  FREE_WILL: 'Free Will',
  SIMULATION: 'Simulation',
  OTHER_MINDS: 'Other Minds',
  LANGUAGE: 'Language',
  SCIENCE: 'Science'
};

const getModeLabel = (mode: string, lang: Language): string => {
  if (lang === 'zh') {
    return MODE_LABELS_ZH[mode] || mode;
  }
  return MODE_LABELS_EN[mode] || mode;
};

interface ChatHistory {
  id: string;
  mode: DiscoveryMode;
  modeLabel: string;
  questionTitle: string; // 实际问题名称，如"电车难题"
  questionCount: number;
  lastMessage: string;
  timestamp: number;
  result?: DiscoveryResult;
  isComplete: boolean;
}

interface HistorySidebarProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onLoadHistory: (history: ChatHistory) => void;
  currentHistoryId?: string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  language, 
  isOpen, 
  onClose, 
  onLoadHistory,
  currentHistoryId 
}) => {
  const isZh = language === 'zh';
  const [history, setHistory] = useState<ChatHistory[]>([]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      const savedUser = localStorage.getItem('user');
      // 优先使用已登录用户，其次使用保存的guest ID
      let userId = 'guest';
      if (savedUser) {
        try {
          userId = JSON.parse(savedUser).username || 'guest';
        } catch (e) {}
      }
      // 如果是游客，检查是否有保存的guestUserId
      if (userId === 'guest') {
        userId = localStorage.getItem('guestUserId') || 'guest';
      }
      
      // 1. 优先从后端加载（使用新的用户历史API）
      try {
        const res = await philosophyApi.getUserHistories(userId);
        if (res && res.history && res.history.length > 0) {
          // 转换后端数据格式为前端格式
          const backendHistory: ChatHistory[] = res.history.map((h: any) => ({
            id: h.session_id || h.sessionId,
            mode: h.mode as DiscoveryMode,
            modeLabel: getModeLabel(h.mode, language),
            questionTitle: h.questionTitle || getModeLabel(h.mode, language),
            questionCount: h.questionCount || 0,
            lastMessage: h.lastMessage || '',
            timestamp: new Date(h.createdAt || h.created_at).getTime(),
            isComplete: h.hasReport || h.is_complete || false
          }));
          setHistory(backendHistory.sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp));
          return;
        }
      } catch (e) {
        console.error('Failed to load from backend:', e);
      }
      
      // 2. 后端没有则从 localStorage 加载
      const saved = localStorage.getItem('explorer_compass_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHistory(parsed.sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp));
        } catch (e) {
          console.error('Failed to load history:', e);
        }
      }
    };
    
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  // 保存历史记录
  const saveHistory = (newHistory: ChatHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem('explorer_compass_history', JSON.stringify(newHistory));
  };

  // 删除单条记录
  const deleteHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    saveHistory(newHistory);
  };

  // 清空所有历史
  const clearAll = () => {
    if (window.confirm(isZh ? '确定清空所有历史记录？' : 'Clear all history?')) {
      saveHistory([]);
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
    if (days < 7) return isZh ? `${days}天前` : `${days} days ago`;
    return date.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  // 分类
  const completedHistory = history.filter(h => h.isComplete);
  const unfinishedHistory = history.filter(h => !h.isComplete);

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <History className="text-indigo-600" size={20} />
            <h2 className="font-bold text-lg text-slate-800">
              {isZh ? '历史记录' : 'History'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p>{isZh ? '暂无历史记录' : 'No history yet'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 未完成的对话 */}
              {unfinishedHistory.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={14} />
                    {isZh ? '未完成' : 'Unfinished'}
                  </h3>
                  <div className="space-y-2">
                    {unfinishedHistory.map(h => (
                      <div 
                        key={h.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                          currentHistoryId === h.id 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                        onClick={() => onLoadHistory(h)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{h.questionTitle || h.modeLabel}</p>
                            <p className="text-xs text-slate-400 mt-1">{h.questionCount} {isZh ? '个问题' : 'questions'}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">{formatTime(h.timestamp)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteHistory(h.id); }}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 已完成的报告 */}
              {completedHistory.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle size={14} />
                    {isZh ? '已完成' : 'Completed'}
                  </h3>
                  <div className="space-y-2">
                    {completedHistory.map(h => (
                      <div 
                        key={h.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                          currentHistoryId === h.id 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                        onClick={() => onLoadHistory(h)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{h.questionTitle || h.modeLabel}</p>
                            <p className="text-xs text-slate-400 mt-1">{h.questionCount} {isZh ? '个问题' : 'questions'}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">{formatTime(h.timestamp)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteHistory(h.id); }}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        {history.length > 0 && (
          <div className="p-4 border-t">
            <button 
              onClick={clearAll}
              className="w-full py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg transition-colors"
            >
              {isZh ? '清空所有历史' : 'Clear All'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// 保存历史记录的辅助函数
export const saveToHistory = (
  mode: DiscoveryMode,
  modeLabel: string,
  questionTitle: string,
  questionCount: number,
  lastMessage: string,
  result?: DiscoveryResult,
  isComplete: boolean = false
) => {
  const id = `history-${Date.now()}`;
  const newHistory: ChatHistory = {
    id,
    mode,
    modeLabel,
    questionTitle,
    questionCount,
    lastMessage,
    timestamp: Date.now(),
    result,
    isComplete
  };

  const saved = localStorage.getItem('explorer_compass_history');
  let history: ChatHistory[] = [];
  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch (e) {}
  }
  
  // 添加新记录到开头
  history = [newHistory, ...history];
  
  // 最多保存50条
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  
  localStorage.setItem('explorer_compass_history', JSON.stringify(history));
  return id;
};

export default HistorySidebar;
