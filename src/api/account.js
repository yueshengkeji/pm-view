import request from '@/utils/request'

export function list(query) {
    return request.get("/staffAccount/listAccount", {params:query})
}
export function rechargeAmount(data) {
    return request.post("/staffAccount/rechargeAmount", data)
}
export function returnAmount(data) {
    return request.post("/staffAccount/returnAmount", data)
}
export function history(query) {
    return request.get("/staffAccount/listHistory", {params:query})
}
export function exportExcel(query) {
    return request.get("/staffAccount/exportExcel", {params:query})
}
export function getByStaffId(staffId) {
    return request.get(`/staffAccount/byStaffId/${staffId}`)
}
export function exportExcelBalance() {
    return request.get("staffAccount/exportExcelBalance")
}