/* 自动生成：config_bundle.js (build_bundle.py) — 请勿手改，改 config/XX.js 后重跑脚本 */
/* ===== config/00_meta.js ===== */
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

/* ===== config/01_characters.js ===== */
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

/* ===== config/02_items.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 02 道具表（药材 + 药品 + 书籍 + 特殊道具）
 * 图鉴/背包/配方均引用本表的 id。后续 M3 会为每项补 type 标签（herb/medicine/book/special）。
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

// 图鉴：游戏中获得即记；id 与 maps[].herbs[].id / recipes[].output 对齐
// F10：每项补 type（herb 草药 / medicine 丹药 / book 书籍 / special 特殊道具），图鉴按类展示
window.YLT_CFG.codex = {
  items: [
    { id:"fenglingcao", name:"风灵草", type:"herb", hue:"#9fcf86", desc:"常见的草药，可以用来练习提取草灵。" },
    { id:"xulingcao",   name:"虚灵草", type:"herb", hue:"#c9d2e8", desc:"容易变质，最好在提取的三日内使用。" },
    { id:"lingxincao",  name:"灵心草", type:"herb", hue:"#f2c9d6", desc:"草灵无需密封保存的好药草。" },
    { id:"qujing",      name:"曲晶",   type:"herb", hue:"#e0a23c", desc:"可用于强化药物或毒物的效果。" },
    { id:"fengyucao",   name:"凤羽草", type:"herb", hue:"#e08ad6", desc:"叶片五彩斑斓，如同凤凰羽毛，因此得名。" },
    { id:"hulingdan",   name:"护灵丹", type:"medicine", desc:"万用的解毒丹。" },
    { id:"ningtiandan", name:"凝天丹", type:"medicine", desc:"可以帮助修炼。" },
    { id:"tianlingdan", name:"天灵丹", type:"medicine", desc:"肉体受伤只要没死，即可瞬间恢复。" },
    { id:"biqidan",     name:"闭气丹", type:"medicine", desc:"服用可暂时获得在水下呼吸的能力。" },
    // 书籍（仅展示书名，不精确到章；正文在 11_books.js；默认已藏，图鉴书籍类拥有≥1章即点亮）
    { id:"b_chu", name:"《楚辞》", type:"book", desc:"屈子行吟，适合灯下共读。" },
    { id:"b_shi", name:"《诗经》", type:"book", desc:"风雅颂间，皆是家常情致。" },
    { id:"b_bencao", name:"《本草纲目》", type:"book", subcat:"本草", desc:"载药 1892 种、方万余，16 部 60 类分类体系，古代本草集大成。" },
    { id:"b_chajing", name:"《茶经》", type:"book", desc:"陆羽煮茗，山居清欢之趣。" },
    { id:"b_zhuang", name:"《庄子》", type:"book", desc:"漆园吏说逍遥，江海之志。" },
    { id:"b_huangdi", name:"《黄帝内经》", type:"book", subcat:"经典", desc:"分《灵枢》《素问》两部，中国最早的医学典籍，中医理论源头。" },
    { id:"b_shanghan", name:"《伤寒论》", type:"book", subcat:"经典", desc:"辨证论治、经方鼻祖，与《金匮要略》本为一书。" },
    { id:"b_shennong", name:"《神农本草经》", type:"book", subcat:"经典", desc:"最早中药学典籍，三品分类。" },
    { id:"b_qianjin", name:"《千金方》", type:"book", subcat:"方剂", desc:"方论巨著，尤重妇科、儿科，人命至重有贵千金。" },
    { id:"b_wenbing", name:"《温病条辨》", type:"book", subcat:"温病", desc:"立三焦辨证，温病学说成熟标志，与伤寒分庭。" },
    { id:"b_maijing", name:"《脉经》", type:"book", subcat:"脉学", desc:"现存最早脉学专著，统二十四脉，确立脉诊规范。" },
    { id:"b_nanjing", name:"《难经》", type:"book", subcat:"经典", desc:"补充《内经》疑难，脉法、脏腑理论。" },
    { id:"b_zhouhou", name:"《肘后备急方》", type:"book", subcat:"方剂", desc:"急救验方手册，简便廉效（载青蒿治疟法）。" },
    { id:"b_shiliao", name:"《食疗本草》", type:"book", subcat:"食疗", desc:"以食为药，养于日常，食疗专著。" },
    // —— 新增医典（按《医学书单整理》补全；subcat 与 11_books.js 对应，供书架右下角子类角标）——
    { id:"b_wenre", name:"《温热论》", type:"book", subcat:"温病", desc:"创卫气营血辨证，温病辨证纲领。" },
    { id:"b_shire", name:"《湿热病篇》", type:"book", subcat:"温病", desc:"专论湿热病证治。" },
    { id:"b_jiayi", name:"《针灸甲乙经》", type:"book", subcat:"针灸", desc:"现存最早针灸专著，统合《素问》《针经》《明堂》孔穴。" },
    { id:"b_zhenjiu", name:"《针灸大成》", type:"book", subcat:"针灸", desc:"集明以前针灸大成，临床实用性强。" },
    { id:"b_binhu", name:"《濒湖脉学》", type:"book", subcat:"脉学", desc:"以二十七脉歌诀形式普及脉学。" },
    { id:"b_bcsy", name:"《本草纲目拾遗》", type:"book", subcat:"本草", desc:"补《纲目》未载药七百一十六种。" },
    { id:"b_waitai", name:"《外台秘要》", type:"book", subcat:"方剂", desc:"辑唐以前方书，保存大量散佚文献。" },
    { id:"b_hejiju", name:"《太平惠民和剂局方》", type:"book", subcat:"方剂", desc:"世界最早成药规范（制剂手册），影响深远。" },
    { id:"b_puji", name:"《普济方》", type:"book", subcat:"方剂", desc:"古代最大方书，载方逾六万。" },
    { id:"b_yifang", name:"《医方集解》", type:"book", subcat:"方剂", desc:"按功效分类方剂的入门读本。" },
    { id:"b_shenghui", name:"《太平圣惠方》", type:"book", subcat:"方剂", desc:"大型官修方书。" },
    { id:"b_zhubing", name:"《诸病源候论》", type:"book", subcat:"内科", desc:"现存最早病因证候学专著，论病源与证候（无方）。" },
    { id:"b_piwei", name:"《脾胃论》", type:"book", subcat:"内科", desc:"补土派代表，重脾胃升阳。" },
    { id:"b_sanyin", name:"《三因极一病证方论》", type:"book", subcat:"内科", desc:"创病因三因学说。" },
    { id:"b_jingyue", name:"《景岳全书》", type:"book", subcat:"内科", desc:"温补学派，阴阳互济。" },
    { id:"b_yizong", name:"《医宗必读》", type:"book", subcat:"内科", desc:"入门兼临证。" },
    { id:"b_fuqing", name:"《傅青主女科》", type:"book", subcat:"妇科", desc:"妇科名作，重调经、带下、妊娠。" },
    { id:"b_nvkejl", name:"《女科经纶》", type:"book", subcat:"妇科", desc:"妇科证治汇编。" },
    { id:"b_jingxiao", name:"《经效产宝》", type:"book", subcat:"妇科", desc:"现存最早妇产科专书。" },
    { id:"b_furen", name:"《妇人大全良方》", type:"book", subcat:"妇科", desc:"妇产科集大成。" },
    { id:"b_xiaoer", name:"《小儿药证直诀》", type:"book", subcat:"儿科", desc:"儿科辨证奠基，钱乙被誉为儿科之圣。" },
    { id:"b_youyou", name:"《幼幼集成》", type:"book", subcat:"儿科", desc:"儿科集成。" },
    { id:"b_liujuanzi", name:"《刘涓子鬼遗方》", type:"book", subcat:"外科", desc:"现存最早外科专著。" },
    { id:"b_xianshou", name:"《仙授理伤续断秘方》", type:"book", subcat:"骨伤", desc:"现存最早骨伤科专书。" },
    { id:"b_waik", name:"《外科正宗》", type:"book", subcat:"外科", desc:"外科临床经典，列证示方。" },
    { id:"b_yinshan", name:"《饮膳正要》", type:"book", subcat:"食疗", desc:"宫廷营养学、食疗，兼蒙医元素。" },
    { id:"b_linzheng", name:"《临证指南医案》", type:"book", subcat:"医案", desc:"叶氏临证实录。" },
    { id:"b_zhongxi", name:"《医学衷中参西录》", type:"book", subcat:"医案", desc:"兼汇通中西，近代临床名著。" },
    { id:"b_yixueyuanliu", name:"《医学源流论》", type:"book", subcat:"医理", desc:"医学理论批判与源流考辨。" },
    { id:"b_jinbo", name:"《金波旬花》", type:"book", desc:"你可记得昆仑雪峰下那片金色花海。" },
    { id:"b_liangshi", name:"《两时花》", type:"book", desc:"如果清凝先遇到明王。" },
    { id:"b_pincou", name: "《拼凑月亮》", type:"book", desc: "她将一片一片地将这破碎的绚丽灵魂拼好，让李清凝无拘无束地重回世间。",},
    { id:"b_shanhaij", name:"《山海经》", type:"book", desc:"上古山川博物之志，载异兽神祇、远方国族。" },
    { id:"b_butian", name:"《丹元子步天歌》", type:"book", desc:"唐·王希明（号丹元子）撰，七言韵文，首将全天星官分归三垣二十八宿，古代观象识星总纲。" },
    // 杂览新书（清玩·笔记·技术，id 对齐 11_books.js）
    { id:"b_pingshi", name:"《瓶史》", type:"book", desc:"明·袁宏道撰，瓶花清供之谱，论瓶花之宜、忌、法，列可瓶之花目。" },
    { id:"b_jiupu", name:"《酒谱》", type:"book", desc:"宋·窦苹撰，辑酒之源流、名品、故事、功戒、饮器、酒令，酒文化小百科。" },
    { id:"b_xiangpu", name:"《香谱》", type:"book", desc:"宋·陈敬撰，分香之品、香之异、香之事、香之法四卷，清玩香事总汇。" },
    { id:"b_daode", name:"《道德经》", type:"book", desc:"春秋·老聃撰，五千言分道经、德经八十一章，道家根本经典。" },
    { id:"b_huajing", name:"《花镜》", type:"book", desc:"清·陈淏子撰，园圃栽植专著，课花十八法、花木藤草卉木分考，清玩园艺百科。" },
    { id:"b_guangqunfang", name:"《广群芳谱》", type:"book", desc:"清·刘灏等奉敕撰，御定百卷，分天时、谷、桑麻、蔬、茶、花、果、木、竹、卉、药诸谱。" },
    { id:"b_suiyuanshidan", name:"《随园食单》", type:"book", desc:"清·袁枚撰，饮食论著，须知、戒单，分海鲜江鲜特牲羽族水族素小点饭粥茶酒。" },
    { id:"b_xuxiake", name:"《徐霞客游记》", type:"book", desc:"明·徐宏祖撰，三十余年遍历名山大川之旅行日记，地理水文岩溶实录。" },
    { id:"b_shishuo", name:"《世说新语》", type:"book", desc:"南朝宋·刘义庆撰，记汉末至东晋士人言行，分三十六门，魏晋风度之渊薮。" },
    { id:"b_dongjing", name:"《东京梦华录》", type:"book", desc:"宋·孟元老撰，追忆北宋汴京城市风貌、市井百业、节令游观。" },
    { id:"b_wulin", name:"《武林旧事》", type:"book", desc:"宋·周密撰，记南宋临安（杭州）湖山胜概、节庆风物、市井繁华。" },
    { id:"b_mengxi", name:"《梦溪笔谈》", type:"book", desc:"宋·沈括撰，笔记体百科，涵盖天文历法、数理、音律、技艺、药理诸科。" },
    { id:"b_qinshi", name:"《琴史》", type:"book", desc:"宋·朱长文撰，琴人、琴声、琴制、琴曲、琴论，琴学第一部专史。" },
    { id:"b_tiangong", name:"《天工开物》", type:"book", desc:"明·宋应星撰，农耕手工技术百科全书，乃粒乃服彰施陶冶舟车诸卷。" },
    { id:"b_huainan", name:"《淮南子》", type:"book", desc:"汉·刘安及其门客撰，杂采百家、归宗道术，原道俶真览冥，包罗天文地理术数。" },
    { id:"b_shiji", name:"《史记》", type:"book", desc:"汉·司马迁撰，纪传体通史之祖，十二本纪、三十世家、七十列传记三千年。" },
    { id:"b_yunji", name:"《云笈七签》", type:"book", desc:"宋·张君房编，道教类书，集三洞四辅经论，老君垂训、仙真谱系、洞天福地、内修丹法。" },
    // 诗词新书（按作者/朝代辑录，id 对齐 11_books.js）
    { id: "b_poem01", name: "《李白集》", type: "book", desc: "唐·李白 诗词辑录。" },
    { id: "b_poem02", name: "《龚自珍集》", type: "book", desc: "清·龚自珍 诗词辑录。" },
    { id: "b_poem03", name: "《苏轼集》", type: "book", desc: "宋·苏轼 诗词辑录。" },
    { id: "b_poem04", name: "《辛弃疾集》", type: "book", desc: "宋·辛弃疾 诗词辑录。" },
    { id: "b_poem05", name: "《宋诗选》", type: "book", desc: "宋代诗词选辑。" },
    { id: "b_poem06", name: "《唐诗选》", type: "book", desc: "唐代诗词选辑。" },
    { id: "b_poem07", name: "《清诗选》", type: "book", desc: "清代诗词选辑。" },
    { id: "b_poem10", name: "《元曲选》", type: "book", desc: "元代诗词选辑。" },
    { id: "b_poem11", name: "《历代遗珠》", type: "book", desc: "各代诗词选辑。" },
    // 特殊道具（仅点亮图鉴，多途径获取不重复）—— F11
    { id:"yusui",    name:"碧玉笛", type:"special", hue:"#cfe3b0", desc:"一支碧玉琢成的笛，吹来满袖清风。" },
    { id:"qingluan", name:"玉如意", type:"special", hue:"#8fd3d0", desc:"温润的玉如意，握在手中事事顺意。" },
    { id:"hupo",     name:"连理枝", type:"special", hue:"#e0a23c", desc:"两枝交缠的连理木，象征不离不弃。" },
    { id:"shanhe",   name:"同心结", type:"special", hue:"#9fcf86", desc:"红丝挽成的同心结，系着旧年盟誓。" },
    // —— 游历特产（F16 游历奖励池 specialPools.travel）：全国各省代表性特产/物件，每省一件，去重不重复 ——
    { id:"ts_jingtai",  name:"景泰蓝",     type:"special", hue:"#4f86c6", desc:"铜胎掐丝珐琅，宝蓝缀金，宫掖气象。" },
    { id:"ts_yangliu",  name:"年画",       type:"special", hue:"#c0392b", desc:"娃娃抱鲤，喜气盈门。" },
    { id:"ts_tangci",   name:"白瓷",       type:"special", hue:"#e8f0f4", desc:"薄润透光，声如磬鸣。" },
    { id:"ts_chencu",   name:"老陈醋",     type:"special", hue:"#6b3b2a", desc:"夏伏晒冬捞冰，醇厚回甘。" },
    { id:"ts_mengyin",  name:"银饰",       type:"special", hue:"#d8dde3", desc:"錾花银饰，云卷草纹。" },
    { id:"ts_xiuyu",    name:"岫岩玉",     type:"special", hue:"#8fbf9a", desc:"温润含翠，琢为佩玩。" },
    { id:"ts_renshen",  name:"人参",       type:"special", hue:"#ece3cf", desc:"芦碗须芦，补气延龄。" },
    { id:"ts_wuchang",  name:"稻米",       type:"special", hue:"#efe6cf", desc:"粒长油润，炊香满室。" },
    { id:"ts_guxiu",    name:"顾绣",       type:"special", hue:"#7d5a8c", desc:"以针代笔，摹绣名迹。" },
    { id:"ts_suxiu",    name:"苏绣",       type:"special", hue:"#5fae9f", desc:"双面绣花，纤毫毕现。" },
    { id:"ts_longquan", name:"龙泉青瓷",   type:"special", hue:"#9fc4bb", desc:"粉青梅子青，如玉生凉。" },
    { id:"ts_huimo",    name:"徽墨",       type:"special", hue:"#2c2c2c", desc:"松烟入墨，幽香入纸。" },
    { id:"ts_wuyi",     name:"武夷岩茶",   type:"special", hue:"#8a4b2a", desc:"岩骨花香，喉底回甘。" },
    { id:"ts_jingde",   name:"青花瓷",     type:"special", hue:"#dfeaf2", desc:"白地蓝花，瓷都风华。" },
    { id:"ts_fengzheng",name:"风筝",       type:"special", hue:"#d98b3a", desc:"飞燕凌空，一线牵春。" },
    { id:"ts_junci",    name:"钧瓷",       type:"special", hue:"#7e5aa6", desc:"入窑一色，出窑万彩。" },
    { id:"ts_chuqi",    name:"漆器",       type:"special", hue:"#7a2230", desc:"朱黑相彰，云气流转。" },
    { id:"ts_xiangxiu", name:"湘绣",       type:"special", hue:"#c0457a", desc:"虎啸狮颔，活灵活现。" },
    { id:"ts_guangxiu", name:"广绣",       type:"special", hue:"#3f9d6b", desc:"百鸟朝凤，金翠交辉。" },
    { id:"ts_zhuangjin",name:"壮锦",       type:"special", hue:"#b03a5b", desc:"经纬回纹，斑斓如霞。" },
    { id:"ts_lijin",    name:"黎锦",       type:"special", hue:"#c98a3a", desc:"纺、织、染、绣，光辉若云。" },
    { id:"ts_rongchang",name:"荣昌陶",     type:"special", hue:"#9a6b4f", desc:"朱泥素烧，叩之清越。" },
    { id:"ts_shuxiu",   name:"蜀绣",       type:"special", hue:"#6a4c93", desc:"鲤鱼戏莲，晕针铺绒。" },
    { id:"ts_miaoyin",  name:"苗银",       type:"special", hue:"#cfd6dd", desc:"錾花项圈，银浪叠涌。" },
    { id:"ts_bantong",  name:"斑铜",       type:"special", hue:"#b9892f", desc:"金斑隐现，古拙生辉。" },
    { id:"ts_tangka",   name:"唐卡",       type:"special", hue:"#c79a3a", desc:"金线勾佛，庄严静穆。" },
    { id:"ts_pixie",    name:"皮影",       type:"special", hue:"#7a4a2a", desc:"牛皮镂刻，灯下弄影。" },
    { id:"ts_yeguang",  name:"夜光杯",     type:"special", hue:"#3f8f6b", desc:"葡萄美酒夜光杯。" },
    { id:"ts_kunlun",   name:"昆仑玉",     type:"special", hue:"#a9d8d0", desc:"莹白泛青，温润可人。" },
    { id:"ts_helan",    name:"贺兰砚",     type:"special", hue:"#3a6b5a", desc:"绿紫双色交错，宁夏五宝之一。" },
    { id:"ts_hetian",   name:"和田玉",     type:"special", hue:"#e7e0cf", desc:"羊脂凝脂，温润无瑕。" },
    { id:"ts_gangjuan", name:"蛋卷",       type:"special", hue:"#d9a441", desc:"层层卷卷，酥酥脆脆。" },
    { id:"ts_xingren",  name:"杏仁饼",     type:"special", hue:"#e3c98f", desc:"松化甘香，好吃！" },
    { id:"ts_dongding", name:"冻顶乌龙",   type:"special", hue:"#7a8b3a", desc:"落喉甘润，杯底留香。" },
    // —— 鲜花（F7 花草收获；图鉴新增「鲜花」页签；type:"flower"）——
    // 配置步骤：新增一种可收获鲜花 → ① 在此加 { id, name, type:"flower", hue, desc }；
    //           ② 到 config/00_meta.js 的 flowerTypes.flower.list 追加该 id（否则不会被随机种出）；
    //           ③ 在 flowerNames / flowerColors 补中文名与渲染色（缺省有兜底）。
    // 空白示例：
    //   { id:"myflower", name:"我的花", type:"flower", hue:"#ffccdd", desc:"一句话描述。" },
    { id:"lan",      name:"兰花",     type:"flower", hue:"#e8a0b0", desc:"空谷幽兰，清逸自守，不以无人而不芳。" },
    { id:"shaoyao",  name:"芍药",   type:"flower", hue:"#f2b8c6", desc:"殿春之华，有情芍药含春泪。" },
    { id:"mudan",    name:"牡丹",   type:"flower", hue:"#e06a8a", desc:"国色天香，花开时节动京城。" },
    { id:"taohua",   name:"桃花",   type:"flower", hue:"#f3d27a", desc:"桃之夭夭，灼灼其华。" },
    { id:"shancha",  name:"山茶",   type:"flower", hue:"#f0c0d0", desc:"山茶耐冬，芳意长新。" },
    { id:"meihua",   name:"梅花",   type:"flower", hue:"#f0d0d8", desc:"疏影横斜，暗香浮动月黄昏。" },
    { id:"hehua",    name:"荷花",   type:"flower", hue:"#e8c8d0", desc:"出淤泥而不染，濯清涟而不妖。" },
  ],
};

// F11 特殊道具：各途径 5% 概率掉落，已获得（specialOwned）不再掉（不重复）
// 途径键：herb 采药 / enemy 打怪 / tree 大树每日1次(M4接入) / visitor 访客赠礼(M4接入) / chest 宝箱
window.YLT_CFG.specialPools = {
  herb:    ["qingluan", "shanhe"],
  enemy:   ["yusui", "hupo"],
  tree:    ["yusui", "qingluan"],
  visitor: ["hupo", "shanhe"],
  chest:   ["yusui", "hupo", "qingluan", "shanhe"],
  // F16 游历：全国各省代表性特产（去重不重复）；全部获得后不再带回
  travel:  ["ts_jingtai","ts_yangliu","ts_tangci","ts_chencu","ts_mengyin","ts_xiuyu","ts_renshen","ts_wuchang",
            "ts_guxiu","ts_suxiu","ts_longquan","ts_huimo","ts_wuyi","ts_jingde","ts_fengzheng","ts_junci",
            "ts_chuqi","ts_xiangxiu","ts_guangxiu","ts_zhuangjin","ts_lijin","ts_rongchang","ts_shuxiu","ts_miaoyin",
            "ts_bantong","ts_tangka","ts_pixie","ts_yeguang","ts_kunlun","ts_helan","ts_hetian","ts_gangjuan",
            "ts_xingren","ts_dongding"],
};

// F9 阅读系统：书籍配置已拆分至 config/11_books.js（独立维护，便于大量增书）。

// F12 地图宝箱：每次进入地图 5% 概率出现；开启按权重抽奖励
window.YLT_CFG.chest = {
  spawnChance: 0.05,
  weights: { item: 3, special: 1 },   // item=随机草药/丹药入库存；special=随机特殊道具点亮图鉴
};

// ============ 花家具：随机花型池（F5） ============
// 每盆花每天 0 点（advanceDay）按权重随机一种类型：花 75% / 药材 25%。
// 花型决定渲染颜色（flowerColors）与“开花/花苞”形态。
window.YLT_CFG.flowerTypes = {
  flower: { weight: 75, list: ["lan", "shaoyao", "mudan", "taohua", "shancha", "meihua", "hehua"] },   // 花：等概率
  herb:   { weight: 25, list: ["fenglingcao", "xulingcao", "lingxincao", "qujing", "fengyucao"] }, // 药材：等概率
};
// 花型 → 渲染色（程序占位；美术就位后可由 id 映射到 flowers/<id>.png）
window.YLT_CFG.flowerColors = {
  lan: "#e8a0b0", shaoyao: "#f2b8c6", mudan: "#e06a8a", taohua: "#f3d27a", shancha: "#f0c0d0",
  meihua: "#f0d0d8", hehua: "#e8c8d0",
  fenglingcao: "#9fcf86", xulingcao: "#c9d2e8", lingxincao: "#f2c9d6", qujing: "#e0a23c", fengyucao: "#e08ad6",
};
// 花型 → 中文名（浇水/日记/提示使用真实花名，不再泛称“花”）
window.YLT_CFG.flowerNames = {
  lan: "兰", shaoyao: "芍药", mudan: "牡丹", taohua: "桃花", shancha: "山茶",
  meihua: "梅", hehua: "荷",
  fenglingcao: "风灵草", xulingcao: "虚灵草", lingxincao: "灵心草", qujing: "曲晶", fengyucao: "凤羽草",
};

/* ===== config/03_furniture.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 03 家园家具注册表（F3 家具 PNG / 碰撞 / 透明点击的数据源）
 * -------------------------------------------------------------------------
 * 本文件提供两类配置：
 *   1) home         —— 家园运行时/叙事（落点 spawn、随机活动、装修位）。不含家具坐标。
 *   2) furniture[]  —— 家具注册表：每件家具的 坐标 / 类型(kind) / 是否障碍(isObstacle)
 *                      / 碰撞盒(collide) / 可点区(hit) / 点击行为(onTap) / 立绘(img)
 *                      / 对话(lines) / 邻近对话(proximity)。
 *   引擎按 furniture[] 统一渲染、碰撞、点击，删除“硬写坐标”的旧 home.* 家具段。
 *   新增家具 = 在 furniture[] 加一项 + 在 scenes.js 的 drawFurniture 加一个 kind 分支（占位程序图）。
 *   美术就位后只填 img 字段，逻辑零改动。
 *   坐标说明（20 宽地图）：房间 x 1–9，院子 x 11–18，中间 x=10 为墙（门洞 rows7-8）。
 *   家具已按 ≥2 格间距重摆，配合 2× 放大渲染（见 scenes.js drawFurniture）。
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.home = {
  spawn: { x: 4, y: 10 },       // 进入家园两人落点（房间空地；20 宽地图下坐标）
  random: {                      // 随机姐妹活动 ticker（混合式·环境随机）
    tickMin: 6, tickMax: 14,     // 两次活动间隔（秒，随机）
    pool: [
      { id:"tea",      weight:18, who:"either", anim:"tea",
        lines:[{who:"",text:"闲来无事，两人静静倚在一起煮茶闲聊。"}], diary:"两人倚在一起煮茶闲聊。" },
      { id:"wine",     weight:10, who:"shijie", anim:"wine",
        lines:[{who:"阎明",text:"（斟酒推来）新酿的果酒，味道不错。"}], diary:"阎明斟了杯酒，递到李清凝手边。" },
      { id:"brush",    weight:12, who:"shimei", anim:"brush",
        lines:[{who:"李清凝",text:"（以手托腮坐在桌旁）来帮我研墨吧~你爱穿红衣，算不算……红袖添香？嘿嘿。"}], diary:"李清凝临帖，阎明替她研墨。" },
      { id:"paint",    weight:10, who:"shimei", anim:"paint",
        lines:[{who:"",text:"李清凝执笔为阎明描画花钿，阎明含笑看她。。"}], diary:"李清凝为阎明描画花钿。" },
      { id:"read",     weight:12, who:"either", anim:"read",
        lines:[{who:"",text:"两人并肩共读一卷旧书，贴得很近。"}], diary:"并肩共读一卷旧书。" },
      { id:"medicate", weight: 8, who:"shijie", anim:"medicate",
        lines:[{who:"",text:"阎明在制药台前称量药材，清凝去药柜翻找其他要用的草药。"}], diary:"两人一同研制丹药。" },
      { id:"cuddle",   weight:14, who:"either", anim:"cuddle",
        lines:[{who:"",text:"李清凝从身后拥住阎明，下巴抵在她肩头。"}], diary:"李清凝从身后拥住阎明，下巴抵在她肩头。" },
    ],
  },
  decor: {     // 装修：点装修位循环 options[] 即时换肤（地毯）
    slots: [ { id:"d1", x:4, y:12, kind:"rug",
      options:[ {id:"ink", name:"墨纹毯", color:"#3a3027"},
                 {id:"gold",name:"金线毯", color:"#e8c06a"},
                 {id:"jade",name:"碧玉毯", color:"#5ab2a0"},
                 {id:"rose",name:"胭脂毯", color:"#c06070"} ] } ],
  },
};

window.YLT_CFG.furniture = [
  /* —— 中门（装饰，可穿过；横跨门洞 rows7-8，连通左房间与右院子；放大绘制）—— */
  { id:"door", name:"门", kind:"door", x:10, y:7, isObstacle:false, onTap:null,
    collide:null, hit:null },

  /* —— 院门（点击出发去采药）—— */
  { id:"gate", name:"院门", kind:"gate", x:18, y:13, isObstacle:false, onTap:"outing",
    hasPage:true,
    collide:null, hit:{x:0.1,y:0.0,w:0.8,h:1.0},
    lines:[
      {who:"",text:"门外小径弯弯，不知通向何处。"},
      {who:"李清凝",text:"走，出门玩去~"},
    ] },

  /* —— 室内家具（左房间，x 1–9；间距 ≥2 以容纳 2× 放大）—— */
  { id:"window", name:"窗", kind:"window", x:4, y:1, isObstacle:true, onTap:"window",
    collide:{x:0.1,y:0.0,w:0.8,h:0.9}, hit:{x:0.1,y:0.0,w:0.8,h:0.9},
    lines:[
      {who:"",text:"凭窗远眺，山抹微云，清风拂面。"},
      {who:"李清凝",text:"外面飞来几只小鸟呢，嘬嘬嘬~"},
    ],
    proximity:[
      {who:"李清凝",text:"（趴在窗前）今日天色好，该去山上转转。"},
      {who:"阎明",text:"（窗边远眺）天色正好，要出去散步吗？"},
      {who:"",text:"窗棂半开，一缕春光懒懒落在地上。"},
    ] },
  { id:"flower_shelf", name:"兰", kind:"flower", x:8, y:13, isObstacle:true, onTap:"flower",
    collide:{x:0.15,y:0.1,w:0.7,h:0.85}, hit:{x:0.15,y:0.1,w:0.7,h:0.85},
    lines:[{who:"",text:"清凝俯身，仔细地给花草浇水。"}],
    proximity:[
      {who:"李清凝",text:"这株花还是师姐在悬崖峭壁上发现的，香气淡淡的但很好闻，我喜欢~"},
      {who:"阎明",text:"自从发现这株花，你总要去看。下大雨还要担心它被冲走，还好去得及时，就回来了。"},
      {who:"",text:"二人并肩赏花，都不说话，只听檐角风铃声叮叮当当。"},
    ] },
  { id:"medicine", name:"制药台", kind:"medicine", x:4, y:7, isObstacle:true, onTap:"station",
    hasPage:true,
    collide:{x:0.1,y:0.0,w:0.8,h:0.95}, hit:{x:0.1,y:0.0,w:0.8,h:0.95},
    lines:[
      {who:"",text:"阎明拨弄制药台上的药材，一股药香漫开。"},
      {who:"李清凝",text:"（凑近闻）这味药我认得，是安神的。"},
      {who:"阎明",text:"（指了指药碾）今日想炼点什么？"},
    ],
    proximity:[
      {who:"阎明",text:"这药杵用了好多年，木柄都沁了药香，来闻闻？"},
      {who:"李清凝",text:"嗯……师姐方才研磨了虚灵草和凤羽草，对不对？"},
    ] },
  { id:"bookshelf", name:"书架", kind:"bookshelf", x:7, y:4, isObstacle:true, onTap:"bookshelf",
    hasPage:true,
    collide:{x:0.1,y:0.0,w:0.8,h:0.95}, hit:{x:0.1,y:0.0,w:0.8,h:0.95},
    lines:[
      {who:"",text:"阎明站在书架前，伸手抚摸清凝的信匣。"},
      {who:"李清凝",text:"（指尖划过书脊）这一排，都是师姐年轻时读的。"},
      {who:"阎明",text:"（抽出一册）这本批注最多，是你最爱翻的吧？"},
    ],
    proximity:[
      {who:"李清凝",text:"（笑着抚摸书脊）这排医书有好多师姐的批注，读的时候好像两个人在边看边聊天。"},
      {who:"阎明",text:"（轻轻敲清凝）是不是又买了新的话本？都快装不下了。"},
    ] },
  { id:"bed", name:"床榻", kind:"bed", x:2, y:9, isObstacle:true, onTap:"bed",
    collide:{x:0.05,y:0.0,w:0.9,h:0.95}, hit:{x:0.05,y:0.0,w:0.9,h:0.95},
    lines:[
       {who:"李清凝",text:"（滚到阎明怀里）师姐身上暖暖的，嘿嘿。"},
      {who:"阎明",text:"（拢好被角）别笑了，早点睡，明天准备做什么？"},
      {who:"李清凝",text:"明天要和师姐睡懒觉！"},
    ],
    proximity:[
      {who:"李清凝",text:"昨天夜里雨声好大，特别适合睡觉。"},
      {who:"阎明",text:"睡觉不要乱拱，老实些，我看你是故意的。"},
      {who:"",text:"轻纱床幔重重。"},
    ] },
  { id:"cabinet", name:"药柜", kind:"cabinet", x:2, y:4, isObstacle:true, onTap:"cabinet",
    hasPage:true,
    collide:{x:0.1,y:0.0,w:0.8,h:0.95}, hit:{x:0.1,y:0.0,w:0.8,h:0.95},
    lines:[
      {who:"",text:"拉开药柜抽屉，草灵气息扑面。"},
      {who:"阎明",text:"（清点药材）这几味还剩些，够用一阵。"},
      {who:"李清凝",text:"（踮脚）最上面那格我够不着，师姐帮我拿~"},
    ],
    proximity:[
      {who:"阎明",text:"（一番清点检查）有几样草药没了，得去采些新的。"},
      {who:"李清凝",text:"嗯……虚灵草要抓紧时间用掉了，不然药性会流失。"},
    ] },
  { id:"desk", name:"书桌", kind:"desk", x:6, y:10, isObstacle:true, onTap:"desk",
    hasPage:true,
    collide:{x:0.1,y:0.0,w:0.8,h:0.95}, hit:{x:0.1,y:0.0,w:0.8,h:0.95},
    lines:[
      {who:"",text:"书桌摊着半幅未完的画，两人约定好每天画几笔。"},
      {who:"李清凝",text:"（用笔戳戳脸）你看我现在写字是不是又快又好！"},
      {who:"阎明",text:"（笑）是快了，就是墨沾到鼻尖上了。"},
    ],
    proximity:[
      {who:"李清凝",text:"（用笔戳戳脸）你看我现在写字是不是又快又好！"},
      {who:"阎明",text:"（摸摸清凝的头），往后不用写许多信了，我不会让你再被迫离开了。"},
    ] },
  { id:"rug", name:"地毯", kind:"rug", x:4, y:12, isObstacle:false, onTap:"decor", slot:"d1",
    collide:null, hit:{x:0.1,y:0.1,w:0.8,h:0.8} },

  /* —— 院子家具（右院子，x 11–18；间距 ≥2 以容纳 2× 放大）—— */
  /* —— 池塘（地形水，装饰；靠近触发邻近对话，不可点击）—— */
  { id:"pond", name:"曲池", kind:"pond", x:11, y:14, isObstacle:false, onTap:null,
    collide:null, hit:null,
    proximity:[
      {who:"",text:"池面浮着几片荷叶，风过，轻泛涟漪。"},
      {who:"李清凝",text:"（蹲在池边）师姐，你说莲藕什么时候能吃呀！"} ] },
  { id:"tree", name:"大树", kind:"tree", x:13, y:3, isObstacle:true, onTap:"tree",
    collide:{x:0.05,y:0.0,w:0.9,h:0.6}, hit:{x:0.05,y:0.0,w:0.9,h:0.6},
    proximity:[
      {who:"李清凝",text:"（仰头）这树是当年一起种下的，如今都这般高了。"},
      {who:"李清凝",text:"师姐穿白衣坐在树上的时候，好像传说里的仙女一样。"},
    ] },
  { id:"swing", name:"秋千", kind:"swing", x:16, y:3, isObstacle:true, onTap:"swing",
    collide:{x:0.2,y:0.1,w:0.6,h:0.85}, hit:{x:0.2,y:0.1,w:0.6,h:0.85},
    lines:[{who:"",text:"李清凝坐上秋千，阎明在身后轻轻推了一把，于是笑容也荡漾起来。"}],
    proximity:[
      {who:"李清凝",text:"（晃腿）师姐快上来一起荡秋千~"},
      {who:"阎明",text:"（贴着清凝坐在秋千上，伸手揽住她。）"},
    ] },
  { id:"weaponRack", name:"武器架", kind:"weaponRack", x:18, y:5, isObstacle:true, onTap:"weaponRack",
    collide:{x:0.15,y:0.0,w:0.7,h:0.95}, hit:{x:0.15,y:0.0,w:0.7,h:0.95},
    proximity:[
      {who:"阎明",text:"（擦剑）你的剑穗有点脏了，换个新的吗？"},
      {who:"李清凝",text:"师姐！看我新练的剑招！"},
      {who:"李清凝",text:"一剑霜寒十四州！两剑霜寒腊八粥~（馋）小明，我们喝粥吧~"},
    ] },
  { id:"f1", name:"花钵", kind:"flower", x:11, y:5, isObstacle:false, onTap:"flower",
    collide:null, hit:{x:0.1,y:0.2,w:0.8,h:0.8},
    lines:[{who:"",text:"院中一片药田，间或种着几株花草。"}],
    proximity:[
      {who:"李清凝",text:"（蹲下）这盆今早刚浇过，你看它多精神。"},
    ] },
  { id:"f2", name:"花钵", kind:"flower", x:16, y:9, isObstacle:false, onTap:"flower",
    collide:null, hit:{x:0.1,y:0.2,w:0.8,h:0.8},
    lines:[{who:"",text:"行医的人，总要与花草为伴。"}],
    proximity:[
      {who:"阎明",text:"（耐心地检查花草的情况。）"},
    ] },
  { id:"f3", name:"花钵", kind:"flower", x:11, y:11, isObstacle:false, onTap:"flower",
    collide:null, hit:{x:0.1,y:0.2,w:0.8,h:0.8},
    lines:[{who:"",text:"看到一株新开的花，先夸好看，还是先想到它的药性？"}],
    proximity:[
      {who:"李清凝",text:"和师姐一起，真好~"},
    ] },
];

/* ===== config/03_layout.js ===== */
/* 家园家具视觉/位置层 · 由 editor.html 导出。美术终稿同名替换 image/<id>.png 即生效。 */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.layout = {
  "door": {
    "img": "image/door.png",
    "x": 10,
    "y": 9,
    "w": 2.3,
    "h": 6.69,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": 0.35,
      "y": -3.64,
      "w": 0.68,
      "h": 5.45
    }
  },
  "gate": {
    "img": "image/gate.png",
    "x": 19,
    "y": 14,
    "w": 1.15,
    "h": 8.09,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": 0.2,
      "y": -5.94,
      "w": 0.83,
      "h": 7.85
    }
  },
  "window": {
    "img": "image/window.png",
    "x": 7,
    "y": 1,
    "w": 4.45,
    "h": 3.01,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -1.45,
      "y": -0.84,
      "w": 3.98,
      "h": 2.58
    }
  },
  "flower_shelf": {    "x": 5,
    "y": 15,
    "w": 2,
    "h": 3,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.35,
      "y": -2.19,
      "w": 1.77,
      "h": 3.95
    },
    "collide": {
      "x": -0.15,
      "y": -0.66,
      "w": 1.3,
      "h": 1.18
    }
  },
  "medicine": {
    "img": "image/medicine.png",
    "x": 7,
    "y": 4,
    "w": 3.85,
    "h": 3.36,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -1.55,
      "y": -1.01,
      "w": 4.05,
      "h": 2.77
    },
    "collide": {
      "x": -1,
      "y": -0.01,
      "w": 3.87,
      "h": 1.67
    }
  },
  "bookshelf": {
    "img": "image/bookshelf.png",
    "x": 8,
    "y": 13,
    "w": 2.95,
    "h": 4.31,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.75,
      "y": -1.76,
      "w": 2.47,
      "h": 3.52
    },
    "collide": {
      "x": -0.72,
      "y": -1.84,
      "w": 2.55,
      "h": 2.75
    }
  },
  "bed": {
    "img": "image/bed.png",
    "x": 2,
    "y": 4,
    "w": 4.95,
    "h": 5.49,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -1.78,
      "y": -3.09,
      "w": 4.55,
      "h": 4.9
    },
    "collide": {
      "x": -1.78,
      "y": -3.14,
      "w": 4.63,
      "h": 4.27
    }
  },
  "cabinet": {
    "img": "image/cabinet.png",
    "x": 2,
    "y": 14,
    "w": 4.1,
    "h": 3.61,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -1.32,
      "y": -1.31,
      "w": 3.53,
      "h": 3.15
    },
    "collide": {
      "x": -1.4,
      "y": -1.26,
      "w": 3.63,
      "h": 2.4
    }
  },
  "desk": {
    "img": "image/desk.png",
    "x": 4,
    "y": 9,
    "w": 4.5,
    "h": 2.96,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -1.58,
      "y": -0.61,
      "w": 4.18,
      "h": 2.25
    },
    "collide": {
      "x": -1.33,
      "y": 0.24,
      "w": 3.65,
      "h": 1.17
    }
  },
  "rug": {    "x": 2,
    "y": 6,
    "w": 5.4,
    "h": 2.86,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": -1,
    "reach": 1.5,
    "hit": {
      "x": -1.75,
      "y": -0.16,
      "w": 4.63,
      "h": 1.02
    }
  },
  "pond": {
    "img": "image/pond.png",
    "x": 14,
    "y": 14,
    "w": 7.15,
    "h": 5.16,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -2.05,
      "y": -1.16,
      "w": 4.2,
      "h": 2
    },
    "collide": {
      "x": -2.85,
      "y": -2.04,
      "w": 5.67,
      "h": 3.7
    }
  },
  "tree": {
    "img": "image/tree.png",
    "x": 13,
    "y": 4,
    "w": 4.8,
    "h": 6.06,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -1.22,
      "y": -3.64,
      "w": 3.97,
      "h": 4.97
    },
    "collide": {
      "x": -1.67,
      "y": -3.76,
      "w": 4.38,
      "h": 4.45
    }
  },
  "swing": {
    "img": "image/swing.png",
    "x": 17,
    "y": 2,
    "w": 3.75,
    "h": 3.71,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.45,
      "y": -1.54,
      "w": 2.57,
      "h": 3.25
    },
    "collide": {
      "x": -1.13,
      "y": -1.54,
      "w": 3.38,
      "h": 2.15
    }
  },
  "weaponRack": {
    "img": "image/weaponRack.png",
    "x": 18,
    "y": 5,
    "w": 2.75,
    "h": 4.11,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.42,
      "y": -1.06,
      "w": 2.02,
      "h": 2.07
    },
    "collide": {
      "x": -0.45,
      "y": -1.19,
      "w": 2.15,
      "h": 1.92
    }
  },
  "f1": {
    "x": 1,
    "y": 9,
    "w": 2,
    "h": 3,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.3,
      "y": -0.66,
      "w": 1.65,
      "h": 2.38
    },
    "collide": {
      "x": -0.28,
      "y": -0.44,
      "w": 1.28,
      "h": 0.85
    }
  },
  "f2": {
    "x": 14,
    "y": 11,
    "w": 2,
    "h": 3,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.28,
      "y": -0.94,
      "w": 1.75,
      "h": 2.4
    },
    "collide": {
      "x": -0.25,
      "y": -0.69,
      "w": 1.33,
      "h": 1.25
    }
  },
  "f3": {    "x": 18,
    "y": 7,
    "w": 2,
    "h": 3,
    "ax": 0.5,
    "ay": 1,
    "ox": 0,
    "oy": 0,
    "reach": 1.5,
    "hit": {
      "x": -0.17,
      "y": -0.81,
      "w": 1.63,
      "h": 2.57
    },
    "collide": {
      "x": -0.13,
      "y": -0.29,
      "w": 1.33,
      "h": 1.05
    }
  }
};

/* ===== config/04_visitors.js ===== */
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

/* ===== config/05_maps.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 05 外出地图 + 地图剧情
 * 竖屏 9 列 × 16 行，比例 9:16；多图自由选。
 * 字符含义：# 墙  . 草地  ~ 水  T 树  h 药材  E 小妖  H 药庐(回家)  P 出生点
 * 每行 9 字符；缺格自动当墙。每图自带 herbs[]（x,y 须与该图 grid 的 'h' 对齐）。
 * bg = 该图地面/氛围基色（纯装饰）。requiredHerbs 可不填（默认=该图草药数）。
 * 改完刷新即生效。
 * 草药共 5 种（fenglingcao/xulingcao/lingxincao/qujing/fengyucao），每图 3 株、
 * 图内互不重复、跨图复用（三图合计 9 株、去重 5 味）。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.maps = [
  { id:"houshan", name:"后山", desc:"她们经常来山里散步，对每条小路都了如指掌。", bg:"#cfe3c2",
    grid: [
      "#########",
      "#...H...#",   // H 药庐(4,1)
      "#...P...#",   // P 出生（紧贴药庐下方）
      "#.h.....#",   // 风灵草(2,3)
      "#...E...#",
      "#..T.~..#",
      "#....h..#",   // 虚灵草(5,6)
      "#..T.E..#",
      "#...~...#",
      "#...~..E#",
      "#.......#",
      "#......h#",   // 灵心草(7,11)
      "#.......#",
      "#.......#",
      "#.......#",
      "#########",
    ],
    herbs: [
      { id:"fenglingcao", name:"风灵草", x:2, y:3, hue:"#9fcf86", desc:"常见的草药，可以用来练习提取草灵。" },
      { id:"xulingcao",   name:"虚灵草", x:5, y:6, hue:"#c9d2e8", desc:"容易变质，最好在提取的三日内使用。" },
      { id:"lingxincao",  name:"灵心草", x:7, y:11, hue:"#f2c9d6", desc:"草灵无需密封保存的好药草。" },
    ],
    story: {
      intro: [
        { who: "阎明", text: "今日便沿着旧道走一走，你留神脚下。" },
        { who: "李清凝", text: "（深吸一口气）晨间的山气最好闻了。" },
        { who: "", text: "J 出手 · K 为同伴疗伤 · L 合击 · Tab 切换主控角色" },
      ],
      onFirstHerb: [
        { who: "李清凝", text: "太好了，叶尖的露珠还没散呢。" },
      ],
      onReturn: [
        { who: "李清凝", text: "（习惯性握住阎明的手）回家咯。" },
      ],
      onLose: [
        { who: "", text: "后山雾浓了些，这一趟未及走远。" },
      ],
      confirmReturn: "是否返回药庐？",
    },
  },
  { id:"xigu", name:"溪谷", desc:"溪水潺潺，枕石漱流，悠然度日，不知岁月几时。", bg:"#c2dbe3",
    grid: [
      "#########",
      "#.......#",
      "#.H.....#",   // H 药庐(2,2)
      "#.P.....#",   // P 出生（紧贴药庐下方）
      "#...E...#",
      "#.~.h...#",   // 灵心草(4,5)
      "#..T.E..#",
      "#.~.....#",
      "#h..~...#",   // 曲晶(1,8)
      "#...~..E#",
      "#.......#",
      "#.....h.#",   // 凤羽草(6,11)
      "#..T.E..#",
      "#.......#",
      "#.......#",
      "#########",
    ],
    herbs: [
      { id:"lingxincao", name:"灵心草", x:4, y:5, hue:"#f2c9d6", desc:"草灵无需密封保存的好药草。" },
      { id:"qujing",     name:"曲晶",   x:1, y:8, hue:"#e0a23c", desc:"可用于强化药物或毒物的效果。" },
      { id:"fengyucao",  name:"凤羽草", x:6, y:11, hue:"#e08ad6", desc:"叶片五彩斑斓，如同凤凰羽毛，因此得名。" },
    ],
    story: {
      intro: [
        { who: "阎明", text: "（侧耳）溪水比上月浅了些。" },
        { who: "李清凝", text: "哎呀，我们去玩水吧！" },
        { who: "", text: "J 出手 · K 为同伴疗伤 · L 合击 · Tab 切换主控角色" },
      ],
      onFirstHerb: [
        { who: "阎明", text: "溪谷里的灵心草，根须沾着水汽，比别处的更润几分。" },
      ],
      onReturn: [
        { who: "李清凝", text: "（沿溪而行）改天带酒来喝，醉后不知天在水~" },
        { who: "阎明", text: "（浅笑）然后让我背你回去，是不是？" },
      ],
      onLose: [
        { who: "", text: "溪谷的薄雾忽然浓了，迷失了归路。且寻一处岩石歇歇，雾散再走不迟。" },
      ],
      confirmReturn: "是否返回药庐？",
    },
  },
  { id:"yapan", name:"崖畔", desc:"两人喜欢来此看日出和夕阳。", bg:"#ecd9c2",
    grid: [
      "#########",
      "#.......#",
      "#.....H.#",   // H 药庐(6,2)
      "#.....P.#",   // P 出生（紧贴药庐下方）
      "#...E...#",
      "#h......#",   // 虚灵草(1,5)
      "#..T.E..#",
      "#.......#",
      "#...~..h#",   // 曲晶(7,8)
      "#...~..E#",
      "#.......#",
      "#..h....#",   // 凤羽草(3,11)
      "#.......#",
      "#.......#",
      "#.......#",
      "#########",
    ],
    herbs: [
      { id:"fengyucao",  name:"凤羽草", x:3, y:11, hue:"#e08ad6", desc:"叶片五彩斑斓，如同凤凰羽毛，因此得名。" },
      { id:"xulingcao",  name:"虚灵草", x:1, y:5,  hue:"#c9d2e8", desc:"容易变质，最好在提取的三日内使用。" },
      { id:"qujing",     name:"曲晶",   x:7, y:8,  hue:"#e0a23c", desc:"可用于强化药物或毒物的效果。" },
    ],
    story: {
      intro: [
        { who: "阎明", text: "崖上风急，跟紧我（伸手）。" },
       { who: "李清凝", text: "（立刻把手搭上去）嘻嘻，想牵师姐的手，就来这里采药。" },
      ],
      onFirstHerb: [
        { who: "阎明", text: "崖畔的草药采着要费些眼力。不过——值得。" },
      ],
      onReturn: [
        { who: "李清凝", text: "师姐师姐，你看那边的云好好看。" },
        { who: "阎明", text: "（顺着清凝的手指望去）确实很美。" },
      ],
      onLose: [
        { who: "", text: "崖上风急，改日再来采齐灵草。" },
      ],
      confirmReturn: "是否返回药庐？",
    },
  },
];

/* ===== config/06_home.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 06 家园场景地图（homeMap，横向 2 屏：左房间 + 右院子）
 * 20 列 × 16 行：最左列(0)与最右列(19)为可行走地（无侧墙），
 * 中间：左 10 列室内(r，含原 col0) + 中 1 列墙(#，仅 rows7-8 留门洞) + 右 9 列院子(.，含原 col19)，
 * 由横向相机滚动。房间与院子被墙分隔，必须经门洞(10,7)(10,8)出入。
 * 字符：# 墙  r 室内地  . 庭院地  ~ 曲池  T 竹(实心)
 * 家具/门/院门由 config/03_furniture.js 的 furniture[] 注册，本图只放结构。
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.homeMap = [
  "r################.",  // 0  最左列(0)与最右列(19)改为可行走地，去除两侧空气墙
  "rrrrrrrrrr#.........",  // 1  房间(0-9) + 墙(10) + 院子(11-18)
  "rrrrrrrrrr#....T....",  // 2  院中竹(15,2)
  "rrrrrrrrrr#.........",  // 3
  "rrrrrrrrrr#......T..",  // 4  院中竹(17,4)
  "rrrrrrrrrr#.........",  // 5
  "rrrrrrrrrr#.........",  // 6
  "rrrrrrrrrr..........",  // 7  ★ 门洞(10,7) 可通行
  "rrrrrrrrrr..........",  // 8  ★ 门洞(10,8) 可通行
  "rrrrrrrrrr#.........",  // 9
  "rrrrrrrrrr#.........",  // 10
  "rrrrrrrrrr#.........",  // 11
  "rrrrrrrrrr#.........",  // 12
  "rrrrrrrrrr#.........",  // 13 院门(18,13) 由家具注册
  "rrrrrrrrrr#~~.......",  // 14 曲池(11-12,14)
  "r################.",  // 15 最左列(0)与最右列(19)可行走地
];

/* ===== config/07_recipes.js ===== */
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
    brewHours: 2,   // 2 时辰 ≈ 1 分钟
    lines:[{who:"",text:"万用的解毒丹。"}] },
  { id:"ningtian", name:"凝天丹", inputs:["lingxincao","xulingcao"], output:"ningtiandan",
    brewHours: 3,
    lines:[{who:"",text:"凝练灵力，有助修炼。"}] },
  { id:"tianling", name:"天灵丹", inputs:["fengyucao","xulingcao"], output:"tianlingdan",
    brewHours: 3,
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

/* ===== config/08_theme.js ===== */
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

/* ===== config/09_mode.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 09 操作模式（F15）
 * 手动 / 自动 操作模式配置：
 *   - default        ：进入游戏默认模式（"manual" | "auto"）
 *   - idleToAutoSec  ：手动模式下，玩家无任何操作持续多少秒后自动切入自动模式
 * 其余规则（任意操作回手动、一日结束差异化处理）见 src 实现。
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};

window.YLT_CFG.mode = {
  default: "manual",
  idleToAutoSec: 60,
};

/* ===== config/10_weather.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 10 天气
 * 每天随机 1 种天气；概率（权重）如下
 * kind 决定渲染氛围：clear 晴 / overcast 阴 / cloudy 多云 / rain 雨(intensity)
 * 改完刷新即生效。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.weather = {
  list: [
    { id: "qing",     name: "晴",   weight: 60, kind: "clear" },
    { id: "yin",      name: "阴",   weight: 10, kind: "overcast" },
    { id: "duoyun",   name: "多云", weight: 15, kind: "cloudy" },
    { id: "weiyu",    name: "微雨", weight: 8,  kind: "rain", intensity: 0.28 },
    { id: "xiaoyu",   name: "小雨", weight: 3,  kind: "rain", intensity: 0.50 },
    { id: "zhongyu",  name: "中雨", weight: 2,  kind: "rain", intensity: 0.78 },
    { id: "dayu",     name: "大雨", weight: 2,  kind: "rain", intensity: 1.00 },
  ],
};

/* ===== config/11_books.js ===== */
/* =========================================================================
 * 《明清日常》配置层 · 11 书籍（F9 阅读系统）
 * 从 02_items.js 拆分独立管理。书籍为分章结构；chapters[] 每章 {n,text}。
 * id 与 02_items.js 图鉴 codex.items 中 type:"book" 项一一对应。
 * cat：medical=医典 / poem=诗文 / misc=杂览 / story=话本。
 * 诗文每章已补篇名《xxx》；朝代合集另补〔作者〕；历代遗珠补〔朝代·作者〕。
 * 数组按朝代时间排序（先秦→…→清→历代→话本）。
 * 改完刷新即生效（纯文本配置，无需重跑脚本）。
 * ========================================================================= */
/* =========================================================================
 * 【配置步骤】新增书籍 / 章节（复制下方空白示例改字段即可）
 *   1) 加书：在 books[] 里新增一项。id 须与 02_items.js 图鉴
 *      codex.items 中 type:"book" 项一一对应（想进图鉴 / 可被赠书则需在此登记）。
 *   2) 填字段：name(书名) / desc(一句话简介) / cat(类别) / author / dynasty(朝代)。
 *        cat 取值：medical=医典、poem=诗文、misc=杂览、story=话本。
 *   3) 加章：chapters[] 每章 { n, text }，n 从 1 递增不重复；
 *        多段正文用 \n 换行；诗文每章补篇名《xxx》，选集补〔作者〕，遗珠补〔朝代·作者〕。
 *   4) 改完刷新即生效；文本里 \n 即为换行，勿用真实换行破坏 JSON 结构。
 *
 * 【空白示例】
 *   { id: "b_new", name: "《新书》", desc: "一句话简介。", cat: "poem",
 *     author: "作者", dynasty: "朝代",
 *     chapters: [
 *       { n: 1, text: "《篇名》\n正文第一行……\n正文第二行……" },
 *       { n: 2, text: "〔作者〕《篇名》\n又一章内容……" },
 *       { n: 3, text: "〔作者〕《篇名》\n又一章内容……" },
 *       { n: 4, text: "〔作者〕《篇名》\n又一章内容……" },
 *       { n: 5, text: "〔作者〕《篇名》\n又一章内容……" },
 *       { n: 6, text: "〔作者〕《篇名》\n又一章内容……" },
 *       { n: 7, text: "〔作者〕《篇名》\n又一章内容……" }
 *     ] },
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.books = [
  { id: "b_daode", name: "《道德经》", desc: "春秋·老聃撰，五千言分道经、德经八十一章，道家根本经典。", cat: "misc", author: "老聃", dynasty: "春秋",
    chapters: [] },
  { id: "b_shi", name: "《诗经》", desc: "所谓伊人，在水一方。", cat: "poem", author: "佚名", dynasty: "先秦",
    chapters: [
      { n: 1, text: "《关雎》\n关关雎鸠，在河之洲。窈窕淑女，君子好逑。\n参差荇菜，左右流之。窈窕淑女，寤寐求之。\n求之不得，寤寐思服。悠哉悠哉，辗转反侧。\n参差荇菜，左右采之。窈窕淑女，琴瑟友之。\n参差荇菜，左右芼之。窈窕淑女，钟鼓乐之。" },
      { n: 2, text: "《蒹葭》\n蒹葭苍苍，白露为霜。所谓伊人，在水一方。\n溯洄从之，道阻且长。溯游从之，宛在水中央。\n蒹葭萋萋，白露未晞。所谓伊人，在水之湄。\n溯洄从之，道阻且跻。溯游从之，宛在水中坻。\n蒹葭采采，白露未已。所谓伊人，在水之涘。" },
      { n: 3, text: "《采薇》\n采薇采薇，薇亦作止。曰归曰归，岁亦莫止。\n靡室靡家，玁狁之故。不遑启居，玁狁之故。\n昔我往矣，杨柳依依。今我来思，雨雪霏霏。\n行道迟迟，载渴载饥。我心伤悲，莫知我哀。\n岂不日戒，玁狁孔棘，我行不来。" },
      { n: 4, text: "《伐檀》\n坎坎伐檀兮，置之河之干兮，河水清且涟猗。\n不稼不穑，胡取禾三百廛兮？\n不狩不猎，胡瞻尔庭有县貆兮？\n彼君子兮，不素餐兮！\n坎坎伐轮兮，置之河之漘兮，河水清且沦猗。" }
    ] },
  { id: "b_huangdi", name: "《黄帝内经》", desc: "分《灵枢》《素问》两部，中国最早的医学典籍，中医理论源头。", cat: "medical", subcat: "经典", author: "黄帝（托名）", dynasty: "先秦",
    chapters: [] },
  { id: "b_shennong", name: "《神农本草经》", desc: "最早中药学典籍，三品分类。", cat: "medical", subcat: "经典", author: "佚名", dynasty: "先秦",
    chapters: [] },
  { id: "b_nanjing", name: "《难经》", desc: "补充《内经》疑难，脉法、脏腑理论。", cat: "medical", subcat: "经典", author: "扁鹊（托名）", dynasty: "先秦",
    chapters: [] },
  { id: "b_shanhaij", name: "《山海经》", desc: "上古社会生活的百科全书。", cat: "misc", author: "佚名", dynasty: "先秦",
    chapters: [] },
  { id: "b_chu", name: "《楚辞》", desc: "屈子行吟。", cat: "poem", author: "屈原", dynasty: "战国",
    chapters: [
      { n: 1, text: "《离骚》\n长太息以掩涕兮，哀民生之多艰。\n余虽好修姱以鞿羁兮，謇朝谇而夕替。\n既替余以蕙纕兮，又申之以揽茝。\n亦余心之所善兮，虽九死其犹未悔。\n怨灵修之浩荡兮，终不察夫民心。" },
      { n: 2, text: "《九歌·湘夫人》\n帝子降兮北渚，目眇眇兮愁予。\n袅袅兮秋风，洞庭波兮木叶下。\n登白薠兮骋望，与佳期兮夕张。\n沅有芷兮澧有兰，思公子兮未敢言。\n荒忽兮远望，观流水兮潺湲。" },
      { n: 3, text: "《天问》\n曰：遂古之初，谁传道之？\n上下未形，何由考之？\n冥昭瞢暗，谁能极之？\n冯翼惟象，何以识之？\n明明暗暗，惟时何为？阴阳三合，何本何化？" },
      { n: 4, text: "《九章·涉江》\n余幼好此奇服兮，年既老而不衰。\n带长铗之陆离兮，冠切云之崔嵬。\n被明月兮佩宝璐，世溷浊而莫余知兮。\n吾方高驰而不顾，驾青虬兮骖白螭。\n登昆仑兮食玉英，与天地兮同寿，与日月兮同光。" }
    ] },
  { id: "b_zhuang", name: "《庄子》", desc: "漆园吏说逍遥，江海之志。", cat: "misc", author: "庄周", dynasty: "战国",
    chapters: [
      { n: 1, text: "北冥有鱼，其名为鲲。鲲之大，不知其几千里也。\n化而为鸟，其名为鹏。鹏之背，不知其几千里也。\n怒而飞，其翼若垂天之云。\n是鸟也，海运则将徙于南冥。南冥者，天池也。\n鹏之徙于南冥也，水击三千里，抟扶摇而上者九万里。" },
      { n: 2, text: "南郭子綦隐机而坐，仰天而嘘，荅焉似丧其耦。\n颜成子游立侍乎前，曰：'何居乎？形固可使如槁木，而心固可使如死灰乎？'\n今者吾丧我，汝知之乎？\n天地与我并生，而万物与我为一。\n既已为一矣，且得有言乎？既已谓之一矣，且得无言乎？" },
      { n: 3, text: "庖丁为文惠君解牛，手之所触，肩之所倚，足之所履，膝之所踦，\n砉然向然，奏刀騞然，莫不中音，合于桑林之舞，乃中经首之会。\n臣之所好者道也，进乎技矣。\n彼节者有间，而刀刃者无厚；以无厚入有间，恢恢乎其于游刃必有余地矣。\n是以十九年而刀刃若新发于硎。" },
      { n: 4, text: "秋水时至，百川灌河，泾流之大，两涘渚崖之间，不辩牛马。\n于是焉河伯欣然自喜，以天下之美为尽在己。\n顺流而东行，至于北海，东面而视，不见水端。\n井蛙不可以语于海者，拘于虚也；夏虫不可以语于冰者，笃于时也。\n今尔出于崖涘，观于大海，乃知尔丑，尔将可与语大理矣。" }
    ] },
  { id: "b_shanghan", name: "《伤寒论》", desc: "辨证论治、经方鼻祖，与《金匮要略》本为一书。", cat: "medical", subcat: "经典", author: "张仲景", dynasty: "汉",
    chapters: [] },
  { id: "b_huainan", name: "《淮南子》", desc: "汉·刘安及其门客撰，杂采百家、归宗道术，原道俶真览冥，包罗天文地理术数。", cat: "misc", author: "刘安", dynasty: "汉",
    chapters: [] },
  { id: "b_shiji", name: "《史记》", desc: "汉·司马迁撰，纪传体通史之祖，十二本纪、三十世家、七十列传记三千年。", cat: "misc", author: "司马迁", dynasty: "汉",
    chapters: [] },
  { id: "b_maijing", name: "《脉经》", desc: "现存最早脉学专著，统二十四脉，确立脉诊规范。", cat: "medical", subcat: "脉学", author: "王叔和", dynasty: "三国",
    chapters: [] },
  { id: "b_zhouhou", name: "《肘后备急方》", desc: "急救验方手册，简便廉效（载青蒿治疟法）。", cat: "medical", subcat: "方剂", author: "葛洪", dynasty: "晋",
    chapters: [] },
  { id: "b_jiayi", name: "《针灸甲乙经》", desc: "现存最早针灸专著，统合《素问》《针经》《明堂》孔穴。", cat: "medical", subcat: "针灸", author: "皇甫谧", dynasty: "西晋",
    chapters: [] },
  { id: "b_liujuanzi", name: "《刘涓子鬼遗方》", desc: "现存最早外科专著。", cat: "medical", subcat: "外科", author: "龚庆宣", dynasty: "晋",
    chapters: [] },
  { id: "b_shishuo", name: "《世说新语》", desc: "南朝宋·刘义庆撰，记汉末至东晋士人言行，分三十六门，魏晋风度之渊薮。", cat: "misc", author: "刘义庆", dynasty: "南朝",
    chapters: [] },
  { id: "b_zhubing", name: "《诸病源候论》", desc: "现存最早病因证候学专著，论病源与证候（无方）。", cat: "medical", subcat: "内科", author: "巢元方", dynasty: "隋",
    chapters: [] },
  { id: "b_chajing", name: "《茶经》", desc: "陆羽煮茗，山居清欢之趣。", cat: "misc", author: "陆羽", dynasty: "唐",
    chapters: [
      { n: 1, text: "一之源\n茶者，南方之嘉木也，一尺二尺，乃至数十尺。其巴山峡川有两人合抱者，伐而掇之，其树如瓜芦，叶如栀子，花如白蔷薇，实如栟榈，蒂如丁香，根如胡桃。\n其字或从草，或从木，或草木并。其名一曰茶，二曰槚，三曰蔎，四曰茗，五曰荈。\n其地，上者生烂石，中者生砾壤，下者生黄土。\n凡艺而不实，植而罕茂，法如种瓜，三岁可采。野者上，园者次；阳崖阴林，紫者上，绿者次；笋者上，牙者次；叶卷上，叶舒次。阴山坡谷者，不堪采掇，性凝滞，结瘕疾。\n茶之为用，味至寒，为饮，最宜精行俭德之人。若热渴、凝闷、脑疼、目涩、四肢乏、百节不舒，聊四五啜，与醍醐、甘露抗衡也。\n采不时，造不精，杂以卉莽，饮之成疾。\n茶为累也，亦犹人参。上者生上党，中者生百济、新罗，下者生高丽。有生泽州、易州、幽州、檀州者，为药无效，况非此者，设服荠苨，使六疾不瘳。知人参为累，则茶累尽矣。" },
      { n: 2, text: "二之具\n籝，一曰篮，一曰笼，一曰筥。以竹织之，受五升，或一斗、二斗、三斗者，茶人负以采茶也。\n灶无用突者，釜用唇口者。\n甑，或木或瓦，匪腰而泥，篮以箅之，篾以系之。始其蒸也，入乎箪，既其熟也，出乎箪。釜涸注于甑中，又以谷木枝三亚者制之，散所蒸牙笋并叶，畏流其膏。\n杵臼，一曰碓，惟恒用者佳。\n规，一曰模，一曰棬。以铁制之，或圆或方或花。\n承，一曰台，一曰砧。以石为之，不然以槐、桑木半埋地中，遣无所摇动。\n襜，一曰衣。以油绢或雨衫单服败者为之，以襜置承上，又以规置襜上，以造茶也。茶成，举而易之。\n芘莉，一曰羸子，一曰篣筤。以二小竹长三赤，躯二赤五寸，柄五寸，以篾织方眼，如圃人土罗，阔二尺，以列茶也。\n棨，一曰锥刀，柄以坚木为之，用穿茶也。\n扑，一曰鞭。以竹为之，穿茶以解茶也。\n焙，凿地深二尺，阔二尺五寸，长一丈，上作短墙，高二尺，泥之。\n贯，削竹为之，长二尺五寸，以贯茶焙之。\n棚，一曰栈，以木构于焙上，编木两层，高一尺，以焙茶也。茶之半干升下棚，全干升上棚。\n穿，江东淮南剖竹为之，巴川峡山纫谷皮为之。江东以一斤为上穿，半斤为中穿，四两五两为小穿。峡中以一百二十斤为上，八十斤为中穿，五十斤为小穿。字旧作钗钏之“钏”，字或作贯串，今则不然。如磨、扇、弹、钻、缝五字，文以平声书之，义以去声呼之，其字以穿名之。\n育，以木制之，以竹编之，以纸糊之，中有隔，上有覆，下有床，旁有门，掩一扇，中置一器，贮煻煨火，令煴煴然，江南梅雨时焚之以火。" },
      { n: 3, text: "三之造\n凡采茶，在二月、三月、四月之间。茶之笋者，生烂石沃土，长四五寸，若薇蕨始抽，凌露采焉。茶之牙者，发于丛薄之上，有三枝、四枝、五枝者，选其中枝颖拔者采焉。其日有雨不采，晴有云不采，晴，采之。蒸之，捣之，拍之，焙之，穿之，封之，茶之干矣。\n茶有千万状，卤莽而言，如胡人靴者，蹙缩然；[原注：京锥文也。]犎牛臆者，廉襜然；[原注：犎，音朋，野牛也。]浮云出山者，轮囷然；轻飙拂水者，涵澹然。有如陶家之子，罗膏土以水澄泚之。谓澄泥也。又如新治地者，遇暴雨流潦之所经；此皆茶之精腴。有如竹箨者，枝干坚实，艰于蒸捣，故其形籭簁然；有如霜荷者，茎叶凋沮，易其状貌，故厥状委悴然；此皆茶之瘠老者也。\n自采至于封，七经目。自胡靴至于霜荷，八等。或以光黑平正言佳者，斯鉴之下也。以皱黄坳垤言佳者，鉴之次也。若皆言佳及皆言不佳者，鉴之上也。何者？出膏者光，含膏者皱，宿制者则黑，日成者则黄；蒸压则平正，纵之则坳垤；此茶与草木叶一也。茶之否臧，存于口决。" },
      { n: 4, text: "四之器\n风炉（灰承）　筥　炭挝　火筴　鍑　交床　夹纸囊　碾拂末　罗　合　则　水方　漉水囊　瓢　竹筴　鹾簋揭　碗　熟　盂　畚　札　涤方　滓方　巾　具列　都篮\n风炉[灰承]\n风炉：风炉，以铜、铁铸之，如古鼎形，厚三分，缘阔九分，令六分虚中，致其杇墁。凡三足，古文书二十一字。一足云：“坎上巽下离于中”；一足云：“体均五行去百疾”；一足云：“圣唐灭胡明年铸”。其三足之间，设三窗。底一窗以为通飙漏烬之所。上并古文书六字，一窗之上书“伊公”二字，一窗之上书“羹陆”二字，一窗之上书“氏茶”二字。所谓“伊公羹，陆氏茶”也。置墆㙞于其内，设三格：其一格有翟焉，翟者，火禽也，画一卦曰离；其一格有彪焉，彪者，风兽也，画一卦曰巽；其一格有鱼焉，鱼者，水虫也，画一卦曰坎。巽主风，离主火，坎主水，风能兴火，火能熟水，故备其三卦焉。其饰，以连葩、垂蔓、曲水、方文之类。其炉，或锻铁为之，或运泥为之。其灰承，作三足，铁柈台之。\n筥：以竹织之，高一尺二寸，径阔七寸。或用藤，作木楦如筥形织之。六出圆眼。其底盖若莉箧口，铄之。\n炭挝：以铁六棱制之。长一尺，锐上丰中。执细头，系一小[钅展],以饰挝也。若今之河陇军人木吾也。或作槌，或作斧，随其便也。\n火筴：一名箸，若常用者，圆直一尺三寸。顶平截，无葱薹句鏁之属。以铁或熟铜制之。\n鍑：以生铁为之。今人有业冶者，所谓急铁，其铁以耕刀之趄炼而铸之。内抹土而外抹沙。土滑于内，易其摩涤；沙涩于外，吸其炎焰。方其耳，以令正也。广其缘，以务远也。长其脐，以守中也。脐长，则沸中；沸中，末易扬，则其味淳也。洪州以瓷为之，莱州以石为之。瓷与石皆雅器也，性非坚实，难可持久。用银为之，至洁，但涉于侈丽。雅则雅矣，洁亦洁矣，若用之恒，而卒归于铁也。\n交床：以十字交之，剜中令虚，以支鍑也。\n夹：以小青竹为之，长一尺二寸。令一寸有节，节以上剖之，以炙茶也。彼竹之筱，津润于火，假其香洁以益茶味。恐非林谷间莫之致。或用精铁、熟铜之类，取其久也。\n纸囊：以剡藤纸白厚者夹缝之，以贮所炙茶，使不泄其香也。\n碾：以桔木为之，次以梨，桑、桐、柘为之。内圆而外方。内圆，备于运行也；外方，制其倾危也。内容堕而外无余木。堕，形如车轮，不辐而轴焉。长九寸，阔一寸七分。堕径三寸八分，中厚一寸，边厚半寸。轴中方而执圆。其拂末，以鸟羽制之。\n罗、合：罗末，以合贮之，以则置合中。用巨竹剖而屈之，以纱绢衣之。其合，以竹节为之，或屈杉以漆之。高三寸，盖一寸，底二寸，口径四寸。\n则：以海贝、蛎蛤之属，或以铜、铁，竹匕、策之类。则者，量也，准也，度也。凡煮水一升，用末方寸匕，若好薄者减之，嗜浓者增之，故云则也。\n水方：以椆榜木、槐、楸、梓等合之，其里井外缝漆之。受一斗。\n漉水囊：若常用者。其格，以生铜铸之，以备水湿无有苔秽、腥涩之意；以熟铜、苔秽；铁，腥涩也。林栖谷隐者，或用之竹木。木与竹非持久涉远之具，故用之生铜，其囊，织青竹以卷之，裁碧缣以缝之，纫翠钿以缀之，又作油绿囊以贮之。圆径五寸，柄一寸五分。\n瓢：一曰牺、杓，剖匏为之，或刊木为之。晋舍人杜毓《荈赋》云：“酌之以瓠”。瓠，瓢也，口阔，胚薄，柄短。永嘉中，余姚人虞洪入瀑布山采茗，遇一道士云：“吾，丹丘子，祈子他日瓯牺之余，乞相遗也。”牺，木杓也。今常用以梨木为之。\n竹筴：或以桃、柳、蒲葵木为之，或以柿心木为之。长一尺，银裹两头。\n鹾簋：以瓷为之，圆径四寸，若合形。或瓶、或罍。贮盐花也。其揭，竹制，长四寸一分，阔九分。揭，策也。\n熟盂：以贮熟水。或瓷、或砂。受二升。\n碗：碗，越州上，鼎州次，婺州次；岳州上，寿州、洪州次。或者以邢州处越州上，殊为不然。若邢瓷类银，越瓷类玉，邢不如越一也；若邢瓷类雪，则越瓷类冰，邢不如越二也；邢瓷白而茶色丹，越瓷青而茶色绿，邢不如越三也。晋杜育《荈赋》所谓：“器择陶拣，出自东瓯。”瓯，越也。瓯，越州上，口唇不卷，底卷而浅，受半升已下。越州瓷、岳瓷皆青，青则益茶。茶作白红之色。邢州瓷白，茶色红；寿州瓷黄，茶色紫；洪州瓷褐，茶色黑；悉不宜茶。。\n畚：以白蒲卷而编之，可贮碗十枚，或用筥。其纸帊以剡纸夹缝令方，亦十之也。\n札：缉栟榈皮，以茱萸木夹而缚之，或截竹束而管之，若巨笔形。\n涤方：以贮涤洗之余。水方，受八升。\n滓方：以集诸滓，制如涤方，受五升。\n巾：以絁布为之。长二尺，作二枚，互用之，以洁诸器。\n具列：具列，或作床，或作架。或纯木、纯竹而制之。或木，或竹，黄黑可扃而漆者。长三尺，阔二尺，高六寸。具列者，悉敛诸器物，悉以陈列也。\n都篮：以悉设诸器而名之，以竹篾，内作三角方眼，外以双蔑阔者经之，以单蔑纤者缚之，递压双经，作方眼，使玲成。高一尺五寸，底阔一尺，高二寸，长二尺四寸，阔二尺。" },
      { n: 5, text: "五之煮\n凡炙茶，慎勿于风烬间炙，熛焰如钻，使凉炎不均。持以逼火，屡其翻正，候炮出培塿状虾背，然后去火五寸。卷而舒，则本其始，又炙之。若火干者，以气熟止；日干者，以柔止。\n其始，若茶之至嫩者，蒸罢热捣，叶烂而芽笋存焉。假以力者，持千钧杵亦不之烂，如漆科珠，壮士接之，不能驻其指。及就，则似无穰骨也。炙之，则其节若倪倪如婴儿之臂耳。既而，承热用纸囊贮之，精华之气无所散越，候寒末之。[原注：末之上者，其屑如细米；末之下者，其屑如菱角。]\n其火，用炭，次用劲薪。[原注：谓桑、槐、桐、枥之类也。]其炭曾经燔炙为膻腻所及，及膏木、败器，不用之。[原注：膏木，谓柏、松、桧也。败器，谓朽废器也。]古人有劳薪之味，信哉！\n其水，用山水上，江水中，井水下。[原注：《荈赋》所谓“水则岷方之注，挹彼清流。”]其山水拣乳泉、石池漫流者上；其瀑涌湍漱，勿食之。久食，令人有颈疾。又水流于山谷者，澄浸不泄，自火天至霜郊以前，或潜龙蓄毒于其间，饮者可决之，以流其恶，使新泉涓涓然，酌之。其江水，取去人远者。井，取汲多者。\n其沸，如鱼目，微有声，为一沸；缘边如涌泉连珠，为二沸；腾波鼓浪，为三沸，已上，水老，不可食也。初沸，则水合量，调之以盐味，谓弃其啜余，[原注：啜，尝也，市税反，又市悦反。]无乃[卤舀][卤监]而钟其一味乎，[原注：[卤舀]，古暂反。[卤监]，吐滥反。无味也。]第二沸，出水一瓢，以竹䇲环激汤心，则量末当中心而下。有顷，势若奔涛溅沫，以所出水止之，而育其华也。\n凡酌至诸碗，令沫饽均。[原注：字书并《本草》：“沫、饽,均茗沫也。”饽蒲笏反。]沫饽，汤之华也。华之薄者曰沫，厚者曰饽，轻细者曰花，花，如枣花漂漂然于环池之上；又如回潭曲渚青萍之始生；又如晴天爽朗，有浮云鳞然。其沫者，若绿钱浮于水湄；又如菊英堕于樽俎之中。饽者，以滓煮之，及沸，则重华累沫，皤皤然若积雪耳。《荈赋》所谓“焕如积雪，烨若春荂，有之。\n第一煮沸水，弃其沫上有水膜如黑云母，饮之则其味不正。其第一者为隽永，[原注：徐县、全县二反。至美者曰隽永。隽，味也。永，长也。史长曰隽永，《汉书》蒯通著《隽永》二十篇也。]或留熟盂以贮之，以备育华救沸之用，诸第一与第二、第三碗次之，第四、第五碗外，非渴甚莫之饮。凡煮水一升，酌分五碗，[原注：碗数少至三，多至五；若人多至十，加两炉。]乘热连饮之。以重浊凝其下，精英浮其上。如冷，则精英随气而竭，饮啜不消亦然矣。\n茶性俭，不宜广，广则其味黯澹。且如一满碗，啜半而味寡，况其广乎！其色缃也，其馨[上必下土右欠] 也，[原注：香至美曰[上必下土右欠]。[上必下土右欠] ，音使。]其味甘，槚 也；不甘而苦，荈 也；啜苦咽甘，茶也。" },
      { n: 6, text: "六之饮\n翼而飞，毛而走，呿而言，此三者俱生于天地间，饮啄以活，饮之时义远矣哉！至若救渴，饮之以浆；蠲忧忿，饮之以酒；荡昏寐，饮之以茶。\n茶之为饮，发乎神农氏，闻于鲁周公，齐有晏婴，汉有杨雄、司马相如，吴有韦曜，晋有刘琨、张载、远祖纳、谢安、左思之徒，皆饮焉。滂时浸俗，盛于国朝，两都并荆俞[原注：俞，当作渝。巴渝也]间，以为比屋之饮。\n饮有粗茶、散茶、末茶、饼茶者。乃斫、乃熬、乃炀、乃舂，贮于瓶缶之中，以汤沃焉，谓之痷茶。或用葱、姜、枣、桔皮、茱萸、薄荷之等，煮之百沸，或扬令滑，或煮去沫，斯沟渠间弃水耳，而习俗不已。\n于戏！天育有万物，皆有至妙，人之所工，但猎浅易。所庇者屋，屋精极；所著者衣，衣精极；所饱者饮食，食与酒皆精极之；[译者注：此处有脱文]茶有九难：一曰造，二曰别，三曰器，四曰火，五曰水，六曰炙，七曰末，八曰煮，九曰饮。阴采夜焙，非造也。嚼味嗅香，非别也。膻鼎腥瓯，非器也。膏薪庖炭，非火也。飞湍壅潦，非水也。外熟内生，非炙也。碧粉缥尘，非末也。操艰搅遽，非煮也。夏兴冬废，非饮也。\n夫珍鲜馥烈者，其碗数三；次之者，碗数五。若座客数至五，行三碗；至七，行五碗；若六人以下，不约碗数，但阙一人而已，其隽永补所阙人。" },
      { n: 7, text: "七之事\n三皇炎帝。神农氏。周鲁周公旦。齐相晏婴。汉仙人丹丘子。黄山君司马文。园令相如。杨执戟雄。吴归命侯。韦太傅弘嗣。晋惠帝。刘司空琨。琨兄子兖州刺史演。张黄门孟阳。傅司隶咸。江洗马统。孙参军楚。左记室太冲。陆吴兴纳。纳兄子会稽内史俶。谢冠军安石。郭弘农璞。桓扬州温。杜舍人毓。武康小山寺释法瑶。沛国夏侯恺。余姚虞洪。北地傅巽。丹阳弘君举。安任育。宣城秦精。敦煌单道开。剡县陈务妻。广陵老姥。河内山谦之。后魏琅琊王肃。宋新安王子鸾。鸾弟豫章王子尚。鲍昭妹令晖。八公山沙门谭济。齐世祖武帝。梁·刘廷尉。陶先生弘景。皇朝徐英公绩。\n《神农·食经》：“茶茗久服，令人有力、悦志”。\n周公《尔雅》：“槚，苦茶。”《广雅》云：“荆巴间采叶作饼，叶老者饼成，以米膏出之，欲煮茗饮，先炙，令赤色，捣末置瓷器中，以汤浇覆之，用葱、姜、橘子芼之，其饮醒酒，令人不眠。”\n《晏子春秋》：“婴相齐景公时，食脱粟之饭，炙三戈五卵茗莱而已。”\n司马相如《凡将篇》：“乌喙桔梗芫华，款冬贝母木蘖蒌，芩草芍药桂漏芦，蜚廉萑菌荈诧，白蔹白芷菖蒲，芒硝莞椒茱萸。”\n《方言》：“蜀西南人谓茶曰蔎。”\n《吴志·韦曜传》：“孙皓每飨宴坐席，无不率以七胜为限。虽不尽入口，皆浇灌取尽，曜饮酒不过二升，皓初礼异，密赐茶荈以代酒。”\n《晋中兴书》：“陆纳为吴兴太守，时卫将军谢安常欲诣纳，纳兄子俶怪纳，无所备，不敢问之，乃私蓄十数人馔。安既至，所设唯茶果而已。俶遂陈盛馔珍羞必具，及安去，纳杖俶四十，云：‘汝既不能光益叔父，柰何秽吾素业？’”\n《晋书》：“桓温为扬州牧，性俭，每宴饮，唯下七奠，柈茶果而已。”\n《搜神记》：“夏侯恺因疾死，宗人字苟奴，察见鬼神，见恺来收马，并病其妻，著平上帻单衣入，坐生时西壁大床，就人觅茶饮。”\n刘琨《与兄子南兖州刺史演书》云：“前得安州干姜一斤、桂一斤、黄芩一斤，皆所须也，吾体中溃闷，常仰真茶，汝可置之。”\n傅咸《司隶教》曰：“闻南方有以蜀妪作茶粥卖，为事打破其器具。又卖饼于市，而禁茶粥以缺蜀姥何哉！”\n《神异记》：“余姚人虞洪入山采茗，遇一道士牵三青牛，引洪至瀑布山曰：‘予丹丘子也。闻子善具饮，常思见惠。山中有大茗可以相给，祈子他日有瓯牺之余，乞相遗也。’因立奠祀。后常令家人入山，获大茗焉。”\n左思《娇女诗》：“吾家有娇女，皎皎颇白皙。小字为纨素，口齿自清历。有姊字惠芳，眉目粲如画。驰骛翔园林，果下皆生摘。贪华风雨中，倏忽数百适。心为茶荈剧，吹嘘对鼎䥶。”\n张孟阳《登成都楼诗》云：“借问杨子舍，想见长卿庐。程卓累千金，骄侈拟五侯。门有连骑客，翠带腰吴钩。鼎食随时进，百和妙且殊。披林采秋橘，临江钓春鱼。黑子过龙醢，果馔逾蟹蝑。芳茶冠六情，溢味播九区。人生苟安乐，兹土聊可娱。”\n傅巽《七诲》：“蒲桃、宛柰、齐柿、燕栗、峘阳黄梨、巫山朱橘、南中茶子、西极石蜜。”\n弘君举食檄：寒温既毕，应下霜华之茗，三爵而终，应下诸蔗、木瓜、元李、杨梅、五味橄榄、悬豹、葵羹各一杯。孙楚歌：‘茱萸出芳树颠，鲤鱼出洛水泉，白盐出河东，美豉出鲁渊。姜桂茶荈出巴蜀，椒橘、木兰出高山，蓼苏出沟渠，精稗出中田。’”\n华佗《食论》：“苦茶久食益意思。”\n壶居士《食忌》：“苦茶久食羽化。与韭同食，令人体重。”郭璞《尔雅注》云：“树小似栀子，冬生叶，可煮羹饮，今呼早取为茶，晚取为茗，或一曰荈，蜀人名之苦茶。”\n《世说》：“任瞻字育长，少时有令名。自过江失志，既下饮，问人云：‘此为茶为茗？’觉人有怪色，乃自分明云：‘向问饮为热为冷？’”\n《续搜神记·晋武帝》：“宣城人秦精，常入武昌山采茗，遇一毛人长丈余，引精至山下，示以丛茗而去。俄而复还，乃探怀中橘以遗精，精怖，负茗而归。”\n晋四王起事，惠帝蒙尘，还洛阳，黄门以瓦盂盛茶上至尊。\n《异苑》：“剡县陈务妻少，与二子寡居，好饮茶茗。以宅中有古冢，每饮，辄先祀之。二子患之曰：‘古冢何知？徒以劳。’意欲掘去之，母苦禁而止。其夜梦一人云：吾止此冢三百余年，卿二子恒欲见毁，赖相保护，又享吾佳茗，虽潜壤朽骨，岂忘翳桑之报。及晓，于庭中获钱十万，似久埋者，但贯新耳。母告，二子惭之，从是祷馈愈甚。”\n《广陵耆老传》：“晋元帝时有老姥，每旦独提一器茗，往市鬻之，市人竞买，自旦至夕，其器不减，所得钱散路傍孤贫乞人。人或异之，州法曹絷之狱中，至夜，老姥执所鬻茗器，从狱牖中飞出。”\n《艺术传》：“敦煌人单道开不畏寒暑，常服小石子。所服药有松桂蜜之气，所饮茶苏而已。”释道该说《续名僧传》：“宋释法瑶姓杨氏，河东人，永嘉中过江遇沈台真，请真君武康小山寺，年垂悬车，饭所饮茶，永明中敕吴兴礼致上京，年七十九。”\n《宋江氏家传》：“江统字应迁，愍怀太子洗马，尝上疏谏云：‘今西园卖酰面蓝子菜茶之属，亏败国体。’”\n《宋录》：“新安王子鸾、豫章王子尚，诣昙济道人于八公山，道人设茶茗，子尚味之曰：此甘露也，何言茶茗。”\n王微《杂诗》：“寂寂掩高阁，寥寥空广厦。待君竟不归，收领今就槚。\n鲍昭妹令晖著《香茗赋》。\n南齐世祖武皇帝遗诏：“我灵座上，慎勿以牲为祭，但设饼果、茶饮、干饭、酒脯而已。”\n梁刘孝绰、谢晋安王饷米等，启传诏：李孟孙宣教旨，垂赐米、酒、瓜、笋、菹、脯、酢、茗八种，气苾新城，味芳云松。江潭抽节，迈昌荇之珍；疆场擢翘，越葺精之美。羞非纯束野麏，裛似雪之鲈；鲊异陶瓶河鲤，操如琼之粲。茗同食粲酢，颜望柑免，千里宿舂，省三月种聚。小人怀惠，大懿难忘。陶弘景《杂录》：“苦茶轻换骨，昔丹丘子青山君服之。”\n《后魏录》：“琅琊王肃仕南朝，好茗饮莼羹。及还北地，又好羊肉酪浆，人或问之：茗何如酪？肃曰：茗不堪与酪为奴。”\n《桐君录》：“西阳武昌庐江昔陵好茗，皆东人作清茗。茗有饽，饮之宜人。凡可饮之物，皆多取其叶，天门冬、拔揳取根，皆益人。又巴东别有真茗茶，煎饮令人不眠。俗中多煮檀叶，并大皂李作茶，并冷。又南方有瓜芦木，亦似茗，至苦涩，取为屑茶，饮亦可通夜不眠。煮盐人但资此饮，而交广最重，客来先设，乃加以香芼辈。《坤元录》：“辰州溆浦县西北三百五十里无射山，云蛮俗当吉庆之时，亲族集会，歌舞于山上，山多茶树。”\n《括地图》：“临遂县东一百四十里有茶溪。”\n山谦之《吴兴记》：“乌程县西二十里有温山，出御荈。《夷陵图经》：“黄牛、荆门、女观望州等山，茶茗出焉。”\n《永嘉图经》：“永嘉县东三百里有白茶山。”\n《淮阴图经》：“山阳县南二十里有茶坡。”\n《茶陵图经》云：“茶陵者，所谓陵谷，生茶茗焉。”《本草·木部》：“茗，苦茶，味甘苦，微寒，无毒，主瘘疮，利小便，去痰渴热，令人少睡。秋采之苦，主下气消食。注云：春采之。”\n《本草·菜部》：“苦茶，一名荼，一名选，一名游冬。生益州川谷山陵道傍，凌冬不死。三月三日采干。注云：疑此即是今茶，一名荼，令人不眠。本草注。”按《诗》云“谁谓荼苦”，又云“堇荼如饴”，皆苦菜也。陶谓之苦茶，木类，非菜流。茗，春采谓之苦?茶。\n《枕中方》：“疗积年瘘，苦茶、蜈蚣并灸，令香熟，等分捣筛，煮甘草汤洗，以末傅之。”\n《孺子方》：“疗小儿无故惊蹶，以葱须煮服之。”" },
      { n: 8, text: "八之品\n山南以峡州上，襄州、荆州次，衡州下，金州、梁州又下。\n淮南以光州上，义阳郡、舒州次，寿州下，蕲州、黄州又下。\n浙西以湖州上，常州次，宣州、杭州、睦州、歙州下，润州、苏州又下。\n剑南以彭州上，绵州、蜀州次，邛州次，雅州、泸州下，眉州、汉州又下。\n浙东以越州上，明州、婺州次，台州下。\n黔中生恩州、播州、费州、夷州，江南生鄂州、袁州、吉州，岭南生福州、建州、韶州、象州。其恩、播、费、夷、鄂、袁、吉、福、建、泉、韶、象十一州未详。往往得之，其味极佳。" },
      { n: 9, text: "九之略\n其造具，若方春禁火之时，于野寺山园丛手而掇，乃蒸，乃舂，乃以火干之，则又棨、朴、焙、贯、相、穿、育等七事皆废。其煮器，若松间石上可坐，则具列，废用槁薪鼎枥之属，则风炉、灰承、炭挝、火筴、交床等废；若瞰泉临涧，则水方、涤方、漉水囊废。若五人已下，茶可末而精者，则罗废；若援藟跻嵒，引絙入洞，于山口灸而末之，或纸包合贮，则碾、拂末等废；既瓢碗、筴、札、熟盂、醝簋悉以一筥盛之，则都篮废。但城邑之中，王公之门，二十四器阙一则茶废矣！" },
      { n: 10, text: "十之图\n以绢素或四幅或六幅，分布写之，陈诸座隅，则茶之源、之具、之造、之器、之煮、之饮、之事、之出、之略，目击而存，于是《茶经》之始终备焉。" }
    ] },
  { id: "b_qianjin", name: "《千金方》", desc: "方论巨著，尤重妇科、儿科，人命至重有贵千金。", cat: "medical", subcat: "方剂", author: "孙思邈", dynasty: "唐",
    chapters: [] },
  { id: "b_shiliao", name: "《食疗本草》", desc: "以食为药，养于日常，食疗专著。", cat: "medical", subcat: "食疗", author: "孟诜", dynasty: "唐",
    chapters: [] },
  { id: "b_poem01", name: "《李白集》", desc: "唐·李白 诗词辑录。", cat: "poem", author: "李白", dynasty: "唐",
    chapters: [
      { n: 1, text: "《塞下曲六首》\n其一：五月天山雪，无花只有寒。笛中闻折柳，春色未曾看。晓战随金鼓，宵眠抱玉鞍。愿将腰下剑，直为斩楼兰。\n其二：天兵下北荒，胡马欲南饮。横戈从百战，直为衔恩甚。握雪海上餐，拂沙陇头寝。何当破月氏，然后方高枕。\n其三：骏马似风飙，鸣鞭出渭桥。弯弓辞汉月，插羽破天骄。阵解星芒尽，营空海雾消。功成画麟阁，独有霍嫖姚。\n其四：白马黄金塞，云砂绕梦思。那堪愁苦节，远忆边城儿。萤飞秋窗满，月度霜闺迟。摧残梧桐叶，萧飒沙棠枝。无时独不见，流泪空自知。\n其五：塞虏乘秋下，天兵出汉家。将军分虎竹，战士卧龙沙。边月随弓影，胡霜拂剑花。玉关殊未入，少妇莫长嗟。\n其六：烽火动沙漠，连照甘泉云。汉皇按剑起，还召李将军。兵气天上合，鼓声陇底闻。横行负勇气，一战净妖氛。" },
      { n: 2, text: "《清平乐·画堂晨起》\n画堂晨起，来报雪花坠。高卷帘栊看佳瑞，皓色远迷庭砌。\n盛气光引炉烟，素草寒生玉佩。应是天仙狂醉，乱把白云揉碎。" },
      { n: 3, text: "《拟古十二首·其九》\n生者为过客，死者为归人。天地一逆旅，同悲万古尘。\n月兔空捣药，扶桑已成薪。白骨寂无言，青松岂知春。\n前后更叹息，浮荣安足珍。" },
      { n: 4, text: "《白马篇》\n龙马花雪毛，金鞍五陵豪。秋霜切玉剑，落日明珠袍。\n斗鸡事万乘，轩盖一何高。弓摧南山虎，手接太行猱。\n酒后竞风采，三杯弄宝刀。杀人如剪草，剧孟同游遨。\n发愤去函谷，从军向临洮。叱咤经百战，匈奴尽奔逃。\n归来使酒气，未肯拜萧曹。羞入原宪室，荒淫隐蓬蒿。" },
      { n: 5, text: "《江夏别宋之悌》\n楚水清若空，遥将碧海通。人分千里外，兴在一杯中。\n谷鸟吟晴日，江猿啸晚风。平生不下泪，于此泣无穷。" },
      { n: 6, text: "《江上吟》\n木兰之枻沙棠舟，玉箫金管坐两头。美酒樽中置千斛，载妓随波任去留。\n仙人有待乘黄鹤，海客无心随白鸥。屈平辞赋悬日月，楚王台榭空山丘。\n兴酣落笔摇五岳，诗成笑傲凌沧洲。功名富贵若长在，汉水亦应西北流。" },
      { n: 7, text: "《少年行二首·其二》\n五陵年少金市东，银鞍白马度春风。落花踏尽游何处，笑入胡姬酒肆中。" },
      { n: 8, text: "《庐山谣寄卢侍御虚舟》\n我本楚狂人，凤歌笑孔丘。手持绿玉杖，朝别黄鹤楼。\n五岳寻仙不辞远，一生好入名山游。庐山秀出南斗傍，屏风九叠云锦张，影落明湖青黛光。\n金阙前开二峰长，银河倒挂三石梁。香炉瀑布遥相望，回崖沓嶂凌苍苍。\n翠影红霞映朝日，鸟飞不到吴天长。登高壮观天地间，大江茫茫去不还。\n黄云万里动风色，白波九道流雪山。好为庐山谣，兴因庐山发。\n闲窥石镜清我心，谢公行处苍苔没。早服还丹无世情，琴心三叠道初成。\n遥见仙人彩云里，手把芙蓉朝玉京。先期汗漫九垓上，愿接卢敖游太清。" },
      { n: 9, text: "《东鲁见狄博通》\n去年别我向何处，有人传道游江东。谓言挂席度沧海，却来应是无长风。" },
      { n: 10, text: "《送白利从金吾董将军西征》\n西羌延国讨，白起佐军威。剑决浮云气，弓弯明月辉。\n马行边草绿，旌卷曙霜飞。抗手凛相顾，寒风生铁衣。" },
      { n: 11, text: "《秋登宣城谢朓北楼》\n江城如画里，山晚望晴空。两水夹明镜，双桥落彩虹。\n人烟寒橘柚，秋色老梧桐。谁念北楼上，临风怀谢公。" }
    ] },
  { id: "b_poem06", name: "《唐诗选》", desc: "唐历代诗词选辑。", cat: "poem", dynasty: "唐",
    chapters: [
      { n: 1, text: "〔王维〕《老将行》\n少年十五二十时，步行夺得胡马骑。射杀山中白额虎，肯数邺下黄须儿。\n一身转战三千里，一剑曾当百万师。汉兵奋迅如霹雳，虏骑崩腾畏蒺藜。\n卫青不败由天幸，李广无功缘数奇。自从弃置便衰朽，世事蹉跎成白首。\n昔时飞箭无全目，今日垂杨生左肘。路傍时卖故侯瓜，门前学种先生柳。\n苍茫古木连穷巷，寥落寒山对虚牖。誓令疏勒出飞泉，不似颍川空使酒。\n贺兰山下阵如云，羽檄交驰日夕闻。节使三河募年少，诏书五道出将军。\n试拂铁衣如雪色，聊持宝剑动星文。愿得燕弓射天将，耻令越甲鸣吴军。\n莫嫌旧日云中守，犹堪一战取功勋。" },
      { n: 2, text: "〔王维〕《少年行四首》\n其一\n新丰美酒斗十千，咸阳游侠多少年。相逢意气为君饮，系马高楼垂柳边。\n其二\n出身仕汉羽林郎，初随骠骑战渔阳。孰知不向边庭苦，纵死犹闻侠骨香。\n其三\n一身能擘两雕弧，虏骑千群只似无。偏坐金鞍调白羽，纷纷射杀五单于。\n其四\n汉家君臣欢宴终，高议云台论战功。天子临轩赐侯印，将军佩出明光宫。" },
      { n: 3, text: "〔王维〕《酌酒与裴迪》\n酌酒与君君自宽，人情翻覆似波澜。白首相知犹按剑，朱门先达笑弹冠。\n草色全经细雨湿，花枝欲动春风寒。世事浮云何足问，不如高卧且加餐。" },
      { n: 4, text: "〔罗隐〕《自遣》\n得即高歌失即休，多愁多恨亦悠悠。今朝有酒今朝醉，明日愁来明日愁。" },
      { n: 5, text: "〔王昌龄〕《送柴侍御》\n沅水通波接武冈，送君不觉有离伤。\n青山一道同云雨，明月何曾是两乡。" },
      { n: 6, text: "〔王昌龄〕《塞下曲》\n饮马渡秋水，水寒风似刀。平沙日未没，黯黯见临洮。\n昔日长城战，咸言意气高。黄尘足今古，白骨乱蓬蒿。" },
      { n: 7, text: "〔杜甫〕《壮游》\n往昔十四五，出游翰墨场。斯文崔魏徒，以我似班扬。\n七龄思即壮，开口咏凤凰。九龄书大字，有作成一囊。\n性豪业嗜酒，嫉恶怀刚肠。脱略小时辈，结交皆老苍。\n饮酣视八极，俗物都茫茫。东下姑苏台，已具浮海航。\n到今有遗恨，不得穷扶桑。王谢风流远，阖庐丘墓荒。\n剑池石壁仄，长洲荷芰香。嵯峨阊门北，清庙映回塘。\n每趋吴太伯，抚事泪浪浪。枕戈忆勾践，渡浙想秦皇。\n蒸鱼闻匕首，除道哂要章。越女天下白，鉴湖五月凉。\n剡溪蕴秀异，欲罢不能忘。归帆拂天姥，中岁贡旧乡。\n气劘屈贾垒，目短曹刘墙。忤下考功第，独辞京尹堂。\n放荡齐赵间，裘马颇清狂。春歌丛台上，冬猎青丘旁。\n呼鹰皂枥林，逐兽云雪冈。射飞曾纵鞚，引臂落鹙鸧。\n苏侯据鞍喜，忽如携葛强。快意八九年，西归到咸阳。\n许与必词伯，赏游实贤王。曳裾置醴地，奏赋入明光。\n天子废食召，群公会轩裳。脱身无所爱，痛饮信行藏。\n黑貂不免敝，斑鬓兀称觞。杜曲晚耆旧，四郊多白杨。\n坐深乡党敬，日觉死生忙。朱门任倾夺，赤族迭罹殃。\n国马竭粟豆，官鸡输稻粱。举隅见烦费，引古惜兴亡。\n河朔风尘起，岷山行幸长。两宫各警跸，万里遥相望。\n崆峒杀气黑，少海旌旗黄。禹功亦命子，涿鹿亲戎行。\n翠华拥英岳，螭虎啖豺狼。爪牙一不中，胡兵更陆梁。\n大军载草草，凋瘵满膏肓。备员窃补衮，忧愤心飞扬。\n上感九庙焚，下悯万民疮。斯时伏青蒲，廷争守御床。\n君辱敢爱死，赫怒幸无伤。圣哲体仁恕，宇县复小康。\n哭庙灰烬中，鼻酸朝未央。小臣议论绝，老病客殊方。\n郁郁苦不展，羽翮困低昂。秋风动哀壑，碧蕙捐微芳。\n之推避赏从，渔父濯沧浪。荣华敌勋业，岁暮有严霜。\n吾观鸱夷子，才格出寻常。群凶逆未定，侧伫英俊翔。" },
      { n: 8, text: "〔杜甫〕《蒹葭》\n摧折不自守，秋风吹若何。暂时花戴雪，几处叶沉波。\n体弱春风早，丛长夜露多。江湖后摇落，亦恐岁蹉跎。" },
      { n: 9, text: "〔杜甫〕《醉歌行》\n陆机二十作文赋，汝更小年能缀文。总角草书又神速，世上儿子徒纷纷。\n骅骝作驹已汗血，鸷鸟举翮连青云。词源倒倾三峡水，笔阵独扫千人军。\n只今年才十六七，射策君门期第一。旧穿杨叶真自知，暂蹶霜蹄未为失。\n偶然擢秀非难取，会是排风有毛质。汝身已见唾成珠，汝伯何由发如漆。\n春光淡沲秦东亭，渚蒲牙白水荇青。风吹客衣日杲杲，树搅离思花冥冥。\n酒尽沙头双玉瓶，众宾皆醉我独醒。乃知贫贱别更苦，吞声踯躅涕泪零。" },
      { n: 10, text: "〔杜甫〕《戏为六绝句·其二》\n王杨卢骆当时体，轻薄为文哂未休。尔曹身与名俱灭，不废江河万古流。" },
      { n: 11, text: "〔韦庄〕《菩萨蛮·如今却忆江南乐》\n如今却忆江南乐，当时年少春衫薄。骑马倚斜桥，满楼红袖招。\n翠屏金屈曲，醉入花丛宿。此度见花枝，白头誓不归。" },
      { n: 12, text: "〔令狐楚〕《少年行四首·其三》\n弓背霞明剑照霜，秋风走马出咸阳。\n未收天子河湟地，不拟回头望故乡。" },
      { n: 13, text: "〔薛逢〕《侠少年》\n绿眼胡鹰踏锦鞲，五花骢马白貂裘。往来三市无人识，倒把金鞭上酒楼。" },
      { n: 14, text: "〔孟郊〕《杂曲歌辞·游侠行》\n壮士性刚决，火中见石裂。杀人不回头，轻生如暂别。\n岂知眼有泪，肯白头上发。平生无恩酬，剑闲一百月。" },
      { n: 15, text: "〔温庭筠〕《侠客行》\n欲出鸿都门，阴云蔽城阙。宝剑黯如水，微红湿馀血。\n白马夜频嘶，三更霸陵雪。" },
      { n: 16, text: "〔韩愈〕《进学解》\n……障百川而东之，回狂澜于既倒；……（按：\"挽狂澜于既倒\"本于《进学解》\"回狂澜于既倒\"；\"扶大厦之将倾\"常与之连用以颂韩愈，原出王勃《滕王阁序》\"扶摇\"一系，后人并书为对联。）" },
      { n: 17, text: "〔贾岛〕《剑客》\n十年磨一剑，霜刃未曾试。今日把示君，谁有不平事？" },
      { n: 18, text: "〔陆龟蒙〕《和袭美春夕酒醒》\n几年无事傍江湖，醉倒黄公旧酒垆。觉后不知明月上，满身花影倩人扶。" },
      { n: 19, text: "〔赵嘏〕《长安月夜与友人话故山》\n宅边秋水浸苔矶，日日持竿去不归。杨柳风多潮未落，蒹葭霜冷雁初飞。\n重嘶匹马吟红叶，却听疏钟忆翠微。今夜秦城满楼月，故人相见一沾衣。" },
      { n: 20, text: "〔云门文偃〕《（禅语）》\n万古长空，一朝风月。" },
      { n: 21, text: "〔司空图〕《诗品二十四则·典雅》\n玉壶买春，赏雨茆屋。坐中佳士，左右修竹。白云初晴，幽鸟相逐。\n眠琴绿阴，上有飞瀑。落花无言，人淡如菊。书之岁华，其曰可读。" },
      { n: 22, text: "〔白居易〕《放言五首·其一》\n朝真暮伪何人辨，古往今来底事无。但爱臧生能诈圣，可知宁子解佯愚。\n草萤有耀终非火，荷露虽团岂是珠。不取燔柴兼照乘，可怜光彩亦何殊。" },
      { n: 23, text: "〔戴叔伦〕《苏溪亭》\n苏溪亭上草漫漫，谁倚东风十二阑。燕子不归春事晚，一汀烟雨杏花寒。" },
      { n: 24, text: "〔张旭〕《山中留客》\n山光物态弄春辉，莫为轻阴便拟归。纵使晴明无雨色，入云深处亦沾衣。" },
      { n: 25, text: "〔李贺〕《南园十三首·其五》\n男儿何不带吴钩，收取关山五十州。请君暂上凌烟阁，若个书生万户侯。" },
      { n: 26, text: "〔李贺〕《将进酒》\n琉璃钟，琥珀浓，小槽酒滴真珠红。烹龙炮凤玉脂泣，罗帏绣幕围香风。\n吹龙笛，击鼍鼓；皓齿歌，细腰舞。况是青春日将暮，桃花乱落如红雨。\n劝君终日酩酊醉，酒不到刘伶坟上土。" }
    ] },
  { id: "b_waitai", name: "《外台秘要》", desc: "辑唐以前方书，保存大量散佚文献。", cat: "medical", subcat: "方剂", author: "王焘", dynasty: "唐",
    chapters: [] },
  { id: "b_jingxiao", name: "《经效产宝》", desc: "现存最早妇产科专书。", cat: "medical", subcat: "妇科", author: "昝殷", dynasty: "唐",
    chapters: [] },
  { id: "b_xianshou", name: "《仙授理伤续断秘方》", desc: "现存最早骨伤科专书。", cat: "medical", subcat: "骨伤", author: "蔺道人", dynasty: "唐",
    chapters: [] },
  { id: "b_butian", name: "《丹元子步天歌》", desc: "唐·王希明（号丹元子）撰，七言韵文，首将全天星官分归三垣二十八宿三十一区，古代观象识星之总纲，亦与星象直接对应。", cat: "misc", author: "王希明", dynasty: "唐",
    chapters: [] },
  { id: "b_poem03", name: "《苏轼集》", desc: "宋·苏轼 诗词辑录。", cat: "poem", author: "苏轼", dynasty: "宋",
    chapters: [
      { n: 1, text: "《点绛唇·闲倚胡床》\n闲倚胡床，庾公楼外峰千朵。与谁同坐，明月清风我。别乘一来，有唱应须和。还知么，自从添个，风月平分破。" },
      { n: 2, text: "《水调歌头·黄州快哉亭赠张偓佺》\n落日绣帘卷，亭下水连空。知君为我新作，窗户湿青红。长记平山堂上，欹枕江南烟雨，杳杳没孤鸿。认得醉翁语，山色有无中。\n一千顷，都镜净，倒碧峰。忽然浪起，掀舞一叶白头翁。堪笑兰台公子，未解庄生天籁，刚道有雌雄。一点浩然气，千里快哉风。" },
      { n: 3, text: "《洞仙歌·冰肌玉骨》\n冰肌玉骨，自清凉无汗。水殿风来暗香满。绣帘开，一点明月窥人，人未寝，欹枕钗横鬓乱。\n起来携素手，庭户无声，时见疏星渡河汉。试问夜如何？夜已三更，金波淡，玉绳低转。但屈指西风几时来，又不道流年暗中偷换。" },
      { n: 4, text: "《沁园春·赴密州早行马上寄子由》\n孤馆灯青，野店鸡号，旅枕梦残。渐月华收练，晨霜耿耿；云山摛锦，朝露漙漙。世路无穷，劳生有限，似此区区长鲜欢。微吟罢，凭征鞍无语，往事千端。\n当时共客长安，似二陆初来俱少年。有笔头千字，胸中万卷；致君尧舜，此事何难？用舍由时，行藏在我，袖手何妨闲处看。身长健，但优游卒岁，且斗尊前。" },
      { n: 5, text: "《鹧鸪天·林断山明竹隐墙》\n林断山明竹隐墙，乱蝉衰草小池塘。翻空白鸟时时见，照水红蕖细细香。\n村舍外，古城旁，杖藜徐步转斜阳。殷勤昨夜三更雨，又得浮生一日凉。" }
    ] },
  { id: "b_poem04", name: "《辛弃疾集》", desc: "宋·辛弃疾 诗词辑录。", cat: "poem", author: "辛弃疾", dynasty: "宋",
    chapters: [
      { n: 1, text: "《水调歌头·我饮不须劝》\n我饮不须劝，正怕酒尊空。别离亦复何恨，此别恨匆匆。头上貂蝉贵客，花外麒麟高冢，人世竟谁雄。一笑出门去，千里落花风。\n叹平生，迷歌酒，懒英雄。长歌自深酌，天地与谁同。酒酣胆气衰损，老我成狂客，万事一搔首。明日还复醉，歌管送年丰。" },
      { n: 2, text: "《水调歌头·和马叔度游月波楼》\n客子久不到，好景为君留。西楼着意吟赏，何必问更筹？唤起一天明月，照我满怀冰雪，浩荡百川流。鲸饮未吞海，剑气已横秋。\n野光浮，天宇迥，物华幽。中州遗恨，不知今夜几人愁？谁念英雄老矣？不道功名蕞尔，决策尚悠悠。此事费分说，来日且扶头！" },
      { n: 3, text: "《水调歌头·我志在寥阔》\n我志在寥阔，畴昔梦登天。摩挲素月，人世俯仰已千年。有客骖鸾并凤，云遇青山赤壁，相约上高寒。酌酒援北斗，我亦虱其间。\n少歌曰：神甚放，形如眠。鸿鹄一再高举，天地睹方圆。欲重歌兮梦觉，推枕惘然独念，人事底亏全？有美人可语，秋水隔婵娟。" },
      { n: 4, text: "《水龙吟·过南剑双溪楼》\n举头西北浮云，倚天万里须长剑。人言此地，夜深长见，斗牛光焰。我觉山高，潭空水冷，月明星淡。待燃犀下看，凭栏却怕，风雷怒，鱼龙惨。\n峡束苍江对起，过危楼，欲飞还敛。元龙老矣，不妨高卧，冰壶凉簟。千古兴亡，百年悲笑，一时登览。问何人又卸，片帆沙岸，系斜阳缆。" },
      { n: 5, text: "《太常引·建康中秋夜为吕叔潜赋》\n一轮秋影转金波，飞镜又重磨。把酒问姮娥：被白发、欺人奈何？\n乘风好去，长空万里，直下看山河。斫去桂婆娑，人道是、清光更多。" },
      { n: 6, text: "《玉楼春·再和》\n人间反覆成云雨，凫雁江湖来又去。十千一斗饮中仙，一百八盘天上路。\n落魄长官江海去，谁是长亭十日主。旧题名处拂莓苔，犹有余尊可重酹。" },
      { n: 7, text: "《临江仙·再用前韵送祐之弟归浮梁》\n钟鼎山林都是梦，人间宠辱休惊。只消闲处过平生。酒杯秋吸露，诗句夜裁冰。\n记取小窗风雨夜，对床灯火多情。问谁千里伴君行。晓山眉样翠，秋水镜般明。" },
      { n: 8, text: "《鹧鸪天·代人赋》\n晚日寒鸦一片愁。柳塘新绿却温柔。若教眼底无离恨，不信人间有白头。\n肠已断，泪难收。相思重上小红楼。情知已被山遮断，频倚阑干不自由。" },
      { n: 9, text: "《生查子·独游雨岩》\n溪边照影行，天在清溪底。天上有行云，人在行云里。\n高歌谁和余？空谷清音起。非鬼亦非仙，一曲桃花水。" },
      { n: 10, text: "《西江月·遣兴》\n醉里且贪欢笑，要愁那得工夫。近来始觉古人书，信著全无是处。昨夜松边醉倒，问松我醉何如。只疑松动要来扶，以手推松曰去。" }
    ] },
  { id: "b_poem05", name: "《宋诗词选》", desc: "宋历代诗词选辑。", cat: "poem", dynasty: "宋",
    chapters: [
      { n: 1, text: "〔黄庭坚〕《寄黄几复》\n我居北海君南海，寄雁传书谢不能。\n桃李春风一杯酒，江湖夜雨十年灯。\n持家但有四立壁，治病不蕲三折肱。\n想得读书头已白，隔溪猿哭瘴溪藤。" },
      { n: 2, text: "〔黄庭坚〕《到官归志浩然二绝句》\n其一\n雨洗风吹桃李净，松声聒尽鸟惊春。\n满船明月从此去，本是江湖寂寞人。\n其二\n鸟鸣未觉常先晓，笋蕨登盘始见春。\n敛手还他能者作，从来刀笔不如人。" },
      { n: 3, text: "〔贺铸〕《六州歌头·少年侠气》\n少年侠气，交结五都雄。肝胆洞，毛发耸。立谈中，死生同。一诺千金重。推翘勇，矜豪纵。轻盖拥，联飞鞚，斗城东。轰饮酒垆，春色浮寒瓮，吸海垂虹。闲呼鹰嗾犬，白羽摘雕弓，狡穴俄空。乐匆匆。\n似黄粱梦，辞丹凤；明月共，漾孤篷。官冗从，怀倥偬；落尘笼，簿书丛。鹖弁如云众，供粗用，忽奇功。笳鼓动，渔阳弄，思悲翁。不请长缨，系取天骄种，剑吼西风。恨登山临水，手寄七弦桐，目送归鸿。" },
      { n: 4, text: "〔刘克庄〕《贺新郎·九日》\n湛湛长空黑。更那堪、斜风细雨，乱愁如织。老眼平生空四海，赖有高楼百尺。看浩荡、千崖秋色。白发书生神州泪，尽凄凉、不向牛山滴。追往事，去无迹。\n少年自负凌云笔。到如今、春华落尽，满怀萧瑟。常恨世人新意少，爱说南朝狂客。把破帽、年年拈出。若对黄花孤负酒，怕黄花、也笑人岑寂。鸿北去，日西匿。" },
      { n: 5, text: "〔刘克庄〕《一剪梅·余赴广东实之夜饯于风亭》\n束缊宵行十里强，挑得诗囊，抛了衣囊。天寒路滑马蹄僵，元是王郎，来送刘郎。\n酒酣耳热说文章，惊倒邻墙，推倒胡床。旁观拍手笑疏狂，疏又何妨，狂又何妨。" },
      { n: 6, text: "〔叶梦得〕《水调歌头·九月望日与客习射西园余偶病不能射》\n霜降碧天静，秋事促西风。寒声隐地初听，中夜入梧桐。起瞰高城回望，寥落关河千里，一醉与君同。叠鼓闹清晓，飞骑引雕弓。\n岁将晚，客争笑，问衰翁。平生豪气安在，沈领为谁雄。何似当筵虎士，挥手弦声响处，双雁落遥空。老矣真堪愧，回首望云中。" },
      { n: 7, text: "〔杨万里〕《闷歌行十二首·其一》\n风力掀天浪打头，只须一笑不须愁。近看两日远三日，气力穷时会自休。" },
      { n: 8, text: "〔朱敦儒〕《鹧鸪天·西都作》\n我是清都山水郎。天教分付与疏狂。曾批给雨支风券，累上留云借月章。\n诗万首，酒千觞。几曾著眼看侯王。玉楼金阙慵归去，且插梅花醉洛阳。" },
      { n: 9, text: "〔黄庭坚〕《诉衷情·一波才动万波随》\n一波才动万波随，蓑笠一钩丝。金鳞正深处，千尺也须垂。\n吞又吐，信还疑，上钩迟。水寒江静，满目青山，载月明归。" },
      { n: 10, text: "〔陆游〕《鹧鸪天·送叶梦锡》\n家住东吴近帝乡，平生豪举少年场。十千沽酒青楼上，百万呼卢锦瑟傍。\n身易老，恨难忘，尊前赢得是凄凉。君归为报京华旧，一事无成两鬓霜。" },
      { n: 11, text: "〔李清照〕《转调满庭芳·芳草池塘》\n芳草池塘，绿阴庭院，晚晴寒透窗纱。玉钩金锁，管是客来唦。寂寞尊前席上，惟愁海角天涯。能留否？酴醾落尽，犹赖有梨花。\n当年曾胜赏，生香熏袖，活火分茶。极目犹龙骄马，流水轻车。不怕风狂雨骤，恰才称，煮酒笺花。如今也，不成怀抱，得似旧时那？" },
      { n: 12, text: "〔叶梦得〕《虞美人·雨后同干誉才卿置酒来禽花下作》\n落花已作风前舞，又送黄昏雨。晓来庭院半残红，惟有游丝千丈袅晴空。\n殷勤花下同携手，更尽杯中酒。美人不用敛蛾眉，我亦多情无奈酒阑时。" },
      { n: 13, text: "〔晏几道〕《阮郎归·天边金掌露成霜》\n天边金掌露成霜，云随雁字长。绿杯红袖趁重阳，人情似故乡。\n兰佩紫，菊簪黄，殷勤理旧狂。欲将沉醉换悲凉，清歌莫断肠。" },
      { n: 14, text: "〔赵鼎〕《鹧鸪天·建康上元作》\n客路那知岁序移，忽惊春到小桃枝。天涯海角悲凉地，记得当年全盛时。\n花弄影，月流辉，水精宫殿五云飞。分明一觉华胥梦，回首东风泪满衣。" },
      { n: 15, text: "〔王雱〕《眼儿媚·杨柳丝丝弄轻柔》\n杨柳丝丝弄轻柔，烟缕织成愁。海棠未雨，梨花先雪，一半春休。\n而今往事难重省，归梦绕秦楼。相思只在，丁香枝上，豆蔻梢头。" },
      { n: 16, text: "〔陆游〕《雨霁出游书事》\n十日苦雨一日晴，拂拭拄杖西村行。清沟泠泠流水细，好风习习吹衣轻。\n四邻蛙声已閤閤，两岸柳色争青青。辛夷先开半委地，海棠独立方倾城。\n春工遇物初不择，亦秀燕麦开芜菁。荠花如雪又烂漫，百草红紫那知名。\n小鱼谁取置道侧，细柳穿颊危将烹。欣然买放寄吾意，草莱无地苏疲氓。" },
      { n: 17, text: "〔张孝祥〕《念奴娇·过洞庭》\n洞庭青草，近中秋，更无一点风色。玉鉴琼田三万顷，着我扁舟一叶。素月分辉，明河共影，表里俱澄澈。悠然心会，妙处难与君说。\n应念岭海经年，孤光自照，肝肺皆冰雪。短发萧骚襟袖冷，稳泛沧浪空阔。尽挹西江，细斟北斗，万象为宾客。扣舷独啸，不知今夕何夕！" },
      { n: 18, text: "〔吴文英〕《风入松·听风听雨过清明》\n听风听雨过清明，愁草瘗花铭。楼前绿暗分携路，一丝柳、一寸柔情。料峭春寒中酒，交加晓梦啼莺。\n西园日日扫林亭，依旧赏新晴。黄蜂频扑秋千索，有当时、纤手香凝。惆怅双鸳不到，幽阶一夜苔生。" }
    ] },
  { id: "b_hejiju", name: "《太平惠民和剂局方》", desc: "世界最早成药规范（制剂手册），影响深远。", cat: "medical", subcat: "方剂", author: "官修", dynasty: "宋",
    chapters: [] },
  { id: "b_shenghui", name: "《太平圣惠方》", desc: "大型官修方书。", cat: "medical", subcat: "方剂", author: "王怀隐等", dynasty: "宋",
    chapters: [] },
  { id: "b_sanyin", name: "《三因极一病证方论》", desc: "创病因三因学说。", cat: "medical", subcat: "内科", author: "陈言", dynasty: "宋",
    chapters: [] },
  { id: "b_furen", name: "《妇人大全良方》", desc: "妇产科集大成。", cat: "medical", subcat: "妇科", author: "陈自明", dynasty: "宋",
    chapters: [] },
  { id: "b_xiaoer", name: "《小儿药证直诀》", desc: "儿科辨证奠基，钱乙被誉为儿科之圣。", cat: "medical", subcat: "儿科", author: "钱乙", dynasty: "宋",
    chapters: [] },
  { id: "b_jiupu", name: "《酒谱》", desc: "宋·窦苹撰，辑酒之源流、名品、故事、功戒、饮器、酒令，酒文化小百科。", cat: "misc", author: "窦苹", dynasty: "宋",
    chapters: [
      { n: 1, text: "酒谱·酒之源\n《世本》曰：『仪狄始作酒醪，变五味。』少康（杜康）作秫酒。古者仪狄作酒，禹饮而甘之，曰：『后世必有以酒亡其国者。』遂疏仪狄，绝旨酒。然酒之兴，其自上皇乎？非必始于仪狄也。" },
      { n: 2, text: "酒谱·酒之名\n酒之名：有泛齐、醴齐、盎齐、缇齐、沈齐，此五齐也；又有事酒、昔酒、清酒，此三酒也。后世名目益繁：若竹叶、若葡萄、若流霞、若中山、若宜城，不可胜纪。" },
      { n: 3, text: "酒谱·酒之事\n晋阮籍以酒避祸，陶潜篇篇有酒。刘伶《酒德颂》曰：『幕天席地，纵意所如。止则操卮执觚，动则挈榼提壶。』\n《典论》称『酒以成礼，过则败德』，君子慎之。" },
      { n: 4, text: "酒谱·酒之功与戒\n酒之功：可以养病，可以祭祀，可以成礼，可以合欢。然《酒诰》之戒深矣：『无彝酒』『饮惟祀』『德将无醉』。温克为美，乱德为戒。饮不至醉，醉不及乱，君子之饮酒也。" }
    ] },
  { id: "b_xiangpu", name: "《香谱》", desc: "宋·陈敬撰，分香之品、香之异、香之事、香之法四卷，清玩香事总汇。", cat: "misc", author: "陈敬", dynasty: "宋",
    chapters: [
      { n: 1, text: "香谱·卷一·香之品\n龙脑香：出婆律国，树高八九丈，叶圆而背白，其脂为龙脑，明净者善。麝香：生者益良，其香远嗅。沉香：出天竺诸国，木其心节置水则沉。檀香：有白、紫之异，又名旃檀，气味芬馥。乳香：出波斯国，其树类松，斫树脂溢于外。" },
      { n: 2, text: "香谱·卷二·香之异\n《述异记》云：『汉武帝时，弱水西国有人乘霞车，以碧玉为辇，驾五色之羊，至阙下，献香。』\n《酉阳杂俎》载：『拂林国寺，显庆中，有狮子国婆罗门，请以底称国香焚之，烟气成楼阁。』" },
      { n: 3, text: "香谱·卷三·香之事\n《襄阳记》曰：『刘季和性爱香，上厕还，辄过香炉上。主簿张坦曰：「人名公作俗人，真不虚也。」季和曰：「荀令君至人家，坐处三日香，为我如何？」坦曰：「丑妇效颦，见者必走，公欲令吾走耶？」季和大笑。』" },
      { n: 4, text: "香谱·卷四·香之法\n合香之法：凡和香，须令燥湿得所，捣炼匀细。以沉、檀为君，龙、麝为佐使，香气远而久。焚香宜隔火，勿令焰起，则烟清而润。印香则以模脱之，篆文纤巧，焚之逶迤不断。" }
    ] },
  { id: "b_dongjing", name: "《东京梦华录》", desc: "宋·孟元老撰，追忆北宋汴京城市风貌、市井百业、节令游观。", cat: "misc", author: "孟元老", dynasty: "宋",
    chapters: [] },
  { id: "b_wulin", name: "《武林旧事》", desc: "宋·周密撰，记南宋临安（杭州）湖山胜概、节庆风物、市井繁华。", cat: "misc", author: "周密", dynasty: "宋",
    chapters: [] },
  { id: "b_mengxi", name: "《梦溪笔谈》", desc: "宋·沈括撰，笔记体百科，涵盖天文历法、数理、音律、技艺、药理诸科。", cat: "misc", author: "沈括", dynasty: "宋",
    chapters: [] },
  { id: "b_qinshi", name: "《琴史》", desc: "宋·朱长文撰，琴人、琴声、琴制、琴曲、琴论，琴学第一部专史。", cat: "misc", author: "朱长文", dynasty: "宋",
    chapters: [] },
  { id: "b_yunji", name: "《云笈七签》", desc: "宋·张君房编，道教类书，集三洞四辅经论，老君垂训、仙真谱系、洞天福地、内修丹法。", cat: "misc", author: "张君房", dynasty: "宋",
    chapters: [] },
  { id: "b_piwei", name: "《脾胃论》", desc: "补土派代表，重脾胃升阳。", cat: "medical", subcat: "内科", author: "李东垣", dynasty: "金元",
    chapters: [] },
  { id: "b_poem10", name: "《元曲选》", desc: "元历代诗词选辑。", cat: "poem", dynasty: "元",
    chapters: [
      { n: 1, text: "〔张可久〕《人月圆·山中书事》\n兴亡千古繁华梦，诗眼倦天涯。孔林乔木，吴宫蔓草，楚庙寒鸦。\n数间茅舍，藏书万卷，投老村家。山中何事？松花酿酒，春水煎茶。" },
      { n: 2, text: "〔张可久〕《人月圆·客垂虹》\n三高祠下天如镜，山色浸空蒙。莼羹张翰，渔舟范蠡，茶灶龟蒙。\n故人何在，前程那里，心事谁同？黄花庭院，青灯夜雨，白发秋风。" },
      { n: 3, text: "〔唐珙〕《题龙阳县青草湖》\n西风吹老洞庭波，一夜湘君白发多。醉后不知天在水，满船清梦压星河。" },
      { n: 4, text: "〔虞集〕《风入松·寄柯敬仲》\n画堂红袖倚清酣，华发不胜簪。几回晚直金銮殿，东风软、花里停骖。书诏许传宫烛，轻罗初试朝衫。\n御沟冰泮水挼蓝，飞燕语呢喃。重重帘幕寒犹在，凭谁寄、银字泥缄。报道先生归也，杏花春雨江南。" }
    ] },
  { id: "b_yinshan", name: "《饮膳正要》", desc: "宫廷营养学、食疗，兼蒙医元素。", cat: "medical", subcat: "食疗", author: "忽思慧", dynasty: "元",
    chapters: [] },
  { id: "b_bencao", name: "《本草纲目》", desc: "载药 1892 种、方万余，16 部 60 类分类体系，古代本草集大成。", cat: "medical", subcat: "本草", author: "李时珍", dynasty: "明",
    chapters: [] },
  { id: "b_zhenjiu", name: "《针灸大成》", desc: "集明以前针灸大成，临床实用性强。", cat: "medical", subcat: "针灸", author: "杨继洲", dynasty: "明",
    chapters: [] },
  { id: "b_binhu", name: "《濒湖脉学》", desc: "以二十七脉歌诀形式普及脉学。", cat: "medical", subcat: "脉学", author: "李时珍", dynasty: "明",
    chapters: [] },
  { id: "b_puji", name: "《普济方》", desc: "古代最大方书，载方逾六万。", cat: "medical", subcat: "方剂", author: "朱橚", dynasty: "明",
    chapters: [] },
  { id: "b_jingyue", name: "《景岳全书》", desc: "温补学派，阴阳互济。", cat: "medical", subcat: "内科", author: "张景岳", dynasty: "明",
    chapters: [] },
  { id: "b_yizong", name: "《医宗必读》", desc: "入门兼临证。", cat: "medical", subcat: "内科", author: "李中梓", dynasty: "明",
    chapters: [] },
  { id: "b_waik", name: "《外科正宗》", desc: "外科临床经典，列证示方。", cat: "medical", subcat: "外科", author: "陈实功", dynasty: "明",
    chapters: [] },
  { id: "b_pingshi", name: "《瓶史》", desc: "明·袁宏道撰，瓶花清供之谱，论瓶花之宜、忌、法，列可瓶之花目。", cat: "misc", author: "袁宏道", dynasty: "明",
    chapters: [
      { n: 1, text: "瓶史·序·瓶花之宜\n袁宏道曰：幽人韵士，屏绝声色，其嗜好不得不钟于山水花竹。天下之人，栖止于嚣崖利薮，目眯尘沙，心疲计算，欲有之而有所不暇，故幽人韵士得以乘间而踞为一日之有。\n瓶花之宜：堂中插花，二枝或三枝，或屈曲斜袅，或偃仰高下，各从其态。室中天然几一，藤床一，几上置古铜瓶、瓷瓶，插花一二枝，便自萧疏可爱。" },
      { n: 2, text: "瓶史·瓶花之忌\n瓶花之忌：一忌繁杂，二忌雕饰，三忌井水（宜泉水、雨水），四忌香烟熏触，五忌猫鼠伤残，六忌油手拈弄，七忌近酒肉旁，八忌置当风处。瓶花贵清雅，繁则乱，饰则俗。" },
      { n: 3, text: "瓶史·瓶花之法\n瓶花之法：一曰养，二曰华，三曰器。养之法：折花须清晨带露，将末处火燎寸许或捶碎，入瓶中则久。梅花以盐汁少许投瓶中可延日；荷花以乱发缠折处可保鲜。器贵古，铜瓶、瓷瓶为上，金银瓶次之，俗不可用。" },
      { n: 4, text: "瓶史·花目\n可瓶之花：梅、海棠、牡丹、芍药、榴、莲花、木樨、菊、腊梅、山茶、水仙、瑞香、蔷薇、月季、栀子、紫薇、凌霄、玉簪、芙蓉。各随时序，先后相继，室中无日不有花也。" }
    ] },
  { id: "b_xuxiake", name: "《徐霞客游记》", desc: "明·徐宏祖撰，三十余年遍历名山大川之旅行日记，地理水文岩溶实录。", cat: "misc", author: "徐宏祖", dynasty: "明",
    chapters: [] },
  { id: "b_tiangong", name: "《天工开物》", desc: "明·宋应星撰，农耕手工技术百科全书，乃粒乃服彰施陶冶舟车诸卷。", cat: "misc", author: "宋应星", dynasty: "明",
    chapters: [] },
  { id: "b_wenbing", name: "《温病条辨》", desc: "立三焦辨证，温病学说成熟标志，与伤寒分庭。", cat: "medical", subcat: "温病", author: "吴鞠通", dynasty: "清",
    chapters: [] },
  { id: "b_wenre", name: "《温热论》", desc: "创卫气营血辨证，温病辨证纲领。", cat: "medical", subcat: "温病", author: "叶天士", dynasty: "清",
    chapters: [] },
  { id: "b_shire", name: "《湿热病篇》", desc: "专论湿热病证治。", cat: "medical", subcat: "温病", author: "薛生白", dynasty: "清",
    chapters: [] },
  { id: "b_bcsy", name: "《本草纲目拾遗》", desc: "补《纲目》未载药七百一十六种。", cat: "medical", subcat: "本草", author: "赵学敏", dynasty: "清",
    chapters: [] },
  { id: "b_yifang", name: "《医方集解》", desc: "按功效分类方剂的入门读本。", cat: "medical", subcat: "方剂", author: "汪昂", dynasty: "清",
    chapters: [] },
  { id: "b_fuqing", name: "《傅青主女科》", desc: "妇科名作，重调经、带下、妊娠。", cat: "medical", subcat: "妇科", author: "傅山", dynasty: "清",
    chapters: [] },
  { id: "b_nvkejl", name: "《女科经纶》", desc: "妇科证治汇编。", cat: "medical", subcat: "妇科", author: "萧埙", dynasty: "清",
    chapters: [] },
  { id: "b_youyou", name: "《幼幼集成》", desc: "儿科集成。", cat: "medical", subcat: "儿科", author: "陈复正", dynasty: "清",
    chapters: [] },
  { id: "b_linzheng", name: "《临证指南医案》", desc: "叶氏临证实录。", cat: "medical", subcat: "医案", author: "叶天士门人", dynasty: "清",
    chapters: [] },
  { id: "b_zhongxi", name: "《医学衷中参西录》", desc: "兼汇通中西，近代临床名著。", cat: "medical", subcat: "医案", author: "张锡纯", dynasty: "清末",
    chapters: [] },
  { id: "b_yixueyuanliu", name: "《医学源流论》", desc: "医学理论批判与源流考辨。", cat: "medical", subcat: "医理", author: "徐大椿", dynasty: "清",
    chapters: [] },
  { id: "b_poem02", name: "《龚自珍集》", desc: "清·龚自珍 诗词辑录。", cat: "poem", author: "龚自珍", dynasty: "清",
    chapters: [
      { n: 1, text: "《漫感》\n绝域从军计惘然，东南幽恨满词笺。\n一箫一剑平生意，负尽狂名十五年。" },
      { n: 2, text: "《又忏心一首》\n佛言劫火遇皆销，何物千年怒若潮。经济文章磨白昼，幽光狂慧复中宵。\n来何汹涌须挥剑，去尚缠绵可付箫。心药心灵总心病，寓言决欲就灯烧。" },
      { n: 3, text: "《己亥杂诗·其二十八》\n不是逢人苦誉君，亦狂亦侠亦温文。照人胆似秦时月，送我情如岭上云。" },
      { n: 4, text: "《己亥杂诗·其一二九》\n陶潜诗喜说荆轲，想见停云发浩歌。吟到恩仇心事涌，江湖侠骨恐无多。\n（自注：舟中读陶诗三首。）" },
      { n: 5, text: "《湘月·天风吹我》\n（序）壬申夏泛舟西湖，述怀有赋，时予别杭州盖十年矣。\n天风吹我，堕湖山一角，果然清丽。曾是东华生小客，回首苍茫无际。屠狗功名，雕龙文卷，岂是平生意？乡亲苏小，定应笑我非计。\n才见一抹斜阳，半堤香草，顿惹清愁起。罗袜音尘何处觅，渺渺予怀孤寄。怨去吹箫，狂来说剑，两样销魂味。两般春梦，橹声荡入云水。" }
    ] },
  { id: "b_poem07", name: "《清诗选》", desc: "清代诗词选辑。", cat: "poem", dynasty: "清",
    chapters: [
      { n: 1, text: "〔陈三立〕《高观亭春望》\n脚底花明江汉春，楼船去尽水鳞鳞。\n凭栏一片风云气，来做神州袖手人。" },
      { n: 2, text: "〔彭定求〕《汤阴谒岳忠武故里庙像》\n忠武乡闾驻辙过，柏阴森列更摩挲。\n辞家壮志凭孤剑，报国先声震两河。\n北窖攀髯魂正远，西泠埋骨泪偏多。\n天倾宋社殊难问，可奈乾坤澒洞何！" },
      { n: 3, text: "〔谭嗣同〕《狱中题壁》\n望门投止思张俭，忍死须臾待杜根。我自横刀向天笑，去留肝胆两昆仑。" },
      { n: 4, text: "〔秋瑾〕《对酒》\n不惜千金买宝刀，貂裘换酒也堪豪。一腔热血勤珍重，洒去犹能化碧涛。" },
      { n: 5, text: "〔查冬荣〕《清稗类钞·咏罗浮藤杖所作》\n朝斗坛前山月幽，师雄有梦生清愁。何时杖尔看南雪，我与梅花两白头。" },
      { n: 6, text: "〔况周颐〕《减字浣溪沙·听歌有感》\n惜起残红泪满衣，它生莫作有情痴，人天无处著相思。\n花若再开非故树，云能暂驻亦哀丝，不成消遣只成悲。" },
      { n: 7, text: "〔顾贞观〕《金缕曲·寄吴汉槎宁古塔》\n其一\n季子平安否？便归来，平生万事，那堪回首！行路悠悠谁慰藉？母老家贫子幼。记不起，从前杯酒。魑魅搏人应见惯，总输他，覆雨翻云手。冰与雪，周旋久。\n泪痕莫滴牛衣透。数天涯，依然骨肉，几家能够？比似红颜多命薄，更不如今还有。只绝塞，苦寒难受。廿载包胥承一诺，盼乌头马角终相救。置此札，君怀袖。\n其二\n我亦飘零久。十年来，深恩负尽，死生师友。宿昔齐名非忝窃，只看杜陵消瘦，曾不减，夜郎僝僽。薄命长辞知己别，问人生、到此凄凉否？千万恨，为君剖。\n兄生辛未吾丁丑。共些时，冰霜摧折，早衰蒲柳。诗赋从今须少作，留取心魂相守。但愿得，河清人寿。归日急翻行戍稿，把空名、料理传身后。言不尽，观顿首。" },
      { n: 8, text: "〔张惠言〕《水调歌头·春日赋示杨生子掞·其一》\n东风无一事，妆出万重花。闲来阅遍花影，惟有月钩斜。我有江南铁笛，要倚一枝香雪，吹彻玉城霞。清影渺难即，飞絮满天涯。\n飘然去，吾与汝，泛云槎。东皇一笑相语：芳意在谁家？难道春花开落，更是春风来去，便了却韶华？花外春来路，芳草不曾遮。" },
      { n: 9, text: "〔张惠言〕《水调歌头·春日赋示杨生子掞·其五》\n长鑱白木柄，斸破一庭寒。三枝两枝生绿，位置小窗前。要使花颜四面，和着草心千朵，向我十分妍。何必兰与菊，生意总欣然。\n晓来风，夜来雨，晚来烟。是他酿就春色，又断送流年。便欲诛茅江上，只恐空林衰草，憔悴不堪怜。歌罢且更酌，与子绕花间。" },
      { n: 10, text: "〔纳兰性德〕《金缕曲·赠梁汾》\n德也狂生耳。偶然间、淄尘京国，乌衣门第。有酒惟浇赵州土，谁会成生此意？不信道、遂成知己。青眼高歌俱未老，向尊前、拭尽英雄泪。君不见，月如水。\n共君此夜须沉醉。且由他、蛾眉谣诼，古今同忌。身世悠悠何足问，冷笑置之而已！寻思起、从头翻悔。一日心期千劫在，后身缘、恐结他生里。然诺重，君须记。" },
      { n: 11, text: "〔纳兰性德〕《鬓云松令》\n枕函香，花径漏。依约相逢，絮语黄昏后。时节薄寒人病酒，刬地梨花，彻夜东风瘦。\n掩银屏，垂翠袖。何处吹箫，脉脉情微逗。肠断月明红豆蔻，月似当时，人似当时否？" },
      { n: 12, text: "〔纳兰性德〕《蝶恋花·辛苦最怜天上月》\n辛苦最怜天上月，一昔如环，昔昔都成玦。若似月轮终皎洁，不辞冰雪为卿热。\n无那尘缘容易绝，燕子依然，软踏帘钩说。唱罢秋坟愁未歇，春丛认取双栖蝶。" },
      { n: 13, text: "〔纳兰性德〕《采桑子·当时错》\n而今才道当时错，心绪凄迷。红泪偷垂，满眼春风百事非。\n情知此后来无计，强说欢期。一别如斯，落尽梨花月又西。" }
    ] },
  { id: "b_huajing", name: "《花镜》", desc: "清·陈淏子撰，园圃栽植专著，课花十八法、花木藤草卉木分考，清玩园艺百科。", cat: "misc", author: "陈淏子", dynasty: "清",
    chapters: [] },
  { id: "b_guangqunfang", name: "《广群芳谱》", desc: "清·刘灏等奉敕撰，御定百卷，分天时、谷、桑麻、蔬、茶、花、果、木、竹、卉、药诸谱。", cat: "misc", author: "刘灏等", dynasty: "清",
    chapters: [] },
  { id: "b_suiyuanshidan", name: "《随园食单》", desc: "清·袁枚撰，饮食论著，须知、戒单，分海鲜江鲜特牲羽族水族素小点饭粥茶酒。", cat: "misc", author: "袁枚", dynasty: "清",
    chapters: [] },
  { id: "b_poem11", name: "《历代遗珠》", desc: "各代诗词选辑。", cat: "poem", dynasty: "历",
    chapters: [
      { n: 1, text: "〔明·夏完淳〕《别云间》\n三年羁旅客，今日又南冠。无限山河泪，谁言天地宽。\n已知泉路近，欲别故乡难。毅魄归来日，灵旗空际看。" },
      { n: 2, text: "〔明·杨慎〕《临江仙·滚滚长江东逝水》\n滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。青山依旧在，几度夕阳红。\n白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢。古今多少事，都付笑谈中。" },
      { n: 3, text: "〔明·陈继儒〕《小窗幽记》\n（节录）春光浓似酒，花故醉人，夜色澄如水，月来洗俗。" },
      { n: 4, text: "〔隋·卢思道〕《从军行》\n朔方烽火照甘泉，长安飞将出祁连。犀渠玉剑良家子，白马金羁侠少年。\n平明偃月屯右地，薄暮鱼丽逐左贤。谷中石虎经衔箭，山上金人曾祭天。\n天涯一去无穷已，蓟门迢递三千里。朝见马岭黄沙合，夕望龙城阵云起。\n庭中奇树已堪攀，塞外征人殊未还。白云初下天山外，浮云直向五原间。\n关山万里不可越，谁能坐对芳菲月。流水本自断人肠，坚冰旧来伤马骨。\n边庭节物与华异，冬霰秋霜春不歇。长风萧萧渡水来，归雁连连映天没。\n从军行，军行万里出龙庭，单于渭桥今已拜，将军何处觅功名。" },
      { n: 5, text: "〔南唐·李煜〕《乌夜啼·昨夜风兼雨》\n昨夜风兼雨，帘帏飒飒秋声。烛残漏断频欹枕，起坐不能平。\n世事漫随流水，算来一梦浮生。醉乡路稳宜频到，此外不堪行。" },
      { n: 6, text: "〔南唐·李煜〕《谢新恩·樱花落尽阶前月》\n樱花落尽阶前月，象床愁倚薰笼。远似去年今日，恨还同。\n双鬟不整云憔悴，泪沾红抹胸。何处相思苦？纱窗醉梦中。" }
    ] },
  { id: "b_jinbo", name: "《金波旬花》", desc: "明王与清凝，自昆仑雪峰下那片金色花海始。", cat: "story", author: "鸿影",
    chapters: [
      { n: 1, text: "翻越重重雪峰后，阎明眼前豁然开朗——山壁嶙峋如刀削斧凿，云海漂浮在半山腰，其下碧湖密林、大河草原，皆是青绿之色，让连看多日白雪皑皑的她精神一振；又有佛塔宫殿，彩瓦金顶、异域风情，令人心生好奇。\n她轻抚自己的剑柄，剑名龙渊，三尺七寸，诸剑之首，是她的佩剑；山名昆仑，万山之祖、西极之极，在她脚下。\n何人不生豪情万丈？\n而她只是望着此剑此山微微勾起唇角，便寻觅下山的路径了。\n穿过云海才发现，山脚下又有小山，连绵的宫殿依山而建，山坳处碧波荡漾，大片金色花海，美得妖异。花太绚丽，阎明不敢触碰，运功屏息，直接轻功越到另一端，先行至湖边捧水洗脸缓解疲惫。\n忽闻有女子的清脆笑声。她稍掩行踪，循声而去，只见前方湖边，一名金冠披发的少女，白衣，蓝裙，赤足，正与近似人高的猛虎嬉戏，旁边还有一大一小两头白色大象仿若无事般玩水打闹。\n尽管阎明已经屏息，望见人、虎、象这般近距离在一起玩闹，不由心下一惊，泄露了半瞬气息。\n那湖边少女立时警觉：“谁在那里！”说话间快速拿起身侧长弓瞄准了阎明的藏身之处，猛虎也变为压低身体的半匍匐姿态，向着她发出低吼。\n阎明慢慢举手走出来：“在下阎明。路过贵地，无意冒犯姑娘。”\n“路过？”少女疑惑地重复这个词，保持着拉弓引箭的姿势，显然并不相信：“圣湖入口皆有我教弟子守卫，怎么可能平白路过？”\n阎明镇静自若，指指背后的大山，道：“这里也有守卫吗？不好意思，没有看到。”\n少女大惊：“什么？！你从圣山那边而来？”她仔细端详阎明片刻，倒是有些相信这个说法。收起弓箭、摸摸老虎，她露出好奇的表情：“我还是第一次见有人翻过圣山呢，山壁那样陡峭，从没人能上去。山那边是什么样子的？”\n阎明走上前来，猛虎又发出低声威胁，被少女挠挠下巴才作罢。\n“山那边的人没有什么特别有趣的，倒是风光景色大有不同……”她随口讲了几句中原风物，发现少女已然倚着老虎听得入迷，样子颇为可爱。\n她停下片刻，少女才反应过来：“不好意思，我叫清凝，它叫达温。第一次听说这些故事呢，还能再给我讲讲吗？”\n两人就这样攀谈起来。清凝催促她讲了许多中原故事，讲长江大河，讲塞北江南，讲长城巍峨，讲园林幽然。聊至兴处，还给她摸了摸老虎达温。\n她也了解到此地背景，为明教总舵大光明宫的圣地，明教信奉圣神明尊，清凝正是教中圣女。其外皆是明教属地，教主那伽控制着整个教派的实务。又问来时路上遇见的金花，答为梵语，其音近似为金“波旬”花，吸入花香或触碰花瓣便会中毒，剧毒无比，沾之无解。\n不知不觉天色渐晚，远处有人呼唤圣女，清凝依依不舍与她告别，又多次叮嘱她注意隐蔽、小心行事，圣地不许外人进入，被发现会被就地诛杀。阎明点头答应，初来此地，她无意陷入纠纷，自然要听从建议。\n看到阎明隐起身形，清凝大声应和呼唤，一位棕黑肤色身形健壮的中年女子匆匆走来：“圣女怎么和达温在外面玩了这么久。刚刚好像有道人影？”\n“圣地怎么可能有其他人影，帕陀你眼花了吧。”清凝上前亲热地挽起帕陀，“不小心玩久了嘛，不要说我了。”\n帕陀仍怀疑地看了四周几眼，才说：“圣女已经是大孩子了，怎么还贪玩，小心风吹多了头痛。教主知道要生气了。”\n清凝撒娇：“哎呀，你不说就没人知道了~”\n两人渐行渐远，没入宫殿深处。留下老虎达温，无聊地卧在原地打哈欠。" },
      { n: 2, text: "清凝跟随帕陀的引路，一直走到正殿，那伽正闭目端坐在主位，听到她走进来，睁眼问：“我的圣女，今天怎么玩了这么久？晚饭都凉了。”\n清凝些许吃惊，没想到那伽突然要与她共进晚餐，只好重复一遍说辞：“不小心玩久了……”\n那伽不置可否，只是淡淡地说：“晚饭都凉了，没有人给圣女热一热吗，侍女何在？”\n侍立在旁的侍女们立刻跪地求饶，那伽挥挥手，殿外的侍卫进来拖起她们就走。\n清凝刚张嘴还未出声，那伽就说：“圣女可千万不要替她们说情，否则我的心情不会很好，不知道还有谁会遭殃呢。”\n清凝浑身一颤，低下头。明白那伽是在惩罚自己的晚归。\n“快点入座吧，”那伽仿佛没有看到这一幕，又吩咐帕陀，“去看看新的晚饭怎么还没上。”\n一餐用完，清凝心中还在为侍女难过，快速行礼后离开了。\n那伽则听帕陀汇报圣湖边的疑点，他十分重视，亲自去了一趟。细查之下确实有些发现——金波旬花海旁侧有半个不起眼的鞋印——这本不是大事，有几个人接触了金波旬花还能完好活着？但是达温的爪子上挂着一丝织物的细线，并非清凝或帕陀等侍女穿着的布料，说明有控制之外的人接触过达温，可以等同于有人接触过清凝，这是那伽所不能容忍的。何况若是此人从圣山另一侧来，又涉及到了一个不该清凝知道的秘密。\n于是这夜大光明宫灯火通明。巡逻队伍增加了两倍，到处追查这神秘接触到圣女的人。\n圣女本人则被蒙在鼓里。\n清凝看外面比平时戒备森严了许多，巡逻的人一队接着一队，有些疑惑：“今夜怎么这么多巡逻的人？”\n帕陀平静地回复她：“只是进了小贼，正在捉拿，很快就好。若是惊扰到圣女了，我去让他们小声点。”\n“没有惊扰到，”清凝立刻联想到新结识的阎明，又没法只说，只能暗自担心，看着窗外发呆。\n帕陀隐约猜到她的想法，又想到自己要做的事……在心里叹一口气，上前提醒：“圣女，这个月还没有为明尊准备祭礼……”\n“啊，是哦，端上来吧。”\n帕陀沉默地端来托盘，金盆、金刀、金杯陈列其上。\n清凝打起精神坐正，合掌祈祷一阵，之后解下护腕——光洁的小臂上，赫有若干条伤痕交错，而她清洁过双手，拿起金刀，划向自己！\n红色的鲜血滴落在金杯中，很快盛满这华丽的容器。\n她的脸色白了几分，疲惫地说：“好了，拿去吧。”\n身侧，帕陀已经拿来了伤药，熟练地托起她的手腕仔细涂抹包扎。\n清凝看着帕陀低头忙碌，问起来：“最近来求药的子民多吗，上个月那个孩子的病好了吗？”\n“……方才刚来了一个，在外门祷告；上月那个已经好了许多。”帕陀回答道，“您早点休息吧。”言毕，手上也已经为清凝处理好伤口，端起装满鲜血的金杯，行礼退下了。\n帕陀一路端着金杯，行至教主寝殿。\n那伽慵懒地躺在榻上，一条金蛇在他手臂上盘旋，他便无聊地逗弄着这条蛇。听到帕陀的脚步声，他没有转头，漫不经心地问：“圣女有说什么奇怪的话吗？”\n“……只问了问来求药的信众。”\n那伽噗嗤笑了一声：“圣女总是这么单纯。”语气中几分嘲弄。顿了顿，他又说：“那个神秘人还没有抓到，我不太放心，你还是做准备吧，若是她最近表现有异，就再给她加一针。”\n帕陀有些不忍：“圣女已经时常会头痛了，再加恐怕……”\n“乌咕那边有好消息吗？”\n“还没有。”\n那伽面上还带着笑，一只手捏住手上的蛇头，另一只手猛然发力，竟是生生抠出了蛇胆！他随手把蛇尸扔在地上，捏起绿莹莹的蛇胆，塞入口中生嚼。\n帕陀端着金杯上前。他看也不看，直接一饮而尽，闭目运功，罢了，喟然长叹一声，说：“合适生辰的童女这么难找，看来还得省着点用。她若头痛，多用点药吧。”" },
      { n: 3, text: "阎明小心地探索这名为大光明宫的明教总舵。\n无怪乎清凝一开始不相信她的“路过”说辞，实在是这里守卫森严，哨岗遍布，配合交叉巡逻的小队，堪称铁壁铜墙，常人根本无法进入，更勿论进入圣湖区域。\n但阎明并非常人——翻越昆仑山之前，她已经循着榜单连续击败了十几位颇有名气的武林高手，无聊之下才决定探寻域外之地。\n她观察了哨岗布置和巡逻规律，重中之重是教主和圣女的寝宫，最外侧则有供奉明尊的圣殿，允许部分信众进入——不包括寻常百姓，那衣着褴褛、赤足三步一叩首走来的虔诚者，并未获许准入，在圣殿外长拜不起；抱着婴孩的憔悴妇人，正在门外苦苦哀求。\n有人端了碗清水来给她，阎明认出是呼唤清凝吃饭之人。\n帕陀只是给了这妇人一碗水，叫她喝完便离开，不要妄想见到圣女，圣女正在为明尊的祭礼做准备。她说完就离开了，妇人还搂着孩子哭诉孩子已经病了多时了，圣殿的守卫便来驱赶妇人，圣药有限，岂是她想要就要的？\n阎明听到对话中提及圣女、圣药、祭礼，有些好奇，远远跟上帕陀行动，看她沉默地返回自己的居所休息，没有其他举动。这处距离圣女寝殿不远，阎明又去看看新结识的朋友。\n\n清凝正躺在床上，翻来覆去地睡不着。\n阎明看她没睡，干脆现身：“怎么，睡不着？”\n清凝惊喜地坐起来，看到阎明示意噤声，压低了声音：“你怎么还没走？”说着挪动身体，拍拍空出的位置。\n阎明在她身侧坐下，看向她：“在你们的大光明宫到处转了转，没想到外面就有圣殿。”\n“圣殿是供奉明尊的地方，当然要有！会有许多子民来祷告，有人病了还可以求药。”说到信仰相关，清凝的眼睛亮晶晶的。\n阎明有些迟疑，但还是告诉清凝：“我看到有人抱着孩子求药，帕陀给了她一碗水，然后守卫就把她赶走了。”\n“什么？！”清凝不敢相信地惊呼，一时没控制住音量，还是阎明立刻用手捂住她的嘴唇。她“唔唔”了两声，冷静下来。\n阎明把手撤下，看清凝面色苍白，显得落寞可怜，不知该如何安慰，想来想去还是说起她喜欢的话题：“你喜欢中原，我再给你讲讲？”\n清凝还沉浸在方才听到的消息里，有些语无伦次：“我以为……我每个月都为明尊准备祭礼，他们说会分一些圣药给生病的子民……”\n阎明犹豫地把手搭在她的肩膀上，清凝受到提醒，期冀地问：“……你能不能帮我一个忙？去看看小辛，那个孩子，上个月我帮他看过病的，看看他好些没有……”\n阎明应下了。\n\n次日清晨，帕陀来照顾清凝起居时吓了一跳，清凝脸色雪白，有气无力地躺在那里：“帕陀，我的头好痛……”声音低得像蚊子哼。\n帕陀连忙找药，扶她靠在自己怀里，水和药都喂到嘴边喝下，还是喊痛，帕陀叹口气，轻轻按揉她头上穴位，看她缓缓闭目睡着才停。\n晚些时候那伽也来看她，神色和缓地嘘寒问暖：“听帕陀说你早上一直喊头痛，好些了没有？”\n清凝犹犹豫豫还是问了：“我每个月的血，做的圣药，真的有给来祷告的子民吗？”\n“当然！”那伽一副吃惊的样子，“好孩子，是不是有人对你胡说八道了？是谁，让他亲自来跟我说说看，是不是下面的人办事没办好。”\n“没有什么人，我就随便问问。”清凝低声说。\n那伽却收敛笑容眯起了眼睛：“真的没有吗？我看达温和什么人玩过，人找不到，老虎还在，直接杀了吧，虎骨还能入药呢，虎皮也有用……”\n“你疯了？！”清凝失声喊道，她简直不能相信自己的耳朵。\n那伽盯着她冷酷宣告：“圣女本应保持贞洁、侍奉明尊，圣女之颜不可示于外人。圣女清凝私自接触外人，且拒不回答，软禁三日；三日后还是冥顽不灵，直接和老虎达温处死。帕陀，准备一下吧。”说完即甩袖走人。\n清凝不明白，她只是和从未见过的外乡人聊聊天，平时对她还算不错的那伽直接翻脸到如此地步，她和她的老虎都要被处死。但她又明白，那伽是个喜怒无常且嗜杀成性的人，他本就杀人如麻，要杀她也不算特别意外的事，达温只是附带威胁她的筹码罢了。\n事情想多了，清凝的头又痛了起来。" },
      { n: 4, text: "阎明按清凝给的信息外出一趟，返回来正听到了那伽发怒的全过程，既为清凝维护自己而感动，又为清凝担忧，心生几分怜惜。听到那伽走远了，剩下的气息不足为惧，她翻窗进入室内。\n清凝看到她亦是又惊喜又委屈。短短一天内，周遭情势急转直下，只有阎明这个初相识的人赤诚待她。\n两人都不敢大声，阎明运功传声入耳，让清凝只比划手势就好。\n阎明：你没事吧，我看到你很憔悴，还吃药？\n清凝摇摇头，睁大眼睛看她。\n阎明：你让我找的那个孩子，上个月就死了……\n清凝的眼眸黯淡了，低下头去。\n阎明：我听到你们教主说要处死你，我带你离开这里吧……趁着现在他刚走，越早越好，尽快离开这是非之地，循着我来时的路，一起去中原。你若同意就带件方便行动的厚衣裳，雪山很冷。\n清凝迟疑了。她思考片刻，点点头。快速收拾好，挎弓、背箭、系刀，又从柜子里掏出两瓶药，倒出一颗示意阎明吃掉。\n阎明不解但沉默照做，揽起清凝离开这里。\n\n起初很顺利。\n阎明的轻功甚是不错，怀中揽着一个人还能无声无息地飞至圣湖寻找达温。\n但湖边的大象看到她们倏然啼叫起来。行迹败露，那伽在几息间就出现在她们面前。\n“清凝啊清凝，你真让我失望，要跟着别人离开我吗？”那伽含笑发问，眼睛却如毒蛇一般阴暗地锁定阎明。\n阎明把清凝放下，让她在背后躲好，自己抽剑迎战。\n那伽并未出手，仍在追问清凝：“我的圣女，你真的要走吗？”\n清凝有些气息不稳，但还是坚定地回答：“是。你把我圈养在大光明宫，骗我放血，现在还要杀我和达温，我没得选。”\n“好吧，那我也没得选。”那伽的笑意更深了，他摇摇头，吐出一串梵语。\n阎明的警觉炸开，她的背后刺来毫无杀意的一刀！\n是清凝。\n清凝此刻脸上是不敢置信的表情，身体却如一名毫无感情的杀手，拿着防身的弯刀发出各种冷酷招式，刀刀致命。\n阎明顿感投鼠忌器，她完全可以一击结束清凝的攻击，但她不想伤害清凝，只能在狼狈躲闪中观察。毫无疑问，那伽出声控制了清凝。如果攻击那伽，能否从源头解决问题呢？\n她出剑攻向那伽。\n那伽取出一双锋刃金环迎战，同时吹了声呼哨，窸窸窣窣的声音响起，数条毒蛇包围了她们。\n达温咆哮一声，与毒蛇战作一团。\n长剑同时与弯刀、圆环、伺机而动的毒蛇作战，阎明既要应对攻击，又要防止伤到清凝要害。毒蛇散发着腥臭味，她早就封闭了呼吸，还是感觉逐渐有些头晕，一招不慎就被那伽的金环割破了左臂。\n又是几个回合，阎明还在咬牙寻找打晕清凝带她逃离的机会，那伽先有些疑惑：“竟然能在金波旬花毒下坚持这么久，你也是个人物了。”\n毒？阎明心念电转，想起了清凝塞给她吃的药丸。她没有作声，开始装作毒性发作虚弱不敌的样子，试图引诱那伽轻敌犯错。\n终于，清凝再一次刺向她的要害时，阎明没能避开，腰侧被割开长长一道伤口，鲜血瞬时洇开。\n那伽的招式不再凌厉，改为戏弄居多。\n疼痛刺激了阎明的感官，她捕捉着那伽放松后的破绽。而清凝手上还在不受控制地进行攻击，她眼中盈满了泪水，簌簌顺着面庞滴下，滴在阎明的剑上碎成几瓣。\n还好自己喜欢穿黑色红色的衣服，耐脏，阎明莫名笑了一下。\n看到阎明苦中作乐的笑容，清凝的刀变慢了。她面上尽是痛苦挣扎——或许她一直在苦苦挣扎——她终于、终于——清凝惨呼一声倒地抱头，不动了。\n阎明和那伽都愣了一下，阎明顾不得其他，以硬挨两记金环为代价，给走神的那伽来了个腹部对穿，右手还拿着剑，受伤的左臂搂住清凝，运起轻功踉踉跄跄跑走了。\n身后，达温发出最后一声虎啸，扑向那伽。" },
      { n: 5, text: "清凝，清凝。\n两人跌跌撞撞落在了金波旬花海旁。\n阎明没有太多力气呼唤了，试探了清凝的鼻息，微弱但还活着。\n已知这花剧毒，但阎明在战斗时受伤加中了蛇毒，内力几乎耗尽，无力再支撑轻功飞过花海了。她在清凝衣衫中摸索出清凝喂过她的药，倒出一大把来分成两份，一份自己吃下，还有一份，清凝昏迷中难以吞咽，她含住药丸以唇舌渡入清凝口中，看她喉咙微动咽下。\n清凝还在昏迷。\n有鲜血汩汩从她发际流下，阎明摸摸她的脑袋，竟然摸到要穴上扎着两根金针，此时弹出了半寸。或许这就是那伽控制清凝的手段。她把金针拔出扔掉，向清凝体内打入残余的内力为她护持心脉。\n阎明背起清凝，一步步从金波旬花中走过，她们的鲜血滴滴嗒嗒，滴落在花朵上，留在一步一个脚印中。\n\n清凝不知道自己昏迷了多久，或许是十几年。\n她猛然醒来，脑中多出了许多记忆，爹娘开心地看着蹒跚学步的自己、自己走在路上和村人不断打招呼、莫名其妙的大火与哭喊声、自己跟着那伽来到大光明宫……那伽是烧毁自己村子的元凶！\n头又开始痛，愈演愈烈，她继续咬牙回忆。\n她发现那伽为了带走自己故意放火烧掉村子、父母生死未知；她想复仇，但那伽在她身边布置了太多人手，被发现了，那伽说给她仁慈。哈哈，仁慈，那伽用金针封住她的记忆，让她继续当这个凶手的圣女，他管这叫做仁慈。\n每当她情绪剧烈波动之时，金针松动，记忆浮现，那伽就重新给她扎针，若是压制不住就再加一根，一共三根针，钉住了她的前十几年！\n清凝从头上拔出阎明没有摸到的最后一根针。头痛感消散了许多。荒谬感却增加了。\n她掏出怀中另一瓶药，丢在地上。这哪里是治疗头痛的药，这是微量金波旬花调配的镇痛毒药！\n清凝缓过心神，赶紧给阎明把脉。阎明伤势颇重，夹杂着乱七八糟的蛇毒，面上尽是毒性上涌的青黑色。有金波旬花毒在时，花毒最毒，阎明不知剂量，为了带她过花海，服用了太多解药，花毒被压制，蛇毒便起效了。\n她拿起阎明的剑划破自己的胳膊——她在大光明宫日日耳濡目染，那伽有意让她和毒药打交道，身上血液有抗毒性，偶尔也会直言需要她的血，说是圣女的义务，她也因此偷摸研制出了金波旬花的解药——鲜血涌出，她把伤口贴到阎明嘴唇让她饮下，直到阎明脸上中毒的青黑色褪去。\n观察环境。现今两人深处密林边缘，密林依山而生，穿过密林就会上到雪山脚下，翻过山是阎明的来处、讲给她听的中原，或许也是她自己的故乡。但她们的状态，还能翻过雪山吗？\n——不，她不允许阎明为她折在这里，她自己也还未亲眼见到那伽咽气！\n清凝抹了把自己的脸，眼泪、鲜血和泥土，乱七八糟地糊在一起。她咬牙背起阎明，走进密林。她要去找药草来救阎明！" },
      { n: 6, text: "那伽腰腹处缠满了绷带，倚在榻上听下属汇报搜寻结果。\n血迹从圣湖边一路延伸至金波旬花海，花田边有人倒下挣扎的痕迹，而后是一串跌跌撞撞的血脚印通向花海深处。\n花毒无解，平日里只有教主、圣女和乌咕去看过。教主在榻上，圣女跑了，乌咕前几天被派外出，何况就算是他们三个也不敢不做防护走进花海。\n没有亲眼见到尸体，那伽气不顺，又下令把达温的皮剥下来挂在圣湖边上！\n帕陀来请示，圣女跑了，没法取血怎么办？\n那伽不耐烦地说，先找几个童男童女来吃。又问，乌咕还没找到生辰合适的童女吗？\n答曰没有。金制的水壶立时砸在帕陀的额角。\n滚！\n帕陀退下。\n\n另一侧，阎明渐渐醒转，许久没有这般虚弱的感觉了。她扶着树壁坐起，看看自己不知道在哪棵千年古树的树洞里，一小束阳光斜斜照在她脸上，身上的伤处都敷了一层草药。\n少女的脸庞出现在洞口，关切地问：感觉怎么样？”\n阎明试图说话，发现嗓子哑得很，几次发声都失败了，倒也没有想象中破得厉害。清凝递来一角叶片折成的杯子，阎明饮下，再次尝试说话：“你，还好吗？”\n清凝的眼泪又滴下，滴在她的手上，滚烫。\n清凝笑着说：“我很好，从来没有这样好过。你也快些好起来，我要找那伽报仇，然后我们还要去中原。你说会带我去中原。”\n“好，我努力快些好起来。”阎明擦去清凝的眼泪，“你不要一个人犯傻。”\n清凝的医术果然高明，兼之阎明本身就是武学高手，底子好得很，运转内力调息也能恢复状态。她以调息代替睡眠，不知疲倦般地调息，实在累了就和清凝聊天。清凝则悉心照顾她，警戒、觅食、找水、换药，又想办法制些内服的补物调理，忙得不可开交。\n几天过去，阎明说已然恢复了七八成、可以带清凝再入大光明宫时，清凝整个人战意燃烧，仿佛在发光。\n检查装备。阎明的龙渊剑在手，如同握住了天下；清凝的短刀在圣湖边战斗时遗失了，但她弓箭的技术还在，可以一战。\n阎明带着清凝跃过花海，许多甲士守卫在圣湖旁边，落地即进战。\n这次是白天，阎明还有心情告诉清凝自己所用的剑招名字，这一式是明夷于飞、有三招变体，那一招叫风雨如晦、讲究剑随气转。阎明在前面开路，清凝在后方策应，时不时从满地倒下的人身上回收箭支，她可以一箭三发轮射、指向不同的目标。两人以突进为目的，并未下死手。有些教众没搞清楚状况、不忍伤害圣女、比划几下佯作不敌，她们也没有追击。\n这般一路行进到湖边，看到达温的虎皮，清凝险些崩溃，阎明一把搂住她，今天就是来报仇的，振作起来，为所有的过往报仇！\n两人就这样边战边进，一路冲进大光明宫正殿前的广场，那伽连人带榻倚在正殿门口，帕陀带着两头大象护卫在广场上。\n“帕陀，你一定要拦我吗？”清凝向她喊话。\n“帕陀忠于教主。”健壮的中年女子回答道。\n那伽又大笑起来：“我的圣女，是来杀我的吗，记忆都恢复了？没发现向我告密的经常是帕陀吗，你来杀我，怎么还想放过她？”\n清凝咬紧嘴唇。被阎明拍了拍肩膀。\n她深呼一口气：“我没事。”\n阎明迎向帕陀和两头大象。清凝扔掉手中的箭支，缓缓将弓拉住满月。\n“哎呀，你的无箭之箭练成了吗，之前不是经常撒娇不想练了吗？”那伽又调笑两声，认真起身。\n帕陀倒地，大象悲鸣，追着阎明冲锋。阎明跳到那伽面前和他缠斗。\n清凝闭上眼，手中无箭，心中有箭，无箭之箭，以她滔天的恨意与血泪为箭、以她失去的自由、失去的记忆、失去的一切！出箭！\n箭出。\n那伽仰面倒下，心口正中一道箭伤。" },
      { n: 7, text: "那伽既死，大光明宫乱作一团，战斗的守卫纷纷丢下武器，几名那伽的死忠有心报仇却打不过阎明，当场追随那伽而去。\n明教涉及的事务太多太广，不能轻易解散，因此需要一位教主处理各项事宜。这名号无可争议地落在前任圣女清凝的头上。\n清凝又封阎明为明王，任副教主，协理一切教务。因为决战时阎明从花海杀穿到正殿，教众私底下都喊她“阎王”。\n两人合力理清那伽留下的烂摊子，该放的人放走、该毁的花毁掉，执迷不悟的那伽铁杆支持者只能清除，一心为明教的死忠教众派去经营正当生意，穷奢极欲的各式玩意儿换成现银，当工钱发给干活的人；虔诚祷告求药的信众，指路去正经看病。\n待到尘埃落定，几个月都过去了。\n\n这天教主传召明王议事一整天，却既不见传用食水，也不见人出来。胆大的执事忍不住推开议事殿的门，发现里面空空如也，只剩一张字迹飞舞的纸条：黑帮邪教，解散为好。" },
      { n: 8, text: "番外\n“小~明~我累了，坐下歇会儿吧。”少女坐在路边茶摊撒娇，手上转着一支碧绿的笛子。\n被称作小明的黑衣女子不做言语，在她旁边坐下，向摊主招手示意。\n摊主是个老头儿，直接捧来一壶茶热情聊天：“累了多半是口渴了，喝这个绿茶好，解乏的嘞。二位是外乡人吗？这位小姑娘怪面善的。”\n清凝来了兴趣：“老爷爷，看我面善吗，像谁？”\n老头儿本来只是有点模糊熟悉的感觉，听她一问努力回想半天，一拍大腿：“像我一个大侄子和侄媳妇！哎呀，他俩有个女儿，小时候村里进了强盗，还放火，这个女娃娃就丢了，哎呦，他们俩就一直找啊找，找啊找……”\n清凝愣住，声音开始颤抖：“你说的那个女娃娃，叫什么？”\n老头儿像是意识到了什么：“孩子，李清凝啊，李家村的李清凝啊！”\n“阎明，阎明，你听到了吗？”清凝向她寻求肯定。\n阎明点点头，揽住她：“喝完茶我们去看看。”\n“嗯！”" }
    ] },
  { id: "b_liangshi", name: "《两时花》", desc: "如果明王先遇到清凝。", cat: "story", author: "鸿影",
    chapters: [
      { n: 1, text: "“这孩子，娘死了，爹被抓去前线……”\n“……唉，都不容易，我老头子总归是村长，先跟着我吧。”\n“这么小的女孩，晚上在我家住吧。”\n小小的孩子从屋里探出头，懵懵懂懂地看着大人们在院子里说话。平日里亲近的邻居姐姐雀儿，和蔼的村长爷爷，还有平日里不爱说话的叔叔，都围在一起说些她听不懂的话。\n扒在门口久了，不小心碰到门，发出吱呀响动，大人们转过头来看她。雀儿姐哎呦一声走过来，蹲下摸摸她的脸，问：“清凝啊，饿不饿，去村长爷爷家里吃饭吗？”\n清凝说：“饿！”\n于是村长连忙说：“乖啊清凝，走，去村长爷爷家吃饭去，吃完晚上到雀儿姐家里住，她一个人害怕。”\n这天小小的清凝难得吃到半块糖，放了很久的糖有点怪味，在乱世中却已非常难得。\n半夜清凝惊醒，悄悄地下床推门出去，天上残月半弯，在孩子的眼里波光荡漾，静静地淌下。她好像模模糊糊知道爹爹不见了，越想越伤心，决定去找爹。\n外面黑咕隆咚的，只有淡淡的月光，她按记忆往家的方向走，出了雀儿姐的院子旁边应该就是，走快了没留意脚下，摔了一跤，浑身都是泥土，灰扑扑的，自己爬起来，继续跌跌撞撞地走。\n路好长，走了好久，两边都是野地，偶有野狼嚎叫。她渐渐忘了自己在哪里，只记得喊爹娘。\n终于分辨出一幢建筑，她晕晕乎乎走进去。\n那是一座破败的神庙，庙里也黑漆漆的，屋顶破了洞，月光得以照亮一尊未完成的女神像，头部雕得很仔细，双髻，眉间一点朱痕，戴长长的耳饰，越往下越粗糙，背后的花纹也未完成，工匠不知去向，在战乱时候倒也正常。\n女神淡淡垂目，看着走进来的小小孩童，表情无悲无喜。\n清凝抬头盯着女神的发髻，竖起来的包包好像兔子耳朵，这样想着，她放松下来不再哭叫，靠在神像下睡着了。\n再次醒来是听到呼喊。\n“清凝——清凝——”\n清凝动了动，揉眼醒来，回应喊道：“雀儿姐！我在这儿！”\n雀儿快速冲进来：“可算找到你了，没事儿就好，没事儿就好，怎么跑到这儿了……都怕是被狼叼走了……”\n清凝指着神像，说：“雀儿姐，有兔兔。”\n“哎呦，这可不是兔子，这个是神仙，是阎王哟……”雀儿看看神像，可惜地说：“哎，都没雕完就打仗喽……”\n她上前三拜神像，双手合十：“阎王大人莫怪，小孩儿不是故意胡说的。谢谢大人保佑着这孩子。”\n清凝也学着双手合十，在心里悄悄问：“神仙啊神仙，他们说爹被抓去打仗了，世上为什么会有打仗呢？”\n很正常的，没有任何回应。\n拜过神像，雀儿牵起清凝的小手往外走：“赶紧回去吧，大伙儿都在找你呢。”\n迈过门槛，离开之前，清凝又回头看了一眼神像，女神的脸一半隐入黑暗，一半被月光照亮。\n\n时光流转。\n清凝已经习惯了新的生活，和村里的大家一起过日子，穷人家的孩子早当家，小小的孩子已经懂得帮村长爷爷和雀儿姐干活儿，玩耍也有分寸，不会野得找不到人。\n只是偶尔想独处的时候，会跑到村外的庙来，和神像说说话。\n“神仙啊神仙，他们叫你阎王，你有名字吗？”\n“神仙啊神仙，你的发型为什么像兔子耳朵呢，是不是喜欢兔子？”\n……\n“神仙啊神仙，他们说爹死了，再也不会回来了，人为什么会死呢？”\n“神仙，我想好好学医！我爹是大夫，以前他会给大家看病，现在没人会看了，我只能自己看书，好多字都不认识……”\n……" },
      { n: 2, text: "这天清凝和村人遇上强盗打劫。大刀将要砍到清凝时，一道身影出现，挥袖击倒了他们。强盗完成不自量力自讨苦吃、跪地求饶的流程，跑掉了。\n清凝两眼发光：“好厉害！”而这身影转过来时，她呆滞了一瞬，脱口而出：“……阎王！”\n被称为阎王的女神嘴角弯起一抹若有若无的弧度。\n女神打量一番在场众人，清凝脸蛋灰扑扑的，眼睛很亮，没有其他受伤痕迹；负责搬运的壮丁，主力多多少少受了伤，余下的老幼妇孺状态尚可。她抬手治疗了几个重伤的村民，完了还没说话，清凝直呼:“我要跟你混！我想学救人！”围着她小狗打转，这时是一点儿都不拘谨、丝毫不见方才强装勇敢镇定的样子。\n雀儿见她不置可否、并无不耐烦，大胆说情：“清凝是个好孩子，她可喜欢您了，经常往您的神庙里跑，还给打扫得可干净了。”\n村长也在旁边连声道：“是哟是哟，清凝很有天分的，她爹以前就是村里的大夫。”\n女神淡淡地说：“我知道。”\n“弟子清凝，拜见师父！”清凝打蛇随棍上，立刻下跪叩头。\n女神有些好笑：“我还没同意呢……罢了，你跟着我吧，拜师的事情再议。”她向清凝伸出手，清凝握住站起来，贴在她身边站好，开心得眼睛眯成缝了。\n她有点不适应这种被活泼妹妹无赖般贴近的感觉，转移话题：“……雅婷，处理一下剩下的事。”\n“哎，好！”一名黄衣大汉上前，有条不紊地开始指挥众人行事。村中自愿者，可按指引迁徙到酆都附近，算是受阎王庇护，与外界联系不多，但胜在自给自足、不受战乱波及。\n\n女神说，她叫阎明，大家通常称她明王，清凝马上改口：“明王！”小声嘀咕：“我喜欢明王这个名字，比阎王好听。”\n明王不置可否，说：“你想好，现在还可以反悔，否则跟着我，必须成仙之后才能独自出酆都。”\n“好！”\n“不问为什么？”\n“你一定有你的道理，肯定是为我好~”\n明王再次感到那种奇怪的不适应感，清凝太过直白热情，也不畏惧她阎王是身份，她还没有遇到过这种情况：“……因为你是极其罕见的治愈系，加上你，至今一共现世6位，其中有4个都死了，不得好死。”\n清凝认真抠手指算数：“还有一个呢？”\n“是我。我已修炼成神了。”\n“好厉害！”\n“没有别的要问？”\n“我也想和你一样厉害！”\n“那你多努力。”\n\n明王带着清凝见过酆都重要人员，黄衣大汉自称七刀，但大家都叫他雅婷；小小的谛听、温柔的姝玥、黑白无常……清凝也哥哥姐姐嘴甜叫着，还和谛听比了比身高。\n这晚清凝独自睡觉，有些小激动，按习惯是在心里和女神仙说悄悄话的，可是自己现在就住在神仙家里，想到这儿又乐呵起来，最后笑着睡着了。\n\n明王还没有正儿八经的收过徒弟，想到这个话题，她会审慎看待自己：足够强大吗、可以很好地保护徒弟吗？可以顾好徒弟的方方面面吗？可以教好徒弟吗？\n她可以保护自己，她也努力庇护信任她加入酆都的妖精。但是，一个小小的人类，还是治愈系，将来会遇到多少麻烦事呢？\n可她必须做到，她经历过风风雨雨坎坷磨难，那时的她是如何渴望被保护、如何憎恨这个可恶的世界的？\n她无法视而不见，让这个同为治愈系的小女孩无知无惧地面对风险。\n她也无法拒绝这个小女孩的热情和信任，供奉她的信徒并不多，她曾悄悄给每一座自己的神像都留了一丝灵力倾听祈祷，而人类建筑的神庙逐渐因战乱荒芜，在小清凝第一次对着神像说话的时候，她已有一段时日没有再听过来自人类的声音，孩童如何询问生死。\n天色亮起来了，明王去看自己捡来的麻烦。\n清凝在床上睡得四仰八叉。\n突然一激灵，揉着眼睛坐起来，梦游一样整理衣服然后爬下床。转头看到明王，愣住。\n明王问：“起这么早？”\n清凝挠头：“本来该起床干活儿的，雀儿姐要生火、烧水、做饭、去地里，我就搭把手。”睡得乱糟糟的头发变得更乱了。\n明王有点看不下去：“到镜子前面来，我给你梳头。”\n刚开始她的手法带着一丝生涩，渐渐地像是回忆起来，左右扎出一对堪称精致的蝴蝶发环。\n清凝摸摸自己的头发，惊讶地说：“阎王也会扎小孩发型吗？”\n明王轻敲她的头：“我不是天生下来就是阎王。”又揉了一把，说：“早上起来先锻炼身体，学习修炼。你想学医，这里有全部人类的医书，自己看，不清楚的可以问复奚言，生活有问题问雅婷。”\n“好！谢谢明王大人！”\n\n酆都就这般增加了一只小豆丁。\n小豆丁又渐渐抽条，娉娉婷婷，绣面芙蓉一笑开，对于妖精来说，人类的成长速度着实惊人，酆都各处都留下了她成长的痕迹。\n清凝的生活很是规律，每天修炼、学习；每半月，明王陪着她去看望李家村的大家，村长、雀儿姐、爽哥、片片……此外每年不定期出去转转，看看风土人情、找找各种草药，兼上手实践医术，毕竟实践出真知，酆都里都是妖精，很难让她施展。\n会出门，自然也会带东西回来，花园里见缝插针地种了许多草药，外面还有一大批药田供她施展。谛听都被她抓着记了些草药种植的要点，方便帮她照看。麻烦的活儿，大家都来帮忙，妖精的特殊能力用在和土地打交道，听起来一点都不酷炫，会拉低死灵天团的格调，严令不得外传。雅婷给她做了各种银针，姝玥绣了几个不同颜色花样的针囊。\n自从清凝来了，酆都的计时标准都向人类对齐了，日夜交替、四季轮回、活力十足，生机从死亡中迸发，这很合理。" },
      { n: 3, text: "“明王大人！”清凝跑到庭院中，没有看到熟悉的身影，倒是谛听在看院中的红山茶。\n“明王在炼器。”谛听故作老成状，“你种的这个花儿不错。”\n清凝比划了一下谛听的个头到自己的位置，嘻嘻。\n谛听啊啊乱叫：“神兽成长慢，你等着，我一定会长很高的！”\n清凝又跑去炼器室。\n炼器时的明王很专注，为了方便行事，她没有穿披风，很是利落，双手掐诀打坐，时不时变化手印。炼器进程已达尾声，最后一股灵力打进去，霎时明光大作，七色光晕荡开，而后光华内敛，一对素蓝色发带悬浮在眼前。\n清凝进来一直没出声，默默坐在明王旁边，免得打扰她，看到终于完成了，超开心：“又做出好东西啦！”\n“不问是给谁的吗？”明王被她的欢喜感染，睁开眼含笑问道。\n清凝眨眨眼，叉腰：“蓝色的！是给我的对不对！”\n明王顺势把清凝拉近一些，直接把发带在她的发髻上扎好，摸摸她的脑袋，说：“防身和逃跑的法宝不要嫌多。”\n“嗯嗯！明王大人最好了~”清凝索性向前一贴，就抱住明王了。处了这么久，明王这样一个猛一看冷冰冰的人，也是习惯被清凝贴贴了。清凝也轻车熟路的，抱着抱着找舒服的角度，干脆趴在明王膝盖上。\n明王刚刚结束炼器略有疲惫，又看她可爱，就保持这样的姿势休息片刻，才指着旁边摆着的一套衣裙，说是送清凝的新衣。清凝黏黏糊糊蹭两下，起身换上。粉蓝娇俏，和发带颜色正搭，无需对镜也知道可爱得很。\n\n明王说今天带清凝出去逛逛，两人传送去人类都城。战乱已经平息，新的国家建立，一切都在往好的方向发展。百姓也有心思好好过节了。\n月上柳梢头，人约黄昏后。\n天色变暗，街上五颜六色各式花样的花灯亮起，姑娘们笑语盈盈，打扮得花枝招展。\n“原来今天是上元节！”清凝反应过来，摸摸身上的衣裙：“感觉昨天晚才吃了除夕团圆饭呢。这两天看书太投入了，都没注意日子，难怪你还给我带了套新衣裳！”\n明王问：“喜欢吗？”\n“当然喜欢！”清凝直接欢喜地伸手搂住她，“特别喜欢！”\n两人牵着手，漫步在街上欣赏花灯。\n花灯寄托着寻常百姓的朴素愿望，不讲究多么精致，但也十分用心，多的是方形、圆形、桃花、莲花、兔子之类的形状，正巧清凝也盯着各式兔子猛看。终于挑到一个最顺眼的，付了三十枚铜钱，拿到看了又看，递给明王：“喏，送你的~”\n明王有些意外：“送我的？”\n“是呀，”清凝一本正经地说，“说起来，我从小就有个疑惑，有没有人说过，你的发型很像小兔子耳朵呀？”\n“调皮。”明王点点她，接过兔子灯仔细欣赏，随口问：“你还有钱？我记得上次出诊后，都就近送人了。”\n清凝神气地笑着：“嘿嘿，我还留了五十文，今天这不就派上用场啦，剩下的还可以给咱俩买糖人~”她干脆转过身来面对明王，问：“你吃过糖人吗？”\n“应该没有。”明王伸手虚护住她，免得被旁人撞到。\n“没有这样逛过灯会吗？”\n“只有路过时在远处看过几眼。”\n“花灯也是第一次收到吗？”\n“嗯，都是人类的玩意儿，以前没在意。”\n聊着天，两人越走越慢，索性站在河边，长河上满是各种各样的莲花河灯，载着美好愿望轻轻地飘。\n“那你以前除了修炼还干什么？”\n明王淡淡地说：“一直修炼。后来外出游历，因为是治愈系，又靠吞食魂灵修炼，被妖精围攻、捉捕，想靠治愈系续命的、想让我救人的、想剿灭我这样不走正道的、想为了替那些杀我结果被我反杀的人报仇的……呵，他们叫我‘阎王’。然后建立了酆都，接纳一些也走死灵一途的人。”\n清凝紧握住明王靠近她的手，认真地盯着她：“糟心的事都过去了！现在你有雅婷、谛听、黑白、姝玥……有好多人一起，还有我！”\n远处有烟花绽放，星如雨，人群中有惊喜的呼声，传来这个小小的角落。\n明王一只手里还提着兔子灯，一只手被清凝紧紧握住，她脸上现出淡淡的笑意，灯火映照下，整个人都柔和了几分：“是啊，都过去了。”\n清凝说：“看焰火……焰火对于普通人类来说是很罕见的，因为它美丽但短暂，所以人类会格外珍惜它出现的一瞬，并且会反复回忆。或许曾经你遇到的温暖不多，但你一直珍藏在心里，所以才会救了我们许多人。”她也笑起来，笑弯了眼睛：“其实大家私下都说，明王是心软的神呢。”\n“而且啊，”清凝继续说着，没有给明王留插话的机会，“人类的一生对于妖精来说也很短暂吧，如果你是可怕的人……如果我修炼很差劲的话，或许你闭关两次，我就头发都变白了，等我死了，你会忘记我吗……”\n“不会的，”明王立刻否定这种设想，“我可以掌控死灵，所以……不会分开。”她摸摸清凝的脸，“要变得强大，一直变强，强到没有人敢觊觎你、欺辱你，强到活得长长久久，想干什么就干什么，谁都不能对你指手画脚。”" },
      { n: 4, text: "“清凝啊，你都是个大姑娘样子了，是不是该办笄礼啦，你们那里是什么时候办，知道吗？”这天雅婷突然提起及笄礼的事，一众妖精七嘴八舌地讨论起来。\n“笄礼是什么？”\n“人类发明了许多节日什么的，隔段时间就要庆祝一下，弄不清。”\n“笄礼办完，就是说清凝变成大人了，成年了！”\n“成年了能怎么样？”\n“总之对于人类来说很重要！”\n清凝思考了一下：“应该是生日或者女儿节的时候吧，确实快了。可是仪式有点麻烦呢。”\n雅婷拍拍胸膛：“包在我身上！”\n清凝的及笄礼成为近期酆都的头等大事，大家忙碌起来。雅婷自己可以做赞礼主持，找明王担任正宾，其他人抓来打杂，男外形的妖精可以化成女性外观来，否则叉去观礼席，父母位让村长和照顾过清凝的村民来吧，到时候得把李家村的人类带进来。笄礼需要三套衣裙和发饰，准备用什么布什么图样……明王听了雅婷汇报，没多说什么，转头又去了炼器室。\n雅婷忙得像陀螺，找人裁制新衣、采购各式物件、跟每个妖精讲笄礼的步骤、痛击不听她发言的妖精，又去请来李家村的众人，誓要把这仪式做得完美无瑕。还好她修炼到这个程度已经不是很需要睡眠了。姝玥说那我得绣条腰带，给清凝做最后大礼服的配件，加持防护符文，绣线材料要翻找一下。谛听犯了难，嘀咕自己不知道女孩子喜欢什么，被黑白捞走叽里咕噜商量。\n\n正日子就这样到了。\n不管雅婷说话时有没有认真听，妖精们都把自己收拾得整整齐齐像模像样，受邀而来的人类也穿着洗干净的新衣服，带着礼物，坐在观礼区。\n明王身穿自己最严肃华丽的神装，按照人类的礼仪，在所有人的面前，仔仔细细给清凝梳头发，从孩童的发包挽成大人模样，再佩戴上亲手炼制的簪钗法器，念出对她的祝福：“吉月令日，始加元服……”\n清凝则回以拜礼辞谢：“谢明王为我挽发，谢明王为我制簪，谢明王庇护，谢明王教导……谢每一时每一刻，都能过得很开心……”\n三加三拜，如此循环三次，少女的衣裙换作成人礼服，简单的簪笄变为华丽的钗冠。\n在这吉祥美好的日子，亲朋好友见证之下，为你换上隆重典雅的礼衣，自今日起，你成为人类社会中的大人，你将自立自强、迎接更加美好的人生、创造属于你的传奇故事。天与地都将祝福你，我，明王，酆都之主、人称阎王，也将继续保护你、珍爱你。愿你医途坦荡，愿你福气绵长，愿你早日修炼成仙成神，愿你不必经受坎坷磨难也能幸福一生。\n最后一节，正宾赐酒，笄者敬饮。明王递给清凝酒杯，清凝接过，饮下成年的第一杯酒。\n明王郑重地说：“祝福你，李清凝。”\n礼成。\n众人鼓掌，妖精变出漫天花雨，亲友簇拥，佳朋相聚，举杯同庆。大家排着队给清凝送上礼物，雅婷说谢谢大家来观礼，妖精们立刻散作满天星，留下村人围着清凝嘘寒问暖、惆怅感慨。\n明王没有凑热闹，坐到给她留的主人位上去，噙着笑支头看热闹。\n清凝端着两杯酒来，笑意盈盈：“明王大人，我敬你一杯！”\n“好啊，“她坐起身来接过，注视着这位妙龄姑娘，“干杯。”\n“干杯！”" },
      { n: 5, text: "民间传说，有专为穷苦人诊病救难的清凝仙子云游人间，裁夺寿数的阎王与她相伴，携手同游，生与死相随，可谓是件趣事。\n又因两人过处多为救人，阎王似乎也没有旧时传说的可怕，后人建造庙宇时，将二人放在一座大殿内，是为阎王与清凝仙子。" }
    ] },
  { id: "b_pincou", name: "《拼凑月亮》", desc: "她将一片一片地将这破碎的绚丽灵魂拼好，让李清凝无拘无束地重回世间。", cat: "story", author: "鸿影",
    chapters: [
      { n: 1, text: "序\n阎明一指点在李清凝的眉间。\n她说：“安息吧。”于是还在微笑的李清凝破碎为千万块彩虹般的灵魂碎片，漂浮在这个只有她们二人的小世界中。\n她将一片一片地将这破碎的绚丽灵魂拼好，让李清凝无拘无束地重回世间，再不受任何威胁与桎梏。\n无论需要多久。" },
      { n: 2, text: "一·你也是兔子吗\n阎明小心翼翼地捻来一片灵魂，寻找合适的位置。\n这一块属于哪里呢？\n她的意识化为流光，飞入这块碎片。\n \n从前，有一只叫李清凝的兔子，快乐地在生活在森林中。饿了，她会吃新鲜的、带着一丝甘甜味道的草叶；饿了，她去小溪边喝水；累了困了，她有自己的小窝，或者干脆就地找丛小草一躺，晒着暖洋洋的太阳，就睡着啦~\n这天，李清凝遇到了另一只兔子——可能不太准确，因为这只兔子和她长得不太一样。\n清凝兔说：“你好呀，你也是兔子吗？”\n“……可能是吧？你是李清凝？”那只兔子问。\n清凝兔觉得神奇极了，竟然有人知道她的名字！她回答道：“是的呀，你怎么知道我是李清凝？”她笑了笑，“为什么说‘可能是’？你不知道自己是不是兔子吗？”\n阎明刚刚进入这个世界，确实来没来得及看看自己现在是什么样子，她自然地说：“我是阎明，我可以在你眼睛里看看我的样子吗？”\n“你好，阎明。”清凝兔很大方地说，“你看吧！看不清楚的话，我带你去小溪看，水里有影子可以看！”\n阎明凑近清凝，清凝的兔子眼睛大大的、红红的，现在映满了她自己的样子——一只标准的常人印象中的兔子，浑身雪白，毛绒绒的，两只耳朵竖起来，微微透出红粉色的血管。兔耳此时警觉地轻微晃动着以捕捉外界信息，神气极啦！\n阎明说：“谢谢你，李清凝，可是你和我为什么是兔子？”\n清凝兔犯了难：“兔子……就是兔子呀？而且你和我长得不太一样，我的耳朵是垂下来的呢。”说着，清凝轻轻甩动自己的小脑袋，垂在两边的耳朵立刻左右飞舞起来。\n阎明赶紧后退一步，免得被兔耳朵抽到、增加意外受伤。她看清凝兔还在摇头晃脑，说：“好了好了，我知道了，你是垂耳兔，我是立耳兔。”\n“原来如此！”清凝兔咧嘴笑起来，显得格外可爱，“太好了，我们都是兔子！”她突然想起了什么，抬头看看天空，“哎呀，该吃饭了，你饿不饿，我带你去吃超好吃的草叶~”她用耳朵勾勾阎明的耳朵，“跟我来！”\n阎明跟着清凝兔一蹦一蹦，去了清凝强烈推荐的美味草丛大餐一顿，饭罢，又去喝了清凉甘甜的小溪水。\n阎明摸摸清凝兔的小脑袋，她知道这片灵魂在想什么了，是衣食无忧的自在时光，不必为了生存忧心忡忡担惊受怕。这是凡人最朴素的愿望。\n阎明说：“清凝，你把自己养得很好，也会一直好、越来越好。”\n清凝兔不知道阎明为什么突然说这个，但总之小伙伴这样说了，她就会回应：“嗯嗯！大家都会很好！”\n阎明带着淡淡笑意运起神力，于是这片小天地又化为她手心中一片小小的灵魂碎片，这次，阎明知道该把这片拼在哪里了。" },
      { n: 3, text: "二·森林茶话会\n阎明睁开眼，判断这一次自己的身份。\n是没怎么见过的风格。木头小屋，房间里摆满了装着五颜六色液体的瓶瓶罐罐和各式各样的材料，角落里还摆着一把干干净净的大扫帚，另一个角落挂着一口大埚，正咕噜咕噜烧水。打开衣柜，不同款式的尖尖帽子差点戳到她脸上。翻翻书架上的书，倒是有些意思，《实用咒语大全》《与植物灵交流》《如何让你的魔药更好喝》《神奇生物在哪里》……\n西方的巫师？阎明回忆起这样的一群存在，她们居住在遥远国家，多为女性，修炼的方式与东方不同，她们称之为“魔法”，炼制的药水称为“魔药”。\n阎明的唇角慢慢弯起，清凝喜欢游历，不能远行也会看些游记或小说吧，肯定是听说了些关于巫师的故事。\n“咚咚咚”，有人敲门。\n“你好，请问有人在吗？”一个元气活泼的小女孩声音。\n阎明听出是小时候的清凝，她走去开门。\n小女孩穿着旗袍领泡泡袖的裙子，头发扎成两条麻花辫盘起，两侧各别着一个花丸，垂下绿色的丝带。看到门开了，她很是开心：“你就是女巫吗，听说女巫会做很多魔药，我想学习制药救人！”\n阎明故意板起脸：“你没有听说过，女巫是很可怕的吗？”\n“我不怕！”清凝得意地说，“我研究过了，虽然传说女巫很可怕，但她没有做过坏事，反而会做魔药是真的！”\n“你还挺机灵的，你想学，我就要教你吗？”\n清凝自信地挺起胸膛：“嗯！因为我很可爱！而且你还夸我机灵~”\n阎明一时失笑，她看了看外面，天色尚早，说：“要教你也可以，你要先帮我办一件事。”\n“什么事呀？”\n“陪我喝下午茶。”\n阎明招招手，桌子椅子、餐具甜点、茶壶茶杯排着队晃晃悠悠地飞到林间空地，各自找好自己的位置摆放好。她扶正自己的尖檐帽，走去就座。茶壶自动飞起，倒好两杯茶一左一右。阎明端起手边茶杯品尝：“味道不错。”\n清凝学着她的样子坐到小椅子上，也喝一口，小脸皱起来：“有点苦！”\n阎明对着清凝抬了抬下巴，小蛋糕飘飘悠悠落入她面前的碟子。清凝尝了尝，眼睛都变亮了：“好吃！”于是阎明也笑了起来。\n这是一个普通的森林的午后，鸟儿啾啾清鸣，风也轻轻吹拂，阎明难得地和清凝一道享受了惬意的下午茶。看着小清凝，她的五官都柔和几分。她问：“为什么想学制药救人？”\n埋头苦吃的清凝戳戳自己的小脸蛋儿，想了想，说：“想让大家都健健康康平平安安的！”\n“只想学魔药吗？”\n“有用的都想学！”\n会的，你会刻苦研究医术，救很多很多人。\n阎明捏起这块灵魂，轻轻放到合适的位置，那里已经拼了许多类似的碎片。" },
      { n: 4, text: "七·当时明月在\n烈日当空。\n三三两两的流民在路上蹒跚行进。\n“娘！”一声孩童的呼喊打破平静。\n队伍末端，一位衣衫褴褛的妇女踉跄几步，突然面朝下一头栽倒，身侧的红发女童慌乱上前查看，试图把她转成平躺的姿势。\n前方有人回头，或不忍或麻木地看几眼，随即继续赶路。\n妇女已然陷入半昏迷状态。不知过了多久，又或者只是一瞬，她缓缓醒转，吃力地侧过身来，脸上现出一抹奇异的红润色彩，她张开眼睛，大约是想再看看自己的孩子，黯淡的目光失去了焦点，只好凭着感觉对着面前说话：“孩子，好好活下去啊……保护好自己……”\n她抬手，似是想要抚摸女童的头，然而枯枝样的手臂举到半途便失去力量，干裂的手指从女童的眉心擦过，划出一长条白色痕迹。\n女童抓住母亲垂下的手贴在脸上，她呆呆地看着妇女身体变冷、僵硬。\n“哒。”\n一滴血落下。\n滴在妇女破旧的衣服上，慢慢洇开，像一滴眼泪。\n女童仰头看天，长空如洗，烈日映在她碧色眼瞳中，如同一团燃烧的火焰，照亮她灰扑扑的小脸。\n血珠从她眉间沁出，原来是方才皮肤被划破了。\n她伸手阖上母亲的眼睛，起身，小小的人咬紧牙关，一步一步将母亲拖到路旁。\n金乌西沉，同路人都渐行渐远，四野空旷，只有鸦鸟鸣叫。她调整了母亲的姿势、抚平衣衫，拭去面上灰尘，让她看上去躺得更舒服一些。\n终于，她意识到自己再不知道还有什么可做了。后退一步，模仿见过的告别场景，她俯身三叩首。不该哭的，大哭大喊不仅不能让母亲回来，反而会消耗体力。她要好好活着。\n再抬头，她看到一些莹莹光点从母亲身上飘起又逐渐逸散。\n不要走！\n她下意识伸手去触摸最近的光点，在碰到的瞬间，附近的星星点点都飞入她的指尖，玄妙的感觉油然而生——\n世界变了。\n各处飞舞着大小不一的光点，不远处树上还有更大的如同小鱼游弋。\n她有些惶惶不安。\n \n“这是灵，”一道柔和的女声在她身侧响起，“万物有灵，人也不意外。在去世之后，会散灵，回归于天地。”\n女童猛然转头看去，蓝白衣裙的女子对她微笑：“你好，我是李清凝，你是不是叫阎明呀？”\n李清凝茫茫然在此处醒来，看到女童跪在开始散灵的尸体前，蓦地明悟了自己所在的场景。她向女童走近几步，看到对方露出警惕地表情后，没有再向前，而是蹲下身来，平视着她，说：“你吸收了她的灵，可以当做今后她会一直陪伴着你长大。这是很难得的能力哦。”\n“真的吗？”女童问。\n李清凝摸摸她的头，她没有拒绝。\n夜风轻轻吹过，月华如水流淌。\n她突然回答清凝前面的问题：“我是叫阎明。”\n清凝弯眸笑笑，说：“你好呀，阎明。我们可以一起安葬她，入土为安。”她指指一旁的小山，“那边怎么样？”\n看到小阎明点头，她挥挥手，让妇女的身体漂浮起来跟着自己，一大一小这般走去看中的地方。\n“累不累？”\n小阎明咬住干涸的嘴唇不说话，只是摇头。\n“饿不饿、渴不渴？”清凝抬手间不知如何便掏出了一壶水递给小阎明。\n小阎明犹豫了一下接过：“谢谢。”声音有些干哑。\n“既然喝了我的水了，我可以牵着你吗？天黑了，牵手可以避免走散。”清凝温柔地问她，向她伸出手。\n稍后，她感到一只小手轻轻地搭了上来。\n清凝握住小阎明的手，查探她的身体。明了情况，又送去一道灵力，帮她消去疲惫、恢复身体。战乱年代，流民小孩吃不饱已是常态，流离失所，又顶着烈阳成日奔波，还能勉强活着就算不错了，遑论觉醒能力。方才小阎明能看到并吸收灵，已经是心神激荡之下能力暴走的前兆了。\n思及此处，她在心中默默叹了口气，这就是阎明的记忆投射吗，比自己幼时更加惨烈，又是这样的遭遇，加上修炼走死灵一途……简直不能想象她是如何一路坚持下来的。\n \n两人牵着手走了许久许久。\n直到清凝掌中的小手动了动。她低头，看到小阎明的耳朵尖红彤彤的。她悟了：“你是不是想起来了？”\n“嗯……”阎明偏头躲开清凝的目光。\n清凝假装没看到，说：“你小时候长得好可爱哦，我想戳你脸。”\n“……随你，”阎明清清嗓子，“既然我已经清醒过来，你我大约很快就会从这里出去了。”\n清凝已经笑盈盈地动手了，戳戳这个幼年版的明王，小孩的脸蛋儿软软嫩嫩：“是小明呢~”\n阎明瞥她一眼，虽然想她大概清楚，还是解释道：“这是你我思绪交汇之地，你想戳软脸蛋，才是软的，否则稀里糊涂的灾民小孩，脸上非但脏兮兮的，营养不良加上太阳暴晒，还会干巴巴的，一点儿都不嫩滑。”\n“既然如此，出去之后请明王大人自己变成嫩嫩滑滑的小孩给我戳脸吧~”\n“你能好好地出去，随你戳又何妨。”" }
    ] }
];

/* ===== config/14_stars.js ===== */
/* F6 夜晚点窗观星：古星图数据（三垣 · 二十八宿）
 * 坐标 x,y ∈ [0,1]，绘制时映射到星图内容区（左→右 / 上→下）。
 * 视角：地面仰望 —— 北(玄武)在顶、南(朱雀)在底、东(青龙)在左、西(白虎)在右。
 * 二十八宿每宿由多颗星连成星官轮廓；主星(id 同旧)保留讲解，辅助星仅用于连线。
 * 中宫（三垣·紫微/太微/天市/勾陈/帝，及北斗七星）亦带讲解，与二十八宿同入「介绍池」。
 * 每宿含 descYanming（阎明）/ descLiqingning（清凝）两套讲解。
 */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.stars = [
  { id: "dou", name: "斗宿", group: "玄武", x: 0.19, y: 0.12, descYanming: "南斗六星主寿命爵禄，民间说南斗注生。", descLiqingning: "“维南有箕，不可以簸扬；维北有斗，不可以挹酒浆。”" },
  { id: "dou1", name: "", group: "玄武", x: 0.22, y: 0.1 },
  { id: "dou2", name: "", group: "玄武", x: 0.25, y: 0.09 },
  { id: "dou3", name: "", group: "玄武", x: 0.28, y: 0.1 },
  { id: "dou4", name: "", group: "玄武", x: 0.31, y: 0.12 },
  { id: "dou5", name: "", group: "玄武", x: 0.33, y: 0.14 },
  { id: "niu", name: "牛宿", group: "玄武", x: 0.29, y: 0.08, descYanming: "牛宿主桥梁道路，也主牺牲之礼。旁边有河鼓三星。", descLiqingning: "牛宿慢慢挪，像老牛驮着夜，一步一步。" },
  { id: "niu1", name: "", group: "玄武", x: 0.31, y: 0.07 },
  { id: "niu2", name: "", group: "玄武", x: 0.33, y: 0.08 },
  { id: "niu3", name: "", group: "玄武", x: 0.34, y: 0.1 },
  { id: "nv", name: "女宿", group: "玄武", x: 0.39, y: 0.1, descYanming: "女宿主布帛女工，古时嫁娶择此宿。", descLiqingning: "女宿细细纤纤，像谁在星河里穿针。" },
  { id: "nv1", name: "", group: "玄武", x: 0.41, y: 0.08 },
  { id: "nv2", name: "", group: "玄武", x: 0.42, y: 0.11 },
  { id: "nv3", name: "", group: "玄武", x: 0.43, y: 0.09 },
  { id: "xu", name: "虚宿", group: "玄武", x: 0.49, y: 0.08, descYanming: "虚宿主丧哭，亦主庙堂祭祀。", descLiqingning: "虚宿空空的，像一扇半开的窗，风从里面过。" },
  { id: "xu1", name: "", group: "玄武", x: 0.52, y: 0.1 },
  { id: "wei2", name: "危宿", group: "玄武", x: 0.59, y: 0.09, descYanming: "危宿主盖屋起坟，亦主天市架阁。", descLiqingning: "所以动土前最好多看它一眼~" },
  { id: "wei21", name: "", group: "玄武", x: 0.62, y: 0.08 },
  { id: "wei22", name: "", group: "玄武", x: 0.64, y: 0.11 },
  { id: "shi", name: "室宿", group: "玄武", x: 0.69, y: 0.11, descYanming: "室宿又名营室，主营造宫室。古人定星即此，嫁娶营造皆宜。", descLiqingning: "室宿方方的，像一间小屋，星星都住在里面。" },
  { id: "shi1", name: "", group: "玄武", x: 0.72, y: 0.13 },
  { id: "bi", name: "壁宿", group: "玄武", x: 0.79, y: 0.09, descYanming: "壁宿主文章图书，东壁图书府。咱们药庐的医典，归它照看。", descLiqingning: "壁宿静静的，像书架上那一排泛黄的书脊。" },
  { id: "bi1", name: "", group: "玄武", x: 0.82, y: 0.11 },
  { id: "jiao", name: "角宿", group: "青龙", x: 0.11, y: 0.17, descYanming: "角宿是苍龙两只角，二十八宿之首。左角主法理，右角主将领。", descLiqingning: "“角宿未旦，曜灵安藏？”角宿也是黄道所经“天门”。" },
  { id: "jiao1", name: "", group: "青龙", x: 0.14, y: 0.2 },
  { id: "kang", name: "亢宿", group: "青龙", x: 0.12, y: 0.24, descYanming: "亢是龙颈，主颈疮瘟疫。采药遇亢宿当空，须留意湿毒。", descLiqingning: "亢宿细细一根，像龙低头看水里的自己。" },
  { id: "kang1", name: "", group: "青龙", x: 0.13, y: 0.27 },
  { id: "kang2", name: "", group: "青龙", x: 0.12, y: 0.3 },
  { id: "kang3", name: "", group: "青龙", x: 0.13, y: 0.33 },
  { id: "di", name: "氐宿", group: "青龙", x: 0.1, y: 0.37, descYanming: "氐为龙胸，也是天根。根稳了，一季的药苗才长得稳。", descLiqingning: "氐宿圆圆的，像龙安睡时起伏的胸膛。" },
  { id: "di1", name: "", group: "青龙", x: 0.14, y: 0.38 },
  { id: "di2", name: "", group: "青龙", x: 0.14, y: 0.42 },
  { id: "di3", name: "", group: "青龙", x: 0.1, y: 0.43 },
  { id: "fang", name: "房宿", group: "青龙", x: 0.1, y: 0.47, descYanming: "房宿四星叫天驷，主马与车驾。古时天子祭房以求驷马。", descLiqingning: "房宿排得齐齐的，像四匹马并排站着歇脚。" },
  { id: "fang1", name: "", group: "青龙", x: 0.13, y: 0.47 },
  { id: "fang2", name: "", group: "青龙", x: 0.16, y: 0.47 },
  { id: "fang3", name: "", group: "青龙", x: 0.18, y: 0.47 },
  { id: "xin", name: "心宿", group: "青龙", x: 0.13, y: 0.57, descYanming: "心宿中央那颗叫大火，又名商星。", descLiqingning: "“七月流火，九月授衣。”“火”即心宿，古称“大火”。" },
  { id: "xin1", name: "", group: "青龙", x: 0.1, y: 0.55 },
  { id: "xin2", name: "", group: "青龙", x: 0.16, y: 0.59 },
  { id: "wei", name: "尾宿", group: "青龙", x: 0.11, y: 0.66, descYanming: "尾宿九星弯如钩，是苍龙摆动的尾。古以尾为后宫，亦主君臣。", descLiqingning: "“丙之晨，龙尾伏辰。”" },
  { id: "wei1", name: "", group: "青龙", x: 0.13, y: 0.69 },
  { id: "wei2", name: "", group: "青龙", x: 0.15, y: 0.72 },
  { id: "wei3", name: "", group: "青龙", x: 0.16, y: 0.75 },
  { id: "wei4", name: "", group: "青龙", x: 0.17, y: 0.78 },
  { id: "wei5", name: "", group: "青龙", x: 0.16, y: 0.81 },
  { id: "wei6", name: "", group: "青龙", x: 0.14, y: 0.83 },
  { id: "ji", name: "箕宿", group: "青龙", x: 0.11, y: 0.86, descYanming: "箕宿主风，又称箕星好风。晒药最怕它起，转眼一场雨。", descLiqingning: "箕宿像一只簸箕，风一吹，就把云都扬散了。" },
  { id: "ji1", name: "", group: "青龙", x: 0.14, y: 0.85 },
  { id: "ji2", name: "", group: "青龙", x: 0.15, y: 0.88 },
  { id: "ji3", name: "", group: "青龙", x: 0.12, y: 0.89 },
  { id: "kui", name: "奎宿", group: "白虎", x: 0.85, y: 0.17, descYanming: "奎宿主沟渎、武库，亦主封豕。足踏之地，水流自成。", descLiqingning: "奎宿散散的，像白虎踩过的雪地脚印。" },
  { id: "kui1", name: "", group: "白虎", x: 0.88, y: 0.16 },
  { id: "kui2", name: "", group: "白虎", x: 0.9, y: 0.18 },
  { id: "kui3", name: "", group: "白虎", x: 0.87, y: 0.2 },
  { id: "kui4", name: "", group: "白虎", x: 0.89, y: 0.21 },
  { id: "lou", name: "娄宿", group: "白虎", x: 0.86, y: 0.27, descYanming: "娄宿主畜牧牺牲，亦主聚众。牧马放羊，望它而知时。", descLiqingning: "娄宿圆圆的，像草场上刚堆好的草垛。" },
  { id: "lou1", name: "", group: "白虎", x: 0.88, y: 0.26 },
  { id: "lou2", name: "", group: "白虎", x: 0.87, y: 0.29 },
  { id: "wei3", name: "胃宿", group: "白虎", x: 0.88, y: 0.37, descYanming: "胃宿号天仓，主五谷积聚。秋收满仓，便拜此宿。", descLiqingning: "胃宿鼓鼓的，像一只装满了的布袋。" },
  { id: "wei31", name: "", group: "白虎", x: 0.9, y: 0.36 },
  { id: "wei32", name: "", group: "白虎", x: 0.87, y: 0.39 },
  { id: "mao", name: "昴宿", group: "白虎", x: 0.85, y: 0.49, descYanming: "昴宿七星聚如髦头，西方称七姊妹。主狱事，亦主边兵。", descLiqingning: "昴宿挤挤挨挨，像七个姐妹凑着说悄悄话。" },
  { id: "mao1", name: "", group: "白虎", x: 0.86, y: 0.48 },
  { id: "mao2", name: "", group: "白虎", x: 0.87, y: 0.49 },
  { id: "mao3", name: "", group: "白虎", x: 0.86, y: 0.5 },
  { id: "mao4", name: "", group: "白虎", x: 0.88, y: 0.49 },
  { id: "mao5", name: "", group: "白虎", x: 0.87, y: 0.51 },
  { id: "bi2", name: "毕宿", group: "白虎", x: 0.88, y: 0.6, descYanming: "毕宿主弋猎，形如捕兔之网，又名毕好雨，网张则雨至。", descLiqingning: "毕宿张开像一张网，专门兜住要落下的雨。" },
  { id: "bi21", name: "", group: "白虎", x: 0.85, y: 0.61 },
  { id: "bi22", name: "", group: "白虎", x: 0.83, y: 0.63 },
  { id: "bi23", name: "", group: "白虎", x: 0.86, y: 0.64 },
  { id: "bi24", name: "", group: "白虎", x: 0.89, y: 0.63 },
  { id: "zi", name: "觜宿", group: "白虎", x: 0.85, y: 0.71, descYanming: "觜为虎嘴，主三军粮草、葆旅之事。小小三星，管的是口中食。", descLiqingning: "觜宿尖尖的，像白虎抿着嘴，不肯出声。" },
  { id: "zi1", name: "", group: "白虎", x: 0.87, y: 0.7 },
  { id: "zi2", name: "", group: "白虎", x: 0.86, y: 0.73 },
  { id: "shen", name: "参宿", group: "白虎", x: 0.85, y: 0.8, descYanming: "参宿为白虎之身，主斩伐威武。它与心宿（商）永不相见，谓参商。", descLiqingning: "“人生不相见，动如参与商。”" },
  { id: "shen1", name: "", group: "白虎", x: 0.89, y: 0.8 },
  { id: "shen2", name: "", group: "白虎", x: 0.89, y: 0.85 },
  { id: "shen3", name: "", group: "白虎", x: 0.85, y: 0.85 },
  { id: "shen4", name: "", group: "白虎", x: 0.86, y: 0.825 },
  { id: "shen5", name: "", group: "白虎", x: 0.875, y: 0.825 },
  { id: "shen6", name: "", group: "白虎", x: 0.89, y: 0.825 },
  { id: "jing", name: "井宿", group: "朱雀", x: 0.2, y: 0.88, descYanming: "井宿主水衡，决断水利。春分日躔于此，故曰东井。", descLiqingning: "井宿一格一格的，像谁在天上凿了口井。" },
  { id: "jing1", name: "", group: "朱雀", x: 0.23, y: 0.88 },
  { id: "jing2", name: "", group: "朱雀", x: 0.2, y: 0.91 },
  { id: "jing3", name: "", group: "朱雀", x: 0.23, y: 0.91 },
  { id: "jing4", name: "", group: "朱雀", x: 0.2, y: 0.94 },
  { id: "jing5", name: "", group: "朱雀", x: 0.23, y: 0.94 },
  { id: "gui", name: "鬼宿", group: "朱雀", x: 0.3, y: 0.9, descYanming: "鬼宿又名舆鬼，主祠祀死丧。其中积尸气，望之幽幽。", descLiqingning: "鬼宿朦朦胧胧，像一盏没点亮的灯笼。" },
  { id: "gui1", name: "", group: "朱雀", x: 0.33, y: 0.9 },
  { id: "gui2", name: "", group: "朱雀", x: 0.33, y: 0.93 },
  { id: "gui3", name: "", group: "朱雀", x: 0.3, y: 0.93 },
  { id: "liu", name: "柳宿", group: "朱雀", x: 0.4, y: 0.88, descYanming: "柳宿为朱雀之喙，主草木厨膳。尝百草，先问它一味。", descLiqingning: "柳宿弯弯的，像雀鸟衔着一枝嫩柳。" },
  { id: "liu1", name: "", group: "朱雀", x: 0.43, y: 0.89 },
  { id: "liu2", name: "", group: "朱雀", x: 0.42, y: 0.91 },
  { id: "liu3", name: "", group: "朱雀", x: 0.44, y: 0.92 },
  { id: "liu4", name: "", group: "朱雀", x: 0.41, y: 0.94 },
  { id: "xing", name: "星宿", group: "朱雀", x: 0.5, y: 0.89, descYanming: "星宿为朱雀之颈，主衣裳文绣，亦主急兵。七星相连如项饰。", descLiqingning: "星宿排成一串，像雀颈上挂的七颗小铃。" },
  { id: "xing1", name: "", group: "朱雀", x: 0.52, y: 0.88 },
  { id: "xing2", name: "", group: "朱雀", x: 0.54, y: 0.9 },
  { id: "xing3", name: "", group: "朱雀", x: 0.51, y: 0.92 },
  { id: "xing4", name: "", group: "朱雀", x: 0.53, y: 0.93 },
  { id: "xing5", name: "", group: "朱雀", x: 0.55, y: 0.91 },
  { id: "zhang", name: "张宿", group: "朱雀", x: 0.6, y: 0.88, descYanming: "张宿为朱雀之嗉，主珍宝宴飨。嗉满则宴，嗉空则藏。", descLiqingning: "张宿圆圆的，像雀鸟鼓起的腮帮子。" },
  { id: "zhang1", name: "", group: "朱雀", x: 0.63, y: 0.89 },
  { id: "zhang2", name: "", group: "朱雀", x: 0.62, y: 0.91 },
  { id: "zhang3", name: "", group: "朱雀", x: 0.64, y: 0.92 },
  { id: "zhang4", name: "", group: "朱雀", x: 0.61, y: 0.94 },
  { id: "yi", name: "翼宿", group: "朱雀", x: 0.7, y: 0.88, descYanming: "翼宿主乐府俳倡，亦主远客。风起翼张，便有客自远方来。", descLiqingning: "翼宿舒舒的，像朱雀抖开两翼要飞。" },
  { id: "yi1", name: "", group: "朱雀", x: 0.72, y: 0.87 },
  { id: "yi2", name: "", group: "朱雀", x: 0.74, y: 0.89 },
  { id: "yi3", name: "", group: "朱雀", x: 0.71, y: 0.91 },
  { id: "yi4", name: "", group: "朱雀", x: 0.73, y: 0.92 },
  { id: "yi5", name: "", group: "朱雀", x: 0.75, y: 0.9 },
  { id: "yi6", name: "", group: "朱雀", x: 0.72, y: 0.94 },
  { id: "zhen", name: "轸宿", group: "朱雀", x: 0.8, y: 0.88, descYanming: "轸宿为朱雀之尾，主车骑风雨。古以轸主风，亦主冢宰之事。", descLiqingning: "轸宿长长拖在最后，像雀尾扫过一地星尘。" },
  { id: "zhen1", name: "", group: "朱雀", x: 0.82, y: 0.9 },
  { id: "zhen2", name: "", group: "朱雀", x: 0.79, y: 0.92 },
  { id: "zhen3", name: "", group: "朱雀", x: 0.81, y: 0.93 },
  { id: "ziwei", name: "紫微", group: "中宫", constel: "beidou", x: 0.46, y: 0.3, descYanming: "“三垣”是北天极附近的三个星区，被认为是“天上帝国”的核心所在。", descLiqingning: "紫微垣是三垣之中垣，传说是天帝居住的宫殿，又叫紫宫。位于北天极的中心。" },
  { id: "beiji", name: "北极", group: "中宫", constel: "beidou", x: 0.421, y: 0.28, descYanming: "北极星即紫微星，它恒定不动，众星环绕，被视为“帝星”，也被称为“天之枢”。", descLiqingning: "“为政以德，譬如北辰，居其所，而众星共（拱）之。”——《论语·为政》" },
  { id: "bd1", name: "天枢", group: "中宫", constel: "beidou", x: 0.5, y: 0.3, descYanming: "天枢是北斗第一星，也叫贪狼。", descLiqingning: "天枢悬阆中，斗柄运鸿蒙。" },
  { id: "bd2", name: "天璇", group: "中宫", constel: "beidou", x: 0.54, y: 0.31, descYanming: "天璇是北斗第二星，又称巨门。", descLiqingning: "玉屏横云阙，天璇入帝乡。" },
  { id: "bd3", name: "天玑", group: "中宫", constel: "beidou", x: 0.56, y: 0.35, descYanming: "天玑是北斗第三星，又叫禄存。", descLiqingning: "玉京群帝集北斗，或骑骐驎翳凤凰。" },
  { id: "bd4", name: "天权", group: "中宫", constel: "beidou", x: 0.52, y: 0.38, descYanming: "天权是北斗第四星，意为“天上的平衡”。", descLiqingning: "天权又名文曲，象征着文运。" },
  { id: "bd5", name: "玉衡", group: "中宫", constel: "beidou", x: 0.46, y: 0.39, descYanming: "玉衡是北斗第五星，也称廉贞。", descLiqingning: "“玉衡指孟冬，众星何历历。”古诗文常以玉衡代指北斗。" },
  { id: "bd6", name: "开阳", group: "中宫", constel: "beidou", x: 0.4, y: 0.4, descYanming: "开阳是北斗第六星，古名武曲。它身旁还有颗隐星，肉眼难辨。", descLiqingning: "武曲星掌管天下武运，维护天下太平。" },
  { id: "bd7", name: "摇光", group: "中宫", constel: "beidou", x: 0.34, y: 0.41, descYanming: "摇光是北斗第七星，也叫破军，是勺柄最末一颗。斗柄所指，定四时。", descLiqingning: "破军有先破后立之意。" },
  { id: "taiwei", name: "太微", group: "中宫", constel: "zhong", x: 0.58, y: 0.42, descYanming: "太微垣是三垣的“上垣”，象征着天帝和大臣们处理政务的朝廷。被称为“三光之廷。”", descLiqingning: "“太微，天子庭也，五帝之座也，十二诸侯府也。其外蕃，九卿也。”——《晋书·天文志》" },
  { id: "tianshi", name: "天市", group: "中宫", constel: "zhong", x: 0.44, y: 0.46, descYanming: "天市垣三垣的“下垣”，象征着平民百姓居住和进行贸易的繁华集市。", descLiqingning: "“天市，二十二星，主国市聚交易之所。”——《晋书·天文志》" },
  { id: "gouchen", name: "勾陈一", group: "中宫", constel: "zhong", x: 0.4, y: 0.34, descYanming: "勾陈一即北极星（小熊座α），是北天极附近最亮的恒星。", descLiqingning: "勾陈本是上古官名，掌天子禁卫；星空里它守在帝星之侧。" },
  { id: "dixing", name: "帝", group: "中宫", constel: "zhong", x: 0.49, y: 0.33, descYanming: "帝星即北极二，古称“太乙”，居紫微垣中，象征天帝之座。", descLiqingning: "“中宫天极星，其一明者，太一之常居也。”——《史记·天官书》" },
];

window.YLT_CFG.starLinks = [
  ["dou", "dou1"],
  ["dou1", "dou2"],
  ["dou2", "dou3"],
  ["dou3", "dou4"],
  ["dou4", "dou5"],
  ["niu", "niu1"],
  ["niu1", "niu2"],
  ["niu2", "niu3"],
  ["nv", "nv1"],
  ["nv1", "nv2"],
  ["nv2", "nv3"],
  ["xu", "xu1"],
  ["wei2", "wei21"],
  ["wei21", "wei22"],
  ["shi", "shi1"],
  ["bi", "bi1"],
  ["jiao", "jiao1"],
  ["kang", "kang1"],
  ["kang1", "kang2"],
  ["kang2", "kang3"],
  ["di", "di1"],
  ["di1", "di2"],
  ["di2", "di3"],
  ["fang", "fang1"],
  ["fang1", "fang2"],
  ["fang2", "fang3"],
  ["xin", "xin1"],
  ["xin1", "xin2"],
  ["wei", "wei1"],
  ["wei1", "wei2"],
  ["wei2", "wei3"],
  ["wei3", "wei4"],
  ["wei4", "wei5"],
  ["wei5", "wei6"],
  ["ji", "ji1"],
  ["ji1", "ji2"],
  ["ji2", "ji3"],
  ["kui", "kui1"],
  ["kui1", "kui2"],
  ["kui2", "kui3"],
  ["kui3", "kui4"],
  ["lou", "lou1"],
  ["lou1", "lou2"],
  ["wei3", "wei31"],
  ["wei31", "wei32"],
  ["mao", "mao1"],
  ["mao1", "mao2"],
  ["mao2", "mao3"],
  ["mao3", "mao4"],
  ["mao4", "mao5"],
  ["bi2", "bi21"],
  ["bi21", "bi22"],
  ["bi22", "bi23"],
  ["bi23", "bi24"],
  ["zi", "zi1"],
  ["zi1", "zi2"],
  ["shen", "shen1"],
  ["shen1", "shen2"],
  ["shen2", "shen3"],
  ["shen3", "shen4"],
  ["shen4", "shen5"],
  ["shen5", "shen6"],
  ["jing", "jing1"],
  ["jing1", "jing2"],
  ["jing2", "jing3"],
  ["jing3", "jing4"],
  ["jing4", "jing5"],
  ["gui", "gui1"],
  ["gui1", "gui2"],
  ["gui2", "gui3"],
  ["liu", "liu1"],
  ["liu1", "liu2"],
  ["liu2", "liu3"],
  ["liu3", "liu4"],
  ["xing", "xing1"],
  ["xing1", "xing2"],
  ["xing2", "xing3"],
  ["xing3", "xing4"],
  ["xing4", "xing5"],
  ["zhang", "zhang1"],
  ["zhang1", "zhang2"],
  ["zhang2", "zhang3"],
  ["zhang3", "zhang4"],
  ["yi", "yi1"],
  ["yi1", "yi2"],
  ["yi2", "yi3"],
  ["yi3", "yi4"],
  ["yi4", "yi5"],
  ["yi5", "yi6"],
  ["zhen", "zhen1"],
  ["zhen1", "zhen2"],
  ["zhen2", "zhen3"],
  ["bd1", "bd2"],
  ["bd2", "bd3"],
  ["bd3", "bd4"],
  ["bd4", "bd5"],
  ["bd5", "bd6"],
  ["bd6", "bd7"],
  ["ziwei", "beiji"],
  ["beiji", "gouchen"],
  ["ziwei", "dixing"],
  ["taiwei", "tianshi"],
  ["gouchen", "taiwei"],
  ["dou", "niu"],
  ["niu", "nv"],
  ["nv", "xu"],
  ["xu", "wei2"],
  ["wei2", "shi"],
  ["shi", "bi"],
  ["jiao", "kang"],
  ["kang", "di"],
  ["di", "fang"],
  ["fang", "xin"],
  ["xin", "wei"],
  ["wei", "ji"],
  ["kui", "lou"],
  ["lou", "wei3"],
  ["wei3", "mao"],
  ["mao", "bi2"],
  ["bi2", "zi"],
  ["zi", "shen"],
  ["jing", "gui"],
  ["gui", "liu"],
  ["liu", "xing"],
  ["xing", "zhang"],
  ["zhang", "yi"],
  ["yi", "zhen"],
];

/* ===== config/15_poems.js ===== */
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
    reply: "（眉眼弯弯）将那一句诗又轻轻念了一遍。" },

  { who: "either", cat: "poetry",
    question: "你喜欢哪一句？",
    options: [
      "风烟俱净，天山共色。",
      "素月分辉，明河共影。",
      "长烟一空，皓月千里。",
    ],
    reply: "“白露暖空，素月流天”“寒峰凝素，孤月垂清”也不错。" },

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

  { who: "shimei", cat: "medicine",
    rounds: [
      { who: "shimei", question: "来对飞花令吧~花自飘零水自流。",
        options: ["梨花院落溶溶月，柳絮池塘淡淡风。","名花倾国两相欢，长得君王带笑看。", "乱花渐欲迷人眼，浅草才能没马蹄。"],
        reply: "取次花丛懒回顾，半缘修道半缘君。"},
      { who: "shijie", question: "枫叶荻花秋瑟瑟。",
        options: ["春风桃李花开日。", "待到重阳日，还来就菊花。", "年年岁岁花相似，岁岁年年人不同。"],
        reply: "忽如一夜春风来，千树万树梨花开。" },
     { who: "shimei", speak: "闲敲棋子落灯花~" },
    ] },
];

/* ===== config/16_toc.js ===== */
/* 自动生成：书籍目录索引（gen_booktext.py）。方案C 核心——
   bookToc  = { 书id: [{n,title}] } 轻量常驻目录（打进 config_bundle，书架/图鉴即时显示，无需等正文）；
   bookFiles= { 书id: [正文分片文件名] } 供 main.js ensureBook() 按书懒加载 config/16_booktext/<file>。
   请勿手改；改书后重跑 build_bundle.py（非 --no-books）重新生成。 */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.bookToc = {"b_shanhaij": [{"n": 1, "title": "卷一 · 南山经"}, {"n": 2, "title": "卷二 · 西山经"}, {"n": 3, "title": "卷三 · 北山经"}, {"n": 4, "title": "卷四 · 东山经"}, {"n": 5, "title": "卷五 · 中山经"}, {"n": 6, "title": "卷六 · 海外南经"}, {"n": 7, "title": "卷七 · 海外西经"}, {"n": 8, "title": "卷八 · 海外北经"}, {"n": 9, "title": "卷九 · 海外东经"}, {"n": 10, "title": "卷十 · 海内南经"}, {"n": 11, "title": "卷十一 · 海内西经"}, {"n": 12, "title": "卷十二 · 海内北经"}, {"n": 13, "title": "卷十三 · 海内东经"}, {"n": 14, "title": "卷十四 · 大荒东经"}, {"n": 15, "title": "卷十五 · 大荒南经"}, {"n": 16, "title": "卷十六 · 大荒西经"}, {"n": 17, "title": "卷十七 · 大荒北经"}], "b_huangdi": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}], "b_shennong": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}], "b_nanjing": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}], "b_shanghan": [{"n": 1, "title": "伤寒论"}, {"n": 2, "title": "辨太阳病脉证并治上"}, {"n": 3, "title": "辨太阳病脉证并治中"}, {"n": 4, "title": "辨太阳病脉证并治下"}, {"n": 5, "title": "辨阳明病脉证并治"}, {"n": 6, "title": "辨少阳病脉证并治"}, {"n": 7, "title": "辨太阴病脉证并治"}, {"n": 8, "title": "辨少阴病脉证并治"}, {"n": 9, "title": "辨厥阴病脉证并治"}, {"n": 10, "title": "辨霍乱病脉证并治"}, {"n": 11, "title": "辨阴阳易瘥后劳复病脉证并治"}], "b_maijing": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}], "b_zhouhou": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}], "b_qianjin": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}], "b_shiliao": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}], "b_bencao": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}, {"n": 35, "title": "卷三十五"}, {"n": 36, "title": "卷三十六"}, {"n": 37, "title": "卷三十七"}, {"n": 38, "title": "卷三十八"}, {"n": 39, "title": "卷三十九"}, {"n": 40, "title": "卷四十"}, {"n": 41, "title": "卷四十一"}], "b_wenbing": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}], "b_wenre": [{"n": 1, "title": "温热论"}, {"n": 2, "title": "总论"}, {"n": 3, "title": "第一章·温病大纲"}, {"n": 4, "title": "第二章·逆传入营"}, {"n": 5, "title": "第三章·流连气分"}, {"n": 6, "title": "第四章·邪留三焦"}, {"n": 7, "title": "第五章·里结阳明"}, {"n": 8, "title": "第六章·卫、气、营、血看法"}, {"n": 9, "title": "第七章·论湿邪"}, {"n": 10, "title": "一、白苔"}, {"n": 11, "title": "二、黄苔"}, {"n": 12, "title": "三、绛舌"}, {"n": 13, "title": "四、紫舌"}, {"n": 14, "title": "五、淡红舌"}, {"n": 15, "title": "六、黑苔"}, {"n": 16, "title": "第九章·验齿"}, {"n": 17, "title": "第十章·辨斑疹"}, {"n": 18, "title": "第十一章·辨白"}, {"n": 19, "title": "第十二章·论妇人温病"}], "b_shire": [{"n": 1, "title": "全文"}], "b_jiayi": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}], "b_zhenjiu": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}], "b_binhu": [{"n": 1, "title": "濒湖脉学"}, {"n": 2, "title": "序"}, {"n": 3, "title": "浮（阳）"}, {"n": 4, "title": "沉（阴）"}, {"n": 5, "title": "迟（阴）"}, {"n": 6, "title": "数（阳）"}, {"n": 7, "title": "滑（阳中阴）"}, {"n": 8, "title": "涩（阴）"}, {"n": 9, "title": "虚（阴）"}, {"n": 10, "title": "实（阳）"}, {"n": 11, "title": "长（阳）"}, {"n": 12, "title": "短（阴）"}, {"n": 13, "title": "洪（阳）"}, {"n": 14, "title": "微（阴）"}, {"n": 15, "title": "紧（阳）"}, {"n": 16, "title": "缓（阴）"}, {"n": 17, "title": "芤（阳中阴）"}, {"n": 18, "title": "弦（阳中阴）"}, {"n": 19, "title": "革（阴）"}, {"n": 20, "title": "牢（阴中阳）"}, {"n": 21, "title": "弱（阴）"}, {"n": 22, "title": "散（阴）"}, {"n": 23, "title": "细（阴）"}, {"n": 24, "title": "伏（阴）"}, {"n": 25, "title": "动（阳）"}, {"n": 26, "title": "促（阳）"}, {"n": 27, "title": "结（阴）"}, {"n": 28, "title": "代（阴）"}, {"n": 29, "title": "四言举要"}], "b_bcsy": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}], "b_waitai": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}, {"n": 35, "title": "卷三十五"}, {"n": 36, "title": "卷三十六"}, {"n": 37, "title": "卷三十七"}, {"n": 38, "title": "卷三十八"}, {"n": 39, "title": "卷三十九"}, {"n": 40, "title": "卷四十"}, {"n": 41, "title": "卷四十一"}], "b_hejiju": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}], "b_puji": [{"n": 1, "title": "卷一（原卷 卷一–卷九）"}, {"n": 2, "title": "卷二（原卷 卷十–卷十八）"}, {"n": 3, "title": "卷三（原卷 卷十九–卷二十七）"}, {"n": 4, "title": "卷四（原卷 卷二十八–卷三十六）"}, {"n": 5, "title": "卷五（原卷 卷三十七–卷四十五）"}, {"n": 6, "title": "卷六（原卷 卷四十六–卷五十四）"}, {"n": 7, "title": "卷七（原卷 卷五十五–卷六十三）"}, {"n": 8, "title": "卷八（原卷 卷六十四–卷七十二）"}, {"n": 9, "title": "卷九（原卷 卷七十三–卷八十一）"}, {"n": 10, "title": "卷十（原卷 卷八十二–卷九十）"}, {"n": 11, "title": "卷十一（原卷 卷九十一–卷九十九）"}, {"n": 12, "title": "卷十二（原卷 卷一百–卷一百八）"}, {"n": 13, "title": "卷十三（原卷 卷一百九–卷一百十七）"}, {"n": 14, "title": "卷十四（原卷 卷一百十八–卷一百二十六）"}, {"n": 15, "title": "卷十五（原卷 卷一百二十七–卷一百三十五）"}, {"n": 16, "title": "卷十六（原卷 卷一百三十六–卷一百四十四）"}, {"n": 17, "title": "卷十七（原卷 卷一百四十五–卷一百五十三）"}, {"n": 18, "title": "卷十八（原卷 卷一百五十四–卷一百六十二）"}, {"n": 19, "title": "卷十九（原卷 卷一百六十三–卷一百七十一）"}, {"n": 20, "title": "卷二十（原卷 卷一百七十二–卷一百八十）"}, {"n": 21, "title": "卷二十一（原卷 卷一百八十一–卷一百八十九）"}, {"n": 22, "title": "卷二十二（原卷 卷一百九十–卷一百九十九）"}, {"n": 23, "title": "卷二十三（原卷 卷二百–卷二百八）"}, {"n": 24, "title": "卷二十四（原卷 卷二百九–卷二百十七）"}, {"n": 25, "title": "卷二十五（原卷 卷二百十八–卷二百二十六）"}, {"n": 26, "title": "卷二十六（原卷 卷二百二十七–卷二百三十五）"}, {"n": 27, "title": "卷二十七（原卷 卷二百三十六–卷二百四十四）"}, {"n": 28, "title": "卷二十八（原卷 卷二百四十五–卷二百五十三）"}, {"n": 29, "title": "卷二十九（原卷 卷二百五十四–卷二百六十二）"}, {"n": 30, "title": "卷三十（原卷 卷二百六十三–卷二百七十五）"}, {"n": 31, "title": "卷三十一（原卷 卷二百七十六–卷二百八十四）"}, {"n": 32, "title": "卷三十二（原卷 卷二百八十五–卷二百九十三）"}, {"n": 33, "title": "卷三十三（原卷 卷二百九十四–卷三百二）"}, {"n": 34, "title": "卷三十四（原卷 卷三百三–卷三百十一）"}, {"n": 35, "title": "卷三十五（原卷 卷三百十二–卷三百二十）"}, {"n": 36, "title": "卷三十六（原卷 卷三百二十一–卷三百二十九）"}, {"n": 37, "title": "卷三十七（原卷 卷三百三十–卷三百三十八）"}, {"n": 38, "title": "卷三十八（原卷 卷三百三十九–卷三百四十七）"}, {"n": 39, "title": "卷三十九（原卷 卷三百四十八–卷三百五十六）"}, {"n": 40, "title": "卷四十（原卷 卷三百五十七–卷三百五十七）"}], "b_yifang": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}], "b_shenghui": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}, {"n": 35, "title": "卷三十五"}, {"n": 36, "title": "卷三十六"}, {"n": 37, "title": "卷三十七"}, {"n": 38, "title": "卷三十八"}, {"n": 39, "title": "卷三十九"}, {"n": 40, "title": "卷四十"}, {"n": 41, "title": "卷四十一"}], "b_zhubing": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}], "b_piwei": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}], "b_sanyin": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}], "b_jingyue": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}, {"n": 35, "title": "卷三十五"}, {"n": 36, "title": "卷三十六"}, {"n": 37, "title": "卷三十七"}, {"n": 38, "title": "卷三十八"}, {"n": 39, "title": "卷三十九"}, {"n": 40, "title": "卷四十"}, {"n": 41, "title": "卷四十一"}], "b_nvkejl": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}], "b_furen": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}], "b_xiaoer": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}], "b_youyou": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}], "b_liujuanzi": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}], "b_xianshou": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}], "b_waik": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}], "b_yinshan": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}], "b_linzheng": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}], "b_zhongxi": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}, {"n": 8, "title": "卷八"}, {"n": 9, "title": "卷九"}, {"n": 10, "title": "卷十"}, {"n": 11, "title": "卷十一"}, {"n": 12, "title": "卷十二"}, {"n": 13, "title": "卷十三"}, {"n": 14, "title": "卷十四"}, {"n": 15, "title": "卷十五"}, {"n": 16, "title": "卷十六"}, {"n": 17, "title": "卷十七"}, {"n": 18, "title": "卷十八"}, {"n": 19, "title": "卷十九"}, {"n": 20, "title": "卷二十"}, {"n": 21, "title": "卷二十一"}, {"n": 22, "title": "卷二十二"}, {"n": 23, "title": "卷二十三"}, {"n": 24, "title": "卷二十四"}, {"n": 25, "title": "卷二十五"}, {"n": 26, "title": "卷二十六"}, {"n": 27, "title": "卷二十七"}, {"n": 28, "title": "卷二十八"}, {"n": 29, "title": "卷二十九"}, {"n": 30, "title": "卷三十"}, {"n": 31, "title": "卷三十一"}, {"n": 32, "title": "卷三十二"}, {"n": 33, "title": "卷三十三"}, {"n": 34, "title": "卷三十四"}, {"n": 35, "title": "卷三十五"}, {"n": 36, "title": "卷三十六"}, {"n": 37, "title": "卷三十七"}, {"n": 38, "title": "卷三十八"}, {"n": 39, "title": "卷三十九"}, {"n": 40, "title": "卷四十"}, {"n": 41, "title": "卷四十一"}], "b_yixueyuanliu": [{"n": 1, "title": "卷一"}, {"n": 2, "title": "卷二"}, {"n": 3, "title": "卷三"}, {"n": 4, "title": "卷四"}, {"n": 5, "title": "卷五"}, {"n": 6, "title": "卷六"}, {"n": 7, "title": "卷七"}], "b_yizong": [{"n": 1, "title": "新著四言脉诀"}, {"n": 2, "title": "不失人情论"}, {"n": 3, "title": "行方智圆心小胆大论"}], "b_fuqing": [{"n": 1, "title": "带下"}, {"n": 2, "title": "血崩"}, {"n": 3, "title": "鬼胎"}, {"n": 4, "title": "调经"}, {"n": 5, "title": "种子"}, {"n": 6, "title": "妊娠"}, {"n": 7, "title": "小产"}, {"n": 8, "title": "难产"}, {"n": 9, "title": "正产"}, {"n": 10, "title": "产后"}, {"n": 11, "title": "产后编（上卷）"}, {"n": 12, "title": "产后编（下卷）"}, {"n": 13, "title": "补集"}], "b_jingxiao": [{"n": 1, "title": "妊娠安胎方论第一"}, {"n": 2, "title": "妊娠食诸物忌方论第二"}, {"n": 3, "title": "益气滑胎令易产方论第三"}, {"n": 4, "title": "妊娠恶阻吐不食方论第四"}, {"n": 5, "title": "胎动不安方论第五"}, {"n": 6, "title": "妊娠漏胞下血方论第六"}, {"n": 7, "title": "妊娠心腹腰痛方论第七"}, {"n": 8, "title": "妊娠伤寒热病防损胎方论第八"}, {"n": 9, "title": "妊娠患淋小便不利方论第九"}, {"n": 10, "title": "妊娠下痢黄水赤白方论第十"}, {"n": 11, "title": "治妊娠水气身肿腹胀方论第十一"}, {"n": 12, "title": "妊娠千金易产方论第十二"}, {"n": 13, "title": "治产难诸疾方论第十三"}, {"n": 14, "title": "难产死生方论第十四"}, {"n": 15, "title": "难产令易产方论第十五"}, {"n": 16, "title": "胎死胞衣不出方论第十六"}, {"n": 17, "title": "产后心惊中风方论第十七"}, {"n": 18, "title": "产后余血奔心烦闷方论第十八"}, {"n": 19, "title": "产后渴不止方论第十九"}, {"n": 20, "title": "产后淋病诸方论第二十"}, {"n": 21, "title": "产后虚羸下痢方论第二十一"}, {"n": 22, "title": "产腰痛羸瘦补益玉门不闭方论第二十二"}, {"n": 23, "title": "产后中风方论第二十三"}, {"n": 24, "title": "产后余血上抢心痛方论第二十四"}, {"n": 25, "title": "产后汗不止方论第二十五"}, {"n": 26, "title": "产后冷热痢方论第二十六"}, {"n": 27, "title": "产后虚羸方论第二十七"}, {"n": 28, "title": "产后烦渴方论第二十八"}, {"n": 29, "title": "产后烦闷虚热方论第二十九"}, {"n": 30, "title": "产后血瘕方论第三十"}, {"n": 31, "title": "产后余疾痢脓血方论第三十一"}, {"n": 32, "title": "产后小便赤方论第三十二"}, {"n": 33, "title": "产后小便遗血方论三十三"}, {"n": 34, "title": "产后大小便不通方论第三十四"}, {"n": 35, "title": "产后寒热方论第三十五"}, {"n": 36, "title": "产后咳嗽方论第三十六"}, {"n": 37, "title": "产后气痢方论三十七"}, {"n": 38, "title": "产后血晕闷绝方论第三十八"}, {"n": 39, "title": "产后乳无汁方论第三十九"}, {"n": 40, "title": "产后乳结痈方论第四十"}, {"n": 41, "title": "产后乳汁自出方论第四十一"}, {"n": 42, "title": "周颋传授济急方论"}, {"n": 43, "title": "第一论，热病死胎腹中者如何？"}, {"n": 44, "title": "第二论，胎衣不下者如何？"}, {"n": 45, "title": "第三论，难产者如何？"}, {"n": 46, "title": "第四论，闷绝不知人事者如何？"}, {"n": 47, "title": "第五论，口干痞闷者如何？"}, {"n": 48, "title": "第六论，产后乍寒乍热如何？"}, {"n": 49, "title": "第七论，产后四肢虚肿者如何？"}, {"n": 50, "title": "第八论，产后不语者如何？"}, {"n": 51, "title": "第九论，产后乍见鬼神者如何？"}, {"n": 52, "title": "第十论，产后腹痛又泻痢者如何？"}, {"n": 53, "title": "第十一论，产后遍身疼痛者如何？"}, {"n": 54, "title": "第十二论，产后大便秘涩者如何？"}, {"n": 55, "title": "第十三论，产后血崩者何？"}, {"n": 56, "title": "第十四论，产后腹胀闷满呕吐不定者何？"}, {"n": 57, "title": "第十五论，产后口鼻黑气起及鼻衄如何？"}, {"n": 58, "title": "第十六论，喉中气急喘者如何。"}, {"n": 59, "title": "第十七论，产后中风者如何？"}, {"n": 60, "title": "第十八论，产后心痛者如何？"}, {"n": 61, "title": "第十九论，产后热闷气上转为脚气者如何？"}, {"n": 62, "title": "第二十论，出汗多而变痉风如何？"}, {"n": 63, "title": "第二十一论，产后下血过多虚极热生风如何？"}, {"n": 64, "title": "产后十八论方"}], "b_butian": [{"n": 1, "title": "紫微垣"}, {"n": 2, "title": "太微垣"}, {"n": 3, "title": "天市垣"}, {"n": 4, "title": "东方苍龙七宿"}, {"n": 5, "title": "北方玄武七宿"}, {"n": 6, "title": "西方白虎七宿"}, {"n": 7, "title": "南方朱雀七宿"}], "b_daode": [{"n": 1, "title": "一、道之体（本体与无名）"}, {"n": 2, "title": "二、辩证（有无·反复·生一）"}, {"n": 3, "title": "三、守柔不争（上善·谦下）"}, {"n": 4, "title": "四、虚静内修（致虚·抱一）"}, {"n": 5, "title": "五、知足寡欲（养生·知止）"}, {"n": 6, "title": "六、无为（为道日损）"}, {"n": 7, "title": "七、为政（上）：无为而治"}, {"n": 8, "title": "八、为政（下）：治道与民本"}, {"n": 9, "title": "九、用兵（慈俭·不得已）"}, {"n": 10, "title": "十、归朴（绝圣·玄同·小国）"}], "b_huajing": [{"n": 1, "title": "卷一·花历新栽"}, {"n": 2, "title": "卷一·课花十八法（总纲）"}, {"n": 3, "title": "卷二·花木类考（梅）"}, {"n": 4, "title": "卷二·花木类考（桃·李·杏）"}, {"n": 5, "title": "卷三·藤蔓类考（蔷薇·月季）"}, {"n": 6, "title": "卷四·花草类考（牡丹·芍药）"}, {"n": 7, "title": "卷四·花草类考（兰·菊）"}, {"n": 8, "title": "卷五·卉木类考（松·桂·瑞香）"}, {"n": 9, "title": "卷六·附录·种盆取景"}, {"n": 10, "title": "卷六·附录·疗治栽接"}], "b_guangqunfang": [{"n": 1, "title": "天时谱（节令物候）"}, {"n": 2, "title": "谷谱（稻·麦）"}, {"n": 3, "title": "桑麻谱（桑·麻）"}, {"n": 4, "title": "蔬谱（葵·韭·葱姜·菘）"}, {"n": 5, "title": "茶谱（茶）"}, {"n": 6, "title": "花谱（牡丹·梅·菊·兰）"}, {"n": 7, "title": "果谱（桃·李·杏·梨·枣）"}, {"n": 8, "title": "木谱（松·柏·槐·柳）"}, {"n": 9, "title": "竹谱（竹）"}, {"n": 10, "title": "卉谱（芝·萱·萍）"}, {"n": 11, "title": "药谱（人参·甘草）"}], "b_suiyuanshidan": [{"n": 1, "title": "须知单（先求其本）"}, {"n": 2, "title": "戒单（十四戒）"}, {"n": 3, "title": "海鲜单（燕窝·海参·鱼翅）"}, {"n": 4, "title": "江鲜单（刀鱼·鲥鱼）"}, {"n": 5, "title": "特牲单（猪头·火腿）"}, {"n": 6, "title": "羽族单（鸡·鸭）"}, {"n": 7, "title": "水族有鳞单（鱼）"}, {"n": 8, "title": "杂素菜单（笋·豆腐·茄）"}, {"n": 9, "title": "小菜单（酱·腐乳·糟）"}, {"n": 10, "title": "点心单（面·饼·糕）"}, {"n": 11, "title": "饭粥单（饭·粥）"}, {"n": 12, "title": "茶酒单（茶·酒）"}], "b_xuxiake": [{"n": 1, "title": "游天台山日记（浙东）"}, {"n": 2, "title": "游黄山日记（徽州）"}, {"n": 3, "title": "游雁荡山日记（温州）"}, {"n": 4, "title": "游武夷山日记（闽北）"}, {"n": 5, "title": "粤西游日记（桂林·阳朔）"}, {"n": 6, "title": "黔游日记（黄果树）"}, {"n": 7, "title": "滇游日记（鸡足山·洱海）"}, {"n": 8, "title": "江源考（金沙江辨）"}], "b_shishuo": [{"n": 1, "title": "德行（管宁割席）"}, {"n": 2, "title": "言语（谢道韫咏雪）"}, {"n": 3, "title": "言语（新亭对泣）"}, {"n": 4, "title": "方正（陈太丘与友期）"}, {"n": 5, "title": "雅量（嵇康锻铁）"}, {"n": 6, "title": "容止（嵇康·潘岳·卫玠）"}, {"n": 7, "title": "自新（周处）"}, {"n": 8, "title": "贤媛（许允妇）"}, {"n": 9, "title": "任诞（王子猷访戴）"}, {"n": 10, "title": "俭啬（王戎）"}, {"n": 11, "title": "汰侈（石崇）"}, {"n": 12, "title": "伤逝（王子猷哭弟）"}], "b_dongjing": [{"n": 1, "title": "东都外城（汴京形胜）"}, {"n": 2, "title": "河道（汴河·惠民河）"}, {"n": 3, "title": "大内（宫阙）"}, {"n": 4, "title": "御街（天街）"}, {"n": 5, "title": "潘楼东街巷（市井夜市）"}, {"n": 6, "title": "饮食果子（市井吃食）"}, {"n": 7, "title": "马行街铺席（药铺·铺席）"}, {"n": 8, "title": "元宵（灯节）"}, {"n": 9, "title": "京瓦伎艺（勾栏百戏）"}, {"n": 10, "title": "民俗（四时风尚）"}], "b_wulin": [{"n": 1, "title": "湖山胜概（西湖诸景）"}, {"n": 2, "title": "西湖游幸（御舟·市集）"}, {"n": 3, "title": "歌馆（歌妓）"}, {"n": 4, "title": "元夕（灯）"}, {"n": 5, "title": "端午（龙舟）"}, {"n": 6, "title": "中秋（赏月）"}, {"n": 7, "title": "观潮（钱塘江潮）"}, {"n": 8, "title": "岁除（除夜）"}, {"n": 9, "title": "高宗幸张府节次略（御筵）"}], "b_mengxi": [{"n": 1, "title": "技艺（毕昇活字）"}, {"n": 2, "title": "杂志（石油·指南针）"}, {"n": 3, "title": "象数（隙积术·会圆术）"}, {"n": 4, "title": "辨证（音律·名物）"}, {"n": 5, "title": "乐律（声学）"}, {"n": 6, "title": "权智（机智）"}, {"n": 7, "title": "书画（鉴赏）"}, {"n": 8, "title": "药议（药物）"}], "b_qinshi": [{"n": 1, "title": "卷一·琴人（神农·伏羲·黄帝）"}, {"n": 2, "title": "卷一·琴人（尧·舜·禹·文王）"}, {"n": 3, "title": "卷二·琴人（伯牙·钟子期）"}, {"n": 4, "title": "卷二·琴人（司马相如·蔡邕·嵇康）"}, {"n": 5, "title": "卷三·琴声（声·音·制）"}, {"n": 6, "title": "卷四·琴制（材·弦·断纹）"}, {"n": 7, "title": "卷五·琴曲（操·弄·调）"}, {"n": 8, "title": "卷六·琴论（尽美·明义）"}], "b_tiangong": [{"n": 1, "title": "乃粒（稻·麦）"}, {"n": 2, "title": "乃服（蚕·桑）"}, {"n": 3, "title": "彰施（染色）"}, {"n": 4, "title": "粹精（粮食加工）"}, {"n": 5, "title": "作咸（盐）"}, {"n": 6, "title": "陶埏（砖·瓦·瓷）"}, {"n": 7, "title": "冶铸（钟·鼎·钱·釜）"}, {"n": 8, "title": "舟车（船·车）"}, {"n": 9, "title": "锤锻（铁·钢）"}, {"n": 10, "title": "膏液（油）"}, {"n": 11, "title": "杀青（造纸）"}, {"n": 12, "title": "丹青（朱·墨）"}, {"n": 13, "title": "曲蘖（酒曲）"}, {"n": 14, "title": "珠玉（珠·玉·宝石）"}], "b_huainan": [{"n": 1, "title": "一、原道训"}, {"n": 2, "title": "二、俶真训"}, {"n": 3, "title": "三、天文训"}, {"n": 4, "title": "四、览冥训"}, {"n": 5, "title": "五、精神训"}, {"n": 6, "title": "六、本经训"}, {"n": 7, "title": "七、主术训"}, {"n": 8, "title": "八、缪称训"}, {"n": 9, "title": "九、齐俗训"}, {"n": 10, "title": "十、道应训"}], "b_shiji": [{"n": 1, "title": "一、项羽本纪·巨鹿之战"}, {"n": 2, "title": "二、项羽本纪·垓下歌"}, {"n": 3, "title": "三、高祖本纪"}, {"n": 4, "title": "四、留侯世家·圯上进履"}, {"n": 5, "title": "五、伯夷列传"}, {"n": 6, "title": "六、管晏列传"}, {"n": 7, "title": "七、廉颇蔺相如列传·完璧归赵"}, {"n": 8, "title": "八、廉颇蔺相如列传·负荆请罪"}, {"n": 9, "title": "九、李将军列传"}, {"n": 10, "title": "十、太史公自序"}], "b_yunji": [{"n": 1, "title": "一、道德真经"}, {"n": 2, "title": "二、老君垂训"}, {"n": 3, "title": "三、真仙谱系"}, {"n": 4, "title": "四、洞天福地"}, {"n": 5, "title": "五、坐忘守一"}, {"n": 6, "title": "六、服气胎息"}, {"n": 7, "title": "七、内丹还丹"}, {"n": 8, "title": "八、符箓斋醮"}, {"n": 9, "title": "九、神仙感遇"}, {"n": 10, "title": "十、方药养生"}]};
window.YLT_CFG.bookFiles = {"b_shanhaij": ["b_shanhaij_1.js"], "b_huangdi": ["b_huangdi_1.js"], "b_shennong": ["b_shennong_1.js"], "b_nanjing": ["b_nanjing_1.js"], "b_shanghan": ["b_shanghan_1.js"], "b_maijing": ["b_maijing_1.js"], "b_zhouhou": ["b_zhouhou_1.js"], "b_qianjin": ["b_qianjin_1.js", "b_qianjin_2.js", "b_qianjin_3.js"], "b_shiliao": ["b_shiliao_1.js"], "b_bencao": ["b_bencao_1.js", "b_bencao_2.js", "b_bencao_3.js", "b_bencao_4.js", "b_bencao_5.js", "b_bencao_6.js", "b_bencao_7.js", "b_bencao_8.js"], "b_wenbing": ["b_wenbing_1.js"], "b_wenre": ["b_wenre_1.js"], "b_shire": ["b_shire_1.js"], "b_jiayi": ["b_jiayi_1.js"], "b_zhenjiu": ["b_zhenjiu_1.js"], "b_binhu": ["b_binhu_1.js"], "b_bcsy": ["b_bcsy_1.js", "b_bcsy_2.js"], "b_waitai": ["b_waitai_1.js", "b_waitai_2.js", "b_waitai_3.js", "b_waitai_4.js"], "b_hejiju": ["b_hejiju_1.js"], "b_puji": ["b_puji_1.js", "b_puji_2.js", "b_puji_3.js", "b_puji_4.js", "b_puji_5.js", "b_puji_6.js", "b_puji_7.js", "b_puji_8.js", "b_puji_9.js", "b_puji_10.js", "b_puji_11.js", "b_puji_12.js", "b_puji_13.js", "b_puji_14.js", "b_puji_15.js", "b_puji_16.js", "b_puji_17.js", "b_puji_18.js", "b_puji_19.js", "b_puji_20.js", "b_puji_21.js", "b_puji_22.js", "b_puji_23.js", "b_puji_24.js", "b_puji_25.js", "b_puji_26.js"], "b_yifang": ["b_yifang_1.js"], "b_shenghui": ["b_shenghui_1.js", "b_shenghui_2.js", "b_shenghui_3.js", "b_shenghui_4.js", "b_shenghui_5.js", "b_shenghui_6.js", "b_shenghui_7.js", "b_shenghui_8.js"], "b_zhubing": ["b_zhubing_1.js", "b_zhubing_2.js"], "b_piwei": ["b_piwei_1.js"], "b_sanyin": ["b_sanyin_1.js"], "b_jingyue": ["b_jingyue_1.js", "b_jingyue_2.js", "b_jingyue_3.js", "b_jingyue_4.js", "b_jingyue_5.js"], "b_nvkejl": ["b_nvkejl_1.js"], "b_furen": ["b_furen_1.js", "b_furen_2.js"], "b_xiaoer": ["b_xiaoer_1.js"], "b_youyou": ["b_youyou_1.js"], "b_liujuanzi": ["b_liujuanzi_1.js"], "b_xianshou": ["b_xianshou_1.js"], "b_waik": ["b_waik_1.js"], "b_yinshan": ["b_yinshan_1.js"], "b_linzheng": ["b_linzheng_1.js", "b_linzheng_2.js"], "b_zhongxi": ["b_zhongxi_1.js", "b_zhongxi_2.js", "b_zhongxi_3.js"], "b_yixueyuanliu": ["b_yixueyuanliu_1.js"], "b_yizong": ["b_yizong_1.js"], "b_fuqing": ["b_fuqing_1.js"], "b_jingxiao": ["b_jingxiao_1.js"], "b_butian": ["b_butian_1.js"], "b_daode": ["b_daode_1.js"], "b_huajing": ["b_huajing_1.js"], "b_guangqunfang": ["b_guangqunfang_1.js"], "b_suiyuanshidan": ["b_suiyuanshidan_1.js"], "b_xuxiake": ["b_xuxiake_1.js"], "b_shishuo": ["b_shishuo_1.js"], "b_dongjing": ["b_dongjing_1.js"], "b_wulin": ["b_wulin_1.js"], "b_mengxi": ["b_mengxi_1.js"], "b_qinshi": ["b_qinshi_1.js"], "b_tiangong": ["b_tiangong_1.js"], "b_huainan": ["b_huainan_1.js"], "b_shiji": ["b_shiji_1.js"], "b_yunji": ["b_yunji_1.js"]};

/* ===== config/20_minigame.js ===== */
/* =========================================================================
 * 《明清日常》· 家园小玩法配置（config/20_minigame.js）
 * -------------------------------------------------------------------------
 * 下棋（五子棋）/ 练剑 / 切磋 / 破阵 四玩法的台词与数值初值。
 * 经 99_assemble 并入 GAME_CONFIG.miniCfg，引擎只读 GAME_CONFIG。
 * 仅数据，无逻辑；新增玩法在此加一项即可。
 * ========================================================================= */
window.YLT_CFG = window.YLT_CFG || {};
window.YLT_CFG.miniCfg = {
  // 五子棋：胜 / 败 / 平 × 阎明(ming) / 清凝(qing)，各 1 句
  chess: {
    win:  { ming: "表现不错。",  qing: "好厉害！" },
    lose: { ming: "承让。",                    qing: "你真厉害，我输了……" },
    tie:  { ming: "棋逢对手，平局。",  qing: "平手呢，再来一局？" }
  },
  // 练剑 / 切磋：3 档（高分>阈值 / 平局==阈值 / 低分<阈值）。切磋表独立，文本暂同练剑
  sword: {
    high: { ming: "表现不错。",  qing: "好厉害！" },
    tie:  { ming: "中规中矩，还差些火候。", qing: "稳住就好，慢慢来~" },
    low:  { ming: "还需多加练习。", qing: "要再加油呀~" }
  },
  spar: {
    high: { ming: "表现不错。",  qing: "好厉害！" },
    tie:  { ming: "旗鼓相当，算是平手。", qing: "不分高下呢~" },
    low:  { ming: "还需多加练习。", qing: "要再加油呀~" }
  },
  // 破阵：网格尺寸（6 列 × 9 行 = 54 格）+ 阵眼/特效区间
  // 2026-07-26 优化：原为 9 列×6 行（扁格 ~25px）；按需求改 6 列×9 行（近正方大格 ~32px），更易点、更协调。
  formation: {
    cols: 6, rows: 9,
    eyesMin: 1, eyesMax: 5,
    effectRanges: { lingguang: [1, 3], wu: [1, 3], tuisuan: [1, 3] },
    // 破解成功结算台词（finishMini 用 speechKey="success"）
    success: { ming: "破阵完成，小意思~", qing: "嘿嘿嘿，太厉害了！" }
  },
  // 练剑招式（3 招：刺/挑/架）
  swordMoves: ["刺剑", "挑剑", "架剑"],
  // 武器架触发概率（中→50/50 随机练剑/切磋）
  weaponTrigger: 0.5,
  // 秋千触发概率（中→下棋）
  swingTrigger: 0.25,
  // 窗户（白天）触发概率（中→破阵）
  windowTrigger: 0.25,
};

/* ===== config/99_assemble.js ===== */
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

