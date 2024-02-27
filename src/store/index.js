import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import api from './modules/api'
import menus from './modules/menus'
import showTooltip from './modules/showTooltip'
import axiosToken from './modules/axiosToken'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    api,
    menus,
    showTooltip,
    axiosToken
  },
  getters
})

export default store