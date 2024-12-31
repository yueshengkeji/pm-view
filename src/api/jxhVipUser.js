import request from '@/utils/membersApi'

export function list(data) {
    return request({
        url: "user/jxhVipUser/list",
        method: "get",
        params:data
    })
}