import request from '@/utils/request'
export function insert(data){
    return request.put("outCarHistory",data)
}

export function update(data,reAdd){
    return request.post(`outCarHistory/${reAdd}`,data)
}
export function getById(id){
    return request.get(`outCarHistory/${id}`)
}

export function updateParkingCost(data){
    return request.post(`outCarHistory/updateParkingCost`,data)
}

export function list(query)
{
    return request.get("outCarHistory/list",{params:query})
}
export function listGroupProject(query)
{
    return request.get("outCarHistory/listGroupProject",{params:query})
}
export function extraInsert(data) {
    return request.post("outCarHistory/extraInsert",data)

}

export function insertExpense(data)
{
    return request.put('outCarExpense',data)
}
export function getExpenseById(id)
{
    return request.get(`outCarExpense/${id}`)
}
export function getLastData(){
    return request.get("outCarHistory/getLastData")
}

export function listExpense(query){
    return request.get('outCarExpense/list',{params:query})
}
export function detailList(query){
    return request.get('outCarExpense/detailList',{params:query})
}
export function exportDetailList(query){
    return request.get('outCarExpense/exportDetailList',{params:query})
}
export function updateRemark(data){
    return request.post('outCarHistory/updateRemark',data)
}

export function deleteExpense(id)
{
    return request.delete(`outCarExpense/${id}`)
}
