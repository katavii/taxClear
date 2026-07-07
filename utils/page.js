function scrollToCalcResult() {
  setTimeout(() => {
    wx.pageScrollTo({
      selector: '#calc-result',
      duration: 300,
      fail: () => {
        wx.pageScrollTo({ scrollTop: 99999, duration: 300 })
      },
    })
  }, 80)
}

module.exports = { scrollToCalcResult }
