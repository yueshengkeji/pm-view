<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="3">
                <v-text-field label="合同名称" v-model="invoice.agreementName" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="合同编号" v-model="invoice.contractId" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="合同金额" v-model="invoice.agreementMoney" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="已收款金额" v-model="invoice.collectedMoney" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="开票编号" v-model="invoice.invoiceID" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="开票金额" v-model="invoice.invoiceMoney" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="税率" v-model="invoice.tax" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-text-field label="开票登记人" v-model="invoice.registrant" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" v-if="invoice.province != '' && invoice.province != null">
                <v-text-field label="地区" v-model="invoice.place" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" v-if="invoice.operatorName != '' && invoice.operatorName != null">
                <v-text-field label="跨区涉税经办人" v-model="invoice.operatorName" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" v-if="invoice.operatorPhone != '' && invoice.operatorPhone != null">
                <v-text-field label="联系方式" v-model="invoice.operatorPhone" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" v-if="invoice.operatorIDNumber != '' && invoice.operatorIDNumber != null">
                <v-text-field label="身份证" v-model="invoice.operatorIDNumber" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
                <v-btn @click="showInvoiceFiles">查看附件</v-btn>
                <v-dialog v-model="showInvoiceFilesDialog" max-width="600px">
                    <v-card>
                        <v-data-table
                        :headers="invoiceFilesHeader"
                        :items="invoice.invoiceFiles"
                        :items-per-page="5"
                        class="elevation-1"
                        >
                        <template v-slot:item.delete="{ item }">
                            <v-icon
                                    small
                                    @click="invoiceFilesDelete(item)"
                            >
                                mdi-delete
                            </v-icon>
                        </template>
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
        <v-col>
            <v-text-field label="内容" v-model="invoice.invoiceContent" readonly></v-text-field>
        </v-col>
        <v-col>
            <v-text-field label="备注" v-model="invoice.remark" readonly></v-text-field>
        </v-col>
        <v-col>
            <v-text-field label="甲方需求" v-model="invoice.partyANeeds" readonly></v-text-field>
        </v-col>
    </v-container>
</template>
<script>
    import {getInvoiceItem,getInvoiceFiles,deleteInvoiceFile} from "../api/invoice";
    import salesContractApi from "../api/salesContract";

    export default {
        name: 'invoiceDetail',
        props: {
            idItem: String
        },
        data: () => ({
            id: null,
            invoice: {},

            showInvoiceFilesDialog:false,
            invoiceFilesHeader: [
                {text: '文件名', align: 'start', sortable: false, value: 'name'},
                {text: '下载', value: 'download', sortable: false},
                {text: '删除', value: 'delete', sortable: false}

            ],
            invoiceFilesDesserts:null,
        }),
        watch: {
            idItem: {
                handler() {
                    this.reset()
                    if (this.idItem != null) {
                        this.id = this.idItem
                        this.loadInvoice()
                    }
                },
                deep: true
            }
        },
        created() {
            this.reset()
            this.id = this.idItem
            if (this.idItem != null) {
                this.loadInvoice()
            }
        },
        methods: {
            loadInvoice() {
                getInvoiceItem({id: this.id}).then(res => {
                    res.place = res.province + res.city + res.district + res.street
                    if (res != null) {
                        if (res.tax != null && res.tax != ''){
                            res.tax = res.tax.split('/')[1]
                        }
                        salesContractApi.getAgreementMSG({agreementID: res.agreementID}).then(res2 => {
                            if (res.tax == null || res.tax == '') {
                                res.tax = res2.salesContract.tax
                            }
                            res.contractId = res2.salesContract.agreementID
                            res.agreementMoney = res2.salesContract.agreementMoney
                            return res
                        }).then(result => {
                            if (result.tax == 13){
                                getInvoiceFiles({id:result.id}).then(res => {
                                    result.invoiceFiles = res
                                    this.invoice = result
                                    console.log('invoice:',this.invoice)
                                })
                            }else {
                                this.invoice = result
                            }
                        })
                    }
                })
            },
            showInvoiceFiles(){
                this.showInvoiceFilesDialog = true
            },
            invoiceFilesDelete(item){
                console.log('item',item)
                deleteInvoiceFile(item).then(() => {
                    getInvoiceFiles({id:item.mark}).then(res => {
                        this.invoice.invoiceFiles = res
                    })
                })
            },
            downloadFile(item) {
                let a = document.createElement('a');
                a.href = `/api/files/downloadFile?filePath=` + item.url + `&downloadFile=` + item.name;
                a.target = "_blank";
                a.click();
            },


            reset() {
                this.invoice = {
                    province: '',//省
                    city: '',//市
                    district: '',//区
                    street: '',//街道
                    operatorName: '',//跨区涉税经办人
                    operatorPhone: '',
                    operatorIDNumber: '',
                    invoiceContent: '',//开票内容
                    partyANeeds: '',//甲方需求
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
                    invoiceFiles: [],
                    contractId: '',
                    place:'',
                }
            }
        }
    }
</script>
