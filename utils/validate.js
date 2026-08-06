/**
 * 个税计算器 表单校验工具
 * 实现专项附加扣除互斥、表单入参校验
 */

function checkDeductMutex(hasLoan, hasRent) {
  if (hasLoan && hasRent) {
    return { pass: false, msg: '约束规则：住房贷款利息与住房租金同一纳税年度不可同时填报' }
  }
  return { pass: true }
}

function checkTaxInput(value) {
  if (value === '' || value === undefined || value === null) return true
  const reg = /^(0|[1-9]\d*)(\.\d{1,2})?$/
  return reg.test(String(value)) && parseFloat(value) >= 0
}

function parseAmount(value) {
  if (value === '' || value === undefined || value === null) return 0
  const num = parseFloat(value)
  return isNaN(num) || num < 0 ? 0 : num
}

function parseSliderValue(detail) {
  if (detail && typeof detail === 'object') return detail.value
  return detail
}

/**
 * 自定义专项确认校验（金额内部为每月）
 */
function checkSpecialCustomConfirm(draft = {}) {
  if (draft.rentLevel === 'custom' && !(Number(draft.rentCustomAmount) > 0)) {
    return { pass: false, msg: '请填写住房租金扣除金额' }
  }
  if (draft.supportElderType === 'custom' && !(Number(draft.supportElderCustomAmount) > 0)) {
    return { pass: false, msg: '请填写赡养老人扣除金额' }
  }
  return { pass: true }
}

/**
 * 将展示金额转为每月金额，并按月上限截断
 * @returns {{ monthly: number, display: string, capped: boolean }}
 */
function parseCustomDeductInput(displayValue, isYearly, maxMonthly) {
  const raw = parseAmount(displayValue)
  let monthly = isYearly ? raw / 12 : raw
  const max = Number(maxMonthly) > 0 ? Number(maxMonthly) : 0
  const capped = max > 0 && monthly > max
  if (capped) monthly = max
  monthly = Math.round(monthly * 100) / 100
  let display = ''
  if (capped) {
    const displayNum = isYearly ? Math.round(monthly * 12 * 100) / 100 : monthly
    display = String(displayNum)
  } else if (displayValue !== '' && displayValue !== undefined && displayValue !== null) {
    display = String(displayValue)
  }
  return { monthly, display, capped }
}

/** 每月金额 → 输入框展示字符串 */
function formatCustomDeductDisplay(monthly, isYearly) {
  const m = parseAmount(monthly)
  if (m <= 0) return ''
  const v = isYearly ? Math.round(m * 12 * 100) / 100 : Math.round(m * 100) / 100
  return String(v)
}

module.exports = {
  checkDeductMutex,
  checkSpecialCustomConfirm,
  checkTaxInput,
  parseAmount,
  parseSliderValue,
  parseCustomDeductInput,
  formatCustomDeductDisplay,
}
