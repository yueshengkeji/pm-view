const getters = {
    token: state => state.user.token,
    avatar: state => state.user.avatar,
    name: state => state.user.name,
    roles: state => state.user.roles,
    apiUrl: state => state.apiUrl,
    menus: state => state.menus.menus,
    hideMenu: state => state.menus.hide,
    showTooltip:state => state.showTooltip,
    axiosToken: state => state.axiosToken.urlMap
}
export default getters
