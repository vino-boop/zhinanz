// 哲思模块 API - 从后端获取问题池
import { DiscoveryMode, QuestionPoolItem } from "../types";

// API 基础地址 - 调用云端服务器
const API_BASE = 'http://42.193.225.114:3001';

interface BackendQuestion {
  id: number;
  content: string;
  philosopher: string;
  category: string;
  usageCount: number;
  status: string;
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
  
  const data = await fetchFromAPI<{ philosophers: BackendPhilosopher[] }>('/api/philosophy/philosophers');
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
  
  const data = await fetchFromAPI<{ questions: BackendQuestion[] }>('/api/philosophy/questions');
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
  
  // 分类映射：DiscoveryMode -> 问题分类
  const modeToCategory: Record<DiscoveryMode, string[]> = {
    LIFE_MEANING: ['人生', '意义', '存在', '价值'],
    JUSTICE: ['正义', '道德', '公平', '法律'],
    SELF_IDENTITY: ['自我', '身份', '意识', '记忆'],
    FREE_WILL: ['自由', '意志', '选择', '责任'],
    SIMULATION: ['模拟', '现实', '真实', '虚拟'],
    OTHER_MINDS: ['他者', '意识', '心灵', '共情'],
    LANGUAGE: ['语言', '意义', '沟通', '符号'],
    SCIENCE: ['科学', '真理', '知识', '理性']
  };
  
  const categories = modeToCategory[mode] || [];
  
  // 筛选对应分类的问题，如果没有则返回全部
  let filteredQuestions = questions.filter(q => 
    q.status === 'active' && q.category && categories.some(cat => q.category.includes(cat))
  );
  
  // 如果没有匹配的，返回所有活跃问题
  if (filteredQuestions.length === 0) {
    filteredQuestions = questions.filter(q => q.status === 'active');
  }
  
  // 转换为前端需要的格式
  return filteredQuestions.map(q => ({
    content: q.content,
    suggestions: [
      `选择A：${q.philosopher}的观点 [SEP] Choice A`,
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
// 这个对象会在API不可用时使用本地数据
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
  // 尝试从API获取
  const questions = await fetchQuestions();
  
  if (questions.length > 0) {
    // 成功从API获取，更新问题池
    for (const mode of Object.keys(INITIAL_QUESTION_POOL) as DiscoveryMode[]) {
      INITIAL_QUESTION_POOL[mode] = await getQuestionPoolByMode(mode);
    }
    console.log('✅ 问题池已从API加载');
  } else {
    // API不可用，使用本地数据
    Object.assign(INITIAL_QUESTION_POOL, LOCAL_QUESTION_POOL);
    console.log('⚠️ 使用本地问题池（API不可用）');
  }
}
