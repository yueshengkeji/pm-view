<template>
    <div>
        <v-row :dense="dense">
            <v-col cols="12">
                <v-data-table :server-items-length="total"
                              :dense="dense"
                              :loading="loading"
                              :headers="headers"
                              :items="items"
                              :items-per-page="options.itemsPerPage"
                              :options.sync="options"
                              sort-desc
                              sort-by="pd01703">
                    <template v-slot:top>
                        <v-row dense>
                            <v-col md="1" cols="12">
                                <v-btn :loading="exportLoading" color="primary" @click="downloadExcel">导出</v-btn>
                            </v-col>
                            <v-col md="1" cols="12">
                                <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                                    <template v-slot:activator="{attrs,on}">
                                        <v-text-field hide-details
                                                      dense
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      v-model="queryParam.startDate"
                                                      label="请指定开始日期"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="queryParam.startDate"
                                                   @change="$refs.menu.save()"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col md="1" cols="12">
                                <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
                                    <template v-slot:activator="{attrs,on}">
                                        <v-text-field hide-details
                                                      dense
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      v-model="queryParam.endDate"
                                                      label="请指定截止日期"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="queryParam.endDate"
                                                   @change="endDateChange"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col lg="2" cols="12">
                                <v-radio-group v-model="queryParam.type" row class="mt-0" @change="list">
                                    <v-radio label="未审核" value="0"></v-radio>
                                    <v-radio label="已审核" value="1"></v-radio>
                                </v-radio-group>
                            </v-col>
                            <v-col lg="1">
                                <v-btn @click="list">查询</v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import {downloadDetailExcel, getPayDetailByDate} from '@/api/payment'

    export default {
        name: "payDetailList",
        data: () => ({
            paymentMoney: 0,
            items: [],
            headers: [
                {text: '合同名称', value: 'contract.name', width: '25%'},
                {text: '供应单位', value: 'company.name', width: '15%'},
                {text: '申请日期', value: 'applyDate', width: '7%'},
                {text: '批准（审核)日期', value: 'payment.approveDate', width: '7%'},
                {text: '付款金额', value: 'applyMoney', width: '7%'},
                {text: '批准金额', value: 'ratify', width: '7%'},
                {text: '申请人', value: 'payment.staff.name', width: '7%'},
                {text: '付款性质', value: 'paymentType.name', width: '7%'},
            ],
            options: {},
            queryParam: {
                startDate: null,
                endDate: null,
                type: null,
            },
            loading: false,
            total: 0,
            dense: true,
            menu: false,
            menu2: false,
            exportLoading:false,
        }),
        props: {
            type: {
                type: String,
                default: "0"
            },
            startDate: String,
            endDate: String,
        },
        watch: {
            options: {
                handler() {
                    this.list();
                },
                deep: true,
            },
            '$vuetify.breakpoint': {
                handler() {
                    this.setDense()
                },
                deep: true
            },
            type: {
                handler() {
                    this.queryParam.type = this.type
                    this.list()
                }
            },
            startDate: {
                handler() {
                    this.queryParam.startDate = this.startDate
                    this.list()
                }
            },
            endDate: {
                handler() {
                    this.queryParam.endDate = this.startDate
                    this.list()
                }
            }
        },
        created() {
            this.setDense()
            this.queryParam.type = this.type
            this.queryParam.startDate = this.startDate
            this.queryParam.endDate = this.endDate
        },
        methods: {
            endDateChange(){
                this.$refs.menu2.save()
                this.list()
            },
            downloadExcel() {
                this.exportLoading = true
                const {sortBy, sortDesc, page, itemsPerPage} = this.options
                this.queryParam.sortBy = sortBy[0];
                this.queryParam.sortDesc = sortDesc[0];
                this.queryParam.itemsPerPage = itemsPerPage;
                this.queryParam.page = page;
                downloadDetailExcel(this.queryParam).then(result => {
                    let a = document.createElement("a")
                    a.href = result
                    a.download = result.substring(result.indexOf('/'))
                    a.click()
                }).finally(()=>{
                    this.exportLoading = false
                })
            },
            setDense() {
                if (this.$vuetify.breakpoint.width > 1280) {
                    this.dense = false
                } else {
                    this.dense = true
                }
            },
            list() {
                this.loading = true;
                const {sortBy, sortDesc, page, itemsPerPage} = this.options
                this.queryParam.sortBy = sortBy[0];
                this.queryParam.sortDesc = sortDesc[0];
                this.queryParam.itemsPerPage = itemsPerPage;
                this.queryParam.page = page;
                getPayDetailByDate(this.queryParam).then(data => {
                    this.items = data.rows;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                });
            }
        }
    }
</script>

<style scoped>
    .single-line {
        width: 250px !important;
        display: inline-block;

        white-space: nowrap;
        overflow: hidden;
        word-break: keep-all;
        text-overflow: ellipsis;
    }
</style>