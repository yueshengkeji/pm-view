import request from '@/utils/request'

export function collectList(data) {
    return request({
        url: '/salesCollect/collectList',
        method: 'get',
        params: data
    })
}

export function exportCollectList(data) {
    return request({
        url: '/salesCollect/exportCollectList',
        method: 'get',
        params: data
    })
}
