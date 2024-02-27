<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.projectName" label="项目名称" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.equipmentName" label="设备名称" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.brand" label="品牌" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.serialNumber" label="序列号" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.number" label="数量" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.supplier" label="供应商" :readonly="ifReadonly" :rules="[v => (v == null || v == '' || (!!v && v.length) <= 50) || '不超过50个字符']"></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.trackingNumber" label="快递单号" :readonly="ifReadonly" :rules="[v => (v == null || v == '' || (!!v && v.length) <= 50) || '不超过50个字符']"></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-if="equipmentToRepair.state == 0" value="未发货" label="状态" readonly></v-text-field>
                <v-text-field v-if="equipmentToRepair.state == 1" value="已发货" label="状态" readonly></v-text-field>
                <v-text-field v-if="equipmentToRepair.state == 2" value="已收货" label="状态" readonly></v-text-field>
                <v-text-field v-if="equipmentToRepair.state == 3" value="已报废" label="状态" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-btn @click="showFiles = true">附件</v-btn>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="equipmentToRepair.cause" label="故障原因" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="equipmentToRepair.remark" label="备注" :readonly="ifReadonly" :rules="[v => (v == null || v == '' || (!!v && v.length) <= 500) || '不超过500个字符']"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-card-actions v-if="this.$store.state.user.roles.split('/').indexOf(roleName) != -1">
            <v-spacer></v-spacer>
            <v-btn v-if="equipmentToRepair.state == 0" color="primary" @click="changeStateGo1" :loading="btnLoading">
                扫码发货
            </v-btn>
            <v-btn v-if="equipmentToRepair.state == 0" color="primary" @click="submitState0" :loading="btnLoading">
                确认发货
            </v-btn>
            <v-btn v-if="equipmentToRepair.state == 1" color="success" @click="changeStateGo2" :loading="btnLoading">收货
            </v-btn>
            <v-btn v-if="equipmentToRepair.state == 1" color="error" @click="changeStateGo3" :loading="btnLoading">报废
            </v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>

        <v-dialog v-model="writeTrackingNumberDialog" width="60%" :fullscreen="mobileFlag">
            <v-card>
                <write-tracking-number :equipment-to-repair-item="writeTrackingNumberItem"></write-tracking-number>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showFiles" width="60%">
            <v-data-table
                    :headers="headers"
                    :items="desserts"
                    class="elevation-1"
                    hide-default-footer
            >
                <template v-slot:item.actions="{item}">
                    <v-btn x-small @click="showImage(item)">预览</v-btn>
                    <v-btn x-small @click="downloadFile(item)">下载</v-btn>
                    <v-btn x-small color="error" @click="deleteFile(item)">删除</v-btn>
                </template>
            </v-data-table>
        </v-dialog>

        <v-dialog v-model="showImageDialog" width="50%">
            <v-img :src="showUrl"></v-img>
        </v-dialog>

        <v-dialog v-model="remarkDialog" width="60%">
            <v-card>
                <v-col>
                    <v-text-field v-model="remarkItem.remark" label="备注"
                                  :rules="[v => (v == null || v == '' || (!!v && v.length) <= 500) || '不超过500个字符']"></v-text-field>
                </v-col>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submitRemark">提交</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>

</template>
<script>
    import equipmentToRepairApi from "../../../api/equipmentToRepair";
    import writeTrackingNumber from "./writeTrackingNumber";
    import {getConfig} from "../../../api/systemConfig";

    export default {
        name: 'detailView',
        components: {writeTrackingNumber},
        props: {
            frameId: String
        },
        data: () => ({
            id: null,
            equipmentToRepair: {
                projectName: null,
                equipmentName: null,
                number: null,
                brand: null,
                serialNumber: null,
                cause: null,
                remark: null,
                supplier: null,
                trackingNumber: null,
            },

            btnLoading: false,

            mobileFlag: false,
            writeTrackingNumberDialog: false,
            writeTrackingNumberItem: null,
            trackingNumberTemp: null,

            writeSupplierDialog: false,
            writeSupplierItem: null,
            writeSupplierTemp: null,

            changeStateDialog: false,

            roleName: null,

            showFiles: false,
            headers: [
                {text: '文件名称', value: 'name', sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],

            showImageDialog: false,
            serverHost: '',
            showUrl: '',

            remarkMsg: null,
            remarkItem: {
                remark:null
            },
            remarkDialog: false,

            ifReadonly:true,
            ifReadonly2:true,
        }),

        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.getConfig()
                        this.reset()
                        this.load()
                    }
                },
                deep: true
            }
        },

        created() {
            this.getConfig()
            this.reset()
            this.load()
        },
        mounted() {
            this.isMobile()
            console.log(this.mobileFlag)
        },

        methods: {
            getConfig() {
                getConfig("EQUIPMENT_ROLE_NAME").then(res => {
                    if (res != null) {
                        this.roleName = res.value
                    } else {
                        alert("未配置编码为‘EQUIPMENT_ROLE_NAME’的参数,配置该参数值为送修人角色名，用户拥有该角色时才能使用相应操作")
                    }

                })
                getConfig("FTP_SERVER_PATH").then(result => {
                    if (result.id != null) {
                        this.serverHost = result.value
                    } else {
                        alert('服务器未配置文件上传路径')
                    }
                })
            },
            isMobile() {
                let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
                if (flag != null && flag.length > 0) {
                    this.mobileFlag = true
                } else {
                    this.mobileFlag = false
                }
            },

            load() {
                this.ifReadonly = true

                if (this.frameId == null) {
                    this.id = this.$route.params.id
                } else {
                    this.id = this.frameId
                }
                equipmentToRepairApi.getById({id: this.id}).then(res => {
                    if (res != null){
                        if (res.state == 0){
                            this.ifReadonly = false
                        }
                    }
                    this.equipmentToRepair = res
                })
                equipmentToRepairApi.getFiles({id: this.id}).then(res => {
                    this.desserts = res
                })
            },


            changeStateGo1() {
                this.writeTrackingNumberDialog = true
                this.writeTrackingNumberItem = this.equipmentToRepair
            },

            changeStateGo2() {
                this.equipmentToRepair.state = 2
                console.log(this.equipmentToRepair)
                this.btnLoading = true
                equipmentToRepairApi.updateRepair(this.equipmentToRepair).then(res => {
                    if (res != null) {
                        this.btnLoading = false
                        this.changeStateDialog = false
                    }
                })
            },

            // changeStateGo3() {
            //     this.equipmentToRepair.state = 3
            //     console.log(this.equipmentToRepair)
            //     this.btnLoading = true
            //     equipmentToRepairApi.updateRepair(this.equipmentToRepair).then(res => {
            //         if (res != null) {
            //             this.btnLoading = false
            //             this.changeStateDialog = false
            //         }
            //     })
            // },

            changeStateGo3() {
                if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
                    this.remarkItem = this.equipmentToRepair
                    this.remarkDialog = true
                } else {
                    this.msg = "无权限操作"
                    this.showSnackbarDialog = true
                }

            },

            submitRemark() {
                this.remarkItem.state = 3
                equipmentToRepairApi.updateRepair(this.remarkItem).then(res => {
                    if (res != null) {
                        this.remarkDialog = false
                        this.remarkItem = {
                            remark:null
                        }
                        window.location.reload()
                    }
                })
            },

            downloadFile(item) {
                let a = document.createElement('a');
                a.href = `/api/files/downloadFile?filePath=` + item.fileUrl + `&downloadFile=` + item.name;
                a.target = "_blank";
                a.click();
            },

            deleteFile(item) {
                equipmentToRepairApi.delete(item).then(res => {
                    if (res == 1) {
                        this.getAttach()
                    }
                })
            },

            showImage(item) {
                this.showUrl = `${this.serverHost}` + item.fileUrl
                this.showImageDialog = true
            },

            submitState0() {
                this.btnLoading = true
                this.equipmentToRepair.state = 1
                equipmentToRepairApi.updateRepair(this.equipmentToRepair).then(() => {
                    this.btnLoading = false
                    window.location.reload()
                })
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
                    supplier: null,
                    trackingNumber: null,
                }
            }
        }
    }
</script>
