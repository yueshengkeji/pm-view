<template>
    <div>
        <v-row>
            <v-col cols="12">
                <v-data-table :loading="loadingState"
                              item-key="id"
                              :items="planData"
                              :options.sync="options"
                              :server-items-length="queryParam.total"
                              sort-by="planDate"
                              sort-desc
                              :items-per-page="10" :headers="headers">
                    <template v-slot:top>
                        <v-row dense>
                            <v-col lg="1">
                                <v-btn color="primary" @click="insertPlan">新增</v-btn>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col lg="2">
                                <v-checkbox v-model="queryParam.typeCheck" class="ml-1 mt-1" label="我的单据"
                                            @change="filterPlanData"></v-checkbox>
                            </v-col>
                            <v-col lg="2">
                                <v-text-field dense v-model="queryParam.searchInput" placeholder="搜索"
                                              @change="loadPlanData"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.appMark="{item}">
                        <v-chip x-small :color="getTagType(item.appMark)">{{getAppMArk(item.appMark)}}</v-chip>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn x-small @click="handleDetail(item.$index, item)">明细</v-btn>
                        <v-btn class="ml-1" x-small @click="handleEdit(item.$index, item)">编辑</v-btn>
                        <v-btn class="ml-1" x-small color="error"
                               @click="handleDelete(item.$index, item,'planData')">删除
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>

        <v-dialog v-model="showPlanForm" title="计划单编辑" width="90%" @click:outside="closeDialog">
            <add-plan ref="addPlan"
                      :frameId="frameId"
                      :showTool="true"
                      :close="closeDialog"
                      :dataChange="dataChange"
                      :edit="edit"></add-plan>
        </v-dialog>
        <instance-detail :frame="flowMsgFrameId" :close="closeDialog"></instance-detail>
        <v-snackbar v-model="showMsg" centered>{{msg}}</v-snackbar>

    </div>
</template>

<script>
    import planApi from '@/api/plan'
    import addPlan from '@/components/13270'
    import instanceDetail from '@/components/easyflow/instance-detail'

    export default {
        name: "plan",
        components: {
            addPlan,
            instanceDetail
        },
        data() {
            return {
                showMsg: false,
                msg: null,
                //显示申请单表单
                showPlanForm: false,
                options: {},
                total: 0,
                headers: [
                    {text: '序号', value: 'index'},
                    {text: '项目', value: 'project.name'},
                    {text: '计划单名称', value: 'name'},
                    {text: '计划人', value: 'staff.name', width: '7%'},
                    {text: '计划日期', value: 'planDate', width: '9%'},
                    {text: '审核日期', value: 'approveDate', width: '9%'},
                    {text: '状态', value: 'appMark', width: '7%'},
                    {text: '操作', value: 'action', width: '20%'},
                ],
                //查询主表数据参数
                queryParam: {
                    limit: 10,
                    offset: 1,
                    total: 0,
                    sort: "a.pm07106",
                    order: "DESC",
                    staffId: null,
                    searchInput: "",
                    searchText: "",
                    typeCheck: false,
                },
                planData: [],
                filterBtnText: "我的单据",
                loadingState: false,
                frameId: null,
                edit: true,

                //审批明细
                flowMsgFrameId: null,

            }
        },
        watch: {
            options: {
                handler() {
                    this.loadPlanData();
                },
                deep: true,
            },
        },
        created: function () {

        },
        methods: {
            dataChange(){
                window.setTimeout(this.loadPlanData,500);
            },
            closeDialog() {
            console.log("closeDialog")
                this.edit = true
                this.showPlanForm = false;
                this.flowMsgFrameId = null
            },
            handleDelete(index, row) {
                let than = this;
                than.loadingState = true;
                planApi.delete({id: row.id}).then(result => {
                    than.loadingState = false;
                    if (result.type === "ok") {
                        than.loadPlanData();
                    } else {
                        this.msg = result.msg;
                        this.showMsg = true;
                    }
                }).catch(e => {
                    this.msg = e;
                    this.showMsg = true;
                });
            },
            handleEdit(index, rowData){
                this.edit = false;
                this.frameId = rowData.id;
                this.showPlanForm = true;
            },
            handleDetail(index, rowData) {
                this.edit = true;
                this.flowMsgFrameId = rowData.id;
            },
            getTagType(type) {
                switch (type) {
                    case -1:
                        return "error";
                    case 0:
                        return "secondary";
                    case 1:
                        return "primary";
                }
            },
            getAppMArk(type) {
                switch (type) {
                    case -1:
                        return "未发起";
                    case 0:
                        return "审批中";
                    case 1:
                        return "已审核";
                }
            },
            sortChange(column, order) {
                if (!order) {
                    order = [];
                    order[0] = true;
                }
                switch (column[0]) {
                    case "approveDate":
                        this.queryParam.sort = "a.pm07108";
                        this.queryParam.order = order[0] ? "DESC" : "ASC";
                        break;
                    case "planDate":
                        this.queryParam.sort = "a.pm07111";
                        this.queryParam.order = order[0] ? "DESC" : "ASC";
                        break;
                    default:
                        this.queryParam.sort = "a.pm07108";
                        this.queryParam.order = "DESC";
                        break;
                }
            },
            loadPlanData() {
                let than = this;
                than.loadingState = true;
                this.queryParam.searchText = this.queryParam.searchInput;
                this.queryParam.offset = this.options.page;
                this.queryParam.limit = this.options.itemsPerPage;
                this.sortChange(this.options.sortBy, this.options.sortDesc);
                planApi.getPlan(this.queryParam).then((result) => {
                    result.forEach((val, index) => {
                        val.index = index + 1;
                    });
                    than.planData = result;
                    than.loadingState = false;
                });
                planApi.getTotal(this.queryParam).then(total => {
                    than.queryParam.total = total;
                })
            },
            filterPlanData() {
                console.log(this.$store);
                if (this.queryParam.typeCheck) {
                    this.queryParam.staffId = this.$store.state.user.coding;
                    this.loadPlanData();
                } else {
                    this.queryParam.staffId = null;
                    this.loadPlanData();
                }
            },
            currentChange(offset) {
                this.queryParam.offset = offset;
                this.loadPlanData();
            },
            insertPlan() {
                // this.$refs.addPlan.openAddDialog();
                console.log("insertPlan")
                this.edit = false;
                this.frameId = null;
                this.showPlanForm = true;
            }
        }
    }
</script>

<style type="text/css" scoped>

</style>
