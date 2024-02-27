const axiosToken = {
    state: {
        urlMap: [],
        catchUrl:[]
    },

    mutations: {
        PUT_TOKEN: (state, {url,cancel}) => {
            if(state.catchUrl[url]){
                state.urlMap[url] = cancel
            }
        },
        ADD_URL: (state,url) => {
            state.catchUrl[url] = true
        },
        DELETE_TOKEN: (state,url) => {
            delete state.urlMap[url]
        },
    },

    actions: {
        // 记录请求cancelToken
        PutToken({commit},data) {
            return new Promise(resolve => {
                commit('PUT_TOKEN',data);
                resolve()
            })
        },
        DeleteToken({commit},url){
            return new Promise(resolve => {
                commit('DELETE_TOKEN',url);
                resolve()
            })
        },
        // 设置白名单url
        AddUrl({commit},url) {
            return new Promise(resolve => {
                commit('ADD_URL',url);
                resolve()
            })
        }
    }
}

export default axiosToken