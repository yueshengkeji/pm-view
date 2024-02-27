import http from '@/utils/request'

export default {
    getReports(data){
        return http.get("/proTaskProgressReport/getReports",{params:data})
    },

    insertReport(data){
        return http.post("/proTaskProgressReport/insertReport",data)
    },

    getByProName(data){
        return http.get("/proTaskProgressReport/getByProName",{params:data})
    },

    getById(data){
        return http.get("/proTaskProgressReport/getById",{params:data})
    }
}
