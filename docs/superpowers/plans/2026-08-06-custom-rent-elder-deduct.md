# 住房租金/赡养老人自定义金额 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 专项附加扣除中住房租金、赡养老人支持法定上限内的自定义金额输入。

**Architecture:** 档位选项增加 `custom`；金额内部统一存每月元；UI 按 calcMode/汇算页换算展示；`calcSpecialAddMonthly` 增加 custom 分支；确认校验抽到 `validate.js`。

**Tech Stack:** 微信原生小程序、现有 van-field / option-chip

**Spec:** `docs/superpowers/specs/2026-08-06-custom-rent-elder-deduct-design.md`

## Global Constraints

- 自定义金额严格不超过法定上限（租金 1500/月，赡养独生 3000/非独生 1500）
- 内部始终存每月金额
- 工资页输入单位跟随 calcMode；汇算页固定按年
- 房贷与租金（含 custom）互斥不变

---

### Task 1: 公式与校验

**Files:** `utils/taxFormula.js`, `utils/validate.js`

- [x] `calcSpecialAddMonthly` 支持 rent/elder custom + clamp
- [x] 导出 `clampSpecialCustomAmount` / `getElderCustomLimit`（可选）
- [x] `checkSpecialCustomConfirm(draft)` 确认校验

### Task 2: 工资页 index

**Files:** `pages/index/index.js`, `pages/index/index.wxml`, `styles/common.wxss`

- [x] data 字段、options、open/confirm/calc/reset 传递自定义字段
- [x] 自定义输入换算与上限截断
- [x] wxml 展开区 + 样式

### Task 3: 汇算页 annual + help

**Files:** `pages/annual/annual.js`, `pages/annual/annual.wxml`, `pages/help/help.js`

- [x] 同步 Task 2（输入固定按年）
- [x] help 文案补充
