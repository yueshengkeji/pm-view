import request from '@/utils/request'

export function getContractTypes() {
    return request({
        url:'/contractType/getContractTypes',
        method:'get',
    })
}

export function getByFatherId(data) {
    return request({
        url:'contractType/getByFatherId',
        method:'get',
        params:data,
    })
}

export function insertContractType(data) {
    return request({
        url:'/contractType/insertContractType',
        method:'post',
        data:data,
    })
}

export function updateContractType(data) {
    return request({
        url:'/contractType/updateContractType',
        method:'post',
        data:data,
    })
}

export function deleteContractType(data) {
    return request({
        url:'/contractType/deleteContractType',
        method:'delete',
        params:data,
    })

}