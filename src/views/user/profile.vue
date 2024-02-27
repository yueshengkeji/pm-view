<template>
  <div class="pa-5">
    <v-row>
      <v-col lg="4" md="4" cols="12">
        <v-avatar color="primary" size="66">
          <span class="white--text headline">{{ user.nameAvatar }}</span>
        </v-avatar>
        <v-btn to="./diningCode" color="primary" right class="ml-1">我的就餐码</v-btn>
        <v-btn class="ml-1" @click="cardHandler">电子名片</v-btn>
        <v-btn class="ml-1" @click="updatePasswd = true" color="error">修改密码</v-btn>
        <v-form>
          <div class="overflow-hidden">
            <v-checkbox class="float-left" @change="updateNotify" v-model="notifyType.type"
                        label="使用新版本推送"></v-checkbox>
            <v-checkbox class="float-left" @change="updateNotify" v-model="notifyType.wx"
                        label="启用微信通知"></v-checkbox>
            <v-checkbox class="float-left" @change="updateNotify" v-model="notifyType.ding"
                        label="启用钉钉通知"></v-checkbox>
          </div>
          <v-row dense>
            <v-col sm="6" cols="12">
              <v-text-field disabled v-model="user.section.name" label="部门"></v-text-field>
            </v-col>
            <v-col sm="6" cols="12">
              <v-select disabled v-model="user.duty"
                        :items="dutys"
                        multiple
                        item-text="name"
                        return-object
                        label="职务"></v-select>
            </v-col>
            <!--            <v-col sm="6" cols="12">-->
            <!--              <v-select disabled v-model="user.role" :items="roles" multiple item-text="name" return-object-->
            <!--                        label="角色"></v-select>-->
            <!--            </v-col>-->

            <v-col sm="6" cols="12">
              <v-text-field v-model="user.openBlank" @change="changeUser" label="开户行"></v-text-field>
            </v-col>

            <v-col sm="6" cols="12">
              <v-text-field v-model="user.bankNumber" @change="changeUser" label="银行账号"></v-text-field>
            </v-col>

            <v-col sm="6" cols="12">
              <v-text-field v-model="user.tel" @change="changeUser" label="手机号"></v-text-field>
            </v-col>

            <v-col sm="6" cols="12">
              <v-text-field v-model="user.email" @change="changeUser" label="邮箱"></v-text-field>
            </v-col>
            <v-col sm="6" cols="12">
              <v-text-field disabled v-model="user.lastLogin" label="最后登录时间"></v-text-field>
            </v-col>
            <v-col sm="6" cols="12">
              <v-chip>{{ user.mobileBrand + "/" + user.mobileModel }}</v-chip>
            </v-col>

          </v-row>
        </v-form>
      </v-col>
      <v-col lg="8" md="8" cols="12" style="height: 520px;" class="overflow-y-auto">
        <v-btn icon
               class="ma-2"
               title="上个月"
               @click="$refs.calendar.prev()">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn @click="openWorkLog" color="primary" id="openWorkLog">填报工作日记</v-btn>
        <v-btn @click="calendarType" color="primary" class="ml-1" id="calendarType">{{
            type == "month" ?
                "周报模式" :
                "月报模式"
          }}
        </v-btn>
        <v-btn class="ml-1" @click="workCheckHandler">考勤补卡</v-btn>
        <v-btn @click="exportExcel" color="error" class="ml-1" :loading="exportLoading" id="exportExcel">
          导出周报计划
        </v-btn>
        <v-btn icon
               absolute
               style="right: 35px"
               class="ma-2"
               title="下个月"
               @click="$refs.calendar.next()">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-calendar class="mt-5" id="calendar"
                    @click:event="moreView"
                    @click:date="openWorkLog($event)"
                    :event-more="false"
                    :type="type"
                    event-overlap-mode="stack"
                    v-model="value"
                    ref="calendar"
                    @change="refreshData"
                    :events="events"
                    :first-time="firstTime"
                    :weekdays="weekday">
          <template v-slot:day="data">
            <v-row :id="formatTest(data.day)"></v-row>
          </template>

        </v-calendar>


        <!--                打卡图像预览-->
        <v-menu v-model="selectedOpen" :activator="selectedElement" offset-x>
          <v-card flat :min-width="avatarHeight" color="grey lighten-4" style="min-height: 200px">
            <v-card-title>{{ selectEvent.name }}</v-card-title>
            <v-img :width="avatarHeight"
                   contain
                   v-show="!imgLoading"
                   @load="imgLoading = false"
                   :src="selectEvent.avatar"></v-img>
            <v-btn block loading v-show="imgLoading"></v-btn>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="downloadImg">下载</v-btn>
              <v-btn>关闭</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-col>
      <v-col cols="12" v-if="deptLogQuery.sectionId != null">
        <v-data-table :items="sectionLog"
                      :items-per-page="10"
                      sort-by="workDate"
                      sort-desc
                      :options.sync="deptLogQuery"
                      :loading="deptLoading"
                      :server-items-length="total"
                      :headers="sectionHeader">
          <template v-slot:top>
            <v-text-field label="搜索员工|工作内容"
                          v-model="deptLogQuery.searchText"
                          @change="deptLogList"></v-text-field>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="updatePasswd" title="修改密码" width="30%" :fullscreen="$vuetify.breakpoint.mobile">
      <v-card class="pa-5">
        <v-subheader>修改密码</v-subheader>
        <v-form ref="updateUserForm">
          <v-text-field :rules="rules" type="password" v-model="up.newPasswd" label="新密码"></v-text-field>
          <v-text-field :rules="rules" @keydown.enter="submitPasswd" type="password" v-model="up.confPasswd"
                        label="确认新密码"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submitPasswd">确定</v-btn>
          <v-btn @click="updatePasswd = false" class="ml-1">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar color="error" centered v-model="msgShow">{{ msg }}</v-snackbar>
    <!--    补卡-->
    <v-dialog v-model="workCheckDialog" width="50%" :fullscreen="$vuetify.breakpoint.xs">
      <v-card class="pa-2">
        <v-form ref="workCheck">
          <p>提交成功后，会发送到部门经理进行审批，审批完成后，考勤数据补卡完成</p>
          <v-menu ref="menu" v-model="menu" :close-on-content-click="false" :close-on-click="false">
            <template v-slot:activator="{on,attrs}">
              <v-text-field v-on="on"
                            v-bind="attrs"
                            :rules="[v => !!v || '请选择日期']"
                            label="补卡日期" v-model="workCheck.date"></v-text-field>
            </template>
            <v-date-picker v-model="workCheck.date"
                           ampm-in-title="24hr"
                           @change="$refs.menu.save()"></v-date-picker>
          </v-menu>
          <v-radio-group row @change="amChangeHandler">
            <v-radio label="上午" value="08:30"></v-radio>
            <v-radio label="下午" value="17:30"></v-radio>
          </v-radio-group>
          <v-menu ref="menu2" v-model="menu2">
            <template v-slot:activator="{on,attrs}">
              <v-text-field v-on="on" v-bind="attrs"
                            :rules="[v => !!v || '请选择时间']"
                            label="时间"
                            v-model="workCheck.time"></v-text-field>
            </template>
            <v-time-picker v-model="workCheck.time"
                           @change="$refs.menu2.save()"></v-time-picker>
          </v-menu>
          <v-text-field label="说明" v-model="workCheck.note" :rules="[v => !!v || '请输入补卡说明']"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="workCheckDialog = false">关闭</v-btn>
          <v-btn color="primary" @click="insertWorkHandler" :loading="workLoading">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        工作日记编辑-->
    <v-dialog v-model="logOpen"
              :fullscreen="$vuetify.breakpoint.mobile"
              width="30%">
      <v-card color="grey lighten-4"
              class="pa-3"
              min-width="350px"
              flat>
        <v-subheader class="text-center">{{ log.workDate }}工作日记</v-subheader>
        <v-form ref="logForm">
          <v-textarea label="请输入日记内容"
                      v-model="log.content"
                      height="200"
                      :rules="logRules">
          </v-textarea>
          <v-text-field label="备注" v-model="log.remark"></v-text-field>
          <file-upload :loadFile="loadFile"
                       :clear="clearFile"
                       id="log-file"
                       :updateFiles="updateFiles"
                       @change="fileUploadSuccess"
                       @resetFileState="this.clearFile = false"></file-upload>
          <v-checkbox label="已完成" v-model="log.stateFlag" @change="log.state = log.stateFlag ? 1 : 0"></v-checkbox>

        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="deleteLog" v-show="log.id != null"
                 :loading="logLoading">删除
          </v-btn>
          <v-btn color="primary" @click="saveLog" :loading="logLoading">确定</v-btn>
          <v-btn :loading="logLoading" @click="logOpen = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--    工作名片编辑-->
    <v-dialog v-model="cardDialog" width="50%" :fullscreen="$vuetify.breakpoint.xs">
      <staff-card @close="cardDialog = false" :staff-id="user.id"></staff-card>
    </v-dialog>
  </div>
</template>

<script>
import {getNotifyType, getUserInfoById, updateNotifyType, updatePasswd, updateUser} from '@/api/user'
import {getRoles} from '@/api/role'
import {getHead, list, insertWorkCheck} from '@/api/workCheck'
import {getDuty} from '@/api/duty'
import {encrypt} from '@/utils/jsencrypt'
import {deleteLog, exportLog, getFiles, insert, logList, update} from '@/api/workLog'
import {isLeader} from '@/api/section'
import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';
import fileUpload from "../../components/fileUpload";

export default {
  name: "profile",
  components: {
    fileUpload,
    staffCard: () => import('./staff-card.vue')
  },
  data: () => ({
    workLoading: false,
    menu: false,
    menu2: false,
    workCheck: {
      date: null,
      time: null,
      note: null,
      type: -1,
    },
    workCheckDialog: false,
    imgLoading: true,
    selectedElement: null,
    selectedOpen: false,
    selectEvent: {},
    user: {section: {name: null}, mobileBrand: null, mobileModel: null},
    roles: [],
    dutys: [],
    updatePasswd: false,
    rules: [
      v => !!v || "请输入新密码",
    ],
    up: {
      oldPasswd: null,
      newPasswd: null,
      confPasswd: null,
    },
    msgShow: false,
    msg: "",
    value: "",
    type: "month",
    events: [],
    weekday: [0, 1, 2, 3, 4, 5, 6],

    logOpen: false,
    selectedElement2: null,
    log: {
      workDate: null,
      content: null,
      id: null,
      remark: null,
      files: null,
      stateFlag: null
    },
    loadFile: false,
    clearFile: false,
    updateFiles: null,
    logRules: [
      v => (!!v && v.trim("").length > 0) || "请输入日记内容",
    ],
    logLoading: false,
    logQuery: {
      staffId: null,
      startDate: null,
      endDate: null,
    },
    logMap: null,
    firstTime: {hour: 6, minute: 30},

    deptLogQuery: {
      startDate: null,
      endDate: null,
      sectionId: null,
      searchText: null
    },

    sectionHeader: [
      {text: '序号', value: 'index'},
      {text: '姓名', value: 'staff.name'},
      {text: '部门', value: 'section.name'},
      {text: '工作时间', value: 'workDate'},
      {text: '工作内容', value: 'content'},
      {text: '操作', value: 'action'},
    ],
    sectionLog: [],
    total: 0,
    deptLoading: false,
    exportLoading: false,

    tourFirstTime: null,
    tourFirstWork: null,
    avatarHeight: '250px',
    notifyType: {
      type: false,
      wx: true,
      ding: false,
      staffId: null
    },
    cardDialog: false,
  }),
  watch: {
    deptLogQuery: {
      handler() {
        if (this.deptLogQuery.sectionId != null) {
          this.deptLogList();
        }
      }
    }
  },
  created() {
    isLeader().then((dept) => {
      if (dept.id != null) {
        //是部门领导,加载部门中所有工作日记
        this.deptLogQuery.sectionId = dept.id;
      }
    })
    this.loadUser()
    // this.loadRoles()
    // this.loadDuty()
    this.logQuery.staffId = this.$store.state.user.id
    this.notifyType.staffId = this.$store.state.user.id
  },
  methods: {
    cardHandler() {
      this.cardDialog = true
    },
    amChangeHandler(val) {
      this.workCheck.time = val
    },
    insertWorkHandler() {
      if (this.$refs.workCheck.validate()) {
        this.workLoading = true
        insertWorkCheck(this.workCheck).then(() => {
          this.workCheckDialog = false
          this.loadEvents({
            start: {date: this.logQuery.startDate},
            end: {date: this.logQuery.endDate}
          })
        }).finally(() => this.workCheckDialog = false, this.workLoading = false)
      }
    },
    workCheckHandler() {
      this.workCheckDialog = true
    },
    updateNotify() {
      updateNotifyType(this.notifyType).then(result => {
        this.notifyType = result
      })
    },
    fileUploadSuccess({files, mainId}) {
      this.log.files = files;
      console.log(mainId);
    },
    downloadImg() {
      let a = document.createElement('a');
      a.download = this.$store.state.user.name + ".png";
      a.href = this.selectEvent.avatar;
      a.click();
    },
    setHeight() {
      this.avatarHeight = '550px'
    },
    formatTest(day) {
      return 'tour-' + day;
    },
    /**
     * 主界面引导
     */
    initTour() {
      if (localStorage.getItem("tour-step") == "4") {
        return;
      }
      let source = null;
      if (this.tourFirstTime == null) {
        source = document.getElementsByClassName('v-calendar-weekly__day-label')[0]
      } else {
        source = document.body.querySelector(`.v-event[data-date="${this.tourFirstTime}"]`)
      }

      if (source == null) {
        source = document.getElementsByClassName('v-calendar-weekly__day-label')[0]
      }
      const driver = new Driver({
        doneBtnText: '完成',
        closeBtnText: '关闭',
        nextBtnText: '下一步',
        prevBtnText: '上一步',
        allowClose: false,
        onNext: (element, step) => {
          console.log("onNext", element.node.id, step);
          if (element.node.id == "exportExcel") {
            localStorage.setItem("tour-step", "4");
          }
        }
      });
      driver.defineSteps([
        {
          element: '#openWorkLog',
          popover: {
            title: '记录当天的工作日记',
            description: '',
          }
        }, {
          element: source.previousElementSibling || source,
          popover: {
            title: '单击日期，记录指定日期的工作内容',
            description: '点击日历表中对应的天数，即可添加对应日期的工作日记<br/><h4>选择下周的日期填写，会形成“下周计划”哦</h4>',
          }
        }, {
          element: source,
          popover: {
            title: '考勤信息查看',
            description: '点击打卡时间，可查看你的自拍哦',
          }
        }, {
          element: '#calendarType',
          popover: {
            title: '模式切换',
            description: '默认加载当月的工作日记，点击切换到周报模式',
          }
        }, {
          element: '#exportExcel',
          popover: {
            title: '导出为excel',
            description: '只能导出周报和下周计划哦<br/><h4>选择下周的日期填写，会形成“下周计划”哦</h4>',
          }
        }]);
      driver.start(0);
    },
    exportExcel() {
      this.exportLoading = true
      let query
      if (this.deptLogQuery.sectionId) {
        query = Object.assign({}, this.deptLogQuery)
      } else {
        query = Object.assign({}, this.logQuery)
      }

      delete query['sortBy']
      delete query['sortDesc']
      delete query['mustSort']
      delete query['multiSort']

      exportLog(query).then(res => {
        let a = document.createElement("a")
        a.download = res
        a.href = res
        a.click()
      }).finally(() => {
        this.exportLoading = false
      });
    },
    deptLogList() {
      this.deptLoading = true
      let query = Object.assign({}, this.deptLogQuery)
      try {
        query.sortBy = query.sortBy[0]
        query.sortDesc = query.sortDesc[0] ? 'DESC' : 'ASC'
      } catch (e) {
        // ignore this e
      }
      logList(query).then((logs) => {
        this.sectionLog = logs.rows
        this.total = logs.total
      }).finally(() => {
        this.deptLoading = false
      })
    },

    calendarType() {
      if (this.type == "month") {
        this.type = "week";
      } else {
        this.type = "month";
      }
    },
    deleteLog() {
      this.logLoading = true;
      deleteLog(this.log.id).then(() => {
        this.logList();
      }).finally(() => {
        this.reset();
        this.logLoading = false;
        this.logOpen = false;
      })
    },
    logList() {
      let newData = [];
      this.events.forEach((item) => {
        if (item.type != "log") {
          newData.push(item);
        }
      })
      this.events = newData;
      this.logMap = [];
      logList(this.logQuery).then((data) => {
        let logs = data.rows;
        let ce = this.events;
        logs.forEach(log => {
          if (this.logMap[log.content] == null) {
            this.logMap[log.content] = true;
            let workDate = new Date(log.workDate.substring(0, 10) + "T11:00:00");
            let endDate;
            if (log.endDate != null) {
              endDate = new Date(log.endDate.substring(0, 10) + "T11:30:00")
            } else {
              endDate = new Date(log.workDate.substring(0, 10) + "T11:30:00");
            }
            ce.push({
              timed: this.type === "week",
              name: log.content,
              start: workDate,
              end: endDate,
              color: 'primary',
              id: log.id,
              type: 'log',
              content: log.content,
              workDate: log.workDate,
              remark: log.remark,
              state: log.state,
              stateFlag: log.state === 1
            });
          }
        })
      }).finally(() => {
        // window.setTimeout(() => {
        //   this.initTour();
        // }, 1000)
      })
    },
    saveLog() {
      let valid = this.$refs['logForm'].validate();
      if (valid) {
        this.logLoading = true;
        if (this.log.id == null) {
          insert(this.log).then(() => {
            this.logList();
          }).catch(e => {
            this.msg = "添加失败" + e
            this.msgShow = true
          }).finally(() => {
            this.reset();
            this.logLoading = false;
            this.logOpen = false;
          });
        } else {
          update(this.log).then(() => {
            this.logList();
          }).finally(() => {
            this.reset();
            this.logLoading = false;
            this.logOpen = false;
          })
        }
      }
    },
    openWorkLog(date) {
      this.reset();
      if (date.date != null) {
        this.log.workDate = date.date + " 00:00:00";
      } else {
        this.log.workDate = this.dateFormat(new Date(), 'YYYY-mm-dd HH:MM:SS');
      }
      this.logOpen = true
    },
    reset() {
      this.log = {
        date: null,
        content: null,
        id: null,
        remark: null,
        files: null,
        stateFlag: false,
      }
      this.clearFile = true;
    },

    refreshData({start, end}) {
      this.loadEvents({start, end});
      this.logQuery.startDate = start.date;
      this.logQuery.endDate = end.date;

      this.deptLogQuery.startDate = start.date;
      this.deptLogQuery.endDate = end.date;
      this.logList();

      if (this.deptLogQuery.sectionId != null) {
        this.deptLogList();
      }
    },
    changeUser() {
      updateUser(this.user).then(() => {
        this.msg = "操作成功";
        this.msgShow = true;
      });
    },
    moreView({nativeEvent, event}) {
      if (event.type == "log") {
        this.reset();
        this.logOpen = true;
        this.log = event;
        getFiles(this.log.id).then(files => {
          this.updateFiles = files
          this.log.files = files
        })
      } else {
        this.avatarHeight = "250px";
        this.imgLoading = true
        if (event.avatar == null || event.avatar == "") {
          getHead(event.type, event.signBgAvatar || event.attache[0]).then(data => {
            event.avatar = "data:image/png;base64," + data;
          }).catch(e => {
            console.log("error", e);
          })
        }
        const open = () => {
          this.selectEvent = event
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => {
            this.selectedOpen = true
          }))
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          requestAnimationFrame(() => requestAnimationFrame(() => open()))
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      }
    },
    loadEvents({start, end}) {
      this.events = [];
      list({
        startDate: start.date,
        endDate: end.date,
        staffId: this.$store.state.user.id
      }).then(data => {
        if (data != null && data instanceof Array) {
          data.forEach((d, idx) => {
            let time = ""
            if (d.type.length <= 5) {
              time = d.time + ":00"
            } else {
              time = d.time
            }
            let data = {
              timed: this.type === "week",
              name: d.time,
              start: new Date(d.date + "T" + time),
              end: new Date(d.date + "T" + time),
              color: d.type == -1 ? '#afafaf' : 'blue',
              id: d.id,
              avatar: null,
              signBgAvatar: d.signBgAvatar,
              type: d.type,
            }
            if (d.attache != null && d.attache != '') {
              data.attache = JSON.parse(d.attache)
            }
            this.events.push(data);
            if (idx == (data.length - 1)) {
              this.tourFirstTime = d.date;
            }
          })
        }
      });
    },
    loadUser() {
      getUserInfoById(this.$store.state.user.id).then(data => {
        if (data.name.length > 2) {
          data.nameAvatar = data.name.substring(1, 3);
        } else {
          data.nameAvatar = data.name;
        }
        if (data.role) {
          this.roles = data.role
        }
        if (data.duty) {
          this.dutys = data.duty
        }
        if (!data.mobileBrand) {
          data.mobileBrand = ""
        }
        if (!data.mobileModel) {
          data.mobileModel = ""
        }
        this.user = data;
      })

      getNotifyType(this.$store.state.user.id).then(result => {
        if (result && result.staffId) {
          this.notifyType = result
        }
      })
    },
    loadRoles() {
      getRoles(this.$store.state.user.token).then(roles => {
        this.roles = roles;
      })
    },
    loadDuty() {
      getDuty().then(dutys => {
        this.dutys = dutys;
      })
    },
    submitPasswd() {
      let valid = this.$refs['updateUserForm'].validate();
      if (valid) {
        if (this.up.confPasswd == this.up.newPasswd) {
          this.user.passwd = encrypt(this.up.newPasswd);
          updatePasswd(this.user).then(() => {
            this.msg = "修改成功";
            this.msgShow = true;
            this.updatePasswd = false;
          }).catch(e => {
            console.log("修改密码", e);
          });
        } else {
          this.msg = "两次输入的密码不一致";
          this.msgShow = true;
        }
      }
    }
  }
}
</script>

<style scoped>

</style>