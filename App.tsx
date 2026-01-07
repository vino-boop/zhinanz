
import React, { useState, useEffect, useRef } from 'react';
import { Message, DiscoveryResult, AppState, Language, DiscoveryMode, Dimension } from './types';
import { getNextQuestion, generateFinalAnalysis } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ProgressBar } from './components/ProgressBar';
import { 
  Compass, 
  Send, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Lightbulb, 
  Navigation,
  Quote,
  Languages,
  Briefcase,
  Heart,
  ScrollText,
  FileImage,
  Layers,
  Zap,
  Dna,
  ShieldCheck,
  Target,
  Trophy
} from 'lucide-react';

declare const html2canvas: any;

const TARGET_QUESTIONS = 7;
const MAX_QUESTIONS = 12;

const i18n = {
  zh: {
    title: "探索者指南针",
    subtitle: "从心出发，发现方向",
    landingDesc: "这不是一次普通的测试，而是一场关于真实的对峙。请选择一个领域，我们将通过层层追问，剥离社会人格，寻找你的真实原点。",
    beginBtn: "开启旅程",
    modeLife: "人生意义",
    modeLifeDesc: "关于存在、痛苦与终极价值",
    modeCareer: "职业方向",
    modeCareerDesc: "关于权力、安全与自我异化",
    modeTalent: "天赋爱好",
    modeTalentDesc: "关于热忱、心流与感官本能",
    analyzingTitle: "正在解析你的真我能量...",
    analyzingDesc: "AI 正在对比你的理想化陈述与本能反馈，编织属于你的灵魂图谱。",
    resultTitle: "探索终局报告",
    restart: "重新开启旅程",
    inputPlaceholder: "请在深思后给出最本能的回答...",
    langToggle: "Switch to English",
    finishBtn: "生成真我图谱报告",
    backBtn: "返回主页",
    exportChat: "导出对话记录",
    exportReport: "导出人生图谱",
    dimensionTitle: "真我能量矩阵",
  },
  en: {
    title: "Explorer's Compass",
    subtitle: "Navigate Your Soul",
    landingDesc: "This is not a regular test, but a confrontation with reality. Choose a path, and we'll peel away your social persona to find your true origin.",
    beginBtn: "Start Journey",
    modeLife: "Meaning of Life",
    modeLifeDesc: "Existence, Pain, & Ultimate Values",
    modeCareer: "Career Path",
    modeCareerDesc: "Power, Security, & Alienation",
    modeTalent: "Talent & Passion",
    modeTalentDesc: "Enthusiasm, Flow, & Instinct",
    analyzingTitle: "Decoding Your Energy...",
    analyzingDesc: "AI is cross-referencing your statements with instinctive pulses to weave your map.",
    resultTitle: "Final Discovery Report",
    restart: "Start New Discovery",
    inputPlaceholder: "Answer with your deepest instinct...",
    langToggle: "切换至中文",
    finishBtn: "Generate Truth Map Report",
    backBtn: "Back to Home",
    exportChat: "Export History",
    exportReport: "Export Truth Map",
    dimensionTitle: "Authenticity Energy Matrix",
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('landing');
  const [mode, setMode] = useState<DiscoveryMode | null>(null);
  const [lang, setLang] = useState<Language>('zh');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [canFinishEarly, setCanFinishEarly] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const t = i18n[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const selectMode = (m: DiscoveryMode) => {
    setMode(m);
    setState('chatting');
    startJourney(m);
  };

  const startJourney = async (m: DiscoveryMode) => {
    setIsLoading(true);
    const initialMessage: Message = { id: 'start', role: 'user', content: 'START', timestamp: Date.now() };
    const firstQuestion = await getNextQuestion([initialMessage], m);
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: firstQuestion, timestamp: Date.now() }]);
    setQuestionCount(1);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !mode) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const nextQRaw = await getNextQuestion([...messages, userMessage], mode);
      if (nextQRaw.includes('[DONE]') || questionCount >= TARGET_QUESTIONS) setCanFinishEarly(true);
      const nextQ = nextQRaw.replace('[DONE]', '').trim();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: nextQ, timestamp: Date.now() }]);
      setQuestionCount(prev => prev + 1);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const analyze = async () => {
    if (!mode) return;
    setState('analyzing');
    setIsLoading(true);
    try {
      const finalResult = await generateFinalAnalysis(messages, mode);
      setResult(finalResult);
      setState('result');
    } catch (e) {
      console.error(e);
      setState('chatting');
    } finally { setIsLoading(false); }
  };

  const reset = () => {
    setState('landing');
    setMessages([]);
    setQuestionCount(0);
    setResult(null);
    setMode(null);
    setCanFinishEarly(false);
  };

  const exportAsImage = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    try {
      const isChat = filename.includes('Chat');
      if (isChat) ref.current.parentElement!.style.display = 'block';
      
      const canvas = await html2canvas(ref.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      if (isChat) ref.current.parentElement!.style.display = 'none';

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error('Export failed', e); }
  };

  const parseBilingual = (text: string) => {
    const parts = text.split('[SEP]');
    if (parts.length < 2) return text;
    return (lang === 'zh' ? parts[0] : parts[1]).trim();
  };

  if (state === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
        <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} className="absolute top-8 right-8 px-5 py-2.5 bg-white/80 backdrop-blur rounded-full shadow-sm hover:shadow-md transition-all text-xs font-bold text-indigo-600 border border-indigo-50">
          <Languages size={14} className="inline mr-2" /> {t.langToggle}
        </button>

        <div className="max-w-4xl w-full text-center space-y-12 z-10">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-slate-900 tracking-tight">{t.title}</h1>
            <h2 className="text-xl md:text-2xl font-heiti text-indigo-500 uppercase tracking-widest">{t.subtitle}</h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-heiti">{t.landingDesc}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { id: 'LIFE_MEANING', icon: ScrollText, label: t.modeLife, desc: t.modeLifeDesc, color: 'text-indigo-600 bg-indigo-50' },
              { id: 'CAREER', icon: Briefcase, label: t.modeCareer, desc: t.modeCareerDesc, color: 'text-blue-600 bg-blue-50' },
              { id: 'TALENT', icon: Heart, label: t.modeTalent, desc: t.modeTalentDesc, color: 'text-teal-600 bg-teal-50' },
            ].map((m) => (
              <button key={m.id} onClick={() => selectMode(m.id as DiscoveryMode)} className="group p-10 bg-white rounded-[3rem] border border-transparent hover:border-indigo-100 hover:shadow-2xl transition-all text-left space-y-5">
                <div className={`w-16 h-16 ${m.color} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                  <m.icon size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 font-heiti">{m.label}</h3>
                  <p className="text-slate-400 text-sm mt-2 font-heiti leading-relaxed">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
        <div className="text-center space-y-10 max-w-lg">
          <Dna size={80} className="mx-auto text-indigo-400 animate-pulse" />
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-bold tracking-tight">{t.analyzingTitle}</h2>
            <p className="text-slate-400 text-lg italic leading-relaxed">{t.analyzingDesc}</p>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-full animate-[loading_4s_infinite]"></div>
          </div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      </div>
    );
  }

  if (state === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          
          {/* Top Sticky Toolbar */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-slate-100 sticky top-4 z-50 shadow-sm">
             <button onClick={reset} className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
               <ArrowRight className="rotate-180" size={16} /> {t.backBtn}
             </button>
             <div className="flex gap-3">
                <button onClick={() => exportAsImage(reportContainerRef, `Truth_Map_${Date.now()}`)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  <FileImage size={18} /> {t.exportReport}
                </button>
                <button onClick={() => exportAsImage(chatContainerRef, `Chat_History_${Date.now()}`)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all">
                  <Layers size={18} /> {t.exportChat}
                </button>
             </div>
          </div>

          {/* Main Report Container - Single Column Layout for Better Visibility */}
          <div ref={reportContainerRef} className="bg-white p-12 md:p-24 rounded-[4rem] shadow-xl border border-slate-50 space-y-32 export-container relative overflow-hidden flex flex-col items-center">
            
            {/* Header Module */}
            <div className="text-center space-y-10 w-full max-w-2xl">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em]">
                <Zap size={12} className="text-indigo-400" /> {t.resultTitle}
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.15]">
                {parseBilingual(result.title)}
              </h1>
            </div>

            {/* Summary Module */}
            <div className="w-full max-w-3xl space-y-8 text-center">
              <div className="flex items-center justify-center gap-4 text-indigo-600 text-[11px] font-bold uppercase tracking-[0.3em]">
                <div className="w-8 h-px bg-indigo-200"></div> 
                灵魂剖析
                <div className="w-8 h-px bg-indigo-200"></div>
              </div>
              <p className="text-2xl md:text-3xl text-slate-700 leading-[1.8] font-serif italic text-justify px-4 border-l-4 border-indigo-500/20 pl-8">
                {parseBilingual(result.summary)}
              </p>
            </div>

            {/* Energy Matrix Module - Central Grid */}
            <div className="w-full max-w-2xl bg-slate-50/50 p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-inner space-y-12">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.4em] mb-4">{t.dimensionTitle}</h3>
                <div className="h-px w-20 bg-indigo-600/20 mx-auto"></div>
              </div>
              <div className="space-y-10">
                {result.dimensions?.map((dim, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <span className="text-lg font-bold text-slate-700 font-heiti">{parseBilingual(dim.label)}</span>
                      <span className="text-xl font-serif italic text-indigo-600">{dim.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 h-5 rounded-full overflow-hidden p-1 shadow-inner">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md shadow-indigo-100/50 transition-all duration-[1.5s] ease-out"
                        style={{ width: `${dim.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Module - Clean Staggered List */}
            <div className="w-full max-w-3xl space-y-12">
              <div className="flex items-center justify-center gap-4 text-blue-600 text-[11px] font-bold uppercase tracking-[0.3em]">
                <Quote size={16} /> 真我洞察
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                {result.keyInsights.map((ins, i) => (
                  <div key={i} className="flex gap-6 items-start bg-slate-50/30 p-8 rounded-3xl border border-slate-50 transition-all hover:bg-white hover:shadow-md">
                     <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-400">
                        <Target size={20} />
                     </div>
                     <p className="text-lg text-slate-600 leading-relaxed font-heiti">{parseBilingual(ins)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Paths Module - Vertical Progress Cards */}
            <div className="w-full max-w-3xl space-y-12">
              <div className="flex items-center justify-center gap-4 text-teal-600 text-[11px] font-bold uppercase tracking-[0.3em]">
                <Navigation size={18} /> 进化路径
              </div>
              <div className="space-y-8">
                {result.suggestedPaths.map((p, i) => (
                  <div key={i} className="flex items-center gap-10 p-10 bg-white rounded-[3rem] border-2 border-slate-50 group hover:border-teal-100 transition-all shadow-sm">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-teal-600 font-serif text-3xl font-bold transition-all group-hover:bg-teal-600 group-hover:text-white">
                      {i+1}
                    </div>
                    <p className="text-2xl text-slate-800 font-heiti leading-relaxed">{parseBilingual(p)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Motto Module - Grand Finale */}
            <div className="w-full max-w-2xl">
              <div className="p-16 md:p-24 bg-slate-900 rounded-[5rem] text-white text-center space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
                <Quote className="mx-auto text-indigo-400/20" size={60} />
                <div className="space-y-4">
                  <p className="text-[10px] tracking-[0.5em] opacity-40 uppercase font-bold">Life Creed</p>
                  <h3 className="text-4xl md:text-5xl font-serif italic font-bold leading-relaxed text-indigo-100">
                    "{parseBilingual(result.motto)}"
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Footer Tag */}
            <div className="pt-20 border-t border-slate-100 text-center flex flex-col items-center gap-6 w-full max-w-xl">
               <div className="flex items-center gap-3 text-slate-400 font-serif italic text-2xl">
                 <Compass size={28} className="text-indigo-600" /> Explorer's Compass
               </div>
               <p className="text-slate-300 text-[10px] uppercase tracking-[0.5em] font-bold">
                 Generated by AI Soul Navigator • {new Date().toLocaleDateString()}
               </p>
            </div>
          </div>
        </div>

        {/* Hidden chat area for capture */}
        <div style={{ display: 'none' }}>
           <div ref={chatContainerRef} className="bg-white p-24 w-[1000px] flex flex-col gap-12 export-container">
             <div className="text-center border-b pb-12 mb-12">
               <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">{t.title}</h1>
               <div className="text-indigo-600 font-bold uppercase tracking-[0.3em]">{mode} FULL DIALOGUE</div>
             </div>
             {messages.map((m) => <ChatBubble key={m.id} message={m} language={lang} />)}
             <div className="mt-12 pt-12 border-t text-center text-slate-300 italic font-serif">End of Discovery Session</div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-8 py-8 flex items-center justify-between border-b bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-5">
          <button onClick={() => { if(confirm(t.backBtn)) reset() }} className="p-4 bg-slate-900 rounded-3xl text-white shadow-xl hover:scale-105 transition-transform">
            <Compass size={28} />
          </button>
          <div>
            <h1 className="font-serif font-bold text-slate-900 text-2xl">{t.title}</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{mode?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:block w-48">
            <ProgressBar current={questionCount} total={TARGET_QUESTIONS} />
          </div>
          <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Languages size={24} />
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto pt-16 pb-32 px-4 md:px-0">
        <div className="max-w-4xl mx-auto flex flex-col">
          {messages.map((m) => <ChatBubble key={m.id} message={m} language={lang} />)}
          {isLoading && (
            <div className="flex gap-3 p-10 items-center justify-center opacity-40">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 md:p-12 bg-white border-t sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
            <div className="relative flex gap-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={t.inputPlaceholder}
                rows={2}
                className="flex-1 pl-10 pr-20 py-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500/20 focus:outline-none focus:bg-white text-2xl font-heiti transition-all resize-none shadow-inner"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-4 bottom-4 p-5 bg-slate-900 text-white rounded-2xl hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 shadow-2xl transition-all active:scale-90">
                <Send size={28} />
              </button>
            </div>
          </div>
          {canFinishEarly && (
            <button onClick={analyze} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-bold flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={24} /> 
              <span className="font-heiti tracking-[0.2em] text-xl">{t.finishBtn}</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
