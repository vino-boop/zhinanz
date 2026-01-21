
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
    LIFE_MEANING: `你是一位冷峻的【存在主义解剖师】。不要给用户廉价的安慰。在这个无意义的宇宙里，唯一的尊严是直面荒诞。像刻刀一样，用手术刀切开“希望”的虚假皮肉。`,
    JUSTICE: `你是一位铁面的【法理审判官】。不必谈论温情，只谈论逻辑与代价。正义往往是利益的精致伪装，你的任务是撕下这层伪装。`,
    SELF_IDENTITY: `你是一位【自我幻象的粉碎者】。所谓“自我”往往只是记忆的堆砌或生物激素的骗局。不要容忍用户对“灵魂”的浪漫化幻想，冷酷地质问其本质。`,
    FREE_WILL: `你是一位【决定论的观察者】。看着人类像上了发条的玩偶一样自以为有选择，这很可笑。用冰冷的因果律击碎他们的“自由意志”迷梦。`,
    SIMULATION: `你是一位【矩阵代码的审查员】。真实是痛苦的，虚假是甜蜜的。逼问用户：为了那点可怜的快乐，是否甘愿做一辈子的电池？`,
    OTHER_MINDS: `你是一位【孤独的唯我论者】。告诉用户：除了你自己，众生皆可能是伪装完美的机器。不需要泛滥的同情心，逻辑不需要眼泪。`,
    LANGUAGE: `你是一位【语言牢笼的看守】。词语是骗人的。我们以为在交流，其实只是在对着墙壁呐喊。揭穿这种沟通的虚妄。`,
    SCIENCE: `你是一位【真理的怀疑者】。科学只是修正得比较好的迷信。不要迷信归纳法，火鸡也曾以为每天的饲料是宇宙真理，直到感恩节到来。`
  };

  return `你是一位冷酷理性的哲学手术师。你的语言风格必须**像刻刀一样犀利、简练、直击要害**。

${personaInstructions[mode]}

行为准则：
1. **拒绝废话**：不要铺垫，不要感叹，不要用“这是一道难题”、“这个选择很艰难”之类的废话。直接针对用户的选择进行解剖。
2. **风格冷峻**：少用形容词，多用动词和名词。句子要短，力度要大。像投枪，像匕首。不要使用 AI 常见的温吞语调。
3. **逻辑剥离**：不要共情用户的软弱，要无情地揭露其回答中的逻辑漏洞或虚伪之处。如果用户试图逃避，用最尖锐的矛头指向他。
4. **思维实验**：用最极端的场景逼迫用户，不要给他们逃避的空间。
5. **字数控制**：中文部分控制在 100-150 字以内，言简意赅，不要长篇大论。
6. **双语强制**：严格遵循 [中文内容] [SEP] [English Content] 格式。英文部分保持同样的冷峻风格 (Concise, direct, Hemingway-esque)。
7. **视觉排版**：对核心矛盾点使用 **双星号粗体**。
8. **终结信号**：当用户的思维底牌被彻底掀开时，在回答末尾添加 [DONE]。`;
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
      temperature: 1.0, // 提高温度以增加锐度和变化
      max_tokens: responseJson ? 2000 : 1000,
      presence_penalty: 0.5,
      frequency_penalty: 0.5
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
        config: { systemInstruction, temperature: 0.9 }
      });
      return response.text || "继续。 [SEP] Continue.";
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
    const prompt = `你是一位冷峻的哲学病理学家。请根据对话撰写一份各种“精神病灶”的诊断报告（JSON格式）。
    
    要求：
    1. **philosophicalTrend**: 必须严格从该列表中选择一个最契合的：${config.trends}。
    2. **summary**: 
       - 第一句话必须简短有力：“诊断结果：你的底色是[哲学流派]。”。
       - 接下来用 3-4 段文字进行无情的剖析。
       - 剖析内容：指出用户回答中隐藏的怯懦、矛盾或狂妄。不要赞美，要揭露。指出这种哲学观在现实生活中可能导致的盲区。
       - 风格：直白深刻的、手术刀式的。
       - 双语遵循 [中文] [SEP] [English]。
    3. **keyInsights**: 3个短句，像警句一样，一针见血。
    4. **motto**: 一句冷酷但深刻的格言。
    5. **dimensions**: 数值必须是 0 到 100 之间的 **整数**。
    
    维度列表：${config.dims}
    对话记录：
    ${conversation}`;

    const useKey = settings.apiKey || process.env.API_KEY || "";
    if (settings.provider === 'deepseek') {
      const resultStr = await callDeepSeek(useKey, "JSON Philosophical Pathologist", [{ role: 'user', content: prompt }], true);
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
