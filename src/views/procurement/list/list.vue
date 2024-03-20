<template>
  <div>
    <v-row dense>
      <v-col sm="8" cols="12" class="pt-0">
        <v-btn :color="options.staffId ? 'info' : ''"
               @click="myProList"
               :x-small="xSmall"
               class="mr-1"
               :small="!xSmall">{{ options.staffId ? '全部订单' : '我的订单' }}
        </v-btn>
        <v-btn :color="approveColor"
               @click="approveState"
               :x-small="xSmall"
               class="mr-1"
               :small="!xSmall"
               title="审核状态">{{ approveBtn }}
        </v-btn>
        <v-btn :color="options.putState ? 'info' : ''" @click="putState" :x-small="xSmall" class="mr-1"
               :small="!xSmall" title="筛选入库状态">{{ options.putState ? '全部' : '可入库' }}
        </v-btn>
        <v-menu v-model="menu2" offset-y ref="menu2">
          <template v-slot:activator="{attrs,on}">
            <v-btn :x-small="xSmall" :small="!xSmall" v-bind="attrs" v-on="on">
              {{ companyTypeStr }}
              <v-icon x-small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item link @click="filterCompanyType(null)">
              <v-list-item-title>全部</v-list-item-title>
            </v-list-item>
            <v-list-item v-for="i in companyTypeList" :key="i.id" link @click="filterCompanyType(i)">
              <v-list-item-title>{{ i.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!--                更多-->
        <v-menu v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                ref="menu"
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-btn class="ml-1" :x-small="xSmall" :small="!xSmall" v-bind="attrs" v-on="on"
                   title="采购单位类型筛选">
              更多
              <v-icon x-small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item link @click="noApproveState">
              <v-list-item-title>{{ options.approveState ? '全部订单' : '未发起订单' }}</v-list-item-title>
            </v-list-item>
            <v-list-item link target="_blank" to="../report">
              <v-list-item-title>采购报表</v-list-item-title>
            </v-list-item>
            <v-list-item link target="_blank" to="../apply/list">
              <v-list-item-title>申请单列表</v-list-item-title>
            </v-list-item>
            <v-list-item link>
              <storage-manager v-model="putStorage" label="请指定入库仓库"></storage-manager>
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
                        key="5">全部
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
      <v-col class="pt-0" sm="1" cols="12">
        <v-text-field :loading="loading"
                      @keyup.enter="searchHandler"
                      v-model="search.searchMaterial"
                      hide-details
                      dense
                      label="搜索材料"></v-text-field>
      </v-col>
      <v-col class="pt-0" sm="1" cols="12">
        <v-text-field :loading="loading"
                      @keyup.enter="searchHandler"
                      v-model="search.searchCompany"
                      hide-details
                      dense
                      title="搜索供货商"
                      label="搜索供货商"></v-text-field>
      </v-col>
      <v-col class="pt-0" sm="2" cols="12">
        <v-text-field :loading="loading"
                      @keyup.enter="searchHandler"
                      v-model="search.str"
                      hide-details
                      dense
                      label="全局搜索"></v-text-field>
      </v-col>
    </v-row>

    <v-data-table :options.sync="op"
                  class="cursor-pointer"
                  :loading="loading"
                  :server-items-length="total"
                  :footer-props="{showFirstLastPage:true}"
                  :items-per-page="12"
                  sort-by="voucherDate"
                  sort-desc
                  :items="items"
                  :dense="dense"
                  :headers="headers">
      <template v-slot:item="{item}">
        <tr :key="item.id" :class="item.style" @dblclick="showDetail(item)">
          <td>
            <div style="max-width: 250px" class="text-no-wrap text-truncate">{{ item.pmNumber }}</div>
          </td>
          <td>
            <div v-if="item.company" style="max-width: 250px"
                 class="text-no-wrap text-truncate text-decoration-underline"
                 @contextmenu.stop="showCompanyDetail($event,item)">
              {{ item.company.name.replace("有限公司", "") }}
            </div>
          </td>
          <td>
            <div v-if="item.contract"
                 style="max-width: 200px" class="text-no-wrap text-truncate text-decoration-underline"
                 @contextmenu.stop="showPaymentMenu($event,item.contract)"
                 @click="flowDetail(item.contract)">
              {{ item.contract.name }}
            </div>
          </td>
          <td>
            <div style="width: 84px" v-if="item.voucherDate.length > 15">{{ item.voucherDate.substr(0, 10) }}
            </div>
            <div v-else>{{ item.voucherDate }}</div>
          </td>
          <td>
            <div>{{ item.staff.name }}</div>
          </td>
          <td>
            <div style="width: 50px" class="text-decoration-underline" v-if="item.putState == 4"
                 title="订单材料已经完全入库"
                 @click="flowDetail(item)">
              已入库
            </div>
            <div style="width: 50px" class="text-decoration-underline" v-else-if="item.state == 1"
                 title="审批通过的订单，可做入库等操作"
                 @click="flowDetail(item)">
              已审核
            </div>
            <div style="width: 50px" class="text-decoration-underline" v-else-if="item.state == 0"
                 title="已经发起审批流程，正在等待审批通过"
                 @click="flowDetail(item)">
              审批中
            </div>
            <div style="width: 50px" v-else-if="item.state == 2" title="未发起审批流程的订单">未发起</div>
          </td>
          <td>
            <v-btn class="mr-1" x-small @click="showTolMenu($event,item)" v-if="isPut(item)" color="error">
              入库
              <v-icon x-small>mdi-chevron-down</v-icon>
            </v-btn>
            <v-btn v-else-if="item.state <= 0 || item.state == 2" x-small class="mr-1" @click="deleteHandler(item)">
              删除
              <v-icon x-small>mdi-delete-forever</v-icon>
            </v-btn>
            <v-btn class="mr-1" x-small @click="updateHandler(item)">修改</v-btn>
            <v-btn x-small v-if="item.state == 1 && item.expressCode != ''" link target="_blank"
                   :href="`https://www.baidu.com/s?wd=${item.expressCode}`">物流信息
            </v-btn>
            <v-btn @click="allPutHandler(item)"
                   x-small
                   v-if="(item.putState == 0 || item.putState == 3) && item.state == 1 && !dense">消单
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!--        供应单位明细按钮组-->
    <v-menu ref="toolMenu" v-model="toolMenu2" :activator="menuActivator2" offset-y>
      <v-list>
        <v-list-item link @click="setCompanyDetail('proHistory')">
          <v-list-item-title>采购记录</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="setCompanyDetail('putHistory')">
          <v-list-item-title>入库记录</v-list-item-title>
        </v-list-item>
        <v-list-item link disabled>
          <v-list-item-title>采购/入库对比</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!--        付款申请按钮组-->
    <v-menu v-model="paymentMenu" ref="paymentMenu" :activator="contractActivator" offset-x>
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

    <!--        入库操作按钮组-->
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
        <v-list-item @click="allPutHandler(item)" target="_blank"
                     v-if="(item.putState == 0 || item.putState == 3) && item.state == 1 && dense">
          <v-list-item-title>消单</v-list-item-title>
        </v-list-item>
        <v-list-item :to="`/procurement/back/insert/${item.id}`"
                     v-if="(item.putState == 0 || item.putState == 3) && item.state == 1">
          <v-list-item-title>供应商退货</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!--        申请删除提示-->
    <v-dialog width="50%" v-model="applyDeleteDialog">
      <v-btn outlined @click="applyDeleteDialog = false" absolute right style="right: 5px;top :5px" color="error"
             fab x-small>
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <keep-alive>
        <component :deleteData="deleteData"
                   v-bind:is="applyDeleteComponent"
                   @cancel="closeApplyDialog"
                   @success="closeApplyDialog">

        </component>
      </keep-alive>
    </v-dialog>

    <!--        更新采购订单税率/合同-->
    <v-dialog width="50%" v-model="updateDialog">
      <v-card class="pa-3">
        <v-btn outlined @click="updateDialog = false" absolute right style="right: 5px;top :5px" color="error"
               fab x-small>
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <keep-alive>
          <component v-bind:is="updateComponent" ref="updateProcurement" v-model="item"></component>
        </keep-alive>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="updateDialog = false">取消</v-btn>
          <v-btn :loading="loading" @click="clearContract" color="primary">解除合同绑定</v-btn>
          <v-btn :loading="loading" @click="saveUpdate" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        订单明细-->
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
            <v-list-item link :to="`/procurement/form/insert/${item.id}/1`" target="_blank"
                         :disabled="item.state === 1">
              <v-list-item-title>{{ item.state === 1 ? '已审核,禁止修改' : '修改' }}</v-list-item-title>
            </v-list-item>
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
        <detail @loadSuccess="loadSuccess" v-model="item" ref="detail" :socketData="socketData"></detail>
        <v-card-actions>
          <v-spacer style="padding-right: 110px;" class="text-right">
            <img title="鼠标右键，下载订单信息"
                 class="mr-1"
                 @contextmenu="downloadHistory"
                 v-if="(imgPath && item.state === 1 && showImg)"
                 :src="imgPath" style="width:100px;height: auto;position:absolute;bottom: 25px;">
          </v-spacer>
          <v-progress-circular
              class="mr-1"
              v-if="(imgPath == null && item.state === 1 && showImg)"
              indeterminate
              color="primary"
          ></v-progress-circular>
          <v-btn @click="backListHandler">退货记录</v-btn>
          <v-btn @click="putListHandler">入库记录</v-btn>
          <v-btn @click="prevItem()" :disabled="prevDisabled">上一个</v-btn>
          <v-btn @click="nextItem()" :disabled="nextDisabled">下一个</v-btn>
          <v-btn link :disabled="!isPut(item)" @click="selectPutHandler">分批入库</v-btn>
          <v-btn link :disabled="!isPut(item)" @click="putHandler">全部入库</v-btn>
          <v-btn link :disabled="!isPut(item)" @click="allPutHandler(item)">消单</v-btn>
          <v-btn :disabled="item.state === 1" link target="_blank" @click="updateHandler(item)">
            修改
          </v-btn>
          <v-btn @click="detailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        选择入库-->
    <v-dialog width="99%" v-model="selectPutDialog">
      <v-card class="white pt-1">
        <select-put @putListHandler="putListHandler" @closePutHandler="closePutHandler"
                    :procurement="item"></select-put>
      </v-card>
    </v-dialog>

    <!--        申请合同付款-->
    <v-dialog width="99%" v-model="paymentDialog">
      <component v-bind:is="payment"
                 :updateItem="paymentData"
                 :isKaiLiPurchase="true"></component>
    </v-dialog>

    <!--        供应单位采购/入库明细-->
    <v-dialog width="99%" v-model="companyDetailDialog">
      <v-card class="white pa-3">
        <component v-bind:is="detailCompany"
                   v-bind:company="companyItem.company"></component>
      </v-card>
    </v-dialog>

    <instance-detail :close="closeFlowDetail" :frame="flowItem.id"></instance-detail>

    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>

    <!--    入库记录-->
    <v-dialog width="99%" v-model="putListDialog">
      <v-card class="pa-3">
        <pro-put-list :pro-id="proId"></pro-put-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="putListDialog=false">关闭</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <!--    退货记录-->
    <v-dialog width="99%" v-model="backListDialog">
      <v-card class="pa-3">
        <back-list :pro-id="proId" @deleteHandler="deleteBackHandler"></back-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="putListDialog=false">关闭</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {deletePro, exportExcel, listPro, setPutAll, updateDownloadState, loadTotal} from '@/api/procurement'
import {getProSign, putProMaterial} from '@/api/put'
import storageManager from "../../storage/storageManager"
import {getMessageByFrameId} from "@/api/usedFlowApi"
import {getConfig, list as scList} from '@/api/systemConfig'

export default {
  name: "procurement-list",
  components: {
    storageManager,
    ProPutList: () => import("@/views/storage/put/listByPro"),
    detail: () => import("../detail"),
    selectPut: () => import("./selectPut"),
    instanceDetail: () => import("@/components/easyflow/instance-detail"),
    backList: () => import("@/views/procurement/back/list"),
  },
  props: {
    isDownload: Boolean,
    socketData: null
  },
  data: () => ({
    op: {
      itemsPerPage: 12
    },
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
      //审批状态：0=未审批，1=已审批,2=未发起，0,1,2=所有
      state: '0,1,2',
      //1=未下载凭证，不传默认加载所有
      isDownload: null,
      //1=加载作废单据，不传默认加载正常单据
      discard: null,
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
      {text: '操作', value: 'action'},
    ],
    items: [],
    dense: false,
    dateItems: ["本月", "上月", "半年", "本年", "去年", "所有"],
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
    approveBtn: '全部',
    approveColor: '',
    toolMenu: false,
    menuActivator: null,
    contractActivator: null,
    item: {
      id: null,
      pmNumber: null,
      company: null
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
    payment: () => import('@/components/10563'),

    companyDetailDialog: false,
    detailCompany: null,
    toolMenu2: false,
    menuActivator2: null,
    companyItem: {},
    applyDeleteComponent: () => import('../applyDeleteForm'),
    updateComponent: () => import('../updateContractInfo'),
    thanIdx: null,
    nextDisabled: false,
    prevDisabled: false,
    showImg: true,
    companyTypeList: [],
    companyTypeStr: '全部',
    menu2: false,

    putListDialog: false,
    proId: null,
    backListDialog: false
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
    },
    item: {
      handler() {
        this.imgPath = null
      },
    }
  },
  created() {

    getConfig('PRO_COMPANY_TYPE').then(c => {
      scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
        if (result.rows.length > 0) {
          result.rows.forEach(item => {
            item.value = item.value || ''
          })
          this.companyTypeList = result.rows
        }
      })
    })

    if (this.isDownload) {
      this.options.isDownload = "1"
    }
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
    deleteBackHandler(){
      this.item.putState = 3
    },
    backListHandler() {
      this.backListDialog = true
      this.proId = this.item.id
    },
    putListHandler() {
      this.putListDialog = true
      this.proId = this.item.id
    },
    filterCompanyType(typeConfig) {
      if (typeConfig) {
        this.companyTypeStr = typeConfig.name
        this.options.isColie = typeConfig.value
      } else {
        this.options.isColie = ''
        this.companyTypeStr = '全部'
      }
    },
    prevItem() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.items.indexOf(this.item) - 1;
      if (this.thanIdx <= -1 && this.op.page <= 1) {
        this.prevDisabled = true
      } else if (this.thanIdx <= -1) {
        this.thanIdx = this.items.length - 1
        this.op.page--;
      } else {
        this.item = this.items[this.thanIdx]
      }
    },
    nextItem() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.items.indexOf(this.item) + 1;
      if (this.op.page >= (this.total / this.op.itemsPerPage) && this.thanIdx >= this.items.length) {
        this.nextDisabled = true
      } else if (this.thanIdx >= this.items.length) {
        this.thanIdx = 0
        this.op.page++;
      } else {
        this.item = this.items[this.thanIdx]
      }
    },
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
      item.state = 2
      this.itemMapCatch[item.id] = item
      getMessageByFrameId(item.id).then(result => {
        if (result) {
          this.itemMapCatch[result.frameId].state = 0
        }
      })
      return 2;
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
      updateDownloadState(this.item.id).then(() => {
        this.$emit("updateDownloadState", this.item)
      })
    },
    loadSuccess(data, img) {
      if (this.item.state === 1) {
        if (img) {
          this.imgPath = img
          this.showImg = true
        } else {
          this.showImg = false
        }
      }
    },
    showDetail(item) {
      if (item !== this.item) {
        this.showImg = true
        this.imgPath = null
      }
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
      }).finally(() => this.loading = false)
    },
    allPutHandler(item) {
      this.item = item
      this.confirm(`确定将订单《${item.pmNumber}》设置为完全入库状态吗？` +
          '<br/>' +
          '<spam class="red--text">确定后订单中未入库材料将不可入库</spam>').then(this.updatePutState)
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
        getProSign(this.item.id).then(result => {
          if (result && result.id) {
            // if (!confirm("该订单已发送给项目经理，确定入库吗？")) {
            //     putFlag = false
            // }
            this.confirm("该订单已发送给项目经理，确定入库吗？").then(() => {
              putProMaterial(putData).then(() => {
                this.item.putState = 4
              })
            })
          } else {
            putProMaterial(putData).then(() => {
              this.item.putState = 4
            })
          }
        }).catch(() => {
          putProMaterial(putData).then(() => {
            this.item.putState = 4
          })
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
      this.confirm(`确定删除《${item.pmNumber}》订单`).then(this.deletePro)
    },
    isPut(item) {
      return (item.putState === 0 || item.putState === 3) && item.state === 1;
    },
    setCompanyDetail(type) {
      this.detailCompany = () => import(`@/views/company/${type}`)
      this.companyDetailDialog = true
    },
    showCompanyDetail(e, item) {
      e.preventDefault()
      let target = e.target
      if (target.tagName == "td") {
        target = target.children()[0]
      }
      this.menuActivator2 = target
      this.companyItem = item
      this.toolMenu2 = true
    },
    showPaymentMenu(e, item) {
      e.preventDefault()
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
      if (this.options.state == "0,1,2") {
        this.options.state = "1"
        this.approveBtn = '已审核'
        this.approveColor = 'info'
      } else if (this.options.state == "1") {
        this.options.state = "0,2"
        this.approveBtn = '审批中'
        this.approveColor = 'warning'
      } else {
        this.options.state = "0,1,2"
        this.approveBtn = '全部'
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
        } else {
          this.options.start = null
          this.options.end = null
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
    loadTotal(q) {
      this.total = 50
      loadTotal(q).then(result => this.total = result)
    },
    list() {
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
      this.loadTotal(q)
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

          if (row.state == 0 && row.pmDate < '2023-08-27') {
            this.getApproveState(row)
          }
        })
        this.items = result
        if (this.thanIdx != null && this.items.length > 0) {
          if (this.thanIdx >= this.items.length) {
            this.thanIdx = this.items.length - 1
          }
          this.item = this.items[this.thanIdx]
          this.thanIdx = null
        }
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