import request from '@/utils/request'

export function logList(params) {
    return request({url: 'systemLog/list', method: 'get', timeout: 3000000, params: params})
}

export function reptileList(query){
    return request.get('reptile/list',{params:query})
}