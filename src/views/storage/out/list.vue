<template>
  <!--    入库单管理-->
  <div>
    <!--        工具栏-->
    <v-row dense>
      <v-col sm="3">
        <v-btn small color="primary" @click="insertHandler">领料出库</v-btn>
        <v-btn title="统计已审核的出库单数据" class="ml-1" small @click="outReportDialog = true">
          <v-icon small>mdi-arrow-down</v-icon>
          出库明细记录
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
            <storage-manager @change="storageChange" v-model="outStorage" dense></storage-manager>
          </v-col>
        </v-row>
      </v-col>

      <v-spacer></v-spacer>
      <v-col sm="2">
        <v-text-field dense label="全局搜索" @keyup.enter="searchTextChangeHandler" v-model="searchText"></v-text-field>
      </v-col>
    </v-row>
    <!--        入库单数据列表-->
    <v-data-table :options.sync="option"
                  :loading="loading"
                  :footer-props="{showFirstLastPage:true}"
                  :server-items-length="total"
                  @dblclick:row="detail"
                  :items="items"
                  :headers="headers">

      <template v-slot:item.state="{item}">
        {{ formatApproveType(item.state) }}
      </template>

      <template v-slot:item.action="{item}">
        <v-btn x-small color="error"
               :loading="deleteLoading"
               @click="deleteHandler(item)"
               v-if="item.state == 0">删除
        </v-btn>
        <v-btn class="ml-1"
               v-if="appFlag"
               x-small
               color="primary"
               :loading="approveLoading"
               @click="approveHandler(item)">{{ item.state == 0 ? '审核' : '反审核' }}
        </v-btn>
        <v-btn class="ml-1" x-small @click="printHandler(item)">打印</v-btn>
      </template>

    </v-data-table>
    <v-dialog v-model="detailDialog" width="98%">
      <v-card class="pa-3">
        <div style="position: absolute;right: 0px;top:0px;">
          <v-btn @click="prevHandler" icon small :disabled="prevDisabled">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn @click="nextHandler" icon small :disabled="nextDisabled">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn small @click="detailDialog = false" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <out-detail :storage="outStorage" :out-data="detailItem" @success="successHandler"
                    ref="outDetail"></out-detail>
      </v-card>
    </v-dialog>

    <!--        打印-->
    <v-row align="center" justify="center" class="hidden" style="position: absolute;z-index: -1;top:-999px">
      <v-col cols="12">
        <outPrint :print-data="printItem" ref="print"></outPrint>
      </v-col>
    </v-row>

    <!--        消息提示-->
    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>

    <!--        出库报表-->
    <v-dialog v-model="outReportDialog" width="98%">
      <v-card class="pa-3">
        <out-report></out-report>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {approve, deleteOut, list, outMaterList, outCount} from '@/api/outMater'
import storageManager from "../storageManager"
import outPrint from './print'

export default {
  name: "outList",
  components: {
    storageManager, outPrint,
    outDetail: () => import('@/components/15313'), outReport: () => import('../../outmaterial/report')
  },
  data: () => ({
    appFlag: false,
    option: {
      start: null,
      end: null,
      storage: null,
    },
    type: '-1',
    searchText: null,
    items: [],
    headers: [
      {text: "项目名称", value: 'project.name'},
      {text: "领料单号", value: 'outNumber'},
      {text: "领料日期", value: 'outDate'},
      {text: "领料人", value: 'outPerson.name'},
      {text: "领料单位", value: 'company.name'},
      {text: "审核状态", value: 'state'},
      {text: "操作", value: 'action', sortable: false, width: '180px'},
    ],
    total: 0,
    dateMenu: {
      showMenu: false,
    },
    date: "本年",
    dateItems: ["本月", "上月", "半年", "本年","去年","所有"],
    dateValue: null,
    approveLoading: false,
    menu: false,
    loading: false,
    msg: null,
    msgFlag: false,
    outStorage: null,
    printItem: {
      state: '0',
      project: {id: null, name: null},
      outPerson: {
        name: null,
        section: {name: null}
      },
      company: {name: null},
      tax: '',
      outNumber: '',
      remark: '',
      materOuts: [],
      outDate: null,
      storage: {
        name: null
      },
    },
    prevStorageHistory: null,
    detailItem: null,
    detailDialog: false,
    deleteLoading: false,
    outReportDialog: false,
    prevDisabled: false,
    nextDisabled: false,
    thanIdx: null
  }),
  watch: {
    option: {
      handler() {
        this.list()
      },
      deep: true
    },
    detailItem: {
      handler() {
        console.log("detailItem handler", this.detailItem)
      },
      deep: true
    },
    detailDialog() {
      if (!this.detailDialog) {
        this.thanIdx = null
      }
    }
  },
  created() {
    this.dateChange(null, false)
    let ps = localStorage.getItem("ls")
    if (ps != null && ps != '') {
      try {
        ps = JSON.parse(ps)
        this.outStorage = ps
      } catch (e) {
        console.log(e)
      }
    }
    if (this.$store.state.user.roles.indexOf("管理员") !== -1
        || this.$store.state.user.roles.indexOf("仓库") !== -1
        || this.$store.state.user.roles.indexOf("仓管") !== -1) {
      this.appFlag = true
    }
  },
  methods: {
    prevHandler() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.detailItem._index - 1;
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
      this.thanIdx = this.detailItem._index + 1;
      if (this.option.page >= (this.total / this.option.itemsPerPage) && this.thanIdx >= this.items.length) {
        this.nextDisabled = true
      } else if (this.thanIdx >= this.items.length) {
        this.thanIdx = 0
        this.option.page++;
      } else {
        this.detail(null, {item: this.items[this.thanIdx]})
      }
    },
    searchTextChangeHandler() {
      this.list()
    },
    successHandler() {
      this.list()
      this.detailDialog = false
    },
    insertHandler() {
      if (this.$refs.outDetail) {
        this.$refs.outDetail.reset()
        this.detailItem = {
          state: '0',
          project: {id: null, name: null},
          outPerson: {
            name: null,
            section: {name: null}
          },
          company: null,
          tax: '',
          outNumber: '',
          remark: '',
          materOuts: [],
          outDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        }
        this.$refs.outDetail.recentlyOut()
      } else {
        this.detailItem = {
          state: '0',
          project: {id: null, name: null},
          outPerson: {
            name: null,
            section: {name: null}
          },
          company: null,
          tax: '',
          outNumber: '',
          remark: '',
          materOuts: [],
          outDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        }
      }

      this.detailDialog = true
    },
    storageChange(data) {
      if (data.id != this.prevStorageHistory) {
        this.list()
      }
    },
    printHandler(item) {
      if (item.materOuts) {
        this.printItem = item
        this.$refs.print.loadSignPrint(item.materOuts)
      } else {
        outMaterList(item.id).then(result => {
          item.materOuts = result
          this.printItem = item
          this.$refs.print.loadSignPrint(item.materOuts)
        })
      }
    },
    deleteHandler(item) {
      this.confirm("确定删除出库单" + item.outNumber + "？").then(() => {
        this.deleteLoading = true
        deleteOut(item.id).then(() => {
          this.list()
        }).finally(() => {
          this.deleteLoading = false
        })
      })
    },
    approveHandler(item) {
      this.approveLoading = true
      approve(item).then(result => {
        item.outNumber = result.outNumber
        item.approveDate = result.approveDate
        item.state = result.state
        return result
      }).finally(() => this.approveLoading = false)
    },
    detail(e, {item}) {
      if (this.$refs.outDetail) {
        this.$refs.outDetail.reset()
      }
      item._index = this.items.indexOf(item)
      if (item.materOuts) {
        this.detailItem = item
        this.detailDialog = true
      } else {
        outMaterList(item.id).then(result => {
          item.materOuts = result
          this.detailItem = item
          this.detailDialog = true
        })
      }
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
    dateChange(event, noLoad) {
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
      if (noLoad == null) {
        this.list()
      }
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.option)
      if (this.outStorage && this.outStorage.id) {
        q.storage = this.outStorage.id
      }
      this.prevStorageHistory = q.storage
      if (this.dateValue) {
        q.start = this.dateValue.start
        q.end = this.dateValue.end
      }
      q.searchText = this.searchText
      q.sortBy = this.option.sortBy[0]
      q.sortDesc = this.option.sortDesc[0]
      if (this.type != '-1') {
        q.type = this.type
      }
      this.total = 10
      list(q).then(result => {
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
      outCount(q).then(result => {
        this.total = result
      })
    }
  }
}
</script>

<style scoped>

</style>