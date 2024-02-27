import request from "@/utils/request";

export function selectCat(str) {
    return request({
        url:`/catalogue`,
        method: 'get',
        params: {str: str}
    })
}

export function insertCat(catalogue) {
    return request({
        url:`/catalogue`,
        method: 'put',
        data: catalogue
    })
}

export function deleteCat(catalogue) {
    return request({
        url:`/catalogue`,
        method: 'delete',
        data: catalogue
    })
}

export function updateCat(catalogue) {
    return request({
        url:`/catalogue/update`,
        method: 'post',
        data: catalogue
    })
}

export function getAll() {
    return request({
        url:`/catalogue/all`,
        method: 'get'
    })
}

export function getById(id) {
    return request({
        url: `/catalogue/byId`,
        method: 'post',
        params: {id: id}
    })
}