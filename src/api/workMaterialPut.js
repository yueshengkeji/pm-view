import request from '@/utils/request'

export function list(param) {
    return request.get("workArticlePut/list",{params:param})
}
export function insert(data) {
    return request.put("workArticlePut",data)
}
export function delHandler(id){
    return request.delete(`workArticlePut/delete/${id}`)
}
export function getById(data) {
    return request.get('workArticlePut/getById',{params:data})
}
