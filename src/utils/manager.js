import axios from 'axios'
import store from '@/store'
import {getToken} from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import router from '@/router/index'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: "/managent",
    // 超时
    timeout: 10000
})
//登录过期统一处理
const loginOut = ()=>{
    store.state.showTooltip.msg = "登录信息过期，请重新登录"
    store.state.showTooltip.show = true
    store.state.showTooltip.back = ()=>{
        store.state.showTooltip.show = false
        router.replace({path: '/login'}).catch(e => {
            console.log("ignore error", e)
        })
    }
}
// request拦截器
service.interceptors.request.use(config => {
    // 是否需要设置 token
    let url = config.url;
    const isToken = url == "/user-login" ? false : true;
    if (isToken) {
        let token = getToken();
        if (token == null) {
            store.dispatch("FedLogOut").then(loginOut);
        } else {
            config.headers['accept-token'] = token
            if (config.params == null) {
                config.params = {token: token}
            } else {
                config.params['token'] = token
            }
        }
    }

    return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200;
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        if (code === 401) {
            return Promise.reject(res)
        } else if (code === 500) {
            console.log("异常消息", 500, msg);
            return Promise.reject(new Error(msg))
        } else if (code !== 200) {
            return res.data;
        } else {
            return res.data;
        }
    },
    error => {
        if ((error + "").indexOf("402") !== -1) {
            //未传递token,退回到登陆界面
            store.dispatch("FedLogOut").then(loginOut);
        } else {
            return Promise.reject(error)
        }

    }
)

export default service
