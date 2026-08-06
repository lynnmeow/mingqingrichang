/* =========================================================================
 * 《明清日常》配置层 · 07 配方（药方）
 * 有 input 库存方可制药（在制药台点击/药方面板制作）。
 * 改完刷新即生效。
 * -------------------------------------------------------------------------
 * ★ 炼制时长（F1，配置驱动）：每条配方可加 brewHours 字段
 *   · 单位 = 时辰；1 时辰 = dayCycleSec/12 秒真实时间（见 config/00_meta.js，
 *     dayCycleSec=360 时 1 时辰 = 30 秒）。例如 brewHours:2 ≈ 1 分钟。
 *   · brewHours > 0：点击制作即进入「炼制中」，按真实时间倒计时，完成才入库存；
 *     期间 game.brewing 非空，药方面板与家园顶栏显示进度，完成自动入库存并记日记。
 *   · brewHours 缺省或 0：即时完成（兼容旧写法与无时长需求）。
 *   · 同时只炼一炉；炼炉正忙时点制作会提示「炼炉正忙」。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.recipes = [
  { id:"huling", name:"护灵丹", inputs:["fenglingcao","fengyucao","qujing"], output:"hulingdan",
    brewHours: 3,   // 2 时辰 ≈ 1 分钟
    lines:[{who:"",text:"万用的解毒丹。"}] },
  { id:"ningtian", name:"凝天丹", inputs:["lingxincao","xulingcao"], output:"ningtiandan",
    brewHours: 4,
    lines:[{who:"",text:"凝练灵力，有助修炼。"}] },
  { id:"tianling", name:"天灵丹", inputs:["fengyucao","xulingcao"], output:"tianlingdan",
    brewHours: 6,
    lines:[{who:"",text:"肉体受伤后只要没死，服之即可瞬间恢复。"}] },
  { id:"biqi", name:"闭气丹", inputs:["fenglingcao"], output:"biqidan",
    brewHours: 2,
    lines:[{who:"",text:"服用可暂时获得在水下呼吸的能力。"}] },
];

/* --- 空白示例：新增一种丹药（复制到数组内，改 id/name/inputs/output/brewHours 即可） ---
window.YLT_CFG.recipes.push({
  id:"xindan", name:"新丹", inputs:["yaocao1","yaocao2"], output:"xindan",
  brewHours: 4,   // 4 时辰 ≈ 2 分钟；设为 0 或删除该字段则即时完成
  lines:[{who:"",text:"丹药说明文案。"}],
});
*/
