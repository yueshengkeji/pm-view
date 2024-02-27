<template>
  <div>
    <div v-if="loadDetailByHouse == null">
      <v-row dense>
        <v-col lg="2" sm="2">
          <v-btn small @click="insertHandler" color="primary">新增</v-btn>
          <v-btn small :loading="loading" class="ml-1" @click="exportHandler">导出</v-btn>
        </v-col>
        <v-col lg="1">
          <v-combobox dense
                      @change="list"
                      :items="yearItems"
                      label="年份"
                      v-model="query.year"></v-combobox>
        </v-col>
        <v-col lg="7" sm="7">
          <v-chip>{{ '本年采购合计：' + proMoney }}</v-chip>
          <v-chip class="ml-1">{{ '入库合计：' + putMoney }}</v-chip>
          <v-chip class="ml-1">{{ '实际付款：' + cwMoney }}</v-chip>
          <v-chip class="ml-1">{{ '收票合计：' + kpMoney }}</v-chip>
        </v-col>
        <v-col lg="2" sm="2">
          <v-text-field dense label="搜索" v-model="query.searchText" @keyup.enter="list"></v-text-field>
        </v-col>
      </v-row>
      <v-data-table
          class="cursor"
          :items="items"
          :items-per-page="10"
          :loading="loading"
          :server-items-length="total"
          :options.sync="options"
          sort-by="a.date asc, series"
          :sort-desc="false"
          @dblclick:row="detailHandler"
          :headers="headers">
        <template v-slot:item.index="{index}">
          {{ index + 1 }}
        </template>

        <template v-slot:item.subjectSeries="{item}">
          <div class="text-no-wrap text-truncate" style="width: 150px">
            {{ item.subjectSeries }}
          </div>
        </template>

        <template v-slot:item.remark="{item}">
          <div class="text-no-wrap text-truncate"
               style="width: 100px"
               @mouseout="hideTooltip"
               @mouseover="showTooltip($event,item)">
            {{ item.remark }}
          </div>
        </template>

        <template v-slot:item.action="{item}">
          <v-btn x-small color="primary" @click="detailHandler($event,{item})">明细</v-btn>
          <v-btn v-if="item.delFlag"
                 class="ml-1"
                 x-small
                 color="error"
                 @click="deleteHandler(item)">删除</v-btn>
        </template>

      </v-data-table>
    </div>

    <v-dialog v-model="detailDialog"  fullscreen>
      <v-card class="pa-5">
        <procurement-detail @close="closeHandler"
                            :year="query.year"
                            :companyBelong="type" ref="pd"
                            v-model="item"></procurement-detail>
      </v-card>
    </v-dialog>

    <v-tooltip max-width="500px"
               :close-delay="3000"
               bottom absolute
               :position-y="tooltipY"
               :position-x="tooltipX"
               v-model="msgFlag">
      <div v-html="msg"></div>
    </v-tooltip>
  </div>
</template>

<script>
import {deleteData, detailList, exportExcel} from '@/api/proDetail'
import {getProMoneySum} from '@/api/proPutDetail'
import {getMoneySum as getPayMoneySum} from '@/api/proDetailPay'
import {list as subjectList} from '@/api/proDetailMoney'

export default {
  components: {
    procurementDetail: () => import('./procurementDetail')
  },
  name: "procurementList",
  props: {
    type: {
      type: Number,
      default: 1
    },
    loadDetailByHouse: null,
  },
  data: () => ({
    tooltipY: 0,
    tooltipX: 0,
    msg: null,
    msgFlag: false,
    showDelete: false,
    proMoney: 0,
    putMoney: 0,
    cwMoney: 0,
    bzjMoney: 0,
    kpMoney: 0,
    loading: false,
    headers: [
      {text: '序号', value: 'index', width: '70px'},
      {text: '供应商', value: 'comName', width: '200px'},
      {text: '年初欠款', value: 'yearOwe'},
      {text: '本年购入', value: 'yearPro'},
      {text: '本年已付款', value: 'yetMoney'},
      {text: '期末欠款', value: 'endOwe'},
      {text: '税率', value: 'tax'},
      {text: '结账方式', value: 'settleType', width: '110px'},
      {text: '已入库金额', value: 'putMoney'},
      {text: '误差', value: 'error'},
      {text: '欠票情况', value: 'oweBillMoney'},
      {text: '会计科目', value: 'subjectSeries'},
      {text: '备注', value: 'remark'},
      {text: '账面欠款', value: 'paperOwe'},
      {text: '操作', value: 'action', width: '160px'},
    ],
    items: [],
    options: {},
    query: {
      searchText: null,
      page: 1,
      itemsPerPage: 10,
      year: null,
    },
    total: 0,
    data: null,
    item: {
      series: ''
    },
    offInsert: false,
    detailItem: {
      id: null,
      proDate: null,
      proMoney: null,
      putDate: null,
      putMoney: null,
      remark: null,
      edit: false
    },
    detailLoading: false,
    yearItems: [],
    detailDialog: false,
    deleteFlag: false
  }),
  watch: {
    dialog() {
      if (!this.dialog) {
        this.$emit("closeDialog");
      }

    },
    searchBzjType(value) {
      if (value == "" || value == null) {
        this.bzjTypeItems = ['质保', '履约']
      } else {
        this.bzjTypeItems = [value]
      }

    },
    searchHouse(value) {
      if (value != null) {
        this.loadHouses(value);
      }
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    loadDetailByHouse: {
      handler() {
        this.houseHandler(this.loadDetailByHouse)
      },
      deep: true
    },
    detailDialog() {
      if (!this.detailDialog) {
        this.list()
      }
    },
    "query.year": {
      handler() {
        this.loadMoneySum()
      }
    }
  },
  created() {

    if (this.$store.state.user.roles.indexOf("管理") != -1) {
      this.deleteFlag = true
    }

    let year = new Date().getFullYear();
    this.query.year = year + ""
    for (let i = 0; i < 8; i++) {
      this.yearItems.push((parseInt(year) - i) + "")
    }
    if (this.$store.getters.roles.indexOf("维护") !== -1) {
      this.showDelete = true
      this.offEdit = false
    } else if (this.$store.getters.roles.indexOf('财务') !== -1 || this.$store.getters.roles.indexOf('会计') !== -1) {
      this.offEdit = false
    }
  },
  methods: {
    hideTooltip() {
      this.msgFlag = false
    },
    showTooltip(e, item) {
      this.tooltipX = e.clientX
      this.tooltipY = e.clientY + 20
      this.thanTooltip = e.target
      this.msg = item.remark
      this.msgFlag = true
    },
    closeHandler() {
      this.detailDialog = false
    },
    deleteHandler(item) {
      this.confirm("确定删除" + item.comName + " " + item.year + "对账单吗？删除后不可恢复").then(() => {
        deleteData(item.id).then(() => {
          this.list()
        })
      })
    },
    insertHandler() {
      this.detailDialog = true
      this.$nextTick(() => {
        this.$refs.pd.reset()
      })
    },
    detailHandler(event, {item}) {
      item.company.name = item.comName
      if (item.subject == null) {
        item.billOwe = {oweMoney: item.yearBillFinance}
        item.moneyOwe = {oweMoney: item.yearOwe}
        subjectList(item.id).then(result => {
          this.$set(item, 'subject', result)
        }).finally(() => {
          this.item = item
          this.detailDialog = true
        })
      } else {
        this.item = item
        this.detailDialog = true
      }
    },
    list() {
      this.loading = true
      let {page, itemsPerPage, sortBy, sortDesc} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      this.query.sortBy = sortBy[0]
      this.query.sortDesc = sortDesc[0] ? "DESC" : "ASC"
      this.query.type = this.type
      let q = Object.assign({}, this.query)
      let request = detailList(q)
      request.then(data => {
        data.rows.forEach(item=>{
          if(item.yearOwe == 0 && item.yearPro == 0 && item.yetMoney == 0 && item.putMoney == 0 && item.oweBillMoney == 0){
            item.delFlag = true
          }else{
            item.delFlag = false
          }
        })
        this.items = data.rows
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })

      // this.loadMoneyTotal()
    },
    exportHandler() {
      this.loading = true
      let {page, itemsPerPage, sortBy, sortDesc} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      this.query.sortBy = sortBy[0]
      this.query.sortDesc = sortDesc[0] ? "DESC" : "ASC"
      this.query.type = this.type
      let q = Object.assign({}, this.query)
      q.itemsPerPage = -1
      exportExcel(q).then(result => {
        this.downloadFile(result)
      }).finally(() => {
        this.loading = false
      })
    },
    loadMoneySum() {
      console.log("loadMoneySum")
      getProMoneySum(this.query.year).then(result => {
        this.proMoney = result.proMoney || 0
        this.putMoney = result.putMoney || 0
      })

      getPayMoneySum(this.query.year).then(result => {
        this.cwMoney = result.payMoney || 0
        this.kpMoney = result.billMoney || 0
      })

    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: pointer;
}

.border-top {
  border-top: thin solid rgba(0, 0, 0, 0.12)
}
</style>