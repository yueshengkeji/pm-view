import http from '@/utils/request'

export default {
    getSearchContract(data){
        return http.get('/salesContract/getSearchContract',{params:data})
    },

    getSalesContract(data){
        return http.get('/salesContract/getSalesContract', {params:data})
    },

    getSalesContractIsExist(data){
        return http.get('/salesContract/getSalesContractIsExist',{params:data})
    },

    insertSalesContract(data){
        return http.put('/salesContract/insertSalesContract',data)
    },

    updateSalesContract(data){
        return http.put('/salesContract/updateSalesContract',data)
    },

    deleteSalesContract(data){
        return http.put('/salesContract/deleteSalesContract',data)
    },

    getInvoice(data){
        return http.get('/salesContract/getInvoice',{params:data})
    },

    insertInvoice(data){
        return http.put('/salesContract/insertInvoice',data)
    },

    deleteInvoice(data){
        return http.put('/salesContract/deleteInvoice',data)
    },

    getCollect(data){
        return http.get('/salesContract/getCollect',{params:data})
    },

    insertCollect(data){
        return http.put('/salesContract/insertCollect',data)
    },

    deleteCollect(data){
        return http.put('/salesContract/deleteCollect',data)
    },

    checkStatus(data){
        return http.put('/salesContract/checkStatus',data)
    },

    getMonthSalesContract(data){
        return http.get('/salesContract/monthSalesContract',{params:data})
    },

    showSalesFiles(data){
        return http.get('/salesContract/showSalesFiles',{params:data})
    },

    deleteSalesFile(data){
        return http.put('/salesContract/deleteSalesFile', data)
    },

    downloadFile(data){
        return http.get('/files/downloadFile',data)
    },

    getMonthInvoiceMSG(data){
        return http.get('/salesContract/getMonthInvoiceMSG',{params:data})
    },

    getAgreementMSG(data){
        return http.get('/salesContract/getAgreementMSG',{params:data})
    },

    exportInvoice(data){
        return http.get('salesContract/exportInvoice',{params:data})
    },

    getMySalesContract(data){
        return http.get('salesContract/getMySalesContracts',{params:data})
    },
    getMonthSalesContractMSG(data){
        return http.get('salesContract/getMonthSalesContractMSG',{params:data})
    },
    updateDate(data){
        return http.post('salesCollect/updateDate',data)
    },
    getMonthInvoiceMSGChecked(data){
        return http.get('salesContract/getMonthInvoiceMSGChecked',{params:data})
    },
    exportInvoiceChecked(data){
        return http.get('salesContract/exportInvoiceChecked',{params:data})
    },
    searchInvoice(data){
        return http.get('salesContract/searchInvoice',{params:data})
    },
    searchInvoiceChecked(data){
        return http.get('salesContract/searchInvoiceChecked',{params:data})
    },
    updateNotify(){
        return http.post('salesCollect/onNotify')
    },
    getTax(data){
        return http.get('salesContract/getTax',{params:data})
    },
    insertTax(data){
        return http.put('salesContract/insertTax',data)
    },
    deleteTax(data){
        return http.put('salesContract/deleteTax',data)
    },
    insertManager(data){
        return http.put('salesContract/insertManager',data)
    },
    deleteManager(data){
        return http.put('salesContract/deleteManager',data)
    },
    getManagers(data){
        return http.get('salesContract/getManagers',{params:data})
    },
    getSalesContractByManager(data){
        return http.get('salesContract/getSalesContractByManager',{params:data})
    },
    getTotalPercentByTax(data){
        return http.get('salesContract/getTotalPercentByTax',{params:data})
    },
    updateCollectMoney(data){
        return http.post('salesCollect/updateCollectMoney',data)
    },
    fixedAssetsStatusChange(data){
        return http.post('salesCollect/fixedAssetsStatusChange',data)
    },
    getByCompany(data){
        return http.get('salesCollect/getByCompany',{params:data})
    },
    getProjectMap(){
        return http.get('salesContract/getProjectMap')
    },
    setProjectMap(){
        return http.post('salesContract/setProjectMap')
    }
}
