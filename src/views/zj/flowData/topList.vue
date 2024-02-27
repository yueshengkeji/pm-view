<template>
  <div>
    <v-row dense>
      <v-col sm="2">
        <v-chip small>销售金额合计:{{ money.toFixed(2) }}</v-chip>
      </v-col>
      <v-col sm="1">
        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field clearable dense
                          v-model="query.startDate"
                          v-on="on" v-bind="attrs" label="开始日期"></v-text-field>
          </template>
          <v-date-picker @change="$refs.menu.save()" v-model="query.startDate"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="1">
        <v-menu ref="menu2" v-model="menu2">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field clearable dense
                          v-model="query.endDate" v-on="on"
                          v-bind="attrs" label="截止日期"></v-text-field>
          </template>
          <v-date-picker @change="$refs.menu2.save()" v-model="query.endDate"></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>
    <v-row>
      <v-col sm="6" cols="12">
        <p>按日期排名</p>
        <v-data-table :sort-by="['date','money']"
                      sort-desc
                      :loading="loading"
                      :headers="headers"
                      :items.sync="data.dayGroupModels"
                      hide-default-footer>

        </v-data-table>
      </v-col>
      <v-col sm="6" cols="12">
        <p>总排名</p>
        <v-data-table sort-by="money"
                      sort-desc
                      :loading="loading"
                      :headers="headers"
                      :items.sync="data.dateGroupModels"
                      hide-default-footer>

        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {topList} from '@/api/saleData'

export default {
  components: {},
  name: "topList",
  data: () => ({
    headers: [
      {text: '品牌', value: 'title'},
      {text: '销售日期', value: 'date'},
      {text: '销售金额', value: 'money'},
    ],
    headers2: [
      {text: '品牌', value: 'title'},
      {text: '销售金额', value: 'money'},
    ],
    data: {
      dayGroupModels: [],
      dateGroupModels: [],
    },
    query: {startDate: null, endDate: null},
    loading: false,
    menu: false,
    menu2: false,
    money:0,
  }),
  created() {
    let date = this.getDateByStr("本月")
    this.query.startDate = date.start
    this.query.endDate = date.end
    this.list()
  },
  watch: {
    query: {
      handler() {
        this.list()
      },
      deep: true
    },
  },
  methods: {
    list() {
      this.loading = true
      let q = Object.assign({},this.query)
      topList(q).then(result => {
        this.data = result
        this.money = 0
        if(this.data.dateGroupModels){
          this.data.dateGroupModels.forEach(item=>{
            if(item.money){
              this.money += item.money
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped></style>