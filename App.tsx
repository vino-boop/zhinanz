
import React, { useState, useEffect, useRef } from 'react';
import { Message, DiscoveryResult, AppState, Language, DiscoveryMode, DiscoveryIntensity } from './types';
import { getNextQuestion, generateFinalAnalysis } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ProgressBar } from './components/ProgressBar';
import { 
  Compass, Send, RefreshCw, Sparkles, ArrowRight, Quote, Languages, Briefcase, Heart, 
  ScrollText, FileImage, Layers, Zap, Dna, Target, Navigation, Timer, Infinity as InfinityIcon, AlertCircle
} from 'lucide-react';

declare const html2canvas: any;

const QUICK_TARGET = 7;
const DEEP_TARGET = 15;

const i18n = {
  zh: {
    title: "探索者指南针",
    subtitle: "从心出发，发现方向",
    landingDesc: "这不是一次普通的测试，而是一场关于真实的对峙。请选择一个领域，寻找你的真实原点。",
    beginBtn: "开启旅程",
    intensityTitle: "选择对话强度",
    intensityDesc: "深度的旅程需要更多勇气，快速的相遇则直击本质。",
    modeLife: "人生意义",
    modeLifeDesc: "关于存在、痛苦与终极价值",
    modeCareer: "职业方向",
    modeCareerDesc: "关于权力、安全与自我异化",
    modeTalent: "天赋爱好",
    modeTalentDesc: "关于热忱、心流与感官本能",
    intensityQuick: "快速相遇",
    intensityQuickDesc: "7-10轮对话，快速生成报告",
    intensityDeep: "深度对话",
    intensityDeepDesc: "15轮后可随时生成，深入潜意识",
    analyzingTitle: "正在解析真我能量...",
    analyzingDesc: "AI 正在编织属于你的灵魂图谱。",
    resultTitle: "探索终局报告",
    inputPlaceholder: "请给出最本能的回答...",
    langToggle: "Switch to English",
    finishBtn: "生成报告",
    backBtn: "返回",
    exportChat: "对话记录",
    exportReport: "保存图谱",
    dimensionTitle: "能量矩阵",
    errorQuota: "连接暂时中断，请重试。",
    retryBtn: "重新发送",
  },
  en: {
    title: "Explorer's Compass",
    subtitle: "Navigate Your Soul",
    landingDesc: "This is a confrontation with reality. Choose a path to find your true origin.",
    beginBtn: "Start",
    intensityTitle: "Dialogue Intensity",
    intensityDesc: "Deep journeys need courage; quick ones hit the essence.",
    modeLife: "Life Meaning",
    modeLifeDesc: "Existence & Values",
    modeCareer: "Career Path",
    modeCareerDesc: "Power & Security",
    modeTalent: "Passion",
    modeTalentDesc: "Flow & Instinct",
    intensityQuick: "Quick",
    intensityQuickDesc: "7-10 rounds for a quick map",
    intensityDeep: "Deep",
    intensityDeepDesc: "Diving deep, unlimited rounds",
    analyzingTitle: "Decoding Energy...",
    analyzingDesc: "AI is weaving your soul map.",
    resultTitle: "Final Report",
    inputPlaceholder: "Answer with instinct...",
    langToggle: "中文",
    finishBtn: "Generate Report",
    backBtn: "Back",
    exportChat: "Chat History",
    exportReport: "Save Map",
    dimensionTitle: "Energy Matrix",
    errorQuota: "Connection failed, please retry.",
    retryBtn: "Retry",
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('landing');
  const [mode, setMode] = useState<DiscoveryMode | null>(null);
  const [intensity, setIntensity] = useState<DiscoveryIntensity>('QUICK');
  const [lang, setLang] = useState<Language>('zh');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [canFinishEarly, setCanFinishEarly] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const t = i18n[lang];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // Fix: Added reset function to clear application state and return to landing screen.
  const reset = () => {
    setState('landing');
    setMode(null);
    setIntensity('QUICK');
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setError(null);
    setResult(null);
    setQuestionCount(0);
    setCanFinishEarly(false);
  };

  const selectMode = (m: DiscoveryMode) => { setMode(m); setState('intensity_select'); };
  const selectIntensity = (i: DiscoveryIntensity) => { 
    setIntensity(i); setState('chatting'); 
    if (mode) startJourney(mode, i); 
  };

  const startJourney = async (m: DiscoveryMode, i: DiscoveryIntensity) => {
    setIsLoading(true); setError(null);
    try {
      const firstQ = await getNextQuestion([{ id: 's', role: 'user', content: 'START', timestamp: Date.now() }], m, i);
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: firstQ, timestamp: Date.now() }]);
      setQuestionCount(1);
    } catch (e: any) { setError(e.message || t.errorQuota); }
    finally { setIsLoading(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !mode) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setIsLoading(true); setError(null);
    try {
      const nextQRaw = await getNextQuestion([...messages, userMsg], mode, intensity);
      if (intensity === 'QUICK' && (nextQRaw.includes('[DONE]') || questionCount >= QUICK_TARGET)) setCanFinishEarly(true);
      if (intensity === 'DEEP' && questionCount >= DEEP_TARGET) setCanFinishEarly(true);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: nextQRaw.replace('[DONE]', '').trim(), timestamp: Date.now() }]);
      setQuestionCount(prev => prev + 1);
    } catch (e: any) { setError(e.message || t.errorQuota); }
    finally { setIsLoading(false); }
  };

  const analyze = async () => {
    if (!mode) return;
    setState('analyzing'); setIsLoading(true);
    try {
      const res = await generateFinalAnalysis(messages, mode);
      setResult(res); setState('result');
    } catch (e: any) { setError(e.message); setState('chatting'); }
    finally { setIsLoading(false); }
  };

  const exportAsImage = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const isChat = filename.includes('Chat');
    if (isChat) ref.current.parentElement!.style.display = 'block';
    const canvas = await html2canvas(ref.current, { useCORS: true, backgroundColor: '#ffffff', scale: 2 });
    if (isChat) ref.current.parentElement!.style.display = 'none';
    const link = document.createElement('a');
    link.download = `${filename}.png`; link.href = canvas.toDataURL(); link.click();
  };

  const parseBilingual = (text: string) => {
    const parts = text.split('[SEP]');
    return (lang === 'zh' ? parts[0] : (parts[1] || parts[0])).trim();
  };

  if (state === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} className="absolute top-8 right-8 px-5 py-2.5 bg-white shadow-sm rounded-full text-xs font-bold text-indigo-600">{t.langToggle}</button>
        <div className="max-w-4xl text-center space-y-12 z-10">
          <div className="space-y-4">
            <h1 className="text-6xl font-serif font-bold text-slate-900">{t.title}</h1>
            <p className="text-xl text-slate-500 font-heiti">{t.landingDesc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{id:'LIFE_MEANING', icon:ScrollText, label:t.modeLife}, {id:'CAREER', icon:Briefcase, label:t.modeCareer}, {id:'TALENT', icon:Heart, label:t.modeTalent}].map(m => (
              <button key={m.id} onClick={() => selectMode(m.id as DiscoveryMode)} className="p-10 bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto"><m.icon size={32}/></div>
                <h3 className="text-2xl font-bold text-slate-800">{m.label}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'intensity_select') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-2xl text-center space-y-12">
          <h1 className="text-5xl font-serif font-bold">{t.intensityTitle}</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={() => selectIntensity('QUICK')} className="p-10 bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4">
              <Timer className="text-yellow-600" size={32} />
              <h3 className="text-2xl font-bold">{t.intensityQuick}</h3>
              <p className="text-slate-400">{t.intensityQuickDesc}</p>
            </button>
            <button onClick={() => selectIntensity('DEEP')} className="p-10 bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4">
              <InfinityIcon className="text-blue-600" size={32} />
              <h3 className="text-2xl font-bold">{t.intensityDeep}</h3>
              <p className="text-slate-400">{t.intensityDeepDesc}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Dna size={80} className="text-indigo-400 animate-pulse mb-8" />
        <h2 className="text-3xl font-serif">{t.analyzingTitle}</h2>
      </div>
    );
  }

  if (state === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-3xl sticky top-4 z-50 shadow-sm border border-slate-100">
             <button onClick={reset} className="px-4 py-2 text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-2"><ArrowRight className="rotate-180" size={16}/>{t.backBtn}</button>
             <div className="flex gap-2">
                <button onClick={() => exportAsImage(reportContainerRef, 'Report')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"><FileImage size={16}/>{t.exportReport}</button>
                <button onClick={() => exportAsImage(chatContainerRef, 'Chat')} className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold flex items-center gap-2"><Layers size={16}/>{t.exportChat}</button>
             </div>
          </div>

          <div ref={reportContainerRef} className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl space-y-32 flex flex-col items-center export-container">
            <div className="text-center space-y-8 w-full max-w-2xl py-10">
              <div className="inline-block px-4 py-1 bg-slate-900 text-white rounded-full text-[10px] tracking-widest font-bold uppercase">{t.resultTitle}</div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 leading-tight">{parseBilingual(result.title)}</h1>
              <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
            </div>

            <div className="w-full max-w-3xl py-10 text-center space-y-8">
              <h3 className="text-xs font-bold text-indigo-600 tracking-[0.3em] uppercase">灵魂剖析 / Analysis</h3>
              <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-serif italic italic px-8">"{parseBilingual(result.summary)}"</p>
            </div>

            <div className="w-full max-w-2xl py-10 space-y-12 bg-slate-50 p-12 rounded-[3rem]">
              <h3 className="text-center text-xs font-bold text-slate-400 tracking-[0.3em] uppercase">{t.dimensionTitle}</h3>
              <div className="space-y-10">
                {result.dimensions?.map((dim, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between font-heiti"><span className="text-slate-700">{parseBilingual(dim.label)}</span><span className="text-indigo-600">{dim.value}%</span></div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{width:`${dim.value}%`}}></div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-3xl py-10 space-y-12">
              <h3 className="text-center text-xs font-bold text-blue-600 tracking-[0.3em] uppercase">真我洞察 / Insights</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {result.keyInsights.map((ins, i) => (
                  <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex gap-4">
                    <Target className="text-blue-400 flex-shrink-0" size={20}/>
                    <p className="text-lg text-slate-600 leading-relaxed">{parseBilingual(ins)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-3xl py-10 space-y-12">
              <h3 className="text-center text-xs font-bold text-teal-600 tracking-[0.3em] uppercase">进化路径 / Paths</h3>
              <div className="space-y-6">
                {result.suggestedPaths.map((p, i) => (
                  <div key={i} className="p-10 bg-teal-50/30 rounded-[2.5rem] flex items-center gap-8 border border-teal-50">
                    <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">{i+1}</div>
                    <p className="text-xl text-slate-800 font-heiti">{parseBilingual(p)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-2xl py-20 text-center">
               <div className="p-16 bg-slate-900 rounded-[4rem] text-white space-y-6 relative overflow-hidden">
                  <Quote className="absolute top-8 left-8 text-white/10" size={100} />
                  <p className="text-xs opacity-40 tracking-[0.4em] font-bold">SOUL MOTTO</p>
                  <h3 className="text-3xl md:text-4xl font-serif italic leading-relaxed">"{parseBilingual(result.motto)}"</h3>
               </div>
            </div>

            <div className="pt-20 border-t border-slate-100 text-slate-300 text-[10px] tracking-[0.5em] font-bold">EXPLORER'S COMPASS • {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        <div style={{display:'none'}}><div ref={chatContainerRef} className="bg-white p-20 w-[800px] flex flex-col gap-8 export-container">
          <h1 className="text-4xl font-serif font-bold text-center mb-10">{t.title} - Chat History</h1>
          {messages.map(m => <ChatBubble key={m.id} message={m} language={lang} />)}
        </div></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-8 py-6 flex items-center justify-between border-b sticky top-0 bg-white/80 backdrop-blur z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => {if(window.confirm(t.backBtn)) reset()}} className="p-3 bg-slate-900 text-white rounded-2xl"><Compass size={24}/></button>
          <div><h1 className="font-serif font-bold text-xl">{t.title}</h1><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{mode} • {intensity}</p></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:block w-32"><ProgressBar current={questionCount} total={intensity==='QUICK'?QUICK_TARGET:DEEP_TARGET}/></div>
          <button onClick={() => setLang(l => l==='zh'?'en':'zh')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Languages size={24}/></button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto pt-10 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          {messages.map(m => <ChatBubble key={m.id} message={m} language={lang} />)}
          {error && <div className="p-8 bg-red-50 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-red-500 font-bold"><AlertCircle size={20}/>{t.errorQuota}</div>
            <button onClick={handleSend} className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 mx-auto"><RefreshCw size={16}/>{t.retryBtn}</button>
          </div>}
          {isLoading && <div className="flex justify-center p-8 opacity-20"><Dna className="animate-spin" size={32}/></div>}
        </div>
      </main>

      <footer className="p-6 border-t bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative flex gap-4">
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault();handleSend();}}} placeholder={t.inputPlaceholder} rows={2} disabled={!!error || isLoading} className="flex-1 p-6 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none text-xl resize-none transition-all disabled:opacity-50" />
            <button onClick={handleSend} disabled={!input.trim() || isLoading || !!error} className="absolute right-3 bottom-3 p-4 bg-slate-900 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"><Send size={24}/></button>
          </div>
          {canFinishEarly && !error && <button onClick={analyze} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"><Sparkles size={20}/>{t.finishBtn}</button>}
        </div>
      </footer>
    </div>
  );
};

export default App;
