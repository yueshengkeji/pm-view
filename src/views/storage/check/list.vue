<template>
  <div>
    <v-row dense>
      <v-col sm="2" cols="12">
        <v-btn small color="primary" @click="insertHandler">新增盘点单</v-btn>
        <v-btn class="ml-1" small @click="checkHistoryHandler">盘点记录</v-btn>
      </v-col>
      <v-col sm="2">
        <select-date v-model="date" @change="list"></select-date>
      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="2" cols="12">
        <v-text-field @change="list" label="搜索" dense v-model="searchText"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :items="data.rows"
                  sort-by="checkDate"
                  sort-desc
                  :footer-props="{showFirstLastPage:true}"
                  :loading="loading"
                  @dblclick:row="detailHandler"
                  :options.sync="options"
                  :headers="headers"
                  :server-items-length="data.total">

      <template v-slot:item.state="{item}">
        {{ formatApproveType(item.state) }}
      </template>
      <template v-slot:item.action="{item}">
        <v-btn :disabled="item.state == 1" x-small color="error" @click="deleteHandler(item)">删除</v-btn>
        <v-btn x-small class="ml-1" @click="detailHandler($event,{item})" :disabled="item.state == 1">修改</v-btn>
        <v-btn x-small class="ml-1" @click="approveHandler(item)">{{ item.state == 1 ? '反审核' : '审核' }}</v-btn>
        <v-btn x-small class="ml-1" @click="printHandler(item)">打印</v-btn>
      </template>

    </v-data-table>

    <v-dialog v-model="insertDialog" width="98%">
      <v-card class="pa-3">
        <check-detail ref="checkDetail" v-model="item"></check-detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="insertDialog = false">取消</v-btn>
          <v-btn v-if="item.state != 1" :loading="insertLoading" @click="saveHandler" color="primary">提交
          </v-btn>
          <v-btn v-else @click="approveHandler(item)" color="primary">反审核</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        打印-->
    <v-row align="center" justify="center"
           class="hidden"
           style="position: absolute;z-index: -1;top:0px">
      <v-col cols="12">
        <check-print :print-data="printItem" ref="print"></check-print>
      </v-col>
    </v-row>
    <!--        记录-->
    <v-dialog v-model="historyDialog" width="80%">
      <v-card class="pa-3">
        <report></report>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="historyDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {approve, deleteCheck, list, listMater} from '@/api/check'

export default {
  name: "checkList",
  components: {
    checkDetail: () => import('@/components/15309'),
    checkPrint: () => import('./print'),
    selectDate: () => import('@/components/selectDate/index'),
    report: () => import("./report")
  },
  data: () => ({
    searchText: null,
    options: {},
    headers: [
      {text: '盘点单号', value: 'checkNumber'},
      {text: '仓库名称', value: 'storage.name'},
      {text: '盘点日期', value: 'checkDate'},
      {text: '制单人', value: 'staff.name'},
      {text: '审核状态', value: 'state'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    loading: false,
    data: {
      rows: [],
      total: 0
    },
    insertDialog: false,
    item: {
      state: 0
    },
    insertLoading: false,
    printItem: {
      storage: {name: null},
      staff: {name: null},
      checkNumber: null,
      checkDate: null,
      remark: null,
      materList: []
    },
    date: null,
    historyDialog: false,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  methods: {
    checkHistoryHandler() {
      this.historyDialog = true
    },
    detailHandler(event, {item}) {
      if (item.materialList == null) {
        listMater(item.id).then(result => {
          this.$set(item, "materList", result)
          this.item = item
          this.insertDialog = true
        })
      } else {
        this.item = item
        this.insertDialog = true
      }
    },
    printHandler(item) {
      if (item.materialList == null) {
        listMater(item.id).then(result => {
          this.$set(item, "materList", result)
          this.printItem = item
          this.print()
        })
      } else {
        this.printItem = item
        this.print()
      }
    },
    print() {
      if (this.$refs.print) {
        this.$refs.print.print()
      } else {
        this.$nextTick(() => {
          this.$refs.print.print()
        })
      }
    },
    approveHandler(item) {
      this.confirm("确定" + (item.state == 0 ? '审核' : '反审核') + "单据吗?").then(() => {
        this.loading = true
        approve(item).then(() => {
          item.state = item.state == 0 ? 1 : 0
          this.list()
        }).finally(() => {
          this.loading = false
        })
      })
    },
    saveHandler() {
      this.insertLoading = true
      this.$refs.checkDetail.save().then(() => {
        this.list()
      }).finally(() => {
        this.insertLoading = false
        this.insertDialog = false
      })
    },
    insertHandler() {
      if (this.$refs.checkDetail) {
        this.$refs.checkDetail.reset()
      }
      this.insertDialog = true
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.options)
      q.searchText = this.searchText
      if(q.sortDesc){
        q.sortDesc = q.sortDesc[0]
      }
      if(q.sortBy){
        q.sortBy = q.sortBy[0]
      }

      if (this.date) {
        q.startDate = this.date.start
        q.endDate = this.date.end
      }
      list(q).then(result => {
        this.data = result
      }).finally(() => this.loading = false)
    },
    deleteHandler(item) {
      this.confirm(`确定删除${item.checkNumber}吗？`).then(() => {
        this.loading = true
        deleteCheck(item.id).then(this.list).finally(() => this.loading = false)
      })
    }
  }
}
</script>

<style scoped>

</style>