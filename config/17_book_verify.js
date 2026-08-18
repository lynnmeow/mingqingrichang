/* =========================================================================
 * 《明清日常》书籍掉落审查开关（F9 阅读系统）
 * ----------------------------------------------------------------------
 * 用途：逐本检查书籍内容后，把对应书设为「已检查」才会掉落给玩家。
 *      未检查的书：所有途径（大树每日产出 / 访客赠书 / 出游击败·采药掉落 /
 *      新号初始不预置首章、也不走任何掉落）均不开放，玩家无法获得，待检查通过再翻为 true。
 * 配置方式：把书名对应的 id 的值改成 true 即视为「已检查可掉落」。
 *      缺失 / false / 删掉该行 → 一律视为「未检查」。
 * 初始：诗词(poem) + 话本(story) 已检查；其余（医典 medical / 杂览 misc）待逐本检查。
 * ----------------------------------------------------------------------
 * 判定逻辑见 src/home.js 的 isBookVerified(id)：读本表；值 !== true 即未检查。
 * 调试：控制台 game._dbg.verifyBook('b_huangdi', true) 可运行时临时放行某书掉落。
 * ========================================================================= */
window.YLT_BOOK_VERIFY = {
  // ===== 诗词 poem（已检查）=====
  "b_shi": true,        // 诗经
  "b_chu": true,        // 楚辞
  "b_poem01": true,     // 李白集
  "b_poem06": true,     // 唐诗选
  "b_poem08": true,     // 李商隐集
  "b_poem09": true,     // 李贺集
  "b_poem03": true,     // 苏轼集
  "b_poem04": true,     // 辛弃疾集
  "b_poem05": true,     // 宋诗词选
  "b_poem10": true,     // 元曲选
  "b_poem02": true,     // 龚自珍集
  "b_poem07": true,     // 清诗选
  "b_poem11": true,     // 历代遗珠
  "b_poem12": true,     // 古诗源
  // ===== 话本/故事 story（已检查）=====
  "b_jinbo": true,      // 金波旬花
  "b_liangshi": true,   // 两时花
  "b_pincou": true,     // 拼凑月亮
  "b_huanqi": true,     // 唤起一天明月
  "b_hudie": true,      // 蝴蝶蝴蝶飞去哪儿
  // ===== 杂览 misc（待逐本检查：保持 false）=====
  "b_daode": true,           // 道德经
  "b_shanhaij": false,        // 山海经
  "b_zhuang": true,           // 庄子
  "b_huainan": false,         // 淮南子
  "b_shiji": false,           // 史记
  "b_shishuo": false,         // 世说新语
  "b_chajing": true,          // 茶经
  "b_butian": false,          // 丹元子步天歌
  "b_jiupu": true,           // 酒谱
  "b_xiangpu": true,         // 香谱
  "b_dongjing": false,        // 东京梦华录
  "b_wulin": false,           // 武林旧事
  "b_mengxi": false,          // 梦溪笔谈
  "b_qinshi": false,          // 琴史
  "b_yunji": false,           // 云笈七签
  "b_pingshi": true,         // 瓶史
  "b_xuxiake": false,         // 徐霞客游记
  "b_tiangong": false,        // 天工开物
  "b_huajing": false,         // 花镜
  "b_guangqunfang": false,    // 广群芳谱
  "b_suiyuanshidan": false,   // 随园食单
  // ===== 医典 medical（待逐本检查：保持 false）=====
  "b_huangdi": false,         // 黄帝内经
  "b_shennong": false,        // 神农本草经
  "b_nanjing": false,         // 难经
  "b_shanghan": false,        // 伤寒论
  "b_maijing": false,         // 脉经
  "b_zhouhou": false,         // 肘后备急方
  "b_jiayi": false,           // 针灸甲乙经
  "b_liujuanzi": false,       // 刘涓子鬼遗方
  "b_zhubing": false,         // 诸病源候论
  "b_qianjin": false,         // 千金方
  "b_shiliao": false,         // 食疗本草
  "b_waitai": false,          // 外台秘要
  "b_jingxiao": false,        // 经效产宝
  "b_xianshou": false,        // 仙授理伤续断秘方
  "b_hejiju": false,          // 太平惠民和剂局方
  "b_shenghui": false,        // 太平圣惠方
  "b_sanyin": false,          // 三因极一病证方论
  "b_furen": false,           // 妇人大全良方
  "b_xiaoer": false,          // 小儿药证直诀
  "b_piwei": false,           // 脾胃论
  "b_yinshan": false,         // 饮膳正要
  "b_bencao": false,          // 本草纲目
  "b_zhenjiu": false,         // 针灸大成
  "b_binhu": false,           // 濒湖脉学
  "b_puji": false,            // 普济方
  "b_jingyue": false,         // 景岳全书
  "b_yizong": false,          // 医宗必读
  "b_waik": false,            // 外科正宗
  "b_wenbing": false,         // 温病条辨
  "b_wenre": false,           // 温热论
  "b_shire": false,           // 湿热病篇
  "b_bcsy": false,            // 本草纲目拾遗
  "b_yifang": false,          // 医方集解
  "b_fuqing": false,          // 傅青主女科
  "b_nvkejl": false,          // 女科经纶
  "b_youyou": false,          // 幼幼集成
  "b_linzheng": false,        // 临证指南医案
  "b_zhongxi": false,         // 医学衷中参西录
  "b_yixueyuanliu": false,    // 医学源流论
};
