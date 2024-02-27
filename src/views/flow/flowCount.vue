<template>
    <div>
        <v-row>
            <v-col>
                <v-data-table :loading="listLoading"
                              :headers="headers"
                              :items="items"
                              :options.sync="options"
                              :server-items-length="1000"
                              :items-per-page="options.itemsPerPage">
                    <template v-slot:top>
                        <v-row>
                            <v-col lg="2">
                                <v-autocomplete @change="changeStaff"
                                                placeholder="请输入用户姓名"
                                                :loading="searchStaffLoading"
                                                v-model="user"
                                                item-text="name"
                                                return-object
                                                :search-input.sync="searchStaff"
                                                :items.sync="staffList"></v-autocomplete>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.message.state="{item}">
                        <v-chip>{{formatType(item)}}</v-chip>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn small @click="detail(item)">详情</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <instance-detail :close="close" :approve="approve"></instance-detail>
    </div>
</template>

<script>
    import {list} from '@/api/approveManager'
    import {getStaff} from '@/api/staff'
    import instanceDetail from "@/components/easyflow/instance-detail";

    export default {
        name: "index",
        components: {
            instanceDetail,
        },
        data: () => ({
            approve: {approveState: null,message:{staff: {}},startDate:''},
            user: {
                name:null,
                id:null
            },
            searchStaff: null,
            searchStaffLoading: false,
            staffList: [],
            total: 0,
            options: {itemsPerPage: 10},
            headers: [
                {text: '流程名称', value: 'message.flow.name', width: '15%'},
                {text: '标题', value: 'message.title', width: '30%'},
                {text: '发起人', value: 'message.staff.name'},
                {text: '状态', value: 'message.state'},
                {text: '发起时间', value: 'message.startDate', width: '20%'},
                {text: '操作', value: 'action'},
            ],
            items: [],
            queryParam: {
                start: null,
                end: null,
                status: "3",
                msgState: "1,2,3,4",
                type: null,
                userId: null,
                msgType: null,
                pageSize: 10,
                pageNumber: 1,
                searchText: null,
                flowFilter: null,
            },
            listLoading: false,
        }),
        watch: {
            options: {
                handler() {
                    this.list();
                },
                deep: true,
            },
            searchStaff(value) {
                if (this.$store.state.user.name != "1001") {
                    value = "陈钰";
                }
                this.searchStaffLoading = true;
                getStaff(value).then(staffs => {
                    this.staffList = staffs;
                }).finally(() => {
                    this.searchStaffLoading = false;
                });
            }
        },
        created() {
            // this.list();
            let userId = localStorage.getItem("flowCourseUserId");
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
            }
        },
        methods: {
            formatType(item) {
                switch (item.message.state) {
                    case 1:
                        return "审批中";
                    case 2:
                        return "完成"
                    case 3:
                        return "已读"
                    case 4:
                        return "取消"
                    default:
                        return "未知"
                }
            },
            close() {
                this.approve = {approveState: null,message:{staff: {},startDate:''}};
            },
            detail(item) {
                this.approve = item;
            },
            changeStaff(s) {
                if (s != null) {
                    localStorage.setItem("flowCourseUserId", s.id);
                    localStorage.setItem("flowCourseUserName", s.name);
                    this.queryParam.userId = s.id;
                    this.list();
                }
            },
            list() {
                this.listLoading = true;
                const {page, itemsPerPage} = this.options
                this.queryParam.pageNumber = page;
                this.queryParam.pageSize = itemsPerPage;
                list(this.queryParam).then(list => {
                    this.items = list.rows;
                    this.total = list.total;
                }).finally(() => {
                    this.listLoading = false;
                });
            }
        }
    }
</script>

<style scoped>

</style>