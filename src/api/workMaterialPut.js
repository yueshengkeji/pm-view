import request from '@/utils/request'

export function list(param) {
    return request.get("workArticlePut/list",{params:param})
}
export function insert(data) {
    return request.put("workArticlePut",data)
}
