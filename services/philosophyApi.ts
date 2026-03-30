// 哲思模块 API 客户端 - 用于从后端获取数据
// ⚠️ 不再硬编码 API 地址，统一从 config/api.ts 读取
import { API_BASE, fetchApi } from '../config/api';
import { DiscoveryMode, QuestionPoolItem } from "../types";

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
  question_group?: string;
  question_prompt?: string;
  question_order?: number;
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
  fetchApi<{ philosophers: Philosopher[] }>('/philosophy/philosophers');

// 获取哲学家 prompt
export const getPhilosopherPrompt = (name: string) =>
  getPhilosophers().then(res => {
    const philosopher = res.philosophers.find(p => p.name === name);
    return philosopher?.prompt || '';
  });

// 获取初始问题列表
export const getQuestions = () =>
  fetchApi<{ questions: Question[] }>('/philosophy/questions');

// 随机获取一个初始问题
export const getRandomQuestion = () =>
  getQuestions().then(res => {
    const activeQuestions = res.questions.filter(q => q.status === 'active');
    const random = activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
    return random;
  });

// 获取审判机配置
export const getJudgeConfig = () =>
  fetchApi<JudgeConfig>('/philosophy/judge-config');

// 更新审判机配置
export const updateJudgeConfig = (config: JudgeConfig) =>
  fetchApi<{ success: boolean }>('/philosophy/judge', {
    method: 'PUT',
    body: JSON.stringify(config),
  });

// 获取哲学家回复示例
export const getPhilosopherResponses = () =>
  fetchApi<{ responses: PhilosopherResponse[] }>('/philosophy/responses');

// 获取关键词映射
export const getPersonaKeywords = () =>
  fetchApi<Record<string, { philosophers: string[]; weight: number }>>('/philosophy/keywords');

// 获取默认人格分配
export const getDefaultPersonas = () =>
  fetchApi<Record<string, string[]>>('/philosophy/default-personas');

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

// 哲思模块 API - 从后端获取问题池

interface BackendQuestion {
  id: number;
  content: string;
  philosopher: string;
  mode: string;
  suggestions?: string[];
  usageCount: number;
  status: string;
  question_group?: string;
  question_prompt?: string;
  question_order?: number;
}

interface BackendPhilosopher {
  id: number;
  name: string;
  era: string;
  description: string;
  prompt: string;
  keywords: string[];
  status: string;
}

// 缓存数据
let cachedQuestions: BackendQuestion[] = [];
let cachedPhilosophers: BackendPhilosopher[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 从API获取数据
async function fetchFromAPI<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      console.warn(`API error: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`API fetch failed:`, error);
    return null;
  }
}

// 获取哲学家列表
export async function fetchPhilosophers(): Promise<BackendPhilosopher[]> {
  const now = Date.now();
  if (cachedPhilosophers.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedPhilosophers;
  }
  
  const data = await fetchFromAPI<{ philosophers: BackendPhilosopher[] }>('/philosophy/philosophers');
  if (data?.philosophers) {
    cachedPhilosophers = data.philosophers;
    lastFetchTime = now;
  }
  return cachedPhilosophers;
}

// 获取问题列表
export async function fetchQuestions(): Promise<BackendQuestion[]> {
  const now = Date.now();
  if (cachedQuestions.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedQuestions;
  }
  
  const data = await fetchFromAPI<{ questions: BackendQuestion[] }>('/philosophy/questions');
  if (data?.questions) {
    cachedQuestions = data.questions;
    lastFetchTime = now;
  }
  return cachedQuestions;
}

// 刷新缓存
export function clearCache() {
  cachedQuestions = [];
  cachedPhilosophers = [];
  lastFetchTime = 0;
}

// 根据分类获取问题池
export async function getQuestionPoolByMode(mode: DiscoveryMode): Promise<QuestionPoolItem[]> {
  const questions = await fetchQuestions();
  
  let filteredQuestions = questions.filter(q => 
    q.status === 'active' && q.mode === mode
  );
  
  if (filteredQuestions.length === 0) {
    filteredQuestions = questions.filter(q => q.status === 'active');
  }
  
  return filteredQuestions.map(q => ({
    content: q.content,
    suggestions: Array.isArray(q.suggestions) && q.suggestions.length > 0
      ? q.suggestions
      : [
          `选择A：${q.philosopher || '哲学家A'}的观点 [SEP] Choice A`,
          `选择B：另一种视角 [SEP] Choice B`
        ]
  }));
}

// 随机获取一个问题
export async function getRandomQuestion(mode: DiscoveryMode): Promise<QuestionPoolItem | null> {
  const pool = await getQuestionPoolByMode(mode);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 获取哲学家Prompt
export async function getPhilosopherPrompt(name: string): Promise<string> {
  const philosophers = await fetchPhilosophers();
  const philosopher = philosophers.find(p => p.name === name);
  return philosopher?.prompt || '';
}

// 获取所有哲学家名称
export async function getPhilosopherNames(): Promise<string[]> {
  const philosophers = await fetchPhilosophers();
  return philosophers.filter(p => p.status === 'active').map(p => p.name);
}

// 导出兼容旧接口的默认对象
import { INITIAL_QUESTION_POOL as LOCAL_QUESTION_POOL } from "./questions-local";

export const INITIAL_QUESTION_POOL: Record<DiscoveryMode, QuestionPoolItem[]> = {
  LIFE_MEANING: [],
  JUSTICE: [],
  SELF_IDENTITY: [],
  FREE_WILL: [],
  SIMULATION: [],
  OTHER_MINDS: [],
  LANGUAGE: [],
  SCIENCE: []
};

// 初始化问题池 - 优先从API获取，失败则使用本地数据
export async function initializeQuestionPool(): Promise<void> {
  const questions = await fetchQuestions();
  
  if (questions.length > 0) {
    for (const mode of Object.keys(INITIAL_QUESTION_POOL) as DiscoveryMode[]) {
      INITIAL_QUESTION_POOL[mode] = await getQuestionPoolByMode(mode);
    }
    console.log('✅ 问题池已从API加载');
  } else {
    Object.assign(INITIAL_QUESTION_POOL, LOCAL_QUESTION_POOL);
    console.log('⚠️ 使用本地问题池（API不可用）');
  }
}
