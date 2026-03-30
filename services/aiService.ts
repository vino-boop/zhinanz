// AI 服务 - 调用 DeepSeek/Gemini API
// ⚠️ API Key 不再硬编码，统一从后端或用户设置获取
import { DEEPSEEK_API_URL, GEMINI_API_URL, fetchApiKeyFromBackend } from '../config/api';
import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings } from '../types';
import { getJudgeInstruction, getPhilosopherInstruction } from "../personas";
import { matchPersonas } from "../personaKeywords";

// 从 localStorage 获取 API Key（用户自定义）
function getApiKeyFromStorage(): { apiKey: string; provider: string } {
  try {
    const saved = localStorage.getItem('explorer_compass_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey) {
        return { apiKey: parsed.apiKey, provider: parsed.provider || 'deepseek' };
      }
    }
  } catch (e) {
    console.warn('读取 localStorage 失败:', e);
  }
  return { apiKey: '', provider: 'deepseek' };
}

// 获取 API Key 的优先级：用户设置 > 后端获取 > localStorage
async function getApiKey(settings: AppSettings): Promise<{ apiKey: string; provider: string }> {
  // 1. 优先使用用户传入的 settings
  if (settings.apiKey) {
    return { apiKey: settings.apiKey, provider: settings.provider || 'deepseek' };
  }
  
  // 2. 尝试从后端获取
  const backendKey = await fetchApiKeyFromBackend('哲思');
  if (backendKey) {
    return backendKey;
  }
  
  // 3. 最后从 localStorage 读取
  return getApiKeyFromStorage();
}

// 保存 sessionId (为了兼容现有接口，虽然直连不需要)
let sessionId: string | null = null;

export const setSessionId = (id: string) => {
  sessionId = id;
};

export const getSessionId = () => sessionId;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
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

// ============================================================
// 第一阶段：审判机回复 + 提出新问题
// ============================================================
export const streamJudgeResponse = async function* (
  history: Message[],
  mode: DiscoveryMode,
  intensity: DiscoveryIntensity,
  settings: AppSettings,
  lang: string = 'zh',
  questionCount: number = 0
): AsyncGenerator<{ messages: Message[], isDone: boolean, judgeContent?: string }> {
  const judgeInstruction = getJudgeInstruction(mode, lang, questionCount);
  const isZh = lang === 'zh';
  
  // 检测是否是初始问题（包含 START）
  const isInitialQuestion = history.some(m => m.content && m.content.startsWith('START'));

  // 根据问题类型选择不同的 prompt
  const connectionInstruction = isInitialQuestion 
    ? (isZh 
        ? "这是第一个问题，直接提出问题即可，不需要解释为什么要问。" 
        : "This is the first question. Just ask the question directly, no need to explain why you're asking.")
    : "";

  const systemPrompt = isZh
    ? `你是一个哲学探索助手，负责主持"多方会审"模式的哲学讨论。
当前模式：${mode}
当前强度：${intensity === 'QUICK' ? '快速探索（8轮左右）' : '深度探索（无上限）'}

${connectionInstruction}

${judgeInstruction}

要求：
1. 你是审判机，负责提出思想实验和道德困境
2. 问题要具体、有场景、有冲击力
3. 绝对不要问抽象的理论问题
4. 在回复最后添加 [Suggestions] 标签
5. 当你觉得对话已经足够深入，可以结束时：请用一句诗意的语言总结这场对话的灵魂，然后写出两句话回顾用户的核心观点与回答脉络，最后添加 [DONE] 标记表示结束。格式如：
   "在这场关于[主题]的追问中，你如同一道穿透迷雾的光..."
   回顾：用户的回答揭示了[第一核心观点]...同时也展现出[第二特点]...
   [DONE]`
    : `You are a philosophical exploration assistant, hosting a "Multi-Party Trial" discussion.
Current Mode: ${mode}
Current Intensity: ${intensity === 'QUICK' ? 'Quick (~8 rounds)' : 'Deep (unlimited)'}

${connectionInstruction}

${judgeInstruction}

Requirements:
1. You are the Judge, presenting thought experiments and moral dilemmas
2. Questions should be concrete, scenario-based, impactful
3. NEVER ask abstract theoretical questions
4. Add [Suggestions] tag at the end
5. When you feel the conversation is deep enough to conclude: Write one poetic sentence summarizing the soul of this dialogue, then write two sentences reviewing the user's core viewpoints and answer patterns. Finally add [DONE] tag. Format example:
   "In this journey of exploring [topic], you appear as a light piercing through the mist..."
   Review: Your answers reveal [first key insight]... while also showing [second characteristic]...
   [DONE]`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  // 构建对话历史
  let initialQuestion = '';
  let initialSuggestions = '';
  let hasStart = false;

  for (const msg of history) {
    if (msg.content.startsWith('START')) {
      hasStart = true;
      if (msg.content.includes(':')) {
        const parts = msg.content.substring(msg.content.indexOf(':') + 1).split('|SUGGESTIONS:');
        initialQuestion = parts[0];
        if (parts.length > 1) {
          initialSuggestions = parts[1];
        }
      }

      // 初始问题的处理
      if (isZh) {
        messages.push({
          role: 'user',
          content: `开始探索。请直接输出审判机的初始问题，带入具体场景。不要输出任何标签前缀。\n\n初始问题：${initialQuestion}${initialSuggestions ? `\n\n建议选项：${initialSuggestions}` : ''}`
        });
      } else {
        messages.push({
          role: 'user',
          content: `Start exploration. Output the Judge's initial question directly with a concrete scenario. Do not output any tag prefix.\n\nInitial Question: ${initialQuestion}${initialSuggestions ? `\n\nSuggested options: ${initialSuggestions}` : ''}`
        });
      }
      continue;
    }

    // 用户的回答
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  if (!hasStart && messages.length === 1) {
    messages.push({
      role: 'user',
      content: isZh ? `开始探索` : `Start exploration`
    });
  }

  if (!sessionId) {
    sessionId = Date.now().toString();
  }

  // 获取 API Key（不再硬编码）
  const { apiKey, provider } = await getApiKey(settings);
  if (!apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  let response: Response;
  if (provider === 'deepseek') {
    // DeepSeek API
    response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: true,
        temperature: 0.7
      })
    });
  } else {
    // Gemini API
    const geminiUrl = `${GEMINI_API_URL}?key=${apiKey}`;
    const geminiMessages = messages.map(m => ({
      role: m.role === 'system' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          stream: true
        }
      })
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  const parseStreamedText = (text: string): Message[] => {
    const parsedMessages: Message[] = [];
    
    // 检查是否有 Suggestions
    const suggestionsMatch = text.match(/\[Suggestions\]([\s\S]*)/i);
    let suggestions: string[] = [];
    let mainContent = text;

    if (suggestionsMatch) {
      mainContent = text.substring(0, suggestionsMatch.index).trim();
      const suggestionsText = suggestionsMatch[1];
      suggestions = suggestionsText
        .split('\n')
        .map(s => s.trim().replace(/^[-*0-9.]+\s*/, ''))
        .filter(s => s.length > 0);
    }

    if (mainContent.trim()) {
      parsedMessages.push({
        id: '',
        role: 'assistant',
        speaker: 'Judge',
        content: mainContent.trim().replace('[DONE]', ''),
        timestamp: Date.now(),
        suggestions: suggestions.length > 0 ? suggestions : undefined
      });
    }

    return parsedMessages;
  };

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices[0].delta.content || '';
            
            // Typewriter effect
            for (let i = 0; i < delta.length; i++) {
              fullText += delta[i];
              const parsedMessages = parseStreamedText(fullText);
              const isDone = fullText.includes('[DONE]');
              const judgeContent = parsedMessages.length > 0 ? parsedMessages[0].content : '';
              yield { messages: parsedMessages, isDone, judgeContent };
              await new Promise(resolve => setTimeout(resolve, 15));
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    }
  }
};

// ============================================================
// 第二阶段：根据关键词匹配哲学家，获取哲学家回复
// 特点：对用户回答进行赞同/反对/质疑/补充等点评
// ============================================================
export const streamPhilosopherResponse = async function* (
  userAnswer: string,
  judgeResponse: string,
  mode: DiscoveryMode,
  settings: AppSettings,
  lang: string = 'zh',
  specificPhilosopher?: { name: string; prompt: string; keywords?: string }
): AsyncGenerator<{ messages: Message[], isDone: boolean }> {
  const isZh = lang === 'zh';
  
  let systemPrompt: string;

  // 如果指定了特定哲学家，直接使用该哲学家的 prompt
  if (specificPhilosopher) {
    systemPrompt = specificPhilosopher.prompt || `你是${specificPhilosopher.name}。请以哲学家的身份与用户对话。`;
  } else {
    // 否则根据关键词匹配哲学家
    const matchedPersonas = matchPersonas(userAnswer, mode);
    const philosopherInstruction = getPhilosopherInstruction(
      matchedPersonas,
      userAnswer,
      judgeResponse,
      lang
    );

    systemPrompt = isZh
      ? `你是一个哲学家角色扮演助手。
${philosopherInstruction}

要求：
1. 严格按格式输出 [Persona: 哲学家名字] 标签
2. 每个哲学家只能说 1-2 句话
3. 动作/神态描写要简洁
4. 不要重复审判机已经说过的话
5. 必须有至少1位哲学家发言`
      : `You are a philosopher role-playing assistant.
${philosopherInstruction}

Requirements:
1. Output strictly in format [Persona: Philosopher Name] tag
2. Each philosopher can only speak 1-2 sentences
3. Keep action/expression descriptions concise
4. Do not repeat what the Judge has already said
5. At least one philosopher must respond`;
  }

  // 构建 user message
  let userMessage: string;
  if (specificPhilosopher) {
    // 一对一哲学家模式
    userMessage = isZh
      ? `用户说：${userAnswer}\n\n请以${specificPhilosopher.name}的身份，用符合其哲学思想和说话风格的方式回复。可以加入适当的动作和神态描写。`
      : `User said: ${userAnswer}\n\nPlease respond as ${specificPhilosopher.name}, in a way that reflects their philosophical thinking and speaking style. You may include appropriate actions and expressions.`;
  } else {
    // 多个哲学家模式
    userMessage = isZh
      ? `请作为匹配到的哲学家，对用户的回答发表看法。`
      : `Please share your views as the matched philosopher.`;
  }

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  if (!sessionId) {
    sessionId = Date.now().toString();
  }

  // 获取 API Key（不再硬编码）
  const { apiKey, provider } = await getApiKey(settings);
  if (!apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  let response: Response;
  if (provider === 'deepseek') {
    response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: true,
        temperature: 0.7
      })
    });
  } else {
    const geminiUrl = `${GEMINI_API_URL}?key=${apiKey}`;
    const geminiMessages = messages.map(m => ({
      role: m.role === 'system' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: { temperature: 0.7, stream: true }
      })
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) {
    throw new Error('Failed to create reader');
  }

  // 先收集完整响应，再解析和逐个输出
  let fullResponse = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6);
        // 跳过 [DONE]
        if (dataStr === '[DONE]') continue;
        try {
          const data = JSON.parse(dataStr);
          const delta = data.choices[0].delta.content || '';
          fullResponse += delta;
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }
  
  console.log('哲学家完整回复:', fullResponse);
  
  if (!fullResponse.trim()) {
    console.log('警告：哲学家返回为空');
    yield { messages: [], isDone: true };
    return;
  }
  
  // 解析完整的响应，按 [Persona: xxx] 分割
  const philosopherRegex = /\[Persona:\s*([^\]]+)\]([\s\S]*?)(?=\[Persona:|$)/gi;
  let match;
  let philosophers: { name: string; content: string }[] = [];
  
  while ((match = philosopherRegex.exec(fullResponse)) !== null) {
    const name = match[1].trim();
    const content = match[2].trim();
    if (content) {
      philosophers.push({ name, content });
    }
  }
  
  // 如果指定了特定哲学家，只保留该哲学家的回复
  if (specificPhilosopher && philosophers.length > 0) {
    const targetName = specificPhilosopher.name;
    philosophers = philosophers.filter(p => 
      p.name.includes(targetName) || targetName.includes(p.name)
    );
    if (philosophers.length === 0) {
      philosophers = [{
        name: targetName,
        content: fullResponse.trim()
      }];
    }
  }
  
  // 如果没有匹配到哲学家，尝试整段作为回复
  if (philosophers.length === 0 && fullResponse.trim()) {
    philosophers.push({
      name: specificPhilosopher?.name || 'Philosopher',
      content: fullResponse.trim()
    });
  }
  
  console.log('解析到的哲学家:', philosophers);
  
  // 逐个 yield 哲学家消息
  for (let i = 0; i < philosophers.length; i++) {
    const p = philosophers[i];
    yield {
      messages: [{
        id: '',
        role: 'assistant',
        speaker: p.name,
        content: p.content,
        timestamp: Date.now()
      }],
      isDone: i === philosophers.length - 1
    };
    // 每个哲学家消息之间加延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// ============================================================
// 保留原有接口，兼容旧版本
// ============================================================
const getSystemPrompt = (mode: DiscoveryMode, intensity: DiscoveryIntensity, lang: string) => {
  const isZh = lang === 'zh';
  
  const basePrompt = isZh 
    ? `你是一个哲学探索助手。你的目标是通过苏格拉底式的提问，引导用户深入思考特定的哲学主题。
当前模式：${mode}
当前强度：${intensity === 'QUICK' ? '快速探索（3-5个问题）' : '深度探索（8-10个问题）'}

要求：
1. 每次只问一个问题。
2. 问题要循序渐进，从浅入深。
3. 结合用户的回答进行追问。
4. 如果用户回答得足够深入，或者达到了探索强度的要求，请在回复的最后加上 "[DONE]" 标记，表示探索结束。
5. 你的回复必须严格按照系统指令的纯文本格式输出，包含角色标签和最后的 [Suggestions] 标签。`
    : `You are a philosophical exploration assistant. Your goal is to guide the user to think deeply about specific philosophical themes through Socratic questioning.
Current Mode: ${mode}
Current Intensity: ${intensity === 'QUICK' ? 'Quick Exploration (3-5 questions)' : 'Deep Exploration (8-10 questions)'}

Requirements:
1. Ask only one question at a time.
2. Questions should be progressive, from shallow to deep.
3. Follow up based on the user's answers.
4. If the user has answered deeply enough, or the exploration intensity requirement is met, please add the "[DONE]" tag at the end of your response to indicate the end of the exploration.
5. Your response MUST strictly follow the plain text format specified in the system instructions, including role tags and the final [Suggestions] tag.`;

  return basePrompt;
};

export const streamNextQuestion = async function* (
  history: Message[], 
  mode: DiscoveryMode, 
  intensity: DiscoveryIntensity, 
  settings: AppSettings,
  lang: string = 'zh'
): AsyncGenerator<{ messages: Message[], isDone: boolean }> {
  yield* streamJudgeResponse(history, mode, intensity, settings, lang);
};

export const generateFinalAnalysis = async (
  history: Message[], 
  mode: DiscoveryMode, 
  settings: AppSettings
): Promise<DiscoveryResult> => {
  const isZh = history.some(m => m.content.match(/[\u4e00-\u9fa5]/));
  
  const systemPrompt = isZh
    ? `你是一个哲学分析师。请根据用户的对话历史，生成一份详细的哲学性格分析报告。
你的回复必须是 JSON 格式，包含以下字段：
- title (字符串，如 "荒诞的反抗者")
- summary (字符串，详细分析)
- philosophicalTrend (字符串，哲学倾向)
- keyInsights (字符串数组，3-4个关键洞察)
- suggestedPaths (字符串数组，2-3条进化路径)
- motto (字符串，一句话格言)
- dimensions (对象数组，包含 label, value(0-100), description)`
    : `You are a philosophical analyst. Please generate a detailed philosophical personality analysis report based on the user's conversation history.
Your response MUST be in JSON format, containing:
- title (string, e.g., "The Absurd Rebel")
- summary (string, detailed analysis)
- philosophicalTrend (string, philosophical tendency)
- keyInsights (string array, 3-4 key insights)
- suggestedPaths (string array, 2-3 evolution paths)
- motto (string, one-sentence motto)
- dimensions (object array, with label, value(0-100), description)`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of history) {
    if (msg.content.startsWith('START')) continue;
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  return callWithRetry(async () => {
    // 获取 API Key（不再硬编码）
    const { apiKey, provider } = await getApiKey(settings);
    if (!apiKey) {
      throw new Error('请先在设置中配置 API Key');
    }

    let response: Response;
    if (provider === 'deepseek') {
      response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });
    } else {
      // Gemini 用于最终分析
      const geminiUrl = `${GEMINI_API_URL}?key=${apiKey}`;
      const geminiMessages = messages.map(m => ({
        role: m.role === 'system' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    let contentStr: string;
    if (provider === 'deepseek') {
      const data = await response.json();
      contentStr = data.choices[0].message.content;
    } else {
      const data = await response.json();
      contentStr = data.candidates[0].content.parts[0].text;
    }
    
    try {
      const parsed = JSON.parse(contentStr);
      
      return {
        title: parsed.title || '',
        summary: parsed.summary || '',
        philosophicalTrend: parsed.philosophicalTrend || '',
        keyInsights: parsed.keyInsights || [],
        suggestedPaths: parsed.suggestedPaths || [],
        motto: parsed.motto || '',
        dimensions: parsed.dimensions || []
      } as DiscoveryResult;
    } catch (e) {
      throw new Error('Failed to parse analysis result');
    }
  });
};

export const getChatHistory = async (): Promise<Message[]> => {
  return [];
};

export const clearSession = () => {
  sessionId = null;
};
