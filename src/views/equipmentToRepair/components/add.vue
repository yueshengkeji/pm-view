<template>
    <v-container>
        <v-form ref="equipmentToRepairForm">
            <span style="font-size: 20px;color: red">Tips:采购部确认收货或报废后发起微信通知，三天后申请人默认确认，请关注微信通知，避免不必要麻烦</span>
            <v-row>
                <v-col cols="12" md="4" sm="2" xs="2">
<!--                    <v-text-field v-model="equipmentToRepair.projectName" label="项目名称"-->
<!--                                  :rules="rules.projectNameRule"></v-text-field>-->
                    <v-combobox v-model="equipmentToRepair.projectName"
                                :search-input.sync="searchProject"
                                :items="projectItems"
                                :rules="rules.projectNameRule"
                                label="项目名称"
                    ></v-combobox>
                </v-col>
                <v-col cols="12" md="4" sm="2" xs="2">
                    <v-text-field v-model="equipmentToRepair.equipmentName" label="设备名称"
                                  :rules="rules.equipmentNameRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="2" xs="2">
                    <v-text-field v-model="equipmentToRepair.number" label="数量" :rules="rules.numberRule"
                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                  type="number"></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="2" xs="2">
                    <v-text-field v-model="equipmentToRepair.brand" label="品牌" :rules="rules.brandRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="4" sm="2" xs="2">
                    <v-text-field v-model="equipmentToRepair.serialNumber" label="序列号"
                                  :rules="rules.serialNumberRule"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="equipmentToRepair.cause" label="故障原因"
                                  :rules="rules.causeRule"></v-text-field>
                </v-col>
<!--                <v-col cols="12">-->
<!--                    <v-text-field v-model="equipmentToRepair.remark" label="备注"-->
<!--                                  :rules="rules.remarkRule"></v-text-field>-->
<!--                </v-col>-->
                <v-col>
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
    import equipmentToRepairApi from "../../../api/equipmentToRepair";
    import fileUpload from "../../../components/fileUpload";
    import {search} from "../../../api/project";

    export default {
        name: 'addEquipmentToRepair',
        components: {fileUpload},
        data: () => ({
            loadDialog: false,
            clear: false,

            equipmentToRepair: {
                projectName: null,
                equipmentName: null,
                number: null,
                brand: null,
                serialNumber: null,
                cause: null,
                remark: null,
            },

            rules: {
                projectNameRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
                ],
                equipmentNameRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
                ],
                numberRule: [
                    v => !!v || '必填字段', v => v > 0  || '请输入正确的数值'
                ],
                brandRule: [
                    v => (v == null || v == '' || (!!v && v.length) <= 50) || "不超过50个字符"
                ],
                serialNumberRule: [
                    v => (v == null || v == '' || (!!v && v.length) <= 100) || "不超过100个字符"
                ],
                causeRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 500) || '不超过500个字符'
                ],
                remarkRule: [
                    v => (v == null || v == '' || (!!v && v.length) <= 500) || "不超过500个字符"
                ]
            },

            files:[],
            tempFile:{
                id: null,
                attachId: null,
                fileUrl: null,
                name: null
            },

            searchProject:null,
            projectItems:[],
        }),

        watch:{
            searchProject: {
                handler() {
                    if (this.searchProject != null) {
                        this.getProjectBySeek(this.searchProject)
                    }
                },
                deep: true,
            },
        },

        methods: {
            getProjectBySeek(str) {
                this.projectItems = []
                search(str).then(res => {
                    res.forEach(item => {
                        this.projectItems.push(item.name)
                    })
                })
            },
            validateForm() {
                let flag = null
                if (this.$refs['equipmentToRepairForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },

            insertRepair() {
                this.loadDialog = true
                return equipmentToRepairApi.insertRepair(this.equipmentToRepair).then(res => {
                    if (res != null) {
                        this.saveFile(res)
                        this.loadDialog = false
                        this.reset()
                    }
                    return res
                })
            },

            resetFormRules() {
                this.clear = true
                this.$refs['equipmentToRepairForm'].resetValidation()
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
                }
            },

            saveFile(res) {
                if (res.id != null) {
                    for (let i = 0; i < this.files.length; i++) {
                        this.files[i].equipmentToRepairId = res.id
                    }
                    equipmentToRepairApi.bindFile(this.files).then(res => {
                        if (res != null) {
                            this.files = []
                        }
                    })
                }
            },


            reset() {
                this.equipmentToRepair = {
                    projectName: null,
                    equipmentName: null,
                    number: null,
                    brand: null,
                    serialNumber: null,
                    cause: null,
                    remark: null,
                }
                this.clear = false
            }
        }
    }
</script>
