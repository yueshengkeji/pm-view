<template>
    <div>
        <v-card-actions>
            我的请假
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="insertHeader">请假申请</v-btn>
        </v-card-actions>


        <v-data-table :items="vacationData"
                      :headers="headers"
                      :items-per-page="-1"
                      :loading="vacationLoading"
                      hide-default-footer
                      sort-by="startDate"
                      sort-desc>
            <template v-slot:item.type="{item}">
                {{typeFormat(item)}}
            </template>
            <template v-slot:item.leaveHouse="{item}">
                {{dateFormat(item)}}
            </template>
            <template v-slot:item.approveStatus="{item}">
                <v-chip @click="openDetail(item)" link x-small :color="getTagType(item.approveStatus)">
                    {{getAppMArk(item.approveStatus)}}
                </v-chip>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn color="error" x-small @click="deleteLeave(item)">删除</v-btn>
            </template>
        </v-data-table>
        <!--        添加请假单-->
        <v-dialog v-model="vacationDialog" @input="$refs.vacation.reset()"
                  :fullscreen="$vuetify.breakpoint.xs"
                  :max-width="$vuetify.breakpoint.lg ? '50%' : ''">
            <v-card class="pa-3">
                <add-vacation ref="vacation"></add-vacation>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-if="!$vuetify.breakpoint.xs" @click="vacationDialog = false">取消</v-btn>
                    <v-btn v-if="!$vuetify.breakpoint.xs" color="primary" @click="submit()">提交</v-btn>
                </v-card-actions>
                <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                    <v-btn :block="$vuetify.breakpoint.xs" @click="vacationDialog = false">取消</v-btn>
                </div>
                <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                    <v-btn :block="$vuetify.breakpoint.xs" color="primary" @click="submit">提交</v-btn>
                </div>
            </v-card>
        </v-dialog>
        <!--        请假单审批明细-->
        <instance-detail :frame="detailItemId" @close="closeDetail"></instance-detail>
    </div>
</template>

<script>
    import vacationApi from '@/api/vacation'
    import addVacation from '@/components/137214'
    import instanceDetail from '@/components/easyflow/instance-detail'

    export default {
        name: "vacation",
        components: {
            addVacation,
            instanceDetail
        },
        data: () => ({
            headers: [
                {text: '姓名', value: 'staff.name'},
                {text: '假期类型', value: 'type'},
                {text: '请假天数', value: 'leaveNumber'},
                {text: '时长', value: 'leaveHouse'},
                {text: '请假开始时间', value: 'startDate'},
                {text: '请假截止时间', value: 'endDate'},
                {text: '是否审核', value: 'approveStatus'},
                {text: '操作', value: 'action'},
            ],
            vacationLoading: false,
            vacationDialog: false,
            vacationData: [],

            detailDialog: false,
            detailItemId: null
        }),
        mounted() {
            let {open} = this.$route.query
            this.vacationDialog = open === "open"
        },
        created() {
            this.$nextTick(() => {
                this.insertHeader()
            })
            this.loadLeaveData();
        },
        methods: {
            insertHeader() {
                if(this.$refs.vacation){
                    this.$refs.vacation.reset()
                }
                this.vacationDialog = true
            },
            closeDetail(flag) {
                if (flag) {
                    this.detailItemId = null
                }
            },
            submit() {
                this.vacationLoading = true
                this.$refs.vacation.save().then(() => {
                    this.loadLeaveData()
                    this.vacationDialog = false
                })
            },
            addSuccess() {
                this.vacationDialog = false;
                this.loadLeaveData();
            },
            loadLeaveData() {
                this.vacationLoading = true;
                vacationApi.loadMyVacationData().then(result => {
                    result.forEach(item => {
                        if (item.startDate.length >= 18) {
                            item.startDate = item.startDate.substr(0, 16)
                            item.endDate = item.endDate.substr(0, 16)
                        }
                    })
                    this.vacationData = result
                }).finally(() => this.vacationLoading = false)
            },
            deleteLeave(vacation) {
                this.vacationLoading = true
                vacationApi.deleteVacation(vacation.id).finally(this.loadLeaveData);
            },
            getTagType(type) {
                switch (type) {
                    case -1:
                        return "error";
                    case 0:
                        return "";
                    case 1:
                        return "success";
                }
            },
            getAppMArk(type) {
                switch (type) {
                    case -1:
                        return "未发起";
                    case 0:
                        return "审批中";
                    case 1:
                        return "已完成";
                }
            },
            dateFormat(row) {
                if (row.startDate && row.endDate) {
                    let days = this.getHourV2((row.startDate + ":00").replace(" ", "T"), (row.endDate + ":00").replace(" ", "T"));
                    return days % 8
                } else {
                    return 0;
                }
            },
            typeFormat(row) {
                switch (row.type) {
                    case 0:
                        return "病假";
                    case 1:
                        return "事假";
                    case 2:
                        return "婚假";
                    case 3:
                        return "年休假";
                    case 4:
                        return "丧假";
                    case 5:
                        return "产假";
                    case 6:
                        return "其他";
                    case 7:
                        return "调休";
                    default:
                        return "";
                }
            },
            openDetail(item) {
                this.detailItemId = item.id
                this.detailDialog = true
            }
        }

    }
</script>

<style scoped>

</style>
