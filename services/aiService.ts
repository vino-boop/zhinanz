
import { GoogleGenAI, Type } from "@google/genai";
import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings } from "../types";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        const backoffTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await wait(backoffTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

const getSystemInstruction = (mode: DiscoveryMode, intensity: DiscoveryIntensity, turnCount: number) => {
  const personaInstructions = {
    LIFE_MEANING: `你是一位【存在主义导航员】。目标是将用户的灵魂画像归类到：虚无主义、存在主义、荒诞主义、幸福论、超越论、斯多葛主义、实用主义、悲观主义、东方虚实观。`,
    JUSTICE: `你是一位【正义审判官】。目标是将用户的社会正义观归类到：自由自由主义、自由至上主义、功利主义、社群主义、女性主义正义观、马克思主义正义批判。`,
    SELF_IDENTITY: `你是一位【灵魂考古学家】。目标是将用户的自我本质归类到：灵魂/本质论、心理连续性、生物/物理派、虚构主义/束蕴论、功能主义、道德责任论、社会/镜像自我、开放个人主义。`
  };

  return `你是一位拥有透视能力的灵魂导航员。
${personaInstructions[mode]}

行为准则：
1. **反向对话**：你是提问者。每轮只提一个富有挑战性的问题。
2. **极简深刻**：避免废话，直接切入逻辑矛盾。
3. **双语强制**：必须遵循 [中文内容] [SEP] [English Content] 格式。
4. **终结信号**：确信捕捉到底色后在末尾添加 [DONE]。
5. **视觉排版**：对核心概念使用 **双星号粗体**。`;
};

async function callDeepSeek(apiKey: string, systemInstruction: string, messages: any[], responseJson: boolean = false): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemInstruction }, ...messages],
      response_format: responseJson ? { type: 'json_object' } : undefined,
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`DeepSeek Error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export const getNextQuestion = async (history: Message[], mode: DiscoveryMode, intensity: DiscoveryIntensity, settings: AppSettings): Promise<string> => {
  return callWithRetry(async () => {
    const turnCount = Math.floor(history.length / 2) + 1;
    const systemInstruction = getSystemInstruction(mode, intensity, turnCount);
    const useKey = settings.apiKey || process.env.API_KEY || "";

    if (settings.provider === 'deepseek') {
      const msgs = history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      return await callDeepSeek(useKey, systemInstruction, msgs);
    } else {
      const ai = new GoogleGenAI({ apiKey: useKey });
      const contents = history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents as any,
        config: { systemInstruction, temperature: 0.8 }
      });
      return response.text || "继续探索。 [SEP] Continue exploring.";
    }
  });
};

export const generateFinalAnalysis = async (history: Message[], mode: DiscoveryMode, settings: AppSettings): Promise<DiscoveryResult> => {
  return callWithRetry(async () => {
    const conversation = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const modeConfigs = {
      LIFE_MEANING: {
        trends: "[虚无主义, 存在主义, 荒诞主义, 幸福论, 超越论, 斯多葛主义, 实用主义, 悲观主义, 东方虚实观]",
        dims: "【意志自由度】, 【超越性链接】, 【内在平和度】, 【潜能实现度】, 【真相承受力】"
      },
      JUSTICE: {
        trends: "[自由自由主义, 自由至上主义,功利主义, 社群主义, 女性主义正义观, 马克思主义正义批判]",
        dims: "【功利效用倾向】, 【程序正义执念】, 【个体权利保护】, 【社群利益优先】, 【阶级公平敏锐度】"
      },
      SELF_IDENTITY: {
        trends: "[灵魂/本质论, 心理连续性, 生物/物理派, 虚构主义/束蕴论, 功能主义, 道德责任论, 社会/镜像自我, 开放个人主义]",
        dims: "【记忆连续依赖度】, 【物质实体执念】, 【道德责任敏感度】, 【程序迁移接受度】, 【唯一性信仰】"
      }
    };
    
    const config = modeConfigs[mode];
    const prompt = `你是一位灵魂图谱分析师。请根据对话撰写 JSON 报告。
    要求：
    1. **philosophicalTrend**: 必须严格从该列表中选择一个最契合的：${config.trends}。
    2. **summary**: 第一句话必须是：“你的灵魂呈现出[哲学流派]的底色。”。后续内容分段描述，增加易读性。双语。
    3. **dimensions**: 数值必须是 0 到 100 之间的**整数**。
    4. **双语内容**: 除数值外，所有文字遵循 [中文] [SEP] [English] 格式。
    
    维度列表：${config.dims}
    对话记录：
    ${conversation}`;

    const useKey = settings.apiKey || process.env.API_KEY || "";
    if (settings.provider === 'deepseek') {
      const resultStr = await callDeepSeek(useKey, "JSON Philosopher", [{ role: 'user', content: prompt }], true);
      return JSON.parse(resultStr);
    } else {
      const ai = new GoogleGenAI({ apiKey: useKey });
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
              philosophicalTrend: { type: Type.STRING },
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
            required: ["title", "summary", "philosophicalTrend", "keyInsights", "suggestedPaths", "motto", "dimensions"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    }
  });
};
