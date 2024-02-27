<template>
    <!--    供货商采购记录-->
    <div>
        <v-row>
            <v-col sm="2">
                <v-btn small class="mr-1" @click="downloadExcel">导出</v-btn>
                <v-menu ref="menu2" v-model="menu2" offset-y>
                    <template v-slot:activator="{attrs,on}">
                        <v-btn v-bind="attrs" v-on="on" small>显示项</v-btn>
                    </template>
                    <div class="pa-1 white">
                        <v-checkbox @change="sort" v-for="d in headers" :label="d.text" v-model="showHeaders" dense
                                    hide-details :value="d" multiple :key="d.text"></v-checkbox>
                    </div>
                </v-menu>
            </v-col>
            <v-spacer></v-spacer>
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
            <v-col sm="3" cols="12">
                <v-text-field v-model="searchText" dense label="搜索" hide-details></v-text-field>
            </v-col>
        </v-row>
        <v-data-table :items="items"
                      :loading="loading"
                      sort-desc
                      sort-by="p.pmDate"
                      :options.sync="options"
                      :server-items-length="total"
                      :headers="showHeaders">

            <template v-slot:item.p.pmNumber="{item}">
                <div @click="showProDetail(item.p)" style="max-height: 20px;cursor: pointer"
                     class="overflow-hidden text-decoration-underline">{{item.p.pmNumber}}
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
    import {exportProHistory, list, proHistory} from '@/api/company'
    import {loadById} from '@/api/procurement'
    import detail from "../procurement/detail";

    export default {
        name: "proHistory",
        components: {
            detail
        },
        props: {
            company: Object
        },
        data: () => ({
            showHeaders: [
                {text: '订单号', value: 'p.pmNumber', width: '15%'},
                {text: '材料名称', value: 'material.name', width: '25%'},
                {text: '型号', value: 'material.name', width: '25%'},
                {text: '品牌', value: 'material.brand', width: '8%'},
                {text: '采购数量', value: 'sum', width: '8%'},
                {text: '单位', value: 'material.unit.name', width: '8%'},
                {text: '单价', value: 'priceTax', width: '8%'},
                {text: '金额', value: 'moneyTax', width: '8%'},
                {text: '税率', value: 'p.tax', width: '8%'},],
            headers: [
                {text: '项目名称', value: 'project.name', width: '15%'},
                {text: '材料编码', value: 'material.id', width: '15%'},
                {text: '订单号', value: 'p.pmNumber', width: '15%'},
                {text: '材料名称', value: 'material.name', width: '25%'},
                {text: '型号', value: 'material.name', width: '25%'},
                {text: '品牌', value: 'material.brand', width: '8%'},
                {text: '采购数量', value: 'sum', width: '8%'},
                {text: '单位', value: 'material.unit.name', width: '8%'},
                {text: '单价', value: 'priceTax', width: '8%'},
                {text: '金额', value: 'moneyTax', width: '8%'},
                {text: '税率', value: 'p.tax', width: '8%'},
                {text: '采购时间', value: 'p.pmDate', width: '8%'},
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
            loading: false
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
            company() {
                this.queryCompany = this.company
                this.companyList.push(this.queryCompany)
                this.list()
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
            if (this.company) {
                this.queryCompany = this.company
            } else if (companyId) {
                this.queryCompany = {id: companyId, name: companyName}
            } else {
                let hc = localStorage.getItem("proHistoryCompany")
                if (hc) {
                    this.queryCompany = JSON.parse(hc)
                }
            }
            if (this.queryCompany) {
                this.companyList.push(this.queryCompany)
            }
            let sh = localStorage.getItem('proShowHeaders')
            if (sh) {
                this.showHeaders = JSON.parse(sh)
            }
        },
        methods: {
            dateChange() {
                this.menu = false
                this.list()
            },
            downloadExcel() {
                let q = this.getQueryParam();
                exportProHistory(q).then(result => {
                    let a = document.createElement("a")
                    a.href = result
                    a.download = result
                    a.click()
                })
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
                    localStorage.setItem('proShowHeaders', JSON.stringify(this.showHeaders))
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
                    case "p.pmNumber":
                        return "a.pm01303";
                    case "material.id":
                        return "c.pm00201";
                    case "material.name":
                        return "c.pm00202";
                    case "material.brand":
                        return "c.pm00205";
                    case "material.sum":
                        return "a.pm01406";
                    case "material.unit.name":
                        return "b.pm01404";
                    case "priceTax":
                        return "b.pm01414";
                    case "moneyTax":
                        return "b.pm01415";
                    case "p.tax":
                        return "a.pm01316";
                    case "p.pmDate":
                    default:
                        return "a.pm01302";
                }
            },
            getQueryParam: function () {
                let q = Object.assign({}, this.options)
                q.sortBy = this.sortStr(q.sortBy[0])
                q.sortDesc = q.sortDesc[0]
                if (this.queryCompany) {
                    q.companyId = this.queryCompany.id
                    localStorage.setItem("proHistoryCompany", JSON.stringify(this.queryCompany))
                }
                q.searchText = this.searchText
                q.start = this.queryDates[0]
                q.end = this.queryDates[1]
                return q;
            }, list() {
                let q = this.getQueryParam();
                this.loading = true
                proHistory(q).then(result => {
                    this.items = result.rows
                    this.total = result.total
                }).finally(() => this.loading = false)
            }
        },
    }
</script>

<style scoped>

</style>