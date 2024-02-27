import request from '@/utils/request'

export function list(data) {
    return request({
        url: '/expenseApi/list',
        method: 'get',
        params: data
    })
}

export function insert(data) {
    return request({
        url: '/expenseApi/insertExpense',
        method: 'post',
        data
    })
}

export function queryAll() {
    return request({
        url: '/expenseApi/queryCourses',
        method: 'get'
    })
}

export function selectById(data) {
    return request({
        url: '/expenseApi/getById',
        method: 'get',
        params: data
    })
}

export function deleteById(data) {
    return request({
        url: '/expenseApi/deleteById',
        method:'post',
        data
    })
}

export function getByCourse(data) {
    return request({
        url: '/expenseApi/getByCourse',
        method:'get',
        params:data
    })
}

export function exportExpenseList(data) {
    return request({
        url:'/expenseApi/exportExpenseList',
        method:'get',
        params:data
    })
}

export function exportSubExpenseList(data) {
    return request({
        url: 'expenseApi/exportSubExpenseList',
        method: 'get',
        params: data
    })

}

export function update(data) {
    return request({
        url: 'expenseApi/update',
        method: 'post',
        data: data
    })
}

export function deleteFile(fileUrl) {
    return request.delete("expenseApi/deleteFile?fileUrl=" + fileUrl)
}


export function deleteSubject(itemId) {
    return request.delete(`expenseApi/deleteSubject/${itemId}`)
}

export function updateCourse(course){
    return request.post('expenseApi/updateCourse',course)
}