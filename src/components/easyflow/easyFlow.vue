<template>
  <div>
    <v-autocomplete
        style="z-index: 99"
        v-model="flow"
        :disabled="offEdit"
        :items="flowArray"
        :dense="dense"
        label="审批流程"
        return-object
        item-text="name"
        item-value="id"
        :search-input.sync="searchFlow"
        @focus="focusHandler"
        @change="select">
    </v-autocomplete>
    <v-dialog v-model="personDialog" title="请选择审批人" width="70%">
      <v-card class="pa-3">
        <v-text-field label="检索姓名" autofocus v-model="searchStaff"></v-text-field>
        <v-row class="overflow-y-auto" style="max-height: 400px" id="select-person-container">
          <v-col v-for="(person,index) in pubPersonArray" :key="person.id" cols="12">
            <template v-if="person.type == 0 && person.staff != null">
              <p>请选择{{ getPersonType(person) }}{{ person.name }}</p>
              <v-checkbox v-for="(s,index2) in person.staff"
                          hide-details
                          class="float-left"
                          :key="person.id+s.id"
                          :id="person.id+s.id"
                          v-model="checked"
                          :label="s.name" :value="index2+','+index" border multiple>
              </v-checkbox>
            </template>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="nextSelectPerson" :loading="loading" color="primary" @click="consentByPerson">确定</v-btn>
          <v-btn v-if="!nextSelectPerson" :loading="loading" color="primary" @click="pubStartFlow">确定</v-btn>
        </v-card-actions>
        <v-snackbar v-model="pub.show" centered error>
          {{ pub.content }}
        </v-snackbar>
      </v-card>

    </v-dialog>
    <!--加载框-->
    <v-dialog v-model="fullscreenLoading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          加载中
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="msg.show" top error>
      {{ msg.content }}
    </v-snackbar>
  </div>
</template>

<script>
import usedFlowApi from '@/api/usedFlowApi'
import {consent, selectPersonConsent} from '@/api/approve'
import {getById} from '@/api/role'
import {getById as getDutyById} from '@/api/duty'

export default {
  name: "easyFlow",
  data() {
    return {
      searchFlow: null,
      flowArray: [],
      pubPersonArray: [],
      personDialog: false,
      checked: [],
      flowCourse: null,
      fullscreenLoading: false,
      pubPersonResult: null,
      pubPersonApprove: [],
      flow: null,
      msg: {
        show: false,
        content: ''
      },
      flowModel: Object,
      pub: {
        show: false,
        content: null,
      },
      searchStaff: null,
      nextSelectPerson: false,
      approve: null,
      resolve: null,
      catchStaffMap: [],
      loading: false,
    }
  },
  props: {
    //禁止编辑
    offEdit: Boolean,
    //窗口编号
    coding: String,
    //流程目录id
    folderId: String,
    //流程发起成功后的回调函数
    success: null,
    //开始发起流程
    start: Boolean,
    //流程列表发生变化的回调函数
    change: Function,
    //发起流程实例
    instance: Object,
    //是否紧凑
    dense: Boolean,
    //是否可以模糊检索流程名称
    searchName: {
      type: Boolean,
      default: true,
    },
    //指定检索流程名称字符
    searchValue: {
      type: String,
      default: null
    },
    //指定默认流程
    defaultFlowName: {
      type: String,
      default: null
    },
    //    自由选人时指定的默认审批人
    defaultUser: {
      type: Object,
      default: null
    },
  },
  mounted() {
    if (this.coding == null) {
      if (this.searchValue != null) {
        this.searchFlowByName(this.searchValue);
      } else {
        this.getFlowByArticleFolder(this.folderId);
      }
    } else {
      this.loadFlow(this.coding);
    }
  },
  watch: {
    defaultFlowName() {
      this.setDefaultFlow()
    },
    searchValue: {
      handler: function () {
        this.searchFlowByName(this.searchValue);
      },
      deep: true
    },
    searchStaff(val) {
      val += ""
      let container = document.getElementById('select-person-container')
      //JSON.parse(JSON.stringify(this.pubPersonResult.personList))
      for (let i = 0; i < this.pubPersonResult.personList.length; i++) {
        let persons = this.pubPersonResult.personList[i]
        if (persons != null) {
          for (let j = 0; j < persons.staff.length; j++) {
            let item2 = persons.staff[j]
            if (item2 != null) {
              if (item2.name.indexOf(val) !== -1) {
                let target = document.getElementById(persons.id + item2.id)
                this.$vuetify.goTo(target, {
                  duration: 1000,
                  offset: 0,
                  container: container
                })
                return
              }
            }
          }
        }

      }
    },
    searchFlow(value) {

      if (value != null && this.searchName && (this.flow == null || value != this.flow.name) && this.coding == null) {
        if (value == "") {
          if (this.coding == null) {
            this.getFlowByArticleFolder(this.folderId);
          } else {
            this.loadFlow(this.coding);
          }
        } else {
          this.searchFlowByName(value);
        }
      }
    },
    coding: {
      handler: function () {
        this.loadFlow(this.coding);
      },
      deep: true,
    },
    folderId: {
      handler: function () {
        console.log("folderId handler ", this.searchValue)
        if (this.searchValue != null) {
          this.searchFlowByName(this.searchValue);
        } else {
          this.getFlowByArticleFolder(this.folderId);
        }
      },
      deep: true,
    },
    start: {
      handler: function () {
        //开始流程
        if (this.start) {
          this.startFlow(this.instance.message);
        }
      },
      deep: true,
    },
    defaultUser: {
      handler() {
        this.setDefaultUser()
      }, deep: true
    },
    personDialog: {
      handler(val) {
        if (!val) {
          this.checked = []
          this.flowModel = {}
          this.flowCourse = null
        }
      }
    },
  },
  methods: {
    focusHandler(){
      if(this.flowArray == null || this.flowArray.length <= 0){
        this.loadFlow(this.frameCoding)
      }
    },
    consentByPerson() {
      if (this.checked == null || this.checked.length <= 0) {
        this.msg.content = '请选择审批人'
        this.msg.show = true
      } else {
        this.fullscreenLoading = true;
        this.setNextPersonList()
        this.approve.content = this.approve.content || '同意'
        this.loading = true
        selectPersonConsent(this.approve, this.flowCourse).then((res) => {
          this.flowIsOk(res, this.resolve)
        }).finally(() => {
          this.loading = false
          this.fullscreenLoading = false
        });
      }
    },
    select(flow) {
      this.flow = flow;
      this.changeFlow(flow);
    },
    changeFlow(flow) {
      if (this.change != null) {
        this.change(flow);
      }
      this.$emit("change", flow)
    },
    getPersonType(person) {
      this.catchStaffMap[person.staffId] = person
      switch (person.staffType) {
        case 0:     //获取部门经理名称
          return "部门经理";
        case 1:     //获取职务名称
          getDutyById(person.staffId).then(result => {
            this.$set(this.catchStaffMap[result.coding], 'name', result.name)
          })
          return "";
        case 2:     //获取审批人名称
          return "审批人";
        case 3:     //获取角色名称
          getById(person.staffId).then(result => {
            this.$set(this.catchStaffMap[result.coding], 'name', result.name)
          })
          return ""
        case 4:     //获取上级领导
          return "上级领导";
        case 5:     //获取部门主管名称
          return "部门主管";
        case 6:     //发送人
          return "发起人";
        default:
          return "-";
      }
    },
    verifyFlowMsg(msg) {
      let isOk = true, tooltip = "";
      if (msg == null) {
        tooltip = "OA审批信息不能为空"
        isOk = false;
      } else if (msg.title == null) {
        tooltip = "审批标题不能为空";
        isOk = false;
      } else if (this.flow == null || this.flow.id == null) {
        tooltip = "请选择审批流程";
        isOk = false;
      } else {
        isOk = true;
      }
      if (!isOk) {
        this.msg.content = tooltip;
        this.msg.show = true;
        return isOk;
      }
      if (msg.content == null) {
        msg.content = "";
      }
      return isOk;
    },
    /**
     * 开始流程
     * */
    startFlow(msg, prevResolve) {
      return new Promise((resolve, reject) => {
        if (this.verifyFlowMsg(msg)) {
          if (msg.frameColumn == null) {
            msg.frameColumn = this.getFrameColumn(this.coding);
          }
          this.flowModel = {
            flow: this.flow,
            message: msg,
            flowCourse: this.flowCourse,
          };
          if (this.flowModel.flowCourse) {
            for (let i = 0; i < this.flowModel.flowCourse.personList.length; i++) {
              if (this.flowModel.flowCourse.personList[i] == null) {
                this.flowModel.flowCourse.personList.splice(i, 1)
              }
            }
          }
          this.flowModel.message.flow = this.flowModel.flow;
          this.fullscreenLoading = true;
          let than = this;
          usedFlowApi.startFlow(this.flowModel).then(result => {
            than.flowIsOk(result, prevResolve || resolve, reject);
          }).catch((e) => {
            if (e.toString().indexOf("timeout") != -1) {
              this.msg.content = "请求超时";
              this.msg.show = true;
            }
            reject(e)
          }).finally(() => {
            this.loading = false
          })
        } else {
          reject("流程消息对象验证失败")
        }
      });

    },
    setNextPersonList: function () {
      this.checked.forEach(item => {
        let idxId = item.split(",");
        if (this.flowCourse.personList[idxId[1]] === undefined) {
          this.flowCourse.personList[idxId[1]] = JSON.parse(JSON.stringify(this.pubPersonArray[idxId[1]]));
          this.flowCourse.personList[idxId[1]].staff = [];
        }
        console.log(idxId,this.pubPersonResult.personList)
        if(this.pubPersonResult.personList[idxId[1]].staff){
          this.flowCourse.personList[idxId[1]].staff.push(JSON.parse(JSON.stringify(this.pubPersonResult.personList[idxId[1]].staff[idxId[0]])));
        }
      });
      for (let i = 0; i < this.flowCourse.personList.length; i++) {
        if (this.flowCourse.personList[i] == null) {
          this.flowCourse.personList.splice(i, 1)
        }
      }
    },
    pubStartFlow() {
      if (this.checked.length <= 0) {
        this.pub.content = "请选择审批人"
        this.pub.show = true
      } else {
        this.setNextPersonList();
        let personStaff = []
        this.flowCourse.personList.forEach(item=>{
          personStaff = personStaff.concat(item.staff)
        })
        console.log("personStaff.length",personStaff.length)
        if (this.flowCourse.personList.length <= 0 || personStaff.length <= 0) {
          this.pub.content = "请选择审批人"
          this.pub.show = true
          return;
        }
        //自由选人确定
        this.loading = true
        this.startFlow(this.flowModel.message, this.resolve).finally(() => this.loading = false)
      }
    },
    flowIsOk(result, resolve) {
      console.log("flowIsOk", result)
      if (result.state === 2) {
        //自由选人
        this.checked = []
        this.pubPersonResult = result.flowCourse;
        this.flowCourse = {personList: [], id: result.flowCourse.id}
        this.pubPersonArray = JSON.parse(JSON.stringify(this.pubPersonResult.personList))
        this.fullscreenLoading = false
        this.personDialog = true
        this.resolve = resolve
        this.setDefaultUser("flow")
      } else if (result.state === 5) {
        //自动同意该步骤，并提示用户选择下一步审批人
        this.checked = []
        this.flowCourse = {personList: [], id: result.flowCourse.id}
        this.msg.content = "发起成功"
        this.msg.show = true
        this.fullscreenLoading = false
        this.personDialog = false
        if (result.flowMessage.approveList.length > 0) {
          this.approve = result.flowMessage.approveList[0]
          this.autoConsent(this.approve, resolve)
        } else {
          if (this.success) {
            this.success(result)
          }
          this.msg.content = "流程发起成功，发起人与审批人相同，请跳转到<a href='" + this.$router.options.base + "approve/index'>我的审批</a>进行审批";
          this.msg.show = true
          resolve(result)
        }

        /*if (this.success) {
            this.success(result)
        }
        resolve(result)*/
      } else {
        this.flowCourse = null
        this.msg.content = "发起成功"
        this.msg.show = true
        this.fullscreenLoading = false
        this.personDialog = false
        if (this.success) {
          this.success(result)
        }
        resolve(result)
      }
    },
    autoConsent(a, resolve) {
      consent(a, false).then(response => {
        if (response.flowCourse != null) {
          //自由选人审批
          this.checked = []
          this.pubPersonResult = response.flowCourse
          this.pubPersonArray = response.flowCourse.personList
          this.personDialog = true
          this.nextSelectPerson = true
          this.resolve = resolve
          this.setDefaultUser()
        } else {
          if (this.success) {
            this.success(response)
          }
          this.msg.content = "发起成功";
          this.msg.show = true
          resolve(response)
        }
      }).finally(() => {
        this.fullscreenLoading = false;
      });
    },
    getFrameColumn(coding) {
      switch (coding) {
        case 15306:
          return "pm01301";
      }
    },
    /**
     * 是否自由选人
     */
    pubPerson() {

    },
    /**
     * 加载流程
     * @param frameCoding 窗口编号
     */
    loadFlow(frameCoding) {
      usedFlowApi.getFlowByCoding(frameCoding).then((result) => {
        this.flowArray = result;
        this.setDefaultFlow()
      });
    },
    setDefaultFlow() {
      if (this.flowArray.length > 0) {
        if (this.defaultFlowName != null) {
          let isExist = false;
          this.flowArray.forEach(item => {
            if (item.name === this.defaultFlowName) {
              this.flow = item;
              isExist = true
            }
          })
          if (!isExist) {
            this.flow = this.flowArray[0];
          }
        } else {
          this.flow = this.flowArray[0];
        }
        this.changeFlow(this.flow);
      }
    },
    getFlowByArticleFolder(folderId) {
      usedFlowApi.getFlowByArticleFolder(folderId).then(flows => {
        this.flowArray = flows
        this.setDefaultFlow()
      })
    },
    searchFlowByName(value) {
      usedFlowApi.getFLowByName(value).then(flows => {
        this.flowArray = flows
        this.setDefaultFlow()
      }).catch(e => {
        console.log(e);
      })
    },
    setDefaultUser(type) {
      let userCount = 0
      let fj = null
      let fi = -1
      for (let i = 0; i < this.pubPersonArray.length; i++) {
        fi = i
        let person = this.pubPersonArray[i]
        if (person.staff) {
          for (let j = 0; j < person.staff.length; j++) {
            if (this.defaultUser && this.defaultUser.id == person.staff[j].id) {
              this.checked.push(j + ',' + i)
              break;
            }
            fj = j
            userCount++
          }
        }
      }
      console.log("setDefaultUser", userCount, fj, fi)
      if (this.defaultUser == null && userCount === 1) {
        //只有一位审批人时，自动同意
        this.checked.push(fj + ',' + fi)
        if (type == "flow") {
          this.pubStartFlow()
        } else {
          this.consentByPerson()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
