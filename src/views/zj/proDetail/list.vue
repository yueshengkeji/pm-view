<template>
    <div>
        <v-row dense>
            <v-col cols="12" sm="1">
                <v-btn small @click="exportListHandler">导出</v-btn>
            </v-col>
            <v-col cols="12" sm="4">
                <v-radio-group v-model="query.contractType" row dense class="mt-0">
                    <v-radio label="租赁费用" :value="0"></v-radio>
                    <v-radio label="物管费用" :value="1"></v-radio>
                    <v-radio label="多经类" :value="2"></v-radio>
                    <v-radio label="所有" :value="-1"></v-radio>
                </v-radio-group>
            </v-col>
            <v-col cols="12" sm="3">
                <v-radio-group v-model="query.type" row dense class="mt-0">
                    <v-radio label="应收" :value="0"></v-radio>
                    <v-radio label="实收" :value="1"></v-radio>
                    <v-radio label="所有" :value="-1"></v-radio>
                </v-radio-group>
            </v-col>
            <v-col sm="4">
                <v-chip small>实收合计:{{ data.moneyCount.proMoney }}</v-chip>
                <v-chip small class="ml-1">应收合计:{{ data.moneyCount.putMoney }}</v-chip>
            </v-col>
            <v-col sm="2">
                <v-menu ref="menu" v-model="menu">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field title="默认为应收时间筛选，如需实收时间筛选，请先点击实收选项" clearable dense v-model="query.startDate"
                            v-on="on" v-bind="attrs" label="开始日期"></v-text-field>
                    </template>
                    <v-date-picker @change="$refs.menu.save()" v-model="query.startDate"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col sm="2">
                <v-menu ref="menu2" v-model="menu2">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field title="默认为应收时间筛选，如需实收时间筛选，请先点击实收选项" clearable dense v-model="query.endDate" v-on="on"
                            v-bind="attrs" label="截止日期"></v-text-field>
                    </template>
                    <v-date-picker @change="$refs.menu2.save()" v-model="query.endDate"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col sm="2">
                <v-text-field dense label="搜索" v-model="query.searchText"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table sort-by="proDate" sort-desc :loading="loading" :headers="headers" :options.sync="options"
                    :items.sync="data.rows" :server-items-length="data.total">

                </v-data-table>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { listAll, exportList } from '@/api/proPutDetail'

export default {
    components: {

    },
    name: "proDetailList",
    data: () => ({
        headers: [
            { text: '单位名称', value: 'zujin.company', sortable: false },
            { text: '品牌', value: 'zujin.brand', sortable: false },
            { text: '应收时间', value: 'proDate' },
            { text: '应收金额', value: 'proMoney' },
            { text: '实收时间', value: 'putDate' },
            { text: '实收金额', value: 'putMoney' },
            { text: '联系人', value: 'zujin.zlPerson' },
            { text: '联系电话', value: 'zujin.zlPersonTel' },
            { text: '登记人', value: 'staff.name' },
            { text: '备注', value: 'remark' },
        ],
        options: {
            page: 1,
            itemsPerPage: 10,
            sortBy: ['proDate'],
            sortDesc: [true]
        },
        data: {
            rows: [],
            total: 0,
            moneyCount: {
                proMoney: 0,
                putMoney: 0
            }
        },
        query: { startDate: null, endDate: null, type: null, contractType: null, searchText: null },
        loading: false,
        menu: false,
        menu2: false,
    }),
    created() {
        this.list()
    },
    watch: {
        query: {
            handler() {
                this.list()
            },
            deep: true
        },
        options: {
            handler() {
                this.list()
            },
            deep: true
        }
    },
    methods: {
        exportListHandler() {
            this.loading = true
            let q = this.getParam()
            exportList(q).then(result => {
                let a = document.createElement("a")
                a.href = result
                a.download = result.substring(result.lastIndexOf('/') + 1)
                a.click()
            }).finally(()=>this.loading=false)
        },
        getParam() {
            let q = Object.assign({}, this.options)
            q = Object.assign(q, this.query)
            if (q.sortBy) {
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0] ? 'desc' : 'asc'
            }
            if (q.contractType == -1) {
                q.contractType = null
            }

            if (q.type == -1) {
                q.type = null
            }
            return q
        },
        list() {
            this.loading = true
            let q = this.getParam()
            listAll(q).then(result => {
                if (!result.moneyCount) {
                    result.moneyCount = {
                        proMoney: 0,
                        putMoney: 0,
                    }
                }
                this.data = result
            }).finally(() => this.loading = false)
        }
    }
}
</script>

<style scoped></style>