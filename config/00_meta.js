/* =========================================================================
 * 《明清日常》配置层 · 00 基本信息 + 全局数值
 * 你【唯一需要修改】的内容层之一。改完刷新浏览器即生效（引擎 src/ 不改）。
 * 本文件仅挂 window.YLT_CFG.meta / .global，最终由 99_assemble.js 合并。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.global = {
  tile: 32,
  playerSpeed: 140,     // 被控者移动速度
  lingqiMax: 100,       // “默契”上限（疗伤消耗）
  lingqiRegen: 9,       // 默契每秒回复
  requiredHerbs: 0,     // 后备值（引擎优先用 maps[].requiredHerbs；0 则取该图草药数）

  // —— 同伴（另一位师姐妹）AI ——
  followGap: 48,        // 同伴与你的间距，超过就跟上（外出）
  followGapHome: 64,    // 家园中同伴与你的间距（略大于外出，二人不贴太近）
  followSpeed: 155,     // 同伴跟随速度（略快于你，免得掉队）
  companionAutoAtk: true, // 同伴是否自动攻击射程内敌人

  // 自动模式同伴「松绳漫游」参数（手动模式仍用 followGap 贴身跟随，不受影响）
  leashMax: 120,        // 自动模式：同伴距你超过此值才被拉回（家园）
  leashMaxOut: 110,     // 自动模式：外出时的松绳上限
  leashHysteresis: 22,  // 回拉迟滞：回到 leashMax-此值 才解除回拉，防边界振荡
  wanderSpeed: 44,      // 漫游速度（慢于 followSpeed，显得闲适）
  wanderRadius: 58,     // 局部漫游半径（相对同伴当前位置）

  // —— 羁绊系统 ——
  closeRange: 56,       // 两人小于此距离算“并肩”，累积羁绊
  bondMax: 100,         // 羁绊值上限
  bondGainClose: 7,     // 并肩时每秒加的羁绊
  bondGainHeal: 20,     // 一次为对方疗伤加的羁绊
  bondGainHit: 1.5,     // 每次击中敌人加的羁绊（共击同敌也加）
  bondDecay: 0,         // 羁绊自然衰减/秒（0=不衰减，暖心向）

  // —— 合击技（羁绊满时触发）——
  combined: { name: "枯荣流转", type: "nova", range: 130, damage: 42, healBoth: 32 },

  invulnAfterSwitch: 1.2, // 切换/救起后的短暂无敌（秒）

  // —— 昼夜循环（纯氛围，不影响玩法）——
  dayCycleSec: 720,      // 一个完整昼夜在真实时间里的秒数（越小昼夜越快）；720s = 12 分钟 = 十二时辰（每时辰 60s）
};
