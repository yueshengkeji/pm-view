import request from '@/utils/request'

export function list(query) {
    return request.get('systemConfig/list',{params:query})
}

export function insert(data) {
    return request.put('systemConfig',data)
}

export function update(data) {
    return request.post('systemConfig',data)
}

export function getConfig(coding){
    return request.get(`systemConfig/configList/${coding}`)
}
export function wxConfig(){
    return request.get(`systemConfig/wxConfig`)
}
export function deleteById(id){
    return request.delete(`systemConfig?id=${id}`)
}