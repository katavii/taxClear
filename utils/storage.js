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

module.exports = {
  STORAGE_KEY,
  getHistory,
  saveRecord,
  deleteRecord,
  clearHistory,
}
