import request from '@/utils/request'

export function getRoot(type) {
    return request({
        url: `/menu/root/${type}`,
        method: 'get',
        // params: {type: type}
    })
}

export function getRoles(menuId) {
    return request({
        url: `/menu/${menuId}`,
        method: 'get'
    })
}

export function getById(menuId) {
    return request({
        url: `/menu/getById/${menuId}`,
        method: 'get'
    })
}


export function deleteRole(relationId) {
    return request({
        url: `/menu/unbind/${relationId}`,
        method: 'delete'
    })
}

export function bindRole(data) {
    return request({
        url: `/menu/bind`,
        method: 'put',
        data: data,
    })
}

export function deleteMenu(id) {
    return request({
        url: `/menu/${id}`,
        method: 'delete'
    })
}

export function updateMenu(menu) {
    return request({
        url: `/menu`,
        method: 'post',
        data: menu
    })
}

export function insertMenu(menu) {
    return request({
        url: `/menu`,
        method: 'put',
        data: menu
    })
}

export function searchMenu(menuName) {
    return request({
        url: `/menu/searchMenu`,
        method: 'get',
        params:{menuName:menuName}
    })
}