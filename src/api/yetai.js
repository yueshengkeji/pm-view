import request from '@/utils/request'

export function insert(data) {
    return request({
        url: 'yetai',
        method: 'put',
        data: data
    })
}

export function update(data) {
    return request({
        url: 'yetai',
        method: 'post',
        data: data
    })
}

export function list(query) {
    return request({
        url: 'yetai/list',
        method: 'get',
        params: query
    })
}