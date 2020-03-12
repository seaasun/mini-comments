// miniprogram/pages/comments/comments.js
var store = require('./store')
var utils = require('./utils/index')
var user = require('./features/user')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments: [],
    commentsHasFirstLoad: false,
    commenstHasLoadError: false,
    webErrors: [],
    commentseMoreLoadding: false,
    loaderMoreShowed: false,
    noLoaderMoreShowed: false,
    pagination: {
      pageNum: 1,
      pageSize: 30
    },
  },

  /**
   * 生命周期函数--监听页面加载setUserInfoByButton
   */
  onLoad: function (options) {
    console.log(options)
    wx.myDebug = this.data
    store.subject(this)
    store.action('update', {
     isManager: options.isManager == 1  || false
    })
    if (options.msgBoardId !== this.data.states.msgBoard.id) {
      store.action('updateMsgboard', {
        id: options.msgBoardId
      })
      
    }

    user.login()
      .then(res => {
        this.onLoadFecthMsgBoard()
        this.onLoadFetchComments()
        return user.setUserInfo()
      })
      .then(res => {
        console.log(1999, res)
      })
  },
  onLoadFecthMsgBoard: function () {
    wx.myRequests.msgBoardOne({
      id :this.data.states.msgBoard.id,
    }, data => {
      store.action('update', {
        msgBoard: data
      })
    }, resp => {

    })
  },
  onLoadFetchComments: function () {
    this.setData({
      commentsHasFirstLoad: false,
      commentsHasLoadError: false
    })
    this.fetchComments(
      () => {
        this.setData({
          commentsHasFirstLoad: true
        })
      },
      () => {
        this.setData({
          commentsHasLoadError: true,
          webErrors: [this.onLoadFetchComments]
        })
      }
    )
  },
  doWrongMsgBoardId () {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    store.action('update', {
      //  isManager: options.isManager == 1  || false
      isManager: true
     })
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
    setTimeout(function(){
      wx.stopPullDownRefresh()
    }, 1000)
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (event) {
    if (this.data.loaderMoreShowed || this.data.noLoaderMoreShowed) return
    this.setData({
      loaderMoreShowed: true,
      commentsHasLoadError: false
    })
    this.fetchComments(data => {
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
        commentsHasLoadError: true,
          webErrors: [this.onReachBottom]
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  writeComment: function () {
    store.action('update', {
      isInputComment: true
    })
  },
  fetchComments: function (success, fail) {
    wx.myRequests.messageList({
      msgBoardId  :this.data.states.msgBoard.id,
      ...this.data.pagination
      },data => {
        if (data.length > 0) {
          data = data.map(item => {
            item.creatFriendlyTime = utils.getFriendlyTime(new Date(item.createdTime))
            item.lastFriendlyTime = utils.getFriendlyTime(new Date(item.updatedTime))
            return item
          })
          
          this.setData({
            comments: this.data.comments.concat(data),
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
  clearErrMsg: function () {
    store.action('update', {
      errMsg: ''
    })
  },
  onMyEvent: function (id) {
    console.log(3333)
  },
  getUserInfo: function (event) {
    console.log(555, event)
    user.setUserInfoInComment(event)
   }
})