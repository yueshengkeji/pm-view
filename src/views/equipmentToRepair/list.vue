<template>
    <v-card>
        <v-row>
            <v-col cols="12" md="3" sm="2" style="display: flex">
                <v-btn color="primary" @click="insertRepair" style="margin-left: 10px">新增登记</v-btn>
                <v-btn @click="exportRepair" :loading="loading" style="margin-left: 10px;">导出</v-btn>
            </v-col>
            <v-col cols="12" lg="1" md="2">
                <v-select label="状态" dense v-model="queryItem.state"
                          :items="stateItems"></v-select>
            </v-col>
            <v-col cols="12" lg="2" md="2">
                <v-select dense
                          v-model="queryItem.searchYear"
                          label="选择年份"
                          :items="years"
                          prepend-icon="mdi-calendar">
                </v-select>
            </v-col>
            <v-col cols="12" lg="1" md="1">
                <v-select dense
                          v-model="queryItem.searchMonth"
                          label="选择月份"
                          :items="months"
                          prepend-icon="mdi-calendar">
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="2">
                <v-combobox v-model="searchProjectItem"
                            :search-input.sync="searchProject"
                            :items="projectItems"
                            label="项目"
                            item-text="name"
                            return-object
                            dense
                ></v-combobox>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" lg="2" offset-lg="1" sm="2">
                <v-text-field class="mt-1" dense label="搜索" @keyup.enter="list()"
                              v-model="queryItem.str"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                @dblclick:row="showDetail"
                class="elevation-1"
        >
            <template v-slot:item.projectName="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.projectName}}
                        </div>
                    </template>
                    <span>{{item.projectName}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.equipmentName="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.equipmentName}}
                        </div>
                    </template>
                    <span>{{item.equipmentName}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.serialNumber="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.serialNumber}}
                        </div>
                    </template>
                    <span>{{item.serialNumber}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.cause="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.cause}}
                        </div>
                    </template>
                    <span>{{item.cause}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.remark="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.remark}}
                        </div>
                    </template>
                    <span>{{item.remark}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.trackingNumber="{ item }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on"
                                @click="writeTrackingNumber(item)">{{item.trackingNumber}}
                        </v-chip>
                    </template>
                    <span>{{item.trackingNumber}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.supplier="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on"
                                @click="writeSupplier(item)">{{item.supplier}}
                        </v-chip>
                    </template>
                    <span>{{item.supplier}}</span>
                </v-tooltip>
            </template>
            <template v-slot:item.notifyFlag="{item}">
                {{item.notifyFlag | resultConfirmStr}}
            </template>
            <template v-slot:item.state="{item}">
                <v-col>
                    <div style="display: flex">
                        <!--                <v-chip @click="changeState(item)" :color="item.color">{{item.state | strState}}</v-chip>-->
                        <v-chip small v-if="item.state == 0" color="primary" @click="changeStateGo1(item)"
                                :loading="btnLoading">发货
                        </v-chip>
                        <v-chip small v-if="item.state == 1" color="success" @click="changeStateGo2(item)"
                                :loading="btnLoading">收货
                        </v-chip>
                        <v-chip small v-if="item.state == 1" color="error" @click="changeStateGo3(item)"
                                :loading="btnLoading">报废
                        </v-chip>
                        <v-chip small v-if="item.state == 2" color="">已收货</v-chip>
                        <v-chip small v-if="item.state == 3" color="">已报废</v-chip>
                        <v-chip small color="" @click="deleteRepair(item)">删除</v-chip>
                    </div>
                </v-col>
            </template>
        </v-data-table>

        <v-dialog v-model="addRepairDialog" width="60%" :fullscreen="mobileFlag">
            <v-card>
                <add ref="addRepair"></add>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :loading="loading" @click="addSubmit">提交</v-btn>
                    <v-btn @click="addCancel">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="writeTrackingNumberDialog" width="60%" :fullscreen="mobileFlag">
            <v-card>
                <write-tracking-number :equipment-to-repair-item="writeTrackingNumberItem"></write-tracking-number>
            </v-card>
        </v-dialog>

        <v-dialog v-model="writeSupplierDialog" width="50%">
            <v-card>
                <v-form ref="supplierForm">
                    <v-col cols="12">
                        <v-text-field v-model="writeSupplierTemp" label="供应商"
                                      :rules="[v => !!v || '供应商不能为空！',v => (!!v && v.length < 50) || '不超过50字符！']"></v-text-field>
                    </v-col>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submitSupplier">提交</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showDetailDialog" width="60%">
            <v-card>
                <detail-view :frame-id="item.id"></detail-view>
            </v-card>
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

        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDeleteDialog">取消</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteRepairConfirm">确定
                    </v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--消息框-->
        <v-snackbar v-model="showSnackbarDialog"
                    :timeout="timeout"
                    :centered="true"
        >
            {{msg}}
        </v-snackbar>

    </v-card>
</template>
<script>
    import equipmentToRepairApi from "../../api/equipmentToRepair";
    import add from "./components/add";
    import writeTrackingNumber from "./components/writeTrackingNumber";
    import {getConfig} from "../../api/systemConfig";
    import detailView from "./components/detailView";
    import {search} from "../../api/project";

    export default {
        name: 'equipmentToRepair',
        components: {add, writeTrackingNumber, detailView},
        data: () => ({
            stateItems: [
                {text: "所有", value: null},
                {text: "未发货", value: 0},
                {text: "已发货", value: 1},
                {text: "已收货", value: 2},
                {text: "已报废", value: 3},
            ],

            btnLoading: false,

            showSnackbarDialog: false,
            timeout: 2000,
            msg: null,

            loadDialog: false,
            addRepairDialog: false,

            options: {},
            totalDesserts: null,
            headers: [
                {text: '序号', value: 'index'},
                {text: '项目名称', value: 'projectName', sortable: false, with: '20%'},
                {text: '设备名称', value: 'equipmentName', sortable: false},
                {text: '品牌', value: 'brand', sortable: false},
                {text: '序列号', value: 'serialNumber', sortable: false},
                {text: '数量', value: 'number', sortable: false},
                {text: '损坏原因', value: 'cause', sortable: false},
                {text: '备注', value: 'remark', sortable: false},
                {text: '申报日期', value: 'createTime', sortable: false},
                {text: '申请人', value: 'staffApplicant.name', sortable: false},
                {text: '快递单', value: 'trackingNumber', sortable: false},
                {text: '供应商名称', value: 'supplier', sortable: false},
                {text: '收货确认', value: 'notifyFlag', sortable: false},
                {text: '操作', value: 'state', sortable: false},
            ],
            desserts: [],

            queryItem: {
                itemsPerPage: 10,
                page: 1,
                str: null,
                sortName: 'createTime',
                sortOrder: 'DESC',
                start: null,
                end: null,
                state: null,
                ifMine: true,
                searchYear: null,
                searchMonth: '',
                searchProjectName: null,
            },

            years: [],
            months: ['所有','01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],

            mobileFlag: false,
            writeTrackingNumberDialog: false,
            writeTrackingNumberItem: null,
            trackingNumberTemp: null,

            writeSupplierDialog: false,
            writeSupplierItem: null,
            writeSupplierTemp: null,

            roleName: null,

            item: {id: null},
            showDetailDialog: false,

            remarkItem: {
                remark: null
            },
            remarkDialog: false,

            searchProjectItem: null,
            projectItems: [],
            searchProject: null,

            dialogDelete:false,
            deleteItem:null,

            loading:false,
        }),

        watch: {
            addRepairDialog(val) {
                val || this.addCancel()
            },
            options: {
                handler() {
                    this.list()
                },
                deep: true
            },
            'queryItem.state': {
                handler() {
                    this.list()
                },
                deep: true
            },
            'queryItem.searchYear': {
                handler() {
                    this.list()
                },
                deep: true
            },
            'queryItem.searchMonth': {
                handler() {
                    this.list()
                },
                deep: true
            },
            searchProjectItem: {
                handler() {
                    this.queryItem.searchProjectName = this.searchProjectItem.name
                    this.list()
                },
                deep: true
            },
            searchProject: {
                handler() {
                    if (this.searchProject != null) {
                        this.getProjectBySeek(this.searchProject)
                    }
                },
                deep: true
            }
        },

        created() {
            this.initYears()
            getConfig("EQUIPMENT_ROLE_NAME").then(res => {
                if (res != null) {
                    this.roleName = res.value
                } else {
                    alert("未配置编码为‘EQUIPMENT_ROLE_NAME’的参数,配置该参数值为送修人角色名，用户拥有该角色时才能使用相应操作")
                }

            })
            this.list()
        },

        mounted() {
            this.isMobile()
            console.log(this.mobileFlag)
        },

        filters: {
            strState: function (value) {
                if (value == 0) {
                    return '未发货'
                } else if (value == 1) {
                    return '已发货'
                } else if (value == 2) {
                    return '已收货'
                } else if (value == 3) {
                    return '已报废'
                }
            },

            resultConfirmStr: function (value) {
                if (value == 0){
                    return '未确认'
                } else if (value == 1) {
                    return '本人确认'
                } else if (value == 2) {
                    return '超时默认确认'
                }
            }
        },

        methods: {
            getProjectBySeek(str) {
                search(str).then(res => {
                    this.projectItems = res
                })
            },
            initYears() {
                this.years = [];
                let startYear = 2015;
                let endYear = new Date().getFullYear();
                for (let i = startYear; i <= endYear; i++) {
                    this.years.push(i);
                }
                this.queryItem.searchYear = endYear;

            },
            isMobile() {
                let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
                if (flag != null && flag.length > 0) {
                    this.mobileFlag = true
                } else {
                    this.mobileFlag = false
                }
            },
            list() {
                if (this.queryItem.searchMonth == ''){
                    let month = new Date().getMonth() + 1
                    let a = '0' + month
                    this.queryItem.searchMonth = a
                    this.queryItem.searchDate = this.queryItem.searchYear + '-' + this.queryItem.searchMonth
                }else if (this.queryItem.searchMonth == '所有'){
                    this.queryItem.searchDate = this.queryItem.searchYear
                }

                this.queryItem.page = this.options.page
                this.queryItem.itemsPerPage = this.options.itemsPerPage

                equipmentToRepairApi.list(this.queryItem).then(res => {
                    if (res != null) {
                        res.equipmentToRepairs.forEach((val, index) => {
                            val.index = index + 1;
                            val.createTime = val.createTime.substring(0, 10)
                            if (val.state == 1) {
                                val.color = 'primary'
                            } else if (val.state == 2) {
                                val.color = 'success'
                            } else if (val.state == 3) {
                                val.color = 'error'
                            }
                        });
                        this.desserts = res.equipmentToRepairs
                        this.totalDesserts = res.total
                    }
                })
            },

            insertRepair() {
                this.addRepairDialog = true
                this.$nextTick(() => {
                    this.$refs.addRepair.resetFormRules()
                })
            },

            async addSubmit() {
                if (this.$refs.addRepair.validateForm()) {
                    this.loading = true
                    await this.$refs.addRepair.insertRepair().then(res => {
                        if (res != null) {
                            this.list()
                        }
                    }).finally(() => {
                        this.loading = false;
                    })
                    this.addRepairDialog = false
                }
            },

            addCancel() {
                this.addRepairDialog = false
                this.$refs.addRepair.resetFormRules()
                this.$refs.addRepair.reset()
            },

            writeTrackingNumber(item) {
                if (item.trackingNumber) {
                    window.open(`https://www.baidu.com/s?wd=${item.trackingNumber}`)
                } else {
                    if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
                        this.writeTrackingNumberDialog = true
                        this.writeTrackingNumberItem = item
                    } else {
                        this.msg = "无权限操作"
                        this.showSnackbarDialog = true
                    }
                }

            },
            writeSupplier(item) {
                if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
                    this.writeSupplierDialog = true
                    this.writeSupplierItem = item
                } else {
                    this.msg = "无权限操作"
                    this.showSnackbarDialog = true
                }

            },
            submitSupplier() {
                this.writeSupplierItem.supplier = this.writeSupplierTemp
                if (this.$refs.supplierForm.validate()) {
                    equipmentToRepairApi.updateRepair(this.writeSupplierItem).then(() => {
                        this.writeSupplierItem = null
                        this.writeSupplierTemp = null
                        this.writeSupplierDialog = false
                        this.list()
                    })
                }
            },

            changeStateGo1(item) {
                if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
                    this.writeTrackingNumberDialog = true
                    this.writeTrackingNumberItem = item
                } else {
                    this.msg = "无权限操作"
                    this.showSnackbarDialog = true
                }

            },

            changeStateGo2(item) {
                if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
                    item.state = 2
                    this.btnLoading = true
                    equipmentToRepairApi.updateRepair(item).then(res => {
                        if (res != null) {
                            this.btnLoading = false
                            this.list()
                        }
                    })
                } else {
                    this.msg = "无权限操作"
                    this.showSnackbarDialog = true
                }

            },

            changeStateGo3(item) {
                if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
                    this.remarkItem = item
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
                        this.list()
                        this.remarkItem = {
                            remark: null
                        }
                    }
                })
            },

            showDetail(e, data) {
                this.item = data.item
                this.showDetailDialog = true
            },

            deleteRepair(item){
                this.deleteItem = item
                this.dialogDelete = true
            },

            deleteRepairConfirm(){
                if (this.deleteItem.staffApplicant.id == this.$store.state.user.id && this.deleteItem.state == 0){
                    equipmentToRepairApi.deleteRepair(this.deleteItem).then(res => {
                        if (res == 1){
                            this.list()
                            this.msg = "删除成功"
                            this.showSnackbarDialog = true
                            this.dialogDelete = false
                        }
                    })
                }else {
                    this.msg = "只能删除本人未发货的送修记录"
                    this.showSnackbarDialog = true
                }
            },

            closeDeleteDialog(){
                this.dialogDelete = false
                this.deleteItem = null
            },

            exportRepair(){
                this.loading = true;

                equipmentToRepairApi.exportRepair(this.queryItem).then(result => {
                    let a = document.createElement("a")
                    a.download = result
                    a.href = result
                    a.click()
                    console.log(a)
                }).finally(() => {
                    this.loading = false;
                })
            }

        }
    }
</script>
