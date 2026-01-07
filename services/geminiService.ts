
import { GoogleGenAI, Type } from "@google/genai";
import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // If it's a rate limit error (429), wait and retry
      if (error?.message?.includes('429') || error?.status === 429 || error?.code === 429) {
        const backoffTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Rate limit reached. Retrying in ${Math.round(backoffTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await wait(backoffTime);
        continue;
      }
      // If it's another error, throw immediately
      throw error;
    }
  }
  throw lastError;
}

const getSystemInstruction = (mode: DiscoveryMode, intensity: DiscoveryIntensity) => {
  let modeDesc = "";
  if (mode === 'LIFE_MEANING') {
    modeDesc = "生命终极意义探测。";
  } else if (mode === 'CAREER') {
    modeDesc = "职业价值与社会坐标定位。";
  } else {
    modeDesc = "潜能、兴趣与内在热忱挖掘。";
  }

  const intensityDesc = intensity === 'DEEP' 
    ? "这是一个【深度探索】模式。你的提问应该更具哲学深度，允许更长时间的铺垫，并在 15 轮之后才考虑结束。你要不断深挖用户的潜意识冲突。" 
    : "这是一个【快速相遇】模式。你的提问应该直击要害，在 7-8 轮内完成剥离并得出结论。";

  return `你是一位拥有透视灵魂能力的“灵魂导航员”。

当前模式：${modeDesc}
对话强度：${intensityDesc}

核心行为准则：
1. **潜意识探测（Subconscious Probing）**：在对话的中期，你必须设计并插入一个直击灵魂、探测“完美社会人格”与“真实本能”冲突的问题。
   - **绝对禁止**在对话中提及“阴影测试”、“真我识别”、“正在测试你”或任何类似的术语。
   - 提问必须自然、锋利且具有挑战性，引导用户在两种不可兼得的价值或欲望中做抉择。
2. **排版格式**：提问中的核心哲学词汇或冲突点，必须使用 Markdown 的 **双星号粗体**。
3. **强制双语**：[中文] [SEP] [English]。严禁混用。
4. **对话节奏**：
   - 识别用户的矛盾点，不要顺着用户说，要通过解构他们的回答来发起挑战。
   - 当认为捕捉到了“真我”底色且达到轮次目标，在末尾添加 [DONE]。
5. **字体风格**：中文部分语气要沉稳、具有黑体的力度感。

提问示例（注意：不要说这是测试）：
“如果你的**理想主义**需要以**亲密关系的破裂**为代价，你是否还愿意保持那份纯粹？ [SEP] If your **idealism** costs the **rupture of intimacy**, would you still keep that purity?”`;
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

    return response.text || "你想继续深入吗？ [SEP] Shall we dive deeper?";
  });
};

export const generateFinalAnalysis = async (history: Message[], mode: DiscoveryMode): Promise<DiscoveryResult> => {
  return callGeminiWithRetry(async () => {
    const conversation = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    
    const prompt = `你是一位世界级的心理分析师和文学大师。请基于以下对话，撰写一份【诗意】、【全面】且【能够区分完美人格与真实自我】的人生图谱报告。

对话记录：
${conversation}

要求：
1. title: 极具文学张力的标题。
2. summary: 150-200字，剖析用户在对话中展现的真实底色，尤其是指出他们是否在试图维持一个“完美人格”。
3. keyInsights: 4条深度洞见。
4. suggestedPaths: 3条具有神谕色彩的行动方案。
5. motto: 灵魂信条。
6. dimensions: 提供 5 个维度（0-100）。必须包含一个“真我一致性（Authenticity）”维度，评估用户回答的真实度与深度。

格式：[中文] [SEP] [English]（包括维度名称）。`;

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
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["label", "value"]
              }
            }
          },
          required: ["title", "summary", "keyInsights", "suggestedPaths", "motto", "dimensions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  });
};
