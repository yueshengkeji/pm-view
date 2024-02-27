import request from '@/utils/request.js'

export function getBidList(query) {
    return request({
        url: '/proBid/list',
        method: 'get',
        params: query
    })
}

export function saveRemark(id, remark) {
    return request({
        url: '/applyMaterial/updateApplyRemark',
        method: 'post',
        data: {id: id, remark: remark}
    })
}

export function list(param) {
    return request({
        url: '/apply',
        method: 'get',
        params: param
    })
}

export function insertBid(data) {
    return request({
        url: '/proBid',
        method: 'put',
        data: data
    })
}

export function updateResult(data) {
    return request({
        url: '/proBid/updateResult',
        method: 'post',
        data: data
    })
}


export function deleteBid(id) {
    return request({
        url: `/proBid/${id}`,
        method: 'delete',
    })
}

export function getBidById(id) {
    return request({
        url: `/proBid/${id}`,
        method: 'get',
    })
}

export function getCountInfo(params) {
    return request({
        url: `/proBid/getCountInfo`,
        method: 'get',
        params: params
    })
}

export function update(data) {
    return request({
        url: '/proBid/update',
        method: 'post',
        data: data
    })
}