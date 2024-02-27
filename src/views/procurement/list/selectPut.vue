<template>
  <div class="mt-3 pl-1 pr-1">
    <v-form ref="putForm" style="height: 100%">
      <v-row :dense="select">
        <v-col md="3" cols="12">
          <v-text-field :dense="select" label="供应单位" v-model="data.company.name"></v-text-field>
        </v-col>
        <v-col md="3">
          <v-text-field :dense="select" label="订单名称" v-model="data.pmNumber"></v-text-field>
        </v-col>
        <v-col md="2">
          <v-text-field :dense="select" label="采购员" v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col lg="2">
          <v-text-field v-model="putDataModel.remark" :dense="select" label="备注信息"></v-text-field>
        </v-col>
        <v-col lg="1">
          <v-text-field v-model="putDataModel.tax"
                        @change="taxChange"
                        type="number"
                        :dense="select"
                        label="入库税率"></v-text-field>
        </v-col>
        <v-col lg="1">
          <storage-manager :dense="select" v-model="putStorage"></storage-manager>
        </v-col>
        <v-col lg="3">
          <v-chip x-small class="mr-1">已选择入库总额：<span class="red--text">{{ selectMoneySum }}元</span></v-chip>
          <v-chip x-small>税额：<span class="red--text">{{ selectTaxMoneySum }}元</span></v-chip>
        </v-col>
        <v-col lg="2">
          <v-text-field :dense="select"
                        hide-details
                        label="生成对账单优惠金额"
                        color="primary"
                        primary
                        type="number"
                        v-model="putDataModel.saleMoney"></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col lg="4">
          <v-text-field hide-details :dense="select" label="搜索"></v-text-field>
        </v-col>
      </v-row>
      <v-data-table
          :items="data.material"
          :headers="headers"
          :show-select="select"
          v-model="selectItems"
          fixed-header
          style="height: 310px;overflow-y: auto;cursor: pointer"
          :dense="!select"
          @click:row="selectRow"
          :items-per-page="10000"
          hide-default-footer>
        <template v-slot:item.putSum="{item}">
          <v-text-field @input="countMoney(item)"
                        type="number"
                        :error="item.error"
                        @focus="focusPutSum($event)"
                        hide-details
                        dense
                        v-model="item.putSum"></v-text-field>
        </template>
        <template v-slot:item.priceTax="{item}">
          <v-text-field type="number" @input="countMoney(item)"
                        @focus="focusPrice($event)" hide-details dense v-model="item.priceTax"></v-text-field>
        </template>
      </v-data-table>
      <!--<v-row :dense="select" align="end" justify="end" class="text-right">
          <v-col cols="12">


          </v-col>
      </v-row>-->
    </v-form>

    <v-row dense class="text-right v-footer--absolute" style="bottom: 10px">
      <v-col cols="12">


        <v-autocomplete label="项目经理"
                        :items="staffList"
                        :search-input.sync="searchStaff"
                        hint="请输入项目经理姓名"
                        class="float-right ml-1"
                        :rules="rules.projectLeaderRule"
                        hide-details
                        dense
                        item-text="name"
                        item-value="id"
                        return-object
                        v-model="putDataModel.projectLeader">

        </v-autocomplete>

        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{on,attrs}">
            <v-text-field style="width: 150px;" class="float-right"
                          dense
                          hide-details
                          :rules.sync="rules.signPastDateRule"
                          v-model="putDataModel.pastDate"
                          label="过期时间"
                          v-bind="attrs"
                          v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="putDataModel.pastDate" @change="$refs.menu.save()">

          </v-date-picker>
        </v-menu>
        <v-chip class="mr-1" color="error"
                x-small
                v-if="signHistory"
                link
                target="_blank"
                :to="'/procurement/signPut/'+signHistory.id+'/1'">
          入库签字记录:{{
            '发送时间:' + signHistory.putDate + ',签字人员：' + signHistory.signStaff.name + ',状态：' + getSignType(signHistory.type)
          }}
        </v-chip>
        <v-btn small class="mr-1" @click="closeWindow(null)">关闭</v-btn>
        <v-btn @click="putListHandler" small class="mr-1">入库记录</v-btn>
        <v-btn :disabled="disabled" :loading="saveLoading" small color="primary" class="mr-1" title="选中材料直接入库"
               @click="savePut">
          直接入库
        </v-btn>
        <v-btn :disabled="disabled"
               :loading="saveLoading"
               small class="mr-1" color="primary" title="项目经理签字后方可入库"
               @click="saveByLeaderSign">项目经理确认入库
        </v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {loadById, noPutMaterial} from '@/api/procurement'
import {deletePutSign, getProSign, partPutProMaterial, partPutProMaterialAndSign} from '@/api/put'
import {getStaff} from '@/api/staff'
import {getApplyByMaterialId} from '@/api/apply'
import storageManager from "../../storage/storageManager"
import {getConfig, list as scList} from "@/api/systemConfig";

export default {
  name: "selectPut",
  components: {
    storageManager
  },
  props: {
    frameId: String,
    procurement: {
      type: Object,
      default: null
    }
  },
  watch: {
    procurement: {
      handler() {
        if (this.procurement) {
          this.reset()
          this.loadData();
        }
      },
      deep: true
    },
    frameId: {
      handler() {
        this.reset();
        this.loadData();
      },
      deep: true,
    },
    selectItems: {
      handler() {
        this.setPutMoneySum()
        this.$emit("selectItems", this.selectItems)
      }
    },
    searchStaff: {
      handler(val) {
        getStaff(val).then(result => {
          this.staffList = result
        })
      },
      deep: true,
    },
    "putDataModel.projectLeader": {
      handler() {
        this.putDataModel.projectLeaderId = this.putDataModel.projectLeader.id
        this.putDataModel.projectLeaderName = this.putDataModel.projectLeader.name
      },
      deep: true
    },
    "rules.validSign": {
      handler() {
        if (this.rules.validSign) {
          this.$set(this.rules, 'projectLeaderRule', [v => (!!v && !!v.id) || "请选择项目经理"])
          this.$set(this.rules, 'signPastDateRule', [v => !!v || "请选择签字确认过期日期"])
        } else {
          this.rules.projectLeaderRule = []
          this.rules.signPastDateRule = []
        }
      },
      deep: true
    },
  },
  data: () => ({
    saveLoading: false,
    disabled: true,
    selectItems: [],
    data: null,
    headers: [
      {text: "序号", value: 'index', width: '6%'},
      {text: "材料名称", value: 'material.name', width: '20%'},
      {text: "型号", value: 'material.model', width: '15%'},
      {text: "单位", value: 'material.unit.name', width: '9%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "采购总数", value: 'sum', width: '8%'},
      {text: "已入库数量", value: 'inSum', width: '10%'},
      {text: "本次入库数量", value: 'putSum', width: '10%'},
      {text: "采购单价", value: 'priceTax', width: '8%'},
      {text: "金额", value: 'moneyTax', width: '9%'},
      // {text: "备注", value: 'remark', width: '10%'},
    ],
    selectMoneySum: 0,

    putDataModel: null,
    select: false,
    menu: false,
    staffList: [],
    searchStaff: null,
    msgFlag: false,
    msg: '',
    putStorage: null,
    storageList: [],
    selectTaxMoneySum: 0,
    rules: {
      validSign: false,
      signPastDateRule: [],
      projectLeaderRule: []
    },
    signHistory: null,
    companyTypeList: []
  }),
  created() {

    let pct = localStorage.getItem("PRO_COMPANY_TYPE")
    if (pct && pct != "") {
      this.companyTypeList = JSON.parse(pct)
      if (this.data && this.data.pm01326) {
        this.data.proCompany = this.companyTypeList[this.data.pm01326].name
      }
      this.select = true
      this.reset();
      this.loadData();
    } else {
      getConfig('PRO_COMPANY_TYPE').then(c => {
        scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
          if (result.rows.length > 0) {
            result.rows.forEach(item => {
              item.value = item.value || ''
              this.companyTypeList[item.value] = item
            })
            localStorage.setItem("PRO_COMPANY_TYPE", JSON.stringify(this.companyTypeList))
            if (this.data && this.data.pm01326) {
              this.data.proCompany = this.companyTypeList[this.data.pm01326].name
            }
          }
        }).finally(() => {
          this.select = true
          this.reset();
          this.loadData();
        })
      })
    }

  },
  methods: {
    putListHandler(){
      this.$emit("putListHandler")
    },
    getSignType(type) {
      if (type == 0) {
        return "未签字"
      } else if (type == 1) {
        return "已签字"
      } else {
        return '已过期自动入库'
      }
    },
    taxChange() {
      this.selectItems.forEach(item => {
        this.setPrice(item)
        this.setMoney(item)
      })
      this.setPutMoneySum()
    },
    getPutMaterial() {
      let m = [];
      this.selectItems.forEach(item => {
        let temp = {
          material: item.material,
          putSum: item.putSum,
          price: 0,
          money: 0,
          taxMoney: 0,
          taxPrice: item.priceTax,
          priceTax: item.priceTax,
          moneyTax: item.moneyTax,
          proMaterId: item.id,
          projectId: item.projectId,
        }
        this.setPrice(temp)
        this.setMoney(temp)
        m.push(temp)
      })
      return m;
    },
    saveByLeaderSign() {
      this.rules.validSign = true
      this.tipAndSave()
    },
    tipAndSave() {
      if (this.signHistory) {
        this.confirm("该订单已发送给项目经理，确定再次发送吗？之前发送的未签字的入库单会被自动取消（仅作用相同采购订单）").then(() => {
          //删除之前的签字订单
          deletePutSign(this.signHistory.id)
          //保存最新的签字申请
          this.save()
        })
      } else {
        this.save()
      }
    },
    save() {
      if (this.selectItems.length > 0) {
        if (this.putStorage == null || this.putStorage.id == null || this.putStorage.id == "") {
          this.msg = '请指定入库仓库'
          this.msgFlag = true
        } else {
          this.saveLoading = true
          let valid = this.$refs.putForm.validate()
          window.setTimeout(() => {
            if (valid) {
              let ml = this.getPutMaterial()
              for (let i = 0; i < ml.length; i++) {
                let m = ml[i];
                m.putSum = parseFloat(m.putSum)
                if (isNaN(m.putSum) || m.putSum <= 0) {
                  this.$set(m, "error", true)
                  this.saveLoading = false
                  this.message("第" + (i + 1) + "行，入库数量不能为空")
                  return;
                }
              }

              this.putDataModel.materialList = ml

              this.putDataModel.storageId = this.putStorage.id
              this.putDataModel.proId = this.data.id
              if (this.rules.validSign) {
                //签字确认入库
                partPutProMaterialAndSign(this.putDataModel).then(result => {
                  this.closeWindow(result)
                }).finally(() => this.saveLoading = false)
              } else {
                //直接入库
                partPutProMaterial(this.putDataModel).then(result => {
                  this.closeWindow(result)
                }).finally(() => this.saveLoading = false)
              }
            } else {
              this.saveLoading = false
            }
          }, 100)

        }
      } else {
        this.msg = '没有可入库的材料'
        this.msgFlag = true
      }
    },
    savePut() {
      this.rules.validSign = false
      this.tipAndSave()
    },
    closeWindow(putState) {
      // window.location.href = "about:blank";
      // window.close();closePutHandler
      this.loadNoPutMater(this.data)
      this.selectItems = []
      this.$emit('closePutHandler', putState)
    },
    setPutMoneySum() {
      this.selectMoneySum = 0
      this.selectTaxMoneySum = 0
      this.selectItems.forEach(item => {
        this.selectMoneySum += item.moneyTax
        this.selectTaxMoneySum += item.taxMoney
      })
      this.selectMoneySum = this.selectMoneySum.toFixed(2)
      this.selectTaxMoneySum = this.selectTaxMoneySum.toFixed(2)
    },
    //设置不含税单价
    setPrice(mater) {
      if (this.putDataModel.tax == "" || this.putDataModel.tax <= 0) {
        mater.price = mater.priceTax
      } else {
        mater.price = mater.priceTax / (parseInt(1) + (parseFloat(this.putDataModel.tax) / 100))
      }
      // console.log("mater.moneyTax=",mater.priceTax,this.putDataModel.tax / 100)
    },
    //设置税额、不含税总金额
    setMoney(mater) {
      if (mater.price == 0) {
        mater.money = mater.moneyTax
        mater.taxMoney = 0
      } else {
        //不含税总金额 = 入库数量 * 不含税单价
        mater.money = mater.putSum * mater.price
        //税额 = 含税总金额 - 不含税总金额
        mater.taxMoney = mater.moneyTax - mater.money
      }

    },
    countMoney(mater) {
      if (mater.putSum && mater.putSum !== '' && mater.priceTax && mater.priceTax !== '') {
        //含税总金额 = 入库数量 * 含税单价
        mater.moneyTax = mater.putSum * mater.priceTax
        //不含税单价
        this.setPrice(mater)
        this.setMoney(mater)
        this.setPutMoneySum()
      }
    },
    focusPrice(e) {
      e.target.select()
    },
    focusPutSum(e) {
      e.target.select()
    },
    selectRow(data, param) {
      param.select(!param.isSelected)
    },
    loadData() {
      this.putDataModel.projectLeader = {name: null, id: null}
      if (this.procurement) {
        this.loadDetail(this.procurement)
      } else {
        loadById(this.frameId || this.data.id).then(procurement => {
          this.loadDetail(procurement)
        });
      }
    },
    setCompanyName(procurement) {
      try {
        procurement.proCompany = this.companyTypeList[procurement.pm01326].name
      } catch (e) {
        procurement.proCompany = "默认采购"
        console.log(e)
      }
    },
    loadDetail(p) {
      let procurement = Object.assign({}, p)
      if (procurement != null) {
        if ((procurement.putState == 0 || procurement.putState == 3) && procurement.state == 1) {
          this.disabled = false
        }

        if (procurement.city == null) {
          procurement.city = {name: null};
        }
        procurement.proMoney = 0.0;
        procurement.avgMoneys = 0.0;
        procurement.proMoney = procurement.proMoney.toFixed(2);
        procurement.avgMoneys = procurement.avgMoneys.toFixed(2);
        if (procurement.pm01326 == "true") {
          procurement.pm01326 = ''
        }
        this.setCompanyName(procurement)
        if (procurement.saleMoney == 0 || procurement.saleMoney == "") {
          procurement.saleMoney = "无优惠";
        }
        this.loadNoPutMater(procurement)
        this.checkSignPut(procurement.id)
      }
    },
    loadNoPutMater(procurement) {
      let loadApply = false
      noPutMaterial(procurement.id).then(ms => {
        this.putDataModel.tax = procurement.tax
        ms.forEach((mater, index) => {
          mater.index = index + 1
          procurement.proMoney += mater.moneyTax
          procurement.avgMoneys += mater.sum * mater.applyPrice
          mater.putSum = mater.sum - mater.inSum
          mater.moneyTax = mater.putSum * mater.priceTax
          this.setPrice(mater)
          this.setMoney(mater)
        })
        if (ms.length > 0 && !loadApply) {
          loadApply = true
          this.loadApply(ms[0].major)
        }
        procurement.material = ms
      }).finally(() => {
        this.data = procurement
      })
    },
    loadApply(applyMaterialId) {
      getApplyByMaterialId(applyMaterialId).then(result => {
        if (result && result.id) {
          this.staffList.push(result.staff)
          this.putDataModel.projectLeader = result.staff
        }
      })
    },
    reset() {
      this.data = {
        id: this.$route.params.id,
        company: {name: null},
        city: {name: null},
        staff: {name: null},
        pmNumber: null,
        proCompany: null,
        pmDate: null,
        proMoney: 0,
        material: []
      }
      this.putDataModel = {
        proId: null,
        storageId: null,
        materialList: null,
        pastDate: this.dateAfter(5),
        projectLeaderId: null,
        projectLeaderName: null,
        remark: null,
        tax: null,
        saleMoney: null,
        projectLeader: {name: null, id: null}
      }
      this.selectItems = []
    },
    checkSignPut(proId) {
      this.signHistory = null
      getProSign(proId).then(result => {
        if (result && result.id) {
          this.signHistory = result
        }
      })
    }
  }
}
</script>

<style scoped>

</style>