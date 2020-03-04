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
    toggleChecking: false,
    showDeleteTip:false,
    deleteTipWating: false,
    deleteTiping: false,
    delteTipDone: false,
    toggleGooding: false,
    actionMoring: false,
    isDelete: false
  },
  lifetimes: {
    created: function () {
      store.subject(this)
      
    },
    attached: function () {
      store.subject(this)
      store.action('update', {
        isManager: true
      })
      this.updateMoreActions()
    },
    ready: function () {
      store.subject(this)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    writeAuthorComment: function () {
      store.action('update', {
        isInputComment: true,
        replayId: this.data.comment.id,
      })
    },
    toggleCheck: function () {
      if (this.data.toggleChecking) return false
      this.setData({
        toggleChecking: true
      })
      let check = 1
      
      if (this.data.comment.checked) {
        check = 0 
      }

      wx.myRequests.messageAdminCheck({
        check,
        id: this.data.comment.id
      }, () => {
        this.setData({
          toggleChecking: false,
          'comment.checked': check === 1 ? true : false
        })
        console.log(this.data)
      }, resp => {
        this.setData({
          toggleChecking: false,
        })
        store.action('update', {
          errMsg: resp.message
        })
      })

    },
    showMoreActions: function () {
      if (this.data.actionMoring) return 
      this.setData({
        showMoreAction: true
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
      }, resp => {
        this.setData({
          actionMoring: false,
        })
        store.action('update', {
          errMsg: resp.message
        })  
      })
    },
    cancelDeleteComment: function () {
      this.setData({
        showDeleteTip: false,
      })
    },
    doAuthorDelete: function () {
      if (this.data.deleteTiping) return 
      this.setData({
        deleteTipWating: true,
        showDeleteTip: true,
        deleteTiping: false,
        delteTipDone: false,
      })
      
      // 执行删除
      setTimeout(() => {
        this.setData({
          deleteTipWating: false,
          deleteTiping: true
        })
        
        wx.myRequests.messageAdminDelete({
          id: this.data.comment.id
        }, () => {
          // 删除完成
          this.setData({
            deleteTiping: false,
            delteTipDone: true,
            isDelete: true
          })
          console.log( this.data.states.msgBoard.msgQtyForCommenter,this.data.states,3333)
          store.action('updateMsgboard', {
            msgQtyForCommenter: this.data.states.msgBoard.msgQtyForCommenter - 1
          })
          
          // Todo@maxiao hav problem
          this.triggerEvent('deleteComment ', this.data.comment.id, { bubbles: true })
         
          // 关闭提示
          setTimeout(() => {
            this.setData({
              showDeleteTip:false
            })
          }, 1000)
        }, resp => {
          
          this.setData({
            deleteTiping: false,
            showDeleteTip:false,
          })

          store.action('update', {
            errMsg: resp.message
          })
        })
      }, 2000)

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
    doToggleGood: function () {
      let praise = 1
      if (this.data.comment.praise === 1) {
        praise = -1
      }
      this.setData({
        toggleGooding: true
      })
      wx.myRequests.messagePraise({
        praise: praise,
        id: this.data.comment.id
      }, () => {
        this.setData({
          toggleGooding: false,
          'comment.praisePoint': this.data.comment.praisePoint + praise,
          'comment.praise': praise === 1 ? 1 : 0
        })
      }, resp => {
        this.setData({
          toggleGooding: false,
        })
        store.action('update', {
          errMsg: resp.message
        })
      })
      
    },
    updateMoreActions: function () {
      this.setData({
        'moreActions[0].text': this.data.comment.top ? '取消置顶' : '置顶'
      })
    },
    getUserInfo () {
      
    }
  }
})
