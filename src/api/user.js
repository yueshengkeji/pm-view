import request from '@/utils/request.js'

/**
 * 获取用户信息
 */
export function getUserInfo(token) {
    return request({
        url: '/staff/getStaffByTokenV2',
        method: 'get',
        params: {token: token}
    })
}

export function getOnlineUser() {
    return request({
        url: '/user-all',
        method: 'get'
    })
}


export function exitUser(token) {
    return request({
        url: `/force-user-logout/${token}`,
        method: 'post'
    })
}

export function updatePasswd(user) {
    return request({
        url: '/staff/updatePasswd',
        method: 'post',
        data: user
    })
}

export function updateUser(staff) {
    return request({
        url: '/staff',
        method: 'put',
        data: staff
    })
}

export function getUserInfoById(id) {
    return request({
        url: `/staff/getById/${id}`,
        method: 'get',
    })
}

export function insertStaff(staff) {
    return request({
        url: '/staff',
        method: 'post',
        data: staff
    })
}

export function getNotifyType(id) {
    return request({
        url: `/staff/getNotifyType/${id}`,
        method: 'get',
    })
}

export function updateNotifyType(data) {
    return request({
        url: `/staff/updateNotifyType`,
        method: 'post',
        data:data
    })
}

export function loginByOpenId(openId) {
    return request({
        url: `/openIdV2/?openId=${openId}`,
        method: 'post',
        timeout: 3000,
    })
}

export function bindWx(user,openId){
    return request({
        url:`/bindOpenId/${openId}`,
        method:'post',
        data:user
    })
}
export function genStaffCard(){
    return request({
        url:`/staff/genStaffCard`,
        method:'put'
    })
}
export function getStaffCardByStaffId(staffId){
    return request({
        url:`/staff/getStaffCardByStaffId/${staffId}`,
        method:'get'
    })
}
export function updateCard(card){
    return request({
        url:`/staff/updateCard`,
        method:'post',
        data:card
    })
}