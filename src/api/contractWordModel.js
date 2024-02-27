import request from '@/utils/request.js'

export function listContractWordModel() {
    return request({
        url: '/contractWordModel/list',
        method: 'get'
    })
}

export function updateContractWordModel(data) {
    return request({
        url: '/contractWordModel/update',
        method: 'post',
        data
    })

}

export function listContractWordModelParams() {
    return request({
        url: '/contractWordModelParams/list',
        method: 'get'
    })
}

export function insertContractWordRecord(data) {
    return request({
        url: '/contractWordModelRecord/insert',
        method: 'post',
        data
    })
}

export function selectContractWordRecordByContractId(data) {
    return request({
        url: '/contractWordModelRecord/getByContractId',
        method: 'get',
        params:data
    })
}
