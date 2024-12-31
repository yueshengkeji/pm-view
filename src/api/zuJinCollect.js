import request from '@/utils/request'

export function insertZuJinCollectSuperior(data) {
    return request({
        url:'zuJinCollect/insertZuJinCollectSuperior',
        method:'post',
        data
    })
}

export function updateZuJinCollectSuperior(data) {
    return request({
        url:'zuJinCollect/updateZuJinCollectSuperior',
        method:'post',
        data
    })
}

export function listCollectSuperior(data) {
    return request({
        url:'zuJinCollect/listCollectSuperior',
        method:'get',
        params:data
    })
}

export function selectCollectSuperiorById(data) {
    return request({
        url:'zuJinCollect/selectCollectSuperiorById',
        method:'get',
        params:data
    })
}

export function listZuJinCollect(data) {
    return request({
        url:'zuJinCollect/listZuJinCollect',
        method:'get',
        params:data
    })
}

export function exportZuJinCollect(data){
    return request({
        url:'zuJinCollect/exportZuJinCollect',
        method:'get',
        params:data
    })
}

export function revokeCollect(data){
    return request({
        url:'zuJinCollect/revokeCollect',
        method: 'post',
        data
    })
}