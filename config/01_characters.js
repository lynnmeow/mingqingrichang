/* =========================================================================
 * 《明清日常》配置层 · 01 角色 + 小妖默认数值
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

// 关键：两人都“能扛能奶”，但【治疗主要朝向对方】，体现羁绊。
// 改名：师姐=阎明(红+金)；师妹=李清凝(浅蓝+浅绿)。
// skin = 地图上角色图片(留空程序绘制)；portrait = 对话立绘(留空程序头像)。
window.YLT_CFG.sisters = {
  shijie: {
    id: "shijie",
    name: "阎明",          // 师姐
    title: "明王",
    color: "#e0524a",      // 主色：朱红
    accent: "#f2c14e",     // 点缀：金
    skin: "image/yanming_skin1.png", // 采药地图模型（用立绘替换程序小人；留空=程序绘制）
    portrait: "image/yanming_skin1.png",  // 对话立绘（留空=程序头像）
    // F14-lite：换装（主界面点角色循环切换）。skins[0]=默认，索引对应 game.outfit。
    skins: [
      { name: "北域", skin: "image/yanming_skin1.png", portrait: "image/yanming_skin1.png" },
      { name: "名仁联名", skin: "image/yanming_skin2.png", portrait: "image/yanming_skin2.png" },
    ],
    maxHp: 110,
    skills: {
      // 攻击：近身范围劈砍，高伤短冷却
      attack: { name: "龙吟", type: "melee",  range: 54, damage: 26, cooldown: 0.45, cost: 0 },
      // 治疗：主要疗“对方(李清凝)”，附带少量自愈防死锁
      heal:   { name: "治愈", type: "heal", amount: 40, selfAmount: 12, cooldown: 1.8, cost: 22 },
    },
  },
  shimei: {
    id: "shimei",
    name: "李清凝",        // 师妹
    title: "清凝仙子",
    color: "#8fd3e8",      // 主色：浅蓝
    accent: "#a8e0b0",     // 点缀：浅绿
    skin: "image/liqingning_skin1.png", // 采药地图模型（用立绘替换程序小人）
    portrait: "image/liqingning_skin1.png", // 对话立绘（留空=程序头像）
    // F14-lite：换装（主界面点角色循环切换）。skins[0]=默认，索引对应 game.outfit。
    skins: [
      { name: "圣女", skin: "image/liqingning_skin1.png", portrait: "image/liqingning_skin1.png" },
      { name: "名仁联名", skin: "image/liqingning_skin2.png", portrait: "image/liqingning_skin2.png" },
    ],
    maxHp: 90,
    skills: {
      // 攻击：远程飞针，可走位消耗
      attack: { name: "飞剑", type: "ranged", range: 185, damage: 17, cooldown: 0.6, cost: 0, projectileSpeed: 250 },
      // 治疗：小范围同时疗“对方(阎明)+自己”
      heal:   { name: "温养", type: "healAoe", amount: 26, cooldown: 2.4, cost: 22 },
    },
  },
};

window.YLT_CFG.enemyDefault = {
  hp: 42, atk: 9, speed: 46, aggro: 130, atkRange: 26, atkCd: 0.8,
};
