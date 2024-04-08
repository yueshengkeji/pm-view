<template>
  <v-card>
    <v-card-title>
      <v-row dense>
        <v-col cols="1">
          <v-btn small outlined :loading="loading" @click="exportOvertime">导出</v-btn>
        </v-col>
        <v-col cols="12" sm="2">
          <v-menu
              ref="menu1"
              v-model="menu1"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  dense
                  v-model="dateStart"
                  label="开始日期"
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  v-on="on"

              ></v-text-field>
            </template>
            <v-date-picker
                v-model="dateStart"
                no-title
                scrollable
                @change="dateStartChanged"
            >
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="11" sm="2">
          <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :return-value.sync="dateEnd"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  dense
                  v-model="dateEnd"
                  label="结束日期"
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-model="dateEnd"
                no-title
                scrollable
                @change="dateEndChanged"
            >
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="12" sm="2">
          <v-text-field
              dense
              v-model="queryOvertime.searchText"
              append-icon="mdi-magnify"
              label="搜索"
              single-line
              hide-details
          ></v-text-field>
        </v-col>
      </v-row>

    </v-card-title>
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
          <v-btn color="blue darken-1" text @click="deleteItemConfirm">确定</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
        :headers="headers"
        :items="desserts"
        :options.sync="options"
        :server-items-length="totalDesserts"
        :loading="loading"
        loading-text="Loading... Please wait"
        class="elevation-1"
    >
      <template v-slot:item.actions="{item}">
        <v-icon
            small
            @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>

      </template>
    </v-data-table>
  </v-card>
</template>

<script>

import workOvertimeApi from '@/api/workOvertime';

export default {
  name: "workOvertimeForm",
  data: () => ({
    menu5Flag: true,
    loading: false,
    options: {},
    totalDesserts: null,

    search: null,
    dateStart: null,
    dateEnd: null,
    menu1: false,
    menu2: false,
    menu3: false,
    menu4: false,
    menu5: false,
    menu6: false,

    headers: [
      {text: '序号', value: 'index'},
      {text: '单据名称', value: 'name', sortable: false},
      {text: '加班人', value: 'staff.name', sortable: false},
      {text: '时长', value: 'hour', sortable: false},
      {text: '加班日期', value: 'overtime', sortable: false},
      {text: '开始', value: 'begin', sortable: false,},
      {text: '截止', value: 'end', sortable: false},
      {text: '事由', value: 'remark', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    dialogNew: false,
    dialogDelete: false,
    editedItem: {
      staff: null,
      name: null,
      overtime: null,
      begin: null,
      overtimeEnd: null,
      end: null,
      hour: null,
      remark: null,
    },
    defaultItem: {
      staff: null,
      name: null,
      overtime: null,
      begin: null,
      overtimeEnd: null,
      end: null,
      hour: null,
      remark: null,
    },

    minDate: null,
    minEnd: null,

    queryOvertime: {
      pageSize: 10,
      pageNumber: 1,
      searchText: null,
      sortName: 'overtime',
      sortOrder: 'DESC',
      staffId: null,
      begin: null,
      end: null,
      approve: '1',
    },
    mobileFlag: false
  }),

  created() {
    this.isMobile()
    this.getDefault()

    this.$nextTick(() => {
      this.dialogNew = true
    })
  },

  watch: {
    dialogNew(val) {
      val || this.closeInsert()
    },
    options: {
      handler() {
        this.loadOvertime()
      },
      deep: true
    },
    'queryOvertime.searchText': {
      handler() {
        this.searchOvertimes()
      },
      deep: true
    },
    'editedItem.overtime': {
      handler() {
        if (this.editedItem.overtime != null && this.editedItem.begin != null && this.editedItem.end != null && this.editedItem.hour != null) {
          this.editedItem.staff = this.$store.state.user
          if (this.editedItem.name == null || this.editedItem.name == '') {
            this.editedItem.name = this.editedItem.staff.name + '-' + this.editedItem.overtime + '-' + '加班申请'
          }
        }
      },
      deep: true
    },
    'editedItem.begin': {
      handler() {
        if (this.editedItem.begin != null) {
          this.menu5Flag = false
          // this.minEnd = this.editedItem.begin
        }
        if (this.editedItem.overtime != null && this.editedItem.begin != null && this.editedItem.end != null && this.editedItem.hour != null) {
          this.editedItem.staff = this.$store.state.user
          if (this.editedItem.name == null || this.editedItem.name == '') {
            this.editedItem.name = this.editedItem.staff.name + '-' + this.editedItem.overtime + '-' + '加班申请'
          }
        }
      },
      deep: true
    },
    'editedItem.end': {
      handler: function () {
        if (this.editedItem.begin != null && this.editedItem.end != null) {
          let start = this.editedItem.overtime + "T" + this.editedItem.begin + ":00"
          let end = this.editedItem.overtimeEnd + "T" + this.editedItem.end + ":00"
          let hour = this.difference(start, end)
          this.editedItem.hour = hour
          // this.editedItem.hour = this.getHour(this.editedItem.begin, this.editedItem.end)
        }
        if (this.editedItem.overtime != null && this.editedItem.begin != null && this.editedItem.end != null && this.editedItem.hour != null) {
          this.editedItem.staff = this.$store.state.user
          if (this.editedItem.name == null || this.editedItem.name == '') {
            this.editedItem.name = this.editedItem.staff.name + '-' + this.editedItem.overtime + '-' + '加班申请'
          }
        }
      },
      deep: true
    },
    'editedItem.hour': {
      handler() {
        if (this.editedItem.overtime != null && this.editedItem.begin != null && this.editedItem.end != null && this.editedItem.hour != null) {
          this.editedItem.staff = this.$store.state.user
          if (this.editedItem.name == null || this.editedItem.name == '') {
            this.editedItem.name = this.editedItem.staff.name + '-' + this.editedItem.overtime + '-' + '加班申请'
          }
        }
      },
      deep: true
    },
  },
  methods: {
    difference(startTime, endTime) {
      var dateBegin = Date.parse(startTime);
      var dateEnd = Date.parse(endTime);

      var dateDiff = parseInt(dateEnd) - parseInt(dateBegin); //时间差的毫秒数
      var hours = (dateDiff / (3600 * 1000)).toFixed(2); //计算出小时数
      return hours
    },
    isMobile() {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      if (flag != null && flag.length > 0) {
        this.mobileFlag = true
      } else {
        this.mobileFlag = false
      }
    },
    getDefault() {
      var date = this.formatYearMonth(new Date())
      var YYYY = date.substr(0, 4)
      var MM = date.substr(5, 2)
      this.dateStart = YYYY + '-' + MM + '-' + '01'
      this.dateEnd = YYYY + '-' + MM + '-' + this.getDaysInMonth(MM, YYYY)
      this.editedItem.overtime = this.formatTimer(new Date())
      this.editedItem.overtimeEnd = this.formatTimer(new Date())
      this.defaultItem.overtime = this.formatTimer(new Date())
      this.defaultItem.overtimeEnd = this.formatTimer(new Date())
      if (MM == "10" || MM == "11" || MM == "12" || MM == "01" || MM == "02" || MM == "03" || MM == "04") {
        this.editedItem.begin = "17:00"
        this.defaultItem.begin = "17:00"
      } else {
        this.editedItem.begin = "17:30"
        this.defaultItem.begin = "17:30"
      }
    },
    getHour(data1, data2) {
      let data11 = Number(data1.substring(0, 2))
      let data12 = Number(data1.substring(3, 5))
      let data21 = Number(data2.substring(0, 2))
      let data22 = Number(data2.substring(3, 5))
      let h = data21 - data11
      let m = 0
      if (data22 > data12) {
        m = ((data22 - data12) / 60).toFixed(2)
      } else if (data22 < data12) {
        m = ((data22 + 60 - data12) / 60).toFixed(2)
        h = h - 1
      }
      return Number(h) + Number(m)
    },
    formatTimer(value) {
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
    formatYearMonth(value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      return y + "-" + MM;
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

    dateStartChanged() {
      this.$refs.menu1.save(this.dateStart)
      this.loadOvertime()
    },
    dateEndChanged() {
      this.$refs.menu2.save(this.dateEnd)
      this.loadOvertime()
    },
    overtimeChanged() {
      this.$refs.menu3.save(this.editedItem.overtime)
    },
    overtimeChanged6() {
      this.$refs.menu6.save(this.editedItem.overtime)
    },

    loadOvertime() {
      this.loading = true
      this.queryOvertime.pageNumber = this.options.page
      this.queryOvertime.pageSize = this.options.itemsPerPage
      this.queryOvertime.begin = this.dateStart
      this.queryOvertime.end = this.dateEnd

      workOvertimeApi.getOvertimes(this.queryOvertime).then(result => {
        result.rows.forEach((val, index) => {
          val.index = index + 1;
        });
        this.desserts = result.rows
        this.totalDesserts = result.total
        this.loading = false
      })
    },
    exportOvertime() {
      this.loading = true
      this.queryOvertime.begin = this.dateStart
      this.queryOvertime.end = this.dateEnd

      workOvertimeApi.exportOvertime(this.queryOvertime).then(result => {
        this.downloadFile(result)
        this.loading = false
      })
    },

    saveInsert() {
      let valid = this.$refs['workOvertimeFormItem'].validate();
      if (valid) {
        this.loading = true
        workOvertimeApi.insertOvertime(this.editedItem).then(result => {
          this.closeInsert()
          if (result != null) {
            this.loadOvertime()

            console.log(result.staff.name)
            this.$refs['overtimeFlow'].startFlow({
              title: result.staff.name + "加班申请单",
              content: '',
              frameId: result.id,
              frameCoding: 1320276,
              frameColumn: 'id'
            }).then()
          }
        }).finally(() => this.loading = false)
      }
    },

    closeInsert() {
      this.dialogNew = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },

    deleteItem(item) {
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      this.desserts.splice(this.editedIndex, 1)
      workOvertimeApi.deleteOvertime(this.editedItem).then(result => {
        if (result != null) {
          this.loadOvertime()
        }
      })
      this.closeDelete()
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },

    searchOvertimes() {
      this.loadOvertime()
    },

  }

}
</script>
