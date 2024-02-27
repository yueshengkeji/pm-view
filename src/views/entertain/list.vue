<template>
  <div>
    <v-row>
      <v-col cols="12" md="3" sm="2" style="display: flex">
        <v-btn color="primary" style="margin-left: 10px" @click="insertEntertain">招待申请</v-btn>
      </v-col>
      <v-col md="2" cols="12">
        <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryItem.startDate"
                          label="请指定开始日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryItem.startDate" @change="$refs.menu.save()"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col md="2" cols="12">
        <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryItem.endDate"
                          label="请指定截止日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryItem.endDate" @change="$refs.menu2.save()"></v-date-picker>
        </v-menu>
      </v-col>
      <v-spacer></v-spacer>
      <v-col
          cols="12"
          md="4"
          sm="2"

      >
        <v-text-field
            v-model="queryItem.str"
            append-icon="mdi-magnify"
            label="搜索"
            single-line
            hide-details
            style="margin-top: -14px"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
        :headers="headers"
        :items="desserts"
        :options.sync="options"
        :server-items-length="totalDesserts"
        class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">

        <v-icon
            small
            @click="updateEntertainItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
            small
            @click="deleteEntertain(item)"
        >
          mdi-delete
        </v-icon>
        <v-btn x-small color="primary" @click="showDetail(item)">明细</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="addEntertainDialog" width="80%" :fullscreen="mobileFlag">
      <v-card class="pa-3">
        <add ref="addEntertain"></add>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :loading="loading" @click="addSubmit">提交</v-btn>
          <v-btn @click="addCancel">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="updateEntertainDialog" width="80%" :fullscreen="mobileFlag">
      <v-card>
        <update ref="updateEntertain" :entertain-item="updateItem"></update>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :loading="loading" @click="updateSubmit">提交</v-btn>
          <v-btn @click="updateCancel">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteEntertainDialog" max-width="500px">
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

    <!--明细-->
    <instance-detail :frame="item.id" :close="close"></instance-detail>

    <!--消息框-->
    <v-snackbar v-model="showSnackbarDialog"
                :timeout="timeout"
                :centered="true"
    >
      {{ msg }}
    </v-snackbar>
  </div>
</template>
<script>
import {list, deleteItem} from "../../api/entertain";
import add from "./components/add";
import update from "./components/update";
import instanceDetail from '@/components/easyflow/instance-detail'

export default {
  name: 'entertainList',
  components: {add, update, instanceDetail},
  data: () => ({
    options: {},
    totalDesserts: null,
    headers: [
      {text: '宴请对象', value: 'entertainObject', sortable: false, with: '20%'},
      {text: '接待部门', value: 'section.name', sortable: false},
      {text: '宴请人数', value: 'entertainNumber', sortable: false},
      {text: '陪同人数', value: 'accompanyingNumber', sortable: false},
      {text: '招待事由', value: 'entertainReason', sortable: false},
      {text: '负责人', value: 'staff.name', sortable: false},
      {text: '备注', value: 'remark', sortable: false},
      {text: '招待时间', value: 'entertainTime', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    menu: false,
    menu2: false,

    addEntertainDialog: false,
    mobileFlag: false,
    loading: false,

    updateEntertainDialog: false,
    updateItem: null,

    deleteEntertainDialog: false,
    deleteItem: null,

    showSnackbarDialog: false,
    timeout: 2000,
    msg: null,

    item: {id: null},

    queryItem: {
      itemsPerPage: 10,
      page: 1,
      str: null,
      sortName: 'createTime',
      sortOrder: 'DESC',
      startDate: null,
      endDate: null,
      ifMine: false,
      ifSomeone: false,
      someone: null,
    },
  }),

  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true,
    },

    'queryItem.str': {
      handler() {
        this.list()
      },
      deep: true,
    },

    'queryItem.endDate': {
      handler() {
        this.list()
      },
      deep: true,
    }
  },

  created() {
    this.initDate()
  },

  mounted() {
    this.isMobile()
    this.addEntertainDialog = this.$route.params.add
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
    initDate() {
      var date = this.formatYearMonth(new Date())
      var YYYY = date.substr(0, 4)
      var MM = date.substr(5, 2)
      this.queryItem.startDate = YYYY + '-' + MM + '-' + '01'
      this.queryItem.endDate = YYYY + '-' + MM + '-' + this.getDaysInMonth(MM, YYYY)
    },
    getDaysInMonth(month, year) {
      var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month == '02' || month == 2) {
        year = parseInt(year);
        daysInMonth[1] = (((0 == year % 4) && (0 != (year % 100))) ||
            (0 == year % 400)) ? 29 : 28;
      }
      var flag = month.substr(0, 1);
      if (flag == 0) {
        month = month.substr(1, 1);
      }
      return daysInMonth[month - 1];
    },
    formatYearMonth(value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      return y + "-" + MM;
    },
    list() {
      this.queryItem.itemsPerPage = this.options.itemsPerPage
      this.queryItem.page = this.options.page

      list(this.queryItem).then(res => {
        for (let a = 0; a < res.list.length; a++) {
          res.list[a].entertainTime = res.list[a].entertainTime.substring(0, 10)
        }
        this.totalDesserts = res.total
        this.desserts = res.list
      })
    },
    async addSubmit() {
      if (this.$refs.addEntertain.validateForm()) {
        this.loading = true
        await this.$refs.addEntertain.insertEntertain().then(res => {
          if (res != null) {
            this.list()
          }
        }).finally(() => {
          this.loading = false;
        })
        this.addEntertainDialog = false
      }
    },
    addCancel() {
      this.addEntertainDialog = false
      this.$refs.addEntertain.resetFormRules()
      this.$refs.addEntertain.reset()
    },
    insertEntertain() {
      this.addEntertainDialog = true
      this.$nextTick(() => {
        this.$refs.addEntertain.resetFormRules()
      })
    },
    updateEntertainItem(item) {
      this.updateEntertainDialog = true
      this.$nextTick(() => {
        this.$refs.updateEntertain.resetData()
        this.updateItem = item
      })
    },

    async updateSubmit() {
      if (this.$refs.updateEntertain.validateForm()) {
        this.loading = true
        await this.$refs.updateEntertain.update().then(res => {
          if (res != null) {
            this.list()
          }
        }).finally(() => {
          this.loading = false;
        })
        this.updateEntertainDialog = false
      }
    },

    updateCancel() {
      this.updateEntertainDialog = false
      this.$refs.updateEntertain.resetFormRules()
      this.$refs.updateEntertain.resetData()
    },

    deleteEntertain(item) {
      this.deleteEntertainDialog = true
      this.deleteItem = item
    },

    closeDeleteDialog() {
      this.deleteEntertainDialog = false
      this.deleteItem = null
    },

    deleteRepairConfirm() {
      if (this.deleteItem.state != 1) {
        deleteItem({id: this.deleteItem.id}).then(res => {
          if (res == 1) {
            this.list()
            this.msg = "删除成功"
            this.showSnackbarDialog = true
            this.deleteEntertainDialog = false
          }
        })
      } else {
        this.msg = "已审核的记录无法删除"
        this.showSnackbarDialog = true
      }
    },

    showDetail(item) {
      console.log(item)
      this.item = item
    },

    close() {
      this.item = {id: null}
    },
  }
}
</script>
