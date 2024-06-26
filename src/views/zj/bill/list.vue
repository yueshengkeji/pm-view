<template>
  <div>
    <v-row dense>
      <v-col cols="2">
        <v-text-field label="客户名称" v-model="query.companyName"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field label="品牌" v-model="query.brand"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field label="铺位号" v-model="query.room"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-select label="费用名称" v-model="query.name" :items="moneyTypes"></v-select>
      </v-col>
      <v-col cols="2">
        <v-menu v-model="menu" transition="scale-transition" offset-y :close-on-content-click="false"
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field v-model="date"
                          label="应收开始/截止日期"
                          readonly v-bind="attrs" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title scrollable @change="dateChangeHandler"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="2">
        <v-select label="状态" v-model="query.state" :items="stateItems"></v-select>
      </v-col>
      <v-col cols="2">
        <v-select label="合同类型" v-model="query.concatType" :items="concatItems"></v-select>
      </v-col>

      <v-col offset="6" cols class="text-right">
        <v-btn outlined small class="mr-1" @click="dialog = true">新增</v-btn>
        <v-btn outlined small class="mr-1" @click="loadPayNotify" :loading="loading">催缴通知</v-btn>
        <v-btn outlined small class="mr-1" disabled>开票</v-btn>
        <v-btn outlined small @click="exportHandler">导出</v-btn>
      </v-col>
    </v-row>

    <v-tabs v-model="tab">
      <v-tab key="zl">合同应收账单</v-tab>
      <v-tab key="bzj">押金账单</v-tab>
      <v-tab key="tgf">推广费账单</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item key="zl">
        <v-data-table :items="data.rows"
                      :loading="loading"
                      :options.sync="options"
                      :headers="headers"
                      :server-items-length="data.total">
          <template v-slot:item.brand="{item}">
            <v-chip small outlined @click="showTermHandler($event,item)">{{ item.brand }}</v-chip>
          </template>
          <template v-slot:item.state="{item}">
            {{ formatState(item.state) }}
          </template>
          <template v-slot:item.concatType="{item}">
            {{ formatConcat(item.concatType) }}
          </template>
          <template v-slot:item.invoiceState="{item}">
            {{ formatInvoiceState(item.invoiceState) }}
          </template>
          <template v-slot:item.arrearageDay="{item}">
            <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small outlined @click="editHandler(item)">财务复核</v-btn>
          </template>
        </v-data-table>
      </v-tab-item>
      <v-tab-item key="bzj">
        <v-data-table :items="data2.rows"
                      :loading="loading"
                      :options.sync="options2"
                      :headers="headers2"
                      :server-items-length="data2.total">
          <template v-slot:item.brand="{item}">
            <v-chip small outlined @click="showTermHandler($event,item)">{{ item.brand }}</v-chip>
          </template>
          <template v-slot:item.state="{item}">
            {{ formatState(item.state) }}
          </template>
          <template v-slot:item.concatType="{item}">
            {{ formatConcat(item.concatType) }}
          </template>
          <template v-slot:item.invoiceState="{item}">
            {{ formatInvoiceState(item.invoiceState) }}
          </template>
          <template v-slot:item.arrearageDay="{item}">
            <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small outlined @click="editHandler(item)">财务复核</v-btn>
          </template>
        </v-data-table>


      </v-tab-item>
      <v-tab-item key="tgf">
        <v-data-table :items="data3.rows"
                      :loading="loading"
                      :options.sync="options3"
                      :headers="headers3"
                      :server-items-length="data3.total">
          <template v-slot:item.brand="{item}">
            <v-chip small outlined @click="showTermHandler($event,item)">{{ item.brand }}</v-chip>
          </template>
          <template v-slot:item.state="{item}">
            {{ formatState(item.state) }}
          </template>
          <template v-slot:item.concatType="{item}">
            {{ formatConcat(item.concatType) }}
          </template>
          <template v-slot:item.invoiceState="{item}">
            {{ formatInvoiceState(item.invoiceState) }}
          </template>
          <template v-slot:item.arrearageDay="{item}">
            <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small outlined @click="editHandler(item)">财务复核</v-btn>
          </template>
        </v-data-table>


      </v-tab-item>
    </v-tabs-items>
    <abs-menu :headers="termHeaders" :items="termItems" ref="absMenu" :loading="termLoading"></abs-menu>

    <v-dialog v-model="dialog">
      <bill-insert @close="closeHandler" v-model="item"></bill-insert>
    </v-dialog>

    <v-dialog v-model="payNotifyDialog">
      <v-card class="pa-3">
        <div id="printCon">
          <template v-for="c in notifyList">
            <pay-notify :concat="c" :bill-list="c.billList" :key="c.id"></pay-notify>
          </template>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn ref="printBtn" v-print="printObj" color="primary" outlined>打印</v-btn>
          <v-btn @click="payNotifyDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {getBillList, exportBill, listTermByConcat} from '@/api/zujin'
import BillInsert from "@/views/zj/bill/insert.vue";
import PayNotify from "@/views/zj/bill/payNotify.vue";
import AbsMenu from "@/components/menu/absMenu.vue";

export default {
  name: "bill-list",
  components: {AbsMenu, PayNotify, BillInsert},
  data: () => ({
    termLoading: false,
    termHeaders: [
      {value: 'name', text: '费用名称'},
      {value: 'startDate', text: '开始日期'},
      {value: 'endDate', text: '截止日期'},
      {value: 'type', text: '计费方式'},
      {value: 'unit', text: '计费单位'},
      {value: 'money', text: '金额'},
      {value: 'payCycle', text: '支付周期'},
      {value: 'monthBill', text: '是否自然月账单'},
      {value: 'payType', text: '付款方式'},
      {value: 'payDay', text: '缴款日'},
      {value: 'firstStartDate', text: '首期开始日期'},
      {value: 'firstEndDate', text: '首期截止日期'},
      {value: 'firstMoney', text: '首期金额'},
      {value: 'priceType', text: '计价方式'},
    ],
    termItems: [],
    loading: false,
    tab: 0,
    printObj: {
      id: "printCon",
      popTitle: '打印',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    item: null,
    menu: false,
    date: [],
    moneyTypes: ["租金", "管理费", "推广服务费", "二清管理费", "装修管理费"],
    stateItems: [
      {value: '1', text: '已支付'},
      {value: 'wait', text: '待支付'},
      {value: 'pay', text: '部分支付'},
    ],
    concatItems: [
      {value: '0', text: '租赁合同'},
      {value: '2', text: '多经类合同'},
      {value: '1', text: '物业管理'},
    ],
    query: {
      companyName: null,
      brand: null,
      room: null,
      concatType: null,
      state: null,
    },
    options: {type: 'regular,compare,commission'},
    options2: {type: 'bzj'},
    options3: {type: 'tgf'},
    data: {
      rows: [],
      total: 0
    },
    data2: {
      rows: [],
      total: 0
    },
    data3:{
      rows: [],
      total: 0
    },
    headers: [
      {text: '状态', value: 'state'},
      {text: '欠费天数', value: 'arrearageDay'},
      {text: '铺位号', value: 'room'},
      {text: '楼层', value: 'floor'},
      {text: '品牌', value: 'brand'},
      {text: '费用名称', value: 'name'},
      {text: '应收日期', value: 'payEndDate'},
      {text: '区间开始日期', value: 'startDate'},
      {text: '区间截止日期', value: 'endDate'},
      {text: '应收金额', value: 'money'},
      {text: '已收金额', value: 'payMoney'},
      {text: '已退金额', value: 'backMoney'},
      {text: '调整后金额', value: 'sjMoney'},
      {text: '欠费金额', value: 'arrearage'},
      {text: '合同类型', value: 'concatType'},
      {text: '开票状态', value: 'invoiceState'},
      {text: '操作', value: 'action'}
    ],
    headers2: [
      {text: '状态', value: 'state'},
      {text: '欠费天数', value: 'arrearageDay'},
      {text: '铺位号', value: 'room'},
      {text: '楼层', value: 'floor'},
      {text: '品牌', value: 'brand'},
      {text: '费用名称', value: 'name'},
      {text: '应收日期', value: 'payEndDate'},
      {text: '区间开始日期', value: 'startDate'},
      {text: '区间截止日期', value: 'endDate'},
      {text: '应收金额', value: 'money'},
      {text: '已收金额', value: 'payMoney'},
      {text: '已退金额', value: 'backMoney'},
      {text: '调整后金额', value: 'sjMoney'},
      {text: '欠费金额', value: 'arrearage'},
      {text: '合同类型', value: 'concatType'},
      {text: '开票状态', value: 'invoiceState'},
      {text: '操作', value: 'action'}
    ],
    headers3: [
      {text: '状态', value: 'state'},
      {text: '欠费天数', value: 'arrearageDay'},
      {text: '铺位号', value: 'room'},
      {text: '楼层', value: 'floor'},
      {text: '品牌', value: 'brand'},
      {text: '费用名称', value: 'name'},
      {text: '应收日期', value: 'payEndDate'},
      {text: '区间开始日期', value: 'startDate'},
      {text: '区间截止日期', value: 'endDate'},
      {text: '应收金额', value: 'money'},
      {text: '已收金额', value: 'payMoney'},
      {text: '已退金额', value: 'backMoney'},
      {text: '调整后金额', value: 'sjMoney'},
      {text: '欠费金额', value: 'arrearage'},
      {text: '合同类型', value: 'concatType'},
      {text: '开票状态', value: 'invoiceState'},
      {text: '操作', value: 'action'}
    ],
    dialog: false,
    payNotifyDialog: false,

    tempNotifyMap: [],
    notifyList: [],

    typeMap: {
      'regular': '固定金额',
      'regularPreferential': '固定租金(优惠阶段)',
      'commission': '提成租金',
      'compare': '提成固定较高租金',
      'month': '每月',
      'one': '一次性付费',
      'day': '固定日期',
    },
    payMap: {
      'month': '月付',
      'towMonth': '两月付',
      'quarter': '季付',
      'one': '一次性付清',
      'final': '固定扣点',
    }
  }),
  methods: {
    showTermHandler(e, item) {
      this.termLoading = true
      this.$refs.absMenu.showTolMenu(e)
      listTermByConcat(item.concatId).then(res => {
        res.forEach(item => {
          item.type = this.typeMap[item.type]
          item.payCycle = this.payMap[item.payCycle]
          item.payType = this.typeMap[item.payType]
          item.unit = this.typeMap[item.unit]
          item.monthBill = item.monthBill ? '是' : '否'
          item.priceType = '按平米计费'
        })
        this.termItems = res
        this.termLoading = false
      })
    },
    editHandler(item) {
      this.item = item
      this.dialog = true
    },
    closeHandler() {
      if (this.tab == 0) {
        this.list()
      } else if (this.tab == 2){
        this.listTgf()
      }else {
        this.listBzj()
      }
      this.item = null
      this.dialog = false
    },
    dateChangeHandler() {
      console.log("dateChangeHandler", this.date)
    },
    list() {
      let q = Object.assign({}, this.options)
      q = Object.assign(q, this.query)
      getBillList(q).then((r) => {
        this.data = r
      })
    },
    listBzj() {
      let q = Object.assign({}, this.options2)
      q = Object.assign(q, this.query)
      getBillList(q).then((r) => {
        this.data2 = r
      })
    },
    listTgf() {
      let q = Object.assign({}, this.options3)
      q = Object.assign(q, this.query)
      getBillList(q).then((r) => {
        this.data3 = r
      })
    },
    formatConcat(state) {
      switch (state) {
        case '0':
          return '租赁合同'
        case '2':
          return '多经类合同'
        case '1':
          return '物业合同'
      }
    },
    formatState(state) {
      switch (state) {
        case 'wait':
          return '未支付'
        case 'pay':
          return '部分支付'
        case '1':
          return '已支付'
      }
    },
    formatInvoiceState(state) {
      switch (state) {
        case 1:
          return '已开票'
        default:
        case 0:
          return '未开票'
      }
    },
    loadPayNotify() {
      this.loading = true
      this.tempNotifyMap = []
      this.notifyList = []

      let q = {
        type: null,
        page: 1
      }
      q = Object.assign(q, this.query)
      q.state = 'wait,pay'
      q.page = 1
      q.itemsPerPage = 10000

      getBillList(q).then(r => {
        r.rows.forEach(item => {

          if (item.concatId) {
            let concat = this.tempNotifyMap[item.concatId]
            if (concat) {
              concat.billList.push(item)
            } else {
              concat = item.concat
              concat.billList = [item]
              this.tempNotifyMap[item.concatId] = concat
              this.notifyList.push(concat)
            }
          }

        })
      }).finally(() => {
        this.payNotifyDialog = true
        window.setTimeout(() => this.loading = false, 2000)
      })
    },
    exportHandler() {
      let q
      if (this.tab == 0) {
        q = Object.assign({}, this.options)
      } else if (this.tab == 2) {
        q = Object.assign({}, this.options3)
      } else {
        q = Object.assign({}, this.options2)
      }
      q = Object.assign(q, this.query)
      q.page = 1
      exportBill(q).then(result => {
        this.downloadFile(result)
      })
    }
  },
  watch: {
    tab() {
      if (this.tab == 0) {
        this.list()
      } else if (this.tab == 2) {
        this.listTgf()
      } else {
        this.listBzj()
      }
    },
    query: {
      handler() {
        if (this.tab == 0) {
          this.list()
        } else if (this.tab == 2) {
          this.listTgf()
        } else {
          this.listBzj()
        }
      },
      deep: true
    },
    options3: {
      handler() {
        this.listTgf()
      },
      deep: true
    },
    options2: {
      handler() {
        this.listBzj()
      },
      deep: true
    },
    options: {
      handler() {
        console.log("options handler ", this.options)
        this.list()
      },
      deep: true
    },
  },
  created() {

  }
}
</script>

<style scoped>

</style>
