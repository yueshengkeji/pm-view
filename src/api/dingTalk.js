import request from '@/utils/request'
import * as dd from "dingtalk-jsapi";

export function getCode(callback) {
    if (dd.env.platform !== "notInDingTalk"){
        let corpId = null
        getCorpId().then(res => {
            corpId = res
            console.log('corpId:' + corpId)
            dd.ready(() => {
                dd.runtime.permission.requestAuthCode({
                    corpId : corpId,
                    onSuccess:(info) => {
                        callback(info.code)
                    },
                onFail:(error) => {
                        console.log("dd.ready-error:",error)
                    alert(JSON.stringify(error))
                    },
                })
            });
            dd.error((error) => {
                console.log("dd.error:",JSON.stringify(error))
                alert(JSON.stringify(error))
            })
        })

    }else {
        alert("请从钉钉工作台进入！")
    }
}

export function getCorpId() {
    return request({
        url:'/dingTalk/getCorpId',
        method:'get'
    })
}

export function dingLogin(data) {
    return request({
        url:'/dingTalk/dingLogin',
        method:'get',
        params:data
    })
}

export function dingBind(data) {
    return request({
        url:'/dingTalk/dingBind',
        method:'get',
        params:data
    })
}

export function mediaUpload(data) {
    return request({
        url:'/dingTalk/mediaUpload',
        method:'post',
        data:data
    })
}

export function setStatus(data) {
    return request({
        url:'/dingTalk/setStatus',
        method:'post',
        params:data
    })
}

export function deleteItem(data) {
    return request({
        url:'/dingTalk/deleteImage',
        method:'post',
        params:data
    })
}

export function getImageMsg() {
    return request({
        url:'/dingTalk/getImageMsg',
        method:'get',
    })
}

export function createDingDepartment() {
    return request({
        url:'/dingTalk/createDingDepartment',
        method:'post'
    })
}

export function createDingUser() {
    return request({
        url:'/dingTalk/createDingUser',
        method:'post'
    })
}









//test
export function sendMSG() {
    return request({
        url:'/TestDingTalk/sendWorkNotice',
        method:'post'
    })

}

export function checkDingUser() {
    return request({
        url:'/TestDingTalk/checkDingUser',
        method:'post'
    })

}

export function createTask() {
    return request({
        url:'/TestDingTalk/createTaskToDo',
        method:'post'
    })

}

export function createDepartment() {
    return request({
        url:'/TestDingTalk/createDepartment',
        method:'post'
    })

}

export function sendDingTask() {
    return request({
        url:'/TestDingTalk/sendDingTaskFlow',
        method:'post'
    })

}

export function updateDingTask() {
    return request({
        url:'/TestDingTalk/updateDingTask',
        method:'post'
    })

}

export function initCreateDepartment() {
    return request({
        url:'/TestDingTalk/initCreateDepartment',
        method:'post'
    })

}


