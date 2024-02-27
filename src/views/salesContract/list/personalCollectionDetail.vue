<template style="width: 80%">
    <v-card>
        <v-row>
            <v-col cols="12" md="1" sm="1" style="display: flex">
                <v-btn :loading="loading" style="margin-left: 10px;" @click="exportEX">导出</v-btn>
            </v-col>
            <v-col
                    cols="8"
                    sm="2"

            >
                <v-select
                        v-model="queryItem.choice"
                        :items="items"
                        label="筛选条件"
                        dense
                ></v-select>
            </v-col>
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
            <v-col
                    cols="8"
                    sm="2"

            >
                <span>已收合计：{{this.myAmountHadTotal}}</span>
            </v-col>
            <v-col
                    cols="8"
                    sm="2"

            >
                <span>待收合计：{{this.myAmountWouldTotal}}</span>
            </v-col>
            <v-spacer></v-spacer>
            <v-col
                    cols="8"
                    sm="2"

            >
                <v-text-field
                        v-model="queryItem.search"
                        append-icon="mdi-magnify"
                        label="搜索"
                        single-line
                        hide-details
                        style="margin-top: -22px"
                ></v-text-field>
            </v-col>
        </v-row>

        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
        >
            <template v-slot:item.actions="{ item }">
                <v-icon
                        small
                        class="mr-2"
                        @click="showAgreement(item)"
                >
                    合同明细
                </v-icon>
            </template>
        </v-data-table>
        <v-dialog v-model="showSalesContract" max-width="1600px">
            <v-card>
                <v-card-title>工程合同明细</v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                项目地址：{{salesContract.projectBase}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                合同名称：{{salesContract.agreementName}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                合同编号：{{salesContract.agreementID}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                合同金额(￥)：{{salesContract.agreementMoney}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.retentionMoney != null && salesContract.retentionMoney != ''"
                            >
                                质保金额(￥)：{{salesContract.retentionMoney}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.retentionPercent != null && salesContract.retentionPercent != ''"
                            >
                                质保比例(%)：{{salesContract.retentionPercent}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.tax != null && salesContract.tax != ''"
                            >
                                税率(%)：{{salesContract.tax}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                签订日期：{{salesContract.signDate | formatTimer}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.pDate != null && salesContract.pDate != ''"
                            >
                                质保到期时间：{{salesContract.pDate | formatTimer}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                账期(天)：{{salesContract.paymentDays}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                单位名称：{{salesContract.companyName}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.companyAddress != null && salesContract.companyAddress != ''"
                            >
                                单位地址：{{salesContract.companyAddress}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.bankName != null && salesContract.bankName != ''"
                            >
                                开户银行：{{salesContract.bankName}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.bankAccount != null && salesContract.bankAccount != ''"
                            >
                                银行账户：{{salesContract.bankAccount}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                                    v-if="salesContract.remark != null && salesContract.remark != ''"
                            >
                                备注：{{salesContract.remark}}
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-data-table
                        :headers="collectHeaders"
                        :items="collectDesserts"
                        :items-per-page="5"
                        class="elevation-1"
                >
                </v-data-table>
            </v-card>
        </v-dialog>
    </v-card>

</template>
<script>
    import salesContractApi from '@/api/salesContract';
    import {collectList,exportCollectList} from "../../../api/collect";

    export default {
        name: 'collectionDetail',
        data: () => ({
            items: ['已审核', '未审核', '超期未审核'],
            choice: null,

            options: {},
            totalDesserts: null,

            menu: false,
            menu2: false,

            loading: false,

            showSalesContract: false,
            salesContract: {},

            myAmountHadTotal: null,
            myAmountWouldTotal: null,

            headers: [
                {text: '合同名称', value: 'agreementName', sortable: false},
                // {text: '合同金额', value: 'agreementMoney', sortable: false},
                {text: '预收款日期', value: 'pDate', sortable: false},
                {text: '收款日期', value: 'collect_time', sortable: false},
                {text: '收款金额', value: 'collectMoney', sortable: false},
                {text: '审核状态', value: 'status', sortable: false},
                {text: '登记人', value: 'registrant', sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],

            collectHeaders: [
                {
                    text: '收款编号',
                    align: 'start',
                    sortable: false,
                    value: 'collectID',
                },
                {text: '收款金额(￥)', value: 'collectMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '预收款日期', value: 'pDate'},
                {text: '收款日期', value: 'createTime'},
                {text: '登记人', value: 'registrant'},
                {text: '登记状态', value: 'status', sortable: false},
            ],
            collectDesserts: [],

            queryItem: {
                choice: null,
                search: null,
                startDate: null,
                endDate: null,
                sortName: 'create_time2',
                sortOrder: 'desc',
                itemsPerPage: null,
                page: null,
                ifMine: true,
            }
        }),

        watch: {
            options: {
                handler() {
                    this.loadCollectList()
                },
                deep: true,
            },

            'queryItem.choice': {
                handler() {
                    this.loadCollectList()
                },
                deep: true,
            },

            'queryItem.search': {
                handler() {
                    this.loadCollectList()
                },
                deep: true,
            },

            'queryItem.endDate': {
                handler() {
                    this.loadCollectList()
                },
                deep: true,
            }
        },

        created() {
            this.initDate()
        },
        filters: {
            formatTimer: function (value) {
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
        },

        methods: {
            initDate() {
                var date = this.formatYearMonth(new Date())
                var YYYY = date.substr(0, 4)
                var MM = date.substr(5, 2)
                this.queryItem.startDate = YYYY + '-' + MM + '-' + '01'
                this.queryItem.endDate = YYYY + '-' + MM + '-' + this.getDaysInMonth(MM, YYYY)
                console.log(this.queryItem
                )

            },
            getDaysInMonth(month, year) {
                var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (month == '02' || month == 2) {
                    year = parseInt(year);
                    daysInMonth[1] = (((0 == year % 4) && (0 != (year % 100))) ||
                        (0 == year % 400)) ? 29 : 28;
                }
                var flag = month.substr(0, 1);
                if (flag == 0) {
                    month = month.substr(1, 1);
                }
                return daysInMonth[month - 1];
            },
            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },

            loadCollectList() {
                this.queryItem.itemsPerPage = this.options.itemsPerPage
                this.queryItem.page = this.options.page

                collectList(this.queryItem).then(result => {
                    for (let x = 0; x < result.collections.length; x++) {
                        if (result.collections[x].pDate != "" && result.collections[x].pDate != null) {
                            result.collections[x].pDate = this.formatTimer(result.collections[x].pDate)
                        } else if (result.collections[x].pDate == '' || result.collections[x].pDate == null) {
                            result.collections[x].pDate = '';
                        }
                        if (result.collections[x].createTime != "" && result.collections[x].createTime != null) {
                            result.collections[x].createTime = this.formatTimer(result.collections[x].createTime)
                        } else {
                            result.collections[x].createTime = '';
                        }
                    }
                    this.totalDesserts = result.total
                    this.desserts = result.collections
                    this.myAmountHadTotal = result.myAmountHadTotal
                    this.myAmountWouldTotal = result.myAmountWouldTotal
                })
            },

            exportEX(){
                this.loading = true;

                exportCollectList(this.queryItem).then(result => {
                    let a = document.createElement("a")
                    a.download = result
                    a.href = result
                    a.click()
                    console.log(a)
                }).finally(() => {
                    this.loading = false;
                })
            },

            showAgreement(item) {
                this.showSalesContract = true
                salesContractApi.getAgreementMSG(item).then(result => {
                    this.salesContract = result.salesContract
                })
                salesContractApi.getCollect({agreementID: item.agreementID}).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        if (result.rows[x].pDate != "" && result.rows[x].pDate != null) {
                            result.rows[x].pDate = this.formatTimer(result.rows[x].pDate)
                        } else if (result.rows[x].pDate == '' || result.rows[x].pDate == null) {
                            result.rows[x].pDate = '';
                        }
                        if (result.rows[x].createTime != "" && result.rows[x].createTime != null) {
                            result.rows[x].createTime = this.formatTimer(result.rows[x].createTime)
                        } else {
                            result.rows[x].createTime = '';
                        }
                    }
                    this.collectDesserts = result.rows
                })
            },

        }
    }
</script>
