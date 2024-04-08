import http from '@/utils/request'

export default {
    getOvertimes(data){
        return http.get('/overtimeForm/getOvertimes',{params:data})
    },
    insertOvertime(data){
        return http.put('/overtimeForm/insertOvertime',data)
    },
    deleteOvertime(data){
        return http.put('/overtimeForm/deleteOvertime',data)
    },
    getOverTime(data){
        return http.get('/overtimeForm/getOverTime',{params:data})
    },
    exportOvertime(data){
        return http.get('/overtimeForm/exportOvertime',{params:data})
    }
}