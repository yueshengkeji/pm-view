import request from '@/utils/membersApi'

export function list(data) {
    return request({
        url: "unitePay/list",
        method: "get",
        params: data
    })
}