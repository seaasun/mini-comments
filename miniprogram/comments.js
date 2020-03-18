var store = require('./store')
var utils = require('./utils/index')
var user = require('./features/user')

let paginationInit = {
  pageNum: 1,
  pageSize: 20,
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments: [],
    pagination: paginationInit,

    commentsHasFirstLoad: false, // 首屏加载
    commentseMoreLoadding: false, // 更多加载
    isErrorMsgboardId: false, // 错误的留言板列表提示

    errMessage: false,
    webErrors: [], // 缓存错误队列
    
    loaderMoreShowed: false,
    noLoaderMoreShowed: false,
  },

  /**
   * 生命周期函数--监听页面加载setUserInfoByButton
   */
  onLoad: function (options) {
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
    return this.fetchComments(true)
      .then(()=> {
        wx.stopPullDownRefresh()
        this.setData({
          commentsHasFirstLoad: true,
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
    this.fetchComments()
      .then(data => {
        this.setData({
          loaderMoreShowed: false
        })
        if (data.data.length === 0) {
          this.setData({
            noLoaderMoreShowed: true
          })
        }
      }).catch(res => {
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
      title: `来看看热评吧！`,
      path: `/comments?id=${this.data.msgBoard.id}`
    }
  },
  initPageData () {
    user.login()
      .then(res => {        
        this.onLoadFecthMsgBoard()  
        this.onLoadFetchComments()
        user.setUserInfo() // TODO@maxiao 比较难校验
      })
      .catch(res => {
        if (typeof res !== 'object') res = {}
        if (res.action === 'userLogin') {
          this.setData({
            errMessage: res.message || '网络错误',
            webErrors: [this.initPageData]
          })
        }
      })
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
      errMessage: false
    })
    return this.fetchComments()
      .then(()=> {
        this.setData({
          commentsHasFirstLoad: true
        })
      }).catch(res=> {
        let errMessage = '网络错误，无法加载更多'
        if (res && res.message) {
          errMessage = res.message
        }

        this.setData({
          errMessage,
          webErrors: [this.onLoadFetchComments]
        })
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
      if (data.data.length > 0) {
        let comments = data.data.map(item => {
          item.creatFriendlyTime = utils.getFriendlyTime(new Date(item.createdTime))
          item.lastFriendlyTime = utils.getFriendlyTime(new Date(item.updatedTime))
          return item
        })
        
        this.setData({
          comments: isFirst ? comments : this.data.comments.concat(comments), // 下拉刷新直接更新全部列表
          pagination: {
            pageNum: this.data.pagination.pageNum + 1,
            pageSize: 30,
            createdTime: comments[comments.length - 1].createdTime
          }
        })
      }
      return Promise.resolve(data)
    })
  },

  writeComment: function () {
    store.action('update', {
      isInputComment: true
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
  updateComment(payload) {
    if (this.data.states.msgBoard.needCheck === 1) return
    this.data.comments.some((comment, index) => {
      if (comment.top != 1 && payload.comment.createdTime > comment.createdTime) {
        let comments = this.data.comments
        comments.splice(index, 0, payload.comment)
        
        this.setData({
          comments
        })
        return true
      } 
    })
  },
  clearErrMsg () {
    store.action('update', {
      errMsg: ''
    })
  }
})