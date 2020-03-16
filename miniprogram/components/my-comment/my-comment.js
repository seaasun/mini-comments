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
    commentIsDeleting: false,
    replayIsDeleting: false,
    toggleGooding: false,
    actionMoring: false,
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
      
      if (this.data.comment.checked == 1) {
        check = 0
      }

      wx.myRequests.messageAdminCheck({
        check,
        id: this.data.comment.id
      }, () => {
        this.setData({
          toggleChecking: false,
          'comment.checked': check === 1 ? 1 : 0
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
          }).catch(()=> {
            store.action('update', {
                    errMsg: resp.message
                  })
          })
        },
        complete: () => {
          this.setData({
            commentIsDeleting: false
          })
        }
      })

      // this.setData({
      //   deleteTipWating: true,
      //   showDeleteTip: true,
      //   deleteTiping: false,
      //   delteTipDone: false,
      // })

     
       
      
      // // 执行删除
      // setTimeout(() => {
      //   this.setData({
      //     deleteTipWating: false,
      //     deleteTiping: true
      //   })
        
      //   wx.myRequests.messageAdminDelete({
      //     id: this.data.comment.id
      //   }, () => {
      //     // 删除完成
      //     this.setData({
      //       deleteTiping: false,
      //       delteTipDone: true,
      //       isDelete: true
      //     })
          
      //     store.action('updateMsgboard', {
      //       msgQtyForCommenter: this.data.states.msgBoard.msgQtyForCommenter - 1
      //     })
          
      //     // Todo@maxiao hav problem
      //     this.triggerEvent('deleteComment', {id: this.data.comment.id}, {})
         
      //     // 关闭提示
      //     setTimeout(() => {
      //       this.setData({
      //         showDeleteTip:false
      //       })
      //     }, 1000)
      //   }, resp => {
          
      //     this.setData({
      //       deleteTiping: false,
      //       showDeleteTip:false,
      //     })

      //     store.action('update', {
      //       errMsg: resp.message
      //     })
      //   })
      // }, 2000)

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
      if (this.data.comment.isPraised) {
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
          'comment.isPraised': praise === 1 ? 1 : 0
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
    deleteAuthorComment () {
      if (this.data.replayIsDeleting) return 
     
      wx.showModal({
        title: '是否要删除？',
        content: '删除后回复不可找回',
        success: () => {
          this.setData({
            replayIsDeleting: true
          })
          
          wx.myRequests.messageAdminDelete({
            id: this.data.comment.child.id
          }).then(resp => {
          
            this.setData({
              'comment.child': null
            })
          }).catch( resp => {
            if (resp && resp.message) {
              store.action('update', {
                errMsg: resp.message
              })
            }
          })
        },
        complete: () => {
          this.setData({
            replayIsDeleting: false
          })
        }
      })
    }
  }
})
