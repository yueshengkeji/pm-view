import request from '@/utils/request.js'

export function loadById(id, onLoadApply) {
    return request({
        url: '/procurement/getById/' + id,
        method: 'get',
        params: {noLoadApply: onLoadApply || false}
    })
}

export function getApplyDelete() {
    return request({
        url: '/procurement/getApplyDeleteAll',
        method: 'get'
    })
}

export function deleteProcurementByApply(applyDelete) {
    return request({
        url: '/procurement/updateApplyDeleteState',
        method: 'post',
        data: applyDelete
    })
}

export function cancelApplyDelete(applyDelete) {
    return request({
        url: '/procurement/cancelApplyDeleteState',
        method: 'post',
        data: applyDelete
    })
}

export function listPro(param) {
    return request({
        url: '/procurement',
        method: 'get',
        params: param
    })
}

export function getApproveImg(id) {
    return request({
        url: `procurement/getApproveFlag/${id}`,
        method: 'get',
    })
}

export function updateDownloadState(id) {
    return request({
        url: `procurement/updateApproveFlag/${id}`,
        method: 'put',
    })
}

export function returnToApply(pmList) {
    return request({
        url: 'procurementMaterial/returnToApply',
        method: 'post',
        data: pmList
    })
}

export function noDhList(params) {
    return request({
        url: 'procurementMaterial/noDhList',
        method: 'get',
        params: params
    })
}

//查找项目材料采购订单列表
export function listByProject(projectId, materId) {
    return request({
        url: `/procurement/${projectId}/${materId}`,
        method: 'get',
    })
}

//查找材料历史采购单价
export function procurementMaterialHistory(name, model, brand, size) {
    return request({
        url: '/procurementMaterial/price',
        method: 'get',
        params: {name: name, model: model, brand: brand, size: size}
    })

}

//查找材料历史采购单价
export function listByApplyMaterial(applyMaterialId) {
    return request({
        url: `/procurement/listByApplyMaterial/${applyMaterialId}`,
        method: 'get',
    })
}

//获取未入库的材料信息
export function noPutMaterial(id) {
    return request({
        url: `/procurementMaterial/noPut?proId=${id}`,
        method: 'get',
    })
}

export function getProByContract(data) {
    return request({
        url: '/procurement/getProByContract',
        method: 'get',
        params: data
    })
}

export function deletePro(id) {
    return request({
        url: `/procurement/delete?id=${id}`,
        method: 'delete',
    })
}

export function applyDelete(data) {
    return request({
        url: `/procurement/applyDelete`,
        method: 'put',
        data: data,
    })
}

export function getApplyDeleteByProId(proId) {
    return request({
        url: `/procurement/getApplyDeleteByProId/${proId}`,
        method: 'get',
    })
}

export function cancelApplyDeleteState(data) {
    return request({
        url: `/procurement/cancelApplyDeleteState`,
        method: 'post',
        data: data
    })
}

export function updateContract(data) {
    return request({
        url: `/procurement/updateContract`,
        method: 'put',
        data: data,
    })
}

export function setPutAll(id) {
    return request({
        url: `/procurement/setPutAll/${id}`,
        method: 'put',
    })
}

export function expressCode(data) {
    return request({
        url: `/procurement/expressCode/${data.id}`,
        method: 'put',
        data: data
    })
}

export function getAllMaterial(proId, lap) {
    return request({
        url: `/procurementMaterial?proId=${proId}&lap=${lap}`,
        method: 'get',
    })
}

export function exportExcel(data) {
    return request({
        url: `/procurement/exportExcel`,
        method: 'put',
        data: data
    })
}

export function getProMoneyByDate(startDate, endDate) {
    return request({
        url: `/procurementMaterial/getProMoneyByDate`,
        method: 'get',
        params: {startDate, endDate}
    })
}

export function insert(data) {
    return request({
        url: '/procurement',
        method: 'post',
        data: data,
        timeout: -1
    })
}

export function update(data) {
    return request({
        url: '/procurement',
        method: 'put',
        data: data,
        timeout: -1
    })
}

export function materialList(params) {
    return request({
        url: 'procurementMaterial/list',
        method: 'get',
        params: params
    })
}

export function exportMaterialList(params) {
    return request({
        url: 'procurementMaterial/exportList',
        method: 'get',
        params: params
    })
}

export function updateProState(id) {
    return request({
        url: `procurement/updateProState/${id}`,
        method: 'post'
    })
}

export function updateState(data) {
    return request({
        url: `procurement/updateState`,
        method: 'post',
        data: data
    })
}

export function loadTotal(param) {
    return request({
        url: '/procurement/getCount',
        method: 'get',
        params: param
    })
}