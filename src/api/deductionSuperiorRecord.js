import request from '@/utils/request'

export function insertDeductionSuperiorRecord(data) {
    return request({
        url:'deductionSuperiorRecordApi/insertDeductionSuperiorRecord',
        method:'post',
        data
    })
}

export function updateDeductionSuperiorRecord(data) {
    return request({
        url:'deductionSuperiorRecordApi/updateDeductionSuperiorRecord',
        method:'post',
        data
    })
}

export function deleteById(data) {
    return request({
        url:'deductionSuperiorRecordApi/deleteById',
        method:'post',
        params:data
    })
}

export function selectById(data) {
    return request({
        url:'deductionSuperiorRecordApi/selectById',
        method:'get',
        params:data
    })
}

export function list(data) {
    return request({
        url:'deductionSuperiorRecordApi/list',
        method:'get',
        params:data
    })
}

export function exportDeduction(data){
    return request({
        url:'deductionSuperiorRecordApi/export',
        method:'get',
        params:data
    })
}