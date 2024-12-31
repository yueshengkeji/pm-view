import request from '@/utils/membersApi'

export function listVerificationRecords(data) {
    return request({
        url:'shopUser/experienceCouponVerificationApi/listVerificationRecords',
        method:'get',
        params:data
    })
}