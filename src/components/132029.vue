<template>
  <div class="pa-3">
    <v-form ref="form">
      <v-row>
        <v-col lg="4" cols="12">
          <v-autocomplete label="项目名称"
                          v-model="data.project"
                          item-text="name"
                          return-object
                          :search-input.sync="searchProject"
                          :items="projectList"></v-autocomplete>
        </v-col>
        <v-col lg="4" cols="12">
          <v-text-field :rules="rules.title" label="标题" v-model="data.title"></v-text-field>
        </v-col>
        <v-col lg="4" cols="12" v-if="frameId == null">
          <easy-flow coding="132029" ref="flow" :default-flow-name="flowName"></easy-flow>
        </v-col>
        <v-col lg="4" cols="12">
          <v-autocomplete :rules="rules.company"
                          :search-input.sync="searchCompany"
                          :items="companyList"
                          item-text="name"
                          item-value="id"
                          return-object
                          label="供应商名称"
                          v-model="data.company"></v-autocomplete>
        </v-col>
        <v-col lg="4" cols="12">
          <v-text-field label="开户行名称" v-model="data.company.openAccount"></v-text-field>
        </v-col>
        <v-col lg="4" cols="12">
          <v-text-field label="银行账号" v-model="data.company.bankNumber"></v-text-field>
        </v-col>
        <v-col lg="4" cols="12">
          <v-text-field type="number" :rules="rules.payMoney" label="申请付款金额"
                        v-model="data.payMoney"></v-text-field>
        </v-col>
        <v-col lg="12" cols="12" v-if="frameId != null">
          <v-textarea label="备注" v-model="data.remark" rows="3"></v-textarea>
        </v-col>
        <v-col lg="8" cols="12" v-else>
          <v-text-field label="备注" v-model="data.remark"></v-text-field>
        </v-col>
        <v-col cols="12" v-if="frameId == null">
          <file-upload @change="fileChange"
                       ref="fileUpload"
                       label="上传文件"
                       :main-id="data.id"
                       main-coding="132029"></file-upload>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import {search} from '@/api/project'
import {list as listCompany} from '@/api/company'
import {getById, insertPay} from '@/api/otherPay'
import fileUpload from "./fileUpload"
import easyFlow from "./easyflow/easyFlow"


export default {
  components: {
    fileUpload,
    easyFlow,
  },
  name: "otherPay",
  data: () => ({
    rules: {
      title: [v => !!v || '请输入标题'],
      company: [v => (!!v && !!v.name) || '请输入供应商名称'],
      payMoney: [v => !!v || '请输入付款金额'],
    },
    searchProject: null,
    projectList: [],
    companyList: [],
    data: null,
    searchCompany: null,
  }),
  props: {
    pay: Object,
    frameId: String,
    payType: String,
    flowName: {
      type: String,
      default: '付款申请'
    }
  },
  model: {
    prop: 'pay',
    event: 'change'
  },
  watch: {
    pay: {
      handler() {
        if (this.pay) {
          this.data = this.pay
        }
      },
      deep: true
    },
    searchCompany(val) {
      listCompany(val).then(result => {
        this.companyList = result
        if (result.length <= 0) {
          this.companyList.push({id: '', name: val})
        }
      })
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true
    },
    searchProject(val) {
      search(val).then(result => {
        this.projectList = result
      })
    },
    frameId: {
      handler() {
        this.loadById(this.frameId)
      }
    }
  },
  created() {
    if (this.pay && this.pay.id) {
      this.setAutoData(this.pay)
      this.data = this.pay
      this.$nextTick(() => {
        if (this.$refs.fileUpload) {
          this.$refs.fileUpload.loadFiles(this.data.id)
        }
      })

    } else if (this.frameId) {
      this.reset()
      this.loadById(this.frameId)
    } else {
      this.reset()
    }
  },
  methods: {
    setAutoData(data) {
      this.companyList = []
      this.projectList = []
      if (data.company) {
        this.companyList.push(data.company)
      }
      if (data.project) {
        this.projectList.push(data.project)
      }
    },
    loadById(id) {
      getById(id).then(result => {
        this.setAutoData(result)
        this.data = result
      })
    },
    save() {
      let valid = this.$refs.form.validate()
      if (valid) {
        return insertPay(this.data).then(result => {
          return result
        })
      } else {
        return new Promise((resolve, reject) => {
          reject();
        })
      }
    },
    fileChange(files) {
      this.data.fileId = []
      this.data.id = files.mainId
      files.files.forEach(item => {
        this.data.fileId.push(item.id)
      })
    },
    reset() {
      this.data = {
        id: null,
        title: null,
        remark: null,
        project: null,
        company: {
          openAccount: null,
          id: null,
          name: null,
          bankNumber: null
        },
        payMoney: null,
        payTypeTag: this.payType,
        fileId: []
      }
    }
  }
}
</script>

<style scoped>

</style>
