import request from '@/utils/request'

export function list(params) {
    return request.get('sysJob/list',{params:params})
}
export function getById(id) {
    return request.get(`sysJob/${id}`)
}
export function deleteSysJob(id) {
    return request.delete(`sysJob/${id}`)
}

export function updateJob(data) {
    return request.post(`sysJob`,data)
}
export function insertJob(data) {
    return request.put(`sysJob`,data)
}
export function logList(params) {
    return request.get('sysJob/logList',{params:params})
}
