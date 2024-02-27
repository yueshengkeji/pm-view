import request from '@/utils/request.js'

/**
 * 获取待审批消息
 */
export function getApproveList(searchText, userId, pageNumber, pageSize) {
    return request({
        url: "/myApprove",
        method: "get",
        params: {
            pageNumber: pageNumber,
            pageSize: pageSize,
            searchText: searchText,
            userId: userId
        }
    })
}

/**
 * 获取已审批消息
 */
export function getOkApproveList(searchText, userId, pageNumber, pageSize, fqFlag) {
    return request({
        url: "/myApprove/consent",
        method: "get",
        params: {
            pageNumber: pageNumber,
            pageSize: pageSize,
            searchText: searchText,
            userId: userId,
            fqFlag: fqFlag
        }
    })
}

/**
 * 获取知会我的消息
 */
export function getNotifyMy(searchText, userId, pageNumber, pageSize, fqFlag,status) {
    return request({
        url: "/myApprove/notifyMy",
        method: "get",
        params: {
            pageNumber: pageNumber,
            pageSize: pageSize,
            searchText: searchText,
            userId: userId,
            fqFlag: fqFlag,
            status:status
        }
    })
}

/**
 * 获取我的知会消息
 */
export function getINotify(searchText, userId, pageNumber, pageSize, fqFlag) {
    return request({
        url: "/myApprove/iNotify",
        method: "get",
        params: {
            pageNumber: pageNumber,
            pageSize: pageSize,
            searchText: searchText,
            userId: userId,
            fqFlag: fqFlag
        }
    })
}

/**
 * 获取审批消息步骤集合
 * @param flowMessageId
 */
export function getApproveSteps(flowMessageId) {
    return request({
        url: "/flowApprove",
        method: "get",
        params: {
            flowMessageId: flowMessageId
        }
    })
}
/**
 * 获取审批消息步骤记录集合
 * @param flowMessageId
 */
export function getApproveRecord(flowMessageId) {
    return request({
        url: "/flowApprove/record",
        method: "get",
        params: {
            flowMessageId: flowMessageId
        }
    })
}

export function getMessageByFrameId(frameId) {
    return request({
        url: `/usedFlowInstance/getByFrameId/${frameId}`,
        method: "get",
    })
}

/**
 * 审批通过
 * @param flowApprove 审批消息对象
 * @param fqFalg 是否分期支付同意
 */
export function consent(flowApprove, fqFlag) {
    return request({
        url: `/myApprove/consent/${fqFlag}`,
        method: "post",
        data: flowApprove,
        timeout:200000,
    })
}

/**
 * 自由选人审批通过
 * @param flowApprove
 * @param fqFlag
 */
export function selectPersonConsent(flowApprove, flowCourse) {
    return request({
        url: `/myApprove/freeConsent`,
        method: "post",
        data: {approve: flowApprove, flowCourse: flowCourse}
    })
}

/**
 * 追加审批意见
 * @param flowApprove
 */
export function appendConsent(flowApprove) {
    return request({
        url: `/myApprove/appendConsent`,
        method: "post",
        data: flowApprove
    })
}

/**
 * 知会人员
 * @param staffList
 * @param approveId
 */
export function notify(staffList, approveId) {
    return request({
        url: `/myApprove/notify/${approveId}`,
        method: "post",
        data: staffList
    })
}

/**
 * 撤回审批
 * @param approve
 */
export function recall(approve) {
    return request({
        url: `/myApprove/recall`,
        method: "post",
        data: approve
    })
}

/**
 * 驳回
 * @param approve
 */
export function breakFlow(approve) {
    return request({
        url: `/myApprove/breakFlow`,
        method: "post",
        data: approve
    })
}

/**
 * 已读
 * @param approve
 */
export function read(approve) {
    return request({
        url: `/myApprove/read`,
        method: "post",
        data: approve
    })
}
/**
 * 标记所有为已读
 * @param approve
 */
export function readAll() {
    return request({
        url: `/myApprove/readAll`,
        method: "post"
    })
}

export function backFLowMessage(messageId) {
    return request({
        url: `/usedFlowInstance/backFLowMessage/${messageId}`,
        method: 'post',
    })
}
export function getApproveById(id) {
    return request({
        url: `/flowApprove/${id}`,
        method: 'get',
    })
}

export function appendApprove(id,persons){
    return request({
        url:`/myApprove/appendApprove/${id}`,
        method:'post',
        data:persons
    })
}

export function notifyMyNoReadCount(){
    return request({
        url:`/myApprove/notifyMyNoReadCount`,
        method:'get'
    })
}