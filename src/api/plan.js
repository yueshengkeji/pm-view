import http from '@/utils/request.js'

export default {
    getPlan(param) {
        return http.get('/plan/getPlans', {params: param})
    },
    addPlan(param) {
        return http.put('/plan', param)
    },
    loadPlanMaterial(planId) {
        return http.get("/planMaterial/byPlanId", {params: planId});
    },
    delete(id) {
        return http.delete("/plan", {params: id});
    },
    deleteMaterial(planDetailId) {
        return http.delete("/planMaterial", {params: {id: planDetailId}});
    },
    updatePlan(plan) {
        return http.post("/plan", plan);
    },
    getTotal(param) {
        return http.get('/plan/getTotal', {params: param});
    },
    getproplanmaterial(projectId) {
        return http.get('/planMaterial/byProjectId/' + projectId)
    },
    getPlanById(id) {
        return http.get(`/plan/getById/${id}`);
    }
}

export function getMaterByProject(projectId, params) {
    return http({
        url: `planMaterial/byProjectId/${projectId}`,
        method: 'get',
        params: params
    })
}
export function getAllMaterByProject(projectId, params) {
    return http({
        url: `planMaterial/allListByProjectId/${projectId}`,
        method: 'get',
        params: params
    })
}
export function exportAllByProjectId(projectId, params) {
    return http({
        url: `planMaterial/exportAllByProjectId/${projectId}`,
        method: 'get',
        params: params
    })
}

export function getMaterById(id) {
    return http({
        url: `planMaterial/${id}`,
        method: 'get'
    })
}