
export type Language = 'zh' | 'en';
export type DiscoveryMode = 'LIFE_MEANING' | 'JUSTICE' | 'SELF_IDENTITY' | 'FREE_WILL' | 'SIMULATION' | 'OTHER_MINDS' | 'LANGUAGE' | 'SCIENCE';
export type DiscoveryIntensity = 'QUICK' | 'DEEP';
export type ApiProvider = 'gemini' | 'deepseek';

export interface AppSettings {
  provider: ApiProvider;
  apiKey: string;
}

export interface Dimension {
  label: string;
  value: number; // 0-100
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  speaker?: string; // e.g., 'Judge', 'Persona: Camus'
  content: string;
  timestamp: number;
  suggestions?: string[];
  isHistorical?: boolean; // 标记从历史记录加载的消息，跳过打字机效果
}

export interface QuestionPoolItem {
  content: string;
  suggestions: string[];
}

export interface DiscoveryResult {
  title: string;
  summary: string;
  philosophicalTrend?: string;
  keyInsights: string[];
  suggestedPaths: string[];
  motto: string;
  dimensions: Dimension[];
}

export type AppState = 'auth' | 'landing' | 'intensity_select' | 'chatting' | 'analyzing' | 'result';
