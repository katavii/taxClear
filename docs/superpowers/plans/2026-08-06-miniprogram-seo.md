# 个税计算器小程序 SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化小程序搜索可发现性，主关键词「个税计算器」。

**Architecture:** 更新全局/页面标题与可索引文案；帮助页增加 FAQ；计算页增加分享；另在 README 附后台配置清单。不改计税逻辑与路由。

**Tech Stack:** 微信原生小程序（WXML/WXSS/JS/JSON）

## Global Constraints

- 主词：个税计算器；辅词：个人所得税计算器
- 禁止：官方、税务局、精准报税
- 须保留免责声明：测算结果仅供参考，最终数据以国家税务总局官方系统为准
- Spec: `docs/superpowers/specs/2026-08-06-miniprogram-seo-design.md`

---

### Task 1: 标题与项目描述

**Files:**
- Modify: `app.json`, `project.config.json`, `pages/index/index.json`, `pages/bonus/bonus.json`, `pages/annual/annual.json`, `pages/labor/labor.json`, `pages/help/help.json`

- [x] 按设计表更新 `navigationBarTitleText` 与 `description`

### Task 2: 首页说明 + 页头文案

**Files:**
- Modify: `pages/index/index.wxml`, `pages/index/index.wxss`, `pages/annual/annual.wxml`

- [x] 首页 immersive-header 与 SEO 说明行
- [x] 汇算页 header 同步主词

### Task 3: 帮助页 FAQ

**Files:**
- Modify: `pages/help/help.wxml`, `pages/help/help.wxss`, `pages/help/help.js`（若 FAQ 用 data）

- [x] 增加 6 条 FAQ + 样式，保留免责声明

### Task 4: 分享

**Files:**
- Modify: `pages/index/index.js`, `pages/bonus/bonus.js`, `pages/annual/annual.js`, `pages/labor/labor.js`, `pages/help/help.js`
- Modify: 对应 `*.json`（自定义导航页加 `enableShareAppMessage`）

- [x] 各页 `onShareAppMessage` / `onShareTimeline`，标题含主词

### Task 5: 文档

**Files:**
- Modify: `README.md`
- Modify: design spec 状态为已通过

- [x] README 增加「搜索优化 / 后台配置」小节
