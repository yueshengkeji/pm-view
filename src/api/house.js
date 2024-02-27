import request from '@/utils/request'

export function insert(data) {
    return request({
        url: 'zujinHouse',
        method: 'put',
        data: data
    })
}

export function update(data) {
    return request({
        url: 'zujinHouse',
        method: 'post',
        data: data
    })
}

export function houseList(query) {
    return request({
        url: 'zujinHouse/list',
        method: 'get',
        params: query
    })
}
export function floors() {
    return request({
        url: 'zujinHouse/floors',
        method: 'get'
    })
}

export function mapJson(floor) {
    return request({
        url: `zujinHouse/houseJson/${floor}`,
        method: 'get'
    })
}