
import { GoogleGenAI, Type } from "@google/genai";
import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity } from "../types";

// Always use the process.env.API_KEY directly as per SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error?.message?.includes('429') || error?.status === 429 || error?.code === 429) {
        const backoffTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Rate limit reached. Retrying in ${Math.round(backoffTime)}ms...`);
        await wait(backoffTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

const getSystemInstruction = (mode: DiscoveryMode, intensity: DiscoveryIntensity) => {
  let modeDesc = mode === 'LIFE_MEANING' ? "生命终极意义探测。" : mode === 'CAREER' ? "职业价值与社会坐标定位。" : "潜能挖掘。";
  const intensityDesc = intensity === 'DEEP' ? "深度探索模式，不断深挖潜意识冲突。" : "快速相遇模式，直击要害。";

  return `你是一位拥有透视灵魂能力的“灵魂导航员”。
当前模式：${modeDesc}
对话强度：${intensityDesc}

核心准则：
1. **潜意识探测**：设计直击灵魂的问题。绝对禁止提及“阴影测试”等术语。
2. **排版格式**：核心词汇使用 **双星号粗体**。
3. **强制双语**：[中文] [SEP] [English]。
4. **对话节奏**：识别矛盾点发起挑战。达到轮次目标且捕捉到真我时添加 [DONE]。
5. **语气**：沉稳、具有黑体的力度感。`;
};

export const getNextQuestion = async (history: Message[], mode: DiscoveryMode, intensity: DiscoveryIntensity): Promise<string> => {
  return callGeminiWithRetry(async () => {
    const contents = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents as any,
      config: {
        systemInstruction: getSystemInstruction(mode, intensity),
        temperature: 0.8,
      },
    });
    // Accessing .text property directly as per SDK guidelines.
    return response.text || "你想继续深入吗？ [SEP] Shall we dive deeper?";
  });
};

export const generateFinalAnalysis = async (history: Message[], mode: DiscoveryMode): Promise<DiscoveryResult> => {
  return callGeminiWithRetry(async () => {
    const conversation = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = `分析以下对话，撰写人生图谱报告：\n${conversation}\n
要求：[中文] [SEP] [English] 格式。包含 title, summary, keyInsights(4条), suggestedPaths(3条), motto, dimensions(5个，含真我一致性)。返回 JSON。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
            motto: { type: Type.STRING },
            dimensions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } },
                required: ["label", "value"]
              }
            }
          },
          required: ["title", "summary", "keyInsights", "suggestedPaths", "motto", "dimensions"]
        }
      }
    });
    // Accessing .text property directly as per SDK guidelines.
    return JSON.parse(response.text || "{}");
  });
};
