<template>
  <div>
    <v-row dense>
      <v-col sm="2">
        <v-btn color="primary" @click="insertHandler()" small>
          新增退料
        </v-btn>
        <v-btn title="统计已审核的退库单数据" class="ml-1" small @click="backReportDialog = true">
          <v-icon small>mdi-arrow-down</v-icon>
          退库明细记录
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-select hide-details
                  @focus="dateMenu.showMenu = false"
                  v-model="date"
                  @change="dateChange($event)"
                  dense
                  label="日期范围筛选"
                  :items="dateItems"
                  class="float-right mr-1"
                  style="width:240px">

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
      <v-col sm="2" cols="12">
        <v-text-field dense label="搜索" v-model="searchText" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-data-table :items="data.rows"
                      :footer-props="{showFirstLastPage:true}"
                      sort-desc
                      sort-by="backDate"
                      :loading="loading"
                      @dblclick:row="detailHandler"
                      :headers="headers"
                      :options.sync="options"
                      :server-items-length="data.total">
          <template v-slot:item.approveState="{item}">
            {{ item.approveState == 0 ? '未审核' : '已审核' }}
          </template>
          <template v-slot:item.action="{item}">
            <v-btn class="mr-1" :disabled="item.approveState == 1" x-small color="error"
                   @click="deleteHandler(item)">
              删除
            </v-btn>
            <v-btn v-if="item.approveState == 1" x-small @click="approveHandler(item)">反审核</v-btn>
            <v-btn v-else x-small @click="approveHandler(item)">审核</v-btn>
            <v-btn class="ml-1" :disabled="item.approveState == 1" x-small
                   @click="detailHandler($event,{item})">修改
            </v-btn>
            <v-btn @click="printHandler(item)" class="ml-1" :disabled="item.approveState == 0" x-small>打印
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="outMaterDialog" width="98%">
      <v-card class="pa-3">
        <div style="position: absolute;right: 0px;top:0px;">
          <v-btn @click="prevHandler" icon small :disabled="prevDisabled">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn @click="nextHandler" icon small :disabled="nextDisabled">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn small @click="outMaterDialog = false" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <insert-back-mater v-model="item" ref="backMaterCom"></insert-back-mater>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="outMaterDialog = false" :loading="saveLoading">关闭</v-btn>
          <v-btn v-if="item.approveState == 0" color="primary" @click="save" :loading="saveLoading">提交</v-btn>
          <v-btn v-else-if="item.approveState == 1" color="primary" @click="approveHandler(item)"
                 :loading="saveLoading">反审核
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        打印-->
    <v-row align="center" justify="center"
           class="hidden"
           style="position: absolute;z-index: -1;top:0px">
      <v-col cols="12">
        <backPrint :print-data="printItem" ref="print"></backPrint>
      </v-col>
    </v-row>

    <!--        退库报表-->
    <v-dialog v-model="backReportDialog" width="98%">
      <v-card class="pa-3">
        <back-report></back-report>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {approve, deleteBackMater, list, materList} from '@/api/backMater'
import insertBackMater from '@/components/15321'

export default {
  name: "backList",
  components: {
    insertBackMater,
    backPrint: () => import('./print'),
    backReport: () => import('./report'),
  },
  data: () => ({
    options: {},
    headers: [
      {text: '退料单号', value: 'backNumber'},
      {text: '项目名称', value: 'project.name'},
      {text: '退回仓库', value: 'storage.name'},
      {text: '退回时间', value: 'backDate'},
      {text: '制单人', value: 'staff.name'},
      {text: '退料人', value: 'backStaff.name'},
      {text: '审核状态', value: 'approveState'},
      {text: '操作', value: 'action'},
    ],
    data: {
      rows: [],
      total: 0
    },
    loading: false,
    searchText: null,
    outMaterDialog: false,
    saveLoading: false,
    item: {
      approveState: 0
    },
    printItem: {
      project: {name: null},
      company: {name: null},
      backStaff: {name: null},
      section: {name: null},
      backDate: null,
      backNumber: '',
      remark: '',
      storage: {name: null},
      maters: [],
      out: {id: ''},
      approveState: 0
    },
    backReportDialog: false,

    dateMenu: {
      showMenu: false,
    },
    date: "本年",
    dateValue: null,
    dateItems: ["本月", "上月", "半年", "本年", "去年", "所有"],

    prevDisabled: false,
    nextDisabled: false,
    thanIdx: null,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    outMaterDialog(){
      if(!this.outMaterDialog){
        this.thanIdx = null
      }
    }
  },
  methods: {
    prevHandler() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.item._index - 1;
      if (this.thanIdx <= -1 && this.options.page <= 1) {
        this.prevDisabled = true
      } else if (this.thanIdx <= -1) {
        if((this.options.page - 1) === 0){
          this.prevDisabled = true
          return
        }
        this.thanIdx = this.data.rows.length - 1
        this.options.page--;
      } else {
        this.detailHandler(null, {item: this.data.rows[this.thanIdx]})
      }
    },
    nextHandler() {
      this.prevDisabled = false
      this.nextDisabled = false
      this.thanIdx = this.item._index + 1;
      if (this.options.page >= (this.data.total / this.options.itemsPerPage) && this.thanIdx >= this.data.rows.length) {
        this.nextDisabled = true
      } else if (this.thanIdx >= this.data.rows.length) {
        this.thanIdx = 0
        this.options.page++;
      } else {
        this.detailHandler(null, {item: this.data.rows[this.thanIdx]})
      }
    },
    printHandler(item) {
      if (item.maters == null) {
        materList(item.id).then(result => {
          this.$set(item, 'maters', result)
          this.printItem = item
          this.$refs.print.print()
        })
      } else {
        this.printItem = item
        this.$refs.print.print()
      }
    },
    detailHandler(event, {item}) {
      if (item != null) {
        item._index = this.data.rows.indexOf(item)
        if (item.maters == null) {
          materList(item.id).then(result => {
            this.$set(item, 'maters', result)
            this.item = item
            this.outMaterDialog = true
          })
        } else {
          this.item = item
          this.outMaterDialog = true
        }
      }
    },
    approveHandler(item) {
      this.confirm("确定" + (item.approveState == 0 ? '审核' : '反审核') + item.backNumber + "退库单吗？").then(() => {
        approve(item.id, item.approveState).then((result) => {
          if (item.id == result) {
            item.approveState = item.approveState == 0 ? 1 : 0
          }
          this.list()
        })
      })
    },
    deleteHandler(item) {
      this.confirm("确定删除：" + item.backNumber + "退库单吗？").then(() => {
        deleteBackMater(item.id).then(this.list)
      })
    },
    insertHandler() {
      if (this.$refs.backMaterCom) {
        this.$refs.backMaterCom.reset()
      }
      this.outMaterDialog = true
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.options)
      if (this.dateValue) {
        q.start = this.dateValue.start
        q.end = this.dateValue.end
      }
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0]
      q.str = this.searchText
      list(q).then(result => {
        this.data = result
        if (this.thanIdx != null && this.data.rows.length > 0) {
          if (this.thanIdx >= this.data.rows.length) {
            this.thanIdx = this.data.rows.length - 1
          }
          this.detailHandler(null, {item: this.data.rows[this.thanIdx]})
          this.thanIdx = null
        }
      }).finally(() => this.loading = false)
    },
    save() {
      this.saveLoading = true
      this.$refs.backMaterCom.save().then(() => {
        this.list()
        this.outMaterDialog = false
      }).finally(() => {
        this.saveLoading = false
      })
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
  }
}
</script>

<style scoped>

</style>
