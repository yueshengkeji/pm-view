import request from "@/utils/request";

export function selectCer(str) {
    return request({
        url: `/certificate`,
        method: 'get',
        params: {str: str}
    })
}

export function insertCer(certificate) {
    return request({
        url: `/certificate`,
        method: 'put',
        data: certificate
    })
}

export function deleteCer(id) {
    return request({
        url: `/certificate`,
        method: 'delete',
        params: {id: id}
    })
}

export function updateCer(certificate) {
    return request({
        url: `/certificate/update`,
        method: 'post',
        data: certificate
    })
}

export function selectCoa(str) {
    return request({
        url: `/certificate/selectCof`,
        method: 'get',
        params: {str: str}
    })
}

export function insertStaff(certificate) {
    return request({
        url: `/certificate/insertStaff`,
        method: 'post',
        data: certificate
    })
}

export function deleteStaff(staffId, cerId) {
    return request({
        url: `/certificate/deleteStaff`,
        method: 'delete',
        params: {staffId: staffId, cerId: cerId}
    })
}

export function selectStaffByCer(cerId) {
    return request({
        url: `/certificate/selectStaffByCer`,
        method: 'get',
        params: {cerId: cerId}
    })
}

export function selectCerByCat(catalogue) {
    return request({
        url: `/certificate/selectCerByCat`,
        method: 'post',
        data: catalogue
    })
}

export function overdue(str) {
    return request({
        url: `/certificate/overdue`,
        method: 'get',
        params: {str: str}
    })
}

export function nearOverdue(str) {
    return request({
        url: `/certificate/nearOverdue`,
        method: 'get',
        params: {str: str}
    })
}

export function sinkMsg(staff) {
    return request({
        url: `/certificate/sinkMsg`,
        method: 'post',
        data: staff
    })
}

export function querySinkMsg() {
    return request({
        url: `/certificate/querySinkMsg`,
        method: 'get'
    })
}