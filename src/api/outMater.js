import request from '@/utils/request'

export function list(query) {
    return request.get("/outMater/list", {params: query})
}
export function outCount(query) {
    return request.get("/outMater/outCount", {params: query})
}
export function recentlyOut() {
    return request.get("/outMater/recentlyOut")
}

export function saveOut(data, isApprove, isSign) {
    return request.put(`/outMater/${isApprove}/${isSign}`, data)
}

export function outMaterList(outId) {
    return request.get(`/outMater/outMaterList/${outId}`)
}
export function approve(data) {
    return request.post(`/outMater/approve/`,data)
}
export function deleteOut(id) {
    return request.delete(`/outMater/${id}`)
}
export function deleteMater(materId) {
    return request.delete(`/outMater/deleteMater/${materId}`)
}
export function getOutByNumber(outNumber){
    return request.get(`/outMater/getOutByNumber/${outNumber}`)
}
export function getById(id){
    return request.get(`/outMater/${id}`)
}
export function getLastOutMater(materId){
    return request.get(`/outMater/getLastOutMater/${materId}`)
}
export function getOutHistoryMoney(param){
    return request.get('/outMater/getOutMaterHistoryMoney',{params:param})
}
export function getOutTotal(param){
    return request.get('/outMater/getTotal',{params:param})
}
export function listByProject(param){
    return request.get('/outMater/listByProject',{params:param})
}