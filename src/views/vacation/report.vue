<template>
    <div>
        <v-card-actions>
            请假单统计报表
            <v-row dense>
                <v-col lg="6" cols="12">
                    <v-row dense>
                        <v-col cols="6">
                            <v-menu v-model="menu"
                                    ref="menu"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                            v-model="query.start"
                                            label="数据开始日期"
                                            prepend-icon="mdi-calendar"
                                            append-outer-icon="mdi-minus"
                                            readonly
                                            v-bind="attrs"
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="query.start"
                                               @input="$refs.menu.save()"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="6">
                            <v-menu v-model="menu2"
                                    ref="menu2"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                            v-model="query.end"
                                            label="数据截止日期"
                                            prepend-icon="mdi-calendar"
                                            readonly
                                            v-bind="attrs"
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="query.end"
                                               @input="$refs.menu2.save()"></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="exportExcel">导出</v-btn>
        </v-card-actions>


        <v-data-table :items.sync="vacationData"
                      :headers="headers"
                      :server-items-length="total"
                      :options.sync="query"
                      :loading="vacationLoading"
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
                <v-btn x-small @click="deleteLeave(item)">删除</v-btn>
            </template>
        </v-data-table>
        <!--        请假单审批明细-->
        <instance-detail :frame="detailItemId" @close="closeDetail"></instance-detail>
    </div>
</template>

<script>
    import vacationApi from '@/api/vacation'
    import instanceDetail from '@/components/easyflow/instance-detail'

    export default {
        name: "vacation-report",
        components: {
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
            detailItemId: null,

            query: {
                start: null,
                end: null,
                searchText: null,
                state: 1
            },
            menu: false,
            menu2: false,
            total: 0,
        }),
        mounted() {
            let {open} = this.$route.query
            this.vacationDialog = open === "open"
        },
        watch: {
            query: {
                handler(val, val2) {
                    console.log("handler,val,val2", val.end, val2.end)
                    this.loadData();
                },
                deep: true
            }
        },
        created() {
            //获取本月第一天
            this.query.start = this.getMonthFirst(new Date());
            //获取本月最后一天
            this.query.end = this.getMonthEnd(new Date());
        },
        methods: {
            exportExcel() {
                vacationApi.exportExcel(this.getQuery()).then(result => {
                    let a = document.createElement("a");
                    a.download = result.substr(result.lastIndexOf("/") + 1)
                    a.href = result
                    a.click()
                })
            },
            closeDetail(flag) {
                if (flag) {
                    this.detailItemId = null
                }
            },
            submit() {
                this.vacationLoading = true
                this.$refs.vacation.save().then(() => {
                    this.loadData()
                    this.vacationDialog = false
                })
            },
            addSuccess() {
                this.vacationDialog = false;
                this.loadData();
            },
            getQuery() {
                let q = Object.assign({}, this.query)
                q.sortName = "po05707"
                q.sortOrder = "desc"
                q.pageSize = q.itemsPerPage === -1 ? 9999 : q.itemsPerPage
                q.pageNumber = q.page
                q.start += " 00:00:00"
                q.end += " 23:59:59"
                return q
            },
            loadData() {
                let day = this.dayDiff(this.query.start, this.query.end)
                if (day > 0 && day <= 92) {
                    let q = this.getQuery()
                    this.vacationLoading = true;
                    vacationApi.list(q).then(res => {
                        let result = res.rows
                        this.total = res.total
                        result.forEach(item => {
                            if (item.startDate.length >= 18) {
                                item.startDate = item.startDate.substr(0, 16)
                                item.endDate = item.endDate.substr(0, 16)
                            }
                        })
                        this.vacationData = result
                        console.log(this.vacationData, this.total)
                    }).finally(() => this.vacationLoading = false)
                } else {
                    this.$store.state.showTooltip.msg = "最大可查询90天数据，请缩短时间范围，分次查询"
                    this.$store.state.showTooltip.show = true
                    this.$store.state.showTooltip.back = ()=>{
                        this.$store.state.showTooltip.show = false
                    }
                }

            },
            deleteLeave(vacation) {
                this.vacationLoading = true
                vacationApi.deleteVacation(vacation.id).finally(this.loadData);
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
                    let days = this.getHour(row.startDate, row.endDate);
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
                console.log(this.detailItemId)
            }
        }

    }
</script>

<style scoped>

</style>
