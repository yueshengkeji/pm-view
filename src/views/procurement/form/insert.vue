<template>
  <div class="pa-3">
    <v-form ref="procurementForm">
      <v-row dense>
        <v-col md="4" cols="12">
          <v-autocomplete dense
                          prepend-icon="mdi-plus"
                          @click:prepend="companyHandler"
                          :rules="rules.company"
                          label="供应单位"
                          item-text="name"
                          @change="companyChange"
                          item-value="id"
                          :items.sync="companyList"
                          :search-input.sync="searchCompany"
                          return-object
                          v-model="data.company"></v-autocomplete>
        </v-col>
        <v-col md="4" cols="12">
          <v-text-field dense
                        :rules="rules.pmNumber"
                        label="订单名称" v-model="data.pmNumber"></v-text-field>
        </v-col>
        <v-col md="1" cols="6">
          <select-staff v-model="data.staff" label="采购职员" dense></select-staff>
        </v-col>
        <v-col md="2" cols="6">
          <v-checkbox v-model="data.isContract"
                      label="是否有合同"
                      hide-details
                      class="shrink mt-0 float-left"
                      dense></v-checkbox>
          <v-checkbox v-model="data.isInvoice" label="有发票" hide-details class="shrink mt-0 float-left"
                      dense></v-checkbox>
        </v-col>
        <v-col md="1" cols="12">
          <easyFlow ref="flow" coding="15306" :defaultUser="data.projectLeader"
                    :default-flow-name="defaultFlowName" dense></easyFlow>
        </v-col>

        <v-col md="4" cols="12">
          <v-autocomplete :items="contractList"
                          prepend-icon="mdi-plus"
                          @click:prepend="contractHandler"
                          dense
                          v-model="data.contract"
                          :search-input.sync="searchContract"
                          label="合同名称"
                          item-value="id"
                          item-text="name"
                          return-object>

          </v-autocomplete>
        </v-col>
        <v-col md="4" cols="12">
          <v-combobox dense
                      label="货运地址"
                      :items="cityList"
                      :search-input.sync="searchCity"
                      return-object
                      item-value="id"
                      item-text="name"
                      v-model="data.city"></v-combobox>
        </v-col>
        <v-col md="1" cols="6">
          <v-text-field @change="changeTax"
                        dense
                        label="税率"
                        counter="2"
                        v-model="data.tax" type="number"></v-text-field>
        </v-col>
        <v-col md="3" cols="6">
          <v-radio-group v-model="companyType" hide-details class="shring mt-0" row>
            <v-radio v-for="ct in companyTypeList"
                     @change="typeChangeHandler(ct)"
                     :key="ct.id"
                     :value="ct.value"
                     :label="ct.name"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col md="6" cols="12">
          <file-upload v-model="fileModel"
                       :mainId="data.id"
                       :loadFile="loadFileFlag"
                       mainCoding="15306"></file-upload>
        </v-col>
        <v-col md="6" cols="12">
          <v-text-field
              @blur="remarkBlur($event)"
              ref="remark"
              label="备注"
              dense
              counter="100"
              v-model="data.remark"></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        <v-spacer></v-spacer>
        <v-col lg="2" cols="12">
          <span>申请人：{{ data.projectLeader.name }}</span>
        </v-col>
        <v-col lg="2" cols="6">
          <div title="显示的申请单跳转过来时的价格">
            成本合计：<a href="###" @click="applyPriceDialog = true">{{ cbCountMoney }}</a>
          </div>
        </v-col>
        <v-col lg="2" cols="6">
          <div>采购合计：<span class="red--text">{{ countMoney }}</span><span v-if="deleteTool"
                                                                             class="grey--text lighten-2"
                                                                             style="font-size:12px;">快速删除行：双击非输入框的列</span>
          </div>
          <!--          <div title="显示的是当前鼠标所在位置的材料">库存：<span class="red&#45;&#45;text">{{ storageSum }}</span></div>-->
        </v-col>
        <v-col lg="2" cols="6">
          <v-menu ref="menu" v-model="menu">
            <template v-slot:activator="{attrs,on}">
              <v-text-field v-bind="attrs" v-on="on" v-model="dhDate" hide-details dense
                            label="到货日期"></v-text-field>
            </template>
            <v-date-picker v-model="dhDate" @change="$refs.menu.save()"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col md="2" cols="6">
          <v-text-field dense label="优惠后合计" hide-details color="primary" primary
                        v-model="data.saleMoney"></v-text-field>
        </v-col>
        <v-btn small class="mr-1" @click="addMaterialHandler">添加材料</v-btn>
        <v-btn @click="saveProcurement"
               :loading="loading"
               small
               class="mr-1"
               title="保存表单数据，不发起审批流程"
               color="primary">保存
        </v-btn>
        <v-btn @click="saveAndFlow" :loading="loading" small title="保存表单数据，并发起审批流程"
               color="primary">提交
        </v-btn>
      </v-row>
      <v-data-table
          @mouseout="storageSum = 0"
          :items="data.material"
          @click:row="rowHandler"
          @dblclick:row="deleteRowHandler"
          ref="table"
          :loading="tableLoading"
          :headers="headers"
          :show-select="select"
          v-model="selectItems"
          style="height: auto;min-height: 290px;cursor: pointer"
          class="edit-height"
          dense
          :items-per-page="10000"
          hide-default-footer>
        <template v-slot:item.material.name="{item}">
          <v-badge v-if="item.update" dot style="position:absolute;" :offset-x="15" :offset-y="20"></v-badge>
          <v-text-field @focus="itemFocus($event)"
                        @change="itemChange($event,item.major+'name')"
                        class="mt-0 pa-0"
                        :id="item.major+'name'"
                        hide-details
                        dense
                        v-model="item.material.name">
          </v-text-field>
        </template>
        <template v-slot:item.material.model="{item}">
          <v-text-field @mouseover="showTooltip($event,item)"
                        @focus="itemFocus($event)"
                        @change="itemChange($event,item.major+'model')"
                        class="mt-0 pa-0"
                        :id="item.major+'model'"
                        hide-details
                        dense
                        v-model="item.material.model"></v-text-field>
        </template>
        <template v-slot:item.material.brand="{item}">

          <v-text-field @focus="itemFocus($event)"
                        @change="itemChange($event,item.major+'brand')"
                        :id="`${item.major}brand`"
                        class="mt-0 pa-0"
                        hide-details dense
                        v-model="item.material.brand"></v-text-field>
        </template>
        <template v-slot:item.material.unit.name="{item}">

          <v-text-field @focus="itemFocus($event)" @change="itemChange($event,item.major+'unit')"
                        :id="`${item.major}unit`"
                        class="mt-0 pa-0"
                        hide-details dense
                        v-model="item.material.unit.name"></v-text-field>
        </template>
        <template v-slot:item.sum="{item}">

          <v-text-field type="number"
                        :rules="[v => !!v || '请输入采购数量']"
                        class="mt-0 pa-0"
                        @blur="itemBlur($event,'sum')"
                        @focus="itemFocus($event)"
                        :id="`${item.major}sum`"
                        hide-details dense v-model="item.sum"></v-text-field>
        </template>
        <template v-slot:item.priceTax="{item}">

          <v-text-field type="number"
                        class="mt-0 pa-0"
                        @blur="itemBlur($event,'priceTax')"
                        @focus="itemFocus($event)"
                        :id="`${item.major}priceTax`"
                        hide-details dense v-model="item.priceTax"></v-text-field>
        </template>
        <template v-slot:item.moneyTax="{item}">

          <v-text-field type="number"
                        class="mt-0 pa-0"
                        @focus="itemFocus($event)"
                        @blur="itemBlur($event,'moneyTax')"
                        :id="`${item.major}moneyTax`"
                        hide-details dense v-model="item.moneyTax"></v-text-field>
        </template>
        <template v-slot:item.dhDate="{item}">
          <div style="width: 40px" @click="showDateMenu($event,item)">{{ subDate(item.dhDate, 5, 10) }}</div>
        </template>
        <template v-slot:item.remark="{item}">

          <v-text-field class="mt-0 pa-0 d-inline-block"
                        :title="item.remark"
                        style="width: 120px"
                        @focus="itemFocus($event)"
                        @blur="itemBlur($event,'remark')"
                        :id="`${item.major}remark`"
                        hide-details dense v-model="item.remark"></v-text-field>
        </template>
        <template v-slot:item.money="{item}">
          {{ formatNumber(item.money) }}
        </template>
        <template v-slot:item.material.storageSum="{item}">
          <span @click="putHistoryHandler(item)" class="text-decoration-underline">{{ item.material.storageSum }}</span>
        </template>
      </v-data-table>
      <v-tooltip max-width="500px" v-model="msgFlag" :activator="thanTooltip">
        <div v-html="msg"></div>
      </v-tooltip>
      <v-menu v-model="menu3" ref="menu3" absolute :position-y="menuY" :position-x="menuX">
        <v-date-picker v-model="lineDhDate" @change="lineDhDateChange">

        </v-date-picker>
      </v-menu>
      <v-menu v-model="menu4" ref="menu4" absolute :position-x="menu4X" :position-y="menu4Y">
        <v-list>
          <v-list-item link @click="deleteRowHandler($event,{item:contentItem})"
                       :disabled="contentItem == null">
            删除
          </v-list-item>
        </v-list>
      </v-menu>
    </v-form>

    <!--        添加单位-->
    <v-dialog v-model="companyDialog" width="80%">
      <v-card class="pa-3">
        <add-company ref="companyForm"></add-company>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="companyDialog = false">取消</v-btn>
          <v-btn color="primary" @click="saveCompany" :loading="loading">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--添加合同-->
    <v-dialog v-model="contractDialog" width="80%">
      <v-card class="pa-3">
        <add-contract ref="contractForm" :project="thanProject" :company="data.company"></add-contract>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="contractDialog = false">取消</v-btn>
          <v-btn color="primary" @click="saveContract">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        添加材料-->
    <v-dialog v-model="materDialog" width="98%">
      <v-card class="pa-3">
        <apply-list ref="applyList" off-gen></apply-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="materDialog = false">取消</v-btn>
          <v-btn @click="newMaterHandler" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    材料入库记录-->
    <v-dialog v-model="putHistoryDialog" width="90%">
      <v-card class="pa-2">
        <put-history :history-items="putHistoryItems"></put-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="putHistoryDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    修改成本单价-->
    <v-dialog v-model="applyPriceDialog" width="60%">
      <v-card>
        <v-data-table :items="data.material" :headers="applyPriceHeaders">
          <template v-slot:item.applyPrice="{item}">
            <v-text-field v-model="item.applyPrice" @change="updateApplyPriceHandler(item)"></v-text-field>
          </template>
          <template v-slot:item.applyMoney="{item}">
            <div>{{ (item.applyPrice * item.sum).toFixed(2) }}</div>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeApplyPriceHandler">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {insert, loadById, update, updateState} from '@/api/procurement'
import {getByCompanyId} from '@/api/contract'
import {getCompanyByMaterial, list as getCompany} from '@/api/company'
import {searchCity} from '@/api/city'
import {getApplyByMaterialId, updatePrice} from '@/api/apply'
import {getConfig, list as scList} from '@/api/systemConfig'
import easyFlow from "../../../components/easyflow/easyFlow"
import materApi from '@/api/material'
import fileUpload from "../../../components/fileUpload"
import {putStorageDetail} from '@/api/put'

export default {
  name: "insert-15306",
  components: {
    easyFlow,
    addCompany: () => import('../../../components/addCompany'),
    addContract: () => import('../../purchaseContractForKaiLi/components/addContract'),
    selectStaff: () => import('../../user/select'),
    fileUpload,
    applyList: () => import('../apply/list'),
    putHistory: () => import('../../company/putHistory.vue')
  },
  props: {
    frameId: String,
    select: Boolean,
  },
  watch: {
    data: {
      handler() {
        this.$emit("change", this.data)
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
        this.$emit("selectItems", this.selectItems)
      }
    },
    searchContract(val) {
      if (val) {
        this.loadContract(val)
      }
    },
    searchCompany(val) {
      if (val) {
        this.loadCompany(val)
      }
    },
    searchCity(val) {
      if (val) {
        this.loadCity(val)
      }
    },
    dhDate() {
      this.data.material.forEach(item => {
        item.dhDate = this.dhDate
      })
    },
  },
  data: () => ({
    applyPriceDialog: false,
    applyPriceHeaders: [
      {text: "材料名称", value: 'material.name', width: '20%'},
      {text: "型号", value: 'material.model', width: '15%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "数量", value: 'sum', width: '10%'},
      {text: "成本单价", value: 'applyPrice', width: '8%'},
      {text: "成本金额", value: 'applyMoney', width: '9%'},
    ],
    cbCountMoney: null,
    deleteTool: false,
    putHistoryDialog: false,
    loading: false,
    materDialog: false,
    rules: {
      company: [
        v => !!v.id || '供应单位不能为空',
      ],
      pmNumber: [
        v => !!v || '订单名称不能为空',
        v => (!!v && v.length < 50) || '订单名称过长，请缩短字符长度',
      ]
    },
    selectItems: [],
    data: null,
    headers: [
      {text: "材料名称", value: 'material.name', width: '20%'},
      {text: "型号", value: 'material.model', width: '15%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "数量", value: 'sum', width: '10%'},
      {text: "库存", value: 'material.storageSum', width: '10%'},
      {text: "单位", value: 'material.unit.name', width: '9%'},
      {text: "单价", value: 'priceTax', width: '8%'},
      {text: "金额", value: 'moneyTax', width: '9%'},
      {text: "不含税金额", value: 'money', width: '9%'},
      {text: "备注", value: 'remark', width: '10%'},
      {text: "已采购", value: 'ySum', width: '5%'},
      {text: "到货日期", value: 'dhDate', width: '5%'},
    ],
    contractList: [],
    searchContract: null,
    companyList: [],
    searchCompany: null,
    cityList: [],
    searchCity: null,
    companyTypeList: [],
    defaultFlowName: '02.采购订单',
    menu: false,
    dhDate: '',
    countMoney: 0,

    isEdit: false,
    item: null,
    thanTooltip: null,
    msg: null,
    msgFlag: false,
    x: 0,
    y: 0,
    menu3: false,
    menuX: 0,
    menuY: 0,
    lineDhDate: null,
    companyDialog: false,

    contractDialog: false,
    thanProject: null,
    fileModel: null,
    sourceMaterMap: [],
    newMaterArray: [],

    projectLeader: [],
    flowFlag: false,
    update: false,
    loadFileFlag: false,

    menu4: false,
    menu4X: 0,
    menu4Y: 0,
    contentItem: null,
    storageSum: 0,
    materialStorageMap: [],
    putHistoryItems: [],
    mc: 0,
    tableLoading: false,
    companyType: '',
    delTemp: []
  }),

  created() {

    if (window.location.hostname == "192.168.2.254") {
      let linkElement = document.createElement('link');

      // 设置 link 元素的属性
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = '/vuetify/font/materialdesignicons.min.css';

      // 获取 head 元素
      let headElement = document.head || document.getElementsByTagName('head')[0];

      // 将 link 元素添加到 head 中
      headElement.appendChild(linkElement);
    }

    this.reset();
    let id = this.$route.params.id
    let update = this.$route.params.update
    if (id && update) {
      this.tableLoading = true
      this.update = true
      this.loadData(id)
    } else if (id) {
      let t = sessionStorage.getItem(id)
      if (t) {
        let data = JSON.parse(t)
        this.setData(data)
      }
    }
    getConfig('PRO_COMPANY_TYPE').then(c => {
      scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
        if (result.rows.length > 0) {
          result.rows.forEach(item => {
            item.value = item.value || ''
          })
          this.companyTypeList = result.rows
        }
      })
    })

    // this.loadData();
  },
  methods: {
    closeApplyPriceHandler() {
      this.applyPriceDialog = false
      this.refreshCbMoney()
    },
    refreshCbMoney() {
      let temp = 0
      this.data.material.forEach(item => {
        temp += item.sum * item.applyPrice
      })
      this.cbCountMoney = temp.toFixed(2)
    },
    updateApplyPriceHandler(item) {
      updatePrice({id: item.major, planPrice: item.applyPrice})
    },
    typeChangeHandler(val) {
      if (val.value == null) {
        val.value = ''
      }
      this.data.pm01326 = val.value
    },
    formatNumber(num) {
      if (num == null) {
        return 0
      }
      return num.toFixed(2);
    },
    putHistoryHandler(item) {
      if (item.material.putHistoryMaterId) {
        putStorageDetail(item.material.putHistoryMaterId.join(";")).then(result => {
          this.putHistoryItems = result
        }).finally(() => this.putHistoryDialog = true)
      }
    },
    queryMaterStorage(mater) {
      if (this.materialStorageMap[mater.id]) {
        return
      }
      this.materialStorageMap[mater.name + mater.model + mater.brand] = mater
      materApi.getStorageList({
        materialName: mater.name,
        materialModel: mater.model,
        materialBrand: mater.brand
      }).then(result => {
        let m = this.materialStorageMap[mater.name + mater.model + mater.brand]
        if (result) {
          m.putHistoryMaterId = []
          result.forEach(item => {
            m.storageSum = item.storageSum
            m.putHistoryMaterId.push(item.id)
          })
        }
      })
    },
    deleteRowHandler(event, {item}) {
      if (event.target.tagName.toLowerCase() == "input") {
        this.deleteTool = true
        return;
      }
      for (let i = 0; i < this.data.material.length; i++) {
        if (item.major === this.data.material[i].major) {
          if(this.update){
            this.delTemp.push(item.id)
          }
          this.data.material.splice(i, 1)
          break;
        }
      }
    },
    newMaterHandler() {
      let materList = this.$refs.applyList.getProMaterial()
      materList.forEach(item => {
        item.index = this.data.material.length + 1
        this.setPriceMoney(item)
        this.data.material.push(item)
        this.queryMaterStorage(item.material)
      })
      this.materDialog = false
    },
    addMaterialHandler() {
      if (this.$refs.applyList) {
        this.$refs.applyList.resetSelectMater()
      }
      this.materDialog = true
    },
    remarkBlur(event) {
      let textArea = event.target
      textArea.style.height = '32px'
    },
    saveContract() {
      if (this.$refs.contractForm.validateForm()) {
        this.$refs.contractForm.saveContract().then(contract => {
          if (contract) {
            this.contractList.push(contract)
            this.data.contract = contract
            if (contract.partyB.id !== this.data.company.id) {
              this.companyList.push(contract.partyB)
              this.data.company = contract.partyB
            }
            this.contractDialog = false
          }
        })
      }
    },
    getApplyId(fd) {
      fd.materialModel.forEach(m => {
        if (m.material.apply) {
          fd.applyList.push(m.material.apply.id)
          if (m.material.apply.project) {
            m.projectId = m.material.apply.project.id
          }
          delete m['apply']
        }
        if (m.projectId === undefined) {
          m.projectId = "-1"
        }
      })
    },
    saveAndFlow() {
      this.flowFlag = true
      this.saveProcurement()
    },
    saveProcurement() {
      this.loading = true
      let t = window.setInterval(() => {
        if (this.mc !== 0) {
          console.log("有材料正在提交，等待...")
          return;
        }
        window.clearInterval(t)
        let v = this.$refs.procurementForm.validate()
        if (v) {
          let attachs = []
          if (this.fileModel && this.fileModel.files) {
            this.fileModel.files.forEach(item => {
              attachs.push(item.id)
            })
          }
          let p = Object.assign({}, this.data)
          p.isContract = p.isContract ? '1' : ''
          p.isInvoice = p.isInvoice ? '1' : ''
          delete p['material']
          this.data.material.forEach(item => {
            delete item['project']
          })
          let fd = {
            procurement: p,
            attachs,
            materialModel: this.data.material,
            applyList: [],
            delMater:this.delTemp
          }
          if (typeof (fd.procurement.city) == 'string') {
            fd.procurement.city = {name: fd.procurement.city}
          }
          this.getApplyId(fd);

          if (this.update) {
            update(fd).then(this.saveCallBack).catch(() => this.loading = false)
          } else {
            insert(fd).then(this.saveCallBack).catch(() => this.loading = false)
          }
        } else {
          let x = 1
          this.data.material.forEach(item => {
            if (isNaN(parseFloat(item.priceTax)) || isNaN(parseFloat(item.sum))) {
              this.message(`第${x}行,${item.material.name}单价或数量不能为空`)
            }
            x++
          })
          this.loading = false
        }
      }, 30)
    },
    saveCallBack(result) {
      sessionStorage.removeItem(this.$route.params.id)
      let p = result.procurement
      this.$emit("success", p)
      if (this.update) {
        localStorage.setItem("upp", "1");
      }
      if (p.id && this.flowFlag) {
        this.$refs.flow.startFlow({
          title: `采购订单[${p.pmNumber}]`,
          content: p.remark || '',
          frameId: p.id,
          frameCoding: 15306,
          frameColumn: 'pm01301'
        }).then(() => {
          //更新订单状态为已发起
          updateState({id: p.id, state: 0}).finally(()=>{
            this.closeWindow()
          })

        }).catch(() => {
          this.loading = false
        })
      } else {
        this.closeWindow()
      }
    },
    closeWindow() {
      this.loading = false
      window.close();
    },
    contractHandler() {
      if (this.thanProject == null) {
        for (let i = 0; i < this.data.material.length; i++) {
          if (this.data.material[i].material &&
              this.data.material[i].material.apply &&
              this.data.material[i].material.apply.project) {
            this.thanProject = this.data.material[i].material.apply.project
            break;
          }
        }
      }
      this.contractDialog = true
    },
    saveCompany() {
      this.loading = true
      this.$refs.companyForm.saveCompany().then(result => {
        this.companyList.push(result)
        this.data.company = result
        this.companyDialog = false
        this.loadContract()
      }).finally(() => this.loading = false)
    },
    companyHandler() {
      this.companyDialog = true
    },
    rowHandler(item) {
      this.item = item
      if (this.item.edit == undefined) {
        this.$set(this.item, 'edit', true)
      } else {
        this.item.edit = true
      }
    },
    lineDhDateChange() {
      this.item.dhDate = this.lineDhDate
      this.$refs.menu3.save()
    },
    showContextMenu(e, {item}) {
      this.contentItem = item
      this.menu4X = e.pageX
      this.menu4Y = e.pageY
      this.$nextTick(() => {
        this.menu4 = true
      })
    },
    showDateMenu(e, item) {
      this.item = item
      this.menuX = e.pageX
      this.menuY = e.pageY
      this.$nextTick(() => {
        this.menu3 = true
      })
    },
    changeTax() {
      this.refreshCountMoney()
    },
    showTooltip(e, item) {
      this.thanTooltip = e.target
      this.msg = item.material.name + "<br/>" + item.material.model
      this.msgFlag = true
    },
    insertMater(m) {
      m.name = m.name.replace(/^\s*|\s*$/g, "");
      m.model = m.model.replace(/^\s*|\s*$/g, "");
      m.unit.name = m.unit.name.replace(/^\s*|\s*$/g, "");
      m.brand = m.brand.replace(/^\s*|\s*$/g, "");
      let idx = this.newMaterArray.indexOf(m.id)
      if (idx !== -1) {
        this.newMaterArray.splice(idx, 1)
      }

      //this.mc++;
      //materApi.newmaterial(m).then(result => {
      //if (result) {
      // m.id = result.id
      //m.unit.id = result.unit.id
      //if (this.sourceMaterMap[m.id] == null) {
      //新添加的材料，没有在申请单原材料中出现过，材料发生变化，改变默认审批流程
      // this.defaultFlowName = '03.采购订单(修改材料)'
      //this.newMaterArray.push(m.id)
      //}
      //this.queryMaterStorage(m)
      //}
      //}).finally(() => {
      // this.mc--;
      //})

    },
    itemFocus(e) {
      this.isEdit = true
      e.target.select()
    },
    itemBlur(event, type) {
      this.$set(this.item, 'edit', false)
      //编辑结束，处理编辑后的行数据
      //let id = event.target.id
      //if (this.container(id, "model")
      //|| this.container(id, "name")
      //|| this.container(id, "unit")
      //|| this.container(id, "brand")) {
      //if (this.container(id, "unit")) {
      //修改单位，将id赋值为空字符
      //this.item.material.unit.id = ""
      //}
      //this.insertMater(this.item.material)
      //}
      // this.isEdit = false
      // window.setTimeout((e,item) => {
      //   if (!this.isEdit) {
      //     this.$set(item, 'edit', false)
      //     //编辑结束，处理编辑后的行数据
      //     let id = e.target.id
      //     if (this.container(id, "model")
      //         || this.container(id, "name")
      //         || this.container(id, "unit")
      //         || this.container(id, "brand")) {
      //       if (this.container(id, "unit")) {
      //         //修改单位，将id赋值为空字符
      //         item.material.unit.id = ""
      //       }
      //       this.insertMater(item.material)
      //     }
      //   }else{
      //     console.log("未保存材料数据")
      //   }
      // }, 210, event,this.item)

      if (type == 'sum' || type == 'priceTax') {
        this.setPriceMoney(this.item)
        this.refreshCountMoney()
      } else if (type == 'moneyTax') {
        //反算单价
        this.item.priceTax = (this.item.moneyTax / this.item.sum).toFixed(2)
        this.setPriceMoney(this.item)
        this.refreshCountMoney()
      }
    },
    itemChange(event, pa2) {
      console.log("itemChange", event, pa2);
      this.$set(this.item, 'edit', false)
      //编辑结束，处理编辑后的行数据
      let id = pa2
      if (this.container(id, "model")
          || this.container(id, "name")
          || this.container(id, "unit")
          || this.container(id, "brand")) {
        if (this.container(id, "unit")) {
          //修改单位，将id赋值为空字符
          this.item.material.unit.id = ""
        }
        this.insertMater(this.item.material)
        this.$set(this.item, "update", true)
        this.defaultFlowName = '03.采购订单(修改材料)'
      }
      /*window.setTimeout(()=>{
          if(!this.isEdit){

          }
      },210)*/
    },
    edit(item, type) {
      this.msgFlag = false
      if (item.edit === undefined) {
        this.$set(item, 'edit', true)
      } else {
        item.edit = true
      }
      window.setTimeout((row, t) => {
        try {
          this.item = item
          document.getElementById(row.major + t).focus()
        } catch (e) {
          console.log(e)
        }
      }, 200, item, type)
    },
    setPriceMoney(m) {
      if (m.sum) {
        if (m.money === undefined) {
          this.$set(m, 'money', 0)
        }
        if (m.priceTax === 0) {
          m.moneyTax = 0
          m.price = m.priceTax
          m.money = m.moneyTax
          m.taxMoney = 0
        } else {
          m.moneyTax = parseFloat((m.sum * m.priceTax).toFixed(2))
          m.money = m.moneyTax / (parseInt(1) + (parseFloat(this.data.tax) / 100))
          m.price = (m.money / m.sum).toFixed(2)
          m.taxMoney = m.moneyTax - m.money
        }
      }
    },
    refreshCountMoney() {
      this.countMoney = 0
      let cbMoney = 0
      this.data.material.forEach(item => {
        //计算不含税金额 和 不含税单价
        this.setPriceMoney(item)
        this.countMoney += item.moneyTax
        cbMoney += item.sum * item.applyPrice
      })
      this.countMoney = this.countMoney.toFixed(2)
      this.cbCountMoney = cbMoney.toFixed(2)
    },
    loadCity(val) {
      searchCity(val).then(result => {
        if (result.length <= 0) {
          this.cityList = []
          this.cityList.push({name: val, id: ''})
        } else {
          this.cityList = result
        }
      })
    },
    loadCompany(val) {
      getCompany(val).then(result => {
        this.companyList = result
      })
    },
    companyChange() {
      this.loadContract()
    },
    loadContract(val) {
      getByCompanyId(this.data.company.id, val).then(result => {
        this.contractList = result
      })
    },
    setData(data) {
      if (data) {
        //默认有合同、有票
        if (!this.update) {
          data.isContract = true
          data.isInvoice = true
          data.remark = null
          data.pm01326 = ''
          data.tax = 13
        } else {
          this.companyList.push(data.company)
        }

        if (data.city && data.city.id) {
          this.cityList.push(data.city)
        }
        data.material.forEach(item => {
          this.sourceMaterMap[item.material.id] = item
          if (item.material.apply) {
            this.projectLeader.push(item.material.apply.staff)
          }
          // insertProEdit(item.major)
          // this.queryMaterStorage(item.material)
        })
        if (data.material.length > 0) {
          getCompanyByMaterial(data.material[0].material).then(result => {
            this.companyList = this.companyList.concat(result)
          })
        }
        this.companyType = data.pm01326
        this.data = data
        this.refreshCountMoney()
      }
    },
    selectRow(data, param) {
      param.select(!param.isSelected)
    },
    loadData(id) {
      loadById(id, true).then(procurement => {
        procurement.projectLeader = {name: null, id: null}
        this.setData(procurement)

        //查找项目经理
        if (procurement.material && procurement.material.length > 0) {
          let major = procurement.material[procurement.material.length - 1].major
          getApplyByMaterialId(major).then(a => {
            procurement.projectLeader = a.staff
          })
        }
        this.loadFileFlag = true
        this.tableLoading = false
      });
    },
    reset() {
      this.data = {
        projectLeader: {name: null},
        company: {name: null},
        city: {name: null},
        staff: {name: null},
        pmNumber: null,
        proCompany: null,
        pmDate: null,
        proMoney: 0,
        material: [],
        isContract: true,
        isInvoice: true,
        remark: null,
        pm01326: '',
        tax: 13,
      }
    }
  }
}
</script>

<style>
.table-edit-row {
  max-height: 28px;
  min-height: 28px;
}

.edit-height > .v-data-table__wrapper > table > tbody > tr > td {
  height: 25px;
}
</style>