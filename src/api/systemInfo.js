import request from '@/utils/request'

export function getDataById(id) {
    return request({
        url: `/systemInfo/${id}`,
        method: 'get'
    })
}


export function list(param) {
    return request({
        url: `/systemInfo/list`,
        method: 'get',
        params: param
    })
}

export function read(id) {
    return request({
        url: `/systemInfo/read/${id}`,
        method: 'post',
    })
}

export function saveError(msg) {
    return request.put('systemInfo/saveDesktopError?msg=' + msg)
}