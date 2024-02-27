import request from '@/utils/request.js'

/**
 * 获取通知消息列表
 * @returns {*}
 */
export function list(query) {
    return request.get('/notice/list',{params:query})
}

/**
 * 添加通知消息
 * @returns {*}
 */
export function insertInfo(data) {
    return request.put('/notice',data)
}
/**
 * 修改通知消息
 * @returns {*}
 */
export function updateInfo(data) {
    return request.post('/notice',data)
}
/**
 * 删除通知消息
 * @returns {*}
 */
export function deleteInfo(id) {
    return request.delete(`/notice/${id}`)
}
/**
 * 查询通知消息
 * @returns {*}
 */
export function getById(id) {
    return request.get(`/systemInfo/${id}`)
}