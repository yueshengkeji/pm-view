<template>
  <!--    供货商入库记录-->
    <div>
        <v-row>
            <v-col sm="2">
                <v-btn small color="primary" class="mr-1" @click="downloadExcel" :loading="downloadLoading">导出</v-btn>
                <v-menu ref="menu2" v-model="menu2" offset-y>
                    <template v-slot:activator="{attrs,on}">
                        <v-btn v-bind="attrs" v-on="on" small>显示项</v-btn>
                    </template>
                    <div class="pa-1 white">
                        <v-checkbox @change="sort"
                                    v-for="d in headers"
                                    :label="d.text"
                                    v-model="showHeaders"
                                    dense
                                    hide-details :value="d" multiple :key="d.text"></v-checkbox>
                    </div>
                </v-menu>
            </v-col>

            <v-col sm="3" cols="12">
                <v-autocomplete :items="companyList"
                                @change="list"
                                dense
                                v-model="queryCompany"
                                :search-input.sync="searchCompany"
                                return-object
                                hide-details
                                item-value="id"
                                item-text="name"
                                label="供应单位"></v-autocomplete>
            </v-col>
            <v-col sm="2" cols="12">
                <v-menu offset-y ref="menu" v-model="menu" :close-on-content-click="false">
                    <template v-slot:activator="{on,attrs}">
                        <v-text-field dense v-on="on" v-bind="attrs" v-model="queryDates"
                                      hide-details
                                      label="日期范围"></v-text-field>
                    </template>
                    <v-date-picker range v-model="queryDates" @change="dateChange"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col lg="1">
                <v-chip small title="合计金额">{{ totalMoneySum }}</v-chip>
            </v-col>
            <v-spacer></v-spacer>
            <v-col sm="3" cols="12">
                <v-text-field v-model="searchText" dense label="搜索" hide-details></v-text-field>
            </v-col>
        </v-row>
        <v-data-table :items="items"
                      :loading="loading"
                      sort-desc
                      sort-by="putDate"
                      :options.sync="options"
                      :server-items-length="total"
                      :headers="showHeaders">

            <template v-slot:item.material.id="{item}">
                {{ formatId(item.material.id) }}
            </template>

            <template v-slot:item.putNumber="{item}">
                <a :href="$router.options.base+'storage/put/list/'+item.putNumber" target="_blank">{{
                    item.putNumber
                    }}</a>
            </template>

            <template v-slot:item.company.name="{item}">
                <div class="overflow-hidden text-truncate" style="width:150px;height: 25px;">
                    {{ item.company.name }}
                </div>
            </template>
        </v-data-table>
        <v-dialog v-model="proDialog" width="99%">
            <v-card class="pa-2 pb-5">
                <detail :item="proItem"></detail>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import {exportPutHistory, list, putHistory, getPutTotalMoney} from '@/api/company'
import {loadById} from '@/api/procurement'
import detail from "../procurement/detail";

export default {
    name: "putHistory",
    components: {
        detail
    },
    props: {
        company: Object,
        materialId: String,
        historyItems: Array
    },
    data: () => ({
        downloadLoading: false,
        showHeaders: [
            {text: '材料编码', value: 'material.id', width: '15%'},
            {text: '材料名称', value: 'material.name', width: '15%'},
            {text: '型号', value: 'material.model', width: '15%'},
            {text: '品牌', value: 'material.brand', width: '8%'},
            {text: '入库数量', value: 'putSum', width: '6%'},
            {text: '单位', value: 'material.unit.name', width: '6%'},
            {text: '单价', value: 'taxPrice', width: '6%'},
            {text: '金额', value: 'moneyTax', width: '8%'},
            {text: '税率', value: 'tax', width: '6%'},
            {text: '时间', value: 'putDate', width: '8%'},
            {text: '入库单号', value: 'putNumber', width: '10%'},
            {text: '供货商', value: 'company.name', width: '12%'}],
        headers: [
            {text: '材料编码', value: 'material.id', width: '15%'},
            {text: '项目名称', value: 'project.name', width: '15%'},
            {text: '材料名称', value: 'material.name', width: '15%'},
            {text: '型号', value: 'material.name', width: '15%'},
            {text: '品牌', value: 'material.brand', width: '8%'},
            {text: '入库数量', value: 'putSum', width: '6%'},
            {text: '单位', value: 'material.unit.name', width: '6%'},
            {text: '单价', value: 'taxPrice', width: '6%'},
            {text: '金额', value: 'moneyTax', width: '8%'},
            {text: '税率', value: 'tax', width: '6%'},
            {text: '时间', value: 'putDate', width: '8%'},
            {text: '入库单号', value: 'putNumber', width: '10%'},
            {text: '供货商', value: 'company.name', width: '150px'},
        ],
        items: [],
        options: {},
        total: 0,
        companyList: [],
        searchCompany: null,
        queryCompany: null,
        queryDates: [],
        menu: false,
        menu2: false,
        searchText: null,
        proDialog: false,
        proItem: null,
        loading: false,

        totalMoneySum:0
    }),
    watch: {
        searchCompany(val) {
            list(val).then(result => {
                this.companyList = result
            })
        },
        options: {
            handler() {
                this.list()
            },
            deep: true
        },
        company: {
            handler() {
                console.log("company handler")
                this.queryCompany = this.company
                this.list()
            },
            deep: true,
        },
        materialId: {
            handler() {
                this.list()
            },
            deep: true,
        },
        historyItems: {
            handler() {
                this.items = this.historyItems
            }
        },
        searchText: {
            handler() {
                this.list()
            }
        }
    },
    created() {
        let start = this.$route.params.start
        let end = this.$route.params.end
        let companyId = this.$route.params.companyId
        let companyName = this.$route.params.companyName
        if (!start) {
            start = this.getMonthFirst(new Date())
            end = this.getMonthEnd(new Date())
        }
        this.queryDates = [start, end]
        if (companyId) {
            this.queryCompany = {id: companyId, name: companyName}
        } else {
            if (this.company) {
                this.queryCompany = this.company
            }
        }
        if (this.queryCompany) {
            this.companyList.push(this.queryCompany)
        }
        let sh = localStorage.getItem('putShowHeaders')
        if (sh) {
            this.showHeaders = JSON.parse(sh)
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (this.historyItems) {
                this.items = this.historyItems
            }
        })
    },
    methods: {
        dateChange() {
            this.menu = false
            this.list()
        },
        downloadExcel() {
            this.downloadLoading = true
            let q = this.getQueryParam();
            exportPutHistory(q).then(result => {
                let a = document.createElement("a")
                a.href = result
                a.download = result.substring(result.lastIndexOf('/') + 1)
                a.click()
            }).finally(() => this.downloadLoading = false)
        },
        showProDetail(p) {
            loadById(p.id).then(result => {
                this.proItem = result
                this.proDialog = true
            })
        },
        sort() {
            if (this.showHeaders.length > 0) {
                let sa = []
                this.headers.forEach(item => {
                    if (this.indexOf(item)) {
                        sa.push(item)
                    }
                })
                this.showHeaders = sa
                localStorage.setItem('putShowHeaders', JSON.stringify(this.showHeaders))
            }
        },
        indexOf(item) {
            let isShow = false
            for (let i = 0; i < this.showHeaders.length; i++) {
                isShow = item.text === this.showHeaders[i].text
                if (isShow) {
                    break;
                }
            }
            return isShow
        },
        sortStr(sortName) {
            switch (sortName) {
                case "material.id":
                    return "c.pm00201";
                case "material.name":
                    return "c.pm00202";
                case "material.model":
                    return "c.pm00205";
                case "material.brand":
                    return "c.pm00205";
                case "putSum":
                    return "a.pm02706";
                case "taxPrice":
                    return "pm02709";
                case "moneyTax":
                    return "pm02710";
                case "putNumber":
                    return "pm02603"
                case "putDate":
                default:
                    return "pm02602";
            }
        },
        getQueryParam: function () {
            let q = Object.assign({}, this.options)
            q.sortBy = this.sortStr(q.sortBy[0])
            q.sortDesc = q.sortDesc[0]
            if (this.queryCompany) {
                q.companyId = this.queryCompany.id
                localStorage.setItem("putHistoryCompany", JSON.stringify(this.queryCompany))
            }
            q.searchText = this.searchText
            q.start = this.queryDates[0]
            q.end = this.queryDates[1]
            q.materialId = this.materialId
            return q;
        },
        list() {
            let q = this.getQueryParam();
            this.loading = true
            putHistory(q).then(result => {
                this.items = result.rows
                this.total = result.total
            }).finally(() => this.loading = false)
            getPutTotalMoney(q).then(res => {
                if (res){
                    this.totalMoneySum = res.toFixed(2)
                }
            })
        }
    },
}
</script>

<style scoped>

</style>