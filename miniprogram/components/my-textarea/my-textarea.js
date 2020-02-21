// components/my-textarea/my-textarea.js
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
    isInputComment: false,
    currentComment: "",
    currenInputComment: "",
    display: {
      inputPlaceholder: "留言将有公众号筛选，对所有人可见"
    },
    textBottom: 0,
    textMaxHeight: '128rpx',
    textAutoHeight: true,
    states: store.states
  },
  lifetimes: {
    created: function () {
      store.subject(this)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    commentFocusInput: function () {
      store.action('update', {
        isInputComment: true
      })
      this.setData({
        currenInputComment: this.data.currentComment
      })
    },
    commentNotFocusInput: function () {
      store.action('update', {
        isInputComment: false
      })
    },
    
    commentHeightUpdate:function (event) {
      console.log(333,event.detail.height)
      // 软键盘缩小后，键盘不变化
      if (event.detail.height === 0) {
        // this.setData({
        //   textMaxHeight: this.data.textBottom + 128 + 'px'
        // })
        return
      }
      if (this.data.textBottom !== event.detail.height + 'px') {
        this.setData({
          textMaxHeight: '128px',
          textBottom: event.detail.height + 'px'
        })
      }
    },

    updateCurrentComment: function (event) {
      // console.log(333, event)
      this.setData({
        currentComment:event.detail.value
      })

    }
  }
})
