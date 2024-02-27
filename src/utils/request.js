import axios from 'axios'
import store from '@/store'
import {getToken} from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import router from '@/router/index'
import * as dd from "dingtalk-jsapi";

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: "/api/api",
    // 超时
    timeout: 30000
})
const toLogin = () => {
    let path;
    if (router.history.pending != null) {
        path = router.history.pending.path
    } else {
        path = router.history.current.path
    }
    if (path != null && path.indexOf(":") != -1) {
        path = path.substr(0, path.indexOf(":"))
    }
    if (path !== "/login") {
        store.state.showTooltip.show = false
        sessionStorage.setItem("redirectPath", path);
        router.replace({path: '/login?redirect=' + path}).catch(e => {
            console.log("ignore error", e)
        })
    }
}
//登录过期统一处理
let timeout = -1
const loginOut = () => {
    if (dd.env.platform == "notInDingTalk") {
        if (sessionStorage.getItem("requestClearTimeout") == null) {
            window.clearTimeout(timeout)
            timeout = window.setTimeout(() => {
                toLogin()
            }, 100)
            sessionStorage.setItem("requestClearTimeout", timeout)
        }
        // store.state.showTooltip.snackbarMsg = "登录信息过期，请重新登录"
        // store.state.showTooltip.snackbar = true
        // store.state.showTooltip.back = toLogin
    }
}
// request拦截器
service.interceptors.request.use(config => {
    // 是否需要设置 token
    let url = config.url;
    let CancelToken = axios.CancelToken
    const isToken = (url == "/user-login"
        || url == "/weixiuApi/ext"
        || url == "/user-loginV2"
        || url.indexOf("/procurement/expressCode") != -1
        || url == "/dingTalk/dingLogin"
        || url == "/dingTalk/getCorpId"
        || url == "/dingTalk/dingBind"
        || url.indexOf("/proQuote/getQuote") != -1
        || url.indexOf("systemConfig/wxConfig") != -1
        || url.indexOf("bindOpenId") != -1
        || url.indexOf("wxBind") != -1
        || url.indexOf("wx/getOpenId") != -1
        || url.indexOf("wx/getOpenIdV2") != -1
        || url.indexOf("/staff/getStaffByToken") != -1
        || url.indexOf("/staff/getStaffByTokenV2") != -1
        || url.indexOf("/proQuote/insertQuote") != -1)
        ? false : true;
    if (isToken) {
        let token = getToken();
        if (token == null) {
            store.dispatch("FedLogOut").then(loginOut);
        } else {
            config.headers['accept-token'] = token // 让每个请求携带自定义token 请根据实际情况自行修改
        }
    }

    //添加cancelToken标识
    config.cancelToken = new CancelToken(function executor(cancel) {
        store.dispatch("PutToken", {url: url, cancel: cancel})
        // Vue.prototype.$currentHttpRequestList.set(config.url, c);
    })

    return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
        let url = res.config.url.replace(res.config.baseURL, "")
        store.dispatch('DeleteToken', url)
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200;
        // 获取错误信息
        const msg = res.data.msg || errorCode[code] || errorCode['default']
        if (code === 401) {
            return Promise.reject(res)
        } else if (code === 402) {
            //token过期,退回到登陆界面
            console.log("登录信息过期")
            // store.dispatch("FedLogOut").then(loginOut);
        } else if (code === 500) {
            console.log("msg + \"\"", msg + "")
            if (((msg + "").indexOf("SQLServerException") !== -1 || (msg + "").indexOf("null") === -1) && msg !== "") {
                store.state.showTooltip.snackbarMsg = msg
                store.state.showTooltip.snackbar = true
            }
            // console.log("异常消息", 500, msg);
            return Promise.reject(new Error(msg))
        } else if (code !== 200) {
            return Promise.reject('error')
        } else {
            try {
                return res.data.data;
            } catch (e) {
                return null
            }
        }
    },
    (error, res, param) => {
        console.log("request error = ", error.response, res, param, this)
        if (error.response.status == 402) {
            //token过期,跳转到登录界面
            store.dispatch("FedLogOut").then(loginOut).catch(e => {
                console.log("FedLogOut error", e)
            });
        } else {
            return Promise.reject(error.response.data)
        }

    }
)

export default service
