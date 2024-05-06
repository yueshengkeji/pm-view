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

export function updateTerm(term){
    return request({
        url:'term',
        method:'post',
        data:term
    })
}
export function listTermByConcat(concat){
    return request({
        url:`term/byConcat/${concat}`,
        method:'get',
    })
}
export function deleteTerm(id){
    return request({
        url:`term/${id}`,
        method:'delete',
    })
}
export function getBillList(param)
{
    return request({
        url:'zujin/billList',
        method:'get',
        params:param
    })
}

export function insertBill(bill)
{
    return request({
        url:'zujin/bill',
        method:'put',
        data:bill
    })
}
export function updateBill(bill)
{
    return request({
        url:'zujin/bill',
        method:'post',
        data:bill
    })
}
export function exportBill(param)
{
    return request({
        url:'zujin/exportBillList',
        method:'get',
        params:param
    })
}
export function deleteBill(id){
    return request({
        url:`zujin/bill/${id}`,
        method:'delete',
    })
}

export function proZujinPromotionList(data) {
    return request({
        url: 'zujin/proZujinPromotionList',
        method: 'get',
        params:data
    })
}

export function updatePromotion(data) {
    return request({
        url: 'zujin/updatePromotion',
        method: 'post',
        data
    })
}

export function deletePromotion(data) {
    return request({
        url: 'zujin/deletePromotion',
        method:'post',
        data
    })

}
