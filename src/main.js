import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueRouter from 'vue-router'
import router from './router'
import store from './store'
import print from 'vue-print-nb'
import common from './utils/common'
import vueSignaturePad from "vue-signature-pad"

Vue.use(vueSignaturePad)
Vue.use(print)
Vue.use(VueRouter)
Vue.use(common, store)
Vue.config.productionTip = false
//关闭警告日志
new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
