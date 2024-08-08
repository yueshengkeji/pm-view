<template>
  <v-container>
    <v-form ref="expenseForm">
      <v-row>
        <v-col cols="12" md="4" sm="2" xs="2">
          <v-autocomplete v-model="expense.projectObj"
                          :search-input.sync="searchProject"
                          item-value="id"
                          item-text="name"
                          return-object
                          :items="projectItems"
                          :rules="rules.projectNameRule"
                          label="项目名称"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="4" sm="2" xs="2">
          <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="expense.applyDate"
                  label="申请日期"
                  required
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="rules.dateRule"

              ></v-text-field>
            </template>
            <v-date-picker
                v-model="expense.applyDate"
                @change="applyDateChanged"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="4" sm="2" xs="2">
          <v-text-field v-model="expense.totalMoney"
                        readonly
                        label="费用总计"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4" sm="2" xs="2">
          <easy-flow coding="1320284" ref="expenseFlow"></easy-flow>
        </v-col>
        <v-col cols="12" md="4" sm="2" xs="2">
          <v-combobox v-model="coursesSelect"
                      :search-input.sync="searchCourse"
                      :items="courseItems"
                      label="科目(支持多选)"
                      hint="科目(支持多选)"
                      item-text="name"
                      multiple
                      :rules="rules.coursesSelectRule"
          ></v-combobox>
        </v-col>
        <v-col cols="12" xs="2">
          <v-text-field label="摘要" v-model="expense.title" :rules="[v => !!v || '请填写摘要信息']"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="expense.remark" label="备注"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <file-upload :clear="clearFile"
                       :main-id="expense.id"
                       main-coding="1320284"
                       :loadFile="loadFile"
                       @delete="deleteFileHandler"
                       @change="fileUpload"></file-upload>
        </v-col>
      </v-row>
    </v-form>
    <v-data-table
        hide-default-footer
        :headers="headers"
        :items="desserts"
        class="elevation-1">
      <template v-slot:item.money="{item}">
        <v-text-field dense v-model="item.money" @change="moneyChange"></v-text-field>
      </template>
      <template v-slot:item.remark="{item}">
        <v-text-field dense v-model="item.remark"></v-text-field>
      </template>
      <template v-slot:item.state="{item}">
        <v-btn x-small color="error" @click="deleteItemHandler(item)">删除</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import fileUpload from "../../../components/fileUpload";
import easyFlow from "../../../components/easyflow/easyFlow";
import {search} from "../../../api/project";
import {deleteFile, insert, queryAll, selectById, update} from "../../../api/expense";

export default {
  name: 'add',
  components: {fileUpload, easyFlow},
  data: () => ({
    localProjects: [],
    expense: {
      id: null,
      title: null,
      project: null,
      projectId: null,
      totalMoney: 0,
      applyDate: null,
      remark: null,
      expenseFiles: [],
      expenseSubjects: [],
      projectObj:null
    },

    searchProject: null,
    projectItems: [],

    searchCourse: null,
    coursesSelect: [],
    courseItems: [],

    menu: false,

    clearFile: false,

    headers: [
      {text: '科目名称', value: 'course.name', sortable: false},
      {text: '费用金额', value: 'money', sortable: false, with: '20%'},
      {text: '备注', value: 'remark', sortable: false},
      {text: '操作', value: 'state', sortable: false},
    ],
    desserts: [],
    expenseSubjectItem: {
      course: {
        id: null,
        name: null,
        isCompany: null,
        isDetail: null,
        isProject: null,
        parentId: null,
        series: null,
        type: null,
      },
      money: 0,
      remark: null,
      mark: null,
      id: null,
    },
    files: [],
    tempFile: {
      id: null,
      fileUrl: null,
      fileName: null
    },
    rules: {
      projectNameRule: [
        v => !!v || '必填字段', v => (!!v && v.name && v.name.length < 50) || '不超过50个字符'
      ],
      dateRule: [
        v => !!v || '必填字段'
      ],
      coursesSelectRule: [
        v => !!v || '必填字段'
      ],
    },
    loadFile: false,
    dessertsMap: [],
  }),
  watch: {
    searchProject: {
      handler() {
        if (this.searchProject != null) {
          this.getProjectBySeek(this.searchProject)
        }
      },
      deep: true,
    },

    coursesSelect: {
      handler() {
        if (this.coursesSelect != null) {
          this.courseSelectAction()
        }
      },
      deep: true,
    },
    data: {
      handler() {
        if (this.data) {
          this.resetByData(this.data)
        }
      }
    }
  },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  created() {
    this.expense.applyDate = this.formatTimer(new Date())
    if (window.localStorage.getItem("localProject") != null) {
      this.getLocalProjects()
    } else {
      window.localStorage.setItem("localProject", "")
    }
    if (this.data) {
      this.resetByData(this.data)
    }
  },
  mounted() {
    this.getCourse()
  },
  methods: {
    deleteItemHandler(item) {
      console.log(item)
      // delete this.dessertsMap[item.course.id]
      for (let i = 0; i < this.desserts.length; i++) {
        if (this.desserts[i].course.id == item.course.id) {
          this.desserts.splice(i, 1)
          // if (item.id) {
            //从服务器删除报销科目
            // deleteSubject(item.id)
          // }
        }
      }
    },
    getLocalProjects() {

      this.localProjects = JSON.parse(window.localStorage.getItem("localProjects"))
      if (this.localProjects) {
        this.projectItems = this.localProjects
      } else {
        this.localProjects = []
      }
    },
    formatTimer(value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      return y + "-" + MM + "-" + d;
    },
    deleteFileHandler(file) {
      deleteFile(file.showPath)
    },
    fileUpload(data) {
      this.expense.expenseFiles = []
      for (let i = 0; i < data.files.length; i++) {
        this.tempFile.fileUrl = data.files[i].ftpPath || data.files[i].showPath
        this.tempFile.fileName = data.files[i].fileName
        this.expense.expenseFiles.push(this.tempFile)
        this.tempFile = {
          id: null,
          fileUrl: null,
          fileName: null
        }
      }
    },
    applyDateChanged() {
      this.$refs.menu.save(this.expense.applyDate)
    },
    getProjectBySeek(str) {
      if(str && str != this.expense.project){
        this.projectItems = []
        search(str).then(res => {
          this.projectItems = res
          // res.forEach(item => {
          //   this.projectItems.push(item.name)
          // })
        })
      }
    },
    getCourse() {
      queryAll().then(res => {
        console.log('course', res)
        this.courseItems = res
      })
    },
    validateForm() {
      let flag = null
      if (this.$refs['expenseForm'].validate()) {
        flag = true
      } else {
        flag = false
      }
      return flag
    },
    resetFormRules() {
      this.clearFile = true
      this.$refs['expenseForm'].resetValidation()
    },
    save(startFlow) {
      return new Promise((resolve, reject) => {
        if (this.validateForm()) {
          this.expense.expenseSubjects = this.desserts
          let ajaxResult = null
          if(typeof this.expense.projectObj == "object"){
            this.expense.projectId = this.expense.projectObj.id
            this.expense.project = this.expense.projectObj.name
          }
          if(this.expense.projectId == null){
            this.message("请重新选择项目")
            return
          }
          if (this.expense.id) {
            ajaxResult = update(this.expense)
          } else {
            ajaxResult = insert(this.expense)
          }
          ajaxResult.then(res => {
            if (res != null) {
              if (startFlow) {
                //to do 流程
                this.$refs['expenseFlow'].startFlow({
                  title: res.title || res.project + "报销",
                  content: res.remark || '',
                  frameId: res.id,
                  frameCoding: 1320284,
                  frameColumn: 'id'
                }).then()
              }
              this.localProjects.push(this.expense.project)
              window.localStorage.setItem("localProjects", JSON.stringify(this.localProjects))
              this.reset()
              resolve(res)
            } else {
              reject()
            }
            return res
          }).catch(() => {
            reject()
          })
        } else {
          reject()
        }
      })

    },
    courseSelectAction() {
      this.desserts = []
      this.coursesSelect.forEach(item => {
        // if (this.dessertsMap[item.id]) {
        //   return
        // }
        this.expenseSubjectItemReset()
        if (Object.prototype.toString.call(item) != '[object Object]') {
          this.expenseSubjectItem.course.name = item
          this.desserts.push(this.expenseSubjectItem)
        } else {
          this.expenseSubjectItem.course = item
          this.desserts.push(this.expenseSubjectItem)
        }
        // this.dessertsMap[item.id] = this.expenseSubjectItem
      })
    },
    moneyChange() {
      let total = 0
      this.desserts.forEach(item => {
        total += Number(item.money)
      })
      this.expense.totalMoney = total.toFixed(2)
    },
    reset() {
      this.expense = {
        id: null,
        title: null,
        project: null,
        projectId: null,
        totalMoney: null,
        applyDate: null,
        remark: null,
        expenseFiles: [],
        expenseSubjects: [],
        projectObj:null
      }
      this.clearFile = false
      this.coursesSelect = []
      this.desserts = []
      this.expense.applyDate = this.formatTimer(new Date())
      this.loadFile = false
    },
    resetByData(data) {
      selectById({id: data.id}).then(result => {
        result.projectObj = {id:result.projectId,name:result.project}
        this.projectItems.push(result.projectObj)
        this.expense = result
        this.clearFile = false
        this.coursesSelect = []
        this.expense.applyDate = this.formatTimer(new Date(this.expense.applyDate))
        this.expense.expenseSubjects.forEach(item => {
          this.coursesSelect.push(item.course)
        })
        window.setTimeout(() => {
          this.desserts = this.expense.expenseSubjects
        }, 300)
        this.loadFile = true
      })
    },
    expenseSubjectItemReset() {
      this.expenseSubjectItem = {
        course: {
          id: null,
          name: null,
          isCompany: null,
          isDetail: null,
          isProject: null,
          parentId: null,
          series: null,
          type: null,
        },
        money: 0,
        remark: null,
        mark: null,
        id: null,
      }
    }
  }
}
</script>
