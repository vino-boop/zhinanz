
export type Language = 'zh' | 'en';
export type DiscoveryMode = 'LIFE_MEANING' | 'CAREER' | 'TALENT';

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
  keyInsights: string[];
  suggestedPaths: string[];
  motto: string;
  dimensions: Dimension[];
}

export type AppState = 'landing' | 'mode_select' | 'chatting' | 'analyzing' | 'result';
