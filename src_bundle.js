/* 自动生成：src_bundle.js (build_bundle.py) — 请勿手改，改 src/XX.js 后重跑脚本 */
/* ===== src/core.js ===== */
/* =========================================================================
 * 《明清日常》Demo · 引擎核心（src/core.js）
 * -------------------------------------------------------------------------
 * 配置读取、全局状态、常量、画布与主题、共享绘制原语、存读档。
 * 与 scenes / home / outing / ui / main 同属一个全局作用域（非 IIFE）：
 *   · 浏览器：index.html 按依赖顺序以 <script> 载入；
 *   · 测试：test_*.js 以拼接方式一次性载入，共享同一作用域。
 * 本文件须最先载入。
 * ========================================================================= */
"use strict";

const C = window.GAME_CONFIG;
if (!C) throw new Error("未找到 GAME_CONFIG，请确认 config.js 已正确加载。");

const T = C.global;
const TILE = T.tile;
let DAY_CYCLE = (typeof T.dayCycleSec === "number" && T.dayCycleSec > 0) ? T.dayCycleSec : 300; // 一个完整昼夜的真实秒数（默认 5 分钟 = 300s）
// 速度切换：快=1时辰30s(DAY_CYCLE=360) / 慢=1时辰60s(DAY_CYCLE=720)
function setDayCycle() {
  DAY_CYCLE = (game && game.speedMode === "slow") ? 720 : 360;
}
// 所有外出地图同为 9×16（与家园一致），COLS/ROWS 取首图尺寸
const MAP_PROTO = (C.maps && C.maps[0]) ? C.maps[0].grid : (C.homeMap || ["#########"]);
const ROWS = MAP_PROTO.length;
let COLS = 0; for (const r of MAP_PROTO) COLS = Math.max(COLS, r.length);
// 外出场景顶部独立任务条高度（不透明，与地图分离；地图缩放后自其下方绘制，二者不重叠）
const OUTING_TOP = 58;

/* ---------- 解析「外出」地图：支持多图，构建 parsedMaps ----------
 * 每图独立解析为 { grid, blocked, herbs, enemySpawns, home, start, startPx, bg, def }。
 * 下列 blocked/herbs/enemySpawns/home/start/startPx/enemies 为「当前激活地图」的引用，
 * 由 loadMap(idx) 重绑 —— 既有代码（scenes / outing / 测试）继续用这些全局名即可。 */
function parseMap(def) {
  const grid = def.grid, rh = grid.length;
  let cw = 0; for (const r of grid) cw = Math.max(cw, r.length);
  const blocked = []; const herbs = []; const enemySpawns = [];
  let home = null, start = null;
  for (let y = 0; y < rh; y++) {
    blocked[y] = [];
    for (let x = 0; x < cw; x++) {
      const ch = (grid[y] && grid[y][x] !== undefined) ? grid[y][x] : "#";
      blocked[y][x] = (ch === "#" || ch === "~" || ch === "T");
      if (ch === "h") {
        const hb = (def.herbs || []).find((h) => h.x === x && h.y === y);
        herbs.push(hb
          ? { x, y, collected: false, id: hb.id, name: hb.name, desc: hb.desc, hue: hb.hue }
          : { x, y, collected: false, id: "herb_" + x + "_" + y, name: "无名草", desc: "山间野草，不知其名。" });
      }
      if (ch === "E") enemySpawns.push({ x, y });
      if (ch === "H") home = { x, y };
      if (ch === "P") start = { x, y };
    }
  }
  if (!home) home = { x: cw - 2, y: rh - 2 };
  if (!start) start = { x: 1, y: 1 };
  return {
    grid, blocked, herbs, enemySpawns, home, start,
    startPx: { x: start.x * TILE + TILE / 2, y: start.y * TILE + TILE / 2 },
    bg: def.bg || "#dfe6d2", def,
    requiredHerbs: (typeof def.requiredHerbs === "number" && def.requiredHerbs > 0) ? def.requiredHerbs : herbs.length,
  };
}
const parsedMaps = (C.maps && C.maps.length) ? C.maps.map(parseMap) : [parseMap({ grid: MAP_PROTO })];

// 当前激活地图的全局引用（loadMap 会重绑这些变量）
let blocked = parsedMaps[0].blocked;
let herbs = parsedMaps[0].herbs;
let enemySpawns = parsedMaps[0].enemySpawns;
let home = parsedMaps[0].home;
let start = parsedMaps[0].start;
let startPx = parsedMaps[0].startPx;
let currentMapIndex = 0;
function currentMapDef() { return (C.maps && C.maps[currentMapIndex]) || null; }
function loadMap(idx) {
  const pm = parsedMaps[idx]; if (!pm) return;
  currentMapIndex = idx;
  blocked = pm.blocked; herbs = pm.herbs; enemySpawns = pm.enemySpawns;
  home = pm.home; start = pm.start; startPx = pm.startPx;
  enemies = pm.enemySpawns.map(makeEnemy);
  if (game) game.currentMap = idx;
}
const requiredHerbs = T.requiredHerbs || herbs.length;

/* ---------- 解析「家园」场景（独立网格，9×16） ---------- */
const HM = C.homeMap || C.map;
const HM_ROWS = HM.length;
let HM_COLS = 0; for (const r of HM) HM_COLS = Math.max(HM_COLS, r.length);
const homeGridChars = [];
const homeBlocked = [];
for (let y = 0; y < HM_ROWS; y++) {
  homeGridChars[y] = []; homeBlocked[y] = [];
  for (let x = 0; x < HM_COLS; x++) {
    const ch = (HM[y] && HM[y][x] !== undefined) ? HM[y][x] : "#";
    homeGridChars[y][x] = ch;
    homeBlocked[y][x] = (ch === "#" || ch === "c" || ch === "T" || ch === "~");
  }
}
// 家园横向相机：可视窗口宽 = COLS 个 tile；相机随被控者平移，clamp 到 [0, (HM_COLS-COLS)*TILE]
let homeCamX = 0;
const homeSpawn = C.home && C.home.spawn ? C.home.spawn : { x: 4, y: 11 };
const homeSpawnPx = { x: homeSpawn.x * TILE + TILE / 2, y: homeSpawn.y * TILE + TILE / 2 };
// 家具邻近对话清单（走近即触发，带冷却），由 furniture[] 注册表生成
const furnitureList = (function () {
  const out = [];
  for (const f of (C.furniture || [])) {
    if (f && f.proximity && f.proximity.length) out.push({ id: f.id, x: f.x, y: f.y, lines: f.proximity });
  }
  return out;
})();

/* ---------- 角色状态（两人各有位置/朝向/冷却） ---------- */
function makeSister(def) {
  return {
    id: def.id, name: def.name, title: def.title, color: def.color,
    maxHp: def.maxHp, hp: def.maxHp, dead: false,
    skills: def.skills,
    pos: { x: startPx.x, y: startPx.y },
    facing: { x: 0, y: 1 },
    cd: { attack: 0, heal: 0 },
    invuln: 0, attackFx: 0, healFx: 0,
  };
}
const sisters = {
  shijie: makeSister(C.sisters.shijie),
  shimei: makeSister(C.sisters.shimei),
};
let activeId = "shijie";
const active = () => sisters[activeId];
const other = () => sisters[activeId === "shijie" ? "shimei" : "shijie"];

/* ---------- 角色皮肤 / 立绘（可选图片，留空则用程序绘制）；F14-lite 支持多皮肤循环切换 ---------- */
const skinImg = {}, portraitImg = {};            // 当前生效（drawSister / 对话读取，按 sister id）
const _skinAll = {}, _portraitAll = {};          // 各皮肤预载缓存：[img0, img1, ...]
// 图片路径解析：若已生成 base64 data URI（config/05_imagedata.js，绕开 CloudStudio 网关无 Content-Length
// 导致浏览器 Image() 加载挂死的问题），优先用内存解码，零 HTTP、零并发、瞬时可靠。
function resolveImg(p) { return (window.YLT_IMG_DATA && window.YLT_IMG_DATA[p]) ? window.YLT_IMG_DATA[p] : p; }
/* 图片就绪「双门控」（优化加载等待）：
   - titleScreenReady：开始界面可见所需 = 标题图(title.png) + 家园背景(home_bg) → 控制「关闭加载界面」时机。
     开始界面只需这两张，不须等全家具/全立绘，加载界面因此更快消失（感知速度大幅提升）。
   - gameReady：进入游戏所需 = 家园背景 + 全部家具 + 当前角色立绘 → 控制「点开始能否进游戏」。
     用户停留在开始界面的时间里，这些图在后台静默解码完成，不拖慢开屏。
   采用「计数」而非 store 轮询：onload/onerror 都减计数，图缺失或网关挂死也不卡死。 */
let _titlePending = 0, _titleReady = false;
let _gamePending = 0, _gameReady = false;
function titlePendInc() { _titlePending++; }
function titlePendDec() { _titlePending = Math.max(0, _titlePending - 1); if (_titlePending === 0) _titleReady = true; }
function gamePendInc() { _gamePending++; }
function gamePendDec() { _gamePending = Math.max(0, _gamePending - 1); if (_gamePending === 0) _gameReady = true; }
// 同一图对两个门控都关键（如 home_bg）→ 两个计数同时 inc/dec
function bothPendInc() { titlePendInc(); gamePendInc(); }
function bothPendDec() { titlePendDec(); gamePendDec(); }
function titleScreenReady() {
  if (typeof Image === "undefined" || typeof document === "undefined") return true; // 无头测试：跳过
  return _titleReady;
}
function gameReady() {
  if (typeof Image === "undefined" || typeof document === "undefined") return true;
  return _gameReady;
}
function loadOptImage(path, store, key, attempt) {
  if (!path || typeof Image === "undefined") return;
  path = resolveImg(path);
  attempt = attempt || 0;
  gamePendInc();
  const img = new Image();
  img.onload = () => { store[key] = img; gamePendDec(); };
  // 失败重试：沙箱静态服务偶发丢请求，重试可自愈（最多 3 次，退避递增）；最终失败也减计数避免卡死
  img.onerror = () => { gamePendDec(); if (attempt < 3) setTimeout(() => loadOptImage(path, store, key, attempt + 1), 350 * (attempt + 1)); };
  img.src = path;
}
// 预载每个角色的全部皮肤（切换即时、无闪烁）；i===0 默认皮肤直接进生效缓存。
// 注意：须在「图片分片(config/05_imagedata_*) 异步加载完成」后由 bootstrapImages() 调用，
// 否则 resolveImg 尚取不到 data URI（返回字面路径导致 404/失败）。
function preloadSisterImages() {
  if (typeof Image === "undefined") return;
  for (const k in C.sisters) {
    const s = C.sisters[k];
    const list = (s.skins && s.skins.length) ? s.skins : [{ skin: s.skin, portrait: s.portrait }];
    _skinAll[k] = []; _portraitAll[k] = [];
    list.forEach((sk, i) => {
      const sp = resolveImg(sk.skin), pp = resolveImg(sk.portrait);
      if (sp) { gamePendInc(); const si = new Image(); si.onload = () => { _skinAll[k][i] = si; if (i === 0) skinImg[k] = si; gamePendDec(); }; si.onerror = () => { gamePendDec(); }; si.src = sp; }
      if (pp) { gamePendInc(); const pi = new Image(); pi.onload = () => { _portraitAll[k][i] = pi; if (i === 0) portraitImg[k] = pi; gamePendDec(); }; pi.onerror = () => { gamePendDec(); }; pi.src = pp; }
    });
  }
}
function sisterSkinCount(id) {
  const s = C.sisters[id]; if (!s) return 1;
  return (s.skins && s.skins.length) ? s.skins.length : 1;
}
function currentOutfitIndex(id) {
  const n = sisterSkinCount(id);
  const i = (game.outfit && typeof game.outfit[id] === "number") ? game.outfit[id] : 0;
  return ((i % n) + n) % n;
}
// 按 game.outfit[id] 应用当前皮肤到生效缓存（切换时 / 启动同步存档时调用）
function applyOutfit(id) {
  const s = C.sisters[id]; if (!s) return;
  const list = (s.skins && s.skins.length) ? s.skins : [{ skin: s.skin, portrait: s.portrait }];
  const i = currentOutfitIndex(id);
  const sk = list[i] || list[0];
  skinImg[id] = (_skinAll[id] && _skinAll[id][i]) ? _skinAll[id][i] : (skinImg[id] || null);
  portraitImg[id] = (_portraitAll[id] && _portraitAll[id][i]) ? _portraitAll[id][i] : (portraitImg[id] || null);
  if (!skinImg[id]) loadOptImage(sk.skin, skinImg, id);       // 极端：预载未完成则兜底按需加载
  if (!portraitImg[id]) loadOptImage(sk.portrait, portraitImg, id);
}

// 书桌绘画：目标画作（F13 图片化 reveal）—— 懒加载：仅当画作面板首次打开时拉取，
// 避免 1.16MB(现经压缩 ~180KB) 在首屏与角色/家具图抢带宽，拖慢「进入游戏」。
const paintingImg = {};
let _paintingRequested = false;
function ensurePainting() {
  if (_paintingRequested) return;
  _paintingRequested = true;
  loadOptImage("image/drawing_01.PNG", paintingImg, "painting");
}

function makeEnemy(s) {
  const d = C.enemyDefault;
  return {
    x: s.x * TILE + TILE / 2, y: s.y * TILE + TILE / 2,
    hp: d.hp, maxHp: d.hp, atk: d.atk, speed: d.speed,
    aggro: d.aggro, atkRange: d.atkRange, atkCd: d.atkCd, cd: 0,
    hitFlash: 0, alive: true,
  };
}
let enemies = enemySpawns.map(makeEnemy);
const projectiles = [];

/* ---------- 全局状态 ---------- */
// F9：每书初始拥有第 1 章（chapters 首章号），运行时 game.books = { bookId: [已获章节号...] }
function seedBooks() {
  const out = {};
  for (const b of (C.books || [])) {
    const firstN = (b.chapters && b.chapters[0] && b.chapters[0].n) || 1;
    out[b.id] = [firstN];
  }
  return out;
}
// 天气：按权重随机采样当日天气 id（权重和=101，按归一化比例近似 spec）
function pickWeatherId() {
  const list = (window.GAME_CONFIG && window.GAME_CONFIG.weather && window.GAME_CONFIG.weather.list) || [{ id: "qing" }];
  let total = 0; for (const w of list) total += (w.weight || 0);
  if (total <= 0) return "qing";
  let r = Math.random() * total;
  for (const w of list) { r -= (w.weight || 0); if (r <= 0) return w.id; }
  return list[list.length - 1].id;
}
function weatherName(id) {
  const list = (window.GAME_CONFIG && window.GAME_CONFIG.weather && window.GAME_CONFIG.weather.list) || [];
  const w = list.find((x) => x.id === id);
  return w ? w.name : "晴";
}
// 十二时辰：clock 0 = 子夜（子时中心），0.5 = 正午（午时中心）；索引 0=子 依次到 11=亥
const SHICHEN = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
function shichenName(clock) {
  const h = (((clock || 0) * 24) % 24 + 24) % 24;   // 0..24 小时
  const idx = Math.floor(((h + 1) % 24) / 2) % 12;  // 子时覆盖 23、0、1 点
  return SHICHEN[idx] + "时";
}
// F6：夜判定（clock<0.25 或 clock>0.75 为夜）。clock 0=子夜 0.5=正午。
function isNight() { return game.clock < 0.25 || game.clock > 0.75; }
function defaultSaveFields() {
  return {
    affinity: 0,
    diary: [],
    codex: {},
    everOwned: {},               // F16：曾获得过的物品 id 集合（图鉴置灰以“是否获得过”为准，只增不减）
    books: {},                   // F9：{ bookId: [已获章节号...] }；新号默认不给书，全部从游玩中获取（addBook/gainBookChapter）
    decor: {},
    flowers: {},
    painting: { colored: new Array(54).fill(false), lastDay: 0 },   // F13 书桌绘画：54 格 + 当日已落笔日
    visitorsSeen: [],
    specialOwned: {},            // F11 已获特殊道具集合（去重判定）
    treeClaimed: false,          // 大树每日拾取标记（每日重置）
    outfit: {},                  // F14-lite：换装当前皮肤索引 { sisterId: index }
    todayVisitors: [],           // F8：当日已 roll 的访客队列 [{def, events}]
    visitorQueueIdx: 0,          // F8：队列登场进度
    visitorSpawnTimer: 12,       // F8：距下一位访客登场的秒数
    dayVisitorsRolled: false,    // F8：当日是否已 roll（advanceDay 置 false 后统一 roll）
    readBook: null,              // F9：阅读面板当前选中的书（null=书单）
    readChapter: null,           // F9：阅读面板当前章（null=章单，有值=阅读正文）
    inventory: {},
    proxCd: {},
    day: 1,                  // 日循环：第几天
    clock: 0.40,             // 日内时间（0=子夜, 0.4=巳时清晨）
    currentMap: 0,           // 当前/上次进入的外出地图索引
    weather: pickWeatherId(),// 当日天气 id（每日 advanceDay 重抽；新游戏/重置也随机首日）
    controlMode: ((typeof window !== "undefined" && window.GAME_CONFIG && window.GAME_CONFIG.mode && window.GAME_CONFIG.mode.default) || "manual"), // F15：手动/自动模式（配置默认）
    movedThisDay: false,      // F15：当日玩家是否已主动移动过
    brewing: null,            // F1：炼制中状态 { recipeId, endMs, brewHours } | null
    travel: null,             // F16：游历状态
    lastStarDay: -1,          // F6：夜晚点窗观星——上次自动介绍星象的「游戏内日」（-1=尚未，每天首次打开触发）
    mini: null,                // 家园小游戏：当前进行中的半局（载入由 loadGame 恢复）
    miniResume: null,          // 家园小游戏：暂停的半局（退出后当天内再开可续；finishMini/advanceDay 清）
  };
}
const game = Object.assign({
  scene: "home",             // "home" | "outing"
  state: "home",             // "home" | "play"（test 兼容）
  herbsCollected: 0, lingqi: T.lingqiMax, bond: 0,
  pillsCrafted: 0, monstersDefeated: 0,   // 回顾统计：炼制丹药数 / 击退妖怪数
  day: 1, currentMap: 0,
  weather: "qing",          // 当日天气 id（启动后由存档/随机覆盖）
  inDialogue: false, dialogueQueue: [], dialogueIndex: 0,
  ended: false, win: false,
  firstHerbDone: false, combinedShown: false,
  msg: "", msgTimer: 0, toastFade: 0, combinedFx: 0, homeHint: 0,
  homeDone: {}, poemDoneDay: 0, poemTimer: 0,   // F9 随机对诗：当日已对诗日标 + 触发倒计时
  clock: 0.42,               // 昼夜相位：0=子夜 0.5=正午（纯氛围，起始为明亮清晨）
  confirm: null,             // 确认弹窗：{ text, onYes, onNo }
  sleeping: null,            // 过夜动画状态：{ t }
  controlMode: "manual",     // F15：当前操作模式 "manual" | "auto"（启动后由存档/配置覆盖）
  lastInputAt: 0,            // F15：最近一次玩家操作的时间戳（performance.now），用于闲置判定
  movedThisDay: false,       // F15：当日玩家是否已主动移动过（未移动前不触发家具邻近对话）
  forcedRest: false,         // F15：一日结束·手动强制休息——冻结世界，等待玩家点「休息」
  pendingRest: false,        // F15：一日结束·手动且在外——待返回主界面后再弹强制休息
    autoTarget: null,          // F15：自动模式家园漫步目标 {x,y}
    autoIdle: 0,               // F15：自动模式到站后的小歇计时
    autoStuck: 0,              // F15：自动模式卡死计时（长时间无进展则换目标）
    autoSkip: {},              // F15：自动模式判定无法贴近的花（当日跳过，避免原地死磕）
    autoTreeSkip: false,       // 自动模式：大树拾取“走不到”放弃标记（当日重置）
    autoVisitorSkip: false,    // 自动模式：访客接待“走不到”放弃标记（每次新访客重置）
    autoTreeStuck: 0,          // 自动模式：走向大树时的卡死计时（>2s 才放弃，避免撞墙瞬弃）
    autoVisitorStuck: 0,       // 自动模式：走向访客时的卡死计时
    autoChenOfLastTask: -1,    // F15-增强：自动模式「每时辰只做1项」——最近一次执行任务的时辰索引（-1=今日尚未做过）
    autoActiveTask: null,      // F15-增强：自动模式当前进行中的任务 {type,id?,x,y,range}（null=无）
  panel: null,               // null | "diary" | "codex" | "recipe" | "maps" | "paint" | "bag" | "stars"(F6 观星)
  starHighlight: null,       // F6：当前高亮星 id（数组，瞬态，不入存档；null=无高亮）
  lastStarDay: -1,           // F6：上次自动观星介绍的游戏内日（每天首次打开触发；-1=尚未）
  diaryTab: "diary",         // 日记面板页签：diary(日记) | review(回顾)
  codexCat: "all",           // 图鉴分类：all(全部) | herb(草药) | medicine(丹药) | book(书籍) | special(特殊)
  bagCat: "all",             // 药柜分类：all(全部) | herb(草药) | flower(鲜花) | medicine(丹药)
  chest: null,               // 外出宝箱实体（瞬态，不入存档）：{ x, y, taken }
  bubble: null,              // F8 双气泡（瞬态氛围，不入存档）：{ type, first, t0, dur, secondDelay }
  showTitle: true,           // 启动先显标题 splash（点屏进入）
  saveSlot: null,             // 当前激活存档槽（0/1/2），null=未选
  slotMetas: [],             // 三槽元数据（标题界面显示），由 initSlots 填充
  titleState: "menu",        // 标题界面状态："menu"(主菜单) | "slot"(选档)
  titleIntent: null,         // 标题意图："continue" | "new"
  _titleHits: [],            // 标题界面按钮命中区（drawTitle 每帧重置）
  randomTimer: 0, activeActivity: null, randomScale: 1,   // randomScale：随机姐妹活动间隔随当日累积而增长
  visitor: null, visitorSpawnTimer: 12, dayVisitorsRolled: false,
}, defaultSaveFields());

const SAVE_COUNT = 3;                 // 玩家可同时拥有的存档槽数量
const SAVE_PREFIX = "ylt_save_";      // 各槽独立 key：ylt_save_0 / _1 / _2
const SAVE_LEGACY = "ylt_save_v1";    // 旧版单一存档 key（首次启动迁移到槽0）
function slotKey(i) { return SAVE_PREFIX + i; }
const safeStore = (function () {
  try { if (typeof localStorage !== "undefined" && localStorage) return localStorage; } catch (e) {}
  const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
})();

const TOAST_FADE = 0.6;   // toast 隐藏动画时长（向上飘 + 渐隐）
function setMsg(t, dur) {
  game.msg = t;
  game.msgTimer = Math.max(dur != null ? dur : 3.0, 3.0);   // 每条 toast 至少停留 3 秒（用户要求「停留3秒」）
  game.toastFade = 0;                                       // 新 toast 立即打断可能的旧淡出
}
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

/* ---------- 碰撞（按当前场景取网格） ---------- */
function activeBlocked() { return (game.scene === "home") ? homeBlocked : blocked; }
function isWallPx(px, py) {
  const grid = activeBlocked();
  const maxC = (game.scene === "home") ? HM_COLS : COLS;
  const maxR = (game.scene === "home") ? HM_ROWS : ROWS;
  const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
  if (px < 0 || py < 0 || px >= maxC * TILE || py >= maxR * TILE) return true;
  if (r < 0 || r >= grid.length || c < 0 || c >= (grid[0] ? grid[0].length : 0)) return true;
  return grid[r][c];
}
// 家具障碍：isObstacle 项禁止踏入；有 block 矩形则按其区域（否则仅挡单格）
// 硬编码禁止行走区域
const HARD_BLOCKED = [
  { x: 12, y: 13, w: 6, h: 3 },   // 曲池中心区（列12-17，行13-15）
  { x: 1,  y: 1,  w: 10, h: 4 },  // 背景墙面区（列1-10，行1-4）
];
function furnitureCollideAt(px, py) {
  const r = 11;
  for (const z of HARD_BLOCKED) {
    const l = z.x * TILE + 3, t = z.y * TILE + 3;
    const ri = l + z.w * TILE - 6, b = t + z.h * TILE - 6;
    if (px + r > l && px - r < ri && py + r > t && py - r < b) return true;
  }
  for (const f of (C.furniture || [])) {
    if (!f.isObstacle) continue;
    let left, right, top, bottom;
    if (f.block && f.block.w > 0 && f.block.h > 0) {
      left   = (f.x + f.block.x) * TILE + 3;
      top    = (f.y + f.block.y) * TILE + 3;
      right  = left + f.block.w * TILE - 6;
      bottom = top  + f.block.h * TILE - 6;
    } else {
      const fx = f.x * TILE, fy = f.y * TILE;
      left = fx + 3; right = fx + TILE - 3;
      top  = fy + 3; bottom = fy + TILE - 3;
    }
    if (px + r > left && px - r < right && py + r > top && py - r < bottom) return true;
  }
  return false;
}
function canMove(nx, ny) {
  const r = 11;
  if (isWallPx(nx - r, ny - r) || isWallPx(nx + r, ny - r) ||
      isWallPx(nx - r, ny + r) || isWallPx(nx + r, ny + r)) return false;
  if (game.scene === "home" && furnitureCollideAt(nx, ny)) return false;
  return true;
}

/* ---------- 输入抽象层 ---------- */
const input = { keyDir: { x: 0, y: 0 }, touchDir: { x: 0, y: 0 }, touchActive: false };

/* ---------- 画布 / 主题 / 绘制原语 ---------- */
const canvas = document.getElementById("game");
const W = COLS * TILE, H = ROWS * TILE;
const ctx = canvas.getContext("2d");

function resize() {
  const frame = document.getElementById("frame");
  if (!frame) return;
  // 移动端与桌面端统一 contain：等比适配、绝不裁切、不拉伸变形。
  // 触屏 pad=0 让地图贴边；上下空段由 #frame 主题渐变(天空→纸面→地面)自然填补，
  // 避免 cover 放大导致的「整体变大 + 两侧被切掉」显示异常（2026-07-21 修）。
  const coarse = !!(window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  const pad = coarse ? 0 : 12;
  const availW = Math.max(1, (frame.clientWidth || 0) - pad);
  const availH = Math.max(1, (frame.clientHeight || 0) - pad);
  const cssScale = Math.min(availW / W, availH / H);
  const dispW = Math.max(1, Math.floor(W * cssScale));
  const dispH = Math.max(1, Math.floor(H * cssScale));
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.style.width = dispW + "px";
  canvas.style.height = dispH + "px";
  canvas.width = Math.max(1, Math.round(dispW * dpr));
  canvas.height = Math.max(1, Math.round(dispH * dpr));
}
resize();
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => setTimeout(resize, 200));
window.addEventListener("load", resize);            // 兜底：首屏布局未完成时初测尺寸可能偏小，load 后按真实视口重校
if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);
requestAnimationFrame(resize);                      // 下一帧再校准一次，杜绝首帧尺寸竞态（适配/白屏防护）

const TH = Object.assign({
  ambient: true, petalCount: 16,
  fontTitle: '"STKaiti","KaiTi","Songti SC",serif',
  fontBody: '"PingFang SC","Microsoft YaHei",system-ui,sans-serif',
  paper: "#efe3cf", paperAlt: "#e7d8be", ink: "#3a3027", inkSoft: "#6f6354",
  wall: "#7d7468", water: "#9cc2c2", tree: "#5a6f4a", herb: "#9fcf86",
  gold: "#e8c06a", zhusha: "#c2453d", bond: "#e39ab8",
  date: "#7a2f29",          // 日记「第 N 日」分隔标签：深胭脂印红（较原 #a8433b 更深，压于米纸更沉稳醒目）
  inkSoft2: "#4f463b",      // 次级文字(图鉴描述/未激活标签/材料清单)：米纸上对比 ~6:1，确保可读
  cardLine: "rgba(58,48,39,0.20)", // 物品卡/面板内卡片描边：在米纸面板上勾勒边界，避免“看不清”
}, C.theme || {});
const PAL = {
  grass: TH.paper, grass2: TH.paperAlt, wall: TH.wall, wallTop: TH.inkSoft,
  water: TH.water, tree: TH.tree, home: TH.gold, ink: TH.ink, inkSoft: TH.inkSoft,
};
function glow(on, color, blur) { if (on) { ctx.shadowColor = color; ctx.shadowBlur = blur; } else { ctx.shadowBlur = 0; ctx.shadowColor = "transparent"; } }

function isTouchDevice() {
  try {
    if (typeof window !== "undefined" && window.matchMedia)
      return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  } catch (e) { }
  return typeof navigator !== "undefined" && (navigator.maxTouchPoints || 0) > 0;
}

const petals = [];
const PETAL_N = Math.max(0, Math.min(28, TH.petalCount || 0));
for (let i = 0; i < PETAL_N; i++) {
  petals.push({
    x: Math.random() * W, y: Math.random() * H,
    r: 1.4 + Math.random() * 2.4, spd: 9 + Math.random() * 16,
    sway: 7 + Math.random() * 13, ph: Math.random() * Math.PI * 2,
    a: 0.22 + Math.random() * 0.38, mote: i % 2 === 0,
  });
}
function drawPetals(now) {
  if (!TH.ambient || !petals.length) return;
  const t = now / 1000;
  // 与场景绑定：横向 1:1 跟随相机（家园有横向相机且角色居中），模 W 循环
  // 始终铺满可视区，但不再「贴屏跟随角色」，而是随场景滚动。
  const camX = (game.scene === "home") ? homeCamX : 0;
  for (const p of petals) {
    const y = (p.y + p.spd * t * 6) % (H + 12);
    let x = ((p.x - camX) % W + W) % W;
    x += Math.sin(t * p.sway * 0.3 + p.ph) * 12;
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.mote ? TH.gold : TH.bond;
    ctx.beginPath();
    ctx.ellipse(x, y, p.r, p.r * 0.62, p.ph + t * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- 通用装饰：晕影 / 卷轴内框 / 印章 / 图标 / 进度条 / 卡片 ---------- */
function vignette(strength) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.30, W / 2, H / 2, Math.max(W, H) * 0.74);
  g.addColorStop(0, "rgba(58,48,39,0)");
  g.addColorStop(1, "rgba(40,33,26," + (strength || 0.18).toFixed(2) + ")");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function scrollFrame() {
  ctx.save();
  ctx.strokeStyle = "rgba(232,192,106,0.55)"; ctx.lineWidth = 2.5;
  ctx.strokeRect(7, 7, W - 14, H - 14);
  ctx.strokeStyle = "rgba(58,48,39,0.45)"; ctx.lineWidth = 1;
  ctx.strokeRect(11, 11, W - 22, H - 22);
  ctx.restore();
}
function sealMark(ch, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color || TH.zhusha;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "bold " + Math.round(r * 0.92) + "px " + TH.fontTitle;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ch, x, y + 1); ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function leafIcon(x, y, s, col) {
  ctx.save(); ctx.fillStyle = col || TH.herb;
  ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.5, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(58,48,39,0.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - s * 0.7, y + s * 0.35); ctx.lineTo(x + s * 0.7, y - s * 0.35); ctx.stroke();
  ctx.restore();
}
function bookIcon(x, y, s, col) {
  ctx.save(); ctx.fillStyle = col || "#7a5a3a";
  ctx.fillRect(x - s, y - s * 0.7, s * 2, s * 1.4);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(x - s * 0.15, y - s * 0.7, 1.2, s * 1.4);
  ctx.restore();
}
function barR(x, y, w, h, ratio, col, bg) {
  ctx.fillStyle = bg || "rgba(0,0,0,0.3)"; panel(x, y, w, h, h / 2, bg, null);
  const fw = Math.max(0, Math.min(1, ratio)) * w;
  if (fw > 1) { ctx.fillStyle = col; panel(x, y, fw, h, h / 2, col, null); }
}
function bar(x, y, w, h, ratio, col, bg) {
  ctx.fillStyle = bg || "#000"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
}
function panel(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, x + w, x, y, r); ctx.closePath();
  }
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke(); }
}
// 带柔和投影的卡片（UI 容器统一风格：对话框 / 底栏 / 角色卡 / 面板）
// noShadow=true 时去除投影（用于页签与列表项，避免投影溢出面板边界）
function card(x, y, w, h, r, fill, stroke, noShadow) {
  if (noShadow) {
    panel(x, y, w, h, r, fill, null);
  } else {
    ctx.save();
    ctx.shadowColor = "rgba(40,33,26,0.26)";
    ctx.shadowBlur = 14; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 5;
    panel(x, y, w, h, r, fill, null);
    ctx.restore();
  }
  if (stroke) {
    ctx.save(); ctx.strokeStyle = stroke; ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    ctx.stroke(); ctx.restore();
  }
}

/* ---------- 文本工具 ---------- */
function findSisterByName(name) {
  if (!name) return null;
  for (const k in C.sisters) {
    const s = C.sisters[k];
    if (s.name === name || s.id === name) return s;
  }
  return null;
}
function wrapLines(text, font, maxW, measure) {
  const m = measure || ((t) => ctx.measureText(t).width);
  ctx.font = font;
  const lines = []; let cur = "";
  for (const ch of (text || "")) {
    const t = cur + ch;
    if (m(t, font) > maxW && cur) { lines.push(cur); cur = ch; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* ---------- 持久化 ---------- */
function saveGame(slot) {
  try {
    const idx = (slot != null) ? slot : (game.saveSlot != null ? game.saveSlot : 0);   // 默认写当前激活槽
    const o = {
      v: 1,
      ts: (typeof Date !== "undefined" && Date.now) ? Date.now() : 0,   // 存档时间戳（选档界面显示「最近游玩」）
      affinity: game.affinity, diary: game.diary, codex: game.codex, everOwned: game.everOwned, books: game.books,
      decor: game.decor, flowers: game.flowers,       painting: game.painting, visitorsSeen: game.visitorsSeen,
      inventory: game.inventory, specialOwned: game.specialOwned,
      todayVisitors: game.todayVisitors, visitorQueueIdx: game.visitorQueueIdx, visitorSpawnTimer: game.visitorSpawnTimer,
      dayVisitorsRolled: game.dayVisitorsRolled, readBook: game.readBook, readChapter: game.readChapter,
      day: game.day, currentMap: game.currentMap, clock: game.clock,
      treeClaimed: game.treeClaimed, outfit: game.outfit,
      controlMode: game.controlMode,   // F15：操作模式持久化
      speedMode: game.speedMode,       // 速度模式持久化（fast/slow）
      weather: game.weather,           // 当日天气持久化（重载仍同天同天气）
      pillsCrafted: game.pillsCrafted, monstersDefeated: game.monstersDefeated,  // 回顾统计
      brewing: game.brewing,   // F1：炼制中状态（重载后按 endMs 继续倒计时）
      travel: game.travel,     // F16：游历状态（重载后按 endMs 继续倒计时；已过期由 updateTravel 收尾）
      mini: game.mini,         // 家园小游戏：半局序列化（重载后仅当天可续，跨天由 loadGame 丢弃）
      miniResume: game.miniResume,   // 家园小游戏：暂停的半局（退出后当天内再开可续）
      lastStarDay: game.lastStarDay, // F6：上次自动观星介绍的游戏内日（每天首次触发，重载保留）
    };
    safeStore.setItem(slotKey(idx), JSON.stringify(o));
  } catch (e) { /* 存储不可用时静默 */ }
}
function loadGame(slot) {
  try {
    const raw = safeStore.getItem(slotKey(slot));
    if (!raw) { Object.assign(game, defaultSaveFields()); return; }   // 新游戏：随机首日天气
    const o = JSON.parse(raw); if (!o || o.v !== 1) return;
    game.affinity = o.affinity || 0;
    game.diary = Array.isArray(o.diary) ? o.diary : [];
    game.codex = o.codex || {};
    // F9 迁移：旧档 books 为字符串数组 → 迁移为 { bookId:[章节号...] }（每书取第 1 章）
    if (o.books && typeof o.books === "object" && !Array.isArray(o.books)) game.books = o.books;
    else if (Array.isArray(o.books)) {
      const migrated = {};
      for (const id of o.books) { const b = (C.books || []).find((x) => x.id === id); migrated[id] = [ (b && b.chapters && b.chapters[0] && b.chapters[0].n) || 1 ]; }
      game.books = migrated;
    } else game.books = seedBooks();
    game.decor = o.decor || {};
    game.flowers = o.flowers || {};
    game.painting = (o.painting && Array.isArray(o.painting.colored) && o.painting.colored.length === 54)
      ? o.painting : { colored: new Array(54).fill(false), lastDay: 0 };
    game.visitorsSeen = Array.isArray(o.visitorsSeen) ? o.visitorsSeen : [];
    game.inventory = o.inventory || {};
    game.specialOwned = o.specialOwned || {};
    game.day = (typeof o.day === "number" && o.day > 0) ? o.day : 1;
    game.clock = (typeof o.clock === "number" && o.clock >= 0 && o.clock < 1) ? o.clock : 0.40;
    game.currentMap = (typeof o.currentMap === "number" && o.currentMap >= 0) ? o.currentMap : 0;
    // 回顾统计（缺省兜底 0，兼容旧档）
    game.pillsCrafted = (typeof o.pillsCrafted === "number") ? o.pillsCrafted : 0;
    game.monstersDefeated = (typeof o.monstersDefeated === "number") ? o.monstersDefeated : 0;
    // F14-lite / M5 修复：treeClaimed 与 outfit 持久化（避免同日刷新后丢失）
    game.treeClaimed = !!o.treeClaimed;
    game.outfit = (o.outfit && typeof o.outfit === "object") ? o.outfit : {};
    // F15：操作模式持久化（缺省取配置默认，保证 fallback 稳健）
    game.controlMode = (o.controlMode === "auto") ? "auto"
      : ((window.GAME_CONFIG && window.GAME_CONFIG.mode && window.GAME_CONFIG.mode.default) || "manual");
    game.speedMode = (o.speedMode === "slow") ? "slow" : "fast"; setDayCycle();
    game.weather = (o.weather && weatherName(o.weather)) ? o.weather : "qing";   // 当日天气：缺省回落「晴」
    game.lastInputAt = (typeof performance !== "undefined") ? performance.now() : 0;   // 载入后重置闲置计时，避免立即误切自动
    // F8/F9 补充字段（缺省兜底，兼容旧档）
    game.visitorsSeen = Array.isArray(o.visitorsSeen) ? o.visitorsSeen : [];
    game.todayVisitors = Array.isArray(o.todayVisitors) ? o.todayVisitors : [];
    game.lastStarDay = (typeof o.lastStarDay === "number") ? o.lastStarDay : -1;   // F6：上次自动观星介绍的日（缺省兜底，兼容旧档）
    game.visitorQueueIdx = (typeof o.visitorQueueIdx === "number") ? o.visitorQueueIdx : 0;
    game.visitorSpawnTimer = (typeof o.visitorSpawnTimer === "number") ? o.visitorSpawnTimer : 12;
    game.dayVisitorsRolled = !!o.dayVisitorsRolled;
    game.readBook = o.readBook || null;
    game.readChapter = (typeof o.readChapter === "number") ? o.readChapter : null;
    game.brewing = (o.brewing && typeof o.brewing === "object" && o.brewing.recipeId) ? o.brewing : null;  // F1：炼制中状态
    game.travel = (o.travel && typeof o.travel === "object" && o.travel.phase) ? o.travel : null;          // F16：游历状态（phase 校验防脏数据）
    game.mini = (o.mini && typeof o.mini === "object" && o.mini.day === game.day && o.mini.type) ? o.mini : null;   // 家园小游戏：仅当天存档可续（跨天/跨会话复活半局丢弃）
    game.miniResume = (o.miniResume && typeof o.miniResume === "object" && o.miniResume.day === game.day && o.miniResume.type) ? o.miniResume : null;   // 家园小游戏：暂停的半局（当天可续）
    // F16：曾获得集合（旧档无此字段时，从既有 codex/books/specialOwned/inventory 派生，避免旧档图鉴突然变灰）
    game.everOwned = o.everOwned && typeof o.everOwned === "object" ? o.everOwned : null;
    if (!game.everOwned) {
      game.everOwned = {};
      for (const k in (game.codex || {})) game.everOwned[k] = true;
      for (const k in (game.books || {})) game.everOwned[k] = true;
      for (const k in (game.specialOwned || {})) game.everOwned[k] = true;
      for (const k in (game.inventory || {})) if ((game.inventory[k] || 0) > 0) game.everOwned[k] = true;
    }
    game.saveSlot = slot;   // 记录当前激活槽，后续 saveGame 自动写入此槽
    loadMap(game.currentMap);   // 同步当前激活地图（家园态下不影响渲染，外出时会被重置）
    for (const k in (C.sisters || {})) applyOutfit(k);   // F14-lite：按已存档 outfit 同步角色皮肤
    game.bubble = null;   // F8：瞬态氛围不随存档恢复，载入后强制清空（防御旧档脏数据）
  } catch (e) { /* 损坏存档忽略 */ }
}
/* ---------- 多存档槽：元数据 / 初始化 / 新游戏 ---------- */
// 读取某槽元数据（不载入玩法数据）：{ day, ts, weather } 或 null（空槽/损坏）
function readSlotMeta(i) {
  try {
    const raw = safeStore.getItem(slotKey(i));
    if (!raw) return null;
    const o = JSON.parse(raw); if (!o || o.v !== 1) return null;
    return { day: (typeof o.day === "number" && o.day > 0) ? o.day : 1, ts: o.ts || 0, weather: o.weather || "qing" };
  } catch (e) { return null; }
}
// 启动时调用：读取所有槽 meta（供标题界面显示），并把旧版单一存档迁移到槽0（仅当三槽皆空）
function initSlots() {
  game.saveSlot = null;
  game.slotMetas = [];
  if (!safeStore.getItem(slotKey(0)) && !safeStore.getItem(slotKey(1)) && !safeStore.getItem(slotKey(2))) {
    const legacy = safeStore.getItem(SAVE_LEGACY);
    if (legacy) { try { safeStore.setItem(slotKey(0), legacy); safeStore.removeItem(SAVE_LEGACY); } catch (e) {} }
  }
  for (let i = 0; i < SAVE_COUNT; i++) game.slotMetas.push(readSlotMeta(i));
}
// 开始新游戏（写入指定槽，覆盖既有内容）
function newGame(slot) {
  Object.assign(game, defaultSaveFields());
  game.scene = "home"; game.state = "home"; game.panel = null; game.confirm = null;
  game.sleeping = null; game.inDialogue = false; game.forcedRest = false; game.pendingRest = false;
  game.controlMode = ((window.GAME_CONFIG && window.GAME_CONFIG.mode && window.GAME_CONFIG.mode.default) || "manual");
  game.lastInputAt = (typeof performance !== "undefined") ? performance.now() : 0;
  game.autoTarget = null; game.autoIdle = 0; game.autoStuck = 0; game.autoSkip = {};
  game.autoPaintStuck = 0; game.autoPaintSkip = false;
  game.autoTreeSkip = false; game.autoVisitorSkip = false;
  game.autoChenOfLastTask = -1; game.autoActiveTask = null;   // F15-增强：每时辰1项节流状态
  game.speedMode = "fast"; setDayCycle();                        // 速度模式（快=30s/时辰）
  game.saveSlot = slot;
  game.weather = pickWeatherId();   // 随机首日天气
  saveGame(slot);                   // 立即落盘，空槽 → 占用
  for (const k in (C.sisters || {})) applyOutfit(k);   // F14-lite：新号默认皮肤
  loadMap(game.currentMap);
}

function resetSave(slot) {
  const idx = (slot != null) ? slot : (game.saveSlot != null ? game.saveSlot : 0);
  try { safeStore.removeItem(slotKey(idx)); } catch (e) {}
  Object.assign(game, defaultSaveFields());
  game.scene = "home"; game.state = "home"; game.panel = null; game.confirm = null;
  game.sleeping = null; game.inDialogue = false; game.forcedRest = false; game.pendingRest = false;
  game.controlMode = ((window.GAME_CONFIG && window.GAME_CONFIG.mode && window.GAME_CONFIG.mode.default) || "manual");
  game.lastInputAt = (typeof performance !== "undefined") ? performance.now() : 0;
  game.autoTarget = null; game.autoIdle = 0; game.autoStuck = 0; game.autoSkip = {};   // F15：自动模式防卡死状态
  game.autoPaintStuck = 0; game.autoPaintSkip = false;                                  // F15 微调：自动作画状态
  game.autoTreeSkip = false; game.autoVisitorSkip = false;                              // 自动：大树/访客“走不到”放弃标记
  game.autoTreeStuck = 0; game.autoVisitorStuck = 0;                                    // 自动：大树/访客 卡死计时
  game.autoChenOfLastTask = -1; game.autoActiveTask = null;                             // F15-增强：每时辰1项节流状态
  game.speedMode = "fast"; setDayCycle();                                                  // 速度模式重置
}

/* ===== src/draw_ambient.js ===== */
/* 自动抽取：场景氛围绘制（颜色工具/气泡/天象/夜空/萤火/模式徽章）。
   源：scenes.js；与 scenes 其余绘制文件同享全局作用域，须在 scenes 调用方之前加载。 */
/* ===== scenes.js 98-103 ===== */
function hexToRgb(h) {
  h = (h || "#000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/* ===== scenes.js 104-106 ===== */
function rgbaOf(hex, a) { const c = hexToRgb(hex); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a == null ? 1 : a) + ")"; }

// 三图各有一套自然配色：晨露(青绿) / 薄雾(水蓝) / 晚照(暖橙)
/* ===== scenes.js 806-815 ===== */
function yltRoundRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
/* ===== scenes.js 816-823 ===== */
function drawBubbles(now) {
  if (!game.bubble || game.showTitle) return;     // 标题 splash 下不绘制（避免压在标题上）
  const b = game.bubble;
  const firstS = (b.first === "shijie") ? sisters.shijie : sisters.shimei;
  const secondS = (b.first === "shijie") ? sisters.shimei : sisters.shijie;
  drawBubbleAt(firstS, b, now, b.t0, b.t0 + b.dur);
  drawBubbleAt(secondS, b, now, b.t0 + b.secondDelay, b.t0 + b.secondDelay + b.dur);
}
/* ===== scenes.js 824-863 ===== */
function drawBubbleAt(s, b, now, appear, end) {
  const tt = now - appear;
  if (tt < 0) return;                            // 第二人尚未到出现时间（延迟 secondDelay）
  const fadeIn = 250, fadeOut = 350;
  let a = 1;
  if (tt < fadeIn) a = tt / fadeIn;
  else if (end - now < fadeOut) a = Math.max(0, (end - now) / fadeOut);
  a = Math.max(0, Math.min(1, a));
  if (a <= 0) return;
  const breathe = Math.sin(now / 600 + (s.id === "shijie" ? 0 : 1.7)) * 1.2;
  const charScale = (s.id === "shijie") ? 1.1 : 1.0;
  const dh = 34 * 2.0 * charScale;
  const headTop = s.pos.y + breathe + 11 - dh;
  const R = 11;
  const cx = s.pos.x, cy = headTop - R - 2;      // 气泡中心略高于头顶
  ctx.save();
  ctx.globalAlpha = a;
  // 投影
  ctx.fillStyle = "rgba(40,30,20,0.16)";
  ctx.beginPath(); ctx.ellipse(cx, cy + R + 1.5, R * 0.72, R * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  // 气泡主体（圆角方块，读作“对话气泡”）
  ctx.fillStyle = "#fffaf2";
  ctx.strokeStyle = "rgba(120,100,80,0.35)";
  ctx.lineWidth = 1.2;
  yltRoundRect(cx - R, cy - R, R * 2, R * 2, R * 0.55);
  ctx.fill(); ctx.stroke();
  // 朝下的小尾巴（指向头顶）
  ctx.beginPath();
  ctx.moveTo(cx - 3.5, cy + R - 1.5);
  ctx.lineTo(cx, cy + R + 6);
  ctx.lineTo(cx + 3.5, cy + R - 1.5);
  ctx.closePath();
  ctx.fillStyle = "#fffaf2"; ctx.fill();
  // 图标
  const ir = R * 0.6;
  if (b.type === "flower") drawBubbleFlower(cx, cy, ir);
  else if (b.type === "heart") drawBubbleHeart(cx, cy, ir);
  else drawBubbleSmile(cx, cy, ir);
  ctx.restore();
}
/* ===== scenes.js 864-873 ===== */
function drawBubbleFlower(cx, cy, r) {
  const petal = r * 0.42;
  ctx.fillStyle = "#f48fb1";
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * petal, cy + Math.sin(ang) * petal, petal * 0.85, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath(); ctx.arc(cx, cy, petal * 0.7, 0, Math.PI * 2); ctx.fill();
}
/* ===== scenes.js 874-883 ===== */
function drawBubbleHeart(cx, cy, r) {
  ctx.fillStyle = "#ef5350";
  ctx.beginPath();
  const s = r * 0.95;
  ctx.moveTo(cx, cy + s * 0.5);
  ctx.bezierCurveTo(cx - s, cy - s * 0.2, cx - s * 0.5, cy - s, cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx + s * 0.5, cy - s, cx + s, cy - s * 0.2, cx, cy + s * 0.5);
  ctx.closePath();
  ctx.fill();
}
/* ===== scenes.js 884-896 ===== */
function drawBubbleSmile(cx, cy, r) {
  ctx.lineCap = "round";
  ctx.fillStyle = "#ef9a1e";
  ctx.strokeStyle = "#ef9a1e";
  ctx.lineWidth = Math.max(1.2, r * 0.18);
  ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.05, r * 0.45, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}


/* ---------- 昼夜滤镜（覆盖在场景之上，不影响玩法） ---------- */
// 0=子夜 0.5=正午，返回亮度 0..1
/* ===== scenes.js 897-897 ===== */
function dayLight(t) { return (Math.cos(2 * Math.PI * (t - 0.5)) + 1) / 2; }
/* ===== scenes.js 898-903 ===== */
const nightStars = [];
for (let i = 0; i < 46; i++) nightStars.push({
  x: Math.random() * W, y: Math.random() * H * 0.62,
  r: Math.random() * 1.2 + 0.4, ph: Math.random() * Math.PI * 2,
});
// 萤火：夜色中缓缓浮动的暖绿光点（家园更显，外出夜色亦可）
/* ===== scenes.js 904-912 ===== */
const nightFireflies = [];
for (let i = 0; i < 18; i++) nightFireflies.push({
  x: Math.random() * W, y: Math.random() * H, ph: Math.random() * Math.PI * 2,
  r: Math.random() * 1.0 + 0.6, sp: 0.18 + Math.random() * 0.32,
});

/* ---------- 共用昼夜指示组件（家园 / 外出 双场景统一调用） ----------
 * 在顶部给定中心画一条半圆弧线（昼夜轨迹），并按 game.clock 把太阳/月亮
 * 摆到对应相位：日升(左) → 正午(顶) → 日落(右)；夜间同轨迹显示月亮。 */
/* ===== scenes.js 913-938 ===== */
function drawCelestialIndicator(cx, cy) {
  const L = dayLight(game.clock);
  const R = 15;
  ctx.save();
  // 轨迹弧（淡金，半透明）
  ctx.strokeStyle = "rgba(232,192,106,0.30)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI * 2); ctx.stroke();
  // 相位：0→左, 0.5→顶, 1→右（完整 24h 弧）
  const ang = Math.PI * (1 - game.clock);
  const px = cx + R * Math.cos(ang), py = cy - R * Math.sin(ang);
  if (L > 0.5) {   // 白天：太阳
    glow(true, "rgba(232,192,106,0.85)", 10);
    ctx.fillStyle = "#f3d27a";
    ctx.beginPath(); ctx.arc(px, py, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); glow(false);
  } else {          // 夜间：月亮（带缺角）
    ctx.fillStyle = "#e8ecf6";
    ctx.beginPath(); ctx.arc(px, py, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(58,48,39,0.5)";
    ctx.beginPath(); ctx.arc(px + 3, py - 2, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
/* ---------- 顶栏「日月弧线 + 天数层」装饰填充底板 ----------
 * 半透米白圆角板 + 淡金描边 + 底部金线 + 两端小云点，作为顶栏中央 HUD 模块的装饰背板。 */
/* ===== scenes.js 939-956 ===== */
function drawCelestialBanner(cx, topY, botY, w) {
  card(cx - w / 2, topY, w, botY - topY, 10, "rgba(247,239,225,0.82)", "rgba(232,192,106,0.55)");
  ctx.save();
  // 底部装饰金线（层级分隔，两侧留白）
  ctx.strokeStyle = "rgba(232,192,106,0.45)"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + 12, botY - 2);
  ctx.lineTo(cx + w / 2 - 12, botY - 2);
  ctx.stroke();
  // 两枚小云点（装饰），点缀底板两端
  ctx.fillStyle = "rgba(232,192,106,0.32)";
  ctx.beginPath(); ctx.arc(cx - w / 2 + 8, topY + 8, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + w / 2 - 8, topY + 8, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ---------- 操作模式徽标（家园 / 外出 共用） ----------
 * 画一枚「手动 ⇄ 自动」小药丸，点击切换；命中区记入全局 modeBadgeRect。 */
/* ===== scenes.js 957-957 ===== */
const modeBadgeRect = { x: 0, y: 0, w: 0, h: 0 };
/* ===== scenes.js 958-972 ===== */
function drawModeBadge(x, y, w, h) {
  modeBadgeRect.x = x; modeBadgeRect.y = y; modeBadgeRect.w = w; modeBadgeRect.h = h;
  const auto = (game.controlMode === "auto");
  const fill = auto ? "rgba(120,160,120,0.95)" : "rgba(247,239,225,0.95)";
  const line = auto ? "rgba(70,100,70,0.8)" : "rgba(58,48,39,0.5)";
  card(x, y, w, h, h / 2, fill, line);
  // 左侧小圆点（绿=自动 在动 / 褐=手动 待命）
  ctx.fillStyle = auto ? "#6fae87" : "#b07b4a";
  ctx.beginPath(); ctx.arc(x + 10, y + h / 2, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = auto ? "#fff" : TH.ink;
  ctx.font = "bold 11px " + TH.fontBody;
  ctx.fillText(auto ? "自动" : "手动", x + w / 2 + 4, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
}
/* ===== scenes.js 973-978 ===== */
function hitModeBadge(lx, ly) {
  if (game.scene !== "home") return false;   // 徽标仅家园显示（外出界面已隐藏），避免遗留命中区误触
  const r = modeBadgeRect;
  return (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h);
}

/* ===== scenes.js 979-1000 ===== */
function drawFireflies(now, night) {
  const a = Math.max(0, (night - 0.35) / 0.65);   // 0.35→0, 1→1
  if (a <= 0) return;
  // 与场景绑定：横向 1:1 跟随相机（家园），模 W 循环，随场景滚动而非贴屏
  const camX = (game.scene === "home") ? homeCamX : 0;
  ctx.save();
  for (const f of nightFireflies) {
    let fx = ((f.x - camX) % W + W) % W;
    fx += Math.sin(now / 700 + f.ph) * 6;
    const fy = (f.y - ((now / 1000 * f.sp) % H) + H) % H;
    const tw = 0.4 + 0.6 * Math.sin(now / 300 + f.ph);
    ctx.globalAlpha = a * tw * 0.85;
    glow(true, "rgba(220,240,150,0.9)", 5);
    ctx.fillStyle = "rgba(230,245,160,0.95)";
    ctx.beginPath(); ctx.arc(fx, fy, f.r, 0, Math.PI * 2); ctx.fill();
    glow(false);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// 夜窗暖光：夜晚窗内透出暖色光晕（仅家园；位置随横向相机还原）
/* ===== scenes.js 1001-1191 ===== */
function drawNightWindowGlow(now, night) {
  const wf = (C.furniture || []).find((f) => f.id === "window"); if (!wf) return;
  const px = (wf.x + 0.5) * TILE - homeCamX;
  const py = (wf.y + 1.5) * TILE;
  const g = ctx.createRadialGradient(px, py, 2, px, py, 62);
  const a = night * 0.5 * (0.7 + 0.3 * Math.sin(now / 600));
  g.addColorStop(0, "rgba(255,214,140," + a.toFixed(3) + ")");
  g.addColorStop(1, "rgba(255,214,140,0)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(px - 62, py - 62, 124, 124); ctx.restore();
}

function drawDayNight(now) {
  const L = dayLight(game.clock);
  const night = Math.max(0, (0.45 - L) / 0.45);     // 0(黄昏临界) → 1(子夜)
  const dusk = Math.max(0, 1 - Math.abs(L - 0.45) / 0.12);  // 黄昏/黎明过渡小窗
  // ① 夜色天幕：深蓝竖向渐变，平方曲线——子夜最浓，黄昏仅微染
  if (night > 0.001) {
    const a = night * night * 0.46;
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(26,30,60," + (a * 1.12).toFixed(3) + ")");
    g.addColorStop(1, "rgba(14,18,42," + a.toFixed(3) + ")");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // ② 暮/曙暖紫渐变（仅过渡瞬间，柔和不抢戏）
  if (dusk > 0.001) {
    const a = dusk * 0.16;
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(244,150,92," + a.toFixed(3) + ")");
    g.addColorStop(1, "rgba(120,70,110,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // ③ 晨曦暖调（日出前后极短一瞬）
  const dawn = Math.max(0, 1 - Math.abs(L - 0.55) / 0.10) * 0.05;
  if (dawn > 0.002) {
    ctx.save(); ctx.fillStyle = "rgba(245,200,150," + dawn.toFixed(3) + ")";
    ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // ④ 星辰（夜深）
  if (night > 0.5) {
    const sa = (night - 0.5) / 0.5;
    for (const s of nightStars) {
      const tw = 0.5 + 0.5 * Math.sin(now / 520 + s.ph);
      ctx.save(); ctx.globalAlpha = sa * tw * 0.9; ctx.fillStyle = "#fdf6e3";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  // ⑤ 萤火（夜色渐起）
  if (night > 0.35) drawFireflies(now, night);
  // ⑥ 窗光暖色（仅家园，夜窗透出暖意）
  if (night > 0.2 && game.scene === "home") drawNightWindowGlow(now, night);
}

/* ---------- 天气叠层（昼夜之上、HUD 之下） ----------
 * 每日随机一种天气（config/10_weather.js 配置权重）：
 *   晴 clear（右上柔光）/ 阴 overcast（灰幕+云带）/ 多云 cloudy（淡幕+云带）/ 雨 rain（雨丝+冷幕，intensity 控密度）
 * 仅在 draw() 中调用，覆盖世界但位于 HUD 之下。 */
let weatherRain = null;     // 雨丝粒子池
let weatherRainFor = null;  // 记录当前天气 id，变化则重建雨池
// 家园院子边界（世界 tile 列）：右侧 10 列（列 10..19）为院子，列 1..9 为房间；
// 房间内不显示天气叠层，仅院子区域渲染（按横向相机换算到屏幕裁剪）。
// 注：最右列 19 已设为可行走（去空气墙），故天气须覆盖到地图最右边缘（含最后一列）。
const HOME_YARD_MIN_COL = 10;
const HOME_YARD_MAX_COL = 19;
function drawWeather(now) {
  const w = (window.GAME_CONFIG && window.GAME_CONFIG.weather && window.GAME_CONFIG.weather.list.find((x) => x.id === game.weather)) || null;
  if (!w) return;
  const outing = (game.scene === "outing");
  ctx.save();
  if (!outing) {
    // 家园：仅院子（右侧 9 列）显示天气，房间内不覆盖。按横向相机换算到屏幕裁剪。
    const wx0 = HOME_YARD_MIN_COL * TILE;
    const wx1 = (HOME_YARD_MAX_COL + 1) * TILE;     // 右边界 = 列 20 起点（地图最右，覆盖最后一列）
    const sx0 = Math.max(0, wx0 - homeCamX);
    const sx1 = Math.min(W, wx1 - homeCamX);
    if (sx1 <= sx0) { ctx.restore(); return; }       // 当前镜头未照到院子 → 不显示天气
    ctx.beginPath(); ctx.rect(sx0, 0, sx1 - sx0, H); ctx.clip();
  }
  if (w.kind === "clear") {
    // 晴：右上角极克制的暖光，提亮氛围（屏幕空间，不随相机）
    const g = ctx.createRadialGradient(W * 0.82, H * 0.10, 4, W * 0.82, H * 0.10, H * 0.55);
    g.addColorStop(0, "rgba(255,244,210,0.10)"); g.addColorStop(1, "rgba(255,244,210,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (w.kind === "overcast") {
    ctx.fillStyle = "rgba(120,124,130,0.20)"; ctx.fillRect(0, 0, W, H);
    if (!outing) ctx.translate(-homeCamX, 0);   // 云带锚定院子世界坐标，随相机平移，不再绑定角色
    drawCloudBands(now, 0.5, "rgba(212,214,218,0.18)", outing ? W : (HOME_YARD_MAX_COL + 1) * TILE);
  } else if (w.kind === "cloudy") {
    ctx.fillStyle = "rgba(150,154,160,0.10)"; ctx.fillRect(0, 0, W, H);
    if (!outing) ctx.translate(-homeCamX, 0);
    drawCloudBands(now, 1.0, "rgba(226,228,231,0.24)", outing ? W : (HOME_YARD_MAX_COL + 1) * TILE);
  } else if (w.kind === "rain") {
    const inten = w.intensity || 0.5;
    ctx.fillStyle = "rgba(90,110,130," + (0.08 + inten * 0.12).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H);
    if (!outing) ctx.translate(-homeCamX, 0);
    drawRain(now, inten, outing ? W : (HOME_YARD_MAX_COL + 1) * TILE);
  }
  ctx.restore();
}
// 云带在世界/屏幕坐标系绘制（span = 当前坐标系宽度）；time 驱动缓慢飘移，不再与角色位置绑定
function drawCloudBands(now, spd, col, span) {
  ctx.fillStyle = col;
  const spanP = span + 140;
  const off = (now / 6000 * spd) % spanP;
  for (let i = 0; i < 6; i++) {
    const y = 18 + i * 34;
    const x = ((i * 173 + off) % spanP) - 70;
    ctx.beginPath();
    ctx.ellipse(x, y, 48, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 40, y + 4, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
// 雨丝：明显可见的斜线；粒子在当前坐标系内循环。天气或场景变化则重建雨池
function drawRain(now, inten, span) {
  const sceneKey = game.scene === "outing" ? "out" : "home";
  if (!weatherRain || weatherRainFor !== game.weather + "|" + sceneKey) {   // 天气/场景切换均重建
    const n = Math.round(40 + inten * 120);
    weatherRain = [];
    for (let i = 0; i < n; i++) weatherRain.push({ x: Math.random() * span, y: Math.random() * H, l: 7 + Math.random() * 10, s: (240 + Math.random() * 200) * 0.6, a: 0.45 + Math.random() * 0.35 });
    weatherRainFor = game.weather + "|" + sceneKey;
  }
  ctx.strokeStyle = "rgba(150,175,205,0.9)"; ctx.lineWidth = 1.3;
  const dt = 1 / 60;
  for (const d of weatherRain) {
    d.y += d.s * dt * (1 + inten * 0.4);
    if (d.y > H) { d.y = -d.l - Math.random() * 40; d.x = Math.random() * span; }
    ctx.globalAlpha = d.a * (0.6 + inten * 0.4);
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + d.l); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ---------- 过夜动画（就寝确认后播放，约 2.6s） ---------- */
function drawSleep(now) {
  const s = game.sleeping; if (!s) return;
  const D = 2.6, p = Math.min(1, s.t / D);
  ctx.fillStyle = "#0c1126"; ctx.fillRect(0, 0, W, H);
  // 星河
  for (const st of nightStars) {
    const tw = 0.5 + 0.5 * Math.sin(now / 500 + st.ph);
    ctx.globalAlpha = tw * 0.9; ctx.fillStyle = "#fdf6e3";
    ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // —— 日月沿天弧轨迹：月自顶沉向西(左)落，日自东(右)地平升，单调无回弹 ——
  // 显示区域适当缩小：弧半径与天体尺寸均收敛，使过夜画面更聚焦
  const cx = W / 2, cy = H * 0.45, R = H * 0.20;
  // 弧上参数 u：0=左地平, 0.5=正顶, 1=右地平
  const arcPos = (u) => ({ x: cx - R * Math.cos(Math.PI * u), y: cy - R * Math.sin(Math.PI * u) });
  // 月（夜）：u 由 0.5(顶) → 0(左地平，西沉)，p:0→0.5；接近地平淡出
  if (p < 0.56) {
    const mu = 0.5 * (1 - Math.min(1, p / 0.5) * 1.06);
    const m = arcPos(Math.max(0, mu));
    const ma = (p < 0.5) ? 1 : Math.max(0, 1 - (p - 0.5) / 0.06);
    ctx.save(); ctx.globalAlpha = ma;
    glow(true, "rgba(220,230,255,0.85)", 14);
    ctx.fillStyle = "#eef2ff"; ctx.beginPath(); ctx.arc(m.x, m.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); glow(false); ctx.globalAlpha = 1;
  }
  // 日（晨）：u 由 1(右地平) → 0.5(顶)，p:0.5→1；自地平淡入
  if (p > 0.5) {
    const da = (p - 0.5) / 0.5;
    const m = arcPos(1 - 0.5 * da);
    const sa = Math.min(1, da / 0.16);
    ctx.save(); ctx.globalAlpha = sa;
    const g = ctx.createLinearGradient(0, H, 0, m.y);
    g.addColorStop(0, "rgba(245,210,150," + (0.55 * da).toFixed(2) + ")");
    g.addColorStop(1, "rgba(245,210,150,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glow(true, "rgba(240,200,120,0.9)", 17);
    ctx.fillStyle = "#f3d27a"; ctx.beginPath(); ctx.arc(m.x, m.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); glow(false); ctx.globalAlpha = 1;
  }
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  if (p < 0.5) {
    ctx.fillStyle = "rgba(243,234,217,0.92)"; ctx.font = "14px " + TH.fontBody;
    ctx.fillText("夜深了，两人关上了床幔。", W / 2, H * 0.66);
  } else {
    ctx.fillStyle = "rgba(58,48,39,0.92)"; ctx.font = "bold 16px " + TH.fontTitle;
    ctx.fillText("翌日 · 第 " + (game.day + 1) + " 日", W / 2, H * 0.52);
    ctx.fillStyle = "rgba(58,48,39,0.72)"; ctx.font = "12px " + TH.fontBody;
    ctx.fillText("晨起，山雾未散。", W / 2, H * 0.52 + 22);
  }
  // 开场淡入夜
  if (p < 0.18) { ctx.fillStyle = "rgba(12,17,38," + (1 - p / 0.18).toFixed(2) + ")"; ctx.fillRect(0, 0, W, H); }
}

/* ===== src/draw_sprites.js ===== */
/* 自动抽取：角色/花草/访客精灵绘制。源：scenes.js。 */
/* ===== scenes.js 20-97 ===== */
function drawSister(s, isActive, sc, ring, spriteDy) {
  sc = sc || 1;
  if (s.dead) {
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#9a9088"; ctx.beginPath(); ctx.arc(s.pos.x, s.pos.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "10px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("倒", s.pos.x, s.pos.y); ctx.restore(); ctx.textBaseline = "alphabetic";
    return;
  }
  const now = performance.now();
  const breathe = Math.sin(now / 600 + (s.id === "shijie" ? 0 : 1.7)) * 1.2;
  const bx = s.pos.x;
  const groundY = s.pos.y;                                  // 阴影锚点（地面，恒定，不随浮动）
  const by = groundY + breathe + (spriteDy || 0);           // 立绘绘制基线（含呼吸 + 可选浮动偏移）
  const blink = s.invuln > 0 && (Math.floor(s.invuln * 12) % 2 === 0);
  if (blink) return;
  // 阴影：以屏幕坐标绘制于地面（在缩放块之外），锚定 groundY，不随立绘浮动/呼吸/缩放而上下移动
  ctx.fillStyle = "rgba(58,48,39,0.22)";
  ctx.beginPath(); ctx.ellipse(bx, groundY + 12 * sc, 9 * sc, 3.4 * sc, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(bx, by); ctx.scale(sc, sc); ctx.translate(-bx, -by);
  // 主动画角色身外光圈已移除，避免视觉干扰（主控态由顶部 HUD 表达）
  const img = skinImg[s.id];
  // 角色间身高校正：师姐阎明比师妹清凝放大 1.1 倍显示；
  // 阎明皮肤2（名仁联名）在其基础上再额外放大 1.2 倍。
  let charScale = 1;
  if (s.id === "shijie") {
    charScale = 1.1;
    if (currentOutfitIndex(s.id) === 1) charScale *= 1.2;
  }
  if (img) {
    // 立绘按「高度」判断是否缩放：仅当图片高度超出 boxH 时才等比收缩到 boxH；
    // 仅宽度超出则保持原尺寸（允许横向溢出，不整体缩小）——不同立绘宽度不同也不会被压扁。
    // 家园 / 外出共用此逻辑；对话立绘在 ui.js 单独处理，不受影响。
    const boxH = 34;
    const iw = img.width || boxH, ih = img.height || boxH;
    let dw, dh;
    if (ih > boxH) { const k = boxH / ih; dh = boxH; dw = iw * k; }
    else { dh = ih; dw = iw; }
    dw *= charScale; dh *= charScale;   // 角色间身高校正（阎明放大）
    // 朝右时水平翻转立绘（原图面朝左）
    if (s.facing && s.facing.x > 0) {
      ctx.save();
      ctx.translate(bx, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -dw / 2, by + 11 - dh, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(img, bx - dw / 2, by + 11 - dh, dw, dh);
    }
  } else {
    ctx.save(); ctx.translate(bx, by); ctx.scale(charScale, charScale); ctx.translate(-bx, -by);
    const skin = "#f3d9c0", hair = "#3a3027", robe = s.color, trim = s.accent || s.color;
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(bx - 7, by + 12); ctx.lineTo(bx + 7, by + 12);
    ctx.lineTo(bx + 5, by - 2); ctx.lineTo(bx - 5, by - 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = trim; ctx.fillRect(bx - 5, by + 3.5, 10, 2.4);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(bx, by - 6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(bx, by - 6.5, 6.2, Math.PI * 1.04, Math.PI * 1.96); ctx.fill();
    ctx.fillRect(bx - 6, by - 7, 2.2, 6); ctx.fillRect(bx + 3.8, by - 7, 2.2, 6);
    ctx.fillStyle = trim; ctx.beginPath(); ctx.arc(bx, by - 11.6, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a2218";
    ctx.beginPath(); ctx.arc(bx - 2.2, by - 5.4, 1, 0, Math.PI * 2); ctx.arc(bx + 2.2, by - 5.4, 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(232,140,130,0.5)";
    ctx.beginPath(); ctx.arc(bx - 3.6, by - 3.6, 1.3, 0, Math.PI * 2); ctx.arc(bx + 3.6, by - 3.6, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#9a5a4a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx, by - 3.6, 1.8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  if (game.scene === "outing") {
    if (s.attackFx > 0) { ctx.save(); glow(true, "rgba(255,255,255,0.8)", 8); ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, s.skills.attack.range, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); glow(false); }
    if (s.healFx > 0) { ctx.save(); glow(true, "rgba(159,207,134,0.8)", 8); ctx.strokeStyle = "rgba(159,207,134,0.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); glow(false); }
  }
}

/* ---------- 外出场景：主题配色（三图差异化） ---------- */
/* ===== scenes.js 304-317 ===== */
function drawHerb(cx, cy, now, seed, hue) {
  ctx.fillStyle = "rgba(120,90,60,0.32)";
  ctx.beginPath(); ctx.ellipse(cx, cy + 9, 9, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  const sway = Math.sin(now / 900 + seed) * 2.2;
  ctx.save();
  ctx.strokeStyle = "#4a5e3e"; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.quadraticCurveTo(cx + sway, cy, cx + sway, cy - 7); ctx.stroke();
  ctx.fillStyle = hue || PAL.herb;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sway + s * 4, cy - 2, 4, 2.2, s * 0.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.save(); glow(true, "rgba(255,255,255,0.8)", 5);
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(cx + sway, cy - 8, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); glow(false);
  ctx.restore();
}
/* ===== scenes.js 651-664 ===== */
function drawFlowerIcon(cx, cy, r, petalColor, centerColor) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = petalColor;
  for (let p = 0; p < 5; p++) {
    const a = -Math.PI / 2 + p * (Math.PI * 2 / 5);
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05, r * 0.62, r * 0.95, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// 草药叶片图标（替换原椭圆占位）：尖叶 + 主脉 + 叶柄
/* ===== scenes.js 665-678 ===== */
function herbLeafIcon(cx, cy, s, color, dim) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, s);                                       // 叶柄底端
  ctx.quadraticCurveTo(-s * 0.95, s * 0.05, 0, -s);       // 左弧至叶尖
  ctx.quadraticCurveTo(s * 0.95, s * 0.05, 0, s);         // 右弧回叶柄
  ctx.fill();
  if (!dim) {
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, s * 0.82); ctx.lineTo(0, -s * 0.82); ctx.stroke();   // 主脉
  }
  ctx.restore();
}
/* ===== scenes.js 767-805 ===== */
function drawVisitor(now) {
  if (!game.visitor) return;
  const v = game.visitor, x = v.x, y = v.y;
  const bob = (v.walking) ? Math.sin(v.walkPhase || 0) * 1.2 : 0;   // 行走时整体上下浮动，与主角 breathe（±1.2px）幅度一致
  ctx.save();
  ctx.translate(x, y); ctx.scale(2.0, 2.0); ctx.translate(-x, -y);   // 访客统一放大 2.0×，与家园主角 drawSister(...,2.0) 的尺度一致（此前误用 1.2×，等效于外出 1× 主角的大小）
  ctx.fillStyle = "rgba(58,48,39,0.18)"; ctx.beginPath(); ctx.ellipse(x, y + 14, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, bob);   // 阴影留在地面，仅身形浮动
  const img = visitorImg[v.formKey] || visitorImg[v.def.id];
  const faceRight = !!(v.facing && v.facing.x > 0);   // 朝右时水平翻转（原图面朝左，与主角一致）
  if (img) {
    // 立绘按「高度」判断是否缩放：仅当图片高度超出 boxH(34) 才等比收缩到 boxH；
    // 仅宽度超出则保持原尺寸（允许横向溢出，不整体缩小）——与 drawSister 完全一致，确保访客与主角同高。
    const boxH = 34;
    const iw = img.width || boxH, ih = img.height || boxH;
    let dw, dh;
    if (ih > boxH) { const k = boxH / ih; dh = boxH; dw = iw * k; }
    else { dh = ih; dw = iw; }
    if (faceRight) {
      ctx.save();
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -dw / 2, y + 14 - dh, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(img, x - dw / 2, y + 14 - dh, dw, dh);   // 底部对齐阴影(y+14)
    }
  } else {
    // 缺图回落程序小人（朝右时同样镜像鼻子方向）
    ctx.fillStyle = "#9a8f80"; ctx.beginPath(); ctx.arc(x, y - 6, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#cdbfa6"; ctx.fillRect(x - 7, y, 14, 14);
    const noseX = faceRight ? x - 9 : x + 9;
    ctx.fillStyle = "#8a6b48"; ctx.beginPath(); ctx.ellipse(noseX, y + 8, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
/* ---------- F8 双气泡：程序绘制（白圆角气泡 + 花/心/笑图标，淡入淡出） ---------- */
// 气泡锚定在姐妹头顶（与 drawSister 同款基线 + 主界面放大 2×、阎明额外 1.1×），
// 随呼吸轻微浮动；第一人 t0 起显示，第二人 t0+secondDelay 起显示，二者各持续 dur 后淡出。
/* ===== scenes.js 432-443 ===== */
const visitorImg = {};   // 访客立绘缓存（key: visitorId 或 formKey）。原 scenes.js 头部全局声明，拆分时保留于此。
const flowerImg = {};    // 花草/药材立绘缓存（key: type_bud / type_bloom）。原 scenes.js 头部全局声明，拆分时保留于此。
function registerVisitorImage(id, path, attempt) {
  path = resolveImg(path);
  if (!path || typeof Image === "undefined") return;
  attempt = attempt || 0;
  const img = new Image();
  img.onload = () => { visitorImg[id] = img; };
  img.onerror = () => { if (attempt < 3) setTimeout(() => registerVisitorImage(id, path, attempt + 1), 350 * (attempt + 1)); };
  img.src = path;
}
// F-Editor：家具视觉盒（锚点 ax/ay + 尺寸 w/h + 偏移 ox/oy，全部可由 03_layout.js 配置）。
// 锚点像素 = ((x+0.5)*TILE + ox*TILE, (y+2.0)*TILE + oy*TILE)，即默认(底中)落在 (x+0.5, y+2) 瓦片，
// 与旧式 2× 程序图锚点一致；ay<1（如挂墙匾额）或 ox/oy 用于细修。
/* ===== scenes.js 464-486 ===== */
function registerFlowerImages() {
  if (typeof Image === "undefined") return;
  // 动态读取配置中的花/药材类型，避免 hardcode 列表与 flowerTypes 脱节
  const types = [];
  const ft = C.flowerTypes || {};
  for (const k of Object.keys(ft)) {
    const list = (ft[k] && ft[k].list) || [];
    for (const t of list) if (types.indexOf(t) < 0) types.push(t);
  }
  // 兜底：配置未加载或测试环境仍保留常见类型
  for (const t of ["lan", "shaoyao", "mudan", "taohua", "shancha", "meihua", "hehua",
    "fenglingcao", "xulingcao", "lingxincao", "qujing", "fengyucao"]) {
    if (types.indexOf(t) < 0) types.push(t);
  }
  for (const t of types) for (const s of ["bud", "bloom"]) {
    const key = t + "_" + s, path = resolveImg("image/flowers/" + key + ".png");
    if (!path) continue;
    const img = new Image();
    img.onload = () => { flowerImg[key] = img; };
    img.onerror = () => {};
    img.src = path;
  }
}
/* ===== scenes.js 454-462 ===== */
function drawImageFit(img, x, y, w, h) {
  const ir = (img.width && img.height) ? img.width / img.height : (w / h);
  let dw = w, dh = h;
  if (ir > w / h) dh = w / ir; else dw = h * ir;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
// 启动时为带 img 的家具登记 PNG（路径来自 03_layout.js；缺失则回退程序图）。
// 现已改为 data URI 内联（config/05_imagedata.js），零 HTTP、瞬时、无需错峰/重试。
// 花卉立绘（image/flowers/<type>_(bud|bloom).png），与家具/访客同款 data URI 内联、同款守卫

/* ===== src/draw_outing.js ===== */
/* 自动抽取：游历场景（地图/地形/敌人/宝箱）绘制。源：scenes.js。 */
/* ===== scenes.js 107-111 ===== */
const MAP_THEMES = {
  houshan: { sky: "#dff0d6", ground: "#cfe3c2", ground2: "#bcd6ac", water: "#9cc2c2", rock: "#9a8f7a", rock2: "#b3a78f", tree: "#5a6f4a", tree2: "#6f855a", flower: ["#e8a0b0", "#f3d27a", "#f4f4f4"], mountain: "#aecaa0", mist: "rgba(232,245,225,0.5)" },
  xigu:    { sky: "#dceef3", ground: "#c2dbe3", ground2: "#aecdd8", water: "#8fb8c8", rock: "#8f9aa0", rock2: "#a7b2b6", tree: "#4f6f6a", tree2: "#65857e", flower: ["#dfeaf0", "#cfe6ee", "#ffffff"], mountain: "#bcd4dc", mist: "rgba(225,240,245,0.55)" },
  yapan:   { sky: "#f6e6d2", ground: "#ecd9c2", ground2: "#e0c4a6", water: "#c9b08e", rock: "#b09178", rock2: "#c7a98c", tree: "#6f5a3a", tree2: "#8a7350", flower: ["#e08a5a", "#f0c060", "#f4d8c0"], mountain: "#d9a878", mist: "rgba(248,228,205,0.5)" },
};
/* ===== scenes.js 112-117 ===== */
function mapTheme() {
  const md = currentMapDef();
  return MAP_THEMES[(md && md.id) || "houshan"] || MAP_THEMES.houshan;
}

/* ---------- 外出场景（山地图，自然化渲染） ---------- */
/* ===== scenes.js 118-195 ===== */
function drawOutingScene(now) {
  const pm = parsedMaps[currentMapIndex];
  const grid = (pm && pm.grid) || null;
  const th = mapTheme();
  const outTop = OUTING_TOP;                 // 顶部独立任务条高度
  const viewH = H - outTop;
  const s = Math.min(1, viewH / H);          // 等比缩放，使整张地图收纳于任务条下方
  const sxp = (W - W * s) / 2;               // 水平居中偏移
  // ① 顶部独立任务条（不透明，覆盖 0..outTop，避免鬼影且与地图分离）
  drawOutingTopBar(th);
  // ② 地图视口背景（自任务条下方开始绘制，不与任务条重叠）
  const g = ctx.createLinearGradient(0, outTop, 0, H);
  g.addColorStop(0, th.sky); g.addColorStop(0.32, th.ground); g.addColorStop(1, th.ground2);
  ctx.fillStyle = g; ctx.fillRect(0, outTop, W, viewH);
  // ③ 进入地图坐标变换：等比缩放 + 下移 + 水平居中（仅影响地图，不影响顶部任务条）
  ctx.save();
  ctx.translate(sxp, outTop);
  ctx.scale(s, s);
  // 柔光斑（世界坐标，弱化“方块地”的假感）
  const blobs = [
    { x: W * 0.24, y: H * 0.34, r: W * 0.55, c: th.ground2, a: 0.30 },
    { x: W * 0.82, y: H * 0.72, r: W * 0.5, c: th.sky, a: 0.22 },
  ];
  for (const b of blobs) {
    const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    rg.addColorStop(0, rgbaOf(b.c, b.a)); rg.addColorStop(1, rgbaOf(b.c, 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  // 顶部薄雾（世界顶部，紧邻任务条下方，仅作氛围，不遮玩法）
  ctx.save(); ctx.fillStyle = th.mist; ctx.fillRect(0, 0, W, H * 0.16); ctx.restore();
  // 地块：墙=圆润山石 / 水=流波 / 树=繁茂 / 地面=草石花
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const ch = (grid && grid[y] && grid[y][x] !== undefined) ? grid[y][x] : "#";
    const px = x * TILE, py = y * TILE;
    const seed = (x * 73856093) ^ (y * 19349663);
    if (ch === "#") drawRock(px, py, th, seed);
    else if (ch === "~") drawWater(px, py, th, now, seed);
    else if (ch === "T") drawTree(px, py, th, now, seed);
    else if (ch === "·") { /* 预留 */ }
    else drawGroundDeco(px, py, th, seed);
  }
  drawHome(now);
  for (const h of herbs) { if (!h.collected) drawHerb(h.x * TILE + TILE / 2, h.y * TILE + TILE / 2, now, h.x + h.y, h.hue); }
  for (const e of enemies) { if (e.alive) drawEnemy(e, now); }
  if (game.chest && !game.chest.taken) drawChest(game.chest.x * TILE + TILE / 2, game.chest.y * TILE + TILE / 2, now);   // F12 宝箱
  for (const p of projectiles) {
    ctx.save(); glow(true, "rgba(120,140,150,0.5)", 6);
    ctx.strokeStyle = "#46555a"; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.restore(); glow(false);
  }
  const a = active(), o = other();
  if (!a.dead && !o.dead) {
    const t = game.bond / T.bondMax;
    ctx.save(); glow(true, "rgba(227,154,184,0.8)", 8);
    const grad = ctx.createLinearGradient(a.pos.x, a.pos.y, o.pos.x, o.pos.y);
    grad.addColorStop(0, "rgba(227,154,184," + (0.30 + 0.45 * t).toFixed(2) + ")");
    grad.addColorStop(0.5, "rgba(255,225,210," + (0.40 + 0.45 * t).toFixed(2) + ")");
    grad.addColorStop(1, "rgba(227,154,184," + (0.30 + 0.45 * t).toFixed(2) + ")");
    ctx.strokeStyle = grad; ctx.lineWidth = 2 + 3 * t; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(a.pos.x, a.pos.y); ctx.lineTo(o.pos.x, o.pos.y); ctx.stroke();
    ctx.restore(); glow(false);
  }
  if (game.combinedFx > 0) {
    const cx = (a.pos.x + o.pos.x) / 2, cy = (a.pos.y + o.pos.y) / 2;
    const prog = 1 - game.combinedFx / 0.55;
    ctx.save(); glow(true, "rgba(232,192,106,0.7)", 14);
    ctx.strokeStyle = "rgba(58,48,39,0.8)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, prog * T.combined.range, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(232,192,106,0.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, prog * T.combined.range * 0.7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore(); glow(false);
  }
  drawSister(o, false);
  drawSister(a, true);
  ctx.restore();
}
/* ---------- 外出顶部独立任务条（不透明，与地图分离） ---------- */
/* ===== scenes.js 196-208 ===== */
function drawOutingTopBar(th) {
  const outTop = OUTING_TOP;
  const g = ctx.createLinearGradient(0, 0, 0, outTop);
  g.addColorStop(0, "#2c2419"); g.addColorStop(1, "#3a2f24");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, outTop);
  // 底部金线，明确与下方地图视口的分界
  ctx.fillStyle = "rgba(232,192,106,0.45)"; ctx.fillRect(0, outTop - 1, W, 1);
  // 内侧轻描，强化“任务条”面板感
  ctx.fillStyle = "rgba(232,192,106,0.12)";
  ctx.fillRect(0, 0, 2, outTop); ctx.fillRect(W - 2, 0, 2, outTop);
}

/* ---------- 地块元素：圆润山石 / 流波水 / 繁茂树 / 自然草石花 ---------- */
/* ===== scenes.js 209-225 ===== */
function drawRock(px, py, th, seed) {
  ctx.save();
  ctx.fillStyle = th.rock;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(px + 1, py + 1, TILE - 2, TILE - 2, 7); }
  else ctx.rect(px + 1, py + 1, TILE - 2, TILE - 2);
  ctx.fill();
  ctx.fillStyle = rgbaOf(th.rock2, 0.9);
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(px + 3, py + 3, TILE - 6, (TILE - 6) * 0.42, 5); }
  else ctx.rect(px + 3, py + 3, TILE - 6, (TILE - 6) * 0.42);
  ctx.fill();
  ctx.strokeStyle = rgbaOf("#3a3027", 0.16); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 6, py + TILE - 6); ctx.lineTo(px + TILE - 6, py + TILE - 6); ctx.stroke();
  const r = Math.abs(seed) % 3;
  ctx.fillStyle = rgbaOf(th.rock2, 0.55);
  ctx.beginPath(); ctx.arc(px + 10 + r * 4, py + 18, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/* ===== scenes.js 226-241 ===== */
function drawWater(px, py, th, now, seed) {
  const cx = px + TILE / 2, cy = py + TILE / 2;
  ctx.save();
  ctx.fillStyle = th.water; ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
  const lg = ctx.createLinearGradient(px, py, px, py + TILE);
  lg.addColorStop(0, rgbaOf("#ffffff", 0.20)); lg.addColorStop(1, rgbaOf("#000000", 0.06));
  ctx.fillStyle = lg; ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
  ctx.strokeStyle = rgbaOf("#ffffff", 0.4); ctx.lineWidth = 1;
  for (let k = 0; k < 2; k++) {
    const yy = py + 9 + k * 9 + Math.sin(now / 700 + px + k) * 1.5;
    ctx.beginPath(); ctx.moveTo(px + 5, yy);
    for (let xx = px + 5; xx <= px + TILE - 5; xx += 4) ctx.lineTo(xx, yy + Math.sin((xx + now / 120) * 0.5 + k) * 1.2);
    ctx.stroke();
  }
  ctx.restore();
}
/* ===== scenes.js 242-260 ===== */
function drawTree(px, py, th, now, seed) {
  const bx = px + TILE / 2;
  ctx.save();
  ctx.fillStyle = rgbaOf("#3a3027", 0.15);
  ctx.beginPath(); ctx.ellipse(bx, py + TILE - 3, TILE * 0.4, TILE * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = th.tree2; ctx.lineWidth = 3.4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(bx, py + TILE - 2); ctx.lineTo(bx, py + TILE * 0.28); ctx.stroke();
  for (const yy of [py + TILE * 0.62, py + TILE * 0.45, py + TILE * 0.34]) {
    ctx.beginPath(); ctx.moveTo(bx - 3, yy); ctx.lineTo(bx - 8, yy - 5); ctx.moveTo(bx + 3, yy); ctx.lineTo(bx + 8, yy - 5); ctx.stroke();
  }
  const sway = Math.sin(now / 900 + px) * 1.5;
  for (const d of [[-1, 0.55], [1, 0.55], [0, 1]]) {
    ctx.fillStyle = rgbaOf(th.tree, d[1]);
    ctx.beginPath(); ctx.ellipse(bx + d[0] * 7, py + TILE * 0.28 + sway * d[0] * 0.4, 8.5, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = rgbaOf(th.tree2, 0.9);
  ctx.beginPath(); ctx.ellipse(bx, py + TILE * 0.2 + sway, 6.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/* ===== scenes.js 261-278 ===== */
function drawGroundDeco(px, py, th, seed) {
  const s = Math.abs(seed) % 100;
  if (s < 26) {                 // 草丛
    ctx.save(); ctx.strokeStyle = rgbaOf(th.tree, 0.5); ctx.lineWidth = 1.4; ctx.lineCap = "round";
    const gx = px + 8 + (s % 6), gy = py + TILE - 6;
    for (const off of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(gx + off, gy); ctx.quadraticCurveTo(gx + off * 1.2, gy - 6, gx + off * 1.4, gy - 11); ctx.stroke(); }
    ctx.restore();
  } else if (s < 38) {          // 小石
    ctx.save(); ctx.fillStyle = rgbaOf(th.rock2, 0.8);
    ctx.beginPath(); ctx.ellipse(px + 16 + (s % 5), py + 20 + (s % 4), 2.4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  } else if (s < 50) {          // 小花
    const f = th.flower[s % th.flower.length];
    ctx.save(); ctx.fillStyle = f;
    ctx.beginPath(); ctx.arc(px + 10 + (s % 8), py + 18 + (s % 6), 1.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}

/* ---------- 外出场景：药庐小屋 / 草药 / 敌人 ---------- */
/* ===== scenes.js 318-339 ===== */
function drawEnemy(e, now) {
  const x = e.x, y = e.y + Math.sin(now / 300 + x) * 1.2;
  ctx.save();
  if (e.hitFlash > 0) glow(true, "rgba(255,200,200,0.9)", 10);
  ctx.fillStyle = e.hitFlash > 0 ? "#ffd0d0" : "#6c6258";
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = TH.ink;
  ctx.beginPath(); ctx.moveTo(x - 5, y - 10); ctx.lineTo(x - 7, y - 16); ctx.lineTo(x - 2, y - 11); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 5, y - 10); ctx.lineTo(x + 7, y - 16); ctx.lineTo(x + 2, y - 11); ctx.closePath(); ctx.fill();
  ctx.restore(); glow(false);
  ctx.fillStyle = "#fff"; ctx.fillRect(x - 5, y - 3, 3, 3); ctx.fillRect(x + 2, y - 3, 3, 3);
  // 「妖」标签：米纸小 pill + 深字，置于敌人上方，替代压在身体上的红字（清晰、不遮挡）
  const tag = "妖";
  ctx.font = "bold 11px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const tw = ctx.measureText(tag).width + 10;
  panel(x - tw / 2, y - 34, tw, 14, 5, "rgba(247,239,225,0.92)", "rgba(58,48,39,0.35)");
  ctx.fillStyle = TH.ink; ctx.fillText(tag, x, y - 24);
  // 血条：不透明深底圆角托条 + 红 fill，亮草地/水面均清晰可读
  panel(x - 13, y - 21, 26, 6, 3, "rgba(20,16,12,0.72)", "rgba(247,239,225,0.35)");
  ctx.fillStyle = TH.zhusha; ctx.fillRect(x - 12, y - 20, 24 * Math.max(0, Math.min(1, e.hp / e.maxHp)), 4);
}
// F12 宝箱：木箱 + 金锁 + 微光浮动
/* ===== scenes.js 340-355 ===== */
function drawChest(cx, cy, now) {
  const bob = Math.sin(now / 320) * 2;
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.fillStyle = "rgba(120,90,60,0.30)";
  ctx.beginPath(); ctx.ellipse(0, 9, 12, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#a9772f"; ctx.fillRect(-11, -6, 22, 13);
  ctx.fillStyle = "#7d5320"; ctx.fillRect(-11, -6, 22, 4);
  ctx.fillStyle = "#caa15a"; ctx.fillRect(-11, 4, 22, 3);
  ctx.fillStyle = "#e8c06a"; ctx.fillRect(-2.5, -3, 5, 6);   // 锁
  ctx.globalAlpha = 0.45 + 0.3 * Math.sin(now / 220);
  glow(true, "rgba(232,192,106,0.75)", 12);
  ctx.restore(); glow(false);
}

/* ---------- 家园场景（独立网格） ---------- */

/* ===== src/draw_home.js ===== */
/* 自动抽取：家园背景 + 家具精灵绘制。源：scenes.js。 */
let homeBgImg = null;   // 家园背景图（image/home_bg.png）；缺失则回退程序逐格绘制。原 scenes.js 头部全局声明，拆分时保留于此。
/* ===== scenes.js 10-19 ===== */
function registerHomeBg() {
  const path = resolveImg("image/home_bg.png");
  if (!path || typeof Image === "undefined") return;
  bothPendInc();   // 家园背景对「开始界面」与「进入游戏」两个门控都关键
  const img = new Image();
  img.onload = () => { homeBgImg = img; bothPendDec(); };
  img.onerror = () => { bothPendDec(); };   // 失败也减计数，避免图缺失时卡死加载界面
  img.src = path;
}

/* ===== scenes.js 279-303 ===== */
function drawHome(now) {
  const px = home.x * TILE, py = home.y * TILE, cx = px + TILE / 2;
  ctx.save(); glow(true, "rgba(232,192,106,0.9)", 18);
  ctx.fillStyle = "rgba(232,192,106,0.30)"; ctx.beginPath(); ctx.arc(cx, py + TILE * 0.62, TILE * 0.44, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); glow(false);
  ctx.fillStyle = "#efe7d6"; ctx.fillRect(px + 4, py + TILE * 0.40, TILE - 8, TILE * 0.46);
  ctx.fillStyle = TH.ink;
  ctx.beginPath();
  ctx.moveTo(px, py + TILE * 0.46); ctx.lineTo(cx, py + TILE * 0.18); ctx.lineTo(px + TILE, py + TILE * 0.46);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = TH.gold; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px + 2, py + TILE * 0.46); ctx.lineTo(cx, py + TILE * 0.20); ctx.lineTo(px + TILE - 2, py + TILE * 0.46); ctx.stroke();
  ctx.fillStyle = "#fff4d6"; ctx.fillRect(cx - 6, py + TILE * 0.52, 12, 11);
  ctx.strokeStyle = TH.gold; ctx.lineWidth = 1.5; ctx.strokeRect(cx - 6, py + TILE * 0.52, 12, 11);
  ctx.fillStyle = "rgba(194,69,61,0.9)"; ctx.fillRect(cx - 1, py + TILE * 0.52, 2, 11); ctx.fillRect(cx - 6, py + TILE * 0.57, 12, 2);
  const lx = px + 7, ly = py + TILE * 0.46;
  ctx.save(); glow(true, "rgba(194,69,61,0.7)", 6);
  ctx.fillStyle = TH.zhusha; ctx.beginPath(); ctx.arc(lx, ly, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); glow(false);
  const tag = "药庐";
  ctx.font = "bold 11px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const tw = ctx.measureText(tag).width + 10;
  panel(cx - tw / 2, py - 13, tw, 13, 4, "rgba(194,69,61,0.94)", null);
  ctx.fillStyle = "#fff"; ctx.fillText(tag, cx, py - 3);
}
/* ===== scenes.js 356-417 ===== */
function drawHomeScene(now) {
  ctx.save();
  ctx.translate(-homeCamX, 0);   // 横向跟随相机：仅 9 屏宽可视，随被控者滚动
  // §13：优先绘制家园背景图（image/home_bg.png），未加载完成则回落程序绘制
  if (homeBgImg && homeBgImg.complete && homeBgImg.width) {
    ctx.drawImage(homeBgImg, 0, 0, HM_COLS * TILE, HM_ROWS * TILE);
  } else {
    for (let y = 0; y < HM_ROWS; y++) for (let x = 0; x < HM_COLS; x++) {
      const ch = homeGridChars[y][x];
      const px = x * TILE, py = y * TILE;
      const inRoom = (y >= 1 && y <= 14) && (x >= 1 && x <= 9);
      let col;
      if (ch === "#") col = "#e9e1d2";
      else if (inRoom) col = "#e7d8be";
      else if (ch === "~") col = PAL.water;
      else col = PAL.grass;
      ctx.fillStyle = col; ctx.fillRect(px, py, TILE, TILE);
      if (ch === ".") {
        const sd = x * 7 + y * 13;
        if (sd % 11 === 0) { ctx.fillStyle = "rgba(159,207,134,0.30)"; ctx.beginPath(); ctx.arc(px + TILE * 0.3, py + TILE * 0.72, 1.6, 0, Math.PI * 2); ctx.fill(); }
        else if (sd % 17 === 0) { ctx.fillStyle = "rgba(194,69,61,0.16)"; ctx.beginPath(); ctx.arc(px + TILE * 0.68, py + TILE * 0.34, 1.4, 0, Math.PI * 2); ctx.fill(); }
      }
      if (ch === "#") {
        // 家园围墙：基础米色已由上方 base 填充绘制，与背景融合
      } else if (ch === "~") {
        ctx.fillStyle = "rgba(156,194,194,0.55)";
        ctx.beginPath(); ctx.ellipse(px + TILE / 2, py + TILE / 2, TILE * 0.34, TILE * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        const wy = py + TILE / 2 + Math.sin(now / 700 + x) * 2;
        ctx.strokeStyle = "rgba(120,150,150,0.5)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px + 6, wy); ctx.lineTo(px + TILE - 6, wy); ctx.stroke();
      } else if (ch === "T") {
        const bx2 = px + TILE / 2;
        ctx.strokeStyle = "#5f7d52"; ctx.lineWidth = 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(bx2, py + TILE - 2); ctx.lineTo(bx2, py + TILE * 0.26); ctx.stroke();
        ctx.strokeStyle = "rgba(58,48,39,0.5)"; ctx.lineWidth = 1;
        for (const yy of [py + TILE * 0.78, py + TILE * 0.56, py + TILE * 0.40, py + TILE * 0.30]) {
          ctx.beginPath(); ctx.moveTo(bx2 - 3, yy); ctx.lineTo(bx2 + 3, yy); ctx.stroke();
        }
        ctx.fillStyle = "rgba(95,125,82,0.85)";
        for (const d of [-1, 1]) {
          ctx.beginPath(); ctx.ellipse(bx2 + d * 6, py + TILE * 0.32, 6, 2.4, d * 0.7, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(bx2 + d * 7, py + TILE * 0.46, 5, 2.0, d * 0.6, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }
  // 家具（按视觉盒底边深度排序；地毯始终最底层，避免覆盖站立物）
  const frs = (C.furniture || []).slice().sort((a, b) => {
    const aRug = (a.kind === "rug") ? 0 : 1, bRug = (b.kind === "rug") ? 0 : 1;
    if (aRug !== bRug) return aRug - bRug;
    const ba = furnitureBox(a).tlY + furnitureBox(a).boxH, bb = furnitureBox(b).tlY + furnitureBox(b).boxH;
    return ba - bb;
  });
  for (const f of frs) drawFurniture(f, now);
  const a = active(), o = other();
  drawSister(o, false, 2.0, false); drawSister(a, true, 2.0, false);   // F1：主界面人物放大 2 倍（主界面不画激活光圈）
  // 已移除活动事件时头顶小圆圈 UI（randomEvent 逻辑仍运行）
  drawVisitor(now);
  drawBubbles(now);   // F8：双气泡（纯氛围，叠加在姐妹头顶）
  ctx.restore();
}
/* ---------- 家具渲染（由 furniture[] 注册表驱动；F3 后续可接 PNG） ----------
 * 占位程序图：每种 kind 一段绘制。美术接管时只需在配置里填 f.img 并在
 * registerFurnitureImage 中登记，drawFurniture 会优先绘制图片，逻辑零改动。 */
/* ===== scenes.js 418-418 ===== */
const furnitureImg = {};
/* ===== scenes.js 419-430 ===== */
function registerFurnitureImage(id, path, attempt) {
  attempt = attempt || 0;
  path = resolveImg(path);
  if (!path || typeof Image === "undefined") return;
  if (attempt === 0) gamePendInc();   // 仅首次登记计入「进入游戏」门控，重试不再重复计数
  const img = new Image();
  img.onload = () => { furnitureImg[id] = img; gamePendDec(); };
  // 失败重试：沙箱静态服务并发拉图偶发丢请求，重试自愈（最多 3 次，退避递增）；最终失败也减计数避免卡死
  img.onerror = () => { if (attempt < 3) setTimeout(() => registerFurnitureImage(id, path, attempt + 1), 350 * (attempt + 1)); else gamePendDec(); };
  img.src = path;
}
// 访客立绘（npc/<id>.png），与家具图同款 data URI 内联、同款守卫，逻辑一致
/* ===== scenes.js 444-453 ===== */
function furnitureBox(f) {
  const boxW = (f.w != null ? f.w : 2.0) * TILE;
  const boxH = (f.h != null ? f.h : 2.6) * TILE;
  const ax = (f.ax != null ? f.ax : 0.5), ay = (f.ay != null ? f.ay : 1.0);
  const ox = f.ox || 0, oy = f.oy || 0;
  const anchorX = (f.x + 0.5) * TILE + ox * TILE;
  const anchorY = (f.y + 2.0) * TILE + oy * TILE;
  const tlX = anchorX - ax * boxW, tlY = anchorY - ay * boxH;
  return { boxW, boxH, ax, ay, ox, oy, anchorX, anchorY, tlX, tlY };
}
/* ===== scenes.js 487-503 ===== */
function applyFurnitureImages() {
  for (const f of (C.furniture || [])) {
    if (f.img) registerFurnitureImage(f.id, f.img);
  }
  registerHomeBg();
  // 地毯 4 种装修色 PNG（对应 decor slot d1 的 ink/gold/jade/rose）
  registerFurnitureImage("rug_ink", "image/rug1.png");
  registerFurnitureImage("rug_gold", "image/rug2.png");
  registerFurnitureImage("rug_jade", "image/rug3.png");
  registerFurnitureImage("rug_rose", "image/rug4.png");
  // 访客立绘：按 def（含 forms 多形态）登记 npc/<id>.png（由 gen_imagedata.py 内联进 YLT_IMG_DATA）。
  // 每形态用 `def.id + "#" + 序号` 作为注册键，drawVisitor 据此取对应立绘；
  // 同时为形态0兼容旧写法（直接以 def.id 查图），便于调试钩子与无 forms 的访客。
  for (const def of (C.visitors || [])) {
    const forms = (def.forms && def.forms.length) ? def.forms : [{ img: def.img, events: def.events || [] }];
    forms.forEach((f, i) => {
      if (f.img) registerVisitorImage(def.id + "#" + i, f.img);
      if (i === 0 && def.img) registerVisitorImage(def.id, def.img);
    });
  }
  registerFlowerImages();
}
/* ===== scenes.js 504-541 ===== */
function drawFurniture(f, now) {
  const px = f.x * TILE, py = f.y * TILE;
  const cx = px + TILE / 2, cy = py + TILE / 2;
  const img = furnitureImg[f.id];
  const box = furnitureBox(f);
  // 图片（异形）：按视觉盒绘制，透明点击由 hit 盒决定（与像素框无关）
  if (img) {
    drawImageFit(img, box.tlX, box.tlY, box.boxW, box.boxH);
    if (f.onTap) drawHint(box.tlX + box.boxW / 2, box.tlY, now);
    return;
  }
  if (f.kind === "rug") {            // 地毯：取当前装修色对应的 PNG，无图则回落程序绘制
    const slotId = (C.home && C.home.decor && C.home.decor.slots && C.home.decor.slots[0]) ? C.home.decor.slots[0].id : "d1";
    const optId = game.decor[slotId] || "ink";
    const rugImg = furnitureImg["rug_" + optId];
    if (rugImg) {
      drawImageFit(rugImg, box.tlX, box.tlY, box.boxW, box.boxH);
    } else {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1.6, 1.6); ctx.translate(-cx, -cy);
      drawRugF(cx, cy); ctx.restore();
    }
    return;
  }
  if (f.kind === "door") { drawDoor(f, cx, cy, now); return; }   // 门：横跨门洞(2 格)放大
  // 其余家具：以「tile 底边中点」为锚 2× 放大（占位程序图；美术就位后由 img 接管）
  ctx.save();
  ctx.translate(cx, py + TILE);
  ctx.scale(2, 2);
  ctx.translate(-cx, -(py + TILE));
  switch (f.kind) {
    case "gate": drawGate(cx, cy, now); break;
    case "window": drawWindowF(cx, cy); break;
    case "flower": drawFlowerF(f, cx, cy); break;
    case "medicine": drawMedicineF(cx, cy); break;
    case "bookshelf": drawBookshelfF(cx, cy); break;
    case "bed": drawBedF(cx, cy); break;
    case "cabinet": drawCabinetF(cx, cy); break;
    case "desk": drawDeskF(cx, cy); break;
    case "tree": drawTreeF(cx, cy, now); break;
    case "swing": drawSwingF(cx, cy, now); break;
    case "weaponRack": drawWeaponRackF(cx, cy); break;
    default: break;
  }
  ctx.restore();
  if (f.onTap) drawHint(cx, py, now);
}
/* ===== scenes.js 542-548 ===== */
function drawHint(cx, py, now) {
  const a = 0.45 + 0.35 * Math.sin(now / 480);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(232,192,106,0.95)";
  ctx.beginPath(); ctx.arc(cx, py + 3, 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/* ===== scenes.js 549-574 ===== */
function drawDoor(f, cx, cy, now) {
  const px = f.x * TILE, py = f.y * TILE;
  const top = py - 4, bot = py + 2 * TILE;     // 横跨门洞(2 格)放大
  const hw = 14;
  // 门框（深木）
  ctx.fillStyle = "#6f5436";
  ctx.fillRect(cx - hw - 3, top, 5, bot - top);
  ctx.fillRect(cx + hw - 2, top, 5, bot - top);
  ctx.fillStyle = "#5e452c"; ctx.fillRect(cx - hw - 3, top, hw * 2 + 6, 6);
  // 门内透光（暖，提示可通行）
  const g = 0.28 + 0.16 * Math.sin(now / 700);
  ctx.fillStyle = "rgba(232,192,106," + g.toFixed(3) + ")";
  ctx.fillRect(cx - hw, top + 6, hw * 2, bot - top - 10);
  // 半开的门板（浅木，透视压扁）
  ctx.save();
  ctx.translate(cx + hw, top + 6);
  ctx.transform(0.55, 0, 0.16, 1, 0, 0);
  ctx.fillStyle = "rgba(138,107,74,0.95)";
  ctx.fillRect(-hw, 0, hw, bot - top - 10);
  ctx.fillStyle = "rgba(110,84,54,0.9)";
  ctx.fillRect(-hw, 0, hw, 4);
  ctx.restore();
  // 门环
  ctx.fillStyle = "#caa15a";
  ctx.beginPath(); ctx.arc(cx - hw - 1, (top + bot) / 2, 2, 0, Math.PI * 2); ctx.fill();
}
/* ===== scenes.js 575-584 ===== */
function drawGate(cx, cy, now) {
  ctx.fillStyle = "#6f5436";
  ctx.fillRect(cx - 16, cy - 18, 7, 30); ctx.fillRect(cx + 9, cy - 18, 7, 30);
  ctx.fillStyle = "#8a4b3a";
  ctx.beginPath(); ctx.moveTo(cx - 20, cy - 18); ctx.lineTo(cx + 20, cy - 18); ctx.lineTo(cx + 14, cy - 28); ctx.lineTo(cx - 14, cy - 28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#5e452c"; ctx.fillRect(cx - 20, cy - 18, 40, 4);
  // 门内透光（暖），提示“可从此出院”：由 drawFurniture 的金色呼吸点进一步标示可交互
  const g = 0.22 + 0.16 * Math.sin(now / 600);
  ctx.fillStyle = "rgba(232,192,106," + g.toFixed(3) + ")"; ctx.fillRect(cx - 9, cy - 14, 18, 26);
}
/* ===== scenes.js 585-592 ===== */
function drawWindowF(cx, cy) {
  ctx.fillStyle = "#6f5436"; ctx.fillRect(cx - 10, cy - 9, 20, 18);
  ctx.fillStyle = "#bfe0e8"; ctx.fillRect(cx - 8, cy - 7, 16, 14);
  ctx.fillStyle = "rgba(120,150,140,0.5)";
  ctx.beginPath(); ctx.moveTo(cx - 8, cy + 4); ctx.quadraticCurveTo(cx, cy - 2, cx + 8, cy + 4); ctx.lineTo(cx + 8, cy + 7); ctx.lineTo(cx - 8, cy + 7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#6f5436"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); ctx.stroke();
}
/* ===== scenes.js 593-650 ===== */
function drawFlowerF(f, cx, cy) {
  // 花型 / 阶段：type 决定颜色，stage 0=花苞 1=开花（F5）
  const st = (game.flowers && game.flowers[f.id]) || {};
  const type = st.type || "lan";
  const stage = (st.stage || 0) >= 1 ? 1 : 0;
  // F7：可收获提示——开花且已跨日（浇水日 < 当前日），头顶发光小花（替换原金色微光点）
  const ready = (st.wateredDay && st.wateredDay < game.day && stage >= 1);
  if (ready) {
    const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 280);   // 0.1..1 脉动
    const gy = cy - 26;
    // 柔光晕
    const gr = 9 + 3 * pulse;
    const g = ctx.createRadialGradient(cx, gy, 0, cx, gy, gr);
    g.addColorStop(0, "rgba(255,230,150," + (0.5 * pulse + 0.18) + ")");
    g.addColorStop(1, "rgba(255,230,150,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, gy, gr, 0, Math.PI * 2); ctx.fill();
    // 发光小花
    drawFlowerIcon(cx, gy, 3.2, "rgba(255,238,175," + (0.85 * pulse + 0.15) + ")", "rgba(243,180,90," + (0.9 * pulse + 0.1) + ")");
  }
  // 真实花卉立绘：完整盆栽（盆+茎+花/苞），contain 适配到与程序花等位的盒，底部贴地
  const fimg = flowerImg[type + "_" + (stage ? "bloom" : "bud")];
  if (fimg) {
    // 按家具配置 w/h 缩放（当前在 2× 绘制上下文中，尺寸除以 2 补偿 scale）
    const fw = ((f.w != null ? f.w : 1.6) * TILE) / 2;
    const fh = ((f.h != null ? f.h : 2.26) * TILE) / 2;
    drawImageFit(fimg, cx - fw / 2, cy - fh * 0.75, fw, fh);
    return;
  }
  // 程序兜底（无图时）：花盆 + 茎 + 花/苞
  const col = (C.flowerColors && C.flowerColors[type]) || "#e8a0b0";
  const herbSet = ["fenglingcao", "xulingcao", "lingxincao", "qujing", "fengyucao"];
  const isHerb = herbSet.indexOf(type) >= 0;
  // 花盆
  ctx.fillStyle = "#b07b4a";
  ctx.beginPath(); ctx.moveTo(cx - 9, cy + 12); ctx.lineTo(cx + 9, cy + 12); ctx.lineTo(cx + 6, cy - 2); ctx.lineTo(cx - 6, cy - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#8a5e34"; ctx.fillRect(cx - 10, cy - 4, 20, 3);
  // 茎
  ctx.strokeStyle = "#4a5e3e"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.lineTo(cx, cy - 13); ctx.stroke();
  if (stage >= 1) {
    if (isHerb) {   // 草木：细叶 + 小花苞
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy - 17, 4, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.arc(cx, cy - 20, 1.6, 0, Math.PI * 2); ctx.fill();
    } else {         // 花：五瓣 + 花心
      const petals = 5, R = 6.5;
      for (let i = 0; i < petals; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / petals);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * R, cy - 17 + Math.sin(a) * R, 3.4, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#f3d27a"; ctx.beginPath(); ctx.arc(cx, cy - 17, 2.6, 0, Math.PI * 2); ctx.fill();
    }
  } else {           // 花苞：闭合绿芽
    ctx.fillStyle = "#6f9a5e";
    ctx.beginPath(); ctx.ellipse(cx, cy - 15, 3, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (st.watered) { ctx.fillStyle = "rgba(120,170,210,0.18)"; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill(); }
}
// 小花朵图标（图鉴「鲜花」类目 / 可收获提示共用）：5 瓣 + 花心；petalColor/centerColor 可带透明度
/* ===== scenes.js 679-688 ===== */
function drawMedicineF(cx, cy) {
  ctx.fillStyle = "#8a6b48"; ctx.fillRect(cx - 15, cy - 4, 30, 18);
  ctx.fillStyle = "#6f5436"; ctx.fillRect(cx - 15, cy - 4, 30, 4);
  ctx.strokeStyle = "rgba(58,48,39,0.5)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx - 15, cy + 5); ctx.lineTo(cx + 15, cy + 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.lineTo(cx, cy + 13); ctx.stroke();
  ctx.fillStyle = "#cdbba0"; ctx.beginPath(); ctx.ellipse(cx - 7, cy - 8, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b09a7a"; ctx.fillRect(cx + 3, cy - 12, 2.4, 12);
  ctx.fillStyle = TH.gold; ctx.beginPath(); ctx.arc(cx + 4, cy - 14, 2, 0, Math.PI * 2); ctx.fill();
}
/* ===== scenes.js 689-698 ===== */
function drawBookshelfF(cx, cy) {
  ctx.fillStyle = "#7a5a3a"; ctx.fillRect(cx - 13, cy - 20, 26, 32);
  ctx.fillStyle = "#5e452c"; ctx.fillRect(cx - 13, cy - 20, 26, 4);
  ctx.fillStyle = "#5e452c"; ctx.fillRect(cx - 13, cy - 6, 26, 3);
  const owned = Object.keys(game.books || {}).length || 0;   // F9：game.books 现为本对象 {bookId:[章]}
  const n = Math.max(1, Math.min(7, owned));
  const cols = ["#c2453d", "#5a6f4a", "#8a6db0", "#c98a3a", "#3a6f7a", "#a8674f", "#6b7d3a"];
  for (let i = 0; i < n; i++) { ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(cx - 11 + i * 3.2, cy - 17, 2.8, 10); }
  for (let i = 0; i < n; i++) { ctx.fillStyle = cols[(i + 3) % cols.length]; ctx.fillRect(cx - 11 + i * 3.2, cy - 2, 2.8, 10); }
}
/* ===== scenes.js 699-707 ===== */
function drawBedF(cx, cy) {
  ctx.fillStyle = "#8a6b48"; ctx.fillRect(cx - 16, cy - 4, 32, 16);
  ctx.fillStyle = "#6f5436"; ctx.fillRect(cx - 16, cy - 4, 32, 3);
  ctx.fillStyle = "#e7d8be"; ctx.fillRect(cx - 14, cy - 1, 30, 9);
  ctx.fillStyle = "#cf9a9a"; ctx.fillRect(cx - 14, cy - 1, 10, 9);
  ctx.strokeStyle = "#6f5436"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 16, cy - 4); ctx.lineTo(cx - 16, cy - 10); ctx.lineTo(cx - 9, cy - 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 16, cy - 4); ctx.lineTo(cx + 16, cy - 10); ctx.lineTo(cx + 9, cy - 10); ctx.stroke();
}
/* ===== scenes.js 708-715 ===== */
function drawCabinetF(cx, cy) {
  ctx.fillStyle = "#6f4f33"; ctx.fillRect(cx - 13, cy - 18, 26, 32);
  ctx.fillStyle = "#553c25"; ctx.fillRect(cx - 13, cy - 18, 26, 3);
  ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 1.3;
  for (let r = 0; r < 3; r++) { const ry = cy - 13 + r * 11; ctx.strokeRect(cx - 11, ry, 22, 9); }
  ctx.fillStyle = "#caa15a";
  for (let r = 0; r < 3; r++) { const ry = cy - 13 + r * 11; ctx.beginPath(); ctx.arc(cx, ry + 4.5, 1.3, 0, Math.PI * 2); ctx.fill(); }
}
/* ===== scenes.js 716-724 ===== */
function drawDeskF(cx, cy) {
  ctx.fillStyle = "#8a6b48"; ctx.fillRect(cx - 15, cy - 2, 30, 12);
  ctx.fillStyle = "#6f5436"; ctx.fillRect(cx - 15, cy - 2, 30, 3);
  ctx.fillStyle = "#f3ead9"; ctx.fillRect(cx - 9, cy - 16, 18, 13);
  ctx.strokeStyle = "rgba(58,48,39,0.4)"; ctx.lineWidth = 1; ctx.strokeRect(cx - 9, cy - 16, 18, 13);
  ctx.strokeStyle = "#5a6f4a"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(cx - 6, cy - 5); ctx.quadraticCurveTo(cx, cy - 12, cx + 6, cy - 6); ctx.stroke();
  ctx.fillStyle = "#3a6f7a"; ctx.beginPath(); ctx.arc(cx + 3, cy - 12, 1.6, 0, Math.PI * 2); ctx.fill();
}
/* ===== scenes.js 725-739 ===== */
function drawRugF(cx, cy) {
  const slots = (C.home && C.home.decor && C.home.decor.slots) || [];
  const slot = slots[0]; if (!slot) return;
  const optId = game.decor[slot.id] || (slot.options[0] && slot.options[0].id);
  const opt = (slot.options.find((o) => o.id === optId)) || slot.options[0];
  if (!opt) return;
  ctx.save();
  ctx.fillStyle = opt.color; ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.ellipse(cx, cy, TILE * 0.42, TILE * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.5; ctx.strokeStyle = "rgba(247,239,225,0.9)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy, TILE * 0.30, TILE * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.9; ctx.fillStyle = "rgba(247,239,225,0.9)";
  ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 5, cy); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx - 5, cy); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* ===== scenes.js 740-749 ===== */
function drawTreeF(cx, cy, now) {
  ctx.strokeStyle = "#5f7d52"; ctx.lineWidth = 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy + 16); ctx.lineTo(cx, cy - 14); ctx.stroke();
  const sway = Math.sin(now / 900 + cx) * 2;
  ctx.fillStyle = "rgba(95,125,82,0.9)";
  ctx.beginPath(); ctx.ellipse(cx + sway, cy - 18, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(95,125,82,0.7)";
  ctx.beginPath(); ctx.ellipse(cx - 10 + sway, cy - 10, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 11 + sway, cy - 12, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
}
/* ===== scenes.js 750-757 ===== */
function drawSwingF(cx, cy, now) {
  ctx.strokeStyle = "#6f5436"; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx - 12, cy - 20); ctx.lineTo(cx + 12, cy - 20); ctx.stroke();
  const sw = Math.sin(now / 700) * 4;
  ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(58,48,39,0.6)";
  ctx.beginPath(); ctx.moveTo(cx - 8, cy - 20); ctx.lineTo(cx - 8 + sw, cy + 6); ctx.moveTo(cx + 8, cy - 20); ctx.lineTo(cx + 8 + sw, cy + 6); ctx.stroke();
  ctx.fillStyle = "#8a6b48"; ctx.fillRect(cx - 12 + sw, cy + 6, 24, 4);
}
/* ===== scenes.js 758-766 ===== */
function drawWeaponRackF(cx, cy) {
  ctx.fillStyle = "#6f5436";
  ctx.fillRect(cx - 14, cy - 16, 4, 30); ctx.fillRect(cx + 10, cy - 16, 4, 30);
  ctx.fillRect(cx - 14, cy - 16, 28, 4);
  ctx.strokeStyle = "#b9c0c8"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 10, cy - 4); ctx.lineTo(cx + 10, cy - 4); ctx.stroke();
  ctx.strokeStyle = "#8a6b48"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 10, cy + 4); ctx.lineTo(cx + 10, cy + 4); ctx.stroke();
}

/* ===== src/home.js ===== */
/* =========================================================================
 * 《明清日常》Demo · 家园系统（src/home.js）
 * -------------------------------------------------------------------------
 * 家园的互动点、面板开关、生活更新、同伴/访客/邻近对话、库存与日记，
 * 以及家园 HUD（底栏 / 双姝血卡 / 好感等状态）。
 * 依赖 core.js（状态/原语）与 ui.js（对话/面板绘制）、outing.js（launchOuting）。
 * ========================================================================= */

/* ---------- 家园点击互动 ---------- */
// 家园点击：屏幕坐标需叠加横向相机 homeCamX 还原到世界坐标（纵向无相机）
function hitHomePoint(lx, ly) {
  const wx = lx + homeCamX;
  for (const f of (C.furniture || [])) {
    if (!f.onTap && !(f.lines && f.lines.length)) continue;   // 仅 door/tree/weaponRack 等纯邻近家具不参与点击
    const h = f.hit || { x: 0, y: 0, w: 1, h: 1 };
    const left = f.x * TILE + h.x * TILE, right = f.x * TILE + (h.x + h.w) * TILE;
    const top = f.y * TILE + h.y * TILE, bottom = f.y * TILE + (h.y + h.h) * TILE;
    if (wx >= left && wx <= right && ly >= top && ly <= bottom)
      return { type: f.onTap || "lines", id: f.id, f };
  }
  return null;
}
function handleHomePoint(p) {
  if (!p || !p.f) return;
  const f = p.f;
  // F4：开页型家具（hasPage）按 20% 概率走「对话」分支，80% 正常打开功能弹窗；
  //     动作型家具（浇水/就寝/拾取/换肤/秋千/观星）hasPage 为 false，保持原有功能不变，F4 不介入。
  if (f.hasPage && f.lines && f.lines.length && Math.random() < 0.2) {
    playFurnitureChat(f);
    return;
  }
  switch (f.onTap) {
    case "outing": if (!game.inDialogue) openPanel("maps"); break;  // 院门 -> 出行（选图）
    case "flower": interactFlower(f.id); break;
    case "station": visitStation(); break;
    case "bookshelf": readShelf(); break;   // F9 书架 → 打开阅读面板
    case "cabinet": cabinetInteract(); break;
    case "desk": deskInteract(); break;
    case "swing": swingInteract(); break;
    case "window": windowInteract(); break;
    case "weaponRack": weaponInteract(); break;
    case "bed": bedInteract(); break;
    case "decor": applyDecor(f.id); break;
    case "tree": treeInteract(); break;
    default:
      if (f.lines && f.lines.length) startDialogue(f.lines);
  }
}
// F4：开页型家具的「对话」分支——从该家具 lines 随机抽一句播放（增加灵动感，不替代开页）
function playFurnitureChat(f) {
  if (!f.lines || !f.lines.length) return;
  const ln = f.lines[Math.floor(Math.random() * f.lines.length)];
  startDialogue([ln]);
}
function findFurniture(id) { return (C.furniture || []).find((x) => x.id === id); }
// 按权重随机一种花型（花 75% / 药材 25%）
function rollFlowerType() {
  const ft = C.flowerTypes; if (!ft) return "lan";
  const total = (ft.flower.weight || 0) + (ft.herb.weight || 0);
  const isHerb = Math.random() * total < (ft.herb.weight || 0);
  const pool = isHerb ? ft.herb.list : ft.flower.list;
  return pool[Math.floor(Math.random() * pool.length)];
}
// 取花型的中文名（配置 flowerNames；缺省时兜底返回 id 或“花”）
function flowerName(type) { return (C.flowerNames && C.flowerNames[type]) || type || "花"; }
// 取/建某盆花的状态，缺失花型时按确定性初值补一个（之后在收获时重新随机，见 harvestFlower）
function ensureFlower(f) {
  const st = game.flowers[f.id] || (game.flowers[f.id] = {});
  if (st.type == null) {
    let h = 0; for (const ch of f.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const ft = C.flowerTypes;
    const list = (h % 4 === 0 && ft) ? ft.herb.list : (ft ? ft.flower.list : ["lan"]);
    st.type = list[h % list.length];
    st.stage = 0; st.watered = false;
  }
  return st;
}
function waterFlower(id, silent) {
  const f = findFurniture(id); if (!f) return;
  const st = ensureFlower(f);
  const tname = flowerName(st.type);   // 浇水仅养护当前花型，不在浇水时随机（随机在收获后发生）
  if (st.watered) { setMsg("今日已给" + tname + "浇过水了", 1.4); return; }
  st.watered = true; st.stage = 1; st.wateredDay = game.day;   // 由花苞 → 开花；记录浇水日（F7 次日收获判定）
  gainAffinity(1);
  addDiaryEntry("给" + tname + "浇了水。");
  setMsg(tname + " · 浇水完成~", 1.4);          // F15：自动模式也飘字提示（不打断世界、不弹对话）
  if (!silent) startDialogue(f.lines || []);   // 仅手动模式弹对话；自动模式静默
}
// F7：点击花草的统一入口——次日「已浇待收」则采收本体，否则浇水
function interactFlower(id) {
  const f = findFurniture(id); if (!f) return;
  const st = ensureFlower(f);
  if (st.wateredDay && st.wateredDay < game.day) { harvestFlower(id, false); return; }
  waterFlower(id);
}
// F7：次日收获——获得本体（入库存 + 图鉴）、重置回花苞，可再浇水循环
function harvestFlower(id, silent) {
  const f = findFurniture(id); if (!f) return;
  const st = ensureFlower(f);
  if (!(st.wateredDay && st.wateredDay < game.day)) { if (!silent) setMsg("这株还无需采收。", 1.3); return; }
  const type = st.type, name = flowerName(type);
  addInventory(type, 1); unlockCodex(type); gainAffinity(1);
  addDiaryEntry("采得" + name + "。");
  toastGain(type);
  st.wateredDay = null; st.watered = false; st.stage = 0;   // 恢复未开放，可再浇水循环
  st.type = rollFlowerType();                              // F7：收获后随机下一株花型（次日浇水养护新花）
  saveGame();
  if (!silent) setMsg("采得 " + name, 1.6);
}
function visitStation() {
  // F7：点制药台即打开药方界面（制作在面板内完成），不再自动炼 / 弹对话
  openPanel("recipe");
}
// F9 书架：打开阅读面板（多套书 → 分章阅读，由 ui.js drawPanel("read") 渲染）
function readShelf() {
  openPanel("read");
}
function applyDecor(furnitureId) {
  const f = findFurniture(furnitureId);
  const slotId = (f && f.slot) || ((C.home && C.home.decor && C.home.decor.slots && C.home.decor.slots[0]) || {}).id;
  const slots = (C.home && C.home.decor && C.home.decor.slots) || [];
  const slot = slots.find((s) => s.id === slotId); if (!slot) return;
  const cur = game.decor[slotId] || (slot.options[0] && slot.options[0].id);
  let idx = slot.options.findIndex((o) => o.id === cur);
  idx = (idx + 1) % slot.options.length;
  game.decor[slotId] = slot.options[idx].id;
  saveGame();
  setMsg("地毯更换成功", 1.4);
}
/* F1 炼丹增加时长（配置驱动 brewHours，单位=时辰）。brewHours>0 进入「炼制中」，
 * 按真实时间倒计时，完成才入库存；=0/缺省即时完成（兼容旧写法和测试）。 */
function craftRecipe(r) {
  if (!r) return;
  if (game.brewing) { setMsg("炼炉正忙，请稍候。", 1.6); return; }
  for (const i of (r.inputs || [])) game.inventory[i] = Math.max(0, (game.inventory[i] || 0) - 1);
  const bh = (r.brewHours && r.brewHours > 0) ? r.brewHours : 0;
  if (bh <= 0) { brewComplete(r); return; }
  const durMs = bh * (DAY_CYCLE / 12) * 1000;
  game.brewing = { recipeId: r.id, endMs: Date.now() + durMs, brewHours: bh };
  saveGame();
  setMsg("开始炼制「" + (r.name || r.output) + "」（约 " + bh + " 时辰）", 1.8);
}
// 真正把成品入库存（即时与倒计时完成共用）
function brewComplete(r) {
  if (!r) return;
  addInventory(r.output, 1); unlockCodex(r.output);
  gainAffinity(1);
  addDiaryEntry("炼成「" + (r.name || r.output) + "」。");
  toastGain(r.output);          // 飘字「获得XXX」，不关闭面板（便于连续制药）
  game.pillsCrafted = (game.pillsCrafted || 0) + 1;   // 回顾统计：炼制丹药 +1
  game.brewing = null;
  saveGame();
}
// 每帧由 main.js update() 顶端调用：到点自动完成当前炼制
function tickBrew() {
  if (!game.brewing) return;
  if (Date.now() >= game.brewing.endMs) {
    const r = (C.recipes || []).find((x) => x.id === game.brewing.recipeId);
    game.brewing = null;
    if (r) { brewComplete(r); setMsg("「" + (r.name || r.output) + "」炼制完成！", 2); }
  }
}
// 调试/测试钩子：立即完成当前炼制（不等待倒计时）
function finishBrew() {
  if (!game.brewing) return;
  const r = (C.recipes || []).find((x) => x.id === game.brewing.recipeId);
  game.brewing = null;
  if (r) brewComplete(r);
}
function bedInteract() {
  // 就寝：先弹确认窗（就寝将进入次日并播放过夜动画）
  game.confirm = {
    text: (C.story && C.story.confirmSleep) ? C.story.confirmSleep : "是否就寝？",
    onYes: () => startSleep(),
    onNo: () => { game.confirm = null; },
  };
}
/* ---------- 过夜动画：确认后播放，结束进入次日 ---------- */
function startSleep() {
  game.confirm = null;
  game.panel = null; game.inDialogue = false; game.poem = null;   // F9：就寝清理对诗浮层
  game.sleeping = { t: 0 };
  game._spawnAtBed = true;   // F15：次日清晨自床下醒来（returnHome 据此落点）
  returnHome();   // 翌日清晨自药庐醒来
}
function updateSleep(dt) {
  const s = game.sleeping; if (!s) return;
  s.t += dt;
  if (s.t >= 2.6) {
    game.sleeping = null;
    advanceDay();
    game.clock = 0.40;   // 翌日清晨（明亮）
  }
}
/* ---------- 日循环推进：就寝后进入次日 ---------- */
// F15 微调：每日晨起日记题注的多条随机文案（每天随机取 1 条）
const DAILY_OPENERS = [
  "晨起，山雾未散。",
  "晨起，檐角风铃轻响。",
  "晨起，庭中新落几片叶。",
  "晨起，药香漫过窗棂。",
  "晨起，云隙漏下一缕天光。",
  "晨起，远处溪声愈清。",
  "晨起，炉上水将沸，白汽袅袅。",
];
function advanceDay() {
  game.day = (game.day || 1) + 1;
  game.weather = pickWeatherId();   // 每日重抽天气（权重见 config/10_weather.js）
  game.herbsCollected = 0;
  // 每日刷新：所有地图草药重新可采（支持循环经营）
  for (const pm of parsedMaps) for (const h of pm.herbs) h.collected = false;
  // 浇花状态每日重置
  for (const k in game.flowers) if (game.flowers[k]) game.flowers[k].watered = false;
  game.lingqi = T.lingqiMax; game.bond = 0; game.homeDone = {};
  // 家具邻近事件与随机姐妹活动：新的一天重新允许触发
  game.proxCd = {}; game.randomScale = 1;
  // F9 随机对诗：新的一天重置「当日已对诗」标记与触发倒计时（每日可再触发一次）
  game.poemDoneDay = 0; game.poemTimer = 0; game.poem = null;
  game.movedThisDay = false;    // F15：新的一天，玩家尚未移动，邻近对话不触发直至其走动
  game.treeClaimed = false;            // 大树每日拾取重置
  game.autoSkip = {}; game.autoStuck = 0; game.autoTarget = null;   // F15：自动模式防卡死状态每日重置（重新评估每朵花）
  game.autoPaintStuck = 0; game.autoPaintSkip = false;              // 自动作画：每日重新尝试走向书桌
  game.autoTreeSkip = false; game.autoVisitorSkip = false;          // 自动：大树拾取 / 访客接待 的“走不到”放弃标记，每日重置
  game.autoTreeStuck = 0; game.autoVisitorStuck = 0;                // 自动：大树/访客 卡死计时每日清
  game.autoChenOfLastTask = -1; game.autoActiveTask = null;         // F15-增强：每时辰1项节流状态每日重置
  // F8：新的一天重新 roll 当日访客（统一入口，避免多次进出家园重复 roll）
  game.visitor = null;                 // 当日仍未离场的访客，于日终自动离开
  game.visitorSpawnTimer = 8;          // 新一天首位访客登场前的等待秒数（真实时间）
  game.dayVisitorsRolled = false;
  rollDailyVisitors();
  // 花家具：花型随机已改到「收获后」(harvestFlower) 发生；advanceDay 不再重投，保持玩家养护的花型稳定
  const opener = DAILY_OPENERS[Math.floor(Math.random() * DAILY_OPENERS.length)];
  addDiaryEntry("第 " + game.day + " 日 · " + opener, game.weather);
  setMsg("第 " + game.day + " 日", 2.6);
  game.mini = null; game.miniResume = null;  // 家园小游戏：日终清场（跨天不再续半局/暂停局）
}
/* ---------- F15：一日结束节点（昼夜整圈回绕触发） ---------- */
function onDayCycleComplete() {
  if (game.controlMode === "auto") {
    // 自动模式：不弹窗，直接就寝进入次日（若正在外出则先返程再休息）
    startSleep();
    return;
  }
  // 手动模式：按当前场景差异化处理「休息」
  if (game.scene === "home") {
    game.forcedRest = true;
    showForcedRest();
  } else {
    game.pendingRest = true;   // 外出：待返回主界面后再弹强制休息
  }
}
// 强制休息确认框：仅「休息」一个选项且不可拒绝（确认即就寝进入次日）
function showForcedRest() {
  game.confirm = {
    title: "天色已晚",
    icon: "眠",
    forced: true,
    text: "一日将尽，剪烛西窗。\n枕风眠月，卿卿可爱。",
    yesText: "就 寝",
    onYes: () => { game.forcedRest = false; startSleep(); },
  };
}
function cabinetInteract() {
  // F6：点药柜打开背包面板（展示当前持有的药材与丹药及其数量）
  if (game.inDialogue) return;
  openPanel("bag");
}
function windowInteract() {
  // F6：夜晚点窗 → 观星面板
  if (isNight()) { openStarPanel(); return; }
  // 破阵触发：仅白天(dayLight(clock)>0.5) 掷 windowTrigger(默认 20%) → 开破阵；否则凭窗远眺对话
  if (typeof dayLight === "function" && dayLight(game.clock) > 0.5
      && Math.random() < (miniCfgOf().windowTrigger || 0.20)) {
    openMini("formation");
    return;
  }
  const f = findFurniture("window");
  startDialogue((f && f.lines) || [{ who: "", text: "（凭窗远眺，云自山那头来，慢得很。）" }]);
}
// 武器架：掷 weaponTrigger(默认 20%) → 50/50 随机练剑/切磋；否则保留原对话分支
function weaponInteract() {
  if (game.mini) return;                               // 进行中不重掷（与“当天继续”语义一致）
  if (game.inDialogue || game.panel) return;          // 门控：避免对话/面板中误触发
  const cfg = miniCfgOf();
  if (Math.random() < (cfg.weaponTrigger || 0.20)) {
    if (Math.random() < 0.5) openMini("sword");
    else openMini("spar");
  } else {
    const f = findFurniture("weaponRack");
    startDialogue((f && f.lines) || [{ who: "", text: "（武器架上的剑映着窗光，静待出鞘。）" }]);
  }
}
// F6 夜晚点窗观星：开启星图；每天首次打开自动亮起 3 颗星并触发随机主讲介绍（不再需点击识星）
function openStarPanel() {
  if (!C.stars || !C.stars.length) { setMsg("今夜云厚，星子都藏起来了", 1.4); return; }
  // 清掉可能残留的对话，避免星图被对话卡遮挡（自动模式下对话常驻，点窗即开星图更可靠）
  game.inDialogue = false; game.dialogueQueue = []; game.dialogueIndex = 0; game._dialogueDone = null;
  game.panel = "stars"; game.panelScroll = 0;
  const pool = (C.stars || []).filter((s) => s.descYanming && s.descLiqingning);  // 有讲解的星（二十八宿）
  // 每天首次打开：自动亮起随机 3 颗，主讲人两姐妹等概率随机；其余时候只显示星图
  if (pool.length && game.day !== game.lastStarDay) {
    const pick = pickRandomStars(pool, Math.min(3, pool.length));
    game.starHighlight = pick.map((s) => s.id);   // 亮起这 3 颗
    const lines = pick.map((s) => {
      const isShijie = Math.random() < 0.5;       // 主讲人等概率随机
      const sp = isShijie ? sisters.shijie : sisters.shimei;
      const text = isShijie ? (s.descYanming || s.descLiqingning) : (s.descLiqingning || s.descYanming);
      return { who: sp.name, text };
    });
    startDialogue(lines, function () {
      game.starHighlight = null;                  // 介绍完收光，不再高亮
      game.lastStarDay = game.day;                // 标记今日已介绍
      const names = pick.map((s) => s.name).join("、");
      addDiaryEntry("两人一起看星星，聊了" + names + "。");
    });
  } else {
    game.starHighlight = null;
  }
}
// 从候选里等概率不重复抽取 n 颗
function pickRandomStars(pool, n) {
  const arr = pool.slice(); const out = [];
  while (out.length < n && arr.length) {
    const i = Math.floor(Math.random() * arr.length);
    out.push(arr.splice(i, 1)[0]);
  }
  return out;
}
function deskInteract() {
  if (game.inDialogue) return;
  openPanel("paint");   // 书桌 = 6×9 绘画面板（F13）
}
// 大树：每日 1 次，点击拾取特殊道具（specialPools.tree）+ 随机一章书（F9），均去重不重复
function treeInteract() {
  const f = findFurniture("tree"); if (!f) return;
  if (game.treeClaimed) { setMsg("今日已在大树下捡过东西了", 1.4); return; }
  game.treeClaimed = true;                 // 每日仅 1 次，先占位（避免自动模式走到树下每帧重复触发刷屏）
  let got = false;
  const sp = rollSpecial("tree");
  if (sp) { gainSpecial(sp); got = true; }  // 特殊道具（集齐前基本必有，去重）
  if (gainRandomBookChapter()) got = true;  // F9：每日 1 章书（集齐前必有，去重不重复）—— 此为大树每日稳定产出
  if (!got) setMsg("大树下暂时是空的", 1.4);   // 仅当特殊道具与所有书籍章节均已集齐时才可能触发
  saveGame();
}
// F14-lite：主界面点击角色 → 按皮肤编号循环切换（game.outfit[id] 记录当前索引）
function cycleOutfit(id) {
  const s = C.sisters[id]; if (!s) return;
  const n = (s.skins && s.skins.length) ? s.skins.length : 1;
  if (n <= 1) { setMsg((s.name || "该角色") + " 暂无可换皮肤", 1.2); return; }
  game.outfit = game.outfit || {};
  const cur = (typeof game.outfit[id] === "number") ? game.outfit[id] : 0;
  game.outfit[id] = (cur + 1) % n;
  applyOutfit(id);
  saveGame();
  setMsg("换装成功", 1.5);
}
// 主界面：判断是否点中某位角色的精灵（用于切换皮肤）。角色以 s.pos 为脚底，主界面放大 2× 绘制。
// 取「屏幕最近」的角色，避免两姐妹间距仅 0.8 格时命中歧义。
function hitHomeSister(lx, ly) {
  const wx = lx + homeCamX;   // 还原世界坐标（家园横向相机）
  let best = null, bestD = TILE * 0.6;   // 命中阈值（略大于半角色宽；取最近者避免误判）
  for (const k in sisters) {
    const s = sisters[k];
    if (ly < s.pos.y - TILE * 2.3 || ly > s.pos.y + TILE * 0.5) continue;
    const d = Math.abs(wx - s.pos.x);
    if (d <= bestD) { bestD = d; best = k; }
  }
  return best;
}
// 书桌绘画：点任意格 → 随机落 1 笔（每日限 1），落满则画成（F13）
function paintRandomCell() {
  if (!game.painting || !game.painting.colored) return;
  if (game.painting.lastDay === game.day) { setMsg("今日已落过一笔", 1.2); return; }
  const grey = [];
  for (let i = 0; i < game.painting.colored.length; i++) if (!game.painting.colored[i]) grey.push(i);
  if (!grey.length) { setMsg("画已大成", 1.6); game.autoPaintSkip = true; return; }  // 画作已大成 → 自动模式不再每日重走书桌（解除分支 0 卡死）
  const pick = grey[Math.floor(Math.random() * grey.length)];
  game.painting.colored[pick] = true;
  game.painting.lastDay = game.day;
  saveGame();
  addDiaryEntry("为画添了一笔。");
  const done = game.painting.colored.every(Boolean);
  setMsg(done ? "画已大成 · 可细细赏看" : "在画上落下一笔", done ? 2.0 : 1.2);
}
function swingInteract() {
  // 家园小游戏：秋千 onTap 掷 swingTrigger(默认 10%) 概率开「对弈」，
  // 不中则保留原 90% 对话路径（与家具原对话无缝并存）。
  if (Math.random() < (miniCfgOf().swingTrigger || 0.10)) {
    openMini("chess");
    return;
  }
  const f = findFurniture("swing");
  startDialogue((f && f.lines) || [{ who: "", text: "（李清凝坐上秋千，阎明在身后轻轻推了一把，枝叶沙沙。）" }]);
}

/* ---------- 面板开关 ---------- */
const panelHits = [];
const codexTabHits = [];   // 图鉴分类标签命中区（屏幕坐标，不随滚动）
const readTabHits = [];    // 书架分类页签命中区（屏幕坐标，不随滚动）
const diaryTabHits = [];   // 日记面板页签命中区（日记 / 回顾，屏幕坐标不随滚动）
const bagTabHits = [];     // 药柜分类页签命中区（全部 / 草药 / 鲜花 / 丹药，屏幕坐标不随滚动）
const poemHits = [];       // F9 随机对诗：选项按钮命中区（屏幕坐标，不随滚动）
const visitorChoiceHits = [];  // F2 访客需求选项面板：按钮命中区（屏幕坐标）
const homeSisterCardRects = []; // 家园顶栏双姝血卡点击区（用于切换主控角色）
function openPanel(name) {
  if (game.inDialogue) return;
  if (name !== "read") { game.readBook = null; game.readChapter = null; }  // F9：离开阅读态清空选择
  game.panel = name; game.panelScroll = 0;
}
function closePanel() { game.panel = null; game.readBook = null; game.readChapter = null; }
function updatePanel(dt) { /* 静态列表，无需逐帧更新 */ }

/* ---------- 家园内切换主控角色 ---------- */
function switchHomeActive() {
  if (game.inDialogue || game.panel || game.confirm) return;
  activeId = (activeId === "shijie") ? "shimei" : "shijie";
  setMsg("切换至 " + active().name, 1.0);
}
function hitHomeSisterCard(lx, ly) {
  for (const r of homeSisterCardRects) {
    if (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) return r.id;
  }
  return null;
}
function handlePanelClick(lx, ly) {
  // 图鉴分类标签：点击切换分类（草药 / 丹药），并重置滚动到顶
  if (game.panel === "codex") {
    for (const t of codexTabHits) {
      if (lx >= t.x && lx <= t.x + t.w && ly >= t.y && ly <= t.y + t.h) {
        game.codexCat = t.cat; game.panelScroll = 0; return true;
      }
    }
  }
  // 书架分类页签：点击切换分类（全部 / 医典 / 诗文 / 杂览），并重置滚动到顶
  if (game.panel === "read" && !game.readBook) {
    for (const t of readTabHits) {
      if (lx >= t.x && lx <= t.x + t.w && ly >= t.y && ly <= t.y + t.h) {
        game.readCat = t.cat; game.panelScroll = 0; return true;
      }
    }
  }
  // 日记面板页签：点击切换（日记 / 回顾），并重置滚动到顶
  if (game.panel === "diary") {
    for (const t of diaryTabHits) {
      if (lx >= t.x && lx <= t.x + t.w && ly >= t.y && ly <= t.y + t.h) {
        game.diaryTab = t.cat; game.panelScroll = 0; return true;
      }
    }
  }
  // 药柜分类页签：点击切换分类（全部 / 草药 / 鲜花 / 丹药），并重置滚动到顶
  if (game.panel === "bag") {
    for (const t of bagTabHits) {
      if (lx >= t.x && lx <= t.x + t.w && ly >= t.y && ly <= t.y + t.h) {
        game.bagCat = t.cat; game.panelScroll = 0; return true;
      }
    }
  }
  const sc = game.panelScroll || 0;   // 点击坐标换算回内容空间（绘制时已平移 -sc）
  for (const h of panelHits) {
    if (lx >= h.x && lx <= h.x + h.w && ly >= h.y - sc && ly <= h.y + h.h - sc) { h.action(); return true; }
  }
  return false;
}

/* ---------- 日记 / 收集 / 库存 ---------- */
function addDiaryEntry(text, weather) {
  if (!text) return;
  // 未显式传天气时，默认记当天天气（浇水/得章节等支线日记也带当日天气，便于回看）
  const w = (weather !== undefined) ? weather : (game.weather || null);
  // F5：每条日记记录当前时辰（clock 0=子夜/子时，0.5=正午/午时）
  const chen = shichenName(game.clock);
  game.diary.push({ t: Date.now(), day: game.day, text, weather: w, chen });
  if (game.diary.length > 200) game.diary.shift();
  saveGame();
}
function unlockCodex(id) { if (id && !game.codex[id]) { game.codex[id] = true; saveGame(); } }
// F11 特殊道具：从某途径池里排除已获得的，等概率取一个；无可选则 null（不重复）
function rollSpecial(source) {
  const pool = (C.specialPools && C.specialPools[source]) || [];
  const avail = pool.filter((id) => !(game.specialOwned && game.specialOwned[id]));
  if (!avail.length) return null;
  return avail[Math.floor(Math.random() * avail.length)];
}
// F11 获得特殊道具：点亮图鉴 + 记入去重集合 + 飘字 + 日记 + 存档
function gainSpecial(id) {
  if (!id) return;
  unlockCodex(id);
  game.everOwned[id] = true;
  game.specialOwned[id] = true;
  const it = (C.codex && C.codex.items || []).find((x) => x.id === id);
  setMsg("获得「" + (it ? it.name : id) + "」", 1.8);
  addDiaryEntry("意外得「" + (it ? it.name : id) + "」，收进图鉴。");
  saveGame();
}
// F9 兼容旧调用：按 id 直接获得第 1 章（新逻辑走 gainBookChapter）
function addBook(id) { gainBookChapter(id, null); }
// F9 获得指定书章：去重不重复；点亮图鉴(book 类) + 飘字 + 日记 + 存档
function gainBookChapter(bookId, n) {
  if (!bookId) return;
  const b = (C.books || []).find((x) => x.id === bookId);
  if (!b) return;
  if (n == null) {
    // 方案C：首章号取常驻目录（正文未懒加载时 b.chapters 可能为空）
    const toc = (b.chapters && b.chapters.length) ? b.chapters : ((C.bookToc && C.bookToc[b.id]) || []);
    const fc = toc[0] && toc[0].n; n = fc || 1;
  }
  if (!game.books[bookId]) game.books[bookId] = [];
  if (game.books[bookId].indexOf(n) >= 0) return;   // 已拥有该章，不重复
  game.books[bookId].push(n);
  game.everOwned[bookId] = true;
  unlockCodex(bookId);                              // 书籍类图鉴项点亮（isUnlocked 现读 game.books）
  const nm = b.name || bookId;
  setMsg("获得「" + nm + "」第 " + n + " 章", 1.8);
  addDiaryEntry("获得「" + nm + "」第 " + n + " 章。");
  saveGame();
}
// F9 随机掉落一章：从所有书里挑「尚未拥有」的章节，随机给一章；全部集齐则返回 false
function gainRandomBookChapter() {
  const books = C.books || [];
  const cand = [];
  for (const b of books) {
    const owned = game.books[b.id] || [];
    // 方案C：候选章从常驻目录枚举（正文未懒加载时 b.chapters 空，不能靠它）
    const toc = (b.chapters && b.chapters.length) ? b.chapters : ((C.bookToc && C.bookToc[b.id]) || []);
    for (const ch of toc) if (owned.indexOf(ch.n) < 0) cand.push({ bookId: b.id, n: ch.n });
  }
  if (!cand.length) return false;
  const pick = cand[Math.floor(Math.random() * cand.length)];
  gainBookChapter(pick.bookId, pick.n);
  return true;
}
function addInventory(id, n) { game.inventory[id] = (game.inventory[id] || 0) + (n || 1); game.everOwned[id] = true; saveGame(); }
function gainAffinity(n) { game.affinity += (n || 0); saveGame(); }
// 统一「获得物品」飘字：获得「物品名」
function toastGain(id) {
  const it = (C.codex && C.codex.items || []).find((x) => x.id === id);
  setMsg("获得「" + (it ? it.name : id) + "」", 1.6);
}

/* ---------- 家园更新 ---------- */
function moveActive(dt) {
  const a = active();
  let dx = 0, dy = 0;
  let usingInput = false;
  if (input.touchActive && (input.touchDir.x || input.touchDir.y)) { dx = input.touchDir.x; dy = input.touchDir.y; usingInput = true; }
  else if (input.keyDir.x || input.keyDir.y) { dx = input.keyDir.x; dy = input.keyDir.y; usingInput = true; }

  if (usingInput) {
    game.tapTarget = null;   // 手动方向优先，取消点击行走
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      game.movedThisDay = true;   // F15：玩家当日已主动移动 → 允许家具邻近对话触发
      dx /= len; dy /= len; a.facing = { x: dx, y: dy };
      const sp = T.playerSpeed * dt;
      const nx = a.pos.x + dx * sp, ny = a.pos.y + dy * sp;
      if (canMove(nx, a.pos.y)) a.pos.x = nx;
      if (canMove(a.pos.x, ny)) a.pos.y = ny;
    }
    return;
  }

  // 点击落点行走（手动模式）：朝 tapTarget 直线走，到附近即停（复用 canMove 不穿墙）
  if (game.controlMode !== "auto" && game.tapTarget) {
    const tx = game.tapTarget.x, ty = game.tapTarget.y;
    const d = Math.hypot(tx - a.pos.x, ty - a.pos.y);
    if (d < TILE * 0.5) { game.tapTarget = null; return; }
    game.movedThisDay = true;
    const ux = (tx - a.pos.x) / d, uy = (ty - a.pos.y) / d;
    a.facing = { x: ux, y: uy };
    const sp = T.playerSpeed * dt;
    const nx = a.pos.x + ux * sp, ny = a.pos.y + uy * sp;
    if (canMove(nx, a.pos.y)) a.pos.x = nx;
    if (canMove(a.pos.x, ny)) a.pos.y = ny;
    if (Math.hypot(tx - a.pos.x, ty - a.pos.y) < TILE * 0.5) game.tapTarget = null;
  }
}
function updateHome(dt) {
  moveActive(dt);
  if (game.controlMode !== "auto") checkGatePrompt();   // 自动模式不主动弹出行确认
  companionThink(dt);
  game.lingqi = Math.min(T.lingqiMax, game.lingqi + T.lingqiRegen * dt);
  // 家园横向相机：随被控者滚动并 clamp 到 [0, (HM_COLS-COLS)*TILE]
  const camMax = (HM_COLS - COLS) * TILE;
  homeCamX = Math.max(0, Math.min(camMax, active().pos.x - W / 2));
  if (game.controlMode === "auto") {
    // 自动模式：系统接管轻量行为（漫步 + 自动浇水），不触发对话型随机/邻近事件以免卡住世界
    updateAutoHome(dt);
  } else {
    updateRandomInteractions(dt);
    updateProximity(dt);
  }
  updateVisitor(dt);
}
/* ---------- F15：自动模式·家园轻量行为（漫步 + 自动浇水 + 防卡死） ---------- */
// 自动模式漫步速度系数：悠闲慢步（手动模式的 0.3 倍），营造「散步」观感
const AUTO_WALK = 0.3;
// 家园「房间↔院子」隔墙在 col 10，仅 rows 7-8 留门洞。自动角色用直线步进，
// 跨侧目标先绕到门洞（DOOR_PT）再前往，避免一头撞墙后被立即判「卡死」放弃。
const WALL_X = 10.5 * TILE;
const DOOR_PT = { x: 10.5 * TILE, y: 7.5 * TILE };
function navPt(a, px, py) {
  const aLeft = a.pos.x < WALL_X, tLeft = px < WALL_X;
  return (aLeft !== tLeft) ? DOOR_PT : { x: px, y: py };
}
/* ---------- F15/F15+：自动模式·家园轻量行为（每时辰只随机执行 1 项任务，直至全部完成） ---------- */
// 当前时辰索引（与 shichenName 同款算法）：clock 0=子夜(子时) … 0.5=正午(午时)
function currentChen() {
  return Math.floor((game.clock * 12 + 0.5)) % 12;
}
// 收+浇合一：一盆花的「1 项任务」。待收则先采收本体，再给新花浇水（重启养护循环）
function careFlower(id, silent) {
  const f = (C.furniture || []).find((x) => x.id === id);
  const st = f ? ensureFlower(f) : (game.flowers[id] || (game.flowers[id] = {}));
  if (st.wateredDay && st.wateredDay < game.day) harvestFlower(id, silent); // 待收 → 采收
  if (!st.watered) waterFlower(id, silent);                                // 新花 → 浇水
}
// 扫描当前所有可执行任务，随机返回 1 项（null=暂无待办）。范围：每盆花养护 / 每日作画 / 大树拾取 / 访客接待
function pickAutoTask() {
  const tasks = [];
  for (const f of (C.furniture || [])) {
    if (f.kind !== "flower") continue;
    const st = ensureFlower(f);
    const awaiting = st.wateredDay && st.wateredDay < game.day;   // 昨日浇、今日待收
    if (st.watered && !awaiting) continue;                        // 今日已浇（非待收）→ 跳过
    if (game.autoSkip[f.id]) continue;                            // 当日走不到 → 跳过
    tasks.push({ type: "flower", id: f.id, x: (f.x + 0.5) * TILE, y: (f.y + 1.0) * TILE, range: TILE * 1.5 });
  }
  if (game.painting && game.painting.lastDay !== game.day && !game.autoPaintSkip) {
    const desk = (C.furniture || []).find((f) => f.id === "desk");
    if (desk) tasks.push({ type: "paint", x: (desk.x + 0.5) * TILE, y: (desk.y + 1.0) * TILE, range: TILE * 1.3 });
  }
  if (!game.treeClaimed && !game.autoTreeSkip) {
    const tree = (C.furniture || []).find((f) => f.id === "tree");
    if (tree) tasks.push({ type: "tree", x: (tree.x + 0.5) * TILE, y: (tree.y + 2.2) * TILE, range: TILE * 1.5 });
  }
  if (game.visitor && !game.visitor.talked && !game.inDialogue) {
    tasks.push({ type: "visitor", x: game.visitor.x, y: game.visitor.y, range: TILE * 1.6 });
  }
  if (!tasks.length) return null;
  return tasks[Math.floor(Math.random() * tasks.length)];
}
// 执行任务（到达目标后调用）
function executeAutoTask(t) {
  if (t.type === "flower") careFlower(t.id, true);
  else if (t.type === "paint") paintRandomCell();
  else if (t.type === "tree") treeInteract();
  else if (t.type === "visitor") talkToVisitor();
}
// 追逐并执行当前任务；到达即执行并标记「本时辰已做过 1 项」。走不到则放弃该目标并消耗本时辰配额
function pursueAutoTask(t, dt) {
  const a = active();
  const sameSide = (a.pos.x < WALL_X) === (t.x < WALL_X);
  const realD = Math.hypot(a.pos.x - t.x, a.pos.y - t.y);
  if (sameSide && realD < t.range) {
    executeAutoTask(t);
    game.autoChenOfLastTask = currentChen();   // 标记「本时辰已做过 1 项」
    game.autoActiveTask = null; game.autoTarget = null; game.autoStuck = 0;
    return true;
  }
  const g = navPt(a, t.x, t.y);                  // 异侧先走门洞
  const before = Math.hypot(a.pos.x - g.x, a.pos.y - g.y);
  stepAuto(a, g.x, g.y, dt);
  const after = Math.hypot(a.pos.x - g.x, a.pos.y - g.y);
  game.autoStuck = (after >= before - 0.02) ? (game.autoStuck || 0) + dt : 0;
  if (game.autoStuck > 2.0) {                    // 实在走不到 → 放弃该目标，并消耗本时辰配额
    if (t.type === "flower") game.autoSkip[t.id] = true;
    else if (t.type === "paint") game.autoPaintSkip = true;
    else if (t.type === "tree") game.autoTreeSkip = true;
    else if (t.type === "visitor") game.autoVisitorSkip = true;
    game.autoActiveTask = null; game.autoTarget = null;
    game.autoChenOfLastTask = currentChen();     // 本时辰不再重试（下时辰挑别的）
    game.autoStuck = 0;
  }
  return false;
}
// 悠闲漫步（无待办 / 本时辰配额已用完时），带卡死检测
function autoWander(dt) {
  const a = active();
  if (!game.autoTarget || Math.hypot(a.pos.x - game.autoTarget.x, a.pos.y - game.autoTarget.y) < TILE * 0.5) {
    game.autoIdle = (game.autoIdle || 0) - dt;
    if (game.autoIdle > 0) return;
    game.autoTarget = pickHomeWanderTarget();
    game.autoStuck = 0;
  }
  const bx = Math.hypot(a.pos.x - game.autoTarget.x, a.pos.y - game.autoTarget.y);
  stepAuto(a, game.autoTarget.x, game.autoTarget.y, dt);
  const bx2 = Math.hypot(a.pos.x - game.autoTarget.x, a.pos.y - game.autoTarget.y);
  if (bx2 >= bx - 0.02) {
    game.autoStuck = (game.autoStuck || 0) + dt;
    if (game.autoStuck > 1.0) { game.autoTarget = pickHomeWanderTarget(); game.autoStuck = 0; }  // 卡墙→重选目标
  } else {
    game.autoStuck = 0;
  }
}
function updateAutoHome(dt) {
  const a = active();
  if (!game.autoSkip) game.autoSkip = {};
  const chen = currentChen();
  // 1) 有进行中的任务 → 继续追逐执行（可跨时辰，不中途改派）
  if (game.autoActiveTask) {
    pursueAutoTask(game.autoActiveTask, dt);
    return;
  }
  // 2) 本时辰已做过 1 项 → 悠闲漫步，等下个时辰
  if (game.autoChenOfLastTask === chen) {
    autoWander(dt);
    return;
  }
  // 3) 新时辰、配额空 → 随机挑 1 项执行（无待办则漫步）
  const t = pickAutoTask();
  if (!t) { autoWander(dt); return; }
  game.autoActiveTask = t;
  pursueAutoTask(t, dt);
}

function stepAuto(a, tx, ty, dt) {
  let dx = tx - a.pos.x, dy = ty - a.pos.y;
  const len = Math.hypot(dx, dy);
  if (len > 0.001) {
    dx /= len; dy /= len; a.facing = { x: dx, y: dy };
    const sp = T.playerSpeed * AUTO_WALK * dt;   // 自动漫步放慢至 0.3 速
    const nx = a.pos.x + dx * sp, ny = a.pos.y + dy * sp;
    if (canMove(nx, a.pos.y)) a.pos.x = nx;
    if (canMove(a.pos.x, ny)) a.pos.y = ny;
  }
}
// 随机挑一个可走格作为漫步目标；全图扫描兜底，保证总能找到合法落点（不会因随机失败而原地不动）
function pickHomeWanderTarget() {
  const cands = [];
  for (let r = 1; r <= 14; r++) for (let c = 1; c <= 18; c++) {
    const inRoom = (r >= 1 && r <= 14 && c >= 1 && c <= 9);
    const inYard = (r >= 1 && r <= 14 && c >= 11 && c <= 18);
    if (!inRoom && !inYard) continue;
    const px = c * TILE + TILE / 2, py = r * TILE + TILE / 2;
    if (canMove(px, py) && !furnitureCollideAt(px, py)) cands.push({ x: px, y: py });
  }
  if (cands.length) return cands[Math.floor(Math.random() * cands.length)];
  const a = active();
  return { x: a.pos.x, y: a.pos.y };
}
function updateProximity(dt) {
  if (game.inDialogue || game.activeActivity || game.panel) return;
  // F15：新的一天、玩家尚未主动移动前，不触发任何家具邻近对话（避免落点恰好贴着家具就弹对话）
  if (!game.movedThisDay) return;
  const a = active();
  const atx = Math.floor(a.pos.x / TILE), aty = Math.floor(a.pos.y / TILE);
  for (const f of furnitureList) {
    const cd = game.proxCd[f.id] || 0;
    if (cd > 0) { game.proxCd[f.id] = cd - dt; continue; }
    // 邻近对话：优先 lines，缺则回退 proximity（大树/武器架/池塘等仅配了 proximity）
    const lines = (f.lines && f.lines.length) ? f.lines : (f.proximity || []);
    if (!lines.length) continue;
    if (Math.abs(atx - f.x) <= 1 && Math.abs(aty - f.y) <= 1) {
      const pick = lines[Math.floor(Math.random() * lines.length)];
      startDialogue([pick]);
      // 每件家具每天仅触发一次：置极大冷却，待 advanceDay 重置
      game.proxCd[f.id] = 1e9;
    }
  }
}
/* ---------- F9 随机论学 / 选项事件：每日最多一次 ---------- */
// 开启一次选项事件浮层：随机抽一条配置（诗词或医书），随机提问者（若为 either），进入「ask」阶段
function startPoem() {
  const poems = C.poems || [];
  if (!poems.length) return;
  const p = poems[Math.floor(Math.random() * poems.length)];
  const cat = p.cat === "medicine" ? "medicine" : "poetry";
  // 事件级 who：either 只随机一次，保证整段对话由同一人主讲（连贯）
  let eventWho = p.who || "either";
  if (eventWho === "either") eventWho = Math.random() < 0.5 ? "shijie" : "shimei";
  // 归一化为步骤序列：有 rounds 用多轮（可含 ask / speak 步），否则整条作为单轮 ask
  const raw = Array.isArray(p.rounds) ? p.rounds : [p];
  const steps = raw.map((r) => {
    let who = r.who || eventWho;
    if (who === "either") who = Math.random() < 0.5 ? "shijie" : "shimei";
    return {
      who: who,
      question: r.question || "",
      options: (r.options || []).slice(),
      reply: r.reply || "",
      replyWho: r.replyWho || who,
      speak: r.speak || "",      // 说话步：说话人说话（无选项），点任意处推进
    };
  });
  game.poem = { cat: cat, steps: steps, idx: 0, step: "ask", pick: -1, options: steps[0].options };
  game.inDialogue = true;   // 暂停随机互动与邻近事件，点击路由到选项浮层
}
// 某步是否为「提问步」（有 question 且有选项）；否则为「说话/无选项步」
function poemStepIsAsk(m) { return !!m.question && m.options.length > 0; }
// 推进到下一步；走完所有步则收尾（锁定当日 + 写日记）
function advancePoem() {
  const p = game.poem; if (!p) return;
  p.idx++;
  if (p.idx >= p.steps.length) {
    const catName = p.cat === "medicine" ? "医书" : "诗词";
    addDiaryEntry("两人讨论" + catName + "。");
    game.poemDoneDay = game.day; game.poem = null; game.inDialogue = false;
  } else {
    p.step = "ask"; p.pick = -1; p.options = p.steps[p.idx].options;
  }
}
// 选项事件浮层点击处理（由 main.js 的 pointerdown 在 game.poem 非空时优先调用）
function handlePoemClick(lx, ly) {
  if (!game.poem) return;
  const p = game.poem, m = p.steps[p.idx];
  if (poemStepIsAsk(m)) {
    if (p.step === "ask") {
      for (const h of poemHits) {
        if (lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h) {
          p.pick = h.idx; p.step = "answer"; return;
        }
      }
    } else {
      advancePoem();   // answer 阶段：点任意处收尾/进入下一步
    }
  } else {
    advancePoem();     // 说话/无选项步：点任意处推进
  }
}
// F2 访客需求选项面板点击处理（由 main.js 的 pointerdown 在 game.visitorChoice 非空时优先调用）
function handleVisitorChoiceClick(lx, ly) {
  if (!game.visitorChoice) return;
  for (const h of visitorChoiceHits) {
    if (lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h) { h.action(); return; }
  }
  // 点弹窗卡片之外的聚光遮罩区 → 关闭整个访客选项面板（含赠予弹窗）
  const ch = game.visitorChoice;
  const bx = 16, bw = W - 32, by = 96, bh = (ch.step !== "main") ? 300 : 250;
  if (lx < bx || lx > bx + bw || ly < by || ly > by + bh) { closeVisitorChoice(); }
}
function updateRandomInteractions(dt) {
  if (game.inDialogue) return;
  // F9 对诗：当日未对诗时，按倒计时窗口以概率触发（每天最多一次，由 poemDoneDay 锁死）
  if ((C.poems && C.poems.length) && game.poemDoneDay !== game.day && !game.poem) {
    if (game.poemTimer <= 0) {
      game.poemTimer = 18 + Math.random() * 22;   // 下次判定窗口 18~40s
      if (Math.random() < 0.4) { startPoem(); return; }  // 40% 触发；未触发则继续等待下次窗口
    } else {
      game.poemTimer -= dt;
    }
  }
  if (game.activeActivity && game.activeActivity.timer > 0) {
    game.activeActivity.timer -= dt;
    if (game.activeActivity.timer <= 0) game.activeActivity = null;
    return;
  }
  game.randomTimer -= dt;
  if (game.randomTimer > 0) return;
  const pool = (C.home && C.home.random && C.home.random.pool) || [];
  if (!pool.length) { game.randomTimer = 8; return; }
  let tot = 0; for (const p of pool) tot += p.weight;
  let r = Math.random() * tot, pick = pool[0];
  for (const p of pool) { r -= p.weight; if (r <= 0) { pick = p; break; } }
  let who = pick.who; if (who === "either") who = Math.random() < 0.5 ? "shijie" : "shimei";
  game.activeActivity = { id: pick.id, anim: pick.anim, who, timer: 3.4 };
  addDiaryEntry(pick.diary || "");
  if (pick.lines && pick.lines.length) startDialogue(pick.lines);
  const rn = C.home.random;
  // 间隔随当日累积而增长：越往后对话越稀疏（最长不超过基准的 6 倍）
  game.randomScale = Math.min(6, (game.randomScale || 1) * 1.3);
  game.randomTimer = (rn.tickMin + Math.random() * (rn.tickMax - rn.tickMin)) * game.randomScale;
}
/* ---------- F8 双气泡：触发逻辑 ---------- */
// 由 main.js checkShichenBubble（每进入新时辰 20% 概率）调用。
// type: "flower" | "heart" | "smile"；first: 先冒泡的姐妹 id（"shijie" | "shimei"），
// 另一人约 1s 后冒出相同气泡，二者各持续 3s 后隐藏（渲染层按 t0 计算淡入淡出与可见性）。
// forceType/forceWho 仅供测试钩子确定性触发（绕过 20% 与场景/气泡护栏）。
function maybeTriggerDoubleBubble(forceType, forceWho) {
  if (!forceType && (game.scene !== "home" || game.bubble)) return;
  if (!forceType && (game.sleeping || game.forcedRest || game.travel)) return;
  const types = ["flower", "heart", "smile"];
  const type = (forceType && types.indexOf(forceType) >= 0) ? forceType
             : types[Math.floor(Math.random() * types.length)];
  const first = (forceWho === "shijie" || forceWho === "shimei") ? forceWho
              : (Math.random() < 0.5 ? "shijie" : "shimei");
  game.bubble = { type, first, t0: performance.now(), dur: 3000, secondDelay: 1000 };
}
// F8（游历界面）：游历期间世界冻结（game.clock 不推进），改用真实时间每 60s 检测一次。
// 绕过「家园 / 无在播气泡」之外的护栏（game.travel 下检查，但仍要求当前无在播气泡避免叠加）。
// type/who 随机；状态字段与家园双气泡完全一致（scenes.js 共用同一套渲染）。
function maybeTriggerTravelBubble() {
  if (game.bubble) return;                       // 已有在播则跳过，避免叠加
  if (Math.random() < 0.2) {                     // 每分钟 20% 概率（与家园每时辰一致）
    const types = ["flower", "heart", "smile"];
    const type = types[Math.floor(Math.random() * types.length)];
    const first = (Math.random() < 0.5 ? "shijie" : "shimei");
    game.bubble = { type, first, t0: performance.now(), dur: 3000, secondDelay: 1000 };
  }
}
/* ---------- F8 访客系统：每日 roll + 队列依次登场 + 事件表 ---------- */
// 多形态(forms)支持：同名 NPC 可声明多个形态，每形态自带立绘(img)与对话(events)。
// 无 forms 时回落为单形态（兼容旧配置）。
function effectiveForms(def) {
  if (def.forms && def.forms.length) return def.forms;
  return [{ img: def.img, events: def.events || [], name: def.name }];
}
// 按 weight 从形态列表中挑一个（默认等权）
function pickWeightedForm(forms) {
  if (!forms || !forms.length) return null;
  let tot = 0; for (const f of forms) tot += (f.weight || 1);
  let r = Math.random() * tot, pick = forms[0];
  for (const f of forms) { r -= (f.weight || 1); if (r <= 0) { pick = f; break; } }
  return pick;
}
// 每天统一 roll：每位访客按 weight/Σweight 独立判定是否到场，结果存入 todayVisitors 队列
function rollDailyVisitors() {
  const vs = C.visitors || [];
  const total = vs.reduce((a, v) => a + (v.weight || 0), 0);
  const list = [];
  for (const v of vs) {
    if (total > 0 && Math.random() < (v.weight || 0) / total) list.push({ def: v, forms: effectiveForms(v) });
  }
  // 保底：每天至少一位访客登场（避免约 1/3 概率的空场日让玩家误以为“没有访客”）
  if (list.length === 0 && vs.length) {
    let tot = 0; for (const v of vs) tot += (v.weight || 0);
    let r = Math.random() * tot, pick = vs[0];
    for (const v of vs) { r -= (v.weight || 0); if (r <= 0) { pick = v; break; } }
    list.push({ def: pick, forms: effectiveForms(pick) });
  }
  game.todayVisitors = list;
  game.visitorQueueIdx = 0;
  game.dayVisitorsRolled = true;
}
// 按权重从事件 id 列表里挑一个事件
function pickVisitorEvent(ids) {
  const evs = (ids || []).map((id) => (C.visitorEvents || []).find((e) => e.id === id)).filter(Boolean);
  if (!evs.length) return null;
  let tot = 0; for (const e of evs) tot += (e.weight || 1);
  let r = Math.random() * tot, pick = evs[0];
  for (const e of evs) { r -= (e.weight || 1); if (r <= 0) { pick = e; break; } }
  return pick;
}
// 执行访客事件：求药(seek) / 聊天(chat，可赠书 giftBook)
// 本函数保留为【自动/强制即时结算】路径（自动模式接待、调试 forceVisitor 直接调用）。
// 手动模式的 seek 走 talkToVisitor → 需求描述 → 选项面板（见 openVisitorChoice / visitorGift / visitorDecline）。
// v 可为 def 或 visitor 对象；若带 form 则优先用 form.name 作为显示名
function executeVisitorEvent(ev, v) {
  if (!ev) return;
  const def = v.def || v;
  const who = (v.form && v.form.name) || (def && def.name) || "";
  if (ev.type === "seek") {
    const have = ev.buyItem && (game.inventory[ev.buyItem] || 0) > 0;
    if (have) {
      game.inventory[ev.buyItem]--;
      if (ev.reward) {
        if (ev.reward.affinity) gainAffinity(ev.reward.affinity);
        if (ev.reward.diary) addDiaryEntry(ev.reward.diary);
      }
      if (!game.visitorsSeen.includes(def.id)) game.visitorsSeen.push(def.id);
      startDialogue(ev.dialog || [{ who, text: "（" + who + "来买走了些东西。）" }]);
    } else {
      // F3：无对应道具 → 多留 2 个时辰再离场（自动/强制路径；手动路径走选项面板不至此）
      const noStock = (ev.noStock && ev.noStock.length)
        ? ev.noStock
        : [{ who, text: "（" + who + "探头看了看，见没货，笑着先回去了。）" }];
      startDialogue(noStock);
      v.state = "waiting";
      v.waitMs = 2 * (DAY_CYCLE / 12) * 1000;   // 2 时辰（1 时辰 = DAY_CYCLE/12 秒）
    }
  } else { // chat（或含 giftBook 赠书）
    if (ev.reward) {
      if (ev.reward.affinity) gainAffinity(ev.reward.affinity);
      if (ev.reward.diary) addDiaryEntry(ev.reward.diary);
    }
    if (ev.giftBook) gainRandomBookChapter();   // F9 赠书：随机一章
    if (!game.visitorsSeen.includes(def.id)) game.visitorsSeen.push(def.id);
    startDialogue(ev.dialog || [{ who, text: "（" + who + "来串了个门。）" }]);
  }
}
// 手动模式 seek：先播「需求描述」（复用 ev.dialog），结束后由 onDone 开启选项面板
function startVisitorNeed(v, ev) {
  const def = v.def || v;
  const who = (v.form && v.form.name) || def.name || "";
  startDialogue(ev.dialog || [{ who, text: "（" + who + "似乎有求于二位。）" }], () => {
    // 对话结束：若访客仍在、面板未开，则开选项面板
    if (game.visitor === v && !game.visitorChoice) openVisitorChoice(v, ev);
  });
}
function openVisitorChoice(v, ev) {
  v.lingering = false;   // 重开选项时清除「再想想」豁免标志
  game.visitorChoice = { step: "main", v, ev, scroll: 0 };
}
function closeVisitorChoice() { game.visitorChoice = null; }
// F2 选项面板 · 赠予道具：玩家从持有可赠道具中选一个赠出
//   命中所求(buyItem) → 正常结算（扣库存/羁绊/日记/visitorsSeen），对话结束后离场；
//   非所求之物 → 婉拒，暂不离场（可再次点击重选）。
function visitorGift(itemId) {
  const ch = game.visitorChoice; if (!ch) return;
  const { v, ev } = ch;
  const def = v.def || v;
  const who = (v.form && v.form.name) || def.name || "";
  const has = itemId && (game.inventory[itemId] || 0) > 0;
  if (has && itemId === ev.buyItem) {
    game.inventory[itemId]--;
    if (ev.reward) {
      if (ev.reward.affinity) gainAffinity(ev.reward.affinity);
      if (ev.reward.diary) addDiaryEntry(ev.reward.diary);
    }
    if (!game.visitorsSeen.includes(def.id)) game.visitorsSeen.push(def.id);
    v.talked = true;   // 赠予即视为已交互（保证结算后由守卫切入离场）
    closeVisitorChoice();
    startDialogue(ev.dialog || [{ who, text: "（" + who + "收下了" + itemName(itemId) + "，道谢离去。）" }]);
    // 结算后：对话结束由 updateVisitor 的守卫自动切入离场（lingering=false）
  } else {
    closeVisitorChoice();
    v.lingering = true;   // 非所求之物：婉拒，暂不离场（状态保持，可再次点击重选）
    startDialogue([{ who, text: "这并非我所求之物，多谢你的好意。" }]);
  }
}
// F2 选项面板 · 暂时没有（如实告知）：说完台词即离场，不逗留。
// v.talked 已在需求描述阶段置 true，对话结束后由 updateVisitor 守卫自动切入离场（state="leaving"）。
function visitorDecline() {
  const ch = game.visitorChoice; if (!ch) return;
  const { v, ev } = ch;
  const def = v.def || v;
  const who = (v.form && v.form.name) || def.name || "";
  closeVisitorChoice();
  v.lingering = false;
  const noStock = (ev.noStock && ev.noStock.length)
    ? ev.noStock
    : [{ who, text: "（" + who + "见没有，笑着先回去了。）" }];
  startDialogue(noStock);
}
// F2 选项面板 · 再想想：关闭选项，访客停留 2 个时辰再离场（期间仍可点击重开选项）。
function visitorRethink() {
  const ch = game.visitorChoice; if (!ch) return;
  const { v } = ch;
  closeVisitorChoice();
  v.lingering = false;
  v.state = "waiting";
  v.waitMs = 2 * (DAY_CYCLE / 12) * 1000;   // 2 时辰
  const who = (v.form && v.form.name) || (v.def && v.def.name) || "";
  startDialogue([{ who, text: "（好，我在此稍候片刻。）" }]);
}
// 让队列中的下一位访客登场（落点：院门上方院内）。仅站立，不自动对话——
// 玩家需主动点击（hitVisitor → talkToVisitor）才开启事件，否则只是站在院子里。
function spawnVisitor(entry) {
  const g = gateTile();
  const vx = (g.x - 1) * TILE + TILE / 2;          // 院门左侧一格登场（院内，不重叠院门）
  const vy = g.y * TILE + TILE / 2;                // 与院门同列高度
  // 院中站立点：远离院门（列14/行11 空地），使「进场」与「离场」两段路程都清晰可见
  const stand = { x: 16 * TILE + TILE / 2, y: 9 * TILE + TILE / 2 };
  const forced = game._forceEvent || null; game._forceEvent = null;
  // 选定形态：优先用队列携带的 forms，否则由 def 推导；再按权重抽取一个
  const forms = entry.forms || effectiveForms(entry.def);
  const form = forms.length ? pickWeightedForm(forms) : null;
  const formIdx = forms.indexOf(form);
  // 事件池：严格绑定到「选中形态自身的 events」，杜绝跨形态串话。
  // 单形态访客(无 forms) 回落到 def.events；调试强制事件由 game._forceEvent 单独处理。
  const evPool = (form && form.events && form.events.length) ? form.events
               : (entry.def.events || []);
  const ev = forced || pickVisitorEvent(evPool);
  const formKey = form ? (entry.def.id + "#" + formIdx) : entry.def.id;
  game.visitor = { def: entry.def, form, formKey, x: vx, y: vy, event: ev, talked: false,
                   state: "arriving", walking: true, walkPhase: 0, stand };
  game.autoVisitorSkip = false;   // 新访客登场：清空“走不到”放弃标记，重新尝试自动接待
  // 形态可带独立显示名（如猫形态“小黑(猫)”）；否则用 def.name
  const shown = (form && form.name) || entry.def.name || "访客";
  setMsg(shown + "来访", 3.0);  // 屏幕级提示，确保玩家注意到
}
// 玩家主动与访客对话：触发其事件（求药/聊天/赠书）。已对话过或对话进行中则忽略。
function talkToVisitor() {
  if (!game.visitor) return;
  if (game.inDialogue) return;
  if (game.visitorChoice) return;          // 选项面板已开，忽略重复点击
  const v = game.visitor;
  const ev = v.event;
  if (!ev) { v.talked = true; return; }
  if (ev.type === "seek") {
    if (game.controlMode === "auto") {
      v.talked = true;
      executeVisitorEvent(ev, v);           // 自动：立即结算（持有所求→赠予；否则→F3 等待后离场）
    } else {
      if (v.talked) { openVisitorChoice(v, ev); return; }  // 已描述需求 → 重开选项（再想想/婉拒后重选）
      v.talked = true;
      startVisitorNeed(v, ev);              // 手动：先播「需求描述」，结束后开选项面板
    }
  } else {
    if (v.talked) return;
    v.talked = true;
    executeVisitorEvent(ev, v);             // chat / giftBook
  }
}
// 家园点击命中访客精灵（含横向相机还原）：名签~阴影约 ±0.7 格、纵向 y-0.85~y+0.6 格
function hitVisitor(lx, ly) {
  if (!game.visitor) return false;
  const v = game.visitor;
  const wx = lx + homeCamX;        // 家园存在横向相机，需还原世界坐标
  return wx >= v.x - TILE * 0.7 && wx <= v.x + TILE * 0.7 && ly >= v.y - TILE * 0.85 && ly <= v.y + TILE * 0.6;
}
function updateVisitor(dt) {
  const v = game.visitor;
  if (v) {
    // F3：等待期（多留 2 个时辰）——对话或选项面板开启时暂停倒计时
    if (v.state === "waiting") {
      if (!game.inDialogue && !game.visitorChoice) v.waitMs -= dt * 1000;
      if (v.waitMs <= 0) v.state = "leaving";
      return;
    }
    // 已交互且未开选项 → 离场（"再想想"/婉拒重选 以 lingering 标志豁免；等待期由上方分支处理）
    if (v.talked && !game.inDialogue && !game.visitorChoice && !v.lingering) { v.state = "leaving"; }
    // 进场：从院门走进院中站立点
    if (v.state === "arriving") {
      const tx = v.stand.x, ty = v.stand.y;
      const dx = tx - v.x, dy = ty - v.y, d = Math.hypot(dx, dy);
      const sp = 50 * dt;
      if (d <= sp || d < 2) { v.x = tx; v.y = ty; v.state = "idle"; v.walking = false; }
      else { v.x += dx / d * sp; v.y += dy / d * sp; v.facing = { x: dx / d, y: dy / d }; v.walking = true; v.walkPhase = (v.walkPhase || 0) + dt * 9; }
      return;
    }
    // 对话结束后：自动走向院门，抵达后再隐藏（而非直接消失）
    if (v.state === "leaving") {
      const g = gateTile();
      const tx = g.x * TILE + TILE / 2, ty = g.y * TILE + TILE / 2;
      const dx = tx - v.x, dy = ty - v.y, d = Math.hypot(dx, dy);
      const sp = 46 * dt;                          // 离场步速 px/s
      if (d <= sp || d < 2) {                       // 抵达院门：隐藏，安排下一位登场
        game.visitor = null;
        game.visitorSpawnTimer = 16 + Math.random() * 10;
      } else {
        v.x += dx / d * sp; v.y += dy / d * sp;
        v.facing = { x: dx / d, y: dy / d };
        v.walking = true;
        v.walkPhase = (v.walkPhase || 0) + dt * 9;  // 行走摆动相位
      }
      return;
    }
    // 未对话(talked=false) 或 lingering（再想想/婉拒后等待重选）：仅站立
    v.walking = false;
    return;
  }
  if (game.visitorSpawnTimer > 0) return;   // 计时已由 update() 按真实时间递减（不受对话/面板冻结影响）
  // 当日尚未 roll 则先 roll（兜底：首帧 / 旧档）
  if (!game.dayVisitorsRolled) rollDailyVisitors();
  const q = game.todayVisitors || [];
  if (game.visitorQueueIdx >= q.length) { game.visitorSpawnTimer = 999; return; }  // 今日访客已登场完毕
  const entry = q[game.visitorQueueIdx++];
  spawnVisitor(entry);
}

/* ---------- 同伴 AI（跟随 + 自动攻击） ---------- */
function nearestEnemy(from) {
  let best = null, bd = Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = dist(from.x, from.y, e.x, e.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best ? { e: best, d: bd } : null;
}
function companionThink(dt) {
  const p = other();
  if (p.dead) return;
  const a = active();
  const d = dist(a.pos.x, a.pos.y, p.pos.x, p.pos.y);
  const gap = (game.scene === "home") ? (T.followGapHome != null ? T.followGapHome : T.followGap) : T.followGap;
  if (d > gap) {
    const ux = (a.pos.x - p.pos.x) / (d || 1), uy = (a.pos.y - p.pos.y) / (d || 1);
    const sp = T.followSpeed * dt;
    const nx = p.pos.x + ux * sp, ny = p.pos.y + uy * sp;
    if (canMove(nx, p.pos.y)) p.pos.x = nx;
    if (canMove(p.pos.x, ny)) p.pos.y = ny;
    p.facing = { x: ux, y: uy };
  }
  if (!T.companionAutoAtk || p.cd.attack > 0) return;
  const t = nearestEnemy(p.pos);
  if (t && t.d <= p.skills.attack.range) {
    p.facing = { x: (t.e.x - p.pos.x) / (t.d || 1), y: (t.e.y - p.pos.y) / (t.d || 1) };
    castAttack(p);
  }
}
/* ---------- 家园 / 外出 切换辅助 ---------- */
// 次日落点：床正下方一格（不足则床周围就近找可走格），找不到再回默认 spawn
function bedSpawnPx() {
  const b = (C.furniture || []).find((f) => f.id === "bed");
  if (b) {
    const tries = [[0,1],[0,2],[1,1],[-1,1],[1,0],[-1,0],[0,3]];
    for (const t of tries) {
      const cx = (b.x + t[0]) * TILE + TILE / 2, cy = (b.y + t[1]) * TILE + TILE / 2;
      if (canMove(cx, cy) && !furnitureCollideAt(cx, cy)) return { x: cx, y: cy };
    }
  }
  return homeSpawnPx;
}
function positionSistersHome(spawn) {
  const px = spawn || homeSpawnPx;
  const sx = px.x, sy = px.y;
  sisters.shijie.pos.x = sx; sisters.shijie.pos.y = sy;
  sisters.shijie.facing = { x: 0, y: 1 };
  sisters.shimei.pos.x = sx + TILE * 0.8; sisters.shimei.pos.y = sy;
  sisters.shimei.facing = { x: 0, y: 1 };
  for (const k in sisters) { const s = sisters[k]; s.hp = s.maxHp; s.dead = false; s.invuln = 0; }
}
/* 院门瓦片坐标（缺省兜底 18,13） */
function gateTile() {
  const g = (C.furniture || []).find((f) => f.id === "gate");
  return g ? { x: g.x, y: g.y } : { x: 18, y: 13 };
}
/* 走到院门附近自动弹窗：询问是否外出 */
function promptOuting() {
  game.confirm = {
    title: "出 行",
    icon: "门",
    text: "是否出门采药？\n山中何事？松花酿酒，春水煎茶。",
    yesText: "出 门",
    noText: "等 等",
    onYes: function () { game.confirm = null; game._fromGate = true; openPanel("maps"); },
    onNo: function () { game.confirm = null; },
  };
}
function checkGatePrompt() {
  if (game.confirm || game.inDialogue || game.panel || game.activeActivity) return;
  const g = gateTile(); const a = active();
  const atx = Math.floor(a.pos.x / TILE), aty = Math.floor(a.pos.y / TILE);
  const near = Math.abs(atx - g.x) <= 1 && Math.abs(aty - g.y) <= 1;
  if (near) { if (!game._gatePrompted) { game._gatePrompted = true; promptOuting(); } }
  else { game._gatePrompted = false; }
}
/* 外出返回后落在院门旁（左侧相邻格，面朝大门） */
function positionSistersGate() {
  const g = gateTile();
  const sx = (g.x - 1) * TILE + TILE / 2, sy = g.y * TILE + TILE / 2;
  sisters.shijie.pos.x = sx; sisters.shijie.pos.y = sy; sisters.shijie.facing = { x: 1, y: 0 };
  sisters.shimei.pos.x = sx + TILE * 0.8; sisters.shimei.pos.y = sy; sisters.shimei.facing = { x: 1, y: 0 };
  for (const k in sisters) { const s = sisters[k]; s.hp = s.maxHp; s.dead = false; s.invuln = 0; }
}
function syncControls() {
  const show = (game.scene === "outing");
  for (const id of ["bAtk", "bHeal", "bSw", "bCombo"]) {
    const el = document.getElementById(id); if (el) el.style.display = show ? "" : "none";
  }
}
function returnHome() {
  game.showTitle = false;
  game.scene = "home"; game.state = "home"; game.panel = null;
  game.visitor = null; game.activeActivity = null; game.ended = false; game.win = false;
  // 回家即清场外敌人，避免 companionThink 在 home 中对幽灵敌人自动攻击并产生白圈
  if (typeof enemies !== "undefined") enemies.length = 0;
  for (const k in sisters) { const s = sisters[k]; s.attackFx = 0; s.healFx = 0; s.cd.attack = 0; s.cd.heal = 0; }
  game._gatePrompted = false;
  const spawn = game._spawnAtBed ? bedSpawnPx() : homeSpawnPx;
  game._spawnAtBed = false;
  if (game._fromGate) { positionSistersGate(); game._fromGate = false; game._gatePrompted = true; }
  else positionSistersHome(spawn);
  // F15：手动模式在外一日结束 → 返回主界面后补弹强制休息
  if (game.pendingRest) { game.pendingRest = false; game.forcedRest = true; showForcedRest(); }
  syncControls();
  setMsg("回到家中", 2.6);
}
const enterHome = returnHome;

/* ---------- 家园 HUD ---------- */
const homeBarRects = [];
function drawHomeBar() {
  homeBarRects.length = 0;
  const labels = [{ n: "diary", t: "日记" }, { n: "codex", t: "图鉴" }, { n: "travel", t: "游历" }];
  const n = labels.length, gap = 6, m = 8, bw = (W - m * 2 - gap * (n - 1)) / n, by = H - 34, bh = 26;
  for (let i = 0; i < n; i++) {
    const x = m + i * (bw + gap), lab = labels[i];
    const activeP = (game.panel === lab.n) || (lab.n === "travel" && game.travel && game.travel.phase === "setup");
    const fill = activeP ? "rgba(232,192,106,0.96)" : "rgba(247,239,225,0.96)";
    card(x, by, bw, bh, 9, fill, activeP ? TH.gold : "rgba(58,48,39,0.5)");
    ctx.fillStyle = activeP ? "#3a3027" : TH.ink;
    ctx.font = "bold 13px " + TH.fontBody;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(lab.t, x + bw / 2, by + 18);
    homeBarRects.push({ name: lab.n, x, y: by, w: bw, h: bh });
  }
}
function hitHomeBar(lx, ly) {
  for (const r of homeBarRects) if (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) return r.name;
  return null;
}

/* ---------- F16 游历：主界面「游历」按钮 → 时长弹窗 → 倒计时游历 ---------- */
// 时长选项（分钟）：5、10、15、20、25、30、35、40、45、50、55、60
const TRAVEL_MINS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const HAI_CLOCK = 21 / 24;            // 亥时（21:00–23:00）对应的 clock 值
const travelHits = [];                // 游历弹窗命中区（每帧由 drawTravelSetup 写入）
// 打开时长选择弹窗（仅在家园空闲、无其它模态时允许）
// 注：出行按钮的拦截浮层（panel/confirm/inDialogue/visitor/poem）已由 handleHomeBar 在调用前清掉，
// 此处仅需防「已开出行」的重入；保留 game.panel 兜底以防异常路径。（2026-07-25 修）
function openTravelSetup() {
  if (game.travel || game.panel) return;
  // 立即写入卡片边界，供「点击空白关闭」判定（避免首帧 _rect 未就绪时误关）
  game.travel = { phase: "setup", selectedMin: 30, _rect: { x: 16, y: 58, w: 256, h: 300 } };
}
function closeTravelSetup() { if (game.travel && game.travel.phase === "setup") game.travel = null; }
// 确认游历：抽一个未拥有的特产、锁定亥时、进入倒计时（游戏暂停）
function confirmTravel() {
  const t = game.travel; if (!t || t.phase !== "setup") return;
  const min = t.selectedMin || 30;
  const id = rollSpecial("travel");   // F11：从游历池排除已拥有，等概率取一个；全获得则 null
  t.rewardId = id;
  t.endMs = Date.now() + min * 60 * 1000;
  t.phase = "traveling";
  game.clock = HAI_CLOCK;              // 无论选择多久，归来时皆为当天亥时
  saveGame();
}
// 游历弹窗点击：时长格 → 选中；开始游历 → 确认；取消 → 关闭；卡片外空白 → 关闭
function handleTravelSetupClick(lx, ly) {
  if (!game.travel || game.travel.phase !== "setup") return;
  // 游历按钮本身可再次点击关闭弹窗（切换）；点 diary/codex 则切到对应面板（与底栏同级，可互相切换）
  const barName = hitHomeBar(lx, ly);
  if (barName === "travel") { handleHomeBar("travel"); return; }
  if (barName === "diary" || barName === "codex") { closeTravelSetup(); openPanel(barName); return; }
  for (const h of travelHits) {
    if (lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h) {
      if (h.kind === "dur") { game.travel.selectedMin = h.min; return; }
      if (h.kind === "start") { confirmTravel(); return; }
      if (h.kind === "cancel") { closeTravelSetup(); return; }
    }
  }
  // 点击卡片外空白区域 → 关闭弹窗（仅当 _rect 已就绪，避免误关）
  const r = game.travel._rect;
  if (r && (lx < r.x || lx > r.x + r.w || ly < r.y || ly > r.y + r.h)) closeTravelSetup();
}
// 每帧推进：setup 等待玩家选择；traveling 到点收尾
function updateTravel(dt) {
  const t = game.travel; if (!t) return;
  if (t.phase === "traveling" && Date.now() >= t.endMs) finalizeTravel();
  // F8：游历界面每 60s（真实时间）检测一次双气泡（世界冻结，改用实时计时；20% 概率）
  if (t.phase === "traveling") {
    if (!game._travelBubbleLast) game._travelBubbleLast = Date.now();
    if (Date.now() - game._travelBubbleLast >= 60000) {
      game._travelBubbleLast = Date.now();
      maybeTriggerTravelBubble();
    }
  }
}
// 游历结束：带回随机特产（去重）+ 记入日历「两人外出游历，带回XX。」
function finalizeTravel() {
  const t = game.travel; if (!t || t.phase !== "traveling") return;
  const id = t.rewardId;
  if (id) {
    unlockCodex(id); game.everOwned[id] = true; game.specialOwned[id] = true;
    const it = (C.codex && C.codex.items || []).find((x) => x.id === id);
    const nm = it ? it.name : id;
    setMsg("游历归来，带回「" + nm + "」", 2.2);
    addDiaryEntry("两人外出游历，带回" + nm + "。");   // 时辰前缀「亥时，」由日记面板统一渲染
  } else {
    addDiaryEntry("两人外出游历。");
  }
  saveGame();
  game.travel = null;
  game._travelBubbleLast = null;   // F8：重置游历气泡计时，下次游历重新从 60s 起算
}
function drawHUDHome() {
  const a = active();
  const sj = sisters.shijie, sm = sisters.shimei;
  ctx.textBaseline = "alphabetic";
  // 双姝血卡（精简版，保留血量信息）
  drawSisterCard(sj, 4, 4, 86, 26, a.id === "shijie");
  drawSisterCard(sm, W - 4 - 86, 4, 86, 26, a.id === "shimei");
  // 点击区域记录（用于切换主控角色）
  homeSisterCardRects.length = 0;
  homeSisterCardRects.push({ id: "shijie", x: 4, y: 4, w: 86, h: 26 });
  homeSisterCardRects.push({ id: "shimei", x: W - 4 - 86, y: 4, w: 86, h: 26 });
  // 顶栏中央装饰底板：日月弧线 + 天数层的装饰填充（半透米白 + 淡金描边）
  // 依据当前文本宽度动态扩展，保证加入时辰后仍能完整显示
  const hudLabel = "第 " + game.day + " 日 · " + shichenName(game.clock) + (game.weather ? " · " + weatherName(game.weather) : "");
  ctx.font = "10px " + TH.fontBody; ctx.textBaseline = "alphabetic";
  const bannerW = Math.min(106, Math.max(82, ctx.measureText(hudLabel).width + 12));
  const bannerL = W / 2 - bannerW / 2, bannerR = W / 2 + bannerW / 2;
  drawCelestialBanner(W / 2, 3, 40, bannerW);
  // 昼夜指示（共用组件：弧线 + 日/月 相位）
  drawCelestialIndicator(W / 2, 18);
  ctx.textAlign = "center"; ctx.fillStyle = TH.ink; ctx.font = "10px " + TH.fontBody;
  ctx.fillText(hudLabel, W / 2, 35);
  // 设置按钮（方形齿轮图标，左侧对齐天数模块左边缘）
  drawSettingsBtn(bannerL);
  // 操作模式徽标（右侧对齐天数模块右边缘，点击切换 手动/自动）
  drawModeBadge(bannerR - 64, 42, 64, 15);
  // F1：炼制中进度（家园顶栏小条，与药方面板共用 game.brewing 状态）
  if (game.brewing) {
    const br = (C.recipes || []).find((x) => x.id === game.brewing.recipeId);
    const bn = br ? (br.name || br.output) : "丹药";
    const durMs = Math.max(1, (game.brewing.brewHours || 1) * (DAY_CYCLE / 12) * 1000);
    const remain = Math.max(0, game.brewing.endMs - Date.now());
    const prog = Math.max(0, Math.min(1, 1 - remain / durMs));
    const pw = 112, ph = 15, px = W / 2 - pw / 2, py = 60;
    card(px, py, pw, ph, 8, "rgba(247,239,225,0.92)", TH.gold);
    ctx.fillStyle = TH.ink; ctx.font = "9px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText("炼制 " + bn + " " + Math.floor(prog * 100) + "%", W / 2, py + 11);
  }
  // 飘字统一由全局 drawToast() 置顶绘制（见 ui.js / main.js），此处不再内联
}
function drawSisterCard(s, x, y, w, h, isActive) {
  card(x, y, w, h, 8, "rgba(247,239,225,0.94)", isActive ? TH.gold : "rgba(58,48,39,0.35)");
  const cx = x + 14, cy = y + h / 2;
  ctx.fillStyle = s.dead ? "#bdb3a6" : s.color;
  ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = s.accent || s.color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke();
  // 首字加深色描边，确保师妹浅蓝等浅色头像上仍清晰可读（不遮挡头像主色）
  const ch = s.dead ? "倒" : (s.name[0] || "?");
  ctx.font = "bold 10px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(35,28,22,0.80)"; ctx.strokeText(ch, cx, cy + 1);
  ctx.fillStyle = "#fff"; ctx.fillText(ch, cx, cy + 1); ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left"; ctx.font = (isActive ? "bold " : "") + "11px " + TH.fontBody;
  ctx.fillStyle = isActive ? TH.ink : TH.inkSoft2;
  ctx.fillText(s.name, x + 28, y + 11);
  bar(x + 28, y + 16, w - 34, 6, s.hp / s.maxHp, s.dead ? "#9a9088" : s.color, "rgba(58,48,39,0.18)");
}

/* ---------- 系统设置按钮与弹窗 ---------- */
function getSettingsBtn(bannerL) {
  const bx = (typeof bannerL === "number") ? bannerL : (W / 2 - 56);
  return { x: bx, y: 40, w: 18, h: 18 };
}
function drawSettingsBtn(bannerL) {
  const b = getSettingsBtn(bannerL);
  ctx.save();
  ctx.fillStyle = "rgba(247,239,225,0.90)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 5);
  else ctx.rect(b.x, b.y, b.w, b.h);
  ctx.fill();
  ctx.strokeStyle = "rgba(58,48,39,0.30)"; ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = TH.ink; ctx.font = "bold 12px " + TH.fontBody;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("⚙", b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.restore();
}
function hitSettingsBtn(lx, ly) {
  const b = getSettingsBtn();
  return lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h;
}
function toggleSettings() {
  if (game.settingsOpen) { game.settingsOpen = false; return; }
  game.settingsOpen = true;
}
function drawSettingsPanel() {
  if (!game.settingsOpen) return;
  // 遮罩 + 卡片上下居中
  const pw = 192, ph = 188, px = W / 2 - pw / 2, py = (H - ph) / 2;
  ctx.save();
  ctx.fillStyle = "rgba(20,16,12,0.30)"; ctx.fillRect(0, 0, W, H);
  panel(px, py, pw, ph, 12, "rgba(247,239,225,0.985)", null);
  ctx.strokeStyle = "rgba(58,48,39,0.40)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 12); else ctx.rect(px, py, pw, ph); ctx.stroke();
  drawKnot(px + pw + 2, py + 29);
  // 标题
  ctx.fillStyle = TH.ink; ctx.font = "bold 15px " + TH.fontTitle; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText("系统设置", W / 2, py + 32);
  ctx.textAlign = "left";
  const cx = px + 20, bxW = pw - 40, bxH = 30, gap = 10;
  // ① 存档
  const saY = py + 52;
  drawOptionBtn(cx, saY, bxW, bxH, "存 档", {});
  // ② 读档
  const ldY = saY + bxH + gap;
  drawOptionBtn(cx, ldY, bxW, bxH, "读 档", {});
  // 分隔线
  const divY = ldY + bxH + 8;
  ctx.strokeStyle = "rgba(58,48,39,0.15)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx + 6, divY); ctx.lineTo(cx + bxW - 6, divY); ctx.stroke();
  // ③ 速度：标签与单选圆点同行垂直居中
  const rowY = divY + 18;   // 同行中心 y（标签 + 单选共用）
  ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody; ctx.textBaseline = "middle";
  ctx.fillText("速度", cx, rowY);
  ctx.textBaseline = "alphabetic";
  const rbX = cx + 44, rbW = 52;
  const rbFast = { x: rbX, y: rowY, w: rbW, h: 20 };
  const rbSlow = { x: rbX + rbW + 6, y: rowY, w: rbW, h: 20 };
  drawRadioBtn(rbFast.x, rbFast.y, "快", game.speedMode === "fast");
  drawRadioBtn(rbSlow.x, rbSlow.y, "慢", game.speedMode === "slow");
  // 记录按钮区用于点击判定
  game._settingsRadio = { rbFast: rbFast, rbSlow: rbSlow };
  ctx.restore();
}
/* 单选按钮：圆点指示器 + 文字。y = 圆点/文字垂直中心 */
function drawRadioBtn(x, y, label, active) {
  const r = 5, cxD = x + 10;
  ctx.save();
  ctx.strokeStyle = active ? TH.zhusha : "rgba(58,48,39,0.40)"; ctx.lineWidth = active ? 1.8 : 1.3;
  ctx.beginPath(); ctx.arc(cxD, y, r, 0, Math.PI * 2); ctx.stroke();
  if (active) {
    ctx.fillStyle = TH.zhusha; ctx.beginPath(); ctx.arc(cxD, y, r * 0.52, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = active ? "#7a2f29" : TH.ink; ctx.font = (active ? "bold " : "") + "13px " + TH.fontBody;
  ctx.textBaseline = "middle";
  ctx.fillText(label, cxD + 12, y);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}
function handleSettingsPanelClick(lx, ly) {
  if (!game.settingsOpen || game.confirm) return;
  const pw = 192, ph = 188, px = W / 2 - pw / 2, py = (H - ph) / 2;
  const cx = px + 20, bxW = pw - 40, bxH = 30, gap = 10;
  // 点遮罩外侧 → 关闭
  if (lx < px || lx > px + pw || ly < py || ly > py + ph) { game.settingsOpen = false; return; }
  // ① 存档
  const saY = py + 52;
  if (lx >= cx && lx <= cx + bxW && ly >= saY && ly <= saY + bxH) {
    saveGame(); setMsg("已保存", 1.4); game.settingsOpen = false; return;
  }
  // ② 读档
  const ldY = saY + bxH + gap;
  if (lx >= cx && lx <= cx + bxW && ly >= ldY && ly <= ldY + bxH) {
    game.confirm = { title: "读 档", yesText: "读 档", noText: "取 消", icon: "阅",
      text: "确认读取最近存档？\n未保存的进度将丢失。", forced: false,
      onYes: function() { game.confirm = null; game.settingsOpen = false; loadGame(game.saveSlot); },
      onNo:  function() { game.confirm = null; } };
    return;
  }
  // ③ 速度单选（圆点区域 + 文字均响应）
  const rb = game._settingsRadio;
  if (rb) {
    if (lx >= rb.rbFast.x && lx <= rb.rbFast.x + rb.rbFast.w && ly >= rb.rbFast.y && ly <= rb.rbFast.y + rb.rbFast.h + 10) {
      game.speedMode = "fast"; setDayCycle(); setMsg("已切换为快速", 1.5); game.settingsOpen = false; return;
    }
    if (lx >= rb.rbSlow.x && lx <= rb.rbSlow.x + rb.rbSlow.w && ly >= rb.rbSlow.y && ly <= rb.rbSlow.y + rb.rbSlow.h + 10) {
      game.speedMode = "slow"; setDayCycle(); setMsg("已切换为慢速", 1.5); game.settingsOpen = false; return;
    }
  }
}

/* ===== src/outing.js ===== */
/* =========================================================================
 * 《明清日常》引擎 · 外出 / 战斗 / 对话 模块 (outing.js)
 * 依赖同一全局作用域（按 index.html 顺序：core → scenes → home → outing → ui → main）
 * ========================================================================= */

/* ---------- 战斗：攻击 ---------- */
function castAttack(s) {
  const sk = s.skills.attack;
  if (s.cd.attack > 0) return;
  s.cd.attack = sk.cooldown;
  if (sk.type === "melee") {
    for (const e of enemies) {
      if (e.alive && dist(s.pos.x, s.pos.y, e.x, e.y) <= sk.range) damageEnemy(e, sk.damage);
    }
    s.attackFx = 0.15;
  } else if (sk.type === "ranged") {
    projectiles.push({
      x: s.pos.x, y: s.pos.y,
      vx: s.facing.x * sk.projectileSpeed, vy: s.facing.y * sk.projectileSpeed,
      damage: sk.damage, life: 2.0,
    });
  }
}
function damageEnemy(e, dmg) {
  e.hp -= dmg; e.hitFlash = 0.12;
  addBond(T.bondGainHit);
    if (e.hp <= 0) {
    if (e.alive) game.monstersDefeated = (game.monstersDefeated || 0) + 1;   // 回顾统计：仅由活转死计一次
    e.hp = 0; e.alive = false;
    if (Math.random() < 0.05) { const sp = rollSpecial("enemy"); if (sp) gainSpecial(sp); }   // F11 击败 5% 掉落特殊道具
    if (Math.random() < 0.10) gainRandomBookChapter();   // F9 击败 10% 掉落随机书章
  }
}

/* ---------- 战斗：治疗（朝向对方） ---------- */
function castHeal(s) {
  const sk = s.skills.heal;
  if (s.cd.heal > 0) return;
  if (game.lingqi < sk.cost) { if (s === active()) setMsg("默契不足，再等等…", 1.2); return; }
  s.cd.heal = sk.cooldown; game.lingqi -= sk.cost;
  const p = (s === sisters.shijie) ? sisters.shimei : sisters.shijie; // 对方
  if (sk.type === "heal") {
    p.hp = Math.min(p.maxHp, p.hp + sk.amount);
    if (sk.selfAmount) s.hp = Math.min(s.maxHp, s.hp + sk.selfAmount);
  } else if (sk.type === "healAoe") {
    for (const k in sisters) sisters[k].hp = Math.min(sisters[k].maxHp, sisters[k].hp + sk.amount);
  }
  s.healFx = 0.3;
  addBond(T.bondGainHeal);
}

/* ---------- 羁绊值 ---------- */
function addBond(v) { game.bond = Math.min(T.bondMax, game.bond + v); }

/* ---------- 合击技 ---------- */
function castCombined() {
  if (game.bond < T.bondMax) { setMsg("羁绊未满，并肩作战积攒", 1.2); return; }
  game.bond = 0;
  const cb = T.combined;
  const cx = (active().pos.x + other().pos.x) / 2;
  const cy = (active().pos.y + other().pos.y) / 2;
  for (const e of enemies) if (e.alive && dist(cx, cy, e.x, e.y) <= cb.range) damageEnemy(e, cb.damage);
  for (const k in sisters) sisters[k].hp = Math.min(sisters[k].maxHp, sisters[k].hp + cb.healBoth);
  game.combinedFx = 0.55;
  if (!game.combinedShown) {
    game.combinedShown = true;
    startDialogue(C.story.onCombined);
  }
  setMsg("合击 · " + cb.name + "！", 1.6);
}

/* ---------- 切换操控对象 ---------- */
function doSwitch() {
  if (game.inDialogue || game.ended) return;
  const o = other();
  if (o.dead) { setMsg(o.name + "已力竭，暂无法上场", 1.4); return; }
  activeId = o.id;
  active().invuln = T.invulnAfterSwitch;
  setMsg("换 " + active().name + " 上", 1.0);
}

/* ---------- 受伤 / 倒下 ---------- */
function damageSister(s, dmg) {
  if (s.invuln > 0) return;
  s.hp -= dmg;
  if (s.hp <= 0) {
    s.hp = 0; s.dead = true;
    if (s === active()) {
      const p = other();
      if (!p.dead) { activeId = p.id; active().invuln = T.invulnAfterSwitch; setMsg(active().name + "上前接替！", 1.4); }
      else endGame(false);
    }
  }
}

/* ---------- 对话系统（优先使用当前地图独立 story，回退全局） ---------- */
function currentStory() {
  const md = currentMapDef();
  return (md && md.story) ? md.story : C.story;
}
function startDialogue(lines, onDone) {
  if (!lines || !lines.length) { if (onDone) onDone(); return; }
  game.dialogueQueue = lines.slice(); game.dialogueIndex = 0;
  game.inDialogue = true; game._dialogueDone = onDone || null;
  game._autoDlgTimer = 0;   // 自动模式对话自动播放：重置逐句计时，首句完整呈现
}
function advanceDialogue() {
  if (!game.inDialogue) return;
  game.dialogueIndex++;
  if (game.dialogueIndex >= game.dialogueQueue.length) {
    game.inDialogue = false; const cb = game._dialogueDone; game._dialogueDone = null; if (cb) cb();
  }
}
function endGame(win) {
  if (game.ended) return;
  game.win = win; game.ended = true;
  if (win) startDialogue(currentStory().onReturn, () => returnHome());
  else startDialogue(currentStory().onLose);   // 败而不挫：对话结束后回到家中
}

/* ---------- 场景重置（外出开局 / 再上山） ---------- */
function resetWorld(spawnAt) {
  const sp = spawnAt || startPx;
  herbs.forEach((h) => { h.collected = false; });
  game.herbsCollected = 0;
  enemies.forEach((e, i) => {
    const s = enemySpawns[i];
    e.alive = true; e.hp = e.maxHp; e.cd = 0; e.hitFlash = 0;
    e.x = s.x * TILE + TILE / 2; e.y = s.y * TILE + TILE / 2;
  });
  for (const k in sisters) {
    const s = sisters[k];
    s.hp = s.maxHp; s.dead = false; s.cd.attack = 0; s.cd.heal = 0;
    s.invuln = 0; s.attackFx = 0; s.healFx = 0;
    s.pos.x = sp.x; s.pos.y = sp.y; s.facing = { x: 0, y: 1 };
  }
  game.lingqi = T.lingqiMax; game.bond = 0;
  game.firstHerbDone = false; game.combinedShown = false;
  game.combinedFx = 0; game.homeHint = 0;
  activeId = "shijie";
  game.ended = false; game.win = false;
  game.homeDone = {};
}

/* ---------- 进入外出（可指定地图索引；无参 = 第 0 图，兼容旧调用/测试） ---------- */
function launchOuting(mapIndex) {
  const idx = (typeof mapIndex === "number" && mapIndex >= 0 && mapIndex < parsedMaps.length) ? mapIndex : 0;
  loadMap(idx);
  game.showTitle = false;
  game.scene = "outing"; game.state = "play"; game.panel = null;
  game.visitor = null; game.activeActivity = null; game.ended = false; game.win = false;
  resetWorld();
  // F12 宝箱：进入地图时按概率在随机地板格生成
  game.chest = null;
  const cdef = C.chest;
  if (cdef && Math.random() < (cdef.spawnChance || 0)) {
    const pm = parsedMaps[idx];
    const cells = [];
    if (pm && pm.grid) for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const ch = pm.grid[y] && pm.grid[y][x];
      if (ch === ".") cells.push({ x, y });
    }
    if (cells.length) {
      const c = cells[Math.floor(Math.random() * cells.length)];
      game.chest = { x: c.x, y: c.y, taken: false };
    }
  }
  syncControls();
  startDialogue(currentStory().intro);
}

/* ---------- F12 宝箱开启：按权重抽道具（item=随机草药/丹药入库存 / special=随机特殊道具点亮图鉴） ---------- */
function openChest() {
  const cfg = C.chest || { weights: { item: 1, special: 1 } };
  const w = cfg.weights || {};
  const total = (w.item || 0) + (w.special || 0);
  if (total <= 0) { setMsg("宝箱空空", 1.4); return; }
  const pick = Math.random() * total;
  if (pick < (w.item || 0)) {
    const pool = (C.codex.items || []).filter((it) => it.type === "herb" || it.type === "medicine").map((it) => it.id);
    if (!pool.length) return;
    const id = pool[Math.floor(Math.random() * pool.length)];
    addInventory(id, 1); unlockCodex(id);
    const it = (C.codex.items || []).find((x) => x.id === id);
    toastGain(id);
    addDiaryEntry("开宝箱得「" + (it ? it.name : id) + "」。");
    saveGame();
  } else {
    const id = rollSpecial("chest") || (function () {
      const all = (C.codex.items || []).filter((it) => it.type === "special").map((it) => it.id);
      const avail = all.filter((i) => !game.specialOwned[i]);
      return avail.length ? avail[Math.floor(Math.random() * avail.length)] : null;
    })();
    if (id) gainSpecial(id); else setMsg("宝箱空空，已无新物", 1.4);
  }
}

/* ---------- 外出逐帧更新 ---------- */
function updatePlay(dt) {
  moveActive(dt);
  game.lingqi = Math.min(T.lingqiMax, game.lingqi + T.lingqiRegen * dt);
  for (const k in sisters) {
    const s = sisters[k];
    if (s.cd.attack > 0) s.cd.attack = Math.max(0, s.cd.attack - dt);
    if (s.cd.heal > 0) s.cd.heal = Math.max(0, s.cd.heal - dt);
    if (s.invuln > 0) s.invuln = Math.max(0, s.invuln - dt);
    if (s.attackFx > 0) s.attackFx = Math.max(0, s.attackFx - dt);
    if (s.healFx > 0) s.healFx = Math.max(0, s.healFx - dt);
  }
  if (!active().dead && !other().dead && dist(active().pos.x, active().pos.y, other().pos.x, other().pos.y) < T.closeRange)
    addBond(T.bondGainClose * dt);
  if (T.bondDecay > 0) game.bond = Math.max(0, game.bond - T.bondDecay * dt);
  companionThink(dt);
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
    if (e.cd > 0) e.cd = Math.max(0, e.cd - dt);
    const d = dist(active().pos.x, active().pos.y, e.x, e.y);
    if (d < e.aggro) {
      const ux = (active().pos.x - e.x) / (d || 1), uy = (active().pos.y - e.y) / (d || 1);
      const sp = e.speed * dt;
      const nx = e.x + ux * sp, ny = e.y + uy * sp;
      if (!isWallPx(nx, e.y)) e.x = nx;
      if (!isWallPx(e.x, ny)) e.y = ny;
      for (const k in sisters) {
        const s = sisters[k];
        if (!s.dead && dist(s.pos.x, s.pos.y, e.x, e.y) < e.atkRange + 11 && e.cd <= 0) {
          damageSister(s, e.atk); e.cd = e.atkCd; break;
        }
      }
    }
  }
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    let hit = false;
    for (const e of enemies) if (e.alive && dist(p.x, p.y, e.x, e.y) < 14) { damageEnemy(e, p.damage); hit = true; break; }
    if (hit || p.life <= 0 || isWallPx(p.x, p.y)) projectiles.splice(i, 1);
  }
  // 采集：按药材 id 解锁图鉴 + 入库存（供制药 / 访客）；采满不强制，踏药庐即归
  const a = active();
  for (const h of herbs) {
    if (h.collected) continue;
    if (dist(a.pos.x, a.pos.y, h.x * TILE + TILE / 2, h.y * TILE + TILE / 2) < TILE * 0.55) {
      h.collected = true; game.herbsCollected++;
      game.lingqi = Math.min(T.lingqiMax, game.lingqi + 12);
      if (h.id) { unlockCodex(h.id); addInventory(h.id, 1); toastGain(h.id); }
      if (Math.random() < 0.05) { const sp = rollSpecial("herb"); if (sp) gainSpecial(sp); }   // F11 采药 5% 掉落特殊道具
      if (Math.random() < 0.05) gainRandomBookChapter();   // F9 采药 5% 掉落随机书章
      if (!game.firstHerbDone) { game.firstHerbDone = true; startDialogue(currentStory().onFirstHerb); }
    }
  }
  // F12 宝箱：踩中即开启（一次性）
  if (game.chest && !game.chest.taken) {
    const cd = dist(a.pos.x, a.pos.y, game.chest.x * TILE + TILE / 2, game.chest.y * TILE + TILE / 2);
    if (cd < TILE * 0.55) { game.chest.taken = true; openChest(); }
  }
  // 回庐：走到药庐旁弹窗确认，不直接切回家园
  const hd = dist(a.pos.x, a.pos.y, home.x * TILE + TILE / 2, home.y * TILE + TILE / 2);
  if (hd < TILE * 0.6 && !game.confirm && !game.inDialogue && !game.ended && !game._returnPrompted) {
    game._returnPrompted = true;
    const md = currentMapDef();
    const confirmText = (md && md.story && md.story.confirmReturn)
      ? md.story.confirmReturn
      : "是否返回药庐？\n此行采集的草药会保留，\n回到家中可制药休憩。";
    game.confirm = {
      title: "归 庐",
      icon: "归",
      yesText: "回 庐",
      noText: "暂 不",
      text: confirmText,
      onYes: () => { game.confirm = null; game._returnPrompted = false; returnHome(); },
      onNo: () => { game.confirm = null; },
    };
  }
  if (hd > TILE * 1.5) game._returnPrompted = false;
}

/* ---------- HUD 分发（外出 / 家园） ---------- */
function drawHUD() {
  if (game.scene === "outing") drawHUDOuting();
  else drawHUDHome();
}
function drawHUDOuting() {
  const a = active();
  const sj = sisters.shijie, sm = sisters.shimei;
  ctx.textBaseline = "alphabetic";
  const th = mapTheme();
  drawOutingTopBar(th);   // 重绘不透明顶栏，覆盖昼夜滤镜染色，保持任务条清晰
  const bandH = 34;
  ctx.fillStyle = "rgba(232,192,106,0.18)"; ctx.fillRect(0, bandH, W, 1);
  drawSisterCard(sj, 4, 4, 86, 26, a.id === "shijie");
  drawSisterCard(sm, W - 4 - 86, 4, 86, 26, a.id === "shimei");
  const bx = 94, bw = 100;
  ctx.textAlign = "left"; ctx.font = "11px " + TH.fontBody;
  ctx.fillStyle = "#f3ead9"; ctx.fillText("默契", bx, 15);
  barR(bx + 26, 8, bw - 30, 6, game.lingqi / T.lingqiMax, "#6fb3d8", "rgba(255,255,255,0.28)");
  ctx.fillStyle = game.bond >= T.bondMax ? "#ffd9e6" : "#f0d6e0";
  ctx.fillText("羁绊", bx, 30);
  barR(bx + 26, 23, bw - 30, 6, game.bond / T.bondMax, game.bond >= T.bondMax ? TH.zhusha : "#d79bbb", "rgba(255,255,255,0.28)");
  if (game.bond >= T.bondMax) {
    const p = 0.6 + 0.4 * Math.sin(performance.now() / 250);
    ctx.save(); glow(true, "rgba(194,69,61,0.8)", 8);
    ctx.globalAlpha = p; ctx.fillStyle = TH.zhusha;
    ctx.beginPath(); ctx.arc(bx + bw - 6, 26, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); glow(false); ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff"; ctx.font = "bold 10px " + TH.fontBody; ctx.textAlign = "center";
    ctx.fillText("同", bx + bw - 6, 28);
  }
  ctx.textAlign = "center"; ctx.font = "11px " + TH.fontBody;
  const goalTxt = "采药 " + game.herbsCollected + " / " + requiredHerbs + "　·　踏药庐即归";
  const gw = ctx.measureText(goalTxt).width + 34;
  card(W / 2 - gw / 2, bandH + 5, gw, 16, 9, "rgba(40,33,26,0.80)", null);
  leafIcon(W / 2 - gw / 2 + 11, bandH + 14, 4.5, TH.herb);
  ctx.fillStyle = "#f3ead9"; ctx.fillText(goalTxt, W / 2 + 6, bandH + 18);
  // 飘字统一由全局 drawToast() 置顶绘制（见 ui.js / main.js），此处不再内联
  // 外出界面不显示顶栏日月弧线 / 天数装饰 / 手动自动按钮（F15：仅家园顶栏承载这些）
}

/* ===== src/ui.js ===== */
/* =========================================================================
 * 《明清日常》引擎 · 界面层 (ui.js)
 * 对话排版 / 对话绘制 / 面板 / 结屏 / 标题 / 开始
 * 依赖：core（绘制基元、W/H、TH、PAL、portraitImg、game）
 *       home（panelHits、craftRecipe、handlePanelClick、closePanel、emptyState 之依赖）
 * ========================================================================= */

/* ---------- 通用：按 id 取图鉴/药材名（生药与成品都在 codex.items） ---------- */
function itemName(id) {
  const it = (C.codex && C.codex.items || []).find((x) => x.id === id);
  return it ? it.name : id;
}
// 道具类型中文标签（选项面板/图鉴通用）
function typeLabel(t) {
  return ({ herb: "草药", flower: "鲜花", medicine: "丹药", special: "特殊", book: "书籍" })[t] || t;
}
/* ---------- 图鉴：已解锁 + 当前分类（草药/丹药/书籍/特殊）过滤 ---------- */
function isUnlocked(it) {
  if (it.type === "book") return !!(game.books && game.books[it.id] && game.books[it.id].length);  // F9 书：拥有≥1章即解锁
  return !!game.everOwned[it.id];                                         // F16：曾获得过即点亮（卖掉/消耗也不置灰）
}
function codexItemsFiltered() {
  // 图鉴展示全部道具（无论是否已拥有），未拥有者在绘制层置灰
  const all = (C.codex.items || []);
  const cat = game.codexCat || "all";
  if (cat === "all") return all;
  if (cat === "book") return sortCodexBooks(all.filter((it) => it.type === "book"));
  return all.filter((it) => it.type === cat);   // herb/medicine/special 与标签值一一对应
}

/* ---------- 对话排版（供 tests / 绘制复用） ---------- */
function layoutDialogue(line, measure) {
  const bx = 12, bw = W - 24;
  const sp = findSisterByName(line.who);
  let hasPortrait = false, pw = 0, px = 0;
  let textX = bx + 12, textW = bw - 24;
  if (sp) {
    pw = 66; px = bx + 12;
    textX = px + pw + 10;
    textW = bw - (px + pw + 10 - bx) - 12;
    hasPortrait = true;
  }
  const padYTop = 8, padYBottom = 18, nameH = 22, gap = 3;
  const maxBoxH = H * 0.42;
  const hardMax = H - 24;
  let fs = 13, lh = fs + 5;
  let lines = wrapLines(line.text, fs + "px sans-serif", textW, measure);
  while ((padYTop + nameH + gap + lines.length * lh + padYBottom) > maxBoxH && fs > 8) {
    fs -= 1; lh = fs + 5;
    lines = wrapLines(line.text, fs + "px sans-serif", textW, measure);
  }
  const contentH = padYTop + nameH + gap + lines.length * lh + padYBottom;
  const boxH = Math.min(hardMax, contentH);
  const by = H - 12 - boxH;
  const nameY = by + padYTop + fs - 2;
  const bodyY = by + padYTop + nameH + gap + fs - 2;
  const ph = Math.min(boxH - 16, 84);
  const py = by + (boxH - ph) / 2;
  return { bx, bw, sp, hasPortrait, pw, px, textX, textW, boxH, by, nameY, bodyY, lh, fs, lines, ph, py };
}

/* ---------- 对话绘制 ---------- */
function drawDialogueCard(line, hint) {
  const L = layoutDialogue(line, (t, f) => ctx.measureText(t).width);
  const accent = L.sp ? (L.sp.accent || L.sp.color) : TH.gold;
  // 对话卡外框：与弹窗体系统一，柔和对称投影 + 不透明宣纸底。
  // 旧版 card() 重偏移投影(blur14/offsetY5)压在地面上显脏，改用轻投影。
  ctx.save();
  ctx.shadowColor = "rgba(40,33,26,0.14)"; ctx.shadowBlur = 7; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 1;
  panel(L.bx, L.by, L.bw, L.boxH, 12, "rgba(247,239,225,0.985)", null);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = "rgba(58,48,39,0.45)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(L.bx, L.by, L.bw, L.boxH, 12); else ctx.rect(L.bx, L.by, L.bw, L.boxH); ctx.stroke(); ctx.restore();
  if (L.hasPortrait) {
    const img = portraitImg[L.sp.id];
    // 立绘底卡（轻托，缩放适配，不变形）
    ctx.save();
    panel(L.px - 4, L.py - 4, L.pw + 8, L.ph + 8, 8, "rgba(58,48,39,0.05)", "rgba(58,48,39,0.18)");
    ctx.restore();
    if (img && img.complete && img.naturalWidth) {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.min(L.pw / iw, L.ph / ih);
      const dw = iw * s, dh = ih * s;
      const dx = L.px + (L.pw - dw) / 2, dy = L.py + (L.ph - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.save(); glow(true, (L.sp.accent || L.sp.color), 6);
      ctx.fillStyle = L.sp.color;
      ctx.beginPath(); ctx.arc(L.px + L.pw / 2, L.py + L.ph / 2, 18, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); glow(false);
      ctx.strokeStyle = L.sp.accent || L.sp.color; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(L.px + L.pw / 2, L.py + L.ph / 2, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 18px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText((L.sp.name[0] || "?"), L.px + L.pw / 2, L.py + L.ph / 2 + 1); ctx.textBaseline = "alphabetic";
    }
  }
  // 优先用解析到的角色名（config 里 who 可能是 id 如 shijie，日常对话则 who 已是中文名，二者等价）
  const who = (L.sp ? L.sp.name : (line.who || " "));
  ctx.textAlign = "left"; ctx.font = "bold " + L.fs + "px " + TH.fontBody;
  if (L.sp) {
    const pwName = ctx.measureText(who).width + 16;
    ctx.fillStyle = speakerColor(who);
    panel(L.textX, L.nameY - L.fs, pwName, L.fs + 4, 6, speakerColor(who), null);
    ctx.fillStyle = "#fff"; ctx.fillText(who, L.textX + 8, L.nameY + 1);
  } else {
    ctx.fillStyle = TH.ink; ctx.fillText(who, L.textX, L.nameY);
  }
  ctx.fillStyle = "#3a3027"; ctx.font = L.fs + "px " + TH.fontBody;
  let yy = L.bodyY;
  for (const ln of L.lines) { ctx.fillText(ln, L.textX, yy); yy += L.lh; }
  if (hint) {
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(58,48,39,0.55)"; ctx.font = "11px " + TH.fontBody;
    ctx.fillText(hint, L.bx + L.bw - 10, L.by + L.boxH - 8);
  }
  ctx.textAlign = "left";
}
function drawDialogue() {
  const line = game.dialogueQueue[game.dialogueIndex]; if (!line) return;
  drawDialogueCard(line, "▸ 点击 / 空格 继续");
}
// 以一个 (who, text) 对，复用通用对话卡片形式显示（选择类事件的 question / reply 复用此形式）
function drawDialogueBox(who, text, hint) {
  drawDialogueCard({ who: who, text: text }, hint || null);
}

/* ================= 统一 UI 组件（弹窗 / 对话 统管） =================
 * 对话与所有弹窗共享同一套视觉语言：说话人分色、选项三态、文件夹式页签、
 * 右上角双色中国结、弹窗顶部 朱砂→暖金 色带。纯绘制辅助，不引入新模块。
 */
const SPEAKER_COLORS = { ming: "#c2453d", qing: "#5bb2ac" };  // 阎明朱砂红 / 清凝浅蓝绿
// 医典子类角标底色：按门类语义分色（承 #f7efe1 米白字），未列子类回退朱砂。
//   诊治红系(内科/温病/脉学) · 药方黄绿(方剂/本草/食疗) · 手法青绿(外科/针灸/骨伤)
//   专科紫系(妇科/儿科) · 典理蓝系(经典/医理) · 医案茶褐
const BOOK_SUBCAT_COLOR = {
  "经典": "rgba(58,90,122,0.92)",  "医理": "rgba(74,107,138,0.92)",
  "内科": "rgba(138,58,48,0.92)",  "温病": "rgba(163,70,56,0.92)",
  "脉学": "rgba(122,74,58,0.92)",  "医案": "rgba(107,74,52,0.92)",
  "方剂": "rgba(154,106,42,0.92)", "本草": "rgba(74,107,52,0.92)",
  "食疗": "rgba(95,107,42,0.92)",  "外科": "rgba(47,107,90,0.92)",
  "针灸": "rgba(47,107,107,0.92)", "骨伤": "rgba(90,74,58,0.92)",
  "妇科": "rgba(122,58,90,0.92)",  "儿科": "rgba(138,74,107,0.92)",
};
function speakerColor(who) {
  const w = who || "";
  if (w.indexOf("阎") >= 0) return SPEAKER_COLORS.ming;        // 阎明
  if (w.indexOf("清凝") >= 0) return SPEAKER_COLORS.qing;      // 李清凝
  return TH.ink;                                               // 旁白 / 其他 → 墨黑
}
// 选项按钮三态（悬停描金 / 选中朱砂 / 灰禁）。label 单行。
function drawOptionBtn(x, y, w, h, label, o) {
  o = o || {};
  let fill, stroke, txt;
  if (o.disabled) { fill = "rgba(58,48,39,0.05)"; stroke = "rgba(58,48,39,0.14)"; txt = "rgba(58,48,39,0.40)"; }
  else if (o.selected) { fill = "rgba(194,69,61,0.14)"; stroke = "rgba(194,69,61,0.42)"; txt = "#7a2f29"; }
  else if (o.hover) { fill = "rgba(232,192,106,0.28)"; stroke = "rgba(232,192,106,0.62)"; txt = "#241c14"; }
  else { fill = "rgba(255,255,255,0.6)"; stroke = "rgba(58,48,39,0.18)"; txt = "#3a3027"; }
  ctx.save();
  ctx.shadowColor = "rgba(20,16,12,0.22)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  panel(x, y, w, h, 9, fill, stroke);
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = txt; ctx.font = "14px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.restore();
}
// 选项按钮（多行）。lines: 已折行字符串数组。
function drawOptionBtnLines(x, y, w, h, lines, o) {
  o = o || {};
  let fill, stroke, txt;
  if (o.disabled) { fill = "rgba(58,48,39,0.05)"; stroke = "rgba(58,48,39,0.14)"; txt = "rgba(58,48,39,0.40)"; }
  else if (o.selected) { fill = "rgba(194,69,61,0.14)"; stroke = "rgba(194,69,61,0.42)"; txt = "#7a2f29"; }
  else if (o.hover) { fill = "#e8c06a"; stroke = "rgba(232,192,106,0.62)"; txt = "#241c14"; }
  else { fill = "#f7efe1"; stroke = "rgba(58,48,39,0.18)"; txt = "#3a3027"; }   // 正常态：与其他弹窗一致的淡黄宣纸底（100% 不透明）
  ctx.save();
  ctx.shadowColor = "rgba(20,16,12,0.22)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  panel(x, y, w, h, 9, fill, stroke);
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = txt; ctx.font = "bold 13px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  let oy = y + h / 2 - (lines.length - 1) * 9;
  for (const ln of lines) { ctx.fillText(ln, x + w / 2, oy); oy += 18; }
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.restore();
}
// 文件夹式页签（轻量无底）：选中=朱砂红字+红下划线；悬停=描金底；常规=淡墨字。
function drawFolderTab(tx, ty, tw, th, label, on, hover) {
  ctx.save();
  if (on) {
    ctx.fillStyle = SPEAKER_COLORS.ming; ctx.font = "bold 12px " + TH.fontBody;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(label, tx + tw / 2, ty + 15);
    panel(tx + tw * 0.18, ty + th - 2, tw * 0.64, 2, 1, SPEAKER_COLORS.ming, null);
  } else if (hover) {
    panel(tx, ty, tw, th, 7, "rgba(232,192,106,0.25)", null);
    ctx.fillStyle = TH.ink; ctx.font = "bold 12px " + TH.fontBody;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(label, tx + tw / 2, ty + 15);
  } else {
    ctx.fillStyle = TH.inkSoft; ctx.font = "12px " + TH.fontBody;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(label, tx + tw / 2, ty + 15);
  }
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.restore();
}
// 弹窗顶部 朱砂→暖金 色带
function drawModalTopBand(bx, by, bw, bh, r) {
  ctx.save();
  // 裁剪到弹窗圆角轮廓内，避免色带在顶部圆角处向两侧溢出
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, r); else ctx.rect(bx, by, bw, bh);
  ctx.clip();
  const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  g.addColorStop(0, TH.zhusha); g.addColorStop(1, TH.gold);
  ctx.fillStyle = g;
  ctx.fillRect(bx, by, bw, 4);
  ctx.restore();
}
// 弹窗右上角小中国结（阎明红 + 清凝浅蓝绿，无阴影，挂角出框一半）。
// (cx, cy) = 结体中心，调用方置于卡面右上角外侧。
function drawKnot(cx, cy) {
  const s = 0.78, MING = SPEAKER_COLORS.ming, QING = SPEAKER_COLORS.qing;
  ctx.save();
  const OFFX = -3;                                     // 略微左移
  const _t = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  const sway = Math.sin(_t * 2.2) * 0.05;              // 绕悬挂点轻微左右摆 ±~2.9°
  const pivY = cy - 22 * s;                            // 悬绳顶端为摆动支点
  ctx.translate(cx + OFFX, pivY); ctx.rotate(sway); ctx.translate(-cx, -pivY);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = MING; ctx.lineWidth = 2.0 * s;     // 悬绳
  ctx.beginPath(); ctx.moveTo(cx, cy - 22 * s); ctx.lineTo(cx, cy - 8 * s); ctx.stroke();
  ctx.strokeStyle = MING; ctx.lineWidth = 2.6 * s;     // 外套菱（红）
  ctx.save(); ctx.translate(cx, cy - 1 * s); ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-11 * s, -11 * s, 22 * s, 22 * s); ctx.restore();
  ctx.strokeStyle = QING; ctx.lineWidth = 2.0 * s;     // 内套菱（蓝绿）
  ctx.save(); ctx.translate(cx, cy - 1 * s); ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-7.5 * s, -7.5 * s, 15 * s, 15 * s); ctx.restore();
  ctx.fillStyle = QING; ctx.beginPath(); ctx.arc(cx, cy - 1 * s, 2.6 * s, 0, Math.PI * 2); ctx.fill();  // 中心珠
  ctx.fillStyle = MING;                                // 流苏帽（红）
  ctx.beginPath(); ctx.moveTo(cx - 4 * s, cy + 9 * s); ctx.lineTo(cx + 4 * s, cy + 9 * s); ctx.lineTo(cx, cy + 14 * s); ctx.closePath(); ctx.fill();
  const tassel = [MING, QING, MING, QING, MING];       // 流苏（红蓝交替）
  ctx.lineWidth = 1.2 * s;
  for (let i = 0; i < 5; i++) {
    const tx = cx - 8 * s + i * 4 * s;
    ctx.strokeStyle = tassel[i];
    ctx.beginPath(); ctx.moveTo(tx, cy + 14 * s); ctx.lineTo(tx - 1.6 * s, cy + 46 * s); ctx.stroke();
  }
  ctx.restore();
}

/* ---------- F9 随机论学 / 选项事件 ---------- */
// question 与 reply 均以通用对话卡片（drawDialogueBox）形式显示在底部：
//   - ask 阶段：底部对话卡片显示 question（说话人=提问者），界面中间居中排列选项按钮；
//   - 选择后（answer 阶段）：底部对话卡片显示 reply（说话人=replyWho）。
// 选项按钮命中区写入全局 poemHits，由 home.js 的 handlePoemClick 消费。
function drawPoem() {
  if (!game.poem) return;
  poemHits.length = 0;
  const p = game.poem;
  const m = p.steps[p.idx];
  const fsOpt = "bold 13px " + TH.fontBody;
  const measureLine = (t) => ctx.measureText(t).width;

  // 聚光遮罩：压暗背景，聚焦对话与选项
  ctx.save(); ctx.fillStyle = "rgba(20,16,12,0.30)"; ctx.fillRect(0, 0, W, H); ctx.restore();

  if (poemStepIsAsk(m)) {
    if (p.step === "ask") {
      // 提问：底部通用对话卡片显示 question（说话人经 drawDialogueCard 自动解析为中文名）
      const Lq = layoutDialogue({ who: m.who, text: m.question }, measureLine);
      drawDialogueBox(m.who, m.question, null);
      const ptr = game._ptr;
      // 选项：保留「浮在遮罩上的裸按钮」观感，按钮走统一三态组件
      const opts = m.options;
      const btnH = 42, gap = 10, x0 = 22, w0 = W - 44;
      const stackH = opts.length * btnH + (opts.length - 1) * gap;
      const regionTop = 18;
      const regionBottom = Lq.by - 16;          // 选项组底部距底部对话卡 16px
      let y0 = (regionTop + regionBottom - stackH) / 2;
      if (y0 < regionTop) y0 = regionTop;
      for (let i = 0; i < opts.length; i++) {
        const ry = y0 + i * (btnH + gap);
        const isHover = !!(ptr && ptr.x >= x0 && ptr.x <= x0 + w0 && ptr.y >= ry && ptr.y <= ry + btnH);
        const oLines = wrapLines(opts[i], fsOpt, w0 - 28, measureLine);
        drawOptionBtnLines(x0, ry, w0, btnH, oLines, { hover: isHover });
        poemHits.push({ x: x0, y: ry, w: w0, h: btnH, idx: i });
      }
    } else {
      // 选择后：底部通用对话卡片显示 reply（说话人=replyWho）
      const rw = m.replyWho || m.who;
      drawDialogueBox(rw, m.reply || m.question, "▸ 点击继续");
    }
  } else {
    // 说话 / 无选项步：底部对话卡片显示说话内容（说话人=who），点任意处推进
    const who = m.speak ? m.who : (m.replyWho || m.who);
    const txt = m.speak || m.reply || m.question;
    drawDialogueBox(who, txt, "▸ 点击继续");
  }
  ctx.textAlign = "left";
}

/* ---------- F2 访客需求选项面板 ---------- */
// 手动模式访客需求弹出：主步骤[赠予道具/暂时没有/再想想] 或 赠予步骤[持有可赠道具列表+返回]。
// 按钮命中区写入全局 visitorChoiceHits，由 home.js 的 handleVisitorChoiceClick 消费。
function drawVisitorChoice() {
  if (!game.visitorChoice) return;
  visitorChoiceHits.length = 0;
  const ch = game.visitorChoice;
  const v = ch.v, ev = ch.ev;
  const def = v.def || v;
  const who = (v.form && v.form.name) || def.name || "访客";
  const accent = TH.gold;
  const bx = 16, bw = W - 32, by = 96;
  const padX = 14;
  const fs = "13px " + TH.fontBody;
  const LH = 18;
  const measure = (t) => ctx.measureText(t).width;
  const isGift = ch.step !== "main";
  // 主步骤只需容纳标题+提问+三按钮，缩短卡片；赠予步骤保留较长列表高度
  const bh = isGift ? 300 : 250;
  // 预先计算可赠道具数量，决定主步骤「赠予道具」按钮是否置灰
  const GIFT_TYPES = { herb: 1, flower: 1, medicine: 1 };   // 特殊道具不可赠予（排除 special）
  let giftCount = 0;
  for (const id in game.inventory) {
    const n = game.inventory[id] || 0; if (n <= 0) continue;
    const it = (C.codex && C.codex.items || []).find((x) => x.id === id);
    if (!it || !GIFT_TYPES[it.type]) continue;
    giftCount++;
  }
  // 聚光遮罩：压暗背景，聚焦选项
  ctx.save(); ctx.fillStyle = "rgba(20,16,12,0.34)"; ctx.fillRect(0, 0, W, H); ctx.restore();
  card(bx, by, bw, bh, 14, "rgba(252,248,240,0.985)", "rgba(58,48,39,0.45)");
  drawModalTopBand(bx, by, bw, bh, 14);                     // 顶部 朱砂→暖金 色带（裁剪到圆角内，不再溢出）
  drawKnot(bx + bw + 2, by + 31);                    // 右上角双色中国结（顶点与弹窗顶部圆角结束处持平）
  // 标题：访客名 + 右上角装饰点
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.font = "bold 14px " + TH.fontBody; ctx.fillStyle = accent;
  ctx.fillText(who, bx + padX, by + 26);
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(bx + bw - padX - 2, by + 20, 3, 0, Math.PI * 2); ctx.fill();

  if (ch.step === "main") {
    ctx.font = fs; ctx.fillStyle = "#3a3027"; ctx.textAlign = "center";
    const qLines = wrapLines("对于" + who + "的请求，你想", fs, bw - padX * 2, measure);
    let yy = by + 50;
    for (const ln of qLines) { ctx.fillText(ln, bx + bw / 2, yy); yy += LH; }
    const opts = [
      { label: "赠予道具", disabled: giftCount === 0, action: () => { ch.step = "gift"; ch.scroll = 0; } },
      { label: "暂时没有", action: () => visitorDecline() },
      { label: "再想想", action: () => visitorRethink() },
    ];
    const btnH = 40, gap = 8, x0 = bx + 12, w0 = bw - 24, y0 = by + 76;
    const ptr = game._ptr;
    for (let i = 0; i < opts.length; i++) {
      const ry = y0 + i * (btnH + gap);
      const o = opts[i];
      const isHover = !!(ptr && ptr.x >= x0 && ptr.x <= x0 + w0 && ptr.y >= ry && ptr.y <= ry + btnH);
      if (o.disabled) {
        drawOptionBtn(x0, ry, w0, btnH, o.label + "（暂无）", { disabled: true });
      } else {
        drawOptionBtn(x0, ry, w0, btnH, o.label, { hover: isHover });
        visitorChoiceHits.push({ x: x0, y: ry, w: w0, h: btnH, action: o.action });
      }
    }
  } else {
    // 赠予步骤：列出持有可赠道具（排除书籍，避免误赠章节）
    ctx.font = fs; ctx.fillStyle = "#3a3027"; ctx.textAlign = "center";
    const qLines = wrapLines("你决定给对方什么？", fs, bw - padX * 2, measure);
    let yy = by + 50;
    for (const ln of qLines) { ctx.fillText(ln, bx + bw / 2, yy); yy += LH; }
    const items = [];
    for (const id in game.inventory) {
      const n = game.inventory[id] || 0; if (n <= 0) continue;
      const it = (C.codex && C.codex.items || []).find((x) => x.id === id);
      if (!it || !GIFT_TYPES[it.type]) continue;
      items.push({ id, name: it.name, type: it.type, n });
    }
    const listTop = by + 72, listPadTop = 6, listBottom = by + bh - 52, listH = listBottom - listTop;
    const RH = 32;
    const maxScroll = Math.max(0, listPadTop + items.length * RH - listH);
    if (ch.scroll > maxScroll) ch.scroll = maxScroll;
    if (ch.scroll < 0) ch.scroll = 0;
    // 列表底衬
    panel(bx + 8, listTop, bw - 16, listH, 10, "rgba(58,48,39,0.04)", "rgba(58,48,39,0.10)");
    ctx.save();
    // 扩展 1px 裁剪区，避免首项顶部描边被裁掉
    ctx.beginPath(); ctx.rect(bx + 6, listTop - 1, bw - 12, listH + 2); ctx.clip();
    for (let i = 0; i < items.length; i++) {
      const ry = listTop + listPadTop + i * RH - ch.scroll;
      if (ry + RH < listTop || ry > listBottom) continue;
      const rx = bx + 12, rw = bw - 24, rh = RH - 5;
      const isWant = items[i].id === ev.buyItem;
      const isHover = !!(ptr && ptr.x >= rx && ptr.x <= rx + rw && ptr.y >= ry && ptr.y <= ry + rh);
      // 统一选项三态：所求项=朱砂选中；悬停=描金；其余=白底淡边（与 drawOptionBtn 同色）
      let fill, stroke, txt;
      if (isWant) { fill = "rgba(194,69,61,0.14)"; stroke = "rgba(194,69,61,0.42)"; txt = "#7a2f29"; }
      else if (isHover) { fill = "rgba(232,192,106,0.28)"; stroke = "rgba(232,192,106,0.62)"; txt = "#241c14"; }
      else { fill = "rgba(255,255,255,0.62)"; stroke = "rgba(58,48,39,0.14)"; txt = "#3a3027"; }
      ctx.save();
      ctx.shadowColor = "rgba(20,16,12,0.22)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      panel(rx, ry, rw, rh, 7, fill, stroke);
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.restore();
      // 所求项左侧小圆点提示
      if (isWant) {
        ctx.fillStyle = "#7a2f29"; ctx.beginPath(); ctx.arc(rx + 8, ry + rh / 2, 2.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.font = "13px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = txt;
      ctx.fillText(items[i].name + (items[i].n > 1 ? " ×" + items[i].n : ""), rx + 18 + (isWant ? 4 : 0), ry + rh / 2 + 1);
      ctx.font = "11px " + TH.fontBody; ctx.textAlign = "right";
      ctx.fillText(isWant ? "正是所求" : typeLabel(items[i].type), rx + rw - 12, ry + rh / 2 + 1);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      const id = items[i].id;
      visitorChoiceHits.push({ x: rx, y: ry, w: rw, h: rh, action: () => visitorGift(id) });
    }
    ctx.restore();
    // 返回按钮
    const backY = by + bh - 42, backX = bx + 12, backW = bw - 24, backH = 32;
    drawOptionBtn(backX, backY, backW, backH, "← 返回", {});
    visitorChoiceHits.push({ x: backX, y: backY, w: backW, h: backH, action: () => { ch.step = "main"; } });
    if (maxScroll > 0) {
      ctx.fillStyle = "rgba(58,48,39,0.45)"; ctx.font = "10px " + TH.fontBody; ctx.textAlign = "right";
      ctx.fillText("↑↓ 滚动", bx + bw - 12, by + bh - 6); ctx.textAlign = "left";
    }
  }
  ctx.textAlign = "left";
}

/* ---------- 全局飘字 toast：置顶绘制（最后一层，盖在面板之上） ---------- */
function drawToast() {
  // 保持态（msgTimer>0）或淡出态（toastFade>0）都要画
  if (!(game.msg && (game.msgTimer > 0 || game.toastFade > 0))) return;
  // 退出动画：toastFade 阶段向上飘 ~22px 并渐隐
  let alpha = 1, dy = 0;
  if (game.toastFade > 0) {
    const p = 1 - game.toastFade / TOAST_FADE;   // 0→1 进度
    alpha = 1 - p;
    dy = -p * 22;
  }
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 13px " + TH.fontBody;
  const w = ctx.measureText(game.msg).width + 28;
  const x = W / 2, y = H / 2 + dy;
  card(x - w / 2, y - 15, w, 30, 15, "rgba(40,33,26,0.85)", "rgba(232,192,106,0.55)");
  ctx.fillStyle = "#f3ead9"; ctx.fillText(game.msg, x, y);
  ctx.restore();
}

/* ---------- 书籍正文折行：首行窄 indentW（段首缩进 2 字），续行满宽 ---------- */
// 与绘制、高度估算共用以保证滚动高度精确。返回每行字符串数组。
function wrapBookPara(text, font, maxW, indentW) {
  const measure = (t) => { ctx.font = font; return ctx.measureText(t).width; };
  const lines = [];
  let cur = "", rest = "";
  for (const ch of (text || "")) {
    const t = cur + ch;
    if (measure(t) > (maxW - indentW) && cur) { lines.push(cur); rest = (text || "").slice(cur.length); break; }
    cur = t;
  }
  if (!lines.length) { lines.push(cur); rest = (text || "").slice(cur.length); }  // 首行整段未超宽
  if (rest) for (const r of wrapLines(rest, font, maxW, measure)) lines.push(r);   // 续行按满宽折
  return lines;
}

/* ---------- 面板（日记 / 图鉴 / 药方 / 出行） ---------- */
function drawPanel(name) {
  panelHits.length = 0; codexTabHits.length = 0; readTabHits.length = 0; diaryTabHits.length = 0; bagTabHits.length = 0;
  const px = 14, pw = W - 28, py = 44, ph = H - 44 - 44;
  // 外框：不透明宣纸底 + 墨色描边，彻底去掉投影。
  // 面板直接画在明亮家园场景上、且自身不铺压暗遮罩，任何投影在空面板（如书籍未加载时的"整理中"态）
  // 都会显得突兀"很重"。故移除外框阴影，仅留描边界定边界——干净且不再有沉重感。
  panel(px, py, pw, ph, 12, "rgba(247,239,225,0.985)", null);
  ctx.save(); ctx.strokeStyle = "rgba(58,48,39,0.45)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 12); else ctx.rect(px, py, pw, ph); ctx.stroke(); ctx.restore();
  drawKnot(px + pw + 2, py + 29);                    // 右上角双色中国结（顶点与弹窗顶部圆角结束处持平）
  const title = name === "diary" ? "日 记" : name === "codex" ? "图 鉴" : name === "recipe" ? "制 药" : name === "maps" ? "出 行" : name === "paint" ? "绘 画" : name === "bag" ? "药 柜" : name === "read" ? "书 架" : name === "stars" ? "观 星" : "";
  const seal = name === "recipe" ? TH.gold : name === "codex" ? TH.tree : name === "maps" ? TH.bond : name === "paint" ? TH.gold : name === "bag" ? TH.tree : name === "read" ? TH.zhusha : name === "stars" ? TH.zhusha : TH.zhusha;
  const sealCh = name === "diary" ? "记" : name === "codex" ? "图" : name === "recipe" ? "药" : name === "maps" ? "出" : name === "paint" ? "画" : name === "bag" ? "柜" : name === "read" ? "书" : name === "stars" ? "星" : "记";
  ctx.save(); panel(px + 8, py + 8, pw - 16, 30, 8, "rgba(58,48,39,0.05)", null); ctx.restore();
  sealMark(sealCh, px + 24, py + 23, 11, seal);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  if (name === "codex") {
    ctx.fillStyle = TH.ink; ctx.font = "bold 16px " + TH.fontTitle;
    ctx.fillText("图鉴", px + 40, py + 29);            // 横排标题
  } else {
    ctx.fillStyle = TH.ink; ctx.font = "bold 16px " + TH.fontTitle;
    ctx.fillText(title, px + 40, py + 29);
  }
  // 图鉴分类标签（全部 / 草药 / 鲜花 / 丹药 / 书籍 / 特殊）：横排、左对齐，固定在标题下方
  if (name === "codex") {
    const gap = 2, th = 22;
    const cats = [["all", "全部"], ["herb", "草药"], ["flower", "鲜花"], ["medicine", "丹药"], ["book", "书籍"], ["special", "特殊"]];
    const tw = Math.floor((pw - 24 - (cats.length - 1) * gap) / cats.length);
    let tx = px + 12;                                  // 左对齐
    const ty = py + 46;
    const ptr = game._ptr;
    for (const cc of cats) {
      const on = (game.codexCat || "all") === cc[0];
      const hover = !!(ptr && ptr.x >= tx && ptr.x <= tx + tw && ptr.y >= ty && ptr.y <= ty + th);
      drawFolderTab(tx, ty, tw, th, cc[1], on, hover);
      codexTabHits.push({ x: tx, y: ty, w: tw, h: th, cat: cc[0] });
      tx += tw + gap;
    }
    ctx.textAlign = "left";
  }
  // 书架分类标签（全部 / 医典 / 诗文 / 杂览）：仅书单列表面板显示，固定在标题下方
  if (name === "read" && !game.readBook) {
    const tw = 44, th = 22, gap = 4;
    let tx = px + 12;                                  // 左对齐
    const ty = py + 46;
    const cats = [["all", "全部"], ["medical", "医典"], ["poem", "诗文"], ["misc", "杂览"], ["story", "话本"]];
    const ptr = game._ptr;
    for (const cc of cats) {
      const on = (game.readCat || "all") === cc[0];
      const hover = !!(ptr && ptr.x >= tx && ptr.x <= tx + tw && ptr.y >= ty && ptr.y <= ty + th);
      drawFolderTab(tx, ty, tw, th, cc[1], on, hover);
      readTabHits.push({ x: tx, y: ty, w: tw, h: th, cat: cc[0] });
      tx += tw + gap;
    }
    ctx.textAlign = "left";
  }
  // 日记面板页签（日记 / 回顾）：左对齐，固定在标题下方（与图鉴/书架同款视觉）
  if (name === "diary") {
    const tw = 44, th = 22, gap = 4;
    let tx = px + 12;
    const ty = py + 46;
    const tabs = [["diary", "日记"], ["review", "回顾"]];
    const ptr = game._ptr;
    for (const cc of tabs) {
      const on = (game.diaryTab || "diary") === cc[0];
      const hover = !!(ptr && ptr.x >= tx && ptr.x <= tx + tw && ptr.y >= ty && ptr.y <= ty + th);
      drawFolderTab(tx, ty, tw, th, cc[1], on, hover);
      diaryTabHits.push({ x: tx, y: ty, w: tw, h: th, cat: cc[0] });
      tx += tw + gap;
    }
    ctx.textAlign = "left";
  }
  // 药柜分类页签（全部 / 草药 / 鲜花 / 丹药）：横排、左对齐，固定在标题下方（与图鉴同款视觉）
  if (name === "bag") {
    const gap = 2, th = 22;
    const cats = [["all", "全部"], ["herb", "草药"], ["flower", "鲜花"], ["medicine", "丹药"]];
    const tw = Math.floor((pw - 24 - (cats.length - 1) * gap) / cats.length);
    let tx = px + 12;
    const ty = py + 46;
    const ptr = game._ptr;
    for (const cc of cats) {
      const on = (game.bagCat || "all") === cc[0];
      const hover = !!(ptr && ptr.x >= tx && ptr.x <= tx + tw && ptr.y >= ty && ptr.y <= ty + th);
      drawFolderTab(tx, ty, tw, th, cc[1], on, hover);
      bagTabHits.push({ x: tx, y: ty, w: tw, h: th, cat: cc[0] });
      tx += tw + gap;
    }
    ctx.textAlign = "left";
  }
  // 内容裁剪区（滚轮 / 拖动滚动）；图鉴 / 书架书单 / 日记页签为分类标签预留空间，内容区整体下移
  const readTab = (name === "read" && !game.readBook);
  const showTabs = (name === "codex" || readTab || name === "diary" || name === "bag");
  const cX = px + 12, cW = pw - 24, cY = showTabs ? py + 76 : py + 46, cH0 = showTabs ? ph - 94 : ph - 64;
  // 医典/杂览阅读正文：底部声明钉在固定底条 → 收缩内容区高度，正文不滚到声明条上
  let declStripH = 0;
  if (name === "read" && game.readBook && game.readChapter) {
    const _db = (C.books || []).find((x) => x.id === game.readBook);
    if (_db && (_db.cat === "medical" || _db.cat === "misc")) declStripH = 30;
  }
  const cH = cH0 - declStripH;
  const lx = cX, lw = cW;
  // 估算内容总高（用于钳制滚动量 / 滚动条）
  let totalH = 0;
  if (name === "diary") {
    if (game.diaryTab === "review") {
      totalH = reviewTotalH();   // 回顾：分组统计卡，按真实布局估算（可能超出可视区需滚动）
    } else {
      const list = (game.diary || []).slice().reverse();
      let ld = null;
      for (const e of list) {
        if (e.day !== ld) { totalH += 34; ld = e.day; }   // 日期分隔：居中题注（约 34px，含标题与正文间距）
        totalH += wrapLines((typeof e.chen === "string" ? e.chen + "，" : "") + e.text, "12px " + TH.fontBody, lw - 14).length * 18 + 14;
      }
      totalH += 10;   // 日记顶部额外留白（标题与首条间距），计入滚动预算
    }
  } else if (name === "codex") {
    const n = codexItemsFiltered().length;
    const gap = 12, cellH = 90;
    totalH = Math.ceil(n / 2) * (cellH + gap);
  } else if (name === "recipe") {
    totalH = (C.recipes || []).length * (42 + 10);
  } else if (name === "maps") {
    totalH = (C.maps || []).length * (104 + 8);
  } else if (name === "paint") {
    totalH = 0;   // 6×9 网格固定，无需滚动
  } else if (name === "bag") {
    const bagCat = game.bagCat || "all";
    const bagIds = Object.keys(game.inventory || {}).filter((id) => (game.inventory[id] || 0) > 0).filter((id) => {
      if (bagCat === "all") return true;
      const it = (C.codex.items || []).find((x) => x.id === id);
      return it && it.type === bagCat;
    });
    totalH = bagIds.length * (56 + 8);
  } else if (name === "read") {
    // F9 阅读面板：书单 / 章单 / 阅读正文 三态的高度估算（供滚动钳制）
    if (!game.readBook) {
      const cat = game.readCat || "all";
      const n = (C.books || []).filter((b) => cat === "all" || b.cat === cat).length;
      totalH = n * (40 + 10);
    } else if (!game.readChapter) {
      const b = (C.books || []).find((x) => x.id === game.readBook);
      totalH = 26 + ((b ? (b.chapters || []).length : 0) * (34 + 8));   // 含顶部「返回」卡
    } else {
      const b = (C.books || []).find((x) => x.id === game.readBook);
      const ch = b && (b.chapters || []).find((c) => c.n === game.readChapter);
      const paras = ch ? (ch.text || "").split("\n") : [];
      const rfont = "13px " + TH.fontBody;
      const indentW = 2 * 13;                 // 段首缩进 2 字
      let lines = 0;
      for (const p of paras) lines += wrapBookPara(p, rfont, lw - 8, indentW).length;
      let readH = 94 + lines * 20 + paras.length * 4 + 12;   // 返回卡(26)+标题(26)+朝代作者(18)+间距 + 正文行(20) + 段距(4) + 底部留白(12)
      totalH = readH;   // 医典/杂览底部声明已改为固定底条（不随滚动），不再计入滚动内容高度
    }
  }
  else if (name === "stars") {
    totalH = 0;   // 观星面板为固定夜空视图，无需滚动
  }
  const maxScroll = Math.max(0, totalH - cH);
  const scroll = Math.min(Math.max(0, game.panelScroll || 0), maxScroll);
  game._panelMaxScroll = maxScroll;
  // 裁剪 + 平移
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cX, cY, cW, cH, 8); else ctx.rect(cX, cY, cW, cH);
  ctx.clip();
  ctx.translate(0, -scroll);
  const bottomLimit = cY + cH + scroll;
  let yy = cY + (name === "diary" ? 16 : 6);   // 日记/回顾顶部多留白，标题与首条不挤
  if (name === "diary" && game.diaryTab !== "review") {
    const list = (game.diary || []).slice().reverse();
    if (!list.length) emptyState("（还没有记事，陪陪她们吧。）", lx, lw, yy, "leaf");
    let lastDay = null;
    for (let di = 0; di < list.length; di++) {
      const e = list[di];
      if (yy > bottomLimit) break;
      if (e.day !== lastDay) {       // 按天数分隔（居中题注，保持天气；时辰前缀在条目内）
        ctx.font = "bold 13px " + TH.fontTitle; ctx.textAlign = "center";
        const ew = e.weather ? weatherName(e.weather) : "";
        const lab = ew ? ("— 第 " + (e.day || 1) + " 日 · " + ew + " —") : ("— 第 " + (e.day || 1) + " 日 —");
        ctx.fillStyle = TH.date;          // 深胭脂印红
        ctx.fillText(lab, lx + lw / 2, yy + 12);
        ctx.textAlign = "left";
        yy += 34; lastDay = e.day;   // 34：比原 28 略增标题与正文间距
      }
      ctx.fillStyle = TH.zhusha; ctx.beginPath(); ctx.arc(lx + 3, yy - 4, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "12px " + TH.fontBody;
      const prefix = (typeof e.chen === "string" && e.chen) ? (e.chen + "，") : "";
      for (const ln of wrapLines(prefix + e.text, "12px " + TH.fontBody, lw - 14)) {
        if (yy > bottomLimit) break;
        ctx.fillStyle = "#3a3027"; ctx.fillText(ln, lx + 12, yy); yy += 18;
      }
      yy += 14;
    }
  } else if (name === "diary" && game.diaryTab === "review") {
    drawReview(lx, lw, cY, bottomLimit);   // 回顾汇总（新增页签）
  } else if (name === "codex") {
    drawCodexPanel(lx, lw, cY, bottomLimit);
  } else if (name === "recipe") {
    const rs = C.recipes || [];
    const m = 6;                          // 卡片左右内缩，留出呼吸边距
    const cardX = lx + m, cardW = lw - m * 2;
    // F1：炼制中进度条（与家园顶栏共用 game.brewing 状态）
    if (game.brewing) {
      const br = (C.recipes || []).find((x) => x.id === game.brewing.recipeId);
      const bn = br ? (br.name || br.output) : "丹药";
      const durMs = Math.max(1, (game.brewing.brewHours || 1) * (DAY_CYCLE / 12) * 1000);
      const remain = Math.max(0, game.brewing.endMs - Date.now());
      const prog = Math.max(0, Math.min(1, 1 - remain / durMs));
      const bbh = 40;
      card(cardX, yy, cardW, bbh, 9, "rgba(232,192,106,0.18)", TH.gold, true);
      ctx.fillStyle = TH.ink; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("炼制中：" + bn + "（" + Math.ceil(remain / 1000) + "s）", cardX + 12, yy + 16);
      bar(cardX + 12, yy + 22, cardW - 24, 8, prog, TH.gold, "rgba(58,48,39,0.18)");
      ctx.fillStyle = TH.inkSoft2; ctx.font = "10px " + TH.fontBody; ctx.textAlign = "right";
      ctx.fillText(Math.floor(prog * 100) + "%", cardX + cardW - 12, yy + 16); ctx.textAlign = "left";
      yy += bbh + 10;
    }
    if (!rs.length) emptyState("（尚无药方。）", lx, lw, yy, "book");
    for (const r of rs) {
      if (yy > bottomLimit) break;
      const can = (r.inputs || []).every((i) => (game.inventory[i] || 0) > 0);
      const rh = 42;                      // 卡片：自顶向下绘制，杜绝顶部被裁剪 / 文字出框
      const cardY = yy;                   // 卡片顶 = 当前基线（已在裁剪区内，不再 yy-24 越界）
      card(cardX, cardY, cardW, rh, 9, can ? "rgba(232,192,106,0.20)" : "rgba(58,48,39,0.05)", can ? TH.gold : "rgba(58,48,39,0.20)", true);
      // 第 1 行：药名（左）+ 状态短词（右）
      ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(r.name, cardX + 14, cardY + 16);
      ctx.fillStyle = can ? TH.gold : TH.inkSoft2; ctx.font = "11px " + TH.fontBody; ctx.textAlign = "right";
      ctx.fillText(can ? "可炼制 ▸" : "未集齐", cardX + cardW - 12, cardY + 16); ctx.textAlign = "left";
      // 第 2 行：材料清单（整卡宽左对齐，绝不越界到药名）
      let have = (r.inputs || []).map((i) => itemName(i) + "×" + (game.inventory[i] || 0)).join("   ");
      const maxHave = cardW - 28;
      while (ctx.measureText(have).width > maxHave && have.length > 1) have = have.slice(0, -2) + "…";
      ctx.fillStyle = TH.inkSoft2; ctx.font = "11px " + TH.fontBody; ctx.textAlign = "left";
      ctx.fillText(have, cardX + 14, cardY + 34);
      if (can) panelHits.push({ x: cardX, y: cardY, w: cardW, h: rh, action: () => craftRecipe(r) });
      yy += rh + 10;
    }
  } else if (name === "maps") {
    const maps = C.maps || [];
    const m2 = 4;                         // 卡片左右内缩
    const cardX = lx + m2, cardW = lw - m2 * 2;
    if (!maps.length) emptyState("（暂无可去之处。）", lx, lw, yy, "leaf");
    const ch = 104, step = ch + 8;        // 收窄项间距，内容填满卡片消除上下留白
    const descMax = 3, descW = cardW - 138; // 描述放宽到 3 行，确保完整显示不截断
    const bw = 56;
    for (let i = 0; i < maps.length; i++) {
      if (yy > bottomLimit) break;
      const m = maps[i], pm = parsedMaps[i];
      const cardY = yy;
      card(cardX, cardY, cardW, ch, 9, "rgba(58,48,39,0.04)", "rgba(58,48,39,0.22)", true);
      // 左侧缩略图（各图 bg 区分山野氛围，保留地图特色）
      ctx.save(); panel(cardX + 12, cardY + 14, 44, 44, 8, m.bg || "#dfe6d2", null); ctx.restore();
      // 标题（缩略图右侧）
      ctx.fillStyle = TH.ink; ctx.font = "bold 14px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(m.name, cardX + 66, cardY + 30);
      // 描述：最多 3 行、框宽内换行，完整呈现（不再只画 2 行截断）
      let dlines = wrapLines(m.desc || "", "11px " + TH.fontBody, descW);
      if (dlines.length > descMax) { dlines = dlines.slice(0, descMax); dlines[descMax - 1] = dlines[descMax - 1].replace(/.$/, "…"); }
      ctx.fillStyle = TH.inkSoft2; ctx.font = "11px " + TH.fontBody;
      let dy = cardY + 48;
      for (const ln of dlines) { ctx.fillText(ln, cardX + 66, dy); dy += 15; }
      // 草药采集点：锚定框内稳定位置（与描述行数无关）
      if (pm) {
        const hx0 = cardX + 66, hy = cardY + 94;
        for (let k = 0; k < pm.herbs.length; k++) {
          const hh = pm.herbs[k];
          const got = hh.collected || game.codex[hh.id];
          ctx.beginPath(); ctx.arc(hx0 + k * 16 + 6, hy, 5, 0, Math.PI * 2);
          ctx.fillStyle = got ? (hh.hue || PAL.herb) : "rgba(120,110,95,0.35)"; ctx.fill();
        }
      }
      // 出发按钮：垂直居中、右侧内缩 8px，不再贴边过右
      const bx = cardX + cardW - bw - 8, byy = cardY + (ch - 32) / 2;
      card(bx, byy, bw, 32, 8, "rgba(224,168,168,0.96)", "rgba(122,47,41,0.6)");
      ctx.fillStyle = "#7a2f29"; ctx.font = "bold 13px " + TH.fontBody; ctx.textAlign = "center";
      ctx.fillText("出发", bx + bw / 2, byy + 21); ctx.textAlign = "left";
      (function (idx) { panelHits.push({ x: cardX, y: cardY, w: cardW, h: ch, action: function () { launchOuting(idx); } }); })(i);
      yy += step;
    }
  } else if (name === "paint") {
    // F13 书桌绘画：6 列 × 9 行 = 54 格；底层铺真实画作，未上色格半透灰蒙住，点任意格落笔揭开 1 格
    const cols = 6, rows = 9, cs = 30;
    const gw = cols * cs, gh = rows * cs;   // 无间隙：格子紧密拼接
    const gx = lx + (lw - gw) / 2, gy = cY + 30;
    ctx.textAlign = "center"; ctx.fillStyle = TH.inkSoft; ctx.font = "12px " + TH.fontBody; ctx.textBaseline = "alphabetic";
    ctx.fillText("每天画一笔~", lx + lw / 2, gy - 10);
    const allColored = game.painting.colored.every(Boolean);
    // 先铺底图（按面板格区比例适配，不裁剪、不变形、居中）
    ensurePainting();   // F13：画作面板打开时才首次拉取底图（懒加载，不占首屏）
    const img = paintingImg && paintingImg.painting;
    if (img && img.width && img.height) {
      const ir = img.width / img.height;
      let dw = gw, dh = dw / ir;
      if (dh > gh) { dh = gh; dw = dh * ir; }
      ctx.drawImage(img, gx + (gw - dw) / 2, gy + (gh - dh) / 2, dw, dh);
    }
    // 再画格子：已上色格不遮（露出底层画作）；未上色格用弹窗同色填充、格间不留空隙；每格加浅色描边
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = gx + c * cs, y = gy + r * cs;
      if (!game.painting.colored[i]) {
        ctx.fillStyle = "rgba(247,239,225,0.97)";   // 与弹窗底色一致
        ctx.fillRect(x, y, cs, cs);
      }
      ctx.strokeStyle = "rgba(58,48,39,0.12)"; ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
    }
    panelHits.push({ x: gx, y: gy, w: gw, h: gh, action: paintRandomCell });
    if (allColored) {
      ctx.fillStyle = TH.zhusha; ctx.font = "bold 14px " + TH.fontBody; ctx.textAlign = "center";
      ctx.fillText("— 画已大成 —", lx + lw / 2, gy + gh + 22);
    }
  } else if (name === "bag") {
    // F6 背包：展示持有的药材、鲜花与丹药及其数量（特殊道具不入库，仅点亮图鉴）
    const bagCat = game.bagCat || "all";
    const inv = game.inventory || {};
    const ids = Object.keys(inv).filter((id) => (inv[id] || 0) > 0).filter((id) => {
      if (bagCat === "all") return true;
      const it = (C.codex.items || []).find((x) => x.id === id);
      return it && it.type === bagCat;
    });
    if (!ids.length) {
      const emptyTxt = bagCat === "herb" ? "（尚没有草药，外出采些来吧。）"
        : bagCat === "flower" ? "（尚没有鲜花，给花草浇浇水吧。）"
        : bagCat === "medicine" ? "（尚无炼成丹药。）"
        : "（药柜空空，外出采些草药来吧。）";
      emptyState(emptyTxt, lx, lw, yy, "leaf");
    } else {
      const m = 6, cardX = lx + m, cardW = lw - m * 2, rh = 56, gap = 8;
      for (const id of ids) {
        if (yy > bottomLimit) break;
        const it = (C.codex.items || []).find((x) => x.id === id);
        const qty = inv[id];
        const nm = it ? it.name : id;
        const isHerb = it && it.type === "herb";
        const isFlower = it && it.type === "flower";
        const border = isHerb ? (it.hue || TH.tree) : (isFlower ? (it.hue || TH.bond) : TH.gold);
        panel(cardX, yy, cardW, rh, 9, "rgba(247,239,225,0.96)", border);
        // 图标
        const ix = cardX + 22, iy = yy + rh / 2;
        if (isHerb) {
          herbLeafIcon(ix, iy - 2, 11, it.hue || TH.herb, false);
        } else if (isFlower) {
          drawFlowerIcon(ix, iy - 2, 7, it.hue || TH.bond, "#f3b45a");
        } else {
          sealMark("丹", ix, iy - 2, 12, TH.gold);
        }
        // 名称 + 数量
        ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText(nm, cardX + 40, yy + 19);
        ctx.fillStyle = TH.zhusha; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "right";
        ctx.fillText("×" + qty, cardX + cardW - 12, yy + 19);
        // 描述（框宽内换行，最多 2 行）
        ctx.fillStyle = TH.inkSoft2; ctx.font = "11px " + TH.fontBody; ctx.textAlign = "left";
        const dl = wrapLines(it ? (it.desc || "") : "", "11px " + TH.fontBody, cardW - 52);
        let dyy = yy + 35;
        for (const ln of dl.slice(0, 2)) { ctx.fillText(ln, cardX + 40, dyy); dyy += 13; }
        yy += rh + gap;
      }
    }
  } else if (name === "read") {
    drawReadPanel(lx, lw, cY, bottomLimit);
  }
  else if (name === "stars") {
    drawStarPanel(lx, lw, cY, bottomLimit);
  }
  ctx.restore();
  // 医典/杂览 阅读正文：底部声明钉在固定底条（不随滚动），位于内容区下沿、全局 footer 之上，靠收缩后的内容区保证不重叠
  if (declStripH > 0) {
    drawReadDeclStrip(cX, cW, cY, cH);
  }
  if ((game.panelScroll || 0) > maxScroll) game.panelScroll = maxScroll;
  // 滚动条
  if (maxScroll > 1) {
    const trackH = cH - 10;
    const barH = Math.max(22, trackH * (cH / (maxScroll + cH)));
    const barY = cY + 5 + (trackH - barH) * (scroll / maxScroll);
    panel(px + pw - 5, cY + 5, 3, trackH, 1.5, "rgba(58,48,39,0.16)", null);
    panel(px + pw - 5, barY, 3, barH, 1.5, "rgba(58,48,39,0.42)", null);
  }
  ctx.textAlign = "center"; ctx.fillStyle = "rgba(58,48,39,0.5)"; ctx.font = "11px " + TH.fontBody;
  ctx.fillText(maxScroll > 1 ? "滚轮 / 拖动浏览 · 点击空白关闭" : "点击空白 / 空格 关闭", W / 2, py + ph - 7);
}

function emptyState(text, lx, lw, yy, icon) {
  if (icon === "leaf") leafIcon(lx + lw / 2, yy + 6, 7, TH.herb);
  else if (icon === "book") bookIcon(lx + lw / 2 - 6, yy + 4, 7, "#7a5a3a");
  ctx.fillStyle = TH.inkSoft; ctx.font = "12px " + TH.fontBody; ctx.textAlign = "center";
  ctx.fillText(text, lx + lw / 2, yy + 26); ctx.textAlign = "left";
}

/* ---------- 确认弹窗（标题/印章/按钮文案支持自定义，回退就寝模板） ---------- */
const confirmHits = [];
function drawConfirm() {
  if (!game.confirm) return;
  confirmHits.length = 0;
  const forced = !!game.confirm.forced;   // F15：强制休息——仅「休息」一个选项且不可拒绝
  const title = game.confirm.title || "就 寝";
  const icon = game.confirm.icon || "眠";
  const yesText = game.confirm.yesText || "就 寝";
  const noText = game.confirm.noText || "暂 不";
  ctx.fillStyle = "rgba(40,33,26,0.46)"; ctx.fillRect(0, 0, W, H);
  const pw = 236, ph = 154, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
  card(px, py, pw, ph, 14, "rgba(247,239,225,0.98)", "rgba(58,48,39,0.5)");
  drawModalTopBand(px, py, pw, ph, 14);                     // 顶部 朱砂→暖金 色带（裁剪到圆角内，不再溢出）
  drawKnot(px + pw + 2, py + 31);                    // 右上角双色中国结（顶点与弹窗顶部圆角结束处持平）
  // —— 页眉：印章 + 标题 移至左上，与二级界面（drawPanel）保持一致 ——
  sealMark(icon, px + 24, py + 23, 11, TH.zhusha);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = TH.ink; ctx.font = "bold 16px " + TH.fontTitle;
  ctx.fillText(title, px + 40, py + 29);
  ctx.textAlign = "center";   // 正文保持居中，不被页眉对齐方式影响
  ctx.fillStyle = TH.inkSoft; ctx.font = "12px " + TH.fontBody;
  let yy = py + 60;
  for (const para of (game.confirm.text || "").split("\n")) {
    for (const ln of wrapLines(para, "12px " + TH.fontBody, pw - 40)) { ctx.fillText(ln, W / 2, yy); yy += 18; }
  }
  const bh = 32, by = py + ph - 46;
  const bw = forced ? 150 : 90, gap = 14;
  const yesX = forced ? (W / 2 - bw / 2) : (W / 2 - bw - gap / 2);
  card(yesX, by, bw, bh, 10, "rgba(224,168,168,0.96)", "rgba(122,47,41,0.6)");
  ctx.fillStyle = "#7a2f29"; ctx.font = "bold 14px " + TH.fontBody; ctx.textBaseline = "middle";
  ctx.fillText(yesText, yesX + bw / 2, by + bh / 2 + 1);
  confirmHits.push({ x: yesX, y: by, w: bw, h: bh, act: "yes" });
  if (!forced) {
    const noX = W / 2 + gap / 2;
    card(noX, by, bw, bh, 10, "rgba(247,239,225,0.96)", "rgba(58,48,39,0.5)");
    ctx.fillStyle = TH.ink; ctx.fillText(noText, noX + bw / 2, by + bh / 2 + 1);
    confirmHits.push({ x: noX, y: by, w: bw, h: bh, act: "no" });
  }
  ctx.textBaseline = "alphabetic";
}
function handleConfirmClick(lx, ly) {
  if (!game.confirm) return false;
  for (const h of confirmHits) {
    if (lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h) {
      if (h.act === "yes" && game.confirm.onYes) game.confirm.onYes();
      else if (h.act === "no" && game.confirm.onNo && !game.confirm.forced) game.confirm.onNo();
      return true;
    }
  }
  return false;
}

/* ---------- 结束屏（胜 / 败） ---------- */

/* ===== src/book_ui.js ===== */
/* book_ui.js — 书籍子系统：书架/章单/阅读正文 + 图鉴网格 + 目录/排序辅助。
   源：ui.js（drawPanel 内的 codex/read 渲染块与声明条，以及 方案C 辅助函数）。
   与 ui.js 同享全局作用域；须在 ui.js 之后加载（drawPanel 运行时调用本文件函数）。 */

/* ---------- 方案C：取书籍「目录」（{n,title} 列表），用于书架总章数 / 章单 / 灰态 ---------- */
// 优先取已注入的正文 chapters（内联短篇本就有；懒加载后也有）；否则取常驻目录 bookToc。
// 二者的元素都含 .n（章号），章单/灰态只需 .n；正文阅读另经 ensureBook 拉取。
function tocOf(b) {
  if (b && b.chapters && b.chapters.length) return b.chapters;
  const t = (C.bookToc && C.bookToc[b.id]);
  return (t && t.length) ? t : (b.chapters || []);
}

/* ---------- 书籍排序（朝代 → 作者 → 医典类型 → 书名） ---------- */
// 朝代权重：按时间先后；西晋并入晋；金元介于宋/元之间；历代(选集)与朝代(占位)置末。
// 朝代时序（显示排序用）。缺省落 50（置末尾）。
// 历史时序：春秋→先秦→战国→秦→汉→三国→晋(西晋)→南朝→隋→唐→宋→金元→元→明→清→清末民初→历代。
// 注意：道德经(春秋)、世说新语(南朝) 之前缺失 key，曾落到默认 50 被排到杂览末尾（用户报「顺序错」）；
//       现补全并顺排，确保 春秋在战国前、南朝在宋前。（2026-07-25 修）
const DYNASTY_ORDER = { "春秋":0,"先秦":1,"战国":2,"秦":3,"汉":4,"三国":5,"晋":6,"西晋":6,"南朝":7,"隋":8,"唐":9,"宋":10,"金元":11,"元":12,"明":13,"清":14,"清末民初":15,"历代":16,"朝代":99 };
// 医典类型权重：经典 → 内治(内科/温病/脉学) → 方药(方剂/本草/食疗) → 外治(外科/针灸/骨伤) → 专科(妇科/儿科) → 理法(医理/医案)
const SUBCAT_ORDER = { "经典":0,"内科":1,"温病":2,"脉学":3,"方剂":4,"本草":5,"食疗":6,"外科":7,"针灸":8,"骨伤":9,"妇科":10,"儿科":11,"医理":12,"医案":13 };
// 非医典书籍按类别归组（排在全部医典类型之后）；诗/故事/杂览各自成组
const CAT_GROUP = { poem: 1, story: 2, misc: 3 };
function bookGroupKey(b) {
  if (b.subcat != null) return SUBCAT_ORDER[b.subcat] != null ? SUBCAT_ORDER[b.subcat] : 50; // 医典类型
  return 100 + (CAT_GROUP[b.cat] != null ? CAT_GROUP[b.cat] : 3);                            // 非医典：100+ 置后
}
function compareBooks(a, b) {
  const ga = bookGroupKey(a), gb = bookGroupKey(b);
  if (ga !== gb) return ga - gb;                                  // 先按医典类型分组(非医典归后)
  const da = DYNASTY_ORDER[a.dynasty] != null ? DYNASTY_ORDER[a.dynasty] : 50;
  const db = DYNASTY_ORDER[b.dynasty] != null ? DYNASTY_ORDER[b.dynasty] : 50;
  if (da !== db) return da - db;                                  // 组内按朝代先后
  const aa = (a.author && a.author !== "佚名") ? a.author : "￿";   // 佚名/无名作者置组内末尾
  const ab = (b.author && b.author !== "佚名") ? b.author : "￿";
  const ac = aa.localeCompare(ab, "zh");
  if (ac !== 0) return ac;                                        // 再按作者
  return (a.name || "").localeCompare(b.name || "", "zh");        // 末按书名
}
function sortCodexBooks(items) {
  const m = {}; for (const x of (C.books || [])) m[x.id] = x;
  return items.slice().sort((a, b) => compareBooks(m[a.id] || a, m[b.id] || b));
}

/* ---------- 书籍朝代/作者标签 ---------- */
function bookMeta(b) {
  if (!b) return "";
  if (b.author) return b.dynasty ? (b.dynasty + "·" + b.author) : (b.author + " ");
  if (b.dynasty) return b.dynasty + "代诗词";
  return "";
}

/* ---------- 空状态提示 ---------- */

function drawCodexPanel(lx, lw, cY, bottomLimit) {
  let yy = cY + 6;   // 面板内容起始 Y（原 drawPanel 外层局部，拆分时注入；codex 非 diary 故取 cY+6）

  const items = codexItemsFiltered();
  if (!items.length) {
    const emptyTxt = game.codexCat === "herb" ? "（尚未采集到草药。）"
      : game.codexCat === "flower" ? "（尚未采得鲜花。）"
      : game.codexCat === "medicine" ? "（尚无炼成丹药。）"
      : game.codexCat === "book" ? "（尚无藏书。）"
      : game.codexCat === "special" ? "（尚无特殊物件。）"
      : "（尚无所获，外出采药可得。）";
    emptyState(emptyTxt, lx, lw, yy, "leaf");
  }
  const m = 6;                      // 列表区域左右内缩，避免卡片贴边被裁剪圆角切掉
  const gap = 12;
  const cellW = (lw - m * 2 - gap) / 2;
  const cardH = 90;                 // 拉大的方框：图标 + 名称 + 描述全部收入框内
  const step = cardH + gap;
  let i = 0;
  for (let r = 0; r * 2 < items.length; r++) {
    const ry = yy + r * step;
    if (ry > bottomLimit) break;
    for (let c = 0; c < 2; c++) {
      const it = items[i++]; if (!it) break;
      const dim = !isUnlocked(it);                                  // 未拥有 → 置灰
      const cellX = lx + m + c * (cellW + gap);
      const t = it.type || (it.hue ? "herb" : "medicine");
      const border = dim ? "rgba(58,48,39,0.16)"
        : (t === "herb") ? (it.hue || TH.tree)
        : (t === "flower") ? (it.hue || TH.bond)
        : (t === "special") ? (it.hue || TH.gold)
        : TH.gold;
      card(cellX, ry, cellW, cardH, 9, dim ? "rgba(247,239,225,0.55)" : "rgba(247,239,225,0.96)", border, true);
      // 配图：按类型取对应图形（草药=叶 / 鲜花=花 / 丹药=丹印 / 书籍=书 / 特殊=宝光）
      const ix = cellX + cellW / 2, iy = ry + 20;
      const G = "rgba(150,142,130,1)";                              // 置灰主色
      if (t === "herb") {
        herbLeafIcon(ix, iy - 1, 9, dim ? G : (it.hue || TH.herb), dim);
      } else if (t === "flower") {
        drawFlowerIcon(ix, iy - 2, 6, dim ? G : (it.hue || TH.bond), dim ? G : "#f3b45a");
      } else if (t === "medicine") {
        sealMark("丹", ix, iy - 2, 13, dim ? G : TH.gold);
      } else if (t === "book") {
        bookIcon(ix, iy - 4, 11, dim ? G : "#7a5a3a");
      } else { // special：菱形宝光
        if (dim) { ctx.save(); ctx.fillStyle = G; ctx.beginPath(); ctx.moveTo(ix, iy - 12); ctx.lineTo(ix + 9, iy); ctx.lineTo(ix, iy + 12); ctx.lineTo(ix - 9, iy); ctx.closePath(); ctx.fill(); ctx.restore(); }
        else { ctx.save(); glow(true, (it.hue || TH.gold), 8); ctx.fillStyle = it.hue || TH.gold; ctx.beginPath(); ctx.moveTo(ix, iy - 12); ctx.lineTo(ix + 9, iy); ctx.lineTo(ix, iy + 12); ctx.lineTo(ix - 9, iy); ctx.closePath(); ctx.fill(); ctx.restore(); glow(false); }
      }
      // 名称（框内）
      ctx.fillStyle = dim ? "rgba(58,48,39,0.5)" : TH.ink; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText(it.name, ix, ry + 48);
      // 描述（框内，框宽内换行，最多 2 行）
      ctx.fillStyle = dim ? "rgba(58,48,39,0.4)" : TH.inkSoft2; ctx.font = "11px " + TH.fontBody; ctx.textAlign = "left";
      const dl = wrapLines(it.desc || "", "11px " + TH.fontBody, cellW - 16);
      let dy = ry + 64;
      for (const ln of dl.slice(0, 2)) { ctx.fillText(ln, cellX + 8, dy); dy += 13; }
    }
  }

}

function drawReadPanel(lx, lw, cY, bottomLimit) {

  // F9 阅读面板三态：书单 → 章单（未得章置灰）→ 阅读正文（按 \n 分段折行）
  // 方案C：目录常驻(bookToc)，书架/章单即时显示，无「藏书整理中」全量门禁；
  // 正文按书懒加载——首次打开书架预热已获得的书，点开某书再确保其正文就绪。
  if (!game._booksPrewarmed) {
    game._booksPrewarmed = true;
    if (typeof prewarmOwnedBooks === "function") prewarmOwnedBooks();
  }
  const books = C.books || [];
  if (!game.readBook) {
    // —— 书单：列出拥有≥1章的书，点击进入章单；按当前分类页签过滤，并按「朝代→作者→医典类型」排序 ——
    const cat = game.readCat || "all";
    const list = books.slice().sort(compareBooks).filter((b) => cat === "all" || b.cat === cat);
    let yy = cY + 6;
    for (const b of list) {
      if (yy > bottomLimit) break;
      const owned = game.books[b.id] || [];
      const total = tocOf(b).length;   // 方案C：总章数取常驻目录（正文未加载也准确）
      const dim = owned.length === 0;
      const rh = 40;
      card(lx + 4, yy, lw - 8, rh, 9, dim ? "rgba(247,239,225,0.55)" : "rgba(247,239,225,0.96)", dim ? "rgba(58,48,39,0.16)" : TH.gold, true);
      bookIcon(lx + 22, yy + rh / 2 - 2, 11, dim ? "rgba(150,142,130,1)" : "#7a5a3a");
      ctx.fillStyle = dim ? "rgba(58,48,39,0.5)" : TH.ink; ctx.font = "bold 13px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(b.name, lx + 44, yy + 17);
      const _meta = bookMeta(b);
      if (_meta) { ctx.font = "11px " + TH.fontBody; ctx.textAlign = "right"; ctx.fillStyle = TH.inkSoft2; ctx.fillText(_meta, lx + lw - 10, yy + 17); ctx.textAlign = "left"; }
      ctx.fillStyle = TH.inkSoft2; ctx.font = "11px " + TH.fontBody;
      ctx.fillText("已读 " + owned.length + " / " + total + " 章", lx + 44, yy + 33);
      // 医典子类角标：书籍列表右下角小标签（如「温病」「针灸」）
      if (b.subcat) {
        ctx.font = "10px " + TH.fontBody; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
        const tw2 = Math.min(ctx.measureText(b.subcat).width + 12, lw - 16);
        const bx2 = (lx + lw - 4) - tw2 - 8, by2 = yy + rh - 17;
        const tagBg = BOOK_SUBCAT_COLOR[b.subcat] || "rgba(122,47,41,0.92)";  // 按子类分色，未列回退朱砂
        card(bx2, by2, tw2, 14, 7, tagBg, null, true);
        ctx.fillStyle = "#f7efe1"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(b.subcat, bx2 + tw2 / 2, by2 + 7);
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      }
      if (!dim) panelHits.push({ x: lx + 4, y: yy, w: lw - 8, h: rh, action: () => { game.readBook = b.id; game.readChapter = null; game.panelScroll = 0; if (typeof ensureBook === "function") ensureBook(b.id); } });
      yy += rh + 10;
    }
  } else {
    const b = books.find((x) => x.id === game.readBook);
    if (!b) { game.readBook = null; }
    else if (!game.readChapter) {
      // —— 章单：已得章可点阅读，未得章置灰；顶部「返回」卡 ——
      const backH = 26, by0 = cY + 6;
      card(lx + 4, by0, lw - 8, backH, 8, "rgba(247,239,225,0.92)", TH.gold, true);
      ctx.fillStyle = TH.ink; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("← 返回书单", lx + 12, by0 + 18);
      panelHits.push({ x: lx + 4, y: by0, w: lw - 8, h: backH, action: () => { game.readBook = null; game.panelScroll = 0; } });
      let yy = by0 + backH + 10;
      for (const ch of tocOf(b)) {   // 方案C：章单取常驻目录，正文未加载也能列全章 + 灰态
        if (yy > bottomLimit) break;
        const owned = (game.books[b.id] || []).indexOf(ch.n) >= 0;
        const rh = 34;
        card(lx + 4, yy, lw - 8, rh, 9, owned ? "rgba(232,192,106,0.18)" : "rgba(247,239,225,0.55)", owned ? TH.gold : "rgba(58,48,39,0.16)", true);
        ctx.fillStyle = owned ? TH.ink : "rgba(58,48,39,0.4)"; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText("第 " + ch.n + " 章" + (owned ? "" : "（未得）"), lx + 14, yy + 22);
        const _cmeta = bookMeta(b);
        if (_cmeta) { ctx.font = "11px " + TH.fontBody; ctx.textAlign = "right"; ctx.fillStyle = owned ? TH.inkSoft2 : "rgba(58,48,39,0.4)"; ctx.fillText(_cmeta, lx + lw - 12, yy + 22); ctx.textAlign = "left"; }
        if (owned) panelHits.push({ x: lx + 4, y: yy, w: lw - 8, h: rh, action: () => { game.readChapter = ch.n; game.panelScroll = 0; } });
        yy += rh + 8;
      }
    } else {
      // —— 阅读正文：标题 + 分段折行（处理 \n）；方案C：正文按书懒加载，未就绪显示「加载中…」——
      const backH = 26, by0 = cY + 6;
      card(lx + 4, by0, lw - 8, backH, 8, "rgba(247,239,225,0.92)", TH.gold, true);
      ctx.fillStyle = TH.ink; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("← 返回书架", lx + 12, by0 + 18);
      panelHits.push({ x: lx + 4, y: by0, w: lw - 8, h: backH, action: () => { game.readChapter = null; game.panelScroll = 0; } });
      const loaded = (typeof isBookLoaded !== "function") || isBookLoaded(b.id);
      const ch = loaded ? (b.chapters || []).find((c) => c.n === game.readChapter) : null;
      if (!loaded) {
        if (typeof ensureBook === "function") ensureBook(b.id);   // 触发该书正文懒加载（下一帧就绪后自动显示）
        ctx.fillStyle = TH.inkSoft2; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("正文加载中…", lx + lw / 2, by0 + backH + (bottomLimit - (by0 + backH)) / 2);
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      } else if (!ch) {
        game.readChapter = null;   // 已加载但该章不存在 → 回章单
      } else {
        ctx.fillStyle = TH.ink; ctx.font = "bold 14px " + TH.fontTitle; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillText(b.name + " · 第 " + ch.n + " 章", lx + lw / 2, by0 + backH + 26);
        const _rmeta = bookMeta(b);
        if (_rmeta) { ctx.font = "11px " + TH.fontBody; ctx.fillStyle = TH.inkSoft2; ctx.textAlign = "center"; ctx.fillText(_rmeta, lx + lw / 2, by0 + backH + 44); }
        ctx.textAlign = "left";
        const paras = (ch.text || "").split("\n");
        const rfont = "13px " + TH.fontBody;
        const indentW = 2 * 13;             // 段首缩进 2 字
        let yy = by0 + backH + 62;
        for (const p of paras) {
          const wrapped = wrapBookPara(p, rfont, lw - 8, indentW);
          for (let i = 0; i < wrapped.length; i++) {
            if (yy > bottomLimit) break;
            ctx.fillStyle = "#3a3027"; ctx.font = rfont; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
            ctx.fillText(wrapped[i], lx + 4 + (i === 0 ? indentW : 0), yy); yy += 20;
          }
          yy += 4;
        }
      }
    }
  }
}

function drawReadDeclStrip(cX, cW, cY, cH) {

  const sy = cY + cH;            // 声明条顶 = 内容区底（已收缩 30px）
  ctx.save();
  ctx.strokeStyle = "rgba(58,48,39,0.16)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cX + 14, sy + 6); ctx.lineTo(cX + cW - 14, sy + 6); ctx.stroke();
  ctx.fillStyle = "rgba(122,110,98,0.92)"; ctx.font = "11px " + TH.fontBody;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText("内容源自网络，整理存在疏漏，仅作娱乐展示", cX + cW / 2, sy + 20);
  ctx.restore();
}

/* ===== src/title_ui.js ===== */
/* title_ui.js — 标题/存档槽/结局界面绘制。源：ui.js。须在 ui.js 之后加载。 */

function drawEnd() {
  const now = performance.now();
  ctx.fillStyle = game.win ? "rgba(239,227,207,0.78)" : "rgba(58,48,39,0.55)";
  ctx.fillRect(0, 0, W, H);
  const pw = 232, ph = 132, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
  card(px, py, pw, ph, 14, "rgba(247,239,225,0.97)", game.win ? TH.gold : "rgba(58,48,39,0.5)");
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  if (game.win) sealMark("安", px + pw - 22, py + 22, 13, TH.zhusha);
  else sealMark("归", px + pw - 22, py + 22, 13, TH.inkSoft);
  ctx.fillStyle = game.win ? TH.ink : "#e9d3b0"; ctx.font = "bold 22px " + TH.fontTitle;
  ctx.fillText(game.win ? "平安归庐" : "且回家中", W / 2, py + 48);
  const sum = game.win ? "采得灵草 " + game.herbsCollected + " 株 · 默契相守" : "此行有憾，然归家有期";
  ctx.fillStyle = game.win ? TH.inkSoft : "#cbb89a"; ctx.font = "12px " + TH.fontBody;
  ctx.fillText(sum, W / 2, py + 76);
  ctx.fillStyle = game.win ? TH.inkSoft : "#cbb89a"; ctx.font = "13px " + TH.fontBody;
  ctx.fillText(game.win ? "（点击 / 空格 再玩一次）" : "（点击 / 空格 回到家中）", W / 2, py + 104);
  drawPetals(now);
}

/* ---------- 标题屏 ---------- */
let titleImg = null;   // 标题图；由 main.js 的 bootstrapImages() 在图片分片加载完成后创建并登记到门控
function drawTitle(now) {
  const cx = W / 2;
  // —— 背景：暖色宣纸渐变（上浅下暖），较纯平涂更具层次 ——
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#f4ead4"); bg.addColorStop(0.5, "#efe3cf"); bg.addColorStop(1, "#e6d4b6");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // —— 远山淡墨剪影（底部，双重层次，铺满画布左右/底边，移除外框后不再留空隙）——
  ctx.save();
  ctx.fillStyle = "rgba(120,134,120,0.16)";
  ctx.beginPath();
  ctx.moveTo(0, 480); ctx.quadraticCurveTo(72, 436, 132, 466);
  ctx.quadraticCurveTo(198, 502, 288, 452); ctx.lineTo(288, 512); ctx.lineTo(0, 512); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(90,104,90,0.22)";
  ctx.beginPath();
  ctx.moveTo(0, 494); ctx.quadraticCurveTo(96, 456, 168, 488);
  ctx.quadraticCurveTo(240, 514, 288, 480); ctx.lineTo(288, 512); ctx.lineTo(0, 512); ctx.closePath(); ctx.fill();
  ctx.restore();

  // —— 右上淡月 ——
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.fillStyle = "#f7f0dd";
  ctx.beginPath(); ctx.arc(W - 48, 66, 19, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.25; ctx.fillStyle = "#e8dcc0";
  ctx.beginPath(); ctx.arc(W - 42, 62, 19, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // —— 左上梅枝点缀 ——
  drawTitlePlum(20, 36);

  // —— 标题「明清日常」：优先使用图片 title.png，加载失败/未生成时回退文本 ——
  const titleY = 158;
  if (titleImg && titleImg.complete && titleImg.naturalWidth) {
    const maxW = 214;                 // 标题图片目标显示宽度（原图 214×50，等比不放大）
    const s = Math.min(maxW / titleImg.naturalWidth, 1.0); // 不放大，只等比缩小
    const dw = titleImg.naturalWidth * s;
    const dh = titleImg.naturalHeight * s;
    ctx.drawImage(titleImg, cx - dw / 2, titleY - dh / 2, dw, dh);
  } else {
    const title = "明清日常", tsize = 32, tgap = 8;
    ctx.font = "bold " + tsize + "px " + TH.fontTitle; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const totalW = title.length * tsize + (title.length - 1) * tgap;
    let sx = cx - totalW / 2 + tsize / 2;
    ctx.fillStyle = TH.ink;
    for (const ch of title) { ctx.fillText(ch, sx, titleY); sx += tsize + tgap; }
  }

  // —— 副题 ——
  ctx.fillStyle = TH.inkSoft; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText("—— " + C.sisters.shijie.name + " ❤ " + C.sisters.shimei.name + " ——", cx, 206);

  // —— 诗句对联（字距疏朗）——
  drawTitleSpaced("神仙眷侣", cx, 248, 16, 9, TH.inkSoft);
  drawTitleSpaced("百年江湖", cx, 274, 16, 9, TH.inkSoft);

  // —— 标题界面底部交互区（随 titleState 切换）——
  game._titleHits = [];   // 每帧重置按钮命中区
  const touch = isTouchDevice();
  if (game.titleState === "slot") drawTitleSlotScreen(now, cx, touch);
  else drawTitleMenuScreen(now, cx, touch);

  // —— 飘瓣（最前层）——
  drawPetals(now);

  // 进入游戏所需图（家具/立绘）仍在后台补齐时，以 toast 形式提示（点「开始」已登记延迟进入）；
  // 复用 card() 视觉风格，置于画面底部中央，带淡入；就绪即随进入游戏消失。
  if (game._pendingEnter) drawPreparingToast(now, cx);
}

// 「家园整理中」toast：底部中央圆角卡片 + 淡入，与游戏内事件 toast（drawToast）视觉一致。
function drawPreparingToast(now, cx) {
  const t0 = game._pendingAt || now;
  const a = Math.min(1, (now - t0) / 250);   // 250ms 淡入
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "bold 13px " + TH.fontBody;
  const text = "加载中，请稍等……";
  const w = ctx.measureText(text).width + 28, h = 30, r = 15;
  const x = cx, y = H / 2;    // 界面正中央（开始界面等待进入时居中提示）
  card(x - w / 2, y - h / 2, w, h, r, "rgba(40,33,26,0.85)", "rgba(232,192,106,0.55)");
  ctx.fillStyle = "#f3ead9";
  ctx.fillText(text, x, y);
  ctx.restore();
}
// 标题界面：主菜单（无存档仅「新游戏」；有存档「继续游戏」+「新游戏」）
function drawTitleMenuScreen(now, cx, touch) {
  const hasSave = (game.slotMetas || []).some((m) => m);
  const btnW = 184, btnH = 36, bx = cx - btnW / 2;
  if (hasSave) {
    drawTitleButton(bx, 344, btnW, btnH, "继 续 游 戏", {
      action: () => { game.titleIntent = "continue"; game.titleState = "slot"; }, default: true,
    });
    drawTitleButton(bx, 388, btnW, btnH, "新 游 戏", {
      action: () => { game.titleIntent = "new"; game.titleState = "slot"; },
    });
  } else {
    drawTitleButton(bx, 366, btnW, btnH + 2, "新 游 戏", {
      action: () => { game.titleIntent = "new"; game.titleState = "slot"; }, default: true,
    });
  }
}
// 标题界面：选档（continue 仅已占用槽可选；new 任意槽，选已占用槽即覆盖）
function drawTitleSlotScreen(now, cx, touch) {
  ctx.fillStyle = TH.inkSoft; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(game.titleIntent === "continue" ? "选 择 存 档 · 继 续 游 戏" : "选 择 存 档 槽 · 新 游 戏", cx, 314);
  const slotW = 240, slotH = 36, sx = cx - slotW / 2;
  const labels = ["存档 一", "存档 二", "存档 三"];
  for (let i = 0; i < SAVE_COUNT; i++) {
    const m = (game.slotMetas || [])[i];
    const sy = 332 + i * 44;
    const isContinue = (game.titleIntent === "continue");
    const enabled = isContinue ? !!m : true;   // continue 仅已占用槽可点
    const label = labels[i] + (m ? (" · 第 " + m.day + " 日") : "（空）");
    let sub = "";
    if (m) {
      const wn = weatherName(m.weather);
      const t = new Date(m.ts); const dstr = (t && !isNaN(t.getTime())) ? ((t.getMonth() + 1) + "/" + t.getDate()) : "";
      sub = wn + (dstr ? (" · " + dstr) : "");
    }
    drawTitleButton(sx, sy, slotW, slotH, label, {
      enabled, sub,
      accent: m ? "rgba(122,47,41,0.96)" : "rgba(120,110,98,0.7)",
      action: enabled ? () => { enterGame(() => { if (isContinue) loadGame(i); else newGame(i); }); } : null,
    });
  }
  drawTitleTextButton(cx - 40, 478, 80, 16, "‹ 返 回", () => { game.titleState = "menu"; });
}
// 标题界面圆角按钮（opts: { enabled, accent, sub, action, default }）
function drawTitleButton(x, y, w, h, label, opts) {
  opts = opts || {};
  const enabled = (opts.enabled !== false);
  const accent = opts.accent || "rgba(194,69,61,0.96)";
  panel(x, y, w, h, 10, enabled ? accent : "rgba(120,110,98,0.45)", null);
  ctx.save();
  ctx.fillStyle = enabled ? "#fff7ec" : "rgba(255,247,236,0.55)";
  ctx.font = "bold 15px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2 + (opts.sub ? -5 : 0));
  if (opts.sub) { ctx.font = "10px " + TH.fontBody; ctx.fillStyle = "rgba(255,247,236,0.82)"; ctx.fillText(opts.sub, x + w / 2, y + h / 2 + 9); }
  ctx.textBaseline = "alphabetic"; ctx.restore();
  if (enabled && opts.action) game._titleHits.push({ x, y, w, h, action: opts.action, default: !!opts.default });
}
// 标题界面小文字按钮（返回等）
function drawTitleTextButton(x, y, w, h, label, action) {
  ctx.save();
  ctx.fillStyle = "rgba(58,48,39,0.6)"; ctx.font = "12px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2); ctx.textBaseline = "alphabetic"; ctx.restore();
  if (action) game._titleHits.push({ x, y, w, h, action });
}
// 标题界面落款 + 同人免责说明：已迁至 index.html 的 DOM #decl（常驻底部，移动端可靠显示）。
// 此处不再用画布绘制，避免与 #decl 重复、且规避移动端画布缩放导致的不可见问题。
// 字距疏朗的横排文字（标题对联用）
function drawTitleSpaced(text, cx, cy, fs, gap, color) {
  ctx.save();
  ctx.fillStyle = color; ctx.font = "bold " + fs + "px " + TH.fontTitle;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const chars = String(text).split("");
  const total = chars.length * fs + (chars.length - 1) * gap;
  let x = cx - total / 2 + fs / 2;
  for (const ch of chars) { ctx.fillText(ch, x, cy); x += fs + gap; }
  ctx.restore();
}
// 左上角梅枝点缀（褐枝 + 数朵五瓣梅）
function drawTitlePlum(ox, oy) {
  ctx.save();
  ctx.strokeStyle = "rgba(90,70,52,0.75)"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(ox, oy + 26); ctx.quadraticCurveTo(ox + 18, oy + 10, ox + 34, oy + 16); ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(ox + 18, oy + 14); ctx.quadraticCurveTo(ox + 30, oy - 4, ox + 44, oy + 2); ctx.stroke();
  const bl = [[ox + 34, oy + 16], [ox + 46, oy + 2], [ox + 16, oy - 2], [ox + 40, oy + 20]];
  for (const p of bl) {
    for (let k = 0; k < 5; k++) {
      const a = k * Math.PI * 2 / 5 - Math.PI / 2;
      ctx.fillStyle = "rgba(232,154,184,0.85)";
      ctx.beginPath(); ctx.arc(p[0] + Math.cos(a) * 3.2, p[1] + Math.sin(a) * 3.2, 2.1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = TH.gold; ctx.beginPath(); ctx.arc(p[0], p[1], 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/* ---------- 日记·回顾页签：汇总统计 ---------- */
// 小印章徽标（可自定义底/字色，区别于 sealMark 的强制白字）
function drawSealBadge(ch, x, y, r, bg, fg) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(58,48,39,0.28)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = fg; ctx.font = "bold " + Math.round(r * 0.95) + "px " + TH.fontTitle;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ch, x, y + 0.5); ctx.textBaseline = "alphabetic";
  ctx.restore();
}
// 回顾：构建分组统计布局（共度时光 / 草木之间 / 修行所得）

/* ===== src/review_stars.js ===== */
/* review_stars.js — 日记回顾汇总 + 观星(北斗)面板绘制。源：ui.js。须在 ui.js 之后加载。 */

function reviewLayout() {
  const day = game.day || 1;
  let flowerCount = 0, herbCount = 0; const flowerMap = {}, herbMap = {};
  const flowerList = (C.flowerTypes && C.flowerTypes.flower && C.flowerTypes.flower.list) || [];
  const herbList = (C.flowerTypes && C.flowerTypes.herb && C.flowerTypes.herb.list) || [];
  for (const k in (game.flowers || {})) {
    const t = game.flowers[k] && game.flowers[k].type; if (!t) continue;
    if (flowerList.indexOf(t) >= 0) { flowerCount++; flowerMap[t] = (flowerMap[t] || 0) + 1; }
    else if (herbList.indexOf(t) >= 0) { herbCount++; herbMap[t] = (herbMap[t] || 0) + 1; }
  }
  const fmtList = (m) => Object.keys(m).map((t) => flowerName(t) + "×" + m[t]).join("、");
  const flowerDetail = Object.keys(flowerMap).length ? fmtList(flowerMap) : "暂无种植";
  const herbDetail = Object.keys(herbMap).length ? fmtList(herbMap) : "暂无种植";
  const herbsCollected = game.herbsCollected || 0;
  const pillsCrafted = game.pillsCrafted || 0;
  const bookChapters = Object.values(game.books || {}).reduce((s, a) => s + (a ? a.length : 0), 0);
  const paintStrokes = (game.painting && game.painting.colored) ? game.painting.colored.filter(Boolean).length : 0;
  const monstersDefeated = game.monstersDefeated || 0;
  return [
    { type: "group", text: "共 度 时 光" },
    { type: "row", badge: { ch: "日", bg: TH.gold, fg: "#3a3027" }, label: "相伴天数", value: day + " 日" },
    { type: "group", text: "草 木 之 间" },
    { type: "row", badge: { ch: "花", bg: TH.bond, fg: "#3a3027" }, label: "共植花朵", value: flowerCount + " 株", detail: flowerDetail },
    { type: "row", badge: { ch: "草", bg: TH.tree, fg: "#fff" }, label: "共植草药", value: herbCount + " 株", detail: herbDetail },
    { type: "row", badge: { ch: "采", bg: TH.herb, fg: "#3a3027" }, label: "山野采药", value: herbsCollected + " 棵" },
    { type: "group", text: "修 行 所 得" },
    { type: "row", badge: { ch: "丹", bg: TH.gold, fg: "#3a3027" }, label: "炼制丹药", value: pillsCrafted + " 颗" },
    { type: "row", badge: { ch: "书", bg: "rgba(247,239,225,0.95)", fg: TH.zhusha }, label: "收集书籍", value: bookChapters + " 章" },
    { type: "row", badge: { ch: "画", bg: TH.bond, fg: "#3a3027" }, label: "绘下丹青", value: paintStrokes + " 笔" },
    { type: "row", badge: { ch: "妖", bg: TH.zhusha, fg: "#fff" }, label: "击退妖怪", value: monstersDefeated + " 只" },
  ];
}
function reviewItemH(it) {
  if (it.type === "group") return 26;
  return it.detail ? 50 : 38;
}
function reviewTotalH() {
  return 16 + reviewLayout().reduce((s, it) => s + reviewItemH(it) + 8, 0);
}
function drawReview(lx, lw, cY, bottomLimit) {
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const items = reviewLayout();
  const m = 4, cardX = lx + m, cardW = lw - m * 2;
  let yy = cY + 16;
  for (const it of items) {
    if (yy > bottomLimit + 4) break;
    if (it.type === "group") {
      ctx.font = "bold 13px " + TH.fontTitle; ctx.fillStyle = TH.date; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText("— " + it.text.replace(/\s+/g, "") + " —", lx + lw / 2, yy + 12); ctx.textAlign = "left";
      yy += reviewItemH(it);
    } else {   // row：带印章徽标 + 标签 + 右对齐数值 + 可选明细的统计卡（无投影）
      const rh = reviewItemH(it), cy = yy;
      panel(cardX, cy, cardW, rh, 9, "rgba(247,239,225,0.92)", "rgba(58,48,39,0.20)");
      drawSealBadge(it.badge.ch, cardX + 24, cy + rh / 2, 11, it.badge.bg, it.badge.fg);
      ctx.fillStyle = TH.ink; ctx.font = "bold 12px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(it.label, cardX + 44, cy + (it.detail ? 18 : rh / 2 + 4));
      ctx.fillStyle = TH.ink; ctx.font = "bold 14px " + TH.fontBody; ctx.textAlign = "right";
      ctx.fillText(it.value, cardX + cardW - 14, cy + (it.detail ? 18 : rh / 2 + 5)); ctx.textAlign = "left";
      if (it.detail) {
        ctx.fillStyle = TH.inkSoft2; ctx.font = "11px " + TH.fontBody; ctx.textAlign = "left";
        const dl = wrapLines(it.detail, "11px " + TH.fontBody, cardW - 58);
        ctx.fillText(dl[0], cardX + 44, cy + 36);
        if (dl[1]) ctx.fillText(dl[1], cardX + 44, cy + 47);
      }
      yy += rh + 8;
    }
  }
}

/* ---------- F6 夜晚点窗观星：古星图渲染 ---------- */
// 偶发流星（仅在星图面板内运动；performance 不可用时退化为不绘制）
let shootStar = null, shootNextAt = 0;
function drawShootingStar(skyX, skyY, skyW, skyH, now) {
  if (typeof performance === "undefined") return;
  if (!shootStar && now >= shootNextAt) {
    const fromLeft = Math.random() < 0.5;
    const x0 = fromLeft ? skyX - 6 : skyX + skyW + 6;
    const y0 = skyY + Math.random() * skyH * 0.55;
    const dir = fromLeft ? 1 : -1;
    const ang = Math.PI * 0.16 + Math.random() * 0.14;   // 略向下斜
    const v = 0.22 + Math.random() * 0.12;                // px/ms
    shootStar = { x0, y0, vx: Math.cos(ang) * v * dir, vy: Math.sin(ang) * v + 0.04, t0: now, maxLife: 760 };
    shootNextAt = now + 5200 + Math.random() * 6500;      // 约每 5~11s 一颗
  }
  if (!shootStar) return;
  const t = now - shootStar.t0;
  const x = shootStar.x0 + shootStar.vx * t;
  const y = shootStar.y0 + shootStar.vy * t;
  if (t > shootStar.maxLife || x < skyX - 30 || x > skyX + skyW + 30 || y > skyY + skyH + 30) { shootStar = null; return; }
  const a = Math.sin(Math.PI * Math.min(1, t / shootStar.maxLife));   // 渐显→渐隐
  const tail = 150;
  const tx = x - shootStar.vx * tail, ty = y - shootStar.vy * tail;
  ctx.save();
  const grad = ctx.createLinearGradient(tx, ty, x, y);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,240," + (0.85 * a).toFixed(3) + ")");
  ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
  ctx.beginPath(); ctx.fillStyle = "rgba(255,255,245," + (0.95 * a).toFixed(3) + ")";
  ctx.arc(x, y, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// 单颗已点亮星：光晕 + 脉冲环 + 星本体 + 名牌（当前句更亮，已讲过略淡）
function drawLitStar(hx, hy, name, isCur, now, lx, lw) {
  ctx.save();
  for (let r = 16; r >= 4; r -= 2) {
    ctx.beginPath(); ctx.fillStyle = "rgba(245,224,160," + (0.04 + (16 - r) * 0.010).toFixed(3) + ")";
    ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const pulse = 0.5 + 0.5 * Math.sin(now / (isCur ? 260 : 520));
  const ringA = isCur ? (0.4 + pulse * 0.45) : 0.28;
  ctx.beginPath(); ctx.strokeStyle = "rgba(245,224,160," + ringA.toFixed(3) + ")"; ctx.lineWidth = isCur ? 1.4 : 1;
  ctx.arc(hx, hy, (isCur ? 8 : 6) + pulse * (isCur ? 2.5 : 1), 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.fillStyle = isCur ? "#fff6d8" : "rgba(255,246,216,0.85)"; ctx.arc(hx, hy, isCur ? 3.8 : 3.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = isCur ? "#fff6d8" : "rgba(255,246,216,0.72)";
  ctx.font = (isCur ? "bold 12px " : "11px ") + TH.fontTitle;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const nx = Math.min(Math.max(hx, lx + 24), lx + lw - 24);
  ctx.fillText(name, nx, hy - 12);
  ctx.textAlign = "left";
}
function drawStarPanel(lx, lw, cY, bottomLimit) {
  const cH = Math.max(1, bottomLimit - cY);
  const skyX = lx - 2, skyY = cY, skyW = lw + 4, skyH = cH;
  // 夜空底：竖直渐变（靛蓝 → 近黑）
  ctx.save();
  if (ctx.roundRect) ctx.roundRect(skyX, skyY, skyW, skyH, 8); else ctx.rect(skyX, skyY, skyW, skyH);
  ctx.clip();
  const g = ctx.createLinearGradient(0, skyY, 0, skyY + skyH);
  g.addColorStop(0, "#1a2347"); g.addColorStop(0.6, "#101733"); g.addColorStop(1, "#070a18");
  ctx.fillStyle = g; ctx.fillRect(skyX, skyY, skyW, skyH);
  ctx.restore();

  const stars = C.stars || [];
  const links = C.starLinks || [];
  const now = (typeof performance !== "undefined" ? performance.now() : 0);
  const posOf = (id) => { const s = stars.find((x) => x.id === id); return s ? { x: lx + s.x * lw, y: cY + s.y * cH } : null; };

  // 星官连线（淡）—— 真实星座(同一 constel)的连线恒绘以保证「连星成图」还原形状；
  // 其余散布星仅连接「邻近」两星，形成自然的星座碎片而非满天乱线。
  const maxLink = Math.min(skyW, skyH) * 0.32;
  ctx.save();
  ctx.strokeStyle = "rgba(180,200,235,0.16)"; ctx.lineWidth = 1;
  for (const [a, b] of links) {
    const sa = stars.find((x) => x.id === a), sb = stars.find((x) => x.id === b);
    if (!sa || !sb) continue;
    const pa = { x: lx + sa.x * lw, y: cY + sa.y * cH };
    const pb = { x: lx + sb.x * lw, y: cY + sb.y * cH };
    const constelLink = !!sa.constel && sa.constel === sb.constel; // 真实星座连线恒绘
    if (!constelLink && Math.hypot(pa.x - pb.x, pa.y - pb.y) > maxLink) continue;
    ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
  }
  ctx.restore();

  // 偶发流星（掠过夜空）
  drawShootingStar(skyX, skyY, skyW, skyH, now);

  // 高亮星（数组）→ 随对话逐句依次点亮：第 i 句对应第 i 颗
  const hiIds = Array.isArray(game.starHighlight) ? game.starHighlight : (game.starHighlight ? [game.starHighlight] : []);
  const hiSeq = {};
  hiIds.forEach((id, i) => { hiSeq[id] = i; });
  let litCount = 0;
  if (hiIds.length && game.inDialogue) litCount = Math.min(hiIds.length, (game.dialogueIndex || 0) + 1);

  for (const s of stars) {
    const sx = lx + s.x * lw, sy = cY + s.y * cH;
    const seq = (s.id in hiSeq) ? hiSeq[s.id] : -1;
    const lit = seq >= 0 && seq < litCount;
    if (lit) {
      drawLitStar(sx, sy, s.name, seq === litCount - 1, now, lx, lw);   // 当前句星更亮
    } else {
      // 微弱闪光：背景星与尚未点亮的待介绍星都有细微呼吸感
      const tw = 0.5 + 0.5 * Math.sin(now / 620 + s.x * 11.3 + s.y * 6.7);
      ctx.beginPath();
      ctx.fillStyle = "rgba(222,232,255," + (0.30 + 0.45 * tw).toFixed(3) + ")";
      ctx.arc(sx, sy, 1.4 + 0.7 * tw, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* ---------- F16 游历：时长选择弹窗 + 倒计时游历浮层 ---------- */
// 时长选择弹窗（盖在家园之上，冻结世界，等待玩家选时长并确认）

/* ===== src/travel_ui.js ===== */
/* travel_ui.js — 游历设置/进行中界面绘制。源：ui.js。须在 ui.js 之后加载。 */

function drawTravelSetup() {
  if (!game.travel || game.travel.phase !== "setup") return;
  travelHits.length = 0;
  const bx = 16, bw = W - 32, by = 58, bh = 302;
  game.travel._rect = { x: bx, y: by, w: bw, h: bh };   // 供「点击空白关闭」判定卡片外区域
  ctx.save(); ctx.fillStyle = "rgba(20,16,12,0.34)"; ctx.fillRect(0, 0, W, H); ctx.restore();
  card(bx, by, bw, bh, 14, "rgba(252,248,240,0.985)", "rgba(58,48,39,0.5)");
  drawKnot(bx + bw + 2, by + 31);                    // 右上角双色中国结（顶点与弹窗顶部圆角结束处持平）
  // 页眉：与二级界面（drawPanel）一致的「浅色矩形 + 印章 + 标题」，移除顶部彩色装饰条
  panel(bx + 8, by + 8, bw - 16, 30, 8, "rgba(58,48,39,0.05)", null);   // 标题下层浅色矩形装饰
  sealMark("游", bx + 24, by + 23, 11, TH.bond);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = TH.ink; ctx.font = "bold 16px " + TH.fontTitle;
  ctx.fillText("游 历", bx + 40, by + 29);
  ctx.fillStyle = TH.inkSoft; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText("请选择外出时长，", bx + 40, by + 54);
  ctx.fillText("外出期间无法进行其他操作哦。", bx + 40, by + 72);
  ctx.textAlign = "center";   // 后续网格单元仍居中绘制
  // 时长网格 3×4（5…60 分钟）
  const cols = 3, rows = 4, gx0 = bx + 14, gy0 = by + 84, gap = 6;
  const cw = (bw - 28 - (cols - 1) * gap) / cols, ch = 34;
  for (let i = 0; i < TRAVEL_MINS.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gx0 + col * (cw + gap), y = gy0 + row * (ch + gap);
    const sel = (game.travel.selectedMin === TRAVEL_MINS[i]);
    panel(x, y, cw, ch, 8, sel ? "rgba(232,192,106,0.96)" : "rgba(255,255,255,0.6)", null);
    ctx.save(); ctx.strokeStyle = sel ? TH.gold : "rgba(58,48,39,0.16)"; ctx.lineWidth = 1.0;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, cw, ch, 8); else ctx.rect(x, y, cw, ch); ctx.stroke(); ctx.restore();
    ctx.fillStyle = sel ? "#3a3027" : TH.ink; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(TRAVEL_MINS[i] + "分钟", x + cw / 2, y + ch / 2); ctx.textBaseline = "alphabetic";
    travelHits.push({ kind: "dur", min: TRAVEL_MINS[i], x, y, w: cw, h: ch });
  }
  // 开始游历 / 取消：同一行
  const sY = gy0 + rows * ch + (rows - 1) * gap + 16;
  const sx = bx + 14, sw = bw - 28, bgap = 10;
  const bwBtn = (sw - bgap) / 2;
  panel(sx, sY, bwBtn, 36, 9, "rgba(194,69,61,0.92)", null);
  ctx.save(); ctx.strokeStyle = "rgba(150,40,36,0.9)"; ctx.lineWidth = 1.0;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sx, sY, bwBtn, 36, 9); else ctx.rect(sx, sY, bwBtn, 36); ctx.stroke(); ctx.restore();
  ctx.fillStyle = "#fff7ef"; ctx.font = "bold 14px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("开始游历", sx + bwBtn / 2, sY + 18); ctx.textBaseline = "alphabetic";
  travelHits.push({ kind: "start", x: sx, y: sY, w: bwBtn, h: 36 });
  const cx2 = sx + bwBtn + bgap;
  panel(cx2, sY, bwBtn, 36, 9, "rgba(247,239,225,0.96)", null);
  ctx.save(); ctx.strokeStyle = "rgba(58,48,39,0.4)"; ctx.lineWidth = 1.0;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(cx2, sY, bwBtn, 36, 9); else ctx.rect(cx2, sY, bwBtn, 36); ctx.stroke(); ctx.restore();
  ctx.fillStyle = TH.ink; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("取消", cx2 + bwBtn / 2, sY + 18); ctx.textBaseline = "alphabetic";
  travelHits.push({ kind: "cancel", x: cx2, y: sY, w: bwBtn, h: 36 });
  ctx.textAlign = "left";
}
// 倒计时游历浮层：仅显示此弹窗，游戏暂停；双姝原地上下位移
function drawTraveling(now) {
  if (!game.travel || game.travel.phase !== "traveling") return;
  const t = game.travel;
  ctx.fillStyle = "rgba(18,15,12,0.97)"; ctx.fillRect(0, 0, W, H);
  // 双姝原地上下位移：阎明在左(104)、清凝在右(184)
  const sj = sisters.shijie, sm = sisters.shimei;
  const baseY = 188, amp = 6, ph = now / 300;
  const oj = { x: sj.pos.x, y: sj.pos.y }, om = { x: sm.pos.x, y: sm.pos.y };
  sj.pos.x = 104; sm.pos.x = 184;          // 左右站位
  sj.pos.y = baseY; sm.pos.y = baseY;       // 地面锚点固定（阴影恒定，不随浮动）
  const bobJ = Math.sin(ph) * amp;          // 阎明浮动
  const bobM = Math.sin(ph + Math.PI) * amp; // 清凝反相浮动
  drawSister(sm, false, 2.2, null, bobM);
  drawSister(sj, false, 2.2, null, bobJ);
  drawBubbles(now);   // F8：游历界面双气泡（姐妹临时位于 104/184，气泡锚定其头顶；世界冻结不影响渲染层）
  sj.pos.x = oj.x; sj.pos.y = oj.y; sm.pos.x = om.x; sm.pos.y = om.y;
  // 文案 + 大倒计时
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(245,238,225,0.92)"; ctx.font = "bold 14px " + TH.fontBody;
  ctx.fillText("阎明和清凝外出游历中……", W / 2, 300);
  const remain = Math.max(0, (t.endMs || 0) - Date.now());
  const mm = Math.floor(remain / 60000), ss = Math.floor((remain % 60000) / 1000);
  const txt = (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
  ctx.fillStyle = TH.gold; ctx.font = "bold 40px " + TH.fontBody;
  ctx.fillText(txt, W / 2, 352);
  ctx.fillStyle = "rgba(220,210,196,0.7)"; ctx.font = "11px " + TH.fontBody;
  ctx.fillText("晚点再来看吧，不要关闭界面噢，盯~", W / 2, 388);
  ctx.textAlign = "left";
}

/* ===== src/mini_core.js ===== */
/* =========================================================================
 * 《明清日常》· 家园小游戏公共底座（src/mini_core.js）
 * -------------------------------------------------------------------------
 * 统一小游戏态 game.mini = {type, phase, day, ...}。
 * 各玩法（chess/sword/spar/formation）在独立文件实现 openXxx/drawXxx/
 * handleXxxClick/handleXxxUp，本文件负责：
 *   - 打开/关闭/清场（openMini/closeMini/resetMini/isMiniOpen）
 *   - 点击路由分发（handleMiniClick/handleMiniUp）
 *   - 绘制分发 + 通用卡壳框架（drawMiniGame/drawMiniFrame）
 *   - 主循环 update 钩子（updateMini）
 *   - 读档 day 校验（在 core.js loadGame 调用处）
 *   - 配置读取（miniCfgOf）+ 结算助手（finishMini）
 * 函数单点定义、全局共享作用域；由 build_bundle 在 main.js 之前加载。
 * 分发表用 typeof 防御：阶段0 各玩法未实现时画占位，实现后自动接管。
 * ========================================================================= */

/* 通用卡壳坐标（固定；画布 288×512）。cy/ch 为内容区，各玩法绘制落在此内。 */
function getMiniBox() {
  const bx = 18, by = 64, bw = W - 36, bh = H - 64 - 46;
  return { bx: bx, by: by, bw: bw, bh: bh, cx: bx + 12, cy: by + 44, cw: bw - 24, ch: bh - 56 };
}

/* 共享随机辅助（各玩法复用：洗牌 / 闭区间整数）。放公共底座避免重复定义。 */
function miniRandInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function miniShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  return arr;
}

/* 打开小游戏：清空所有冲突浮层（沿用游历修复经验：避免残留浮层卡死），
 * 初始化基础态 game.mini，并调用对应玩法的专属初始化（存在才调）。 */
function openMini(type) {
  // 清空冲突浮层
  game.panel = null; game.confirm = null;
  game.inDialogue = false; game.dialogue = null; game.dialogueQueue = null; game.dialogueIndex = 0; game._dialogueDone = null;
  game.visitor = null; game.poem = null; game.poemData = null; game.travel = null;
  // 先尝试恢复当天暂停的半局（「退出后再开保留进度」；跨天/跨类型不续）
  if (game.miniResume && game.miniResume.type === type && game.miniResume.day === game.day) {
    game.mini = game.miniResume;
    game.miniResume = null;
    saveGame();   // 持久化恢复态
    return;
  }
  // 基础态（phase 默认 play；day 用于「当天继续」）
  game.mini = { type: type, phase: "play", day: game.day };
  // 各玩法专属初始化（对应函数存在才调用；阶段0 未实现时仅建基础态）
  if (type === "chess" && typeof initChess === "function") initChess(game.mini);
  else if (type === "sword" && typeof initSword === "function") initSword(game.mini);
  else if (type === "spar" && typeof initSpar === "function") initSpar(game.mini);
  else if (type === "formation" && typeof initFormation === "function") initFormation(game.mini);
  saveGame();   // 持久化新局（供「当天继续」）
}

/* 关闭（中途退出用，不记日记、不触发结算对话）：保留半局到 miniResume，
 * 当天内再次打开同一玩法可续（finishMini/advanceDay 会清 miniResume）。 */
function closeMini() {
  // 仅进行中的半局存为暂停续局；已结算(over)不续（避免重开即回到已结束的局）
  if (game.mini && !game.mini.over) game.miniResume = game.mini;
  game.mini = null;
  saveGame();
}

/* 重置当前玩法（重开）：放弃旧半局、开新局（满足「可重开 / 不悔棋」语义）。 */
function resetMini() {
  if (!game.mini) return;
  game.miniResume = null;   // 重开=开新局，不续旧半局
  openMini(game.mini.type);
}

function isMiniOpen() { return !!game.mini; }

/* 读取小游戏配置（GAME_CONFIG.miniCfg，由 99_assemble 并入） */
function miniCfgOf() { return (window.GAME_CONFIG && window.GAME_CONFIG.miniCfg) || {}; }

/* 主循环 update 钩子：小游戏模态时世界已在 main.js update() 冻结，
 * 此处可推进玩法内部计时。目前各玩法动画在 draw 用 performance.now 驱动，故为空。 */
function updateMini(dt) {
  if (!game.mini || game.mini.over) return;
  const t = game.mini.type;
  if (t === "sword" && typeof updateSword === "function") { updateSword(game.mini, dt); return; }
  if (t === "spar" && typeof updateSpar === "function") { updateSpar(game.mini, dt); checkSparTimeout(game.mini); return; }
  // 其余玩法动画由 draw 用 performance.now 驱动（无需逐帧态）
}

/* 绘制分发：画通用卡壳 + 按 type 调各玩法绘制（typeof 防御，未实现画占位） */
function drawMiniGame() {
  if (!game.mini) return;
  drawMiniFrame(game.mini.type);
  const t = game.mini.type;
  if (t === "chess" && typeof drawChess === "function") { drawChess(); return; }
  if (t === "sword" && typeof drawSword === "function") { drawSword(); return; }
  if (t === "spar" && typeof drawSpar === "function") { drawSpar(); return; }
  if (t === "formation" && typeof drawFormation === "function") { drawFormation(); return; }
  drawMiniPlaceholder();
}

/* 通用卡壳：半透明遮罩 + 宣纸卡 + 描边 + 中国结 + 标题（印章 + 玩法名）。
 * 复用 ui.js 的 panel()/drawKnot()/sealMark()/TH，与现有弹窗视觉一致。 */
function drawMiniFrame(type) {
  const box = getMiniBox();
  // 半透明遮罩：聚焦玩法，盖住家园（底栏可由 pointerdown 的 _hb 优先点击）
  ctx.save(); ctx.fillStyle = "rgba(20,16,12,0.34)"; ctx.fillRect(0, 0, W, H); ctx.restore();
  // 卡壳外框：不透明宣纸底 + 墨色描边（与 drawPanel 一致，无投影）
  panel(box.bx, box.by, box.bw, box.bh, 14, "rgba(247,239,225,0.985)", null);
  ctx.save(); ctx.strokeStyle = "rgba(58,48,39,0.45)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(box.bx, box.by, box.bw, box.bh, 14); else ctx.rect(box.bx, box.by, box.bw, box.bh); ctx.stroke(); ctx.restore();
  drawKnot(box.bx + box.bw + 2, box.by + 29);
  // 标题：印章 + 玩法名
  const titleMap = { chess: "对 弈", sword: "练 剑", spar: "切 磋", formation: "破 阵" };
  const sealMap = { chess: "弈", sword: "剑", spar: "武", formation: "阵" };
  const sealCh = sealMap[type] || "戏";
  const title = titleMap[type] || "游 戏";
  ctx.save(); panel(box.bx + 8, box.by + 8, box.bw - 16, 30, 8, "rgba(58,48,39,0.05)", null); ctx.restore();
  sealMark(sealCh, box.bx + 24, box.by + 23, 11, TH.zhusha);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = TH.ink; ctx.font = "bold 16px " + TH.fontTitle;
  ctx.fillText(title, box.bx + 40, box.by + 29);
  ctx.textAlign = "left";
}

/* 占位渲染（玩法未实现时，供阶段0 验收「打开占位模态可关闭」） */
function drawMiniPlaceholder() {
  const box = getMiniBox();
  ctx.fillStyle = TH.ink; ctx.font = "13px " + TH.fontBody; ctx.textAlign = "center";
  ctx.fillText("（玩法开发中）", box.bx + box.bw / 2, box.by + box.bh / 2 - 10);
  ctx.textAlign = "left";
  const b = getPlaceholderBtn();
  drawOptionBtn(b.x, b.y, b.w, b.h, "退 出", {});
}
/* 占位界面「退出」按钮（未实现玩法也能关闭，避免卡死） */
function getPlaceholderBtn() {
  const box = getMiniBox();
  const btnW = 76, btnH = 22;
  return { x: box.bx + (box.bw - btnW) / 2, y: box.by + box.bh - 30, w: btnW, h: btnH };
}
function handlePlaceholderClick(lx, ly) {
  const b = getPlaceholderBtn();
  if (typeof chessHit === "function" && chessHit(b, lx, ly)) { closeMini(); return true; }
  return false;
}

/* 点击路由分发（pointerdown 优先消费） */
function handleMiniClick(lx, ly) {
  if (!game.mini) return;
  const t = game.mini.type;
  if (t === "chess" && typeof handleChessClick === "function") { handleChessClick(lx, ly); return; }
  if (t === "sword" && typeof handleSwordClick === "function") { handleSwordClick(lx, ly); return; }
  if (t === "spar" && typeof handleSparClick === "function") { handleSparClick(lx, ly); return; }
  if (t === "formation" && typeof handleFormationClick === "function") { handleFormationClick(lx, ly); return; }
  // 未实现玩法（如阶段3 的切磋占位）：点击退出按钮可关闭，避免卡死
  if (typeof handlePlaceholderClick === "function" && handlePlaceholderClick(lx, ly)) return;
}

/* 点击抬起路由分发（pointerup；破阵翻格用） */
function handleMiniUp(lx, ly) {
  if (!game.mini) return;
  const t = game.mini.type;
  if (t === "formation" && typeof handleFormationUp === "function") { handleFormationUp(lx, ly); return; }
}

/* 小游戏结算助手：取配置台词（按 speechKey，如 chess.win / sword.high）+ 写日记 + 关闭。
 * speaker 可选（"ming"/"qing"），缺省随机 1 人。各玩法完成整局时调用。 */
function finishMini(diaryText, speechKey, speaker) {
  if (!game.mini) return;
  const cfg = miniCfgOf();
  const t = game.mini.type;
  const who = speaker || (Math.random() < 0.5 ? "ming" : "qing");
  let line = null;
  if (speechKey) {
    const grp = (cfg[t] && cfg[t][speechKey]) ? cfg[t][speechKey] : null;
    if (grp) line = grp[who] || grp.ming || grp.qing;
  }
  if (diaryText) addDiaryEntry(diaryText);
  if (line) {
    const sp = (who === "qing") ? sisters.shimei : sisters.shijie;
    startDialogue([{ who: sp.name, text: line }]);
  }
  // 结算 toast：胜利 / 失败 / 完成（覆盖所有小游戏统一提示）
  const finMsg = (speechKey === "win") ? "胜利！" : (speechKey === "lose") ? "失败" : "成功完成~";
  if (typeof setMsg === "function") setMsg(finMsg, 2.0);
  game.miniResume = null;   // 整局结束，清暂停半局（不再续）
  game.mini.over = true;    // 标记已结算：保留界面不自动关闭；对话层由 draw() 绘制于游戏界面之上
  saveGame();               // 持久化（over 态）；界面保留，对话/重开/退出由玩家操作
  // 注：不再 game.mini = null。pointerdown 在 over 且 inDialogue 时路由到 advanceDialogue（见 main.js）
}

/* ===== src/mini_chess.js ===== */
/* =========================================================================
 * 《明清日常》· 家园小游戏 · 五子棋（src/mini_chess.js）
 * -------------------------------------------------------------------------
 * 15×15 五子棋，玩家先手（1 = 黑 / 玩家），AI 后手（2 = 白 / AI）。
 * 三层启发式 AI：① 自己连五取胜 ② 堵对手连五 ③ 攻防评分取最优格。
 * 连五胜 / 满盘和棋(tie) / 不可悔棋可重开（resetMini 重建整局）。
 * 状态存于 game.mini（board / turn / lastX / lastY / over），由 mini_core 调度。
 * ========================================================================= */

const CHESS_N = 15;

/* 初始化一局（openMini 调用；resetMini 复用 → 整局重开） */
function initChess(m) {
  const board = [];
  for (let x = 0; x < CHESS_N; x++) board.push(new Array(CHESS_N).fill(0));
  m.board = board;
  m.turn = 1;          // 玩家先手
  m.lastX = -1; m.lastY = -1;
  m.over = false;
}

function chessInB(x, y) { return x >= 0 && x < CHESS_N && y >= 0 && y < CHESS_N; }

/* 连五判定：以 (x,y) 为落子点，沿 4 个方向数同色连子，>=5 即胜 */
function chessWin(board, x, y, p) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (const d of dirs) {
    const dx = d[0], dy = d[1];
    let c = 1;
    for (let s = 1; s < 5; s++) { const nx = x + dx * s, ny = y + dy * s; if (chessInB(nx, ny) && board[nx][ny] === p) c++; else break; }
    for (let s = 1; s < 5; s++) { const nx = x - dx * s, ny = y - dy * s; if (chessInB(nx, ny) && board[nx][ny] === p) c++; else break; }
    if (c >= 5) return true;
  }
  return false;
}

function chessBoardFull(board) {
  for (let x = 0; x < CHESS_N; x++)
    for (let y = 0; y < CHESS_N; y++)
      if (board[x][y] === 0) return false;
  return true;
}

/* 单方向棋型评分：cnt 连子数，open 开放端数（0/1/2） */
function chessPatScore(cnt, open) {
  if (cnt >= 5) return 100000;
  if (open === 0) return cnt >= 4 ? 50 : 0;          // 被堵死的长连（活四被堵仍算威胁）
  if (cnt === 4) return open === 2 ? 10000 : 1200;    // 活四 / 冲四
  if (cnt === 3) return open === 2 ? 1200 : 120;      // 活三 / 眠三
  if (cnt === 2) return open === 2 ? 120 : 12;        // 活二 / 眠二
  if (cnt === 1) return open > 0 ? 2 : 0;
  return 0;
}

/* 在 (x,y) 落子 p 的整盘收益（4 方向求和），供启发式评分 */
function chessLineScore(board, x, y, p) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  let total = 0;
  for (const d of dirs) {
    const dx = d[0], dy = d[1];
    let cnt = 1, open = 0;
    let fx = x + dx, fy = y + dy;
    while (chessInB(fx, fy) && board[fx][fy] === p) { cnt++; fx += dx; fy += dy; }
    if (chessInB(fx, fy) && board[fx][fy] === 0) open++;
    let bx = x - dx, by = y - dy;
    while (chessInB(bx, by) && board[bx][by] === p) { cnt++; bx -= dx; by -= dy; }
    if (chessInB(bx, by) && board[bx][by] === 0) open++;
    total += chessPatScore(cnt, open);
  }
  return total;
}

/* 找一步即胜点（用于 AI 自己连五 / 堵对手连五） */
function chessFindWin(board, p) {
  for (let x = 0; x < CHESS_N; x++)
    for (let y = 0; y < CHESS_N; y++) {
      if (board[x][y] !== 0) continue;
      board[x][y] = p;
      const w = chessWin(board, x, y, p);
      board[x][y] = 0;
      if (w) return { x, y };
    }
  return null;
}

/* 候选点：限制在已有棋子邻域（提速，并保证开局有子后才行棋） */
function chessCandidates(board) {
  const seen = {}, set = [];
  let any = false;
  for (let x = 0; x < CHESS_N; x++)
    for (let y = 0; y < CHESS_N; y++) {
      if (board[x][y] === 0) continue;
      any = true;
      for (let dx = -2; dx <= 2; dx++)
        for (let dy = -2; dy <= 2; dy++) {
          const nx = x + dx, ny = y + dy;
          if (chessInB(nx, ny) && board[nx][ny] === 0) {
            const k = nx * CHESS_N + ny;
            if (!seen[k]) { seen[k] = 1; set.push({ x: nx, y: ny }); }
          }
        }
    }
  if (!any) return [{ x: 7, y: 7 }];   // 空盘容错：天元
  return set;
}

/* AI 落子：返回落点并写入 board */
function chessAIMove(m) {
  const board = m.board;
  // ① 自己连五
  let mv = chessFindWin(board, 2);
  if (mv) { board[mv.x][mv.y] = 2; return mv; }
  // ② 堵对手连五
  mv = chessFindWin(board, 1);
  if (mv) { board[mv.x][mv.y] = 2; return mv; }
  // ③ 攻防评分取最优
  let best = null, bestS = -1;
  for (const c of chessCandidates(board)) {
    const atk = chessLineScore(board, c.x, c.y, 2);
    const def = chessLineScore(board, c.x, c.y, 1);
    const s = atk + def * 0.95;
    if (s > bestS) { bestS = s; best = c; }
  }
  if (!best) best = { x: 7, y: 7 };
  board[best.x][best.y] = 2;
  return best;
}

/* ---------- 绘制几何（内容区：棋盘居中 + 底部两按钮） ---------- */
function getChessGeom() {
  const box = getMiniBox();
  const cell = 15;
  const boardPx = cell * (CHESS_N - 1);                       // 210
  const ox = box.cx + (box.cw - boardPx) / 2;
  const topY = box.cy + 20;                                   // 状态行下方起
  const btnY = box.cy + box.ch - 24;
  const availBot = btnY - 10;
  const oy = topY + Math.max(0, (availBot - topY - boardPx) / 2);
  const bw = 76, bh = 22, gap = 16;
  const totalW = bw * 2 + gap;
  const sx = box.cx + (box.cw - totalW) / 2;
  const btnReset = { x: sx, y: btnY, w: bw, h: bh };
  const btnExit = { x: sx + bw + gap, y: btnY, w: bw, h: bh };
  return { cx: box.cx, cw: box.cw, cy: box.cy, cell, boardPx, ox, oy, btnReset, btnExit };
}

function chessHit(r, lx, ly) {
  return lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h;
}

/* 绘制：卡壳由 drawMiniFrame 先画；本函数画棋盘与控件 */
function drawChess() {
  const m = game.mini;
  const g = getChessGeom();
  // 状态行
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = TH.ink; ctx.font = "12px " + TH.fontBody;
  let status;
  if (m.over) status = "对局已结束";
  else if (m.turn === 1) status = "轮到你落子（黑）";
  else status = "对手落子中…";
  ctx.fillText(status, g.cx + g.cw / 2, g.cy + 14);
  // 棋盘格线
  ctx.save();
  ctx.strokeStyle = "rgba(58,48,39,0.55)"; ctx.lineWidth = 1;
  for (let i = 0; i < CHESS_N; i++) {
    ctx.beginPath(); ctx.moveTo(g.ox, g.oy + i * g.cell); ctx.lineTo(g.ox + g.boardPx, g.oy + i * g.cell); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(g.ox + i * g.cell, g.oy); ctx.lineTo(g.ox + i * g.cell, g.oy + g.boardPx); ctx.stroke();
  }
  // 星位
  ctx.fillStyle = "rgba(58,48,39,0.55)";
  for (const s of [[3, 3], [3, 11], [11, 3], [11, 11], [7, 7]]) {
    ctx.beginPath(); ctx.arc(g.ox + s[0] * g.cell, g.oy + s[1] * g.cell, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // 棋子
  const r = g.cell * 0.4;
  for (let x = 0; x < CHESS_N; x++)
    for (let y = 0; y < CHESS_N; y++) {
      const v = m.board[x][y];
      if (!v) continue;
      const px = g.ox + x * g.cell, py = g.oy + y * g.cell;
      if (v === 1) {
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#f7efe1";
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(58,48,39,0.7)"; ctx.lineWidth = 1; ctx.stroke();
      }
    }
  // 最后一手标记（朱砂圈）
  if (m.lastX >= 0 && m.lastY >= 0 && m.board[m.lastX][m.lastY]) {
    const px = g.ox + m.lastX * g.cell, py = g.oy + m.lastY * g.cell;
    ctx.strokeStyle = TH.zhusha; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(px, py, r + 2, 0, Math.PI * 2); ctx.stroke();
  }
  // 按钮（复用统一选项按钮样式）
  drawOptionBtn(g.btnReset.x, g.btnReset.y, g.btnReset.w, g.btnReset.h, "重 开", {});
  drawOptionBtn(g.btnExit.x, g.btnExit.y, g.btnExit.w, g.btnExit.h, "退 出", {});
  ctx.textAlign = "left";
}

/* 点击：按钮优先，其次棋盘落子（玩家先手，落子后 AI 立即响应） */
function handleChessClick(lx, ly) {
  const m = game.mini;
  if (!m || m.type !== "chess") return;
  const g = getChessGeom();
  if (chessHit(g.btnReset, lx, ly)) { resetMini(); return; }
  if (chessHit(g.btnExit, lx, ly)) { closeMini(); return; }
  if (m.over) return;
  if (m.turn !== 1) return;
  // 命中最近交叉点（容差半格）
  const gx = Math.round((lx - g.ox) / g.cell);
  const gy = Math.round((ly - g.oy) / g.cell);
  if (!chessInB(gx, gy)) return;
  const px = g.ox + gx * g.cell, py = g.oy + gy * g.cell;
  if (Math.hypot(lx - px, ly - py) > g.cell * 0.5) return;
  if (m.board[gx][gy] !== 0) return;
  // 玩家落子
  m.board[gx][gy] = 1;
  m.lastX = gx; m.lastY = gy;
  if (chessWin(m.board, gx, gy, 1)) { finishMini("两人对弈。", "win"); return; }
  // 玩家补满且无连五 → 和棋（须在 AI 落子前判定，避免满盘时 AI 越界覆盖）
  if (chessBoardFull(m.board)) { finishMini("两人对弈。", "tie"); return; }
  // AI 响应
  m.turn = 2;
  const am = chessAIMove(m);
  m.lastX = am.x; m.lastY = am.y;
  if (chessWin(m.board, am.x, am.y, 2)) { finishMini("两人对弈。", "lose"); return; }
  if (chessBoardFull(m.board)) { finishMini("两人对弈。", "tie"); return; }
  m.turn = 1;
  saveGame();   // 持久化半局，供「当天继续」
}

/* ===== src/mini_sword.js ===== */
/* =========================================================================
 * 《明清日常》· 家园小游戏 · 练剑（src/mini_sword.js）
 * -------------------------------------------------------------------------
 * 反应出招：剑在 3 个彩色招式区（刺剑/挑剑/架剑）间自动滑动，落区即“当前招式”。
 * 流程：countdown 3..2..1 → 双姝随机一人报招 → 玩家趁剑滑入对应区点击出手（命中+1）
 *       → 共 4 回合 → 结算（>2 高 / ==2 平 / <2 低）。中途退出不记日记。
 * 状态存于 game.mini，由 mini_core 调度；time 驱动（updateMini 推进，无 setInterval）。
 * 复用 mini_core 的 getMiniBox/chessHit/drawOptionBtn；几何与按钮命中复用 chessHit。
 * ========================================================================= */

const SWORD_COUNT_TOTAL = 3.0;   // 倒计时时长（秒）
const SWORD_ROUNDS = 4;          // 总回合
const SWORD_SLIDE_SPEED = 1.7;   // 滑动速度（sin 角频率）

/* 初始化一局（openMini 调用；resetMini 复用 → 整局重开） */
function initSword(m) {
  m.phase = "countdown";   // countdown → play（over 由 finishMini 置）
  m.timer = 0;             // 累计秒：countdown 计到 COUNT_TOTAL；play 计滑动
  m.round = 0;
  m.score = 0;
  m.promptIdx = swordRandMove();
  m.promptName = swordMoveName(m.promptIdx);
  m.speakerName = swordRandSpeaker();
  m.lastHit = null;        // null / true / false（命中反馈）
  m.over = false;
}

/* ---------- 招式 / 角色 ---------- */
function swordMovesArr() { return (miniCfgOf().swordMoves) || ["刺剑", "挑剑", "架剑"]; }
function swordMoveName(i) { const a = swordMovesArr(); return a[i % a.length]; }
function swordRandMove() { const a = swordMovesArr(); return Math.floor(Math.random() * a.length); }
function swordRandSpeaker() {
  const s = (typeof sisters !== "undefined" && sisters) ? sisters : null;
  if (!s) return "";
  const names = [s.shijie, s.shimei].map((x) => x && x.name).filter(Boolean);
  return names.length ? names[Math.floor(Math.random() * names.length)] : "";
}

/* ---------- 几何（内容区：左竖排招式区带 + 右侧提示文字 + 底部两按钮） ---------- */
function getSwordGeom() {
  const box = getMiniBox();
  const btnH = 22, btnGap = 16, btnW = 76;
  const btnY = box.cy + box.ch - 2 - btnH;
  // 竖排区带：左对齐，3 招上下排列
  const stripW = 68, stripH = box.ch - 74;
  const stripX = box.cx + 4, stripY = box.cy + 36;
  const totalW = btnW * 2 + btnGap;
  const sx = box.cx + (box.cw - totalW) / 2;
  return {
    cx: box.cx, cw: box.cw, cy: box.cy, ch: box.ch,
    stripX, stripY, stripW, stripH,
    btnY, btnW, btnH,
    btnReset: { x: sx, y: btnY, w: btnW, h: btnH },
    btnExit: { x: sx + btnW + btnGap, y: btnY, w: btnW, h: btnH },
  };
}

/* 剑在区带中的位置 0..1（sin 平滑往返） */
function swordSlidePos(m) { return Math.sin(m.timer * SWORD_SLIDE_SPEED) * 0.5 + 0.5; }
/* 当前剑所在招式区索引 */
function swordCurrentZone(m) {
  const n = swordMovesArr().length || 3;
  let z = Math.floor(swordSlidePos(m) * n);
  if (z < 0) z = 0; if (z > n - 1) z = n - 1;
  return z;
}

/* 逐帧推进：倒计时→play；play 阶段位置由 m.timer 实时算 */
function updateSword(m, dt) {
  if (m.over) return;
  m.timer += dt;
  if (m.phase === "countdown" && m.timer >= SWORD_COUNT_TOTAL) {
    m.phase = "play"; m.timer = 0;
  }
}

/* 结算档位 */
function swordScoreKey(s) {
  if (s > 2) return "high";
  if (s === 2) return "tie";
  return "low";
}

/* 绘制 */
function drawSword() {
  const m = game.mini;
  const g = getSwordGeom();
  const n = swordMovesArr().length || 3;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  // 状态行
  const status = m.over ? "练习结束"
    : (m.phase === "countdown" ? "准 备" : ("练剑 第 " + (m.round + 1) + " / " + SWORD_ROUNDS + " 回合"));
  ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody;
  ctx.fillText(status, g.cx + g.cw / 2, g.cy + 12);
  // 得分
  ctx.fillStyle = "rgba(58,48,39,0.6)"; ctx.font = "12px " + TH.fontBody;
  ctx.fillText("得分 " + m.score, g.cx + g.cw / 2, g.cy + 28);

  if (m.phase === "countdown") {
    const num = Math.max(1, Math.ceil(SWORD_COUNT_TOTAL - m.timer));
    ctx.fillStyle = TH.zhusha; ctx.font = "bold 40px " + TH.fontTitle;
    ctx.fillText(String(num), g.cx + g.cw / 2, g.stripY + g.stripH / 2 + 14);
    ctx.textAlign = "left";
    return;
  }

  // 招式区带：竖排 3 行彩色半透明 + 标签（左侧窄条）
  const rowH = g.stripH / n;
  const zoneColors = ["rgba(120,170,220,0.30)", "rgba(180,200,130,0.30)", "rgba(210,150,150,0.30)"];
  for (let i = 0; i < n; i++) {
    const y = g.stripY + i * rowH;
    ctx.fillStyle = zoneColors[i % zoneColors.length];
    ctx.fillRect(g.stripX, y + 1, g.stripW, rowH - 2);
    ctx.strokeStyle = "rgba(58,48,39,0.18)"; ctx.lineWidth = 1;
    ctx.strokeRect(g.stripX, y + 1, g.stripW, rowH - 2);
    ctx.fillStyle = "rgba(58,48,39,0.72)"; ctx.font = "bold 12px " + TH.fontBody;
    ctx.fillText(swordMoveName(i), g.stripX + g.stripW / 2, y + rowH / 2 + 4);
  }
  // 高亮目标招式行
  ctx.fillStyle = "rgba(250,214,80,0.20)";
  ctx.fillRect(g.stripX, g.stripY + m.promptIdx * rowH, g.stripW, rowH);
  // 滑动剑指示器（横线 + 朱砂剑首，竖向滑动）
  const py = g.stripY + swordSlidePos(m) * g.stripH;
  const px = g.stripX + g.stripW / 2;
  ctx.strokeStyle = TH.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px - 22, py); ctx.lineTo(px + 22, py); ctx.stroke();
  ctx.fillStyle = TH.zhusha; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
  // 报招提示（区带右侧，紧贴不溢出）
  const tx = g.stripX + g.stripW + 8;
  ctx.textAlign = "left";
  ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody;
  ctx.fillText((m.speakerName ? m.speakerName + "：" : "") + "点【" + m.promptName + "】！", tx, g.stripY + 14);
  ctx.fillStyle = "rgba(58,48,39,0.5)"; ctx.font = "11px " + TH.fontBody;
  ctx.fillText("趁剑滑入对应区域时点击出手", tx, g.stripY + 30);
  // 命中反馈
  if (m.lastHit !== null) {
    ctx.textAlign = "center";
    ctx.fillStyle = m.lastHit ? "rgba(70,130,70,0.95)" : "rgba(190,80,70,0.95)";
    ctx.font = "bold 12px " + TH.fontBody;
    ctx.fillText(m.lastHit ? "命中 +1" : "未中", tx + 42, g.stripY + 48);
  }
  ctx.textAlign = "center";
  // 按钮
  drawOptionBtn(g.btnReset.x, g.btnReset.y, g.btnReset.w, g.btnReset.h, "重 开", {});
  drawOptionBtn(g.btnExit.x, g.btnExit.y, g.btnExit.w, g.btnExit.h, "退 出", {});
  ctx.textAlign = "left";
}

/* 点击：重开/退出优先；play 阶段任意点击=一次出手，判定剑所在区是否=目标招式 */
function handleSwordClick(lx, ly) {
  const m = game.mini;
  if (!m || m.type !== "sword") return;
  const g = getSwordGeom();
  if (chessHit(g.btnReset, lx, ly)) { resetMini(); return; }
  if (chessHit(g.btnExit, lx, ly)) { closeMini(); return; }
  if (m.over) return;
  if (m.phase === "countdown") return;   // 倒计时中不可出手
  const hit = (swordCurrentZone(m) === m.promptIdx);
  m.lastHit = hit;
  if (hit) m.score += 1;
  m.round += 1;
  if (m.round >= SWORD_ROUNDS) { finishMini("两人一同练剑。", swordScoreKey(m.score)); return; }
  m.timer = 0;                 // 重置滑动，开始新一轮
  m.promptIdx = swordRandMove();
  m.promptName = swordMoveName(m.promptIdx);
  m.speakerName = swordRandSpeaker();
  saveGame();
}

/* ===== src/mini_formation.js ===== */
/* =========================================================================
 * 《明清日常》· 家园小游戏 · 破阵（src/mini_formation.js）
 * -------------------------------------------------------------------------
 * 6 列 × 9 行 网格寻阵眼：每局随机 1~5 个隐藏阵眼 + 三类特效格（灵光/迷雾/推算）。
 * 翻开全部阵眼即胜（finishMini 记日记 + 结算台词）；中途「退出」不记日记。
 * 状态存于 game.mini（grid/types / flipped / marks / ling / over / help），由 mini_core 调度。
 * 复用 mini_core 的 miniRandInt/miniShuffle；几何与按钮命中复用 chessHit（同签名）。
 * ========================================================================= */

const FORM_EYE = 1, FORM_LING = 2, FORM_FOG = 3, FORM_TUI = 4;   // 格类型：阵眼/灵光/迷雾/推算

/* 玩法简介（多行，已按 ≤14 中文字手动断行；drawFormationHelp 渲染） */
const FORM_HELP = [
  "在阵盘中找到全部阵眼（红点）吧。",
  "",
  "",
  "· 灵光：翻此格会提示5格其中必有",
  "  一格是阵眼，下一次操作前有效。",
  "· 迷雾：随机复原3个格子。",
  "· 推算：一并翻开格子的上下左右。",
];

/* 初始化一局（openMini 调用；resetMini 复用 → 整局重开） */
function initFormation(m) {
  const cfg = miniCfgOf().formation || {};
  const cols = cfg.cols || 6, rows = cfg.rows || 9;
  const N = cols * rows;
  const eyesMin = cfg.eyesMin || 1, eyesMax = cfg.eyesMax || 5;
  const ranges = cfg.effectRanges || { lingguang: [1, 3], wu: [1, 3], tuisuan: [1, 3] };
  const grid = new Array(N).fill(0);
  const idxs = []; for (let i = 0; i < N; i++) idxs.push(i);
  miniShuffle(idxs);                       // 随机位置，避免规律
  let p = 0;
  // 阵眼（隐藏、不重叠）
  const eyeCount = miniRandInt(eyesMin, eyesMax);
  for (let k = 0; k < eyeCount; k++) grid[idxs[p++]] = FORM_EYE;
  // 三类特效格（各区间独立，不重叠）
  const ln = miniRandInt(ranges.lingguang[0], ranges.lingguang[1]);
  for (let k = 0; k < ln; k++) grid[idxs[p++]] = FORM_LING;
  const fg = miniRandInt(ranges.wu[0], ranges.wu[1]);
  for (let k = 0; k < fg; k++) grid[idxs[p++]] = FORM_FOG;
  const tui = miniRandInt(ranges.tuisuan[0], ranges.tuisuan[1]);
  for (let k = 0; k < tui; k++) grid[idxs[p++]] = FORM_TUI;
  m.cols = cols; m.rows = rows; m.eyeCount = eyeCount;
  m.grid = grid;
  m.flipped = new Array(N).fill(false);
  m.marks = new Array(N).fill(false);     // 灵光标识（提示未翻格）
  m.ling = false;                          // 灵光待消（玩家再翻 1 格后消失）
  m.over = false;
  m.help = false;                          // 玩法简介浮层（默认关）
  m.moves = 0;                              // 本局点击次数（显示在阵盘下方）
}

/* ---------- 特效规则 ---------- */
// 灵光：随机标识最多 5 个未翻格（≥1 含阵眼）；玩家再翻任意 1 格后标识消失。
function formationMark(m) {
  const cand = [];
  for (let i = 0; i < m.grid.length; i++) if (!m.flipped[i]) cand.push(i);
  if (!cand.length) { m.ling = false; return; }
  const eyes = cand.filter((i) => m.grid[i] === FORM_EYE);
  miniShuffle(cand);
  const chosen = [];
  if (eyes.length) {
    const e = eyes[Math.floor(Math.random() * eyes.length)];
    chosen.push(e);
    const rest = cand.filter((i) => i !== e);
    miniShuffle(rest);
    for (const i of rest) { if (chosen.length >= 5) break; chosen.push(i); }
  } else {
    for (const i of cand) { if (chosen.length >= 5) break; chosen.push(i); }
  }
  for (const i of chosen) m.marks[i] = true;
  m.ling = true;
}
// 迷雾：随机将最多 3 个已翻格恢复为未翻（含阵眼，使胜利可倒退——负面效果）。
function formationFog(m, idx) {
  const flipped = [];
  for (let i = 0; i < m.grid.length; i++) if (m.flipped[i] && i !== idx) flipped.push(i);
  miniShuffle(flipped);
  const n = Math.min(3, flipped.length);
  for (let k = 0; k < n; k++) m.flipped[flipped[k]] = false;
}
// 推算：其上下左右 4 邻格一并翻（越界忽略）；只翻状态、不递归触发邻格特效（避免连锁爆炸）。
function formationSpread(m, idx) {
  const gx = idx % m.cols, gy = Math.floor(idx / m.cols);
  const ns = [[gx + 1, gy], [gx - 1, gy], [gx, gy + 1], [gx, gy - 1]];
  for (const [nx, ny] of ns) {
    if (nx < 0 || nx >= m.cols || ny < 0 || ny >= m.rows) continue;
    m.flipped[ny * m.cols + nx] = true;
  }
}
function formationClearMarks(m) { for (let i = 0; i < m.marks.length; i++) m.marks[i] = false; m.ling = false; }
// 胜利：所有阵眼均已翻。
function formationWin(m) {
  for (let i = 0; i < m.grid.length; i++) if (m.grid[i] === FORM_EYE && !m.flipped[i]) return false;
  return true;
}

/* ---------- 几何（内容区：网格居中 + 底部两按钮 + 右上?按钮） ---------- */
function getFormationGeom() {
  const box = getMiniBox();
  const m = game.mini;
  const cols = (m && m.cols) || 6, rows = (m && m.rows) || 9;
  const statusH = 20;
  const movesH = 16;   // "寻找次数" 文本行高
  const btnH = 22, btnGap = 16, btnW = 76;
  const topY = box.cy + statusH + movesH;     // 状态行 + 计数行之下
  const btnY = box.cy + box.ch - 2 - btnH;
  const cellW = (box.cw - 2) / cols;
  const cellH = (btnY - topY - 12) / rows;     // 12px 棋盘上下留白
  const cell = Math.floor(Math.min(cellW, cellH));
  const boardW = cell * cols, boardH = cell * rows;
  const ox = box.cx + (box.cw - boardW) / 2;
  const oy = topY + Math.max(0, (btnY - topY - boardH) / 2);
  const totalW = btnW * 2 + btnGap;
  const sx = box.cx + (box.cw - totalW) / 2;
  const btnReset = { x: sx, y: btnY, w: btnW, h: btnH };
  const btnExit = { x: sx + btnW + btnGap, y: btnY, w: btnW, h: btnH };
  return { cx: box.cx, cw: box.cw, cy: box.cy, cols, rows, cell, ox, oy, btnReset, btnExit };
}

/* 右上角「?」按钮（圆形），点击切换玩法简介 */
function getFormationHelpBtn() {
  const box = getMiniBox();
  return { x: box.bx + box.bw - 64, y: box.by + 12, w: 46, h: 22 };   // 与标题底框垂直居中，左移4px，稍缩小
}

// 圆角矩形（填充 / 描边），防御旧浏览器无 roundRect
function rrFill(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  ctx.fill();
}
function rrStroke(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  ctx.stroke();
}

/* 绘制卡壳（drawMiniFrame 先画）；本函数画网格、控件与（可选）简介浮层 */
function drawFormation() {
  const m = game.mini;
  const g = getFormationGeom();
  const cs = g.cell;
  // 状态行：已寻阵眼数 / 总数（动态重算，迷雾倒退也实时准确）
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  let found = 0, rem = 0;
  for (let i = 0; i < m.grid.length; i++) if (m.grid[i] === FORM_EYE) { if (m.flipped[i]) found++; else rem++; }
  const status = m.over ? "阵法已破" : ("寻找阵眼 " + found + " / " + m.eyeCount + (m.ling ? " · 灵光指引" : ""));
  ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody;
  ctx.fillText(status, g.cx + g.cw / 2, g.cy + 12);   // 上移 2px
  // 棋盘卷轴底衬
  const boardW = cs * m.cols, boardH = cs * m.rows;
  ctx.fillStyle = "rgba(120,98,76,0.12)"; rrFill(g.ox - 5, g.oy - 5, boardW + 10, boardH + 10, 7);
  ctx.strokeStyle = "rgba(58,48,39,0.18)"; ctx.lineWidth = 1; rrStroke(g.ox - 5, g.oy - 5, boardW + 10, boardH + 10, 7);
  // 网格
  const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  const breath = 0.5 + 0.5 * Math.sin(now / 1000 * 3.0);   // 呼吸系数 0..1
  for (let gy = 0; gy < m.rows; gy++) for (let gx = 0; gx < m.cols; gx++) {
    const idx = gy * m.cols + gx;
    const x = g.ox + gx * cs, y = g.oy + gy * cs;
    const cx = x + cs / 2, cy = y + cs / 2;
    if (!m.flipped[idx]) {
      // 背面（未翻）：木纹底 + 圆角（不显示问号）
      ctx.fillStyle = "rgba(126,102,78,0.34)"; rrFill(x + 1.5, y + 1.5, cs - 3, cs - 3, 5);
      ctx.strokeStyle = "rgba(247,239,225,0.20)"; ctx.lineWidth = 1; rrStroke(x + 1.5, y + 1.5, cs - 3, cs - 3, 5);
      if (m.marks[idx] && m.ling) {
        // 灵光标识：黄色光团 + 呼吸
        const rg = ctx.createRadialGradient(cx, cy, cs * 0.08, cx, cy, cs * 0.52);
        rg.addColorStop(0, "rgba(250,214,80," + (0.30 + 0.35 * breath).toFixed(3) + ")");
        rg.addColorStop(1, "rgba(250,214,80,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, cs * 0.52, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,226,92," + (0.55 + 0.40 * breath).toFixed(3) + ")"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(cx, cy, cs * 0.34, 0, Math.PI * 2); ctx.stroke();
      }
    } else {
      // 正面（已翻）：淡绿填充
      ctx.fillStyle = "rgba(176,210,168,0.62)"; rrFill(x + 1.5, y + 1.5, cs - 3, cs - 3, 5);
      ctx.strokeStyle = "rgba(70,110,70,0.30)"; ctx.lineWidth = 1; rrStroke(x + 1.5, y + 1.5, cs - 3, cs - 3, 5);
      const t = m.grid[idx];
      if (t === FORM_EYE) {
        // 阵眼：保留朱砂圆点标识（目标格）
        ctx.fillStyle = TH.zhusha; ctx.beginPath(); ctx.arc(cx, cy, cs * 0.20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(194,69,61,0.5)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, cs * 0.32, 0, Math.PI * 2); ctx.stroke();
      }
      // 灵光/迷雾/推算 翻开：无特殊标识（仅淡绿）；普通格亦无标识
    }
  }
  // 点击计数（状态行下方、棋盘上方，居中）
  ctx.textAlign = "center"; ctx.fillStyle = "rgba(58,48,39,0.42)"; ctx.font = "11px " + TH.fontBody; ctx.textBaseline = "alphabetic";
  ctx.fillText("寻找次数 " + (m.moves || 0), g.ox + g.cell * m.cols / 2, g.cy + 26);
  ctx.textAlign = "left";
  // 按钮（复用统一选项按钮样式）
  drawOptionBtn(g.btnReset.x, g.btnReset.y, g.btnReset.w, g.btnReset.h, "重 开", {});
  drawOptionBtn(g.btnExit.x, g.btnExit.y, g.btnExit.w, g.btnExit.h, "退 出", {});
  // 简介浮层（开则先画，再画?按钮保证可见可点）
  if (m.help) drawFormationHelp();
  drawFormationHelpBtn();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}

/* 右上角「帮助」按钮绘制（始终在最上层，便于开关简介） */
function drawFormationHelpBtn() {
  const b = getFormationHelpBtn();
  ctx.save();
  // 投影 + 圆角卡片底
  ctx.shadowColor = "rgba(20,16,12,0.16)"; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1;
  ctx.fillStyle = "rgba(247,239,225,0.94)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 6);
  else ctx.rect(b.x, b.y, b.w, b.h);
  ctx.fill();
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "rgba(58,48,39,0.30)"; ctx.lineWidth = 1.1;
  ctx.stroke();
  // 文字
  ctx.fillStyle = TH.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "bold 12px " + TH.fontBody;
  ctx.fillText("帮助", b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.restore(); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}

/* 玩法简介浮层：卷轴面板 + 标题 + 多行说明；点击任意处 / 空格 关闭（无按钮） */
function drawFormationHelp() {
  const box = getMiniBox();
  const px = box.bx + 16, py = box.by + 44, pw = box.bw - 32, ph = box.bh - 90;
  // 压暗整块卡壳内部，突出简介
  ctx.fillStyle = "rgba(20,16,12,0.42)"; ctx.fillRect(box.bx, box.by, box.bw, box.bh);
  panel(px, py, pw, ph, 12, "rgba(247,239,225,0.98)", null);
  ctx.strokeStyle = "rgba(58,48,39,0.4)"; ctx.lineWidth = 1.2; rrStroke(px, py, pw, ph, 12);
  // 标题
  ctx.textAlign = "center"; ctx.fillStyle = TH.zhusha; ctx.font = "bold 15px " + TH.fontTitle;
  ctx.fillText("玩法说明", px + pw / 2, py + 24);
  ctx.strokeStyle = "rgba(58,48,39,0.25)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 18, py + 32); ctx.lineTo(px + pw - 18, py + 32); ctx.stroke();
  // 正文
  ctx.textAlign = "left"; ctx.fillStyle = TH.ink; ctx.font = "12px " + TH.fontBody;
  let yy = py + 50;
  for (const ln of FORM_HELP) {
    if (ln === "") { yy += 8; continue; }
    ctx.fillText(ln, px + 18, yy);
    yy += 16;
  }
  // 关闭提示（无按钮，点击任意处 / 空格 关闭）
  ctx.textAlign = "center"; ctx.fillStyle = "rgba(58,48,39,0.55)"; ctx.font = "11px " + TH.fontBody;
  ctx.fillText("（点击任意处 / 空格 关闭）", px + pw / 2, py + ph - 14);
  ctx.textAlign = "left";
}

/* 点击：简介开时任意点击关闭；否则?按钮开关；其次按钮、翻格（翻出全部阵眼即胜） */
function handleFormationClick(lx, ly) {
  const m = game.mini;
  if (!m || m.type !== "formation") return;
  // 简介开：任意点击（含?按钮区）关闭，吞掉棋盘点击
  if (m.help) { m.help = false; return; }
  // 「?」按钮：打开简介（在 over 态也允许，便于随时看规则）
  const hb = getFormationHelpBtn();
  if (chessHit(hb, lx, ly)) { m.help = true; return; }
  const g = getFormationGeom();
  if (chessHit(g.btnReset, lx, ly)) { resetMini(); return; }
  if (chessHit(g.btnExit, lx, ly)) { closeMini(); return; }
  if (m.over) return;   // 结算后不再翻格（按钮/?已处理）
  const gx = Math.floor((lx - g.ox) / g.cell);
  const gy = Math.floor((ly - g.oy) / g.cell);
  if (gx < 0 || gx >= m.cols || gy < 0 || gy >= m.rows) return;
  const idx = gy * m.cols + gx;
  if (m.flipped[idx]) return;                  // 已翻忽略（灵光待消需点未翻格）
  const wasLing = m.ling;                       // 本次点击需消除此前的灵光标识
  m.moves = (m.moves || 0) + 1;                 // 本局寻找次数 +1
  m.flipped[idx] = true;
  const t = m.grid[idx];
  if (t === FORM_LING) { formationMark(m); setMsg("触发[灵光]：显示提示，其中一格为阵眼", 2.0); }
  else if (t === FORM_FOG) { formationFog(m, idx); setMsg("触发[迷雾]：恢复随机已翻开的格子", 2.0); }
  else if (t === FORM_TUI) { formationSpread(m, idx); setMsg("触发[推算]：翻开该格子的上下左右", 2.0); }
  if (wasLing) formationClearMarks(m);          // 玩家再翻 1 格 → 标识消失
  if (formationWin(m)) { finishMini("两人研究阵法。", "success"); return; }
  saveGame();   // 持久化半局，供「当天继续」
}

/* ===== src/mini_spar.js ===== */
/* =========================================================================
 * 《明清日常》· 家园小游戏 · 切磋（src/mini_spar.js）
 * -------------------------------------------------------------------------
 * 反应格挡：一方随机亮出招式区（上段/中段/下段），玩家须在时限内点击同一区格挡。
 * 流程：countdown 3..2..1 → 双姝随机一人报招 → 玩家在 1.5s 内点对应区（命中+1 /
 *       点错或超时=miss）→ 共 4 回合 → 结算（>2 高 / ==2 平 / <2 低）。
 *       中途退出不记日记。
 * 状态存于 game.mini，由 mini_core 调度；time 驱动（updateMini 推进）。
 * 复用 mini_core 的 getMiniBox/chessHit/drawOptionBtn。
 * ========================================================================= */

const SPAR_COUNT_TOTAL = 3.0;   // 倒计时时长（秒）
const SPAR_ROUNDS = 4;          // 总回合
const SPAR_TIMEOUT = 1.5;        // 每回合反应时限（秒）

/* 初始化一局（openMini 调用；resetMini 复用 → 整局重开） */
function initSpar(m) {
  m.phase = "countdown";
  m.timer = 0;             // countdown 扣 → play 计时
  m.round = 0;
  m.score = 0;
  m.promptIdx = sparRandStance();          // 对手出招索引
  m.promptName = sparStanceName(m.promptIdx); // 对手出招名
  m.speakerName = sparRandSpeaker();       // 谁报招
  m.lastHit = null;        // null / true / false
  m.over = false;
}

/* ---------- 招式（架式） ---------- */
function sparStancesArr() { return (miniCfgOf().sparStances) || ["上段", "中段", "下段"]; }
function sparStanceName(i) { const a = sparStancesArr(); return a[i % a.length]; }
function sparRandStance() { const a = sparStancesArr(); return Math.floor(Math.random() * a.length); }
function sparRandSpeaker() {
  const s = (typeof sisters !== "undefined" && sisters) ? sisters : null;
  if (!s) return "";
  const names = [s.shijie, s.shimei].map((x) => x && x.name).filter(Boolean);
  return names.length ? names[Math.floor(Math.random() * names.length)] : "";
}

/* ---------- 几何 ---------- */
function getSparGeom() {
  const box = getMiniBox();
  const btnH = 22, btnGap = 16, btnW = 76;
  const btnY = box.cy + box.ch - 2 - btnH;
  // 竖排区带：左对齐，3 招上下排列
  const stripW = 68, stripH = box.ch - 74;
  const stripX = box.cx + 4, stripY = box.cy + 36;
  const totalW = btnW * 2 + btnGap;
  const sx = box.cx + (box.cw - totalW) / 2;
  return {
    cx: box.cx, cw: box.cw, cy: box.cy, ch: box.ch,
    stripX, stripY, stripW, stripH,
    btnY, btnW, btnH,
    btnReset: { x: sx, y: btnY, w: btnW, h: btnH },
    btnExit: { x: sx + btnW + btnGap, y: btnY, w: btnW, h: btnH },
  };
}

/* ---------- 逐帧推进 ---------- */
function updateSpar(m, dt) {
  if (m.over) return;
  m.timer += dt;
  if (m.phase === "countdown" && m.timer >= SPAR_COUNT_TOTAL) {
    m.phase = "play"; m.timer = 0;
  }
}

/* 结算档位 */
function sparScoreKey(s) {
  if (s > 2) return "high";
  if (s === 2) return "tie";
  return "low";
}

/* ---------- 点击判定：返回点中了哪一区（0-2），未点中返回 -1 ---------- */
function sparWhichZone(lx, ly) {
  const g = getSparGeom();
  const n = sparStancesArr().length || 3;
  const rowH = g.stripH / n;
  if (lx < g.stripX || lx > g.stripX + g.stripW) return -1;
  if (ly < g.stripY || ly > g.stripY + g.stripH) return -1;
  return Math.floor((ly - g.stripY) / rowH);
}

/* ---------- 绘制 ---------- */
function drawSpar() {
  const m = game.mini;
  const g = getSparGeom();
  const n = sparStancesArr().length || 3;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";

  // 状态行
  const status = m.over ? "切磋结束"
    : (m.phase === "countdown" ? "准 备" : ("切磋 第 " + (m.round + 1) + " / " + SPAR_ROUNDS + " 回合"));
  ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody;
  ctx.fillText(status, g.cx + g.cw / 2, g.cy + 12);
  // 得分
  ctx.fillStyle = "rgba(58,48,39,0.6)"; ctx.font = "12px " + TH.fontBody;
  ctx.fillText("得分 " + m.score, g.cx + g.cw / 2, g.cy + 28);

  if (m.phase === "countdown") {
    const num = Math.max(1, Math.ceil(SPAR_COUNT_TOTAL - m.timer));
    ctx.fillStyle = TH.zhusha; ctx.font = "bold 40px " + TH.fontTitle;
    ctx.fillText(String(num), g.cx + g.cw / 2, g.stripY + g.stripH / 2 + 14);
    ctx.textAlign = "left";
    return;
  }

  // 三区色块 + 标签（竖排）
  const rowH = g.stripH / n;
  const zoneColors = ["rgba(210,150,150,0.30)", "rgba(150,200,160,0.30)", "rgba(120,160,220,0.30)"];
  for (let i = 0; i < n; i++) {
    const y = g.stripY + i * rowH;
    ctx.fillStyle = zoneColors[i % zoneColors.length];
    ctx.fillRect(g.stripX, y + 1, g.stripW, rowH - 2);
    ctx.strokeStyle = "rgba(58,48,39,0.18)"; ctx.lineWidth = 1;
    ctx.strokeRect(g.stripX, y + 1, g.stripW, rowH - 2);
    ctx.fillStyle = "rgba(58,48,39,0.72)"; ctx.font = "bold 14px " + TH.fontBody;
    ctx.fillText(sparStanceName(i), g.stripX + g.stripW / 2, y + rowH / 2 + 5);
  }
  // 高亮对手出招行
  ctx.fillStyle = "rgba(245,200,60,0.22)";
  ctx.fillRect(g.stripX, g.stripY + m.promptIdx * rowH, g.stripW, rowH - 2);

  // 报招提示（区带右侧，紧贴不溢出）
  const tx = g.stripX + g.stripW + 8;
  ctx.textAlign = "left";
  ctx.fillStyle = TH.ink; ctx.font = "bold 13px " + TH.fontBody;
  ctx.fillText((m.speakerName ? m.speakerName + "·" : "") + sparStanceName(m.promptIdx) + "段 — 快接招！", tx, g.stripY + 14);
  ctx.fillStyle = "rgba(58,48,39,0.5)"; ctx.font = "11px " + TH.fontBody;
  const secLeft = Math.max(0, SPAR_TIMEOUT - m.timer).toFixed(1);
  ctx.fillText("剩余 " + secLeft + " 秒 · 点击对应招式格挡", tx, g.stripY + 30);
  // 命中反馈
  if (m.lastHit !== null) {
    ctx.textAlign = "center";
    ctx.fillStyle = m.lastHit ? "rgba(70,130,70,0.95)" : "rgba(190,80,70,0.95)";
    ctx.font = "bold 12px " + TH.fontBody;
    ctx.fillText(m.lastHit ? "格挡成功 +1" : (m.lastHit === false ? "格挡失败" : "出手太慢"), tx + 42, g.stripY + 48);
  }
  ctx.textAlign = "center";

  // 按钮
  drawOptionBtn(g.btnReset.x, g.btnReset.y, g.btnReset.w, g.btnReset.h, "重 开", {});
  drawOptionBtn(g.btnExit.x, g.btnExit.y, g.btnExit.w, g.btnExit.h, "退 出", {});
  ctx.textAlign = "left";
}

/* ---------- 点击 ---------- */
function handleSparClick(lx, ly) {
  const m = game.mini;
  if (!m || m.type !== "spar") return;
  const g = getSparGeom();
  if (chessHit(g.btnReset, lx, ly)) { resetMini(); return; }
  if (chessHit(g.btnExit, lx, ly)) { closeMini(); return; }
  if (m.over) return;
  if (m.phase === "countdown") return;   // 倒计时中不可出手
  // 判定
  const which = sparWhichZone(lx, ly);
  if (which < 0) return;   // 没点到区 → 忽略
  const hit = (which === m.promptIdx);
  m.lastHit = hit;
  if (hit) m.score += 1;
  // 进入下一回合或结算
  m.round += 1;
  if (m.round >= SPAR_ROUNDS) { finishMini("两人切磋武艺。", sparScoreKey(m.score)); return; }
  m.timer = 0;
  m.promptIdx = sparRandStance();
  m.promptName = sparStanceName(m.promptIdx);
  m.speakerName = sparRandSpeaker();
  saveGame();
}

/* 超时检测：updateMini 中逐帧判定 */
/* 已由上方 updateSpar 推进 m.timer；在 updateMini 分发后、draw 前由主循环渲染。
 * 超时逻辑揉进 updateMini（见 mini_core.js 的 updateMini 分发改造：spar 分支进入本函数后，
 * 若 m.timer >= SPAR_TIMEOUT 且 m.phase==="play" 则视为失手 → 推进回合）。 */
function checkSparTimeout(m) {
  if (m.over || m.phase !== "play") return;
  if (m.timer >= SPAR_TIMEOUT) {
    m.lastHit = "timeout";   // 特殊值：区分于 true/false
    m.round += 1;
    if (m.round >= SPAR_ROUNDS) { finishMini("两人切磋武艺。", sparScoreKey(m.score)); return; }
    m.timer = 0;
    m.promptIdx = sparRandStance();
    m.promptName = sparStanceName(m.promptIdx);
    m.speakerName = sparRandSpeaker();
    saveGame();
  }
}

/* ===== src/main.js ===== */
/* =========================================================================
 * 《明清日常》引擎 · 主循环 / 输入 / 启动 (main.js)
 * 依赖全部前置模块（core → scenes → home → outing → ui → main）
 * 本文件最后执行：挂载输入、启动首屏、暴露测试接口。
 * ========================================================================= */

/* ---------- F8 双气泡：进入新时辰检测（纯氛围，由 scenes.js 程序绘制） ---------- */
// 仅家园场景、且无在播气泡时，以 20% 概率触发；第二人约 1s 后同款冒出（见 maybeTriggerDoubleBubble）。
let _lastChenIdx = -1;   // 上次记录的时辰索引（局部守卫，避免同辰重复 roll；外出期间不更新）
function checkShichenBubble() {
  if (game.scene !== "home" || game.bubble) return;
  const idx = Math.floor((game.clock * 12 + 0.5)) % 12;   // 与 shichenName 同款时辰索引算法
  if (_lastChenIdx >= 0 && idx !== _lastChenIdx && Math.random() < 0.2) {
    maybeTriggerDoubleBubble();
  }
  if (game.scene === "home") _lastChenIdx = idx;           // 外出时不更新，回家后首个新辰仍会触发一次
}

/* ---------- 更新分发 ---------- */
function update(dt) {
  tickBrew();                  // F1：炼制倒计时（置于顶端，确保对话/面板/睡眠期间也持续推进）
  // F8：双气泡过期清理（置于顶端，任何状态下每帧都推进；纯氛围，过期即丢弃，不阻塞世界）
  if (game.bubble && performance.now() >= game.bubble.t0 + game.bubble.secondDelay + game.bubble.dur) {
    game.bubble = null;
  }
  if (game.travel) { updateTravel(dt); return; }   // F16：游历中（setup/traveling）冻结世界，仅推进游历
  if (game.sleeping) { updateSleep(dt); return; }
  if (game.forcedRest) return;        // F15：一日结束·手动强制休息——冻结世界，等待玩家点「休息」
  if (game.combinedFx > 0) game.combinedFx = Math.max(0, game.combinedFx - dt);
  // 访客登场计时按真实时间推进，不受对话/面板冻结影响（否则卡着对话时访客永不登场）
  if (game.visitorSpawnTimer > 0 && !game.visitor) game.visitorSpawnTimer -= dt;
  // toast 全局计时：与场景/状态无关，每帧递减——修复「某些情况下不隐藏」。
  // 原递减只写在 updateHome / updateOuting 内，而 update() 在 game.ended / 对话 / 面板等早返回处
  // 不会调用它们，导致那些态下 msgTimer 永不减、toast 永远画在屏幕上（尤其战斗结束结算屏）。
  if (game.msgTimer > 0) {
    game.msgTimer -= dt;
    if (game.msgTimer <= 0) { game.msgTimer = 0; if (game.msg) game.toastFade = TOAST_FADE; }
  } else if (game.toastFade > 0) {
    game.toastFade -= dt;
    if (game.toastFade <= 0) { game.toastFade = 0; game.msg = ""; }
  }
  // 家园小游戏模态：冻结世界（clock/访客/就寝均不推进，避免自动就寝清场）；toast 仍递减；内部动画由 draw 用 performance.now 驱动
  if (game.mini) { updateMini(dt); return; }
  // F15：手动模式闲置超时 → 自动切入自动模式（任意操作会经 registerInput 刷新计时）
  // 关键：① 标题界面期间不计闲置——否则标题屏静置会被算入，导致「还没开始玩就自动切到自动模式」；
  //      ② 此判定须排在「对话/面板早返回」之前——否则手动模式对话一旦打开，世界冻结且闲置判定
  //         永远到不了，时间卡死（游历结束后玩家处于闲置最易触发，见 #1 修复）。
  if (!game.showTitle) {
    const now = performance.now();
    if (typeof game.lastInputAt !== "number" || game.lastInputAt <= 0) game.lastInputAt = now;
    const idleSec = ((window.GAME_CONFIG && window.GAME_CONFIG.mode && window.GAME_CONFIG.mode.idleToAutoSec) || 60);
    if (game.controlMode === "manual" && !game.confirm && (now - game.lastInputAt) > idleSec * 1000) {
      setControlMode("auto");
    }
  }
  // F15-增强：自动模式对话自动播放（无需点击，按节奏逐句推进）；手动模式仍冻结世界等待玩家
  if (game.inDialogue) {
    if (game.controlMode === "auto") {
      game._autoDlgTimer = (game._autoDlgTimer || 0) + dt;
      const AUTO_DLG_INTERVAL = 2.0;   // 每句停留约 2 秒，便于阅读
      if (game._autoDlgTimer >= AUTO_DLG_INTERVAL) { game._autoDlgTimer = 0; advanceDialogue(); }
    }
    return;       // 对话中冻结世界（活动动画仍绘制）
  }
  if (game.panel) { updatePanel(dt); return; }
  // F15：昼夜整圈推进 → 触发「一日结束」节点（clock 回绕即经过子夜）
  if (!game.ended && !game.showTitle) {
    const prev = game.clock;
    game.clock = (prev + dt / DAY_CYCLE) % 1;
    checkShichenBubble();                 // F8：进入新时辰检测（20% 触发双气泡）
    if (game.clock < prev) onDayCycleComplete();
  }
  if (game.sleeping) return;          // F15：自动模式已就寝，本帧不再推进世界
  if (game.scene === "outing") {
    if (game.ended) return;
    updatePlay(dt);
  } else {
    updateHome(dt);
  }
}
// F15：记录一次玩家操作（移动/点击/按键/开面板）——刷新闲置计时；自动模式任意操作即回手动
function registerInput() {
  game.lastInputAt = performance.now();
  if (game.controlMode === "auto" && !game.sleeping && !game.forcedRest) setControlMode("manual");
}
function setControlMode(mode) {
  if (game.controlMode === mode) return;
  game.controlMode = mode;
  setMsg(mode === "auto" ? "自动模式" : "手动模式", 1.4);
}
function toggleControlMode() {
  // 直接按当前态取反，不经由 registerInput（registerInput 在自动态会强制切回手动，会造成「自动→手动→自动」双翻转、卡在自动）
  const next = (game.controlMode === "auto") ? "manual" : "auto";
  setControlMode(next);
  game.lastInputAt = performance.now();   // 切到手动时重置闲置计时，避免立刻又被闲置自动切回
}

/* ---------- 渲染 ---------- */
function draw() {
  const now = performance.now();
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.textBaseline = "alphabetic";
  if (game.showTitle) { drawHomeScene(now); drawTitle(now); return; }
  if (game.sleeping) { drawSleep(now); return; }
  if (game.travel && game.travel.phase === "traveling") { drawTraveling(now); drawToast(); return; }  // F16：仅显示游历倒计时浮层
  if (game.scene === "outing") drawOutingScene(now);
  else drawHomeScene(now);
  drawDayNight(now);
  drawWeather(now);   // 天气叠层（昼夜之上、HUD 之下）
  if (game.scene === "outing") { vignette(0.10); scrollFrame(); }
  drawPetals(now);
  // HUD
  if (game.scene === "outing") {
    drawHUD();
    if (game.ended) drawEnd();
  } else {
    drawHUD();
    if (game.panel) drawPanel(game.panel);
    drawHomeBar();
    if (game.settingsOpen) drawSettingsPanel();   // 系统设置弹窗（盖在家园之上）
    if (game.travel && game.travel.phase === "setup") drawTravelSetup();   // F16：游历时长弹窗（盖在家园之上）
    if (game.mini) drawMiniGame();   // 家园小游戏模态（盖在家园之上）
  }
  if (game.inDialogue && !game.poem) drawDialogue();
  if (game.poem) drawPoem();   // F9 随机对诗浮层（盖在对话/面板上，置顶）
  if (game.visitorChoice) drawVisitorChoice();   // F2 访客需求选项面板（盖在对话/面板上，置顶）
  if (game.confirm) drawConfirm();
  drawToast();   // 飘字置顶：盖在面板 / 对话 / 确认框之上
}

/* ---------- 主循环 ---------- */
let last = performance.now();
let _titleState = null;   // 缓存标题/游戏态，仅变化时同步 body 类（驱动 #decl 显隐）
let _slotOpenState = false;   // 缓存「选档界面」态，打开存档时隐藏 #decl（避免挡返回按钮）
let _outingSceneState = false; // 缓存外出战斗态，仅此外显示移动端触控操作按钮（避免遮挡家园底栏「游历」）
function loop(t) {
  const now = performance.now();
  // 同步标题/游戏态 → body 类，驱动底部说明文本（#decl）显隐：
  //   · on-title：开始界面（PC + 移动端均显示，落于开始界面底部）
  //   · in-game ：游戏内（仅移动端显示，落于游戏下方；PC 不显示）
  //   · slot-open：开始界面下的选档（打开存档）子界面——此时隐藏 #decl，避免遮挡「‹ 返回」按钮
  const onTitle = !!game.showTitle;
  if (onTitle !== _titleState) {
    if (typeof document !== "undefined" && document.body) {   // 无头测试无 DOM 桩，安全跳过
      document.body.classList.toggle("on-title", onTitle);
      document.body.classList.toggle("in-game", !onTitle);
    }
    _titleState = onTitle;
  }
  const slotOpen = !!(onTitle && game.titleState === "slot");
  if (slotOpen !== _slotOpenState) {
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.toggle("slot-open", slotOpen);
    }
    _slotOpenState = slotOpen;
  }
  // 外出战斗态 → body.outing-scene：移动端仅在此外显示触控操作按钮（#btns），
  // 家园态隐藏，避免其叠在画布底部「游历」按钮上方吞掉点击（2026-07-23 修「游历按钮点击没反应」）。
  const outingScene = (game.scene === "outing");
  if (outingScene !== _outingSceneState) {
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.toggle("outing-scene", outingScene);
    }
    _outingSceneState = outingScene;
  }
  let dt = (t - last) / 1000; last = t;
  if (dt > 0.05) dt = 0.05;
  update(dt); draw();
  updateLoadProgress();   // 每帧刷新加载进度（图片/书文分片计数 + 开始界面就绪），供加载层墨线
  // 开始界面所需图（标题图 + 家园背景）就绪即关闭加载界面；home_bg 缺失/网关挂死有 6s 兜底，不卡死。
  if (!game._bootDone) {
    if (titleScreenReady() || (now - game._bootStart > 6000)) { game._bootDone = true; hideLoader(); }
  }
  // 进入游戏所需图（家园背景 + 家具 + 立绘）后台静默补齐；用户点「开始」时已登记延迟进入，此处就绪即触发。
  if (game._pendingEnter && (gameReady() || (now - game._bootStart > 8000))) {
    const cb = game._pendingEnter; game._pendingEnter = null; game._pendingAt = 0; cb(); game.showTitle = false;
  }
  requestAnimationFrame(loop);
}

/* ---------- 输入：按钮（战斗） ---------- */
function doAttack() { if (!game.inDialogue && !game.ended && game.scene === "outing") castAttack(active()); }
function doHeal() { if (!game.inDialogue && !game.ended && game.scene === "outing") castHeal(active()); }
function doCombined() { if (!game.inDialogue && !game.ended && game.scene === "outing") castCombined(); }

/* ---------- 输入：键盘 ---------- */
const keys = {};
function computeKeyDir() {
  let x = 0, y = 0;
  if (keys["a"] || keys["arrowleft"]) x -= 1;
  if (keys["d"] || keys["arrowright"]) x += 1;
  if (keys["w"] || keys["arrowup"]) y -= 1;
  if (keys["s"] || keys["arrowdown"]) y += 1;
  input.keyDir = { x, y };
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  registerInput();   // F15：任何按键都是操作 → 刷新闲置计时 / 自动回手动
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
  if (k === " ") {
    if (game.showTitle) { handleTitleSpace(); return; }
    if (game.sleeping) return;
    if (game.travel && game.travel.phase === "setup") { closeTravelSetup(); return; }   // 游历时长弹窗：空格关闭
    if (game.mini && game.mini.help) { game.mini.help = false; return; }   // 破阵玩法简介：空格关闭
    if (game.confirm) {   // F15：强制休息（forced）空格即「休息」；普通确认空格=拒绝
      if (game.confirm.forced) { if (game.confirm.onYes) game.confirm.onYes(); }
      else if (game.confirm.onNo) game.confirm.onNo();
      return;
    }
    if (game.inDialogue) advanceDialogue();
    else if (game.panel) closePanel();
    else if (game.scene === "outing" && game.ended) location.reload();
    return;
  }
  if (k === "1") { openPanel("diary"); return; }
  if (k === "2") { openPanel("codex"); return; }
  if (k === "3") { openPanel("recipe"); return; }
  if (k === "4") { if (game.scene === "home" && !game.inDialogue) openPanel("maps"); return; }
  if (k === "j") { doAttack(); return; }
  if (k === "k") { doHeal(); return; }
  if (k === "l") { doCombined(); return; }
  if (k === "tab") { e.preventDefault(); doSwitch(); return; }
  if (k === "e") {
    if (game.scene === "home" && !game.inDialogue) {
      // 附近有「未对话」访客则优先交谈，否则按原逻辑触发最近家具
      if (game.visitor && !game.visitor.talked) {
        const a = active();
        if (Math.hypot(a.pos.x - game.visitor.x, a.pos.y - game.visitor.y) < TILE * 1.6) { talkToVisitor(); return; }
      }
      const p = nearestHomePoint();
      if (p) handleHomePoint(p);
    }
    return;
  }
  keys[k] = true; computeKeyDir();
});
window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; computeKeyDir(); });

/* ---------- 输入：家园最近可交互点（按家具注册表） ---------- */
function nearestHomePoint() {
  const a = active();
  let best = null, bd = Infinity;
  for (const f of (C.furniture || [])) {
    if (!f.onTap && !(f.lines && f.lines.length)) continue;
    const b = furnitureBox(f);   // 以视觉盒底边中心为参考（玩家站在家具脚边）
    const d = dist(a.pos.x, a.pos.y, b.anchorX, b.anchorY);
    if (d < bd) { bd = d; best = { type: f.onTap || "lines", id: f.id, f }; }
  }
  return (best && bd < TILE * (best.f.reach != null ? best.f.reach : 1.5)) ? best : null;
}

/* ---------- 输入：移动端「自由滑动 / 点击」替代固定摇杆 ----------
   在画布空白处按下 = 浮空方向原点；拖动 = 方向（写入 input.touchDir，沿用原方向语义）；
   轻点（几乎没移动）= 走到落点（写入 game.tapTarget，由 moveActive 消费）。
   桌面端仍走键盘，不受影响。 */
const FREE_R = 46;                 // 方向灵敏度（与原摇杆一致）
let freeId = null, freeOx = 0, freeOy = 0, freeMax = 0;
function startFreeMove(e) {
  registerInput();                 // F15：操作即刷新闲置计时 / 自动回手动
  freeId = e.pointerId;
  freeOx = e.clientX; freeOy = e.clientY; freeMax = 0;
  input.touchActive = true; input.touchDir = { x: 0, y: 0 };
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
}
function moveFree(e) {
  if (e.pointerId !== freeId) return;
  let dx = e.clientX - freeOx, dy = e.clientY - freeOy;
  const len = Math.hypot(dx, dy);
  freeMax = Math.max(freeMax, len);
  if (len > FREE_R) { dx = dx / len * FREE_R; dy = dy / len * FREE_R; }
  input.touchActive = true;
  input.touchDir = { x: dx / FREE_R, y: dy / FREE_R };
  game.tapTarget = null;          // 拖动即取消点击行走
}
function endFree(e) {
  if (e.pointerId !== freeId) return;
  const wasTap = freeMax < 10;    // 几乎没移动 → 视为点击落点
  freeId = null;
  input.touchActive = false; input.touchDir = { x: 0, y: 0 };
  try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  if (wasTap && game.controlMode !== "auto") {
    const { lx, ly } = pointerToLogical(e);
    const wx = (game.scene === "home") ? lx + homeCamX : lx;   // 家园有横向相机，外出无
    game.tapTarget = { x: wx, y: ly };
  }
}
function bindBtn(id, fn) { const b = document.getElementById(id); if (b) b.addEventListener("pointerdown", (e) => { e.preventDefault(); registerInput(); fn(); }); }
bindBtn("bAtk", doAttack); bindBtn("bHeal", doHeal); bindBtn("bSw", doSwitch); bindBtn("bCombo", doCombined);

/* ---------- 输入：画布指针（对话 / 面板 / 家园交互） ---------- */
function pointerToLogical(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const cy = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  return { lx: (cx - rect.left) / rect.width * W, ly: (cy - rect.top) / rect.height * H };
}
function handleHomeBar(name) {
  if (name === "travel") {                       // F16：游历按钮 → 打开/关闭时长弹窗（非普通面板）
    if (game.travel && game.travel.phase === "setup") { closeTravelSetup(); return; }
    // 与 diary/codex 同级：出行是底部主栏的明确意图，点击即视为「我要出行」，
    // 先清掉一切可能拦截出行弹窗的浮层（面板/确认框/对话/访客/对诗），
    // 否则其中任一残留（如移动端确认框按钮落在安全区外无法点掉）会卡死 openTravelSetup 守卫，
    // 表现为「游历界面又打不开」。（2026-07-25 修：此前仅清 panel，visitor/confirm 等残留仍会挡）
    if (game.panel) closePanel();
    if (game.confirm) game.confirm = null;
    if (game.inDialogue) { game.inDialogue = false; game.dialogue = null; }
    if (game.visitor) game.visitor = null;
    if (game.poem) { game.poem = null; game.poemData = null; }
    openTravelSetup();
    return;
  }
  if (game.travel && game.travel.phase === "setup") closeTravelSetup();  // 从出行弹窗切到日记/图鉴时先关出行（回归测试 5g2）
  if (game.panel === name) closePanel(); else openPanel(name);
}
// 标题界面点击分发：遍历 drawTitle 每帧写入的按钮命中区
function handleTitleClick(lx, ly) {
  const hits = game._titleHits || [];
  for (const h of hits) {
    if (lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h) {
      if (h.action) { h.action(); return; }
    }
  }
}
// 标题界面空格：触发默认/首个可用按钮（menu 下优先「继续游戏」→「新游戏」；slot 下优先第一槽）
function handleTitleSpace() {
  const hits = game._titleHits || [];
  if (!hits.length) return;
  const def = hits.find((h) => h.default) || hits[0];
  if (def && def.action) def.action();
}
// 面板内拖动滚动状态
const panelDrag = { active: false, moved: false, startY: 0, startScroll: 0 };
canvas.addEventListener("pointerdown", (e) => {
  const { lx, ly } = pointerToLogical(e);
  game._ptr = { x: lx, y: ly };   // 记录指针逻辑坐标，供浮层（如论学选项）悬停高亮使用
  if (game.showTitle) { handleTitleClick(lx, ly); return; }
  if (game.sleeping) { return; }
  // 底部主栏（日记/图鉴/游历）始终可点：即便确认框/对话/访客选项等浮层未消，
  // 点主栏视为明确意图优先处理——避免浮层卡死导致「游历打不开」。（2026-07-25 修）
  const _hb = hitHomeBar(lx, ly);
  if (_hb) { handleHomeBar(_hb); return; }
  if (game.mini) {
    // 结算后对话显示时，点击推进对话（对话层在游戏界面之上）；否则由玩法自身处理（含 over 态的?/重开/退出）
    if (game.mini.over && game.inDialogue) { advanceDialogue(); return; }
    handleMiniClick(lx, ly); return;
  }
  if (game.confirm) { handleConfirmClick(lx, ly); return; }
  if (game.poem) { handlePoemClick(lx, ly); return; }   // F9：对诗浮层优先消费点击（含 answer 阶段任意处关闭）
  if (game.visitorChoice) { handleVisitorChoiceClick(lx, ly); return; }   // F2：访客需求选项面板优先消费点击
  if (game.travel) {                                                      // F16：游历弹窗优先消费点击；游历中忽略一切点击
    if (game.travel.phase === "setup") handleTravelSetupClick(lx, ly);
    return;
  }
  // 设置弹窗优先消费点击（遮罩外侧 / ✕ / 存档/读档/速度）
  if (game.settingsOpen) { handleSettingsPanelClick(lx, ly); return; }
  if (game.inDialogue) {
    // 家园中若点击命中家具（如夜晚点窗开星图），优先执行交互而非推进对话，
    // 否则自动模式下对话常驻时，点窗会被当成「推进对话」而永远打不开星图。
    if (game.scene === "home") {
      const p = hitHomePoint(lx, ly);
      if (p && p.f && p.f.onTap && p.f.onTap !== "outing") { handleHomePoint(p); return; }
    }
    advanceDialogue(); return;
  }
  if (game.panel) {
    // 先记录可能的拖动，松手时再判定是「点击」还是「滚动拖动」
    panelDrag.active = true; panelDrag.moved = false;
    panelDrag.startY = ly; panelDrag.startScroll = game.panelScroll || 0;
    return;
  }
  // F15：模式徽标切换——必须早于 registerInput。否则 registerInput 的「自动→手动」副作用会先翻转模式，
  //      导致 toggleControlMode 把已变 manual 的状态又切回 auto（表现：点徽标永远停在自动、切不回手动）
  if (hitModeBadge(lx, ly)) { toggleControlMode(); return; }
  registerInput();   // F15：其余点击都是操作 → 刷新闲置计时 / 自动回手动
  if (game.scene === "outing") {
    if (game.ended) { location.reload(); return; }
    startFreeMove(e); return;   // 自由滑动/点击移动（替代固定摇杆）
  }
  if (game.scene === "home") {
    // 点击顶栏双姝血卡切换主控角色
    const sid = hitHomeSisterCard(lx, ly);
    if (sid && sid !== activeId) { switchHomeActive(); return; }
    // 设置按钮（阎明信息下方齿轮）→ 打开设置弹窗
    if (hitSettingsBtn(lx, ly)) { toggleSettings(); return; }
  }
  const b = hitHomeBar(lx, ly);
  if (b) { handleHomeBar(b); return; }
  if (hitVisitor(lx, ly)) { talkToVisitor(); return; }   // 点击访客 → 主动开启对话（F8 交互式访客）
  const p = hitHomePoint(lx, ly);
  if (p) { handleHomePoint(p); return; }
  const sid = hitHomeSister(lx, ly);
  if (sid) { cycleOutfit(sid); return; }   // 点击主界面角色（未命中家具/访客）→ 循环切换皮肤（F14-lite）
  startFreeMove(e);   // 空白地面：按下=浮空摇杆原点，拖动=方向，轻点=走到落点
});
// 面板内拖动滚动（滚轮 / 指针拖动）
canvas.addEventListener("pointermove", (e) => {
  const p = pointerToLogical(e);
  game._ptr = { x: p.lx, y: p.ly };   // 实时记录指针逻辑坐标，供浮层（如论学选项）悬停高亮使用
  if (freeId !== null) { moveFree(e); return; }   // 自由移动手势优先
  if (!panelDrag.active || !game.panel) return;
  const dy = p.ly - panelDrag.startY;
  if (Math.abs(dy) > 6) panelDrag.moved = true;
  if (panelDrag.moved) game.panelScroll = Math.max(0, panelDrag.startScroll - dy);
});
canvas.addEventListener("pointerup", (e) => {
  if (freeId !== null) { endFree(e); return; }   // 自由移动手势收尾（轻点=走到落点）
  const p = pointerToLogical(e);
  if (game.mini) { handleMiniUp(p.lx, p.ly); return; }   // 家园小游戏：pointerup 路由（破阵翻格）
  if (game.panel && panelDrag.active) {
    const wasDrag = panelDrag.moved;
    panelDrag.active = false;
    if (wasDrag && (game._panelMaxScroll || 0) > 1) return;  // 可滚动：拖动不关闭面板
    const b = hitHomeBar(p.lx, p.ly);
    if (b) { handleHomeBar(b); return; }
    if (handlePanelClick(p.lx, p.ly)) return;
    // 点空白关闭面板（观星闪动为动画层问题，与空白点击无关，故不在此排除）
    closePanel(); return;
  }
  panelDrag.active = false;
});
canvas.addEventListener("pointercancel", (e) => { if (freeId !== null) endFree(e); });
window.addEventListener("wheel", (e) => {
  if (game.visitorChoice && game.visitorChoice.step === "gift") {
    game.visitorChoice.scroll = Math.max(0, (game.visitorChoice.scroll || 0) + e.deltaY * 0.5);
    if (e.cancelable) e.preventDefault();
  } else if (game.panel && (game._panelMaxScroll || 0) > 1) {
    game.panelScroll = Math.max(0, Math.min(game._panelMaxScroll, (game.panelScroll || 0) + e.deltaY * 0.5));
    if (e.cancelable) e.preventDefault();
  }
}, { passive: false });

/* ---------- 默认加载界面 / 书籍分步异步加载 ---------- */
// 隐藏 HTML 加载界面（铺陈画卷 → 开始界面）。幂等；测试环境无 classList 时安全跳过。
function hideLoader() {
  if (typeof document === "undefined" || !document.getElementById) return;
  const el = document.getElementById("loader");
  if (!el || !el.classList || el.classList.contains("hidden")) return;
  el.classList.add("hide");
  if (typeof setTimeout === "function") setTimeout(() => { if (el && el.classList) el.classList.add("hidden"); }, 520);
}
// 加载进度（供 index.html 加载层渲染真实进度墨线）：图片分片 + 开始界面就绪 加权。
// 方案C：书籍改「目录常驻(config_bundle) + 每书懒加载」，不再计入首屏进度（书文分片按需拉取）。
let _imgTotal = 0, _imgLoaded = 0;
function updateLoadProgress() {
  let p = 0;
  if (_imgTotal) p += (_imgLoaded / _imgTotal) * 0.70;   // 图片分片 ~70%
  if (typeof titleScreenReady === "function" && titleScreenReady()) p += 0.30; // 开始界面关键图就绪 ~30%
  if (p < 0.02) p = 0.02;                                // 至少可见「起步」进度
  if (p > 1) p = 1;
  if (typeof window !== "undefined") window.__YLT_LOAD_PROGRESS = p;
}
// 方案C · 书籍正文懒加载：书架/目录只需常驻的 bookToc（在 config_bundle 内，boot 前就绪）；
// 正文按书 fetch —— 打开书 / 玩家得章 时才动态注入该书正文分片 config/16_booktext/<id>_N.js 并缓存。
// game.books[id] 记录「已获得章节」；不再有「藏书整理中」全量门禁，书架即时可用。
let _bookState = {};   // id -> "loading" | "done"
function isBookLoaded(id) {
  const b = (GAME_CONFIG.books || []).find((x) => x.id === id);
  if (b && b.chapters && b.chapters.length) return true;    // 内联书（短篇）或已注入 → 就绪
  const files = (GAME_CONFIG.bookFiles || {})[id];
  if (!files || !files.length) return true;                 // 无正文分片（内联/无正文）→ 视为就绪
  return _bookState[id] === "done";
}
function ensureBook(id, cb) {
  if (!id) { if (cb) cb(); return; }
  if (isBookLoaded(id)) { _bookState[id] = "done"; if (cb) cb(); return; }
  if (_bookState[id] === "loading") return;                 // 已在加载，避免重复注入
  const files = (GAME_CONFIG.bookFiles || {})[id] || [];
  if (!files.length) { _bookState[id] = "done"; if (cb) cb(); return; }
  if (typeof document === "undefined" || !document.createElement || !document.body) {
    _bookState[id] = "done"; if (cb) cb(); return;          // 无 DOM（无头测试：分片已由测试台直接注入）
  }
  _bookState[id] = "loading";
  let pending = files.length;
  const done = () => { pending--; if (pending <= 0) { _bookState[id] = "done"; if (cb) cb(); } };
  for (const fn of files) {
    const s = document.createElement("script");
    s.src = "config/16_booktext/" + fn;
    s.async = true; s.onload = done; s.onerror = done;      // 失败也 done：该书正文读不到，仍有目录兜底
    document.body.appendChild(s);
  }
}
// 预热：把玩家「已获得」的书后台按书拉取正文（新档几乎无书 → 近 0 开销）。由书架首次打开时触发。
function prewarmOwnedBooks() {
  const owned = (game.books && Object.keys(game.books)) || [];
  for (const id of owned) ensureBook(id);
}

// 图片分片（config/05_imagedata_*.js）首屏后异步加载，不阻塞引擎启动（绕开 863KB 阻塞解析 → 开屏更快）。
// 数量由 index.html 注入的 window.__IMG_SLICE_COUNT 给出；全部就绪后调用 bootstrapImages() 预载可视图片。
function loadImageSlicesAsync() {
  const n = (window.__IMG_SLICE_COUNT) || 0;
  _imgTotal = n; _imgLoaded = 0;
  if (typeof document === "undefined" || !document.createElement || !document.body) { _imgLoaded = n; updateLoadProgress(); bootstrapImages(); return; }
  if (!n) { _imgLoaded = n; updateLoadProgress(); bootstrapImages(); return; }   // 无图片分片（极端）→ 直接预载（全回退程序图）
  let pending = n;
  const done = () => { pending--; _imgLoaded++; if (pending <= 0) bootstrapImages(); updateLoadProgress(); };
  for (let i = 1; i <= n; i++) {
    const s = document.createElement("script");
    s.src = "config/05_imagedata_" + i + ".js";
    s.async = true; s.onload = done; s.onerror = done;   // 失败也触发 done → 仍预载（缺失图走回退）
    document.body.appendChild(s);
  }
  updateLoadProgress();
  // 兜底：个别分片在网关下挂死时，8s 后强制预载，避免加载界面/图片永不就绪
  if (typeof setTimeout === "function") setTimeout(() => { if (pending > 0) { pending = 0; _imgLoaded = n; updateLoadProgress(); bootstrapImages(); } }, 8000);
}
// 图片分片就绪后触发：角色皮肤/立绘预载 + 家具/背景登记 + 标题图登记，并各自计入门控。
// 必须在分片之后调用：resolveImg 取的是 data URI，分片未到则拿不到图。
function bootstrapImages() {
  if (typeof Image === "undefined") return;
  preloadSisterImages();      // core.js：全部角色皮肤/立绘预载（计入 game 门控）
  applyFurnitureImages();     // scenes.js：家具 PNG + 家园背景登记（home_bg 计双门控，家具计 game 门控）
  if (titleImg === null) {    // 标题图：仅开始界面需要，计入 title 门控
    titleImg = new Image();
    titlePendInc();
    titleImg.onload = () => { titlePendDec(); };
    titleImg.onerror = () => { titlePendDec(); };
    titleImg.src = resolveImg("image/title.png");
  }
}
// 进入游戏门控：点「开始」时若家园/家具/立绘未就绪，延迟到就绪（或 8s 兜底）再真正进入，
// 避免「进游戏后图没加载好」。已登记延迟时标题界面显示「家园整理中…」。
function enterGame(startCb) {
  if (gameReady() || (performance.now() - game._bootStart > 8000)) { startCb(); game.showTitle = false; game._pendingEnter = null; }
  else { game._pendingEnter = startCb; game._pendingAt = performance.now(); }   // 记录登记时刻，供「家园整理中」toast 淡入计时
}

/* ---------- 启动 ---------- */
initSlots();                  // 读取 3 槽 meta（不载入玩法数据，待用户在标题界面选择）
game.scene = "home"; game.state = "home";
game.randomTimer = (C.home && C.home.random) ? (C.home.random.tickMin + Math.random() * (C.home.random.tickMax - C.home.random.tickMin)) : 8;
game.visitorSpawnTimer = 8;    // F8：距首位访客登场秒数（当日访客由 advanceDay / 首帧统一 roll；真实时间推进
returnHome();
game.titleState = "menu"; game.titleIntent = null;   // 标题界面：先显主菜单
game.showTitle = true;        // 启动先显标题（点选后进入游戏）
game._bootStart = performance.now();   // 加载界面 / 进入游戏 兜底计时起点
game._bootDone = false;
game._pendingEnter = null;
game._pendingAt = 0;   // 「家园整理中」toast 淡入计时基准（enterGame 登记时写入）
syncControls();
// 图片分片(config/05_imagedata_*) 改为首屏后异步加载（与书文分片同策略），不阻塞引擎启动；
// 分片就绪后由 bootstrapImages() 触发角色/家具/标题图预载并登记门控。
loadImageSlicesAsync();
// 方案C：书籍不再首屏全量加载。目录索引(bookToc/bookFiles)已在 config_bundle 内常驻；
// 正文由 ensureBook(id) 在打开书 / 得章时按书懒加载（书架首次打开会预热已获得的书）。
if (typeof setTimeout === "function") setTimeout(hideLoader, 8000);   // 兜底：极端情况下（关键脚本失败）也不卡在加载界面

game._dbg = {
  sisters, TILE, COLS, ROWS,
  get enemies() { return enemies; },
  get herbs() { return herbs; },
  get home() { return home; },
  get start() { return start; },
  get activeId() { return activeId; },
  activeSister: () => active(),
  get affinity() { return game.affinity; },
  get homeDone() { return game.homeDone; },
  get scene() { return game.scene; },
  enterHome: returnHome, restart: launchOuting, win: () => endGame(true),
  homeInteractions: () => C.homeInteractions,
  homeState: () => ({ scene: game.scene, panel: game.panel, randomTimer: game.randomTimer }),
  diary: () => game.diary,
  codex: () => game.codex,
  books: () => game.books,
  decor: () => game.decor,
  flowers: () => game.flowers,
  visitors: () => game.visitorsSeen,
  inventory: () => game.inventory,
  openPanel: (n) => openPanel(n),
  closePanel: () => closePanel(),
  waterFlower: (id) => waterFlower(id),
  interactFlower: (id) => interactFlower(id),
  painting: () => game.painting,
  paintOneCell: () => paintRandomCell(),
  homeCamX: () => homeCamX,
  furniture: () => (C.furniture || []),
  triggerVisitor: () => { rollDailyVisitors(); game.visitorQueueIdx = 0; game.visitor = null; game.visitorSpawnTimer = 0; },
  rollVisitors: () => rollDailyVisitors(),
  // F8 测试钩子：强制指定访客（可选指定事件 id）立刻登场并直接对话（调试用，等同「点击」），
  // 真实玩法需玩家主动点击访客才开启事件。
  forceVisitor: (id, evId) => {
    const vd = (C.visitors || []).find((v) => v.id === id); if (!vd) return;
    game._forceEvent = evId ? (C.visitorEvents || []).find((e) => e.id === evId) : null;
    game.todayVisitors = [{ def: vd, events: vd.events || [] }];
    game.visitorQueueIdx = 0; game.visitor = null; game.visitorSpawnTimer = 0; game.dayVisitorsRolled = true;
    spawnVisitor({ def: vd, events: vd.events || [] });
    if (game.visitor) { game.visitor.talked = true; executeVisitorEvent(game.visitor.event, game.visitor); }
  },
  // F8 测试钩子：仅让访客登场（空闲站立，不对话），用于验证「需点击才对话」
  spawnIdleVisitor: (id, evId) => {
    const vd = (C.visitors || []).find((v) => v.id === id); if (!vd) return;
    game._forceEvent = evId ? (C.visitorEvents || []).find((e) => e.id === evId) : null;
    game.todayVisitors = [{ def: vd, events: vd.events || [] }];
    game.visitorQueueIdx = 0; game.visitor = null; game.visitorSpawnTimer = 0; game.dayVisitorsRolled = true;
    spawnVisitor({ def: vd, events: vd.events || [] });
  },
  // F2/F3 测试钩子：访客需求选项面板
  openVisitorChoice: () => { if (game.visitor) openVisitorChoice(game.visitor, game.visitor.event); },
  visitorChoice: () => game.visitorChoice,
  visitorChoiceHits: () => visitorChoiceHits,
  openGiftStep: () => { if (game.visitorChoice) game.visitorChoice.step = "gift"; },
  giftVisitor: (id) => visitorGift(id),
  declineVisitor: () => visitorDecline(),
  rethinkVisitor: () => visitorRethink(),
  visitorState: () => game.visitor ? game.visitor.state : null,
  visitorWaitMs: () => game.visitor ? game.visitor.waitMs : null,
  setVisitorWaitMs: (ms) => { if (game.visitor) game.visitor.waitMs = ms; },
  gainBookChapter: (id, n) => gainBookChapter(id, n),
  gainRandomBookChapter: () => gainRandomBookChapter(),
  forceRandom: () => { game.randomTimer = 0; updateRandomInteractions(0.001); },
  forcePoem: () => { if (!game.poem) startPoem(); },   // F9 调试：立即开启一次对诗浮层
  poemClick: (lx, ly) => handlePoemClick(lx, ly),     // F9：对诗浮层点击（测试用，等价于主循环 pointerdown 分发）
  poemHits: () => poemHits,                             // F9：当前选项命中区（测试断言用）
  updateRandom: (dt) => updateRandomInteractions(dt),  // F9：推进随机互动（测试每日一次守卫用）
  launchOuting: (i) => launchOuting(i),
  returnHome: () => returnHome(),
  maps: () => parsedMaps.map((pm, i) => ({ index: i, id: (pm.def && pm.def.id) || "m" + i, name: (pm.def && pm.def.name) || "地图" + i, herbs: pm.herbs.map((h) => h.id) })),
  day: () => game.day,
  advanceDay: () => (typeof advanceDay === "function" ? advanceDay() : null),
  sleep: () => (typeof startSleep === "function" ? startSleep() : null),
  clock: () => game.clock,
  // F15 操作模式 / 一日结束 调试钩子
  mode: () => game.controlMode,
  setMode: (m) => setControlMode(m),
  toggleMode: () => toggleControlMode(),
  idleToAutoSec: () => ((window.GAME_CONFIG && window.GAME_CONFIG.mode && window.GAME_CONFIG.mode.idleToAutoSec) || 60),
  // F16 游历调试钩子
  openTravelSetup: () => openTravelSetup(),
  closeTravelSetup: () => closeTravelSetup(),
  confirmTravel: () => confirmTravel(),
  forceTravel: (min) => { openTravelSetup(); if (game.travel) { game.travel.selectedMin = min || 30; confirmTravel(); } },
  finalizeTravel: () => finalizeTravel(),
  travelState: () => game.travel,
  travelHits: () => travelHits,
  // F8 双气泡调试钩子
  checkShichenBubble: () => checkShichenBubble(),   // 模拟“进入新时辰”检测（依赖当前 clock 与 _lastChenIdx）
  triggerBubble: (type, who) => maybeTriggerDoubleBubble(type, who),   // 强制触发（确定性测试用）
  bubbleState: () => game.bubble ? {
    type: game.bubble.type, first: game.bubble.first, t0: game.bubble.t0,
    dur: game.bubble.dur, secondDelay: game.bubble.secondDelay,
    expireAt: game.bubble.t0 + game.bubble.secondDelay + game.bubble.dur,
  } : null,
  clearBubble: () => { game.bubble = null; },
  forcedRest: () => game.forcedRest,
  pendingRest: () => game.pendingRest,
  lastInputAt: () => game.lastInputAt,
  forceDayEnd: () => onDayCycleComplete(),
  setLastInputAt: (t) => { game.lastInputAt = t; },
  loadMap: (i) => loadMap(i),
  currentMap: () => currentMapIndex,
  anyHerbCollected: () => parsedMaps.some((pm) => pm.herbs.some((h) => h.collected)),
  setHerbCollected: (idx) => { const h = herbs[idx]; if (h) h.collected = true; },
  setMapHerbCollected: (mapIdx, hIdx) => { const h = parsedMaps[mapIdx] && parsedMaps[mapIdx].herbs[hIdx]; if (h) h.collected = true; },
  craft: (id) => { const r = (C.recipes || []).find((x) => x.id === id); if (r) craftRecipe(r); },
  brewing: () => game.brewing,                       // F1：当前炼制状态（null=空闲）
  finishBrew: () => finishBrew(),                   // F1：调试/测试钩子——立即完成当前炼制
  tickBrew: () => tickBrew(),                       // F1：手动推进一帧炼制判定（测试用）
  gainSpecial: (id) => gainSpecial(id),
  rollSpecial: (s) => rollSpecial(s),
  addInventory: (id, n) => addInventory(id, n),
  isUnlocked: (it) => isUnlocked(it),
  everOwned: () => game.everOwned,
  treeInteract: () => treeInteract(),
  hitHomeSister: (lx, ly) => hitHomeSister(lx, ly),
  hitHomePoint: (lx, ly) => hitHomePoint(lx, ly),
  handleHomePoint: (p) => handleHomePoint(p),
  applyOutfit: (id) => applyOutfit(id),
  cycleOutfit: (id) => cycleOutfit(id),
  outfit: () => game.outfit,
  skinCount: (id) => sisterSkinCount(id),
  currentSkinPath: (id) => { const s = C.sisters[id]; if (!s) return null; const list = (s.skins && s.skins.length) ? s.skins : [{ skin: s.skin, portrait: s.portrait }]; const i = currentOutfitIndex(id); return list[i] ? list[i].skin : null; },
  openChest: () => openChest(),
  gateTile: () => gateTile(),
  checkGatePrompt: () => checkGatePrompt(),
  teleportActive: (x, y) => { const a = active(); a.pos.x = x; a.pos.y = y; },
  save: () => saveGame(game.saveSlot != null ? game.saveSlot : 0),
  load: () => loadGame(game.saveSlot != null ? game.saveSlot : 0),
  reset: () => resetSave(),
  // F6 夜晚点窗观星调试钩子
  isNight: () => isNight(),
  setClock: (c) => { game.clock = c; },
  stars: () => C.stars,
  lastStarDay: () => game.lastStarDay,
  starHighlight: () => game.starHighlight,
  openStarPanel: () => openStarPanel(),
  windowInteract: () => windowInteract(),
};
window.__YLT_LAYOUT = layoutDialogue;
window.__YLT_STATE = game;
if (typeof location !== "undefined" && location.hash === "#preview") launchOuting();
requestAnimationFrame(loop);

