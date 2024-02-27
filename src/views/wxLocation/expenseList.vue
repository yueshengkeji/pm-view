<template>
  <div>
    <v-row dense>
      <v-col sm="1" cols="6" v-if="!hidetool">
        <v-btn small class="ml-1" to="/wxLocation/projectList">按项目统计</v-btn>
      </v-col>
      <v-col sm="2" cols="6" v-if="!hidetool">
        <select-staff v-model="searchStaff" dense label="指定职员"></select-staff>
      </v-col>
      <v-col sm="1" cols="6" v-if="!hidetool">
        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{on,attrs}">
            <v-text-field dense v-on="on" v-bind="attrs" label="开始日期" v-model="q.startDate"></v-text-field>
          </template>
          <v-date-picker v-model="q.startDate" @change="$refs.menu.save()"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="1" cols="6" v-if="!hidetool">
        <v-menu ref="menu2" v-model="menu2">
          <template v-slot:activator="{on,attrs}">
            <v-text-field dense v-on="on" v-bind="attrs" label="截止日期" v-model="q.endDate"></v-text-field>
          </template>
          <v-date-picker v-model="q.endDate" @change="list"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="6" cols="12" v-if="!hidetool">
        <v-chip x-small>报销金额合计:{{ data.money.toFixed(2) }}</v-chip>
        <v-chip class="ml-1" x-small>系统里程合计:{{ data.systemKm.toFixed(2) }}</v-chip>
        <v-chip class="ml-1" x-small>实际里程金额:{{ data.inputKm.toFixed(2) }}</v-chip>
      </v-col>
    </v-row>
    <v-data-table :items="data.rows"
                  :options.sync="options"
                  :loading="loading"
                  :headers="headers"
                  :server-items-length="data.total">
      <template v-slot:item.action="{item}">
        <v-btn x-small @click="detailHandler(item)">详情</v-btn>
        <v-btn v-if="hidetool"
               color="error"
               :disabled="item.state == 1"
               x-small
               @click="deleteHandler(item)">删除</v-btn>
      </template>
    </v-data-table>

    <instance-detail :frame="item.id"></instance-detail>
  </div>
</template>

<script>
import {listExpense,deleteExpense} from '@/api/outCarHistory'
import InstanceDetail from "@/components/easyflow/instance-detail.vue";
import SelectStaff from "@/views/user/select.vue";

export default {
  name: "expenseList",
  components: {SelectStaff, InstanceDetail},
  data: () => ({
    item: {
      id: null,
    },
    loading: false,
    data: {
      total: 0,
      rows: [],
      systemKm: 0,
      inputKm: 0,
      money: 0
    },
    headers: [
      {text: '员工姓名', value: 'staff.name'},
      {text: '里程开始时间', value: 'startDate'},
      {text: '里程截止时间', value: 'endDate'},
      {text: '系统里程合计', value: 'systemKm'},
      {text: '报销里程合计', value: 'inputKm'},
      {text: '报销金额', value: 'money'},
      {text: '报销日期', value: 'datetime'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['startDate'],
      sortDesc: [true],
      staffId: null
    },
    q: {
      startDate: null,
      endDate: null,
      state: 1,
      staffId: null
    },
    searchStaff: null,
    menu: false,
    menu2: false,
    totalMoney: 0,
  }),
  props: {
    query: {
      type: Object,
      default: null
    },
    hidetool: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    query: {
      handler() {
        if (this.query) {
          this.q = Object.assign({}, this.query)
          this.list()
        }
      }
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  created() {
    if (this.query) {
      this.q = Object.assign({}, this.query)
    }
  },
  methods: {
    deleteHandler(item){
      this.confirm("确定删除？").then(()=>{
        deleteExpense(item.id).then(this.list)
      })
    },
    detailHandler(item) {
      this.item = item
    },
    list() {
      this.loading = false
      let q = Object.assign({}, this.options)
      if (this.searchStaff) {
        q.staffId = this.searchStaff.id
      }
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0]
      q.startDate = this.q.startDate
      q.endDate = this.q.endDate
      q.staffId = this.q.staffId
      q.state = this.q.state
      listExpense(q).then(result => {
        if (result.systemKm == null) {
          result.systemKm = 0
        } else {
          result.systemKm = parseFloat(result.systemKm)
        }
        if (result.inputKm == null) {
          result.inputKm = 0
        } else {
          result.inputKm = parseFloat(result.inputKm)
        }
        if (result.money == null) {
          result.money = 0
        } else {
          result.money = parseFloat(result.money)
        }
        console.log("result", result)
        this.data = result
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>