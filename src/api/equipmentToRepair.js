import http from "@/utils/request";

export default {
    insertRepair(data){
        return http.post('equipmentToRepair/insertRepair',data)
    },

    updateRepair(data){
        return http.post('equipmentToRepair/updateRepair',data)
    },

    deleteRepair(data){
        return http.post('equipmentToRepair/deleteRepair',data)
    },

    list(data){
        return http.get('equipmentToRepair/list',{params:data})
    },

    getById(data){
        return http.get('equipmentToRepair/getById',{params:data})
    },

    bindFile(data){
        return http.post('equipmentToRepair/bindFile',data)
    },

    getFiles(data){
        return http.get('equipmentToRepair/getFiles',{params:data})
    },

    deleteFile(data){
        return http.post('equipmentToRepair/deleteFile',data)
    },

    exportRepair(data){
        return http.get('equipmentToRepair/exportRepair',{params:data})
    },

    resultConfirm(data){
        return http.post('equipmentToRepair/resultConfirm',data)
    }
}

