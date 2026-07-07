const taxFormula = require('../../utils/taxFormula')
const validate = require('../../utils/validate')
const storage = require('../../utils/storage')

const { INSURE_RATES } = taxFormula

Page({
  data: {
    yearAllIncome: '',
    yearAllDeduct: '',
    yearAllPaidTax: '',
    seriousIllnessDeduct: '',
    babyCareCount: 0,
    childEduCount: 0,
    continuingEduType: 'none',
    supportElderType: 'none',
    hasHouseLoan: false,
    rentLevel: 'none',
    deductSummary: '未设置',
    result: null,
    showResult: false,
    showInsureModal: false,
    showSpecialModal: false,
    insureBase: '',
    housingFundPercent: 7,
    insureDetail: { total: 0 },
    annualInsureTotal: 0,
    specialDraft: {},
    specialDraftAnnual: 0,
    seriousIllnessDraft: '',
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
    this.refreshDeductSummary()
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail })
  },

  getSpecialAnnual(config, seriousIllness = 0) {
    const specialAnnual = taxFormula.calcSpecialAddAnnual(config)
    const illness = Math.min(
      validate.parseAmount(seriousIllness),
      taxFormula.SPECIAL_ADD_DEDUCT.seriousIllness
    )
    return taxFormula.toFixed2(specialAnnual + illness)
  },

  refreshDeductSummary() {
    const config = this.getSpecialConfig()
    const annualInsure = taxFormula.toFixed2(this.data.annualInsureTotal)
    const specialAnnual = this.getSpecialAnnual(config, this.data.seriousIllnessDeduct)
    const total = taxFormula.toFixed2(annualInsure + specialAnnual)
    const deductSummary = total > 0 ? `¥${total}/年（含五险一金+专项附加）` : '未设置'
    this.setData({ deductSummary })
  },

  getSpecialConfig() {
    const {
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    } = this.data
    return {
      babyCareCount,
      childEduCount,
      continuingEduType,
      supportElderType,
      hasHouseLoan,
      rentLevel,
    }
  },

  openInsureModal() {
    this.setData({
      showInsureModal: true,
      housingFundPercent: Math.round(INSURE_RATES.housingFundDefault * 100),
    })
    this.updateInsureDetail()
  },

  closeInsureModal() {
    this.setData({ showInsureModal: false })
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
    const monthly = taxFormula.calcMonthlyInsureDetail(base, rate)
    const insureDetail = {
      ...monthly,
      annualTotal: taxFormula.toFixed2(monthly.total * 12),
    }
    this.setData({ insureDetail })
  },

  confirmInsureModal() {
    if (!this.data.insureDetail.annualTotal) {
      wx.showToast({ title: '请先输入社保缴费基数', icon: 'none' })
      return
    }
    this.setData({
      annualInsureTotal: this.data.insureDetail.annualTotal,
      showInsureModal: false,
    })
    this.syncYearAllDeduct()
    wx.showToast({ title: '已计入全年扣除', icon: 'success' })
  },

  openSpecialModal() {
    const specialDraft = this.getSpecialConfig()
    this.setData({
      showSpecialModal: true,
      specialDraft,
      seriousIllnessDraft: this.data.seriousIllnessDeduct,
      specialDraftAnnual: this.getSpecialAnnual(specialDraft, this.data.seriousIllnessDeduct),
    })
  },

  closeSpecialModal() {
    this.setData({ showSpecialModal: false })
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
      specialDraftAnnual: this.getSpecialAnnual(specialDraft, this.data.seriousIllnessDraft),
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

  onSeriousIllnessDraftInput(e) {
    this.setData({
      seriousIllnessDraft: e.detail,
      specialDraftAnnual: this.getSpecialAnnual(this.data.specialDraft, e.detail),
    })
  },

  confirmSpecialModal() {
    const { specialDraft, seriousIllnessDraft } = this.data
    const mutex = validate.checkDeductMutex(
      specialDraft.hasHouseLoan,
      specialDraft.rentLevel !== 'none'
    )
    if (!mutex.pass) {
      wx.showToast({ title: mutex.msg, icon: 'none', duration: 3000 })
      return
    }
    this.setData({
      ...specialDraft,
      seriousIllnessDeduct: seriousIllnessDraft,
      showSpecialModal: false,
    })
    this.syncYearAllDeduct()
    wx.showToast({ title: '已计入全年扣除', icon: 'success' })
  },

  syncYearAllDeduct() {
    const config = this.getSpecialConfig()
    const specialAnnual = this.getSpecialAnnual(config, this.data.seriousIllnessDeduct)
    const total = taxFormula.toFixed2(this.data.annualInsureTotal + specialAnnual)
    this.setData({
      yearAllDeduct: total > 0 ? String(total) : '',
    })
    this.refreshDeductSummary()
  },

  onCalc() {
    const yearAllIncome = validate.parseAmount(this.data.yearAllIncome)
    const yearAllDeduct = validate.parseAmount(this.data.yearAllDeduct)
    const yearAllPaidTax = validate.parseAmount(this.data.yearAllPaidTax)

    const result = taxFormula.calcYearSettlementTax(yearAllIncome, yearAllDeduct, yearAllPaidTax)
    this.setData({ result, showResult: true })

    storage.saveRecord({
      type: 'annual',
      typeName: '年度汇算清缴',
      params: this.data,
      result,
    })
  },

  onReset() {
    this.setData({
      yearAllIncome: '',
      yearAllDeduct: '',
      yearAllPaidTax: '',
      seriousIllnessDeduct: '',
      babyCareCount: 0,
      childEduCount: 0,
      continuingEduType: 'none',
      supportElderType: 'none',
      hasHouseLoan: false,
      rentLevel: 'none',
      annualInsureTotal: 0,
      deductSummary: '未设置',
      insureBase: '',
      result: null,
      showResult: false,
    })
  },
})
