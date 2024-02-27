<template>
    <div class="pa-3">
        <v-row>
          <v-col sm="2" cols="3">
            <v-text-field readonly label="开票申请人" v-model="invoiceDefaultItem.registrant"></v-text-field>
          </v-col>
          <v-col sm="2" cols="3">
            <v-text-field readonly label="开票单位" v-model="invoiceEditedItem.invoiceCompany"></v-text-field>
          </v-col>
          <v-col sm="3" cols="12">
            <v-text-field readonly label="单位名称" v-model="contract.companyName"></v-text-field>
          </v-col>
          <v-col sm="3" cols="12">
            <v-text-field readonly label="社会统一码" v-model="contract.taxID"></v-text-field>
          </v-col>

          <v-col sm="2" cols="12">
            <v-text-field readonly label="电话" v-model="contract.phone"></v-text-field>
          </v-col>
          <v-col sm="6" cols="12">
            <v-text-field readonly label="单位地址" v-model="contract.companyAddress"></v-text-field>
          </v-col>

          <v-col sm="3" cols="12">
            <v-text-field readonly label="开户行" v-model="contract.bankName"></v-text-field>
          </v-col>
          <v-col sm="3" cols="12">
            <v-text-field readonly label="银行账号" v-model="contract.bankAccount"></v-text-field>
          </v-col>
          <v-col cols="12"
                 sm="3">
            <v-text-field label="合同名称" v-model="invoiceDefaultItem.agreementName"></v-text-field>
          </v-col>
          <v-col
              cols="12"
              sm="2"
          >

            <v-text-field label="合同金额(￥)" v-model="invoiceDefaultItem.agreementMoney"></v-text-field>
            </v-col>
            <v-col
                    cols="12"
                    sm="1"

            >
                <v-text-field label="税率" v-model="invoiceDefaultItem.tax"></v-text-field>
            </v-col>
          <!--            <v-col-->
          <!--                    cols="12"-->
          <!--                    sm="2"-->
          <!--            >-->
          <!--                <v-text-field label="已开票百分比(%)" v-model="invoiceDefaultItem.invoicedPercent"></v-text-field>-->

          <!--            </v-col>-->
          <v-col
                    cols="12"
                    sm="3"
            >
                <v-text-field
                        v-model="invoiceEditedItem.invoiceID"
                        label="开票编号"

                ></v-text-field>
            </v-col>
            <v-col
                    cols="12"
                    sm="3"
            >
                <v-text-field
                        v-model="invoiceEditedItem.createTime"
                        label="开票日期"
                        required
                        prepend-icon="mdi-calendar"
                        readonly

                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                sm="4"
            >
              <v-text-field
                  v-model="invoiceEditedItem.invoiceMoney"
                  label="本次申请开票金额(￥)(必填)"
                  type="number"
                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
              ></v-text-field>
            </v-col>
          <v-col
              cols="12"
              sm="4"
          >
            <v-text-field label="开票内容" v-model="invoiceEditedItem.invoiceContent"></v-text-field>
          </v-col>
          <v-col
              cols="12"
              sm="2"
          >
            <v-text-field
                v-model="invoiceEditedItem.percent"
                label="百分比(%)"
            ></v-text-field>
          </v-col>
          <v-col
                    cols="12"
                    sm="3"
            >

                <v-text-field
                        v-model="invoiceEditedItem.returnDate"
                        label="预回款日期"
                        required
                        prepend-icon="mdi-calendar"
                        readonly

                ></v-text-field>

            </v-col>
            <v-col>
                <v-text-field
                        v-model="invoiceEditedItem.remark"
                        label="备注"
                ></v-text-field>
            </v-col>
        </v-row>

    </div>
</template>

<script>
    import {getById} from '@/api/invoice'

    export default {
        name: "frame-1320275",
        data: () => ({
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
            },
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
            },
            contract:{
                companyName:null,
                companyAddress:null,
                bankName:null,
                bankAccount:null,
            }
        }),
        props: {
            frameId: String,
        },
        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.loadData();
                    }
                },
            }
        },
        created() {
            if (this.frameId != null) {
                this.loadData();
            }

        },
        methods: {
            loadData() {
                getById(this.frameId).then(data => {
                    data.invoice.createTime = this.formatTimer(data.invoice.createTime)
                    data.invoice.returnDate = this.formatTimer(data.invoice.returnDate)
                    this.invoiceDefaultItem = data.contract
                    this.invoiceEditedItem = data.invoice
                    this.contract = data.contract
                })
            },
        }
    }
</script>

<style scoped>

</style>