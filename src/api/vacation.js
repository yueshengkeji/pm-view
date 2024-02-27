import request from '@/utils/request'

let url = "/vacation"
export function getById(id) {
    return request({
        url:`${url}/getById/${id}`,
        method:'get'
    })
}


export default {
    /**
     * 获取我的请假单列表
     */
    loadMyVacationData() {
        return request.get(url);
    },
    /**
     * 删除请假单
     * @param id
     * @returns {*}
     */
    deleteVacation(id) {
        return request.delete(url + "/" + id);
    },
    /**
     * 添加请假单
     * @param vacation
     * @returns {*}
     */
    addVacation(vacation) {
        return request.post(url, vacation);
    },
    list(query){
        return request.get(url+"/all",{params:query})
    },
    exportExcel(query){
        return request.get(url+"/export",{params:query})
    }
}