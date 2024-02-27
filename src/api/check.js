import request from '@/utils/request'

export function list(query) {
    return request.get("checkMater/list",{params:query})
}

export function listMater(checkId) {
    return request.get(`checkMater/listMater/${checkId}`)
}

export function materHistory(query) {
    return request.get(`checkMater/history`,{params:query})
}
export function getCheckTotalMoney(query){
    return request.get('/checkMater/getCheckTotalMoney',{params:query})
}
export function exportExcel(query) {
    return request.get(`checkMater/downloadHistory`,{params:query})
}

export function insert(data) {
    return request.put("checkMater",data)
}

export function update(data) {
    return request.post("checkMater",data)
}

export function approve(data) {
    return request.post(`checkMater/approve`,data)
}

export function deleteCheck(id) {
    return request.delete(`checkMater/${id}`)
}
