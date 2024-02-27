import http from '@/utils/request'

export default {
    getSubcontract(data){
        return http.get('/proSubcontract/getSubcontract',{params:data})
    },

    insertSubcontract(data){
        return http.post('/proSubcontract/insertSubcontract',data)
    },

    updateSubcontract(data){
        return http.post('/proSubcontract/updateSubcontract',data)
    },

    deleteSubcontract(data){
        return http.post('/proSubcontract/deleteSubcontract',data)
    },

    getSubcontractById(data){
        return http.get('/proSubcontract/getSubcontractById',{params:data})
    },

    bindFile(data){
        return http.post('/proSubcontract/bindFile',data)
    },

    getFiles(data){
        return http.get('/proSubcontract/getFiles',{params:data})
    },

    delete(data){
        return http.post('/proSubcontract/deleteFile',data)
    },

}
