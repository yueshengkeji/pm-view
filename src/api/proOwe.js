import request from '@/utils/request'

export function getOweList(mainId) {
    return request({
        url: '/detailMoney/list',
        method: 'get',
        params: {detailId: mainId}
    })
}

export function insertOwe(data) {
    return request({
        url: '/proDetail/insertOwe',
        method: 'put',
        data: data
    })
}

export function updateOwe(data) {
    return request({
        url: '/proDetail/updateOwe',
        method: 'post',
        data: data
    })
}

export function updateQcOwe(data) {
    return request({
        url: '/proDetail/updateOwe',
        method: 'post',
        data: data
    })
}