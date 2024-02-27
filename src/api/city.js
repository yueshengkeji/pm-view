import request from '@/utils/request'

export function searchCity(name) {
    return request({
        url:'/address/search',
        method:'get',
        params:{searchText:name}
    })
}