import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings } from "../types";
import { getPersonaInstruction } from "../personas";

// 后端 API 地址
const API_BASE = 'http://localhost:3000';

// 保存 sessionId
let sessionId: string | null = null;

export const setSessionId = (id: string) => {
  sessionId = id;
};

export const getSessionId = () => sessionId;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        const backoffTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await wait(backoffTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const getNextQuestion = async (
  history: Message[], 
  mode: DiscoveryMode, 
  intensity: DiscoveryIntensity, 
  settings: AppSettings,
  lang: string = 'zh'
): Promise<{content: string, suggestions: string[]}> => {
  const instruction = getPersonaInstruction(mode, lang);

  // 首轮或没有 session 时，创建新会话
  if (!sessionId || history.length === 0 || (history.length === 1 && history[0].content === 'START')) {
    return callWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: localStorage.getItem('username'),
          password: localStorage.getItem('password'),
          mode: mode,
          intensity: intensity,
          personaContext: instruction
        })
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      sessionId = data.sessionId;
      return {
        content: data.message.content,
        suggestions: data.message.suggestions || []
      };
    });
  }

  // 后续消息
  return callWithRetry(async () => {
    const lastUserMessage = history.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    const contentWithPersona = `${lastUserMessage.content}\n\n${instruction}`;

    const response = await fetch(`${API_BASE}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          username: localStorage.getItem('username'),
          password: localStorage.getItem('password'),
        sessionId: sessionId,
        content: contentWithPersona
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return {
      content: data.message.content,
      suggestions: data.message.suggestions || []
    };
  });
};

export const generateFinalAnalysis = async (
  history: Message[], 
  mode: DiscoveryMode, 
  settings: AppSettings
): Promise<DiscoveryResult> => {
  if (!sessionId) {
    throw new Error('No session found');
  }

  return callWithRetry(async () => {
    const response = await fetch(`${API_BASE}/api/chat/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          username: localStorage.getItem('username'),
          password: localStorage.getItem('password'), sessionId })
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return data.result;
  });
};

export const getChatHistory = async (): Promise<Message[]> => {
  if (!sessionId) return [];
  
  const response = await fetch(`${API_BASE}/api/chat/history/${sessionId}`);
  const data = await response.json();
  return data.messages;
};

export const clearSession = () => {
  sessionId = null;
};
