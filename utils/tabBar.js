function getTabBar() {
  if (typeof getCurrentPages !== 'function') return null
  const page = getCurrentPages().pop()
  if (page && typeof page.getTabBar === 'function') {
    return page.getTabBar()
  }
  return null
}

function setTabBarSelected(index) {
  const tabBar = getTabBar()
  if (tabBar) {
    tabBar.setData({ selected: index })
  }
}

function syncTabBarModal(page) {
  const tabBar = getTabBar()
  if (!tabBar || !page) return
  const modalOpen = !!(page.data.showInsureModal || page.data.showSpecialModal)
  tabBar.setData({ show: !modalOpen })
}

module.exports = { setTabBarSelected, syncTabBarModal }
