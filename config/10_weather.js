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
