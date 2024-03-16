import request from '@/utils/request.js'

export function listContractWordModel() {
    return request({
        url: '/contractWordModel/list',
        method: 'get',
    })
}

export function updateContractWordModel(data) {
    return request({
        url: '/contractWordModel/update',
        method: 'post',
        data
    })
}

export function uploadWord(form) {
    return request.post('/contractWordModel/uploadWord', form, {'Accept': '*/*', 'Content-Type': 'multipart/form-data',timeout:-1})
}

export function listContractWordModelParams(data) {
    return request({
        url: '/contractWordModelParams/list',
        method: 'get',
        params:data
    })
}

export function insertContractWordRecord(data) {
    return request({
        url: '/contractWordModelRecord/insert',
        method: 'post',
        data
    })
}

export function insertPlaceContractWordRecord(data) {
    return request({
        url: '/contractWordModelRecord/insertPlaceContract',
        method: 'post',
        data
    })
}

export function insertAdvertPlaceContractWordRecord(data) {
    return request({
        url: '/contractWordModelRecord/insertAdvertPlaceContract',
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
