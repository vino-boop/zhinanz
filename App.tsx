
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, DiscoveryResult, AppState, Language, DiscoveryMode, DiscoveryIntensity, AppSettings, ApiProvider, Dimension } from './types';
import { streamJudgeResponse, streamPhilosopherResponse, generateFinalAnalysis, clearSession } from './services/aiService';
import { philosophyApi, authApi } from './services/apiClient';
import { ChatBubble } from './components/ChatBubble';
import { ProgressBar } from './components/ProgressBar';
import { PhilosopherIntro } from './components/PhilosopherIntro';
import { HistorySidebar, saveToHistory } from './components/HistorySidebar';
import { ChatSidebar } from './components/ChatSidebar';
import { PhilosophersLibrary } from './components/PhilosophersLibrary';
import { PhilosopherTopicSelect } from './components/PhilosopherTopicSelect';
import { INITIAL_QUESTION_POOL } from './constants/questions';
import { 
  Compass, Send, RefreshCw, Sparkles, ArrowRight, Quote, Languages, Scale, 
  ScrollText, FileImage, Layers, Zap, Dna, Target, Timer, Infinity as InfinityIcon, AlertCircle, Settings, X, Key,
  BrainCircuit, Fingerprint, Cpu, Network, MessageSquare, FlaskConical, Binary, Eye,
  Dices, LayoutGrid, RotateCcw, User, Lock, Mail, Github, Menu, History, ChevronRight, LogOut, LogIn,
  Smartphone, Shield, Crown, GraduationCap, Users
} from 'lucide-react';

declare const html2canvas: any;

const QUICK_TARGET = 8;
const DEEP_TARGET = 15;

const i18n = {
  zh: {
    title: "探索者指南针",
    subtitle: "从心出发，发现天命",
    landingDesc: "这不是一次普通的测试。拉动命运的拉杆，抽取一个当下最需要面对的哲学命题。",
    drawBtn: "抽取命运卡牌",
    drawing: "命运流转中...",
    startJourney: "开启此旅程",
    redraw: "重新抽取",
    viewAll: "查看全部命题",
    allModesTitle: "全息哲学图谱",
    beginBtn: "开启旅程",
    intensityTitle: "选择对话强度",
    intensityDesc: "深度的旅程需要更多勇气去直面阴影。",
    modeLife: "人生意义",
    modeLifeDesc: "存在、痛苦与终极价值",
    modeJustice: "何为正义",
    modeJusticeDesc: "分配正义与社会契约",
    modeSelf: "我是谁？",
    modeSelfDesc: "考古你的自我本质",
    modeFreeWill: "自由意志",
    modeFreeWillDesc: "你是否只是生物机器？",
    modeSimulation: "模拟假说",
    modeSimulationDesc: "红蓝药丸的抉择",
    modeOtherMinds: "他者意识",
    modeOtherMindsDesc: "唯我论与哲学僵尸",
    modeLanguage: "语言边界",
    modeLanguageDesc: "我们能理解彼此吗？",
    modeScience: "科学真理",
    modeScienceDesc: "发现真理还是发明模型？",
    intensityQuick: "直觉相遇 (Quick)",
    intensityQuickDesc: "8轮左右的高频互动。",
    intensityDeep: "深度追问 (Deep)",
    intensityDeepDesc: "无上限轮次，直到真相浮现。",
    analyzingTitle: "正在重构灵魂图谱...",
    analyzingDesc: "AI 正在分析您的思考底色，编织最终报告。",
    resultTitle: "探索终局报告",
    trendLabel: "哲学底色",
    inputPlaceholder: "输入你的任何想法，任何...",
    langToggle: "Switch to English",
    finishBtn: "生成探索报告",
    backBtn: "返回",
    exportChat: "对话记录",
    exportReport: "保存图谱",
    dimensionTitle: "真我能量矩阵",
    errorQuota: "连接中断。请检查网络或 API 额度。",
    retryBtn: "重新发送",
    settingsTitle: "设置",
    viewPhilosophers: "查看哲学家",
    providerLabel: "智能引擎",
    apiKeyPlaceholder: "输入您的 API Key",
    saveBtn: "确认保存",
    customKeyTip: "选择引擎并配置 Key。DeepSeek 提供更犀利的逻辑，Gemini 提供更广博的视野。",
    loginTitle: "登录探索者",
    loginDesc: "开启您的哲学探索之旅",
    phonePlaceholder: "手机号",
    passwordPlaceholder: "密码",
    verifyCodePlaceholder: "验证码",
    loginBtn: "登录",
    registerBtn: "注册",
    sendCodeBtn: "发送验证码",
    wechatLogin: "微信登录",
    guestLogin: "游客访问",
    accountInfo: "账号信息",
    switchAccount: "切换账号",
    logout: "退出登录",
    tokens: "先令",
    editProfile: "修改资料",
    saveProfile: "保存",
    cancel: "取消",
    newTopicCost: "新话题",
    answerCost: "每次回答",
    summaryCost: "总结",
    notEnoughTokens: "先令不足",
    fateAwaits: "命运降临",
    tapToReveal: "点击下方按钮揭晓",
    menu: "菜单"
  },
  en: {
    title: "Explorer's Compass",
    subtitle: "Navigate Your Soul",
    landingDesc: "Not just a test. Pull the lever of fate to draw the philosophical question you most need to face right now.",
    drawBtn: "Draw Fate Card",
    drawing: "Spinning the Wheel of Fate...",
    startJourney: "Embark",
    redraw: "Draw Again",
    viewAll: "View All Themes",
    allModesTitle: "Holographic Map",
    beginBtn: "Start Journey",
    intensityTitle: "Dialogue Intensity",
    intensityDesc: "Deep journeys require courage to face the truth.",
    modeLife: "Life Meaning",
    modeLifeDesc: "Existence & Values",
    modeJustice: "Social Justice",
    modeJusticeDesc: "Contracts & Fairness",
    modeSelf: "Who Am I?",
    modeSelfDesc: "Archaeology of Identity",
    modeFreeWill: "Free Will",
    modeFreeWillDesc: "Are you a bio-machine?",
    modeSimulation: "Simulation",
    modeSimulationDesc: "Red or Blue Pill?",
    modeOtherMinds: "Other Minds",
    modeOtherMindsDesc: "Solipsism & Zombies",
    modeLanguage: "Language",
    modeLanguageDesc: "Can we truly understand?",
    modeScience: "Science & Truth",
    modeScienceDesc: "Discovery or Invention?",
    intensityQuick: "Intuitive (Quick)",
    intensityQuickDesc: "~8 rounds of interaction.",
    intensityDeep: "Probing (Deep)",
    intensityDeepDesc: "Unlimited depth until truth emerges.",
    analyzingTitle: "Decoding Essence...",
    analyzingDesc: "AI is weaving your thought patterns into a map.",
    resultTitle: "Final Report",
    trendLabel: "Core Philosophy",
    inputPlaceholder: "Type your raw thoughts...",
    langToggle: "中文",
    finishBtn: "Generate Report",
    backBtn: "Back",
    exportChat: "History",
    exportReport: "Save Map",
    dimensionTitle: "Authenticity Matrix",
    errorQuota: "Connection failed. Check API or network.",
    retryBtn: "Retry",
    settingsTitle: "Settings",
    viewPhilosophers: "View Philosophers",
    providerLabel: "AI Engine",
    apiKeyPlaceholder: "Enter your API Key",
    saveBtn: "Save Changes",
    customKeyTip: "Select your engine. DeepSeek for logic, Gemini for breadth.",
    loginTitle: "Login",
    loginDesc: "Begin your philosophical odyssey",
    phonePlaceholder: "Phone Number",
    passwordPlaceholder: "Password",
    verifyCodePlaceholder: "Verify Code",
    loginBtn: "Login",
    registerBtn: "Register",
    sendCodeBtn: "Send Code",
    wechatLogin: "WeChat",
    guestLogin: "Guest Mode",
    accountInfo: "Account Info",
    switchAccount: "Switch Account",
    logout: "Logout",
    tokens: "Shi ling",
    editProfile: "Edit Profile",
    saveProfile: "Save",
    cancel: "Cancel",
    newTopicCost: "New Topic",
    answerCost: "Per Answer",
    summaryCost: "Summary",
    notEnoughTokens: "Insufficient Shi ling",
    fateAwaits: "Fate Awaits",
    tapToReveal: "Tap button to reveal",
    menu: "Menu"
  }
};

const MODE_DEFINITIONS = [
  {id:'LIFE_MEANING', icon:ScrollText, color:'text-indigo-600', bg:'bg-indigo-50'},
  {id:'JUSTICE', icon:Scale, color:'text-blue-600', bg:'bg-blue-50'},
  {id:'SELF_IDENTITY', icon:Fingerprint, color:'text-teal-600', bg:'bg-teal-50'},
  {id:'FREE_WILL', icon:Cpu, color:'text-amber-600', bg:'bg-amber-50'},
  {id:'SIMULATION', icon:Binary, color:'text-red-600', bg:'bg-red-50'},
  {id:'OTHER_MINDS', icon:Eye, color:'text-purple-600', bg:'bg-purple-50'},
  {id:'LANGUAGE', icon:MessageSquare, color:'text-pink-600', bg:'bg-pink-50'},
  {id:'SCIENCE', icon:FlaskConical, color:'text-cyan-600', bg:'bg-cyan-50'},
];

// Replicate list for infinite scroll illusion
const SLOT_ITEMS = [...MODE_DEFINITIONS, ...MODE_DEFINITIONS, ...MODE_DEFINITIONS, ...MODE_DEFINITIONS, ...MODE_DEFINITIONS, ...MODE_DEFINITIONS];
const ITEM_HEIGHT = 160; // px
const SLOT_OFFSET = -25; // 居中偏移量，让icon和文字在中间

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('auth');
  const [user, setUser] = useState<{id: number; username: string; phone?: string; tokens?: number; role: string} | null>(null);
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
  const startContentRef = useRef<string>('START');
  
  // Settings & Lottery State
  const [showSettings, setShowSettings] = useState(false);
  const [showPhilosopherIntro, setShowPhilosopherIntro] = useState(false);
  const [showAllModes, setShowAllModes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPhilosophers, setShowPhilosophers] = useState(false); // 哲学家库弹窗
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<{id: number; name: string; display_name_zh: string; display_name_en: string; era?: string; description?: string; prompt?: string; keywords?: string | string[]; modes?: string} | null>(null); // 选中的哲学家
  const [philosopherTopic, setPhilosopherTopic] = useState<string | null>(null); // 哲学家对话的话题
  const [philosopherMode, setPhilosopherMode] = useState(false); // 是否是哲学家一对一模式
  const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isSlotRevealed, setIsSlotRevealed] = useState(false);
  const [drawnMode, setDrawnMode] = useState<DiscoveryMode | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  
  // Token 系统状态
  const [userTokens, setUserTokens] = useState<number>(100); // 用户先令
  const [showEditProfile, setShowEditProfile] = useState(false); // 修改资料弹窗
  const [showVIP, setShowVIP] = useState(false); // 会员购买弹窗

  // Two-phase dialogue state
  const [dialoguePhase, setDialoguePhase] = useState<'judge' | 'philosopher' | 'waiting'>('waiting');
  const [lastJudgeContent, setLastJudgeContent] = useState<string>('');
  
  // 硬编码的 API Key（从数据库读取）
  const PHILOSOPHY_API_KEY = 'sk-b9e79da674114733be8df0d48a2095a2';
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    // 先检查 localStorage
    const saved = localStorage.getItem('explorer_compass_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey) {
        return parsed;
      }
    }
    // 如果没有，使用默认 API Key
    const defaultSettings = { provider: 'deepseek', apiKey: PHILOSOPHY_API_KEY };
    localStorage.setItem('explorer_compass_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  });

  // 登录表单状态
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // 切换登录/注册
  const [codeSent, setCodeSent] = useState(false); // 验证码发送状态
  const [countdown, setCountdown] = useState(0); // 倒计时

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
    clearSession();
    setState('landing'); setMode(null); setIntensity('QUICK');
    setMessages([]); setInput(''); setIsLoading(false);
    setError(null); setResult(null); setQuestionCount(0);
    setCanFinishEarly(false);
    setDrawnMode(null);
    setIsSpinning(false);
    setIsSlotRevealed(false);
    setDialoguePhase('waiting');
    setLastJudgeContent('');
    // 重置哲学家模式状态
    setPhilosopherMode(false);
    setSelectedPhilosopher(null);
    setPhilosopherTopic(null);
  };

  // 处理点击历史记录 - 加载历史对话或报告
  const handleSelectHistory = async (history: any) => {
    console.log('选中历史记录:', history);
    
    // 使用 sessionId 作为会话ID
    const sessionId = history.sessionId || history.id;
    const userId = user?.id;
    
    if (history.isComplete && history.result) {
      // 有完整报告 - 跳转到报告页面
      setResult(history.result);
      setMode(history.mode);
      setState('result');
    } else if (sessionId && userId) {
      // 加载对话内容
      try {
        const res: any = await philosophyApi.getConversations(String(userId), sessionId);
        if (res.conversations && res.conversations.length > 0) {
          // 构建消息数组
          const loadedMessages: Message[] = [];
          
          res.conversations.forEach((conv: any) => {
            if (conv.judge_question) {
              loadedMessages.push({
                id: `${conv.id}-q`,
                role: 'user',
                content: conv.judge_question,
                timestamp: new Date(conv.created_at).getTime()
              });
            }
            if (conv.user_answer) {
              loadedMessages.push({
                id: `${conv.id}-a`,
                role: 'assistant',
                content: conv.user_answer,
                timestamp: new Date(conv.created_at).getTime() + 1
              });
            }
            if (conv.philosopher_response) {
              loadedMessages.push({
                id: `${conv.id}-p`,
                role: 'assistant',
                content: conv.philosopher_response,
                timestamp: new Date(conv.created_at).getTime() + 2
              });
            }
          });
          
          setMessages(loadedMessages);
        }
        setMode(history.mode);
        setState('chatting');
      } catch (error) {
        console.error('加载对话失败:', error);
        setMode(history.mode);
        setState('chatting');
      }
    } else {
      setMode(history.mode);
      setState('chatting');
    }
    
    setCurrentHistoryId(sessionId);
    setShowSidebar(false);
  };

  // 登录处理
  const handleLogin = async (phone: string, password: string) => {
    try {
      const res: any = await authApi.login(phone, password);
      if (res.success) {
        setUser(res.user);
        // 从返回数据中获取 token
        setUserTokens(res.user?.tokens || res.user?.token_balance || 100);
        setState('landing');
        localStorage.setItem('user', JSON.stringify(res.user));
      } else {
        alert(res.message || '登录失败');
      }
    } catch (e: any) {
      alert(e.message || '登录失败，请检查网络');
    }
  };

  // 注册处理
  const handleRegister = async (phone: string, password: string, code: string) => {
    try {
      // TODO: 验证码校验
      const res: any = await authApi.register(phone, password, phone); // 手机号作为账号
      if (res.success) {
        setUser(res.user);
        // 新用户默认 100 token
        setUserTokens(100);
        setState('landing');
        localStorage.setItem('user', JSON.stringify(res.user));
      } else {
        alert(res.message || '注册失败');
      }
    } catch (e: any) {
      alert(e.message || '注册失败，请检查网络');
    }
  };

  // 游客登录处理 - 录入后端，但不送先令
  const handleGuestLogin = async () => {
    try {
      const guestId = `guest_${Date.now()}`;
      const res: any = await authApi.register(guestId, '', ''); // 用 guest_时间戳 作为用户名，密码为空
      if (res.success) {
        setUser(res.user);
        // 游客默认 0 token（不送免费先令）
        setUserTokens(0);
        setState('landing');
        localStorage.setItem('user', JSON.stringify(res.user));
      } else {
        // 如果注册失败（比如用户名已存在），尝试直接登录
        console.log('游客注册失败，尝试登录');
        setState('landing');
      }
    } catch (e: any) {
      // 网络错误也允许游客进入
      console.error('游客登录失败:', e);
      setState('landing');
    }
  };

  // 发送验证码
  const handleSendCode = () => {
    if (!loginPhone || loginPhone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }
    // TODO: 实际发送验证码 API
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCodeSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 检查已登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setState('landing');
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const selectMode = (m: DiscoveryMode) => { setMode(m); setState('intensity_select'); setShowAllModes(false); };
  const selectIntensity = (i: DiscoveryIntensity) => { 
    // 检查 token 是否足够开启新话题 (30 token)
    if (user && userTokens < 30) {
      alert(lang === 'zh' ? '先令不足，需要30点开启新话题' : 'Insufficient Shi ling. Need 30 to start a new topic');
      return;
    }
    // 扣除 token
    if (user) {
      const newTokens = userTokens - 30;
      setUserTokens(newTokens);
      // 同步到数据库
      philosophyApi.updateTokens(user.id, 30, 'deduct').catch(console.error);
    }
    setIntensity(i); setState('chatting'); 
    if (mode) startJourney(mode, i); 
  };

  const startSpin = () => {
    if (isSpinning) return;
    
    setIsSlotRevealed(true); // Reveal the slot machine
    setIsSpinning(true);
    setDrawnMode(null);

    // Randomize result (pick from the last 2 sets to allow long scroll)
    const baseIndex = SLOT_ITEMS.length - (MODE_DEFINITIONS.length * 2);
    const randomOffset = Math.floor(Math.random() * MODE_DEFINITIONS.length);
    const finalIndex = baseIndex + randomOffset;
    const finalMode = SLOT_ITEMS[finalIndex];

    if (slotRef.current) {
      // Reset position instantly
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = `translateY(${SLOT_OFFSET}px)`;
      
      // Force reflow
      void slotRef.current.offsetHeight;

      // Start spinning
      setTimeout(() => {
        if (slotRef.current) {
            slotRef.current.style.transition = 'transform 3s cubic-bezier(0.1, 0.9, 0.2, 1)'; // Ease out
            slotRef.current.style.transform = `translateY(-${finalIndex * ITEM_HEIGHT + SLOT_OFFSET}px)`;
        }
      }, 50);

      // Finish spin
      setTimeout(() => {
        setIsSpinning(false);
        setDrawnMode(finalMode.id as DiscoveryMode);
      }, 3000);
    }
  };

  const startJourney = async (m: DiscoveryMode, i: DiscoveryIntensity) => {
    setIsLoading(true); setError(null);
    setDialoguePhase('judge'); // 开始审判机阶段
    setSessionId(`session-${Date.now()}`); // 创建新的session ID
    
    // 开始新对话时保存历史记录
    const modeLabel = MODE_DEFINITIONS.find(def => def.id === m)?.id || m;
    const { saveToHistory } = await import('./components/HistorySidebar');
    const newHistoryId = saveToHistory(m, modeLabel, 0, '', undefined, false);
    console.log('新对话已保存到历史记录:', newHistoryId);
    // 刷新历史记录
    setHistoryRefreshKey(prev => prev + 1);
    
    try {
      const pool = INITIAL_QUESTION_POOL[m];
      const randomQ = pool[Math.floor(Math.random() * pool.length)];
      const startContent = `START:${randomQ.content}|SUGGESTIONS:${JSON.stringify(randomQ.suggestions)}`;
      startContentRef.current = startContent;
      
      const turnId = `start-${Date.now()}`;
      const judgeMessageId = `${turnId}-0`; // 固定消息ID
      
      const stream = streamJudgeResponse([{ id: 'start-signal', role: 'user', content: startContent, timestamp: Date.now() }], m, i, settings, lang, 1);
      
      let judgeResponseContent = '';
      let initialSuggestions: string[] = [];
      let isFirstMessage = true;

      for await (const { messages: parsedMessages, isDone, judgeContent } of stream) {
        if (parsedMessages.length > 0) {
          const msg = parsedMessages[0];
          
          if (isFirstMessage) {
            // 首次添加消息
            setMessages(prev => [...prev, { ...msg, id: judgeMessageId }]);
            isFirstMessage = false;
          } else {
            // 更新现有消息的内容
            setMessages(prev => prev.map(m => 
              m.id === judgeMessageId ? { ...msg, id: judgeMessageId } : m
            ));
          }
        }
        
        // 保存审判机内容用于哲学家阶段
        if (judgeContent) {
          setLastJudgeContent(judgeContent);
          judgeResponseContent = judgeContent;
        }
        // 保存初始建议
        if (parsedMessages[0]?.suggestions) {
          initialSuggestions = parsedMessages[0].suggestions;
        }
      }
      
      setQuestionCount(1);

      // ===== 初始问题后不立即显示哲学家，等待用户第一轮回复 =====
      // 对话进入等待阶段，等用户回答后再触发哲学家点评
      setDialoguePhase('waiting');
      setIsLoading(false);
    } catch (e: any) { 
      setError(e.message || t.errorQuota); 
      setDialoguePhase('waiting');
    }
    finally { setIsLoading(false); }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading || !mode) return;

    // 检查 token 是否足够回答 (5 token)
    if (user && userTokens < 5) {
      alert(lang === 'zh' ? '先令不足，需要5点回答问题' : 'Insufficient Shi ling. Need 5 to answer');
      return;
    }

    // 扣除回答消耗的 token
    if (user) {
      const newTokens = userTokens - 5;
      setUserTokens(newTokens);
      // 同步到数据库
      philosophyApi.updateTokens(user.id, 5, 'deduct').catch(console.error);
    }

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: textToSend, timestamp: Date.now() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setIsLoading(true); setError(null);
    
    console.log('=== 开始处理用户回答 ===');
    console.log('用户回答:', textToSend);
    console.log('哲学家模式:', philosopherMode);
    
    try {
      // ===== 哲学家一对一模式 =====
      if (philosopherMode && selectedPhilosopher) {
        setDialoguePhase('philosopher');
        console.log('=== 哲学家一对一对话模式 ===');
        
        // 构建哲学家名称和提示
        const philosopherName = lang === 'zh' ? selectedPhilosopher.display_name_zh : (selectedPhilosopher.display_name_en || selectedPhilosopher.name);
        const philosopherPrompt = selectedPhilosopher.prompt || '';
        const isZh = lang === 'zh';
        
        try {
          // 构建增强的 prompt，让哲学家进行反问和争论
          const debatePrompt = isZh
            ? `你是${philosopherName}。${philosopherPrompt}
            
当前话题：${philosopherTopic || '生命意义'}

用户刚才的回答：${textToSend}

请基于你的哲学思想，对用户的回答进行反驳、质疑或深入追问。要求：
1. 直接指出用户观点中的问题或矛盾
2. 引入你的哲学立场进行辩论，论证要充分
3. 提出尖锐的反问，让用户陷入思考
4. 可以加入适当的动作和神态描写
5. 控制在150-200字，观点要犀利，论证要完整`
            : `You are ${philosopherName}. ${philosopherPrompt}

Current topic: ${philosopherTopic || 'Meaning of Life'}

User's answer: ${textToSend}

Please refute, question, or deeply inquire about the user's answer based on your philosophical stance. Requirements:
1. Point out problems or contradictions in the user's viewpoint
2. Introduce your philosophical position for debate with thorough argumentation
3. Ask sharp counterquestions to make the user think
4. Include appropriate actions and expressions
5. Keep within 150-200 words, be incisive and comprehensive`;

          // 直接调用 AI 生成回复（不带审判机）
          const philosopherStream = streamPhilosopherResponse(
            textToSend,
            philosopherTopic || '',
            mode,
            settings,
            lang,
            {
              name: philosopherName,
              prompt: debatePrompt,
              keywords: selectedPhilosopher.keywords as any
            }
          );

          // 逐个显示哲学家消息
          for await (const { messages: newPhilosopherMessages } of philosopherStream) {
            console.log('收到哲学家消息:', newPhilosopherMessages);
            if (newPhilosopherMessages.length > 0) {
              for (let i = 0; i < newPhilosopherMessages.length; i++) {
                const msg = newPhilosopherMessages[i];
                setMessages(prev => [...prev, { ...msg, speaker: philosopherName, id: `phil-${Date.now()}-${i}` }]);
                
                setTimeout(() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                  }
                }, 100);
                
                await new Promise(resolve => setTimeout(resolve, 1200));
              }
            }
          }
          
          console.log('哲学家回复完成');
          
          // 保存对话历史到数据库
          try {
            await philosophyApi.saveConversation({
              user_id: user?.username || 'guest',
              session_id: sessionId,
              mode: `philosopher_${philosopherName}`,
              round: questionCount + 1,
              judge_question: philosopherTopic || '',
              user_answer: textToSend,
              judge_response: '',
              philosopher_response: newPhilosopherMessages?.[0]?.content || ''
            });
          } catch (e) { console.error('保存对话失败:', e); }
          
          setQuestionCount(prev => prev + 1);
          setDialoguePhase('waiting');
          setIsLoading(false);
          
          // 哲学家一对一模式直接返回
          console.log('哲学家对话完成，准备返回');
          return; // 哲学家模式直接返回，不走下面的审判机逻辑
        } catch (e: any) {
          console.error('哲学家回复失败:', e);
          setError(e.message || t.errorQuota);
          setIsLoading(false);
          return;
        }
      }
      
      // 如果是哲学家模式但没有选中哲学家，也直接返回
      if (philosopherMode) {
        console.log('哲学家模式但未选中哲学家，直接返回');
        setIsLoading(false);
        return;
      }
      
      // ===== 普通模式：审判机 + 哲学家 =====
      // 移除审判机消息的 suggestions（隐藏 chips）
      setMessages(prev => {
        const msgs = [...prev];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].speaker === 'Judge' && msgs[i].suggestions) {
            msgs[i] = { ...msgs[i], suggestions: undefined };
            break;
          }
        }
        return msgs;
      });
      
      // ===== 第一阶段：审判机回复 =====
      setDialoguePhase('judge');
      
      // 只提取用户和审判机的消息，忽略哲学家回复（减少上下文）
      const relevantMessages = messages.filter(m => 
        m.role === 'user' || m.speaker === 'Judge'
      );
      const historyWithSignal = [{ id: 's', role: 'user', content: startContentRef.current, timestamp: 0 }, ...relevantMessages, userMsg];
      
      console.log('历史消息数量:', historyWithSignal.length);
      
      const turnId = `turn-${Date.now()}`;
      let finalIsDone = false;
      let judgeResponseContent = '';
      let currentParsedMessages: Message[] = [];
      let judgeMessageId = '';

      // ===== 第一阶段：直接到哲学家点评（跳过审判机追问）=====
      // ===== 第二阶段：哲学家回复 =====
      setDialoguePhase('philosopher');
      console.log('=== 开始哲学家回复阶段 ===');
      
      try {
        // 获取哲学家回复
        const philosopherStream = streamPhilosopherResponse(
          textToSend,
          lastJudgeContent || judgeResponseContent,
          mode,
          settings,
          lang
        );

        // 逐个显示哲学家消息
        for await (const { messages: newPhilosopherMessages } of philosopherStream) {
          console.log('收到哲学家消息:', newPhilosopherMessages);
          if (newPhilosopherMessages.length > 0) {
            // 每条消息单独添加，带延迟
            for (let i = 0; i < newPhilosopherMessages.length; i++) {
              const msg = newPhilosopherMessages[i];
              setMessages(prev => [...prev, { ...msg, id: `phil-${Date.now()}-${i}` }]);
              
              // 滚动到底部
              setTimeout(() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
              }, 100);
              
              // 每条消息之间延迟
              await new Promise(resolve => setTimeout(resolve, 1200));
            }
          }
        }
        
        console.log('哲学家回复完成');
        
        // 保存对话历史到数据库
        try {
          // 获取本轮对话的相关消息
          const judgeMsgs = messages.filter(m => m.speaker === 'Judge' || m.speaker === '审判机');
          const userMsgs = messages.filter(m => m.role === 'user');
          const philosopherMsgs = messages.filter(m => m.speaker && m.speaker.startsWith('Persona:'));
          
          const lastJudgeQuestion = judgeMsgs.length > 0 ? judgeMsgs[judgeMsgs.length - 1].content : '';
          const lastUserAnswer = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : textToSend;
          const lastJudgeResponse = ''; // 审判机的回应
          const lastPhilosopherResponse = philosopherMsgs.length > 0 
            ? philosopherMsgs.map(m => m.content).join('\n\n') 
            : '';
          
          await philosophyApi.saveConversation({
            user_id: user?.username || 'guest',
            session_id: sessionId,
            mode: mode || '',
            round: questionCount + 1,
            judge_question: lastJudgeQuestion,
            user_answer: lastUserAnswer,
            judge_response: lastJudgeResponse,
            philosopher_response: lastPhilosopherResponse
          });
          console.log('对话历史已保存到数据库');
        } catch (saveErr) {
          console.error('保存对话历史失败:', saveErr);
        }
        
      } catch (philError: any) {
        console.error('哲学家回复错误:', philError);
        setError(philError.message || '哲学家回复失败');
      }

      // ===== 第三阶段：审判机下一个新问题 =====
      console.log('=== 开始审判机下一轮提问 ===');
      setDialoguePhase('judge');
      
      // 更新历史，包含用户回答和哲学家回复（不包括审判机的上一个问题）
      const fullHistory = messages.filter(m => 
        m.role === 'user' || (m.speaker && m.speaker.startsWith('Persona:'))
      );
      fullHistory.push(userMsg);
      
      const nextTurnId = `next-${Date.now()}`;
      let nextJudgeContent = '';
      let nextParsedMessages: Message[] = [];
      let nextJudgeMessageId = '';
      
      const nextJudgeStream = streamJudgeResponse(
        [{ id: 's', role: 'user', content: '请提出一个新的哲学问题', timestamp: 0 }, ...fullHistory] as Message[],
        mode, intensity, settings, lang, questionCount + 2
      );
      
      for await (const { messages: parsedMessages, isDone, judgeContent } of nextJudgeStream) {
        finalIsDone = isDone;
        if (judgeContent) {
          nextJudgeContent = judgeContent;
          setLastJudgeContent(judgeContent);
        }
        nextParsedMessages = parsedMessages;
        
        if (!nextJudgeMessageId && parsedMessages.length > 0) {
          nextJudgeMessageId = `${nextTurnId}-0`;
          setMessages(prev => [...prev, { ...parsedMessages[0], id: nextJudgeMessageId }]);
        } else if (parsedMessages.length > 0) {
          setMessages(prev => prev.map(m => 
            m.id === nextJudgeMessageId ? { ...parsedMessages[0], id: nextJudgeMessageId } : m
          ));
        }
      }

      // 更新审判机内容用于下一轮
      judgeResponseContent = nextJudgeContent;
      currentParsedMessages = nextParsedMessages;

      const reachedTarget = intensity === 'QUICK' ? questionCount >= QUICK_TARGET : questionCount >= DEEP_TARGET;
      if (finalIsDone || reachedTarget) setCanFinishEarly(true);
      
      setQuestionCount(prev => prev + 1);
      setDialoguePhase('waiting');
    } catch (e: any) { 
      setError(e.message || t.errorQuota); 
      setDialoguePhase('waiting');
    }
    finally { setIsLoading(false); }
  };

  const analyze = async () => {
    if (!mode) return;
    
    // 检查 token 是否足够生成总结 (20 token)
    if (user && userTokens < 20) {
      alert(lang === 'zh' ? '先令不足，需要20点生成总结' : 'Insufficient Shi ling. Need 20 to generate summary');
      return;
    }
    
    // 扣除总结消耗的 token
    if (user) {
      setUserTokens(prev => prev - 20);
    }
    
    setState('analyzing'); setIsLoading(true);
    try {
      const res = await generateFinalAnalysis([{ id: 's', role: 'user', content: 'START', timestamp: 0 }, ...messages], mode, settings);
      setResult(res); setState('result');
      
      // 保存到后端历史记录 - 使用已有的sessionId
      const userId = user?.username || localStorage.getItem('guestUserId') || `guest_${Date.now()}`;
      // 保存guest用户ID到localStorage
      if (!user?.username && !localStorage.getItem('guestUserId')) {
        localStorage.setItem('guestUserId', userId);
      }
      const currentSessionId = sessionId || `session-${Date.now()}`;
      const historyData = {
        userId,
        sessionId: currentSessionId,
        messages: [{ id: 's', role: 'user', content: 'START', timestamp: 0 }, ...messages],
        mode,
        result: res, // 保存分析报告
        createdAt: new Date().toISOString()
      };
      
      // 保存到服务器
      philosophyApi.saveHistory(userId, currentSessionId, historyData.messages, mode).then(() => {
        console.log('历史记录已保存到服务器, userId:', userId, 'sessionId:', currentSessionId);
      }).catch(err => {
        console.error('保存历史失败:', err);
      });
      
      // 保存分析报告到 ik_analysis_reports 表
      try {
        // 转换 dimensions 数组为对象
        const dimensionsObj: Record<string, number> = {};
        if (res.dimensions && Array.isArray(res.dimensions)) {
          res.dimensions.forEach((d: Dimension) => {
            dimensionsObj[d.label] = d.value;
          });
        }
        
        await philosophyApi.saveReport({
          user_id: userId,
          session_id: currentSessionId,
          mode: mode || '',
          title: res.title || '',
          summary: res.summary || '',
          philosophical_trend: res.philosophicalTrend || '',
          key_insights: res.keyInsights || [],
          suggested_paths: res.suggestedPaths || [],
          motto: res.motto || '',
          dimensions: dimensionsObj,
          raw_data: JSON.stringify(res)
        });
        console.log('分析报告已保存到数据库');
      } catch (reportErr) {
        console.error('保存分析报告失败:', reportErr);
      }
      
      // 同时保存到 localStorage（用于侧边栏显示）
      const { saveToHistory } = await import('./components/HistorySidebar');
      const modeLabel = getModeLabel(mode);
      const lastMessage = messages[messages.length - 1]?.content?.slice(0, 50) || '';
      saveToHistory(mode, modeLabel, messages.filter(m => m.role === 'user').length, lastMessage, res, true);
      
    } catch (e: any) { 
      console.error(e);
      setError(e.message || "Analysis Failed"); 
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

  const getModeLabel = (m: DiscoveryMode | null) => {
    if (!m) return "";
    const labels: Record<DiscoveryMode, string> = {
      LIFE_MEANING: t.modeLife,
      JUSTICE: t.modeJustice,
      SELF_IDENTITY: t.modeSelf,
      FREE_WILL: t.modeFreeWill,
      SIMULATION: t.modeSimulation,
      OTHER_MINDS: t.modeOtherMinds,
      LANGUAGE: t.modeLanguage,
      SCIENCE: t.modeScience,
    };
    return labels[m] || m;
  };

  const getModeDesc = (m: DiscoveryMode | null) => {
    if (!m) return "";
    const descs: Record<DiscoveryMode, string> = {
      LIFE_MEANING: t.modeLifeDesc,
      JUSTICE: t.modeJusticeDesc,
      SELF_IDENTITY: t.modeSelfDesc,
      FREE_WILL: t.modeFreeWillDesc,
      SIMULATION: t.modeSimulationDesc,
      OTHER_MINDS: t.modeOtherMindsDesc,
      LANGUAGE: t.modeLanguageDesc,
      SCIENCE: t.modeScienceDesc,
    };
    return descs[m] || "";
  }

  // Helper to render suggestion chips - 升级版
  const renderSuggestions = () => {
    // 找到最后一条审判机的消息，显示其 Suggestions
    const lastJudgeMsg = [...messages].reverse().find(m => m.speaker === 'Judge' && m.suggestions && m.suggestions.length > 0);
    if (!lastJudgeMsg || !lastJudgeMsg.suggestions || lastJudgeMsg.suggestions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 mb-4 animate-in slide-in-from-bottom-3 fade-in duration-300">
        {lastJudgeMsg.suggestions.map((s, i) => {
          const text = parseBilingual(s);
          return (
            <button 
              key={i} 
              // 点击后放入输入框，让用户修改后发送
              onClick={() => setInput(text)}
              className="
                px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 
                hover:scale-105 active:scale-95 shadow-sm hover:shadow-md
                bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50
                flex items-center gap-2
              "
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {text}
            </button>
          );
        })}
      </div>
    );
  };

  // 加载动画 - 更有趣的等待文案
  const renderLoading = () => {
    if (!isLoading) return null;

    if (dialoguePhase === 'judge') {
      const messages = [
        '审判机正在称量你的回答...',
        '在善恶的天平上校准...',
        '寻找你逻辑中的漏洞...',
        '编织下一个思想困境...',
        '审判你的哲学立场...',
      ];
      const msg = messages[Math.floor(Date.now() / 3000) % messages.length];
      
      return (
        <div className="flex items-center justify-center gap-4 py-5 px-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 shadow-md mb-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="relative">
            <Scale className="text-amber-600" size={28} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1">
            <span className="text-amber-800 font-bold text-sm">⚖️ 审判机</span>
            <p className="text-amber-700 text-sm mt-0.5">{msg}</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></span>
            ))}
          </div>
        </div>
      );
    }

    if (dialoguePhase === 'philosopher') {
      const messages = [
        '西西弗斯正在推石头...',
        '尼采正在审视你的灵魂...',
        '康德在思考你的答案...',
        '萨特在说：存在先于本质...',
        '庄子梦中变为蝴蝶...',
        '第欧根尼寻找真小人...',
        '苏格拉底在追问...',
        '德尔斐：认识你自己...',
      ];
      const msg = messages[Math.floor(Date.now() / 2500) % messages.length];
      
      return (
        <div className="flex items-center justify-center gap-4 py-5 px-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-md mb-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="relative">
            <BrainCircuit className="text-purple-600" size={28} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <span className="text-purple-800 font-bold text-sm">🧠 哲学家</span>
            <p className="text-purple-700 text-sm mt-0.5">{msg}</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center py-8">
        <Dna className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  };

  const handleTyping = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  if (state === 'auth') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -ml-48 -mb-48 opacity-50"></div>

        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl relative z-10 space-y-8 border border-slate-100">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
                <Compass className="text-white" size={40} />
             </div>
             <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">{t.title}</h1>
                <p className="text-slate-500 text-sm mt-1">{t.loginDesc}</p>
             </div>
          </div>

          <div className="space-y-4">
            {/* 手机号输入 */}
            <div className="relative">
               <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="tel" 
                 placeholder={t.phonePlaceholder}
                 value={loginPhone}
                 onChange={(e) => setLoginPhone(e.target.value)}
                 maxLength={11}
                 className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
               />
            </div>
            {/* 密码输入 */}
            <div className="relative">
               <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="password" 
                 placeholder={t.passwordPlaceholder}
                 value={loginPassword}
                 onChange={(e) => setLoginPassword(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleLogin(loginPhone, loginPassword)}
                 className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
               />
            </div>
            {/* 验证码输入（仅注册时显示） */}
            {isRegistering && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={t.verifyCodePlaceholder}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    maxLength={6}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                  />
                </div>
                <button 
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : t.sendCodeBtn}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => isRegistering ? handleRegister(loginPhone, loginPassword, verifyCode) : handleLogin(loginPhone, loginPassword)}
              disabled={!loginPhone || !loginPassword}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={20} />
              {isRegistering ? t.registerBtn : t.loginBtn}
            </button>
            
            {/* 切换登录/注册 */}
            <div className="text-center">
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setVerifyCode(''); }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {isRegistering 
                  ? (lang === 'zh' ? '已有账号？立即登录' : 'Already have an account? Login')
                  : (lang === 'zh' ? '没有账号？立即注册' : 'No account? Register now')
                }
              </button>
            </div>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setState('landing')} className="py-3 px-4 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                <MessageSquare size={18} />
                {t.wechatLogin}
              </button>
              <button onClick={handleGuestLogin} className="py-3 px-4 bg-slate-50 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                <User size={18} />
                {t.guestLogin}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        {/* 统一侧边栏 */}
        <ChatSidebar 
          language={lang}
          isOpen={showSidebar}
          onOpen={() => setShowSidebar(!showSidebar)}
          mode={null}
          modeLabel=""
          intensity=""
          questionCount={0}
          currentHistoryId={undefined}
          user={user}
          userTokens={userTokens}
          onOpenVIP={() => setShowVIP(true)}
          historyRefreshKey={historyRefreshKey}
          onSelectHistory={handleSelectHistory}
          onStartNew={reset}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAllModes={() => setShowAllModes(true)}
          onOpenPhilosophers={() => setShowPhilosophers(true)}
          onReset={() => {}}
          onChangeLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
        />

        {/* View All Overlay */}
        {showAllModes && (
          <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="max-w-6xl mx-auto p-8 space-y-8">
               <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-serif font-bold text-slate-900">{t.allModesTitle}</h2>
                 <button onClick={() => setShowAllModes(false)} className="p-3 bg-white shadow-sm rounded-full hover:bg-slate-100"><X size={24}/></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                {MODE_DEFINITIONS.map(m => (
                  <button key={m.id} onClick={() => selectMode(m.id as DiscoveryMode)} className="group p-6 bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4 border border-transparent hover:border-slate-100 flex flex-col h-full">
                    <div className={`w-14 h-14 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}><m.icon size={28}/></div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800">{getModeLabel(m.id as DiscoveryMode)}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{getModeDesc(m.id as DiscoveryMode)}</p>
                    </div>
                  </button>
                ))}
              </div>
             </div>
          </div>
        )}

        {/* 哲学家库 Overlay */}
        {showPhilosophers && (
          <PhilosophersLibrary 
            language={lang}
            onClose={() => setShowPhilosophers(false)}
            onSelectPhilosopher={(philosopher) => {
              // 点击哲学家卡片后，设置选中的哲学家，显示话题选择
              setSelectedPhilosopher(philosopher);
            }}
          />
        )}

        {/* 哲学家话题选择弹窗 */}
        {selectedPhilosopher && (
          <PhilosopherTopicSelect 
            language={lang}
            philosopher={selectedPhilosopher as any}
            onClose={() => { setSelectedPhilosopher(null); }}
            onBack={() => setSelectedPhilosopher(null)}
            onSelectTopic={async (topic) => {
              setPhilosopherTopic(topic);
              setPhilosopherMode(true);
              setShowPhilosophers(false);
              setMode('LIFE_MEANING');
              setIsLoading(true);
              
              const philosopherName = lang === 'zh' ? selectedPhilosopher!.display_name_zh : (selectedPhilosopher!.display_name_en || selectedPhilosopher!.name);
              const philosopherPrompt = selectedPhilosopher!.prompt || '';
              
              // 用哲学家的口吻向 AI 询问首个问题
              const isZh = lang === 'zh';
              const firstQuestionPrompt = isZh
                ? `你是${philosopherName}。${philosopherPrompt}\n\n请基于话题"${topic}"，用你的哲学思想和说话风格提出一个深刻的开场问题。要求：\n1. 用第一人称表达，可以加入适当的动作和神态描写\n2. 问题要有哲学深度，能引发思考\n3. 文字优美，有散文般的质感\n4. 控制在80-120字以内`
                : `You are ${philosopherName}. ${philosopherPrompt}\n\nBased on the topic "${topic}", ask a profound opening question in your philosophical style and speaking manner. Requirements:\n1. Express in first person, include appropriate actions and expressions\n2. Questions should have philosophical depth\n3. Beautiful prose-like quality\n4. Keep within 80-120 words`;
              
              try {
                // 调用 AI 生成首个问题
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey || 'sk-b9e79da674114733be8df0d48a2095a2'}`
                  },
                  body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                      { role: 'system', content: firstQuestionPrompt },
                      { role: 'user', content: isZh ? '请提出你的开场问题' : 'Please ask your opening question' }
                    ],
                    temperature: 0.8
                  })
                });
                
                const data = await response.json();
                const firstQuestion = data.choices?.[0]?.message?.content || (isZh 
                  ? `${topic}... 你如何看待这个问题？`
                  : `... What do you think about this?`);
                
                const welcomeMsg: Message = { 
                  id: `phil-welcome-${Date.now()}`, 
                  role: 'assistant', 
                  content: firstQuestion,
                  speaker: philosopherName,
                  timestamp: Date.now() 
                };
                setMessages([welcomeMsg]);
              } catch (e) {
                console.error('生成开场问题失败:', e);
                // 如果失败，使用默认问题
                const welcomeMsg: Message = { 
                  id: `phil-welcome-${Date.now()}`, 
                  role: 'assistant', 
                  content: isZh 
                    ? `关于「${topic}」，我想听听你的想法...`
                    : `Regarding "${topic}", I'd like to hear your thoughts...`,
                  speaker: philosopherName,
                  timestamp: Date.now() 
                };
                setMessages([welcomeMsg]);
              }
              
              setIsLoading(false);
              setState('chatting');
              setSessionId(`philo-${Date.now()}`);
            }}
          />
        )}

        {/* Settings Overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-8 relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2"><Settings size={24}/></div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">{t.settingsTitle}</h3>
              </div>

              <div className="space-y-6">
                {/* 账号信息 */}
                {user && (
                  <div className="bg-indigo-50 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-400 uppercase font-bold">{t.accountInfo}</p>
                        <p className="text-sm font-bold text-slate-800">{user.username || user.email || '用户'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setShowEditProfile(true)}
                        className="py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Key size={16} />
                        {t.editProfile}
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('user');
                          setUser(null);
                          setState('auth');
                          setShowSettings(false);
                        }}
                        className="py-2.5 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}

                {/* Language */}
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Language / 语言</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button onClick={() => setLang('zh')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${lang === 'zh' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>中文</button>
                      <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>English</button>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-3">
                    <button onClick={() => saveSettings(settings)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all">
                      {t.saveBtn}
                    </button>
                    {/* 切换账号按钮 */}
                    {!user && (
                      <button 
                        onClick={() => { setShowSettings(false); setState('auth'); }} 
                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <LogIn size={16} />
                        {t.switchAccount}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 修改资料弹窗 */}
        {showEditProfile && user && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">{t.editProfile}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">{lang === 'zh' ? '用户名' : 'Username'}</label>
                  <input 
                    type="text" 
                    defaultValue={user.username || ''}
                    id="editUsername"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">{lang === 'zh' ? '新密码' : 'New Password'}</label>
                  <input 
                    type="password" 
                    placeholder={lang === 'zh' ? '留空则不修改' : 'Leave empty to keep current'}
                    id="editPassword"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => {
                    // TODO: 调用后端 API 更新用户信息
                    alert(lang === 'zh' ? '功能开发中...' : 'Coming soon...');
                    setShowEditProfile(false);
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  {t.saveProfile}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIP/捐赠弹窗 */}
        {showVIP && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
                  <Zap size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{lang === 'zh' ? '获取更多先令' : 'Get More Shi ling'}</h3>
                <p className="text-sm text-slate-400">{lang === 'zh' ? '继续你的哲学探索之旅' : 'Continue your philosophical journey'}</p>
              </div>
              
              <div className="space-y-3">
                <button className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-between">
                  <span className="flex items-center gap-2"><Zap size={18} className="text-amber-400" /> {lang === 'zh' ? '基础包' : 'Basic'}</span>
                  <span>{lang === 'zh' ? '¥19 / 200' : '$3 / 200'}</span>
                </button>
                <button className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-between">
                  <span className="flex items-center gap-2"><Sparkles size={18} className="text-purple-400" /> {lang === 'zh' ? '进阶包' : 'Pro'}</span>
                  <span>{lang === 'zh' ? '¥29 / 350' : '$5 / 350'}</span>
                </button>
                <button className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-between">
                  <span className="flex items-center gap-2"><Crown size={18} className="text-amber-400" /> {lang === 'zh' ? '豪华包' : 'Premium'}</span>
                  <span>{lang === 'zh' ? '¥49 / 650' : '$8 / 650'}</span>
                </button>
                <button className="w-full p-3 bg-slate-50 text-slate-500 rounded-xl font-medium hover:bg-slate-100 transition-all text-center">
                  {lang === 'zh' ? '☕ 捐赠支持开发者' : '☕ Donate to Support'}
                </button>
              </div>

              <button 
                onClick={() => setShowVIP(false)}
                className="w-full py-3 text-slate-400 font-medium hover:text-slate-600 transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Main Content: The Gacha Machine */}
        <div className="w-full max-w-xl text-center space-y-12 z-10 py-10 flex flex-col items-center">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">{t.title}</h1>
            <p className="text-lg md:text-xl text-slate-500 font-heiti mx-auto leading-relaxed max-w-lg">{t.landingDesc}</p>
          </div>

          <div className="relative p-2 bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-100 w-80">
            {/* Slot Window */}
            <div className="relative h-[240px] w-full overflow-hidden rounded-[3rem] bg-slate-50 shadow-inner perspective-[1000px]">
               {/* Gradients for 3D effect */}
               <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-200/50 to-transparent z-10 pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-200/50 to-transparent z-10 pointer-events-none"></div>
               
               {/* Center highlight line */}
               <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-indigo-500/20 -translate-y-1/2 z-0"></div>

               {/* The Slot Machine Reels (Always rendered for layout) */}
               <div ref={slotRef} className="w-full">
                  {SLOT_ITEMS.map((m, i) => (
                    <div key={i} className="flex flex-col items-center justify-center gap-2" style={{height: ITEM_HEIGHT}}>
                       <div className={`w-16 h-16 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                         <m.icon size={32}/>
                       </div>
                       <div className="text-center">
                         <h3 className="text-lg font-bold text-slate-800">{getModeLabel(m.id as DiscoveryMode)}</h3>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest">Question {i % 8 + 1}</p>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Mystery Card Overlay - Covers slot machine until revealed */}
               {!isSlotRevealed && (
                  <div className="absolute inset-0 z-20 bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center text-white p-6 shadow-2xl transition-all duration-700 cursor-default">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                       <Sparkles size={32} className="text-indigo-300 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-center text-white">{t.fateAwaits}</h3>
                    <div className="w-8 h-1 bg-indigo-500 rounded-full my-3"></div>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] text-center">{t.tapToReveal}</p>
                  </div>
               )}
            </div>

            {/* Controls */}
            <div className="mt-6 mb-4 px-4">
              {!drawnMode && !isSpinning && (
                <button 
                  onClick={startSpin}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Dices size={20} />
                  {t.drawBtn}
                </button>
              )}

              {isSpinning && (
                <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-wait">
                   <RefreshCw size={20} className="animate-spin" />
                   {t.drawing}
                </button>
              )}

              {drawnMode && !isSpinning && (
                 <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button onClick={() => selectMode(drawnMode)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                       {t.startJourney} <ArrowRight size={18} />
                    </button>
                    <button onClick={startSpin} className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center justify-center gap-2">
                       <RotateCcw size={14} /> {t.redraw}
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'intensity_select') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-2xl text-center space-y-12">
          <button onClick={() => setState('landing')} className="text-slate-400 font-bold flex items-center gap-2 mx-auto hover:text-indigo-600 transition-colors"><ArrowRight className="rotate-180" size={16}/>{t.backBtn}</button>
          <h1 className="text-5xl font-serif font-bold text-slate-900">{t.intensityTitle}</h1>
          <p className="text-lg text-slate-500">{t.intensityDesc}</p>
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={() => selectIntensity('QUICK')} className="p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center"><Timer size={32} /></div>
              <h3 className="text-2xl font-bold">{t.intensityQuick}</h3>
              <p className="text-slate-400">{t.intensityQuickDesc}</p>
            </button>
            <button onClick={() => selectIntensity('DEEP')} className="p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all text-left space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><InfinityIcon size={32} /></div>
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
    const summaryText = parseBilingual(result.summary);
    const summaryParagraphs = summaryText.split('\n').filter(p => p.trim());
    const heroSentence = summaryParagraphs[0];
    const deepAnalysis = summaryParagraphs.slice(1);

    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4">
        {/* 顶部导航栏 */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur border-b border-slate-100 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {showSidebar ? <X size={20} className="text-slate-600"/> : <Menu size={20} className="text-slate-600"/>}
            </button>
            <div className="flex items-center gap-2">
              <Compass size={24} className="text-indigo-600" />
              <span className="font-serif font-bold text-slate-900">{t.title}</span>
            </div>
          </div>
          {mode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{mode}</span>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <ChatSidebar 
          language={lang}
          isOpen={showSidebar}
          onOpen={() => setShowSidebar(!showSidebar)}
          mode={mode}
          modeLabel={getModeLabel(mode)}
          intensity={intensity}
          questionCount={questionCount}
          currentHistoryId={currentHistoryId}
          user={user}
          userTokens={userTokens}
          onOpenVIP={() => setShowVIP(true)}
          historyRefreshKey={historyRefreshKey}
          onSelectHistory={handleSelectHistory}
          onStartNew={reset}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAllModes={() => setShowAllModes(true)}
          onOpenPhilosophers={() => setShowPhilosophers(true)}
          onReset={reset}
          onChangeLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
        />

        <div className="max-w-4xl mx-auto flex flex-col gap-8 pt-16">
          <div className="flex justify-between items-center bg-white/90 backdrop-blur p-5 rounded-3xl sticky top-20 z-40 shadow-md border border-slate-100">
             <button onClick={reset} className="px-6 py-2 text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-2 transition-colors"><ArrowRight className="rotate-180" size={16}/>{t.backBtn}</button>
             <div className="flex gap-3">
                <button onClick={() => exportAsImage(reportContainerRef, `Report_${mode}`)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"><FileImage size={18}/>{t.exportReport}</button>
                <button onClick={() => exportAsImage(chatContainerRef, `Chat_${mode}`)} className="px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all"><Layers size={18}/>{t.exportChat}</button>
             </div>
          </div>

          <div ref={reportContainerRef} className="bg-white p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-40 flex flex-col items-center export-container relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50"></div>
            
            {/* 1. 名言/motto 放在最前面 */}
            <div className="w-full max-w-2xl py-8 text-center group">
               <div className="p-12 md:p-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                  <Quote className="absolute top-8 left-8 text-white/10" size={80} />
                  <h3 className="text-2xl md:text-3xl font-serif italic leading-relaxed text-indigo-100 group-hover:scale-[1.02] transition-transform duration-300">"{parseBilingual(result.motto)}"</h3>
               </div>
            </div>

            {/* 2. 标题 + 哲学倾向 */}
            <div className="text-center space-y-8 w-full max-w-2xl py-8 relative z-10 group">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full text-[11px] tracking-[0.4em] font-bold uppercase"><Zap size={14} className="text-indigo-400" /> {t.resultTitle}</div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.15] group-hover:text-indigo-900 transition-colors">{parseBilingual(result.title)}</h1>
              {result.philosophicalTrend && (
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-[2rem] shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <BrainCircuit size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">{t.trendLabel}: {parseBilingual(result.philosophicalTrend)}</span>
                </div>
              )}
            </div>

            {/* 3. 真我能量矩阵 (Dimensions) */}
            <div className="w-full max-w-2xl py-10 space-y-10 bg-slate-50 px-10 py-12 rounded-[3rem] border border-slate-100 shadow-inner hover:shadow-xl transition-shadow duration-300">
              <div className="text-center space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">{t.dimensionTitle}</h3>
                <div className="w-12 h-0.5 bg-indigo-200 mx-auto"></div>
              </div>
              <div className="space-y-8">
                {result.dimensions?.map((dim, i) => {
                  const rawVal = dim.value;
                  const displayValue = (rawVal > 0 && rawVal <= 1) ? Math.round(rawVal * 100) : Math.round(rawVal);
                  return (
                    <div key={i} className="space-y-3 group">
                      <div className="flex justify-between font-heiti font-bold text-base">
                        <span className="text-slate-600 group-hover:text-indigo-600 transition-colors">{parseBilingual(dim.label)}</span>
                        <span className="text-indigo-600 font-serif italic text-xl">{displayValue}%</span>
                      </div>
                      <div className="h-3 bg-white/80 border border-indigo-50 rounded-full overflow-hidden p-0.5 shadow-sm group-hover:shadow-md transition-shadow">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out group-hover:from-indigo-400 group-hover:to-blue-400" 
                          style={{width:`${displayValue}%`}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. 深度洞察 (Insights) */}
            <div className="w-full max-w-3xl py-10 space-y-12">
              <h3 className="text-center text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase">深度洞察 / Insights</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {result.keyInsights.map((ins, i) => (
                  <div key={i} className="p-8 bg-white border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 group">
                    <div className="w-8 h-8 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><Target size={16}/></div>
                    <p className="text-lg text-slate-700 leading-relaxed font-heiti">{parseBilingual(ins)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. 进化路径 (Evolution) */}
            <div className="w-full max-w-3xl py-10 space-y-10">
              <h3 className="text-center text-[10px] font-black text-teal-500 tracking-[0.4em] uppercase">进化路径 / Evolution</h3>
              <div className="space-y-6">
                {result.suggestedPaths.map((p, i) => (
                  <div key={i} className="p-8 bg-teal-50/30 rounded-[2rem] flex items-center gap-6 border border-teal-50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform">{i+1}</div>
                    <p className="text-lg text-slate-800 font-heiti leading-relaxed">{parseBilingual(p)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. 核心剖析 (Essence) - 放最后 */}
            <div className="w-full max-w-3xl py-10 space-y-10 relative z-10">
              <div className="text-indigo-400 font-black tracking-[0.4em] text-[10px] uppercase text-center">核心剖析 / Essence</div>
              <div className="space-y-10 px-8 border-l-4 border-indigo-500/10">
                <p className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight font-serif italic">
                  {heroSentence}
                </p>
                <div className="space-y-10">
                  {deepAnalysis.map((para, i) => {
                    // 根据段落内容生成子标题
                    const subTitles = [
                      "存在的觉醒",
                      "行动的哲学",
                      "意义的追寻",
                      "自由的边界",
                      "价值的重塑"
                    ];
                    const subTitle = subTitles[i % subTitles.length];
                    return (
                      <div key={i} className="group">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            {i + 1}
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 tracking-wide">{subTitle}</h4>
                        </div>
                        <p className="text-lg md:text-xl text-slate-600 leading-[1.8] font-heiti opacity-90 pl-14 border-l-2 border-indigo-100 group-hover:border-indigo-300 transition-all duration-300">
                          {para}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 text-slate-300 text-[10px] tracking-[0.6em] font-black uppercase">EXPLORER'S COMPASS • AI SOUL NAVIGATOR • {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div style={{display:'none'}}><div ref={chatContainerRef} className="bg-white p-24 w-[1000px] flex flex-col gap-10 export-container">
          {messages.map(m => <ChatBubble key={m.id} message={m} language={lang} skipTyping />)}
        </div></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* 聊天页面侧边栏 */}
      <ChatSidebar 
        language={lang}
        isOpen={showSidebar}
        onOpen={() => setShowSidebar(!showSidebar)}
        mode={mode}
        modeLabel={getModeLabel(mode)}
        intensity={intensity}
        questionCount={questionCount}
        currentHistoryId={currentHistoryId}
        user={user}
          userTokens={userTokens}
          onOpenVIP={() => setShowVIP(true)}
        historyRefreshKey={historyRefreshKey}
        onSelectHistory={handleSelectHistory}
        onStartNew={reset}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAllModes={() => setShowAllModes(true)}
        onOpenPhilosophers={() => setShowPhilosophers(true)}
        onReset={reset}
        onChangeLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
      />

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur border-b border-slate-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
          >
            {showSidebar ? <X size={20} className="text-slate-600"/> : <Menu size={20} className="text-slate-600"/>}
          </button>
          <div className="flex items-center gap-2">
            <Compass size={24} className="text-indigo-600" />
            <span className="font-serif font-bold text-slate-900">{t.title}</span>
          </div>
        </div>
        {mode && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{mode}</span>
          </div>
        )}
      </div>

      {/* 聊天内容区 */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto pt-20 pb-48">
        <div className="max-w-3xl mx-auto px-4">
          {messages.map(m => <ChatBubble key={m.id} message={m} language={lang} onTyping={handleTyping} />)}
          {error && <div className="p-8 bg-red-50 rounded-2xl text-center space-y-4 max-w-md mx-auto border border-red-100">
            <div className="flex items-center justify-center gap-2 text-red-500 font-medium"><AlertCircle size={20}/>{error}</div>
            <button onClick={() => handleSend()} className="px-8 py-3 bg-red-500 text-white rounded-xl font-medium flex items-center gap-2 mx-auto"><RefreshCw size={16}/>{t.retryBtn}</button>
          </div>}
          {renderLoading()}
        </div>
      </main>

      {/* 底部输入区 */}
      <footer className="p-4 bg-white border-t sticky bottom-0 shadow-lg z-30">
        <div className="max-w-3xl mx-auto space-y-3">
          {renderSuggestions()}
          <div className="relative flex gap-3">
            <textarea 
              value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault();handleSend();}}} 
              placeholder={t.inputPlaceholder} rows={1} disabled={!!error || isLoading} 
              className="flex-1 px-5 py-3 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:bg-white outline-none text-base resize-none transition-all duration-200 disabled:opacity-50" 
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading || !!error} className="px-5 py-3 bg-blue-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:scale-100 shadow-lg hover:shadow-xl">
              <Send size={20}/>
            </button>
          </div>
          {/* 生成报告按钮 - 用户回答后 或 无上限模式10题后随时出现 */}
          {(canFinishEarly || (intensity === 'DEEP' && questionCount >= 10)) && !error && (
            <button onClick={analyze} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Sparkles size={20}/>{t.finishBtn}
            </button>
          )}
        </div>
      </footer>

      {/* 哲学家介绍弹窗 */}
      {showPhilosopherIntro && (
        <PhilosopherIntro language={lang} onClose={() => setShowPhilosopherIntro(false)} />
      )}

      {/* 历史记录侧边栏 */}
      <HistorySidebar 
        language={lang} 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        onLoadHistory={(history) => {
          // 加载历史记录的逻辑
          console.log('Load history:', history);
          setShowHistory(false);
        }}
        currentHistoryId={currentHistoryId}
      />
    </div>
  );
};

export default App;
