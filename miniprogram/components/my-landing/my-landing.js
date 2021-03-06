// components/my-landing/my-landing.js
var user = require('../../features/user')
var store = require('../../store')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo (event) {
      user.setUserInfoByButton(event)
        .then(() => {
          store.action('update', {
            isAuth: true
          })
          this.triggerEvent('onHasAuth')
        })
        .catch(resp => {
          if (typeof res !== 'object') res = {}
          if (resp.action !== 'applyUserAuth') {
            wx.showToast({
              title: '网路错误，请重新尝试',
              icon: 'none'
            })
          }
        })
      }
  }
})
