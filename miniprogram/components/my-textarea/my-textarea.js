// components/my-textarea/my-textarea.js
var store = require('../../store')
var user = require('../../features/user')

const emojieBaseHeight = '164px'

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
    states: store.states,

    sending: false, // 消息是否在发送中
    currentComment: "", // 用户输入的评论
    textareaBrief: '留言', // textarea上放的提示词
    inputPlaceholder: '留言', // textarea中的placeholder
    successMsg: '',
    
    // emoji 相关
    emojis: ['😀','😁','😂','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','😗','😙','😚','😇','😐','😑','😶','😏','😣','😥','😮','😯','😪','😫','😴','😌','😛','😜','😝','😒','😓','😔','😕','😲','😷','😖','😞','😟','😤','😢','😭','😦','😧','😨','😬','😰','😱','😳','😵','😡','😠'],
    emojiShowed: false,
    emojiHeightShould: emojieBaseHeight,

    // textareae 弹出高度相关
    textFoucs: false,
   
  },
  lifetimes: {
    created: function () {
      store.subject(this)
    }
  },
  observers: {
    'states.isInputComment, emojiShowed' (isInputComment, emojiShowed) {
      if (isInputComment === false) {
        if (this.data.textFoucs !== false) {
           this.setData({
          textFoucs: false
        })
        }
       
      } else {
        if (emojiShowed) {
          if (this.data.textFoucs !== false) {
            this.setData({
           textFoucs: false
         })
         }
        } else {
          if (this.data.textFoucs !== true) {
            setTimeout( () => {
              this.setData({
                textFoucs: true
              })
            }, 1)
         }
        }
      }
      
    },
    'states.replayId, states.msgBoard.needCheck' (replayId, needCheck) {
      let dict = {
        replay: {
          check: {
            textareaBrief: '写回复',
            inputPlaceholder: '回复留言，增加互动。可删除，不可修改哦~'
          },
          unCheck: {
            textareaBrief: '写回复',
            inputPlaceholder: '即使回复'
          }

        },
        send: {
          check: {
            textareaBrief: '写精选留言',
            inputPlaceholder: '留言将由公众号筛选可见'
          },
          unCheck: {
            textareaBrief: '写即时留言',
            inputPlaceholder: '发送留言后，即时可见'
          }
        }
      }
      let dict1 = replayId ? 'replay' : 'send'
      let dict2 = needCheck ? 'check' : 'unCheck'
      this.setData({
        textareaBrief: dict[dict1][dict2].textareaBrief,
        inputPlaceholder: dict[dict1][dict2].inputPlaceholder
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    commentFocusInput: function () {
      store.action('update', {
        isInputComment: true,
        replayId: 0
      })
      this.setData({
        currenInputComment: this.data.currentComment
      })
    },
    onCloseTextare: function () {
      this.setData({textFoucs: false})
      store.action('update', {
        isInputComment: false,
        replayId: 0
      })
    },
    
    commentHeightUpdate:function (event) {     
      if (this.data.emojiHeightShould !== event.detail.height + 'px' 
        && event.detail.height > 164) {
          this.setData({
            emojiHeightShould: event.detail.height + 'px',
          })
        
      }
    },

    updateCurrentComment: function (event) {
      this.setData({
        currentComment:event.detail.value
      })

    },
    showEmoji: function () {
      if (!this.data.emojiShowed) {
        this.setData({
          textFoucs: false,
          emojiShowed: true,
        })
      } else {
        this.setData({
          emojiShowed: false,
          textFoucs: true,
        })
      }
     
    },
    focusedTextarea: function () {
      this.setData({
        emojiShowed: false
      })
    },
    addEmoji: function (event) {
      this.setData({
        currentComment: this.data.currentComment + this.data.emojis[event.target.dataset.emojiIndex],
        isInputComment: true
      })
    },
    send: function () {
      if (this.data.currentComment === '') {
        store.action('update', {
          errMsg:  this.data.states.replayId 
          ? '回复不能为空~' 
          : '留言不能为空~'

        })
        return
      }

      this.setData({
        sending: true
      })

      let options = {
        request: 'messageCreate',
        params: {
          content: this.data.currentComment,
          msgBoardId: this.data.states.msgBoard.id
        }
      }
     
      if (this.data.states.replayId) {
        options = {
          request: 'messageAdminAuthorReplay',
          params: {
            content: this.data.currentComment,
            id: this.data.states.replayId
          }
        }
      }
      
      wx.myRequests[options.request](
        options.params)
        .then(resp => {
          
          if (typeof res !== 'object' && !resp.id) {
            return Promise.reject(resp)
          }

          this.triggerEvent('send', {
            isReplay: this.data.states.replayId !== 0,
            replayId: this.data.states.replayId,
            comment: resp
          },{})

          this.setData({
            sending: false,
            currentComment: '',
            successMsg: this.data.states.replayId 
              ? '回复成功' 
              : this.data.states.msgBoard.needCheck === 1 
                ?'留言成功，经原作审核后可见'
                : '留言成功，立即可见'
          })
          
          if (this.data.states.replayId !== 0) {
            store.action('updateMsgboard', {
              msgQtyForCommenter: this.data.states.msgBoard.msgQtyForCommenter + 1
            })
          }

          store.action('update', {
            isInputComment: false,
            replayId: 0,
          })

          setTimeout(() => {
            this.setData({
              successMsg: ''
            })
          }, 2000)
        }).catch(res => {
            if (typeof res !== 'object') res = {}
            this.setData({
              sending: false,
            })
            store.action('update', {
              errMsg: res.message || '网路错误，请重试'
            })
        })
    },
    getUserInfo: function (event) {
     user.setUserInfoInComment(event)
    },
    onTextareaBlur () {
      this.setData({foucus: false})
    }
  }
})
