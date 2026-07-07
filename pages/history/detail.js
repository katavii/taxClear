const storage = require('../../utils/storage')

Page({
  data: {
    record: null,
    result: null,
    displayTime: '',
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const record = storage.getRecordById(id)
    if (!record) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const result = (record.params && record.params.result) || record.result

    wx.setNavigationBarTitle({ title: record.typeName || '计算结果' })

    this.setData({
      record,
      result,
      displayTime: storage.formatRecordTime(record.createTime),
    })
  },
})
