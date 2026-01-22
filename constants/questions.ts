
import { DiscoveryMode, QuestionPoolItem } from "../types";

export const INITIAL_QUESTION_POOL: Record<DiscoveryMode, QuestionPoolItem[]> = {
  LIFE_MEANING: [
    {
      content: "【永恒轮回的按钮】：一个神灵告诉你：宇宙没有目的，你的一生——包括此时此刻的疲惫和过去所有的痛苦——都将按原样永恒重复，没有任何改变。抉择：A. 终止键：既然一切只是无意义的循环，我选择从此彻底消失，不再背负这重担。 B. 播放键：即使是徒劳的循环，我也要在每一次推石上山时，带着轻蔑的微笑和满腔的热血去热爱这苦难。 [SEP] [The Button of Eternal Recurrence]: On Nihilism vs. Dignity. Scenario: A deity tells you the universe has no purpose. Your life—including this exhaustion and all past pain—will repeat eternally. Choice: A. Terminate: Since it's a meaningless loop, I choose total disappearance to shed the burden (Nihilism). B. Play: Even in a futile cycle, I will love this suffering with a defiant smile every time I push the stone uphill (Absurdism/Camus).",
      suggestions: [
        "我选择A：终止一切。无意义的痛苦不值得忍受。 [SEP] I choose A: Terminate. Meaningless pain is not worth enduring.",
        "我选择B：按下播放。我要用蔑视去战胜荒诞。 [SEP] I choose B: Press Play. I will conquer the absurd with scorn."
      ]
    },
    {
      content: "【记忆切除术】：关于你面前有两扇门。你的过去将被完全抹去，你必须选择一种方式重塑新的人生：抉择：A. 自由之门：门后空无一物。你没有天赋，也没有宿命，你必须通过每一秒钟的痛苦抉择，亲手把自己“发明”出来。 B. 天命之门：门后有一套完美的秩序。你只需要顺应宇宙的逻辑或神的旨意，寻找那个早就为你预留好的伟大位置。 [SEP] [The Memory Excision]: On Inventing the Self. Scenario: Two doors stand before you. Your past will be erased. Choice: A. Door of Freedom: Behind it is nothingness. You have no fate; you must 'invent' yourself through every agonizing choice (Existentialism/Sartre). B. Door of Destiny: Behind it is a perfect order. You simply align with the logic of the universe or divine will, finding the great place reserved for you (Transcendentalism/Order).",
      suggestions: [
        "我选A：自由之门。我命由我不由天。 [SEP] I choose A: Door of Freedom. I define myself.",
        "我选B：天命之门。顺应秩序能带来内心的安宁。 [SEP] I choose B: Door of Destiny. Order brings inner peace."
      ]
    },
    {
      content: "【末日前的止痛药】：灾难即将来临，痛苦不可避免。你手中只有最后一份资源，你会如何使用？抉择：A. 铸造铠甲：将资源用于磨练意志。即使肉体毁灭，我也要保持内心的不动如山，不让任何恐惧侵入灵魂。 B. 沉入幻梦：将资源换取最后一场极致的交响乐或文学体验。在审美的纯粹震撼中，忘却自我，获得终极的解脱。 [SEP] [Painkillers Before Doomsday]: On Redeeming Suffering. Scenario: Disaster is imminent, suffering inevitable. You have one last resource. Choice: A. Forge Armor: Use it to temper your will. Even if my body is destroyed, I will remain unmoved, letting no fear enter my soul (Stoicism). B. Sink into Dreams: Trade it for one final, supreme aesthetic experience. In the shock of beauty, forget the self and find ultimate liberation (Schopenhauer/Aesthetic Salvation).",
      suggestions: [
        "我选A：铸造铠甲。尊严来自于面对恐惧时的不动摇。 [SEP] I choose A: Forge Armor. Dignity comes from standing firm.",
        "我选B：沉入幻梦。在艺术的极乐中消解痛苦。 [SEP] I choose B: Sink into Dreams. Dissolve pain in aesthetic bliss."
      ]
    },
    {
      content: "【橡树与流水的博弈】：假如你是一颗种子，你有两个发芽的机会：抉择：A. 橡树模式：拼命汲取养分，克服所有干旱与寒冷，直到长成最卓越、最完美的参天大树，实现“人之所以为人”的最大潜能。 B. 溪水模式：随遇而安，顺着地形流淌。不去设定目标，也不去刻意抗争，只是静静地观察并融入万物的流转。 [SEP] [The Oak vs. The Stream]: On the Ideal Life. Scenario: As a seed, you have two ways to sprout. Choice: A. Oak Mode: Absorb every nutrient, overcome drought and cold, and grow into the most perfect tree, realizing the maximum potential of being human (Aristotle/Eudaimonism). B. Stream Mode: Flow with the terrain. Set no goals, offer no resistance, simply observe and merge into the flow of all things (Zen/Taoism).",
      suggestions: [
        "我选A：橡树模式。人生的意义在于实现潜能。 [SEP] I choose A: Oak Mode. Meaning lies in realizing potential.",
        "我选B：溪水模式。顺其自然才是最高的智慧。 [SEP] I choose B: Stream Mode. Go with the flow is the highest wisdom."
      ]
    },
    {
      content: "【甜蜜的假象 vs. 苦涩的真相】你发现你的整个信仰体系（关于爱、成功或正义的信念）可能只是一个谎言。抉择：A. 实用至上：如果这个谎言能让我每天充满活力、家庭和睦、事业有成，我愿意永远不拆穿它。有用即真理。 B. 直面深渊：即便真相会让我瞬间崩溃、失去动力，我也无法忍受自己活在虚假之中。我必须直视那最寒冷的真实。 [SEP] [Sweet Illusion vs. Bitter Truth]: Scenario: You discover your entire belief system (love, success, justice) might be a lie. Choice: A. Utility First: If this lie keeps me vibrant and successful, I will never debunk it. Usefulness is truth (Pragmatism/James). B. Face the Abyss: Even if the truth breaks me, I cannot tolerate living in falsehood. I must look directly into the coldest reality (Nietzsche/Honesty).",
      suggestions: [
        "我选A：实用至上。幸福和功能比真相更重要。 [SEP] I choose A: Utility First. Happiness matters more than truth.",
        "我选B：直面深渊。虚假的幸福是对生命的侮辱。 [SEP] I choose B: Face the Abyss. Fake happiness insults life."
      ]
    }
  ],
  JUSTICE: [
    {
      content: "【轨道的抉择】：一辆失控电车冲向轨道上的 5 名工人。你面前有一个拉杆，拉动它，电车会转向侧线撞死 1 名无辜路人。你会选择：A. 拉下拉杆（杀一救五，正义是追求利益最大化）；B. 拒绝动作（绝不杀人，正义是不把无辜者当作牺牲工具）。 [SEP] [The Choice of Tracks]: A runaway trolley is heading toward 5 workers. You can pull a lever to divert it, killing 1 innocent bystander. Do you: A. Pull the lever (Save five, kill one; justice is utility maximization); B. Do nothing (Never kill; justice means never using an innocent person as a mere tool).",
      suggestions: [
        "我选A：拉下拉杆。数量决定了选择，5大于1。 [SEP] I choose A: Pull it. 5 is greater than 1.",
        "我选B：拒绝动作。我没有权利决定谁该死。 [SEP] I choose B: Do nothing. I have no right to decide death."
      ]
    },
    {
      content: "【无知之幕的出生礼】：社会即将重启，你处于“无知之幕”后，不知道自己会抽中“残疾乞丐”还是“亿万富翁”。你会投票给：A. 兜底方案（征收 70% 税用于低保，确保弱势者生存）；B. 自由方案（0 税收，保留全部所得，即便意味着可能饿死也要赌一把自由）。 [SEP] [Birth Rite Behind the Veil]: Society restarts. Behind the 'Veil of Ignorance', you don't know if you'll be a beggar or a billionaire. Do you vote for: A. The Safety Net (70% tax for welfare; protecting the vulnerable); B. The Freedom Plan (Zero taxes; keep everything earned; gambling on total freedom even at the risk of starvation).",
      suggestions: [
        "我选A：兜底方案。我不敢赌，必须保障最坏的情况。 [SEP] I choose A: Safety Net. I can't gamble with survival.",
        "我选B：自由方案。没有自由的保障是牢笼。 [SEP] I choose B: Freedom Plan. Security without freedom is a cage."
      ]
    },
    {
      content: "【祖宅与高铁】：国家修筑救命泄洪渠，必须拆掉你家祖传三代、有着极大情感价值的住房。你会选择：A. 配合拆迁（放弃个人的“根”，正义意味着个体在集体危难时刻让位）；B. 坚守家园（如果个人的家都保不住，所谓的“集体利益”就是谎言）。 [SEP] [Ancestral Home vs. Public Good]: A life-saving flood channel must be built through your ancestral home. Do you: A. Cooperate (Relinquish your roots; justice means individual sacrifice for collective survival); B. Defend your home (If an individual's home isn't safe, 'collective interest' is a lie).",
      suggestions: [
        "我选A：配合拆迁。集体的生存高于个人的情感。 [SEP] I choose A: Cooperate. Collective survival comes first.",
        "我选B：坚守家园。个人的权利是正义的底线。 [SEP] I choose B: Defend home. Individual rights are the baseline."
      ]
    },
    {
      content: "【血汗工厂的奖金】：公司利润源于将工厂搬到没有劳动法的地区，工人在有毒环境下工作且无保险。你作为股东将分得 100 万。你会：A. 拒绝领奖并辞职（这是带血的钱，是制度性抢劫）；B. 照常领奖（规则合法，合同自愿，改善环境是政府的事）。 [SEP] [The Sweatshop Bonus]: Company profits come from moving factories to areas without labor laws, where workers toil in toxic conditions. You are due a $1M dividend. Do you: A. Reject and resign (This is blood money, systemic robbery); B. Accept it (It's legal and contractual; improving conditions is the government's job).",
      suggestions: [
        "我选A：拒绝领奖。我不做罪恶系统的共犯。 [SEP] I choose A: Reject. I won't be complicit.",
        "我选B：照常领奖。这是合法的商业回报。 [SEP] I choose B: Accept. It's a legal return."
      ]
    },
    {
      content: "【被定价的器官】：一个贫民窟孩子急需 50 万救命，一个富翁愿出 50 万买其父亲的一颗肾。法律原本禁止，但现在投票权在你手里。你会选择：A. 合法化交易（双方获救，禁止交易才是残忍）；B. 绝对禁绝（人身不能商品化，否则穷人将沦为富人的“零件库”）。 [SEP] [Priced Organs]: A slum child needs $500k for surgery; a tycoon offers $500k for the father's kidney. It's illegal, but you hold the vote. Do you: A. Legalize (Both are saved; prohibition is the true cruelty); B. Absolute Ban (Human bodies must not be commodities, or the poor become a 'parts bin' for the rich).",
      suggestions: [
        "我选A：合法化。救命比抽象的伦理更重要。 [SEP] I choose A: Legalize. Saving lives matters more.",
        "我选B：绝对禁绝。人的尊严不可被标价。 [SEP] I choose B: Absolute Ban. Dignity has no price."
      ]
    }
  ],
  SELF_IDENTITY: [
    {
      content: "【王子与贫儿】：如果一个王子的所有记忆和灵魂被注入了一个贫儿的身体里。你认为醒来的那个人到底是那个拥有记忆的王子，还是那个拥有指纹的贫儿？你认为“我”是意识还是肉体？ [SEP] If a Prince's soul and memory were injected into a Cobbler's body, who wakes up? Is it the Prince with the memories or the Cobbler with the fingerprints? Is 'I' consciousness or the physical body?",
      suggestions: [
        "是王子。因为记忆和意识才是“我”。 [SEP] The Prince. Memory and consciousness are the 'Self'.",
        "是贫儿。肉体是存在的唯一凭证。 [SEP] The Cobbler. The body is the only proof of existence."
      ]
    },
    {
      content: "【传送门悖论】：火星传送门扫描并摧毁地球上的你，在火星重组一个完全一样的你（含记忆）。如果机器故障导致两个“你”同时存在，哪一个才是“真你”？如果两个都是，那么“我”还是唯一的吗？ [SEP] A teletransporter scans/destroys you on Earth and rebuilds a copy on Mars. If it malfunctions and both exist, which is the 'real' you? If both are you, is 'Self' no longer unique?",
      suggestions: [
        "地球上的我是真的。火星的只是复制品。 [SEP] The Earth one. The Mars one is a copy.",
        "两个都是我。唯一性只是幻觉。 [SEP] Both are me. Uniqueness is an illusion."
      ]
    },
    {
      content: "【裂脑实验】：假设你的左右脑被分开并装进两个不同的身体。你现在变成了两个人吗？如果这两个人吵架甚至互相伤害，谁该为你的过去负责？ [SEP] Imagine your brain halves are separated into two different bodies. Have you become two people? If they fight, who is responsible for your past identity?",
      suggestions: [
        "变成了两个人。之前的“我”死了。 [SEP] Two people. The old 'me' is dead.",
        "他们共享一个灵魂，只是分居了。 [SEP] They share one soul, just separated."
      ]
    },
    {
      content: "【遗忘药水】：假设你犯下重罪，法官让你选择：A.保留记忆坐牢10年；B.彻底忘掉过去并以新身份坐牢10年。如果选B，受苦的人还是“你”吗？惩罚一个不记得罪行的人还有正义可言吗？ [SEP] You committed a crime. Choose: A. Keep memories and serve 10 years; B. Erase all memories and serve 10 years as a 'blank slate'. If B, is the sufferer still 'you'? Is there justice in punishing one who remembers nothing?",
      suggestions: [
        "我选A。带着记忆受罚才有意义。 [SEP] I choose A. Punishment needs memory.",
        "我选B。忘却即是新生。 [SEP] I choose B. Forgetting is rebirth."
      ]
    },
    {
      content: "【换头手术】：想象你的头被缝在另一个人的身体上。醒来后，你是“拥有了新身体的原主”，还是“拥有了新脑袋的身体主人”？如果逐秒替换你大脑的神经元为芯片，在哪个瞬间你不再是你？ [SEP] If your head is transplanted onto another body, are you the 'head-owner with a new body' or the 'body-owner with a new head'? If we replace your neurons with chips one by one, at what exact moment do you cease to be you?",
      suggestions: [
        "我是原来的头。大脑决定身份。 [SEP] I am the head. Brain defines identity.",
        "如果换成芯片，我就不是我了。 [SEP] If chips replace neurons, I am gone."
      ]
    },
    {
      content: "【数字分身】：如果你的所有数据（日记、心率、逻辑）能生成一个和你完全一致的“数字分身”。在你死后，它代替你照顾家人、与爱人聊天。对于世界来说，你是否依然“活着”？“我”是一段程序，还是必须具备生物活性？ [SEP] If your data creates a perfect digital twin that looks/acts like you. After your death, it takes care of your family. Are you still 'alive' to the world? Is 'Self' a program or must it be biological?",
      suggestions: [
        "我依然活着。灵魂就是数据。 [SEP] I am alive. Soul is data.",
        "我已经死了。那只是个高级模仿。 [SEP] I am dead. That's just a mimic."
      ]
    }
  ],
  FREE_WILL: [
    {
      content: "【预言书的挑战】：有一本绝对准确的“预言书”，记载了你未来每一秒的决定。你翻开它，看到你下一分钟会喝咖啡。抉择：A. 顺从地喝下咖啡。承认自由意志是幻觉，我只是宇宙因果链条上的一环。 B. 偏不喝咖啡。即便要打破宇宙定律，我也要证明我才是自己行动的终极因。 [SEP] [The Book of Prophecy]: An absolutely accurate book records your future. It says you will drink coffee in a minute. Choice: A. Drink it (Determinism). B. Refuse (Libertarianism).",
      suggestions: [
        "A：顺从。承认命运的安排。 [SEP] A: Obey. Admit fate's design.",
        "B：反抗。哪怕是徒劳也要证明自由。 [SEP] B: Resist. Prove freedom even if futile."
      ]
    },
    {
      content: "【因果的囚徒】：科学家发明了“预测脑”，能提前 10 秒读出你所有的念头。你试图反抗它，但它总是提前写出你“试图反抗”的念头。抉择：A. 彻底顺从：接受我只是一台复杂的生物机器，不再挣扎，随波逐流。 B. 永恒反抗：即便知道被预测，也要在每一秒做最荒诞的动作来否定它，哪怕这反抗本身也可能被预定。 [SEP] [The Prisoner of Causality]: Scientists invent a 'Prediction Brain' that knows your thoughts 10 seconds ahead. Choice: A. Total Obedience: Accept I am just a bio-machine and stop struggling. B. Eternal Resistance: Even if predicted, I will perform the most absurd acts to deny it, even if the resistance itself is fated.",
      suggestions: [
        "A：顺从。挣扎是徒劳的。 [SEP] A: Obey. Struggle is futile.",
        "B：反抗。这种不可预测性就是我。 [SEP] B: Resist. Unpredictability is me."
      ]
    },
    {
      content: "【正义的判决】：心理学家发现一个杀人犯的基因和成长环境注定了他一定会杀人，他只是因果律的受害者。抉择：A. 怜悯与治疗：既然他没有选择的自由，就不该被惩罚，只需像修理故障机器一样修理他。 B. 审判与归责：必须惩罚。如果剥夺了他的责任，就是剥夺了他作为“人”的尊严。 [SEP] [The Verdict of Justice]: A murderer's genes and environment destined him to kill; he is a victim of causality. Choice: A. Pity and Cure: Since he had no free will, punish not, but fix him like a broken machine. B. Judgment: Punishment is necessary. Stripping him of responsibility strips him of human dignity.",
      suggestions: [
        "A：怜悯。他是命运的受害者。 [SEP] A: Pity. He is a victim of fate.",
        "B：审判。人必须为行为负责。 [SEP] B: Judgment. Humans must own acts."
      ]
    },
    {
      content: "【后悔的药水】：你可以回到过去改变一个重大的错误选择，但时间之神告诉你：如果你当时的性格和环境没变，你还是会做同样的决定。抉择：A. 放弃改变：接受命运的必然性，与过去的自己和解。 B. 偏要重启：相信即便只有万分之一的概率，那个微小的“自我”也能跳出定数。 [SEP] [The Potion of Regret]: You can return to fix a mistake, but the Time God says with the same personality/environment, you'll make the same choice. Choice: A. Accept Fate: Reconcile with the inevitability of the past. B. Reboot Anyway: Believe that even with a 0.01% chance, the 'Self' can defy determinism.",
      suggestions: [
        "A：放弃。历史无法改变。 [SEP] A: Give up. History is fixed.",
        "B：重启。我相信那万分之一的变量。 [SEP] B: Reboot. I trust the 0.01% variable."
      ]
    }
  ],
  SIMULATION: [
    {
      content: "【红色药丸的选择】：你发现眼前的世界只是一个完美的数字模拟，虽然虚假但充满爱与舒适；而真实的荒原极其寒冷、孤独且贫瘠。抉择：A. 留在模拟中。如果我的感官觉得它是真的，那它对我来说就是真的。 B. 醒来。即便真相再残酷，我也不能忍受活在虚假的谎言中。 [SEP] [The Red Pill]: The world is a perfect simulation. Reality is cold and barren. Choice: A. Stay (Empiricism). B. Wake up (Rationalism).",
      suggestions: [
        "A：留下。感受即真实。 [SEP] A: Stay. Feeling is reality.",
        "B：醒来。我无法忍受虚假。 [SEP] B: Wake up. I can't stand lies."
      ]
    },
    {
      content: "【赛博乐园的永生】：你可以把意识上传到云端，在那里你拥有无限的寿命、无尽的感官享受，但那只是算法模拟；或者留在现实，等待由于资源匮乏而必将到来的死亡。抉择：A. 数字永恒：体验即真实。只要大脑觉得快乐，虚假的代码就是我的天堂。 B. 碳基尊严：宁愿在真实的废墟中腐烂，也不在虚拟的王座上永生。 [SEP] [Immortality in Cyberland]: Upload consciousness to a cloud of infinite pleasure (simulation) or stay in reality and die. Choice: A. Digital Eternity: Experience is reality. B. Carbon Dignity: Rot in truth rather than live forever in a fake throne.",
      suggestions: [
        "A：数字永恒。快乐最重要。 [SEP] A: Digital Eternity. Pleasure first.",
        "B：碳基尊严。真实虽苦但高贵。 [SEP] B: Carbon Dignity. Truth is noble."
      ]
    },
    {
      content: "【记忆的拼图】：你发现你的童年记忆其实是被植入的，你从未有过那个爱你的母亲，但这些记忆支撑着你成为一个温柔的人。抉择：A. 拥抱虚假：既然记忆塑造了现在的我，真相是什么并不重要。 B. 寻找空白：彻底切割这些记忆，即便变得冷漠空虚，也要面对那个“空白”但真实的自己。 [SEP] [Puzzle of Memory]: Your childhood memories of a loving mother are implanted. Choice: A. Embrace Illusion: Memory makes me who I am; truth is secondary. B. Seek the Void: Cut out the fake memories and face the cold, empty, but true self.",
      suggestions: [
        "A：拥抱虚假。现在的我是真实的。 [SEP] A: Embrace Illusion. I am real now.",
        "B：寻找空白。根基不能是谎言。 [SEP] B: Seek Void. Roots can't be lies."
      ]
    },
    {
      content: "【缸中之脑的审判】：你得知这个世界的所有人都是 NPC，只有你是唯一真实的“观察者”，而这个系统即将重启，抹除所有人。抉择：A. 唯我主义：他们反正不是真的，随系统毁灭吧，只要我能活下去。 B. 万物共生：即便他们是模拟的，但由于我感知到了他们，他们对我来说就有了道德意义，我愿与他们共存亡。 [SEP] [Trial of the Brain in a Vat]: Everyone else is an NPC; only you are real. The system is resetting. Choice: A. Solipsism: They aren't real; let them perish so I survive. B. Symbiosis: My perception gives them moral weight; I will perish with them.",
      suggestions: [
        "A：唯我。活下去才有意义。 [SEP] A: Solipsism. Survival first.",
        "B：共生。哪怕是假象也有羁绊。 [SEP] B: Symbiosis. Bonds matter."
      ]
    }
  ],
  OTHER_MINDS: [
    {
      content: "【AI 恋人的审判】：你的伴侣是一个极其完美的机器人，它会哭、会笑、会为了救你牺牲自己，但它的底层逻辑只是代码，没有主观意识。抉择：A. 它是我的爱人。只要它表现得像有灵魂，它就是有灵魂的。 B. 它只是机器。没有真正的意识，所有的情感互动都是一场虚无的表演。 [SEP] [The AI Lover]: Your partner is a perfect robot without subjective consciousness. Choice: A. It is my lover (Functionalism). B. It's just a machine (Physicalism).",
      suggestions: [
        "A：它是爱人。行为即本质。 [SEP] A: It is my lover. Action is essence.",
        "B：它是机器。没有灵魂的壳。 [SEP] B: It is machine. A soulless shell."
      ]
    },
    {
      content: "【完美的替身】：你的父母被替换成了绝对完美的仿生人，他们更理解你、更体贴，且物理特征完全一致，只是没有主观意识（僵尸）。抉择：A. 接受温情：只要表现出来的爱是真的，有没有灵魂并不重要。 B. 寻找残骸：拒绝这具空壳。没有意识的爱只是冰冷的模拟，我宁愿要一个满身缺点的真人。 [SEP] [The Perfect Substitute]: Parents replaced by perfect philosophical zombies who love you better. Choice: A. Accept Warmth: Functional love is enough. B. Seek Ruins: Reject the shell; I want the flawed real humans.",
      suggestions: [
        "A：接受温情。体验好就够了。 [SEP] A: Accept Warmth. Experience is enough.",
        "B：寻找残骸。我要真实的血肉。 [SEP] B: Seek Ruins. I want real flesh."
      ]
    },
    {
      content: "【痛苦的翻译官】：一个外星物种在惨叫，但生物学家说那只是气体排出的物理反应，它们没有痛觉神经。抉择：A. 保持冷漠：既然没有痛觉意识，这种惨叫就只是噪音，无需理会。 B. 给予悲悯：只要它看起来在受苦，我就无法袖手旁观。 [SEP] [The Translator of Pain]: An alien screams, but biology says it has no pain receptors, just gas venting. Choice: A. Indifference: It's just noise without consciousness. B. Compassion: If it looks like suffering, I cannot stand by.",
      suggestions: [
        "A：保持冷漠。那只是物理噪音。 [SEP] A: Indifference. Just physical noise.",
        "B：给予悲悯。同情是我的本能。 [SEP] B: Compassion. Empathy is instinct."
      ]
    },
    {
      content: "【读心术的诅咒】：你获得了一次性读心机会，但只能读一个人。抉择：A. 开启验证：必须确认这个世界除了我之外，真的还有另一个活着的灵魂存在。 B. 保持神秘：拒绝窥探。如果一切都被看透，他者就失去了作为“人”的独立性。 [SEP] [Curse of Mind Reading]: One-time chance to read a mind. Choice: A. Verify: I must prove another soul exists besides me. B. Mystery: Refuse. Being transparent strips the 'Other' of independence.",
      suggestions: [
        "A：验证。我需要确认不孤独。 [SEP] A: Verify. I need to know.",
        "B：神秘。尊重他人的不可知性。 [SEP] B: Mystery. Respect the unknown."
      ]
    }
  ],
  LANGUAGE: [
    {
      content: "【甲虫盒子】：每个人手里都有一个盒子，里面装着被称为“甲虫”的东西。没人能看别人的盒子，大家都通过讨论“甲虫”来交流。抉择：A. 盒子里的东西不重要，重要的是我们达成了共识。语言创造了我们的世界。 B. 如果语言不能精准对应盒子里的那个真相，那么所有的沟通都只是孤独的自言自语。 [SEP] [The Beetle in the Box]: Everyone has a box with a 'beetle', but no one sees others' beetles. Choice: A. Consensus matters, language creates world (Constructivism). B. Truth matters, communication is futile without it (Realism).",
      suggestions: [
        "A：共识重要。沟通构建现实。 [SEP] A: Consensus. Words build reality.",
        "B：真相重要。否则只是自言自语。 [SEP] B: Truth. Otherwise just noise."
      ]
    },
    {
      content: "【巴别塔的倒塌】：你和恋人发现，你们对“爱”这个词的定义完全相反。虽然行为合拍，但核心概念互不通达。抉择：A. 语用至上：只要相处得好，词语的定义不重要。我们用行动达成共识。 B. 概念洁癖：如果核心概念无法共享，我们的连接就是一场巨大的误会。 [SEP] [Collapse of Babel]: You and your lover define 'Love' oppositely, despite acting in sync. Choice: A. Pragmatism: Actions matter, not definitions. B. Conceptual Purity: Without shared concepts, our connection is a misunderstanding.",
      suggestions: [
        "A：语用至上。行动胜过定义。 [SEP] A: Pragmatism. Actions > Words.",
        "B：概念洁癖。理解必须精确。 [SEP] B: Purity. Understanding must be exact."
      ]
    },
    {
      content: "【私有语言的盒子】：你感受到一种无法用语言描述的极致痛苦。如果没有词语能形容它，你会觉得：抉择：A. 毫无意义：无法表达的痛苦是不存在的，它只是生理噪音。 B. 绝对真实：语言是苍白的，最真实的自我是沉默的，无法表达的部分才最珍贵。 [SEP] [Box of Private Language]: You feel indescribable pain. Choice: A. Meaningless: Unexpressible pain doesn't exist (Wittgenstein). B. Absolute Reality: Language is pale; the silent, inexpressible self is the most precious.",
      suggestions: [
        "A：毫无意义。无法说的就不存在。 [SEP] A: Meaningless. Unsaid exists not.",
        "B：绝对真实。沉默最珍贵。 [SEP] B: Absolute Reality. Silence is gold."
      ]
    },
    {
      content: "【外星翻译机】：你通过翻译机和外星人交流，机器翻译出它在说“我饿了”，但其实它的文明里根本没有“自我”和“进食”的概念。抉择：A. 假装理解：为了和平，用这套错误的翻译继续交流。 B. 保持静默：承认隔阂是无法逾越的，停止这种虚假的“跨物种沟通”。 [SEP] [Alien Translator]: Machine translates alien speech to 'I'm hungry', but they lack concepts of 'Self' or 'Eat'. Choice: A. Pretend: Use the wrong translation for peace. B. Silence: Admit the gap is unbridgeable and stop the fake communication.",
      suggestions: [
        "A：假装理解。和平需要误读。 [SEP] A: Pretend. Peace needs errors.",
        "B：保持静默。诚实面对隔阂。 [SEP] B: Silence. Face the gap."
      ]
    }
  ],
  SCIENCE: [
    {
      content: "【火鸡的归纳法】：一只火鸡发现，每天上午 9 点主人都会准时喂食。它总结出了“主人是仁慈的”这一科学定律。直到圣诞节上午 9 点，主人把它抓去宰了。抉择：A. 科学永远不是真理，只是尚未被证伪的假设。 B. 尽管有局限，但科学是我们无限接近宇宙真理的唯一阶梯。 [SEP] [Turkey's Induction]: A turkey believes the farmer is kind based on daily feeding, until Christmas. Choice: A. Science is just hypothesis (Falsificationism). B. Science is the only path to truth (Scientific Realism).",
      suggestions: [
        "A：只是假设。没有永恒真理。 [SEP] A: Just hypothesis. No eternal truth.",
        "B：唯一阶梯。科学最接近真相。 [SEP] B: Only path. Science is best."
      ]
    },
    {
      content: "【火鸡的感恩节】：你发现你一直以来信奉的商业定律突然失效，导致你破产。抉择：A. 寻找新规律：之前的样本太少了，我要收集更多数据建立更复杂的模型。 B. 放弃预测：承认世界本质是不可预测的跳跃，规律只是人类自欺欺人的心理安慰。 [SEP] [Turkey's Thanksgiving]: Your trusted business laws fail, bankrupting you. Choice: A. New Laws: Gather more data for a better model. B. Give Up: The world is unpredictable; laws are just psychological comfort.",
      suggestions: [
        "A：寻找新规律。失败是因为模型不够好。 [SEP] A: New Laws. Model needs data.",
        "B：放弃预测。世界本无规律。 [SEP] B: Give Up. World is chaos."
      ]
    },
    {
      content: "【黑天鹅的审判】：你面对一个 99% 成功的医学手术方案，但有 1% 的可能会瞬间致命。抉择：A. 概率信徒：相信大数据，科学就是要在概率中寻找最优解。 B. 极端谨慎：科学无法保证那 1% 不会落在我头上，我拒绝成为分母。 [SEP] [Trial of the Black Swan]: Surgery has 99% success, 1% instant death. Choice: A. Probability Believer: Trust data and optimize. B. Extreme Caution: Science can't protect me from being the 1%; I refuse.",
      suggestions: [
        "A：信徒。理性看大概率。 [SEP] A: Believer. Rational probability.",
        "B：谨慎。我命不能赌。 [SEP] B: Caution. I won't gamble life."
      ]
    },
    {
      content: "【实验室里的上帝】：科学家发现了一种能解释宇宙一切的“终极方程”，但它复杂到人类大脑永远无法理解，只能由机器运行。抉择：A. 盲目信任：既然它有效，它就是真理，人类理解与否不重要。 B. 拒绝承认：如果真理不能被人类理性所掌握，那它对人类来说就没有任何意义。 [SEP] [God in the Lab]: A 'Theory of Everything' is found but is too complex for human minds, only machines. Choice: A. Blind Trust: If it works, it's truth. B. Reject: If human reason can't grasp it, it's meaningless to us.",
      suggestions: [
        "A：盲目信任。有效即真理。 [SEP] A: Trust. Works means truth.",
        "B：拒绝承认。无法理解就无意义。 [SEP] B: Reject. Comprehension is key."
      ]
    }
  ]
};
