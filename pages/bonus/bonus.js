const taxFormula = require('../../utils/taxFormula')
const validate = require('../../utils/validate')
const storage = require('../../utils/storage')

Page({
  data: {
    bonusAmount: '',
    yearTotalIncome: '',
    yearAllDeduct: '',
    result: null,
    showResult: false,
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail })
  },

  onCalc() {
    const bonusAmount = validate.parseAmount(this.data.bonusAmount)
    const yearTotalIncome = validate.parseAmount(this.data.yearTotalIncome)
    const yearAllDeduct = validate.parseAmount(this.data.yearAllDeduct)

    const result = taxFormula.calcYearEndBonusTax(bonusAmount, yearTotalIncome, yearAllDeduct)
    this.setData({ result, showResult: true })

    storage.saveRecord({
      type: 'bonus',
      typeName: '年终奖个税',
      params: this.data,
      result,
    })
  },

  onReset() {
    this.setData({
      bonusAmount: '',
      yearTotalIncome: '',
      yearAllDeduct: '',
      result: null,
      showResult: false,
    })
  },

  onShareAppMessage() {
    return {
      title: '个税计算器 - 年终奖个税测算',
      path: '/pages/bonus/bonus',
    }
  },

  onShareTimeline() {
    return {
      title: '个税计算器 - 年终奖个税测算',
    }
  },
})
