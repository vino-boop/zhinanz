// API 客户端 - 用于调用后端服务
const API_BASE_URL = 'https://vinolab.tech/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

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
  
  // 对话历史详细记录
  saveConversation: (data: {
    user_id: string;
    session_id: string;
    mode: string;
    round: number;
    judge_question: string;
    user_answer: string;
    judge_response: string;
    philosopher_response: string;
  }) => fetchApi<{ success: boolean; id: number }>('/conversations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getConversations: (userId: string, sessionId?: string) => {
    const params = sessionId ? `?user_id=${userId}&session_id=${sessionId}` : `?user_id=${userId}`;
    return fetchApi<{ conversations: any[] }>(`/conversations${params}`);
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
