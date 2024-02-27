import http from '@/utils/request'

export default {
    getPurchaseContract(data){
        return http.get('/purchaseContract/getPurchaseContract',{params:data});
    },
    insertPurchaseContract(data){
        return http.put('/purchaseContract/insetPurchaseContract',data);
    },
    updatePurchaseContract(data){
        return http.put('/purchaseContract/updatePurchaseContract',data);
    },
    deletePurchaseContract(data){
        return http.put('/purchaseContract/deletePurchaseContract',data);
    },
    getPurchaseContractIsExist(data){
        return http.get('/purchaseContract/getPurchaseContractIsExist',{params:data});
    },
    showPurchaseFiles(data){
        return http.get('/purchaseContract/showPurchaseFiles',{params:data});
    },
    deletePurchaseFile(data){
        return http.put('purchaseContract/deletePurchaseFile',data);
    },
    getPurchaseCollect(data){
        return http.get('/purchaseContract/getPurchaseCollect',{params:data});
    },
    insertPurchaseCollect(data){
        return http.put('/purchaseContract/insertPurchaseCollect',data);
    },
    deletePurchaseCollect(data){
        return http.put('/purchaseContract/deletePurchaseCollect',data);
    },
    getPurchasePay(data){
        return http.get('/purchaseContract/getPurchasePay',{params:data});
    },
    insertPurchasePay(data){
        return http.put('/purchaseContract/insertPurchasePay',data);
    },
    deletePurchasePay(data){
        return http.put('/purchaseContract/deletePurchasePay',data);
    },
    checkStatus(data){
        return http.put('/purchaseContract/checkStatus',data);
    },
    monthPurchaseContract(data){
        return http.get('/purchaseContract/monthPurchaseContract',{params:data});
    },
    getSearchContract(data){
        return http.get('/purchaseContract/getSearchContract',{params:data});
    },

}