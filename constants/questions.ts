
export const INITIAL_QUESTION_POOL = {
  LIFE_MEANING: [
    "【宇宙本质与虚无】：如果你确信宇宙只是一个随机产生的程序（虚无主义），你会感到‘终于不用再背负意义的重担’，还是会‘偏要在那片荒凉中活出热气腾腾的尊严’（荒诞主义）？ [SEP] If you were certain the universe is a random program (Nihilism), would you feel relieved of the burden of meaning, or would you passionately create dignity in that wasteland (Absurdism)?",
    "【意义的来源】：你认为人生最坚实的支撑点，是‘我通过每一个行动亲手发明了自己’（存在主义），还是‘我顺应了某种比我更大的真理或秩序’（超越论/斯多葛）？ [SEP] Do you find your strongest anchor in 'creating yourself through action' (Existentialism) or 'aligning with a larger, eternal truth' (Transcendentalism/Stoicism)?",
    "【痛苦的对策】：面对不可避免的苦难，你倾向于‘磨练意志，追求平静’（斯多葛），还是‘通过审美或同情来获得救赎’（悲观主义/叔本华）？ [SEP] Facing inevitable suffering, do you prefer 'hardening your will for peace' (Stoicism) or 'finding salvation through art and empathy' (Pessimism/Schopenhauer)?",
    "【行动的动机】：你认为最理想的生活是‘不断实现潜能’（幸福论/亚里士多德），还是‘不做无谓对抗，顺应自然’（东方虚实观/禅道）？ [SEP] Is your ideal life 'realizing potential' (Eudaimonism) or 'flowing naturally' (Zen/Taoism)?",
    "【真理的价值】：你会因为一种信念‘能让你过得更好’而相信它（实用主义），还是即便真相痛苦你也必须直面它（尼采式的诚实）？ [SEP] Would you believe in something because it 'works' (Pragmatism), or must you face the truth even if painful?"
  ],
  JUSTICE: [
    "【分配的起点】：想象你在出生前处于“无知之幕”后，不知道自己会是富豪还是乞丐。你会支持“绝对的市场竞争”，还是支持“资源向社会最弱势群体倾斜”？ [SEP] Behind the 'Veil of Ignorance'—not knowing if you'll be rich or poor—would you support absolute market competition or prioritize the least advantaged? (Liberal Egalitarianism vs. Libertarianism)",
    "【劳动的剩余】：当你发现你的高薪来自于对底层员工剩余价值的剥夺，而制度保护了这种剥夺。你会认为这是“合法的自由交换”，还是“必须被推翻的异化剥削”？ [SEP] If you find your high salary comes from exploiting lower employees' surplus value protected by law, is this 'legitimate free exchange' or 'alienated exploitation that must be overturned'? (Libertarianism vs. Marxism)",
    "【效用与代价】：如果牺牲一个无辜者的基本权利（如强拆其祖宅），能换来整个城市数百万人的幸福提升。你认为这种“最大化幸福”是正义的，还是认为某些权利是神圣不可侵犯的？ [SEP] If sacrificing one person's basic rights (e.g., demolishing an ancestral home) brings happiness to millions, is this 'Utility Maximization' just, or are certain rights sacred? (Utilitarianism vs. Deontology)",
    "【契约与关怀】：当面对一个无法履行社会契约的弱势者，我们应严格执行规则以维护契约精神，还是应优先考虑“人与人的依赖关系”并给予特殊关怀？ [SEP] Facing someone who cannot fulfill a social contract, should we enforce rules for 'Contractual Integrity', or prioritize 'Relationships and Care'? (Liberalism vs. Feminist Ethics of Care)",
    "【市场与道德】：你是否认同“有些东西是金钱买不到的”（如选票、荣誉、人体器官）？正义是否应当保护社会的共同价值和美德不受市场侵蚀？ [SEP] Do you believe 'some things money shouldn't buy' (e.g., votes, honor, organs)? Should justice protect 'Common Good' and virtue from market erosion? (Communitarianism)"
  ],
  SELF_IDENTITY: [
    "【王子与贫儿】：如果一个王子的所有记忆和灵魂被注入了一个贫儿的身体里。你认为醒来的那个人到底是那个拥有记忆的王子，还是那个拥有指纹的贫儿？你认为“我”是意识还是肉体？ [SEP] If a Prince's soul and memory were injected into a Cobbler's body, who wakes up? Is it the Prince with the memories or the Cobbler with the fingerprints? Is 'I' consciousness or the physical body?",
    "【传送门悖论】：火星传送门扫描并摧毁地球上的你，在火星重组一个完全一样的你（含记忆）。如果机器故障导致两个“你”同时存在，哪一个才是“真你”？如果两个都是，那么“我”还是唯一的吗？ [SEP] A teletransporter scans/destroys you on Earth and rebuilds a copy on Mars. If it malfunctions and both exist, which is the 'real' you? If both are you, is 'Self' no longer unique?",
    "【裂脑实验】：假设你的左右脑被分开并装进两个不同的身体。你现在变成了两个人吗？如果这两个人吵架甚至互相伤害，谁该为你的过去负责？ [SEP] Imagine your brain halves are separated into two different bodies. Have you become two people? If they fight, who is responsible for your past identity?",
    "【遗忘药水】：假设你犯下重罪，法官让你选择：A.保留记忆坐牢10年；B.彻底忘掉过去并以新身份坐牢10年。如果选B，受苦的人还是“你”吗？惩罚一个不记得罪行的人还有正义可言吗？ [SEP] You committed a crime. Choose: A. Keep memories and serve 10 years; B. Erase all memories and serve 10 years as a 'blank slate'. If B, is the sufferer still 'you'? Is there justice in punishing one who remembers nothing?",
    "【换头手术】：想象你的头被缝在另一个人的身体上。醒来后，你是“拥有了新身体的原主”，还是“拥有了新脑袋的身体主人”？如果逐秒替换你大脑的神经元为芯片，在哪个瞬间你不再是你？ [SEP] If your head is transplanted onto another body, are you the 'head-owner with a new body' or the 'body-owner with a new head'? If we replace your neurons with chips one by one, at what exact moment do you cease to be you?",
    "【数字分身】：如果你的所有数据（日记、心率、逻辑）能生成一个和你完全一致的“数字分身”。在你死后，它代替你照顾家人、与爱人聊天。对于世界来说，你是否依然“活着”？“我”是一段程序，还是必须具备生物活性？ [SEP] If your data creates a perfect digital twin that looks/acts like you. After your death, it takes care of your family. Are you still 'alive' to the world? Is 'Self' a program or must it be biological?"
  ]
};
