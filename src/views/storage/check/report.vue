<template>
    <div>
        <v-data-table :items="data.rows"
                      sort-desc
                      sort-by="bm.backDate"
                      :options.sync="options"
                      :headers="headers"
                      :loading="loading"
                      :server-items-length="data.total">
            <template v-slot:top>
                <v-row dense>
                    <v-col sm="1">
                        <v-btn :loading="downloadLoading" small @click="exportExcel">导出</v-btn>
                    </v-col>
                    <v-col sm="2">
                        <v-menu ref="menu"
                                v-model="menu"
                                transition="scale-transition"
                                :close-on-content-click="false"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        dense
                                        v-model="date"
                                        label="指定开始/截止日期"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="date"
                                    range
                                    :max="new Date().toISOString().substr(0, 10)"
                                    min="1950-01-01"
                                    @change="changeDate"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col lg="1">
                        <v-chip small title="合计金额">{{ totalMoneySum }}</v-chip>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col sm="2" cols="12">
                        <v-text-field @change="list" dense label="搜索材料" v-model="searchText"></v-text-field>
                    </v-col>
                </v-row>
            </template>
            <template v-slot:item.index="{index}">
                {{index+1}}
            </template>
            <template v-slot:item.material.id="{item}">
                {{formatId(item.material.id)}}
            </template>
        </v-data-table>
    </div>
</template>

<script>
    import {exportExcel, materHistory,getCheckTotalMoney} from '@/api/check'

    export default {
        name: "checkReport",
        data: () => ({
            headers: [
                {text: '序号', value: 'index'},
                {text: '盘点单号', value: 'cm.checkNumber'},
                {text: '材料编码', value: 'material.id', sortable: false},
                {text: '材料名称', value: 'material.name',sortable: false},
                {text: '型号', value: 'material.model',sortable: false},
                {text: '品牌', value: 'material.brand',sortable: false},
                {text: '日期', value: 'cm.checkDate'},
                {text: '盘点前数量', value: 'sum'},
                {text: '实际数量', value: 'realitySum'},
                {text: '单位', value: 'material.unit.name',sortable: false},
                {text: '单价', value: 'price'},
                {text: '金额', value: 'money'},
                {text: '盘点人员', value: 'cm.staff.name',sortable: false},
            ],
            data: {
                rows: [],
                total: 0
            },
            options: {},
            searchText: null,
            loading: false,
            downloadLoading: false,
            menu: false,
            date: [],
            startDate: null,
            endDate: null,

            totalMoneySum:0
        }),
        watch: {
            options: {
                handler() {
                    this.list()
                },
                deep: true
            },
        },
        created() {
            this.startDate = this.$route.params.start
            this.endDate = this.$route.params.end
            if (this.startDate) {
                this.date = [this.startDate, this.endDate]
            } else {
                this.startDate = this.getMonthFirst(new Date())
                this.endDate = this.getMonthEnd(new Date())
                this.date = [this.startDate, this.endDate]
            }
        },
        methods: {
            changeDate() {
                if (this.date.length > 0) {
                    let date1 = this.date[0];
                    let date2 = this.date[1];
                    if (date1 <= date2) {
                        this.startDate = date1;
                        this.endDate = date2;
                    } else {
                        this.startDate = date2;
                        this.endDate = date1;
                    }
                    this.menu = false;
                } else {
                    this.startDate = null;
                    this.endDate = null;
                }
                this.list()
            },
            exportExcel() {
                this.downloadLoading = true
                let q = this.getQueryParam()
                exportExcel(q).then(result => {
                    let a = document.createElement("a")
                    a.href = result
                    a.download = result.substring(result.lastIndexOf('/') + 1)
                    a.click()
                }).finally(() => {
                    this.downloadLoading = false
                })
            },
            getQueryParam() {
                let q = Object.assign({}, this.options)
                q.searchText = this.searchText
                q.startDate = this.startDate
                q.endDate = this.endDate
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                return q;
            },
            list() {
                let q = this.getQueryParam()
                this.loading = true
                materHistory(q).then(result => this.data = result).finally(() => this.loading = false)
                getCheckTotalMoney(q).then(res => {
                    this.totalMoneySum = res.toFixed(2)
                })
            }
        }
    }
</script>

<style scoped>

</style>