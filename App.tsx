
import React, { useState, useEffect, useRef } from 'react';
import { Message, DiscoveryResult, AppState, Language, DiscoveryMode, DiscoveryIntensity, AppSettings, ApiProvider } from './types';
import { getNextQuestion, generateFinalAnalysis } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ProgressBar } from './components/ProgressBar';
import { 
  Compass, Send, RefreshCw, Sparkles, ArrowRight, Quote, Languages, Scale, Heart, 
  ScrollText, FileImage, Layers, Zap, Dna, Target, Navigation, Timer, Infinity as InfinityIcon, AlertCircle, Settings, X, Key, User,
  BrainCircuit, Fingerprint
} from 'lucide-react';

declare const html2canvas: any;

const QUICK_TARGET = 8;
const DEEP_TARGET = 15;

const i18n = {
  zh: {
    title: "探索者指南针",
    subtitle: "从心出发，发现天命",
    landingDesc: "这不是一次普通的测试。AI 将通过追问，剥离你作为“社会人”的伪装，帮你找回生命原点。请在无人打扰的安静环境中开始。",
    beginBtn: "开启旅程",
    intensityTitle: "选择对话强度",
    intensityDesc: "深度的旅程需要更多勇气去直面阴影，快速的相遇则直击本质。",
    modeLife: "人生意义",
    modeLifeDesc: "关于存在、痛苦、遗产与终极价值",
    modeJustice: "何为正义",
    modeJusticeDesc: "从分配正义到阶级异化，探索社会观",
    modeSelf: "我是谁？",
    modeSelfDesc: "从记忆连续性到数字足迹，考古你的自我",
    intensityQuick: "直觉相遇 (Quick)",
    intensityQuickDesc: "8轮左右的高频互动，快速捕捉你的灵魂切片。",
    intensityDeep: "深度追问 (Deep)",
    intensityDeepDesc: "无上限轮次，深入潜意识死角，直到真相浮现。",
    analyzingTitle: "正在解析真我能量...",
    analyzingDesc: "AI 正在重构你的叙事逻辑，编织属于你的灵魂图谱。",
    resultTitle: "探索终局报告",
    trendLabel: "思考趋向",
    inputPlaceholder: "输入你最真实、不加修饰的想法...",
    langToggle: "Switch to English",
    finishBtn: "生成探索报告",
    backBtn: "返回",
    exportChat: "对话记录",
    exportReport: "保存图谱",
    dimensionTitle: "真我能量矩阵",
    errorQuota: "连接中断。可能是 API 额度不足或网络波动。",
    retryBtn: "重新发送",
    settingsTitle: "API 配置",
    providerLabel: "AI 核心供应",
    apiKeyPlaceholder: "输入您的 API Key (可选)",
    saveBtn: "完成设置",
    customKeyTip: "你可以接入自己的 Gemini 或 DeepSeek (Reasoner) Key 以获得更稳定的体验。"
  },
  en: {
    title: "Explorer's Compass",
    subtitle: "Navigate Your Destiny",
    landingDesc: "Not a test. AI will strip away your social mask through probing questions. Start in a quiet place without distraction.",
    beginBtn: "Start",
    intensityTitle: "Dialogue Intensity",
    intensityDesc: "Deep journeys require courage to face shadows; quick ones hit the essence.",
    modeLife: "Life Meaning",
    modeLifeDesc: "Existence, Pain, Legacy & Values",
    modeJustice: "Social Justice",
    modeJusticeDesc: "From Distribution to Alienation",
    modeSelf: "Who Am I?",
    modeSelfDesc: "From memory to digital footprint, soul archaeology",
    intensityQuick: "Intuitive (Quick)",
    intensityQuickDesc: "~8 rounds of interaction to capture your soul slice.",
    intensityDeep: "Probing (Deep)",
    intensityDeepDesc: "Unlimited rounds, diving into subconscious corners.",
    analyzingTitle: "Decoding Energy...",
    analyzingDesc: "AI is reconstructing your narrative into a soul map.",
    resultTitle: "Final Report",
    trendLabel: "Cognitive Orientation",
    inputPlaceholder: "Type your raw, unfiltered thoughts...",
    langToggle: "中文",
    finishBtn: "Generate Report",
    backBtn: "Back",
    exportChat: "History",
    exportReport: "Save Map",
    dimensionTitle: "Authenticity Matrix",
    errorQuota: "Connection failed. Check API quota or network.",
    retryBtn: "Retry",
    settingsTitle: "API Settings",
    providerLabel: "AI Provider",
    apiKeyPlaceholder: "Your API Key (Optional)",
    saveBtn: "Save",
    customKeyTip: "Connect your Gemini or DeepSeek key for a stable experience."
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
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('explorer_compass_settings');
    return saved ? JSON.parse(saved) : { provider: 'gemini', apiKey: '' };
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const t = i18n[lang];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('explorer_compass_settings', JSON.stringify(newSettings));
    setShowSettings(false);
  };

  const reset = () => {
    setState('landing'); setMode(null); setIntensity('QUICK');
    setMessages([]); setInput(''); setIsLoading(false);
    setError(null); setResult(null); setQuestionCount(0);
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
      const firstQ = await getNextQuestion([{ id: 's', role: 'user', content: 'START', timestamp: Date.now() }], m, i, settings);
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
      const nextQRaw = await getNextQuestion([...messages, userMsg], mode, intensity, settings);
      const isDone = nextQRaw.includes('[DONE]');
      const reachedTarget = intensity === 'QUICK' ? questionCount >= QUICK_TARGET : questionCount >= DEEP_TARGET;
      if (isDone || reachedTarget) setCanFinishEarly(true);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: nextQRaw.replace('[DONE]', '').trim(), 
        timestamp: Date.now() 
      }]);
      setQuestionCount(prev => prev + 1);
    } catch (e: any) { setError(e.message || t.errorQuota); }
    finally { setIsLoading(false); }
  };

  const analyze = async () => {
    if (!mode) return;
    setState('analyzing'); setIsLoading(true);
    try {
      const res = await generateFinalAnalysis(messages, mode, settings);
      setResult(res); setState('result');
    } catch (e: any) { 
      console.error(e);
      setError(e.message || "Failed to analyze."); 
      setState('chatting'); 
    }
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

  const parseBilingual = (text: string | undefined) => {
    if (!text) return "";
    const parts = text.split('[SEP]');
    return (lang === 'zh' ? parts[0] : (parts[1] || parts[0])).trim();
  };

  if (state === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-8 right-8 flex gap-4">
          <button onClick={() => setShowSettings(true)} className="group flex items-center gap-2 px-5 py-3 bg-white shadow-sm rounded-full text-indigo-600 hover:shadow-md transition-all border border-indigo-50">
            <Settings size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-xs font-bold hidden md:inline">API Access</span>
          </button>
          <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} className="px-5 py-3 bg-white shadow-sm rounded-full text-xs font-bold text-indigo-600 border border-indigo-50 hover:shadow-md transition-all">
            <Languages size={18} className="inline mr-2" /> {t.langToggle}
          </button>
        </div>

        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><Key size={24}/></div>
                <h3 className="text-3xl font-bold font-serif">{t.settingsTitle}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t.customKeyTip}</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.providerLabel}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['gemini', 'deepseek'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setSettings(s => ({ ...s, provider: p as ApiProvider }))}
                        className={`py-4 rounded-2xl border-2 transition-all font-bold text-sm ${settings.provider === p ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">API Key</label>
                  <input 
                    type="password" 
                    value={settings.apiKey}
                    onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))}
                    placeholder={t.apiKeyPlaceholder}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all text-sm"
                  />
                </div>
                <button 
                  onClick={() => saveSettings(settings)}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all"
                >
                  {t.saveBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl text-center space-y-16 z-10">
          <div className="space-y-6">
            <h1 className="text-7xl font-serif font-bold text-slate-900 tracking-tight">{t.title}</h1>
            <p className="text-xl md:text-2xl text-slate-500 font-heiti max-w-2xl mx-auto leading-relaxed">{t.landingDesc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {id:'LIFE_MEANING', icon:ScrollText, label:t.modeLife, desc:t.modeLifeDesc, color:'bg-indigo-50 text-indigo-600'},
              {id:'JUSTICE', icon:Scale, label:t.modeJustice, desc:t.modeJusticeDesc, color:'bg-blue-50 text-blue-600'},
              {id:'SELF_IDENTITY', icon:Fingerprint, label:t.modeSelf, desc:t.modeSelfDesc, color:'bg-teal-50 text-teal-600'}
            ].map(m => (
              <button key={m.id} onClick={() => selectMode(m.id as DiscoveryMode)} className="group p-12 bg-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all text-center space-y-6 border border-transparent hover:border-indigo-50">
                <div className={`w-20 h-20 ${m.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}><m.icon size={40}/></div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-slate-800">{m.label}</h3>
                  <p className="text-slate-400 text-sm">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ... rest of the component (intensity_select, chatting, analyzing, result) ...
  if (state === 'intensity_select') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-2xl text-center space-y-12">
          <button onClick={() => setState('landing')} className="text-slate-400 font-bold flex items-center gap-2 mx-auto hover:text-indigo-600 transition-colors">
            <ArrowRight className="rotate-180" size={16}/>{t.backBtn}
          </button>
          <h1 className="text-5xl font-serif font-bold text-slate-900">{t.intensityTitle}</h1>
          <p className="text-lg text-slate-500">{t.intensityDesc}</p>
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={() => selectIntensity('QUICK')} className="p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4 group">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center group-hover:bg-yellow-100 transition-colors"><Timer size={32} /></div>
              <h3 className="text-2xl font-bold">{t.intensityQuick}</h3>
              <p className="text-slate-400 leading-relaxed">{t.intensityQuickDesc}</p>
            </button>
            <button onClick={() => selectIntensity('DEEP')} className="p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors"><InfinityIcon size={32} /></div>
              <h3 className="text-2xl font-bold">{t.intensityDeep}</h3>
              <p className="text-slate-400 leading-relaxed">{t.intensityDeepDesc}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-10">
        <Dna size={80} className="text-indigo-400 animate-pulse mb-8" />
        <h2 className="text-4xl font-serif mb-4 text-center">{t.analyzingTitle}</h2>
        <p className="text-slate-400 italic text-center max-w-md">{t.analyzingDesc}</p>
        <div className="mt-12 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]"></div>
        </div>
      </div>
    );
  }

  if (state === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="flex justify-between items-center bg-white/90 backdrop-blur p-5 rounded-3xl sticky top-4 z-50 shadow-md border border-slate-100">
             <button onClick={reset} className="px-6 py-2 text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-2 transition-colors"><ArrowRight className="rotate-180" size={16}/>{t.backBtn}</button>
             <div className="flex gap-3">
                <button onClick={() => exportAsImage(reportContainerRef, `Report_${mode}`)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"><FileImage size={18}/>{t.exportReport}</button>
                <button onClick={() => exportAsImage(chatContainerRef, `Chat_${mode}`)} className="px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all"><Layers size={18}/>{t.exportChat}</button>
             </div>
          </div>

          <div ref={reportContainerRef} className="bg-white p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-40 flex flex-col items-center export-container relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50"></div>
            
            <div className="text-center space-y-10 w-full max-w-2xl py-10 relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full text-[11px] tracking-[0.4em] font-bold uppercase"><Zap size={14} className="text-indigo-400" /> {t.resultTitle}</div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.15]">{parseBilingual(result.title)}</h1>
              {result.philosophicalTrend && (
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-[2rem] shadow-sm animate-in zoom-in-75">
                  <BrainCircuit size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">{t.trendLabel}: {parseBilingual(result.philosophicalTrend)}</span>
                </div>
              )}
              <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto rounded-full shadow-lg shadow-indigo-100 mt-6"></div>
            </div>

            <div className="w-full max-w-3xl py-10 text-center space-y-12 relative z-10">
              <div className="text-indigo-400 font-black tracking-[0.4em] text-[10px] uppercase">剖析 / Essence</div>
              <p className="text-2xl md:text-4xl text-slate-700 leading-[1.8] font-serif italic px-10 border-l-4 border-indigo-500/10">"{parseBilingual(result.summary)}"</p>
            </div>

            <div className="w-full max-w-2xl py-16 space-y-14 bg-slate-50 p-16 rounded-[4rem] border border-slate-100 shadow-inner">
              <div className="text-center space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">{t.dimensionTitle}</h3>
                <div className="w-12 h-0.5 bg-indigo-200 mx-auto"></div>
              </div>
              <div className="space-y-12">
                {result.dimensions?.map((dim, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between font-heiti font-bold text-lg"><span className="text-slate-600">{parseBilingual(dim.label)}</span><span className="text-indigo-600 font-serif italic text-2xl">{dim.value}%</span></div>
                    <div className="h-4 bg-white/80 border border-indigo-50 rounded-full overflow-hidden p-1 shadow-sm"><div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out" style={{width:`${dim.value}%`}}></div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-3xl py-10 space-y-16">
              <h3 className="text-center text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase">洞察 / Insights</h3>
              <div className="grid md:grid-cols-2 gap-10">
                {result.keyInsights.map((ins, i) => (
                  <div key={i} className="p-10 bg-white border border-slate-50 rounded-[3rem] shadow-sm hover:shadow-xl transition-all flex flex-col gap-6 group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><Target size={20}/></div>
                    <p className="text-xl text-slate-700 leading-relaxed font-heiti">{parseBilingual(ins)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-3xl py-10 space-y-16">
              <h3 className="text-center text-[10px] font-black text-teal-500 tracking-[0.4em] uppercase">进路 / Evolution</h3>
              <div className="space-y-8">
                {result.suggestedPaths.map((p, i) => (
                  <div key={i} className="p-12 bg-teal-50/20 rounded-[3.5rem] flex items-center gap-10 border border-teal-50 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg shadow-teal-100 group-hover:rotate-12 transition-transform">{i+1}</div>
                    <p className="text-2xl text-slate-800 font-heiti leading-relaxed">{parseBilingual(p)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-2xl py-20 text-center">
               <div className="p-20 md:p-32 bg-slate-900 rounded-[5rem] text-white space-y-10 relative overflow-hidden shadow-2xl">
                  <Quote className="absolute top-12 left-12 text-white/5" size={120} />
                  <div className="space-y-3 opacity-50">
                    <p className="text-[10px] tracking-[0.5em] font-bold uppercase">Soul Creed</p>
                    <div className="w-10 h-px bg-white mx-auto"></div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-serif italic leading-[1.6] text-indigo-50">"{parseBilingual(result.motto)}"</h3>
               </div>
            </div>
            <div className="pt-20 border-t border-slate-100 text-slate-300 text-[10px] tracking-[0.6em] font-black uppercase">EXPLORER'S COMPASS • AI SOUL NAVIGATOR • {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div style={{display:'none'}}><div ref={chatContainerRef} className="bg-white p-24 w-[1000px] flex flex-col gap-10 export-container">
          <div className="text-center space-y-4 pb-12 border-b">
            <h1 className="text-6xl font-serif font-bold text-slate-900">{t.title}</h1>
            <div className="text-indigo-500 font-bold uppercase tracking-[0.4em] text-sm">Full Dialogue Session • {mode}</div>
          </div>
          {messages.map(m => <ChatBubble key={m.id} message={m} language={lang} />)}
        </div></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-8 py-6 flex items-center justify-between border-b sticky top-0 bg-white/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-5">
          <button onClick={() => {if(window.confirm(t.backBtn)) reset()}} className="p-4 bg-slate-900 text-white rounded-[1.25rem] shadow-xl hover:scale-105 transition-transform"><Compass size={24}/></button>
          <div><h1 className="font-serif font-bold text-2xl text-slate-900">{t.title}</h1><p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{mode} • {intensity}</p></div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:block w-48"><ProgressBar current={questionCount} total={intensity==='QUICK'?QUICK_TARGET:DEEP_TARGET}/></div>
          <button onClick={() => setLang(l => l==='zh'?'en':'zh')} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-full"><Languages size={24}/></button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto pt-16 pb-40">
        <div className="max-w-4xl mx-auto px-6">
          {messages.map(m => <ChatBubble key={m.id} message={m} language={lang} />)}
          {error && <div className="p-12 bg-red-50 rounded-[3rem] text-center space-y-6 max-w-xl mx-auto border border-red-100 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-center gap-3 text-red-500 font-bold text-xl"><AlertCircle size={28}/>{t.errorQuota}</div>
            <button onClick={handleSend} className="px-10 py-4 bg-red-500 text-white rounded-2xl font-bold flex items-center gap-3 mx-auto shadow-lg shadow-red-100 hover:bg-red-600 transition-all"><RefreshCw size={20}/>{t.retryBtn}</button>
          </div>}
          {isLoading && <div className="flex justify-center p-12 opacity-30"><Dna className="animate-spin text-indigo-500" size={40}/></div>}
        </div>
      </main>

      <footer className="p-8 border-t bg-white sticky bottom-0 shadow-2xl z-30">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative flex gap-4">
            <textarea 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault();handleSend();}}} 
              placeholder={t.inputPlaceholder} 
              rows={2} 
              disabled={!!error || isLoading} 
              className="flex-1 p-8 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none text-2xl font-heiti resize-none transition-all disabled:opacity-50 shadow-inner" 
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading || !!error} 
              className="absolute right-4 bottom-4 p-6 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black active:scale-90 transition-all disabled:opacity-20 shadow-2xl"
            >
              <Send size={28}/>
            </button>
          </div>
          {canFinishEarly && !error && (
            <button 
              onClick={analyze} 
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-bold flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all text-xl tracking-[0.1em] animate-in fade-in slide-in-from-bottom-2"
            >
              <Sparkles size={24}/>{t.finishBtn}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
