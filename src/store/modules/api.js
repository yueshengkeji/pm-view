import {getConfig} from '@/api/systemConfig'

export default {
    state: {
        apiUrl: null,
        cname:null,
        approveMsgCount:0
    },
    mutations: {
        setApiUrl(state, apiUrl) {
            state.apiUrl = apiUrl;
        },
        setCname(state, cname) {
            state.cname = cname;
        },
        setMsgCount(state,count){
            state.approveMsgCount = count
        }
    },
    actions:{
        loadApiUrl({commit}){
            return getConfig("NOTIFY_IP").then(result=>{
                if(result.id != null){
                    commit('setApiUrl', result.value)
                }
            })
        },
        loadCname({commit}){
            return getConfig("C_NAME").then(result=>{
                if(result && result.value){
                    commit('setCname',result.value)
                }else{
                    commit('setCname',"单位名称")
                }
            }).catch(()=>{
                commit('setCname',"单位名称")
            })
        }
    }
}