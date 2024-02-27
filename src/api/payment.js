import request from '@/utils/request.js'

export function loadById(id) {
    return request({
        url: '/payment/getById/' + id,
        method: 'get',
    })
}

export function getPayMoney(year) {
    return request({
        url: '/payment/getApplyPaymentMoney?year=' + year,
        method: 'get',
    })
}

export function list(param) {
    return request({
        url: '/payment',
        method: 'get',
        params: param
    })
}
export function exportExcel(param) {
    return request({
        url: '/payment/exportExcel',
        method: 'get',
        params: param
    })
}

export function getPayType() {
    return request({
        url: '/payment/getPayTypeList',
        method: 'get'
    })
}

export function insert(data) {
    return request({
        url: '/payment',
        method: 'post',
        data: data
    })
}

export function deletePay(id) {
    return request({
        url: `/payment/${id}`,
        method: 'delete'
    })
}

export function getDetail(id) {
    return request({
        url: `/paymentDetail/payment/${id}`,
        method: 'get'
    })
}

export function getPayMoneyByCompany(year) {
    return request({
        url: `/paymentDetail/company`,
        method: 'get',
        params: {year: year}
    })
}

export function savePrintHistory(id) {
    return request({
        url: `/payment/savePrintHistory/${id}`,
        method: 'post'
    })
}

export function getApplyMoneyByDate(param) {
    return request({
        url: `/payment/getApplyMoneyByDate`,
        method: 'get',
        params: param
    })
}

export function getBySeries(series) {
    return request({
        url: '/payment/getBySeries',
        method: 'get',
        params: {series}
    })
}

export function getPayDetailByDate(params){
    return request({
        url:'/paymentDetail/listByDate',
        method:'get',
        params:params
    })
}

export function downloadDetailExcel(params){
    return request({
        url:'/paymentDetail/exportByDate',
        method:'get',
        params:params
    })
}