let lastY = 0 // 上一次滚动的位置
let scale = 750 / wx.getSystemInfoSync().windowWidth // rpx转化比例
Component({
  options: {
    multipleSlots: true
  },
  data: {
    scrollTop: 0,
    translateHeight: 0, // 平移距离
    state: -1
  },
  properties: {
    // 触发下拉刷新的距离
    upperDistance: {
      type: Number,
      value: 150
    }
  },
  methods: {
    // 监听滚动，获取scrollTop
    onPageScroll (e) {
      this.data.scrollTop = e.scrollTop
    },
    touchStart (e) {
      lastY = e.touches[0].clientY
    },
    touchMove (e) {
      let clientY = e.touches[0].clientY
      let offset = clientY - lastY
      if (this.data.scrollTop > 0 || offset < 0) return
      this.data.translateHeight += offset
      this.data.state = 0
      lastY = e.touches[0].clientY
      if (this.data.translateHeight - this.data.scrollTop * scale > this.data.upperDistance) {
        this.data.state = 1
      }
      this.setData({
        translateHeight: this.data.translateHeight,
        state: this.data.state
      })
    },
    touchEnd (e) {
      if (this.data.translateHeight - this.data.scrollTop * scale > this.data.upperDistance) {
        this.setData({
          translateHeight: 150
        })
        this.triggerEvent('scrolltoupper')
        this.setData({
          state: 2
        })
      } else if (this.data.scrollTop <= 0) {
        this.stopRefresh()
      }
    },
    //  停止刷新
    stopRefresh () {
      this.setData({
        translateHeight: 0,
        state: -1
      }, () => {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
      })
    }
  }
})