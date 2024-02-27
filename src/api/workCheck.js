import request from '@/utils/request'

export function list(queryParam) {
    return request({
        url: '/workCheck/listByStaff',
        method: 'get',
        params: queryParam
    })
}

export function getById(id) {
    return request({
        url: `/workCheck/${id}`,
        method: 'get',
    })
}

export function getHead(type, avatar) {
    return request({
        url: `/workCheck/file/${type}/${avatar}`,
        method: 'get'
    })
}

export function deptList(param) {
    return request({
        url: `/workCheck/listByDept`,
        method: 'get',
        params: param
    })
}

export function listByDate(param) {
    return request({
        url: `/workCheck/list`,
        method: 'get',
        params: param
    })
}

export function syncOvertimeAndLeave(param) {
    return request({
        url: `/workCheck/syncLeaveAndOvertime`,
        method: 'post',
        params: param
    })
}

export function getByDatetime(param) {
    return request.get("/workCheck/getByDatetime", {params: param})
}

export function exportList() {
    return request.get("/workCheck/exportList")
}

export function insertWorkCheck(data) {
    return request({
        url: 'workCheck/insertWorkCheck',
        method: 'put',
        data: data
    })
}
export function updateState(data){
    return request({
        url: 'workCheck/approve',
        method: 'put',
        data: data
    })
}