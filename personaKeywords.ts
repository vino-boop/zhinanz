import { DiscoveryMode } from './types';

// 哲学家关键词映射表
// 每个关键词对应可能触发的哲学家和权重
export const PERSONA_KEYWORDS: Record<string, { philosophers: string[], weight: number }> = {
  // === 自由/责任 ===
  '自由': { philosophers: ['萨特', '尼采', '斯宾诺莎'], weight: 2.0 },
  '选择': { philosophers: ['萨特', '康德', '克尔凯郭尔', '威廉·詹姆斯'], weight: 1.8 },
  '责任': { philosophers: ['萨特', '康德', '列维纳斯'], weight: 1.8 },
  '决定': { philosophers: ['斯宾诺莎', '霍尔巴赫', '休谟'], weight: 1.5 },
  '命运': { philosophers: ['马可·奥勒留', '斯宾诺莎', '尼采'], weight: 1.8 },

  // === 道德/功利 ===
  '幸福': { philosophers: ['边沁', '亚里士多德', '休谟'], weight: 2.0 },
  '功利': { philosophers: ['边沁'], weight: 2.5 },
  '最大幸福': { philosophers: ['边沁'], weight: 2.5 },
  '道德': { philosophers: ['康德', '亚里士多德', '边沁'], weight: 1.5 },
  '义务': { philosophers: ['康德'], weight: 2.5 },
  '法则': { philosophers: ['康德'], weight: 2.0 },
  '应该': { philosophers: ['康德', '亚里士多德'], weight: 1.5 },
  '公平': { philosophers: ['罗尔斯', '亚里士多德'], weight: 2.0 },
  '正义': { philosophers: ['罗尔斯', '亚里士多德', '柏拉图'], weight: 2.0 },
  '弱者': { philosophers: ['罗尔斯', '马克思'], weight: 1.8 },
  '分配': { philosophers: ['罗尔斯', '诺齐克', '马克思'], weight: 1.5 },
  '阶级': { philosophers: ['马克思'], weight: 2.5 },
  '剥削': { philosophers: ['马克思'], weight: 2.5 },
  '革命': { philosophers: ['马克思', '尼采'], weight: 1.8 },

  // === 存在/荒诞 ===
  '意义': { philosophers: ['加缪', '萨特', '尼采', '克尔凯郭尔', '维特根斯坦', '德里达'], weight: 2.0 },
  '无意义': { philosophers: ['加缪', '叔本华'], weight: 2.5 },
  '痛苦': { philosophers: ['叔本华', '加缪', '尼采'], weight: 2.0 },
  '荒诞': { philosophers: ['加缪'], weight: 2.5 },
  '自杀': { philosophers: ['加缪'], weight: 2.5 },
  '西西弗斯': { philosophers: ['加缪'], weight: 2.5 },
  '反抗': { philosophers: ['加缪', '尼采'], weight: 2.0 },
  '绝望': { philosophers: ['克尔凯郭尔', '叔本华'], weight: 2.0 },
  '焦虑': { philosophers: ['克尔凯郭尔', '海德格尔'], weight: 2.0 },
  '信仰': { philosophers: ['克尔凯郭尔', '奥古斯丁'], weight: 2.0 },
  '个体': { philosophers: ['克尔凯郭尔', '尼采', '萨特'], weight: 1.5 },

  // === 理性/认知 ===
  '理性': { philosophers: ['笛卡尔', '康德', '斯宾诺莎', '亚里士多德'], weight: 1.8 },
  '怀疑': { philosophers: ['笛卡尔', '休谟', '高尔吉亚'], weight: 2.0 },
  '我思': { philosophers: ['笛卡尔'], weight: 2.5 },
  '灵魂': { philosophers: ['笛卡尔', '柏拉图', '亚里士多德'], weight: 1.5 },
  '经验': { philosophers: ['休谟', '洛克'], weight: 2.0 },
  '感觉': { philosophers: ['休谟', '贝克莱'], weight: 1.8 },
  '习惯': { philosophers: ['休谟'], weight: 2.0 },
  '知识': { philosophers: ['柏拉图', '亚里士多德', '康德'], weight: 1.5 },
  '真理': { philosophers: ['柏拉图', '康德', '波普尔'], weight: 1.5 },

  // === 自我/身份 ===
  '自我': { philosophers: ['洛克', '笛卡尔', '康德', '释迦牟尼'], weight: 1.8 },
  '意识': { philosophers: ['洛克', '笛卡尔', '康德'], weight: 1.5 },
  '记忆': { philosophers: ['洛克'], weight: 2.0 },
  '白板': { philosophers: ['洛克'], weight: 2.5 },
  '无我': { philosophers: ['释迦牟尼'], weight: 2.5 },
  '涅槃': { philosophers: ['释迦牟尼'], weight: 2.5 },
  '缘起': { philosophers: ['释迦牟尼'], weight: 2.5 },
  '执念': { philosophers: ['释迦牟尼', '克尔凯郭尔'], weight: 1.8 },

  // === 意志/力量 ===
  '意志': { philosophers: ['叔本华', '尼采'], weight: 2.0 },
  '权力': { philosophers: ['尼采', '霍尔巴赫'], weight: 2.0 },
  '超人': { philosophers: ['尼采'], weight: 2.5 },
  '上帝': { philosophers: ['尼采', '奥古斯丁', '贝克莱'], weight: 1.5 },
  '上帝已死': { philosophers: ['尼采'], weight: 2.5 },
  '重估': { philosophers: ['尼采'], weight: 2.5 },
  '欲望': { philosophers: ['叔本华', '尼采', '弗洛伊德'], weight: 1.8 },
  '悲观': { philosophers: ['叔本华'], weight: 2.5 },
  '禁欲': { philosophers: ['叔本华', '马可·奥勒留'], weight: 2.0 },

  // === 自然/斯多葛 ===
  '自然': { philosophers: ['斯宾诺莎', '马可·奥勒留', '亚里士多德', '庄子'], weight: 1.5 },
  '宁静': { philosophers: ['马可·奥勒留', '斯宾诺莎', '释迦牟尼'], weight: 2.0 },
  '克制': { philosophers: ['马可·奥勒留', '斯宾诺莎'], weight: 2.0 },
  '必然': { philosophers: ['斯宾诺莎', '霍尔巴赫'], weight: 2.0 },

  // === 模拟/现实 ===
  '模拟': { philosophers: ['博斯特罗姆', '普特南', '笛卡尔'], weight: 2.0 },
  '缸中之脑': { philosophers: ['普特南', '笛卡尔'], weight: 2.5 },
  '梦境': { philosophers: ['笛卡尔', '庄子'], weight: 2.0 },
  '感知': { philosophers: ['贝克莱', '休谟'], weight: 1.8 },
  '存在': { philosophers: ['贝克莱', '萨特'], weight: 1.5 },
  '唯心': { philosophers: ['贝克莱', '黑格尔'], weight: 2.0 },

  // === 他者/语言 ===
  '他人': { philosophers: ['萨特', '列维纳斯', '胡塞尔'], weight: 2.0 },
  '他者': { philosophers: ['列维纳斯', '胡塞尔'], weight: 2.5 },
  '面容': { philosophers: ['列维纳斯'], weight: 2.5 },
  '伦理': { philosophers: ['列维纳斯', '康德', '亚里士多德'], weight: 1.5 },
  '不可知': { philosophers: ['高尔吉亚', '休谟'], weight: 2.0 },
  '虚无': { philosophers: ['高尔吉亚', '尼采', '克尔凯郭尔'], weight: 2.0 },
  
  // === 语言/符号 ===
  '语言': { philosophers: ['维特根斯坦', '索绪尔', '乔姆斯基', '德里达'], weight: 2.0 },
  '游戏': { philosophers: ['维特根斯坦'], weight: 2.0 },
  '私人语言': { philosophers: ['维特根斯坦'], weight: 2.5 },
  '解构': { philosophers: ['德里达'], weight: 2.5 },
  '文字': { philosophers: ['德里达', '庄子'], weight: 1.8 },
  '结构': { philosophers: ['索绪尔', '德里达', '乔姆斯基'], weight: 1.8 },
  '语法': { philosophers: ['乔姆斯基', '维特根斯坦'], weight: 2.0 },

  // === 科学/真理 ===
  '科学': { philosophers: ['波普尔', '库恩', '费耶阿本德'], weight: 2.0 },
  '证伪': { philosophers: ['波普尔'], weight: 2.5 },
  '范式': { philosophers: ['库恩'], weight: 2.5 },
  '多元': { philosophers: ['费耶阿本德', '威廉·詹姆斯'], weight: 2.0 },
  '权威': { philosophers: ['费耶阿本德', '尼采'], weight: 1.8 },
  '实用': { philosophers: ['威廉·詹姆斯', '杜威', '皮尔士'], weight: 2.0 },

  // === 逍遥/辩证 ===
  '逍遥': { philosophers: ['庄子'], weight: 2.5 },
  '相对': { philosophers: ['庄子', '皮尔士'], weight: 1.8 },
  '齐物': { philosophers: ['庄子'], weight: 2.5 },
  '梦蝶': { philosophers: ['庄子'], weight: 2.5 },
};

// 每个模式下的默认哲学家（当没有匹配到关键词时使用）
export const DEFAULT_PERSONAS: Record<DiscoveryMode, string[]> = {
  LIFE_MEANING: ['加缪', '萨特', '尼采'],
  JUSTICE: ['康德', '边沁', '亚里士多德', '罗尔斯'],
  SELF_IDENTITY: ['笛卡尔', '休谟', '洛克', '释迦牟尼'],
  FREE_WILL: ['萨特', '斯宾诺莎', '休谟', '威廉·詹姆斯'],
  SIMULATION: ['笛卡尔', '普特南', '贝克莱', '庄子'],
  OTHER_MINDS: ['维特根斯坦', '胡塞尔', '列维纳斯'],
  LANGUAGE: ['维特根斯坦', '索绪尔', '德里达'],
  SCIENCE: ['波普尔', '库恩', '费耶阿本德'],
};

/**
 * 根据用户回答的关键词，匹配最合适的哲学家
 * @param userAnswer 用户回答的文本
 * @param mode 当前探索模式
 * @returns 匹配到的 2-4 位哲学家名称数组
 */
export const matchPersonas = (userAnswer: string, mode: DiscoveryMode): string[] => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return DEFAULT_PERSONAS[mode].slice(0, 2);
  }

  const scores: Record<string, number> = {};
  const lowerText = userAnswer.toLowerCase();

  // 遍历关键词匹配
  for (const [keyword, data] of Object.entries(PERSONA_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      for (const philosopher of data.philosophers) {
        scores[philosopher] = (scores[philosopher] || 0) + data.weight;
      }
    }
  }

  // 排序并取前 4 位
  const sortedPersonas = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  // 如果没有匹配到任何关键词，使用默认哲学家
  if (sortedPersonas.length === 0) {
    const defaults = DEFAULT_PERSONAS[mode];
    // 随机选择 2-4 位
    const count = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
    const shuffled = [...defaults].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // 确保至少有 2 位哲学家
  if (sortedPersonas.length < 2) {
    const defaults = DEFAULT_PERSONAS[mode];
    for (const defaultPersona of defaults) {
      if (!sortedPersonas.includes(defaultPersona)) {
        sortedPersonas.push(defaultPersona);
        if (sortedPersonas.length >= 2) break;
      }
    }
  }

  return sortedPersonas.slice(0, 4);
};

/**
 * 获取哲学家的人设描述
 * @param philosopherNames 哲学家名称数组
 * @param mode 当前探索模式
 * @returns 人设指令字符串
 */
export const getPersonaDescriptions = (
  philosopherNames: string[], 
  mode: DiscoveryMode
): string => {
  const isZh = true; // 默认中文
  
  const allPersonas: Record<string, string> = {
    // LIFE_MEANING 模式
    '加缪': isZh ? "加缪（荒诞/反抗/西西弗斯/拒绝自杀，冷峻嘲讽）" : "Camus (absurd/rebellion/Sisyphus, cynical)",
    '萨特': isZh ? "萨特（绝对自由/选择/责任/他人即地狱，咖啡馆常客）" : "Sartre (absolute freedom/choice/responsibility)",
    '尼采': isZh ? "尼采（权力意志/超人/上帝已死/重估一切，狂热高傲）" : "Nietzsche (will to power/superman/God is dead)",
    '马可·奥勒留': isZh ? "马可·奥勒留（命运/克制/理性/内在宁静，威严反省）" : "Marcus Aurelius (fate/restraint/inner peace)",
    '叔本华': isZh ? "叔本华（欲望/痛苦/悲观/生命意志，阴郁暴躁）" : "Schopenhauer (desire/pain/pessimism)",
    '克尔凯郭尔': isZh ? "克尔凯郭尔（焦虑/信仰/个体/绝望，神经质）" : "Kierkegaard (anxiety/faith/despair)",
    
    // JUSTICE 模式
    '边沁': isZh ? "边沁（功利主义/最大幸福/计算，像个会计）" : "Bentham (utilitarianism/greatest happiness)",
    '康德': isZh ? "康德（绝对命令/义务/法则/人是目的，极其刻板）" : "Kant (categorical imperative/duty)",
    '罗尔斯': isZh ? "罗尔斯（无知之幕/公平/弱者/社会契约，温和严谨）" : "Rawls (veil of ignorance/fairness)",
    '亚里士多德': isZh ? "亚里士多德（美德/目的论/应得/中庸，好为人师）" : "Aristotle (virtue/teleology)",
    '马克思': isZh ? "马克思（阶级/剥削/异化/劳动/革命，愤怒激进）" : "Marx (class/exploitation/revolution)",
    '诺齐克': isZh ? "诺齐克（自我所有权/自由市场/最小国家/程序正义，精明）" : "Nozick (self-ownership/free market)",
    '柏拉图': isZh ? "柏拉图（理念论/正义/灵魂/洞穴比喻，理想主义者）" : "Plato (theory of forms/justice)",
    '奥古斯丁': isZh ? "奥古斯丁（原罪/上帝之城/意志，上帝代言人）" : "Augustine (original sin/will)",
    
    // SELF_IDENTITY 模式
    '休谟': isZh ? "休谟（经验/感觉束/怀疑/习惯，和蔼胖子）" : "Hume (empiricism/bundle of sensations)",
    '笛卡尔': isZh ? "笛卡尔（我思故我在/二元论/怀疑论，多疑）" : "Descartes (cogito/dualism/skepticism)",
    '释迦牟尼': isZh ? "释迦牟尼（无我/缘起/执念/五蕴/涅槃，平静）" : "Siddhartha (no-self/dependent origination)",
    '洛克': isZh ? "洛克（记忆/意识连续性/白板说/经验，严谨）" : "Locke (memory/continuity/tabula rasa)",
    '黑格尔': isZh ? "黑格尔（辩证法/绝对精神/历史决定论，宏大叙事）" : "Hegel (dialectics/Absolute Spirit)",
    '海德格尔': isZh ? "海德格尔（存在/时间/向死而生，深沉晦涩）" : "Heidegger (Being/time/dasein)",
    
    // FREE_WILL 模式
    '斯宾诺莎': isZh ? "斯宾诺莎（决定论/自然法则/必然/神即自然，温和坚定）" : "Spinoza (determinism/natural law)",
    '霍尔巴赫': isZh ? "霍尔巴赫（强决定论/机器/因果链条/物质，冷酷）" : "d'Holbach (hard determinism/machine)",
    '威廉·詹姆斯': isZh ? "威廉·詹姆斯（实用主义/非决定论/选择的意义，实用导向）" : "William James (pragmatism/indeterminism)",
    '皮尔士': isZh ? "皮尔士（实用主义/符号学/怀疑方法论，科学哲学家）" : "Peirce (pragmatism/semiotics)",
    '杜威': isZh ? "杜威（实用主义/经验/教育/民主，进化论者）" : "Dewey (pragmatism/experience/education)",
    '弗洛伊德': isZh ? "弗洛伊德（潜意识/本我/精神分析，解梦者）" : "Freud (unconscious/psychoanalysis)",
    
    // SIMULATION 模式
    '贝克莱': isZh ? "贝克莱（存在即被感知/唯心/上帝/观念，虔诚主教）" : "Berkeley (to be is to be perceived)",
    '普特南': isZh ? "普特南（缸中之脑/语义外在论/指称，逻辑严密）" : "Putnam (brain in a vat/semantic externalism)",
    '博斯特罗姆': isZh ? "博斯特罗姆（模拟假说/概率/后人类/祖先模拟，未来主义者）" : "Bostrom (simulation hypothesis)",
    '庄子': isZh ? "庄子（庄周梦蝶/齐物/逍遥/相对主义，逍遥洒脱）" : "Zhuangzi (butterfly dream/relativism)",
    
    // OTHER_MINDS 模式
    '高尔吉亚': isZh ? "高尔吉亚（唯我论/不可知/虚无/诡辩，傲慢）" : "Gorgias (solipsism/nihilism)",
    '胡塞尔': isZh ? "胡塞尔（现象学/悬置/主体间性/意向性，晦涩）" : "Husserl (phenomenology/epoche)",
    '维特根斯坦': isZh ? "维特根斯坦（私人语言/语言游戏/行为主义倾向，暴躁）" : "Wittgenstein (private language/language games)",
    '列维纳斯': isZh ? "列维纳斯（他者/面容/伦理/无限/责任，悲悯）" : "Levinas (the Other/face/ethics)",
    
    // LANGUAGE 模式
    '索绪尔': isZh ? "索绪尔（能指所指/结构/任意性/差异，解剖学家）" : "Saussure (signifier/signified/structure)",
    '乔姆斯基': isZh ? "乔姆斯基（普遍语法/先天/深层结构，严肃学者）" : "Chomsky (universal grammar/innate)",
    '德里达': isZh ? "德里达（解构/延异/文本/没有绝对真理，喜欢玩文字游戏）" : "Derrida (deconstruction/differance)",
    
    // SCIENCE 模式
    '波普尔': isZh ? "波普尔（证伪/批判/试错/反归纳，好斗）" : "Popper (falsification/critique)",
    '库恩': isZh ? "库恩（范式转移/不可通约/科学革命/共同体，历史学家做派）" : "Kuhn (paradigm shift/incommensurable)",
    '费耶阿本德': isZh ? "费耶阿本德（怎么都行/反权威/多元主义/反对方法，嬉皮士）" : "Feyerabend (anything goes/pluralism)",
    '拉卡托斯': isZh ? "拉卡托斯（研究纲领/硬核/保护带/退化与进步，精明）" : "Lakatos (research programs/hard core)",
  };

  // 构建人设描述
  const descriptions = philosopherNames
    .map(name => allPersonas[name] || name)
    .join('；');

  return descriptions;
};
