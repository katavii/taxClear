# 个税计算器

轻量化无广告的个人所得税计算器微信小程序，遵循国家税务总局现行个税计税标准。

## 技术栈

- 微信原生小程序（WXML + WXSS + JavaScript）
- [Vant Weapp](https://vant-contrib.gitee.io/vant-weapp/) UI 组件库
- 微信云开发（CloudBase）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 导入项目

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具 → 导入项目
3. 选择本项目目录 `/Users/apple/liqiang/firstGold/geshui`
4. 填入你的小程序 **AppID**（测试可选用测试号）

### 3. 构建 npm

在微信开发者工具中：

**工具 → 构建 npm**

构建完成后会生成 `miniprogram_npm` 目录，Vant 组件方可正常使用。

### 4. 开通云开发（可选）

1. 开发者工具 → 云开发 → 开通
2. 创建云环境，记录环境 ID
3. 在 `app.js` 的 `wx.cloud.init()` 中填入环境 ID：

```javascript
wx.cloud.init({
  env: 'your-env-id',
  traceUser: true,
})
```

4. 右键 `cloudfunctions/syncRecords` → 上传并部署（云端安装依赖）

### 5. 配置 AppID

修改 `project.config.json` 中的 `appid` 字段为你的小程序 AppID。

## 项目结构

```
├── app.js / app.json / app.wxss   # 小程序入口
├── pages/
│   ├── index/      # 月度工资个税计算（首页）
│   ├── bonus/      # 年终奖计算
│   ├── annual/     # 年度汇算清缴
│   ├── labor/      # 劳务报酬计算
│   ├── history/    # 历史记录
│   ├── help/       # 帮助中心 + 税率表
│   └── mine/       # 个人中心
├── utils/
│   ├── taxFormula.js  # 核心个税算法
│   ├── validate.js    # 表单校验
│   └── storage.js     # 本地缓存
├── cloudfunctions/
│   └── syncRecords/   # 云端账单同步云函数
└── assets/icons/      # TabBar 图标
```

## 功能说明

| 模块 | 说明 |
|------|------|
| 月度工资 | 累计预扣预缴法，支持专项附加扣除 |
| 年终奖 | 单独计税 vs 合并计税，自动推荐最优方案 |
| 年度汇算 | 补税/退税测算，支持大病医疗扣除 |
| 劳务报酬 | 预扣预缴三级超额累进税率 |
| 历史记录 | 本地 Storage 缓存，支持删除 |
| 帮助中心 | 内置税率表、专项附加扣除标准 |

## 搜索优化（后台需人工配置）

代码侧已优化页面标题、帮助 FAQ 与分享文案。发布后请在微信公众平台同步：

| 项 | 建议 |
|----|------|
| 小程序名称 | 优先「个税计算器」；若重名，用「个税计算器」开头的短变体 |
| 简介 | 见下方示例 |
| 标签 | 个税计算器、个人所得税计算器、工资个税、年终奖计税、年度汇算 |
| 红线 | 禁止使用「官方」「税务局」「精准报税」 |

简介示例：

> 个税计算器，免费个人所得税测算工具。支持工资薪金、年终奖、劳务报酬与年度汇算清缴测算，内置税率表与专项附加扣除说明。测算结果仅供参考，最终以国家税务总局官方系统为准。

详细设计见：[docs/superpowers/specs/2026-08-06-miniprogram-seo-design.md](./docs/superpowers/specs/2026-08-06-miniprogram-seo-design.md)

## 注意事项

- 测算结果仅供参考，最终数据以国家税务总局官方系统为准
- 住房贷款利息与住房租金不可同时填报
- 大病医疗扣除仅在年度汇算页面开放
- 上线前需完成小程序认证、隐私政策配置及备案

## 参考文档

详细产品与技术方案见：[个人所得税计算器 微信小程序 产品+技术设计方案.md](./个人所得税计算器%20微信小程序%20产品+技术设计方案.md)
