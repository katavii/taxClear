const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, record } = event

  switch (action) {
    case 'sync': {
      if (!record) return { code: -1, msg: '缺少记录数据' }
      const res = await db.collection('tax_records').add({
        data: {
          _openid: OPENID,
          ...record,
          syncTime: db.serverDate(),
        },
      })
      return { code: 0, id: res._id }
    }
    case 'list': {
      const res = await db
        .collection('tax_records')
        .where({ _openid: OPENID })
        .orderBy('syncTime', 'desc')
        .limit(100)
        .get()
      return { code: 0, data: res.data }
    }
    default:
      return { code: -1, msg: '未知操作' }
  }
}
