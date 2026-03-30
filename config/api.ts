/**
 * API 统一配置
 * 所有 API 地址和 Key 获取都从这里走
 */

// API 基础地址 - 统一从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vinolab.tech';
const API_SUFFIX = import.meta.env.VITE_API_SUFFIX || '/api';

// 完整的 API 基础路径
export const API_BASE = `${API_BASE_URL}${API_SUFFIX}`;

// DeepSeek API 配置
export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Gemini API 配置
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * 从后端动态获取 API Key
 * 不再硬编码任何 key在前端
 */
export async function fetchApiKeyFromBackend(moduleName: string = '哲思'): Promise<{ apiKey: string; provider: string } | null> {
  try {
    const response = await fetch(`${API_BASE}/overview/apikey/${encodeURIComponent(moduleName)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.api_key) {
        return { apiKey: data.api_key, provider: 'deepseek' };
      }
    }
  } catch (e) {
    console.warn('从后端获取 API Key 失败:', e);
  }
  return null;
}

/**
 * 通用的 fetch 封装
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
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

export default {
  API_BASE,
  DEEPSEEK_API_URL,
  GEMINI_API_URL,
  fetchApiKeyFromBackend,
  fetchApi,
};
