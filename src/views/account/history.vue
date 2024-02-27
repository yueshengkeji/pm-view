<template>
    <div>
        <v-row>
            <v-col md="1">
                <v-btn @click="download">导出</v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col md="2">
                <v-chip color="primary" small>充值合计：{{countMoney}}元</v-chip>
            </v-col>
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
                      :sort-by.sync="sortBy"
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
    import {exportExcel, history} from '@/api/account'

    export default {
        name: "account-list",
        data: () => ({
            loading: false,
            items: [],
            headers: [
                {text: '姓名', value: 'staff.name'},
                {text: '充值金额', value: 'money'},
                {text: '充值前余额', value: 'afterBalance'},
                {text: '备注', value: 'remark'},
                {text: '充值时间', value: 'datetime'},
            ],
            search: null,
            msg: null,
            msgFlag: false,
            sectionList: [],
            params: {
                staffId: null,
                searchText: null,
                startDate: null,
                endDate: null,
            },
            total: 0,
            menu: false,
            menu2: false,
            countMoney: 0,
            sortBy: 'datetime'
        }),
        props: {
            staffId: null
        },
        watch: {
            params: {
                handler() {
                    this.loadList()
                },
            },
            staffId: {
                handler() {
                    this.loadList()
                },
            }
        },
        created() {
            this.params.startDate = this.getMonthFirst(new Date())
            this.params.endDate = this.getMonthEnd(new Date())
        },
        methods: {
            download() {
                let q = Object.assign({}, this.params)
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                if (q.startDate && q.endDate) {
                    q.startDate += " 00:00:00"
                    q.endDate += " 23:59:59"
                    exportExcel(q).then(result => {
                        let a = document.createElement("a");
                        a.download = result.substr(result.lastIndexOf("/") + 1)
                        a.href = result
                        a.click()
                    })
                } else {
                    this.msg = "请指定日期范围"
                    this.msgFlag = true
                }
            },
            loadList() {
                this.loading = true
                let q = Object.assign({}, this.params)
                q.staffId = this.staffId
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                if (q.startDate && q.endDate) {
                    q.startDate += " 00:00:00"
                    q.endDate += " 23:59:59"
                }
                history(q).then((result) => {
                    this.countMoney = 0
                    result.rows.forEach(item => {
                        this.countMoney += item.money
                    })
                    this.items = result.rows
                    this.total = result.total
                }).finally(() => this.loading = false)
            }
        }
    }
</script>

<style scoped>

</style>