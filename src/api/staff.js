import request from '@/utils/request.js'

export function getStaff(name) {
    return request({
        url: '/staff',
        method: 'get',
        params: {str: name},
    })
}

export function getStaffAll(param) {
    return request({
        url: '/staff/all',
        method: 'get',
        params: param
    })
}

export function getStaffHead(id) {
    return request({
        url: `/staff/getHead/${id}`,
        method: 'get',
    })
}

export function deleteCarPlate(plate) {
    return request({
        url: '/staff/deleteCarPlate',
        method: 'delete',
        params: {plate: plate}
    })
}

//解除微信绑定
export function unBindWeiChar(id) {
    return request({
        url: `/staff/unBindWeiChar/${id}`,
        method: 'post',
    })
}

//解除钉钉绑定
export function unBindDingTalk(id) {
    return request({
        url:`/staff/unBindDingTalk/${id}`,
        method: 'post',
    })
}

//重置为默认密码
export function resetPasswd(id) {
    return request({
        url: `/staff/resetPasswd/${id}`,
        method: 'post',
    })
}

//同步微信信息
export function syncWeiCharUser() {
    return request({
        url: `/staff/syncWeiCharUser`,
        method: 'get',
    })
}

//获取考勤机信息
export function getInfoByStDevice(staffId) {
    return request({
        url: `/staff/infoByStDevice?staffId=${staffId}`,
        method: `get`,
    })
}
export function getStaffById(staffId)
{
    return request.get(`staff/getById/${staffId}`)
}
export function updateMobileInfo(data)
{
    return request.put(`staff/updateMobileInfo`,data)
}
export function getUserLogin(){
    return request.get('staff/getUserLogin')
}