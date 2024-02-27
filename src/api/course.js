import request from '@/utils/request'

//获取过程列表
export function loadCourseList(flowId) {
    return request.get(`course/getByFlowId/${flowId}`)
}
//修改过程
export function updateCourse(course) {
    return request.post('course',course)
}
//添加过程
export function insertCourse(course) {
    return request.put('course',course)
}
//删除过程
export function deleteCourse(id) {
    return request.delete(`course/${id}`)
}
//删除条件
export function deleteJudge(id){
    return request.delete(`course/deleteJudge/${id}`)
}
//删除审批对象
export function deletePerson(id){
    return request.delete(`course/deletePerson/${id}`)
}
export function flowCourseInstance(flowMessageId,historyId){
    return request.get(`flowCourseInstance/${flowMessageId}/${historyId}`)
}