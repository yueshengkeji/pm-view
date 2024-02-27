import request from '@/utils/request.js'

export function list(params) {
    return request({
        url:'/enquiry/list',
        method:'get',
        params:params,
    })
}
export function closeEnquiry(state,id) {
    return request({
        url:'/enquiry/closeEnquiry',
        method:'post',
        params: {state:state,id:id},
    })
}

/**
 * 获取报价材料列表
 * @param id
 */
export function queryQuote(id) {
    return request({
        url:'/proQuote/list',
        method:'get',
        params: {enquiryId:id},
    })
}

/**
 * 发布询价
 * @param data
 */
export function insertEnquiry(data){
    return request({
        url:'/enquiry',
        method:'put',
        data:data
    })
}

/**
 * 获取询价单
 * @param data
 */
export function getQuote(enquiryId) {
    return request({
        url:'/proQuote/getQuote/' + enquiryId,
        method:'get',
    })
}

/**
 * 提交报价
 * @param data
 */
export function insertQuote(data) {
    return request({
        url:'/proQuote/insertQuote',
        method:'post',
        data
    })
}
