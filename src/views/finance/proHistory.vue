<template>
    <div>
        <v-row dense>
            <v-col cols="8">
                <v-row dense>
                    <v-col cols="4">
                        <v-menu ref="menu" offset-y bottom v-model="menu" :close-on-click="false">
                            <template v-slot:activator="{on,attrs}">
                                <v-text-field dense label="开始时间" v-model="q.start" v-on="on"
                                              v-bind="attrs"></v-text-field>
                            </template>
                            <v-date-picker v-model="q.start" @change="$refs.menu.save()"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="4">
                        <v-menu ref="menu2" offset-y bottom v-model="menu2" :close-on-click="false">
                            <template v-slot:activator="{on,attrs}">
                                <v-text-field dense label="截止时间" v-model="q.end" v-on="on"
                                              v-bind="attrs"></v-text-field>
                            </template>
                            <v-date-picker v-model="q.end" @change="list"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="4">
                        <v-chip small>合计：{{countMoney.toFixed(2)}}</v-chip>
                    </v-col>
                </v-row>
                <v-data-table :items="data.rows"
                              :loading="loading"
                              :options.sync="options"
                              @click:row="clickHandler"
                              :server-items-length="data.total"
                              :headers="headers">
                    <template v-slot:item.index="{index}">
                        {{index+1}}
                    </template>
                </v-data-table>
            </v-col>
            <v-col cols>
                <v-row dense>
                    <v-col cols>
                        <v-chip small>合计：{{saveCount.toFixed(2)}}</v-chip>
                    </v-col>
                </v-row>
                <v-data-table :items="saveItems" :headers="headers2" hide-default-footer>
                    <template v-slot:item.index="{index}">
                        {{index+1}}
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import {proHistory} from '@/api/company'

    export default {
        name: "fProHistory",
        data: () => ({
            data: {
                rows: [],
                total: 0
            },
            loading: false,
            headers: [
                {text: '序号', value: 'index', sortable: false},
                {text: '项目名称', value: 'project.name', sortable: false},
                {text: '材料名称', value: 'material.name', sortable: false},
                {text: '型号', value: 'material.model', sortable: false},
                {text: '采购日期', value: 'p.pmDate', sortable: false},
                {text: '采购金额', value: 'moneyTax', sortable: false},
            ],
            q: {
                companyId: null,
                start: null,
                end: null,
                searchText: null,
                loadProcurement: false,
            },
            options: {
                page: 1,
                itemsPerPage: 10,
                sortDesc: [true],
                sortBy: ['a.pm01302']
            },
            menu: false,
            menu2: false,
            countMoney: 0,

            saveItems: [],
            headers2: [
                {text: '序号', value: 'index'},
                {text: '项目', value: 'project.name'},
                {text: '日期', value: 'proDate'},
                {text: '金额', value: 'proMoney'},
            ],
            projectCache: [],
            saveCount: 0
        }),
        props: {
            query: null,
        },
        watch: {
            options() {
                this.list()
            },
            query() {
                if (this.query) {
                    this.saveItems = []
                    this.projectCache = []
                    this.q = Object.assign({}, this.query)
                    this.list()
                }
            },
            "data.rows": {
                handler() {
                    this.countMoney = 0
                    this.data.rows.forEach(item => {
                        this.countMoney += item.moneyTax
                    })
                }
            },
            saveItems: {
                handler() {
                    this.saveCount = 0
                    this.saveItems.forEach(item => {
                        this.saveCount += item.proMoney
                    })
                }
            }
        },
        created() {
            if (this.query) {
                this.q = Object.assign({}, this.query)
            }
            this.list()
        },
        methods: {
            clickHandler(event, {item, index}) {
                this.data.rows.splice(index, 1)
                let catchItem = this.projectCache[item.project.id + item.p.id]
                if (catchItem) {
                    catchItem.proMoney += item.moneyTax
                } else {
                    catchItem = {
                        proId: item.p.id,
                        proDate: item.p.pmDate,
                        proMoney: item.moneyTax,
                        project: {
                            id: item.project.id,
                            name: item.project.name,
                        }
                    }
                    this.saveItems.push(catchItem)
                }
                this.projectCache[item.project.id + item.p.id] = catchItem
            },
            clear() {
                this.saveItems = []
                this.projectCache = []
                this.list()
            },
            list() {
                this.loading = true
                this.q.page = this.options.page
                this.q.itemsPerPage = this.options.itemsPerPage
                this.q.sortBy = this.options.sortBy[0]
                this.q.sortDesc = this.options.sortDesc[0]
                proHistory(this.q).then(result => this.data = result).finally(() => this.loading = false)
            },
            getSaveItems(){
                return this.saveItems
            }
        }
    }
</script>

<style scoped>

</style>