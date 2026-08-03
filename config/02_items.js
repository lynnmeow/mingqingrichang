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
    { id:"b_shi", name:"《诗经选》", type:"book", desc:"诗三百，思无邪。" },
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
    { id: "b_poem08", name: "《李商隐集》", type: "book", desc: "唐·李商隐 诗词辑录。" },
    { id: "b_poem09", name: "《李贺集》", type: "book", desc: "唐·李贺 诗词辑录。" },
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
