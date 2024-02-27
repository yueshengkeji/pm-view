import request from '@/utils/request'

export function list(param) {
    return request({
        url:'/proReport/list',
        method:'get',
        timeout:3000000,
        params:param
    })
}
export function refreshReport(date) {
    return request({
        url:'/proReport/refreshReport',
        method:'put',
        timeout:3000000,
        params:date
    })
}
export function exportExcel(param) {
    return request({
        url:'/proReport/export',
        method:'get',
        timeout:3000000,
        params:param
    })
}