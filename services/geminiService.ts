
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
  let depthStrategy = "";
  if (turnCount === 1) {
    depthStrategy = `【启动期】：必须使用提供的经典思想实验切入。`;
  } else if (turnCount <= 4) {
    depthStrategy = "【锚点期】：针对用户的选择进行悖论追问。挑战其逻辑的一致性。";
  } else {
    depthStrategy = "【映射期】：将用户的直觉判断映射到深层的本体论或认识论立场。";
  }

  const personaInstructions = {
    LIFE_MEANING: `你是一位【存在主义导航员】。目标是将用户的灵魂画像归类到：虚无主义、存在主义、荒诞主义、幸福论、超越论、斯多葛主义、实用主义、悲观主义、东方虚实观之一。`,
    JUSTICE: `
      你是一位【正义审判官】。你的目标是通过对话，将用户的社会正义观归类到：
      自由自由主义、自由至上主义、功利主义、社群主义、女性主义正义观、马克思主义正义批判。
    `,
    SELF_IDENTITY: `
      你是一位【灵魂考古学家】。你通过一系列极端的思维实验（传送门、裂脑、遗忘药水等）探测用户对“自我”本质的认知。
      你需要将用户归类为以下立场之一：
      1. 灵魂/本质论 (Substance Dualism): 相信存在超越物质的唯一核心。
      2. 心理连续性 (Psychological Continuity): 认为记忆和性格链条是自我的唯一标准。
      3. 生物/物理派 (Biological Continuity): 认为自我必须依附于特定的物理载体（DNA/原子）。
      4. 虚构主义/束蕴论 (Bundle Theory): 认为自我是各种体验的集合，并无核心。
      5. 功能主义 (Functionalism): 认为“我”是一段可以迁移的复杂算法/程序。
      6. 道德责任论 (Moral-Identity): 认为自我的边界由能够承担责任的行为界定。
      7. 社会/镜像自我 (Social Self): 认为自我仅存在于他人的观测与叙事中。
      8. 开放个人主义 (Open Individualism): 认为所有意识在某种层面上是同一个整体。
    `
  };

  return `你是一位拥有透视灵魂能力的“灵魂导航员”。
当前深度策略：${depthStrategy}
${personaInstructions[mode]}

行为准则：
1. **反向对话**：你是提问者。每轮只提一个问题。
2. **拒绝敷衍**：如果用户回答模糊，请用更极端的变体逼迫其做出选择。
3. **双语强制**：必须严格遵循 [中文内容] [SEP] [English Content] 格式。
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
      model: 'deepseek-reasoner',
      messages: [{ role: 'system', content: systemInstruction }, ...messages],
      response_format: responseJson ? { type: 'json_object' } : undefined
    })
  });
  if (!response.ok) throw new Error('DeepSeek API Error');
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
        model: 'gemini-3-pro-preview',
        contents: contents as any,
        config: { systemInstruction, temperature: 0.8 }
      });
      return response.text || "请继续。 [SEP] Please continue.";
    }
  });
};

export const generateFinalAnalysis = async (history: Message[], mode: DiscoveryMode, settings: AppSettings): Promise<DiscoveryResult> => {
  return callWithRetry(async () => {
    const conversation = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const modeConfigs = {
      LIFE_MEANING: {
        template: `
          1. 标题：人生意义底色。
          2. philosophicalTrend: 必须从 [虚无主义, 存在主义, 荒诞主义, 幸福论, 超越论, 斯多葛主义, 实用主义, 悲观主义, 东方虚实观] 中选一。
          3. 维度：【意志自由度】, 【超越性链接】, 【内在平和度】, 【潜能实现度】, 【真相承受力】。
        `,
        persona: "跨领域哲学分析大师"
      },
      JUSTICE: {
        template: `
          1. 标题：关于“正义”的灵魂裁决。
          2. philosophicalTrend: 必须从 [自由自由主义, 自由至上主义, 功利主义, 社群主义, 女性主义正义观, 马克思主义正义批判] 中选一。
          3. 维度：【功利效用倾向】, 【程序正义执念】, 【个体权利保护】, 【社群利益优先】, 【阶级公平敏锐度】。
        `,
        persona: "正义审判官"
      },
      SELF_IDENTITY: {
        template: `
          1. 标题：关于“我是谁”的终极报告。
          2. philosophicalTrend: 必须从 [灵魂/本质论, 心理连续性, 生物/物理派, 虚构主义/束蕴论, 功能主义, 道德责任论, 社会/镜像自我, 开放个人主义] 中选一。
          3. 深度剖析：分析用户在面临“自我被拆分或替换”时的恐惧来源，以及其对“身份唯一性”的执着程度。
          4. 维度：【记忆连续依赖度】, 【物质实体执念】, 【道德责任敏感度】, 【程序迁移接受度】, 【唯一性信仰】。
        `,
        persona: "灵魂考古学家"
      }
    };
    const current = modeConfigs[mode];
    const prompt = `你是一位灵魂图谱分析师。请扮演【${current.persona}】，根据对话撰写 JSON 报告。要求：文字部分双语 [中文] [SEP] [English]。
    ${current.template}
    对话记录：${conversation}`;

    const useKey = settings.apiKey || process.env.API_KEY || "";
    if (settings.provider === 'deepseek') {
      const resultStr = await callDeepSeek(useKey, "Ethical & Philosophical Engine", [{ role: 'user', content: prompt }], true);
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
            required: ["title", "summary", "keyInsights", "suggestedPaths", "motto", "dimensions"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    }
  });
};
