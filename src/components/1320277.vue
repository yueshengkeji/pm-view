<template>
    <v-card>
        <v-card-text>
            <v-row>
                <v-col
                        cols="6"
                        md="3">
                    <v-text-field v-model="applyForCar.applicant" label="申请人" readonly></v-text-field>
                </v-col>
                <v-col
                        cols="6"
                        md="3">
                    <v-text-field v-model="applyForCar.phoneNumber" label="联系方式" readonly></v-text-field>
                </v-col>
                <v-col
                        cols="6"
                        md="3"
                >
                    <v-text-field v-model="applyForCar.useTime" label="用车时间" readonly></v-text-field>
                </v-col>
                <v-col
                        cols="6"
                        md="3"
                >
                    <v-text-field v-model="applyForCar.projectName" label="项目名称" readonly></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col
                        cols="6"
                        md="6"
                >
                    <v-text-field v-model="applyForCar.direction" label="目的地" readonly></v-text-field>
                </v-col>

                <v-col
                        cols="6"
                        md="6"
                >
                    <v-text-field v-model="applyForCar.remark" label="事由" readonly></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model="applyForCar.remark2" label="备注" readonly></v-text-field>
                </v-col>
                <v-col cols="6" v-if="ifNeedDriver">
                    <v-combobox
                            v-model="applyForCar.driver"
                            :items="driverNameItems"
                            label="配置司机"
                            @change="updateMSG"
                    >
                    </v-combobox>
                </v-col>
            </v-row>
            <v-card width="80%" style="margin: auto" v-if="frameId == null">
                <v-data-table
                        v-if="ifNeedDriver"
                        :headers="driverHeaders"
                        :items="driverTaskData"
                        :items-per-page="5"
                >
                    <template v-slot:top>
                        <v-toolbar flat style="text-align: center">
                            <v-toolbar-title >未完成任务司机表</v-toolbar-title>
                        </v-toolbar>
                    </template>

                </v-data-table>
            </v-card>

            <v-row v-if="ifDriver">
                <v-btn @click="tripStart()" v-if="applyForCar.runState == '未出车'" color="primary">即刻出发</v-btn>
                <v-btn @click="tripEnd()" v-if="applyForCar.runState == '已出发'" color="primary">已到达</v-btn>
            </v-row>
        </v-card-text>
        <v-dialog v-model="dialogStart" width="80%">
            <v-card>
                <v-form ref="mileageStart">

                    <v-col
                    >
                        <v-text-field
                                v-model="applyForCar.mileageStart"
                                :rules="applyForCarRules.mileageStartRule"
                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                label="出发里程(km)"
                                required
                        ></v-text-field>
                    </v-col>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="closeDialogStart"
                    >
                        取消
                    </v-btn>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="saveDialogStart"
                    >
                        提交
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogEnd" width="80%">
            <v-card>
                <v-form ref="mileageEnd">

                    <v-col
                    >
                        <v-text-field
                                v-model="applyForCar.mileageEnd"
                                :rules="applyForCarRules.mileageEndRule"
                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                label="到达里程(km)"
                                required
                        ></v-text-field>
                    </v-col>


                    <v-col
                            cols="12"
                            sm="6"
                            md="5"
                    >
                        <v-menu
                                ref="menu3"
                                v-model="menu3"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        v-model="returnTimeItem.returnDate"
                                        label="预计返回日期"
                                        required
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="returnTimeItem.returnDate"
                                    :min="minDate"
                                    @click:date="$refs.menu3.save(returnTimeItem.returnDate)"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="5"
                    >
                        <v-menu
                                ref="menu4"
                                v-model="menu4"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="returnTimeItem.returnTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        v-model="returnTimeItem.returnTime"
                                        label="预计返回时间"
                                        prepend-icon="mdi-clock-time-four-outline"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-time-picker
                                    v-model="returnTimeItem.returnTime"
                                    v-if="menu4"
                                    format="24hr"
                                    @click:minute="$refs.menu4.save(returnTimeItem.returnTime)"
                            ></v-time-picker>
                        </v-menu>
                    </v-col>

                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="closeDialogEnd"
                    >
                        取消
                    </v-btn>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="saveDialogEnd"
                    >
                        提交
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
    import applyForCarApi from "@/api/applyForCar";

    export default {
        name: 'frame-1320277',
        props: {
            frameId: String,
            applyForCarItem: {
                type: Object,
                default: null
            },
            ifNeedDriver: {
                type: Boolean,
                default: true,
            },
            ifDriver: {
                type: Boolean,
                default: function () {
                    return false
                }
            },

        },
        data: () => ({
            id: null,
            applyForCar: null,
            dialogStart: false,
            dialogEnd: false,
            dialogDriverTask: false,

            driverNameItems: [],
            driverItems: [],
            driver: {
                driverName: null,
                driverId: null,
            },

            applyForCarRules: {
                mileageStartRule: [
                    v => !!v || '不能为空！'
                ],
                mileageEndRule: [
                    v => !!v || '不能为空！'
                ],
            },

            minDate: null,
            menu3: false,
            menu4: false,

            returnTimeItem: {
                returnDate: null,
                returnTime: null,
            },

            driverHeaders: [
                {text: '司机', value: 'driver', sortable: false,},
                {text: '项目名称', value: 'projectName', sortable: false},
                {text: '用车时间', value: 'useTime', sortable: false},
                {text: '状态', value: 'runState', sortable: false},
            ],

            driverTaskData:[],

        }),

        created() {
            this.getDriver()
            this.reset()
            this.id = this.frameId || this.$route.params.id
            if (this.id != null) {
                this.showApplyForCarItem()
            } else {
                this.applyForCar = this.applyForCarItem
            }
            this.showDriverFree()
        },

        watch: {
            frameId: {
                handler() {
                    this.reset()
                    if (this.frameId != null) {
                        this.id = this.frameId
                        this.showApplyForCarItem()
                    }
                },
                deep: true,
            },

            applyForCarItem: {
                handler() {
                    this.reset()
                    if (this.applyForCarItem != null) {
                        this.applyForCar = this.applyForCarItem
                    }
                },
                deep: true
            },
        },

        methods: {

            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },

            showApplyForCarItem() {
                this.minDate = this.formatYearMonth(new Date())
                this.returnTimeItem.returnDate = this.formatYearMonth(new Date())
                applyForCarApi.getApplyForCarById({id: this.id}).then(result => {
                    this.applyForCar = result
                })
            },

            getDriver() {
                applyForCarApi.getDriver().then(result => {
                    if (result != null) {
                        for (let a = 0; a < result.length; a++) {
                            this.driverNameItems.push(result[a].name)
                            this.driver.driverName = result[a].name
                            this.driver.driverId = result[a].id
                            this.driverItems.push(this.driver)
                            this.driver = {
                                driverName: null,
                                driverId: null,
                            }
                        }
                    }
                })
            },

            updateMSG() {
                for (let a = 0; a < this.driverItems.length; a++) {
                    if (this.applyForCar.driver == this.driverItems[a].driverName) {
                        this.applyForCar.driverId = this.driverItems[a].driverId
                    }
                }
                applyForCarApi.setDriver(this.applyForCar).then(result => {
                    if (result != null) {
                        console.log("1")
                    }
                })
            },

            tripStart() {
                this.dialogStart = true
            },
            tripEnd() {
                this.dialogEnd = true
            },

            closeDialogStart() {
                this.dialogStart = false;
            },

            saveDialogStart() {
                let valid = this.$refs['mileageStart'].validate();
                if (valid) {
                    applyForCarApi.setMileage(this.applyForCar).then(result => {
                        if (result != null) {
                            this.dialogStart = false;
                            this.applyForCar = result
                        }
                    })
                }
            },

            closeDialogEnd() {
                this.dialogEnd = false;
            },

            saveDialogEnd() {
                let valid = this.$refs['mileageEnd'].validate();
                this.applyForCar.returnTime = this.returnTimeItem.returnDate + ' ' + this.returnTimeItem.returnTime
                if (valid) {
                    applyForCarApi.setMileage(this.applyForCar).then(result => {
                        if (result != null) {
                            this.dialogEnd = false;
                            this.applyForCar = result
                        }
                    })
                }
            },
            showDriverFree(){
                applyForCarApi.getTaskToDo().then(result => {
                    this.driverTaskData = result.row
                })
            },

            reset() {
                this.applyForCar = {
                    id: null,
                    useTime: null,
                    ueeTimeDetailed:null,
                    projectName: null,
                    remark: null,
                    remark2: null,
                    direction: null,
                    driver: null,
                    driverId: null,
                    checkState: null,
                    runState: null,
                    applicantId: null,
                    startTime: null,
                    endTime: null,
                    mileageStart: null,
                    mileageEnd: null,
                    createTime: null,
                    projectId: null,
                    markId: null,
                    applicant: null,
                    phoneNumber: null,
                    returnTime: null,
                }
            }
        }


    }
</script>
