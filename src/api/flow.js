import request from '@/utils/request'

//获取流程列表
export function list(params) {
    return request.get("usedFlow",{params:params})
}
//获取流程目录列表
export function folderList(params) {
    return request.get("usedFlow/getFolderAll",{params:params})
}
//添加流程
export function insertFlow(flow) {
    return request.put("usedFlow",flow)
}
//修改流程
export function updateFlow(flow) {
    return request.post("usedFlow",flow)
}
//删除流程
export function deleteFlow(id) {
    return request.delete(`usedFlow/${id}`)
}
