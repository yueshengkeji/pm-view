import {getRoot} from "@/api/menu"

function getLocalMenu() {
    let menuStr = localStorage.getItem("menus")
    if (menuStr && menuStr != "") {
        return JSON.parse(menuStr)
    } else {
        return null
    }
}

const routers = {
    state: {
        menus: getLocalMenu(),
        hide: false,
        loadMenu: true,
    },

    mutations: {
        SET_MENU: (state, menus) => {
            localStorage.setItem("menus", JSON.stringify(menus))
            state.menus = menus
            console.log("SET_MENU")
        },
        MENU_HIDDEN: (state, isHidden) => {
            state.hide = isHidden;
        },
        SET_LOAD_MENU: (state, isLoad) => {
            state.loadMenu = isLoad
        }
    },
    actions: {
        // 加载菜单
        loadMenus({commit}) {
            return new Promise((resolve, reject) => {
                getRoot(3).then(menus => {
                    commit('SET_MENU', menus);
                    resolve(menus);
                }).catch(e => {
                    console.log("getRoot menu error", e);
                    reject();
                });
            })
        }
    }
}

export default routers