import request from '@/utils/request'

export function proDetailDpList(detailCId) {
    return request.get(`proDetailDp/proDetailDpList/${detailCId}`)
}
export function insert(data) {
    return request.put('proDetailDp',data)
}
export function update(data) {
    return request.post('proDetailDp/updateState',data)
}

export function getMoneyCount(detailCId) {
    return request({
        url:`proDetailDp/getMoneyCount/${detailCId}`,
        method:'get',
    })
}