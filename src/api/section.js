import request from '@/utils/request.js'

export function getSections(str) {
    return request({
        url:'/section',
        method:'get',
        params:{str:str}
    })
}
export function list(str){
    return request({
        url:'/section/list',
        method:'get',
        params:{str:str}
    })
}
export function insert(section){
    return request({
        url:'/section',
        method:'put',
        data:section
    })
}
export function update(section){
    return request({
        url:'/section',
        method:'post',
        data:section
    })
}
export function isLeader(){
    return request({
        url:'/section/isLeader',
        method:'get',
    })
}

export function getStaffBySectionId(sectionId) {
    return request({
        url:'/section/getStaffBySectionId',
        method:'get',
        params:{sectionId:sectionId}
    })
}
export function listByParent(parentId) {
    return request({
        url:`/section/parent/${parentId}`,
        method:'get',
    })
}
export function treeList() {
    return request({
        url:`/section/treeList`,
        method:'get',
    })
}