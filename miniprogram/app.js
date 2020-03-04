//app.js
var request = require('./requests/request')
var user = require('./features/user')
console.log(request)

App({
  onLaunch: function () {
    wx.myRequests = request.getRequests()
  },  
  globalData: {
    userInfo: null
  }
})