import request from '@/utils/membersApi'

export function listShopUser(data) {
    return request({
        url:'user/shopUserApi/list',
        method:'get',
        params:data
    })
}

export function insertShopUser(data){
    return request({
        url:'user/shopUserApi/insert',
        method:'post',
        data
    })
}

export function updateShopUser(data){
    return request({
        url:'user/shopUserApi/update',
        method:'post',
        data
    })
}

export function selectShopUserById(data){
    return request({
        url:'user/shopUserApi/selectById',
        method:'get',
        params:data
    })
}

export function selectShopUserByName(data){
    return request({
        url:'user/shopUserApi/selectByLoginName',
        method:'get',
        params:data
    })
}