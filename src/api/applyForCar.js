import http from '@/utils/request.js'

export default {
    getApplyForCar(data){
        return http.get('applyForCar/getApplyForCar',{params:data})
    },

    insertApplyForCar(data){
        return http.put('applyForCar/insertApplyForCar',data)
    },

    exportApplyForCar(data){
        return http.get('applyForCar/exportApplyForCar',{params:data})
    },

    getStatisticByProject(data){
        return http.get('applyForCar/getStatisticByProject',{params:data})
    },

    getStatisticByDriver(data){
        return http.get('applyForCar/getStatisticByDriver',{params:data})
    },

    getProject(data){
        return http.get('project/searchByApprove',{params:data})
    },

    getApplyForCarById(data){
        return http.get('applyForCar/getApplyForCarById',{params:data})
    },

    setDriver(data){
        return http.put('applyForCar/setDriver',data)
    },

    getDriver(data){
        return http.get('role/getDriverStaff',{params:data})
    },

    getDriverTask(data){
        return http.get('applyForCar/getDriverTask',{params:data})
    },

    setMileage(data){
        return http.put('applyForCar/setMileage',data)
    },

    getDriverTaskDone(data){
        return http.get('applyForCar/getDriverTaskDone',{params:data})
    },

    getTaskToDo(){
        return http.get('applyForCar/getTaskToDo')
    }
}