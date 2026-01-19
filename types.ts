
export type Language = 'zh' | 'en';
export type DiscoveryMode = 'LIFE_MEANING' | 'JUSTICE' | 'SELF_IDENTITY';
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
  content: string;
  timestamp: number;
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

export type AppState = 'landing' | 'intensity_select' | 'chatting' | 'analyzing' | 'result';
