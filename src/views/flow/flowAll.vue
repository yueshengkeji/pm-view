<template>
    <div>
        <v-row>
            <v-col>
                <v-data-table :loading="listLoading"
                              :headers="headers"
                              :items="items"
                              :options.sync="options"
                              :server-items-length="total"
                              :items-per-page="options.itemsPerPage">
                    <template v-slot:top>
                        <v-row>
                            <v-col lg="2">
                                <v-autocomplete @change="changeStaff"
                                                placeholder="指定发起人姓名"
                                                :loading="searchStaffLoading"
                                                v-model="queryParam.staffId"
                                                item-text="name"
                                                item-value="id"
                                                :search-input.sync="searchStaff"
                                                :items.sync="staffList"></v-autocomplete>
                            </v-col>
                            <v-col lg="2">
                                <v-autocomplete :items="flowList"
                                                label="指定流程名称"
                                                v-model="queryFlow"
                                                :search-input.sync="searchFlow"
                                                item-text="name"
                                                item-value="id"
                                                return-object></v-autocomplete>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col lg="2">
                                <v-text-field @keyup.enter="list" label="搜索标题" v-model="queryTitle"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.state="{item}">
                        <v-chip :color="formatColor(item)">{{formatType(item)}}</v-chip>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn small @click="detail(item)">详情</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <instance-detail :close="close" :frame="frameId"></instance-detail>
    </div>
</template>

<script>
    import {list} from '@/api/usedFlowApi'
    import {getStaff} from '@/api/staff'
    import instanceDetail from "@/components/easyflow/instance-detail"
    import {list as getFlow} from '@/api/flow'

    export default {
        name: "index",
        components: {
            instanceDetail,
        },
        data: () => ({
            frameId: null,
            user: {
                name: null,
                id: null
            },
            searchStaff: null,
            searchStaffLoading: false,
            staffList: [],
            total: 0,
            options: {itemsPerPage: 10},
            headers: [
                {text: '流程名称', value: 'flow.name', width: '15%'},
                {text: '标题', value: 'title', width: '30%'},
                {text: '发起人', value: 'staff.name'},
                {text: '状态', value: 'state'},
                {text: '发起时间', value: 'startDate', width: '20%'},
                {text: '操作', value: 'action'},
            ],
            items: [],
            queryParam: {
                startDate: null,
                endDate: null,
                status: null,
                msgState: null,
                type: null,
                staffId: null,
                msgType: null,
                pageSize: 10,
                pageNumber: 1,
                str: null,
                flowFilter: null,
            },
            listLoading: false,
            searchFlow:null,
            queryFlow:null,
            flowList:[],
            queryTitle:null,
        }),
        watch: {
            searchFlow(val){
                if(val){
                    getFlow({name:val,page:1,itemsPerPage:10,sortBy:'po00102',sortDesc:true}).then(result=>{
                        this.flowList = result.rows
                    })
                }
            },
            options: {
                handler() {
                    this.list();
                },
                deep: true,
            },
            searchStaff(value) {
                this.searchStaffLoading = true;
                getStaff(value).then(staffs => {
                    this.staffList = staffs;
                }).finally(() => {
                    this.searchStaffLoading = false;
                });
            },
            queryFlow:{
                handler(){
                    this.list()
                },
                deep:true
            },
        },
        created() {
            // this.list();
            /*let userId = localStorage.getItem("flowCourseUserId");
            if (userId != "" && userId != null) {
                let userName = localStorage.getItem("flowCourseUserName");
                this.user = {id: userId, name: userName};
                this.queryParam.userId = userId;
                getStaff("").then(staffs=>{
                    this.staffList = staffs;
                })
            } else {
                if (this.$store.state.user.name != "1001") {
                    this.searchStaffLoading = true;
                    getStaff("陈钰").then(staffs => {
                        this.staffList = staffs;
                    }).finally(() => {
                        this.searchStaffLoading = false;
                    });
                }
            }*/
        },
        methods: {
            formatColor(item) {
                if (item.approveError) {
                    return "error";
                } else {
                    return "";
                }
            },
            formatType(item) {
                switch (item.state) {
                    case 1:
                        return "审批中";
                    case 2:
                        return "完成"
                    case 3:
                        return "被驳回"
                    case 4:
                        return "中断"
                    default:
                        return "未知"
                }
            },
            close() {
                this.frameId = null;
            },
            detail(item) {
                this.frameId = item.frameId;
            },
            changeStaff() {
                this.options.page = 1;
                this.list();
            },
            list() {
                this.listLoading = true
                const {page, itemsPerPage} = this.options
                this.queryParam.pageNumber = page
                this.queryParam.pageSize = itemsPerPage
                this.queryParam.title = this.queryTitle
                if(this.queryFlow){
                    this.queryParam['flow.name'] = this.queryFlow.name
                }
                list(this.queryParam).then(list => {
                    this.items = list;
                    this.total = list.length * this.queryParam.pageNumber + 1;
                }).finally(() => {
                    this.listLoading = false;
                });
            }
        }
    }
</script>

<style scoped>

</style>