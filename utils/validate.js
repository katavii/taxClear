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

module.exports = {
  checkDeductMutex,
  checkTaxInput,
  parseAmount,
  parseSliderValue,
}
