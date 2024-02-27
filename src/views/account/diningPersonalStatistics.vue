<template>
    <div>
        <v-row>
            <v-col >
                <v-btn class="ml-1" @click="download">导出</v-btn>
<!--                <v-btn class="ml-1" @click="exportExcelLastHistory">导出余额列表</v-btn>-->
            </v-col>
            <v-spacer></v-spacer>
            <!--            <v-col md="2">-->
            <!--                <v-chip color="primary" small>消费合计：{{countMoney}}元</v-chip>-->
            <!--            </v-col>-->
            <v-col md="2">
                <v-menu v-model="menu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        ref="menu"
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="params.startDate"
                                      label="开始时间"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="params.startDate" @change="$refs.menu.save()" no-title
                                   scrollable></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="2">
                <v-menu v-model="menu2"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        ref="menu2"
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="params.endDate"
                                      label="截止时间"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="params.endDate" @change="$refs.menu2.save()" no-title
                                   scrollable></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="2">
                <v-text-field label="搜索" v-model="params.searchText"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table :items.sync="items"
                      sort-by="staff_id"
                      sort-desc
                      :loading="loading"
                      :server-items-length="total"
                      :options.sync="params"
                      :headers="headers">
        </v-data-table>
        <v-snackbar v-model="msgFlag">{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import {exportExcelPersonalDiningStatistics, getPersonalDiningStatistics,exportExcelLastHistory} from '@/api/dining'

    export default {
        name: "personal-statistics-account-list",
        data: () => ({
            loading: false,
            items: [],
            headers: [
                {text: '姓名', value: 'staffName'},
                {text: '部门', value: 'staff.section.name'},
                {text: '中餐|次数', value: 'personalCounts'},
                {text: '中餐|金额', value: 'totalMoney'},
            ],
            search: null,
            msg: null,
            msgFlag: false,
            sectionList: [],
            params: {staffId: null, searchText: null, startDate: null, endDate: null},
            total: 0,
            menu: false,
            menu2: false,
            countMoney:0,
        }),
        watch: {
            params: {
                handler() {
                    this.loadList()
                },
                deep: true,
            }
        },
        created() {
            this.params.startDate = this.getMonthFirst(new Date())
            this.params.endDate = this.getMonthEnd(new Date())
        },
        methods: {
            download(){
                let q = Object.assign({}, this.params)
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                q.type = 1 //消费
                if (q.startDate && q.endDate) {
                    q.startDate += " 00:00:00"
                    q.endDate += " 23:59:59"
                    exportExcelPersonalDiningStatistics(q).then(result=>{
                        let a = document.createElement("a");
                        a.download = result.substr(result.lastIndexOf("/")+1)
                        a.href = result
                        a.click()
                    })
                }else{
                    this.msg = "请指定日期范围"
                    this.msgFlag = true
                }
            },
            loadList() {
                this.countMoney = 0
                this.loading = true
                let q = Object.assign({}, this.params)
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                q.type = 1 //消费
                if (q.startDate && q.endDate) {
                    q.startDate += " 00:00:00"
                    q.endDate += " 23:59:59"
                }
                getPersonalDiningStatistics(q).then((result) => {
                    result.rows.forEach(item=>{
                        this.countMoney += item.money
                    })
                    this.items = result.rows
                    this.total = result.total
                }).finally(() => this.loading = false)
            },
            exportExcelLastHistory(){
                let q = Object.assign({}, this.params)
                if (q.startDate && q.endDate) {
                    q.startDate += " 00:00:00"
                    q.endDate += " 23:59:59"
                }
                let start = q.startDate
                let end = q.endDate
                exportExcelLastHistory({startDate:start,endDate:end}).then(result => {
                    let a = document.createElement("a");
                    a.download = result.substr(result.lastIndexOf("/")+1)
                    a.href = result
                    a.click()
                })
            }
        }
    }
</script>

<style scoped>

</style>