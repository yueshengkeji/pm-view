import request from '@/utils/request'

const url = '/invoice'
// 通过id查询开票信息
export function getById(id) {
    return request.get(url + '/' + id)
}

export function getInvoiceItem(data) {
    return request({
        url:'/invoice/getInvoiceItem',
        method:'get',
        params:data
    })
}


export function getInvoiceFiles(data) {
    return request({
        url:'/invoice/getInvoiceFiles',
        method:'get',
        params:data
    })
}

export function deleteInvoiceFile(data) {
    return request({
        url:'/invoice/deleteInvoiceFile',
        method:'post',
        data:data
    })
}

export function invoiceList(data) {
    return request({
        url:'/invoice/list',
        method:'get',
        params:data
    })
}
export function exportInvoice(data) {
    return request({
        url:'/invoice/export',
        method:'get',
        params:data
    })
}

