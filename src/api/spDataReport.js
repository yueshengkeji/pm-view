import http from '@/utils/request'
export default {
    getYearData(data) {
        return http.get('/salesAndPurchaseDataReport/getYearDataReport', {params: data})
    },

    getMonthData(data){
        return http.get('/salesAndPurchaseDataReport/getMonthDataReport', {params: data})
    }
}