import request from '@/utils/request'

export function getById(id){
    return request.get(`/tdc/${id}`)
}