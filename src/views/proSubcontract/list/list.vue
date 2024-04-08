<template>
  <v-card>
    <v-row>
      <v-col md="4" sm="2" style="display: flex">
        <v-btn color="primary" small @click="insertSubcontract" style="margin-left: 10px">新增登记</v-btn>
        <v-switch v-model="showAll" label="所有" @click="loadAll" class="ml-1" style="margin-top: 0px;width: 104px"></v-switch>
      </v-col>
      <v-col lg="1" md="2">
        <v-select label="审核状态" dense v-model="queryItem.approveStatus"
                  :items="approveState"></v-select>
      </v-col>
      <v-col lg="2">
        <v-select dense
                  v-model="queryItem.searchYear"
                  label="付款年份"
                  :items="years"
                  prepend-icon="mdi-calendar">
        </v-select>
      </v-col>

      <v-spacer></v-spacer>
      <v-col lg="2" offset-lg="1">
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
        <v-btn class="mr-1" x-small color="error" @click="showDelete(item)">删除</v-btn>
        <v-btn class="mr-1" x-small @click="showDetail(item)">明细</v-btn>
        <v-btn x-small @click="showEdit(item)">编辑</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="insertDialog" width="60%" :fullscreen="mobileFlag">
      <v-card>
        <insert-subcontract ref="insertSubcontract" :off-project="offProject" :project="project" :type="type" :flow-name="flowName"></insert-subcontract>
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
        <update-subcontract :frame-id="tempId" ref="editSubcontract"></update-subcontract>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              @click="saveUpdate"
          >
            提交
          </v-btn>
          <v-btn
              @click="cancelEdit"
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
import proSubcontract from "../../../api/proSubcontract";
import instanceDetail from '@/components/easyflow/instance-detail'
import insertSubcontract from "../components/insertSubcontract";
import updateSubcontract from "../components/updateSubcontract";

export default {
  name: 'proSubcontractList',
  components: {insertSubcontract, instanceDetail, updateSubcontract},
  data: () => ({
    showAll: false,
    loadDialog: false,

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
      {text: '合同', value: 'name', sortable: false},
      {text: '合同金额', value: 'money', sortable: false},
      {text: '项目', value: 'project.name', sortable: false},
      {text: '甲方', value: 'partyA.name', sortable: false},
      {text: '乙方', value: 'partyB.name', sortable: false},
      {text: '备注', value: 'remark', sortable: false},
      {text: '签订日期', value: 'signDate', sortable: false},
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
      ifMine: true,
    },
    approveState: [
      {text: "所有", value: null},
      {text: "已审核", value: 1},
      {text: "未审核", value: 0},
    ],

    showSnackbarDialog: false,
    msg: null,
    timeout: 2000,

    mobileFlag: false,
  }),
  watch: {
    insertDialog(val) {
      val || this.cancelInsert()
    },

    deleteDialog(val) {
      val || this.deleteCancel()
    },

    editDialog(val) {
      val || this.cancelEdit()
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

  },
  created() {
    this.initYears()
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
    loadAll() {
      if (this.showAll == true) {
        this.queryItem.ifMine = false
        this.list()
      } else if (this.showAll == false) {
        this.queryItem.ifMine = true
        this.list()
      }
    },

    list() {
      this.queryItem.pageNumber = this.options.page
      this.queryItem.pageSize = this.options.itemsPerPage
      this.queryItem.type = this.type
      let q = Object.assign({},this.queryItem)
      if(q.searchYear == "所有"){
        delete q['searchYear']
      }
      this.loadDialog = true
      proSubcontract.getSubcontract(q).then(res => {
        res.rows.forEach((val, index) => {
          val.index = index + 1;
          // val.dateTime = val.dateTime.substring(5,10)
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

    insertSubcontract() {
      this.insertDialog = true
      this.$nextTick(() => {
        this.$refs.insertSubcontract.resetFormRules()
      })
    },

    async saveInsert() {
      if (this.$refs.insertSubcontract.validateForm()) {
        await this.$refs.insertSubcontract.submitContract().then(() => {
          this.list()
        })
        this.insertDialog = false
      }
    },

    cancelInsert() {
      this.insertDialog = false
      this.$refs.insertSubcontract.resetFormRules()
      this.$refs.insertSubcontract.reset()
    },

    showDelete(item) {
      this.tempItem = item
      this.deleteDialog = true
    },

    deleteConfirm() {
      proSubcontract.deleteSubcontract(this.tempItem).then(res => {
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
        this.$refs.editSubcontract.clearInit()
      })
    },

    cancelEdit() {
      this.editDialog = false
      this.$refs.editSubcontract.resetFormRules()
      // this.$refs.editSubcontract.reset()
    },

    async saveUpdate() {
      if (this.$refs.editSubcontract.validateForm()) {
        await this.$refs.editSubcontract.submitUpdate().then(res => {
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
    type: {
      type:Number,
      default:0
    },
    flowName: {
      type:String,
      default:null
    },
    project: {
      type:String,
      default:null
    },
    offProject:{
      type:Boolean,
      default:false
    }
  }
}
</script>
