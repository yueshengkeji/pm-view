import request from '@/utils/request'

export function insert(data) {
    return request({
        url:'/completionData/insert',
        method:'post',
        data
    })
}

export function update(data) {
    return request({
        url:'/completionData/update',
        method:'update',
        data
    })
}

export function deleteById(id) {
    return request({
        url:`/completionData/${id}`,
        method:'delete'
    })
}

export function list(data) {
    return request({
        url:'/completionData/list',
        method:'get',
        params:data
    })
}

export function selectById(data) {
    return request({
        url:'/completionData/selectById',
        method:'get',
        params:data
    })
}

export function getCompletionFiles(data) {
    return request({
        url:'/completionData/getCompletionFiles',
        method:'get',
        params:data
    })
}
