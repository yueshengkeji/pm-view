<template>
    <div style="margin: auto">
        <v-row style="margin: auto;display: flex;align-items: center;justify-content: center">
            <h2>{{tableTitle}}销售与采购合同数据报表</h2>
            <v-col
                    cols="11"
                    sm="2">
                <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        :return-value.sync="dateSearch"
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                                v-model="dateSearch"
                                label="查询年月"
                                prepend-icon="mdi-calendar"
                                v-bind="attrs"
                                v-on="on"

                        ></v-text-field>
                    </template>
                    <v-date-picker
                            v-model="dateSearch"
                            type="month"
                            no-title
                            scrollable
                            @change="monthChanged"

                    >
                        <v-spacer></v-spacer>
                    </v-date-picker>
                </v-menu>
            </v-col>
        </v-row>

        <div style="width:100%;height:90px;text-align: center;margin: auto">
            <v-row style="margin: 10px">
                <v-card style="width:20%;height: 90px;margin: auto;background: #24ee1a"
                >
                    <v-card-text style="font-size: 20px">
                        <strong>工程合同总额：<br>{{ monthTotalSalesMoney }}</strong>
                    </v-card-text>
                </v-card>

                <v-card style="width:20%;height: 90px;margin: auto;background: #5470c6">

                    <v-card-text style="font-size: 20px">
                        <strong>开票合计：<br>{{monthTotalInvoice}}</strong>
                    </v-card-text>

                </v-card>

                <v-card style="width:20%;height: 90px;margin: auto;background: #91cc75">
                    <v-card-text style="font-size: 20px">
                        <strong>收款合计：<br>{{monthTotalReceive}}</strong>
                    </v-card-text>
                </v-card>

<v-card style="width:20%;height: 90px;margin: auto;background: #91cc75">
                    <v-card-text style="font-size: 20px">
                        <strong>逾期待收款：<br>0</strong>
                    </v-card-text>
                </v-card>
            </v-row>
        </div>
        <div style="width:100%;height:90px;text-align: center;margin: auto">
            <v-row style="margin: 10px;">
                <v-card style="width:20%;height: 90px;margin: auto;background: #eeea1d">
                    <v-card-text style="font-size: 20px;">
                        <strong>采购合同总额：<br>{{monthTotalPurchaseMoney}}</strong>
                    </v-card-text>
                </v-card>
                <br>
                <v-card style="width:20%;height: 90px;margin: auto;background: #fac858">
                    <v-card-text style="font-size: 20px">
                        <strong>收票合计：<br>{{monthTotalCollected}}</strong>
                    </v-card-text>
                </v-card>
                <br>
                <v-card style="width:20%;height: 90px;margin: auto;background: #ee6666">
                    <v-card-text style="font-size: 20px">
                        <strong>支付合计：<br>{{monthTotalPay}}</strong>
                    </v-card-text>
                </v-card>


                <br>
                <v-card style="width:20%;height: 90px;margin: auto;background: #ee6666">
                    <v-card-text style="font-size: 20px">
                        <strong>申请中合计：<br>0</strong>
                    </v-card-text>
                </v-card>
            </v-row>
        </div>

        <div style="width: 95%;margin: auto;">
            <v-card>
                <div id="chart" align="center" style="width: 100%;height: 600px;margin: auto"></div>
            </v-card>
        </div>
    </div>
</template>

<script>
    import * as echarts from 'echarts/core';
    import spDataReportApi from "@/api/spDataReport";
    import {
        ToolboxComponent,
        TooltipComponent,
        GridComponent,
        LegendComponent,
        TitleComponent,
    } from 'echarts/components';
    import {BarChart} from 'echarts/charts';
    import {CanvasRenderer} from 'echarts/renderers';
    // import {LabelLayout} from 'echarts/features';
    // import {PieChart} from 'echarts/charts';

    echarts.use([
        ToolboxComponent,
        TooltipComponent,
        GridComponent,
        LegendComponent,
        BarChart,
        CanvasRenderer,
        TitleComponent,
        // PieChart,
        // LabelLayout
    ]);

    export default {
        name: 'salesAndPurchaseMonthDataReport',
        data: () => ({
            invoiceMonthData: null,
            collectedMonthData: null,
            payMonthData: null,
            receiveMonthData: null,
            monthTotalInvoice: null,
            monthTotalCollected: null,
            monthTotalPay: null,
            monthTotalReceive: null,
            monthTotalSalesMoney: null,
            monthTotalPurchaseMoney: null,

            menu: false,
            dateSearch: null,

            tableTitle: null,
        }),

        created() {
            this.loadMonthDataMSG()
        },
        mounted() {
            this.$nextTick(() => {
                this.init()
            })
        },

        methods: {
            formatMoney(value) {
                //金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
                var str = (value).toFixed(2) + '';
                var intSum = str.substring(0, str.indexOf(".")).replace(/\B(?=(?:\d{3})+$)/g, ',');//取到整数部分
                var dot = str.substring(str.length, str.indexOf("."))//取到小数部分搜索
                var ret = intSum + dot;
                return ret;
            },

            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },

            loadMonthDataMSG() {
                var dateYM = this.formatYearMonth(new Date())
                this.tableTitle = dateYM
                this.dateSearch = dateYM

                spDataReportApi.getMonthData({dateSearch: dateYM}).then(result => {
                    console.log(result)
                    if (result != null) {
                        this.invoiceMonthData = result.invoiceMonthData;
                        this.collectedMonthData = result.collectedMonthData;
                        this.payMonthData = result.payMonthData;
                        this.receiveMonthData = result.receiveMonthData;
                        this.monthTotalInvoice = this.formatMoney(result.monthTotalInvoice);
                        this.monthTotalCollected = this.formatMoney(result.monthTotalCollected);
                        this.monthTotalPay = this.formatMoney(result.monthTotalPay);
                        this.monthTotalReceive = this.formatMoney(result.monthTotalReceive);
                        this.monthTotalSalesMoney = this.formatMoney(result.monthTotalSalesMoney);
                        this.monthTotalPurchaseMoney = this.formatMoney(result.monthTotalPurchaseMoney);
                    }

                    this.load()
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            load() {
                this.myECharts.clear();

                const labelOption = {
                    show: false,
                    rotate: 90,
                    align: 'left',
                    verticalAlign: 'middle',
                    position: 'insideBottom',
                    distance: 15,
                    formatter: '{c}  ',
                    fontSize: 10,
                    rich: {
                        name: {}
                    }
                };
                let option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: ['开票', '收款', '收票', '支付']
                    },
                    // toolbox: {
                    //     show: true,
                    //     orient: 'vertical',
                    //     left: 'right',
                    //     top: 'center',
                    //     feature: {
                    //         mark: { show: true },
                    //         dataView: { show: true, readOnly: false },
                    //         magicType: { show: true, type: ['line', 'bar', 'stack'] },
                    //         restore: { show: true },
                    //         saveAsImage: { show: true }
                    //     }
                    // },
                    xAxis: [
                        {
                            type: 'category',
                            axisTick: {show: false},
                            data: ['01日', '02日', '03日', '04日', '05日', '06日', '07日', '08日', '09日', '10日', '11日', '12日', '13日',
                                '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日', '25日', '26日', '27日', '28日', '29日', '30日', '31日',]
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '开票',
                            type: 'bar',
                            barGap: 0,
                            label: labelOption,
                            emphasis: {
                                focus: 'series'
                            },
                            data: this.invoiceMonthData
                        },
                        {
                            name: '收款',
                            type: 'bar',
                            label: labelOption,
                            emphasis: {
                                focus: 'series'
                            },
                            data: this.receiveMonthData
                        },
                        {
                            name: '收票',
                            type: 'bar',
                            label: labelOption,
                            emphasis: {
                                focus: 'series'
                            },
                            data: this.collectedMonthData
                        },
                        {
                            name: '支付',
                            type: 'bar',
                            label: labelOption,
                            emphasis: {
                                focus: 'series'
                            },
                            data: this.payMonthData
                        }
                    ]
                };
                this.myECharts.setOption(option);
            },

            init() {
                let divBar = document.getElementById("chart")
                this.myECharts = echarts.init(divBar)
            },

            monthChanged() {
                this.$refs.menu.save(this.dateSearch)
                this.tableTitle = this.dateSearch
                spDataReportApi.getMonthData({dateSearch: this.dateSearch}).then(result => {
                    if (result != null) {
                        this.invoiceMonthData = result.invoiceMonthData;
                        this.collectedMonthData = result.collectedMonthData;
                        this.payMonthData = result.payMonthData;
                        this.receiveMonthData = result.receiveMonthData;
                        this.monthTotalInvoice = this.formatMoney(result.monthTotalInvoice);
                        this.monthTotalCollected = this.formatMoney(result.monthTotalCollected);
                        this.monthTotalPay = this.formatMoney(result.monthTotalPay);
                        this.monthTotalReceive = this.formatMoney(result.monthTotalReceive);
                        this.monthTotalSalesMoney = this.formatMoney(result.monthTotalSalesMoney);
                        this.monthTotalPurchaseMoney = this.formatMoney(result.monthTotalPurchaseMoney);
                    }
                    this.load()
                }).catch(e => {
                    console.log("异常信息", e);
                });
            }
        }
    }
</script>