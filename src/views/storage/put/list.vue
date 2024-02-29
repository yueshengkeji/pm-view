<template>
  <!--    入库单管理-->
  <div>
    <!--        工具栏-->
    <v-row dense>
      <v-col sm="3">
        <v-btn small color="primary" @click="insertOtherHandler">其它入库</v-btn>
        <v-btn small class="ml-1" @click="hidePmNumber = !hidePmNumber">{{ hidePmNumber ? '打印单号' : '隐藏单号' }}
        </v-btn>
        <v-btn title="统计已审核的入库单数据" class="ml-1" small @click="putHistory">
          <v-icon small>mdi-arrow-down</v-icon>
          入库明细记录
        </v-btn>
      </v-col>
      <v-col sm="3">

        <v-radio-group row dense v-model="type" class="mt-0" @change="list">
          <v-radio value="0" label="未审核"></v-radio>
          <v-radio value="1" label="已审核"></v-radio>
          <v-radio value="-1" label="全部"></v-radio>
        </v-radio-group>
      </v-col>

      <v-col sm="2">
        <v-row dense>
          <v-col cols="6">
            <v-select hide-details
                      @focus="dateMenu.showMenu = false"
                      v-model="date"
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
          <v-col cols="6">
            <storage-manager v-model="putStorage" dense></storage-manager>
          </v-col>
        </v-row>
      </v-col>
      <v-col sm="1">
        <v-text-field dense label="供应单位" @keyup.enter="list()" v-model="searchCompany"></v-text-field>
      </v-col>
      <v-col sm="2">
        <v-text-field dense label="全局搜索" @keyup.enter="list()" v-model="searchText"></v-text-field>
      </v-col>
      <v-col sm="1">
        <v-text-field dense label="入库单号" @keyup.enter="list()" v-model="searchPutSerial"></v-text-field>
      </v-col>
    </v-row>
    <!--        入库单数据列表-->
    <v-data-table :options.sync="option"
                  :loading="loading"
                  :server-items-length="total"
                  :footer-props="{showFirstLastPage:true}"
                  @dblclick:row="detail"
                  :items="items"
                  :headers="headers">

      <template v-slot:item.approveType="{item}">
        {{ formatApproveType(item.approveType) }}
      </template>

      <template v-slot:item.procurement.pmNumber="{item}">
        <a href="###" @click="showContract(item)">{{ item.procurement.pmNumber }}</a>
      </template>

      <template v-slot:item.action="{item}">
        <v-btn x-small color="error" @click="deleteHandler(item)" v-if="item.approveType == 0">删除</v-btn>
        <v-btn class="ml-1"
               v-if="appFlag"
               x-small
               color="primary"
               :loading="approveLoading"
               @click="approveHandler(item)">{{ item.approveType == 0 ? '审核' : '反审核' }}
        </v-btn>
        <v-btn class="ml-1" x-small @click="printHandler(item)">打印</v-btn>
      </template>

    </v-data-table>
    <!--        入库单打印-->
    <v-row align="center" justify="center" class="hidden" style="position: absolute;z-index: -1;top:-999px">
      <v-col cols="12">
        <put-print :hide-pm-number="hidePmNumber" :printData="printItem" ref="print"></put-print>
      </v-col>
    </v-row>
    <!--        入库单明细/新增其他入库-->
    <v-dialog v-model="putDetailDialog" width="98%">
      <v-card class="pa-3">
        <div style="position: absolute;right: 0px;top:0px;">
          <v-btn @click="prevHandler" icon small :disabled="prevDisabled">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn @click="nextHandler" icon small :disabled="nextDisabled">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn small @click="putDetailDialog = false" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <put-detail ref="putDetail" :putStorage="putStorage" v-model="putItem"></put-detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="prevHandler" icon :disabled="prevDisabled">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn @click="nextHandler" icon :disabled="nextDisabled">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn @click="putDetailDialog = false">关闭</v-btn>
          <v-btn :loading="approveLoading"
                 v-if="putItem.approveType == '0' && appFlag"
                 @click="approvePrintHandler(putItem)"
                 color="primary">
            审核并打印
          </v-btn>

          <v-btn :loading="approveLoading"
                 v-if="putItem.approveType == '1'"
                 @click="printHandler(putItem)">
            打印
          </v-btn>

          <v-btn v-if="putItem.id && appFlag" :loading="approveLoading" @click="approveHandler(putItem)"
                 color="primary">
            {{
              putItem.approveType == '0' ? '审核' : '反审核'
            }}
          </v-btn>
          <v-btn :loading="saveLoading" v-if="!putItem.id" color="primary" @click="saveOtherPut">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        入库明细记录-->
    <v-dialog v-model="putHistoryDialog" width="98%">
      <v-card class="pa-3">
        <put-history ref="putHistoryEle"></put-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="putHistoryDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        采购合同预览-->
    <instance-detail :frame="frameId" @close="frameId=null"></instance-detail>
    <!--        提示消息-->
    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {approve, deletePut, getMaterial, list, otherPut, queryByPutId, getPutCount} from '@/api/put'
import {loadById} from '@/api/procurement'
import putPrint from './print'
import storageManager from "../storageManager"

export default {
  name: "putlist",
  components: {
    putPrint,
    storageManager,
    putDetail: () => import('@/components/15327'),
    putHistory: () => import('../../company/putHistory'),
    instanceDetail: () => import('@/components/easyflow/instance-detail'),
  },
  data: () => ({
    appFlag: false,
    hidePmNumber: false,
    option: {
      start: null,
      end: null,
      storage: null,
    },
    type: '-1',
    putStorage: {
      money: 0,
      company: null,
      project: null,
      sign: null,
      pm02620: null,
      tax: null,
      putSerial: null,
      saleMoney: null,
      moneyTax: null,
      materialList: []
    },
    searchCompany: null,
    searchText: null,
    searchPutSerial: null,
    items: [],
    headers: [
      {text: "项目名称", value: 'project.name'},
      {text: "供应单位", value: 'company.name'},
      {text: "采购单号", value: 'procurement.pmNumber', sortable: false},
      {text: "入库单号", value: 'putSerial'},
      {text: "入库时间", value: 'putDate'},
      {text: "入库人员", value: 'staff.name'},
      {text: "审核状态", value: 'approveType'},
      {text: "操作", value: 'action', sortable: false, width: '180px'},
    ],
    total: 0,
    dateMenu: {
      showMenu: false,
    },
    date: "本年",
    dateItems: ["本月", "上月", "半年", "本年", "去年", "所有"],
    dateValue: null,
    approveLoading: false,
    printItem: {
      putSerial: null,
      procurement: {pmNumber: null},
      storage: {name: null},
      company: {name: null},
      approveDate: null,
      staff: {name: null},
      remark: null,
      materialList: null,
    },
    putItem: {
      putSerial: null,
      procurement: {pmNumber: null},
      storage: {name: null},
      company: {name: null},
      approveDate: null,
      staff: {name: null},
      remark: null,
      materialList: null,
      saleMoney: '',
      pm02620: '',
      sign: null,
      money: 0,
      moneyTax: 0,
      putDate: null,
      tax: '0'
    },
    thanItem: null,
    putDetailDialog: false,
    menu: false,
    loading: false,
    saveLoading: false,
    putHistoryDialog: false,
    frameId: null,
    msg: null,
    msgFlag: false,
    prevDisabled: false,
    nextDisabled: false,
    thanIdx: null,
  }),
  watch: {
    option: {
      handler() {
        this.list()
      },
      deep: true
    },
    hidePmNumber() {
      localStorage.setItem("hidePmNumber", this.hidePmNumber)
    },
    putStorage() {
      // this.list()
      if (!this.loading) {
        this.list()
      }
    },
    putDetailDialog() {
      if (!this.putDetailDialog) {
        this.thanIdx = null
      }
    }
  },
  created() {
    if (this.$route.params.searchPutSerial) {
      this.searchPutSerial = this.$route.params.searchPutSerial
    }
    let ps = localStorage.getItem("ls")
    if (ps != null && ps != '') {
      try {
        ps = JSON.parse(ps)
        this.putStorage = ps
      } catch (e) {
        console.log(e)
      }
    }
    this.hidePmNumber = localStorage.getItem("hidePmNumber") == "true"
    if (this.$store.state.user.roles.indexOf("管理员") !== -1
        || this.$store.state.user.roles.indexOf("仓库") !== -1
        || this.$store.state.user.roles.indexOf("仓管") !== -1) {
      this.appFlag = true
    }
    this.setDate()
  },
  methods: {
    prevHandler() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.putItem._index - 1;
      if (this.thanIdx <= -1 && this.option.page <= 1) {
        this.prevDisabled = true
      } else if (this.thanIdx <= -1) {
        this.thanIdx = this.items.length - 1
        this.option.page--;
      } else {
        this.detail(null, {item: this.items[this.thanIdx]})
      }
    },
    nextHandler() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.putItem._index + 1;
      if (this.option.page >= (this.total / this.option.itemsPerPage) && this.thanIdx >= this.items.length) {
        this.nextDisabled = true
      } else if (this.thanIdx >= this.items.length) {
        this.thanIdx = 0
        this.option.page++;
      } else {
        this.detail(null, {item: this.items[this.thanIdx]})
      }
    },
    showContract(item) {
      console.log(item)
      if (item.procurement) {
        loadById(item.procurement.id).then(result => {
          if (result.contract) {
            this.frameId = result.contract.id
          } else {
            this.msg = '该采购订单没有合同'
            this.msgFlag = true
          }
        })
      } else {
        this.msg = '采购订单不存在'
        this.msgFlag = true
      }
    },
    edit(item) {
      item.edit = !item.edit
    },
    formatId(item) {
      let id = item.material.id
      let x = id.indexOf("-");
      return id.substring(0, x === -1 ? id.length : x)
    },
    refreshCountMoney() {
      if (this.$refs.putDetail) {
        this.$refs.putDetail.refreshCountMoney()
      }
    },
    detail(e, {item}) {
      item._index = this.items.indexOf(item)
      if (item.procurement == null) {
        item.procurement = {pmNumber: ''}
      }
      item.money = 0
      item.moneyTax = 0
      item.sign = null
      this.thanItem = item
      if (item.materialList) {
        this.putItem = Object.assign({}, item)
        this.refreshCountMoney()
        this.showSignState()
        this.putDetailDialog = true
      } else {
        getMaterial(item.id).then(result => {
          this.setMaterEdit(result)
          item.materialList = result
          this.putItem = Object.assign({}, item)
          this.refreshCountMoney()
          this.showSignState()
          this.putDetailDialog = true
        })
      }
    },
    setMaterEdit(data) {
      data.forEach(item => {
        item.edit = false
        if(item.project==null)
        {
          item.project = {name:'-'}
        }
      })
    },
    showSignState() {
      queryByPutId(this.putItem.id).then(result => {
        this.putItem.sign = result
      })
    },
    printHandler(item) {
      if (item.procurement == null) {
        item.procurement = {pmNumber: ''}
      }
      if (item.sign == null) {
        queryByPutId(item.id).then(result => {
          item.sign = result
        }).finally(() => {
          this.print(item)
        })
      } else {
        this.print(item)
      }
    },
    print(item) {
      if (item.materialList) {
        console.log("this.$refs.print", this.$refs.print)
        this.printItem = item
        this.$refs.print.print()
      } else {
        getMaterial(item.id).then(result => {
          this.setMaterEdit(result)
          item.materialList = result
          this.printItem = item
          console.log("this.$refs.print2", this.$refs.print)
          this.$refs.print.print()
        })
      }
    },
    approvePrintHandler(item) {
      this.approveHandler(item).then((result) => {
        this.putItem.putSerial = result.putSerial
        this.putItem.approveDate = result.approveDate
        this.printHandler(this.putItem);
      })
    },
    approveHandler(item) {
      this.approveLoading = true
      return approve(item).then(result => {
        item.approveType = result.approveType
        item.approveDate = result.approveDate
        item.putSerial = result.putSerial
        if (this.thanItem) {
          this.thanItem.materialList = item.materialList
          this.thanItem.approveDate = result.approveDate
          this.thanItem.approveType = result.approveType
          this.thanItem.putSerial = result.putSerial
        }
        return result;
      }).finally(() => {
        this.approveLoading = false
      })
    },
    deleteHandler(item) {
      if (item.procurement == null) {
        item.procurement = {pmNumber: ''}
      }
      this.confirm("确定删除:" + item.procurement.pmNumber + "?").then(() => {
        deletePut(item.id).then(this.list)
      })
    },
    dateChange2() {
      if (this.dateMenu.date) {
        this.date = this.dateMenu.date.join("到")
        this.dateItems.push(this.date)
        this.dateMenu.showMenu = false
        let sd = this.date.split("到")
        this.dateValue = {start: sd[0], end: sd[1]}
      } else {
        this.dateValue = null
      }
      this.list()
    },
    dateChange() {
      this.setDate()
      this.list()
    },
    setDate() {
      let date
      date = this.getDateByStr(this.date)
      if ((date == null || date.start == null) && this.date != null) {
        let sd = this.date.split("到")
        if (sd != null && sd.length > 1) {
          this.dateValue = {
            start: sd[0],
            end: sd[1]
          }
        } else {
          this.dateValue = null
        }
      } else {
        this.dateValue = date
      }
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.option)
      if (this.putStorage && this.putStorage.id) {
        q.storage = this.putStorage.id
      }
      if (this.dateValue) {
        q.start = this.dateValue.start
        q.end = this.dateValue.end
      }
      q.searchText = this.searchText
      q.searchCompany = this.searchCompany
      q.searchSeries = this.searchPutSerial
      q.sortBy = this.option.sortBy[0]
      q.sortDesc = this.option.sortDesc[0]
      if (this.type != '-1') {
        q.type = this.type
      }
      this.total = 10
      list(q).then(result => {
        result.rows.forEach(item => {
          if (item.procurement == null) {
            item.procurement = {pmNumber: '-'}
          }
        })
        this.items = result.rows
        if (this.thanIdx != null && this.items.length > 0) {
          if (this.thanIdx >= this.items.length) {
            this.thanIdx = this.items.length - 1
          }
          this.detail(null, {item: this.items[this.thanIdx]})
          this.thanIdx = null
        }
      }).finally(() => {
        this.loading = false
      })
      getPutCount(q).then(result => {
        this.total = result
      })
    },
    insertOtherHandler() {
      if (this.putStorage) {
        this.putItem = {
          procurement: {pmNumber: null},
          storage: this.putStorage,
          company: null,
          approveDate: null,
          staff: {name: null},
          remark: '',
          materialList: [],
          saleMoney: '',
          pm02620: '',
          sign: null,
          money: 0,
          moneyTax: 0,
          putDate: this.dateFormat(new Date(), "YYYY-mm-dd"),
          tax: '0',
          project: null,
          mixMoney: 0,
          putSerial: ''
        }
        this.putDetailDialog = true
      } else {
        this.msg = '请选择入库仓库!'
        this.msgFlag = true
      }
    },
    saveOtherPut() {
      let valid = this.$refs.putDetail.validate()
      if (valid) {
        this.saveLoading = true
        otherPut(this.putItem).then(result => {
          this.items.splice(0, 0, result)
        }).finally(() => {
          this.saveLoading = false
          this.putDetailDialog = false
        })
      }
    },

    putHistory() {
      if (this.$refs.putHistoryEle) {
        this.$refs.putHistoryEle.list()
      }
      this.putHistoryDialog = true
    }
  }
}
</script>

<style scoped>

</style>