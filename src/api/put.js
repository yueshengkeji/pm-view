import request from '@/utils/request'

export function loadById(id) {
    return request({
        url: `/putStorage/byId/${id}`,
        method: 'get',
    })
}
export function noDetailList(param) {
    return request({
        url: `/putStorage/noDetailList`,
        method: 'get',
        params: param
    })
}

export function initProDetail(proId) {
    return request({
        url: `/putStorage/initProDetail/${proId}`,
        method: 'put',
    })
}

export function genProDetail(proId, putId) {
    return request({
        url: `/putStorage/genProDetail/${proId}/${putId}`,
        method: 'put',
    })
}

export function genPutDetail(putId) {
    return request({
        url: `/putStorage/genProDetail/${putId}`,
        method: 'put',
    })
}

export function partPutProMaterial(data) {
    return request({
        url: `/putStorage/partPutProMaterial`,
        method: 'put',
        data: data
    })
}

export function partPutProMaterialAndSign(data) {
    return request({
        url: `/putStorage/partPutProMaterialAndSign`,
        method: 'put',
        data: data
    })
}

export function getProSign(proId) {
    return request({
        url: `/putStorage/getProSign/${proId}`,
        method: 'get',
    })
}

export function putProMaterial(data) {
    return request({
        url: `/putStorage/putProMaterial`,
        method: 'put',
        data: data
    })
}

export function getPutMoney(startDate, endDate) {
    return request({
        url: `/putStorage/getPutMoney`,
        method: 'get',
        params: {startDate, endDate}
    })
}

export function getPutMoneyByDate(startDate, endDate) {
    return request({
        url: `/putStorage/getPutMoneyByGroup`,
        method: 'get',
        params: {startDate, endDate}
    })
}

export function list(params) {
    return request({
        url: `/putStorage/list`,
        method: 'get',
        params: params
    })
}

export function getPutCount(params) {
    return request({
        url: `/putStorage/getPutCount`,
        method: 'get',
        params: params
    })
}

export function approve(data) {
    return request({
        url: `/putStorage/approve`,
        method: 'post',
        data: data
    })
}

export function deletePut(id) {
    return request({
        url: `/putStorage/${id}`,
        method: 'delete',
    })
}

export function getMaterial(putId) {
    return request({
        url: `/putStorage/material?putStorageId=${putId}`,
        method: 'get',
    })
}

export function queryByPutId(putId) {
    return request({
        url: `/putSign/queryByPutId/${putId}`,
        method: 'get',
    })
}

export function otherPut(data) {
    return request({
        url: `/putStorage/otherPut`,
        method: 'put',
        data: data,
    })
}

export function getMaterByProject(query) {
    return request({
        url: `/putStorage/getMaterByProject/${query.projectId}`,
        method: 'get',
        params: {searchText: query.searchText}
    })
}

export function getMaterByProMaterId(id) {
    return request({
        url: `/putStorage/getByProMaterId/${id}`,
        method: 'get',
    })
}

export function putStorageDetail(materIdArray) {
    return request({
        url: `/putStorage/putHistory`,
        method: 'get',
        params: {materIdArray: materIdArray}
    })
}
export function deletePutSign(id){
    return request.delete(`putSign/${id}`)
}
export function getTotal(param){
    return request({
        url:'/putStorage/getTotal',
        method:'get',
        params:param
    })
}

export function deleteMaterial(putId,materId){
    return request.delete(`putStorage/deleteMaterial/${putId}/${materId}`)
}

export function byProId(proId) {
    return request({
        url: `/putStorage/byProId/${proId}`,
        method: 'get',
    })
}
