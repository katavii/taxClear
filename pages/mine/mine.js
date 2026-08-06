Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
  },

  onLoad() {
    const userInfo = getApp().globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo, hasUserInfo: true })
    }
  },

  onGetUserProfile() {
    wx.getUserProfile({
      desc: '用于完善个人中心展示',
      success: (res) => {
        getApp().globalData.userInfo = res.userInfo
        this.setData({ userInfo: res.userInfo, hasUserInfo: true })
      },
    })
  },

  onFeedback() {
    wx.showToast({ title: '反馈功能开发中', icon: 'none' })
  },

  onPrivacy() {
    wx.showToast({ title: '隐私政策开发中', icon: 'none' })
  },

  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: '小薪个税速算 v1.0.0\n个人所得税测算工具，薪资明细一目了然\n测算结果仅供参考',
      showCancel: false,
    })
  },
})
