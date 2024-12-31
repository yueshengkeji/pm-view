import request from '@/utils/membersApi'

export function list(query) {
    return request.get("user/notice/list", query)
}

export function queryById(id) {
    return request.get(`user/notice/${id}`)
}

export function deleteNotice(id) {
    return request.delete(`user/notice/${id}`)
}

export function insertInfo(data) {
    return request.put(`user/notice`, data)
}

export function updateInfo(data) {
    return request.post(`/notice`, data)
}