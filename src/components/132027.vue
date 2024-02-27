<template>
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
                        <strong>合同金额(￥)：{{salesContract.agreementMoney}}</strong>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="3"
                    >
                        <strong>质保金额(￥)：{{salesContract.retentionMoney}}</strong>
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
                        实际完工时间：{{salesContract.actualDate}}
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
                    <v-col
                            cols="12"
                            sm="6"
                            md="3"
                    >
                        <strong>已开票金额：{{salesContract.invoicedMoney}}</strong>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="3"
                    >
                        <strong>已收款金额：{{salesContract.collectedMoney}}</strong>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="3"
                    >
                        <strong>待收款金额：{{salesContract.toCollectMoney}}</strong>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="4"
                    >
                        <v-btn
                                color="blue darken-1"
                                text
                                @click="showFiles"
                        >
                            <span
                            style="margin-top: -16px;margin-left: -16px">
                                查看附件
                            </span>
                        </v-btn>

                        <v-dialog v-model="showSalesFiles" max-width="600px">
                            <v-card>
                                <v-data-table
                                        :headers="salesFilesHeader"
                                        :items="salesFilesDesserts"
                                        :items-per-page="5"
                                        class="elevation-1"
                                >
                                    <template v-slot:item.download="{ item }">
                                        <v-icon
                                                small
                                                @click="downloadFile(item)"
                                        >
                                            下载
                                        </v-icon>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-dialog>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-data-table
                title="开票记录"
                :headers="invoiceHeaders"
                :items="invoiceDesserts"
                :items-per-page="10"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.createTime="{ item }">
                <span>{{item.createTime | formatTimer}}</span>
            </template>
        </v-data-table>
        <v-data-table
                title="收款记录"
                :headers="collectHeaders"
                :items="collectDesserts"
                :items-per-page="10"
                class="elevation-1"
                hide-default-footer
        >
        </v-data-table>

        <v-data-table
                :headers="managerHeaders"
                :items="managerDesserts"
                :items-per-page="5"
                class="elevation-1"
                hide-default-footer
        >
        </v-data-table>

        <v-dialog v-model="dialogShowTaxList" width="500px">
            <v-card>
                <v-container>
                    <v-list dense>
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
    </v-card>
</template>

<script>

    import salesContractApi from '@/api/salesContract';

    export default {
        name:'salesContractDetails',
        props: {
            frameId:String,
            salesContractItem:{
                type:Object,
                default:null
            }
        },
        data:() =>({

            dialogShowTaxList:false,

            salesContract: null,
            id:null,

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
            showSalesFiles:false,

            SalesFiles: {
                fileName: null,
                fileUrl: null,
                mark: null,
            },
            salesFilesDesserts: [],
            salesFilesHeader: [
                {text: '文件名', align: 'start', sortable: false, value: 'fileName'},
                {text: '下载', value: 'download', sortable: false},
            ],

            managerHeaders: [
                {text: '项目经理', value: 'managerName'},
                {text: '部门', value: 'sectionName'},
                {text: '操作', value: 'managerActions'},
            ],
            managerDesserts: [],
        }),
        created() {
            this.reset();
            this.id = this.frameId
            if (this.id != null){
                this.showAgreement()
            }else {
                this.salesContract = this.salesContractItem
            }

        },
        watch:{
            salesContractItem:{
                handler(){
                    this.reset()
                    if (this.salesContractItem != null){
                        this.salesContract = this.salesContractItem
                    }
                },
                deep:true
            },
            frameId:{
                handler(){
                    this.reset()
                    if (this.frameId != null){
                        this.id = this.frameId
                        this.showAgreement()
                    }
                },
                deep:true,
            }
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
            showTaxList() {
                this.dialogShowTaxList = true
            },
            showAgreement(){
                salesContractApi.getAgreementMSG({agreementID: this.id}).then(result => {
                    if (result.salesContract.pDate != '' && result.salesContract.pDate != null){
                        result.salesContract.pDate = this.formatTimer(result.salesContract.pDate)
                    } else if (result.salesContract.pDate == '' || result.salesContract.pDate == null){
                        result.salesContract.pDate = '';
                    }
                    if (result.salesContract.actualDate != '' && result.salesContract.actualDate != null){
                        result.salesContract.actualDate = this.formatTimer(result.salesContract.actualDate)
                    } else if (result.salesContract.actualDate == '' || result.salesContract.actualDate == null){
                        result.salesContract.actualDate = '';
                    }
                    this.salesContract = result.salesContract
                })
                salesContractApi.getCollect({agreementID: this.id}).then(result => {
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
                salesContractApi.getInvoice({agreementID: this.id}).then(result => {
                    this.invoiceDesserts = result.rows;
                })
                salesContractApi.getManagers({agreementID: this.id}).then(result => {
                    this.managerDesserts = result.rows;
                })
            },
            showFiles() {
                this.showSalesFiles = true;
                this.loadSalesFiles();
            },

            loadSalesFiles() {

                if (this.id != null){
                    salesContractApi.showSalesFiles({id:this.id}).then(result => {
                        this.salesFilesDesserts = result;
                    })
                }else if (this.salesContract.id != null){
                    salesContractApi.showSalesFiles({id:this.salesContract.id}).then(result => {
                        this.salesFilesDesserts = result;
                    })
                }

            },
            downloadFile(item) {
                let a = document.createElement('a');
                a.href = `/api/files/downloadFile?filePath=` + item.fileUrl + `&downloadFile=` + item.fileName;
                a.target = "_blank";
                a.click();
            },
            reset(){
                this.salesContract = {
                    id:null,
                    projectBase:null,
                    agreementName:null,
                    agreementID:null,
                    agreementMoney:null,
                    retentionMoney:null,
                    retentionPercent:null,
                    tax:null,
                    signDate:null,
                    pDate:null,
                    paymentDays:null,
                    companyName:null,
                    companyAddress:null,
                    bankName:null,
                    bankAccount:null,
                    remark:null,
                    invoicedMoney:null,
                    collectedMoney:null,
                    toCollectMoney:null,
                    actualDate:null,
                }
            }
        }
    }
</script>
