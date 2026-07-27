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
  const requireKeys = ["global", "sisters", "enemyDefault", "codex", "books",
    "home", "furniture", "visitors", "visitorEvents", "maps", "homeMap", "recipes", "theme", "story",
    "homeInteractions", "mode", "weather"];
  for (const k of requireKeys) {
    if (C[k] === undefined) {
      console.error("[config] 99_assemble 缺少必要配置块: " + k + "（检查对应 00–08 文件）");
    }
  }
  // F6 观星：把刻板的「十字直线」布局打散为自然散布的星空。
  // 保留「东青龙/北玄武/西白虎/南朱雀/中宫」的大致方位文化含义，
  // 但每条直线散成 2D 星云，四向区域相互交叠，读起来像真实夜空而非 schematic。
  // 位置用「以 id 为种子的确定性随机」生成：每次加载稳定一致、可测试、不抖动。
  function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const STAR_REGIONS = {
    "青龙": [0.03, 0.05, 0.44, 0.95],
    "玄武": [0.05, 0.03, 0.95, 0.34],
    "白虎": [0.56, 0.05, 0.97, 0.95],
    "朱雀": [0.05, 0.62, 0.95, 0.97],
    "中宫": [0.26, 0.28, 0.74, 0.72],
  };
  // —— 真实星座模板（让「连星成图」还原现实形状，如北斗七星像勺子）——
  // 观星面板星空区像素尺寸（须与 ui.js drawOverlayPanel 的 stars 分支一致：
  //   px=14, pw=W-28 → cX=px+12, cW=pw-24=lw; py=44, ph=H-88 → cY=py+46, cH=ph-64）。
  // 星空映射 sx=lx+s.x*lw, sy=cY+s.y*cH：x 以 lw 为尺度、y 以 cH 为尺度，
  // 二者比 lw/cH(<1) 会把形状纵向拉伸。模板局部坐标按 SKY_ASPECT 预补偿纵向，保证勺子不变形。
  // 星空面板像素尺寸（固定值：游戏画布 288×512 → px=14,pw=260,cX=26,lw=236 ; py=44,ph=424,cY=90,cH=360）
  // 此处不引用全局 W/H：配置层早于 core.js 执行，W 尚在 TDZ；画布尺寸固定故直接写死。
  const SKY_LW = 236, SKY_CH = 360;
  const SKY_ASPECT = SKY_LW / SKY_CH; // ≈0.656：纵向映射被拉伸，需预补偿
  // 局部坐标(x右,y下)以「像素等距」为单位（北斗七星近似真实相对位置）。
  // origin=映射到 center 的局部原点（北斗七星星心，已剔除北极/紫微锚点）；
  // center=归一化定位；scale=局部单位→归一化宽度比例；rot=轻微倾斜更自然。
  const CONSTELLATIONS = {
    beidou: {
      origin: [-10.7, 37.1],
      center: [0.50, 0.38],
      scale: 0.00295,
      rot: -0.12,
      stars: {
        bd1: [70, 20],  bd2: [75, 60],  bd3: [20, 70],  bd4: [15, 25],
        bd5: [-35, 15], bd6: [-85, 25], bd7: [-135, 45],
        beiji: [60, -60], ziwei: [44, -40], // 北极(指极星·在天璇-天枢延长线)、紫微(绕北极)
      },
    },
  };
  function placeConstel(s) {
    const tmpl = CONSTELLATIONS[s.constel];
    const lp = tmpl.stars[s.id]; if (!lp) return null;
    let rx = lp[0] - tmpl.origin[0], ry = lp[1] - tmpl.origin[1];
    const c = Math.cos(tmpl.rot), sn = Math.sin(tmpl.rot);
    const X = rx * c - ry * sn, Y = rx * sn + ry * c;
    let nx = tmpl.center[0] + X * tmpl.scale;
    let ny = tmpl.center[1] + Y * tmpl.scale * SKY_ASPECT; // 纵向预补偿拉伸
    nx = Math.min(0.98, Math.max(0.02, nx));
    ny = Math.min(0.98, Math.max(0.02, ny));
    return { x: +nx.toFixed(4), y: +ny.toFixed(4) };
  }
  function scatterStars(raw) {
    return (raw || []).map((s) => {
      if (s.constel && CONSTELLATIONS[s.constel]) {
        const p = placeConstel(s);
        if (p) return Object.assign({}, s, p);
      }
      const box = STAR_REGIONS[s.group] || [0.04, 0.04, 0.96, 0.96];
      const rnd = mulberry32(hashStr("star:" + s.id));
      const x = box[0] + rnd() * (box[2] - box[0]);
      const y = box[1] + rnd() * (box[3] - box[1]);
      return Object.assign({}, s, { x: +x.toFixed(4), y: +y.toFixed(4) });
    });
  }
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
    stars: scatterStars(C.stars), // F6 夜晚点窗观星：古星图数据（散布为自然星空；缺失则观星功能优雅关闭，不报错）
    starLinks: C.starLinks, // F6 星官连线（与 stars 同生命周期）
    miniCfg: C.miniCfg || null, // 家园小游戏配置（20_minigame.js）
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
