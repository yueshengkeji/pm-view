import request from '@/utils/request'

export function list(query) {
    return request.get("/otherPay/list", {params:query})
}
export function insertPay(data) {
    return request.put("/otherPay", data)
}
export function deletePay(id) {
    return request.delete(`/otherPay/${id}`)
}
export function updatePay(data) {
    return request.post(`/otherPay`,data)
}
export function getById(id) {
    return request.get(`/otherPay/${id}`)
}
export function getPayType(id) {
    return request.get(`/otherPay/payType/${id}`)
}
export function getSumMoney(params) {
    return request.get(`/otherPay/getSumMoney`,{params:params})
}
export function exportList(query) {
    return request.get("/otherPay/exportList", {params:query})
}
