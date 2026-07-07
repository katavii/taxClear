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
    const historyList = storage.getHistory().map(storage.enrichHistoryItem)
    this.setData({ historyList })
  },

  onViewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/history/detail?id=${id}` })
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
})
