<template>
  <div>
    <v-row dense>
      <v-col lg="1">
        <div>{{ queryParam.tagName }}</div>
      </v-col>
      <v-col lg="2">
        <v-btn color="primary" @click="insertHandler" small>新增</v-btn>
        <v-btn @click="batchPayHandler" class="ml-1" small>批量付款</v-btn>
        <v-btn @click="exportEX" class="ml-1" :loading="exportLoading" small>导出</v-btn>
        <v-switch v-model="queryParam.ifMine"
                  v-if="showAll"
                  label="我的" class="float-right" style="margin-top: 0px;"></v-switch>
      </v-col>
      <v-col lg="1">
        <v-text-field dense placeholder="最低金额" v-model="queryParam.minMoney" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-col lg="1">
        <v-text-field dense placeholder="最高金额范围" v-model="queryParam.maxMoney" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-col md="1" cols="12">
        <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryParam.startDate"
                          label="请指定开始日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryParam.startDate" @change="$refs.menu.save()"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col md="1" cols="12">
        <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryParam.endDate"
                          label="请指定截止日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryParam.endDate" @change="endDateChange"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col lg="3">
        <v-chip small>已付款合计：{{ payMoney }}</v-chip>
        <v-chip class="ml-1" small>申请中合计：{{ applyMoney }}</v-chip>
      </v-col>
      <v-spacer></v-spacer>
      <v-col lg="2">
        <v-text-field label="搜索" dense v-model="queryParam.searchText" @keyup.enter="list"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :options.sync="options"
                  sort-desc
                  sort-by="datetime"
                  @dblclick:row="clickRowHandler"
                  :server-items-length="total"
                  :items="items"
                  :headers="headers">

      <template v-slot:item.action="{item}">
        <v-btn v-if="item.state == 0" x-small color="error" @click="deleteHandler(item)" outlined>删除</v-btn>
        <v-btn x-small class="ml-1" @click="detail(item)" outlined>明细</v-btn>
        <v-btn v-if="item.state == 0" x-small class="ml-1" @click="editPay(item)" outlined>编辑</v-btn>
      </template>

    </v-data-table>

    <v-dialog width="80%" :fullscreen="$vuetify.breakpoint.xs" v-model="payDialog">
      <v-card>
        <add-pay v-model="pay" ref="otherPay" :pay-type="queryParam.tagName" :flow-name="flowName"></add-pay>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="payDialog = false">关闭</v-btn>
          <v-btn color="primary" @click="updatePay" :loading='subLoading' v-if="pay.id != null">保存</v-btn>
          <v-btn color="primary" @click="savePay" :loading='subLoading'>{{ pay.id == null ? '提交' : '重新审批' }}
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>

    <v-dialog width="80%" :fullscreen="$vuetify.breakpoint.xs" v-model="payBatchDialog">
      <v-card>
        <add-batch-pay v-model="pay" ref="otherBatchPay" :pay-type="queryParam.tagName"
                       :flow-name="flowName"></add-batch-pay>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="payBatchDialog = false">关闭</v-btn>
          <v-btn @click="addCompanyHandler">增加单位</v-btn>
          <v-btn color="primary" @click="saveBatchPay" :loading='subLoading'>{{
              pay.id == null ? '提交' : '重新审批'
            }}
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>

    <instance-detail :frame="detailPayId" :close="closeDetail"></instance-detail>
  </div>
</template>

<script>
import addPay from '@/components/132029.vue'
import instanceDetail from '@/components/easyflow/instance-detail'
import {deletePay, exportList, getPayType, getSumMoney, list} from '@/api/otherPay'
import {getConfig} from '@/api/systemConfig'

export default {
  name: "list",
  components: {
    addPay,
    instanceDetail,
    addBatchPay: () => import('@/components/1320295.vue')
  },
  data: () => ({
    showAll: false,
    exportLoading: false,
    payDialog: false,
    headers: [
      {text: '收款单位', value: 'company.name'},
      {text: '付款单位', value: 'companyPay.name'},
      {text: '标题', value: 'title'},
      {text: '付款金额', value: 'payMoney'},
      {text: '申请时间', value: 'datetime'},
      {text: '付款时间', value: 'payDatetime'},
      {text: '申请人', value: 'staff.name'},
      {text: '操作', value: 'action', sortable: false},
    ],
    items: [],
    pay: {
      id: null
    },
    total: 0,
    options: {},
    queryParam: {
      tagName: null,
      searchText: null,
      startDate: null,
      endDate: null,
      ifMine: true,
      minMoney: null,
      maxMoney: null
    },
    menu: false,
    menu2: false,
    detailPay: {
      id: null
    },
    applyMoney: 0,
    payMoney: 0,
    subLoading: false,
    flowFlag: true,
    payBatchDialog: false,
    detailPayId: null
  }),
  watch: {
    options: {
      handler() {
        if (this.queryParam.tagName) {
          this.list()
        }
      },
      deep: true
    },

    'queryParam.ifMine': {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  props: {
    payType: Number,
    flowName: String,
  },
  created() {

    getConfig("PRO_PAY_ALL").then(result => {
      if (result && this.$store.state.user.roles.indexOf(result.value) != -1) {
        this.showAll = true
      }
    })


    if (this.payType) {
      getPayType(this.payType).then(result => {
        if (result.id) {
          this.queryParam.tagName = result.name
          this.list()
        } else {
          alert("未查询到付款类型");
        }
        this.getSumMoney()
      })
    }
  },
  methods: {
    batchPayHandler() {
      this.payDialog = false
      this.payBatchDialog = true
    },
    getSumMoney() {
      getSumMoney({
        startDate: this.queryParam.startDate,
        endDate: this.queryParam.endDate,
        state: 0,
        tagName: this.queryParam.tagName
      }).then(result => {
        this.applyMoney = result || 0
      })

      getSumMoney({
        startDate: this.queryParam.startDate,
        endDate: this.queryParam.endDate,
        state: 1,
        tagName: this.queryParam.tagName
      }).then(result => {
        this.payMoney = result || 0
      })
    },
    clickRowHandler(event, {item}) {
      this.detailPay = item
    },
    insertHandler() {
      if (this.$refs.otherPay) {
        this.$refs.otherPay.reset()
      }
      this.payDialog = true
    },
    detail(item) {
      this.detailPay = item
      this.detailPayId = item.batchId || item.id
    },
    closeDetail() {
      this.detailPay = {
        id: null
      }
      this.detailPayId = null
    },
    editPay(item) {
      this.pay = item
      if (item.batchId) {
        this.payBatchDialog = true
      } else {
        this.payDialog = true
      }
    },
    deleteHandler(item) {
      this.confirm("确定删除" + item.title + "?").then(() => {
        deletePay(item.id).then(() => {
          this.list()
        })
      })
    },
    endDateChange() {
      this.$refs.menu2.save()
      this.list()
      this.getSumMoney()
    },
    updatePay() {
      this.flowFlag = false
      this.savePay()
    },
    savePay() {
      this.subLoading = true
      this.$refs.otherPay.save().then((result) => {
        if (this.flowFlag) {
          this.$refs.otherPay.$refs.flow.startFlow({
            title: result.title + '-付款申请',
            content: result.remark,
            frameId: result.id,
            frameCoding: 132029,
            frameColumn: 'id'
          }).then(() => {
            this.list()
            this.payDialog = false
            this.subLoading = false
          })
        } else {
          this.list()
          this.payDialog = false
          this.subLoading = false
        }
      }).finally(() => this.flowFlag = true, this.subLoading = false)
    },
    addCompanyHandler() {
      this.$refs.otherBatchPay.addCompany()
    },
    saveBatchPay() {
      this.subLoading = true
      this.$refs.otherBatchPay.save().then((result) => {
        if (this.flowFlag) {
          this.$refs.otherBatchPay.$refs.flow.startFlow({
            title: result.title + '-付款申请',
            content: result.remark || '',
            frameId: result.id,
            frameCoding: 1320295,
            frameColumn: 'id'
          }).then(() => {
            this.list()
            this.payBatchDialog = false
            this.subLoading = false
          })
        } else {
          this.list()
          this.payBatchDialog = false
          this.subLoading = false
        }
      }).finally(() => this.flowFlag = true, this.subLoading = false)
    },
    list() {
      this.queryParam.page = this.options.page
      this.queryParam.itemsPerPage = this.options.itemsPerPage
      this.queryParam.sortBy = this.options.sortBy[0]
      this.queryParam.sortDesc = this.options.sortDesc[0]
      if (this.queryParam.sortBy == "staff.name") {
        this.queryParam.sortBy = "staff_id"
      } else if (this.queryParam.sortBy == "company.name") {
        this.queryParam.sortBy = "company_id"
      }
      this.setMoneyFilter()

      list(this.queryParam).then(result => {
        this.items = result.rows
        this.total = result.total
      })
    },
    setMoneyFilter() {
      this.queryParam.maxMoney = this.queryParam.maxMoney == null ? 0 : this.queryParam.maxMoney
      this.queryParam.minMoney = this.queryParam.minMoney == null ? 0 : this.queryParam.minMoney
      if (this.queryParam.maxMoney == 0 && this.queryParam.minMoney == 0) {
        this.queryParam.maxMoney = null
        this.queryParam.minMoney = null
      }
    },
    exportEX() {
      this.exportLoading = true;
      this.setMoneyFilter()

      exportList(this.queryParam).then(result => {
        let a = document.createElement("a")
        a.download = result
        a.href = result
        a.click()
      }).finally(() => {
        this.exportLoading = false;
      })
    },
  }
}
</script>

<style scoped>

</style>
