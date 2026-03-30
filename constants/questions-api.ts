// 问题库 API - 从后端获取问题
// ⚠️ 不再硬编码 API 地址，统一从 config/api.ts 读取
import { API_BASE } from '../config/api';
import { DiscoveryMode, QuestionPoolItem } from "../types";

// 通用的 fetch 封装
async function fetchApi<T>(endpoint: string): Promise<T | null> {
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

// ==================== 后端 API 类型 ====================
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

// ==================== 缓存 ====================
let cachedQuestions: BackendQuestion[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 刷新缓存
export function clearCache() {
  cachedQuestions = [];
  lastFetchTime = 0;
}

// ==================== 获取问题列表 ====================
async function fetchQuestions(): Promise<BackendQuestion[]> {
  const now = Date.now();
  if (cachedQuestions.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedQuestions;
  }
  
  const data = await fetchApi<{ questions: BackendQuestion[] }>('/philosophy/questions');
  if (data?.questions) {
    cachedQuestions = data.questions;
    lastFetchTime = now;
  }
  return cachedQuestions;
}

// ==================== 根据分类获取问题池 ====================
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

// ==================== 随机获取一个问题 ====================
export async function getRandomQuestion(mode: DiscoveryMode): Promise<QuestionPoolItem | null> {
  const pool = await getQuestionPoolByMode(mode);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ==================== 导出 API 基础 URL ====================
// 保留 fetchApi 导出供其他地方使用
export { fetchApi };

// ==================== 问题池（由 initializeQuestionPool 填充） ====================
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

// 初始化问题池 - 优先从API获取，失败则由调用方处理本地数据
export async function initializeQuestionPool(): Promise<void> {
  const questions = await fetchQuestions();
  
  if (questions.length > 0) {
    for (const mode of Object.keys(INITIAL_QUESTION_POOL) as DiscoveryMode[]) {
      INITIAL_QUESTION_POOL[mode] = await getQuestionPoolByMode(mode);
    }
    console.log('✅ 问题池已从API加载');
  } else {
    console.log('⚠️ API 不可用，请确保本地问题池已加载');
  }
}
