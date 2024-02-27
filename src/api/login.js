import request from '@/utils/request.js'

/**
 * 密码登陆
 * @param userName 用户名
 * @param passwd 密码
 */
export function pwdLogin(userName, passwd) {
    return request({
        url: '/user-loginV2',
        method: 'post',
        data: {name: userName, passwd: passwd},
    });
}

/**
 * 退出登陆
 */
export function logout(token) {
    return request({
        url: `/user-logout/${token}`,
        method: 'get',
    })
}