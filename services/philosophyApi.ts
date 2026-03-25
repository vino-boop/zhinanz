// 哲思模块 API 客户端 - 用于从后端获取数据
// 配置后端API地址
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backend.vinolab.tech';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    console.error(`API Error: ${response.status} - ${endpoint}`);
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

// ==================== 类型定义 ====================

export interface Philosopher {
  id: number;
  name: string;
  era: string;
  description: string;
  prompt: string;
  keywords: string[];
  status: string;
}

export interface Question {
  id: number;
  content: string;
  philosopher: string;
  category: string;
  usageCount: number;
  status: string;
  createdAt: string;
  question_group?: string;   // 问题组名称
  question_prompt?: string; // 完整的问题提示词
  question_order?: number;   // 组内排序
}

export interface JudgeConfig {
  prompt: string;
  rules: string[];
  modes: Record<string, string>;
}

export interface PhilosopherResponse {
  id: number;
  philosopher: string;
  context: string;
  response: string;
  tags: string[];
}

// ==================== API 接口 ====================

// 获取哲学家列表
export const getPhilosophers = () => 
  fetchApi<{ philosophers: Philosopher[] }>('/api/philosophy/philosophers');

// 获取哲学家 prompt
export const getPhilosopherPrompt = (name: string) =>
  getPhilosophers().then(res => {
    const philosopher = res.philosophers.find(p => p.name === name);
    return philosopher?.prompt || '';
  });

// 获取初始问题列表
export const getQuestions = () =>
  fetchApi<{ questions: Question[] }>('/api/philosophy/questions');

// 随机获取一个初始问题
export const getRandomQuestion = () =>
  getQuestions().then(res => {
    const activeQuestions = res.questions.filter(q => q.status === 'active');
    const random = activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
    return random;
  });

// 获取审判机配置
export const getJudgeConfig = () =>
  fetchApi<JudgeConfig>('/api/philosophy/judge-config');

// 更新审判机配置
export const updateJudgeConfig = (config: JudgeConfig) =>
  fetchApi<{ success: boolean }>('/api/philosophy/judge', {
    method: 'PUT',
    body: JSON.stringify(config),
  });

// 获取哲学家回复示例
export const getPhilosopherResponses = () =>
  fetchApi<{ responses: PhilosopherResponse[] }>('/api/philosophy/responses');

// 获取关键词映射
export const getPersonaKeywords = () =>
  fetchApi<Record<string, { philosophers: string[]; weight: number }>>('/api/philosophy/keywords');

// 获取默认人格分配
export const getDefaultPersonas = () =>
  fetchApi<Record<string, string[]>>('/api/philosophy/default-personas');

// ==================== 备用本地数据 (当API不可用时) ====================

export const LOCAL_PHILOSOPHERS: Philosopher[] = [
  { id: 1, name: '苏格拉底', era: '古希腊', description: '苏格拉底式提问法', prompt: '你是一位古希腊哲学家...', keywords: [], status: 'active' },
  { id: 2, name: '尼采', era: '19世纪德国', description: '超人哲学', prompt: '你是尼采...', keywords: [], status: 'active' },
];

export const LOCAL_QUESTIONS: Question[] = [
  { id: 1, content: '人生的意义是什么？', philosopher: '尼采', category: '人生', usageCount: 0, status: 'active', createdAt: '', question_group: '生命意义', question_prompt: '请深入思考并回答：人生的意义是什么？', question_order: 1 },
];

// 带回退的获取函数
export async function getPhilosophersWithFallback(): Promise<Philosopher[]> {
  try {
    const res = await getPhilosophers();
    return res.philosophers;
  } catch (error) {
    console.warn('使用本地哲学家数据:', error);
    return LOCAL_PHILOSOPHERS;
  }
}

export async function getQuestionsWithFallback(): Promise<Question[]> {
  try {
    const res = await getQuestions();
    return res.questions;
  } catch (error) {
    console.warn('使用本地问题数据:', error);
    return LOCAL_QUESTIONS;
  }
}
