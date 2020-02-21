// components/my-comment/my-comment.js
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
    moreActions: [
      {text: '置顶', value:'top'},
      {text: '删除', value: 'authorDelete'}
    ],
    showMoreAction: false,
    showAddCommenting: false,
    showCancelCommenting: false,
    showDeleteTip:false,
    deleteTipWating: false,
    deleteTiping: false,
    delteTipDone: false,
    toggleGooding: false,
    actionMoring: false,

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
    moreActionsSelect (value) {
      console.log(value)
    },
    writeAuthorComment: function () {
      store.action('update', {
        isInputComment: true
      })
    },
    // 加入精选
    addComment: function () {
      if (this.showAddCommenting) return false
      this.setData({
        showAddCommenting: true
      })

    },
    // 取消精选
    cancelComment: function () {
      if (this.showCancelCommenting) return false
      this.setData({
        showCancelCommenting: true
      })
    },
    showMoreActions: function () {
      this.setData({
        showMoreAction: true
      })
    },
    doTop: function () {
      this.setData({
        actionMoring: true
      })
    },
    cancelDeleteComment: function () {
      this.setData({
        showDeleteTip: false,
      })
    },
    doAuthorDelete: function () {
      this.setData({
        deleteTipWating: true,
        showDeleteTip: true,
        deleteTiping: false,
        delteTipDone: false,
      })
      var that = this
      // 执行删除
      setTimeout(function() {
        that.setData({
          deleteTipWating: false,
          deleteTiping: true
        })

        // 删除完成
        setTimeout(function(){
          that.setData({
            deleteTiping: false,
            delteTipDone: true
          })
        }, 1000)

        // 关闭提示
        setTimeout(function(){
          that.setData({
            showDeleteTip:false
          })
        }, 1000)
      }, 3000)

    },
    doActionMore: function (event) {
      if (!this.data.showMoreAction) return false
   
      let value = event.detail.value
      console.log(value,event)
      if (value === 'top') {
        this.doTop()
      } else if (value == 'authorDelete') {
        this.doAuthorDelete()
      }

      this.setData({
        showMoreAction: false
      })
    },
    doToggleGood: function () {
      this.setData({
        toggleGooding: true
      })
    }
  }
})
