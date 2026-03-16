import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings } from "../types";

// 后端 API 地址
const API_BASE = 'https://thinking.vinolab.tech';

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
  settings: AppSettings
): Promise<{content: string, suggestions: string[]}> => {
  // 首轮：创建新会话
  if (history.length === 0 || (history.length === 1 && history[0].content === 'START')) {
    return callWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          intensity: intensity,
          provider: settings.provider || 'deepseek',
          apiKey: settings.apiKey
        })
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      return {
        content: data.message.content,
        suggestions: data.message.suggestions || []
      };
    });
  }

  // 后续：发送消息获取回复
  return callWithRetry(async () => {
    // 从设置中获取 sessionId（如果需要的话）
    // 这里简化处理：每次都创建新会话可能不对，需要在前端保存 sessionId
    
    // 获取最后一轮的用户消息
    const lastUserMessage = history.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // 查找 sessionId（需要在前端状态中保存）
    const sessionId = (window as any).__SESSION_ID__;
    
    if (!sessionId) {
      // 如果没有 sessionId，创建新会话
      const response = await fetch(`${API_BASE}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          intensity: intensity,
          provider: settings.provider || 'deepseek',
          apiKey: settings.apiKey
        })
      });
      const data = await response.json();
      (window as any).__SESSION_ID__ = data.sessionId;
      return {
        content: data.message.content,
        suggestions: data.message.suggestions || []
      };
    }

    // 发送消息
    const response = await fetch(`${API_BASE}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        content: lastUserMessage.content
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
  // 获取 sessionId
  const sessionId = (window as any).__SESSION_ID__;
  if (!sessionId) {
    throw new Error('No session found');
  }

  return callWithRetry(async () => {
    const response = await fetch(`${API_BASE}/api/chat/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return data.result;
  });
};

// 导出获取历史的方法
export const getChatHistory = async (sessionId: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE}/api/chat/history/${sessionId}`);
  const data = await response.json();
  return data.messages;
};

// 导出创建会话的方法（供外部调用）
export const createSession = async (mode: DiscoveryMode, intensity: DiscoveryIntensity, settings: AppSettings) => {
  const response = await fetch(`${API_BASE}/api/chat/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: mode,
      intensity: intensity,
      provider: settings.provider || 'deepseek',
      apiKey: settings.apiKey
    })
  });
  const data = await response.json();
  (window as any).__SESSION_ID__ = data.sessionId;
  return data;
};
