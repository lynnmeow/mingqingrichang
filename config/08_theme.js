/* =========================================================================
 * 《明清日常》配置层 · 08 主题 + 剧情 + 流程 + 庐内互动
 * 仅外观/叙事，不影响玩法。引擎 src/ 模块读取本块，缺项回退默认。
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

// 主题（水墨淡彩 · 温情）
window.YLT_CFG.theme = {
  ambient: true,            // 是否绘制飘落花瓣 / 浮光氛围粒子
  petalCount: 16,           // 粒子数量上限（控性能）
  fontTitle: '"STKaiti","KaiTi","Songti SC",serif',
  fontBody: '"PingFang SC","Microsoft YaHei",system-ui,sans-serif',
  paper:    "#efe3cf",      // 宣纸地
  paperAlt: "#e7d8be",      // 宣纸地（棋盘交错）
  ink:      "#3a3027",      // 墨（勾线/文字）
  inkSoft:  "#6f6354",      // 淡墨
  wall:     "#7d7468",      // 墨石墙
  water:    "#9cc2c2",      // 淡青水
  tree:     "#5a6f4a",      // 苔绿树
  herb:     "#9fcf86",      // 药材（草绿）
  gold:     "#e8c06a",      // 暖金窗光
  zhusha:   "#c2453d",      // 朱砂红（印章 / 合击）
  bond:     "#e39ab8",      // 羁绊粉
};

// 剧情 / 对话（全局）
window.YLT_CFG.story = {
  intro: [
    { who: "阎明", text: "莫要离我太远。" },
    { who: "李清凝", text: "有师姐在身侧，我什么都不怕~" },
    { who: "", text: "（主控一人，另一人跟随。WASD 行走 · J 出手 · K 为同伴疗伤 · L 合击 · Tab 切换控制角色）" },
  ],
  onFirstHerb: [
    { who: "李清凝", text: "这是今日采到的第一株药草，叶尖还沾着露水~" },
  ],
  onReturn: [
    { who: "李清凝", text: "往后年年岁岁，都让我这样陪着你，可好？" },
    { who: "阎明", text: "（笑）好。药庐虽小，有你在，便是归处。" },
  ],
  onLose: [
    { who: "", text: "明日雨停，再一同上路。" },
  ],
  onCombined: [ // 首次放出合击时播一次
    { who: "阎明", text: "（握紧你的手）同心——！" },
    { who: "李清凝", text: "（回握）一剑，便足够。" },
  ],
  // 点床榻「就寝」时弹出的确认台词（\n 换行）
  confirmSleep: "又是悠悠一日，\n是否就寝歇息？",
};

// 庐内互动（休整态 home）：靠近触发温情对话、累积好感
window.YLT_CFG.homeInteractions = {
  triggerRange: 26,   // 触发半径（像素，约 0.8 格）
  list: [
    { x: 3, y: 14, name: "茶案", gain: 1,
      lines: [
        { who: "阎明", text: "（斟茶推到清凝手边）趁热。你总忘喝，我替你记着。" },
        { who: "李清凝", text: "（捧杯）师姐煮的茶，连苦味都暖。" },
      ] },
    { x: 5, y: 14, name: "窗边看星", gain: 1, affinityReq: 3,
      lines: [
        { who: "李清凝", text: "（倚窗）星星落进你眼里了。" },
        { who: "阎明", text: "（笑）你的眼中也有星星。" },
      ],
      lockedHint: "（似还差些火候……再多陪陪她，才好说这话。）" },
  ],
};
