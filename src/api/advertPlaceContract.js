import request from '@/utils/request'

export function insert(data) {
    return request({
        url:'/advertPlaceContract/insert',
        method:'post',
        data
    })
}

export function update(data) {
    return request({
        url:'/advertPlaceContract/update',
        method:'post',
        data
    })
}

export function deleteById(data) {
    return request({
        url:'/advertPlaceContract/deleteById',
        method:'post',
        params:data
    })
}

export function list(data) {
    return request({
        url:'/advertPlaceContract/list',
        method:'get',
        params:data
    })
}

export function selectById(data) {
    return request({
        url:'/advertPlaceContract/selectById',
        method:'get',
        params:data
    })
}
