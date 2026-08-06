const taxFormula = require('../../utils/taxFormula')
const validate = require('../../utils/validate')
const storage = require('../../utils/storage')
const { setTabBarSelected, syncTabBarModal } = require('../../utils/tabBar')
const { scrollToCalcResult } = require('../../utils/page')

Page({
  data: {
    calcMode: 'yearly',
    month: new Date().getMonth() + 1,
    monthOptions: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
    monthlySalary: '',
    yearSalary: '',
    yearBonus: '',
    monthlyInsure: '',
    monthlyOtherDeduct: '',
    monthlyPaidTax: '',
    babyCareCount: 0,
    childEduCount: 0,
    continuingEduType: 'none',
    supportElderType: 'none',
    hasHouseLoan: false,
    rentLevel: 'none',
    monthlySpecialAdd: 0,
    annualSpecialAdd: 0,
    specialAddSummary: '未设置',
    insureSummary: '未设置',
    result: null,
    showResult: false,
    showInsureModal: false,
    showSpecialModal: false,
    insureBase: '',
    housingFundPercent: 7,
    insureDetail: {
      pension: 0,
      medical: 0,
      unemployment: 0,
      housingFund: 0,
      total: 0,
    },
    specialDraft: {
      babyCareCount: 0,
      childEduCount: 0,
      continuingEduType: 'none',
      supportElderType: 'none',
      hasHouseLoan: false,
      rentLevel: 'none',
    },
    specialDraftAnnual: 0,
    continuingEduOptions: [
      { name: '无', value: 'none' },
      { name: '学历继续教育 ¥4,800/年', value: 'degree' },
      { name: '职业资格 ¥3,600/年', value: 'certificate' },
    ],
    rentOptions: [
      { name: '无', value: 'none' },
      { name: '低档 ¥9,600/年', value: 'low' },
      { name: '中档 ¥13,200/年', value: 'mid' },
      { name: '高档 ¥18,000/年', value: 'high' },
    ],
    elderOptions: [
      { name: '无', value: 'none' },
      { name: '独生子女 ¥36,000/年', value: 'single' },
      { name: '非独生子女分摊 ¥18,000/年', value: 'shared' },
    ],
  },

  onLoad() {
    this.refreshInsureSummary()
    this.refreshSpecialSummary()
  },

  onShow() {
    setTabBarSelected(0)
    syncTabBarModal(this)
  },

  refreshInsureSummary() {
    const { monthlyInsure, calcMode } = this.data
    let insureSummary = '未设置'
    if (monthlyInsure) {
      insureSummary =
        calcMode === 'yearly'
          ? `¥${taxFormula.toFixed2(validate.parseAmount(monthlyInsure) * 12)}/年（¥${monthlyInsure}/月）`
          : `¥${monthlyInsure}/月`
    }
    this.setData({ insureSummary })
  },

  onMonthChange(e) {
    this.setData({ month: Number(e.detail.value) + 1 })
  },

  onModeChange(e) {
    const { mode } = e.currentTarget.dataset
    if (mode === this.data.calcMode) return
    this.setData(
      {
        calcMode: mode,
        result: null,
        showResult: false,
      },
      () => this.refreshInsureSummary()
    )
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail })
  },

  refreshSpecialSummary() {
    const {
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    } = this.data
    const monthlySpecialAdd = taxFormula.calcSpecialAddMonthly({
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    })
    const annualSpecialAdd = taxFormula.calcSpecialAddAnnual({
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    })
    const specialAddSummary =
      monthlySpecialAdd > 0 ? `¥${monthlySpecialAdd}/月 · ¥${annualSpecialAdd}/年` : '未设置'
    this.setData({ monthlySpecialAdd, annualSpecialAdd, specialAddSummary })
  },

  openInsureModal() {
    this.setData({ showInsureModal: true }, () => {
      syncTabBarModal(this)
      this.updateInsureDetail()
    })
  },

  closeInsureModal() {
    this.setData({ showInsureModal: false }, () => syncTabBarModal(this))
  },

  onInsureBaseInput(e) {
    this.setData({ insureBase: e.detail })
    this.updateInsureDetail()
  },

  onHousingFundChange(e) {
    this.setData({ housingFundPercent: validate.parseSliderValue(e.detail) })
    this.updateInsureDetail()
  },

  updateInsureDetail() {
    const base = validate.parseAmount(this.data.insureBase)
    const rate = this.data.housingFundPercent / 100
    const insureDetail = taxFormula.calcMonthlyInsureDetail(base, rate)
    this.setData({ insureDetail })
  },

  confirmInsureModal() {
    const { insureDetail } = this.data
    if (!insureDetail.total) {
      wx.showToast({ title: '请先输入社保缴费基数', icon: 'none' })
      return
    }
    this.setData(
      {
        monthlyInsure: String(insureDetail.total),
        showInsureModal: false,
      },
      () => syncTabBarModal(this)
    )
    this.refreshInsureSummary()
    wx.showToast({ title: '已填入五险一金', icon: 'success' })
  },

  openSpecialModal() {
    const {
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    } = this.data
    const specialDraft = {
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    }
    this.setData(
      {
        showSpecialModal: true,
        specialDraft,
        specialDraftAnnual: taxFormula.calcSpecialAddAnnual(specialDraft),
      },
      () => syncTabBarModal(this)
    )
  },

  closeSpecialModal() {
    this.setData({ showSpecialModal: false }, () => syncTabBarModal(this))
  },

  updateSpecialDraft(patch) {
    const specialDraft = { ...this.data.specialDraft, ...patch }
    if (specialDraft.hasHouseLoan && specialDraft.rentLevel !== 'none') {
      wx.showToast({
        title: '住房贷款与住房租金不可同时填报',
        icon: 'none',
        duration: 2500,
      })
      if (patch.hasHouseLoan) specialDraft.rentLevel = 'none'
      if (patch.rentLevel && patch.rentLevel !== 'none') specialDraft.hasHouseLoan = false
    }
    this.setData({
      specialDraft,
      specialDraftAnnual: taxFormula.calcSpecialAddAnnual(specialDraft),
    })
  },

  onSpecialStepper(e) {
    const { field } = e.currentTarget.dataset
    this.updateSpecialDraft({ [field]: e.detail })
  },

  onSpecialSwitch(e) {
    this.updateSpecialDraft({ hasHouseLoan: e.detail })
  },

  onSpecialOptionTap(e) {
    const { field, value } = e.currentTarget.dataset
    this.updateSpecialDraft({ [field]: value })
  },

  confirmSpecialModal() {
    const { specialDraft } = this.data
    const mutex = validate.checkDeductMutex(
      specialDraft.hasHouseLoan,
      specialDraft.rentLevel !== 'none'
    )
    if (!mutex.pass) {
      wx.showToast({ title: mutex.msg, icon: 'none', duration: 3000 })
      return
    }
    this.setData(
      {
        ...specialDraft,
        showSpecialModal: false,
      },
      () => {
        this.refreshSpecialSummary()
        syncTabBarModal(this)
      }
    )
    wx.showToast({ title: '已填入专项附加扣除', icon: 'success' })
  },

  onCalc() {
    if (this.data.calcMode === 'yearly') {
      this.onCalcYearly()
      return
    }
    this.onCalcMonthly()
  },

  onCalcMonthly() {
    const {
      month,
      monthlySalary,
      monthlyInsure,
      monthlyOtherDeduct,
      monthlyPaidTax,
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    } = this.data

    const mutex = validate.checkDeductMutex(hasHouseLoan, rentLevel !== 'none')
    if (!mutex.pass) {
      wx.showToast({ title: mutex.msg, icon: 'none', duration: 3000 })
      return
    }

    const salary = validate.parseAmount(monthlySalary)
    const insure = validate.parseAmount(monthlyInsure)
    const otherDeduct = validate.parseAmount(monthlyOtherDeduct)
    const paidTaxProvided = monthlyPaidTax !== '' && monthlyPaidTax !== undefined && monthlyPaidTax !== null

    const monthlySpecialAdd = taxFormula.calcSpecialAddMonthly({
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    })

    const totalIncome = salary * month
    const totalInsure = insure * month
    const totalOtherDeduct = otherDeduct * month
    const totalSpecialAdd = monthlySpecialAdd * month
    const totalPaidTax = paidTaxProvided
      ? validate.parseAmount(monthlyPaidTax)
      : taxFormula.calcAutoCumulativePaidTax(month, salary, insure, otherDeduct, monthlySpecialAdd)

    const result = taxFormula.calcMonthSalaryTax(
      month,
      totalIncome,
      totalInsure,
      totalOtherDeduct,
      totalSpecialAdd,
      totalPaidTax
    )

    const afterTaxSalary = taxFormula.toFixed2(salary - insure - result.currentMonthTax)

    this.setData(
      {
        result: {
          ...result,
          afterTaxSalary,
          monthlySpecialAdd,
          totalPaidTax,
          autoPaidTax: !paidTaxProvided && month > 1,
        },
        showResult: true,
      },
      scrollToCalcResult
    )

    storage.saveRecord({
      type: 'salary',
      typeName: '月度工资个税',
      params: this.data,
      result: { ...result, afterTaxSalary },
    })
  },

  onCalcYearly() {
    const {
      yearSalary,
      yearBonus,
      monthlyInsure,
      monthlyOtherDeduct,
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    } = this.data

    const mutex = validate.checkDeductMutex(hasHouseLoan, rentLevel !== 'none')
    if (!mutex.pass) {
      wx.showToast({ title: mutex.msg, icon: 'none', duration: 3000 })
      return
    }

    const salary = validate.parseAmount(yearSalary)
    const bonus = validate.parseAmount(yearBonus)

    if (salary <= 0 && bonus <= 0) {
      wx.showToast({ title: '请填写全年工资或年终奖收入', icon: 'none' })
      return
    }

    const monthlyInsureAmount = validate.parseAmount(monthlyInsure)
    const monthlyOther = validate.parseAmount(monthlyOtherDeduct)
    const yearInsure = taxFormula.toFixed2(monthlyInsureAmount * 12)
    const yearOtherDeduct = taxFormula.toFixed2(monthlyOther * 12)

    const annualSpecialAdd = taxFormula.calcSpecialAddAnnual({
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    })

    const result = taxFormula.calcYearlyTax(
      salary,
      bonus,
      yearInsure,
      yearOtherDeduct,
      annualSpecialAdd
    )

    this.setData(
      {
        result: {
          ...result,
          calcMode: 'yearly',
        },
        showResult: true,
      },
      scrollToCalcResult
    )

    storage.saveRecord({
      type: 'yearly',
      typeName: '全年个税',
      params: this.data,
      result,
    })
  },

  onReset() {
    this.setData({
      monthlySalary: '',
      yearSalary: '',
      yearBonus: '',
      monthlyInsure: '',
      monthlyOtherDeduct: '',
      monthlyPaidTax: '',
      babyCareCount: 0,
      childEduCount: 0,
      continuingEduType: 'none',
      supportElderType: 'none',
      hasHouseLoan: false,
      rentLevel: 'none',
      monthlySpecialAdd: 0,
      annualSpecialAdd: 0,
      specialAddSummary: '未设置',
      insureSummary: '未设置',
      insureBase: '',
      result: null,
      showResult: false,
    })
  },

  goPage(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({ url })
  },

  onShareAppMessage() {
    return {
      title: '个税计算器 - 工资薪金个税测算',
      path: '/pages/index/index',
    }
  },

  onShareTimeline() {
    return {
      title: '个税计算器 - 工资薪金个税测算',
    }
  },
})
