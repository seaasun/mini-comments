// miniprogram/pages/manager/manager.js
var user = require('../../features/user')
var utils = require('../../utils/index')
var store = require('../../store')

let paginationInit = {
  pageNum: 1,
  pageSize: 20,
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginStatus: 'authing', // authing: 正在登陆/授权； unAuth: 未授权； hasAuth: 已授权
    topics: [],
    totalTopic: false,
    pagination: paginationInit,

    topicHasFirstLoad: false,
    topicHasLoadError: false,

    
    errMessage: false,
    webErrors: [], // 缓存错误队列

    loaderMoreShowed: false,
    noLoaderMoreShowed: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.myDebug = this.data
    this.initPageData()

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
    this.setData({
      pagination:  paginationInit
    })
    return this.fetchTopices(true)
      .then(()=> {
        wx.stopPullDownRefresh()
        this.setData({
          topicHasFirstLoad: true,
          errMessage: false
        })
      }).catch(()=> {
        wx.stopPullDownRefresh()
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (event) {
    if (this.data.loaderMoreShowed || this.data.noLoaderMoreShowed) return
    this.setData({
      loaderMoreShowed: true,
      errMessage: false
    })
    this.fetchTopices()
      .then(data => {
        this.setData({
          loaderMoreShowed: false
        })
        if (data.length === 0) {
          this.setData({
            noLoaderMoreShowed: true
          })
        }
      })
      .catch(res => {
        if (typeof res !== 'object') res = {}
        this.setData({
          loaderMoreShowed: false,
          errMessage: res.message || '网路错误',
            webErrors: [this.onReachBottom]
        })
      })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `为你的公众号添加评论吧！`,
      path: `/comments?id=${this.data.msgBoard.id}`
    }
  },
  initPageData () {
    user.login()
    .then(() => {
      this.onLoadFectTopices()
      this.setData({
        loginStatus: 'hasAuth'
      })
      user.setUserInfo()
    }).catch(res => {
      if (typeof res !== 'object') res = {}
      if (res.action === 'userAuth' && res.data === false) {
        this.setData({
          loginStatus: 'unAuth'
        })
      } 

      this.setData({
        errMessage: res.message || '网络错误',
        webErrors: [this.initPageData]
      })

    })
  },
  onLoadFectTopices: function () {
    this.setData({
      topicHasFirstLoad: false,
      errMessage: false
    })

    this.fetchTopices()
      .then(()=> {
        this.setData({
          topicHasFirstLoad: true
        })
      })
      .catch(res => {
        if (typeof res !== 'object') res = {}
        this.setData({
          errMessage: res.message || '网络错误',
          webErrors: [this.onLoadFectTopices]
        })
      })
  },
  fetchTopices (isFirst = false) {
    return wx.myRequests.msgBoardAdminList({
      ...this.data.pagination
     }).then(data => {
        if (data.data.length > 0) {
          let topics = data.data.map(item => {
            item.creatFriendlyTime = utils.getFriendlyTime(new Date(item.createdTime))
            item.lastFriendlyTime = utils.getFriendlyTime(new Date(item.updatedTime))
            return item
          })
          
          this.setData({
            topics: isFirst ? topics : this.data.topics.concat(topics),
            totalTopic: data.total,
            pagination: {
              pageNum: this.data.pagination.pageNum + 1,
              pageSize: 30,
              createdTime: topics[topics.length - 1].createdTime
            }
          })
        }
       
       return Promise.resolve(data)
     })
  },
  refreshWeb: function () {
    let webErrors = this.data.webErrors
    this.setData({
      errMessage: false,
      webErrors: []
    })
    webErrors.map(item => { item() })
  },
  onHasAuth() {
    this.setData({
      loginStatus: 'hasAuth'
    })
    this.onLoadFectTopices()
  },
  goComment (e) {
    console.log(e)
    wx.navigateTo({url:`/comments?id=${e.currentTarget.dataset.commentId}&isManager=1`})
  }
})