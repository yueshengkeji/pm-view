import request from '@/utils/request.js'

export function getFiles(messageId, frameId, frameCoding,mobile) {
    return request({
        url: '/files',
        method: 'get',
        params: {flowMessageId: messageId, frameId: frameId, frameCoding: frameCoding,mobile:mobile}
    });
}

export function upload(form) {
    return request.post('/files', form, {'Accept': '*/*', 'Content-Type': 'multipart/form-data',timeout:-1})
}
export function uploadPdf(form) {
    return request.post('/files/uploadPdf', form, {'Accept': '*/*', 'Content-Type': 'multipart/form-data',timeout:-1})
}
export function uploadByBase64(data) {
    return request.put('/files/uploadByBase64', data)
}
export function deleteFile(id){
    return request({
        url:'/files',
        method:'delete',
        params:{id:id}
    })
}
export function dispose(id){
    return request({
        url:`/files/dispose/${id}`,
        method:'get'
    })
}
export function getFile(path){
    return request({
        url:path,
        method:'get'
    })
}
export function downloadFile(filePath,downloadFile){
    return request.get('/files/downloadFile?filePath='+encodeURIComponent(filePath)+"&downloadFile="+downloadFile)
}

export function pdfToImages(filePath){
    return request.get('/files/pdfToImages?filePath='+filePath)
}