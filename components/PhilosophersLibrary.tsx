import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { X, GraduationCap, MessageCircle, Sparkles } from 'lucide-react';

interface Philosopher {
  id: number;
  name: string;
  display_name_zh: string;
  display_name_en: string;
  era: string;
  description: string;
  prompt: string;
  keywords: string | string[];
  modes: string;
  status: string;
}

interface PhilosophersLibraryProps {
  language: Language;
  onClose: () => void;
  onSelectPhilosopher: (philosopher: Philosopher) => void;
}

export const PhilosophersLibrary: React.FC<PhilosophersLibraryProps> = ({ 
  language, 
  onClose,
  onSelectPhilosopher 
}) => {
  const isZh = language === 'zh';
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载哲学家列表
  useEffect(() => {
    const fetchPhilosophers = async () => {
      try {
        const res = await fetch('https://backend.vinolab.tech/api/philosophy/philosophers');
        const data = await res.json();
        if (data.philosophers && Array.isArray(data.philosophers)) {
          setPhilosophers(data.philosophers.filter((p: Philosopher) => p.status === 'active'));
        } else if (Array.isArray(data)) {
          setPhilosophers(data.filter((p: Philosopher) => p.status === 'active'));
        }
      } catch (e) {
        console.error('Failed to load philosophers:', e);
        setError('加载哲学家失败');
      } finally {
        setLoading(false);
      }
    };
    fetchPhilosophers();
  }, []);

  // 哲学家配色
  const philosopherColors = [
    { bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
    { bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-teal-50', color: 'text-teal-600', border: 'border-teal-100' },
    { bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100' },
    { bg: 'bg-rose-50', color: 'text-rose-600', border: 'border-rose-100' },
    { bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100' },
    { bg: 'bg-cyan-50', color: 'text-cyan-600', border: 'border-cyan-100' },
    { bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' },
  ];

  const getColor = (index: number) => philosopherColors[index % philosopherColors.length];

  return (
    <div className="fixed inset-0 z-[70] bg-slate-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <GraduationCap size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900">{isZh ? '哲学家库' : 'Philosophers'}</h2>
              <p className="text-slate-400 text-sm">{isZh ? '选择一位哲学家开始对话' : 'Select a philosopher to start a conversation'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white shadow-sm rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {philosophers.map((philosopher, index) => {
              const colors = getColor(index);
              return (
                <button 
                  key={philosopher.id} 
                  onClick={() => onSelectPhilosopher(philosopher)}
                  className={`group p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4 border-2 ${colors.border} hover:border-transparent flex flex-col h-full hover:scale-[1.02]`}
                >
                  <div className={`w-14 h-14 ${colors.bg} ${colors.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-bold text-slate-800">
                      {isZh ? philosopher.display_name_zh : philosopher.display_name_en}
                    </h3>
                    <p className="text-slate-400 text-xs">
                      {philosopher.era}
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                      {philosopher.description}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${colors.color} text-sm font-medium pt-2`}>
                    <MessageCircle size={16} />
                    <span>{isZh ? '开始对话' : 'Chat'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {philosophers.length === 0 && !loading && !error && (
          <div className="text-center py-20 text-slate-400">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
            <p>{isZh ? '暂无可用哲学家' : 'No philosophers available'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhilosophersLibrary;
