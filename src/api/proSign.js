import request from '@/utils/request'

export function listSign(query) {
    return request({
        url: '/putSign/list',
        method: 'get',
        params: query
    })
}

export function myList(query) {
    return request({
        url: '/putSign/myList',
        method: 'get',
        params: query
    })
}

export function wxNotify(sign) {
    return request({
        url: '/putSign/wxNotify',
        method: 'post',
        data: sign
    })
}

export function cancel(id) {
    return request({
        url: `/putSign/${id}`,
        method: 'delete',
    })
}

export function queryByPutMaterId(putMaterIds) {
    return request({
        url: `/putSign/queryByPutMaterId`,
        method: 'get',
        params: {putMaterIds: putMaterIds}
    })
}


export function queryById(id) {
    return request({
        url: `/putSign/put/${id}`,
        method: 'get',
    })
}

export function sign(data) {
    return request({
        url: `/putSign/sign`,
        method: 'post',
        data: data
    })
}

export function outSign(data) {
    return request({
        url: `/putSign/outSign`,
        method: 'post',
        data: data
    })
}


export function queryOutById(id) {
    return request({
        url: `/putSign/out/${id}`,
        method: 'get',
    })
}

export function getByProId(id) {
    return request({
        url: `/putSign/${id}`,
        method: 'get',
    })
}

export function getListByProId(id){
    return request({
        url:`/putSign/list/${id}`,
        method:'get'
    })
}