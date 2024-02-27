<template>
  <v-card>
    <v-row>
      <v-col sm="4">
        <v-btn color="primary" small @click="insertPay" class="ml-1">新增付款</v-btn>
        <v-btn small @click="exportHandler" class="ml-1" :loading="loadDialog" >导出</v-btn>
        <v-switch v-model="queryItem.ifMine" label="我的单据" @click="loadAll" class="float-right" style="margin-top: 0px;"></v-switch>
      </v-col>
      <v-col md="2">
        <v-select label="审核状态" dense v-model="queryItem.approveStatus"
                  :items="approveState"></v-select>
      </v-col>
      <v-col sm="2">
        <v-select dense
                  v-model="queryItem.searchYear"
                  label="待付款年份"
                  :items="years"
                  prepend-icon="mdi-calendar">
        </v-select>
      </v-col>
      <v-col sm="2">
        <v-combobox dense
                    v-model="projectSearch"
                    label="项目选择"
                    :search-input.sync="projectSearchStr"
                    :items="projectSearchItems"
                    item-text="name"
                    return-object
        >
        </v-combobox>
      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="2">
        <v-text-field class="mt-1" dense label="搜索" @keyup.enter="list()"
                      v-model="queryItem.searchText"></v-text-field>
      </v-col>
    </v-row>

    <v-data-table
        :headers="headers"
        :items="desserts"
        :options.sync="options"
        :server-items-length="totalDesserts"
        @dblclick:row="showDetail2"
        class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn x-small color="error" @click="showDelete(item)" class="mr-1">删除</v-btn>
        <v-btn x-small @click="showDetail(item)" class="mr-1">明细</v-btn>
        <v-btn x-small @click="showEdit(item)">编辑</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="insertDialog" width="60%" :fullscreen="mobileFlag">
      <v-card>
        <insert-pay ref="insertPay"></insert-pay>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              @click="saveInsert"
          >
            提交
          </v-btn>
          <v-btn
              @click="cancelInsert"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDetailDialog" width="80%">
      <v-card>
        <pay-detail :frameId="tempId"></pay-detail>
      </v-card>

    </v-dialog>

    <v-dialog v-model="deleteDialog" width="40%">
      <v-card>
        <v-card-title class="text-h5">你确定要删除该记录</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary"
                 @click="deleteConfirm"
          >
            确定
          </v-btn>
          <v-btn @click="deleteCancel">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" width="80%">
      <v-card>
        <update-pay :frame-id="tempId" ref="editSubcontractPay"></update-pay>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              @click="saveUpdate"
          >
            提交
          </v-btn>
          <v-btn
              @click="editDialog = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--明细-->
    <instance-detail :frame="item.id" :close="close"></instance-detail>

    <!--消息框-->
    <v-snackbar v-model="showSnackbarDialog"
                :timeout="timeout"
                :centered="true"
    >
      {{ msg }}
    </v-snackbar>
    <!--加载框-->
    <v-dialog v-model="loadDialog"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在加载。。。
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import proSubcontractPay from "../../../api/proSubcontractPay";
import insertPay from "../components/insertPay";
import payDetail from "@/components/1320281"
import instanceDetail from '@/components/easyflow/instance-detail'
import updatePay from "../components/updatePay";
import {search} from "../../../api/project";


export default {
  name: 'proSubcontractPayList',
  components: {insertPay, payDetail, instanceDetail, updatePay},
  data: () => ({
    loadDialog: false,
    showAll: false,
    projectSearch: null,
    projectSearchItems: [],
    projectSearchStr: null,

    editDialog: false,

    item: {id: null},
    showDetailDialog: false,
    tempId: null,

    insertDialog: false,

    deleteDialog: false,
    tempItem: null,

    options: {},
    totalDesserts: null,

    headers: [
      {text: '序号', value: 'index'},
      // {text: '合同', value: 'contractName',sortable:false},
      // {text: '合同金额', value: 'contractMoney',sortable:false},
      {text: '项目', value: 'project.name', sortable: false},
      {text: '付款单位', value: 'companyName', sortable: false},
      {text: '付款金额', value: 'payMoney', sortable: false},
      {text: '付款事由', value: 'payInfo', sortable: false},
      {text: '初审价', value: 'earlyMoney', sortable: false},
      {text: '财务结算价', value: 'accountMoney', sortable: false},
      {text: '累计付款金额', value: 'sumPayMoney', sortable: false},
      {text: '日期', value: 'dateTime', sortable: false},
      {text: '登记人', value: 'staff.name', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    years: [],
    queryItem: {
      pageSize: 10,
      pageNumber: 1,
      searchText: null,
      sortName: 'datetime',
      sortOrder: 'DESC',
      searchYear: null,
      approveStatus: null,
      projectName: null,
      ifMine: true
    },
    approveState: [
      {text: "所有", value: null},
      {text: "已审核", value: 1},
      {text: "未审核", value: 0},
    ],

    showSnackbarDialog: false,
    msg: null,
    timeout: 2000,

    mobileFlag: false
  }),
  watch: {
    insertDialog(val) {
      val || this.cancelInsert()
    },

    deleteDialog(val) {
      val || this.deleteCancel()
    },

    options: {
      handler() {
        this.list()
      },
      deep: true
    },

    'queryItem.approveStatus': {
      handler() {
        this.list()
      },
      deep: true
    },

    'queryItem.searchYear': {
      handler() {
        this.list()
      },
      deep: true
    },

    projectSearchStr: {
      handler() {
        if (this.projectSearchStr != null) {
          this.getProjectBySeek(this.projectSearchStr)
        }
      },
      deep: true
    },

    projectSearch: {
      handler() {
        if (this.projectSearch != null) {
          this.queryItem.projectName = this.projectSearch.name
          this.list()
        }
      },
      deep: true
    },
    all:{
      handler(){
        this.queryItem.ifMine = !this.all
      }
    },
    approveStatus:{
      handler(){
        this.queryItem.approveStatus = this.approveStatus
      }
    }
  },
  created() {
    this.initYears()
    this.queryItem.ifMine = !this.all
    if (this.approveStatus) {
      this.queryItem.approveStatus = this.approveStatus
    }
  },
  mounted() {
    this.isMobile()
    console.log(this.mobileFlag)
  },
  methods: {
    isMobile() {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      if (flag != null && flag.length > 0) {
        this.mobileFlag = true
      } else {
        this.mobileFlag = false
      }
    },

    getProjectBySeek(str) {
      search(str).then(res => {
        if (res.length > 0) {
          this.projectSearchItems = res
        }
      })
    },
    loadAll() {
      // if (this.showAll == true) {
      //   this.queryItem.ifMine = false
      //   this.list()
      // } else if (this.showAll == false) {
      //   this.queryItem.ifMine = true
      //   this.list()
      // }
      this.list()
    },
    list() {
      this.loadDialog = true
      this.queryItem.pageNumber = this.options.page
      this.queryItem.pageSize = this.options.itemsPerPage
      let q = Object.assign({}, this.queryItem)
      if (q.searchYear == "所有") {
        delete q['searchYear']
      }
      proSubcontractPay.getProSubcontractPay(q).then(res => {
        res.rows.forEach((val, index) => {
          val.index = index + 1;
          val.dateTime = val.dateTime.substring(5, 10)
        });
        this.totalDesserts = res.total
        this.desserts = res.rows
        this.loadDialog = false
      })
    },

    initYears() {
      this.years = [];
      let startYear = 2015;
      let endYear = new Date().getFullYear();
      for (let i = endYear; i >= startYear; i--) {
        this.years.push(i);
      }
      this.years.push("所有")
      this.queryItem.searchYear = "所有";
    },
    exportHandler(){
      this.loadDialog = true
      this.queryItem.pageNumber = this.options.page
      this.queryItem.pageSize = this.options.itemsPerPage
      let q = Object.assign({}, this.queryItem)
      if (q.searchYear == "所有") {
        delete q['searchYear']
      }
      proSubcontractPay.exportProSubcontractPays(q).then(this.downloadFile).finally(()=>this.loadDialog = false)
    },
    insertPay() {
      this.insertDialog = true
      // this.$refs.insertPay.data().clear = true
      this.$nextTick(() => {
        this.$refs.insertPay.resetFormRules()
      })
    },

    async saveInsert() {
      if (this.$refs.insertPay.validateForm()) {
        await this.$refs.insertPay.submitPay().then(res => {
          if (res != false) {
            this.list()
          }
        })
        this.insertDialog = false
      }
    },

    cancelInsert() {
      this.insertDialog = false
      this.$refs.insertPay.resetFormRules()
      this.$refs.insertPay.reset()
    },

    showDelete(item) {
      this.tempItem = item
      this.deleteDialog = true
    },

    deleteConfirm() {
      proSubcontractPay.deleteProSubcontractPay(this.tempItem).then(res => {
        if (res == 1) {
          this.deleteDialog = false
          this.msg = '删除成功'
          this.showSnackbarDialog = true
          this.list()
          this.reset()
        }
      }).catch(e => {
        this.msg = e
        this.showSnackbarDialog = true
      })

    },

    deleteCancel() {
      this.reset()
      this.deleteDialog = false
    },

    showEdit(item) {
      this.tempId = item.id
      this.editDialog = true
      this.$nextTick(() => {
        this.$refs.editSubcontractPay.clearInit()
      })
    },

    async saveUpdate() {
      if (this.$refs.editSubcontractPay.validateForm()) {
        await this.$refs.editSubcontractPay.submitUpdate().then(res => {
          if (res != null) {
            this.editDialog = false
            this.list()
          }
        })
      }
    },

    showDetail(item) {
      this.item = item
    },

    showDetail2(e, data) {
      this.item = data.item
    },

    close() {
      this.item = {id: null}
    },

    reset() {
      this.tempItem = null
    },
  },
  props: {
    all: {
      type: Boolean,
      default: false,
    },
    approveStatus: {
      type: Number,
      default: null,
    },

  }
}
</script>
