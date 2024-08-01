import request from '@/utils/request'

export function insert(data) {
    return request({
        url:'/loan/insert',
        method:'post',
        data:data
    })
}

export function update(data) {
    return request({
        url:'/loan/update',
        method:'post',
        data:data
    })
}

export function deleteById(id) {
    return request({
        url:`/loan/deleteById/${id}`,
        method:'delete',
    })
}

export function selectById(id) {
    return request({
        url:`/loan/selectById/${id}`,
        method:'get',
    })
}

export function list(data) {
    return request({
        url:'/loan/list',
        method:'get',
        params:data
    })
}
