<template style="width: 80%">
    <v-card>
        <v-card-title>
            <v-col cols="11" md="2">
                <v-btn :loading="loading" @click="exportExcel">
                    导出
                </v-btn>
            </v-col>
            <v-col md="1" cols="12">
                <v-menu ref="menu1" v-model="menu1" :close-on-content-click="false">
                    <template v-slot:activator="{attrs,on}">
                        <v-text-field hide-details
                                      dense
                                      v-bind="attrs"
                                      v-on="on"
                                      v-model="queryItem.startDate"
                                      label="请指定开始日期"></v-text-field>
                    </template>
                    <v-date-picker v-model="queryItem.startDate" @change="$refs.menu1.save()"></v-date-picker>
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
<!--            <v-col-->
<!--                    cols="11"-->
<!--                    md="2"-->
<!--            >-->
<!--                <v-menu-->
<!--                        ref="menu"-->
<!--                        v-model="menu"-->
<!--                        :close-on-content-click="false"-->
<!--                        :return-value.sync="dateSearch"-->
<!--                        transition="scale-transition"-->
<!--                        offset-y-->
<!--                        max-width="290px"-->
<!--                        min-width="auto"-->
<!--                >-->
<!--                    <template v-slot:activator="{ on, attrs }">-->
<!--                        <v-text-field-->
<!--                                v-model="dateSearch"-->
<!--                                label="查询年月"-->
<!--                                prepend-icon="mdi-calendar"-->
<!--                                v-bind="attrs"-->
<!--                                v-on="on"-->

<!--                        ></v-text-field>-->
<!--                    </template>-->
<!--                    <v-date-picker-->
<!--                            v-model="dateSearch"-->
<!--                            type="month"-->
<!--                            no-title-->
<!--                            scrollable-->
<!--                            @change="monthChanged"-->
<!--                    >-->
<!--                    </v-date-picker>-->
<!--                </v-menu>-->
<!--            </v-col>-->
            <v-col
                    cols="11"
                    md="2"

            >
                <v-combobox v-model="tempCompany"
                            :search-input.sync="searchCompany"
                            :items="companyItems"
                            label="单位"
                            item-text="name"
                            return-object
                ></v-combobox>
            </v-col>

            <v-spacer></v-spacer>
            <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                    @change="searchChanged"
            ></v-text-field>
        </v-card-title>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                class="elevation-1"
                @dblclick:row="showInvoiceDetail"
        >
            <template v-slot:item.createTime="{ item }">
                <span>{{item.createTime | formatTimer}}</span>
            </template>

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
        <v-dialog v-model="showSalesContract" max-width="1000px">
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
                            >
                                质保金额(￥)：{{salesContract.retentionMoney}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                质保比例(%)：{{salesContract.retentionPercent}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                税率(%)：{{salesContract.tax}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                <v-btn
                                        color="primary"
                                        @click="showTaxList"
                                >其他税率类型
                                </v-btn>
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
                            >
                                单位地址：{{salesContract.companyAddress}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                开户银行：{{salesContract.bankName}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                银行账户：{{salesContract.bankAccount}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                联系人：{{salesContract.contactMan}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                联系方式：{{salesContract.phone}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                税号：{{salesContract.taxID}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                履约保证金(￥)：{{salesContract.performanceBond}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                履约保证金比例(%)：{{salesContract.performanceBondPercent}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"

                            >
                                决算金额(￥)：{{salesContract.finalAccounts}}
                            </v-col>
                            <v-col
                                    cols="12"
                                    sm="6"
                                    md="3"
                            >
                                备注：{{salesContract.remark}}
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogShowTaxList" width="500px">
            <v-card>
                <v-container>
                    <v-list dense>
                        <v-list-item-content v-if="salesContract.taxList.length == 0" v-text="'  无'"></v-list-item-content>
                        <v-list-item
                                v-for="(item, i) in salesContract.taxList"
                                :key="i"
                        >
                            <v-list-item-content
                                    v-text="'  金额占比：' + item.percentForAM + '% ,税率：' +item.taxExtra + '%'"></v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-container>
            </v-card>
        </v-dialog>
        <!--开票详情-->
        <v-dialog v-model="dialogInvoiceDetail">
            <v-card>
                <invoice-detail :id-item="invoiceDetailId"></invoice-detail>
            </v-card>
        </v-dialog>
    </v-card>

</template>
<script>
    import salesContractApi from '@/api/salesContract';
    import invoiceDetail from "../../components/invoiceDetail";
    import {list} from '@/api/company';
    import {invoiceList,exportInvoice} from "../../api/invoice";

    export default {
        name: 'salesInvoiceReport',
        components:{invoiceDetail},
        data: () => ({
            tempCompany: null,
            searchCompany: null,
            companyItems: [],

            dialogInvoiceDetail:false,
            invoiceDetailId:null,

            dialogShowTaxList: false,

            options: {},
            totalDesserts: null,

            menu: false,
            dateSearch: null,

            search: '',
            loading: false,

            showSalesContract: false,
            salesContract: {
              taxList:[]
            },

            headers: [
                {text: '序号', value: 'index'},
                {text: '合同名称', value: 'agreementName', sortable: false},
                {text: '单位名称', value: 'company', sortable: false},
                {text: '合同金额', value: 'agreementMoney', sortable: false},
                {text: '开票金额', value: 'invoiceMoney', sortable: false},
                {text: '开票时间', value: 'createTime', sortable: false,},
                {text: '预回款时间', value: 'returnDate', sortable: false},
                {text: '登记人', value: 'registrant', sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],

            menu1: false,
            menu2: false,
            queryItem: {
                search: null,
                startDate: null,
                endDate: null,
                sortName: 'create_time',
                sortOrder: 'desc',
                itemsPerPage: null,
                page: null,
                ifMine: false,
                company:null,
            }
        }),

        watch: {
            options: {
                handler() {
                    this.list()
                },
                deep: true,
            },
            searchCompany: {
                handler() {
                    if (this.searchCompany != null) {
                        this.getCompany(this.searchCompany)
                    }
                },
                deep: true,
            },
            tempCompany: {
                handler() {
                    if (this.tempCompany != null){
                        this.queryItem.company = this.tempCompany.name
                        this.list()
                    }
                }
            },
            'queryItem.search': {
                handler() {
                    this.list()
                },
                deep: true,
            },

            'queryItem.endDate': {
                handler() {
                    this.list()
                },
                deep: true,
            },

        },

        created() {
            this.initDate()
        },
        filters: {
            formatTimer: function (value) {
                if (value != null && value != '') {
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
                } else if (value == null || value == '') {
                    return '';
                }

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
            getCompany(str) {
                list(str).then(res => {
                    if (res.length > 0) {
                        this.companyItems = res
                    }
                })
            },
            showAgreement(item) {
                this.showSalesContract = true
                salesContractApi.getAgreementMSG(item).then(result => {
                    this.salesContract = result.salesContract
                })
            },
            showTaxList() {
                this.dialogShowTaxList = true
            },
            showInvoiceDetail(e,data){
                this.invoiceDetailId = data.item.id
                this.dialogInvoiceDetail = true
            },
            list(){
                this.queryItem.itemsPerPage = this.options.itemsPerPage
                this.queryItem.page = this.options.page
                invoiceList(this.queryItem).then(result => {
                    for (let x = 0; x < result.invoices.length; x++) {
                        if (result.invoices[x].returnDate != "" && result.invoices[x].returnDate != null) {
                            result.invoices[x].returnDate = this.formatTimer(result.invoices[x].returnDate)
                        } else if (result.invoices[x].returnDate == '' || result.invoices[x].returnDate == null) {
                            result.invoices[x].returnDate = '';
                        }
                    }
                    this.desserts = result.invoices
                    this.totalDesserts = result.totalDesserts
                })
            },
            exportExcel(){
                this.loading = true;
                exportInvoice(this.queryItem).then(result => {
                    let a = document.createElement("a")
                    a.download = result
                    a.href = result
                    a.click()
                    console.log(a)
                }).finally(() => {
                    this.loading = false;
                })
            },





            getByCompany(companyName) {
                salesContractApi.getByCompany({
                    company:companyName,
                    searchDate:this.searchDate,
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page}).then(result => {
                    for (let x = 0; x < result.invoices.length; x++) {
                        if (result.invoices[x].returnDate != "" && result.invoices[x].returnDate != null) {
                            result.invoices[x].returnDate = this.formatTimer(result.invoices[x].returnDate)
                        } else if (result.invoices[x].returnDate == '' || result.invoices[x].returnDate == null) {
                            result.invoices[x].returnDate = '';
                        }
                    }
                    this.desserts = result.invoices
                    this.totalDesserts = result.totalDesserts
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
            loadInvoiceMSG() {
                var dateYM = this.formatYearMonth(new Date())
                this.dateSearch = dateYM
                salesContractApi.getMonthInvoiceMSG({
                    dateSearch: dateYM,
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page
                }).then(result => {
                    for (let x = 0; x < result.invoices.length; x++) {
                        if (result.invoices[x].returnDate != "" && result.invoices[x].returnDate != null) {
                            result.invoices[x].returnDate = this.formatTimer(result.invoices[x].returnDate)
                        } else if (result.invoices[x].returnDate == '' || result.invoices[x].returnDate == null) {
                            result.invoices[x].returnDate = '';
                        }
                    }
                    this.desserts = result.invoices
                    this.totalDesserts = result.totalDesserts
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
            monthChanged() {
                this.$refs.menu.save(this.dateSearch)
                this.search = ''
                salesContractApi.getMonthInvoiceMSG({
                    dateSearch: this.dateSearch,
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page
                }).then(result => {
                    for (let x = 0; x < result.invoices.length; x++) {
                        if (result.invoices[x].returnDate != "" && result.invoices[x].returnDate != null) {
                            result.invoices[x].returnDate = this.formatTimer(result.invoices[x].returnDate)
                        } else if (result.invoices[x].returnDate == '' || result.invoices[x].returnDate == null) {
                            result.invoices[x].returnDate = '';
                        }
                    }
                    this.totalDesserts = result.totalDesserts
                    this.desserts = result.invoices
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
            exportExcel2() {
                this.loading = true;
                console.log(this.dateSearch)
                if (this.dateSearch == null){
                    this.dateSearch = this.formatYearMonth(new Date())
                }
                salesContractApi.exportInvoice({dateSearch: this.dateSearch}).then(result => {
                    let a = document.createElement("a")
                    a.download = result
                    a.href = result
                    a.click()
                    console.log(a)
                }).finally(() => {
                    this.loading = false;
                })
            },
            searchChanged() {
                salesContractApi.searchInvoice({
                    search: this.search,
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page
                }).then(result => {
                    for (let x = 0; x < result.invoices.length; x++) {
                        if (result.invoices[x].returnDate != "" && result.invoices[x].returnDate != null) {
                            result.invoices[x].returnDate = this.formatTimer(result.invoices[x].returnDate)
                        } else if (result.invoices[x].returnDate == '' || result.invoices[x].returnDate == null) {
                            result.invoices[x].returnDate = '';
                        }
                    }
                    this.desserts = result.invoices
                    this.totalDesserts = result.totalDesserts
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
        }
    }
</script>
