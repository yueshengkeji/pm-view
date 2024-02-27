import request from '@/utils/request'

export function zujinList(param) {
    return request({
        url: 'zujin/list',
        method: 'get',
        params: param,
    })
}
export function expireList(param) {
    return request({
        url: 'zujin/expire/list',
        method: 'get',
        params: param,
    })
}
export function rageMoneyList(param) {
    return request({
        url: 'zujin/rageMoney/list',
        method: 'get',
        params: param,
    })
}
export function bzjMoneyList(param) {
    return request({
        url: 'zujin/bzjMoney/list',
        method: 'get',
        params: param,
    })
}
export function expireEarlyList(param) {
    return request({
        url: 'zujin/expireEarly/list',
        method: 'get',
        params: param,
    })
}
export function cwMoneyEarlyList(param) {
    return request({
        url: 'zujin/cwMoneyEarly/list',
        method: 'get',
        params: param,
    })
}
export function tempMoneyList(param) {
    return request({
        url: 'zujin/tempMoney/list',
        method: 'get',
        params: param,
    })
}
export function insertZujin(data) {
    return request({
        url: 'zujin',
        method: 'put',
        data: data,
    })
}

export function deleteZujin(id) {
    return request({
        url: `zujin`,
        method: 'delete',
        params: {id:id},
    })
}
export function updateZujin(data) {
    return request({
        url: 'zujin',
        method: 'post',
        data: data,
    })
}

export function updateMoney(data) {
    return request({
        url: 'zujin/updateMoney',
        method: 'post',
        data: data,
    })
}
export function insertBzj(data) {
    return request({
        url: 'zujin/bzj',
        method: 'post',
        data: data,
    })
}

export function bzjList(proId) {
    return request({
        url: `zujin/bzj/${proId}`,
        method: 'get',
    })
}
export function moneyTotal() {
    return request({
        url: `zujin/moneyTotal`,
        method: 'get',
    })
}
export function deleteBzj(id) {
    return request({
        url: `zujin/deleteBzj/${id}`,
        method: 'delete',
    })
}
export function exportZujinExcel(url,param){
    return request({
        url: `zujin/${url}`,
        method: 'get',
        params: param,
    })
}

export function getByHouseId(houseId){
    return request({
        url: `zujin/byHouseId/${houseId}`,
        method: 'get',
    })
}
export function moneyTotalv2(type) {
    return request({
        url: `zujin/moneyTotalv2`,
        method: 'get',
        params:{type:type}
    })
}
export function listBrand(searchText){
    return request({
        url:'zujin/brandList',
        method:'get',
        params:{searchText}
    })
}
export function queryById(id){
    return request({
        url:`zujin/${id}`,
        method:'get'
    })
}