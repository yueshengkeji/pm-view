<template>
  <div>
    <v-row dense>
      <v-col sm="8" cols="12">
        <v-btn :color="options.staffId ? 'info' : ''" @click="myProList" :x-small="xSmall" class="mr-1"
               :small="!xSmall">{{ options.staffId ? '所有订单' : '我的订单' }}
        </v-btn>
        <v-menu v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                ref="menu"
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-btn :x-small="xSmall" :small="!xSmall" v-bind="attrs" v-on="on">
              更多
              <v-icon x-small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item link @click="noApproveState">
              <v-list-item-title>{{ options.approveState ? '所有订单' : '未发起订单' }}</v-list-item-title>
            </v-list-item>
            <v-list-item link target="_blank" to="../report">
              <v-list-item-title>采购报表</v-list-item-title>
            </v-list-item>
            <v-list-item link target="_blank" to="../apply/list">
              <v-list-item-title>申请单列表</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-chip-group @change="filterChange" :value="filter" active-class="primary--text" column
                            style="width:200px;">
                <v-chip :value="0" filter outlined class="ml-1" x-small color="green" key="0">未付清
                </v-chip>
                <v-chip :value="1" filter outlined class="ml-1" x-small color="red" key="1">未登记</v-chip>
                <v-chip :value="2" filter outlined class="ml-1" x-small color="blue" key="2">未开票
                </v-chip>
                <v-chip :value="3" filter outlined class="ml-1" x-small color="brown" key="3">完成
                </v-chip>
                <v-chip :value="4" filter outlined class="ml-1" x-small color="grey" key="4">没有合同
                </v-chip>
                <v-chip :value="6" filter outlined class="ml-1" x-small color="blue-grey lighten-4"
                        key="5">所有
                </v-chip>
              </v-chip-group>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-select hide-details
                  @focus="dateMenu.showMenu = false"
                  v-model="date"
                  :small-chips="xSmall"
                  @change="dateChange($event)"
                  dense
                  label="日期范围筛选"
                  :items="dateItems"
                  class="float-right mr-1"
                  style="width:120px">

          <template v-slot:append-item>
            <v-menu v-model="dateMenu.showMenu"
                    :close-on-content-click="false"
                    :close-on-click="false"
                    offset-y>

              <template v-slot:activator="{on,attrs}">
                <v-list-item link v-bind="attrs" v-on="on">
                  <v-list-item-title>自定义</v-list-item-title>
                </v-list-item>
              </template>

              <v-date-picker v-model="dateMenu.date" @change="dateChange2" range>

              </v-date-picker>

            </v-menu>
          </template>


        </v-select>

      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="1" cols="12">
        <v-text-field :loading="loading"
                      @keyup.enter="searchHandler"
                      v-model="search.searchMaterial" dense title="搜索材料"
                      label="搜索材料"></v-text-field>
      </v-col>
      <v-col sm="1" cols="12">
        <v-text-field :loading="loading" @keyup.enter="searchHandler" v-model="search.searchCompany" dense
                      title="搜索供货商"
                      label="搜索供货商"></v-text-field>
      </v-col>
      <v-col sm="2" cols="12">
        <v-text-field :loading="loading" @keyup.enter="searchHandler" v-model="search.str" dense
                      label="全局搜索"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :options.sync="op"
                  class="cursor-pointer"
                  :loading="loading"
                  :server-items-length="total"
                  :items-per-page="12"
                  sort-by="voucherDate"
                  sort-desc
                  :items="items"
                  :dense="dense"
                  :headers="headers">
      <template v-slot:item="{item}">
        <tr :key="item.id" :class="item.style" @dblclick="showDetail(item)">
          <td>
            <div>{{ item.pmNumber }}</div>
          </td>
          <td>
            <div v-if="item.company">{{ item.company.name }}</div>
          </td>
          <td>
            <div v-if="item.contract"
                 class="text-decoration-underline"
                 @mouseover="showPaymentMenu($event,item.contract)"
                 @click="flowDetail(item.contract)">
              {{ item.contract.name }}
            </div>
          </td>
          <td>
            <div v-if="item.voucherDate.length > 15">{{ item.voucherDate.substr(5, 11) }}
            </div>
            <div v-else>{{ item.voucherDate }}</div>
          </td>
          <td>
            <div>{{ item.staff.name }}</div>
          </td>
          <td>
            <div class="text-decoration-underline" v-if="item.putState == 4" title="订单材料已经完全入库"
                 @click="flowDetail(item)">
              已入库
            </div>
            <div class="text-decoration-underline" v-else-if="item.state == 1" title="审批通过的订单，可做入库等操作"
                 @click="flowDetail(item)">
              已审核
            </div>
            <div class="text-decoration-underline" v-else-if="item.state == 0" title="已经发起审批流程，正在等待审批通过"
                 @click="flowDetail(item)">
              审批中
            </div>
            <div v-else-if="item.state == -1" title="未发起审批流程的订单">未发起</div>
            <div v-else-if="item.state == -2" title="查询中">...</div>
          </td>

          <td>

          </td>
        </tr>
      </template>
    </v-data-table>

    <v-menu v-model="paymentMenu" open-on-hover ref="paymentMenu" :activator="contractActivator" offset-x>
      <v-list>
        <v-list-item link>
          <v-list-item-title>
            <v-btn small color="primary" disabled>新增付款申请</v-btn>
          </v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-chip small class="mr-1">合同总价:{{ contractItem.price + '元' }}</v-chip>
          <v-chip small class="mr-1">已付款:{{ contractItem.yetPay + '元' }}</v-chip>
          <v-chip small>申请中:{{ contractItem.applyMoney + '元' }}</v-chip>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu ref="toolMenu" v-model="toolMenu" :activator="menuActivator" offset-x right>
      <v-list>
        <v-list-item link @click="putHandler">
          <v-list-item-title>全部入库</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="selectPutHandler">
          <v-list-item-title>分批入库</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="applyDeleteHandler">
          <v-list-item-title>申请删除</v-list-item-title>
        </v-list-item>
        <v-list-item link target="_blank" :to="`../returnToApply/${item.id}`">
          <v-list-item-title>材料回退</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog width="99%" v-model="detailDialog">
      <v-card class="pa-3">
        <v-menu ref="toolbarMenu" offset-y open-on-hover>
          <template v-slot:activator="{on,attrs}">
            <v-btn outlined
                   v-bind="attrs"
                   v-on="on"
                   absolute
                   right
                   style="right: 40px;top :5px"
                   fab
                   x-small>
              <v-icon>mdi-more</v-icon>
            </v-btn>
          </template>
          <v-list>

            <v-list-item link @click="switchHeader">
              <v-list-item-title>{{ hideHeader ? '显示表头' : '隐藏表头' }}</v-list-item-title>
            </v-list-item>
            <v-list-item link @click="switchHeight">
              <v-list-item-title>{{ rowHeight == 30 ? '展开行' : '缩进行' }}</v-list-item-title>
            </v-list-item>
            <v-list-item link @click="switchRemark">
              <v-list-item-title>{{ hideRemark ? '显示备注' : '隐藏备注' }}</v-list-item-title>
            </v-list-item>
            <v-list-item link @click="downloadExcel">
              <v-list-item-title>导出excel</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn outlined @click="detailDialog = false" absolute right style="right: 5px;top :5px" color="error"
               fab x-small>
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <detail @loadSuccess="loadSuccess" v-model="item" ref="detail"></detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-progress-circular
              class="mr-1"
              v-if="imgPath == null && item.state === 1"
              indeterminate
              color="primary"
          ></v-progress-circular>
          <img title="鼠标右键，下载订单信息" class="mr-1" @dblclick="downloadHistory" v-if="imgPath && item.state === 1"
               :src="imgPath" style="width:100px;height: auto">
          <v-btn @click="detailDialog = false">关闭</v-btn>
          <v-btn link :disabled="!isPut(item)" target="_blank" :to="`./selectPut/${item.id}`">选择入库</v-btn>
          <v-btn link :disabled="!isPut(item)" @click="putHandler">全部入库</v-btn>
          <v-btn link :disabled="!isPut(item)" @click="allPutHandler(item)">消单</v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

    <instance-detail :close="closeFlowDetail" :frame="flowItem.id"></instance-detail>

    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>

  </div>
</template>

<script>
import {deletePro, exportExcel, listPro, loadTotal, setPutAll, updateDownloadState} from '@/api/procurement'
import {putProMaterial} from '@/api/put'
import detail from "../procurement/detail";
import {getMessageByFrameId} from "@/api/usedFlowApi"
import instanceDetail from '@/components/easyflow/instance-detail'

export default {
  name: "procurement-destory",
  components: {
    detail,
    instanceDetail,
  },
  data: () => ({
    deleteDialog: false,
    op: {},
    options: {
      //数据开始日期
      start: null,
      //数据截止日期
      end: null,
      //采购员id
      staffId: null,
      //入库状态：0=未入库，3=部分入库，4=完全入库，例：加载可入库的单据：'0,3'=可以入库
      putState: null,
      //供应单位id
      companyId: null,
      //是否有合同：0=无合同，1=有合同，null=所有
      searchProject: null,
      //是否有发票：null=所有，
      isInvoice: null,
      //合同状态：0=未付清，1=有合同未登记,2=已付清未开票，3=已付清已开票，4=没有合同，不传此参数 获取所有
      filter: null,
      //订单发起审批状态，0=未发起，null=获取所有
      approveState: null,
      //审批状态：0=未审批，1=已审批，0,1=所有
      state: '0,1',
      //1=未下载凭证，不传默认加载所有
      isDownload: null,
      //1=加载作废单据，不传默认加载正常单据
      discard: "1",
      isColie: ''
    },
    search: {
      //模糊查询字符串
      str: '',
      //搜索采购单位字符串
      searchCompany: '',
      //搜索材料
      searchMaterial: '',
    },
    filter: 6,
    total: 0,
    headers: [
      {text: '订单号', value: 'pmNumber'},
      {text: '供应单位', value: 'company.name'},
      {text: '合同名称', value: 'contract.name'},
      {text: '采购日期', value: 'voucherDate'},
      {text: '采购员', value: 'staff.name'},
      {text: '状态', value: 'state'},
    ],
    items: [],
    dense: false,
    dateItems: ["所有", "本月", "上月", "半年", "本年"],
    date: '所有',
    storageItems: [],
    menu: false,
    xSmall: false,
    putStorage: null,
    loading: false,

    dateMenu: {
      showMenu: false,
      date: []
    },
    timeout: 1,
    approveBtn: '已审核',
    approveColor: '',
    toolMenu: false,
    menuActivator: null,
    contractActivator: null,
    item: {
      id: null,
      pmNumber: null
    },
    deleteItem: {
      pmNumber: null,
    },
    deleteLoading: false,
    msg: '',
    msgFlag: false,
    applyDeleteDialog: false,
    deleteData: null,
    updateDialog: false,
    putStateDialog: false,
    detailDialog: false,
    imgPath: null,
    hideHeader: false,
    rowHeight: 30,
    hideRemark: false,
    selectPutDialog: false,
    itemMapCatch: [],
    flowItem: {id: null},
    paymentMenu: false,
    contractItem: {price: 0, yetPay: 0, applyMoney: 0},
    paymentData: {
      company: {
        name: null,
        openAccount: null,
        bankNumber: null
      }
    },
    paymentDialog: false,
    payment: () => import('@/components/10563')
  }),
  watch: {
    op: {
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
    },
    '$vuetify.breakpoint': {
      handler() {
        this.setDense()
      },
      deep: true
    },
    hideHeader: {
      handler() {
        localStorage.setItem("hideHeader", this.hideHeader)
      }
    }
  },
  created() {
    this.hideHeader = localStorage.getItem('hideHeader') == "true"
    this.$store.dispatch("AddUrl", "/procurement")
    let ls = localStorage.getItem("ls")
    if (ls != null && ls != "") {
      this.putStorage = JSON.parse(ls)
    }
    /*storageList().then(result => {
        this.storageItems = result
        if (this.storageItems.length > 0) {
            for (let i = 0; i < this.storageItems.length; i++) {
                if (this.putStorage.id == this.storageItems[i].id) {
                    this.putStorage = this.storageItems[i]
                    break
                }
            }
            if (this.putStorage == null) {
                this.putStorage = this.storageItems[0]
            }
        }
    })*/
    this.setDense()
  },
  methods: {
    closeFlowDetail() {
      this.flowItem = {id: null}
    },
    flowDetail(item) {
      this.flowItem = item
    },
    clearContract() {
      this.loading = true
      this.$refs.updateProcurement.clearContract().then(() => {
        this.updateDialog = false
      }).finally(() => this.loading = false)
    },
    getApproveState(item) {
      this.itemMapCatch[item.id] = item
      getMessageByFrameId(item.id).then(result => {
        if (result) {
          this.itemMapCatch[result.frameId].state = 0
        } else {
          this.itemMapCatch[result.frameId].state = -1
        }
        console.log(result, this.itemMapCatch[result.frameId].state)
      })
      return -2;
    },
    searchHandler() {
      this.op.page = 1
      this.list()
    },
    closePutHandler(putState) {
      if (putState) {
        this.item.putState = putState
      }
      this.selectPutDialog = false
    },
    selectPutHandler() {
      this.selectPutDialog = true
    },
    downloadExcel() {
      exportExcel(this.item).then(result => {
        let a = document.createElement('a')
        a.href = result
        a.download = result.substr(result.lastIndexOf("/") + 1)
        a.click()
      })
    },
    switchRemark() {
      this.hideRemark = this.$refs.detail.switchRemark()
    },
    switchHeader() {
      this.hideHeader = this.$refs.detail.switchHeader()
    },
    switchHeight() {
      this.rowHeight = this.$refs.detail.switchHeight()
    },
    downloadHistory() {
      updateDownloadState(this.item.id)
    },
    loadSuccess(data, img) {
      if (this.item.state === 1) {
        this.imgPath = img
      }
    },
    showDetail(item) {
      this.imgPath = null
      if (item.contract == null) {
        item.contract = {name: '', id: ''}
      }
      this.item = item
      this.detailDialog = true
    },
    updatePutState() {
      this.loading = true
      setPutAll(this.item.id).then(() => {
        this.item.putState = 4
        this.putStateDialog = false
      }).finally(() => this.loading = false)
    },
    allPutHandler(item) {
      this.item = item
      this.putStateDialog = true
    },
    updateHandler(item) {
      this.item = item
      this.updateDialog = true
    },
    saveUpdate() {
      this.loading = true
      this.$refs.updateProcurement.saveUpdate().then(() => {
        this.updateDialog = false
      }).finally(() => this.loading = false)
    },
    closeApplyDialog() {
      this.applyDeleteDialog = false
      this.deleteData = {
        proId: null,
        id: null,
        remark: ''
      }
    },
    applyDeleteHandler() {
      this.deleteData = {
        proId: this.item.id,
        remark: '',
      }
      this.applyDeleteDialog = true
    },
    putHandler() {
      if (this.putStorage && this.putStorage.id) {
        let putData = {
          proId: this.item.id,
          storageId: this.putStorage.id,
          tax: this.item.tax,
          saleMoney: this.item.saleMoney,
        }
        putProMaterial(putData).then(() => {
          this.item.putState = 4
        })
      } else {
        this.msg = '请选择入库仓库'
        this.msgFlag = true
      }
    },
    deletePro() {
      this.deleteLoading = true
      deletePro(this.deleteItem.id).then(this.list).finally(() => this.deleteLoading = false, this.deleteDialog = false)
    },
    deleteHandler(item) {
      this.deleteItem = item
      this.deleteDialog = true
    },
    isPut(item) {
      return (item.putState === 0 || item.putState === 3) && item.state === 1;
    },
    showPaymentMenu(e, item) {
      let btn = e.target
      if (btn.tagName == "span") {
        btn = btn.parentElement
      } else if (btn.tagName == "td") {
        btn = btn.children()[0]
      }
      this.paymentMenu = false
      this.contractItem = item
      this.contractActivator = btn
      window.setTimeout(() => {
        this.paymentMenu = true
      }, 50)
    },
    showTolMenu(e, item) {
      let btn = e.target
      if (btn.tagName == "span") {
        btn = btn.parentElement
      } else if (btn.tagName == "td") {
        btn = btn.children()[0]
      }
      this.toolMenu = false
      this.item = item
      this.menuActivator = btn
      window.setTimeout(() => {
        this.toolMenu = true
      }, 50)
    },
    filterChange(val) {
      this.filter = val
      this.options.filter = this.filter
    },
    noApproveState() {
      if (this.options.approveState) {
        this.options.approveState = null
      } else {
        this.options.approveState = "1"
      }
    },
    putState() {
      if (this.options.putState) {
        this.options.putState = null
      } else {
        this.options.putState = "0,3"
      }
    },
    approveState() {
      if (this.options.state == "0,1") {
        this.options.state = "1"
        this.approveBtn = '未审核'
        this.approveColor = 'info'
      } else if (this.options.state == "1") {
        this.options.state = "0"
        this.approveBtn = '所有'
        this.approveColor = 'warning'
      } else {
        this.options.state = "0,1"
        this.approveBtn = '已审核'
        this.approveColor = ''
      }
    },
    myProList() {
      if (this.options.staffId) {
        this.options.staffId = null
      } else {
        this.options.staffId = this.$store.state.user.id
      }
    },
    dateChange2() {
      if (this.dateMenu.date) {
        this.date = this.dateMenu.date.join("到")
        this.dateItems.push(this.date)
        this.dateMenu.showMenu = false
        let sd = this.date.split("到")
        this.options.start = sd[0]
        this.options.end = sd[1]
      } else {
        this.options.start = null
        this.options.end = null
      }
    },
    dateChange() {
      let date
      date = this.getDateByStr(this.date)
      if (((date == null || date.start == null) && this.date != null)) {
        let sd = this.date.split("到")
        if (sd != null && sd.length > 1) {
          this.options.start = sd[0]
          this.options.end = sd[1]
        }
      } else {
        this.options.start = date.start
        this.options.end = date.end
      }
    },
    setDense() {
      if (this.$vuetify.breakpoint.width > 1280) {
        this.dense = false
      } else {
        this.dense = true
      }

      if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.width < 900) {
        this.xSmall = true
      }
    },

    list() {
      this.total = 50
      let q = Object.assign({}, this.options)
      q.str = this.search.str
      q.searchMaterial = this.search.searchMaterial
      q.searchCompany = this.search.searchCompany
      q.pageSize = this.op.itemsPerPage
      q.pageNumber = this.op.page
      q.sortOrder = this.op.sortDesc[0] ? 'desc' : 'asc'
      q.sortName = this.op.sortBy[0]
      let cancelToken = this.$store.state.axiosToken.urlMap['/procurement']
      if (cancelToken) {
        cancelToken()
        window.setTimeout(() => this.loading = true, 10)
      }
      this.loading = true
      loadTotal(q).then(result=>this.total=result)
      return listPro(q).then(result => {
        result.forEach(row => {
          if ((row.isContract == "1" && row.contract == null)) {        //有合同,未登记
            row.style = 'red--text'
          } else if (row.contract && row.contract.id) {     //已绑定合同，判断合同已付款金额是否有付完
            if (row.contract.yetPay == row.contract.price) {        //有合同，已付款完毕
              //判断是否开票完毕
              row.style = 'blue--text'
            } else {      //有合同未付清
              row.style = "green--text"
            }
          } else {      //没有合同
            row.style = "grey--text"
          }

          if (row.pm01326 == "1") {
            row.style += " red-bg"
          }

          if (row.state == 0) {
            row.state = this.getApproveState(row)
          }
        })
        this.items = result
      }).finally(() => this.loading = false)
    }
  }
}
</script>

<style scoped>
.red-bg {
  background-color: #ffd0d0;
}

.cursor-pointer {
  cursor: pointer;
}
</style>