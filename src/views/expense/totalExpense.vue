<template>
  <v-card style="margin-top: 20px">
    <v-row>
      <v-col cols="12" md="1" sm="1" style="display: flex">
        <v-btn :loading="loading" style="margin-left: 10px;" @click="exportEX">导出</v-btn>
      </v-col>
      <v-col cols="12" lg="2" md="2">
        <v-select dense
                  v-model="queryItem.searchCourse"
                  :items="courseItems"
                  item-text="name"
                  label="选择科目"
        ></v-select>
      </v-col>
      <v-col md="1" cols="12">
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
      <v-col md="1" cols="12">
        <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryItem.endDate"
                          label="请指定截止日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryItem.endDate" @change="endDateChange"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" lg="2" md="2">
        <v-combobox v-model="searchProjectItem"
                    :search-input.sync="searchProject"
                    :items="projectItems"
                    label="项目"
                    item-text="name"
                    return-object
                    dense
        ></v-combobox>
      </v-col>
      <v-col cols="12" lg="2" md="2">
        <v-autocomplete v-model="searchStaffItem"
                        label="报销人"
                        return-object
                        item-text="name"
                        :items="staffItems"
                        dense
                        :search-input.sync="searchStaff">
        </v-autocomplete>
      </v-col>
      <v-col cols="12" lg="1" md="1">
        <v-text-field
            v-model="totalEMoney"
            dense
            label="报销总金额"
            readonly
        ></v-text-field>
      </v-col>
      <v-col cols="12" lg="1" md="1">
        <v-text-field
            v-model="totalSubMoney"
            dense
            label="科目总金额"
            readonly
        ></v-text-field>
      </v-col>
      <v-spacer></v-spacer>
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
    </v-data-table>

    <instance-detail :frame="item.id" :close="close"></instance-detail>
  </v-card>
</template>
<script>
import {search} from "../../api/project";
import {list, queryAll, getByCourse, exportSubExpenseList, exportExpenseList} from "../../api/expense";
import {getStaff} from "../../api/staff";
import instanceDetail from "@/components/easyflow/instance-detail";

export default {
  name: 'totalExpense',
  components: {instanceDetail},
  data: () => ({
    item: {id: null},
    options: {},
    totalDesserts: null,
    headers: [
      {text: '序号', value: 'index'},
      {text: '项目名称', value: 'project', sortable: false, with: '20%'},
      {text: '费用', value: 'totalMoney', sortable: false},
      {text: '申请日期', value: 'applyDate', sortable: false},
      {text: '申请人', value: 'staff.name', sortable: false},
      {text: '备注', value: 'remark', sortable: false},
      // {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],
    courseItems: [],
    searchProjectItem: null,
    projectItems: [],
    searchProject: null,

    searchStaff: null,
    searchStaffItem: null,
    staffItems: [],

    menu: false,
    menu2: false,

    loading: false,

    showE: false,
    totalEMoney: null,

    showS: false,
    totalSubMoney: null,

    queryItem: {
      itemsPerPage: 10,
      page: 1,
      str: null,
      sortName: 'create_date',
      sortOrder: 'DESC',
      startDate: null,
      endDate: null,
      status: 1,
      ifMine: false,
      searchProjectName: null,
      searchCourse: null,
      ifSomeone: false,
      someone: null,
    },
  }),
  watch: {
    searchProject: {
      handler() {
        if (this.searchProject != null) {
          this.getProjectBySeek(this.searchProject)
        }
      },
      deep: true
    },
    options: {
      handler() {
        if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
          this.loadByCourse()
        } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
          this.list()
        }
      },
      deep: true
    },

    'queryItem.searchCourse': {
      handler() {
        if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
          this.loadByCourse()
        } else if (this.queryItem.searchCourse == '全部') {
          this.list()
        }
      }
    },

    'queryItem.endDate': {
      handler() {
        if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
          this.loadByCourse()
        } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
          this.list()
        }
      },
      deep: true
    },

    searchProjectItem: {
      handler() {
        if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
          this.loadByCourse()
        } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
          this.list()
        }
      },
      deep: true
    },

    searchStaff: {
      handler() {
        if (this.searchStaff != null) {
          this.getStaff()
        } else if (this.searchStaff == '') {
          this.queryItem.ifSomeone = false
          this.queryItem.someone = null
          this.searchStaffItem = null
        }
      }
    },

    searchStaffItem: {
      handler() {
        if (this.searchStaffItem != null) {
          if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
            this.loadByCourse()
          } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
            this.list()
          }
        } else {
          if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
            this.loadByCourse()
          } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
            this.list()
          }
        }
      },
      deep: true
    }

  },

  created() {

    this.queryItem.searchCourse = this.$route.query.name

    getStaff("").then(res => {
      this.staffItems = res
    })
    this.getCourse()
    this.initDate()
    // this.list()
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
    formatYearMonth(value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      return y + "-" + MM;
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
    getProjectBySeek(str) {
      search(str).then(res => {
        this.projectItems = res
      })
    },
    getCourse() {
      queryAll().then(res => {
        this.courseItems = res
        this.courseItems.unshift("全部")
      })
    },
    list() {
      this.queryItem.page = this.options.page
      this.queryItem.itemsPerPage = this.options.itemsPerPage
      if (this.searchProjectItem != null) {
        if (Object.prototype.toString.call(this.searchProjectItem) != '[object Object]') {
          this.queryItem.searchProjectName = this.searchProjectItem
        } else {
          this.queryItem.searchProjectName = this.searchProjectItem.name
        }
      }
      if (this.searchStaffItem != null) {
        this.queryItem.ifSomeone = true
        this.queryItem.someone = this.searchStaffItem.id
      }
      list(this.queryItem).then(res => {
        for (let a = 0; a < res.expenseList.length; a++) {
          res.expenseList[a].index = a + 1
        }
        this.desserts = res.expenseList
        this.totalDesserts = res.total
        this.totalEMoney = res.totalEMoney
      })
    },
    loadByCourse() {
      this.queryItem.page = this.options.page
      this.queryItem.itemsPerPage = this.options.itemsPerPage
      if (this.searchProjectItem != null) {
        if (Object.prototype.toString.call(this.searchProjectItem) != '[object Object]') {
          this.queryItem.searchProjectName = this.searchProjectItem
        } else {
          this.queryItem.searchProjectName = this.searchProjectItem.name
        }
      }
      if (this.searchStaffItem != null) {
        this.queryItem.ifSomeone = true
        this.queryItem.someone = this.searchStaffItem.id
      }
      getByCourse(this.queryItem).then(res => {
        console.log(res)
        for (let a = 0; a < res.expenseSubjectList.length; a++) {
          res.expenseSubjectList[a].index = a + 1
        }
        this.desserts = res.expenseSubjectList
        this.totalDesserts = res.total
        this.totalSubMoney = res.totalSubMoney
      })
    },

    endDateChange() {
      this.$refs.menu2.save()
    },

    getStaff() {
      getStaff(this.searchStaff).then(res => {
        this.staffItems = res
      })
    },

    exportEX() {
      this.loading = true;
      if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
        exportSubExpenseList(this.queryItem).then(result => {
          let a = document.createElement("a")
          a.download = result
          a.href = result
          a.click()
          console.log(a)
        }).finally(() => {
          this.loading = false;
        })
      } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
        exportExpenseList(this.queryItem).then(result => {
          let a = document.createElement("a")
          a.download = result
          a.href = result
          a.click()
          console.log(a)
        }).finally(() => {
          this.loading = false;
        })
      }
    },

    showDetail(e, data) {
      if (this.queryItem.searchCourse != null && this.queryItem.searchCourse != '全部') {
        this.item.id = data.item.mark
      } else if (this.queryItem.searchCourse == null || this.queryItem.searchCourse == '全部') {
        this.item.id = data.item.id
      }

    },

    close() {
      this.item = {id: null}
    },
  }
}
</script>
