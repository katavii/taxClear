Component({
  options: {
    styleIsolation: 'apply-shared',
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    subtitle: {
      type: String,
      value: '',
    },
    showBack: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    navPaddingRight: 96,
  },

  lifetimes: {
    attached() {
      const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      const menu = wx.getMenuButtonBoundingClientRect()
      const statusBarHeight = sys.statusBarHeight || 20
      const navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height
      const navPaddingRight = sys.windowWidth - menu.left + 8

      this.setData({
        statusBarHeight,
        navBarHeight,
        navPaddingRight,
      })
    },
  },

  methods: {
    onBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
        return
      }
      wx.switchTab({ url: '/pages/index/index' })
    },
  },
})
