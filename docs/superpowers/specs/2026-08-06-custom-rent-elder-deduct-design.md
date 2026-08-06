# 专项附加扣除：住房租金 / 赡养老人自定义金额

**日期**：2026-08-06  
**状态**：待实现  
**方案**：1（档位 + 自定义，内部统一存每月金额）

## 1. 目标与边界

### 目标

在专项附加扣除弹窗中，为「住房租金」「赡养老人」增加「自定义」选项，允许用户在法定上限内自行填写扣除金额。

### 范围内

- 计算：`utils/taxFormula.js` 的 `calcSpecialAddMonthly` / `calcSpecialAddAnnual`
- 页面：`pages/index`（工资薪金）、`pages/annual`（年度汇算）专项弹窗
- 校验：确认填入时的空值 / 类型 / 上限校验
- 帮助：`pages/help` 补充「可自定义、不超法定上限」说明

### 范围外

- 不改子女教育、婴幼儿照护、继续教育、住房贷款利息、大病医疗的录入方式
- 不放开超法定上限的金额（严格截断，不允许按超限金额计税）
- 历史详情页不新增自定义明细展示（合计仍由现有逻辑算出）

## 2. 已确认决策

| 决策点 | 选择 |
|--------|------|
| 交互 | 保留现有档位，新增「自定义」；选中后展开输入区 |
| 上限 | 严格限制，超限截断到法定上限并 toast |
| 输入单位 | 跟随计算模式：月度按月、年度按年（汇算页始终按年） |
| 赡养自定义 | 需再选「独生子女 / 非独生子女」，再按对应上限校验 |
| 存储 | 自定义金额内部始终存**每月**金额 |

## 3. 数据模型

工资页与汇算页共用同一结构（页面 data + `specialDraft`）：

| 字段 | 类型 | 含义 |
|------|------|------|
| `rentLevel` | `'none' \| 'low' \| 'mid' \| 'high' \| 'custom'` | 租金档位 |
| `rentCustomAmount` | `number` | 自定义租金，**每月**元；非 custom 时不参与计算 |
| `supportElderType` | `'none' \| 'single' \| 'shared' \| 'custom'` | 赡养档位 |
| `supportElderCustomKind` | `'single' \| 'shared'` | 自定义时的赡养类型；未选时不计入 |
| `supportElderCustomAmount` | `number` | 自定义赡养，**每月**元；非 custom 时不参与计算 |

默认值：

- `rentCustomAmount`: `0`
- `supportElderCustomKind`: `''`（空，表示未选）
- `supportElderCustomAmount`: `0`

## 4. 计算逻辑

在 `calcSpecialAddMonthly(config)` 中：

1. 既有档位逻辑不变（`low/mid/high`、`single/shared`、房贷等）。
2. 当 `rentLevel === 'custom'`：  
   `monthly += clamp(rentCustomAmount, 0, SPECIAL_ADD_DEDUCT.rentHigh)`  
   （上限 1500 元/月）
3. 当 `supportElderType === 'custom'`：  
   - 若 `supportElderCustomKind` 为空 → 不加  
   - 若 `'single'` → 上限 `supportElderSingle`（3000）  
   - 若 `'shared'` → 上限 `supportElderLimit`（1500）  
   - `monthly += clamp(supportElderCustomAmount, 0, limit)`

`calcSpecialAddAnnual` 仍为 `monthly * 12`，无需单独分支。

### 互斥

`hasHouseLoan` 与「有租金」互斥：`rentLevel !== 'none'`（含 `custom`）即视为有租金，与现有 `checkDeductMutex` 行为一致。

## 5. UI 行为

### 5.1 住房租金

- `rentOptions` 增加：`{ name: '自定义', value: 'custom' }`
- 选中 `custom` 后，选项下方显示金额输入框
- 占位文案：
  - 月度模式：`请输入每月租金扣除（最高 1500）`
  - 年度模式 / 汇算页：`请输入每年租金扣除（最高 18000）`
- 输入框展示值 = 月金额（年度则 ×12）；写回时年度输入 ÷12 存入 `rentCustomAmount`
- 超上限：截断到上限并 toast「不得超过法定上限」

### 5.2 赡养老人

- `elderOptions` 增加：`{ name: '自定义', value: 'custom' }`
- 选中 `custom` 后展开：
  1. 「独生子女 / 非独生子女」选项（写入 `supportElderCustomKind`）
  2. 金额输入框（未选 kind 时禁用；选 kind 后可输入）
- 上限随 kind：
  - 独生：3000/月（36000/年）
  - 非独生：1500/月（18000/年）
- 切换 kind 导致当前金额超新上限 → 截断并 toast
- 占位文案随模式与 kind 上限变化

### 5.3 切回非自定义档位

隐藏自定义输入区；**保留**上次的 `rentCustomAmount`、`supportElderCustomAmount`、`supportElderCustomKind`，便于再次选自定义时回填；非 custom 时这些字段不参与计算。

### 5.4 模式切换（工资页）

`calcMode` 在月度 ↔ 年度间切换时，已存月金额不变，仅刷新输入框展示（×12 / ÷12）。弹窗打开时按当前模式渲染。

### 5.5 确认填入

在现有互斥校验之外增加：

| 条件 | 提示 |
|------|------|
| `rentLevel === 'custom'` 且月金额 ≤ 0 | 请填写住房租金扣除金额 |
| `supportElderType === 'custom'` 且未选 kind | 请选择赡养类型 |
| `supportElderType === 'custom'` 且月金额 ≤ 0 | 请填写赡养老人扣除金额 |

通过后写入页面 data，刷新摘要与合计。

## 6. 涉及文件

| 文件 | 改动 |
|------|------|
| `utils/taxFormula.js` | custom 分支计入月扣除；必要时导出上限辅助函数 |
| `utils/validate.js` | 可选：抽「自定义专项确认」校验，供两页复用 |
| `pages/index/index.js` / `.wxml` | 字段、选项、输入换算、确认校验 |
| `pages/annual/annual.js` / `.wxml` | 同上（输入单位固定为年） |
| `pages/help/help.js` | 租金 / 赡养标准说明补充自定义一句 |
| `styles/common.wxss` | 若需自定义输入区样式，沿用现有弹窗表单项风格 |

## 7. 历史兼容

- 旧记录无自定义字段：按既有档位计算，行为不变。
- 新记录将完整 config（含自定义字段）写入 `storage`；详情页继续展示合计，不单独展示自定义明细。

## 8. 测试要点

1. 租金选低/中/高：金额与现网一致。
2. 租金选自定义：月度输入 1200 → 月扣 1200；年度输入 14400 → 月扣 1200。
3. 租金自定义输入 2000（月）→ 截断为 1500 并提示。
4. 赡养选独生/非独生档位：与现网一致。
5. 赡养自定义 + 独生 + 2500 → 月扣 2500；改非独生 → 截断为 1500。
6. 自定义赡养未选 kind 点确认 → 拦截。
7. 房贷开 + 租金自定义 → 互斥提示并自动清除一侧。
8. 工资页切换月/年模式：自定义展示单位变，合计正确。
9. 汇算页自定义按年输入，全年扣除合计正确。
10. 无自定义字段的旧逻辑回归：仅选档位时结果不变。
