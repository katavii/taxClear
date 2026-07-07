const { SALARY_TAX_TABLE, BONUS_TAX_TABLE, SPECIAL_ADD_DEDUCT } = require('../../utils/taxFormula')
const { setTabBarSelected } = require('../../utils/tabBar')

function formatTaxTable(table) {
  return table.map((item) => ({
    min: item.min,
    rate: item.rate,
    maxDisplay: item.max === Infinity ? '∞' : item.max,
  }))
}

Page({
  data: {
    salaryTable: formatTaxTable(SALARY_TAX_TABLE),
    bonusTable: formatTaxTable(BONUS_TAX_TABLE),
    deductList: [
      { name: '3岁以下婴幼儿照护', standard: `${SPECIAL_ADD_DEDUCT.babyCare}元/月/每孩` },
      { name: '子女教育', standard: `${SPECIAL_ADD_DEDUCT.childEdu}元/月/每孩` },
      { name: '继续教育（学历）', standard: `${SPECIAL_ADD_DEDUCT.degreeEdu}元/月` },
      { name: '继续教育（职业证书）', standard: `${SPECIAL_ADD_DEDUCT.certificateEdu}元/年` },
      { name: '赡养老人（独生子女）', standard: `${SPECIAL_ADD_DEDUCT.supportElderSingle}元/月` },
      { name: '赡养老人（非独生子女）', standard: `合计${SPECIAL_ADD_DEDUCT.supportElderSingle}元/月，单人上限${SPECIAL_ADD_DEDUCT.supportElderLimit}元/月` },
      { name: '住房贷款利息', standard: `${SPECIAL_ADD_DEDUCT.houseLoan}元/月` },
      { name: '住房租金', standard: `${SPECIAL_ADD_DEDUCT.rentLow}/${SPECIAL_ADD_DEDUCT.rentMid}/${SPECIAL_ADD_DEDUCT.rentHigh}元/月（分城市等级）` },
      { name: '大病医疗', standard: `年度上限${SPECIAL_ADD_DEDUCT.seriousIllness}元（仅汇算使用）` },
    ],
    activeTab: 0,
  },

  onShow() {
    setTabBarSelected(2)
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.index })
  },
})
