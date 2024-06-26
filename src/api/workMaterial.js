import request from '@/utils/request'
import {CancelToken} from 'axios'

export function list(param) {
    return request.get("workArticle/myList", {params: param})
}
export function downloadList(param) {
    return request.get("workArticle/export", {params: param})
}
export function listAll(param) {
    return request.get("workArticle/list", {params: param})
}
export function exportExcel(param) {
    return request.get("workArticle/exportByStorage", {params: param})
}

export function loadById(id) {
    return request.get(`workArticle/${id}`)
}
let cancel = null
export function loadMater(query) {
    if(cancel != null){
        cancel("重复请求")
    }
    let promise = request.get(`workArticle/getByStorage`, {
        params: query, cancelToken: new CancelToken( (c) => {
            cancel = c;
        })
    })
    promise.finally(()=>cancel = null)
    return promise
}

export function insert(data) {
    return request.put(`workArticle`, data)
}
export function updateMaterial(m) {
    return request.post(`workArticlePut/updateMaterial`, m)
}
export function deleteWorkMaterial(id,materId,forceDel) {
    if(forceDel){
        return request.delete(`workArticle/${id}/${materId}?forceDel=${forceDel}`)
    }else{
        return request.delete(`workArticle/${id}/${materId}`)
    }
}

export function folderList(parent){
    return request.get('workArticlePut/folderList',{params:{parent:parent}})
}
export function updateFolder(data){
    return request.post('workArticlePut/updateFolder',data)
}
export function insertFolder(data){
    return request.put('workArticlePut/insertFolder',data)
}