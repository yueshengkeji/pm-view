<template>
  <v-row dense>
    <v-col sm="2" cols="12">
      <v-btn v-if="showSyncBtn" :loading="syncLoading" small @click="syncData">同步请假、加班数据</v-btn>
      <v-btn small @click="downloadExcel" class="ml-1">导出</v-btn>
    </v-col>
    <v-col sm="2" cols="12">
      <v-menu offset-y ref="menu" v-model="menu" :close-on-content-click="false">
        <template v-slot:activator="{on,attrs}">
          <v-text-field dense v-on="on"
                        v-bind="attrs"
                        v-model="queryDates"
                        hide-details
                        label="日期范围"></v-text-field>
        </template>
        <v-date-picker range v-model="queryDates" @change="dateChange"></v-date-picker>
      </v-menu>
    </v-col>

    <v-spacer></v-spacer>
    <v-col sm="2">
      <v-text-field dense label="搜索" hide-details v-model="searchText"></v-text-field>
    </v-col>

    <v-col cols="12">
      <v-data-table :items="data"
                    fixed-header
                    height="450"
                    ref="workCheckTable"
                    :headers.sync="headers"
                    :items-per-page="-1"
                    hide-default-footer>
        <template v-slot:body>
          <tbody>
          <tr v-for="(item,rowIdx) in data" :key="item.id">
            <template v-for="(head,idx) in headers">

              <td class="text-start"
                  :class="idx === 1 ? 'sticky' : ''"
                  :title="item.staffName"
                  :rowspan="head.rows || 1"
                  :key="idx+head.value"
                  @click="overtimeDetail(item,head.value,$event)"
                  v-if="head.rows === 2 && rowIdx % 2 === 0">
                <div v-html="item[head.value]" style="max-height: 40px;max-width: 100px;"
                     class="overflow-hidden text-truncate"
                     @click.stop="mapDetail(item,head)"></div>
                <v-badge title="加班标记，单击查看详情" v-if="item[head.value+'overtime']"
                         :content="'加班'+item[head.value+'overtime'].hour+'小时'"></v-badge>
                <v-badge color="red" v-if="item[head.value+'leave']"
                         title="请假标记"
                         content="请假"></v-badge>
              </td>
              <td class="text-start" v-else-if="!head.rows"
                  :title="item.staffName"
                  :key="idx+head.value" @click="overtimeDetail(item,head.value)">
                <div class="overflow-hidden text-truncate" style="max-height:40px;max-width: 100px"
                     v-html="item[head.value]" @click.stop="mapDetail(item,head)"></div>
                <v-badge title="加班标记，单击查看详情" v-if="item[head.value+'overtime']"
                         :content="'加班'+item[head.value+'overtime'].hour+'小时'"></v-badge>
                <v-badge color="red" v-if="item[head.value+'leave']"
                         title="请假标记"
                         content="请假"></v-badge>
              </td>
            </template>
          </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-col>

    <v-menu absolute :position-x="menuData.x" :position-y="menuData.y" v-model="menuData.menu">
      <v-list>
        <v-list-item @click="selectDataHandler(0)">加班单</v-list-item>
        <v-list-item @click="selectDataHandler(1)">请假单</v-list-item>
      </v-list>
    </v-menu>

    <instance-detail :frame="frame" @close="closeDetail"></instance-detail>

    <v-dialog width="70%" v-model="mapDialog">
      <v-card class="pa-3">
        <baidu-map :data="mapData"></baidu-map>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="mapDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {deptList, listByDate, syncOvertimeAndLeave, getByDatetime,exportList} from '@/api/workCheck'
import instanceDetail from '@/components/easyflow/instance-detail'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'

export default {
  name: "deptList",
  components: {instanceDetail, baiduMap: () => import('@/views/map/index.vue')},
  data: () => ({
    searchText: '',
    syncLoading: false,
    menu: false,
    queryDates: [],
    data: [],
    headers: [],
    showSyncBtn: false,
    frame: null,

    selectData: null,
    menuData: {
      x: 0,
      y: 0,
      menu: false
    },
    dataCopy: [],
    mapDialog: false,
    mapData: {
      center: {},
      position: {},
      data: null,
      label: null
    },
    workCheckData: []
  }),
  watch: {
    searchText() {
      let newData = []
      this.dataCopy.forEach(item => {
        if (item.sectionName.indexOf(this.searchText) !== -1 || item.staffName.indexOf(this.searchText) !== -1) {
          newData.push(item)
        }
      })
      this.data = newData
    }
  },
  created() {
    if (this.$store.state.user.roles.indexOf("管理员") != -1 || this.$store.state.user.roles.indexOf("人事") != -1) {
      this.showSyncBtn = true
    }
    this.queryDates = [this.getMonthFirst(new Date()), this.getMonthEnd(new Date())]
    this.setHeader()
    this.list()
  },
  methods: {
    mapDetail(item, head) {
      let day = parseInt(head.text)
      if (isNaN(day)) {
        return
      }
      if (day <= 9) {
        day = "0" + day
      }
      let date = this.queryDates[0].substring(0, 8) + day
      let time = item[head.value].split("</br>")[0]
      getByDatetime({date: date, time: time, staffId: item.staffId}).then(result => {
        if (result && result.lat && result.lng) {
          let lat = result.lat+""
          let lng = result.lng+""
          let l = {
            lat: lat.substring(0, 2) + "." + lat.substring(2),
            lng: lng.substring(0, 3) + "." + lng.substring(3)
          }
          l.lat = parseFloat(l.lat)
          l.lng = parseFloat(l.lng)
          this.mapData = {
            center: l,
            position: l,
            label: result.staffName,
            data: result
          }
          this.mapDialog = true
        }
      })
    },
    setHeader() {
      let day = new Date(this.queryDates[0])
      day = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate()
      let x = 1
      this.headers = [{text: '部门', value: 'sectionName', rows: 2, width: '90px'},
        {text: '姓名', value: 'staffName', rows: 2, width: '80px',cellClass:'.sticky'}]
      while (x <= day) {
        this.headers.push({
          text: x, value: 'time' + x, width: '100px'
        })
        x++;
      }
    },
    downloadExcel() {
      exportList()
      let xlsxParam = {raw: false}
      let wb = XLSX.utils.table_to_book(this.$refs.workCheckTable.$el, xlsxParam)
      let wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'})
      try {
        FileSaver.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), this.queryDates[0] + "-" + this.queryDates[1] + "考勤数据.xlsx")
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.log(e, wbout)
        }
      }
      // excelExport(e, exportData, this.queryDates[0] + "-" + this.queryDates[1] + "考勤数据.xlsx");
    },
    selectDataHandler(idx) {
      this.frame = this.selectData[idx]
      this.menuData.menu = false
    },
    closeDetail() {
      this.frame = null
    },
    overtimeDetail(item, cell, e) {
      if (item[cell + "overtime"] && item[cell + "leave"]) {
        this.selectData = [item[cell + "overtime"].id, item[cell + "leave"].id]
        this.menuData.x = e.clientX
        this.menuData.y = e.clientY
        this.$nextTick(() => {
          this.menuData.menu = true
        })
      } else if (item[cell + "overtime"]) {
        this.frame = item[cell + "overtime"].id
      } else if (item[cell + "leave"]) {
        this.frame = item[cell + "leave"].id
      }
    },
    syncData() {
      this.syncLoading = true
      syncOvertimeAndLeave({startDate: this.queryDates[0], endDate: this.queryDates[1]}).finally(() => {
        this.syncLoading = false
      })
    },
    dateChange() {
      this.menu = false
      this.setHeader()
      this.list()
    },
    list() {
      if (this.showSyncBtn) {
        //加载所有数据
        listByDate({
          startDate: this.queryDates[0],
          endDate: this.queryDates[1],
          isShow: 1
        }).then(this.dataSuccess)
      } else {
        deptList({startDate: this.queryDates[0], endDate: this.queryDates[1]}).then(this.dataSuccess)
      }
    },
    dataSuccess(result) {
      let workCheckMap = []
      let data = []
      let dateCheck = []
      this.data = []
      let x = 0
      let y = 0
      result.forEach((val, idx) => {
        val.time = val.time.substring(0, 5);
        let temp = workCheckMap[val.staffId];
        if (temp == null) {
          //添加员工信息到表格数据集合
          try {
            let ssTemp = val.staffName.split(",");
            temp = {
              index: x,
              staffName: ssTemp[0],
              sectionName: ssTemp[1],
              staffId: val.staffId,
              resultIndex: idx,
            };
            data[x + 1] = {
              index: x + 1,
              staffName: ssTemp[0],
              sectionName: ssTemp[1],
              staffId: val.staffId,
            };
          } catch (e) {
            // $.getStaff(val.staffId).done((result) => {
            //     console.log("该员工已被限制登录：" + result.name);
            // });
          }
          workCheckMap[val.staffId] = temp;
          data[x] = temp;
          x += 2;
        } else {
          temp.resultIndex = idx;
        }
        y = parseInt(val.date.substring(8));
        //判断员工日期数据是否存在
        let dayDataIndex = dateCheck[val.date + val.staffId];
        if (dayDataIndex == null) {
          //没有添加过
          try {
            temp['time' + y] = val.time
          } catch (e) {
            console.log(e);
          }
          if (val.time.substring(0, 2) < 12) {
            // 上午考勤
            if (result[(temp.resultIndex + 1)] != null &&
                (result[(temp.resultIndex + 1)].date + result[(temp.resultIndex + 1)].staffId) == val.date + val.staffId) {
              // 同一人当日有第二次考勤
              data[temp.index + 1]['time' + y] = result[(temp.resultIndex + 1)].time;
            } else {
              data[temp.index + 1]['time' + y] = "";
            }
            if (val.address != "") {
              temp['time' + y] += "</br>" + (val.column10 || '')  + (val.note || '');
            }
          } else {
            // 下午考勤
            if (result[(temp.resultIndex + 1)] != null
                && (result[(temp.resultIndex + 1)].date + result[(temp.resultIndex + 1)].staffId) == val.date + val.staffId) {
              // 同一人当日有第二次考勤
              data[temp.index + 1]['time' + y] = result[(temp.resultIndex + 1)].time;
              if (val.address != "") {
                temp['time' + y] += "</br>" + (val.column10 || '') + (val.note || '');
              }
            } else {
              //    同一人当日就一次考勤记录,把下午数据移动到上午去
              temp['time' + y] = "";
              data[temp.index + 1]['time' + y] = val.time;
              if (val.address != "") {
                data[temp.index + 1]['time' + y] += "</br>" + (val.column10 || '') + (val.note || '');
              }
            }
          }
          dateCheck[val.date + val.staffId] = temp.index;
          if (val.overtime) {
            temp['time' + y + 'overtime'] = val.overtime
          }
          if (val.leave) {
            temp['time' + y + 'leave'] = val.leave
          }
        } else {
          //添加过，直接更新下班数据为最后
          data[dayDataIndex + 1]['time' + y] = val.time;
          data[dayDataIndex + 1].resultIndex = idx;
          if (val.address != "") {
            data[dayDataIndex + 1]['time' + y] += "</br>" + (val.column10 || '')  + (val.note || '');
          }

          if (val.overtime) {
            data[dayDataIndex + 1]['time' + y + 'overtime'] = val.overtime
          }
          if (val.leave) {
            data[dayDataIndex + 1]['time' + y + 'leave'] = val.leave
          }
        }
      })
      this.data = data
      this.dataCopy = data
      this.workCheckData = workCheckMap
    }
  }
}
</script>

<style >
.sticky{
  position: sticky;
  left: 0;
}
</style>