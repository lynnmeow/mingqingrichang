/* =========================================================================
 * 《明清日常》配置层 · 99 延迟装配（lazy）
 * 把「首屏无需、进入游戏后才用到」的配置并入 window.GAME_CONFIG：
 *   - 02_items.js    ：制药材料
 *   - 04_visitors.js ：访客定义 + visitorEvents
 *   - 07_recipes.js  ：药方
 *   - 11_books.js    ：书籍目录（书名/章节索引/分类）
 *   - 14_stars.js    ：F6 古星图 + starLinks
 *   - 15_poems.js    ：F9 对诗诗句
 *   - 16_toc.js      ：书籍目录索引 bookToc / bookFiles（书架即时显示、ensureBook 懒加载用）
 *   - 17_book_verify ：掉落审查开关 YLT_BOOK_VERIFY
 *   - 20_minigame.js ：家园小游戏配置（台词/数值）
 * 这些在 build_bundle.py 中被归入 CONFIG_LAZY，由 config_lazy_bundle.js 在标题界面后台注入，
 * 不阻塞首屏（方向一 aggressive split，用户要求进一步压低首屏 config 体积）。
 *
 * scatterStars（星空散布）逻辑随 14_stars 一并迁至此文件（决策点#3：移入 lazy；
 * 原在 99_assemble.js 的局部函数，CORE 装配期不再调用，避免未定义引用）。
 *
 * 关键：本文件**就地修改** window.GAME_CONFIG（不替换引用），
 * 使 core.js 顶部 `const C = window.GAME_CONFIG` 同步看到上述键。
 * 必须在 99_assemble.js（常驻，先创建 GAME_CONFIG）之后运行。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};
(function () {
  const C = window.YLT_CFG;
  const G = window.GAME_CONFIG || {};

  // ---- F6 观星：星空散布（随 14_stars 迁入 lazy；原在 99_assemble 的局部函数，现迁此）----
  // 把刻板的「十字直线」布局打散为自然散布的星空；位置以 id 为种子的确定性随机，每次加载稳定一致。
  function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const STAR_REGIONS = {
    "青龙": [0.03, 0.05, 0.44, 0.95], "玄武": [0.05, 0.03, 0.95, 0.34],
    "白虎": [0.56, 0.05, 0.97, 0.95], "朱雀": [0.05, 0.62, 0.95, 0.97], "中宫": [0.26, 0.28, 0.74, 0.72],
  };
  // 星空面板像素尺寸固定（游戏画布 288×512）：px=14,py=44,pw=260,ph=424 → lw=236,ch=360
  const SKY_LW = 236, SKY_CH = 360, SKY_ASPECT = SKY_LW / SKY_CH; // ≈0.656：纵向映射被拉伸，需预补偿
  const CONSTELLATIONS = {
    beidou: {
      origin: [-10.7, 37.1], center: [0.50, 0.38], scale: 0.00295, rot: -0.12,
      stars: { bd1: [70, 20], bd2: [75, 60], bd3: [20, 70], bd4: [15, 25], bd5: [-35, 15], bd6: [-85, 25], bd7: [-135, 45], beiji: [60, -60], ziwei: [44, -40] },
    },
  };
  function placeConstel(s) {
    const tmpl = CONSTELLATIONS[s.constel]; const lp = tmpl.stars[s.id]; if (!lp) return null;
    let rx = lp[0] - tmpl.origin[0], ry = lp[1] - tmpl.origin[1];
    const c = Math.cos(tmpl.rot), sn = Math.sin(tmpl.rot);
    const X = rx * c - ry * sn, Y = rx * sn + ry * c;
    let nx = tmpl.center[0] + X * tmpl.scale;
    let ny = tmpl.center[1] + Y * tmpl.scale * SKY_ASPECT; // 纵向预补偿拉伸
    nx = Math.min(0.98, Math.max(0.02, nx)); ny = Math.min(0.98, Math.max(0.02, ny));
    return { x: +nx.toFixed(4), y: +ny.toFixed(4) };
  }
  function scatterStars(raw) {
    return (raw || []).map((s) => {
      if (s.constel && CONSTELLATIONS[s.constel]) { const p = placeConstel(s); if (p) return Object.assign({}, s, p); }
      const box = STAR_REGIONS[s.group] || [0.04, 0.04, 0.96, 0.96];
      const rnd = mulberry32(hashStr("star:" + s.id));
      const x = box[0] + rnd() * (box[2] - box[0]); const y = box[1] + rnd() * (box[3] - box[1]);
      return Object.assign({}, s, { x: +x.toFixed(4), y: +y.toFixed(4) });
    });
  }

  // ---- 合并 lazy 键（就地修改 G，与 99_assemble 同一对象引用）----
  // 注：材料数据在 02_items.js 中挂在 YLT_CFG.codex（codex.items），该文件留 CORE（ui.js 首屏即读）；
  //     故此处不处理「items」键（无顶层 items 键）。
  if (C.visitors) G.visitors = C.visitors;
  if (C.visitorEvents) G.visitorEvents = C.visitorEvents;
  if (C.recipes) G.recipes = C.recipes;
  if (C.poems) G.poems = C.poems;
  if (C.stars) G.stars = scatterStars(C.stars);
  if (C.starLinks) G.starLinks = C.starLinks;
  if (C.miniCfg) G.miniCfg = C.miniCfg;
  if (C.books) G.books = C.books;
  if (C.bookToc) G.bookToc = C.bookToc;
  if (C.bookFiles) G.bookFiles = C.bookFiles;
  G.bookVerify = window.YLT_BOOK_VERIFY || null;

  // ---- requireKeysLazy：lazy 配置加载后校验（不阻塞首屏；配置块整体缺失才提示）----
  const requireKeysLazy = ["visitors", "visitorEvents", "recipes", "poems", "stars", "starLinks", "miniCfg", "books", "bookToc", "bookFiles"];
  for (const k of requireKeysLazy) {
    if (C[k] === undefined) console.error("[config] 99_assemble_lazy 缺少 lazy 配置块: " + k + "（检查对应 config/XX.js 是否在 CONFIG_LAZY 中）");
  }
  window.GAME_CONFIG = G;   // 与 99_assemble 创建的同一对象引用，core.js 的 C 同步可见
})();
