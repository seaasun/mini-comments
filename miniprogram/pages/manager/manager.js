// miniprogram/pages/manager/manager.js
var user = require('../../features/user')
var utils = require('../../utils/index')
var store = require('../../store')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginStatus: 'authing', // authing: 正在登陆/授权； unAuth: 未授权； hasAuth: 已授权
    topics: [],
    topicHasFirstLoad: false,
    topicHasLoadError: false,
    webErrors: [],
    topiceMoreLoadding: false,
    loaderMoreShowed: false,
    noLoaderMoreShowed: false,
    paginations: [{index:1},{index:2}],
    pagination: {
      pageNum: 1,
      pageSize: 30
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    store.subject(this)
    wx.myDebug = this.data

    user.login()
    .then(() => {
        return user.setUserInfo()
      }
    ).then(() => {
      this.setData({
        loginStatus: 'hasAuth'
      })
      this.onLoadFectTopices()
    }).catch(resp => {
      console.log(333)
      if (resp === '[fail]未得到用户授权') {
        this.setData({
          loginStatus: 'unAuth'
        })
      } else {
        console.log(resp)
      }
    })
    
  },
  onLoadFectTopices: function () {
    this.setData({
      topicHasFirstLoad: false,
      topicHasLoadError: false
    })
    this.fetchTopices(
      () => {
        this.setData({
          topicHasFirstLoad: true
        })
      },
      () => {
        this.setData({
          topicHasLoadError: true,
          webErrors: [this.onLoadFectTopices]
        })
      }
    )
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (event) {
    if (this.data.loaderMoreShowed || this.data.noLoaderMoreShowed) return
    this.setData({
      loaderMoreShowed: true,
      topicHasLoadError: false
    })
    this.fetchTopices(data => {
      this.setData({
        loaderMoreShowed: false
      })
      if (data.length === 0) {
        this.setData({
          noLoaderMoreShowed: true
        })
      }
    }, () => {
      this.setData({
        loaderMoreShowed: false,
        topicHasLoadError: true,
          webErrors: [this.onReachBottom]
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  fetchTopices: function (success, fail) {
    wx.myRequests.msgBoardAdminList({
      ...this.data.pagination
     },data => {
        if (data.length > 0) {
          data = data.map(item => {
            item.creatFriendlyTime = utils.getFriendlyTime(new Date(item.createdTime))
            item.lastFriendlyTime = utils.getFriendlyTime(new Date(item.updatedTime))
            return item
          })
          
          this.setData({
            topics: this.data.topics.concat(data),
            pagination: {
              pageNum: this.data.pagination.pageNum + 1,
              pageSize: 30
            }
          })
        }
       
       if (success) success(data)
     }, res => {
       if (fail) fail(res)
    })
  },
  refreshWeb: function () {
    this.data.webErrors.map(item => { item() })
  },
  onHasAuth() {
    this.setData({
      loginStatus: 'hasAuth'
    })
    this.onLoadFectTopices()
  },
  goComment (e) {
    console.log(e)
    wx.navigateTo({url:`/pages/comments/comments?msgBoardId=${e.currentTarget.dataset.commentId}`})
  }
})