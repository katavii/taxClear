/**
 * 个税计算器 核心算法文件
 * 政策依据：2026国税现行政策｜年终奖优惠延续至2027.12.31
 * 适配微信原生小程序｜全局遵循项目开发硬性约束
 */

const BASE_DEDUCTION_MONTH = 5000
const BASE_DEDUCTION_YEAR = 60000

const SALARY_TAX_TABLE = [
  { min: 0, max: 36000, rate: 0.03, quickDeduct: 0 },
  { min: 36000, max: 144000, rate: 0.10, quickDeduct: 2520 },
  { min: 144000, max: 300000, rate: 0.20, quickDeduct: 16920 },
  { min: 300000, max: 420000, rate: 0.25, quickDeduct: 31920 },
  { min: 420000, max: 660000, rate: 0.30, quickDeduct: 52920 },
  { min: 660000, max: 960000, rate: 0.35, quickDeduct: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, quickDeduct: 181920 },
]

const BONUS_TAX_TABLE = [
  { min: 0, max: 3000, rate: 0.03, quickDeduct: 0 },
  { min: 3000, max: 12000, rate: 0.10, quickDeduct: 210 },
  { min: 12000, max: 25000, rate: 0.20, quickDeduct: 1410 },
  { min: 25000, max: 35000, rate: 0.25, quickDeduct: 2660 },
  { min: 35000, max: 55000, rate: 0.30, quickDeduct: 4410 },
  { min: 55000, max: 80000, rate: 0.35, quickDeduct: 7160 },
  { min: 80000, max: Infinity, rate: 0.45, quickDeduct: 15160 },
]

const SPECIAL_ADD_DEDUCT = {
  babyCare: 1000,
  childEdu: 1000,
  degreeEdu: 400,
  certificateEdu: 3600,
  supportElderSingle: 3000,
  supportElderLimit: 1500,
  houseLoan: 1000,
  rentLow: 800,
  rentMid: 1100,
  rentHigh: 1500,
  seriousIllness: 60000,
}

/** 五险一金个人缴纳比例（2026 常规口径） */
const INSURE_RATES = {
  pension: 0.08,
  medical: 0.02,
  unemployment: 0.005,
  housingFundDefault: 0.07,
  housingFundMin: 0.05,
  housingFundMax: 0.12,
}

function toFixed2(num) {
  return parseFloat(Number(num).toFixed(2))
}

function getNonNegative(num) {
  return num && num >= 0 ? toFixed2(num) : 0
}

function getTaxLevel(taxAmount, taxTable) {
  return taxTable.find((item) => taxAmount > item.min && taxAmount <= item.max) || taxTable[0]
}

/**
 * 按相同月收入/扣除，自动推算 1 月至上月累计已预缴税额
 */
function calcAutoCumulativePaidTax(month, monthlyIncome, monthlyInsure, monthlyOtherDeduct, monthlySpecialAdd) {
  if (month <= 1) return 0

  let cumulativePaidTax = 0
  for (let m = 1; m < month; m++) {
    const result = calcMonthSalaryTax(
      m,
      monthlyIncome * m,
      monthlyInsure * m,
      monthlyOtherDeduct * m,
      monthlySpecialAdd * m,
      cumulativePaidTax
    )
    cumulativePaidTax = toFixed2(cumulativePaidTax + result.currentMonthTax)
  }
  return cumulativePaidTax
}

function calcMonthSalaryTax(month, totalIncome, totalInsure, totalOtherDeduct, totalSpecialAdd, totalPaidTax) {
  const _income = getNonNegative(totalIncome)
  const _insure = getNonNegative(totalInsure)
  const _otherDeduct = getNonNegative(totalOtherDeduct)
  const _specialAdd = getNonNegative(totalSpecialAdd)
  const _paidTax = getNonNegative(totalPaidTax)
  const totalBaseDeduct = toFixed2(BASE_DEDUCTION_MONTH * month)

  const taxableIncome = toFixed2(_income - _insure - totalBaseDeduct - _specialAdd - _otherDeduct)
  if (taxableIncome <= 0) {
    return {
      code: 0,
      taxableIncome: 0,
      currentMonthTax: 0,
      totalShouldTax: 0,
      totalPaidTax: _paidTax,
      tip: '本月无应缴个人所得税',
    }
  }

  const level = getTaxLevel(taxableIncome, SALARY_TAX_TABLE)
  const totalShouldTax = toFixed2(taxableIncome * level.rate - level.quickDeduct)
  const currentMonthTax = toFixed2(totalShouldTax - _paidTax)
  const finalTax = currentMonthTax <= 0 ? 0 : currentMonthTax

  return {
    code: 1,
    taxLevel: `第${SALARY_TAX_TABLE.indexOf(level) + 1}档`,
    rate: level.rate,
    quickDeduct: level.quickDeduct,
    taxableIncome,
    totalBaseDeduct,
    totalShouldTax,
    currentMonthTax: finalTax,
    totalPaidTax: _paidTax,
  }
}

function calcYearEndBonusTax(bonusAmount, yearTotalIncome, yearAllDeduct) {
  const _bonus = getNonNegative(bonusAmount)
  if (_bonus === 0) return { singleTax: 0, mergeTax: 0, bestMode: '无年终奖' }

  const bonusBase = toFixed2(_bonus / 12)
  const bonusLevel = getTaxLevel(bonusBase, BONUS_TAX_TABLE)
  const singleTax = toFixed2(_bonus * bonusLevel.rate - bonusLevel.quickDeduct)

  const mergeTotalIncome = toFixed2(yearTotalIncome + _bonus)
  const mergeTaxable = toFixed2(mergeTotalIncome - yearAllDeduct - BASE_DEDUCTION_YEAR)
  const mergeLevel = getTaxLevel(mergeTaxable, SALARY_TAX_TABLE)
  const mergeTax = mergeTaxable <= 0 ? 0 : toFixed2(mergeTaxable * mergeLevel.rate - mergeLevel.quickDeduct)

  const bestMode = singleTax <= mergeTax ? '单独计税（纳税更少）' : '并入综合所得（纳税更少）'

  return { singleTax, mergeTax, bestMode }
}

/**
 * 五险一金快速计算（按月）
 * @param {Number} base 社保缴费基数（月）
 * @param {Number} housingFundRate 公积金个人比例，如 0.07 表示 7%
 */
function calcMonthlyInsureDetail(base, housingFundRate = INSURE_RATES.housingFundDefault) {
  const b = getNonNegative(base)
  const rate = Math.min(
    INSURE_RATES.housingFundMax,
    Math.max(INSURE_RATES.housingFundMin, housingFundRate || INSURE_RATES.housingFundDefault)
  )
  const pension = toFixed2(b * INSURE_RATES.pension)
  const medical = toFixed2(b * INSURE_RATES.medical)
  const unemployment = toFixed2(b * INSURE_RATES.unemployment)
  const housingFund = toFixed2(b * rate)
  const total = toFixed2(pension + medical + unemployment + housingFund)

  return {
    base: b,
    pension,
    medical,
    unemployment,
    housingFund,
    total,
    housingFundRate: rate,
    pensionRate: INSURE_RATES.pension,
    medicalRate: INSURE_RATES.medical,
    unemploymentRate: INSURE_RATES.unemployment,
  }
}

/** 赡养老人自定义月上限（年上限 36000） */
function getElderCustomMonthlyLimit() {
  return SPECIAL_ADD_DEDUCT.supportElderSingle
}

/** 住房租金自定义月上限 */
function getRentCustomMonthlyLimit() {
  return SPECIAL_ADD_DEDUCT.rentHigh
}

function clampMonthlyAmount(amount, max) {
  const n = getNonNegative(amount)
  if (!max || max <= 0) return 0
  return toFixed2(Math.min(n, max))
}

/**
 * 专项附加扣除快速计算（按月）
 * @param {Object} config 扣除配置
 */
function calcSpecialAddMonthly(config = {}) {
  const {
    babyCareCount = 0,
    childEduCount = 0,
    continuingEduType = 'none',
    hasHouseLoan = false,
    rentLevel = 'none',
    rentCustomAmount = 0,
    supportElderType = 'none',
    supportElderCustomAmount = 0,
  } = config

  let monthly = 0
  monthly += Math.max(0, babyCareCount) * SPECIAL_ADD_DEDUCT.babyCare
  monthly += Math.max(0, childEduCount) * SPECIAL_ADD_DEDUCT.childEdu
  if (continuingEduType === 'degree') monthly += SPECIAL_ADD_DEDUCT.degreeEdu
  if (continuingEduType === 'certificate') monthly += SPECIAL_ADD_DEDUCT.certificateEdu / 12
  if (supportElderType === 'single') monthly += SPECIAL_ADD_DEDUCT.supportElderSingle
  if (supportElderType === 'shared') monthly += SPECIAL_ADD_DEDUCT.supportElderLimit
  if (supportElderType === 'custom') {
    monthly += clampMonthlyAmount(supportElderCustomAmount, getElderCustomMonthlyLimit())
  }
  if (hasHouseLoan) monthly += SPECIAL_ADD_DEDUCT.houseLoan
  if (rentLevel === 'low') monthly += SPECIAL_ADD_DEDUCT.rentLow
  if (rentLevel === 'mid') monthly += SPECIAL_ADD_DEDUCT.rentMid
  if (rentLevel === 'high') monthly += SPECIAL_ADD_DEDUCT.rentHigh
  if (rentLevel === 'custom') {
    monthly += clampMonthlyAmount(rentCustomAmount, getRentCustomMonthlyLimit())
  }

  return toFixed2(monthly)
}

function calcSpecialAddAnnual(config = {}) {
  return toFixed2(calcSpecialAddMonthly(config) * 12)
}

function formatPercent(rate) {
  if (!rate || rate <= 0) return '0%'
  return `${toFixed2(rate * 100)}%`
}

function calcEffectiveRate(tax, income) {
  const _tax = getNonNegative(tax)
  const _income = getNonNegative(income)
  if (_income <= 0) return '0%'
  return `${toFixed2((_tax / _income) * 100)}%`
}

/**
 * 全年个税计算（工资薪金 + 年终奖）
 * @param {Number} yearSalary 全年税前工资收入（不含年终奖）
 * @param {Number} bonusAmount 年终奖收入
 * @param {Number} yearInsure 全年五险一金个人缴纳
 * @param {Number} yearOtherDeduct 全年其他税前扣除
 * @param {Number} yearSpecialAdd 全年专项附加扣除
 */
function calcYearlyTax(yearSalary, bonusAmount, yearInsure, yearOtherDeduct, yearSpecialAdd) {
  const salary = getNonNegative(yearSalary)
  const bonus = getNonNegative(bonusAmount)
  const insure = getNonNegative(yearInsure)
  const otherDeduct = getNonNegative(yearOtherDeduct)
  const specialAdd = getNonNegative(yearSpecialAdd)

  const yearAllDeduct = toFixed2(insure + otherDeduct + specialAdd)
  const totalIncome = toFixed2(salary + bonus)

  const monthlySalary = salary / 12
  const monthlyInsure = insure / 12
  const monthlyOtherDeduct = otherDeduct / 12
  const monthlySpecialAdd = specialAdd / 12

  const salaryResult = calcMonthSalaryTax(
    12,
    salary,
    insure,
    otherDeduct,
    specialAdd,
    calcAutoCumulativePaidTax(12, monthlySalary, monthlyInsure, monthlyOtherDeduct, monthlySpecialAdd)
  )
  const salaryYearTax = salaryResult.totalShouldTax || 0
  const salaryTaxable = salaryResult.taxableIncome || 0
  const salaryTaxLevel = salaryResult.taxLevel || salaryResult.tip || '无需缴税'

  let bonusSingleTax = 0
  let bonusTaxLevel = '无年终奖'
  if (bonus > 0) {
    const bonusBase = toFixed2(bonus / 12)
    const bonusLevel = getTaxLevel(bonusBase, BONUS_TAX_TABLE)
    bonusSingleTax = toFixed2(bonus * bonusLevel.rate - bonusLevel.quickDeduct)
    bonusTaxLevel = `第${BONUS_TAX_TABLE.indexOf(bonusLevel) + 1}档`
  }

  const separateTotalTax = toFixed2(salaryYearTax + bonusSingleTax)

  const mergeTaxable = toFixed2(salary + bonus - yearAllDeduct - BASE_DEDUCTION_YEAR)
  let mergeTotalTax = 0
  let mergeTaxLevel = '无需缴税'
  let mergeLevel = null
  if (mergeTaxable > 0) {
    mergeLevel = getTaxLevel(mergeTaxable, SALARY_TAX_TABLE)
    mergeTotalTax = toFixed2(mergeTaxable * mergeLevel.rate - mergeLevel.quickDeduct)
    mergeTaxLevel = `第${SALARY_TAX_TABLE.indexOf(mergeLevel) + 1}档`
  }

  const useSeparate = separateTotalTax <= mergeTotalTax
  const bestMode =
    bonus > 0
      ? useSeparate
        ? '单独计税（纳税更少）'
        : '并入综合所得（纳税更少）'
      : '工资薪金计税'
  const totalTax = useSeparate ? separateTotalTax : mergeTotalTax
  const afterTaxIncome = toFixed2(totalIncome - insure - totalTax)

  const taxableIncome = useSeparate ? salaryTaxable : Math.max(0, mergeTaxable)
  let marginalRate = 0
  if (useSeparate) {
    if (salary > 0 && salaryTaxable > 0) {
      marginalRate = salaryResult.rate || 0
    } else if (bonus > 0) {
      marginalRate = getTaxLevel(toFixed2(bonus / 12), BONUS_TAX_TABLE).rate
    }
  } else if (mergeLevel) {
    marginalRate = mergeLevel.rate
  }

  return {
    totalIncome,
    yearSalary: salary,
    bonusAmount: bonus,
    baseDeduction: BASE_DEDUCTION_YEAR,
    yearInsure: insure,
    yearSpecialAdd: specialAdd,
    yearOtherDeduct: otherDeduct,
    yearAllDeduct,
    taxableIncome,
    salaryYearTax,
    salaryTaxable,
    bonusSingleTax,
    separateTotalTax,
    mergeTotalTax,
    mergeTaxable: Math.max(0, mergeTaxable),
    bestMode,
    totalTax,
    afterTaxIncome,
    marginalRate,
    marginalRateText: formatPercent(marginalRate),
    effectiveRateText: calcEffectiveRate(totalTax, totalIncome),
    salaryTaxLevel,
    bonusTaxLevel,
    mergeTaxLevel,
    useSeparate,
    annualSpecialAdd: specialAdd,
  }
}

function calcYearSettlementTax(yearAllIncome, yearAllDeduct, yearAllPaidTax) {
  const _income = getNonNegative(yearAllIncome)
  const _deduct = getNonNegative(yearAllDeduct)
  const _paid = getNonNegative(yearAllPaidTax)

  const taxableIncome = toFixed2(_income - _deduct - BASE_DEDUCTION_YEAR)
  if (taxableIncome <= 0) {
    return { finalTax: 0, taxResult: -_paid, resultType: '退税', amount: _paid }
  }

  const level = getTaxLevel(taxableIncome, SALARY_TAX_TABLE)
  const yearShouldTax = toFixed2(taxableIncome * level.rate - level.quickDeduct)
  const diff = toFixed2(yearShouldTax - _paid)

  if (diff > 0) return { finalTax: yearShouldTax, taxResult: diff, resultType: '补税', amount: diff }
  return { finalTax: yearShouldTax, taxResult: diff, resultType: '退税', amount: Math.abs(diff) }
}

module.exports = {
  BASE_DEDUCTION_MONTH,
  BASE_DEDUCTION_YEAR,
  SALARY_TAX_TABLE,
  BONUS_TAX_TABLE,
  SPECIAL_ADD_DEDUCT,
  INSURE_RATES,
  toFixed2,
  getNonNegative,
  getElderCustomMonthlyLimit,
  getRentCustomMonthlyLimit,
  clampMonthlyAmount,
  calcMonthlyInsureDetail,
  calcSpecialAddMonthly,
  calcSpecialAddAnnual,
  calcAutoCumulativePaidTax,
  calcMonthSalaryTax,
  calcYearEndBonusTax,
  calcYearlyTax,
  calcYearSettlementTax,
}
