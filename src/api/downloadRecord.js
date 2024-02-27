import request from "@/utils/request";

export function selectRecord(str){
    return request({
        url: `/downloadRecord`,
        method: 'get',
        params: {str: str}
    })
}

export function insertRecord(downloadRecord){
    return request({
        url: `/downloadRecord`,
        method: 'put',
        data: downloadRecord
    })
}

export function exportRecord(list){
    return request({
        url: `/downloadRecord/export`,
        method: 'post',
        data: list
    })
}