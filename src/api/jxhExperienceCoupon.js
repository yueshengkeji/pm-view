import request from '@/utils/membersApi'

export function insert(data) {
    return request({
        url:'user/experienceCouponApi/insertExperienceCoupon',
        method:'post',
        data
    })
}

export function update(data){
    return request({
        url:'user/experienceCouponApi/updateExperienceCoupon',
        method:'post',
        data
    })
}

export function selectExperienceCouponById(data){
    return request({
        url:'user/experienceCouponApi/selectExperienceCouponById',
        method:'get',
        params:data
    })
}

export function listExperienceCoupon(data) {
    return request({
        url:'user/experienceCouponApi/listExperienceCoupon',
        method:'get',
        params:data
    })
}