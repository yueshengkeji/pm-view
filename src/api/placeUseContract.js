import request from '@/utils/request'

export function insert(data) {
    return request({
        url:'/placeUseContract/insert',
        method:'post',
        data
    })
}

export function update(data) {
    return request({
        url:'/placeUseContract/update',
        method:'post',
        data
    })
}

export function deleteById(data) {
    return request({
        url:'placeUseContract/deleteById',
        method:'delete',
        params:data
    })
}

export function selectById(data) {
    return request({
        url:'/placeUseContract/selectById',
        method:'get',
        params:data
    })
}

export function list(data) {
    return request({
        url:'/placeUseContract/list',
        method:'get',
        params:data
    })
}
