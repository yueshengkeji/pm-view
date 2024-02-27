import request from '@/utils/request'

export function updatePay(data) {
    return request({
        url:'/detailPay',
        method:'post',
        data:data
    })
}
export function insertPay(data) {
    return request({
        url:'/detailPay',
        method:'put',
        data:data
    })
}
export function list(query) {
    return request({
        url:`/detailPay/list/${query}`,
        method:'get',
        params:query
    })
}

export function getMoneySum(year){
    return request({
        url:`/detailPay/getMoneySum/${year}`,
        method:'get',
    })
}