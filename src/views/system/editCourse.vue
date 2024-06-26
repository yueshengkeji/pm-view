<template>
  <div>
    <v-form>
      <v-row dense>
        <v-col md="3">
          <v-text-field label="过程名称" v-model="data.name"></v-text-field>
        </v-col>
        <v-col md="2">
          <v-autocomplete :items="parentList"
                          item-text="name"
                          item-value="id"
                          @change="updateFcr"
                          label="上级过程"
                          v-model="data.parentId"></v-autocomplete>
        </v-col>
        <v-col md="2">
          <v-checkbox hide-details
                      class="shrink mr-2 mt-0" label="会签" v-model="data.po02005"></v-checkbox>
          <v-checkbox hide-details
                      class="shrink mr-2 mt-0" label="自由选人" v-model="data.pubPerson"></v-checkbox>
        </v-col>
        <v-col md="1">
          <v-text-field type="number"
                        v-model="data.po02013"
                        label="过期时间（单位为分钟，设置此参数，该过程超过指定分钟未处理，系统将自动处理）"></v-text-field>
        </v-col>
        <v-col md="4">
          <v-radio-group title="过期处理方式"
                         hide-details
                         row
                         v-model="data.po02006">
            <v-radio label="同意" :value="3"></v-radio>
            <v-radio label="重复通知" :value="5"></v-radio>
            <v-radio label="驳回" :value="7"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col md="3">
          <select-staff label="搜索审批人" @change="insertStaffHeader" v-model="searchStaff"></select-staff>
        </v-col>
        <v-col md="2">
          <v-autocomplete label="搜索职务"
                          item-text="name"
                          return-object
                          @change="insertDutyHeader"
                          :search-input.sync="searchDuty"
                          :items.sync="dutyList"></v-autocomplete>
        </v-col>
        <v-col md="2">
          <v-autocomplete item-text="name"
                          :items.sync="roleList"
                          :search-input.sync="searchRole"
                          return-object
                          @change="insertRoleHeader"
                          label="搜索角色"></v-autocomplete>
        </v-col>
        <v-col md="2">
          <v-text-field label="序号" v-model="data.serial"></v-text-field>
        </v-col>
        <v-col md="3">
          <v-btn @click="insertDeptHeader" class="mr-1" small title="发起人所属部门主管审批">部门主管</v-btn>
          <v-btn @click="insertParentDutyHeader" class="mr-1" small title="根据（发起人）的上级职务迭代审批人">上级领导
          </v-btn>
          <v-btn @click="insertStartStaffHeader" small title="根据（发起人）的上级职务迭代审批人">发起人</v-btn>
        </v-col>
        <v-col>
          <v-text-field label="判断条件表达式" v-model="data.po02019"></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="动态代理代码(非开发人员请勿随意更改,会导致系统异常)" v-model="data.invokeName"></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        审批/知会对象列表
        <v-col cols="12">
          <v-data-table :items="data.personList"
                        hide-default-footer
                        :headers="personHeader">
            <template v-slot:item.staffType="{item}">
              <div>{{ formatCoursePersonTypeState(item.staffType) }}</div>
            </template>
            <template v-slot:item.type="{item}">
              <div v-if="item.type == 0">审批</div>
              <div v-else>知会</div>
            </template>
            <template v-slot:item.action="{item,index}">
              <v-btn class="mr-1" x-small @click="updatePersonHeader(item)">{{
                  item.type == 0 ? '知会' :
                      '审批'
                }}
              </v-btn>
              <v-btn x-small color="error" @click="deletePersonHeader(index)">删除</v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      <v-row dense>
        判断条件列表
        <v-btn x-small class="pl-1" @click="insertJudgeHeader">添加条件</v-btn>
        <v-col cols="12">
          <v-data-table :items="data.judgeList"
                        hide-default-footer
                        :headers="judgeHeaders">
            <template v-slot:item.action="{item,index}">
              <v-btn x-small @click="deleteJudgeHeader(index)">删除</v-btn>
              <v-btn :disabled="item.id == -1" x-small @click="updateJudgeHeader(item)">修改</v-btn>
            </template>
          </v-data-table>
        </v-col>
        <v-dialog width="50%" v-model="judgeDialog">
          <v-card class="pa-5">
            <v-form>
              <v-text-field label="字段名称" v-model="judge.fieldName"></v-text-field>
              <v-text-field label="条件名称" v-model="judge.name"></v-text-field>
              <v-text-field label="前缀括号" v-model="judge.fixing"></v-text-field>
              <v-text-field label="判断类型" title="< == > <= >= !=" v-model="judge.type"></v-text-field>
              <v-text-field label="判断值" v-model="judge.value"></v-text-field>
              <v-text-field label="后缀括号" v-model="judge.suffix"></v-text-field>
              <v-text-field label="关系符号" v-model="judge.relation"></v-text-field>
            </v-form>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="saveJudge">保存</v-btn>
              <v-btn @click="judgeDialog = false">取消</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import {getDuty} from '@/api/duty'
import {searchRoles} from '@/api/role'
import {deleteJudge, deletePerson} from '@/api/course'
import SelectStaff from "@/views/user/select.vue";

export default {
  name: "editCourse",
  components: {SelectStaff},
  data: () => ({
    searchStaff:null,
    parentList: [],
    data: null,
    personHeader: [
      {text: '处理对象类型', value: 'staffType'},
      {text: '处理对象', value: 'name'},
      {text: '处理类型', value: 'type'},
      {text: '操作', value: 'action'},
    ],
    searchDuty: '',
    dutyList: [],
    roleList: [],
    searchRole: '',

    judgeHeaders: [
      {text: '字段名称', value: 'fieldName'},
      {text: '判断名称', value: 'name'},
      {text: '前缀括号', value: 'fixing'},
      {text: '类型', value: 'type'},
      {text: '判断值', value: 'value'},
      {text: '后缀括号', value: 'suffix'},
      {text: '关系符号', value: 'relation'},
      {text: '操作', value: 'action'},
    ],
    judgeDialog: false,
    judge: {
      id: -1,
      fieldName: '',
      name: '',
      fixing: '',
      type: '',
      value: '',
      suffix: '',
      relation: '',
    },
  }),
  props: {
    parentNode: Array,
    node: Object
  },
  watch: {
    searchRole(value) {
      if (value != null && value != '') {
        searchRoles(value).then(result => this.roleList = result)
      }
    },
    searchDuty(value) {
      if (value != null && value != '') {
        getDuty(value).then(result => {
          this.dutyList = result
        })
      }
    },
    parentNode: {
      handler() {
        this.reset()
      },
      deep: true
    },
    data: {
      handler() {
        console.log("data change")
        this.$emit("change", this.data)
      },
      deep: true,
    },
    node: {
      handler() {
        console.log("node reset")
        this.reset()
      }
    }
  },
  model: {
    prop: 'node',
    event: 'change'
  },
  created() {
    this.reset()
  },
  methods: {
    deleteJudgeHeader(index) {
      let judge = this.data.judgeList[index]
      this.data.judgeList.splice(index, 1)
      deleteJudge(judge.id)
    },
    saveJudge() {
      if (this.judge.id == -1) {
        this.data.judgeList.push(this.judge)
      }
      this.judgeDialog = false
    },
    updateJudgeHeader(item) {
      this.judge = item
      this.judgeDialog = true
    },
    insertJudgeHeader() {
      this.judge = {
        id: -1,
        fieldName: '',
        name: '',
        fixing: '',
        type: '',
        value: '',
        suffix: '',
        relation: '',
      }
      this.judgeDialog = true
    },
    insertStaffHeader() {
      if(this.searchStaff){
        this.data.personList.push({
          courseId: this.data.id,
          flowId: this.data.flowId,
          name: this.searchStaff.name,
          persons: '',
          serial: this.data.personList.length + 1,
          staffId: this.searchStaff.id,
          staffType: 2,
          type: 0,
        })
      }

    },
    insertDeptHeader() {
      this.data.personList.push({
        courseId: this.data.id,
        flowId: this.data.flowId,
        name: '部门主管',
        persons: '',
        serial: this.data.personList.length + 1,
        staffId: '',
        staffType: 5,
        type: 0,
      })
    },
    insertStartStaffHeader() {
      this.data.personList.push({
        courseId: this.data.id,
        flowId: this.data.flowId,
        name: '发起人',
        persons: '',
        serial: this.data.personList.length + 1,
        staffId: '',
        staffType: 6,
        type: 1,
      })
    },
    insertParentDutyHeader() {
      this.data.personList.push({
        courseId: this.data.id,
        flowId: this.data.flowId,
        name: '上级领导',
        persons: '',
        serial: this.data.personList.length + 1,
        staffId: '',
        staffType: 4,
        type: 0,
      })
    },
    deletePersonHeader(index) {
      let person = this.data.personList[index]
      this.data.personList.splice(index, 1)
      deletePerson(person.id)
    },
    updatePersonHeader(item) {
      item.type = item.type == 0 ? 1 : 0
    },
    insertDutyHeader(duty) {
      this.data.personList.push({
        courseId: this.data.id,
        flowId: this.data.flowId,
        name: duty.name,
        persons: '',
        serial: this.data.personList.length + 1,
        staffId: duty.id,
        staffType: 1,
        type: 0,
      })
    },
    insertRoleHeader(role) {
      this.data.personList.push({
        courseId: this.data.id,
        flowId: this.data.flowId,
        name: role.name,
        persons: '',
        serial: this.data.personList.length + 1,
        staffId: role.coding,
        staffType: 3,
        type: 0,
      })
    },
    updateFcr(parentId) {
      this.data.fcr = {
        id: this.data.fcr != null ? this.data.fcr.id : "",
        nextCourseId: this.data.id,
        currentId: parentId,
      }
    },
    reset() {
      this.data = this.node
      this.parentList = []
      this.parentNode.forEach(item => {
        if (item.id != this.node.id) {
          this.parentList.push(item)
        }
      })
      if (this.data != null && this.data.fcr != null) {
        this.data.parentId = this.data.fcr.currentId
      }
    }
  }
}
</script>

<style scoped>

</style>