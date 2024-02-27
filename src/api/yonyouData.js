import request from '@/utils/request'

const url = 'yonYou'
//获取收支数据
export function list(param){
    return request.get(`${url}/getDataBySeries`,{params:param})
}
//获取收支备注信息
export function getRemark(param){
    return request.get(`${url}/getRemark`,{params:param})
}