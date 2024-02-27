import request from '@/utils/request.js'

/**
 * 获取地区列表
 * @returns {*}
 */
export function loadRegion(searchText) {
    return request.get('/region',{params:{searchText}})
}

/**
 * 添加地区
 * @returns {*}
 */
export function insertRegion(data) {
    return request.post('/region',data)
}