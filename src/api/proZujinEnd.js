import request from '@/utils/request'

export function insert(data) {
    return request({
        url:'/proZujinEnd/insert',
        method:'post',
        data
    })
}

export function update(data) {
    return request({
        url:'/proZujinEnd/update',
        method:'post',
        data
    })
}

export function deleteById(data) {
    return request({
        url:'/proZujinEnd/deleteById',
        method:'post',
        params:data
    })
}

export function list(data) {
    return request({
        url:'/proZujinEnd/list',
        method:'get',
        params:data
    })
}

export function selectById(data) {
    return request({
        url:'/proZujinEnd/selectById',
        method:'get',
        params:data
    })
}
