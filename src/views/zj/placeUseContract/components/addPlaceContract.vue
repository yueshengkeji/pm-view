<template>
    <v-container class="pa-3">
        <v-form ref="addForm">
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="placeUseContractItem.contractName"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-autocomplete v-model="placeUseContractItem.partB"
                                    :items="companyItems"
                                    :loading="isLoading"
                                    :search-input.sync="searchCompany"
                                    return-object
                                    item-text="name"
                                    :append-icon=" 'mdi-plus' "
                                    @click:append="showAddCompanyDialog"
                                    label="乙方"></v-autocomplete>
                </v-col>
                <v-col md="3">
                    <v-text-field label="证件号码" v-model="placeUseContractItem.partB.idNumber"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方地址" v-model="placeUseContractItem.partB.address"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="联系电话" v-model="placeUseContractItem.partB.telephoneP"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="开户行" v-model="placeUseContractItem.partB.openAccount"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="银行账号" v-model="placeUseContractItem.partB.bankNumber"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="placeUseContractItem.startDate"
                                          :rules="[v => !!v || '请选择合同开始日期']" label="合同开始日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="placeUseContractItem.startDate" no-title scrollable
                                       @change="menu1 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="placeUseContractItem.endDate"
                                          :rules="[v => !!v || '请选择合同截止日期']" label="合同截止日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="placeUseContractItem.endDate" no-title scrollable
                                       @change="menu2 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="3">
                    <v-text-field label="场地编号" v-model="placeUseContractItem.placeNum"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field type="number" label="场地面积" v-model="placeUseContractItem.placeArea"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="场地用途" v-model="placeUseContractItem.placeUseFor"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费标准(含税)" v-model="placeUseContractItem.price"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费总额(含税)" v-model="placeUseContractItem.money"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费税率(%)" v-model="placeUseContractItem.taxRate"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="交费结算期(/月)"
                                  v-model="placeUseContractItem.payCycle"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="水费(元/m³)"
                                  v-model="placeUseContractItem.waterPrice"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="保证金" v-model="placeUseContractItem.bond"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-select v-model="placeUseContractItem.electricType"
                              :items="electricType"
                              item-value="value"
                              label="电费支付方式"
                              item-text="name">
                    </v-select>
                </v-col>
                <v-col md="3">
                    <v-text-field label="电费" v-model="placeUseContractItem.electricPrice"></v-text-field>
                </v-col>
                <v-col sm="2">
                    <file-upload ref="file" @change="fileChangeHandler" :dense="false"></file-upload>
                </v-col>
                <v-col sm="2">
                    <easy-flow coding="1320288" ref="easyFlow" default-flow-name="场地使用合同-多经"></easy-flow>
                </v-col>
            </v-row>
        </v-form>
        <v-dialog v-model="addCompanyDialog" width="70%">
            <v-card>
                <v-card-title>新增公司信息</v-card-title>
                <add-company ref="addCompany"></add-company>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="saveCompany">提交</v-btn>
                    <v-btn @click="addCompanyDialog = false,this.$refs.addCompany.reset()">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script>
    import {insert} from "../../../../api/placeUseContract";
    import addCompany from "../../../../components/addCompany";
    import {list} from '@/api/company';
    import {insertPlaceContractWordRecord} from "@/api/contractWordModel";
    import EasyFlow from "@/components/easyflow/easyFlow.vue";
    import FileUpload from "@/components/fileUpload.vue";
    export default {
        name: 'addPlaceContract',
        components: {addCompany,EasyFlow,FileUpload},
        data: () => ({
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
                electricType:null,
                files: ''
            },
            companyItems: [],
            isLoading: false,
            searchCompany: null,
            menu1: false,
            menu2: false,
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

            addCompanyDialog: false
        }),

        watch: {
            'placeUseContractItem.electricType': {
                handler() {
                    if (this.placeUseContractItem.electricType == 0) {
                        this.placeUseContractItem.electricPrice = '实时电价'
                    } else if (this.placeUseContractItem.electricType == 1) {
                        this.placeUseContractItem.electricPrice = '实时电价'
                    } else {
                        this.placeUseContractItem.electricPrice = ''
                    }
                },
                deep: true
            },
            searchCompany: {
                handler() {
                    if (this.searchCompany != null) {
                        this.loadCompany(this.searchCompany)
                    }
                },
                deep: true
            },

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
            submitAdd() {
                return insert(this.placeUseContractItem).then(res => {
                    insertPlaceContractWordRecord(res)
                    this.$refs.easyFlow.startFlow({
                        title: res.partB.name + "合同审批",
                        content: res.remark || '',
                        frameId: res.id,
                        frameCoding: 1320288,
                        frameColumn: 'id'
                    })
                    return res
                })
            },
            loadCompany(str) {
                list(str).then(res => {
                    this.companyItems = res
                })
            },
            showAddCompanyDialog() {
                this.addCompanyDialog = true
            },
            saveCompany() {
                if (this.$refs.addCompany.validateForm() == true) {
                    this.$refs.addCompany.saveCompany()
                    this.addCompanyDialog = false
                }
            },
            fileChangeHandler({files}) {
                this.placeUseContractItem.files = ""
                files.forEach(item => {
                    this.placeUseContractItem.files += item.id + ";"
                })
            },
            reset() {
                this.placeUseContractItem = {
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
                    electricType:null,
                    files: ''
                }
            }
        }

    }
</script>
