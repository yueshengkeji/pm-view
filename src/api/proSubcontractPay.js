import http from '@/utils/request'

export default {
    getProSubcontractPay(data){
        return http.get('/proSubcontractPay/getProSubcontractPays',{params:data})
    },
    exportProSubcontractPays(data){
        return http.get('/proSubcontractPay/exportProSubcontractPays',{params:data})
    },

    insertProSubcontractPay(data){
        return http.post('/proSubcontractPay/insertProSubcontractPay',data)
    },

    deleteProSubcontractPay(data){
        return http.post('/proSubcontractPay/deleteProSubcontractPay',data)
    },

    updateProSubcontractPay(data){
        return http.post('/proSubcontractPay/updateProSubcontractPay',data)
    },

    getById(data){
        return http.get('/proSubcontractPay/getById',{params:data})
    },

    bindFile(data){
        return http.post('/proSubcontractPay/bindFile',data)
    },

    getFiles(data){
        return http.get('/proSubcontractPay/getFiles',{params:data})
    },

    delete(data){
        return http.post('/proSubcontractPay/deleteFile',data)
    },

    getSubcontracts(data){
        return http.get('/proSubcontractPay/getSubContracts',{params:data})
    },

    getPayByContractId(data){
        return http.get('/proSubcontractPay/getPayByContractId',{params:data})
    },
}

