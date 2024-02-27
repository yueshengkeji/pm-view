import request from '@/utils/request'

export default {
    getFlowByCoding(coding) {
        return request.get("/usedFlow/getByCoding", {params: {coding}});
    },
    getFLowByName(name) {
        return request.get("/usedFlow/getByName", {params: {name: name}});
    },
    getFlowByArticleFolder(folderId) {
        return request({
            url: `/usedFlow/getFlowByModule/${folderId}`,
            method: 'get'
        })
    },
    startFlow(flowModal) {
        return request.put("/usedFlowInstance/startFlow", flowModal);
    },
}

export function list(query) {
    return request({
        url: '/usedFlowInstance/list',
        method: 'get',
        params: query
    })
}
export function getMessageByFrameId(frameId) {
    return request({
        url: `/usedFlowInstance/getByFrameId/${frameId}`,
        method: 'get',
        params: {}
    })
}

export function deleteMsg(id) {
    return request({
        url: `/usedFlowInstance/${id}`,
        method: 'delete',
    })
}

export function getFlowStateByFrame(frameId) {
    return request({
        url: `/usedFlowInstance/getFlowStateByFrame/${frameId}`,
        method: 'get',
    })
}
export function updateState(message) {
    return request({
        url: `/usedFlowInstance/updateState`,
        method: 'post',
        data:message
    })
}
export function reNotify(message){
    return request({
        url:'/usedFlowInstance/reNotify',
        method:'post',
        data:message
    })
}
