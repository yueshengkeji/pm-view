import http from '@/utils/request'

export default {
    insertTravelApplication(data){
        return http.put('travelApplication/insertTravelApplication',data);
    },

    getTravelApplicationMSG(data){
        return http.get('travelApplication/getTravelApplicationMSG',{params:data})
    },

    deleteTravelApplication(data){
        return http.put('travelApplication/deleteTravelApplication',data)
    },

    getMonthTravelApplication(data){
        return http.get('travelApplication/getMonthTravelApplication',{params:data})
    },

    exportTravelApplication(data){
        return http.get('travelApplication/exportTravelApplication',{params:data})
    },
    getById(id){
        return http.get(`travelApplication/${id}`)
    },

    updateTravelApplication(data){
        return http.put('travelApplication/updateTravelApplication',data)
    },

    getSearchMSG(data){
        return http.get('travelApplication/getSearchMSG',{params:data})
    }
}