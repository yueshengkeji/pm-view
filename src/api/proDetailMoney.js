import request from '@/utils/request'

export function insert(data) {
    return request.put('detailMoney/owe',data)
}
export function update(data) {
    return request.post('detailMoney',data)
}
export function list(detailId) {
    return request.get('detailMoney/list?detailId='+detailId)
}