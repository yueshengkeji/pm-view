import request from '@/utils/request'

export function getTypeList() {
    return request.get('/taxType')
}