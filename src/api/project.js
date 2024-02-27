import request from '@/utils/request.js'

export function search(name) {
    return request({
        url: "/project/search",
        method: "get",
        params: {str: name}
    })
}

export function getById(id) {
    return request({
        url: `/project/getById/${id}`,
        method: 'get'
    })
}

export function getFolder() {
    return request({
        url: `/project/folder`,
        method: 'get'
    })
}

export function getUseMaterialData(id, type) {
    return request({
        url: `/project/getUseMaterial?id=${id}&loadTypes=${type}`,
        method: 'get',
        timeout: 150000
    })
}

export function getProjects(params) {
    return request({
        url: `/project/getProjects`,
        method: 'get',
        params: params,
    })
}

export function deleteProject(id) {
    return request({
        url: `/project`,
        method: 'delete',
        params:{id:id}
    })
}

export function insertProject(project) {
    return request.put("/project", project)
}
//通过项目名称精确查找项目信息
export function getByName(name) {
    return request({
        url: `/project/getByName`,
        method: 'get',
        params: {name:name},
    })
}
//刷新项目材料报表
export function refreshMaterialHistory(id) {
    return request({
        url: `/project/refreshUseMaterial/${id}`,
        method: 'put',
    })
}
//获取项目任务列表
export function taskList(id) {
    return request({
        url: `/project/taskList/${id}`,
        method: 'get',
    })
}
//新增项目任务
export function insertTask(data) {
    return request({
        url: `/project/insertProjectTask`,
        method: 'put',
        data:data
    })
}
//删除项目任务
export function deleteTask(id) {
    return request({
        url: `/project/deleteProjectTask/${id}`,
        method: 'delete',
    })
}
export function getAuthor(id){
    return request.get(`/project/author/${id}`)
}

export function updateAuthor(data){
    return request.post(`/project/updateAuthor`,data)
}
export function downloadApplet(id){
    return request.get(`/project/downloadProjectAuthor/${id}`)
}
export function updateProject(data) {
    return request.post('/project',data)
}

export function getAuth(id) {
    return request.get(`/project/auth/${id}`)
}
export function deleteAuth(id) {
    return request.delete(`/project/auth/${id}`)
}

export function insertAuth(data) {
    return request.post(`/project/auth`,data)
}

export default {
    getProject(searchText) {
        return request.get("/project/search", {params: searchText});
    },
    // 检索已审核的项目列表
    searchByApprove(name) {
        return request({
            url: "/project/searchByApprove",
            method: "get",
            params: {str: name}
        })
    }
}