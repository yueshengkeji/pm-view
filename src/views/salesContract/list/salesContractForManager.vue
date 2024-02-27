<template>
    <v-card>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                class="elevation-1"
        >
            <template v-slot:item.signDate="{ item }">
                <span>{{item.signDate | formatTimer}}</span>
            </template>

            <template v-slot:item.invoicePercent="{ item }">
                <v-progress-linear

                        height="15"
                        :color="item.percentColorI"
                        :value="item.contractInvoiceP"
                >
                    <strong style="font-size: 10px">{{item.contractInvoiceP}}%</strong>
                </v-progress-linear>
            </template>

            <template v-slot:item.collectPercent="{ item }">
                <v-progress-linear

                        height="15"
                        :color="item.percentColorC"
                        :value="item.contractCollectP"
                >
                    <strong style="font-size: 10px">{{item.contractCollectP}}%</strong>
                </v-progress-linear>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon
                        small
                        class="mr-2"
                        @click="invoiceAction(item)"
                >
                    开票明细
                </v-icon>
            </template>

        </v-data-table>
        <!--开票-->
        <v-dialog v-model="invoice" max-width="1000px">
            <v-card>
                <v-data-table
                        :headers="invoiceHeaders"
                        :items="invoiceDesserts"
                        :items-per-page="5"
                        class="elevation-1"
                >
                    <template v-slot:item.createTime="{ item }">
                        <!--            <span>{{ new Date(item.signDate).toLocaleDateString() }}</span>-->
                        <span>{{item.createTime | formatTimer}}</span>
                    </template>
                    <template v-slot:top>
                        <v-toolbar
                                flat
                        >
                            <v-toolbar-title>开票明细</v-toolbar-title>
                            <v-divider
                                    class="mx-4"
                                    inset
                                    vertical
                            ></v-divider>
                            <v-spacer></v-spacer>
                            <v-btn
                                    style="margin-right: 10px"
                                    color="black"
                                    dark
                                    @click="showInvoiceLogs"
                            >
                                开票日志
                            </v-btn>
                            <v-dialog
                                    v-model="invoiceDialog"
                                    max-width="800px"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                            color="primary"
                                            dark

                                            v-bind="attrs"
                                            v-on="on"
                                            @click="invoiceTipMSG = null,invoiceMaxPercent = 100"
                                    >
                                        开票登记
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title>
                                        <span class="text-h5">{{ formInvoiceTitle }}</span>
                                        <v-spacer></v-spacer>
                                        <span class="tip">{{invoiceTipMSG}}</span>
                                    </v-card-title>

                                    <v-card-text>
                                        <v-container>
                                            <v-form ref="invoiceForm">
                                                <v-row>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"

                                                    >
                                                        合同名称：{{invoiceDefaultItem.agreementName}}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        合同金额(￥)：{{invoiceDefaultItem.agreementMoney}}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        已开票金额(￥)：{{invoiceDefaultItem.invoicedMoney}}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        已开票百分比(%)：{{invoiceDefaultItem.invoicedPercent}}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-text-field
                                                                v-model="invoiceEditedItem.invoiceID"
                                                                label="开票编号"

                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-menu
                                                                ref="menu5"
                                                                v-model="menu5"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="auto"
                                                        >
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field
                                                                        v-model="invoiceEditedItem.createTime"
                                                                        label="开票日期"
                                                                        required
                                                                        prepend-icon="mdi-calendar"
                                                                        readonly
                                                                        v-bind="attrs"
                                                                        v-on="on"

                                                                ></v-text-field>
                                                            </template>
                                                            <v-date-picker
                                                                    v-model="invoiceEditedItem.createTime"
                                                                    @change="invoiceDateChanged"
                                                            ></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-menu
                                                                ref="menu7"
                                                                v-model="menu7"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="auto"
                                                        >
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field
                                                                        v-model="invoiceEditedItem.returnDate"
                                                                        label="预回款日期"
                                                                        required
                                                                        prepend-icon="mdi-calendar"
                                                                        readonly
                                                                        v-bind="attrs"
                                                                        v-on="on"

                                                                ></v-text-field>
                                                            </template>
                                                            <v-date-picker
                                                                    v-model="invoiceEditedItem.returnDate"
                                                                    @change="returnDateChanged"
                                                            ></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-select
                                                                v-model="invoiceEditedItem.tax"
                                                                label="税率（占比%/税率%）"
                                                                :items="invoiceTaxItems"
                                                        >

                                                        </v-select>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-text-field
                                                                v-model="invoiceEditedItem.invoiceMoney"
                                                                label="开票金额(￥)(必填)"
                                                                type="number"
                                                                @change="invoiceMoneyOfPercent"
                                                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-text-field
                                                                v-model="invoiceEditedItem.percent"
                                                                label="百分比(%)(必填)"
                                                                type="number"
                                                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                                :autofocus="true"
                                                                :rules="rules.invoicePercentRules"
                                                        ></v-text-field>
                                                    </v-col>

                                                    <v-col cols="12"
                                                           sm="6"
                                                           md="3">
                                                        <v-switch label="生成开票申请单"
                                                                  v-model="invoiceFlag">
                                                        </v-switch>
                                                    </v-col>
                                                    <v-col cols="12"
                                                           sm="6"
                                                           md="3">
                                                        <easy-flow coding="1320275"
                                                                   ref="invoiceFlow"
                                                                   defaultFlowName="开票申请单"
                                                                   v-if="invoiceFlag"></easy-flow>
                                                    </v-col>
                                                </v-row>
                                                <v-col>
                                                    <v-text-field
                                                            v-model="invoiceEditedItem.remark"
                                                            label="备注"
                                                    ></v-text-field>
                                                </v-col>
                                            </v-form>

                                        </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeInvoice"
                                        >
                                            取消
                                        </v-btn>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveInvoice"
                                        >
                                            保存
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>

                            </v-dialog>
                            <v-dialog v-model="invoiceDelete" max-width="500px">
                                <v-card>
                                    <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" text @click="invoiceCloseDelete">取消</v-btn>
                                        <v-btn color="blue darken-1" text @click="invoiceDeleteItemConfirm">确定
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="dialogInvoiceLogs" width="500px">
                                <v-card>
                                    <v-card-title class="text-h6">开票日志</v-card-title>
                                    <v-container>
                                        <v-list dense>
                                            <v-list-item
                                                    v-for="(item, i) in invoiceLogsItems"
                                                    :key="i"
                                            >
                                                <v-list-item-content v-text="item"></v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-container>
                                </v-card>
                            </v-dialog>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.invoiceActions="{ item }">
                        <!--                                <v-icon-->
                        <!--                                        small-->
                        <!--                                        class="mr-2"-->
                        <!--                                        @click="invoiceEditItem(item)"-->
                        <!--                                >-->
                        <!--                                    mdi-pencil-->
                        <!--                                </v-icon>-->
                        <v-icon
                                small
                                @click="invoiceDeleteItem(item)"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                </v-data-table>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
    import salesContractApi from '@/api/salesContract';
    import easyFlow from '@/components/easyflow/easyFlow'
    import salesContractLogsApi from "../../../api/salesContractLogs";

    export default {
        name: 'salesContractForManager',
        components: {easyFlow},
        data: () => ({
            headers: [
                {text: '项目地址', value: 'projectBase', sortable: false},
                {
                    text: '合同编号',
                    align: 'start',
                    sortable: false,
                    value: 'agreementID',
                },
                {text: '合同名称', value: 'agreementName', sortable: false},
                {text: '合同金额(￥)', value: 'agreementMoney', sortable: false},
                {text: '签订日期', value: 'signDate', dateType: 'Date', sortable: false},
                {text: '单位名称', value: 'companyName', sortable: false},
                {text: '质保到期', value: 'pDate', sortable: false},
                {text: '实际完工', value: 'actualDate', sortable: false},
                {text: '备注', value: 'remark', sortable: false},
                {text: '开票进度', value: 'invoicePercent', sortable: false},
                {text: '收款进度', value: 'collectPercent', sortable: false},
                {text: '登记人', value: 'registrant', sortable: false},
                {text: '已开票金额(￥)', value: 'invoicedMoney', sortable: false},
                {text: '已收款金额(￥)', value: 'collectedMoney', sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],
            totalDesserts: 0,
            options: {},

            invoice: false,
            invoiceDialog: false,
            invoiceDelete: false,
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
                {text: '操作', value: 'invoiceActions', sortable: false},
            ],
            invoiceDesserts: [],
            invoiceEditedIndex: -1,
            invoiceEditedItem: {
                ID: '',
                invoiceID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                invoiceMoney: '',
                percent: '',
                remark: '',
                createTime: '',
                registrant: '',
                invoicedMoney: '',
                paymentDays: '',
                pMark: '',
                returnDate: '',
                status: '',
                tax: '',
            },
            invoiceDefaultItem: {
                ID: '',
                invoiceID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                invoiceMoney: '',
                percent: '',
                remark: '',
                createTime: '',
                registrant: '',
                invoicedMoney: '',
                paymentDays: '',
                pMark: '',
                returnDate: '',
                status: '',
                tax: '',
            },
            invoiceTaxItems: [],
            dialogInvoiceLogs: false,
            invoiceLogsItems: [],
            invoiceTipMSG: null,
            totalInvoicePercentForTax: null,
            invoiceMaxPercent: null,
            InvoiceDefaultTaxTotalPercent:null,

            invoiceFlag: true,
            menu5: false,
            menu7: false,

            rules:{
                invoicePercentRules: [
                    v => v > 0 || '请输入正确的数值', v => v <= 100 || '请输入正确的数值'
                ],
            },
        }),

        computed: {
            formInvoiceTitle() {
                return this.invoiceEditedIndex === -1 ? '新增开票登记' : '编辑'
            },
        },

        watch: {
            invoiceDialog(val) {
                val || this.closeInvoice()
            },
            invoiceDialogDelete(val) {
                val || this.invoiceCloseDelete()
            },

            options: {
                handler() {
                    this.loadSalesContractForManager()
                },
                deep: true,
            },
            'invoiceEditedItem.tax': {
                handler() {
                    if (this.invoiceEditedItem.tax != null && this.invoiceEditedItem.tax != '' && this.invoiceEditedItem.tax != '默认') {
                        let percent = this.invoiceEditedItem.tax.split("/")[0]
                        this.getInvoicedTotalPercentByTax(this.invoiceEditedItem.tax, this.invoiceEditedItem.agreementID, percent)
                    }else if (this.invoiceEditedItem.tax == "默认"){
                        this.getInvoicedTotalPercentByTax(null,this.invoiceEditedItem.agreementID,this.InvoiceDefaultTaxTotalPercent)
                    }
                },
                deep: true,
            },

            'invoiceEditedItem.percent': {
                handler() {
                    if (this.invoiceEditedItem.percent != null && this.invoiceEditedItem.percent != '') {
                        if (this.invoiceEditedItem.percent > this.invoiceMaxPercent) {
                            this.invoiceEditedItem.percent = this.invoiceMaxPercent
                        }
                    }
                },
                deep: true,
            },
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
            formatNum: function (value) {
                if (value == null) {
                    return null;
                }
                let tempVal = parseFloat(value).toFixed(3)
                let realVal = tempVal.substring(0, tempVal.length - 1)
                return realVal
            }
        },

        methods: {
            formatTimer(value) {
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
            formatTimer2(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                let h = date.getHours();
                h = h < 10 ? "0" + h : h;
                let m = date.getMinutes();
                m = m < 10 ? "0" + m : m;
                let s = date.getSeconds();
                s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
            },
            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },
            formatNowTime(value) {
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
                return y + "." + MM + "." + d + "#";
            },
            formatNum(value) {
                if (value == null) {
                    return 0.00;
                }
                let tempVal = parseFloat(value).toFixed(3)
                let realVal = tempVal.substring(0, tempVal.length - 1)
                return realVal
            },
            loadSalesContractForManager() {
                salesContractApi.getSalesContractByManager({
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page
                }).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]

                            if (item.retentionPercent == null || item.retentionPercent == '') {
                                result.rows[x].retentionPercent = 0;
                            }
                            if (item.retentionMoney == null || item.retentionMoney == '') {
                                result.rows[x].retentionMoney = 0;
                            }

                            if (item.pDate != null) {
                                result.rows[x].pDate = this.formatTimer(item.pDate);
                            }
                            if (item.actualDate != null) {
                                result.rows[x].actualDate = this.formatTimer(item.actualDate);
                            }

                            result.rows[x].contractInvoiceP = Math.floor(item.invoicedMoney * 100 / item.agreementMoney);
                            var tempI = result.rows[x].contractInvoiceP;
                            if (tempI == 0 || (tempI > 0 && tempI < 25)) {
                                result.rows[x].percentColorI = 'red';
                            } else if (tempI == 25 || (tempI > 25 && tempI < 50)) {
                                result.rows[x].percentColorI = 'yellow';
                            } else if (tempI == 50 || (tempI > 50 && tempI < 75)) {
                                result.rows[x].percentColorI = 'blue';
                            } else {
                                result.rows[x].percentColorI = 'green';
                            }

                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;

                }).catch(e => {
                    console.log("异常信息", e);
                });

            },

            //开票
            loadInvoiceMSG(item) {

                salesContractApi.getInvoice({agreementID: item.agreementID}).then(result => {
                    this.invoiceDesserts = result.rows;
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            invoiceAction(item) {
                this.invoiceTaxItems = ['默认']
                this.invoiceLogsItems = []
                this.invoiceEditedItem.agreementName = item.agreementName;
                this.invoiceEditedItem.agreementID = item.contractId;
                this.invoiceEditedItem.agreementMoney = item.agreementMoney;
                this.invoiceEditedItem.invoicedMoney = item.invoicedMoney;
                this.invoiceEditedItem.paymentDays = item.paymentDays;
                var date = new Date();
                this.invoiceEditedItem.invoiceID = this.formatNowTime(date);
                this.invoiceEditedItem.createTime = this.formatTimer(date);


                this.invoiceDefaultItem.agreementName = item.agreementName;
                this.invoiceDefaultItem.agreementID = item.contractId;
                this.invoiceDefaultItem.agreementMoney = item.agreementMoney;
                this.invoiceDefaultItem.invoicedMoney = item.invoicedMoney;
                this.invoiceDefaultItem.paymentDays = item.paymentDays;
                this.invoiceDefaultItem.invoicedPercent = item.contractInvoiceP;
                var date1 = new Date();
                this.invoiceDefaultItem.invoiceID = this.formatNowTime(date1)
                this.invoiceDefaultItem.createTime = this.formatTimer(date1);
                this.invoice = true;

                if (item.taxList != null) {
                    let tempP = 0
                    for (let a = 0; a < item.taxList.length; a++) {
                        this.invoiceTaxItems.push(item.taxList[a].percentForAM + '/' + item.taxList[a].taxExtra)
                        tempP += (item.taxList[a].percentForAM - 0)
                    }
                    this.InvoiceDefaultTaxTotalPercent = 100 - tempP
                }
                this.loadInvoiceLogs(this.invoiceEditedItem)
                this.loadInvoiceMSG(this.invoiceEditedItem);

            },

            invoiceDeleteItem(item) {
                this.invoiceEditedIndex = this.invoiceDesserts.indexOf(item)
                this.invoiceEditedItem = Object.assign({}, item)
                this.invoiceDelete = true
            },

            invoiceDeleteItemConfirm() {
                this.invoiceDesserts.splice(this.invoiceEditedIndex, 1)
                salesContractApi.deleteInvoice(this.invoiceEditedItem).then(result => {
                    if (result != null) {
                        this.loadInvoiceMSG(this.invoiceEditedItem);
                        this.loadInvoiceLogs(this.invoiceEditedItem)
                        this.loadSalesContractForManager();
                        this.invoiceCloseDelete();
                    }
                });
            },

            closeInvoice() {
                this.invoiceDialog = false;
                this.$nextTick(() => {
                    this.invoiceEditedItem = Object.assign({}, this.invoiceDefaultItem)
                    this.invoiceEditedIndex = -1
                })
            },

            invoiceCloseDelete() {
                this.invoiceDelete = false
                this.$nextTick(() => {
                    this.invoiceEditedItem = Object.assign({}, this.invoiceDefaultItem)
                    this.invoiceEditedIndex = -1
                })
            },

            saveInvoice() {
                let valid = this.$refs["invoiceForm"].validate()
                if (valid){
                    this.invoiceLogsItems = []
                    if (this.invoiceEditedIndex > -1) {
                        if (this.invoiceEditedItem.invoiceMoney == '' || this.invoiceEditedItem.percent == '') {
                            alert("请完成必填项！！")
                            return false;
                        }
                        Object.assign(this.invoiceDesserts[this.invoiceEditedItem], this.invoiceEditedItem)
                    } else {
                        if (this.invoiceEditedItem.invoiceMoney == '' || this.invoiceEditedItem.percent == '') {
                            alert("请完成必填项！！")
                            return false;
                        }
                        if (this.invoiceFlag == true) {
                            this.invoiceEditedItem.status = '未审核'
                        } else if (this.invoiceFlag == false) {
                            this.invoiceEditedItem.status = '已审核'
                        }
                        this.invoiceDesserts.push(this.invoiceEditedItem);
                        salesContractApi.insertInvoice(this.invoiceEditedItem).then(result => {
                            if (result != null) {
                                    this.closeInvoice();
                                    this.loadInvoiceMSG(this.invoiceEditedItem);
                                    this.loadSalesContractForManager();
                                    this.loadInvoiceLogs(this.invoiceEditedItem)
                                this.$refs['invoiceFlow'].startFlow({
                                    title: result.agreementName + "开票申请单",
                                    content: '',
                                    frameId: result.id,
                                    frameCoding: 1320275,
                                    frameColumn: 'id'
                                }).then()
                            }

                        });
                    }
                }

            },
            percentOfInvoiceMoney() {
                this.invoiceEditedItem.invoiceMoney = this.formatNum(this.invoiceEditedItem.percent / 100 * this.invoiceEditedItem.agreementMoney);
            },

            invoiceMoneyOfPercent() {
                this.invoiceEditedItem.percent = this.formatNum(this.invoiceEditedItem.invoiceMoney / this.invoiceEditedItem.agreementMoney * 100);
            },

            returnDateChanged() {
                return this.$refs.menu7.save(this.invoiceEditedItem.returnDate);
            },

            invoiceDateChanged() {
                return this.$refs.menu5.save(this.invoiceEditedItem.createTime);
            },

            showInvoiceLogs() {
                this.dialogInvoiceLogs = true
            },
            loadInvoiceLogs(item) {
                salesContractLogsApi.getLogs({agreementID: item.agreementID, type: 0}).then(res => {
                    if (res.length > 0) {
                        for (let a = 0; a < res.length; a++) {
                            this.invoiceLogsItems.push(this.formatTimer2(res[a].createTime) + "  " + res[a].modifyMSG)
                        }
                    }
                })
            },
            getInvoicedTotalPercentByTax(tax, agreementID,percent) {
                this.totalInvoicePercentForTax = null
                if (tax == '默认'){
                    tax = null
                }
                salesContractApi.getTotalPercentByTax({tax: tax, agreementID: agreementID}).then(res => {
                    this.totalInvoicePercentForTax = res
                    if (percent > this.totalInvoicePercentForTax) {
                        this.invoiceTipMSG = '该税率类型剩余可开票占比为' + (percent - this.totalInvoicePercentForTax)
                        this.invoiceEditedItem.percent = (percent - this.totalInvoicePercentForTax)
                        this.invoiceMaxPercent = (percent - this.totalInvoicePercentForTax)
                        this.invoiceEditedItem.invoiceMoney = this.formatNum(this.invoiceEditedItem.percent / 100 * this.invoiceEditedItem.agreementMoney);
                        this.rules.invoicePercentRules = [
                            v => v > 0 || '请输入正确的数值', v => v <= this.invoiceMaxPercent || '请输入正确的数值'
                        ]
                    }
                }).catch(e => {
                    console.log('异常信息', e)
                })
            },
        },
    }
</script>
<style>
    .tip {
        color: red;
    }
</style>
