<template>
    <!--    采购报表-->
    <div class="pa-3">
        <v-row>
            <v-col md="1" cols="12">
                <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                    <template v-slot:activator="{attrs,on}">
                        <v-text-field hide-details
                                      dense
                                      v-bind="attrs"
                                      v-on="on"
                                      v-model="startDate"
                                      label="请指定开始日期"></v-text-field>
                    </template>
                    <v-date-picker v-model="startDate" @change="$refs.menu.save()"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="1" cols="12">
                <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
                    <template v-slot:activator="{attrs,on}">
                        <v-text-field hide-details
                                      dense
                                      v-bind="attrs"
                                      v-on="on"
                                      v-model="endDate"
                                      label="请指定截止日期"></v-text-field>
                    </template>
                    <v-date-picker v-model="endDate" @change="$refs.menu2.save()"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col>
                <v-chip class="mr-1">采购金额:{{c.proMoney}}元</v-chip>
                <v-chip class="mr-1" color="primary">入库金额:{{c.putMoney}}元</v-chip>
                <v-chip class="mr-1" @click="showPaymentDetail(1)" link>已付款金额:{{c.payMoney}}元</v-chip>
                <v-chip class="mr-1" @click="showPaymentDetail(0)">申请付款金额:{{c.applyMoney}}元</v-chip>
                <v-chip class="mr-1">签订合同金额:{{c.contractMoney}}元</v-chip>
                <v-btn small color="primary" @click="loadData">查询</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <div id="chart" :style="'width:100%;height:613px'"></div>
        </v-row>
        <v-dialog width="98%" v-model="payDialog">
            <v-card class="pa-3">
                <detail-list :type="payParam.type"
                             :start-date="payParam.startDate"
                             :end-date="payParam.endDate"></detail-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="payDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import * as echarts from 'echarts';

    import {getProMoneyByDate} from '@/api/procurement'
    import {getPutMoney, getPutMoneyByDate} from '@/api/put'
    import {getApplyMoneyByDate} from '@/api/payment'
    import {getContractMoney} from '@/api/contract'
    import detailList from "../contract/payment/detailList";

    export default {
        name: "moneyReport",
        components: {
            detailList
        },
        data: () => ({
            menu: false,
            menu2: false,
            date: [],
            startDate: '2022-01-01',
            endDate: '2022-09-01',

            c: {
                proMoney: 0,
                putMoney: 0,
                payMoney: 0,
                applyMoney: 0,
                contractMoney: 0,
            },
            chartData: {xd: [], yd: []},
            ec: null,
            loadCount: 0,

            payParam: {
                type: '0',
                startDate: null,
                endDate: null,
            },
            payDialog: false,
        }),
        created() {
            this.$nextTick(() => {
                this.init()
            })
        },
        methods: {
            showPaymentDetail(type) {
                this.payParam.startDate = this.startDate
                this.payParam.endDate = this.endDate
                this.payParam.type = type + ''
                this.payDialog = true
            },
            loadData() {
                getProMoneyByDate(this.startDate, this.endDate).then(result => {
                    this.c.proMoney = result.toFixed(2)
                })
                getPutMoney(this.startDate, this.endDate).then(result => {
                    this.c.putMoney = result.toFixed(2)
                })
                getApplyMoneyByDate({startDate: this.startDate, endDate: this.endDate, state: 1}).then(result => {
                    this.c.payMoney = result.toFixed(2)
                })
                getApplyMoneyByDate({startDate: this.startDate, endDate: this.endDate, state: 0}).then(result => {
                    result = result || 0
                    this.c.applyMoney = result.toFixed(2)
                })
                getContractMoney({startDate: this.startDate, endDate: this.endDate}).then(result => {
                    result = result || 0
                    this.c.contractMoney = result.toFixed(2)
                })

                this.loadDetail()
            },
            loadDetail() {
                let ms = this.getMonth(this.startDate, this.endDate)
                this.chartData = {xd: [], yd: []}
                this.loadCount = ms.length
                let queryStart = [], queryEnd = []
                for (let i = 0; i < ms.length; i++) {
                    let d = new Date(this.startDate)
                    d.setMonth(ms[i] - 1)
                    let endDate = this.getMonthEnd(d)
                    if (i > 0) {
                        d = this.getMonthFirst(d)
                    } else {
                        d = this.formatTimer(d)
                    }
                    queryStart.push(d)
                    queryEnd.push(endDate)
                }
                this.loadPutMoney(queryStart, queryEnd)
            },
            loadPutMoney(s, e) {
                getPutMoneyByDate(s.join(","), e.join(",")).then(result => {
                    /*for (const key in result) {
                        this.chartData.xd.push(key.substring(5, 7))
                        this.chartData.yd.push(result[key] || 0)
                    }*/
                    for (let i = 0; i < s.length; i++) {
                        this.chartData.xd.push(s[i])
                        this.chartData.yd.push(result[s[i]].toFixed(2))
                    }
                    this.loadPutChart(this.chartData)
                    /*this.chartData.xd.push(result.substring(5, 7))
                    this.chartData.yd.splice(this.chartData.xd.indexOf(s.substring(5, 7)), 0, result || 0)
                    this.loadCount--;
                    if (this.loadCount === 0) {
                        this.loadPutChart(this.chartData)
                    }*/
                })
            },
            loadPutChart(data) {
                let option = {
                    xAxis: {
                        type: 'category',
                        data: data.xd
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            data: data.yd,
                            type: 'line',
                            smooth: true
                        }
                    ],
                    tooltip: {
                        trigger: 'axis'
                    },
                };
                this.ec.setOption(option);
            },
            init() {
                let div = document.getElementById("chart")
                div.style.height = "300px"
                this.ec = echarts.init(div)
            }
        }
    }
</script>

<style scoped>

</style>