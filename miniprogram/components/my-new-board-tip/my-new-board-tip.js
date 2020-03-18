import { wxApis } from "../../utils/setWxPromise"
let utils = require('../../utils/index')

// components/my-new-board-tip/my-new-board-tip.js
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
    errorMsg: "",
    successMsg: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCopy() {
      utils.wxSetClipboardData({
        data: 'www.tinyideatech.com/ui'
      }).then(()=> {
        this.setData({
          successMsg: '成功复制到剪贴板'
        })
      }).catch(()=> {
        this.setData({
          errorMsg: '复制失败，请重试'
        })
      })
    }
  }
})
