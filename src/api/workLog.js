import request from '@/utils/request'

export function insert(log) {
    return request({
        url: 'workLog',
        method: 'put',
        data: log
    })
}

export function update(log) {
    return request({
        url: 'workLog',
        method: 'post',
        data: log
    })
}
export function updateScore(log) {
    return request({
        url: 'workLog/updateScore',
        method: 'post',
        data: log
    })
}

export function updateState(log) {
    return request({
        url: 'workLog/updateState',
        method: 'post',
        data: log
    })
}

export function updateRemark(log) {
    return request({
        url: 'workLog/updateRemark',
        method: 'post',
        data: log
    })
}

export function updateNote(log) {
    return request({
        url: 'workLog/updateNote',
        method: 'post',
        data: log
    })
}

export function logList(log) {
    return request({
        url: 'workLog/list',
        method: 'get',
        params: log
    })
}

export function deleteLog(id) {
    return request({
        url: `workLog/${id}`,
        method: 'delete'
    })
}

export function exportLog(params) {
    return request({
        url: `workLog/export`,
        method: 'get',
        params: params
    })
}

export function getFiles(id) {
    return request({
        url: `workLog/files/${id}`,
        method: 'get'
    })
}

export function notify(staffId) {
    return request({
        url: `workLog/notify/`,
        method: 'get',
        params: {staffId: staffId}
    })
}

export function insertPer(data) {
    return request({
        url: `performance`,
        method: 'put',
        data:data
    })
}

export function insertForScore(data) {
    return request({
        url: `performance/insertScore`,
        method: 'put',
        data:data
    })
}

export function updatePer(data) {
    return request({
        url: `performance`,
        method: 'post',
        data:data
    })
}
export function getPerById(id) {
    return request({
        url: `performance/${id}`,
        method: 'get',
    })
}
export function getPerByScoreId(id) {
    return request({
        url: `performance/getPerByScoreId/${id}`,
        method: 'get',
    })
}
export function getPerList(query){
    return request({
        url:'performance/list',
        method:'get',
        params:query
    })
}
export function exportPer(query){
    return request({
        url:'performance/exportList',
        method:'get',
        params:query
    })
}
export function deletePer(id){
    return request({
        url:`performance/${id}`,
        method:'delete'
    })
}
