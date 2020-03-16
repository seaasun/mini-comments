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
    webErrors: [], // 缓存错误队列
    commentseMoreLoadding: false,
    loaderMoreShowed: false,
    noLoaderMoreShowed: false,
    isErrorMsgboardId: false, // 错误的留言板列表提示
    pagination: {
      pageNum: 1,
      pageSize: 30,
      // createdTime: null
    },
  },

  /**
   * 生命周期函数--监听页面加载setUserInfoByButton
   */
  onLoad: function (options) {
    wx.myDebug = this.data
    store.subject(this)
    store.action('update', {
     isManager: options.isManager == 1  || false
    })

    if (options.id !== this.data.states.msgBoard.id) {
      let id = options.id
      if (!isNaN(id)) {
        store.action('updateMsgboard', {
          id: options.id
        })
      }
    }

    if (!this.data.states.msgBoard.id) {
      this.setData({
        isErrorMsgboardId: true,
        commentsHasFirstLoad: true
      })
      return
    }

    user.login()
      .then(res => {
        this.onLoadFetchComments()
        this.onLoadFecthMsgBoard()  
        return user.setUserInfo()
      })
      .then(res => {
       // TODO@Maxiao 错误处理，不做
      })
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
      pagination:  {
        pageNum: 1,
        pageSize: 30,
      },
    })
    return this.fetchComments(true)
      .then(()=> {
        wx.stopPullDownRefresh()
        this.setData({
          commentsHasFirstLoad: true
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
      commentsHasLoadError: false
    })
    this.fetchComments()
      .then(data => {
        this.setData({
          loaderMoreShowed: false
        })
        if (data.length === 0) {
          this.setData({
            noLoaderMoreShowed: true
          })
        }
      }).catch(()=> {
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
    return {
      title: `来看看热评吧！`,
      path: `/comments?id=${this.data.msgBoard.id}`
    }
  },
  
  onLoadFecthMsgBoard: function () {
    return wx.myRequests.msgBoardOne({
      id :this.data.states.msgBoard.id,
    }).then(data => {
      store.action('update', {
        msgBoard: data
      })
      return Promise.resolve(data)
    })
  },
  onLoadFetchComments: function () {
    this.setData({
      commentsHasFirstLoad: false,
      commentsHasLoadError: false
    })
    return this.fetchComments()
      .then(()=> {
        this.setData({
          commentsHasFirstLoad: true
        })
      }).catch(()=> {
        this.setData({
          commentsHasLoadError: true,
          webErrors: [this.onLoadFetchComments]
        })
      })
  },

  writeComment: function () {
    store.action('update', {
      isInputComment: true
    })
  },
  fetchComments: function (isFirst = false) {
    let fectComments = this.data.states.isManager 
      ? wx.myRequests.messageAdminList
      : wx.myRequests.messageList
    return fectComments({
      msgBoardId  :this.data.states.msgBoard.id,
      ...this.data.pagination
      }).then(data => {
      if (data.length > 0) {
        data = data.map(item => {
          item.creatFriendlyTime = utils.getFriendlyTime(new Date(item.createdTime))
          item.lastFriendlyTime = utils.getFriendlyTime(new Date(item.updatedTime))
          return item
        })
        
        this.setData({
          comments: isFirst ? data : this.data.comments.concat(data),
          pagination: {
            pageNum: this.data.pagination.pageNum + 1,
            pageSize: 30,
            createdTime: data[data.length - 1].createdTime
          }
        })
      }
      return Promise.resolve(data)
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
  getUserInfo: function (event) {
    user.setUserInfoInComment(event)
   },
  onDeleteComment: function(e) {
    let id = e.detail.id
    this.data.comments.some((comment, index) => {
      if (comment.id === id) {
        this.data.comments.splice(index, 1)
        this.setData({
          comments: this.data.comments
        })
        return true
      }
    })
  },
  onSend: function(e) {
    let payload = e.detail
    if (payload.isReplay) {
      this.updateReplay(payload)
    } else {
      this.updateComment(payload)
    }
  },
  updateReplay(payload) {
    this.data.comments.some((comment, index) => {
      if (comment.id === payload.replayId) {
        this.data.comments[index].child = payload.comment
        this.setData({
          comments: this.data.comments
        })
        return true
      }
    })
  },
  updateComment() {

  }
})