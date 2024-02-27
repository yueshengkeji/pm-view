<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <span style="font-size: 20px">添加合同</span>
        </v-col>
        <v-spacer></v-spacer>
        <v-btn x-small @click="clearChoose" style="margin: auto;margin-right: 10px">清除选中</v-btn>
        <v-radio-group
            v-model="chooseType"
            row
        >
          <v-radio
              v-for="(item) in chooseTypeItems"
              :label="item.name"
              :key="item.name"
              :value="item.name"
          ></v-radio>
        </v-radio-group>
        <v-divider vertical></v-divider>
        <v-checkbox style="margin-right: 10px"
                    v-model="checkbox"
                    label="预付款"
        ></v-checkbox>
      </v-row>
      <v-form ref="contractForm">
        <v-row>
          <!--                    <v-col-->
          <!--                            cols="12"-->
          <!--                            md="4"-->
          <!--                    >-->
          <!--                        <v-text-field-->
          <!--                                v-model="contractModel.contract.serialNumber"-->
          <!--                                label="合同编号"-->
          <!--                                :rules="rules.serialNumberRule"-->
          <!--                        ></v-text-field>-->
          <!--                    </v-col>-->
          <v-col cols="12"
                 md="4">
            <v-text-field
                v-model="contractModel.contract.name"
                label="合同名称"
                :rules="rules.contractNameRule"
            ></v-text-field>
          </v-col>
          <v-col cols="12"
                 md="4">
            <v-combobox
                v-model="tempProject"
                :search-input.sync="searchProject"
                :items="projectItems"
                label="选择项目"
                item-text="name"
                return-object
                :rules="rules.projectRule"
            >
            </v-combobox>
          </v-col>
          <v-col cols="12"
                 md="4">
            <v-combobox
                v-model="contractModel.contract.partyA"
                :search-input.sync="searchPartyA"
                :items="partyAItems"
                label="甲方"
                item-text="name"
                return-object
                :rules="rules.partyARule"
            >
            </v-combobox>
          </v-col>
          <v-col cols="12"
                 md="4">
            <v-combobox
                v-model="contractModel.contract.partyB"
                :search-input.sync="searchPartyB"
                :items="partyBItems"
                label="乙方"
                item-text="name"
                return-object
                :rules="rules.partyBRule"
                :append-icon=" 'mdi-plus' "
                @click:append="showAddCompanyDialog"
            >
            </v-combobox>
          </v-col>
          <v-col cols="12"
                 md="2">
            <v-combobox
                v-model="contractModel.contract.city"
                :search-input.sync="searchPlace"
                :items="placeItems"
                label="地区"
                item-text="name"
                return-object
            >
            </v-combobox>
          </v-col>
          <v-col md="2">
            <v-text-field v-model="contractModel.contract.price"
                          type="number"
                          label="金额"
                          :rules="rules.priceRule"
            >
            </v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field
                label="采购合同"
                readonly
                disabled
            >
            </v-text-field>
          </v-col>
          <v-col md="2">
            <v-select
                v-model="contractModel.contract.taxType"
                :items="typeItems"
                label="开票类型"
                item-text="name"
            >
            </v-select>
          </v-col>
          <v-col md="3">
            <easy-flow coding="10564"
                       :default-flow-name="defaultFlow"
                       ref="purchaseFlow"
                       @change="getFlowId"></easy-flow>
          </v-col>
          <v-col md="5">
            <v-text-field
                v-model="contractModel.contract.remark"
                label="备注"
                :rules="rules.remarkRule"
            ></v-text-field>
          </v-col>
        </v-row>
        <div v-if="checkbox">
          <v-divider style="border-color: red"></v-divider>
          <v-row>
            <v-col md="3">
              <v-text-field class="payStyle"
                            v-model="contractModel.payPlan.payMoney"
                            type="number"
                            label="预付款"
              ></v-text-field>
            </v-col>
            <v-col md="4">
              <v-text-field class="payStyle"
                            v-model="contractModel.payPlan.remark"
                            label="付款申请备注"
              ></v-text-field>
            </v-col>
            <v-col md="3">
              <easy-flow coding="10563"
                         ref="purchasePayFlow"
                         @change="getPayPlanFlowId"></easy-flow>
            </v-col>
            <v-col md="2">
              <v-select class="payStyle"
                        v-model="payType"
                        :items="payTypeItems"
                        label="款项性质"
                        item-text="name"
                        return-object
                        :rules="rules.payTypeRule"
              >
              </v-select>
            </v-col>
          </v-row>
        </div>
        <v-row>
          <v-col>
            <file-upload ref="fileUpload" :clear="clearFile" @change="fileUpload"></file-upload>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
    <v-dialog v-model="addCompanyDialog" width="70%">
      <v-card>
        <v-card-title>新增公司信息</v-card-title>
        <add-company ref="addCompany"></add-company>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveCompany">提交</v-btn>
          <v-btn @click="addCompanyDialog = false,this.$refs.addCompany.reset()">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--加载框-->
    <v-dialog v-model="loadDialog"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在处理。。。
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import {search} from "../../../api/project";
import {list} from "../../../api/company";
import {loadRegion} from "../../../api/region";
import {getTypeList} from "../../../api/taxType";
import {getType, insertContract} from "../../../api/contract";
import {getPayType} from "../../../api/payment";
import fileUpload from "../../../components/fileUpload";
import easyFlow from "../../../components/easyflow/easyFlow";
import addCompany from "../../../components/addCompany";
import {getConfig, list as scList} from '@/api/systemConfig'

export default {
  name: "add_contract",
  components: {fileUpload, easyFlow, addCompany},

  data: () => ({
    chooseType: null,
    chooseTypeItems: [],

    addCompanyDialog: false,
    contractModel: null,
    tempProject: null,
    checkbox: false,
    loadDialog: false,

    searchProject: null,
    projectItems: [],
    searchPartyA: null,
    partyAItems: [],
    searchPartyB: null,
    partyBItems: [],
    searchPlace: null,
    placeItems: [],
    typeItems: [],
    payType: null,
    payTypeItems: [],

    clearFile: false,

    rules: {
      serialNumberRule: [
        v => (!!v && v.length < 40) || "必填且不能超过40个字符"
      ],
      contractNameRule: [
        v => (!!v && v.length < 40) || "必填且不能超过40个字符"
      ],
      projectRule: [
        v => (!!v && !!v.id) || "请选择项目"
      ],
      partyARule: [
        v => (!!v && !!v.id) || "请选择甲方"
      ],
      partyBRule: [
        v => (!!v && !!v.id) || "请选择乙方"
      ],
      priceRule: [
        v => !!v || '必填字段！', v => v > 0 || '请输入正确的数值'
      ],
      payTypeRule: [],
    },
    defaultFlow:"03.采购合同"

  }),

  props: {
    project: Object,
    company: Object
  },

  created() {
    this.reset()
    getConfig('PRO_COMPANY_TYPE').then(c => {
      scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
        if (result.rows.length > 0) {
          result.rows.forEach(item => {
            item.value = item.value || ''
          })
          this.chooseTypeItems = result.rows
          let partyA = JSON.parse(window.localStorage.getItem("partyA"))
          if (partyA && partyA.id) {
            this.partyAItems.push(partyA)
          }
          if (this.partyAItems.length > 0) {
            this.contractModel.contract.partyA = this.partyAItems[0]
          }
        }
      }).finally(()=>{
        let t = localStorage.getItem("addContractChooseType")
        if(t){
          this.chooseType = t
        }else if(this.chooseTypeItems && this.chooseTypeItems.length > 0){
          this.chooseType = this.chooseTypeItems[0].name
        }
      })
    })

  },

  watch: {
    addCompanyDialog(val) {
      val || this.closeAddCompanyDialog()
    },
    "contractModel.contract.partyA":{
      handler(val){
        if(val && val.id){
          localStorage.setItem(this.chooseType,JSON.stringify(val))
        }
      }
    },
    chooseType: {
      handler() {
        localStorage.setItem("addContractChooseType",this.chooseType)
        let ls = localStorage.getItem(this.chooseType)
        let pa
        if(ls &&  (pa = JSON.parse(ls)).id){
          this.partyAItems.push(pa)
          this.contractModel.contract.partyA = pa
        }else{
          if (this.chooseType == "单位1") {
            this.listInit("单位1")
          } else if (this.chooseType == "默认采购") {
            this.listInit(this.$store.state.api.cname)
          }
        }
      },
      deep: true,
    },
    searchProject: {
      handler() {
        if (this.searchProject != null) {
          this.getProjectBySeek(this.searchProject)
        }
      },
      deep: true,
    },
    searchPartyA: {
      handler() {
        if (this.searchPartyA != null) {
          this.listA(this.searchPartyA)
        }
      },
      deep: true,
    },
    searchPartyB: {
      handler() {
        if (this.searchPartyB != null) {
          this.listB(this.searchPartyB)
        }
      },
      deep: true,
    },
    searchPlace: {
      handler() {
        if (this.searchPlace != null) {
          this.searchCity(this.searchPlace)
        }
      },
      deep: true,
    },
    'contractModel.payPlan.payMoney': {
      handler() {
        if (this.contractModel.payPlan.payMoney != null && this.contractModel.payPlan.payMoney != '') {
          this.rules.payTypeRule = [
            v => !!v || '必填字段！'
          ]
        }
      },
      deep: true,
    }
  },

  methods: {
    reset() {
      this.contractModel = {
        contract: {
          serialNumber: null,
          name: null,
          projects: [],
          partyA: {
            name: null,
            id: null,
          },
          partyB: {
            name: null,
            id: null,
          },
          city: {
            name: null,
            id: null,
          },
          price: null,
          type: {
            name: null,
            id: null,
          },
          taxType: null,
          flow: {
            id: null,
          },
          remark: null,
        },
        attaches: [],
        payPlan: {
          payMoney: null,
          remark: null,
          flowId: null,
          payTypeId: null,
        },
      }

      if (this.company) {
        this.contractModel.contract.partyB = this.company
      }

      if (this.project) {
        this.tempProject = this.project
      } else {

        this.tempProject = {
          name: null,
          id: null,
        }
      }
      this.payType = null
      this.payTypeItems = []

      if (this.partyAItems.length > 0) {
        this.contractModel.contract.partyA = this.partyAItems[0]
      }

      this.searchCityInit("南通")
      this.getTypeList()
      this.getType()
      this.getPayType()
      let t = localStorage.getItem("addContractChooseType")
      this.chooseType = t
    },

    getProjectBySeek(str) {
      search(str).then(res => {
        this.projectItems = res
      })
    },
    listA(str) {
      list(str).then(res => {
        this.partyAItems = res
        let temp = JSON.parse(window.localStorage.getItem("partyA"))
        if (temp) {
          this.partyAItems.push(temp)
        }

      })
    },
    listB(str) {
      list(str).then(res => {
        this.partyBItems = res
      })
    },
    listInit(str) {
      list(str).then(res => {
        this.partyAItems = res
        let partyA = JSON.parse(window.localStorage.getItem("partyA"))
        if (partyA) {
          this.partyAItems.push(partyA)
          this.contractModel.contract.partyA = this.partyAItems[0]
        }
      })
    },
    searchCity(str) {
      loadRegion(str).then(res => {
        if (res.length == 0) {
          this.contractModel.contract.city.name = this.searchPlace
          this.contractModel.contract.city.id = null
        } else if (res.length == 1) {
          this.contractModel.contract.city = res[0]
        }
        this.placeItems = res
      })
    },
    searchCityInit(str) {
      loadRegion(str).then(res => {
        this.placeItems = res
        this.contractModel.contract.city = this.placeItems[0]
      })
    },
    getTypeList() {
      getTypeList().then(res => {
        this.typeItems = res
        this.contractModel.contract.taxType = this.typeItems[0]
      })
    },
    getType() {
      getType().then(res => {
        this.contractModel.contract.type.name = res.name
        this.contractModel.contract.type.id = res.id
      })
    },
    getPayType() {
      getPayType().then(res => {
        this.payTypeItems = res
      })
    },
    fileUpload(res) {
      this.contractModel.attaches = []
      for (let x = 0; x < res.files.length; x++) {
        this.contractModel.attaches.push(res.files[x].id)
      }
    },

    validateForm() {
      let flag = null
      if (this.$refs['contractForm'].validate()) {
        flag = true
      } else {
        flag = false
      }
      return flag
    },

    resetFormRules() {
      this.$refs['contractForm'].resetValidation()
      this.$refs['contractForm'].reset()
      if(this.$refs.fileUpload){
        this.$refs.fileUpload.reset()
      }
      window.setTimeout(()=>{
        this.$refs.purchaseFlow.setDefaultFlow()
        if(this.placeItems && this.placeItems.length > 0){
          this.contractModel.contract.city = this.placeItems[0]
        }
        if(this.typeItems && this.typeItems.length > 0){
          this.contractModel.contract.taxType = this.typeItems[0]
        }
        let ls = localStorage.getItem(this.chooseType)
        let a
        if(ls && (a=JSON.parse(ls)).id){
          this.contractModel.contract.partyA = a
        }
      },300)
    },

    saveContract() {
      if (this.contractModel.contract.remark == null || this.contractModel.contract.remark == '') {
        this.contractModel.contract.remark = "无内容"
      }
      if (this.payType != null) {
        this.contractModel.payPlan.payTypeId = this.payType.id
      }
      this.contractModel.contract.projects.push(this.tempProject)
      this.loadDialog = true
      window.localStorage.setItem("partyA", JSON.stringify(this.contractModel.contract.partyA))
      this.partyAItems = [this.contractModel.contract.partyA]
      return insertContract(this.contractModel).then(res => {
        if (res != null) {
          this.reset()

          this.loadDialog = false

          this.$refs['purchaseFlow'].startFlow({
            title: "关于对《" + res.name + "》采购合同的审批",
            content: res.remark == null ? "" : res.remark,
            frameId: res.id,
            frameCoding: 10564,
            frameColumn: 'pd00401'
          }).then()

        }
        return res
      }).catch(e => {
        console.log(e)
      })
    },

    getFlowId(val) {
      if(val){
        this.contractModel.contract.flow.id = val.id
      }
    },
    getPayPlanFlowId(val) {
      if(val){
        this.contractModel.payPlan.flowId = val.id
      }
    },

    showAddCompanyDialog() {
      this.addCompanyDialog = true
    },

    closeAddCompanyDialog() {
      this.addCompanyDialog = false
      this.$refs.addCompany.reset()
    },

    saveCompany() {
      if (this.$refs.addCompany.validateForm() == true) {
        this.$refs.addCompany.saveCompany()
        this.addCompanyDialog = false
      }
    },

    clearChoose() {
      this.chooseType = null;
    }
  },
}
</script>
<style>
.payStyle.theme--light.v-input input, .theme--light.v-input textarea {
  color: red;
}

.payStyle.theme--light.v-select .v-select__selections {
  color: red;
  min-height: 10px;
}

.payStyle.theme--light.v-input input, .theme--light.v-input textarea {
  color: red;
}
</style>
