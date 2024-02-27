import http from '@/utils/request'

export default {
    getLogs(data){
        return http.get('salesContractLogs/getLogs',{params:data})
    },
}