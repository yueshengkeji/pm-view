import request from '@/utils/request'

export function searchRoles(value) {
    return request({
        url: '/role',
        method: 'get',
        params: {str: value}
    })
}

export function getRoles(token) {
    return request({
        url: '/role/getRolesByToken',
        method: 'get',
        params: {token: token}
    })
}
export function getRoleUsers(roleId) {
    return request({
        url: `/role/getStaffByRole`,
        method: 'get',
        params:{roleId:roleId}
    })
}
export function insertStaff(role) {
    return request({
        url: `/role/insertStaff`,
        method: 'put',
        data:role
    })
}
export function deleteStaff(staffId,coding) {
    return request({
        url: `/role/deleteStaff`,
        method: 'delete',
        params: {staffId:staffId,coding:coding}
    })
}
export function deleteRole(coding) {
    return request({
        url: `/role`,
        method: 'delete',
        params: {coding:coding}
    })
}
export function insertRole(role){
    return request({
        url: `/role`,
        method: 'put',
        data: role
    })
}

export function update(role) {
    return request({
        url: `/role/update`,
        method: 'post',
        data: role
    })
}

export function getById(id) {
    return request.get(`role/getById/${id}`)
}