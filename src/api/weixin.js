import request from '@/utils/request'

export function getTicket() {
    return request.get("wx/getTicket")
}

export function getWxOpenId(code) {
    return request({
        url: `wx/getOpenId/${code}`,
        method: 'get',
    })
}

export function getSha1(str) {
    return request({
        url: `wx/getSha1`,
        method: 'get',
        params: {str: str}
    })
}

export function getAddressName(latitude, longitude) {
    return request.get('wx/getAddressName', {params: {latitude: latitude, longitude: longitude}})
}

export function getRoutes(startLatitude, startLongitude, endLatitude, endLongitude) {
    return request.get('wx/getRoutes',
        {
            params: {
                startLatitude: startLatitude,
                startLongitude: startLongitude,
                endLatitude: endLatitude,
                endLongitude: endLongitude
            }
        })
}