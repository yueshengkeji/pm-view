import r from '@/utils/request'
export function list(query){
    return r.get('saleData/list',{params:query})
}
export function insert(data){
    return r.put('saleData',data)
}
export function exportArray(array){
    return r.put('saleData/export',array)
}
export function deleteById(id){
    return r.delete(`saleData/${id}`)
}
export function moneyTotal(day){
    return r.get(`saleData/moneyTotal`,{params:{day:day}})
}
export function topList(query){
    return r.get(`saleData/topList`,{params:query})
}