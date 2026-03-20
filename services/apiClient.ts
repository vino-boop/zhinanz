// API 客户端 - 用于调用后端服务
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

// 哲思模块
export const philosophyApi = {
  getHistory: (userId: string) => fetchApi(`/philosophy/history/${userId}`),
  getUser: (userId: string) => fetchApi(`/philosophy/user/${userId}`),
  getQuestions: () => fetchApi('/philosophy/questions'),
  getPhilosopherPrompts: () => fetchApi('/philosophy/prompts/philosopher'),
  getJudgePrompt: () => fetchApi('/philosophy/prompts/judge'),
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
  getAccounts: () => fetchApi('/overview/accounts'),
  getTokenUsage: () => fetchApi('/overview/token-usage'),
};

export default {
  philosophy: philosophyApi,
  fortune: fortuneApi,
  fengshui: fengshuiApi,
  overview: overviewApi,
};
