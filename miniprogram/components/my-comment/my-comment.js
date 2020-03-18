// components/my-comment/my-comment.js
let store = require('../../store')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    comment: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    moreActions: [
      {text: '置顶', value:'toggleTop'},
      {text: '删除', value: 'authorDelete'}
    ],
    showMoreAction: false,
    actionMoring: false,

    toggleChecking: false,
    commentIsDeleting: false,
    replayIsDeleting: false,
    toggleGooding: false,
  },
  lifetimes: {
    created: function () {
    },
    attached: function () {
      store.subject(this)
      this.updateMoreActions()
    },
    ready: function () {
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateMoreActions: function () {
      this.setData({
        'moreActions[0].text': this.data.comment.top ? '取消置顶' : '置顶'
      })
    },
    showMoreActions: function () {
      if (this.data.actionMoring) return 
      this.setData({
        showMoreAction: true
      })
    },
    doActionMore: function (event) {
      if (!this.data.showMoreAction) return false
   
      let value = event.detail.value
      
      if (value === 'toggleTop') {
        this.doToggleTop()
      } else if (value == 'authorDelete') {
        this.doAuthorDelete()
      }

      this.setData({
        showMoreAction: false
      })
    },
    doToggleTop: function () {
      this.setData({
        actionMoring: true
      })
      let top = this.data.comment.top === 1 ? 0 : 1
      wx.myRequests.messageAdminTop({
        id: this.data.comment.id,
        top
      }, () => {
        this.setData({
          actionMoring: false,
          'comment.top':top
        })
        this.updateMoreActions()
      }, res => {
        if (typeof res !== 'object') res = {}
        this.setData({
          actionMoring: false,
        })
        store.action('update', {
          errMsg: res.message || '网路错误, 请重试'
        })  
      })
    },
    doAuthorDelete: function () {
      if (this.data.commentIsDeleting) return 
     
      wx.showModal({
        title: '是否要删除？',
        content: '删除后的留言不可找回',
        success: () => {
          this.setData({
            commentIsDeleting: true
          })

          wx.myRequests.messageAdminDelete({
            id: this.data.comment.id
          }).then(resp => {
             store.action('updateMsgboard', {
              msgQtyForCommenter: this.data.states.msgBoard.msgQtyForCommenter - 1
            })
          
            this.triggerEvent('deleteComment', {id: this.data.comment.id}, {})
          }).catch(res => {
            if (typeof res !== 'object') res = {}
              store.action('update', {
                errMsg: res.message || '网路错误, 请重试'
              })
          })
        },
        complete: () => {
          this.setData({
            commentIsDeleting: false
          })
        }
      })
    },

    toggleCheck: function () {
      if (this.data.toggleChecking) return false
      this.setData({
        toggleChecking: true
      })
      let check = 1
      
      if (this.data.comment.checked == 1) {
        check = 0
      }

      wx.myRequests.messageAdminCheck({
        check,
        id: this.data.comment.id
      }).then(() => {
        this.setData({
          toggleChecking: false,
          'comment.checked': check === 1 ? 1 : 0
        })
      }).catch(res => {
        if (typeof res !== 'object') res = {}
        this.setData({
          toggleChecking: false,
        })
        store.action('update', {
          errMsg: res.message || '网路错误, 请重试'
        })
      })
    },

    doToggleGood: function () {
      let praise = 1
      if (this.data.comment.isPraised) {
        praise = -1
      }
      this.setData({
        toggleGooding: true
      })
      wx.myRequests.messagePraise({
        praise: praise,
        id: this.data.comment.id
      }).then(() => {
        this.setData({
          toggleGooding: false,
          'comment.praisePoint': this.data.comment.praisePoint + praise,
          'comment.isPraised': praise === 1 ? 1 : 0
        })
      }).catch(res => {
        if (typeof res !== 'object') res = {}
        this.setData({
          toggleGooding: false,
        })
        store.action('update', {
          errMsg: res.message || '网路错误, 请重试'
        })
      })

    },

    writeAuthorComment: function () {
      store.action('update', {
        isInputComment: true,
        replayId: this.data.comment.id,
      })
    },
    
    deleteAuthorComment () {
      if (this.data.replayIsDeleting) return 
     
      wx.showModal({
        title: '是否要删除？',
        content: '删除后回复不可找回',
        success: (e) => {
          if (e.cancel) {
            return
          }
          this.setData({
            replayIsDeleting: true
          })
          
          wx.myRequests.messageAdminDelete({
            id: this.data.comment.child.id
          }).then(resp => {
            this.setData({
              'comment.child': null,
              replayIsDeleting: false
            })
          }).catch(res => {
            if (typeof res !== 'object') res = {}
            this.setData({
              replayIsDeleting: false,
            })
            store.action('update', {
              errMsg: res.message || '网路错误, 请重试'
            })
          })
        }
      })
    }
  }
})
