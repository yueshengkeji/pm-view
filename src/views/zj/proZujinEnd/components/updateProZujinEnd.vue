<template>
    <v-container class="pa-3">
        <v-form ref="addForm">
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="proZujinEndItem.contractName"
                                  :rules="[v => !!v || '请填写合同名称']"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方" v-model="proZujinEndItem.partB"
                                  :rules="[v => !!v || '请填写乙方']"></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field type="number" label="楼层" v-model="proZujinEndItem.floor"></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field label="铺位号" v-model="proZujinEndItem.pwNumber"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="合同编号" v-model="proZujinEndItem.contractNum"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="品牌名" v-model="proZujinEndItem.brandName"></v-text-field>
                </v-col>
                <v-col md="6">
                    <v-text-field label="终止原因" v-model="proZujinEndItem.endReason"></v-text-field>
                </v-col>

                <v-col md="3">
                    <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="proZujinEndItem.endDate"
                                          :rules="[v => !!v || '请选择终止日期']" label="终止日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="proZujinEndItem.endDate" no-title scrollable
                                       @change="menu1 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="proZujinEndItem.returnHouseDate"
                                          :rules="[v => !!v || '请选择房屋归还日期']" label="房屋归还日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="proZujinEndItem.returnHouseDate" no-title scrollable
                                       @change="menu2 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="所有费用合计"
                                  v-model="proZujinEndItem.otherPay"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu3" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="proZujinEndItem.otherPayDate"
                                          :rules="[v => !!v || '请选择所有费用支付截止日期']" label="所有费用支付截止日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="proZujinEndItem.otherPayDate" no-title scrollable
                                       @change="menu3 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="违约金"
                                  v-model="proZujinEndItem.bzj"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="履约保证金"
                                  v-model="proZujinEndItem.lyBzj"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="物管保证金"
                                  v-model="proZujinEndItem.wgBzj"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="保证金退还限定天数" v-model="proZujinEndItem.returnDays"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="逾期天数" v-model="proZujinEndItem.overdueDay"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="逾期违约金"
                                  v-model="proZujinEndItem.overdueDayMoney"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="质量保证金"
                                  v-model="proZujinEndItem.qualityBzj"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="质量保证金时长/月"
                                  v-model="proZujinEndItem.qualityTime"></v-text-field>
                </v-col>

                <v-col sm="3">
                    <file-upload ref="file" @change="fileChangeHandler" :dense="false"></file-upload>
                </v-col>
                <v-col sm="2">
                    <easy-flow coding="1320290" ref="easyFlow" default-flow-name="合同终止协议"></easy-flow>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>
<script>
    import EasyFlow from "@/components/easyflow/easyFlow.vue";
    import FileUpload from "@/components/fileUpload.vue";
    import {update} from "../../../../api/proZujinEnd";
    import {insertProZujinEnd} from "../../../../api/contractWordModel";

    export default {
        name: 'updateProZujinEnd',
        components: {EasyFlow, FileUpload},
        props: {
            item: {
                type: Object,
            }
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
                otherPay: null,
                otherPayDate: null,
                bzj: null,
                lyBzj: null,
                wgBzj: null,
                returnDays: null,
                overdueDay: null,
                overdueDayMoney: null,
                qualityBzj: null,
                files: null,
                type: 4,
                proZujin: null,
                qualityTime: null
            },
            menu1: false,
            menu2: false,
            menu3: false,
        }),
        watch: {
            item: {
                handler() {
                    if (this.item != null) {
                        this.proZujinEndItem = this.item
                    }
                },
                deep: true
            }
        },
        methods: {
            validateForm() {
                let flag = null
                if (this.$refs['addForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },
            submitUpdate() {
                return update(this.proZujinEndItem).then(res => {
                    insertProZujinEnd(this.proZujinEndItem)
                    this.$refs.easyFlow.startFlow({
                        title: this.proZujinEndItem.partB + "合同审批",
                        content: this.proZujinEndItem.remark || '',
                        frameId: this.proZujinEndItem.id,
                        frameCoding: 1320290,
                        frameColumn: 'id'
                    })
                    return res
                })
            },
            saveProZujinEnd() {
                return update(this.proZujinEndItem).then(res => {
                    insertProZujinEnd(this.proZujinEndItem)
                    return res
                })
            },

            fileChangeHandler({files}) {
                this.proZujinEndItem.files = ""
                files.forEach(item => {
                    this.proZujinEndItem.files += item.id + ";"
                })
            },

            reset() {
                this.proZujinEndItem = {
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
                    otherPay: null,
                    otherPayDate: null,
                    bzj: null,
                    lyBzj: null,
                    wgBzj: null,
                    returnDays: null,
                    overdueDay: null,
                    overdueDayMoney: null,
                    qualityBzj: null,
                    files: null,
                    type: 4,
                    proZujin: null,
                    qualityTime: null
                }
            }
        }
    }
</script>
