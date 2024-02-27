<template>
    <v-container>
        <v-form ref="proSubContractPayForm">
            <v-row>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-combobox v-model="tempContract"
                                :search-input.sync="searchContract"
                                :items="contractItems"
                                :rules="rules.contractNameRule"
                                label="合同名称"
                                item-text="name"
                                return-object
                    ></v-combobox>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-text-field v-model="proSubcontractPay.contractMoney" :rules="rules.contractMoneyRule"
                                  label="合同总价"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-combobox v-model="proSubcontractPay.project"
                                :search-input.sync="searchProject"
                                :items="projectItems"
                                :rules="rules.projectNameRule"
                                label="项目"
                                item-text="name"
                                return-object
                    ></v-combobox>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-combobox v-model="tempCompany"
                                :search-input.sync="searchCompany"
                                :items="companyItems"
                                :rules="rules.companyNameRule"
                                label="付款单位名称"
                                item-text="name"
                                return-object
                    ></v-combobox>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-text-field v-model="proSubcontractPay.companyBlank" :rules="rules.companyBlankRule"
                                  label="付款单位开户行"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-text-field v-model="proSubcontractPay.companyNumber" :rules="rules.companyNumberRule"
                                  label="银行账号"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="2">
                    <v-text-field v-model="proSubcontractPay.payMoney" :rules="rules.payMoneyRule"
                                  label="付款金额"></v-text-field>
                </v-col>

                <v-col cols="12" md="3" sm="2" xs="1">
                    <v-text-field v-model="proSubcontractPay.earlyMoney" :rules="rules.earlyMoneyRule"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  label="初审价"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="1">
                    <v-text-field v-model="proSubcontractPay.accountMoney" :rules="rules.accountMoneyRule"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  label="财务结算价"></v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="2" xs="1">
                    <v-text-field v-model="proSubcontractPay.sumPayMoney" :rules="rules.sumPayMoneyRule"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  label="累计付款金额"></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                    <easy-flow coding="1320281" ref="subcontractPayFlow"></easy-flow>
                </v-col>
              <v-col cols="12">
                <v-textarea v-model="proSubcontractPay.payInfo"
                              :rules="rules.payInfoRule"
                              rows="2"
                              label="付款事由"></v-textarea>
              </v-col>
                <v-col cols="12">
                    <v-text-field v-model="proSubcontractPay.remark" :rules="rules.remarkRule"
                                  label="备注"></v-text-field>
                </v-col>

                <v-col cols="12">
                    <file-upload :clear="clear" @change="fileUpload"></file-upload>
                </v-col>
            </v-row>

        </v-form>
        <!--加载框-->
        <v-dialog v-model="loadDialog"
                  hide-overlay
                  persistent
                  width="300">
            <v-card
                    color="primary"
                    dark>
                <v-card-text>
                    正在提交。。。
                    <v-progress-linear
                            indeterminate
                            color="white"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script>
    import proSubcontractPay from "../../../api/proSubcontractPay";
    import fileUpload from "../../../components/fileUpload";
    import {search} from "../../../api/project";
    import {list} from '@/api/company';
    import easyFlow from "../../../components/easyflow/easyFlow";


    export default {
        name: 'insertPay',
        components: {fileUpload, easyFlow},
        data: () => ({
            loadDialog: false,

            clear: false,

            tempContract: null,
            tempContract2: null,
            searchContract: null,
            contractItems: [],

            tempProject: null,
            searchProject: null,
            projectItems: [],

            tempCompany: null,
            tempCompany2: null,
            searchCompany: null,
            companyItems: [],

            proSubcontractPay: {
                project: {
                    id: null,
                    name: null,
                },
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
                sumPayMoney: '0',
                remark: null,
                staff: null,
                filesUrl: null,
            },

            rules: {
                contractNameRule: [
                    v => !!v || '必填字段！',
                    (v) => {
                        if(v != null && v.name && v.name.length < 50){
                            return true
                        }else if(v != null && v.length < 50){
                            return true
                        }else{
                            return "不超过50个字符"
                        }
                    }
                ],
                contractMoneyRule: [
                    v => !!v || '必填字段！', v => v >= 0 || '请输入正确的数值'
                ],
                projectNameRule: [
                    v => !!v.id || '请选择项目！',
                ],
                payMoneyRule: [
                    v => !!v || '必填字段！', v => v >= 0 || '请输入正确的数值'
                ],
                payInfoRule: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 1000) || '不超过1000个字符'
                ],
                companyNameRule: [
                    v => !!v || '必填字段！',
                ],
                companyBlankRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
                ],
                companyNumberRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
                ],
                earlyMoneyRule: [
                    v => (v == '0' || v == null || (!!v && v >= 0)) || '请输入正确的数值'
                ],
                accountMoneyRule: [
                    v => (v == '0' || v == null || (!!v && v >= 0)) || '请输入正确的数值'
                ],
                sumPayMoneyRule: [
                    v => (v == '0' || v == null || (!!v && v >= 0)) || '请输入正确的数值'
                ],
                remarkRule: [
                    v => (v == null || (!!v && v.length < 1000)) || '不超过1000个字符'
                ],
            },

            tempFile: {},
            files: [],
        }),

        watch: {
            searchContract: {
                handler() {
                    if (this.searchContract != null) {
                        this.getProSubcontract(this.searchContract)
                    }
                },
                deep: true,
            },
            tempContract: {
                handler() {
                    if (this.tempContract != null) {
                        this.proSubcontractPay.contractName = this.tempContract.name
                        this.proSubcontractPay.contractId = this.tempContract.id
                        if (this.tempContract.id != null) {
                            this.proSubcontractPay.project = this.tempContract.project
                            this.proSubcontractPay.contractMoney = this.tempContract.money
                            this.tempCompany = this.tempContract.partyB
                            this.showSumPayMoney(this.tempContract.id)
                        }
                    }
                },
                deep: true,
            },
            searchProject: {
                handler() {
                    if (this.searchProject != null) {
                        this.getProjectBySeek(this.searchProject)
                    }
                },
                deep: true,
            },

            searchCompany: {
                handler() {
                    if (this.searchCompany != null) {
                        this.getCompany(this.searchCompany)
                    }
                },
                deep: true,
            },
            tempCompany: {
                handler() {
                    if (this.tempCompany != null) {
                        this.proSubcontractPay.companyName = this.tempCompany.name
                        this.proSubcontractPay.companyBlank = this.tempCompany.openAccount
                        this.proSubcontractPay.companyNumber = this.tempCompany.bankNumber
                        this.proSubcontractPay.companyId = this.tempCompany.id
                    }
                },
                deep: true,
            },

        },

        created() {
            this.reset()
        },

        methods: {
            showSumPayMoney(contractId) {
                this.proSubcontractPay.sumPayMoney = '0'
                proSubcontractPay.getPayByContractId({contractId: contractId}).then(res => {
                    if (res.length > 0) {
                        console.log(res)
                        this.proSubcontractPay.sumPayMoney = 0
                        res.forEach(item => {
                            if (item.state == 1) {
                                this.proSubcontractPay.sumPayMoney += item.payMoney
                            }
                        })
                    }
                })
            },
            getProjectBySeek(str) {
                search(str).then(res => {
                    this.projectItems = res
                })
            },
            getCompany(str) {
                list(str).then(res => {
                    if (res.length > 0) {
                        this.companyItems = res
                    } else {
                        this.tempCompany2.name = str
                        this.tempCompany2.id = null

                        this.tempCompany = this.tempCompany2
                    }
                })
            },
            getProSubcontract(str) {
                proSubcontractPay.getSubcontracts({str: str}).then(res => {
                    if (res.length > 0) {
                        this.contractItems = res
                    } else {
                        this.tempContract2.id = null
                        this.tempContract2.name = str

                        this.tempContract = this.tempContract2
                    }
                })

            },

            fileUpload(data) {
                this.files = []
                for (let i = 0; i < data.files.length; i++) {
                    this.tempFile.attachId = data.files[i].id
                    this.tempFile.fileUrl = data.files[i].ftpPath
                    this.tempFile.name = data.files[i].fileName
                    this.files.push(this.tempFile)
                    this.tempFile = {
                        id: null,
                        attachId: null,
                        fileUrl: null,
                        name: null
                    }
                    // if (i == data.files.length - 1) {
                    //     this.proSubcontractPay.filesUrl = this.proSubcontractPay.filesUrl + data.files[i].ftpPath
                    // }else if (this.proSubcontractPay.filesUrl == null){
                    //     this.proSubcontractPay.filesUrl = data.files[i].ftpPath + ','
                    // }else {
                    //     this.proSubcontractPay.filesUrl = this.proSubcontractPay.filesUrl + data.files[i].ftpPath + ','
                    // }
                }
            },

            saveFile(res) {
                if (res.id != null) {
                    for (let i = 0; i < this.files.length; i++) {
                        this.files[i].contractPayId = res.id
                    }
                    proSubcontractPay.bindFile(this.files).then(res => {
                        if (res != null) {
                            this.files = []
                        }
                    })
                }
            },

            validateForm() {
                let flag = null
                if (this.$refs['proSubContractPayForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },

            submitPay() {
                this.loadDialog = true
                if (this.proSubcontractPay.companyName == null){
                    this.proSubcontractPay.companyName = this.searchCompany
                }
                return proSubcontractPay.insertProSubcontractPay(this.proSubcontractPay).then(res => {
                    if (res != null) {
                        this.saveFile(res)
                        this.reset()

                        this.$refs['subcontractPayFlow'].startFlow({
                            title: "关于对《" + res.project.name + "》的分包合同付款",
                            content: res.remark == null ? "" : res.remark,
                            frameId: res.id,
                            frameCoding: 1320281,
                            frameColumn: 'id'
                        }).then()

                    }
                    this.loadDialog = false
                    return res
                }).catch(e => {
                    console.log(e)
                })
            },

            resetFormRules() {
                this.clear = true
                this.$refs['proSubContractPayForm'].resetValidation()
            },

            reset() {
                this.clear = false

                this.tempContract = null
                this.tempContract2 = {
                    name: null,
                    id: null,
                }
                this.searchContract = null
                this.contractItems = []

                this.searchProject = null
                this.projectItems = []

                this.tempCompany = {
                    name: null,
                    id:null,
                }
                this.tempCompany2 = {
                    name: null,
                    id: null,
                }
                this.searchCompany = null
                this.companyItems = []

                this.proSubcontractPay = {
                    project: {
                        id: null,
                        name: null,
                    },
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
                    sumPayMoney: '0',
                    remark: null,
                    staff: null,
                    filesUrl: null,
                }
            }
        }
    }
</script>
