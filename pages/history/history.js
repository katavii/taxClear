const storage = require('../../utils/storage')
const { setTabBarSelected } = require('../../utils/tabBar')

Page({
  data: {
    historyList: [],
  },

  onShow() {
    setTabBarSelected(1)
    this.loadHistory()
  },

  loadHistory() {
    const historyList = storage.getHistory()
    this.setData({ historyList })
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteRecord(id)
          this.loadHistory()
        }
      },
    })
  },

  onClearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定清空全部历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.clearHistory()
          this.loadHistory()
        }
      },
    })
  },

  formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  },
})
