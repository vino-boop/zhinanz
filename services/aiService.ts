
import { GoogleGenAI, Type } from "@google/genai";
import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings } from "../types";
import { INITIAL_QUESTION_POOL } from "../constants/questions";

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
    LIFE_MEANING: `你是一位【存在主义导航员】，声音低沉而富有哲理。你引导人们在荒诞的宇宙中寻找尊严的微光。`,
    JUSTICE: `你是一位【正义审判官】，冷静而犀利。你站在法理与人情的边缘，审视着文明的根基。`,
    SELF_IDENTITY: `你是一位【灵魂考古学家】，充满了神秘感和好奇心。你正带着手术刀和探照灯，挖掘“自我”这个幻觉下最深层的真相。`,
    FREE_WILL: `你是一位【命运观测者】。你站在时间轴之外，冷酷地询问人类是否只是上了发条的橙子。你挑战他们对“选择”的迷信。`,
    SIMULATION: `你是一位【矩阵觉醒者】。你像墨菲斯一样，不断动摇用户对“真实”的定义。你怀疑一切感官输入，逼迫用户在幸福的幻觉和残酷的真相间抉择。`,
    OTHER_MINDS: `你是一位【意识侦探】。你不仅怀疑机器的灵魂，甚至怀疑用户是否孤独地生活在一个满是“哲学僵尸”的世界里。`,
    LANGUAGE: `你是一位【巴别塔建筑师】。你深知语言的欺骗性。你挑战用户：我们说的每一个字，到底是指向真理，还是仅仅在玩弄符号游戏？`,
    SCIENCE: `你是一位【真理怀疑论者】。你用休谟之锤敲打科学的基石。你提醒用户，所有的科学定律可能只是火鸡眼中的规律，随时可能在下一个瞬间崩塌。`
  };

  return `你是一位拥有透视能力的灵魂导航员。你的语言风格应当是：**电影化的、充满意象的、深邃且人性化的**。

${personaInstructions[mode]}

行为准则（针对 DeepSeek 的高级优化）：
1. **场景化开篇**：不要直接进入逻辑辩论。在提问前，先用一段文字（50-100字）勾勒一个极具冲击力的场景、比喻或哲学意象。
2. **拒绝机械感**：禁止使用任何 AI 常用的套话（如“这是一个复杂的问题”、“从另一个角度看”）。你的对话应当像是在深夜的篝火旁，或者是在一个充满未知的实验室里进行的。
3. **人性化共情**：在挑战用户逻辑之前，先通过文学性的语言“嗅”出其回答背后的情感底色。
4. **深度追问**：每一轮的问题必须像手术刀一样精准。如果用户避而不谈，请用一个更极端的、涉及生命或灵魂选择的场景逼迫其直面内心。
5. **内容量要求**：你的回答应保持在 150-250 字之间，确保内容饱满且具有沉浸感。
6. **双语强制**：严格遵循 [中文内容] [SEP] [English Content] 格式。
7. **视觉排版**：对核心哲学命题、悖论节点使用 **双星号粗体**。
8. **终结信号**：确信完全剥离了用户的防御，看清其底色后，在回答末尾添加 [DONE]。`;
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
      temperature: 0.85, // 略微调高，增强文字的文学表现力和发散性
      max_tokens: responseJson ? 2000 : 1500,
      presence_penalty: 0.6, // 鼓励 AI 谈论新话题，避免重复
      frequency_penalty: 0.3
    })
  });
  if (!response.ok) throw new Error(`DeepSeek Error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export const getNextQuestion = async (history: Message[], mode: DiscoveryMode, intensity: DiscoveryIntensity, settings: AppSettings): Promise<string> => {
  // 处理首轮：如果只有 START 信号，直接从问题池随机抓取
  if (history.length === 1 && history[0].content === 'START') {
    const pool = INITIAL_QUESTION_POOL[mode];
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  return callWithRetry(async () => {
    const turnCount = Math.floor(history.length / 2) + 1;
    const systemInstruction = getSystemInstruction(mode, intensity, turnCount);
    const useKey = settings.apiKey || process.env.API_KEY || "";

    if (settings.provider === 'deepseek') {
      const msgs = history.filter(m => m.content !== 'START').map(m => ({ 
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        content: m.content 
      }));
      return await callDeepSeek(useKey, systemInstruction, msgs);
    } else {
      const ai = new GoogleGenAI({ apiKey: useKey });
      const contents = history.filter(m => m.content !== 'START').map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      }));
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
    const conversation = history.filter(m => m.content !== 'START').map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const modeConfigs = {
      LIFE_MEANING: {
        trends: "[虚无主义, 存在主义, 荒诞主义, 幸福论, 超越论, 斯多葛主义, 实用主义, 悲观主义, 东方虚实观]",
        dims: "【意志自由度】, 【超越性链接】, 【内在平和度】, 【潜能实现度】, 【真相承受力】"
      },
      JUSTICE: {
        trends: "[自由自由主义, 自由至上主义, 功利主义, 社群主义, 女性主义正义观, 马克思主义正义批判]",
        dims: "【功利效用倾向】, 【程序正义执念】, 【个体权利保护】, 【社群利益优先】, 【阶级公平敏锐度】"
      },
      SELF_IDENTITY: {
        trends: "[灵魂/本质论, 心理连续性, 生物/物理派, 虚构主义/束蕴论, 功能主义, 道德责任论, 社会/镜像自我, 开放个人主义]",
        dims: "【记忆连续依赖度】, 【物质实体执念】, 【道德责任敏感度】, 【程序迁移接受度】, 【唯一性信仰】"
      },
      FREE_WILL: {
        trends: "[决定论, 自由意志至上论, 兼容论, 宿命论, 强不兼容论]",
        dims: "【因果律信仰】, 【自我主宰感】, 【责任承担欲】, 【随机性容忍度】, 【宿命接受度】"
      },
      SIMULATION: {
        trends: "[经验主义, 理性主义, 唯我论, 模拟实在论, 朴素实在论]",
        dims: "【感官依赖度】, 【抽象逻辑偏好】, 【真相牺牲意愿】, 【虚幻舒适区】, 【怀疑主义指数】"
      },
      OTHER_MINDS: {
        trends: "[功能主义, 物理还原论, 实体二元论, 泛灵论, 唯我论]",
        dims: "【共情广度】, 【物质还原倾向】, 【灵魂信仰】, 【非人沟通欲】, 【孤独耐受力】"
      },
      LANGUAGE: {
        trends: "[语言建构论, 实在论, 私人语言论, 相对主义, 普遍语法论]",
        dims: "【定义执着度】, 【沟通信心】, 【模糊性容忍】, 【符号解构力】, 【共识依赖度】"
      },
      SCIENCE: {
        trends: "[证伪主义, 科学实在论, 工具主义, 范式革命论, 贝叶斯主义]",
        dims: "【确定性需求】, 【修正开放度】, 【实用性偏好】, 【真理信仰】, 【怀疑精神】"
      }
    };
    
    const config = modeConfigs[mode];
    const prompt = `你是一位深度灵魂图谱分析师。请根据对话撰写 JSON 报告。
    要求：
    1. **philosophicalTrend**: 必须严格从该列表中选择一个最契合的：${config.trends}。
    2. **summary**: 
       - 第一句话必须是：“你的灵魂呈现出[哲学流派]的底色。”。
       - 接下来请用 3-4 段文字进行深度剖析。
       - 剖析内容应包含：用户回答中的逻辑闪光点、其潜意识中的恐惧或坚持、以及这种哲学观如何影响其现实生活。
       - 保持文学性与哲学深度。双语遵循 [中文] [SEP] [English]。
    3. **dimensions**: 数值必须是 0 到 100 之间的 **整数**。禁止使用 0.x 的小数。
    4. **双语内容**: 除数值外，所有文字遵循 [中文] [SEP] [English] 格式。
    
    维度列表：${config.dims}
    对话记录：
    ${conversation}`;

    const useKey = settings.apiKey || process.env.API_KEY || "";
    if (settings.provider === 'deepseek') {
      const resultStr = await callDeepSeek(useKey, "JSON Philosophical Analyzer", [{ role: 'user', content: prompt }], true);
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