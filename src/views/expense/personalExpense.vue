<template>
  <v-card>
    <v-row>
      <v-col cols="12" md="3" sm="2" style="display: flex">
        <v-btn color="primary" @click="add" style="margin-left: 10px">新增登记</v-btn>
      </v-col>
    </v-row>
    <v-data-table
        :headers="headers"
        :items="desserts"
        :options.sync="options"
        :server-items-length="totalDesserts"
        @dblclick:row="showDetail"
        class="elevation-1"
    >
      <template v-slot:item.applyDate="{ item }">
        <span>{{ item.applyDate | formatTimer }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn x-small v-if="item.status == 0" color="primary" @click="editExpenseHandler(item)">编辑</v-btn>
        <v-btn x-small color="error" @click="deleteExpense(item)" class="ml-1">删除</v-btn>
        <v-btn x-small @click="showDetail2(item)" class="ml-1">明细</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="addExpenseDialog" width="60%" :fullscreen="mobileFlag">
      <v-card>
        <v-btn outlined fab fixed color="error" x-small @click="addCancel" v-if="mobileFlag" right style="top:10px;right: 10px"><v-icon>mdi-close</v-icon></v-btn>
        <add ref="addExpense" :data="updateData"></add>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary"
                 v-if="!mobileFlag"
                 :block="mobileFlag"
                 :loading="loading"
                 @click="saveHandler" title="保存不发起流程,如果此单据之前已经发起审批，将撤回">
            保存
          </v-btn>
          <v-btn color="primary" :block="mobileFlag" :loading="loading" @click="addSubmit" title="保存并发起流程">提交
          </v-btn>
          <v-btn v-if="!mobileFlag" @click="addCancel">取消</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <instance-detail :frame="item.id" :close="close"></instance-detail>

    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">取消</v-btn>
          <v-btn color="blue darken-1" text @click="deleteRepairConfirm">确定
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--消息框-->
    <v-snackbar v-model="showSnackbarDialog"
                :timeout="timeout"
                :centered="true"
    >
      {{ msg }}
    </v-snackbar>
  </v-card>

</template>
<script>
import add from "./components/add.vue";
import {list, deleteById} from "../../api/expense";
import instanceDetail from "@/components/easyflow/instance-detail";

export default {
  name: 'personalExpense',
  components: {add, instanceDetail},
  data: () => ({
    expenseAdd: null,
    options: {},
    totalDesserts: null,
    headers: [
      {text: '序号', value: 'index'},
      {text: '项目名称', value: 'project', sortable: false, with: '20%'},
      {text: '费用累计', value: 'totalMoney', sortable: false},
      {text: '申请日期', value: 'applyDate', sortable: false},
      {text: '申请人', value: 'staff.name', sortable: false},
      {text: '备注', value: 'remark', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    mobileFlag: false,

    addExpenseDialog: false,
    loading: false,

    item: {id: null},

    dialogDelete: false,
    deleteItem: null,

    showSnackbarDialog: false,
    timeout: 2000,
    msg: null,

    queryItem: {
      itemsPerPage: 10,
      page: 1,
      str: null,
      sortName: 'create_date',
      sortOrder: 'DESC',
      startDate: null,
      endDate: null,
      status: 0,
      ifSomeone: false,
      someone: null,
      ifMine: true,
      searchProjectName: null,
      searchCourse: null,
    },
    startFlow: true,
    updateData: null
  }),
  watch: {
    addExpenseDialog(val) {
      val || this.addCancel()
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    add: {
      handler() {
        if (this.add != null) {
          this.addExpenseDialog = true
        }
      },
      deep: true
    }
  },
  created() {
    this.expenseAdd = this.$route.params.add
    this.list()
  },
  mounted() {
    this.isMobile()
    this.$nextTick(() => {
      if (this.expenseAdd) {
        this.add()
      }
    })
  },
  filters: {
    formatTimer: function (value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      // let h = date.getHours();
      // h = h < 10 ? "0" + h : h;
      // let m = date.getMinutes();
      // m = m < 10 ? "0" + m : m;
      // let s = date.getSeconds();
      // s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d;
    },
    formatNum: function (value) {
      if (value == null) {
        return null;
      }
      let tempVal = parseFloat(value).toFixed(3)
      let realVal = tempVal.substring(0, tempVal.length - 1)
      return realVal
    }
  },
  methods: {
    goTotal() {
      window.open(this.$router.options.base + "expense/totalExpense")
    },
    isMobile() {
      this.mobileFlag = this.$vuetify.breakpoint.xs
    },
    add() {
      this.addExpenseDialog = true
      if(this.$refs.addExpense){
        this.$refs.addExpense.reset()
        this.$refs.addExpense.resetFormRules()
      }
    },
    list() {
      this.queryItem.page = this.options.page
      this.queryItem.itemsPerPage = this.options.itemsPerPage
      list(this.queryItem).then(res => {
        for (let a = 0; a < res.expenseList.length; a++) {
          res.expenseList[a].index = a + 1
        }
        this.desserts = res.expenseList
        this.totalDesserts = res.total
      })
    },

    saveHandler() {
      this.startFlow = false
      this.addSubmit()
    },
    async addSubmit() {
      if (this.$refs.addExpense.validateForm()) {
        this.loading = true
        this.$refs.addExpense.save(this.startFlow).then(() => {
          this.list()
          this.loading = false;
          this.addExpenseDialog = false
        }).finally(() => {
          this.startFlow = true
        })
      }
    },

    addCancel() {
      this.addExpenseDialog = false
      this.$refs.addExpense.resetFormRules()
    },

    showDetail(e, data) {
      this.item = data.item
    },
    showDetail2(item) {
      this.item = item
    },
    close() {
      this.item = {id: null}
    },
    editExpenseHandler(item) {
      item.projectObj = {name:item.project,id:item.projectId}
      this.updateData = item
      this.addExpenseDialog = true
    },
    deleteExpense(item) {
      this.deleteItem = item
      this.dialogDelete = true
    },
    closeDeleteDialog() {
      this.dialogDelete = false
      this.deleteItem = null
    },
    deleteRepairConfirm() {
      if (this.deleteItem.status == 0) {
        deleteById(this.deleteItem).then(res => {
          console.log(res)
          this.list()
          this.dialogDelete = false
        })
      } else {
        this.msg = "只能删除本人未审批的报销单"
        this.showSnackbarDialog = true
      }
    }

  }
}
</script>
