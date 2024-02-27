import http from '@/utils/request'

export default {
    addmaterial(data,isFuCai) {
        return http({
            url: `/material/insertByPlanMaterial/${isFuCai}`,
            method: 'put',
            data: data,
            timeout: 300000
        })
    },
    increasematerial(data) {
        return http.put('/material/insertByProjectTask', data)
    },
    getmaterial(data) {
        return http.get('/material/seekMaterial', {params: data})
    },
    newmaterial(data) {
        return http({
            url: '/material/insertMaterial',
            method: 'post',
            data: data,
            timeout: 300000
        })
    },
    deleteFucai(id){
        return http({
            url:`/material/deleteFucai/${id}`,
            method:'delete'
        })
    },
    getStorageList(query){
        return http.get('/material/queryStorage', {params: query})
    },
    getMaterialTotal(query){
        return http.get('/material/listCount', {params: query})
    }
}

export function getById(id) {
    return http({
        url: `/material/${id}`,
        method: 'get',
    })
}

export function getOutHistory(params) {
    return http({
        url: `/material/outHistory`,
        method: 'get',
        params: params
    })
}

export function exportOutHistory(params) {
    return http({
        url: `/material/exportOutHistory`,
        method: 'get',
        params: params
    })
}

export function exportMaterial(params) {
    return http({
        url: `/material/exportMaterial`,
        method: 'get',
        params: params
    })
}