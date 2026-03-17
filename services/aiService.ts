import { Message, DiscoveryResult, DiscoveryMode, DiscoveryIntensity, AppSettings } from "../types";
import { getPersonaInstruction } from "../personas";

const DEEPSEEK_API_KEY = 'sk-8d1043af8f8c48edb1c80048b7f75690';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

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
  const instruction = getPersonaInstruction(mode, lang);
  const systemPrompt = getSystemPrompt(mode, intensity, lang) + '\n\n' + instruction;

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

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
      const startPrompt = lang === 'zh' 
        ? `开始探索。请根据初始问题触发的标签，动态选择2到4位哲学家输出简短初始观点，然后由审判机直接输出该初始问题，绝对不要包含任何“初始观点”、“提出问题”等说明性文字：\n\n初始问题：${initialQuestion}${initialSuggestions ? `\n\n请在最后的 [Suggestions] 标签后严格使用以下建议：\n${initialSuggestions}` : ''}`
        : `Start exploration. Based on the tags triggered by the initial question, dynamically select 2 to 4 philosophers to output brief initial views, and then the Judge directly outputs this initial question. NEVER include any explanatory text like "Initial view" or "Asking question":\n\nInitial Question: ${initialQuestion}${initialSuggestions ? `\n\nPlease strictly use the following suggestions after the [Suggestions] tag:\n${initialSuggestions}` : ''}`;
      messages.push({
        role: 'user',
        content: startPrompt
      });
      continue;
    }
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  if (!hasStart && messages.length === 1) {
    messages.push({
      role: 'user',
      content: lang === 'zh' ? `开始探索` : `Start exploration`
    });
  }

  if (!sessionId) {
    sessionId = Date.now().toString();
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      stream: true,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  const parseStreamedText = (text: string): Message[] => {
    const parsedMessages: Message[] = [];
    const regex = /\[(Judge|Persona:\s*[^\]]+|Suggestions)\]/gi;
    let match;
    const matches = [];
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        tag: match[1],
        index: match.index,
        length: match[0].length
      });
    }
    
    if (matches.length === 0) {
      if (text.trim()) {
        parsedMessages.push({
          id: '', role: 'assistant', content: text.trim().replace('[DONE]', ''), timestamp: Date.now()
        });
      }
      return parsedMessages;
    }
    
    if (matches[0].index > 0) {
      const preText = text.substring(0, matches[0].index).trim();
      if (preText) {
        parsedMessages.push({
          id: '', role: 'assistant', content: preText.replace('[DONE]', ''), timestamp: Date.now()
        });
      }
    }
    
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      const start = currentMatch.index + currentMatch.length;
      const end = nextMatch ? nextMatch.index : text.length;
      const content = text.substring(start, end).trim().replace('[DONE]', '');
      const tag = currentMatch.tag.trim();
      
      if (tag.toLowerCase() === 'suggestions') {
        const suggestions = content.split('\n').map(s => s.trim().replace(/^[-*0-9.]+\s*/, '')).filter(s => s.length > 0);
        if (parsedMessages.length > 0) {
          parsedMessages[parsedMessages.length - 1].suggestions = suggestions;
        }
      } else {
        let speaker = tag;
        if (tag.toLowerCase().startsWith('persona:')) {
          speaker = tag.substring(8).trim();
        } else if (tag.toLowerCase() === 'judge') {
          speaker = 'Judge';
        }
        
        parsedMessages.push({
          id: '',
          role: 'assistant',
          speaker: speaker,
          content: content,
          timestamp: Date.now()
        });
      }
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
            
            // Typewriter effect: yield character by character with a small delay
            for (let i = 0; i < delta.length; i++) {
              fullText += delta[i];
              const parsedMessages = parseStreamedText(fullText);
              const isDone = fullText.includes('[DONE]');
              yield { messages: parsedMessages, isDone };
              await new Promise(resolve => setTimeout(resolve, 15));
            }
          } catch (e) {
            // ignore parse errors for incomplete chunks
          }
        }
      }
    }
  }
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
- mbtiType (字符串，如 "INTJ")
- mbtiTitle (字符串，如 "深邃的思考者")
- mbtiDescription (字符串，详细描述)
- primaryPhilosopher (字符串，最匹配的哲学家名字)
- philosopherQuote (字符串，该哲学家的名言)
- analysis (字符串，对用户思想的深度分析)
- dimensions (对象，包含 4 个维度，每个维度是一个包含 name, score(0-100), description 的对象。维度例如：理性/感性，决定论/自由意志，虚无/意义，集体/个人)`
    : `You are a philosophical analyst. Please generate a detailed philosophical personality analysis report based on the user's conversation history.
Your response MUST be in JSON format, containing the following fields:
- mbtiType (string, e.g., "INTJ")
- mbtiTitle (string, e.g., "The Deep Thinker")
- mbtiDescription (string, detailed description)
- primaryPhilosopher (string, name of the most matching philosopher)
- philosopherQuote (string, a quote from that philosopher)
- analysis (string, deep analysis of the user's thoughts)
- dimensions (object, containing 4 dimensions, each is an object with name, score(0-100), description. Dimensions e.g.: Rational/Emotional, Determinism/Free Will, Nihilism/Meaning, Collective/Individual)`;

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
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const contentStr = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(contentStr);
      return parsed as DiscoveryResult;
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
