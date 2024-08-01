<template>
<div>
    <v-row>
        <v-col cols="12" md="2" sm="2" style="display: flex">
            <v-btn color="primary" style="margin-left: 10px" @click="insertItem" small>新增借款</v-btn>
        </v-col>
        <v-col md="2" cols="12">
            <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                <template v-slot:activator="{attrs,on}">
                    <v-text-field hide-details
                                  dense
                                  v-bind="attrs"
                                  v-on="on"
                                  v-model="queryItem.startDate"
                                  label="请指定开始日期"></v-text-field>
                </template>
                <v-date-picker v-model="queryItem.startDate" @change="$refs.menu.save()"></v-date-picker>
            </v-menu>
        </v-col>
        <v-col md="2" cols="12">
            <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
                <template v-slot:activator="{attrs,on}">
                    <v-text-field hide-details
                                  dense
                                  v-bind="attrs"
                                  v-on="on"
                                  v-model="queryItem.endDate"
                                  label="请指定截止日期"></v-text-field>
                </template>
                <v-date-picker v-model="queryItem.endDate" @change="$refs.menu2.save()"></v-date-picker>
            </v-menu>
        </v-col>
        <v-col md="2" cols="12">
            <v-select v-model="queryItem.state"
                      :items="stateList"
                      dense
                      item-text="name"></v-select>
        </v-col>
        <v-col md="2" cols="12">
            <v-text-field v-model="moneyToRepayTotal" label="待还款金额" dense readonly></v-text-field>
        </v-col>
    </v-row>
    <v-data-table
            :headers="headers"
            :items="desserts"
            :options.sync="options"
            :server-items-length="totalDesserts"
            class="elevation-1"
    >
        <template v-slot:item.remark="{item}">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <div style="max-width: 200px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                        {{item.remark}}
                    </div>
                </template>
                <span>{{item.remark}}</span>
            </v-tooltip>
        </template>
        <template v-slot:item.state="{item}">
            <span>{{item.state == 0 ? '未还款' : item.state == 1 ? '已还款' : '部分还款'}}</span>
        </template>
        <template v-slot:item.status="{item}">
            <span>{{item.status == 1 ? '已审批' : '未审批'}}</span>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn x-small color="success" @click="updateLoan(item)" outlined>还款</v-btn>
            <v-btn x-small color="primary" @click="showDetail(item)" outlined style="margin-left: 3px">明细</v-btn>
            <v-btn x-small color="error" @click="deleteLoan(item)" outlined style="margin-left: 3px">删除</v-btn>
        </template>
    </v-data-table>
    <!--新赠-->
    <v-dialog v-model="addDialog" width="60%" :fullscreen="mobileFlag">
        <v-card class="pa-3">
            <add ref="addLoan"></add>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="addSubmit">提交</v-btn>
                <v-btn @click="addCancel">取消</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <!--还款-->
    <v-dialog v-model="updateDialog" width="60%" :fullscreen="mobileFlag">
        <v-card class="pa-3">
            <v-form ref="loanUpdate">
            <v-row>
                <v-col cols="12" md="4" sm="4" xs="4">
                    <v-text-field v-model="updateItem.repayMoney" label="还款金额" type="number" :rules="repayMonenyRule"
                                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="4" xs="4">
                    <v-menu ref="menu3" v-model="menu3" :close-on-content-click="false">
                        <template v-slot:activator="{attrs,on}">
                            <v-text-field hide-details
                                          v-bind="attrs"
                                          v-on="on"
                                          v-model="updateItem.repayDate"
                                          label="借款日期"></v-text-field>
                        </template>
                        <v-date-picker v-model="updateItem.repayDate" @change="$refs.menu3.save()"></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="updateConfirm">提交</v-btn>
                <v-btn @click="updateCancel">取消</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <!--明细-->
    <instance-detail :frame="item.id" :close="close"></instance-detail>

</div>
</template>
<script>
    import {list,update,deleteById} from "../../api/loan";
    import instanceDetail from '@/components/easyflow/instance-detail'
    import add from "./components/add";

    export default {
        name:'loanList',
        components:{instanceDetail,add},
        data:() => ({
            options: {},
            totalDesserts: null,
            headers: [
                {text: '借款人', value: 'staff.name', sortable: false, with: '20%'},
                {text: '借款金额', value: 'lendMoney', sortable: false},
                {text: '借款日期', value: 'lendDate', sortable: false},
                {text: '待还金额', value: 'moneyToRepay', sortable: false},
                {text: '还款金额', value: 'repayMoney', sortable: false},
                {text: '还款日期', value: 'repayDate', sortable: false},
                {text: '备注', value: 'remark', sortable: false},
                {text: '状态', value: 'state', sortable: false},
                {text: '审批状态', value: 'status', sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],

            menu: false,
            menu2: false,

            //新赠借款
            mobileFlag: false,
            addDialog:false,


            //还款
            moneyToRepayTotal:0.0,
            updateDialog:false,
            updateItem:{
                moneyToRepay:0.0,
                repayMoney:0.0,
                repayDate:null,
                lendMoney:0.0
            },
            menu3:false,
            repayMonenyRule:[

            ],

            queryItem: {
                pageSize: 10,
                page: 1,
                str: null,
                sortName: 'lend_date',
                sortOrder: 'DESC',
                startDate: null,
                endDate: null,
                state:null,
                staff:null
            },

            stateList:[
                {
                    name:'全部',
                    value:null
                },
                {
                    name:'未还款',
                    value:0
                },
                {
                    name:'已还款',
                    value:1
                },
                {
                    name:'部分还款',
                    value:2
                }
            ],

            //明细
            item:{id:null}
        }),

        watch:{
            options: {
                handler() {
                    this.loadList()
                },
                deep: true,
            },
            'queryItem.endDate': {
                handler() {
                    this.loadList()
                },
                deep: true,
            },
            'queryItem.state':{
                handler(){
                    this.loadList()
                },
                deep: true
            }
        },

        created() {
            this.isMobile()
            this.queryItem.staff = this.$store.state.user.id
            this.loadList()
        },

        methods:{
            isMobile() {
                let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
                if (flag != null && flag.length > 0) {
                    this.mobileFlag = true
                } else {
                    this.mobileFlag = false
                }
            },
            loadList(){
                this.queryItem.pageSize = this.options.itemsPerPage
                this.queryItem.page = this.options.page
                list(this.queryItem).then(res => {
                    this.totalDesserts = res.total
                    this.desserts = res.rows
                    this.moneyToRepayTotal = res.moneyToRepayTotal
                })
            },
            insertItem() {
                this.addDialog = true
                this.$nextTick(() => {
                    this.$refs.addLoan.resetFormRules()
                })
            },
            async addSubmit(){
                if (this.$refs.addLoan.validateForm()) {
                    await this.$refs.addLoan.insertLoan().then(res => {
                        if (res != null) {
                            this.loadList()
                            this.addDialog = false
                        }
                    }).finally(() => {
                    })

                }
            },
            addCancel(){
                this.addDialog = false
                this.$refs.addLoan.resetFormRules()
                this.$refs.addLoan.reset()
            },
            updateLoan(item){
                this.updateItem = item
                this.updateItem.repayMoney = item.moneyToRepay
                this.updateItem.repayDate = this.formatTimer(new Date())
                this.repayMonenyRule = [
                    v => !!v || '必填字段', v => v >= 0 || '金额大于等于0', v => v <= item.moneyToRepay || '还款金额不大于待还金额'
                ]
                this.updateDialog = true
            },
            updateConfirm(){
                if (this.$refs['loanUpdate'].validate()){
                    this.updateItem.moneyToRepay = this.updateItem.moneyToRepay - this.updateItem.repayMoney
                    if (this.updateItem.moneyToRepay == 0){
                        this.updateItem.state = 1
                    }else if (this.updateItem.moneyToRepay > 0 && this.updateItem.moneyToRepay < this.updateItem.lendMoney){
                        this.updateItem.state = 2
                    }
                    this.updateItem.repayMoney = this.updateItem.lendMoney - this.updateItem.moneyToRepay
                    update(this.updateItem).then(res => {
                        if (res != 0){
                            this.loadList()
                            this.updateDialog = false
                        }
                    })
                }
            },

            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },
            updateCancel(){
                this.updateDialog = false
            },

            showDetail(item){
                this.item.id = item.id
            },

            close() {
                this.item = {id: null}
            },

            deleteLoan(item){
                if (item.status == 0) {
                    this.confirm(`确定删除该借款记录？`).then(() => {
                        deleteById(item.id).then(res => {
                            if (res > 0){
                                this.loadList()
                            }
                        })
                    })
                }else{
                    this.message("已审核，禁止删除")
                }
            }
        }
    }
</script>
