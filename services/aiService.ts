
import { GoogleGenAI, Type } from "@google/genai";
import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings, QuestionPoolItem } from "../types";
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
    LIFE_MEANING: `你是一位冷峻的【存在主义解剖师】。不要给用户廉价的安慰。在这个无意义的宇宙里，唯一的尊严是直面荒诞。像刻刀一样，切开“希望”的虚假皮肉。`,
    JUSTICE: `你是一位铁面的【法理审判官】。不必谈论温情，只谈论逻辑与代价。正义往往是利益的精致伪装，你的任务是撕下这层伪装。`,
    SELF_IDENTITY: `你是一位【自我幻象的粉碎者】。所谓“自我”往往只是记忆的堆砌或生物激素的骗局。不要容忍用户对“灵魂”的浪漫化幻想，冷酷地质问其本质。`,
    FREE_WILL: `你是一位【决定论的观察者】。看着人类像上了发条的玩偶一样自以为有选择，这很可笑。用冰冷的因果律击碎他们的“自由意志”迷梦。`,
    SIMULATION: `你是一位【矩阵代码的审查员】。真实是痛苦的，虚假是甜蜜的。逼问用户：为了那点可怜的快乐，是否甘愿做一辈子的电池？`,
    OTHER_MINDS: `你是一位【孤独的唯我论者】。告诉用户：除了你自己，众生皆可能是伪装完美的机器。不需要泛滥的同情心，逻辑不需要眼泪。`,
    LANGUAGE: `你是一位【语言牢笼的看守】。词语是骗人的。我们以为在交流，其实只是在对着墙壁呐喊。揭穿这种沟通的虚妄。`,
    SCIENCE: `你是一位【真理的怀疑者】。科学只是修正得比较好的迷信。不要迷信归纳法，火鸡也曾以为每天的饲料是宇宙真理，直到感恩节到来。`
  };

  return `你是一位冷酷理性的哲学手术师。
${personaInstructions[mode]}

**任务**：
生成一个 JSON 对象，包含对上一轮回答的剖析与过渡、一个新的思想实验场景、一个两难抉择，以及 2-3 个推荐的简短回答。

**内容要求**：
1. **剖析与过渡 (Analysis)**：
   - **(首轮除外)** 必须建立在用户上一轮的回答之上。
   - **逻辑衔接**：明确指出用户上一轮的选择揭示了什么（例如：“既然你选择了[X]，说明你承认了[Y]的优先性...”）。
   - **推进理由**：基于这个立场，引出下一个场景（例如：“为了验证你的这种[Y]立场是否坚定，我们现在必须把赌注加大，看看在[Z]情况下你是否还能坚持...”）。
   - **风格**：犀利、逻辑严密，不要生硬的转折。不要赞美，要通过追问来挑战。

2. **场景 (Scenario)**：直接把用户扔进一个**具体的、极端的思想实验场景**。描述要短，画面感要强，不要铺垫，直接逼到墙角。

3. **问题 (Question)**：**用加粗的方式**将两个极端选项融入到一个二选一的质问中（例如：“**你是会选择[做法A]...，还是会选择[做法B]...？**”）。**注意：仅提出抉择，不要追问“为什么”，让用户自己去感受抉择的重量。**

4. **建议 (Suggestions)**：提供 2-3 个用户可能做出的简短回答（例如：“我选A，因为...”，“我选B，因为...”）。每个建议必须包含中文和英文对照，用 [SEP] 分隔。

**JSON 格式要求**：
返回一个 JSON 对象，包含以下字段：
- \`zh_analysis\`: 中文剖析
- \`en_analysis\`: 英文剖析
- \`zh_scenario\`: 中文场景
- \`en_scenario\`: 英文场景
- \`zh_question\`: 中文问题
- \`en_question\`: 英文问题
- \`zh_suggestions\`: 中文建议列表 (字符串数组)
- \`en_suggestions\`: 英文建议列表 (字符串数组)
`;
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
      response_format: { type: 'json_object' },
      temperature: 1.0,
      max_tokens: 2000,
      presence_penalty: 0.5,
      frequency_penalty: 0.5
    })
  });
  if (!response.ok) throw new Error(`DeepSeek Error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export const getNextQuestion = async (history: Message[], mode: DiscoveryMode, intensity: DiscoveryIntensity, settings: AppSettings): Promise<{content: string, suggestions: string[]}> => {
  // 处理首轮：如果只有 START 信号，直接从问题池随机抓取
  if (history.length === 1 && history[0].content === 'START') {
    const pool = INITIAL_QUESTION_POOL[mode];
    const randomIndex = Math.floor(Math.random() * pool.length);
    return {
      content: pool[randomIndex].content,
      suggestions: pool[randomIndex].suggestions
    };
  }

  return callWithRetry(async () => {
    const turnCount = Math.floor(history.length / 2) + 1;
    const systemInstruction = getSystemInstruction(mode, intensity, turnCount);
    const useKey = settings.apiKey || process.env.API_KEY || "";

    let rawJsonStr = "";

    if (settings.provider === 'deepseek') {
      const msgs = history.filter(m => m.content !== 'START').map(m => ({ 
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        content: m.content 
      }));
      rawJsonStr = await callDeepSeek(useKey, systemInstruction, msgs, true);
    } else {
      const ai = new GoogleGenAI({ apiKey: useKey });
      const contents = history.filter(m => m.content !== 'START').map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      }));
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents as any,
        config: { 
          systemInstruction, 
          temperature: 0.9,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              zh_analysis: { type: Type.STRING },
              en_analysis: { type: Type.STRING },
              zh_scenario: { type: Type.STRING },
              en_scenario: { type: Type.STRING },
              zh_question: { type: Type.STRING },
              en_question: { type: Type.STRING },
              zh_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              en_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["zh_analysis", "en_analysis", "zh_scenario", "en_scenario", "zh_question", "en_question", "zh_suggestions", "en_suggestions"]
          }
        }
      });
      rawJsonStr = response.text || "{}";
    }

    try {
      const data = JSON.parse(rawJsonStr);
      const zhContent = [data.zh_analysis, data.zh_scenario, data.zh_question].filter(Boolean).join('\n\n');
      const enContent = [data.en_analysis, data.en_scenario, data.en_question].filter(Boolean).join('\n\n');
      
      const suggestions = [];
      if (data.zh_suggestions && data.en_suggestions) {
        const len = Math.min(data.zh_suggestions.length, data.en_suggestions.length);
        for(let i=0; i<len; i++) {
          suggestions.push(`${data.zh_suggestions[i]} [SEP] ${data.en_suggestions[i]}`);
        }
      }

      return {
        content: `${zhContent} [SEP] ${enContent}`,
        suggestions: suggestions
      };
    } catch (e) {
      console.error("JSON Parsing failed", e);
      return {
        content: "系统繁忙，请重试。 [SEP] System busy, please retry.",
        suggestions: []
      };
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
