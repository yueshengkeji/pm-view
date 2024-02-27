<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col
            cols="11"
            sm="2"
        >
          <v-dialog
              v-model="dialogNew"
              :fullscreen="mobileFlag"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
              >
                新增
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">新增加班申请单</span>
              </v-card-title>

              <v-card-text>
                <v-form ref="workOvertimeFormItem" lazy-validation>
                  <v-container>
                    <v-row>
                      <v-col
                          cols="12"
                          sm="6"
                          md="4"
                          xs="2"
                      >
                        <v-text-field
                            v-model="$store.state.user.name"
                            label="加班人员"
                            required
                            readonly
                        ></v-text-field>
                      </v-col>
                      <!--                                            <v-col-->

                      <!--                                                    sm="6"-->
                      <!--                                                    md="4"-->
                      <!--                                                    xs="2"-->
                      <!--                                            >-->
                      <!--                                                <v-text-field-->
                      <!--                                                        v-model="editedItem.name"-->
                      <!--                                                        :rules="rules.nameRule"-->
                      <!--                                                        label="单据编号"-->
                      <!--                                                        required-->
                      <!--                                                ></v-text-field>-->
                      <!--                                            </v-col>-->
                    </v-row>
                    <v-row>
                      <v-col
                              cols="6" md="4" sm="3" xs="4"
                      >
                        <v-menu
                                ref="menu3"
                                v-model="menu3"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="editedItem.overtime"
                                    :rules="rules.overtimeRule"
                                    label="加班日期"
                                    required
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    style="font-size: 14px"

                            ></v-text-field>
                          </template>
                          <v-date-picker
                                  v-model="editedItem.overtime"
                                  :min="minDate"
                                  @change="overtimeChanged"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col
                              cols="6" md="4" sm="2" xs="2"
                      >
                        <v-menu
                                ref="menu4"
                                v-model="menu4"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="editedItem.begin"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="editedItem.begin"
                                    :rules="rules.beginRule"
                                    label="开始时间"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                            ></v-text-field>
                          </template>
                          <v-time-picker
                                  v-model="editedItem.begin"
                                  v-if="menu4"
                                  format="24hr"
                                  @click:minute="$refs.menu4.save(editedItem.begin)"
                          ></v-time-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                      <v-row>
                        <v-col
                                cols="6" md="4" sm="3" xs="4"
                        >
                          <v-menu
                                  ref="menu6"
                                  v-model="menu6"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="auto"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                      v-model="editedItem.overtimeEnd"
                                      :rules="rules.overtimeRule"
                                      label="截止日期"
                                      required
                                      prepend-icon="mdi-calendar"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"
                                      style="font-size: 14px"

                              ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="editedItem.overtimeEnd"
                                    @change="overtimeChanged6"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col
                                cols="6" md="4" sm="2" xs="2"
                        >
                          <v-menu
                                  ref="menu5"
                                  v-model="menu5"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  :return-value.sync="editedItem.end"
                                  transition="scale-transition"
                                  offset-y
                                  max-width="290px"
                                  min-width="290px"
                                  :disabled="menu5Flag"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                      v-model="editedItem.end"
                                      :rules="rules.endRule"
                                      label="截止时间"
                                      prepend-icon="mdi-clock-time-four-outline"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                                    v-model="editedItem.end"
                                    v-if="menu5"
                                    format="24hr"
                                    @click:minute="$refs.menu5.save(editedItem.end)"
                            ></v-time-picker>
                          </v-menu>
                        </v-col>
                      </v-row>

                      <v-col
                          cols="12"
                          sm="6"
                          md="4"
                      >
                        <v-text-field
                            type="number"
                            v-model="editedItem.hour"
                            :rules="rules.hourRule"
                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                            label="时长"
                            required
                        ></v-text-field>
                      </v-col>
                      <v-col
                      >
                        <v-text-field
                            v-model="editedItem.remark"
                            label="备注"
                            required
                        ></v-text-field>
                      </v-col>

                    <v-row>
                      <v-col cols="12"
                             sm="6"
                             md="4">
                        <easy-flow coding="1320276"
                                   ref="overtimeFlow"
                                   defaultFlowName="加班申请单"
                        ></easy-flow>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="!$vuetify.breakpoint.xs"
                       @click="closeInsert"
                >
                  取消
                </v-btn>
                <v-btn v-if="!$vuetify.breakpoint.xs"
                       color="primary"
                       :loading="loading"
                       @click="saveInsert"
                >
                  提交
                </v-btn>
              </v-card-actions>
              <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                <v-btn :block="$vuetify.breakpoint.xs" @click="closeInsert">取消</v-btn>
              </div>
              <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                <v-btn :block="$vuetify.breakpoint.xs" color="primary" @click="saveInsert">提交</v-btn>
              </div>
            </v-card>
          </v-dialog>
        </v-col>
        <v-col
            cols="11"
            sm="2"
        >

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
        <v-col
            cols="11"
            sm="2"
        >
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
        <v-col
            cols="12"
            sm="2"

        >
          <v-text-field
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
import easyFlow from '@/components/easyflow/easyFlow'

export default {
  name: "workOvertimeForm",
  components: {easyFlow},
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
      overtimeEnd:null,
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

    rules: {
      nameRule: [
        v => !!v || '不能为空！'
      ],
      overtimeRule: [
        v => !!v || '不能为空！',
      ],
      beginRule: [
        v => !!v || '不能为空！',
      ],
      endRule: [
        v => !!v || '请先填写开始时间或不能为空！',
      ],
      hourRule: [
        v => !!v || '不能为空！',
      ],

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
      approve: '',
    },
    mobileFlag:false
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
    difference(startTime,endTime){
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
      this.queryOvertime.staffId = this.$store.state.user.id

      workOvertimeApi.getOvertimes(this.queryOvertime).then(result => {
        result.rows.forEach((val, index) => {
          val.index = index + 1;
        });
        this.desserts = result.rows
        this.totalDesserts = result.total
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
