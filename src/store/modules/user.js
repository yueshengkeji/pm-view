import {logout, pwdLogin} from "@/api/login";
import {getUserInfo, loginByOpenId} from '@/api/user'
import {getRoles} from '@/api/role'
import {getToken, removeToken, setToken} from "@/utils/auth";

const user = {
    state: {
        token: getToken(),
        name: localStorage.getItem("SET_NAME"),
        id: localStorage.getItem("SET_ID"),
        sectionName: localStorage.getItem("sectionName"),
        sectionId: localStorage.getItem("sectionId"),
        sectionCoding: localStorage.getItem("sectionCoding"),
        coding: localStorage.getItem("SET_CODING"),
        avatar: sessionStorage.getItem("SET_AVATAR"),
        roles: localStorage.getItem("SET_ROLES"),
        leader: localStorage.getItem('sectionLeader'),
    },

    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token
            setToken(token);
        },
        SET_ID: (state, id) => {
            state.id = id
            localStorage.setItem("SET_ID", id);
        },
        SET_NAME: (state, name) => {
            state.name = name
            localStorage.setItem("SET_NAME", name);
        },
        SET_AVATAR: (state, avatar) => {
            state.avatar = avatar
            sessionStorage.setItem("SET_AVATAR", avatar);
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles
            localStorage.setItem("SET_ROLES", roles);
        },
        SET_CODING: (state, coding) => {
            state.coding = coding;
            localStorage.setItem("SET_CODING", coding);
        },
        SET_SECTION: (state, section) => {
            if (section == null) {
                state.sectionName = null;
                state.leader = null;
                state.sectionId = null
                state.sectionName = null
                state.sectionCoding = null

                localStorage.setItem("sectionName", null);
                localStorage.setItem("sectionId", null);
                localStorage.setItem("sectionLeader", null);
                localStorage.setItem("sectionCoding", null);
            } else {
                state.sectionName = section.name;
                state.leader = section.managerid;
                state.sectionId = section.id
                state.sectionName = section.name
                state.sectionCoding = section.coding

                localStorage.setItem("sectionName", section.name);
                localStorage.setItem("sectionId", section.id);
                localStorage.setItem("sectionLeader", section.managerid);
                localStorage.setItem("sectionCoding", section.coding);
            }

        }
    },

    actions: {
        // 密码登录
        PwdLogin({commit}, userInfo) {
            const username = userInfo.username.trim()
            const password = userInfo.password
            return new Promise((resolve, reject) => {
                pwdLogin(username, password).then(res => {
                    let user = res.staff
                    commit("SET_TOKEN", user.token);
                    commit('SET_ID', user.id);
                    commit('SET_NAME', user.name);
                    commit('SET_CODING', user.coding);
                    commit('SET_AVATAR', user.head);
                    commit('SET_MENU', res.menus);
                    commit('SET_LOAD_MENU', true);

                    commit('SET_SECTION', user.section);
                    if (user.role) {
                        let rn = "";
                        user.role.forEach(r => {
                            rn += r.name + "/";
                        })
                        if (rn.length > 0) {
                            rn = rn.substring(0, rn.length - 1);
                        }
                        commit('SET_ROLES', rn);
                        resolve()
                    } else {
                        console.log("未配置用户角色")
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },

        //token登录
        TokenLogin({commit}, token) {
            return new Promise((resolve, reject) => {
                commit("SET_TOKEN", token);
                getUserInfo(token).then(result => {
                    let user = result.staff
                    if (user == null) {
                        reject();
                        return;
                    }
                    commit('SET_ID', user.id);
                    commit('SET_NAME', user.name);
                    commit('SET_CODING', user.coding);
                    commit('SET_AVATAR', user.head);
                    commit('SET_MENU', result.menus);
                    commit('SET_LOAD_MENU', true);
                    commit('SET_SECTION', user.section);
                    let rn = ""
                    if (user.role) {
                        user.role.forEach(r => {
                            if (r) {
                                rn += r.name + "/";
                            }
                        })
                        if (rn.length > 0) {
                            rn = rn.substring(0, rn.length - 1);
                        }
                        commit('SET_ROLES', rn);
                        resolve()
                    } else {
                        getRoles(token).then(roles => {
                            roles.forEach(r => {
                                if (r) {
                                    rn += r.name + "/";
                                }
                            })
                            if (rn.length > 0) {
                                rn = rn.substring(0, rn.length - 1);
                            }
                            commit('SET_ROLES', rn);
                            resolve()
                        }).catch(() => {
                            reject()
                        })
                    }

                }).catch(() => {
                    reject();
                });
            })
        },

        //wxOpenId登录
        OpenIdLogin({commit}, openId) {
            return new Promise((resolve, reject) => {
                // commit("SET_TOKEN", token);
                loginByOpenId(openId).then(result => {
                    let user = result.staff
                    if (user == null) {
                        reject('user not exists');
                        return;
                    }
                    commit("SET_TOKEN", user.token);
                    commit('SET_ID', user.id);
                    commit('SET_NAME', user.name);
                    commit('SET_CODING', user.coding);
                    commit('SET_AVATAR', user.head);
                    commit('SET_MENU', result.menus);
                    commit('SET_LOAD_MENU', true);
                    commit('SET_SECTION', user.section);
                    let rn = ""
                    if (user.role) {
                        for (let i = 0; i < user.role.length; i++) {
                            let r = user.role[i]
                            if (r) {
                                rn += r.name + "/";
                            }
                        }
                        if (rn.length > 0) {
                            rn = rn.substring(0, rn.length - 1);
                        }
                        commit('SET_ROLES', rn);
                    }
                    resolve(user)
                }).catch((e) => {
                    reject(e);
                });
            })
        },

        //set临时token
        // setTempToken({commit}, token) {
        //     return new Promise((resolve, reject) => {
        //         try {
        //             commit("SET_TOKEN", token);
        //             resolve()
        //         } catch (e) {
        //             reject()
        //         }
        //     })
        // },

        // 退出系统
        LogOut({state, commit}) {
            return new Promise((resolve, reject) => {
                logout(state.token).then(() => {
                    commit('SET_ID', null)
                    commit('SET_NAME', null)
                    commit('SET_MENU', null)
                    commit('SET_SECTION', null)
                    commit('SET_TOKEN', null)
                    removeToken()
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },

        // 前端 登出
        FedLogOut() {
            return new Promise(resolve => {
                removeToken();
                resolve()
            })
        }
    }
}

export default user