import request from '@/utils/request'

export function insertProPutDetail(data) {
    return request({
        url: '/proPutDetail',
        method: 'put',
        data: data
    })
}

export function updateProPutDetail(data) {
    return request({
        url: '/proPutDetail',
        method: 'post',
        data: data
    })
}

export function getPutDetailByMain(zujinId) {
    return request({
        url: `/proPutDetail/getPutDetail/${zujinId}`,
        method: 'get',
        params: {mainId: zujinId}
    })
}

export function getPayDetails(zujinId) {
    return request({
        url: `/detailPay/list/${zujinId}`,
        method: 'get'
    })
}

export function addPayDetail(data) {
    return request({
        url: '/detailPay',
        method: 'put',
        data: data
    })
}

export function getById(id) {
    return request({
        url: `proPutDetail/${id}`,
        method: 'get',
    })
}

export function getByMainId(mainId, startDate, endDate, loadProMoney) {
    return request({
        url: `proPutDetail/getPutDetail/${mainId}`,
        method: 'get',
        params: {startDate, endDate, loadProInfo:loadProMoney}
    })
}

export function listAll(query) {
    return request({
        url: `proPutDetail/list`,
        method: 'get',
        params: query
    })
}

export function exportList(query) {
    return request({
        url: `proPutDetail/exportList`,
        method: 'get',
        params: query
    })
}

export function getProMoneySum(year) {
    return request({
        url: `proPutDetail/getMoneySum/${year}`,
        method: 'get'
    })
}

export function setProMoneyHandler(data){
    return request({
        url:'proPutDetail/setProMoney',
        method:'post',
        data:data
    })
}