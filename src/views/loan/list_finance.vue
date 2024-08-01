<template>
    <div>
        <v-row>
            <v-col md="1" cols="12">
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
            <v-col md="1" cols="12">
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
            <v-col md="1" cols="12">
                <v-select v-model="queryItem.state"
                          :items="stateList"
                          dense
                          item-text="name"></v-select>
            </v-col>
            <v-col sm="1" cols="12">
                <select-staff dense v-model="staff" :clearable="true" label="员工姓名" @change="setStaff"></select-staff>
            </v-col>
            <v-col md="2" cols="12">
                <v-text-field v-model="moneyToRepayTotal" label="待还款金额" dense readonly></v-text-field>
            </v-col>
            <v-col md="2" cols="12">
                <v-text-field v-model="moneyRepaidTotal" label="已回款金额" dense readonly></v-text-field>
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
                <span>{{item.status == 0 ? '未审批' : '已审批'}}</span>
            </template>
        </v-data-table>
    </div>
</template>
<script>
    import {list} from "../../api/loan";
    import SelectStaff from "@/views/user/select.vue";

    export default {
        name:'list_finance',
        components: {SelectStaff},
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
            ],
            desserts: [],
            moneyRepaidTotal:0,
            moneyToRepayTotal:0,
            staff:null,

            menu: false,
            menu2: false,

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
            this.loadList()
        },

        methods:{
            loadList(){
                this.queryItem.pageSize = this.options.itemsPerPage
                this.queryItem.page = this.options.page
                list(this.queryItem).then(res => {
                    this.totalDesserts = res.total
                    this.desserts = res.rows
                    this.moneyToRepayTotal = res.moneyToRepayTotal
                    this.moneyRepaidTotal = res.moneyRepaidTotal
                })
            },
            setStaff(data){
                if (data != null){
                    this.queryItem.staff = data.id
                }else {
                    this.queryItem.staff = null
                }
                this.loadList()
            }
        }
    }
</script>
