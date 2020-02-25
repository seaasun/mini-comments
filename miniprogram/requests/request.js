let options = {
    messageAdminAuthorReplay: {
        url: 'wx/ma/message/admin/author/replay',
        method: 'post',
        isDataBoolean: true,
        mock: true
    },
    messageAdminCheck: {
        url: 'wx/ma/message/admin/check',
        method: 'get',
        isDataBoolean: true,
        mock: true,
    },
    messageAdminDelete: {
        url: 'wx/ma/message/admin/delete',
        method: 'get',
        isDataBoolean: true,
        mock: true
    },
    messageAdminTop: {
        url: 'wx/ma/message/admin/top',
        method: 'get',
        isDataBoolean: true,
        mock: true
    },
    messageCreate: {
        url: 'wx/ma/message/create',
        method: 'post',
        isDataBoolean: true,
        mock: true
    },
    messageList: {
        url: 'wx/ma/message/list',
        method: 'get',
        mock: true,
    },
    messagePraise: {
        url: 'wx/ma/message/praise',
        method: 'get',
        isDataBoolean: true,
        mock: true
    },
    msgBoardAdminList: {
        url: 'wx/ma/msgBoard/admin/list',
        method: 'get',
        mock: true,
    },
    msgBoardCommenterList: {
        url: 'wx/ma/msgBoard/commenter/list',
        method: 'get',
        mock: true
    },
    msgBoardOne: {
        url: 'wx/ma/msgBoard/one',
        method: 'get',
        mock: true
    },
    portal: {
        url: 'wx/ma/portal',
        method: 'get',
        mock: true
    },
    userInfo: {
        url: 'wx/ma/user/info',
        method: 'get',
        mock: true
    },
    userLogin: {
        url: 'wx/ma/user/login',
        method: 'get',
        mock: true
    },
    userPhone: {
        url: 'wx/ma/user/phone',
        method: 'get',
        mock: true
    },
    
}

function getUrl (item) {
    if (item.mock) {
        return 'http://rap2.taobao.org:38080/app/mock/245416/'
    } else {
        return 'http://39.106.115.205/'
    }

}
function request (item, data, success, fail) {
    wx.request({
        url: getUrl(item) + item.url,
        method: item.method,
        data,
        header: {},
        timeout: 5000,
        success (res) {
            if (res.data.success) {
                if (item.isDataBoolean && !res.data.data) {
                    fail(res.data)
                } else {
                    success(res.data.data)
                }
            } else {
                fail(res.data)
            }
        },
        fail (res) {
            fail(res.data)
        }
    })
}
function getRequests() {
    let api = {}
    Object.entries(options).map(function([key, item]) {
        api[key] = function (data, success, fail) {
            // 模拟延迟操作
            if (item.delay) {
                setTimeout(() => request(item, data, success, fail), item.delay)
            } else {
                request(item, data, success, fail)
            }
        }
    })
    return api
}

module.exports.getRequests = getRequests