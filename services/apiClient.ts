// API 客户端 - 用于调用后端服务
// ⚠️ 不再硬编码 API 地址，统一从 config/api.ts 读取
import { API_BASE, fetchApi } from '../config/api';

// 账号认证模块
export const authApi = {
  login: (username: string, password: string) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  register: (username: string, password: string, phone?: string) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, phone: phone || '' })
    }),
};

// 哲思模块
export const philosophyApi = {
  getHistory: (userId: string) => fetchApi<{ history: any[] }>(`/philosophy/history/${userId}`),
  getUserHistories: (userId: string) => fetchApi<{ history: any[]; reports: any[] }>(`/philosophy/user-histories/${userId}`),
  saveHistory: (userId: string, sessionId: string, messages: any[], mode: string, result?: any) => 
    fetchApi<{ success: boolean }>('/philosophy/history', {
      method: 'POST',
      body: JSON.stringify({ userId, sessionId, messages, mode, result })
    }),
  getUser: (userId: string) => fetchApi(`/philosophy/user/${userId}`),
  getQuestions: () => fetchApi('/philosophy/questions'),
  getPhilosopherPrompts: () => fetchApi('/philosophy/prompts/philosopher'),
  getJudgePrompt: () => fetchApi('/philosophy/prompts/judge'),
  
  // 更新用户 tokens
  updateTokens: (userId: number, tokens: number, action: 'deduct' | 'add' | 'set' = 'deduct') =>
    fetchApi<{ success: boolean; tokens: number }>('/philosophy/user/tokens', {
      method: 'POST',
      body: JSON.stringify({ userId, tokens, action })
    }),
  
  // 获取用户 tokens 余额
  getUserTokens: (userId: string) =>
    fetchApi<{ tokens: number }>(`/philosophy/user/${userId}`),
  
  // 对话历史详细记录
  saveConversation: (data: {
    user_id: string;
    session_id: string;
    mode: string;
    round: number;
    judge_question: string;
    user_answer: string;
    philosopher_response: string;
  }) => fetchApi<{ success: boolean; id: number }>('/conversations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getConversations: (userId: string, sessionId?: string) => {
    const params = sessionId ? `?user_id=${userId}&session_id=${sessionId}` : `?user_id=${userId}`;
    return fetchApi<{ conversations: any[] }>(`/conversations${params}`);
  },
  
  // 用于旧历史记录的 fallback 查询：用 mode + created_after 匹配
  getConversationsByMode: (userId: string, mode: string, createdAfter: number) => {
    return fetchApi<{ conversations: any[] }>(`/conversations?user_id=${userId}&mode=${mode}&created_after=${createdAfter}`);
  },
  
  // 分析报告
  saveReport: (data: {
    user_id: string;
    session_id: string;
    mode: string;
    title: string;
    summary: string;
    philosophical_trend: string;
    key_insights: string[];
    suggested_paths: string[];
    motto: string;
    dimensions: Record<string, number>;
    raw_data: string;
  }) => fetchApi<{ success: boolean; id: number }>('/reports', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getReports: (userId: string, sessionId?: string) => {
    const params = sessionId ? `?user_id=${userId}&session_id=${sessionId}` : `?user_id=${userId}`;
    return fetchApi<{ reports: any[] }>(`/reports${params}`);
  },
};

// 运何模块
export const fortuneApi = {
  getBaziHistory: (userId: string) => fetchApi(`/fortune/bazi/${userId}`),
  getLiuyaoHistory: (userId: string) => fetchApi(`/fortune/liuyao/${userId}`),
  getExploreContent: () => fetchApi('/fortune/explore'),
  getBanners: () => fetchApi('/fortune/banners'),
};

// 堪舆模块
export const fengshuiApi = {
  getUsers: () => fetchApi('/fengshui/users'),
  getHistory: (userId: string) => fetchApi(`/fengshui/history/${userId}`),
};

// 总览模块
export const overviewApi = {
  getApiKeys: () => fetchApi('/overview/apikeys'),
  getApiKey: (moduleName: string) => fetchApi<{ api_key: string; full_key: string }>(`/overview/apikey/${moduleName}`),
  getAccounts: () => fetchApi('/overview/accounts'),
  getTokenUsage: () => fetchApi('/overview/token-usage'),
};

export default {
  philosophy: philosophyApi,
  fortune: fortuneApi,
  fengshui: fengshuiApi,
  overview: overviewApi,
};
