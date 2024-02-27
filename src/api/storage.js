import request from '@/utils/request'

export function storageList() {
    return request({
        url:'storage/list',
        method:'get'
    })
}
export function putStorage(data) {
    return request({
        url:'storage',
        method:'put',
        data:data
    })
}