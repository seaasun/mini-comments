let accountInfo = {}
let store = require('../store')
let request = require('../requests/request')
let utils = require('../utils/index')

function setUserInfoByButton (event) {
  if (!event.detail || !event.detail.userInfo) {
    wx.showModal({
      title: '需要授权',
      content: '授权小程序后，才可使用~',
      showCancel: false
    })
    return Promise.reject('[fail],未授权')
  }

  let sessionKey = request.getSessionId()

  return wx.myRequests.userInfo({
    sessionKey,
    ...event.detail
  })
}

function setUserInfoInComment (event) {
  if (!event.detail || !event.detail.userInfo) {
    wx.showModal({
      title: '需要授权',
      content: '授权小程序后，才可留言哦~',
      showCancel: false
    })
    return
  }

  store.action('update', {
    isAuth: true,
    isInputComment: true,
  })
  
  let sessionKey = request.getSessionId()
  request.setSeesion(sessionKey)

  // TODO@Maxiao sessionKey 错误处理
  return wx.myRequests.userInfo({
    sessionKey,
    ...event.detail
  })
}

// 本地存用户信息 + 后端设置用户信息
// return promise
function setUserInfo () {
  let states = store.getStates()
  
  if (states.user && states.user.nickName) {
    return Promise.resolve('ok')

  }

  return utils.wxGetSetting()
    // 1. 检查用户授权
    .then(res => {
      if (res.authSetting['scope.userInfo']) {
        store.action('update', {
          isAuth: true
        })
        return Promise.resolve()
      } else {
        console.log('[fail]未得到用户授权')
        return Promise.reject('[fail]未得到用户授权')
      }
    })
    // 2. 获取wx用户信息
    .then(res => {
      return utils.wxGetUserInfo()
    })
    .then (res => {
      accountInfo = res

      // 3. 本地存用户信息
      store.action('updateUser', {
        ...res.userInfo
      })

      // 4. 发送后端Yoon和信息
      return wx.myRequests.userInfo({
        sessionKey: request.getSessionId(res.sessionId),
        ...res
      })
    })
    .catch(res => {
      console.log('[fail]未能设置用户信息')
      return Promise.reject(res)
    })
}

// 读取缓存中的sessionId + 微信登陆 + 后端登陆 + 存seesion
// return promise
function login () {
  try {
    let value = wx.getStorageSync('sessionId')
    request.setSeesion(value)
    if (value && false) {
      return Promise.resolve({
        sessionId: value,
        useStorage: true
      })
    }
  } catch (e) {
    console.log('[fail]读取本地seesionId失败')
  }
  
  return utils.wxLogin()
    .then(res => {
      return wx.myRequests.userLogin({
        code: res.code
      })
    })
    .then (res => {
      store.action('update', {
        isLogin: true
      })
      wx.setStorage({
        key: 'sessionId',
        data: res.sessionId
      })
      request.setSeesion(res.sessionId)

      return Promise.resolve(res)
    })
    .catch(res => {
      console.log('[fail]用户登陆失败')
      return Promise.reject(res)
    })
}

function getIsLogin() {
  return store.states.isLogin
}

function getIsAuth() {
  return store.states.isAuth
}

module.exports = {
  setUserInfo,
  login,
  accountInfo,
  getIsLogin,
  getIsAuth,
  setUserInfoByButton,
  setUserInfoInComment
}