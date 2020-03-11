
function promisify(fn) {
    return function (obj = {}) {
        return new Promise((resolve, reject) => {
            obj.success = function (res) {
                resolve(res)
            }
 
            obj.fail = function (res) {
                reject(res)
            }
 
            fn(obj)
        })
    }
}

const wxApis = {
    wxLogin: (data) => promisify(wx.login)(data),
    wxRequest: (data) => promisify(wx.request)(data),
    wxGetSetting: (data) => promisify(wx.getSetting)(data),
    wxGetUserInfo: (data) => promisify(wx.getUserInfo)(data),
    wxGetStorage: (data) => promisify(wx.getStorage)(data),
    wxSetClipboardData: (data) => promisify(wx.setClipboardData)(data)
}

export {
    promisify,
    wxApis
}