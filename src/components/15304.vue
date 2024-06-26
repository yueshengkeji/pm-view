<template>
  <div>
    <v-subheader>采购申请单明细<span class="red--text ml-3" v-if="showWaring">{{ waringMsg }}</span></v-subheader>
    <v-form ref="paymentForm" class="pa-3">
      <v-row dense>
        <v-col sm="4" cols="12">
          <v-autocomplete label="项目名称"
                          ref="applyProject"
                          dense
                          :items="projects"
                          :search-input.sync="searchProject"
                          item-text="name"
                          auto-select-first
                          return-object
                          @input="selectProject"

                          v-model="data.project"></v-autocomplete>
        </v-col>
        <v-col sm="6" cols="12">
          <v-text-field :loading="checkLoading"
                        :error-messages="applyError"
                        :rules="rules.serialNumber"

                        ref="seriesNumber"
                        @blur="verifyApplyName"
                        dense
                        label="申请单"
                        v-model="data.serialNumber"
          ></v-text-field>
        </v-col>
        <v-col sm="2" cols="6">
          <v-text-field dense label="申请人" v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col sm="12" cols="12">
          <v-autocomplete label="货运地址"
                          item-text="name"
                          dense
                          :items="citys"
                          @blur="blurCitys"
                          :search-input.sync="searchCitys"
                          auto-select-first
                          return-object
                          v-model="data.city"></v-autocomplete>
        </v-col>
        <v-col sm="10" cols="12">
          <v-text-field dense label="备注" v-model="data.remark"></v-text-field>
        </v-col>
        <v-col sm="2" cols="12">
          <v-text-field dense label="合计" v-model="data.applyMoney"
          ></v-text-field>
        </v-col>
        <v-col lg="3" md="2" sm="3" cols="6" v-if="!edit">
          <easy-flow
              dense
              :instance="flowMsg"
              :success="success"
              :change="changeFlow"
              :start="startFlow"
              coding="15304">

          </easy-flow>
        </v-col>
        <v-spacer></v-spacer>
        <v-btn @click="downloadExcel" v-if="!edit && showImport" title="材料库选择材料">下载导入模板</v-btn>
        <v-btn color="primary" class="ml-1" @click="importBtn" :disabled="edit" v-if="!edit && showImport">
          <v-icon>mdi-upload</v-icon>
          导入
        </v-btn>
        <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
               type="file"
               ref="excelUpload"
               id="excelUpload"
               @change="implUserExcel" accept=".xlsx,.xls"/>

        <v-btn @click="openMaterial(false)" v-if="!edit" class="ml-1"
               title="辅材库或者材料库选择材料，根据不同角色权限分配">
          {{
            isLoadFuCai == null ?
                '材料库' : '辅材库'
          }}
        </v-btn>
        <v-btn @click="importByPlan" v-if="!edit" class="ml-1">计划单材料库</v-btn>
        <v-btn :loading="sumitLoading" @click="savePlanAndFLow" color="primary" v-if="!edit" title="保存并发起流程"
               class="ml-1">提交
        </v-btn>
        <v-btn :loading="sumitLoading" @click="savePlan" color="primary" v-if="!edit" title="暂存不发起审批流程"
               class="ml-1">保存
        </v-btn>
      </v-row>
      <v-row class="overflow-x-hidden">
        <v-col cols="12">
          <v-progress-linear :value="percentage.number"
                             v-show="percentage.show"
                             :height="18"
                             rounded
                             :active="percentage.linerActive">
            <template v-slot:default="{value}">

              <span v-if="value !== 100" style="color:#FFFF">{{ msg + ' ' + value + '%' }}</span>

              <span v-else style="color:#FFFF">{{ msg }}</span>

            </template>
          </v-progress-linear>
          <v-data-table
              :loading="loading"
              :items="data.applyMaterialList"
              item-key="planRowId"
              :headers="headers"
              fixed-header
              :items-per-page="-1"
              hide-default-footer
              dense
              height="310"
              calculate-widths
              @click:row="clickRow"
              @dblclick:row="removeItem"
              :show-select="showSelect"
              :value="selectItems"
              @input="select">
            <template v-slot:item.model="{item}">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div color="primary" dark v-bind="attrs" v-on="on">
                    <div>{{ item.model }}</div>
                  </div>
                </template>
                <div v-html="item.model+'<br/>技术参数：'+item.cnfParam"></div>
              </v-tooltip>
            </template>
            <template v-slot:item.sum="{item}">
              <v-edit-dialog :return-value.sync="updateSum"
                             large
                             @save="saveSum(item,updateSum)"
                             save-text="保存"
                             cancel-text="取消">

                <v-icon left x-small v-if="!edit">
                  mdi-lead-pencil
                </v-icon>
                {{ item.sum }}
                <template v-slot:input>
                  <div class="mt-4 title">
                    请输入申请数量
                  </div>
                  <v-text-field v-model="updateSum"
                                type="number"
                                :disabled="edit"
                                @focus="inputFocus($event,item)"
                                label="申请数量"
                                counter
                                autofocus></v-text-field>
                </template>

              </v-edit-dialog>
            </template>
            <template v-slot:item.remark="props">
              <v-edit-dialog
                  :return-value.sync="updateRemark"
                  large
                  @save="saveRemark"
                  save-text="保存"
                  cancel-text="">
                <!--                        <div class="v-alert__border&#45;&#45;bottom">{{ props.item.remark }}</div>-->

                <v-icon left x-small>
                  mdi-lead-pencil
                </v-icon>
                <div class="text-no-wrap text-truncate" style="width: 100px" :title="props.item.remark">
                  {{ props.item.remark }}
                </div>
                <template v-slot:input>
                  <div class="mt-4 title">
                    追加备注
                  </div>
                  <v-textarea
                      @blur="saveRemark"
                      @focus="editRemark(props.item)"
                      v-model="updateRemark"
                      label="追加备注"
                      counter
                      autofocus
                  ></v-textarea>
                </template>
              </v-edit-dialog>
            </template>
            <template v-slot:item.planPrice="{item}">
              {{ formatNumber(item.planPrice) }}
            </template>
            <template v-slot:item.moneyTax="{item}">
              {{ formatNumber(item.moneyTax) }}
            </template>
            <template v-slot:item.applySum="{item}">
              <a href="###" @click="applyHistoryHandler(item)">{{ item.applySum }}</a>
            </template>

            <template v-slot:item.cnfParam="{item}">
              <div class="text-no-wrap text-truncate" style="width: 70px" :title="item.cnfParam">
                {{item.cnfParam}}
              </div>
            </template>

            <template v-slot:item.ySum="{item}">
              <a target="_blank" :href="'/procurement/apply/materialProHistory/'+item.major">{{item.ySum}}</a>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>
    <v-dialog v-model="planDialog">
      <v-card class="pa-5">
        <v-card-title>请选择材料</v-card-title>
        <v-row dense>
          <v-col cols="10">
            <v-text-field label="搜索" @change="importByPlan" v-model="searchPlan"></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-checkbox @change="importByPlan" v-model="applyType" label="已申请"></v-checkbox>
          </v-col>
        </v-row>
        <v-data-table :items.sync="planMaterData.rows"
                      item-key="id"
                      :server-items-length="planMaterData.total"
                      :loading="planLoading"
                      :options.sync="planOptions"
                      :items-per-page="30"
                      @click:row="clickPlan"
                      show-select
                      height="400"
                      @input="selectPlan"
                      :value="selectPlanItems"
                      :headers="planHeaders">
          <template v-slot:item.applySum="{item}">
            <router-link v-if="item.applySum > 0"
                         target="_blank"
                         :to="'/apply/listByApplyRowId/'+item.id">{{ item.applySum }}
            </router-link>
            <div v-else>{{ item.applySum }}</div>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="planToApply" color="primary">确定</v-btn>
          <v-btn @click="planDialog = false" class="mr-1">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <select-material @close="closeMaterial"
                     :show="showMaterial"
                     :isLoadFuCai="isLoadFuCai"
                     @select="materialToApply"></select-material>
    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
    <v-snackbar centered v-model="tooltip" :timeout="-1">{{ tooltipContent }}
      <v-btn color="primary" @click="openMaterial(true)">知道了</v-btn>
    </v-snackbar>

    <v-dialog v-model="applyHistoryDialog">
      <v-card class="pa-3">
        <list-by-plan-row-id :id="planRowId"></list-by-plan-row-id>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="applyHistoryDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import xlsx from 'xlsx';
import excelExport from '@/utils/excel-export';
import {checkApplyName, insertApply, loadById, saveRemark, updateApply} from '@/api/apply'
import easyFlow from '@/components/easyflow/easyFlow'
import selectMaterial from '@/components/material/select'
import {search} from '@/api/project'
import {searchCity} from '@/api/city'
import {getMaterByProject} from '@/api/plan'
import material from "@/api/material";

export default {
  name: "frame-15304",
  components: {
    easyFlow,
    selectMaterial,
    listByPlanRowId: () => import('@/views/apply/listByApplyRowId.vue')
  },
  props: {
    frameId: String,
    showSelect: {
      type: Boolean,
      default: false,
    },
    /**
     * 当前选择的材料数组
     */
    select: {
      type: Function,
      default: () => {
      }
    },
    /**
     * 重置选择数据
     */
    resetSelect: {
      type: Boolean,
      default: false,
    },
    loadNoPro: {
      type: Boolean,
      default: false
    },
    edit: {
      type: Boolean,
      default: true
    },
  },
  watch: {
    resetSelect: {
      handler() {
        if (this.resetSelect) {
          this.selectItems = [];
          if (this.data != null) {
            this.loadData();
          }
        }
      },
      deep: true
    },
    frameId: {
      handler() {
        this.reset();
        if (this.frameId != null) {
          this.loadData();
        }
      },
      deep: true
    },
    searchProject(value) {
      this.loadProject(value)
    },
    searchCitys(value) {
      if (value != '') {
        searchCity(value).then(data => this.citys = data).finally(() => {
          if (this.citys.length <= 0) {
            this.citys.push({name: value, id: -1});
          }
        })
      }
    },
    planOptions: {
      handler() {
        this.importByPlan()
      },
      deep: true
    },
    "data.applyMaterialList": {
      handler() {
        this.checkWaring()
      },
      deep: true
    }
  },
  data: () => ({
    loading: false,
    searchPlan: null,
    planLoading: false,
    planOptions: {},
    //false=可申请采购，true=申请采购完成
    applyType: false,
    checkLoading: false,
    applyError: null,
    sumitLoading: false,
    updateRemark: null,
    data: null,
    editRow: null,
    headers: [
      {text: "序号", value: 'index'},
      {text: "材料名称", value: 'name', width: '200px'},
      {text: "型号", value: 'model', width: '150px'},
      {text: "参数", value: 'cnfParam', width: '50px'},
      {text: "单位", value: 'unit.name'},
      {text: "品牌", value: 'brand', width: '100px'},
      {text: "申请数", value: 'sum'},
      {text: "备注", value: 'remark', width: '100px'},
      {text: "已采购", value: 'ySum'},
    ],
    selectItems: [],

    startFlow: false,
    flow: null,
    flowMsg: {},

    projects: [],
    searchProject: null,
    citys: [],
    searchCitys: null,
    planMaterData: {
      rows: [],
      total: 0
    },
    planHeaders: [
      {text: '系统名称', value: 'taskId', width: '10%'},
      {text: '材料名称', value: 'material.name', width: '15%'},
      {text: '型号', value: 'material.model', width: '15%'},
      {text: '单位', value: 'material.unit.name', sortable: false},
      {text: '品牌', value: 'material.brand'},
      {text: '设计数量', value: 'planSum'},
      {text: '已申请', value: 'applySum'},
      {text: '技术参数', value: 'cnfStr', width: '25%', sortable: false},
    ],
    planDialog: false,
    selectPlanItems: [],
    updateSum: null,
    noFlow: false,

    msg: "",
    msgShow: false,

    showMaterial: false,
    percentage: {
      number: 0,
      show: false,
      linerActive: false,
    },

    showImport: false,

    tooltipContent: '',
    tooltip: false,
    //是否只加载材料库辅材信息
    isLoadFuCai: "1",

    rules: {
      serialNumber: [
        v => !!v || '申请单名称过长，请缩短字符'
      ]
    },
    showWaring: false,
    waringMsg: null,
    applyHistoryDialog: false,
    planRowId: null
  }),

  created() {
    this.loadProject()
    if (this.edit) {
      this.headers.splice(6, 0,
          {text: "计划数", value: 'planSum'},
          {text: "已申请", value: 'applySum'},
          {text: "成本", value: 'planPrice', class: 'hidden'},
          {text: "合计", value: 'moneyTax', class: 'hidden'})
    }

    if (this.$store.state.user.roles.indexOf('材料导入') != -1 && !this.edit) {
      this.showImport = true
      this.isLoadFuCai = null
    }
    this.reset()
    this.loadData()
  },
  methods: {
    applyHistoryHandler(item) {
      this.applyHistoryDialog = true
      this.planRowId = item.planRowId
    },
    loadProject(value) {
      if (value && value != '') {
        search(value).then(data => {
          this.projects = data;
        })
      }
    },
    verifyApplyName() {
      if (this.data.serialNumber.length > 50) {
        this.applyError = "字符过长，请缩短字符"
        return;
      }
      this.checkLoading = true
      checkApplyName(this.data.serialNumber).then(data => {
        let result = data
        if (result != null && result.id != this.data.id) {
          this.applyError = "申请单名称（编号）已存在，请重新填写"
        } else {
          this.applyError = null
        }
      }).catch(() => {
        this.applyError = null
      }).finally(() => {
        this.checkLoading = false;
      })
    },
    formatNumber(num) {
      if (num == null) {
        return 0
      }
      return num.toFixed(2);
    },
    blurCitys() {

      if (this.data.city.id == null || this.data.city.id == "") {
        try {
          this.data.city = this.citys[0]
        } catch (e) {
          console.log(e)
        }
      }
    },
    implUserExcel(e) {
      import("xlsx").then(xlsx => {
        let reader = new FileReader()
        let than = this;
        reader.onload = function (e) {
          than.errorMaterData = []
          const workbook = xlsx.read(e.target.result, {type: 'binary'})
          let sheetList = workbook.SheetNames
          sheetList.forEach(async (name) => {
            let importArray = []
            let worksheet = workbook.Sheets[name]
            let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["series", "name", "model", "brand", "unitName", "storageSum", "planPrice", "remark"]})
            than.percentage.linerActive = true
            than.percentage.show = true
            for (let x = 1; x < newMater.length; x++) {
              than.msg = "正在处理材料清单,第" + x + "行"
              than.percentage.number = parseInt(x / newMater.length * 100)
              await new Promise((resolve, reject) => {
                window.setTimeout((j) => {
                  try {
                    let m = than.sheetMaterialModel(newMater[j])
                    m.index = j + 1
                    if (than.verifyMaterial(m)) {
                      importArray.push(m)
                    }
                    resolve(m)
                  } catch (e) {
                    reject(e)
                  }
                }, 10, x)
              })
            }
            than.importMater(importArray)
          })
        }
        if (e.target.files[0] != null) {
          //读取数据
          reader.readAsBinaryString(e.target.files[0])
        }
      })

    },
    importMater(ms) {
      this.percentage.linerActive = true
      this.percentage.show = true
      ms.forEach(async (val, index) => {
        await new Promise((resolve, reject) => {
          window.setTimeout(async (item, idx) => {
            this.msg = `正在上传${item.name}`
            this.percentage.number = parseInt((idx + 1) / ms.length * 100)
            await material.newmaterial(item).then(result => {
              if (result.id != null) {
                result.index = this.data.applyMaterialList.length + 1
                result.serialNumber = this.data.applyMaterialList.length + 1
                result.sum = result.storageSum
                result.ySum = 0
                result.cnfParam = ''
                result.planRowId = result.id
                this.data.applyMaterialList.push(result)
              }
              if ((idx + 1) == ms.length) {
                this.msg = `导入成功`
                this.msgShow = true
              }
            }).catch((e) => {
              this.msg = e
              this.msgShow = true
              reject(e)
            }).finally((result) => {
              resolve(result)
            })
          }, 10, val, index)
        })
      })
    },
    verifyMaterial(m) {
      let result = false;
      if (m.material !== null) {
        if (!this.isNotNull(m.model)) {
          m.model = ""
        }
        if (!this.isNotNull(m.remark)) {
          m.remark = ""
        }
        if (!this.isNotNull(m.name)) {
          this.msg = "第" + m.index + "行，材料名称不能为空"
        } else if (!this.isNotNull(m.storageSum)) {
          this.msg = "第" + m.index + "行，申请采购数量不能为空"
        } else if (!this.isNotNull(m.unit) || !this.isNotNull(m.unit.name)) {
          this.msg = "第" + m.index + "行，材料单位不能为空"
        } else if (!this.isNotNull(m.brand)) {
          this.msg = "第" + m.index + "行，材料品牌不能为空"
        } else if (!this.isNotNull(m.planPrice) || isNaN(m.planPrice)) {
          m.planPrice = 0;
          result = true
        } else {
          result = true
        }
      }
      return result
    },
    sheetMaterialModel(m) {
      m.name = this.materialTrim(m.name)
      m.model = this.materialTrim(m.model)
      m.remark = this.materialTrim(m.remark)
      m.brand = this.materialTrim(m.brand)
      m.unit = {name: this.materialTrim(m.unitName)}
      m.planPrice = this.materialTrim(m.planPrice)
      m.storageSum = this.materialTrim(m.storageSum)
      return m
    },
    materialTrim(str) {
      if (str == null) {
        return null;
      } else {
        str = "" + str
      }
      try {
        return str.replace(/\s/g, "").replace(/[\r\n]/g, "")
      } catch (e) {
        console.log(str, e)
        return null
      }
    },
    importBtn() {
      if (this.data.project.id === null || this.data.project.id === "") {
        this.msg = "请选择项目"
        this.msgShow = true
        this.$refs.applyProject.focus()
      } else {
        console.log("开始上传")
        this.$refs.excelUpload.click()
      }
    },
    downloadExcel() {
      excelExport([
        {key: 'index', title: '序号'},
        {key: 'name', title: '材料名称'},
        {key: 'model', title: '规格型号'},
        {key: 'brand', title: '品牌'},
        {key: 'unitName', title: '单位'},
        {key: 'storageSum', title: '数量'},
        {key: 'planPrice', title: '单价'},
        {key: 'remark', title: '备注'},
      ], [
        {index: '', name: '', model: "", brand: "", unitName: "", sum: "", price: "", remark: ""},
      ], "申请单导入模板.xlsx");
    },
    removeItem(event, {item}) {
      this.data.applyMaterialList.forEach((m, idx) => {
        if (item.planRowId == m.planRowId) {
          console.log("m idx,", m.planRowId, idx)
          this.data.applyMaterialList.splice(idx, 1);
        }
      })
    },
    closeMaterial(isOpen) {
      this.showMaterial = isOpen
    },
    openMaterial(hideTooltip) {
      if (this.$store.state.user.roles.indexOf("项目经理") != -1 && !hideTooltip) {
        this.tooltipContent = "建议您从“计划单材料”中申请购买材料，此处材料未经设计师确认，属于应急采购，请与设计师沟通确认后采购"
        this.tooltip = true
      } else {
        this.tooltip = false
        this.showMaterial = true
      }
    },
    savePlanAndFLow() {
      if (!this.sumitLoading) {
        this.noFlow = false
        this.submitApply()
      }
    },
    savePlan() {
      if (!this.sumitLoading) {
        this.noFlow = true
        this.submitApply()
      }
    },
    submitApply() {
      let valid = this.$refs['paymentForm'].validate();
      if (valid) {
        this.sumitLoading = true
        this.loading = true
        if (this.data.id != null) {
          updateApply(this.data).then(this.nextFlow).finally(() => {
            this.sumitLoading = false
            this.loading = false
          })
        } else {
          insertApply(this.data).then(this.nextFlow).finally(() => {
            this.sumitLoading = false
            this.loading = false
          })
        }
      }
    },
    nextFlow(apply) {
      if (apply.id != null) {
        if (this.noFlow) {
          //保存不发起流程
          this.$emit('success', apply);
        } else {
          //发起流程
          this.flowMsg = {
            message: {
              title: apply.serialNumber,
              content: apply.remark,
              frameCoding: 15304,
              frameId: apply.id,
              frameColumn: "pm03401"
            }
          }
          this.startFlow = true
        }
      }
    },
    inputFocus($event, item) {
      this.updateSum = item.sum
      window.setTimeout(() => {
        $event.target.select()
      }, 300)
    },
    saveSum(item, value) {
      if (value <= 0) {
        this.msg = "申请数量不能小于0";
        this.msgShow = true;
        return;
      }
      // if (value > item.planSum) {
      //   this.msg = "申请数量不能大于计划数量";
      //   this.msgShow = true;
      //   return;
      // }
      item.sum = value
      item.moneyTax = (item.planPrice * value).toFixed(2)
    },
    selectProject(value) {
      localStorage.setItem("apply-project", JSON.stringify(value))
      this.data.serialNumber = value.name + "-"
      this.$refs.seriesNumber.focus()
    },
    selectPlan(items) {
      this.selectPlanItems = items
    },
    clickPlan(item, {isSelected, select}) {
      select(!isSelected)
    },
    materialToApply(items) {
      console.log("items", items)
      items.forEach(item => {
        let m = {
          index: this.data.applyMaterialList.length + 1,
          serialNumber: this.data.applyMaterialList.length + 1,
          name: item.name,
          model: item.model,
          unit: item.unit,
          brand: item.brand,
          sum: 0,
          planPrice: item.planPrice,
          remark: '',
          cnfParam: '',
          ySum: 0,
          id: item.id,
          planRowId: item.id
        }
        m.moneyTax = 0
        this.data.applyMaterialList.push(m)
      })
      this.showMaterial = false
    },
    planToApply() {
      this.selectPlanItems.forEach(item => {
        let m = {
          index: this.data.applyMaterialList.length + 1,
          serialNumber: this.data.applyMaterialList.length + 1,
          name: item.material.name,
          model: item.material.model,
          unit: item.material.unit,
          brand: item.material.brand,
          sum: (item.planSum - item.applySum),
          planPrice: item.planPrice,
          remark: '',
          cnfParam: item.cnfStr,
          ySum: 0,
          id: item.material.id,
          planRowId: item.id,
          applySum: item.applySum,
          planSum: item.planSum
        }
        m.moneyTax = (m.sum * m.planPrice).toFixed(2)
        this.data.applyMaterialList.push(m)
      })
      this.planDialog = false
      this.selectPlanItems = []
    },
    importByPlan() {
      this.selectPlanItems = []
      if (this.data.project.id != null) {
        this.planDialog = true
        if (this.planOptions.page) {
          let p = Object.assign({}, this.planOptions)
          if (this.searchPlan && this.searchPlan != "") {
            p.searchText = this.searchPlan
          }
          p.applyType = this.applyType ? 1 : 0
          if (p.sortBy) {
            p.sortBy = p.sortBy[0]
            p.sortDesc = p.sortDesc[0]
          }
          this.planLoading = true
          getMaterByProject(this.data.project.id, p).then(planMaterData => {
            planMaterData.rows.forEach(item => {
              item.isSelectable = item.applySum < item.planSum
            })
            this.planMaterData = planMaterData
          }).finally(() => this.planLoading = false)
        }
      } else {
        this.msg = "请选择项目";
        this.msgShow = true;
      }
    },
    changeFlow(flow) {
      this.flow = flow;
    },
    success() {
      this.reset();
      this.$emit("success", this.data)
    },
    clickRow(item, prop) {
      if (this.showSelect) {
        item.id;
        prop.select(!prop.isSelected);
      }
    },
    loadData() {
      if (this.frameId) {
        this.loading = true
        loadById(this.frameId, this.loadNoPro).then(apply => {
          if (apply.project == null) {
            apply.project = {name: null}
          }
          if (apply.city == null) {
            apply.city = {name: "-"};
          } else {
            let push = true
            this.citys.forEach(item => {
              if (item.id == apply.city.id) {
                push = false
              }
            })
            if (push) {
              this.citys.push(apply.city);
            }

          }
          apply.applyMoney = 0.0;
          let temp = {id: apply.id, project: apply.project};
          apply.applyMaterialList.forEach((mater, index) => {
            mater.index = index + 1;
            mater.moneyTax = mater.planPrice * mater.sum;
            apply.applyMoney += mater.moneyTax;
            mater.apply = temp;
            mater.applySum = mater.applySum == null ? 0 : mater.applySum
            mater.applySum = mater.applySum - mater.sum
            if(mater.applySum < 0){
              mater.applySum = 0
            }
            if (mater.planRowId == "") {
              mater.planRowId = mater.id
            }
          })
          apply.applyMoney = apply.applyMoney.toFixed(2);
          this.projects.push(apply.project)
          this.data = apply;
          this.checkWaring()
        }).finally(() => this.loading = false)
      }
    },
    reset() {
      let project;
      let pstr = localStorage.getItem("apply-project");
      if (pstr != null && pstr != "" && pstr != "null") {
        project = JSON.parse(pstr);
        let isPush = true;
        this.projects.forEach(item => {
          if (item.id == project.id) {
            isPush = false
          }
        })
        if (isPush) {
          this.projects.push(project);
        }
      } else {
        project = {name: null, id: null}
      }
      this.data = {
        serialNumber: project.name == null ? "" : project.name + "-",
        project: project,
        city: {name: null, id: ''},
        staff: {name: null, id: null},
        applyMoney: 0,
        applyMaterialList: [],
        id: null,
        remark: '',
        date: this.dateFormat(new Date(), 'YYYY-mm-dd')
      }
      if (this.frameId == null) {
        this.data.staff.name = this.$store.state.user.name
        this.data.staff.id = this.$store.state.user.id
      }
      this.startFlow = false
      this.flow = null
    },
    editRemark(item) {
      this.editRow = item;
      if (item.remark == "") {
        this.updateRemark = this.$store.state.user.name + ":";
      } else {
        this.updateRemark = item.remark + ";" + this.$store.state.user.name + ":";
      }
    },
    saveRemark() {
      saveRemark(this.editRow.major, this.updateRemark).then(() => {
        this.editRow.remark = this.updateRemark;
      }).catch((error) => {
        console.log("修改失败", error)
      });
    },
    checkWaring() {
      if (this.data && this.data.applyMaterialList) {
        this.showWaring = false
        this.data.applyMaterialList.forEach((item, idx) => {
          //本次采购申请 + 历史采购申请 > 计划数，预警提示
          item.sum = parseFloat(item.sum)
          if (item && item.planRowId != "" && (item.sum + item.applySum - item.sum) > item.planSum) {
            this.waringMsg = `第${idx + 1}行，申请采购数超过计划总数`
            this.showWaring = true
            return false;
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>