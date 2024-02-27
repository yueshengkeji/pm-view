<template style="width: 80%">
    <v-card>
        <v-card-title>
            <v-btn color="primary" small @click="clickAction">
                出差申请
            </v-btn>
        </v-card-title>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                class="elevation-1"
        >
            <template v-slot:item.createTime="{ item }">
                <span>{{item.createTime | formatTimer}}</span>
            </template>

            <template v-slot:item.startTime="{ item }">
                <span>{{item.startTime | formatTimer}}</span>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon
                        small
                        class="mr-2"
                        @click="detailHandler(item)"
                >
                    明细
                </v-icon>
                <v-icon
                        small
                        class="mr-2"
                        @click="deleteItem(item)"
                >
                    mdi-delete
                </v-icon>
            </template>

        </v-data-table>
        <v-dialog v-model="travelApply" width="80%">
            <v-card>
                <v-card-title>出差申请</v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form ref="travelApplicationForm">
                            <v-row dense>
                                <v-col lg="4" md="4" sm="4">
                                    <v-text-field dense label="申请人" v-model="$store.state.user.name"
                                                  disabled></v-text-field>
                                </v-col>
                                <!--                            <v-col lg="4" md="4" sm="4">-->
                                <!--                                <v-text-field dense label="职务" v-model="$store.state.user.roles" disabled></v-text-field>-->
                                <!--                            </v-col>-->
                                <v-col lg="4" md="4" sm="4">
                                    <v-text-field dense label="部门" v-model="$store.state.user.sectionName"
                                                  disabled></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="3" sm="6" style="margin-top: -18px;">
                                    <v-menu
                                            ref="menu1"
                                            v-model="menu1"
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            transition="scale-transition"
                                            offset-y
                                            max-width="290px"
                                            min-width="290px"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                                    v-model="editedItem.startTime"
                                                    :rules="rules.startTimeRule"
                                                    label="出差开始时间"
                                                    required
                                                    prepend-icon="mdi-calendar"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"

                                            ></v-text-field>
                                        </template>
                                        <v-date-picker
                                                v-model="editedItem.startTime"
                                                @change="startTimeChanged"
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" md="3" sm="6" style="margin-top: -18px;">
                                    <v-menu
                                            ref="menu2"
                                            v-model="menu2"
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            transition="scale-transition"
                                            offset-y
                                            max-width="290px"
                                            min-width="290px"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                                    v-model="editedItem.endTime"
                                                    :rules="rules.endTimeRule"
                                                    label="出差结束时间"
                                                    required
                                                    prepend-icon="mdi-calendar"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"

                                            ></v-text-field>
                                        </template>
                                        <v-date-picker
                                                v-model="editedItem.endTime"
                                                @change="endTimeChanged"
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" lg="2" md="6" sm="2">
                                    <v-text-field dense label="合计时长(天)" v-model="editedItem.totalTime"
                                                  disabled></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2" sm="6">
                                    <easy-flow :dense="true"
                                               :searchName="false"
                                               :defaultFlowName="defaultFlowName"
                                               coding="1320274"
                                               :start="flowFlag"
                                               :success="startSuccess"
                                               :instance="flowInstance"></easy-flow>
                                </v-col>
                            </v-row>
                            <v-row>
                                <span>出差类型:</span>
                                <v-radio-group
                                        v-model="editedItem.travelType"
                                        mandatory
                                        row
                                >
                                    <v-radio
                                            label="市内公务"
                                            value="0"
                                    ></v-radio>
                                    <v-radio
                                            label="外地出差"
                                            value="1"
                                    ></v-radio>
                                </v-radio-group>
                            </v-row>
                            <v-row>
                                <span>交通工具:</span>
                                <v-radio-group
                                        v-model="editedItem.transportation"
                                        mandatory
                                        row
                                >
                                    <v-radio
                                            label="飞机"
                                            value="飞机"
                                    ></v-radio>
                                    <v-radio
                                            label="火车"
                                            value="火车"
                                    ></v-radio>
                                    <v-radio
                                            label="长途汽车"
                                            value="长途汽车"
                                    ></v-radio>
                                    <v-radio
                                            label="公司公务车"
                                            value="公司公务车"
                                    ></v-radio>
                                    <v-radio
                                            label="自驾"
                                            value="自驾"
                                    ></v-radio>
                                    <v-radio
                                            label="其他"
                                            value="其他"
                                            @click="getFocus"
                                    ></v-radio>
                                    <v-text-field
                                            ref="focus"
                                            v-model="editedItem.otherTransport"
                                            required
                                    ></v-text-field>
                                </v-radio-group>
                            </v-row>
                            <v-row>
                                <span>差旅费用计划:</span>
                                <v-col cols="12" md="2" sm="2">
                                    <v-text-field v-model="editedItem.travelFee" label="交通费(元)"
                                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="editedItem.stayFee" label="住宿费(元)"
                                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="editedItem.otherFee" label="其他(元)"
                                                  onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="1">
                                    <v-text-field v-model="editedItem.totalFee" label="费用总计(元)" readonly></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <div style="margin: 20px"><span>出差地点:</span></div>
                                <v-text-field
                                        v-model="editedItem.place" placeholder="从   （经）   到"
                                        :rules="rules.placeRule"
                                        required
                                >
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <div style="margin: 20px"><span>出差事由:</span></div>
                                <v-text-field
                                        v-model="editedItem.remark"
                                        :rules="rules.remarkRule"
                                        required
                                ></v-text-field>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-if="!$vuetify.breakpoint.xs"
                           @click="closeForm"
                    >
                        取消
                    </v-btn>
                    <v-btn v-if="!$vuetify.breakpoint.xs"
                           color="primary"
                           @click="saveForm"
                    >
                        提交
                    </v-btn>
                </v-card-actions>
                <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                    <v-btn :block="$vuetify.breakpoint.xs" @click="closeForm">取消</v-btn>
                </div>
                <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                    <v-btn :block="$vuetify.breakpoint.xs" color="primary" @click="saveForm">提交</v-btn>
                </div>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">确定</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <instance-detail :frame="frame" @close="closeHandler"></instance-detail>
    </v-card>

</template>

<script>
    import travelApplicationApi from "@/api/travelApplication";
    import easyFlow from "@/components/easyflow/easyFlow.vue";

    export default {
        components: {
            easyFlow,
            instanceDetail:()=>import('@/components/easyflow/instance-detail')
        },
        name: 'travelApplication',
        data: () => ({
            frame:null,

            dialogDelete: false,

            menu1: false,
            menu2: false,

            options: {},
            totalDesserts: null,

            headers: [
                {text: '序号', value: 'index'},
                {text: '填报日期', value: 'createTime', sortable: false},
                {text: '出差地点', value: 'place', sortable: false},
                {text: '交通工具', value: 'transportation', sortable: false},
                {text: '出差时间', value: 'startTime', sortable: false},
                {text: '出差时长(天)', value: 'totalTime', sortable: false},
                {text: '出差类型', value: 'travelType', sortable: false},
                {text: '审核状态', value: 'status', sortable: false},
                {text: '操作', value: 'actions', sortable: false}
            ],
            desserts: [],

            travelApply: false,

            editedItem: {
                id: null,
                traveller: null,
                position: null,
                department: null,
                startTime: null,
                endTime: null,
                totalTime: null,
                travelType: null,
                transportation: null,
                place: null,
                remark: null,
                travellerId: null,
                departmentId: null,
                otherTransport: null,
                travelFee: '0',
                stayFee: '0',
                otherFee: '0',
                totalFee: '0',
            },
            defaultItem: {
                id: null,
                traveller: null,
                position: null,
                department: null,
                startTime: null,
                endTime: null,
                totalTime: null,
                travelType: null,
                transportation: null,
                place: null,
                remark: null,
                travellerId: null,
                departmentId: null,
                otherTransport: null,
                travelFee: '0',
                stayFee: '0',
                otherFee: '0',
                totalFee: '0',
            },

            rules: {
                startTimeRule: [
                    v => !!v || '不能为空！'
                ],
                endTimeRule: [
                    v => !!v || '不能为空！',
                ],
                placeRule: [
                    v => !!v || '不能为空！',
                    v => (!!v && v.length < 50) || "不能超过50个字符"
                ],
                remarkRule: [
                    v => !!v || '不能为空！',
                    v => (!!v && v.length < 200) || "不能超过200个字符"
                ]
            },

            minDate: null,

            minDateEnd: null,
            maxDateEnd: null,
            flowFlag: false,
            flowInstance: {
                message: {
                    title: null,
                    content: null,
                    frameCoding: 1320274,
                    frameId: null,
                    frameColumn: "uuid"
                }
            },
            defaultFlowName: '出差申请单'
        }),

        computed: {},

        watch: {
            options: {
                handler() {
                    this.loadTravelApplicationMSG()
                },
                deep: true,
            },

            'editedItem.travelFee': {
                handler() {
                    this.editedItem.totalFee = (parseFloat(this.editedItem.travelFee) + parseFloat(this.editedItem.stayFee) + parseFloat(this.editedItem.otherFee)).toFixed(2)
                },
                deep: true,
            },

            'editedItem.stayFee': {
                handler() {
                    this.editedItem.totalFee = (parseFloat(this.editedItem.travelFee) + parseFloat(this.editedItem.stayFee) + parseFloat(this.editedItem.otherFee)).toFixed(2)
                },
                deep: true,
            },

            'editedItem.otherFee': {
                handler() {
                    this.editedItem.totalFee = (parseFloat(this.editedItem.travelFee) + parseFloat(this.editedItem.stayFee) + parseFloat(this.editedItem.otherFee)).toFixed(2)
                },
                deep: true,
            }

        },

        created() {
          let sn = this.$store.state.user.sectionName || ''
          if (sn.indexOf('采购') !== -1
              || sn.indexOf('综合管理') !== -1
              || sn.indexOf('财务') !== -1) {
            this.defaultFlowName = "出差申请单（采购、财务、综管）"
          } else if (sn.indexOf('市场')) {
            this.defaultFlowName = "出差申请单（市场）"
          }
        },

        filters: {
            formatTimer: function (value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },
        },

        methods: {
            detailHandler(item){
                this.frame = item.id
            },
            closeHandler(closeState){
                if(closeState){
                    this.frame = null
                }
            },
            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },
            DateDiff(sDate1, sDate2) {
                var aDate, oDate1, oDate2, iDays;
                aDate = sDate1.split("-");
                // 转换为 12-18-2002 格式
                oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
                aDate = sDate2.split("-");
                oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
                //把相差的毫秒数转换为天数
                iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);

                return iDays + 1;
            },

            getFocus() {
                this.$refs.focus.focus()
            },
            loadTravelApplicationMSG() {
                travelApplicationApi.getTravelApplicationMSG(this.options).then(result => {
                    if (result != null) {
                        for (let x = 0; x < result.rows.length; x++) {
                            try {
                                var item = result.rows[x]
                                if (item.travelType == 0) {
                                    result.rows[x].travelType = '市内公务'
                                } else if (item.travelType == 1) {
                                    result.rows[x].travelType = '外地出差'
                                }

                                if (item.status == 0) {
                                    result.rows[x].status = '未审核'
                                } else if (item.status == 1) {
                                    result.rows[x].status = '已审核'
                                }
                            } catch (e) {
                                console.log(e)
                            }
                        }
                    }
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;
                    // var date = this.formatTimer(new Date())
                    // this.minDate = date;
                    // this.minDateEnd = this.minDate;
                }).catch(e => {
                    console.log("异常信息", e);
                });

            },

            deleteItem(item) {
                this.editedItem = Object.assign({}, item)
                if (item.status == '未审核') {
                    this.tempItem = item;
                    this.dialogDelete = true
                } else if (item.status == '已审核') {
                    alert('无法删除已通过记录！')
                }
            },
            closeDelete() {
                this.dialogDelete = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                })
            },
            deleteItemConfirm() {
                if (this.tempItem.status == '未审核') {
                    this.tempItem.status = 0
                } else if (this.tempItem.status == '已审核') {
                    this.tempItem.status = 1
                }
                if (this.tempItem.travelType == '市内公务') {
                    this.tempItem.travelType = 0
                } else if (this.tempItem.travelType == '外地出差') {
                    this.tempItem.travelType = 1
                }
                travelApplicationApi.deleteTravelApplication(this.tempItem).then(result => {
                    console.log('deleteresult',result)
                    if (result == 1) {
                        this.loadTravelApplicationMSG()
                        this.tempItem = null
                    }
                })
                this.closeDelete()
            },

            clickAction() {
                this.travelApply = true;
            },

            startTimeChanged() {
                this.$refs.menu1.save(this.editedItem.startTime)
                this.minDateEnd = this.editedItem.startTime;
                if (this.editedItem.startTime != null && this.editedItem.endTime != null) {
                    this.editedItem.totalTime = this.DateDiff(this.editedItem.endTime, this.editedItem.startTime)
                }
            },

            endTimeChanged() {

                this.$refs.menu2.save(this.editedItem.endTime)
                if (this.editedItem.startTime != null && this.editedItem.endTime != null) {
                    this.editedItem.totalTime = this.DateDiff(this.editedItem.endTime, this.editedItem.startTime)
                }
            },
            closeForm() {
                this.travelApply = false;
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)

                })
            },
            saveForm() {
                let valid = this.$refs['travelApplicationForm'].validate();
                if (valid == true) {
                    travelApplicationApi.insertTravelApplication(this.editedItem).then(result => {
                        console.log('result',result)
                        if (result.id != null) {
                            this.flowInstance.message.title = result.traveller + "-出差申请";
                            this.flowInstance.message.content = result.remark;
                            this.flowInstance.message.frameId = result.id;
                            this.flowFlag = true;
                        }
                        this.closeForm()
                        this.loadTravelApplicationMSG()
                    })
                }
            },
            startSuccess() {
                this.loadTravelApplicationMSG()
                this.editedItem = Object.assign({}, this.defaultItem)
                this.flowFlag = false;
                this.closeForm()
            }


        }
    }
</script>
