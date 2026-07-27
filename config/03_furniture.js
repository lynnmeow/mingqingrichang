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
