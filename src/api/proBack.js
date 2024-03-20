import req from '@/utils/request'

export function insert(data) {
    return req.put('proBack', data)
}

export function list(params) {
    return req.get('proBack/list', {params: params})
}
export function loadById(id) {
    return req.get(`proBack/${id}`)
}
export function deleteById(id) {
    return req.delete(`proBack/${id}`)
}