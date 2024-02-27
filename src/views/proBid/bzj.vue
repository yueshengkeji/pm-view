<template>
    <div>
        <v-row>
            <v-col sm="2">
                <v-checkbox class="ml-1 mt-1" label="待回款" v-model="params.bzjState"></v-checkbox>
            </v-col>
            <v-col sm="5">
                <v-chip class="ml-1">本月应回款合计:{{isNaN(monthCountMoney) ? 0 : monthCountMoney}}</v-chip>
                <v-chip class="ml-1">本月剩余回款合计:{{isNaN(monthNotMoney) ? 0 : monthNotMoney}}</v-chip>
                <v-chip class="ml-1">所有剩余回款合计:{{isNaN(allNotMoney) ? 0 : allNotMoney}}</v-chip>
            </v-col>
            <v-spacer></v-spacer>
            <v-col sm="2">
                <v-autocomplete label="指定负责人"
                                item-text="name"
                                item-value="id"
                                v-model="params.busPersonId"
                                dense
                                :search-input.sync="searchStaff"
                                :items="staffList">

                </v-autocomplete>
            </v-col>
            <v-col sm="3">
                <v-text-field dense label="搜索" v-model="search" @keyup.enter="searchBid"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table :items="bidList"
                      :loading="loading"
                      :headers="headers"
                      sort-by="datetime"
                      sort-desc
                      :server-items-length="itemLength"
                      :options.sync="params">
            <template v-slot:item.projectName="{item}">
                <div class="text-no-wrap text-truncate" style="width:300px">{{item.projectName}}</div>
            </template>
            <template v-slot:item.company.name="{item}">
                <div class="text-no-wrap text-truncate" style="width:250px">{{item.company.name}}</div>
            </template>
            <template v-slot:item.bzjState="{item}">
                <v-chip small v-if="item.bzjState === 0">待回款</v-chip>
                <v-chip small color="primary" v-else>已回款</v-chip>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn v-if="item.bzjState === 0" color="info" x-small @click="updateHeader(item)">已回款</v-btn>
                <v-btn class="ml-1" x-small @click="detailHeader(item)">明细</v-btn>
            </template>
            <template v-slot:item.self="{item}">
                <div>{{item.self == 0 ? '否' : '是'}}</div>
            </template>
        </v-data-table>

        <v-dialog v-model="detailDialog">
            <v-card class="pa-5">
                <frame-bid v-model="detailItem" offEdit></frame-bid>
                <v-divider></v-divider>
                <bid-result v-model="detailItem" offEdit></bid-result>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="detailDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="msgFlag">{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import {deleteBid, getBidList, getCountInfo, insertBid, update} from '@/api/proBid'
    import {getStaff} from '@/api/staff'
    import frameBid from '@/components/1320278.vue'
    import bidResult from '@/components/13202782.vue'

    export default {
        components: {
            frameBid,
            bidResult
        },
        name: "bid-bzj",
        data: () => ({
            formData: null,
            dialog: false,
            search: null,
            loading: false,
            bidList: [],
            params: {bzjState:true,state:'2,3',busPersonId:null},
            itemLength: 0,
            headers: [
                {
                    text: "项目名称",
                    value: 'projectName',
                }, {
                    text: "建设单位",
                    value: 'company.name',
                },{
                    text: "负责人",
                    value: 'busPerson.name',
                }, /*{
                    text: "自有项目",
                    value: 'self',
                }, {
                    text: "合作方",
                    value: 'cooperate',
                }, */{
                    text: "投标金额",
                    value: 'bidMoney',
                }, {
                    text: "投标时间",
                    value: 'date',
                }, {
                    text: "保证金金额",
                    value: 'bzjMoney',
                },  {
                    text: "保证金回款",
                    value: 'bzjDate',
                },  {
                    text: "申请人",
                    value: 'staff.name',
                }, {
                    text: "操作",
                    value: 'action',
                    width:'150px'
                }],

            msg: null,
            msgFlag: false,

            updateDialog: false,
            updateItem: {
                state: 0,
                bzjDate: '',
                bzjMoney: '',
                company: {name: ''},
                projectName: '',
                bidMoney: 0,
                beforeMoney: 0,
                inDate: ''
            },
            detailDialog: false,
            detailItem: null,

            monthCountMoney:0,
            monthNotMoney:0,
            allNotMoney:0,

            searchStaff:null,
            staffList:[],
        }),
        watch: {
            params: {
                handler() {
                    this.loadBid();
                },
                deep: true
            },
            searchStaff:{
                handler(val){
                    if(val){
                        getStaff(val).then(result=>{
                            this.staffList = result
                        })
                    }
                }
            }
        },
        methods: {
            loadCountInfo(){
                let bzjStartDate = this.getMonthFirst(new Date()) , bzjEndDate = this.getMonthEnd(new Date());
                //已中标,未回款
                getCountInfo({state:2,bzjStartDate:bzjStartDate,bzjEndDate:bzjEndDate,bzjState:0}).then(result=>{
                    this.monthNotMoney += result.bzjMoney
                })

                //未中标,未回款
                getCountInfo({state:3,bzjStartDate:bzjStartDate,bzjEndDate:bzjEndDate,bzjState:0}).then(result=>{
                    this.monthNotMoney += result.bzjMoney
                })

                //已中标,已回款
                getCountInfo({state:2,bzjStartDate:bzjStartDate,bzjEndDate:bzjEndDate,bzjState:1}).then(result=>{
                    this.monthCountMoney += result.bzjMoney
                })

                //未中标,已回款
                getCountInfo({state:3,bzjStartDate:bzjStartDate,bzjEndDate:bzjEndDate,bzjState:1}).then(result=>{
                    this.monthCountMoney += result.bzjMoney
                })

                //已中标,未回款
                getCountInfo({state:2,bzjState:0}).then(result=>{
                    this.allNotMoney += result.bzjMoney
                })

                //未中标,未回款
                getCountInfo({state:3,bzjState:0}).then(result=>{
                    this.allNotMoney += result.bzjMoney
                })
            },
            detailHeader(item) {
                this.detailItem = item
                this.detailDialog = true
            },
            updateHeader(item) {
                this.loading = true
                this.updateItem = item
                item.bzjState = 1
                update(item).then(()=>{
                    this.list()
                }).finally(()=>this.loading = false)
            },
            flowSuccess() {
                this.dialog = false
                this.loadBid()
            },
            saveBid() {
                let valid = this.$refs['bidForm'].validate();
                if (valid) {
                    this.loading = true
                    insertBid(this.formData).then(result => {
                        if (result.id != null) {
                            //保存成功，发起流程
                            this.$refs['bidForm'].startFlow(result).then(this.flowSuccess)
                        }
                    }).finally(() => this.loading = false)
                }
            },
            searchBid() {
                if (this.params.page != 1) {
                    this.params.page = 1
                } else {
                    this.loadBid()
                }
            },
            deleteBid(item) {
                if (item.state == 1) {
                    this.msg = '已审核，不能删除'
                    this.msgFlag = true
                } else {
                    deleteBid(item.id).then(() => {
                        this.loadBid()
                    })
                }
            },
            loadBid() {
                this.loading = true
                let query = {
                    searchText: this.search,
                    itemsPerPage: this.params.itemsPerPage == -1 ? 500 : this.params.itemsPerPage,
                    page: this.params.page,
                    sortBy: this.params.sortBy[0],
                    sortDesc: this.params.sortDesc[0],
                    bzjState:this.params.bzjState ? 0 : 1,
                    busPersonId:this.params.busPersonId
                };
                getBidList(query).then(result => {
                    this.bidList = result.rows;
                    this.itemLength = result.total;
                }).finally(() => {
                    this.loading = false
                })
                this.loadCountInfo()
            }
        }
    }
</script>

<style scoped>

</style>