import request from '@/utils/request'

export function list(data) {
    return request({
        url: '/entertain/list',
        method: 'get',
        params: data
    })
}

export function insert(data) {
    return request({
        url: '/entertain/insert',
        method: 'post',
        data:data
    })
}

export function update(data) {
    return request({
        url: '/entertain/update',
        method: 'post',
        data:data
    })
}

export function deleteItem(data) {
    return request({
        url: '/entertain/delete',
        method: 'post',
        data:data
    })
}

export function selectById(data) {
    return request({
        url: '/entertain/selectById',
        method: 'get',
        params:data
    })
}
