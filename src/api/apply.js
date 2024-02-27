import request from '@/utils/request.js'

export function loadById(id, notPro) {
    return request({
        url: '/apply/getById/' + id,
        method: 'get',
        params: {notPro: notPro}
    })
}

export function saveRemark(id, remark) {
    return request({
        url: '/applyMaterial/updateApplyRemark',
        method: 'post',
        data: {id: id, remark: remark}
    })
}

export function list(param) {
    return request({
        url: '/apply',
        method: 'get',
        params: param
    })
}

export function insertApply(data) {
    return request({
        url: '/apply',
        method: 'post',
        data: data
    })
}
export function updateApply(data) {
    return request({
        url: '/apply',
        method: 'put',
        data: data
    })
}
export function updateState(id,state) {
    return request({
        url: `/apply/updateState/${id}?state=`+state,
        method: 'put',
    })
}


export function deleteApply(id) {
    return request({
        url: `/apply/${id}`,
        method: 'delete',
    })
}

export function getApplyMaterMsgByPro(materialId,projectId) {
    return request({
        url: '/apply/getApplyByMater',
        method: 'get',
        params: {materId:materialId,projectId:projectId}
    })
}

export function checkApplyName(applyName) {
    return request({
        url: '/apply/seriesNumber',
        method: 'get',
        params: {seriesNumber:applyName}
    })
}

export function saveNotify(id, notifyDate) {
    return request({
        url: `/apply/updateNotify/${id}?notifyDate=${notifyDate}`,
        method: 'put',
    })
}

export function getApplyMaterial(applyId){
    return request({
        url:'applyMaterial',
        method:'get',
        params:{applyId:applyId}
    })
}

export function getApplyByMaterialId(materialId){
    return request({
        url:`applyMaterial/getApply/${materialId}`,
        method:'get',
    })
}
export function insertProEdit(major){
    return request({
        url:`applyMaterial/insertProEdit/${major}`,
        method:'post',
    })
}
export function getProEditInfo(major){
    return request({
        url:`applyMaterial/isProEdit/${major}`,
        method:'get',
    })
}
export function listByPlanRowId(planRowId){
    return request({
        url:`applyMaterial/listByPlanRowId/${planRowId}`,
        method:'get',
    })
}
