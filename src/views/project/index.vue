<template>
  <div>
    <v-row dense>
      <v-col lg="3" md="4">
        <v-btn @click="insertHandler()" color="primary">新增</v-btn>
        <v-btn class="ml-1" @click="selectProject">批量打印报修码</v-btn>
        <v-btn class="ml-1"
               @click="printProjectWx"
               v-if="selectItems.length > 0">打印
        </v-btn>
      </v-col>

      <v-spacer></v-spacer>
      <v-col sm="3">
        <v-text-field label="搜索" v-model="search" @keyup.enter="searchProject"></v-text-field>
      </v-col>
    </v-row>
    <!--数据表格-->
    <v-data-table :items="projectList"
                  :loading="loading"
                  :show-select="select"
                  :headers="headers"
                  v-model="selectItems"
                  sort-by="pa00145"
                  sort-desc
                  :server-items-length="itemLength"
                  :options.sync="params">
      <template v-slot:item.state="{item}">
        <v-chip x-small v-if="item.state == 0">未审核</v-chip>
        <v-chip x-small color="primary" v-else>已审核</v-chip>
      </template>
      <template v-slot:item.action="{item}">
        <v-btn :loading="deleteLoading"
               class="mr-1"
               :disabled="item.state == 1" color="error" x-small
               @click="deleteProject(item)">删除
        </v-btn>
        <v-btn class="mr-1" x-small @click="createCode(item)">报修码</v-btn>
        <v-btn class="mr-1" x-small @click="outHistory(item)">领料统计</v-btn>
        <v-btn class="mr-1" x-small @click="backHistory(item)">退料统计</v-btn>
        <v-btn class="mr-1" x-small @click="taskList(item)">事项提醒</v-btn>
        <v-btn class="mr-1" x-small @click="authHandler(item)">权限管理</v-btn>
        <v-btn class="mr-1" x-small :disabled="item.state == 1" @click="updateHandler(item)">修改</v-btn>
        <v-btn v-if="$store.state.user.roles.indexOf('项目交换机校验') !== -1" x-small @click="projectAuthor(item)">
          校验信息
        </v-btn>
      </template>
    </v-data-table>
    <!--新增dialog-->
    <v-dialog v-model="dialog">

      <v-card class="pa-5">
        <project-form ref="projectForm"
                      update
                      v-model="formData">

        </project-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveProject">提交</v-btn>
          <v-btn @click="dialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
    <!--单个项目保修码dialog-->
    <v-dialog v-model="wxCode" width="50%">
      <v-card class="pa-3 justify-center align-center text-center">
        <h3 class="text-center mt-10">项目报修登记二维码，将此二维码打印贴在项目地点，客户可快速扫码登记报修</h3>
        <p style="text-align: center" class="ma-0 text-center text-no-wrap text-truncate">{{ item.name }}</p>
        <canvas ref="code" id="code" :style="'width: '+width+'px;height:'+height+'px;'"></canvas>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="wxCode = false">关闭</v-btn>
          <v-btn @click="downloadCode" color="primary">下载</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--项目批量打印保修码dialog-->
    <v-dialog v-model="wxCodeArray" width="60%">
      <v-card class="pa-3 justify-center align-center text-center">
        <v-row dense id="print">
          <v-col v-for="i in selectItems" :key="i.id" cols="4" class="pa-0 pt-4">
            <p style="text-align: center" class="ma-0 text-center text-no-wrap text-truncate">
              {{ i.name.length > 14 ? i.name.substring(0, 14) : i.name }}</p>
            <canvas :id="i.id" :style="'width: '+spWidth+'px;height:'+spHeight+'px;'"></canvas>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="wxCodeArray = false">关闭</v-btn>
          <v-btn color="primary" v-print="printObj">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--项目领料统计-->
    <v-dialog v-model="outHistoryDialog">
      <v-card class="pa-3">
        <report :showPrice="false" noDateFilter ref="outHistory" :project-id="item.id"></report>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="outHistoryDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--项目退料统计-->
    <v-dialog v-model="backHistoryDialog">
      <v-card class="pa-3">
        <back-report noDateFilter ref="backHistory" :project="item.id" :exportMoney="false"></back-report>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="backHistoryDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        项目任务-->
    <v-dialog v-model="taskDialog" width="60%">
      <v-card class="pa-3">
        <task-list :project-id="item.id"></task-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="taskDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        项目过期校验-->
    <v-dialog v-model="authorDialog" width="60%">
      <v-card class="pa-3">
        <author :project-id="item.id" ref="author"></author>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small @click="authorDialog = false">关闭</v-btn>
          <v-btn :loading="authorLoading" small color="primary" @click="downloadAuthorHandler()">下载程序</v-btn>
          <v-btn :loading="authorLoading" small color="primary" @click="saveAuthorHandler()">保存信息</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="authDialog" width="60%">
      <v-card class="pa-3">
        <auth-manager :project="item"></auth-manager>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small @click="authDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--提示信息-->
    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {deleteProject, getProjects, insertProject, updateProject} from '@/api/project'
import QRCode from "qrcode"
import AuthManager from "@/views/project/auth/index.vue";

export default {
  components: {
    AuthManager,
    projectForm: () => import('@/components/102012.vue'),
    report: () => import("../outmaterial/report"),
    taskList: () => import("./task/list"),
    author: () => import("./author/index"),
    backReport: () => import('@/views/storage/back/report.vue')
  },
  name: "project",
  data: () => ({
    backHistoryDialog: false,
    deleteLoading: false,
    authorDialog: false,
    formData: null,
    dialog: false,
    search: null,
    loading: false,
    projectList: [],
    params: {},
    itemLength: 0,
    headers: [
      {
        text: "项目名称",
        value: 'name',
      }, {
        text: "建设单位",
        value: 'oConstruction.name',
      }, {
        text: "项目总价",
        value: 'money',
      }, {
        text: "地区",
        value: 'city.name',
      }, {
        text: "立项日期",
        value: 'paDate',
      }, {
        text: "立项人员",
        value: 'staff.name',
      }, {
        text: "审核状态",
        value: 'state',
      }, {
        text: "操作",
        value: 'action',
      }],

    msg: null,
    msgFlag: false,
    wxCode: false,
    width: 300,
    height: 250,
    item: {id: null},
    qrCode: null,
    outHistoryDialog: false,

    select: false,
    selectItems: [],
    wxCodeArray: false,
    printObj: {
      id: "print",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    spWidth: 225,
    spHeight: 225,
    taskDialog: false,
    authorLoading: false,
    authDialog:false,
  }),
  watch: {
    params: {
      handler() {
        this.loadProject();
      },
      deep: true
    },
  },
  methods: {
    authHandler(item){
      this.item = item
      this.authDialog = true
      console.log("authDialog")
    },
    insertHandler() {
      this.formData = null
      if (this.$refs.projectForm) {
        this.$refs.projectForm.reset()
      }
      this.dialog = true
    },
    updateHandler(item) {
      this.formData = item
      this.dialog = true
    },
    saveAuthorHandler() {
      this.authorLoading = true
      this.$refs.author.save().finally(() => {
        this.authorLoading = false
      })
    },
    downloadAuthorHandler() {
      this.authorLoading = true
      this.$refs.author.download().finally(() => {
        this.authorLoading = false
      })
    },
    projectAuthor(item) {
      this.item = item
      this.authorDialog = true
    },
    taskList(item) {
      this.item = item
      this.taskDialog = true
    },
    printProjectWx() {
      this.wxCodeArray = true
      window.setTimeout(() => {
        let width = this.spWidth,
            height = this.spHeight;
        this.selectItems.forEach(item => {
          let val = this.$store.state.api.apiUrl + this.$router.options.base + `projectAfterExt/${item.id}/${item.name}`
          QRCode.toCanvas(
              document.getElementById(item.id),
              val,
              {width, height, toSJISFunc: QRCode.toSJIS},
              error => {
                console.log(error)
              },
          )
          // new QRCode(
          //     document.getElementById(item.id), {
          //       text: val,
          //       width, height,
          //       colorDark: '#000',
          //       colorLight: '#FFF'
          //     });
        })
      }, 300)
    },
    selectProject() {
      this.select = !this.select
      this.selectItems = []
    },
    backHistory(item) {
      this.item = item
      this.backHistoryDialog = true
    },
    outHistory(item) {
      if (this.$refs.outHistory) {
        this.$refs.outHistory.clearProject()
      }
      this.item = item
      this.outHistoryDialog = true
    },
    downloadCode() {
      let canvas = this.$refs.code.children[0]
      let a = document.createElement("a")
      a.href = canvas.toDataURL("image/png")
      a.download = this.item.name + '-报修码.png'
      a.click()
    },
    createCode(project) {
      this.wxCode = true
      this.item = project
      window.setTimeout(() => {
        let val = this.$store.state.api.apiUrl + this.$router.options.base + `projectAfterExt/${this.item.id}/${this.item.name}`
        let width = this.width,
            height = this.height;
        if (this.qrCode) {
          this.qrCode.clear()
          this.qrCode.makeCode(val)
        } else {
          this.qrCode = QRCode.toCanvas(
              document.getElementById('code'),
              val,
              {width, height, toSJISFunc: QRCode.toSJIS},
              error => {
                console.log(error)
              },
          )
        }
      }, 300)
    },
    flowSuccess() {
      this.dialog = false
      this.loadProject()
    },
    saveProject() {
      let valid = this.$refs['projectForm'].validate();
      if (valid) {
        if (this.formData.id) {
          updateProject(this.formData).then(result => {
            //保存成功，发起流程
            this.$refs['projectForm'].startFlow(result).then(this.flowSuccess)
          })
        } else {
          insertProject(this.formData).then(result => {
            if (result.id != null) {
              //保存成功，发起流程
              this.$refs['projectForm'].startFlow(result).then(this.flowSuccess)
            }
          })
        }
      }
    },
    searchProject() {
      if (this.params.page != 1) {
        this.params.page = 1
      } else {
        this.loadProject()
      }
    },
    deleteProject(item) {
      if (item.state == 1) {
        this.msg = '已审核，不能删除'
        this.msgFlag = true
      } else {
        this.deleteLoading = true
        deleteProject(item.id).then(() => {
          this.loadProject()
        }).finally(() => {
          this.deleteLoading = false
        })
      }
    },
    loadProject() {
      this.loading = true
      let query = {
        searchText: this.search,
        pageSize: this.params.itemsPerPage == -1 ? 500 : this.params.itemsPerPage,
        pageNumber: this.params.page,
        sortName: this.params.sortBy[0],
        sortOrder: this.params.sortDesc[0] ? 'DESC' : 'ASC',
      };
      getProjects(query).then(result => {
        this.projectList = result.rows;
        this.itemLength = result.total;
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>