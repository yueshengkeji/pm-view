import request from '@/utils/request.js'

export function deleteFolder(id) {
    return request({
        url: `/articleFolder/${id}`,
        method: 'delete',
    })
}

export function getFolderById(id) {
    return request({
        url: `/articleFolder/${id}`,
        method: 'get',
    })
}

export function searchFolder(str) {
    return request({
        url: `/articleFolder/search`,
        method: 'get',
        params: {str: str}
    })
}

export function updateFolder(data) {
    return request({
        url: 'articleFolder',
        method: 'post',
        data: data
    })
}

export function updateWord(word) {
    return request({
        url: 'articleFolder/updateWord',
        method: 'post',
        data: word
    })
}

export function insertWord(word) {
    return request({
        url: 'articleFolder/insertWord',
        method: 'put',
        data: word
    })
}

export function insertFolder(folder) {
    return request({
        url: 'articleFolder',
        method: 'put',
        data: folder
    })
}

export function loadById(id) {
    return request({
        url: `/article/${id}`,
        method: 'get',
    })
}

export function getContent(id) {
    return request({
        url: `/article/parseArticle/${id}`,
        method: 'get',
    })
}

/**
 * 获取办文目录
 * @param parent
 */
export function getFolder(parent) {
    return request({
        url: '/articleFolder/listChild',
        method: 'get',
        params: {
            parent: parent
        }
    })
}

/**
 * 获取办文模板
 * @param folderId 目录id
 */
export function getModuleByFolder(folderId) {
    return request({
        url: `/articleFolder/getModuleByFolder/${folderId}`,
        method: 'get',
    })
}

/**
 * 添加办文
 * @param article
 */
export function addArticle(article) {
    return request({
        url: '/article',
        method: 'put',
        data: article
    })
}

export function updateArticle(article) {
    return request({
        url: '/article',
        method: 'post',
        data: article
    })
}

/**
 * 获取办文列表
 * @param article
 */
export function getArticle(query) {
    return request({
        url: '/article/list',
        method: 'get',
        params: query
    })
}

/**
 * 删除办文
 * @param id
 */
export function deleteArticle(id) {
    return request({
        url: `/article/${id}`,
        method: 'delete'
    })
}

/**
 * 获取办文模板
 * @param moduleName 模板名称
 */
export function searchModule(moduleName) {
    return request({
        url: `/articleFolder/searchModule`,
        method: 'get',
        params:moduleName
    })
}