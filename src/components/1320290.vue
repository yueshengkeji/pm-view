<template>
    <v-container class="pa-3">
        <v-form ref="addForm">
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="proZujinEndItem.contractName" :rules="[v => !!v || '请填写合同名称']"
                                  readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方" v-model="proZujinEndItem.partB" :rules="[v => !!v || '请填写乙方']"
                                  readonly></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field type="number" label="楼层" v-model="proZujinEndItem.floor" readonly></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field label="铺位号" v-model="proZujinEndItem.pwNumber" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="合同编号" v-model="proZujinEndItem.contractNum" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="品牌名" v-model="proZujinEndItem.brandName" readonly></v-text-field>
                </v-col>
                <v-col md="6">
                    <v-text-field label="终止原因" v-model="proZujinEndItem.endReason" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="proZujinEndItem.endDate"
                                  :rules="[v => !!v || '请选择终止日期']" label="终止日期" hide-details
                                  readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="proZujinEndItem.returnHouseDate"
                                  :rules="[v => !!v || '请选择房屋归还日期']" label="房屋归还日期" hide-details
                                  readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="所有费用合计"
                                  v-model="proZujinEndItem.otherPay" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="proZujinEndItem.otherPayDate"
                                  :rules="[v => !!v || '请选择所有费用支付截止日期']" label="所有费用支付截止日期" hide-details
                                  readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="违约金"
                                  v-model="proZujinEndItem.bzj" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="履约保证金"
                                  v-model="proZujinEndItem.lyBzj" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="物管保证金"
                                  v-model="proZujinEndItem.wgBzj" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="保证金退还限定天数" v-model="proZujinEndItem.returnDays" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="逾期天数" v-model="proZujinEndItem.overdueDay" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="逾期违约金"
                                  v-model="proZujinEndItem.overdueDayMoney" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="质量保证金"
                                  v-model="proZujinEndItem.qualityBzj" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="质量时长/月"
                                  v-model="proZujinEndItem.qualityTime"></v-text-field>
                </v-col>

            </v-row>
            <v-row>
                <div>
                    <h3 v-if="richText != null">合同预览</h3>
                    <v-container id="printc" v-html="richText">
                    </v-container>
                </div>

            </v-row>
        </v-form>
    </v-container>
</template>
<script>
    import {selectById} from "../api/proZujinEnd";
    import {selectContractWordRecordByContractId} from "../api/contractWordModel";

    export default {
        name: '1320290',
        props: {
            frameId: String
        },
        data: () => ({
            proZujinEndItem: {
                id: null,
                contractName: null,
                partB: null,
                floor: null,
                pwNumber: null,
                contractNum: null,
                brandName: null,
                endReason: null,
                endDate: null,
                returnHouseDate: null,
                otherPayDate: null,
                bzj: null,
                returnDays: null,
                overdueDay: null,
                overdueDayMoney: null,
                qualityBzj: null,
                files: null,
                type: 4,
                proZujin: null,
            },
            richText:''
        }),
        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.id = this.frameId
                        this.getById()
                    }
                }
            },
        },
        created() {
            this.id = this.frameId
            this.getById()
        },
        methods: {
            getById() {
                console.log('this.id',this.id)
                selectById({id: this.id}).then(res => {
                    this.proZujinEndItem = res
                    this.loadHtml(this.id)
                })
            },
            loadHtml(contractId) {
                selectContractWordRecordByContractId({contractId: contractId}).then(result => {
                    if (result != null) {
                        this.richText = result.richText
                    }
                })
            }
        }
    }
</script>
