import request from '@/utils/request'

export function insert(data) {
    return request({
        url: '/contractReceipt/insert',
        method: 'post',
        data
    })
}

export function update(data) {
    return request({
        url: '/contractReceipt/update',
        method: 'post',
        data
    })
}

export function selectById(data) {
    return request({
        url: '/contractReceipt/selectById',
        method: 'get',
        params: data
    })
}

export function deleteById(data) {
    return request({
        url: '/contractReceipt/selectById',
        method: 'post',
        params: data
    })
}

export function list(data) {
    return request({
        url: '/contractReceipt/list',
        method: 'get',
        params: data
    })
}

export function getContractReceiptFiles(data) {
    return request({
        url: '/contractReceipt/getContractReceiptFiles',
        method: 'get',
        params: data
    })
}

export function exportList(data) {
    return request({
        url: '/contractReceipt/exportList',
        method: 'get',
        params: data
    })
}
