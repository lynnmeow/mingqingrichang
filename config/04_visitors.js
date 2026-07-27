/* =========================================================================
 * 《明清日常》配置层 · 04 访客表（F8 重构 + 多形态 forms）
 * visitors[]    ：访客定义（名字/形象/权重/事件引用），独立配置表。
 * visitorEvents[]：事件表（求药 seek / 聊天 chat / 赠书 giftBook），按权重多选一。
 * 出现逻辑：每天 advanceDay 统一 roll 每位访客是否到场（weight/Σweight），
 *           当日已到场的在院门附近依次登场，每次从 events 按权重选一事件执行。
 *           每人每天 ≤1 次（每日只 roll 一次，天然满足）。
 * 改完刷新即生效。
 *
 * ★ 多形态(forms) —— 形态与事件【强绑定】：
 *   同名 NPC 可声明多个形态，每形态自带：
 *     · img    ：该形态立绘(npc/<id>.png)
 *     · events ：该形态【专属】对话事件 id 列表（只说这些话，绝不串到其他形态）
 *     · weight ：该形态【出现频率】权重（默认 1，等权）。调频率只改这里。
 *     · name   ：可选独立显示名（如猫形态显示“小黑(猫)”），缺省用 def.name
 *   spawn 时按 weight 抽一个形态 → 用该形态的立绘 + 该形态的对话（事件池严格锁定本形态）。
 *   未声明 forms 的访客回落为单形态（兼容旧写法：顶层 img + events）。
 *
 * ⚙️ 出现频率由你自行配置：只需调整各 form 的 weight（数值越大越常出现）；
 *    访客顶层 weight 控制“这位 NPC 是否来”，form 的 weight 控制“来了是哪副模样”。
 *
 * 注：drawVisitor 读取 def.forms[i].img 渲染真实立绘（npc/<id>.png，由 gen_imagedata.py
 *     内联进 05_imagedata.js 的 YLT_IMG_DATA 绕开网关 bug）；缺图时回落程序小人。
 *
 * ⚠️ 对话文本为【草稿】，待润色：所有对话的 who 与 text 均可按你的设定改写，
 *    事件 id / buyItem / giftBook / reward 结构保持不变即可。
 * ========================================================================= */
/* =========================================================================
 * 【配置步骤】新增访客 / 新增对话（复制下方空白示例改字段即可）
 *   1) 加访客：在 visitors[] 里新增一项。
 *        · 单形态：直接写 img + events。
 *        · 多形态：写 forms:[{ img, events, weight?, name? }, ...]，每形态自带立绘与对话。
 *   2) 加对话：在 visitorEvents[] 里按 id 新增事件。
 *        · type:"seek"  求药（需 buyItem；库存不足走 noStock）
 *        · type:"chat"  聊天（可带 giftBook:true 赠书，触发 F9 随机一章）
 *   3) 绑定：forms 里 events:[...] 填步骤2的事件 id（强绑定，只说这些话）；
 *        访客顶层 events 仅单形态使用。
 *   4) 立绘：图片放 npc/<id>.png（多形态用不同文件名），然后重跑
 *        demo/gen_imagedata.py 把图片内联进 05_imagedata.js，否则静默回落程序小人。
 *   5) 校验：buyItem 须是 02_items.js 图鉴里已有的丹药 id；事件 id 全局唯一；
 *        who 与 def.name / form.name 保持一致观感。
 *
 * 【空白示例】
 *   // —— 新增「单形态」访客 + 其对话 ——
 *   { id:"v_new", name:"新访客", weight:5, img:"npc/new.png",
 *     events:["e_new_buy","e_new_chat"] },
 *   // —— 新增「多形态」访客（每形态独立立绘 + 对话）——
 *   { id:"v_new2", name:"新访客二", weight:5, forms:[
 *       { img:"npc/new2a.png", weight:1, events:["e_new2a_buy","e_new2a_chat"] },
 *       { img:"npc/new2b.png", weight:1, name:"新访客二(形态B)", events:["e_new2b_buy","e_new2b_chat"] },
 *   ]},
 *   // —— 对应事件定义（seek 求药 / chat 聊天赠书）——
 *   { id:"e_new_buy", type:"seek", weight:3, buyItem:"hulingdan",
 *     dialog:[{ who:"新访客", text:"……求一枚护灵丹。" }],
 *     noStock:[{ who:"新访客", text:"……今日没货，改日再来。" }],
 *     reward:{ affinity:1, diary:"新访客来买护灵丹。" } },
 *   { id:"e_new_chat", type:"chat", weight:2, giftBook:true,
 *     dialog:[{ who:"新访客", text:"……闲话一二。" }],
 *     reward:{ affinity:1, diary:"新访客留下闲谈。" } },
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.visitors = [
  // 无限：3 套立绘（年号，爆米花，收音师）
  { id:"v_wuxian",  name:"无限",   weight:15, forms:[
      { img:"npc/wuxian.png",  weight:8, events:["e_wuxian_buy","e_wuxian_chat"] },
      { img:"npc/wuxian2.png", weight:1, events:["e_wuxian2_buy","e_wuxian2_chat"] },
      { img:"npc/wuxian3.png", weight:1, events:["e_wuxian3_buy","e_wuxian3_chat"] },
  ]},
  // 张忠烨：单一立绘
  { id:"v_zhang",   name:"张忠烨", weight:5,  img:"npc/zhangzhongye.png", events:["e_zhang_buy","e_zhang_chat"] },
  // 池年：单一立绘
  { id:"v_chinian", name:"池年",   weight:10,  img:"npc/chinian.png",     events:["e_chinian_buy","e_chinian_chat","e_chinian_herb"] },
  // 小黑：5 套立绘（电影票，可乐，导演，蹲猫，跳猫）
  { id:"v_xiaohei", name:"小黑",   weight:20, forms:[
      { img:"npc/xiaohei.png",      weight:1, events:["e_xiaohei_buy","e_xiaohei_chat","e_xiaohei_flower"] },
      { img:"npc/xiaohei2.png",     weight:1, events:["e_xiaohei2_buy","e_xiaohei2_chat"] },
      { img:"npc/xiaohei3.png",     weight:1, events:["e_xiaohei3_buy","e_xiaohei3_chat"] },
      { img:"npc/xiaohei_mao.png",  weight:2, name:"小黑(猫)", events:["e_xiaohei_mao_chat"] },
      { img:"npc/xiaohei_mao2.png", weight:2, name:"小黑(猫)", events:["e_xiaohei_mao2_chat"] },
  ]},
  // 鹿野：2 套立绘（经典，演员）
  { id:"v_luye",    name:"鹿野",   weight:40, forms:[
      { img:"npc/luye.png",  weight:3, events:["e_luye_buy","e_luye_chat","e_luye_flower"] },
      { img:"npc/luye2.png", weight:1, events:["e_luye2_buy","e_luye2_chat"] },
  ]},
  // 西木子：单一立绘
  { id:"v_ximuzi",  name:"西木子", weight:10,  img:"npc/ximuzi.png",     events:["e_ximuzi_buy","e_ximuzi_chat"] },
];

window.YLT_CFG.visitorEvents = [
  /* ---------------- 无限 ---------------- */
  { id:"e_wuxian_buy", type:"seek", weight:3, buyItem:"hulingdan",
    dialog:[{ who:"无限", text:"小黑嚷嚷着想当执行者出任务，特来向二位求一枚解毒丹给他防身。" }],
    noStock:[{ who:"无限", text:"今日没有吗？那在下改日再来叨扰。" }],
    reward:{ affinity:1, diary:"无限来给徒弟买护灵丹。" } },
  { id:"e_wuxian_chat", type:"chat", weight:10,
    dialog:[{ who:"无限", text:"顺路来瞧瞧你们，一起去吃肘子吗？" }],
    reward:{ affinity:0 } },
  // 无限·形态2（草稿）
  { id:"e_wuxian2_buy", type:"seek", weight:10, buyItem:"tianlingdan",
    dialog:[{ who:"无限", text:"鹿野做事有些拼了，想求些方便疗伤回复身体的丹药给她。" }],
    noStock:[{ who:"无限", text:"有些不巧，在下改日再来。" }],
    reward:{ affinity:1, diary:"无限来给徒弟买天灵丹。" } },
  { id:"e_wuxian2_chat", type:"chat", weight:2,
    dialog:[{ who:"无限", text:"我和小黑主演的电影上映了，两位若是感兴趣可以看看，爆米花也好吃的。" }],
    reward:{ affinity:1 } },
  // 无限·形态3（草稿）
  { id:"e_wuxian3_buy", type:"seek", weight:2, buyItem:"lan",
    dialog:[{ who:"无限", text:"想求朵香气清雅的花摆在家中。" }],
    noStock:[{ who:"无限", text:"无妨，不急这一时，叨扰了。" }],
    reward:{ affinity:1, diary:"无限来讨了枝兰花。" } },
  { id:"e_wuxian3_chat", type:"chat", weight:2, giftBook:true,
    dialog:[{ who:"无限", text:"整理旧物发现一卷书，想来你们会喜欢。" }],
    reward:{ affinity:1, diary:"无限留下一卷书。" } },

  /* ---------------- 张忠烨 ---------------- */
  { id:"e_zhang_buy", type:"seek", weight:2, buyItem:"ningtiandan",
    dialog:[{ who:"张忠烨", text:"想求一炉有助修炼的丹药。" }],
    noStock:[{ who:"张忠烨", text:"今日没有也无妨，不急。" }],
    reward:{ affinity:1, diary:"张忠烨来买凝天丹，临行拱手道谢。" } },
  { id:"e_zhang_chat", type:"chat", weight:1, giftBook:true,
    dialog:[{ who:"张忠烨", text:"这卷书投缘，赠予二位。" }],
    reward:{ affinity:1, diary:"张忠烨留下一卷书，说是投缘。" } },

  /* ---------------- 池年 ---------------- */
  { id:"e_chinian_buy", type:"seek", weight:4, buyItem:"tianlingdan",
    dialog:[{ who:"池年", text:"见过两位大人，想为弟子们求几枚伤药防身。" }],
    noStock:[{ who:"池年", text:"没想到今日没有，打扰两位大人了，我改日再来。" }],
    reward:{ affinity:1, diary:"池年为弟子买了天灵丹。" } },
  { id:"e_chinian_chat", type:"chat", weight:2,giftBook:true,
    dialog:[{ who:"池年", text:"向两位大人问好。" }],
    reward:{ affinity:0 } },
    { id:"e_chinian_herb", type:"seek", weight:4, buyItem:"fenglingcao",
    dialog:[{ who:"池年", text:"见过两位大人，弟子们在练习提取草灵，特来求些药草。" }],
    noStock:[{ who:"池年", text:"不打紧，待两位采得，我改日再来。" }],
    reward:{ affinity:1, diary:"池年求风灵草给弟子们练习用。" } },

  /* ---------------- 小黑 ---------------- */
  { id:"e_xiaohei_buy", type:"seek", weight:4, buyItem:"biqidan",
    dialog:[{ who:"小黑", text:"明王姐姐，清凝姐姐，我想下水玩，有没有合适的丹药呀？" }],
    noStock:[{ who:"小黑", text:"暂时没有吗？那我先回去啦。" }],
    reward:{ affinity:1, diary:"小黑来买闭气丹。" } },
  { id:"e_xiaohei_chat", type:"chat", weight:2,giftBook:true,
    dialog:[{ who:"小黑", text:"我和师父主演的大电影上映啦，这是电影票，师父让我送来~" }],
    reward:{ affinity:0 } },
    // 小黑·买花（草稿）
    { id:"e_xiaohei_flower", type:"seek", weight:2, buyItem:"shaoyao",
    dialog:[{ who:"小黑", text:"清凝姐姐~我想要一朵第一好看的花~" }],
    noStock:[{ who:"小黑", text:"没有呀……那我先回去啦，下次再来看花~" }],
    reward:{ affinity:1, diary:"小黑来讨一朵牡丹花。" } },
  // 小黑·形态2（草稿）
  { id:"e_xiaohei2_buy", type:"seek", weight:4, buyItem:"biqidan",
    dialog:[{ who:"小黑", text:"明王大人好~有没有丹药可以让我在水下呼吸呀！" }],
    noStock:[{ who:"小黑", text:"没货啦？那我明天再来~" }],
    reward:{ affinity:1, diary:"小黑又来买闭气丹。" } },
  { id:"e_xiaohei2_chat", type:"chat", weight:2,
    dialog:[{ who:"小黑", text:"人类发明的这个黑黑还冒泡的水好好喝！" }],
    reward:{ affinity:1 } },
  // 小黑·形态3（草稿）
  { id:"e_xiaohei3_buy", type:"seek", weight:3, buyItem:"fengyucao",
    dialog:[{ who:"小黑", text:"有没有长得很好看的药草呀？" }],
    noStock:[{ who:"小黑", text:"没货呀……那我先回去啦，拜拜!" }],
    reward:{ affinity:1, diary:"小黑来买凤羽草。" } },
  { id:"e_xiaohei3_chat", type:"chat", weight:2,
    dialog:[{ who:"小黑", text:"嘿嘿，师父说如果路过，可以来看看有没有什么可以帮忙干的活儿。" }],
    reward:{ affinity:1 } },
  // 小黑·猫形态（草稿，喵系）
  { id:"e_xiaohei_mao_chat", type:"chat", weight:2,
    dialog:[{ who:"小黑(猫)", text:"喵呜~（伸懒腰）" }],
    reward:{ affinity:1 } },
  // 小黑·猫形态2（草稿，喵系）
  { id:"e_xiaohei_mao2_chat", type:"chat", weight:2,
    dialog:[{ who:"小黑(猫)", text:"喵喵~喵~喵喵~喵~喵喵~喵喵喵~~~" }],
    reward:{ affinity:1 } },
    

  /* ---------------- 鹿野 ---------------- */
  { id:"e_luye_buy", type:"seek", weight:3, buyItem:"hulingdan",
    dialog:[{ who:"鹿野", text:"解毒的丹药要没了，来补充库存。" }],
    noStock:[{ who:"鹿野", text:"不急，我先回去了，不打扰你们的二人世界。" }],
    reward:{ affinity:1, diary:"鹿野来买护灵丹。" } },
  { id:"e_luye_chat", type:"chat", weight:2, giftBook:true,
    dialog:[{ who:"鹿野", text:"偶然拾得几页旧书，便想到了二位家中的大书架。" }],
    reward:{ affinity:1, diary:"鹿野留下几页旧书。" } },
   { id:"e_luye_flower", type:"seek", weight:2, buyItem:"lan",
    dialog:[{ who:"鹿野", text:"有没有能强化毒物效果的药草？" }],
    noStock:[{ who:"鹿野", text:"无妨，我过两日再来。" }],
    reward:{ affinity:1, diary:"鹿野来买曲晶。" } },
  // 鹿野·形态2（草稿）
  { id:"e_luye2_buy", type:"seek", weight:3, buyItem:"ningtiandan",
    dialog:[{ who:"鹿野", text:"顺路，正好来给徒弟买点帮助修炼的丹药。" }],
    noStock:[{ who:"鹿野", text:"暂缺？那我过两日再来。" }],
    reward:{ affinity:1, diary:"鹿野来买凝天丹。" } },
  { id:"e_luye2_chat", type:"chat", weight:2,
    dialog:[{ who:"鹿野", text:"这身造型怎么样？感觉妖精和人类看到我都在偷偷尖叫。" }],
    reward:{ affinity:1 } },

  /* ---------------- 西木子 ---------------- */
  { id:"e_ximuzi_buy", type:"seek", weight:3, buyItem:"ningtiandan",
    dialog:[{ who:"西木子", text:"不知可有草灵无需密封保存的药草出售？，劳烦二位大人了。" }],
    noStock:[{ who:"西木子", text:"原来不巧，改日再来叨扰。" }],
    reward:{ affinity:1, diary:"西木子买走灵心草，笑吟吟离去。" } },
  { id:"e_ximuzi_chat", type:"chat", weight:2,
    dialog:[{ who:"西木子", text:"这院子看着便舒服，二位不愧是治愈系，连花木照料得颇好。" }],
    reward:{ affinity:1 } },

];
