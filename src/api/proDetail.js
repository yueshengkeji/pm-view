import request from '@/utils/request'

export function detailList(q) {
    return request({
        url:'/proDetail/list',
        method:'get',
        params:q
    })
}
export function insert(data) {
    return request({
        url:'/proDetail',
        method:'put',
        data:data
    })
}
export function update(data) {
    return request({
        url:'/proDetail',
        method:'post',
        data:data
    })
}
export function deleteData(id) {
    return request({
        url:`/proDetail/${id}`,
        method:'delete',
    })
}

export function updateBillMoney(data) {
    return request({
        url:'/proDetail/updateBillMoney',
        method:'post',
        data:data
    })
}
export function exportExcel(data) {
    return request({
        url:'/proDetail/exportExcel',
        method:'get',
        params:data,
        timeout:-1
    })
}
export function downloadCache(url) {
    return request({
        url:url,
        method:'get',
    })
}