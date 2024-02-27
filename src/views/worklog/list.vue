<template>
  <div>
    <v-row>
      <v-col sm="4" cols="12">
        <v-btn small @click="insertHandler" color="primary">新增计划</v-btn>
        <v-btn small @click="insertWeekHandler" class="ml-1" :disabled="offWeek">新增月度周计划</v-btn>
        <v-btn class="ml-1" small @click="insertPerHandler">提交考核表</v-btn>
        <v-btn class="ml-1" small @click="insertScoreHandler">提交打分</v-btn>
        <v-btn small @click="notifyDialog = true" class="ml-1">通知任务</v-btn>
      </v-col>
      <v-col sm="2" cols="12">
        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{on,attrs}">
            <v-text-field label="考核表月份" dense v-model="per.month" v-on="on" v-bind="attrs"></v-text-field>
          </template>
          <v-date-picker v-model="per.month" type="month"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12">
        <v-data-table :items="data.rows"
                      :options.sync="options"
                      :loading="loading"
                      :headers="headers"
                      :items-per-page="-1"
                      :server-items-length="data.total">
          <template v-slot:item.workDate="{item}">
            {{ formatDateStr(item.workDate, 0, 10) }}
          </template>
          <template v-slot:item.state="{item}">
            <v-checkbox :disabled="!isEdit(item)" v-model="item.stateFlag" dense @change="changeStateHandler(item)"></v-checkbox>
          </template>
          <template v-slot:item.remark="{item}">
            <div @click="editRemarkHandler(item)" style="cursor: pointer">
              <v-icon small>mdi-pencil</v-icon>
              <span>{{ item.remark }}</span>
            </div>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small
                   @click="deleteHandler(item)"
                   color="error" :disabled="(item.score > 0 || item.state == 1)">删除
            </v-btn>
          </template>
          <template v-slot:item.iScore="{item}">
            <v-text-field v-model="item.iScore" @change="changeIScoreHandler(item)" :disabled="!isEdit2(item)" hide-details dense></v-text-field>
          </template>
          <template v-slot:body.append>
            <tr>
              <td colspan="5"></td>
              <td>
                <v-chip small>{{ weightSum }}</v-chip>
              </td>
              <td colspan="4"></td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <!--x编辑工作计划-->
    <v-dialog width="50%" :fullscreen="$vuetify.breakpoint.xs" v-model="updateRemarkDialog">
      <v-card class="pa-3">
        <v-menu ref="menu2" v-model="menu2">
          <template v-slot:activator="{on,attrs}">
            <v-text-field v-on="on" v-bind="attrs" label="工作完成时间" v-model="item.workDate"></v-text-field>
          </template>
          <v-date-picker v-model="item.workDate" @change="$refs.menu2.save()"></v-date-picker>
        </v-menu>
        <v-radio-group v-model="item.tag" row>
          <v-radio value="重点工作" label="重点工作"></v-radio>
          <v-radio value="常规工作" label="常规工作"></v-radio>
          <v-radio value="协同工作" label="协同工作"></v-radio>
        </v-radio-group>
        <v-text-field label="任务内容" :disabled="item.content=='月度周计划'" v-model="item.content"></v-text-field>
        <v-text-field label="完成情况" v-model="item.note"></v-text-field>
        <v-text-field label="权重" :disabled="item.content=='月度周计划'" v-model="item.weight"></v-text-field>
        <v-textarea label="备注信息" rows="4" v-model="item.remark"></v-textarea>
        <v-checkbox label="已完成" v-model="item.stateFlag"></v-checkbox>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="updateRemarkDialog=false">取消</v-btn>
          <v-btn @click="saveRemarkHandler()" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    新增工作计划-->
    <v-dialog v-model="logDialog"
              :fullscreen="$vuetify.breakpoint.mobile"
              width="30%">
      <v-card color="grey lighten-4"
              class="pa-3"
              min-width="350px"
              flat>
        <v-subheader class="text-center">{{ log.workDate }}工作日记</v-subheader>
        <v-form ref="logForm">
          <v-row dense>
            <v-col cols="12">
              <v-menu ref="menu" v-model="menu">
                <template v-slot:activator="{on,attrs}">
                  <v-text-field v-on="on" v-bind="attrs" label="工作完成时间" v-model="log.workDate"></v-text-field>
                </template>
                <v-date-picker v-model="log.workDate" @change="$refs.menu.save()"></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12">
              <v-radio-group v-model="log.tag" row>
                <v-radio value="重点工作" label="重点工作"></v-radio>
                <v-radio value="常规工作" label="常规工作"></v-radio>
                <v-radio value="协同工作" label="协同工作"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="6">
              <select-staff v-model="log.staff" label="员工名称"></select-staff>
            </v-col>
            <v-col cols="6">
              <v-text-field type="number" v-model="log.weight" label="权重"></v-text-field>
            </v-col>
          </v-row>
          <v-textarea label="请输入工作内容"
                      v-model="log.content"
                      height="200"
                      :rules="logRules">
          </v-textarea>
          <v-text-field label="备注" v-model="log.remark">

          </v-text-field>
          <file-upload :loadFile="loadFile"
                       :clear="clearFile"
                       id="log-file"
                       :updateFiles="updateFiles"
                       @change="fileUploadSuccess"
                       @resetFileState="this.clearFile = false"></file-upload>

        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveLogHandler" :loading="logLoading">确定</v-btn>
          <v-btn :loading="logLoading" @click="logDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    通知指定员工工作计划内容-->
    <v-dialog v-model="notifyDialog" width="30%">
      <v-card class="pa-2">
        <p>通知员工本周工作计划</p>
        <select-staff v-model="notifyStaff"></select-staff>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="notifyHandler" color="primary">确定</v-btn>
          <v-btn>关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="perDialog" width="50%">
      <v-card class="pa-3">
        <easy-flow ref="flowManager" coding="137213" :default-flow-name="defFlowName"></easy-flow>
        <v-text-field dense label="临时或特殊事项说明" v-model="per.note"></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="perDialog = false">关闭</v-btn>
          <v-btn color="primary" @click="submitPer">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="scoreDialog" width="50%">
      <v-card class="pa-3">
        <easy-flow ref="flowManagerScore" coding="137212" :default-flow-name="defFlowNameScore"></easy-flow>
        <v-text-field dense label="临时或特殊事项说明" v-model="per.note"></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="scoreDialog = false">关闭</v-btn>
          <v-btn color="primary" @click="submitScore">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  logList, updateState, updateRemark, insert,
  update, notify, insertPer, deletePer, deleteLog,insertForScore
} from '@/api/workLog'
import SelectStaff from "@/views/user/select.vue"
import fileUpload from "@/components/fileUpload.vue"
import EasyFlow from "@/components/easyflow/easyFlow.vue"

export default {
  name: "workLogList",
  components: {EasyFlow, SelectStaff, fileUpload},
  data: () => ({
    weightSum: 0,
    menu2: false,
    defFlowName: null,
    defFlowNameScore: null,
    menu: false,
    loadFile: false,
    clearFile: false,
    updateFiles: null,
    logRules: [
      v => (!!v && v.trim("").length > 0) || "请输入日记内容",
    ],
    logLoading: false,
    logDialog: false,
    log: {
      workDate: null,
      content: null,
      id: null,
      remark: null,
      files: null,
      staff: null,
      weight: 10,
      tag: null
    },
    item: {
      remark: null,
      content: null,
      stateFlag: false,
      weight: 10
    },
    updateRemarkDialog: false,
    headers: [
      {text: '姓名', value: 'staff.name'},
      {text: '工作性质', value: 'tag'},
      {text: '工作内容', value: 'content'},
      {text: '计划完成时间', value: 'workDate'},
      {text: '完成情况说明', value: 'note'},
      {text: '权重', value: 'weight'},
      {text: '自评分', value: 'iScore',width:'150px'},
      {text: '评分', value: 'score'},
      {text: '是否完成', value: 'state'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    data: {
      rows: [],
      total: 0
    },
    options: {
      page: 1,
      itemsPerPage: -1,
      sortBy: ['work_date'],
      sortDesc: [true]
    },
    loading: false,
    query: {
      staffId: null,
      sectionId: null
    },
    isLeader: false,
    notifyDialog: false,
    notifyStaff: null,

    per: {
      month: null,
      note: null
    },
    perDialog: false,
    offWeek: false,

    scoreDialog:false,

  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    "per.month": {
      handler() {
        this.setDate()
        this.list()
      }
    }
  },
  created() {
    try {
      if (this.$store.state.user.sectionName.indexOf('财务部') != -1 ||
          this.$store.state.user.sectionName.indexOf('人事部') != -1) {
        this.defFlowName = "考核报表审批（人事部/财务部）"
        this.defFlowNameScore = "考核报表打分审批（人事部/财务部）"
      }
    } catch (e) {
      console.log(e)
    }
    this.per.month = this.dateFormat(new Date(), 'YYYY-mm')
    this.query.staffId = this.$store.state.user.id
    // this.query.sectionId = this.$store.state.user.sectionId
    this.setDate()
    // isLeader().then((dept) => {
    //   if (dept.id != null) {
    //     //是部门领导,加载部门中所有工作日记
    //     this.query.sectionId = dept.id
    //     this.query.staffId = null
    //     this.isLeader = true
    //   }
    // }).finally(() => {
    //
    // })
    // this.list()
  },
  methods: {
    changeIScoreHandler(item){
      update({id:item.id,iScore:item.iScore,staff:item.staff,workDate:item.workDate})
    },
    deleteHandler(item) {
      this.confirm("确定删除?").then(() => {
        deleteLog(item.id).then(this.list)
      })
    },
    setDate() {
      let d = this.per.month.split("-");
      this.query.startDate = this.per.month + "-01"
      this.query.endDate = this.per.month + "-" + new Date(d[0], d[1], 0).getDate()
    },
    insertScoreHandler(){
      if (this.data.rows.length <= 0) {
        this.message("未制定工作计划，无法提交打分")
      } else if (this.data.rows[0].scoreId != null) {
        this.confirm(`已经提交${this.per.month}打分申请，确定重新提交打分吗？`).then(() => {
          deletePer(this.data.rows[0].scoreId)
          this.scoreDialogHandler()
        })
      } else {
        this.scoreDialogHandler()
      }
    },
    scoreDialogHandler() {
      this.scoreDialog = true
      this.per.staffId = this.$store.state.user.id
      this.per.section = {id: this.$store.state.user.sectionId}
    },
    submitScore() {
      this.per.workLogs = this.data.rows
      insertForScore(this.per).then((result) => {
        this.$refs.flowManagerScore.startFlow({
          title: this.$store.state.user.name + "-" + this.per.month + "-打分审批",
          content: '',
          frameId: result.id,
          frameCoding: 137212,
          frameColumn: 'id'
        }).then(() => {
          this.list()
          this.scoreDialog = false
        })
      })
    },
    insertPerHandler() {
      if (this.data.rows.length <= 0) {
        this.message("未制定工作计划，无法提交考核")
      } else if (this.data.rows[0].perId != null) {
        this.confirm(`已经提交${this.per.month}考核，确定重新提交审批吗？`).then(() => {
          deletePer(this.data.rows[0].perId)
          this.perDialogHandler()
        })
      } else {
        this.perDialogHandler()
      }
    },
    perDialogHandler() {
      this.perDialog = true
      this.per.staffId = this.$store.state.user.id
      this.per.section = {id: this.$store.state.user.sectionId}
    },
    submitPer() {
      this.per.workLogs = this.data.rows
      insertPer(this.per).then((result) => {
        this.$refs.flowManager.startFlow({
          title: this.$store.state.user.name + "-" + this.per.month + "-考核审批",
          content: '',
          frameId: result.id,
          frameCoding: 137213,
          frameColumn: 'id'
        }).then(() => {
          this.list()
          this.perDialog = false
        })
      })
    },
    notifyHandler() {
      notify(this.notifyStaff.id).finally(() => {
        this.notifyDialog = false
      })
    },
    fileUploadSuccess({files}) {
      this.log.files = files;
    },
    saveLogHandler() {
      if (this.$refs['logForm'].validate()) {
        this.logLoading = true;
        this.log.section = this.log.staff.section
        this.log.workDate = this.log.workDate + " 00:00:00"
        if (this.log.id == null) {
          insert(this.log).catch(e => {
            this.message("添加失败" + e)
          }).finally(() => {
            this.reset();
            this.logLoading = false;
            this.logDialog = false;
            this.list()
          });
        } else {
          update(this.log).finally(() => {
            this.reset();
            this.logLoading = false;
            this.logDialog = false;
            this.list()
          })
        }
      }
    },
    insertWeekHandler() {

      insert({
        workDate: this.dateFormat(new Date(), 'YYYY-mm-dd HH:MM:SS'),
        content: '月度周计划',
        remark: null,
        staff: null,
        weight: 10
      }).catch(e => {
        this.message("添加失败" + e)
      }).finally(() => {
        this.reset();
        this.logLoading = false;
        this.logDialog = false;
        this.list()
      });
    },
    insertHandler(date) {
      this.reset();
      if (date && date.date != null) {
        this.log.workDate = date.date;
      } else {
        this.log.workDate = this.dateFormat(new Date(), 'YYYY-mm-dd');
      }
      this.logDialog = true
    },
    reset() {
      this.log = {
        date: null,
        content: null,
        id: null,
        remark: null,
        files: null,
        weight: 10,
        tag: null,
        staff: {
          id: this.$store.state.user.id,
          name: this.$store.state.user.name,
          section: {
            id: this.$store.state.user.sectionId,
            name: this.$store.state.user.sectionName
          }
        }
      }
      this.clearFile = true;
    },
    saveRemarkHandler() {
      this.item.state = this.item.stateFlag ? 1 : 0
      if (this.item.workDate.length <= 10) {
        this.item.workDate += " 00:00:00"
      }
      updateRemark(this.item).finally(() => {
        this.updateRemarkDialog = false
      })
    },
    isEdit(item) {
      return (item.perId == null || item.perId == "")
    },
    isEdit2(item) {
      return (item.scoreId == null || item.scoreId == "")
    },
    editRemarkHandler(item) {
      if (this.isEdit(item)) {
        this.item = item
        this.updateRemarkDialog = true
      }else{
        this.message("禁止修改")
      }
    },
    changeStateHandler(item) {
      item.state = item.stateFlag ? 1 : 0
      updateState(item)
    },
    list() {
      this.loading = true
      let q = Object.assign(this.query, this.options)
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0] ? 'desc' : 'asc'
      logList(q).then((result) => {
        this.weightSum = 0
        result.rows.forEach(item => {
          item.stateFlag = item.state === 1
          if (item.content == '月度周计划' && this.dateIsMonth(item.workDate)) {
            this.offWeek = true
          }
          if (item.weight) {
            console.log("weight", item.weight)
            this.weightSum += parseFloat(item.weight)
          }
        })
        this.data = result
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
