<template>
    <div>
        <v-data-table :headers="headers"
                      :items-per-page="query.itemsPerPage"
                      :server-items-length="total"
                      :options.sync="options"
                      @click:row="edit"
                      :loading="loading"
                      show-expand
                      :items="items">
            <template v-slot:top>
                <v-row>
                    <v-col md="2">
                        <v-text-field label="指定供应单位" @keyup.native.enter="list"
                                      v-model="query.companyName"></v-text-field>
                    </v-col>
                    <v-col md="1">
                        <v-text-field label="指定项目" @keyup.native.enter="list"
                                      v-model="query.projectName"></v-text-field>
                    </v-col>
                    <v-col md="1">
                        <v-text-field label="采购员" @keyup.native.enter="list" v-model="query.staffName"></v-text-field>
                    </v-col>
                    <v-col md="1">
                        <v-text-field label="搜索" @keyup.native.enter="list" v-model="query.searchText"></v-text-field>
                    </v-col>
                    <v-col md="3">
                        <v-radio-group v-model="query.putState" row @change="changePutState">
                            <v-radio label="所有" :value="2"></v-radio>
                            <v-radio label="未入库" :value="0"></v-radio>
                            <v-radio label="已入库" :value="1"></v-radio>
                        </v-radio-group>
                    </v-col>

                    <v-col md="2">
                        <v-menu ref="menu"
                                v-model="menu"
                                transition="scale-transition"
                                :close-on-content-click="false"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        v-model="date"
                                        label="指定开始/截止日期"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="date"
                                    range
                                    :max="new Date().toISOString().substr(0, 10)"
                                    min="1950-01-01"
                                    @change="changeDate"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col md="2">
                        <v-btn title="必须指定刷新数据日期" @click="refreshReport" :loading="loading" color="primary">刷新数据</v-btn>
                        <v-btn @click="exportExcel" :loading="loading" class="ml-1">导出</v-btn>
                    </v-col>
                </v-row>
            </template>
            <template v-slot:expanded-item="{ item }">
                <td :colspan="2">
                    采购日期：{{item.voucherDate}}
                </td>
                <td :colspan="2">
                    备注：{{item.remark}}
                </td>
                <td>
                    收货人：{{item.acceptPersonName}}
                </td>
                <td :colspan="3">
                    快递单号:{{item.series}}
                </td>
                <td :colspan="3">
                    是否签订合同：{{item.contractRemark}}
                </td>
                <td :colspan="2">
                    付款记录：{{item.payDate}}
                </td>
            </template>
        </v-data-table>
        <v-snackbar v-model="showMsg" centered color="waring">{{msg}}
            <template v-slot:action>
                <v-btn small @click="showMsg = false">确定</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
    import {exportExcel, list, refreshReport} from '@/api/proReport'

    export default {
        name: "report",
        data: () => ({
            query: {
                searchText: null,
                companyName: null,
                projectName: null,
                staffName: null,
                startDate: null,
                endDate: null,
                itemsPerPage: 10,
                putState: 2,
            },
            loading: false,
            total: 0,
            menu: false,
            items: [],
            headers: [
                // {text: '日期', value: 'voucherDate',width:'10%'},
                {text: '供应商', value: 'companyName', width: '20%'},
                {text: '项目', value: 'projectName', width: '20%'},
                {text: '采购物料', value: 'material.name', width: '15%'},
                {text: '规格', value: 'material.model', width: '15%'},
                {text: '品牌', value: 'material.brand'},
                {text: '单位', value: 'material.unit.name'},
                {text: '数量', value: 'sum'},
                {text: '成本', value: 'applyPrice'},
                {text: '单价', value: 'proPrice'},
                {text: '金额', value: 'proMoney'},
                // {text: '备注', value: 'remark'},
                {text: '业务员', value: 'projectPersonName', width: '10%'},
                {text: '是否入库', value: 'dhRemark', width: '10%'},
                // {text: '收货人', value: 'acceptPersonName'},
                // {text: '单号', value: 'series'},
                // {text: '是否签订合同', value: 'contractRemark'},
                // {text: '付款日期', value: 'payDate'},
            ],
            date: null,

            msg: ``,
            showMsg: false,
            options:{}
        }),
        created() {
            this.date = []
            this.query.startDate = this.getMonthFirst(new Date());
            this.query.endDate = this.dateFormat(new Date(), 'YYYY-mm-dd');
            this.date.push(this.query.startDate)
            this.date.push(this.query.endDate)
        },
        watch: {
            options: {
                handler() {
                    this.list();
                }
            }
        },
        methods: {
            edit(row, param) {
                param.expand(!param.isExpanded);
            },
            changeDate() {
                if (this.date.length > 0) {
                    let date1 = this.date[0];
                    let date2 = this.date[1];
                    if (date1 <= date2) {
                        this.query.startDate = date1;
                        this.query.endDate = date2;
                    } else {
                        this.query.startDate = date2;
                        this.query.endDate = date1;
                    }
                    this.menu = false;
                    this.list();
                } else {
                    this.query.startDate = null;
                    this.query.endDate = null;
                }

            },
            changePutState(){
                this.list();
            },
            list() {
                this.loading = true;
                this.query.itemsPerPage = this.options.itemsPerPage
                this.query.page = this.options.page
                let q = Object.assign({},this.query)
                q.startDate += ' 00:00:00'
                q.endDate += ' 23:59:59'
                list(q).then(data => {
                    this.items = data.rows;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                })
            },
            refreshReport() {
                if (this.query.startDate != null) {
                    this.loading = true;
                    refreshReport({startDate: this.query.startDate+" 00:00:00", endDate: this.query.endDate+" 23:59:59"}).then(() => {
                        this.list();
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.msg = "请指定日期";
                    this.showMsg = true;
                    console.log("显示Msg", this.msg, this.showMsg);
                }
            },
            exportExcel() {
                this.loading = true;
                let q = Object.assign({},this.query)
                q.startDate += ' 00:00:00'
                q.endDate += ' 23:59:59'
                exportExcel(q).then(res => {
                    try {
                        let a = document.createElement("a");
                        a.target = "_blank"
                        a.href = res
                        a.click()
                    } catch (e) {
                        console.log(e)
                    }
                }).finally(() => {
                    this.loading = false;
                });

            }
        }
    }
</script>

<style scoped>

</style>