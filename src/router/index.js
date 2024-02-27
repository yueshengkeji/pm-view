import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '@/store/index'
import {getToken} from '@/utils/auth'
import * as dd from "dingtalk-jsapi";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: "/",
                redirect: "/approve/index"
            },
            {
                path: '/approve/index/:tabTag?',
                name: 'approve',
                meta: {title: "我的审批"},
                component: () => import(/* webpackChunkName: "about" */ `../views/approve/index`)
            }, {
                path: '/approve/my-start',
                name: 'my-start',
                meta: {title: "我的发起"},
                component: () => import(/* webpackChunkName: "about" */ `../views/approve/my-start`)
            }, {
                path: '/user/profile',
                name: 'profile',
                meta: {title: "个人中心"},
                component: () => import(/* webpackChunkName: "about" */ `../views/user/profile`)
            }, {
                path: '/user/diningCode',
                name: 'diningCode',
                meta: {title: "个人中心-我的就餐码"},
                component: () => import(/* webpackChunkName: "about" */ `../views/user/diningCode`)
            }, {
                path: '/account/dining',
                name: 'dining',
                meta: {title: "就餐页面"},
                component: () => import(/* webpackChunkName: "about" */ `../views/account/dining`)
            }, {
                path: '/procurement/report',
                name: 'procurementReport',
                meta: {title: "采购订单报表"},
                component: () => import(/* webpackChunkName: "about" */ `../views/procurement/report`)
            }, {
                path: '/outmaterial/report',
                name: 'outmaterialReport',
                meta: {title: "出库单报表"},
                component: () => import(/* webpackChunkName: "about" */ `../views/outmaterial/report`)
            }, {
                path: '/noPermission',
                name: 'noPermission',
                meta: {title: "无访问权限"},
                component: () => import(/* webpackChunkName: "about" */ `../views/error/no-permission`)
            }, {
                path: '/menu-set',
                name: 'menu-set',
                meta: {title: "菜单配置"},
                component: () => import(/* webpackChunkName: "about" */ `../views/menu/index`)
            }, {
                path: '/projectAfter/insertExtDetail/:id',
                name: 'insertExtDetail',
                meta: {title: "报修明细"},
                component: () => import(/* webpackChunkName: "about" */ `../views/projectAfter/insertExtDetail`)
            }, {
                path: '/proDetailCheck/checkList',
                name: 'checkList',
                meta: {title: "对账单检查"},
                component: () => import(/* webpackChunkName: "about" */ `../views/proDetailCheck/checkList`)
            }, {
                path: '/procurement/apply/materialProHistory/:id',
                name: 'materialProHistory',
                meta: {title: "申请单材料采购记录"},
                component: () => import(/* webpackChunkName: "about" */ `../views/procurement/apply/materialProHistory`)
            }, {
                path: '/storage/out/insert',
                name: 'outDetail',
                meta: {title: "领料出库"},
                component: () => import(/* webpackChunkName: "about" */ `../components/15313`)
            }, {
                path: '/workcheck/deptList',
                name: 'deptList',
                meta: {title: "部门考勤"},
                component: () => import(/* webpackChunkName: "about" */ `../views/workcheck/deptList`)
            },
            {
                path: '/wxLocation/insertLocation',
                name: 'insertLocation',
                meta: {title: "车费报销登记"},
                component: () => import(`../views/wxLocation/insertLocation.vue`)
            },
            {
                path: '/wxLocation/updateLocation/:id/:add?',
                name: 'updateLocation',
                meta: {title: "车费报销完成"},
                component: () => import(`../views/wxLocation/updateLocation.vue`)
            },
            {
                path: '/wxLocation/updateParkingCost/:id',
                name: 'updateParkingCost',
                meta: {title: "上传停车费凭证"},
                component: () => import(`../views/wxLocation/updateParkingCost.vue`)
            },
            {
                path: '/equipmentToRepair/components/equipmentNotify/:id',
                name: 'equipmentNotify',
                meta: {title: "设备送修结果确认"},
                component: () => import(`../views/equipmentToRepair/components/equipmentNotify.vue`)
            },
            {
                path: '/zj/saleData/analysis',
                name: 'saleDataAnalysis',
                meta: {title: "销售数据分析"},
                component: () => import(`../views/zj/saleData/analysis.vue`)
            },
            {
                path: '/zj/saleData/topList',
                name: 'topList',
                meta: {title: "销售数据排名"},
                component: () => import(`../views/zj/saleData/topList.vue`)
            },
            {
                path: '/wxLocation/projectList',
                name: 'carExpenseProjectList',
                meta: {title: "项目用车统计"},
                component: () => import(`../views/wxLocation/projectList.vue`)
            },
            {
                path: '/workLog/list',
                name: 'workLogList',
                meta: {title: "工作计划管理"},
                component: () => import(`../views/worklog/list`)
            },
            {
                path: '/workcheck/approve/:id',
                name: 'workCheckApprove',
                meta: {title: "考勤数据审核"},
                component: () => import(`../views/workcheck/approve.vue`)
            },
            {
                path: '/zj/flowData/analysis',
                name: 'flowDataAnalysis',
                meta: {title: "客流数据统计"},
                component: () => import(`../views/zj/flowData/analysis.vue`)
            },
            {
                path: '/workMaterial/out/:s?',
                name: 'workMaterialOut',
                meta: {title: "办公用品领用"},
                component: () => import(`../components/15223.vue`)
            }
        ]
    },
    {
        path: '/procurement/list/selectPut/:id',
        name: 'selectPut',
        meta: {title: "采购订单材料部分入库"},
        component: () => import(/* webpackChunkName: "about" */ `../views/procurement/list/selectPut`)
    },
    {
        path: '/fixedAssets/detail/:id',
        name: 'fixedAssetsDetail',
        meta: {title: "固定资产明细"},
        component: () => import(/* webpackChunkName: "about" */ `../views/fixedAssets/detail`)
    },
    {
        path: '/login',
        name: 'login',
        meta: {title: "办公系统"},
        component: () => import(/* webpackChunkName: "about" */ '../views/login/sing.vue')
    },
    {
        path: '/infoDetail/:id',
        name: 'infoDetail',
        meta: {title: "通知公告详情"},
        component: () => import(/* webpackChunkName: "about" */ '../views/systemInfo/infoDetail.vue')
    },
    {
        path: '/applyForCar/driverTaskDetail/:id',
        name: 'driverTaskDetail',
        meta: '司机任务详情',
        component: () => import('../views/applyForCar/driverTaskDetail')
    },
    {
        path: '/applyForCar/driverTaskReview/:id',
        name: 'driverTaskReview',
        meta: '用车申请审批',
        component: () => import('../views/applyForCar/driverTaskReview')
    }, {
        path: '/projectAfterExt/:id/:name',
        name: 'insert-project-after-ext',
        meta: '项目报修',
        component: () => import('../views/projectAfter/insertByExt')
    }, {
        path: '/procurement/returnToApply/:id',
        name: 'returnToApply',
        meta: '采购订单材料退回',
        component: () => import('../views/procurement/returnToApply')
    }, {
        path: '/procurement/express/:id',
        name: 'express',
        meta: '采购订单物流信息录入',
        component: () => import('../views/procurement/express')
    }, /*{
        path: '/procurement/approveVoucher/:id',
        name: 'approveVoucher',
        meta: '采购订单审批凭证',
        component: () => import('../views/procurement/approveVoucher')
    }, */{
        path: '/dingBind',
        name: 'ding_bind',
        meta: 'ding绑定',
        component: () => import('../views/dingTalk/dingBind')
    }, {
        path: '/wxBind/:openId',
        name: 'wx_bind',
        meta: '微信绑定',
        component: () => import('../views/login/wxBind')
    }, {
        path: '/procurement/form/insert/:id/:update?',
        name: 'proFormInsert',
        meta: '采购订单编辑',
        component: () => import('../views/procurement/form/insert')
    }, {
        path: '/procurement/quote/quote/:enquiryId',
        name: 'quote',
        meta: '询价单',
        component: () => import('../views/procurement/quote/quote')
    }, {
        path: '/equipmentToRepair/components/detailView:id',
        name: 'detailView',
        meta: '设备送修通知详情',
        component: () => import('../views/equipmentToRepair/components/detailView')
    }, {
        path: '/equipmentToRepair/components/equipmentRepairAdd',
        name: 'equipmentRepairAdd',
        meta: '设备送修新增',
        component: () => import('../views/equipmentToRepair/components/equipmentRepairAdd')
    }, {
        path: '/approve/by-approve-id/:id',
        name: 'byApproveId',
        meta: {title: "审批消息明细"},
        component: () => import(/* webpackChunkName: "about" */ `../views/approve/by-approve-id`)
    }, {
        path: '/approve/by-frame-id/:id',
        name: 'byFrameId',
        meta: {title: "审批消息明细"},
        component: () => import(/* webpackChunkName: "about" */ `../views/approve/by-frame-id`)
    }, {
        path: '/storage/put/detailByProMaterId/:proMaterId/:proId',
        name: 'detailByProMaterId',
        meta: {title: "采购订单入库明细"},
        component: () => import(/* webpackChunkName: "about" */ `../views/storage/put/detailByProMaterId`)
    }, {
        path: '/apply/listByApplyRowId/:planRowId',
        name: 'listByApplyRowId',
        meta: {title: "设计材料采购申请记录"},
        component: () => import(/* webpackChunkName: "about" */ `../views/apply/listByApplyRowId`)
    },
    {
        path: '/expense/personalExpense:add',
        name: 'personalExpense',
        meta: {title: "报销统计"},
        component: () => import(`../views/expense/personalExpense`)
    },
    {
        path: '/wxLocation/expenseDetail/:id',
        name: 'wxLocationExpenseDetail',
        meta: {title: "私车报销明细"},
        component: () => import(`../views/wxLocation/detail`)
    },
    {
        path: '/procurement/signPut/:id/:no?',
        name: 'signPut',
        meta: {title: "入库签单"},
        component: () => import(`../views/procurement/signPut`)
    },
    {
        path: '/storage/out/signOut/:id',
        name: 'signOut',
        meta: {title: "出库签单"},
        component: () => import(`../views/storage/out/signOut`)
    },
    {
        path: '/entertain/update/:id',
        name: 'entertainUpdate',
        meta: {title: "招待申请"},
        component: () => import(`../views/entertain/components/update.vue`)
    },
    {
        path: '/system/errorFlowCheck/:id/:approveId',
        name: 'errorFlowCheck',
        meta: {title: "异常流程详情"},
        component: () => import(`../views/system/errorFlowCheck.vue`)
    },
    {
        path: '/procurement/material/history/:projectId?',
        name: 'proHistoryV2',
        meta: {title: "采购记录"},
        component: () => import(`../views/procurement/material/history.vue`)
    },
    {
        path: '/plan/history/:projectId?',
        name: 'planHistory',
        meta: {title: "项目成本清单"},
        component: () => import(`../views/plan/history.vue`)
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})
router.onError((e, form) => {
    console.log("router onError", e, form)
})
router.beforeEach((to, from, next) => {
    if (store.state.menus.loadMenu) {
        if (store.state.menus.menus != null) {
            filterMenus(store.state.menus.menus);
        }
        console.log("动态菜单加载完成", store.state.menus.menus,store.state.menus.loadMenu)
        store.commit("SET_LOAD_MENU", false)
        next(to);
    } else {
        if (getToken() == null
            && to.path != "/login"
            && to.path != "/demo"
            && to.path != "/dingBind"
            && to.path.indexOf("wxBind") == -1
            && to.path.indexOf("/procurement/quote/quote") == -1
            && to.path.indexOf('projectAfterExt') == -1
            && to.path.indexOf('procurement/approveVoucher') == -1
            && to.path.indexOf('procurement/express') == -1) {
            console.log("redirectPath",to.path)
            console.log("dd env platform",dd.env.platform,to.path,dd.env.platform !== "notInDingTalk")
            sessionStorage.setItem("redirectPath",to.path);
            if (dd.env.platform != "notInDingTalk") {
                console.log("跳转到登录界面，携带参数")

                next({path: '/login?redirect=' + to.path})
            } else {
                //登录界面
                console.log("跳转到登录界面，未携带参数")
                next({path: '/login'})
            }
        } else {
            isPermission(to, next)
        }
    }
    document.title = to.meta.title || "智慧办公"
})

function isPermission(to, next) {
    if (to.matched.length > 0) {
        next();
    } else {
        router.push({path: "/noPermission"});
    }
}

function filterMenus(menus) {
    let rs = []
    menus.forEach((m) => {
        let url = m.url
        let component = url
        try {
            let paramFlag = url.indexOf(":")
            if (paramFlag != -1) {
                component = url.substr(0, paramFlag - 1)
            }
        } catch (e) {
            console.log(m.name, e)
        }

        let route = {
            path: '/' + url,
            name: m.id,
            component: () => import(/* webpackChunkName: "about" */ `../views/${component}`),
            meta: {outer: m.outer, title: m.name}
        };


        if (url != '') {
            router.addRoute("Home", route);
        }
        if (m.children != null) {
            router.children = filterMenus(m.children);
        }
        rs.push(route);
    })
    return rs;
}

export default router
