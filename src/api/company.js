import request from '@/utils/request'

export function list(name) {
    return request({
        url: '/company',
        method: 'get',
        params: {companyName: name}
    })
}


export function listByPage(params) {
    return request({
        url: '/company/list',
        method: 'get',
        params: params
    })
}

export function update(company) {
    return request({
        url: '/company',
        method: 'post',
        data: company
    })
}

export default {
    getCompany(data) {
        return request.get('/company/getCompany', {params: data})
    }
}

export function addCompany(data) {
    return request({
        url: '/company/addCompany',
        method: 'post',
        data: data
    })
}

export function proHistory(params) {
    return request({
        url: '/company/proHistory',
        method: 'get',
        params: params
    })
}

export function putHistory(params) {
    return request({
        url: '/company/putHistory',
        method: 'get',
        params: params
    })
}

export function getPutTotalMoney(params) {
    return request(({
        url: '/company/getPutTotalMoney',
        method: 'get',
        params: params
    }))
}

export function getCompanyById(id) {
    return request({
        url: '/company/getCompanyById',
        method: 'get',
        params: {id: id}
    })
}

export function exportProHistory(params) {
    return request({
        url: '/company/exportProHistory',
        method: 'get',
        params: params
    })

}

export function exportPutHistory(params) {
    return request({
        url: '/company/exportPutHistory',
        method: 'get',
        params: params,
        timeout: -1
    })

}

export function getCompanyByName(name) {
    return request({
        url: '/company/getByName',
        method: 'get',
        params: {companyName: name}
    })
}

export function getCompanyByMaterial({name, model, brand}) {
    return request({
        url: '/company/getByMaterial',
        method: 'get',
        params: {name, model, brand}
    })
}