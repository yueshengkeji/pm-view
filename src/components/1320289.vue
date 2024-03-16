<template>
    <v-container class="pa-3">
        <v-form ref="addForm">
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="advertPlaceContractItem.contractName" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方" v-model="advertPlaceContractItem.partB" readonly></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field type="number" label="广告位块数" v-model="advertPlaceContractItem.number"
                                  readonly></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field label="广告类型" v-model="advertPlaceContractItem.advertType" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="位置编号" v-model="advertPlaceContractItem.placeNum" readonly></v-text-field>
                </v-col>
                <v-col md="6">
                    <v-text-field label="具体位置" v-model="advertPlaceContractItem.placeAddress" readonly></v-text-field>
                </v-col>

                <v-col md="3">
                    <v-text-field v-model="advertPlaceContractItem.startDate"
                                  :rules="[v => !!v || '请选择合同开始日期']" label="合同开始日期" hide-details
                                  readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="advertPlaceContractItem.endDate"
                                  :rules="[v => !!v || '请选择合同截止日期']" label="合同截止日期" hide-details
                                  readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="租金单价(元/块)"
                                  v-model="advertPlaceContractItem.price" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="租金总计(元)" v-model="advertPlaceContractItem.money"
                                  readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="租金总计(大写)" v-model="advertPlaceContractItem.capitalizationMoney"
                                  readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="设计费用"
                                  v-model="advertPlaceContractItem.designPrice" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="电费单价(元/块/月)"
                                  v-model="advertPlaceContractItem.perElectricPrice" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="电费总计(元)"
                                  v-model="advertPlaceContractItem.electricMoney" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="电费总计(大写)"
                                  v-model="advertPlaceContractItem.capitalizationElectricMoney" readonly></v-text-field>
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
    import {selectById} from "../api/advertPlaceContract";
    import {selectContractWordRecordByContractId} from "../api/contractWordModel";

    export default {
        name: '1320289',
        props: {
            frameId: String
        },
        data: () => ({
            id: null,
            richText: '',

            advertPlaceContractItem: {
                id: null,
                contractName: null,
                partB: null,
                number: null,
                placeNum: null,
                placeAddress: null,
                advertType: null,
                startDate: null,
                endDate: null,
                price: null,
                money: null,
                capitalizationMoney: null,
                designPrice: null,
                perElectricPrice: null,
                electricMoney: null,
                capitalizationElectricMoney: null,
                type: 3,
                files: ''
            },
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
                selectById({id: this.id}).then(res => {
                    this.advertPlaceContractItem = res
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
