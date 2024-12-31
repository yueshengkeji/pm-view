<template>
    <div>
        <v-row no-gutters>
            <v-col cols="6"
                   md="3">
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
                        @change="monthChange"

                    >
                        <v-spacer></v-spacer>
                    </v-date-picker>
                </v-menu>

                <v-card>
                    <v-card-title>{{dateSearch}}</v-card-title>
                    <v-card-text style="font-size: 18px;font-weight: bold">
                        <span style="line-height: 3">应收总额：{{ moneyTotalAmounts }}元</span><br>
                        <span style="line-height: 3">抵扣总额：{{ sjMoneyTotalAmounts }}元</span><br>
                        <span style="line-height: 3">实收总额：{{ payMoneyTotalAmounts }}元</span><br>
                        <span style="line-height: 3">收款收缴率：{{ receivePercentTotal }}%</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6" md="1">
                <v-divider
                        class="mx-4"
                        vertical
                ></v-divider>
            </v-col>
            <v-col cols="12"
                   sm="6"
                   md="8">
                <v-card>
                    <v-data-table
                            :headers="headers"
                            :items="desserts"
                            :items-per-page="10"
                            class="elevation-1"
                            dense
                            @dblclick:row="loadBills"
                    >
                        <template v-slot:top>
                            <v-toolbar
                                    flat
                            >
                                <v-toolbar-title><span style="font-weight: bold;font-size: 20px">{{ dateSearch }}</span>招商数据分析日报表
                                </v-toolbar-title>
                                <v-divider
                                        class="mx-4"
                                        inset
                                        vertical
                                ></v-divider>
                                <v-spacer></v-spacer>

                            </v-toolbar>
                        </template>

                    </v-data-table>
                </v-card>
                <div style="width: 100%;margin-top: 20px">
                    <v-card>
                        <div id="selectEChartId" align="center" style="width: 100%;height: 350px;margin: auto"></div>
                    </v-card>
                </div>
            </v-col>
        </v-row>

        <v-dialog v-model="showDialog">
            <v-data-table :items="data.rows"
                          :loading="loading"
                          :options.sync="options"
                          :headers="headersShow"
                          :server-items-length="data.total">
                <template v-slot:item.brand="{item}">
                    <v-chip small outlined @click="showTermHandler($event,item)">{{ item.brand }}</v-chip>
                </template>
                <template v-slot:item.state="{item}">
                    {{ formatState(item.state) }}
                </template>
                <template v-slot:item.concatType="{item}">
                    {{ formatConcat(item.concatType) }}
                </template>
                <template v-slot:item.invoiceState="{item}">
                    {{ formatInvoiceState(item.invoiceState) }}
                </template>
                <template v-slot:item.arrearageDay="{item}">
                    <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
                </template>

            </v-data-table>
        </v-dialog>

    </div>
</template>
<script>
import {zjDayReport} from "@/api/zjReport";
import {getBillList} from "@/api/zujin";
import * as echarts from 'echarts/core';
import {
    ToolboxComponent,
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
    LegendComponent,
} from 'echarts/components';
import {BarChart, LineChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';

echarts.use([
    ToolboxComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DataZoomComponent,
    BarChart,
    LineChart,
    CanvasRenderer
]);

export default {
    name: 'listReportDay',
    data: () => ({
        headers: [
            {text: '月份', value: 'date'},
            {text: '应收金额', value: 'moneyTotal'},
            {text: '抵扣金额', value: 'sjMoneyTotal'},
            {text: '实收金额', value: 'payMoneyTotal'},
            {text: '收款收缴率', value: 'receivePercent'},
        ],
        desserts: [],
        dateSearch: '',
        yearItems: [],
        dateNow: '',
        menu:false,

        moneyTotalAmounts: 0.00,
        sjMoneyTotalAmounts: 0.00,
        payMoneyTotalAmounts: 0.00,
        receivePercentTotal: 0,

        //
        queryBillParams: {
            startDate: null,
            endDate: null,
            name: '租金'
        },
        showDialog: false,
        loading: false,
        options: {},
        data: {
            rows: [],
            total: 0
        },
        headersShow: [
            {text: '状态', value: 'state'},
            {text: '欠费天数', value: 'arrearageDay'},
            {text: '铺位号', value: 'room'},
            {text: '楼层', value: 'floor'},
            {text: '品牌', value: 'brand'},
            {text: '费用名称', value: 'name'},
            {text: '应收日期', value: 'payEndDate'},
            {text: '区间开始日期', value: 'startDate'},
            {text: '区间截止日期', value: 'endDate'},
            {text: '应收金额', value: 'money'},
            {text: '已收金额', value: 'payMoney'},
            {text: '已退金额', value: 'backMoney'},
            {text: '抵扣金额', value: 'sjMoney'},
            {text: '欠费金额', value: 'arrearage'},
            {text: '合同类型', value: 'concatType'},
            {text: '开票状态', value: 'invoiceState'},
            {text: '合同登记人', value: 'concat.staffName'},
        ],

        //echarts
        selectEChart: null,
    }),
    watch: {
        options: {
            handler() {
                this.loadBillsData()
            },
            deep: true
        },
    },

    created() {
        this.init()
    },

    mounted() {
        this.initSelectEChartId()
    },

    methods: {
        init() {
            console.log('date', new Date().getDate())
            var nowYear = new Date().getFullYear()
            var nowMonth = new Date().getMonth() + 1
            if (nowMonth < 10){
                nowMonth = '0' + nowMonth
            }
            this.dateSearch = nowYear + "-" + nowMonth

            this.load()
        },
        initSelectEChartId() {
            var chartDom = document.getElementById('selectEChartId');
            this.selectEChart = echarts.init(chartDom);
        },
        monthChange(){
            this.$refs.menu.save(this.dateSearch)
            this.load()
        },
        load() {
            zjDayReport({yearMonth: this.dateSearch + ''}).then(res => {
                this.moneyTotalAmounts = 0
                this.sjMoneyTotalAmounts = 0
                this.payMoneyTotalAmounts = 0
                this.receivePercentTotal = 0
                this.desserts = res.zujinReportDataList
                this.moneyTotalAmounts = res.moneyTotalAmounts
                this.sjMoneyTotalAmounts = res.sjMoneyTotalAmounts
                this.payMoneyTotalAmounts = res.payMoneyTotalAmounts

                if (this.moneyTotalAmounts - this.sjMoneyTotalAmounts > 0){
                    this.receivePercentTotal = (this.payMoneyTotalAmounts * 100 / (this.moneyTotalAmounts - this.sjMoneyTotalAmounts)).toFixed(2)
                }

                let options = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow',
                            label: {
                                show: true
                            }
                        }
                    },
                    legend: {
                        data: ['应收金额', '抵扣金额', '实收金额', '收款收缴率',]
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,

                    grid: {
                        top: '12%',
                        left: '1%',
                        right: '10%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: res.YMD
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value} 元'
                            }
                        },
                        {
                            type: 'value',
                            name: '收款收缴率',
                            min: 0,
                            max: 100,
                            interval: 20,
                            axisLabel: {
                                formatter: '{value} %'
                            }
                        }
                    ],
                    dataZoom: [
                        {
                            show: false,
                            start: 0,
                            end: 100
                        },
                        {
                            type: 'inside',
                            start: 94,
                            end: 100
                        },
                        {
                            show: false,
                            yAxisIndex: 0,
                            filterMode: 'empty',
                            width: 30,
                            height: '80%',
                            showDataShadow: false,
                            left: '93%'
                        }
                    ],
                    series: [
                        {
                            name: '应收金额',
                            type: 'bar',
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' 元';
                                }
                            },
                            data: res.moneyList
                        },
                        {
                            name: '实收金额',
                            type: 'bar',
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' 元';
                                }
                            },
                            data: res.payMoneyList
                        },
                        {
                            name: '抵扣金额',
                            type: 'bar',
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' 元';
                                }
                            },
                            data: res.sjMoneyList
                        },
                        {
                            name: '收款收缴率',
                            type: 'line',
                            yAxisIndex: 1,
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' %';
                                }
                            },
                            data: res.receivePercentList
                        }
                    ]
                }
                this.selectEChart.setOption(options)
            })
        },
        loadBills(event, row) {
            this.queryBillParams.startDate = row.item.date + ' 00:00:00'
            this.queryBillParams.endDate = row.item.date + ' 23:59:59'
            this.loadBillsData()
        },
        loadBillsData(){
            getBillList(this.queryBillParams).then(res => {
                this.data = res
                this.showDialog = true
            })
        },
        formatState(state) {
            switch (state) {
                case 'wait':
                    return '未支付'
                case 'pay':
                    return '部分支付'
                case '1':
                    return '已支付'
            }
        },
        formatConcat(state) {
            switch (state) {
                case '0':
                    return '租赁合同'
                case '2':
                    return '多经类合同'
                case '1':
                    return '物业合同'
            }
        },
        formatInvoiceState(state) {
            switch (state) {
                case 1:
                    return '已开票'
                default:
                case 0:
                    return '未开票'
            }
        },
    }
}
</script>