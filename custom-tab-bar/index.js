Component({
  data: {
    show: true,
    selected: 0,
    color: '#94a3b8',
    selectedColor: '#2563eb',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '计算',
        icon: 'balance-list-o',
      },
      {
        pagePath: '/pages/history/history',
        text: '历史',
        icon: 'clock-o',
      },
      {
        pagePath: '/pages/help/help',
        text: '帮助',
        icon: 'question-o',
      },
    ],
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      if (this.data.selected === index) return
      wx.switchTab({ url: path })
      this.setData({ selected: index })
    },
  },
})
