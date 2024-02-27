<template>
    <div>
        <v-row>
            <v-col sm="1">
                <v-btn @click="dialog = true" color="primary">新增</v-btn>
            </v-col>
            <v-col sm="2">
                <v-checkbox class="mt-1" label="所有投标" v-model="staffFlag"></v-checkbox>
            </v-col>
            <v-col sm="2">
                <v-radio-group v-model="params.state" row class="mt-1">
                    <v-radio label="已中标" value="2"></v-radio>
                    <v-radio label="未中标" value="3"></v-radio>
                </v-radio-group>
            </v-col>
            <v-col sm="4">
                <v-chip>投标总数:{{itemLength}}</v-chip>
                <v-chip class="ml-1">中标总数:{{bidCount}}</v-chip>
                <v-chip class="ml-1">中标总价:{{bidMoney}}</v-chip>
            </v-col>
            <v-spacer></v-spacer>
            <v-col sm="2">
                <v-text-field label="搜索" v-model="search" @keyup.enter="searchBid"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table :items="bidList"
                      :loading="loading"
                      :headers="headers"
                      sort-by="datetime"
                      sort-desc
                      :server-items-length="itemLength"
                      :options.sync="params">
            <template v-slot:item.state="{item}">
                <v-chip small v-if="item.state === 0">{{item.courseName}}</v-chip>
                <v-chip small color="primary" v-else-if="item.state === 1">已审核</v-chip>
                <v-chip small color="primary" v-else-if="item.state === 2">已中标</v-chip>
                <v-chip small color="primary" v-else>未中标</v-chip>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn v-if="item.state === 0" color="error" x-small @click="deleteBid(item)">删除</v-btn>
                <v-btn v-else-if="item.state === 1" color="info" x-small @click="updateHeader(item)">反馈</v-btn>
                <v-btn class="ml-1" x-small @click="detailHeader(item)">明细</v-btn>
            </template>
            <template v-slot:item.self="{item}">
                <div>{{item.self == 0 ? '否' : '是'}}</div>
            </template>
        </v-data-table>

        <v-dialog v-model="dialog">

            <v-card class="pa-5">
                <frame-bid ref="bidForm"
                           v-model="formData">

                </frame-bid>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :loading="loading" @click="saveBid">提交</v-btn>
                    <v-btn @click="dialog = false" :loading="loading">取消</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>

        <v-dialog v-model="detailDialog">
            <v-card class="pa-5">
                <frame-bid v-model="detailItem" offEdit></frame-bid>
                <v-divider></v-divider>
                <bid-result v-model="detailItem" offEdit></bid-result>
                <component v-bind:is="printComponent"
                           v-bind:approveList="approveList"
                           v-on:success="success"
                           v-bind:message="flowMessage"
                           v-bind:printContent="printContent"></component>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="loadMessage" color="primary">打印</v-btn>
                    <v-btn @click="detailDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="updateDialog" width="50%">
            <v-card class="pa-5">
                <bid-result ref="bidResult" v-model="updateItem"></bid-result>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :loading="loading" @click="updateState">提交</v-btn>
                    <v-btn :loading="loading" @click="updateDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="msgFlag">{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import {deleteBid, getBidList, getCountInfo, insertBid, updateResult} from '@/api/proBid'
    import frameBid from '@/components/1320278.vue'
    import bidResult from '@/components/13202782.vue'
    import print from '@/components/print/1320278.vue'
    import {getMessageByFrameId} from '@/api/usedFlowApi'
    import {getApproveSteps} from '@/api/approve'

    export default {
        components: {
            frameBid,
            bidResult,
            print
        },
        name: "bid",
        data: () => ({
            staffFlag: false,
            formData: null,
            dialog: false,
            search: null,
            loading: false,
            bidList: [],
            params: {staffId: null,state:null},
            itemLength: 0,
            headers: [
                {
                    text: "项目名称",
                    value: 'projectName',
                }, {
                    text: "建设单位",
                    value: 'company.name',
                }, {
                    text: "项目来源",
                    value: 'projectSource',
                }, {
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
                    text: "成本",
                    value: 'cost',
                }, {
                    text: "投标时间",
                    value: 'date',
                }, {
                    text: "类型",
                    value: 'type',
                }, {
                    text: "申请人",
                    value: 'staff.name',
                }, {
                    text: "状态",
                    value: 'state',
                }, {
                    text: "操作",
                    value: 'action',
                    width: '130px'
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

            bidCount: 0,
            bidMoney: 0,
            printComponent:null,
            flowMessage:null,
            printContent:null,
            approveList:null,
        }),
        watch: {
            params: {
                handler() {
                    this.loadBid();
                },
                deep: true
            },
            staffFlag: {
                handler(val) {
                    if (val) {
                        this.params.staffId = null
                    } else {
                        this.params.staffId = this.$store.state.user.id
                    }
                }
            }
        },
        created() {
            this.params.staffId = this.$store.state.user.id
        },
        methods: {
            success(){
                this.printComponent = null
            },
            loadMessage(){
                getMessageByFrameId(this.detailItem.id).then(result=>{
                    if(result != null){
                        this.flowMessage = result
                        getApproveSteps(this.flowMessage.id).then(approveList=>{
                            this.approveList = approveList
                            this.printComponent = print
                        })
                    }
                })
            },
            loadCountInfo() {
                //已中标统计信息
                getCountInfo({state: 2}).then(result => {
                    this.bidCount = result.biddingCount
                    this.bidMoney = result.biddingMoney
                })
            },
            detailHeader(item) {
                this.detailItem = item
                this.detailDialog = true
            },
            updateState() {
                if (this.updateItem.state != 1) {
                    this.loading = true
                    updateResult(this.updateItem).then((result) => {
                        //发起审批流程
                        this.$refs.bidResult.startFlow(result).then(() => {
                            this.loadBid()
                            this.updateDialog = false
                        })
                    }).finally(() => this.loading = false)
                } else {
                    this.msg = "请选择中标结果"
                    this.msgFlag = true
                }
            },
            updateHeader(item) {
                console.log(item.state)
                this.updateItem = item
                this.updateDialog = true
            },
            flowSuccess() {
                this.dialog = false
                this.loadBid()
            },
            saveBid() {
                let valid = this.$refs['bidForm'].validate();
                if (valid) {
                    this.formData.self = this.formData.self ? 1 : 0
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
                    staffId: this.params.staffId,
                    state: this.params.state,
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