/**
 * 本地缓存封装
 * 历史计算记录存储与读取
 */

const STORAGE_KEY = 'tax_calc_history'
const MAX_RECORDS = 100

function getHistory() {
  try {
    const data = wx.getStorageSync(STORAGE_KEY)
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('读取历史记录失败', e)
    return []
  }
}

function saveRecord(record) {
  try {
    const history = getHistory()
    const item = {
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
      ...record,
    }
    history.unshift(item)
    if (history.length > MAX_RECORDS) {
      history.length = MAX_RECORDS
    }
    wx.setStorageSync(STORAGE_KEY, history)
    return item
  } catch (e) {
    console.error('保存历史记录失败', e)
    return null
  }
}

function deleteRecord(id) {
  try {
    const history = getHistory().filter((item) => item.id !== id)
    wx.setStorageSync(STORAGE_KEY, history)
    return true
  } catch (e) {
    console.error('删除历史记录失败', e)
    return false
  }
}

function clearHistory() {
  try {
    wx.removeStorageSync(STORAGE_KEY)
    return true
  } catch (e) {
    console.error('清空历史记录失败', e)
    return false
  }
}

function getRecordById(id) {
  return getHistory().find((item) => item.id === id) || null
}

function formatRecordTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getResultSummary(record) {
  const result = (record.params && record.params.result) || record.result
  if (!result) return ''
  switch (record.type) {
    case 'salary':
      return `税后 ¥${result.afterTaxSalary}`
    case 'yearly':
      return `税后 ¥${result.afterTaxIncome}`
    case 'bonus':
      return `推荐 ${result.bestMode}`
    case 'annual':
      return `${result.resultType} ¥${result.amount}`
    case 'labor':
      return `税后 ¥${result.afterTax}`
    default:
      return ''
  }
}

function getTypeMeta(type) {
  const map = {
    salary: { icon: 'gold-coin-o', color: '#2563EB', bg: '#EFF6FF' },
    yearly: { icon: 'chart-trending-o', color: '#2563EB', bg: '#EFF6FF' },
    bonus: { icon: 'gift-o', color: '#EA580C', bg: '#FFF7ED' },
    annual: { icon: 'calendar-o', color: '#059669', bg: '#ECFDF5' },
    labor: { icon: 'user-o', color: '#7C3AED', bg: '#F5F3FF' },
  }
  return map[type] || { icon: 'orders-o', color: '#2563EB', bg: '#EFF6FF' }
}

function getResultDisplay(record) {
  const result = (record.params && record.params.result) || record.result
  if (!result) return { label: '', value: '', tone: 'default' }
  switch (record.type) {
    case 'salary':
      return { label: '税后到手', value: `¥${result.afterTaxSalary}`, tone: 'primary' }
    case 'yearly':
      return { label: '税后到手', value: `¥${result.afterTaxIncome}`, tone: 'primary' }
    case 'bonus':
      return { label: '推荐方案', value: result.bestMode, tone: 'accent' }
    case 'annual':
      return {
        label: result.resultType,
        value: `¥${result.amount}`,
        tone: result.resultType === '补税' ? 'warn' : 'success',
      }
    case 'labor':
      return { label: '税后收入', value: `¥${result.afterTax}`, tone: 'primary' }
    default:
      return { label: '', value: '', tone: 'default' }
  }
}

function enrichHistoryItem(item) {
  const typeMeta = getTypeMeta(item.type)
  const display = getResultDisplay(item)
  return {
    ...item,
    displayTime: formatRecordTime(item.createTime),
    summary: getResultSummary(item),
    typeIcon: typeMeta.icon,
    typeColor: typeMeta.color,
    typeBg: typeMeta.bg,
    resultLabel: display.label,
    resultValue: display.value,
    resultTone: display.tone,
  }
}

module.exports = {
  STORAGE_KEY,
  getHistory,
  getRecordById,
  saveRecord,
  deleteRecord,
  clearHistory,
  formatRecordTime,
  getResultSummary,
  getTypeMeta,
  getResultDisplay,
  enrichHistoryItem,
}
