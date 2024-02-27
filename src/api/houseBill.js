import manager from '@/utils/manager.js'

/**
 * 获取用户信息
 */
export function getById(id) {
    return manager({
        url: '/house/queryById',
        method: 'get',
        params: {id: id}
    })
}
