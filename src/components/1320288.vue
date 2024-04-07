<template>
    <v-container>
        <v-form ref="updateForm">
            <v-toolbar flat>
                <v-toolbar-title>场地合同-多经</v-toolbar-title>
            </v-toolbar>
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="placeUseContractItem.contractName" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方" v-model="placeUseContractItem.partB.name" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="证件号码" v-model="placeUseContractItem.partB.idNumber" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方地址" v-model="placeUseContractItem.partB.address" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="联系电话" v-model="placeUseContractItem.partB.telephoneP" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="开户行" v-model="placeUseContractItem.partB.openAccount" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="银行账号" v-model="placeUseContractItem.partB.bankNumber" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="placeUseContractItem.startDate"
                                  :rules="[v => !!v || '请选择合同开始日期']" label="合同开始日期" hide-details
                                  readonly ></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="placeUseContractItem.endDate"
                                  :rules="[v => !!v || '请选择合同截止日期']" label="合同截止日期" hide-details
                                  readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="场地编号" v-model="placeUseContractItem.placeNum" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field type="number" label="场地面积" v-model="placeUseContractItem.placeArea" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="场地用途" v-model="placeUseContractItem.placeUseFor" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费标准(含税)" v-model="placeUseContractItem.price" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费总额(含税)" v-model="placeUseContractItem.money" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费税率(%)" v-model="placeUseContractItem.taxRate" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="交费结算期(/月)"
                                  v-model="placeUseContractItem.payCycle" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="水费(元/m³)"
                                  v-model="placeUseContractItem.waterPrice" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="保证金" v-model="placeUseContractItem.bond" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="电费支付方式" v-model="placeUseContractItem.electricType" readonly></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field label="电费" v-model="placeUseContractItem.electricPrice" readonly></v-text-field>
                </v-col>

            </v-row>
            <v-row>
                <div>
                    <v-btn v-if="showContract == false" @click="showContract = true">合同预览</v-btn>
                    <v-btn v-if="showContract == true" @click="showContract = false">关闭预览</v-btn>
                </div>
                <div v-if="showContract">
                    <h3 v-if="richText != null">合同预览</h3>
                    <v-container id="printc" v-html="richText">
                    </v-container>
                </div>

            </v-row>
        </v-form>
    </v-container>
</template>
<script>
    import {selectById} from "../api/placeUseContract";
    import {selectContractWordRecordByContractId} from "../api/contractWordModel";

    export default {
        name: '1320288',
        props: {
            frameId: String
        },
        data:() => ({
            showContract:false,
            id:null,
            placeUseContractItem: {
                id: null,
                contractName: null,
                partB: {
                    name: null,
                    idNumber: null,
                    address: null,
                    telephoneP: null,
                    openAccount: null,
                    bankNumber: null,
                },
                placeNum: null,
                placeArea: null,
                placeUseFor: null,
                startDate: null,
                endDate: null,
                price: null,
                money: null,
                taxRate: null,
                payCycle: null,
                waterPrice: null,
                type: null,
                electricPrice: null,
                bond: null,
                electricType:null
            },
            searchCompany:null,
            electricType: [
                {
                    name: '甲方电表通知',
                    value: 0
                },
                {
                    name: '甲方电表预付',
                    value: 1
                },
                {
                    name: '月付',
                    value: 2
                },
                {
                    name: '一次性付',
                    value: 3
                },
            ],
            richText:''
        }),
        watch:{
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
        methods:{
            getById(){
                selectById({id:this.id}).then(res => {
                    if (res.electricType == 0){
                        res.electricType = '甲方电表通知'
                    }
                    if (res.electricType == 1){
                        res.electricType = '甲方电表预付'
                    }
                    if (res.electricType == 2){
                        res.electricType = '月付'
                    }
                    if (res.electricType == 3){
                        res.electricType = '一次性付'
                    }
                    this.placeUseContractItem = res
                    this.loadHtml(this.id)
                })
            },
            loadHtml(contractId){
                selectContractWordRecordByContractId({contractId:contractId}).then(result => {
                    if (result != null){
                        this.richText = result.richText
                    }
                })
            }
        }
    }
</script>
