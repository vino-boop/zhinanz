import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface PhilosopherIntroProps {
  language: Language;
  onClose: () => void;
}

// 哲学家数据 - 延迟加载
const getPhilosophers = () => [
  { name: '加缪', emoji: '😤', desc: '存在主义哲学家，荒诞主义的代表，强调在荒诞中反抗' },
  { name: '萨特', emoji: '☕', desc: '存在主义哲学家，强调自由与责任' },
  { name: '尼采', emoji: '🔥', desc: '超人哲学，提出权力意志和永恒轮回' },
  { name: '康德', emoji: '📜', desc: '理性主义哲学家，提出先验哲学和道德律令' },
  { name: '叔本华', emoji: '🌧️', desc: '悲观主义哲学家，认为意志是痛苦的根源' },
  { name: '马可·奥勒留', emoji: '🏛️', desc: '斯多葛学派皇帝，强调理性与接受命运' },
  { name: '克尔凯郭尔', emoji: '😰', desc: '存在主义先驱，强调主观真理和信仰跳跃' },
  { name: '边沁', emoji: '📊', desc: '功利主义哲学家，追求最大幸福原则' },
  { name: '罗尔斯', emoji: '⚖️', desc: '正义论哲学家，提出无知之幕' },
  { name: '亚里士多德', emoji: '🎓', desc: '古希腊哲学家，提出幸福论和德性论' },
  { name: '马克思', emoji: '🔨', desc: '唯物主义哲学家，提出历史唯物主义和阶级斗争' },
  { name: '柏拉图', emoji: '🏛️', desc: '古希腊哲学家，提出理念论和理想国' },
  { name: '休谟', emoji: '🤔', desc: '经验主义哲学家，提出怀疑主义和情感主义伦理学' },
  { name: '笛卡尔', emoji: '💭', desc: '理性主义哲学家，我思故我在' },
  { name: '释迦牟尼', emoji: '🧘', desc: '佛教创始人，提出四圣谛和空性' },
  { name: '洛克', emoji: '📝', desc: '经验主义哲学家，提出天赋观念批判和社会契约论' },
  { name: '黑格尔', emoji: '⚡', desc: '辩证法哲学家，提出绝对精神' },
  { name: '海德格尔', emoji: '🌊', desc: '存在主义哲学家，追问存在的意义' },
  { name: '斯宾诺莎', emoji: '✨', desc: '理性主义哲学家，提出泛神论和自然主义' },
  { name: '庄子', emoji: '🦋', desc: '道家哲学家，提出逍遥游和齐物论' },
  { name: '维特根斯坦', emoji: '📖', desc: '语言哲学家，提出语言游戏和家族相似' },
  { name: '列维纳斯', emoji: '🤝', desc: '现象学家，提出他者和面容伦理学' },
  { name: '德里达', emoji: '🔀', desc: '解构主义哲学家，提出延异和去中心化' },
  { name: '波普尔', emoji: '❌', desc: '科学哲学家，提出证伪主义和开放社会' },
  { name: '威廉·詹姆斯', emoji: '🔧', desc: '实用主义哲学家，提出信仰意志和真理有用论' },
  { name: '皮尔士', emoji: '🔍', desc: '实用主义创始人，提出符号学和怀疑方法' },
  { name: '杜威', emoji: '🎯', desc: '实用主义哲学家，提出经验主义和工具主义' },
  { name: '贝克莱', emoji: '👁️', desc: '经验主义哲学家，存在即被感知' },
  { name: '博斯特罗姆', emoji: '🖥️', desc: '未来学家，提出模拟假说和人择原理' },
  { name: '普特南', emoji: '🧠', desc: '语言哲学家，提出缸中大脑和内在实在论' },
];

export const PhilosopherIntro: React.FC<PhilosopherIntroProps> = ({ language, onClose }) => {
  const isZh = language === 'zh';
  const [isLoading, setIsLoading] = useState(true);
  const [philosophers, setPhilosophers] = useState<{name: string, emoji: string, desc: string}[]>([]);

  useEffect(() => {
    // 模拟延迟加载
    setIsLoading(true);
    const timer = setTimeout(() => {
      setPhilosophers(getPhilosophers());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 pb-20">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isZh ? '虚拟哲学家' : 'Virtual Philosophers'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isZh ? 'AI 扮演的哲学角色，将与您对话' : 'AI-powered philosophical characters'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-indigo-400 animate-spin" size={48} />
            <p className="text-slate-400 mt-4">{isZh ? '加载中...' : 'Loading...'}</p>
          </div>
        ) : (
          <>
            {/* 介绍 */}
            <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3">
                {isZh ? '什么是虚拟哲学家？' : 'What are Virtual Philosophers?'}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {isZh 
                  ? '在对话过程中，AI会根据您的回答内容，自动匹配相关的哲学家角色。这些哲学家会从各自的哲学体系出发，对您的观点进行点评、质疑或补充。通过与不同哲学家的思想碰撞，帮助您更深层次地审视自己的价值观和思维方式。'
                  : 'During the conversation, AI will automatically match relevant philosopher characters based on your responses. These philosophers will comment, question, or supplement your views from their respective philosophical systems, helping you examine your values and thinking patterns at a deeper level.'
                }
              </p>
            </div>

            {/* 哲学家列表 */}
            <h3 className="text-lg font-bold text-white mb-4">
              {isZh ? '哲学家列表' : 'Philosopher List'}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {philosophers.map((p, i) => (
                <div 
                  key={i}
                  className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* 底部说明 */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                {isZh 
                  ? '提示：哲学家是根据您回答中的关键词自动匹配的，每次可能会出现不同的哲学家。'
                  : 'Note: Philosophers are automatically matched based on keywords in your responses.'
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhilosopherIntro;
