let subjects = [] // 订阅列表

// 状态列表
let states = {
    isInputComment: false, // 正字输入状态
    replayId: 0, // 回复id
    msgBoard: {   // 当前的msgBoard
        id: null
    },
    isManager: false, // 是管理员
    errMsg: '', // 错误提示
    user: {}, // 用户信息
    isLogin: false, // 是否登陆
    isAuth: false, // 用户是否被授权
}

// actions 列表
let actions = {
    update: function (payload) {
        return {
            ...states,
            ...payload
        }
    },
    updateMsgboard (payload) {
        return {
            ...states,
            msgBoard: {
                ...states.msgBoard,
                ...payload
            }
        }
    },
    updateUser (payload) {
        return {
            ...states,
            user: {
                ...states.user,
                ...payload
            }
        }
    }
}

function subject (self) {
    self.setData({
        states
    })
    subjects.push(function (states) {
        self.setData({
            states
        })
    })

}

function action (type, payload) {
    states = actions[type](payload)
    subjects.forEach(function(item) {
        item(states)
    })
    console.warn('[store]new action', type, payload, wx.myDebug)
}

function getStates () {
    return states
}

module.exports.action = action
module.exports.subject = subject
module.exports.states = states
module.exports.getStates = getStates