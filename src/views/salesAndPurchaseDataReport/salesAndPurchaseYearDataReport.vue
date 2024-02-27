<template>
    <div>

            <div style="margin: auto">
                <v-row style="margin: auto;display: flex;align-items: center;justify-content: center">
                    <h2>{{tableTitle}}销售与采购合同数据报表</h2>
                    <v-col
                            cols="11"
                            sm="2">
                        <v-combobox
                                v-model="yearSelect"
                                :items="yearItems"
                                label="选择年份"
                                aria-required="true"
                                oninput="value=value.replace(/[^\d]/g,'')"
                                @change="yearChanged"
                        ></v-combobox>
                    </v-col>
                </v-row>
            </div>

        <br>
        <div style="margin: auto;width: 90%;font-family: '微软雅黑 Light'" :v-show="yearShow">
            <div style="width: 66%;margin: auto;float: left">
                <v-card>
                    <div id="chart" align="center" style="width: 100%;height: 600px;margin: auto"></div>
                </v-card>
            </div>

            <div style="width: 33%;float: right">
                <div style="width:40%;height:600px;text-align: center;float: left;margin-left: 20px">
                    <v-card style="height: 90px;margin: auto;background: #24ee1a"
                    >
                        <v-card-text style="font-size: 20px">
                            <strong>工程合同总额：<br>{{ yearTotalSalesMoney }}</strong>
                        </v-card-text>
                    </v-card>
                    <br>
                    <v-card style="height: 90px;margin: auto;background: #5470c6">

                        <v-card-text style="font-size: 20px">
                            <strong>开票合计：<br>{{yearTotalInvoice}}</strong>
                        </v-card-text>

                    </v-card>
                    <br>
                    <v-card style="height: 90px;margin: auto;background: #91cc75">
                        <v-card-text style="font-size: 20px">
                            <strong>收款合计：<br>{{yearTotalReceive}}</strong>
                        </v-card-text>

                    </v-card>
                    <br>

                    <v-card style="height: 90px;margin: auto;background: #91cc75">
                        <v-card-text style="font-size: 20px">
                            <strong>逾期待收合计：<br>0</strong>
                        </v-card-text>

                    </v-card>
                    <br>
                    <v-card style="height: 90px;margin: auto;background: #ee0754">
                        <v-card-text style="font-size: 20px">
                            <strong>应缴税额：<br>{{yearTaxAmount}}</strong>
                        </v-card-text>

                    </v-card>


                </div>
                <br>
                <br>
                <div style="width:40%;height:600px;text-align: center;float: right;margin-top: -48px">

                    <v-card style="height: 90px;margin: auto;background: #eeea1d">
                        <v-card-text style="font-size: 20px;" >
                            <strong>采购合同总额：<br>{{yearTotalPurchaseMoney}}</strong>
                        </v-card-text>


                    </v-card>
                    <br>
                    <v-card style="height: 90px;margin: auto;background: #fac858">
                        <v-card-text style="font-size: 20px">
                            <strong>收票合计：<br>{{yearTotalCollected}}</strong>
                        </v-card-text>


                    </v-card>
                    <br>
                    <v-card style="height: 90px;margin: auto;background: #ee6666">
                        <v-card-text style="font-size: 20px">
                            <strong>支付合计：<br>{{yearTotalPay}}</strong>
                        </v-card-text>


                    </v-card>
<br>
                    <v-card style="height: 90px;margin: auto;background: #ee6666">
                        <v-card-text style="font-size: 20px">
                            <strong>申请中合计：<br>{{yearTotalPay}}</strong>
                        </v-card-text>


                    </v-card>

                </div>
            </div>
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
        name: 'salesAndPurchaseYearDataReport',
        data: () => ({

            myECharts: null,
            height: 0,
            invoiceYearData: null,//开票
            collectedYearData: null,//收票
            payYearData: null,//支出
            receiveYearData: null,//收款
            yearTotalInvoice: null,
            yearTotalCollected: null,
            yearTotalPay: null,
            yearTotalReceive: null,
            yearTaxAmount: null,
            yearTotalSalesMoney: null,
            yearTotalPurchaseMoney: null,
            salesData: null,
            purchaseData: null,

            allTotalInvoice: null,
            allTotalCollected: null,
            allTotalPay: null,
            allTotalReceive: null,
            allTaxAmount: null,
            allTotalSalesMoney: null,
            allTotalPurchaseMoney: null,

            // menu: false,
            dateSearch: null,

            yearSelect: null,
            yearItems: ['全部'],

            yearShow: true,
            tableTitle: null,

            // myPieChart1: null,
            // myPieChart2: null,
            // myPieChart3: null,
            // myPieChart4: null,
            // myPieChart5: null,
            // myPieChart6: null,
            // myPieChart7: null,
        }),
        created() {
            this.loadYearDataMSG()
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

            loadYearDataMSG() {
                var dateYM = this.formatYearMonth(new Date())
                var nowYear = dateYM.substring(0, 4)
                this.yearSelect = nowYear
                this.tableTitle = this.yearSelect + '年'
                for (let i = 0; i < 20; i++) {
                    this.yearItems.push(nowYear - i)
                }

                spDataReportApi.getYearData({dateSearch: nowYear}).then(result => {
                    if (result != null) {
                        this.invoiceYearData = result.invoiceYearData;
                        this.collectedYearData = result.collectedYearData;
                        this.payYearData = result.payYearData;
                        this.receiveYearData = result.receiveYearData;
                        this.salesData = result.salesData;
                        this.purchaseData = result.purchaseData;
                        this.yearTotalInvoice = this.formatMoney(result.yearTotalInvoice);
                        this.yearTotalCollected = this.formatMoney(result.yearTotalCollected);
                        this.yearTotalPay = this.formatMoney(result.yearTotalPay);
                        this.yearTotalReceive = this.formatMoney(result.yearTotalReceive);
                        this.yearTotalSalesMoney = this.formatMoney(result.yearTotalSalesMoney);
                        this.yearTotalPurchaseMoney = this.formatMoney(result.yearTotalPurchaseMoney);
                        this.yearTaxAmount = this.formatMoney(result.yearTaxAmount);
                    }
                    this.load()


                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
            load() {
                this.myECharts.clear();

                const labelOption = {
                    show: true,
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
                if (this.yearSelect == '全部'){
                    labelOption.fontSize = 15;
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
                                data: ['全部']
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
                                barWidth:30,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [this.allTotalInvoice]
                            },
                            {
                                name: '收款',
                                type: 'bar',
                                label: labelOption,
                                barWidth:30,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [this.allTotalReceive]
                            },
                            {
                                name: '收票',
                                type: 'bar',
                                label: labelOption,
                                barWidth:30,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [this.allTotalCollected]
                            },
                            {
                                name: '支付',
                                type: 'bar',
                                label: labelOption,
                                barWidth:30,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: [this.allTotalPay]
                            }
                        ]
                    };
                    this.myECharts.setOption(option);

                }else {
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
                                data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
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
                                data: this.invoiceYearData
                            },
                            {
                                name: '收款',
                                type: 'bar',
                                label: labelOption,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: this.receiveYearData
                            },
                            {
                                name: '收票',
                                type: 'bar',
                                label: labelOption,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: this.collectedYearData
                            },
                            {
                                name: '支付',
                                type: 'bar',
                                label: labelOption,
                                emphasis: {
                                    focus: 'series'
                                },
                                data: this.payYearData
                            }
                        ]
                    };
                    this.myECharts.setOption(option);
                }

                // let optionPieChart1 = {
                //     title: {
                //         text: '销售总额',
                //         subtext: this.yearTotalSalesMoney,
                //         left: 'center'
                //     },
                //     tooltip: {
                //         trigger: 'item'
                //     },
                //     series: [
                //         {
                //             type: 'pie',
                //             radius: '50%',
                //             data: [
                //                 {value: this.salesData[0], name: '一月'},
                //                 {value: this.salesData[1], name: '二月'},
                //                 {value: this.salesData[2], name: '三月'},
                //                 {value: this.salesData[3], name: '四月'},
                //                 {value: this.salesData[4], name: '五月'},
                //                 {value: this.salesData[5], name: '六月'},
                //                 {value: this.salesData[6], name: '七月'},
                //                 {value: this.salesData[7], name: '八月'},
                //                 {value: this.salesData[8], name: '九月'},
                //                 {value: this.salesData[9], name: '十月'},
                //                 {value: this.salesData[10], name: '十一月'},
                //                 {value: this.salesData[11], name: '十二月'}
                //             ],
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                 }
                //             }
                //         }
                //     ]
                // };
                // this.myPieChart1.setOption(optionPieChart1)
                //
                // let optionPieChart2 = {
                //     title: {
                //         text: '开票合计',
                //         subtext: this.yearTotalInvoice,
                //         left: 'center'
                //     },
                //     tooltip: {
                //         trigger: 'item'
                //     },
                //     series: [
                //         {
                //             type: 'pie',
                //             radius: '50%',
                //             data: [
                //                 {value: this.invoiceYearData[0], name: '一月'},
                //                 {value: this.invoiceYearData[1], name: '二月'},
                //                 {value: this.invoiceYearData[2], name: '三月'},
                //                 {value: this.invoiceYearData[3], name: '四月'},
                //                 {value: this.invoiceYearData[4], name: '五月'},
                //                 {value: this.invoiceYearData[5], name: '六月'},
                //                 {value: this.invoiceYearData[6], name: '七月'},
                //                 {value: this.invoiceYearData[7], name: '八月'},
                //                 {value: this.invoiceYearData[8], name: '九月'},
                //                 {value: this.invoiceYearData[9], name: '十月'},
                //                 {value: this.invoiceYearData[10], name: '十一月'},
                //                 {value: this.invoiceYearData[11], name: '十二月'}
                //             ],
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                 }
                //             }
                //         }
                //     ]
                // };
                // this.myPieChart2.setOption(optionPieChart2)
                //
                // let optionPieChart3 = {
                //     title: {
                //         text: '收款合计',
                //         subtext: this.yearTotalReceive,
                //         left: 'center'
                //     },
                //     tooltip: {
                //         trigger: 'item'
                //     },
                //     series: [
                //         {
                //             type: 'pie',
                //             radius: '50%',
                //             data: [
                //                 {value: this.receiveYearData[0], name: '一月'},
                //                 {value: this.receiveYearData[1], name: '二月'},
                //                 {value: this.receiveYearData[2], name: '三月'},
                //                 {value: this.receiveYearData[3], name: '四月'},
                //                 {value: this.receiveYearData[4], name: '五月'},
                //                 {value: this.receiveYearData[5], name: '六月'},
                //                 {value: this.receiveYearData[6], name: '七月'},
                //                 {value: this.receiveYearData[7], name: '八月'},
                //                 {value: this.receiveYearData[8], name: '九月'},
                //                 {value: this.receiveYearData[9], name: '十月'},
                //                 {value: this.receiveYearData[10], name: '十一月'},
                //                 {value: this.receiveYearData[11], name: '十二月'}
                //             ],
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                 }
                //             }
                //         }
                //     ]
                // };
                // this.myPieChart3.setOption(optionPieChart3)
                //
                // let optionPieChart4 = {
                //     title: {
                //         text: '采购总额',
                //         subtext: this.yearTotalPurchaseMoney,
                //         left: 'center'
                //     },
                //     tooltip: {
                //         trigger: 'item'
                //     },
                //     series: [
                //         {
                //             type: 'pie',
                //             radius: '50%',
                //             data: [
                //                 {value: this.purchaseData[0], name: '一月'},
                //                 {value: this.purchaseData[1], name: '二月'},
                //                 {value: this.purchaseData[2], name: '三月'},
                //                 {value: this.purchaseData[3], name: '四月'},
                //                 {value: this.purchaseData[4], name: '五月'},
                //                 {value: this.purchaseData[5], name: '六月'},
                //                 {value: this.purchaseData[6], name: '七月'},
                //                 {value: this.purchaseData[7], name: '八月'},
                //                 {value: this.purchaseData[8], name: '九月'},
                //                 {value: this.purchaseData[9], name: '十月'},
                //                 {value: this.purchaseData[10], name: '十一月'},
                //                 {value: this.purchaseData[11], name: '十二月'}
                //             ],
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                 }
                //             }
                //         }
                //     ]
                // };
                // this.myPieChart4.setOption(optionPieChart4)
                //
                // let optionPieChart5 = {
                //     title: {
                //         text: '收票合计',
                //         subtext: this.yearTotalCollected,
                //         left: 'center'
                //     },
                //     tooltip: {
                //         trigger: 'item'
                //     },
                //     series: [
                //         {
                //             type: 'pie',
                //             radius: '50%',
                //             data: [
                //                 {value: this.collectedYearData[0], name: '一月'},
                //                 {value: this.collectedYearData[1], name: '二月'},
                //                 {value: this.collectedYearData[2], name: '三月'},
                //                 {value: this.collectedYearData[3], name: '四月'},
                //                 {value: this.collectedYearData[4], name: '五月'},
                //                 {value: this.collectedYearData[5], name: '六月'},
                //                 {value: this.collectedYearData[6], name: '七月'},
                //                 {value: this.collectedYearData[7], name: '八月'},
                //                 {value: this.collectedYearData[8], name: '九月'},
                //                 {value: this.collectedYearData[9], name: '十月'},
                //                 {value: this.collectedYearData[10], name: '十一月'},
                //                 {value: this.collectedYearData[11], name: '十二月'}
                //             ],
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                 }
                //             }
                //         }
                //     ]
                // };
                // this.myPieChart5.setOption(optionPieChart5)
                //
                // let optionPieChart6 = {
                //     title: {
                //         text: '支付合计',
                //         subtext: this.yearTotalPay,
                //         left: 'center'
                //     },
                //     tooltip: {
                //         trigger: 'item'
                //     },
                //     series: [
                //         {
                //             type: 'pie',
                //             radius: '50%',
                //             data: [
                //                 {value: this.payYearData[0], name: '一月'},
                //                 {value: this.payYearData[1], name: '二月'},
                //                 {value: this.payYearData[2], name: '三月'},
                //                 {value: this.payYearData[3], name: '四月'},
                //                 {value: this.payYearData[4], name: '五月'},
                //                 {value: this.payYearData[5], name: '六月'},
                //                 {value: this.payYearData[6], name: '七月'},
                //                 {value: this.payYearData[7], name: '八月'},
                //                 {value: this.payYearData[8], name: '九月'},
                //                 {value: this.payYearData[9], name: '十月'},
                //                 {value: this.payYearData[10], name: '十一月'},
                //                 {value: this.payYearData[11], name: '十二月'}
                //             ],
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)'
                //                 }
                //             }
                //         }
                //     ]
                // };
                // this.myPieChart6.setOption(optionPieChart6)

            },
            init() {
                let divBar = document.getElementById("chart")
                this.myECharts = echarts.init(divBar)

                // let divPie1 = document.getElementById("pieChart1")
                // this.myPieChart1 = echarts.init(divPie1)
                // let divPie2 = document.getElementById("pieChart2")
                // this.myPieChart2 = echarts.init(divPie2)
                // let divPie3 = document.getElementById("pieChart3")
                // this.myPieChart3 = echarts.init(divPie3)
                // let divPie4 = document.getElementById("pieChart4")
                // this.myPieChart4 = echarts.init(divPie4)
                // let divPie5 = document.getElementById("pieChart5")
                // this.myPieChart5 = echarts.init(divPie5)
                // let divPie6 = document.getElementById("pieChart6")
                // this.myPieChart6 = echarts.init(divPie6)
                // let divPie7 = document.getElementById("pieChart7")
                // this.myPieChart7 = echarts.init(divPie7)
            },



            yearChanged() {
                this.tableTitle = this.yearSelect + '年'
                spDataReportApi.getYearData({dateSearch: this.yearSelect}).then(result => {
                    console.log(result)
                    if (result != null) {
                        if (this.yearSelect == '全部'){
                            this.allTotalInvoice = result.allTotalInvoice;
                            this.allTotalReceive = result.allTotalReceive;
                            this.allTotalCollected = result.allTotalCollected;
                            this.allTotalPay = result.allTotalPay;

                            this.yearTotalInvoice = this.formatMoney(result.allTotalInvoice);
                            this.yearTotalReceive = this.formatMoney(result.allTotalReceive);
                            this.yearTotalCollected = this.formatMoney(result.allTotalCollected);
                            this.yearTotalPay = this.formatMoney(result.allTotalPay);
                            this.yearTaxAmount = this.formatMoney(result.allTaxAmount);
                            this.yearTotalSalesMoney = this.formatMoney(result.allTotalSalesMoney);
                            this.yearTotalPurchaseMoney = this.formatMoney(result.allTotalPurchaseMoney);
                        }else {

                            this.invoiceYearData = result.invoiceYearData;
                            this.collectedYearData = result.collectedYearData;
                            this.payYearData = result.payYearData;
                            this.receiveYearData = result.receiveYearData;
                            this.salesData = result.salesData;
                            this.purchaseData = result.purchaseData;
                            this.yearTotalInvoice = this.formatMoney(result.yearTotalInvoice);
                            this.yearTotalCollected = this.formatMoney(result.yearTotalCollected);
                            this.yearTotalPay = this.formatMoney(result.yearTotalPay);
                            this.yearTotalReceive = this.formatMoney(result.yearTotalReceive);
                            this.yearTotalSalesMoney = this.formatMoney(result.yearTotalSalesMoney);
                            this.yearTotalPurchaseMoney = this.formatMoney(result.yearTotalPurchaseMoney);
                            this.yearTaxAmount = this.formatMoney(result.yearTaxAmount);
                        }
                    }
                    console.log(this.invoiceYearData)
                    this.load()


                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
        }
    }


</script>