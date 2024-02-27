<template>
  <div>
    <v-subheader>项目立项</v-subheader>
    <v-form ref="projectForm" class="pa-2">
      <v-row>
        <v-col lg="4" md="4" cols="12">
          <v-text-field autofocus
                        v-model="data.name"
                        @change="checkName"
                        label="项目名称*"
                        :error="errorMessages != null"
                        :error-messages="errorMessages"
                        :rules="[
                                          v => !!v || '请输入项目名称',
                                          errorIsNull
                                      ]"></v-text-field>
        </v-col>
        <v-col lg="2" md="2" cols="6">
          <v-text-field type="number" v-model="data.money" label="总价*" :rules="rules.money"></v-text-field>
        </v-col>
        <v-col lg="2" md="2" cols="6">
          <v-autocomplete v-model="data.city"
                          label="所在城市*"
                          return-object
                          item-text="name"
                          placeholder="直接输入城市名称，回车即可"
                          :items="citys"
                          :search-input.sync="searchCity"
                          :rules="rules.city"></v-autocomplete>
        </v-col>
        <v-col md="4" cols="12">
          <v-text-field v-model="data.add" label="项目详细地点"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-autocomplete v-model="data.oConstruction"
                          :items="companyList"
                          return-object
                          item-text="name"
                          @change="constructionChange"
                          :search-input.sync="searchCompany"
                          label="建设单位*"
                          :rules="rules.oConstruction"></v-autocomplete>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-autocomplete v-model="data.oOwner"
                          :items="ownerList"
                          return-object
                          item-text="name"
                          :search-input.sync="searchOwner"
                          :rules="rules.oOwner"
                          label="业主单位*"></v-autocomplete>
        </v-col>
        <v-col lg="4" md="4" cols="6">
          <v-autocomplete v-model="data.folder"
                          :items.sync="projectFolder"
                          return-object
                          item-text="name"
                          label="项目类型*"
                          :rules="rules.folder"></v-autocomplete>
        </v-col>
        <v-col lg="4" md="4" cols="6">
          <v-text-field disabled v-model="data.paDate" label="立项日期"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="6">

          <v-combobox v-model="data.managerName"
                      :search-input.sync="searchStaff"
                      :return-object="false"
                      :items="staffList"
                      label="负责人"
                      item-value="name"
                      item-text="name">

          </v-combobox>
        </v-col>
        <v-col lg="4" md="4" cols="6">
          <v-text-field disabled v-model="data.staff.name" label="立项人员"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-text-field v-model="data.explain" label="说明"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-text-field v-model="data.remark" label="备注"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12" v-if="frameId == null">
          <easy-flow ref="flow"
                     defaultFlowName="17.项目立项"
                     :instance="flowMsg"
                     coding="102012"></easy-flow>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import {getById, getByName, getFolder} from '@/api/project'
import {loadRegion} from '@/api/region'
import {list} from '@/api/company'
import {getStaff} from '@/api/staff'
import easyFlow from '@/components/easyflow/easyFlow'

export default {
  components: {
    easyFlow
  },
  name: "frame-102012",
  props: {
    // 窗口id
    frameId: String,
    // 绑定项目对象
    project: Object,
    update: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'project',
    event: 'change'
  },
  data: () => ({
    data: null,
    rules: {
      money: [
        v => (!!v && v > 0) || '请输入项目总价并且不能小于0'
      ],
      city: [
        v => (!!v.name) || '项目城市不能为空，直接输入城市名称，回车即可'
      ],
      folder: [
        v => (!!v.name) || '请选择项目类型'
      ],
      oConstruction: [
        v => (!!v.name) || '请输入/选择建设单位'
      ],
      oOwner: [
        v => (!!v.name) || '请输入/选择业主单位'
      ]
    },
    citys: [],
    searchCity: null,

    companyList: [],
    searchCompany: null,

    ownerList: [],
    searchOwner: null,

    projectFolder: [],

    flowMsg: {
      message: {
        title: null,
        content: null,
        frameId: null,
        frameCoding: 102012,
        frameColumn: 'pa00101'
      }
    },

    errorMessages: null,
    staffList: [],
    searchStaff: null,
  }),
  watch: {
    searchStaff(val) {
      getStaff(val).then(result => {
        this.staffList = result
      })
    },
    frameId: {
      handler() {
        this.reset();
        this.loadData();
      },
      deep: true,
    },
    project: {
      handler() {
        if (this.project && this.project.id != this.data.id) {
          this.loadData(this.project.id)
        }
      },
      deep: true
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true,
    },
    searchCity(value, oldValue) {
      if (value && value != "未录入城市" && value != oldValue) {
        loadRegion(value).then(result => this.citys = result).finally(() => {
          if (this.citys.length <= 0) {
            this.citys.push({name: value, id: "-1"});
          }
        })
      }
    },
    searchCompany(value) {
      list(value).then(result => this.companyList = result).finally(() => {
        if (this.companyList.length <= 0) {
          this.companyList.push({name: value, id: -1});
        }
      })
    },
    searchOwner(value) {
      list(value).then(result => this.ownerList = result).finally(() => {
        if (this.ownerList.length <= 0) {
          this.ownerList.push({name: value, id: "-1"});
        }
      })
    }
  },
  created() {
    this.reset()
    if (this.frameId != null) {
      this.loadData();
    } else if (this.project && this.update) {
      this.loadData(this.project.id)
    }
    getFolder().then(result => this.projectFolder = result)
  },
  mounted() {
    loadRegion().then(result => this.citys = result)
  },
  methods: {
    errorIsNull() {
      return this.errorMessages == null
    },
    checkName(value) {
      getByName(value).then(result => {
        if (result != null && result.data != null) {
          this.errorMessages = "项目名称已存在，请重新命名！"
        } else {
          this.errorMessages = null
        }

      })
    },
    startFlow(project) {
      this.flowMsg.message.title = project.name + "项目立项"
      if (project.remark != null) {
        this.flowMsg.message.content = project.remark
      }
      this.flowMsg.message.frameId = project.id
      return this.$refs['flow'].startFlow(this.flowMsg.message).then(() => {
        this.reset()
      })
    },
    constructionChange(val) {
      this.ownerList.push(val)
      this.data.oOwner = val
    },
    validate() {
      return this.$refs['projectForm'].validate()
    },
    blurCitys() {

    },
    loadData(id) {
      getById(id || this.frameId).then(data => {
        this.setProject(data)
      });
    },
    setProject(data) {
      if (data.folder == null) {
        let f = {name: '未指定', id: ''}
        this.projectFolder.push(f)
        data.folder = f
      }
      if (data.city == null) {
        let t = {name: '未录入城市', id: '-1'}
        this.citys.push(t)
        data.city = t
      }else{
        this.citys.push(data.city)
      }
      this.companyList.push(data.oConstruction)
      this.ownerList.push(data.oOwner)
      this.data = data;
    },
    reset() {
      this.data = {
        name: '',
        money: 0,
        city: {name: '', id: null},
        oConstruction: {name: '', id: null},
        staff: this.$store.state.user,
        oOwner: {name: '', id: null},
        folder: {name: '', id: null},
        paDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        managerName: this.$store.state.user.name,
        explain: null,
        remark: null,
        add: ""
      }
      if (this.$refs.projectForm) {
        this.$refs.projectForm.resetValidation()
      }
    }
  }
}
</script>

<style scoped>

</style>