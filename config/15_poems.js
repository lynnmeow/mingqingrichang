/* =========================================================================
 * 《明清日常》配置：随机论学 / 选项事件（F9）
 * -------------------------------------------------------------------------
 * 机制：家园随机互动中，每日最多触发一次「论学」——随机一名角色提出一个
 *       选项类话题，玩家从 3 个选项中择一回答；纯氛围、不区分正误、不影响
 *       好感/剧情。话题按内容分为：
 *         cat: "poetry"   讨论诗词
 *         cat: "medicine" 讨论医书
 *       由 game.poemDoneDay 锁定「每天一次」，advanceDay 后重置允许再次触发。
 *
 * ★ 配置步骤（后续自行增删话题）
 *   1) 在 poems 数组里加/改一条对象即可，刷新即生效（无需改引擎）。
 *   2) 字段说明：
 *        who       提问者："shijie"(阎明) | "shimei"(李清凝) | "either"(随机二选一)
 *        cat       话题类型："poetry"(诗词) | "medicine"(医书)
 *        question  提问文案
 *        options   3 个选项文本
 *        reply     选中任一选项后，对方的一句反馈（纯氛围；可省略）
 *        replyWho  反馈说话人："shijie" | "shimei"（可选；缺省=提问者 who）
 *   3) 选项数量建议保持 3 个（面板按 3 个按钮排版）；如改数量，需同步改 ui.js 的 drawPoem 排版。
 *   4) 触发频率由 home.js 的 poemTimer / 触发概率控制（纯引擎侧，一般不常改）。
 *
 * ★ 空白示例（复制即用）
 *   { who: "either", cat: "poetry",
 *     question: "你最喜欢哪一句诗？",
 *     options: ["示例诗句一，", "示例诗句二，", "示例诗句三。"],
 *     reply: "（她将那一句在唇边轻轻念过，像含住一颗糖。）" },
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.poems = [
  { who: "either", cat: "poetry",
    question: "你最喜欢哪一句诗？",
    options: [
      "两情若是久长时，又岂在朝朝暮暮。",
      "愿得一心人，白首不相离。",
      "身无彩凤双飞翼，心有灵犀一点通。",
    ],
    reply: "她眉眼弯弯，将那一句诗又轻轻念了一遍。" },

  { who: "either", cat: "poetry",
    question: "你喜欢哪一句？",
    options: [
      "风烟俱净，天山共色。",
      "素月分辉，明河共影。",
      "长烟一空，皓月千里。",
    ],
    reply: "“白露暖空，素月流天”和“寒峰凝素，孤月垂清”也不错。" },

  { who: "shijie", cat: "medicine", replyWho: "shimei",
    question: "清凝，中国最早的医学典籍是哪本？",
    options: [
      "《黄帝内经》",
      "《难经》",
      "《伤寒杂病论》",
    ],
    reply: "（抱住阎明的胳膊）说：“师姐~在家里还要抽答问题嘛QAQ”" },

  { who: "shimei", cat: "medicine", replyWho: "shijie",
    question: "小明小明，嘿嘿，我问你，以下哪本是李时珍的著作？",
    options: [
      "《神农本草经》",
      "《千金方》",
      "《本草纲目》",
    ],
    reply: "（微微一笑）说：“既然你这会儿有兴致，我们又新得了本医书，不如一起读会儿书吧。”" },

  { who: "either", cat: "medicine",
    question: "辨证论治、经方鼻祖……不许看书架，是哪本书？",
    options: [
      "《伤寒杂病论》",
      "《诸病源候论》",
      "《医学源流论》",
    ],
    reply: "想来别人“赌书消得泼茶香”应当不是医书~" },

      { who: "either", cat: "medicine",
    question: "《刘涓子鬼遗方》是什么类型的书？",
    options: [
      "杂谈",
      "外科",
      "医方",
    ],
    reply: "这本医书的名字有些奇怪。" },

  // ============ 以下为多轮 + 说话示例（新格式 rounds） ============
  // 机制：rounds 为步骤序列，每步二选一：
  //   · 提问步：{ who?, question, options[3], reply, replyWho? }
  //       → 显示 question + 3 选项；选后显示 reply；点任意处进入下一步
  //   · 说话步：{ who?, speak }  （无 question/options）
  //       → 说话人说话，点任意处进入下一步
  // 整段对话的 who（either 时）只随机一次，保证主讲人连贯；某步可单独指定 who。
  // 兼容旧格式：不写 rounds、直接写 question/options/reply 的单轮条目依旧有效。

  { who: "either", cat: "poetry",
    rounds: [
      { who: "shijie", question: "清凝，与月亮有关的诗你最喜欢哪句？",
        options: ["明月几时有，把酒问青天。", "海上生明月，天涯共此时。", "玲珑望秋月，而我独徘徊。"],
        reply: "皆是好句，只是“千里共婵娟”更教人惦念。" },
      { who: "shimei", speak: "我只要和你在一起看月亮。" },
    ] },

  { who: "shimei", cat: "poetry",
    rounds: [
      { who: "shimei", question: "来对飞花令吧~花自飘零水自流。",
        options: ["梨花院落溶溶月，柳絮池塘淡淡风。","名花倾国两相欢，长得君王带笑看。", "乱花渐欲迷人眼，浅草才能没马蹄。"],
        reply: "取次花丛懒回顾，半缘修道半缘君。"},
      { who: "shijie", question: "枫叶荻花秋瑟瑟。",
        options: ["春风桃李花开日。", "待到重阳日，还来就菊花。", "年年岁岁花相似，岁岁年年人不同。"],
        reply: "忽如一夜春风来，千树万树梨花开。" },
     { who: "shimei", speak: "闲敲棋子落灯花~" },
    ] },

      { who: "shijie", cat: "poetry",
    rounds: [
      { who: "shijie", question: "今天飞花令对“月”字。",
        options: ["月上柳梢头，人约黄昏后。","月出皎兮，佼人僚兮。", "月下飞天镜，云生结海楼。"],
        reply: "缺月挂疏桐，漏断人初静。"},
      { who: "shimei", question: "沧海月明珠有泪，蓝田日暖玉生烟。",
        options: ["秦时明月汉时关", "尘中见月心亦闲", "相逢秋月满~"],
        reply: "鸡声茅店月，人迹板桥霜。" },
     { who: "shijie", speak: "江天一色无纤尘，皎皎空中孤月轮。" },
    ] },
];