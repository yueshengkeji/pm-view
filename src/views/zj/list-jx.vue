<template>
  <div>
    <div v-if="loadDetailByHouse == null">
      <v-row>
        <v-col sm="5" cols="12">
          <v-btn v-if="type == null" small color="primary" @click="openDialog(0)">租赁合同登记</v-btn>
          <v-btn class="ml-1" v-if="type == null" small color="primary" @click="openDialog(1)">物管合同登记</v-btn>
          <v-btn @click="downloadExcel" small :loading="loading" class="ml-1">导出</v-btn>
          <v-menu ref="menu3" v-model="menu3" offset-y :close-on-content-click="false">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-on="on" v-bind="attrs" small :loading="loading" class="ml-1">筛选</v-btn>
            </template>
            <v-list dense>
              <v-list-group :value="true">
                <template v-slot:activator>
                  <v-list-item-title>业态</v-list-item-title>
                </template>
                <v-list-item v-for="(yt) in yitaiItems" :key="yt.id" v-model="yt.active" @click="filterYtHandler(yt)">
                  <v-list-item-title v-text="yt.name"></v-list-item-title>
                </v-list-item>
              </v-list-group>
              <v-list-group :value="true">
                <template v-slot:activator>
                  <v-list-item-title>合同类型</v-list-item-title>
                </template>
                <v-list-item v-for="(type) in typeItems" :key="type.id" v-model="type.active"
                             @click="filterTypeHandler(type)">
                  <v-list-item-title v-text="type.name"></v-list-item-title>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-menu>
          <v-btn @click="modelPrintDialog = true" small class="ml-1">合同模板</v-btn>
        </v-col>
        <v-col sm="6">
          <v-select v-if="false" :item="['本年应收合计', '财务已收', '已收保证金', '已退保证金', '开票合计']"
                    multiple></v-select>
          <v-chip x-small>{{ '本年应收合计：' + yearMoney }}</v-chip>
          <v-chip x-small>{{ '财务已收：' + cwMoney }}</v-chip>
          <v-chip x-small>{{ '开票合计：' + kpMoney }}</v-chip>
          <v-chip x-small>{{ '已收保证金：' + bzjMoney }}</v-chip>
          <v-chip x-small>{{ '当前欠租：' + earlyMoney }}</v-chip>
        </v-col>
        <v-col lg="1" sm="1">
          <v-text-field dense label="搜索" v-model="query.searchText" @change="list"></v-text-field>
        </v-col>
      </v-row>
      <v-data-table class="cursor" :items="items" :items-per-page="10" :loading="loading" :server-items-length="total"
                    :options.sync="options" sort-by="series" @dblclick:row="detail" :headers="headers">

        <template v-slot:item="{ item }">
          <tr class="red--text text--lighten-1" @dblclick="detail($event, { item })" v-if="isEnd(item.endDatetime)">
            <td class="text-start">
              {{ item.brandCompany.name }}
            </td>
            <td class="text-start">
              {{ item.brand }}
            </td>
            <td class="text-start">
              {{ item.yt.name }}
            </td>
            <td class="text-start">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <div v-for="(h) in item.houses" :key="'houses' + h.id">
                      <span>{{ h.pwNumber }}</span>
                    </div>
                  </div>
                </template>
                <div v-for="(h) in item.houses" :key="h.id">
                  <span>{{ h.pwNumber + " 面积:" + h.acreage }}</span>
                </div>
              </v-tooltip>
            </td>


            <td class="text-start">
              {{ item.acreage }}
            </td>
            <td class="text-start">
              {{ item.yearRental }}
            </td>
            <td class="text-start">
              {{ item.ysMoney }}
            </td>
            <td class="text-start">
              {{ item.cwMoney }}
            </td>
            <td class="text-start">
              {{ item.kjType[0].series }}
            </td>
            <td class="text-start">
              {{ item.kjType[0].money }}
            </td>
            <td class="text-start">
              <v-btn x-small @click="detail($event, { item: item })">明细</v-btn>
              <v-btn v-if="showDelete" class="ml-1" color="error" x-small @click="deleteItem(item)">删除
              </v-btn>
            </td>
          </tr>

          <tr class="light-blue--text text--darken-1" @dblclick="detail($event, { item })" v-else-if="isPay(item)">
            <td class="text-start">
              {{ item.brandCompany.name }}
            </td>
            <td class="text-start">
              {{ item.brand }}
            </td>
            <td class="text-start">
              {{ item.yt.name }}
            </td>
            <td class="text-start">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <div v-for="(h) in item.houses" :key="'houses' + h.id">
                      <span>{{ h.pwNumber }}</span>
                    </div>
                  </div>
                </template>
                <div v-for="(h) in item.houses" :key="h.id">
                  <span>{{ h.pwNumber + " 面积:" + h.acreage }}</span>
                </div>
              </v-tooltip>
            </td>

            <td class="text-start">
              {{ item.acreage }}
            </td>
            <td class="text-start">
              {{ item.yearRental }}
            </td>
            <td class="text-start">
              {{ item.ysMoney }}
            </td>
            <td class="text-start">
              {{ item.cwMoney }}
            </td>
            <td class="text-start">
              {{ item.kjType[0].series }}
            </td>
            <td class="text-start">
              {{ item.kjType[0].money }}
            </td>
            <td class="text-start">
              <v-btn x-small @click="detail($event, { item: item })">明细</v-btn>
              <v-btn v-if="showDelete" class="ml-1" color="error" x-small @click="deleteItem(item)">
                删除
              </v-btn>
            </td>
          </tr>

          <tr @dblclick="detail($event, { item })" v-else>
            <td class="text-start">
              {{ item.brandCompany.name }}
            </td>
            <td class="text-start">
              {{ item.brand }}
            </td>
            <td class="text-start">
              {{ item.yt.name }}
            </td>
            <td class="text-start">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <div v-for="(h) in item.houses" :key="'houses' + h.id">
                      <span>{{ h.pwNumber }}</span>
                    </div>
                  </div>
                </template>
                <div v-for="(h) in item.houses" :key="h.id">
                  <span>{{ h.pwNumber + " 面积:" + h.acreage }}</span>
                </div>
              </v-tooltip>
            </td>

            <td class="text-start">
              {{ item.acreage }}
            </td>
            <td class="text-start">
              {{ item.yearRental }}
            </td>
            <td class="text-start">
              {{ item.ysMoney }}
            </td>
            <td class="text-start">
              {{ item.cwMoney }}
            </td>
            <td class="text-start">
              {{ item.kjType[0].series }}
            </td>
            <td class="text-start">
              {{ item.kjType[0].money }}
            </td>
            <td class="text-start">
              <v-btn x-small @click="detail($event, { item: item })">明细</v-btn>
              <v-btn v-if="showDelete" class="ml-1" color="error" x-small @click="deleteItem(item)">
                删除
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <v-dialog v-model="dialog" @close="dialog = false" fullscreen>
      <concat-detail :type="type" ref="concatDetail" :id="detailId" @close="closeHandler()"></concat-detail>
    </v-dialog>
    <v-dialog v-model="deleteDialog" @close="deleteDialog = false" width="30%">
      <v-card>
        <v-card-actions>
          <v-card-title>确定删除:{{ item.series }}？</v-card-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteZujin" autofocus>确定</v-btn>
          <v-btn @click="deleteDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
    <v-dialog v-model="mapDialog">
      <v-card class="pa-5 pb-0">
        <house-map :loadFloor="mapFloor" @clickHouse="houseHandler"></house-map>
        <v-btn @click="mapDialog = false" absolute right bottom>返回</v-btn>
      </v-card>
    </v-dialog>


    <v-dialog v-model="modelPrintDialog">
      <v-card>
        <contract-word-model ref="contractWordModel"></contract-word-model>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submitContractWordModel" color="primary">提交</v-btn>
          <v-btn class="ml-1" @click="modelPrintDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <component v-bind:is="printComponent"
               v-bind:contractId="contractId"
               v-on:success="printComponent = null"
    ></component>
  </div>
</template>

<script>
import {
  bzjList,
  bzjMoneyList,
  cwMoneyEarlyList,
  deleteBzj,
  deleteZujin,
  expireEarlyList,
  expireList,
  exportZujinExcel,
  getByHouseId,
  moneyTotal,
  rageMoneyList,
  updateMoney,
  zujinList,
} from '@/api/zujin'
import {
  addPayDetail,
  getById,
  getPayDetails,
  getPutDetailByMain,
  insertProPutDetail,
  updateProPutDetail,
} from '@/api/proPutDetail'
import {updatePay} from '@/api/proDetailPay'
import {insertOwe, updateOwe, updateQcOwe} from '@/api/proOwe'
import {list} from '@/api/yetai'
import {houseList} from '@/api/house'
import houseMap from '@/views/zj/house/map'


import contractWordModel from "./components/contractWordModel";

export default {
  components: {
    houseMap,
    contractWordModel,
    concatDetail: () => import('@/views/zj/form/insert.vue')
  },
  name: "zj-list",
  props: {
    type: null,
    loadDetailByHouse: null,
  },
  data: () => ({
    frameId: null,
    defaultFlow: null,
    mapDialog: false,
    mapFloor: null,
    showDelete: false,
    yearMoney: 0,
    cwMoney: 0,
    bzjMoney: 0,
    returnMoney: 0,
    kpMoney: 0,
    earlyMoney: 0,
    downloadExcelUrl: "list/export",
    loading: false,

    searchBzjType: null,
    bzjMenu: false,
    msgShow: false,
    msg: null,
    menu5: false,
    menu4: false,
    menu6: false,
    bzjDialog: false,
    bzjMoneyCount: 0,
    bzj: {money: "", remark: "", datetime: '', type: ''},
    bzjHeaders: [
      {text: '金额', value: 'money'},
      {text: '类型', value: 'type'},
      {text: '收取时间', value: 'datetime'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    yitaiItems: [],
    year: '2021',
    headers: [
      {text: '租赁方', value: 'brandCompany.name'},
      {text: '品牌', value: 'brand'},
      {text: '业态', value: 'yt.name'},
      {text: '商铺位置', value: 'houses'},
      {text: '面积²', value: 'acreage'},
      {text: '应收租金', value: 'yearRental'},
      {text: '目前应收', value: 'ysMoney'},
      {text: '财务已收', value: 'cwMoney'},
      {text: '会计科目', value: 'kjType[0].series'},
      {text: '科目余额', value: 'kjType[0].money'},
      {text: '操作', value: 'action', width: '11%'},
    ],
    items: [],
    options: {},
    query: {
      searchText: null,
      page: 1,
      itemsPerPage: 10,
      ytId: null,
      type: null,
    },
    total: 0,

    dialog: false,
    data: {
      type: 1
    },
    payTypes: [
      {text: '年付方式', value: 0},
      {text: '季度方式', value: 1},
      {text: '月付方式', value: 2},
      {text: '双月付', value: 3},
      {text: '其他', value: 4},
    ],
    typeItems: [
      {name: '租赁合同', id: 0, active: false},
      {name: '物管合同', id: 1, active: false},
      {name: '多经类合同', id: 2, active: false},
    ],
    houseList: [],


    houseMessage: null,
    acreageMessage: null,
    dzNumberError: null,
    deleteDialog: false,
    item: {
      series: ''
    },
    /*应收/实收表（租金明细表）*/
    headers2: [
      {text: '序号', value: 'index', width: '15%'},
      {text: '应收时间', value: 'proDate', width: '15%'},
      {text: '金额', value: 'proMoney', width: '20%'},
      {text: '实收时间', value: 'putDate', width: '15%'},
      {text: '金额', value: 'putMoney', width: '20%'},
      {text: '备注', value: 'remark', width: '15%'},
    ],
    ysMoneyItems: [],
    ysMoneyCount: 0,
    sjMoneyCount: 0,
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

    menu: false,
    menu2: false,
    menu3: false,
    date: null,
    date2: null,

    menu7: false,
    menu8: false,

    headers3: [
      {text: '开票情况', value: 'billMoney', colspan: 2, width: '50%'},
      {text: '收款情况', value: 'payMoney', colspan: 2, width: '50%'},
    ],
    cwMoneyItems: [],
    detailLoading2: false,
    saveLoading: false,
    payCount: 0,
    billCount: 0,

    //会计科目相关
    billItems: [],
    billDialog: false,
    offEdit: true,
    activeYt: null,
    activeType: null,

    //模板
    modelPrintDialog: false,
    btnLoading: false,
    contractId: null,
    printComponent: null,

    detailId: null
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
    }
  },
  created() {
    if (this.$store.getters.roles.indexOf("维护") !== -1 || this.$store.getters.roles.indexOf("管理") !== -1) {
      this.showDelete = true
      this.offEdit = false
    } else if (this.$store.getters.roles.indexOf('财务') !== -1 || this.$store.getters.roles.indexOf('会计') !== -1) {
      this.offEdit = false
    }

    list().then(items => {
      this.yitaiItems = items
    }).finally(() => {
      if (this.loadDetailByHouse != null) {
        this.houseHandler(this.loadDetailByHouse)
      }
    })
    this.reset(0)
  },
  methods: {
    closeHandler() {
      this.detailId = null
      this.dialog = false
      this.list()
    },
    filterTypeHandler(type) {
      if (this.activeType) {
        this.activeType.active = false
      }
      type.active = true
      this.query.type = type.id
      this.activeType = type
      this.list()
    },
    filterYtHandler(item) {

      if (this.activeYt) {
        this.activeYt.active = false
      }

      if (item.active != null) {
        item.active = !item.active
      } else {
        this.$set(item, 'active', true)
      }
      this.activeYt = item
      this.query.ytId = item.id
      this.list()
    },
    isEnd(datetime) {
      var d = this.dateDiffDay(datetime);
      if (d <= 0) {
        console.log("已过期", datetime)
        //已过期
        return false;
      } else if (d <= 30) {
        //快过期
        console.log("快过期", datetime)
        return true;
      } else {
        //正常
        return false;
      }
    },
    isPay(item) {
      return item.ysMoneyEarly
    },
    houseHandler(house) {
      if (house != undefined) {
        //根据商铺信息获取对账单
        getByHouseId(house.id).then(data => {
          this.detail(null, {item: data});
          this.mapDialog = false
        }).catch((e) => {
          this.msg = e
          this.msgShow = true
        })
      } else {
        this.msg = "该商铺未登记合同"
        this.msgShow = true
      }

    },

    downloadExcel() {
      this.loading = true
      let {page, itemsPerPage, sortBy, sortDesc} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      if (sortBy) {
        this.query.sortBy = sortBy.join(',')
        this.query.sortDesc = sortDesc.join(',')
      }
      if (this.type == null) {
        this.downloadExcelUrl = 'list/export'
      } else if (this.type == "expire") {
        this.downloadExcelUrl = 'expire/export'
      } else if (this.type == "rage") {
        this.downloadExcelUrl = 'rageMoney/export'
      } else if (this.type == "expireEarly") {
        this.downloadExcelUrl = "expireEarly/export"
      } else if (this.type == "cwEarly") {
        this.downloadExcelUrl = "cwMoneyEarly/export"
      } else {
        this.downloadExcelUrl = "bzjMoney/export"
      }
      exportZujinExcel(this.downloadExcelUrl, this.query).then(data => {
        try {
          let a = document.createElement("a");
          a.target = "_blank"
          a.href = data
          a.click()
        } catch (e) {
          console.log(e)
        }
      }).finally(() => {
        this.loading = false
      })

    },
    loadMoneyTotal() {
      moneyTotal().then(result => {
        this.yearMoney = !result.yearRental ? 0.0 : result.yearRental
        this.cwMoney = !result.cwMoney ? 0.0 : result.cwMoney
        this.bzjMoney = !result.bzjMoney ? 0.0 : result.bzjMoney
        this.returnMoney = !result.returnMoney ? 0.0 : result.returnMoney
        this.kpMoney = !result.kpMoney ? 0.0 : result.kpMoney
        this.earlyMoney = !result.earlyMoney ? 0.0 : result.earlyMoney
      })
    },
    deleteBzjHandler(id) {
      deleteBzj(id).then(() => {
        this.loadBzj();
        if (this.type == "bzj") {
          this.list()
        }
      })
    },
    getZmMoney(billItem) {
      try {
        return billItem.money.toFixed(2)
      } catch (e) {
        return 0;
      }
    },
    getSjQMoney() {
      /*let m = parseFloat(this.data.moneyOwe.oweMoney)
      if (isNaN(m)) {
          m = 0
      }
      return m + this.data.sjMoney - this.data.cwMoney*/
      if (this.item.kjType[0].money > 0) {
        return this.item.kjType[0].money.toFixed(2)
      } else {
        return "0";
      }
    },
    getNoBillMoney() {
      /*let m = parseFloat(this.data.billOwe.oweMoney)
      if (isNaN(m)) {
          m = 0
      }
      return m + this.data.sjMoney - this.data.kpMoney*/
      if (this.item.kjType[0].money <= 0) {
        return this.item.kjType[0].money.toFixed(2)
      } else {
        return "0";
      }
    },
    updateQcOweMoney(data) {
      updateQcOwe(data).then(() => {
        this.list()
      })
      this.setKjMoney()
    },
    newLine3(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        money: 0,
        remark: '系统备注',
        series: ''
      }
      data.push(this.detailItem)
      this.offInsert = true
    },

    savePay() {
      this.saveLoading = true
      /*
      收票、收款保存
       */
      let size = this.cwMoneyItems.length
      let than = this
      let count = 0
      for (let i = 0; i < size; i++) {
        let detailItem = than.cwMoneyItems[i]
        if (detailItem.id != null) {
          updatePay(detailItem).finally(() => {
            count++
          })
        } else {
          addPayDetail(detailItem).finally(() => {
            count++
          })
        }
      }
      /*
      会计科目保存
       */
      size += this.billItems.length
      for (let x = 0; x < this.billItems.length; x++) {
        let item = this.billItems[x]
        item.remark = ""
        item.mainId = this.item.id
        if (item.id != null) {
          updateOwe(item).finally(() => {
            count++
          })
        } else {
          insertOwe(item).finally(() => {
            count++
          })
        }
      }

      let timeout = window.setInterval(() => {
        console.log("count%1 size%2", count, size)
        if (count === size) {
          than.saveLoading = false
          than.offInsert = false
          than.loadProDetail()
          window.clearInterval(timeout)
        }
      }, 1000);
    },
    editDetailItem2(event, item) {
      this.editDetailItem(event, item)
    },

    dateChange(item, prop) {
      if (prop == "putDate") {
        // this.$refs[prop].save()
        this.menu2 = false
      } else {
        this.menu = false
      }
    },
    editDetailItem(event, param) {
      if (this.offInsert) {
        let isRequest = true
        if (this.detailItem.id === (event.id || param.id)) {
          isRequest = false
        }
        if (this.detailItem.id != null && isRequest) {
          this.detailItem.edit = false
          getById(this.detailItem.id).then(detail => {
            detail.edit = false
            this.detailItem.proDate = detail.proDate
            this.detailItem.proMoney = detail.proMoney
            this.detailItem.putMoney = detail.putMoney
            this.detailItem.putDate = detail.putDate
            this.detailItem.remark = detail.remark
          }).finally(() => {
            this.openEdit(event, param)
          })
        } else if (isRequest) {
          this.ysMoneyItems.splice(this.detailItem.index, 1)
          this.openEdit(event, param)
        }
        return
      } else {
        this.openEdit(event, param)
      }

    },
    openEdit(event, param) {
      if (event.id == null) {
        window.setTimeout(() => {
          let temp
          if (this.$refs[param.id + event] instanceof Array) {
            temp = this.$refs[param.id + event][0]
          } else {
            temp = this.$refs[param.id + event]
          }
          temp.focus()
          temp.$refs.input.select()
        }, 100)
        this.detailItem = param
      } else {
        this.detailItem = param.item
      }
      if (event == "proDate") {
        this.menu = true
      } else if (event == "putDate") {
        this.menu2 = true
      } else {
        this.menu = false
        this.menu2 = false
      }
      this.detailItem.edit = true
      this.offInsert = true
    },
    cancelInsert() {
      if (this.detailItem.id == null) {
        this.ysMoneyItems.splice(this.detailItem.index, 1)
      }
      this.offInsert = false
      this.loadProDetail()
    },
    savePro() {
      if (this.detailItem.proMoney < 0 && (this.detailItem.remark == "" || this.detailItem.remark == null)) {
        this.msg = "填写抵扣金额时必须填写抵扣备注信息"
        this.msgShow = true
        return;
      }
      this.detailItem.projectName = ""
      if (this.detailItem.id != null) {
        updateProPutDetail(this.detailItem).then(() => {
          this.loadProDetail()
        }).finally(() => {
          this.offInsert = false
        })
      } else {
        insertProPutDetail(this.detailItem).then(() => {
          this.loadProDetail()
        }).finally(() => {
          this.offInsert = false
        })
      }

    },
    setItemMoneys() {
      console.log("setItemMoneys", this.ysMoneyCount)
      this.item.ysMoney = this.ysMoneyCount
      this.item.sjMoney = this.sjMoneyCount
      this.item.cwMoney = this.payCount
      this.item.kpMoney = this.billCount

      // this.item.yearRental = this.ysMoneyCount
    },
    loadProDetail() {
      let loadCount = 0
      this.detailLoading = true
      this.ysMoneyCount = 0
      this.sjMoneyCount = 0
      //应收/实收
      getPutDetailByMain(this.item.id).then(data => {
        if (data != null) {
          data.forEach((item, idx) => {
            item.edit = false
            item.index = idx + 1
            if (item.proMoney != null) {
              this.ysMoneyCount += item.proMoney
            }
            if (item.putMoney != null) {
              this.sjMoneyCount += item.putMoney
            }
          })
          if (loadCount == 1) {
            this.setItemMoneys()
            this.setKjMoney();
            updateMoney({
              id: this.item.id,
              ysMoney: this.ysMoneyCount,
              sjMoney: this.sjMoneyCount,
              cwMoney: this.payCount,
              kpMoney: this.billCount,
              moneyOwe: this.item.moneyOwe,
              billOwe: this.item.billOwe,
              kjType: this.item.kjType,
              yearRental: this.ysMoneyCount
            }).then(() => {
              this.list()
            })
          } else {
            loadCount++
          }

          this.ysMoneyItems = data
        }
      }).catch(() => {
        this.ysMoneyItems = []
      }).finally(() => {
        this.detailLoading = false
      })

      //财务实收/开票
      this.detailLoading2 = true
      getPayDetails(this.item.id).then(data => {
        this.payCount = 0
        this.billCount = 0
        if (data != null) {
          data.forEach(item => {
            item.edit = false
            if (item.payMoney != null) {
              this.payCount += item.payMoney
            }
            if (item.billMoney != null) {
              this.billCount += item.billMoney
            }
          })
          if (loadCount == 1) {
            this.setItemMoneys()
            this.setKjMoney();
            updateMoney({
              id: this.item.id,
              ysMoney: this.ysMoneyCount,
              sjMoney: this.sjMoneyCount,
              cwMoney: this.payCount,
              kpMoney: this.billCount,
              moneyOwe: this.item.moneyOwe,
              billOwe: this.item.billOwe,
              kjType: this.item.kjType,
              yearRental: this.ysMoneyCount
            }).then(() => {
              this.list()
            })
          } else {
            loadCount++
          }
          this.cwMoneyItems = data

        }
      }).catch((() => this.cwMoneyItems = [])).finally(() => {
        this.detailLoading2 = false
      })

      //财务会计科目
      this.item.kjType.forEach(item => {
        item.edit = false
      })
      this.billItems = this.item.kjType
      // getOweList(this.item.id).then(data => {
      //     data.forEach(item => {
      //         item.edit = false
      //     })
      //     this.billItems = data
      // }).catch(() => this.billItems = [])
    },
    setKjMoney() {
      this.item.kjType[0].money = this.item.moneyOwe.oweMoney - this.item.billOwe.oweMoney + this.billCount - this.payCount
    },
    newLine(data) {

      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        index: data.length + 1,
        proDate: "",
        proMoney: 0,
        putDate: "",
        putMoney: 0,
      }
      data.push(this.detailItem)
      this.offInsert = true
    },
    newLine2(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        index: data.length + 1,
        billDate: "",
        billMoney: 0,
        payDate: "",
        payMoney: 0,
      }
      data.push(this.detailItem)
      this.offInsert = true
    },

    detail(event, row) {
      this.item = row.item
      this.detailId = row.item.id + ""
      this.dialog = true
    },
    loadBzj() {
      this.bzjMoneyCount = 0;
      bzjList(this.data.id).then(result => {
        result.forEach(item => {
          if (item.money != null) {
            this.bzjMoneyCount += item.money;
          }
        })
        this.bzjMoneyCount = this.bzjMoneyCount.toFixed(2);
        this.bzjItems = result
      })
    },

    formatHouse(houses) {
      if (houses.length > 0) {
        return houses[0].pwNumber
      } else {
        return ""
      }
    },
    deleteZujin() {
      deleteZujin(this.item.id).then(() => {
        this.list()
        this.deleteDialog = false
      }).catch(e => {
        console.log(e)
      })
    },
    deleteItem(item) {
      this.item = item
      this.deleteDialog = true
    },
    formatDjYsMoney(item) {

      /*
       *   {text: '年付方式', value: 0},
           {text: '季度方式', value: 1},
           {text: '月付方式', value: 2},
       */
      if (item.payType == 0) {
        return item.yearRental
      } else if (item.payType == 1) {
        let num = this.getQuarter()
        // console.log("每季度金额：", item.yearRental / 4, "当前季度", num)
        return (item.yearRental / 4 * num).toFixed(2)
      } else {
        return (item.yearRental / 12 * new Date().getMonth() + 1).toFixed(2)
      }

    },
    formatPay(item) {
      let result = null;
      for (let x = 0; x < this.payTypes.length; x++) {
        if (this.payTypes[x].value === item.payType) {
          result = this.payTypes[x].text
          break
        }
      }
      return result
    },
    loadHouses(value) {
      houseList({searchText: value, page: 1, itemsPerPage: 50, flag: this.data.type == 0 ? 0 : null}).then(data => {
        data.rows.forEach(item => {
          item.temp = item.pwNumber + ":" + item.acreage
        })
        this.houseList = data.rows
      })
    },
    openDialog(type) {
      if (this.$refs.file) {
        this.$refs.file.reset()
      }
      if(this.$refs.concatDetail){
        this.$refs.concatDetail.reset(type)
      }
      // if (type == 0) {
      //   this.defaultFlow = "租赁合同审批单"
      // } else if (type == 2) {
      //   this.defaultFlow = "多经类合同审批单"
      // } else {
      //   this.defaultFlow = "物业管理费合同审批"
      // }
      this.reset(type)
      this.dialog = true
    },
    insertZujin() {

    },
    reset(type) {
      this.data = {
        dayNum: null,
        series: null,
        company: null,
        brand: null,
        payType: 0,
        acreage: 0,
        zl_person: null,
        zl_person_tel: null,
        yt: {id: null, name: null},
        staffName: this.$store.state.user.name,
        dz: null,
        sh: null,
        remark: null,
        houses: [],
        zlType: 0,
        dzNumber: 0,
        zlPerson: null,
        zlPersonTel: null,
        billOwe: {oweMoney: 0},
        moneyOwe: {oweMoney: 0},
        djYsMoney: 0,
        yearRental: null,
        endDatetime: null,
        kjType: [{money: 0}],
        type: type,
        files: null,
        planDatetime: null,
        openDatetime: null
      }
      this.item = this.data
      this.ysMoneyItems = []
      this.cwMoneyItems = []
      this.payCount = 0
      this.billCount = 0
      this.ysMoneyCount = 0
      this.sjMoneyCount = 0
      this.billItems = []
      this.loadHouses();
      this.offInsert = false
    },


    list() {
      this.loading = true
      let {page, itemsPerPage, sortBy, sortDesc} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      if (sortBy) {
        this.query.sortBy = sortBy.join(',')
        this.query.sortDesc = sortDesc.join(',')
      }
      let request;
      if (this.type == null) {
        request = zujinList(this.query)
      } else if (this.type == "expire") {
        request = expireList(this.query)
      } else if (this.type == "rage") {
        request = rageMoneyList(this.query)
      } else if (this.type == 'expireEarly') {
        request = expireEarlyList(this.query)
      } else if (this.type == "cwEarly") {
        request = cwMoneyEarlyList(this.query)
      } else {
        this.headers = [
          {text: '合同编号', value: 'series'},
          {text: '租赁方', value: 'company'},
          {text: '品牌', value: 'brand'},
          {text: '类型', value: 'bzjType'},
          {text: '商铺位置', value: 'houses'},
          {text: '已缴保证金', value: 'bzjMoney'},
          {text: '已退保证金', value: 'returnBzjMoney'},
          {text: '目前应收', value: 'ysMoney'},
          {text: '财务已收', value: 'cwMoney'},
          {text: '期初欠款', value: 'moneyOwe.oweMoney'},
          {text: '期初欠票', value: 'billOwe.oweMoney'},
          {text: '操作', value: 'action'},

        ],
            request = bzjMoneyList(this.query)
      }
      request.then(data => {
        data.rows.forEach(item => {
          if (!item.yt) {
            item.yt = {name: '-', id: null}
          }
          if(!item.brandCompany){
            item.brandCompany = {name:'-'}
          }
          if(!item.receivedCompany){
            item.receivedCompany = {name:'-'}
          }
          item.djYsMoney = this.formatDjYsMoney(item)
        })
        this.items = data.rows
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
      this.loadMoneyTotal()
    },

    //模板
    submitContractWordModel() {
      this.btnLoading = true
      this.$refs.contractWordModel.submit().then(res => {
        if (res == 1) {
          console.log('success')
        }
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.btnLoading = false
        this.modelPrintDialog = false
      })
    },


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
