import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { X, ArrowLeft, Sparkles, MessageCircle, GraduationCap } from 'lucide-react';

interface Philosopher {
  id: number;
  name: string;
  display_name_zh: string;
  display_name_en: string;
  era: string;
  description: string;
  prompt: string;
  keywords: string;
  modes: string;
  status: string;
}

interface PhilosopherTopicSelectProps {
  language: Language;
  philosopher: Philosopher | null;
  onClose: () => void;
  onBack: () => void;
  onSelectTopic: (topic: string) => void;
}

export const PhilosopherTopicSelect: React.FC<PhilosopherTopicSelectProps> = ({ 
  language, 
  philosopher,
  onClose,
  onBack,
  onSelectTopic 
}) => {
  const isZh = language === 'zh';
  const [topics, setTopics] = useState<string[]>([]);

  // 从 keywords 解析话题
  useEffect(() => {
    if (philosopher?.keywords) {
      // keywords 可能是数组或逗号分隔的字符串
      let keywordList: string[] = [];
      if (Array.isArray(philosopher.keywords)) {
        keywordList = philosopher.keywords;
      } else if (typeof philosopher.keywords === 'string') {
        keywordList = philosopher.keywords.split(/[,，]/).map(k => k.trim()).filter(k => k);
      }
      setTopics(keywordList);
    }
  }, [philosopher]);

  if (!philosopher) return null;

  // 预设话题列表（如果 keywords 为空）
  const defaultTopics = isZh 
    ? ['生命意义', '自我认知', '存在与虚无', '自由意志', '幸福是什么', '死亡的思考', '人与自然', '爱情与关系']
    : ['Meaning of Life', 'Self-Cognition', 'Existence & Nothingness', 'Free Will', 'What is Happiness', 'Death & Mortality', 'Human & Nature', 'Love & Relationships'];

  const displayTopics = topics.length > 0 ? topics : defaultTopics;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <button onClick={onClose} className="p-3 bg-white shadow-sm rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>

        {/* 哲学家信息 */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg">
            <Sparkles size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              {isZh ? philosopher.display_name_zh : philosopher.display_name_en}
            </h2>
            <p className="text-slate-400 text-sm">{philosopher.era}</p>
          </div>
          <p className="text-slate-500 max-w-md mx-auto">{philosopher.description}</p>
        </div>

        {/* 话题选择 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-center">
            <MessageCircle size={18} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">
              {isZh ? '选择一个话题开始对话' : 'Choose a topic to start conversation'}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {displayTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => onSelectTopic(topic)}
                className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-indigo-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <span className="font-medium text-slate-700">{topic}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 提示 */}
        <p className="text-center text-slate-400 text-sm">
          {isZh ? '选择话题后，将与哲学家进行一对一对话' : 'After choosing a topic, you will have a one-on-one conversation with the philosopher'}
        </p>
      </div>
    </div>
  );
};

export default PhilosopherTopicSelect;
