const validate = require('../../utils/validate')
const storage = require('../../utils/storage')

Page({
  data: {
    laborIncome: '',
    result: null,
    showResult: false,
  },

  onInput(e) {
    this.setData({ laborIncome: e.detail })
  },

  onCalc() {
    const income = validate.parseAmount(this.data.laborIncome)
    let taxableIncome = 0

    if (income <= 800) {
      taxableIncome = 0
    } else if (income <= 4000) {
      taxableIncome = income - 800
    } else {
      taxableIncome = income * 0.8
    }

    let tax = 0
    if (taxableIncome <= 20000) {
      tax = taxableIncome * 0.2
    } else if (taxableIncome <= 50000) {
      tax = taxableIncome * 0.3 - 2000
    } else {
      tax = taxableIncome * 0.4 - 7000
    }

    tax = Math.max(0, parseFloat(tax.toFixed(2)))
    const afterTax = parseFloat((income - tax).toFixed(2))

    const result = { taxableIncome: parseFloat(taxableIncome.toFixed(2)), tax, afterTax }
    this.setData({ result, showResult: true })

    storage.saveRecord({
      type: 'labor',
      typeName: '劳务报酬个税',
      params: this.data,
      result,
    })
  },

  onReset() {
    this.setData({ laborIncome: '', result: null, showResult: false })
  },
})
