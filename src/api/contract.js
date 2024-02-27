import request from '@/utils/request'

export function loadById(id) {
    return request({
        url: `/contract/${id}`,
        method: 'get',

    })
}
export function getByCompanyId(id,name,isPay) {
    return request({
        url: `/contract/companyId`,
        method: 'get',
        params:{companyId:id,contractName:name,isPay:isPay}

    })
}

export function getNoPayByCompany(id,name){
    return request({
        url: `/contract/companyId/pay`,
        method: 'get',
        params:{companyId:id,contractName:name}

    })
}

export function getType(){
    return request({
        url:`/contract/type`,
        method:'get'
    })
}

export function getContract(data) {
    return request({
        url:'/contract',
        method:'get',
        params:data
    })
}
export function getContractV2(data) {
    return request({
        url:'/companyIdV2',
        method:'get',
        params:data
    })
}

export function insertContract(data) {
    return request({
        url:'/contract',
        method:'post',
        data:data,
    })
}

export function deleteContract(data) {
    return request({
        url:'/contract',
        method:'delete',
        params:data
    })
}

export function loseContract(data) {
    return request({
        url:'/contract/loseContract',
        method:'post',
        params:data
    })
}

export function getProjectByContract(data) {
    return request({
        url:'/project/getProjectByContract',
        method:'get',
        params:data
    })
}

export function getDetailByContractId(contractId) {
    return request({
        url:`/paymentDetail/contract/${contractId}`,
        method:'get',
    })
}
export function getContractMoney(param) {
    return request({
        url:`/contract/getContractMoney`,
        method:'get',
        params:param
    })
}



export function exportExcel(data) {
    return request({
        url:'/contract/exportExcel',
        method:'get',
        params:data
    })
}