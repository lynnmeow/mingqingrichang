/* =========================================================================
 * 《明清日常》配置层 · 99 装配
 * 把前面 00–08 各 part 挂到 window.YLT_CFG.<key> 的内容，合并回
 * window.GAME_CONFIG —— 引擎 src/ 只读这一个对象，因此【引擎零改动】。
 *
 * 新增配置时：在某个 00–08 文件里给 window.YLT_CFG.<key> 赋值，
 * 然后在本文件把它并入 GAME_CONFIG 对象字面量（下方 window.GAME_CONFIG = {...}）即可。
 * 否则该键只存在于 window.YLT_CFG，引擎读不到 GAME_CONFIG.<key>。改完刷新浏览器即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};
(function () {
  const C = window.YLT_CFG;
  // 注：items/visitors/visitorEvents/recipes/poems/stars/starLinks/miniCfg/books/bookToc/bookFiles
  // 已随方向一 aggressive split 移入 config_lazy_bundle（标题界面后注入），改由 99_assemble_lazy 的
  // requireKeysLazy 校验，此处 requireKeysCore 不再包含它们，避免首屏误报。
  const requireKeysCore = ["global", "sisters", "enemyDefault", "codex",
    "home", "furniture", "maps", "homeMap", "theme", "story",
    "homeInteractions", "mode", "weather"];
  for (const k of requireKeysCore) {
    if (C[k] === undefined) {
      console.error("[config] 99_assemble 缺少必要配置块: " + k + "（检查对应 00–08 文件）");
    }
  }
  // F6 观星：星空散布逻辑（scatterStars / STAR_REGIONS / CONSTELLATIONS 等）已随 14_stars
  // 迁入 config_lazy_bundle 的 99_assemble_lazy.js（决策点#3：方向一 aggressive split 把 14_stars 移入 lazy；
  // 若该文件在 CORE 装配期调用 scatterStars 会因未定义而崩溃）。此处仅在首屏占位，标题界面后由 lazy 填充。
  window.GAME_CONFIG = {
    global: C.global,
    sisters: C.sisters,
    enemyDefault: C.enemyDefault,
    codex: C.codex,
    books: C.books,
    bookToc: C.bookToc || {},     // 方案C：书籍目录索引（16_toc.js 注入；书架/图鉴用它即时显示，无需等正文）
    bookFiles: C.bookFiles || {}, // 方案C：每书正文分片文件名列表（main.js ensureBook 懒加载用）
    flowerTypes: C.flowerTypes,
    flowerColors: C.flowerColors,
    flowerNames: C.flowerNames,
    specialPools: C.specialPools,
    chest: C.chest,
    home: C.home,
    furniture: C.furniture,
    visitors: C.visitors,
    visitorEvents: C.visitorEvents,
    maps: C.maps,
    homeMap: C.homeMap,
    recipes: C.recipes,
    theme: C.theme,
    story: C.story,
    homeInteractions: C.homeInteractions,
    mode: C.mode,       // F15：手动 / 自动 操作模式配置
    weather: C.weather,  // 天气配置（每日随机采样）
    layout: C.layout,   // F-Editor：家园家具视觉/位置层（03_layout.js）
    poems: C.poems,     // F9 随机对诗：诗句配置（缺失则对诗功能优雅关闭，不报错）
    stars: undefined, // F6 夜晚点窗观星：古星图数据；由 config_lazy 的 99_assemble_lazy 在标题界面后散布并填充（scatterStars 已随 14_stars 迁入该文件）
    starLinks: undefined, // F6 星官连线（与 stars 同生命周期，lazy 填充）
    miniCfg: undefined, // 家园小游戏配置（20_minigame.js，lazy 填充）
  };
  // F-Editor：把布局层（03_layout.js）按 id 合进 furniture。
  // 仅合并「视觉/位置」白名单字段，绝不覆盖逻辑字段(id/kind/onTap/collide/lines/proximity 等)。
  const layoutMap = C.layout || {};
  const LAYOUT_KEYS = ["img", "x", "y", "w", "h", "ax", "ay", "ox", "oy", "hit", "reach"];
  for (const f of (window.GAME_CONFIG.furniture || [])) {
    const L = layoutMap[f.id]; if (!L) continue;
    for (const k of LAYOUT_KEYS) if (L[k] !== undefined) f[k] = L[k];
  }
})();
