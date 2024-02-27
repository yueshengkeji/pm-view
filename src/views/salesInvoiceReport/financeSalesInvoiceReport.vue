<template style="width: 80%">
    <v-card>
        <v-card-title>
            <v-col
                    cols="11"
                    sm="2"
            >
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
                    </v-date-picker>
                </v-menu>
            </v-col>
            <v-btn  :loading="loading" @click="exportExcel">
                导出
            </v-btn>
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
                @dblclick:row="showInvoiceDetail"
        >
            <template v-slot:item.createTime="{ item }">
                <span>{{item.createTime | formatTimer}}</span>
            </template>
            <template v-slot:item.agreementName="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.agreementName}}
                        </div>
                    </template>
                    <span>{{item.agreementName}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.projectBase="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.projectBase}}
                        </div>
                    </template>
                    <span>{{item.projectBase}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.company="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.company}}
                        </div>
                    </template>
                    <span>{{item.company}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.companyAddress="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.companyAddress}}
                        </div>
                    </template>
                    <span>{{item.companyAddress}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.invoiceContent="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.invoiceContent}}
                        </div>
                    </template>
                    <span>{{item.invoiceContent}}</span>
                </v-tooltip>
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
            <sales-contract-details :frame-id="item.agreementID"></sales-contract-details>
        </v-dialog>
        <v-dialog v-model="dialogShowTaxList" width="500px">
            <v-container>
                <v-list dense>
                    <v-list-item
                            v-for="(item, i) in salesContract.taxList"
                            :key="i"
                    >
                        <v-list-item-content v-text="'金额占比：' + item.percentForAM + '% ,税率：' + item.taxExtra + '%'"></v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-container>
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
    import salesContractDetails from "../../components/132027";
    import invoiceDetail from "../../components/invoiceDetail";
    export default {
        name:'salesInvoiceReport',
        components:{salesContractDetails,invoiceDetail},
        data: () => ({
            dialogInvoiceDetail:false,
            invoiceDetailId:null,

            dialogShowTaxList:false,

            options:{},
            totalDesserts:null,

            menu:false,
            dateSearch:null,

            search:null,
            loading: false,

            showSalesContract:false,
            salesContract: {},

            headers:[
                {text: '序号', value: 'index'},
                {text: '合同名称', value: 'agreementName',sortable: false},
                {text: '项目地址', value: 'projectBase',sortable: false},
                {text: '单位名称', value: 'company',sortable: false},
                {text: '单位地址', value: 'companyAddress',sortable: false},
                {text: '合同金额', value: 'agreementMoney',sortable: false},
                {text: '开票金额', value: 'invoiceMoney',sortable: false},
                {text: '开票时间',value: 'createTime',sortable: false,},
                {text: '开票内容',value: 'invoiceContent',sortable: false,},
                // {text: '预回款时间',value: 'returnDate',sortable: false},
                {text: '税率(%)',value:'tax',sortable:false},
                {text: '登记人',value: 'registrant',sortable: false},
                {text: '操作', value: 'actions'},
            ],
            desserts: [],

            invoiceHeaders: [
                {
                    text: '开票编号',
                    align: 'start',
                    sortable: false,
                    value: 'invoiceID',
                },
                // {text: '合同编号', value: 'agreementID'},
                {text: '开票金额(￥)', value: 'invoiceMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '开票日期', value: 'createTime'},
                {text: '登记人', value: 'registrant'},
            ],
            invoiceDesserts:[],

            collectHeaders: [
                {
                    text: '收款编号',
                    align: 'start',
                    sortable: false,
                    value: 'collectID',
                },
                // {text: '合同编号', value: 'agreementID'},
                {text: '收款金额(￥)', value: 'collectMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '预收款日期', value: 'pDate'},
                {text: '收款日期', value: 'createTime'},
                {text: '登记人', value: 'registrant'},
                {text: '登记状态', value: 'status', sortable: false},
            ],
            collectDesserts: [],

            item:{
                agreementID:null,
            }
        }),

        watch:{
            options: {
                handler() {
                    if (this.dateSearch == null && this.search == null){
                        this.loadInvoiceMSG()
                    }else if (this.dateSearch != null && this.search == null){
                        this.monthChanged()
                    }else if (this.search != null){
                        this.searchChanged()
                    }

                },
                deep: true,
            },
        },

        created() {

        },
        filters: {
            formatTimer: function (value) {
                if (value != null && value != ''){
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
                }else if (value == null || value == ''){
                    return '';
                }
            },
        },

        methods:{
            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },
            loadInvoiceMSG(){
                var dateYM = this.formatYearMonth(new Date())
                salesContractApi.getMonthInvoiceMSGChecked({dateSearch:dateYM,itemsPerPage:this.options.itemsPerPage,page:this.options.page}).then(result => {
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
            monthChanged(){
                this.$refs.menu.save(this.dateSearch)
                this.search = null
                salesContractApi.getMonthInvoiceMSGChecked({dateSearch:this.dateSearch,itemsPerPage:this.options.itemsPerPage,page:this.options.page}).then(result => {
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
            showAgreement(item){
                this.showSalesContract = true
                this.item = item
                // salesContractApi.getAgreementMSG(item).then(result => {
                //     this.salesContract = result.salesContract
                // })
                // salesContractApi.getCollect({agreementID: item.agreementID}).then(result => {
                //     for (let x = 0; x < result.rows.length; x++) {
                //         if (result.rows[x].pDate != "" && result.rows[x].pDate != null) {
                //             result.rows[x].pDate = this.formatTimer(result.rows[x].pDate)
                //         } else if (result.rows[x].pDate == '' || result.rows[x].pDate == null) {
                //             result.rows[x].pDate = '';
                //         }
                //         if (result.rows[x].createTime != "" && result.rows[x].createTime != null) {
                //             result.rows[x].createTime = this.formatTimer(result.rows[x].createTime)
                //         } else {
                //             result.rows[x].createTime = '';
                //         }
                //     }
                //     this.collectDesserts = result.rows
                // })
                // salesContractApi.getInvoice({agreementID: item.agreementID}).then(result => {
                //     this.invoiceDesserts = result.rows;
                // })
            },
            exportExcel() {
                this.loading = true;
                console.log(this.dateSearch)
                if (this.dateSearch == null){
                    this.dateSearch = this.formatYearMonth(new Date())
                }
                salesContractApi.exportInvoiceChecked({dateSearch:this.dateSearch}).then(result => {
                    let a = document.createElement("a")
                    a.download = result
                    a.href = result
                    a.click()
                    console.log(a)
                }).finally(() => {
                    this.loading = false;
                })
            },
            searchChanged(){
                salesContractApi.searchInvoiceChecked({search:this.search,itemsPerPage:this.options.itemsPerPage,page:this.options.page}).then(result => {
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
            showTaxList(){
                this.dialogShowTaxList = true
            },
            showInvoiceDetail(e,data){
                this.invoiceDetailId = data.item.id
                this.dialogInvoiceDetail = true
            },
        }
    }
</script>
