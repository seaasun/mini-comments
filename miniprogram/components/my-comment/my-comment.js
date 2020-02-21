// components/my-comment/my-comment.js
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
    moreActions: ['置顶', '删除']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    moreActionsSelect (value) {
      console.log(value)
    }
  }
})
