import request from '@/utils/request'

export function getDuty(searchText) {
    return request({
        url: '/duty',
        method: 'get',
        params: {str: searchText}
    })
}

export function list() {
    return request({
        url: '/duty/list',
        method: 'get'
    })
}
export function getStaffByDutyId(dutyId) {
    return request({
        url: '/duty/getStaffByDutyId',
        method: 'get',
        params:{dutyId:dutyId}
    })
}
export function deletePerson(dutyId,staffId) {
    return request({
        url: '/duty/deletePerson',
        method: 'delete',
        params:{dutyId:dutyId,staffId:staffId}
    })
}

export function insert(duty) {
    return request({
        url: '/duty',
        method: 'put',
        data:duty
    })
}
export function update(duty) {
    return request({
        url: '/duty',
        method: 'post',
        data:duty
    })
}


export function deleteDuty(id) {
    return request({
        url: '/duty',
        method: 'delete',
        params: {id: id}
    })
}

export function getById(id) {
    return request.get(`duty/${id}`)
}