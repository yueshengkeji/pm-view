import request from '@/utils/request'

export function list(query) {
    return request.get("/applyDine/list", {params:query})
}
export function insert(data) {
    return request.put("/applyDine", data)
}
export function deleteDine(id) {
    return request.delete(`/applyDine/${id}`)
}
export function updateDine(data) {
    return request.post(`/applyDine`,data)
}
export function getById(id) {
    return request.get(`/applyDine/${id}`)
}