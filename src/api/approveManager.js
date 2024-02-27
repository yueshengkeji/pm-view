import request from '@/utils/request'

export function list(param) {
    return request({
        url: '/flowApprove/list',
        method: 'get',
        params: param
    })
}

export function getMyApproveList(param) {
    return request({
        url: '/usedFlowInstance/myList',
        method: 'get',
        params: param
    })
}