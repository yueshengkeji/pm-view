import request from '@/utils/request'

export function insert(data){
    return request.put('fixedApply',data)
}
export function getById(id){
    return request.get(`fixedApply/${id}`)
}
export function detailById(id){
    return request.get(`fixedApply/detailById/${id}`)
}
export function detailList(param){
    return request.get(`fixedApply/detailList`,{params:param})
}
export function deleteDetail(id){
    return request.delete(`fixedApply/deleteDetail/${id}`)
}
export function importList(array){
    return request.put(`fixedApply/list`,array)
}