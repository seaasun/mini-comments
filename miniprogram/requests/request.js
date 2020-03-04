let utils = require('../utils/index')

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
        mock: false
    },
    userLogin: {
        url: 'wx/ma/user/login',
        method: 'get',
        mock: false
    },
    userPhone: {
        url: 'wx/ma/user/phone',
        method: 'get',
        mock: true
    },
    
}

// 存储sessionId
let sessionId = null

function getUrl (item) {
    if (item.mock) {
        return 'http://rap2.taobao.org:38080/app/mock/245416/'
    } else {
        return 'https://www.tinyideatech.com/'
    }

}
function request (item, data, success, fail) {
    return new Promise((resolve, reject) => {
        utils.wxRequest({
            url: getUrl(item) + item.url,
            method: item.method,
            data,
            header: {
                "content-type": "application/json",
                sessionId,
                "dvdvdefefef": 1
            },
            timeout: 5000,
        }).then(res => {
            
            if (res.data.success) {
                if (item.isDataBoolean && !res.data.data) {
                    typeof fail === 'function' && fail(res.data)
                    reject(res.data)
                } else {
                    typeof success === 'function' && success(res.data.data)
                    resolve(res.data.data)

                }
            } else {
                typeof fail === 'function' && fail(res.data)
                reject(res.data)
            }
        }).catch(res => {
            fail(res.data)
        })
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
                return request(item, data, success, fail)
            }
        }
    })
    return api
}

function setSeesion (session) {
    sessionId = session
}

function getSessionId (session) {
    return sessionId
}

module.exports = {
    setSeesion,
    getSessionId,
    getRequests
}