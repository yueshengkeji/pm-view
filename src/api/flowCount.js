import request from "@/utils/request";
export function list(params){
    return request.get('flowCount/list',{params:params})
}
export function exportArray(data){
    return request.put("/flowCount/array",data)
}

export function insert(data){
    return request.put("/flowCount",data)
}

export function deleteById(id){
    return request.delete(`/flowCount/${id}`)
}

export function moneyTotal(day){
    return request.get(`/flowCount/total?day=`+day)
}
