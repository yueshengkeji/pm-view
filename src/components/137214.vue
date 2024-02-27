<template>
    <div>
        <v-form ref="form" class="pa-md-0 pa-3">
            <v-row dense>
                <v-col sm="4" cols="12">
                    <v-select label="假期类型"
                              v-model="data.type"
                              item-text="name"
                              item-value="id"
                              :items="types"></v-select>
                </v-col>
                <v-col sm="4" cols="12">
                    <v-text-field readonly label="请假人" v-model="data.staff.name"></v-text-field>
                </v-col>
                <v-col sm="4" cols="12">
                    <v-text-field label="备注" v-model="data.remark"></v-text-field>
                </v-col>
                <v-col lg="3" cols="6">
                    <v-menu v-model="menu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="data.startDate"
                                    label="请假开始日期"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                            ></v-text-field>
                        </template>
                        <v-date-picker v-model="data.startDate"
                                       @input="startDateChange"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col lg="3" cols="6" v-if="data.startTime != null">
                    <v-menu v-model="timeMenu1"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            :nudge-left="150"
                            offset-y
                            ref="timeMenu1"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="data.startTime"
                                    label="请假开始时间"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                            ></v-text-field>
                        </template>
                        <v-time-picker v-model="data.startTime"
                                       format="24hr"
                                       :allowed-minutes="allowedMinutes"
                                       @input="diffDateTime"
                                       @click:minute="$refs.timeMenu1.save(data.startTime)">
                            <template v-slot:default>
                                <v-btn absolute top x-small @click="timeMenu1 = false">确定</v-btn>
                            </template>
                        </v-time-picker>
                    </v-menu>
                </v-col>
                <v-col lg="3" cols="6">
                    <v-menu v-model="menu2"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="data.endDate"
                                    label="请假截止日期"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                            ></v-text-field>
                        </template>
                        <v-date-picker v-model="data.endDate"
                                       :min="data.startDate"
                                       @input="endDateChange">
                        </v-date-picker>
                    </v-menu>
                </v-col>
                <v-col lg="3" cols="6" v-if="data.endTime != null">
                    <v-menu v-model="timeMenu2"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            :nudge-left="150"
                            offset-y
                            ref="timeMenu2"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="data.endTime"
                                    label="请假截止时间"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                            ></v-text-field>
                        </template>
                        <v-time-picker v-model="data.endTime"
                                       format="24hr"
                                       :allowed-minutes="allowedMinutes"
                                       @input="diffDateTime"
                                       @click:minute="$refs.timeMenu2.save(data.endTime)">
                            <template v-slot:default>
                                <v-btn absolute top x-small @click="timeMenu2 = false">确定</v-btn>
                            </template>
                        </v-time-picker>
                    </v-menu>
                </v-col>
                <v-col lg="3" cols="6">
                    <v-text-field label="请假天数"
                                  type="number"
                                  :rules="[v => (v > 0 || data.leaveHouse > 0) || '请假时间不正确']"
                                  v-model="data.leaveNumber"></v-text-field>
                </v-col>
                <v-col lg="3" cols="6">
                    <v-text-field label="请假小时"
                                  type="number"
                                  :rules="[v => (v > 0 || data.leaveNumber > 0) || '请假时间不正确']"
                                  v-model="data.leaveHouse"></v-text-field>
                </v-col>
                <v-col lg="4" cols="12" v-if="frameId == null">
                    <easy-flow coding="137214"
                               ref="flow"
                               :defaultFlowName="defaultFlowName"></easy-flow>
                </v-col>
            </v-row>
        </v-form>
    </div>
</template>

<script>
    import api, {getById} from '@/api/vacation'
    import easyFlow from '@/components/easyflow/easyFlow'

    export default {
        name: "frame-137214",
        components: {
            easyFlow
        },
        data: () => ({
            data: {
                type: 1,
                leaveHouse: 0,
                leaveNumber: 0,
                staff: {
                    name: null
                },
                startTime: '08:30',
                endTime: '17:30',
                remark: '',
            },
            menu: false,
            menu2: false,
            types: [
                {name: "事假", id: 1},
                {name: "婚假", id: 2},
                {name: "年休假", id: 3},
                {name: "产假", id: 5},
                {name: "病假", id: 0},
                {name: "丧假", id: 4},
                {name: "其他", id: 6},
            ],
            timeMenu1: false,
            timeMenu2: false,
            allowedMinutes: [0, 10, 20, 30, 45, 50, 60],
            defaultFlowName: null
        }),
        props: {
            frameId: String,
        },
        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.loadData();
                    }
                },
            }
        },
        created() {
            if (this.frameId != null) {
                this.loadData();
            } else {
                this.reset()
            }

            if (this.$store.state.user.sectionName.indexOf("市场") !== -1) {
                this.defaultFlowName = "02.请假申请（市场部）"
            }  else {
                this.defaultFlowName = "01.请假申请"
            }

        },
        methods: {
            endDateChange() {
                this.menu2 = false
                this.timeMenu2 = true
                this.diffDateTime()
            },
            startDateChange() {
                this.menu = false
                this.timeMenu1 = true
                if (this.data.startDate > this.data.endDate) {
                    this.data.endDate = this.data.startDate
                }
                this.diffDateTime()
            },
            loadData() {
                getById(this.frameId).then(data => {
                    try {
                        let days = this.getHour(data.startDate, data.endDate)
                        if (isNaN(days)) {
                            data.leaveHouse = 0
                        } else {
                            data.leaveHouse = days % 8
                        }

                    } catch (e) {
                        data.leaveHouse = 0;
                        console.log("请假小时转换异常", e);
                    }
                    this.data = data;
                })
            },
            diffDateTime() {
                let date = this.getHour(this.data.startDate + "T" + this.data.startTime + ":00",
                    this.data.endDate + "T" + this.data.endTime + ":00")
                this.data.leaveHouse = date % 8
                this.data.leaveNumber = parseInt(date / 8)
            },
            reset() {
                let defaultTime = '17:00';
                let month = new Date().getMonth() + 1
                if (month >= 5 && month <= 9) {
                    defaultTime = "17:30"
                }
                this.data = {
                    type: 1,
                    leaveHouse: 0,
                    leaveNumber: 0,
                    staff: {
                        name: this.$store.state.user.name
                    },
                    startDate: this.formatTimer(new Date()),
                    endDate: this.formatTimer(new Date()),
                    startTime: '08:30',
                    endTime: defaultTime,
                    remark: '',
                }
                this.diffDateTime()
            },
            save() {
                let valid = this.$refs.form.validate();
                if (valid) {
                    this.data.startDate += " " + this.data.startTime
                    this.data.endDate += " " + this.data.endTime
                    this.data.series = this.data.staff.name + "-" + this.dateFormat(new Date(this.data.startDate), "d") + "号-请假申请"
                    return api.addVacation(this.data).then(result => {
                        this.$refs['flow'].startFlow({
                            title: result.series,
                            content: result.series,
                            frameId: result.id,
                            frameCoding: 137214,
                            frameColumn: 'po05701'
                        })
                    })
                    /*return new Promise((resolve)=>{
                        resolve({})
                    })*/
                } else {
                    return new Promise((resolve, reject) => {
                        reject("验证未通过");
                    });
                }
            }
        }
    }
</script>

<style scoped>

</style>