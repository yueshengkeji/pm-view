import request from '@/utils/request'

export function list(query) {
    return request.get("/backMater/list", {params:query})
}
export function getById(id) {
    return request.get(`/backMater/${id}`,)
}
export function materList(id) {
    return request.get(`/backMater/materList/${id}`,)
}
export function insert(data) {
    return request.put("/backMater/addBackMater", data)
}
export function deleteBackMater(id) {
    return request.delete(`/backMater/${id}`)
}
export function approve(id,state) {
    return request.post(`/backMater/approve/${id}/${state}`)
}
export function update(data) {
    return request.post(`/backMater/update`,data)
}
export function listMater(query) {
    return request.get("/backMater/history", {params:query})
}
export function getBackTotalMoney(query){
    return request.get("/backMater/getBackTotalMoney",{params:query})
}
export function exportExcel(query) {
    return request.get("/backMater/exportExcel", {params:query})
}