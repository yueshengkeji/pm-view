<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="3" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.contractName" label="合同名称" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.contractMoney" label="合同总价" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.project.name" label="项目" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.companyName" label="收款单位" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.companyBlank" label="收款单位银行" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.companyNumber" label="银行账号" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.payMoney" label="付款金额" readonly></v-text-field>
            </v-col>

            <v-col cols="12" md="2" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.earlyMoney" label="初审价" readonly></v-text-field>
            </v-col>

            <v-col cols="12" md="2" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.accountMoney" label="财务结算价" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="2" xs="2">
                <v-text-field v-model="proSubcontractPay.sumPayMoney" label="累计付款金额" readonly></v-text-field>
            </v-col>
          <v-col cols="12" md="10" sm="10" xs="10">
            <v-textarea :rows="1" v-model="proSubcontractPay.payInfo" label="付款事由" readonly></v-textarea>
          </v-col>
            <v-col cols="12">
                <v-textarea auto-grow :rows="rows" v-model="proSubcontractPay.remark" label="备注" readonly></v-textarea>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
    import proSubcontractPay from "../api/proSubcontractPay";

    export default {
        name: 'frame-1320281',
        props: {
            frameId: String,
        },
        data: () => ({

            proSubcontractPay: {
                project: {},
                contractName: null,
                contractId: null,
                contractMoney: null,
                payMoney: null,
                payInfo: null,
                companyName: null,
                companyId: null,
                companyBlank: null,
                companyNumber: null,
                earlyMoney: null,
                accountMoney: null,
                sumPayMoney: null,
                remark: null,
                staff: null,
                filesUrl: null,
            },
            rows: 1
        }),

        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.reset()
                        this.loadPay()
                    }
                },
                deep: true
            }

        },

        created() {
            if (this.frameId != null) {
                this.reset()
                this.loadPay()
            }
        },

        methods: {
            loadPay() {
                proSubcontractPay.getById({id: this.frameId}).then(res => {
                    if (res != null) {
                        if (res.remark && res.remark.length > 100) {
                            this.rows = 8
                        }
                        if (res.remark && res.remark.length > 50) {
                            this.rows = 5
                        } else if (res.remark && res.remark.length > 20) {
                            this.rows = 3
                        } else {
                            this.rows = 1
                        }
                        this.proSubcontractPay = res
                    }
                })
            },


            reset() {
                this.proSubcontractPay = {
                    project: {},
                    contractName: null,
                    contractId: null,
                    contractMoney: null,
                    payMoney: null,
                    payInfo: null,
                    companyName: null,
                    companyId: null,
                    companyBlank: null,
                    companyNumber: null,
                    earlyMoney: null,
                    accountMoney: null,
                    sumPayMoney: null,
                    remark: null,
                    staff: null,
                    filesUrl: null,
                }
            },
        }
    }
</script>
