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
          <v-text-field type="number" :rules="rules.payMoney" label="申请付款总额"
                        readonly
                        v-model="data.money"></v-text-field>
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
                       main-coding="1320295"></file-upload>
        </v-col>

        <v-col cols="12">
          <v-data-table :headers="headers" hide-default-footer :items="payList" :items-per-page="-1" item-key="id">
            <template v-slot:item.company.name="{item}">
              <v-autocomplete :search-input.sync="searchCompany"
                              v-if="item.company.id == null"
                              :items="companyList"
                              :rules="rules.company"
                              item-text="name"
                              item-value="id"
                              return-object
                              label="供应商名称"
                              v-model="item.company"></v-autocomplete>
              <div v-else>{{ item.company.name }}
                <v-btn v-if="frameId == null" icon color="error" x-small absolute left rounded
                       @click="delHandler(item)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </template>
            <template v-slot:item.company.openAccount="{item}">
              <v-text-field v-if="frameId == null" :key="item.id" label="开户行名称"
                            v-model="item.company.openAccount"></v-text-field>
              <div v-else>{{ item.company.openAccount }}</div>
            </template>
            <template v-slot:item.company.bankNumber="{item}">
              <v-text-field v-if="frameId == null" :key="item.id" label="银行帐号"
                            v-model="item.company.bankNumber"></v-text-field>
              <div v-else>{{ item.company.bankNumber }}</div>
            </template>
            <template v-slot:item.payMoney="{item}">
              <v-text-field v-if="frameId == null" :key="item.id" type="number" :rules="rules.payMoney"
                            label="申请付款金额"
                            v-model="item.payMoney" @change="moneyChange(item)"></v-text-field>
              <div v-else>{{ item.payMoney }}</div>
            </template>
            <template v-slot:item.remark="{item}">
              <v-text-field v-if="frameId == null" :key="item.id" label="备注" v-model="item.remark"></v-text-field>
              <div v-else>{{ item.remark }}</div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import {search} from '@/api/project'
import {list as listCompany} from '@/api/company'
import {getBatchById, insertBatchPay, updateBatchPay} from '@/api/otherPay'
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
      payMoney: [v => !!v || '付款金额不能为0'],
      company: [v => !!v || '付款单位不能为空'],
    },
    searchProject: null,
    projectList: [],
    companyList: [],
    data: null,
    searchCompany: null,

    headers: [
      {text: '单位名称', value: 'company.name'},
      {text: '开户行', value: 'company.openAccount'},
      {text: '银行帐号', value: 'company.bankNumber'},
      {text: '付款金额', value: 'payMoney'},
      {text: '备注', value: 'remark'},
    ],
    payList: [],
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
        if (this.pay && this.pay.batchId) {
          this.reset()
          this.loadById(this.pay.batchId)
          this.$nextTick(() => {
            if (this.$refs.fileUpload) {
              this.$refs.fileUpload.loadFiles(this.pay.batchId)
            }
          })
        }
      },
      deep: true
    },
    searchCompany(val) {
      if (val != "") {
        listCompany(val).then(result => {
          this.companyList = result
          if (result.length <= 0) {
            this.companyList.push({id: '', name: val})
          }
        })
      }

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
    if (this.pay && this.pay.batchId) {
      let id = this.pay.batchId
      this.reset()
      this.loadById(id)
      this.$nextTick(() => {
        if (this.$refs.fileUpload) {
          this.$refs.fileUpload.loadFiles(id)
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
    delHandler(item) {

      this.payList.forEach((val, idx) => {
        console.log(val)
        if (val.id == item.id) {
          this.payList.splice(idx, 1)
          this.moneyChange()
        }
      })
    },
    moneyChange() {

      let m = 0
      this.payList.forEach(item => {
        if (item.payMoney != null && item.payMoney != '') {
          m += parseFloat(item.payMoney)
        }
      })

      this.data.money = m.toFixed(2)
    },
    addCompany() {
      this.payList.push({
        payTypeTag: this.payType,
        id: this.uuid(),
        payMoney: null,
        remark: '',
        company: {
          name: '',
          openAccount: '',
          bankNumber: '',
        }
      })
    },
    setAutoData(data) {
      this.companyList = []
      this.projectList = []
      if (data.company) {
        this.companyList.push(data.company)
      }
      if (data.project) {
        this.projectList.push(data.project)
      }
      this.payList = data.otherPayList
    },
    loadById(id) {
      this.update = true
      getBatchById(id).then(result => {
        this.setAutoData(result)
        this.data = result
      })
    },
    save() {
      let valid = this.$refs.form.validate()
      if (valid) {
        this.data.otherPayList = this.payList
        if (this.update) {
          return updateBatchPay(this.data).then(result => {
            return result
          })
        } else {
          return insertBatchPay(this.data).then(result => {
            return result
          })
        }
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
      this.update = false
      this.data = {
        id: null,
        title: null,
        remark: null,
        project: null,
        money: 0,
        payTypeTag: this.payType,
        fileId: []
      }
    }
  }
}
</script>

<style scoped>

</style>
