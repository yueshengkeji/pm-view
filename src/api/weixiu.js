import request from '@/utils/request.js'


export function list(param) {
    return request({
        url: '/weixiuApi/list',
        method: 'get',
        params: param
    })
}

export function exportList(param) {
    return request({
        url: '/weixiuApi/exportList',
        method: 'get',
        params: param
    })
}

export function insertWeixiu(data) {
    return request({
        url: '/weixiuApi',
        method: 'put',
        data: data
    })
}
export function insertWeixiuExt(data) {
    return request({
        url: '/weixiuApi/ext',
        method: 'put',
        data: data
    })
}
export function updateWeixiu(data) {
    return request({
        url: '/weixiuApi',
        method: 'post',
        data: data
    })
}
export function getWeiXiuCount() {
    return request({
        url: '/weixiuApi/getWeiXiuCount',
        method: 'get',
    })
}
export function getByProjectGroup(params) {
    return request({
        url: '/weixiuApi/getByProjectGroup',
        method: 'get',
        params:params
    })
}
//导出统计信息为excel
export function exportExcel(params) {
    return request({
        url: '/weixiuApi/exportExcel',
        method: 'get',
        params:params
    })
}
//通过id获取维修单
export function getById(id) {
    return request({
        url: `/weixiuApi/${id}`,
        method: 'get',
    })
}
export function personList(q) {
    return request({
        url:'/weixiuApi/personList',
        method:'get',
        params:q
    })
}
export function insertPerson(q) {
    return request({
        url:'/weixiuApi/person',
        method:'put',
        data:q
    })
}
export function updatePerson(q) {
    return request({
        url:'/weixiuApi/person',
        method:'post',
        data:q
    })
}
