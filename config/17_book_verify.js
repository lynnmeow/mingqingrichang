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
  "b_poem03": true,     // 苏轼集
  "b_poem04": true,     // 辛弃疾集
  "b_poem05": true,     // 宋诗词选
  "b_poem10": true,     // 元曲选
  "b_poem02": true,     // 龚自珍集
  "b_poem07": true,     // 清诗选
  "b_poem11": true,     // 历代遗珠
  // ===== 话本/故事 story（已检查）=====
  "b_jinbo": true,      // 金波旬花
  "b_liangshi": true,   // 两时花
  "b_pincou": true,     // 拼凑月亮
  // ===== 杂览 misc（待逐本检查：保持 false）=====
  "b_daode": false, "b_shanhaij": false, "b_zhuang": false, "b_huainan": false,
  "b_shiji": false, "b_shishuo": false, "b_chajing": false, "b_butian": false,
  "b_jiupu": false, "b_xiangpu": false, "b_dongjing": false, "b_wulin": false,
  "b_mengxi": false, "b_qinshi": false, "b_yunji": false, "b_pingshi": false,
  "b_xuxiake": false, "b_tiangong": false, "b_huajing": false, "b_guangqunfang": false,
  "b_suiyuanshidan": false,
  // ===== 医典 medical（待逐本检查：保持 false）=====
  "b_huangdi": false, "b_shennong": false, "b_nanjing": false, "b_shanghan": false,
  "b_maijing": false, "b_zhouhou": false, "b_jiayi": false, "b_liujuanzi": false,
  "b_zhubing": false, "b_qianjin": false, "b_shiliao": false, "b_waitai": false,
  "b_jingxiao": false, "b_xianshou": false, "b_hejiju": false, "b_shenghui": false,
  "b_sanyin": false, "b_furen": false, "b_xiaoer": false, "b_piwei": false,
  "b_yinshan": false, "b_bencao": false, "b_zhenjiu": false, "b_binhu": false,
  "b_puji": false, "b_jingyue": false, "b_yizong": false, "b_waik": false,
  "b_wenbing": false, "b_wenre": false, "b_shire": false, "b_bcsy": false,
  "b_yifang": false, "b_fuqing": false, "b_nvkejl": false, "b_youyou": false,
  "b_linzheng": false, "b_zhongxi": false, "b_yixueyuanliu": false
};
