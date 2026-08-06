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
    faqList: [
      {
        q: '什么是个税计算器？如何测算个人所得税？',
        a: '个税计算器是辅助测算工具，可按现行个人所得税政策估算工资薪金、年终奖、劳务报酬及年度汇算税额。输入收入与扣除项后即可得到测算结果，仅供参考。',
      },
      {
        q: '工资个税怎么算？',
        a: '工资薪金一般采用累计预扣预缴法：用累计收入减累计减除费用、专项扣除、专项附加扣除等，再按综合所得税率表计算累计应纳税额，减去已预缴税额后得到本期应预扣税额。',
      },
      {
        q: '年终奖个税单独计税与合并计税有何区别？',
        a: '单独计税按全年一次性奖金政策分档测算；合并计税则将年终奖并入综合所得。个税计算器提供双方案对比，便于比较税负差异。',
      },
      {
        q: '年度汇算清缴是什么？什么时候办理？',
        a: '年度汇算是对上一年度综合所得多退少补的清算，通常在次年 3 月至 6 月办理。可用个税计算器先做退补税测算，再以官方系统申报为准。',
      },
      {
        q: '专项附加扣除包括哪些？',
        a: '常见包括婴幼儿照护、子女教育、继续教育、赡养老人、住房贷款利息、住房租金、大病医疗等。住房贷款利息与住房租金不可同时填报。',
      },
      {
        q: '测算结果是否等于实际纳税？',
        a: '不等于。本个税计算器结果仅供参考，最终应纳税额与退补税金额以国家税务总局官方系统为准。',
      },
    ],
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

  onShareAppMessage() {
    return {
      title: '个税计算器 - 税率表与个人所得税说明',
      path: '/pages/help/help',
    }
  },

  onShareTimeline() {
    return {
      title: '个税计算器 - 税率表与个人所得税说明',
    }
  },
})
