import request from '@/utils/request'

export function list(query) {
    return request.get("/dining/list", {params:query})
}
export function exportExcel(query) {
    return request.get("/dining/exportExcel", {params:query})
}
export function toDayList() {
    return request.get("/dining/toDayList")
}
export function dining(data) {
    return request.post("/dining",data)
}
export function diningByDate(data) {
    return request.post("/dining/diningByDate",data)
}
export function toDayStaffCount() {
    return request.get("/dining/toDayStaffCount")
}
export function getByStaff(staffId) {
    return request.get(`/dining/getByStaff/${staffId}`)
}
export function getDiningDayStatistics(data) {
    return request.get("/dining/getDiningDayStatistics",{params:data})
}
export function getPersonalDiningStatistics(data) {
    return request.get("/dining/getPersonalDiningStatistics",{params:data})
}
export function exportExcelDiningDayStatistics(data) {
    return request.get("/dining/exportExcelDiningDayStatistics",{params:data})
}
export function exportExcelPersonalDiningStatistics(data) {
    return request.get("/dining/exportExcelPersonalDiningStatistics",{params:data})
}
export function exportExcelLastHistory(data) {
    return request.get("/dining/exportExcelLastHistory",{params:data})
}
export function getTimeDining() {
    return request.get("/dining/getTime")
}
