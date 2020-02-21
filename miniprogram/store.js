let subjects = [] // 订阅列表

// 状态列表
let states = {
    isInputComment: false
}

// actions 列表
let actions = {
    update: function (payload) {
        return {
            ...states,
            ...payload
        }
    }
}

function subject (self) {
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
}

module.exports.action = action
module.exports.subject = subject
module.exports.states = states