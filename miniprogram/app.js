//app.js
var request = require('./requests/request')

App({
  onLaunch: function () {
    wx.myRequests = request.getRequests()
  },  
  globalData: {
    userInfo: null
  }
})