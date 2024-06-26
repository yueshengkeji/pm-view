<template>
  <div>
    <v-form ref="paymentForm">
      <v-row dense>
        <v-col sm="2" cols="12">
          <v-autocomplete label="项目名称"
                          ref="applyProject"
                          dense
                          :items="projects"
                          :search-input.sync="searchProject"
                          item-text="name"
                          auto-select-first
                          hide-details
                          return-object
                          :disabled="edit"
                          v-model="data.project"></v-autocomplete>
        </v-col>
        <v-col sm="2" cols="12">
          <v-text-field :loading="checkLoading"
                        :error-messages="applyError"
                        ref="seriesNumber"
                        dense
                        hide-details
                        label="申请单" v-model="data.serialNumber" :disabled="edit"></v-text-field>
        </v-col>
        <v-col sm="1" cols="6">
          <v-text-field dense label="申请人" v-model="data.staff.name" disabled hide-details></v-text-field>
        </v-col>
        <v-col sm="1" cols="6">
          <v-text-field dense label="成本合计" color="error" error v-model="data.applyMoney" hide-details
                        disabled></v-text-field>
        </v-col>
        <v-col sm="1" cols="6">
          <v-menu ref="menu">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-bind="attrs"
                            hide-details
                            v-on="on"
                            title="单击设置提醒日期"
                            label="提醒日期"
                            v-model="data.notifyDate"
                            clearable
                            @click:clear="saveNotify"
                            dense></v-text-field>
            </template>
            <v-date-picker v-model="data.notifyDate" @change="saveNotify"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="2">
          <v-text-field label="搜索" title="检索材料" @keyup.enter="selectItem" dense hide-details
                        v-model="searchMater"></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-row class="overflow-x-hidden" dense>
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
              ref="materTable"
              :items="data.applyMaterialList"
              :search="searchMater"
              item-key="major"
              :headers="headers"
              fixed-header
              :items-per-page="-1"
              hide-default-footer
              dense
              :height="tableHeight"
              calculate-widths
              @click:row="clickRow"
              @item-selected="selectRow"
              style="cursor: pointer"
              :show-select="showSelect"
              :value="selectItems"
              @input="inputSelect">
            <template v-slot:item.name="{item}">
              <div v-if="item.isSelected" :class="redClass">{{ formatName(item) }}</div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass">{{ formatName(item) }}</div>
              <div v-else-if="item.ySum > 0" :class="blueClass">{{ formatName(item) }}</div>
              <div v-else>{{ formatName(item) }}</div>
            </template>
            <template v-slot:item.model="{item}">
              <v-tooltip bottom min-width="800">
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <div v-if="item.isSelected" :class="redClass">{{ item.model }}</div>
                    <div v-else-if="item.ySum >= item.sum" :class="greenClass">{{ item.model }}</div>
                    <div v-else-if="item.ySum > 0" :class="blueClass">{{ item.model }}</div>
                    <div v-else>{{ item.model }}</div>
                  </div>
                </template>
                <v-data-iterator :items.sync="item.historys"
                                 no-data-text="未查询到采购记录，单击型号查询"
                                 hide-default-footer>
                  <template v-slot:header>
                    <v-row :key="item.id">
                      <v-col md="3">材料名称</v-col>
                      <v-col md="3">型号</v-col>
                      <v-col md="1">采购</v-col>
                      <v-col md="1">库存</v-col>
                      <v-col md="2">采购单价</v-col>
                      <v-col md="2">采购时间</v-col>
                    </v-row>
                  </template>
                  <template v-slot:item="{item}">
                    <v-row :key="item.id">
                      <v-col md="3" class="text-truncate">{{ item.material.name }}</v-col>
                      <v-col md="3" class="text-truncate">{{ item.material.model }}</v-col>
                      <v-col md="1">{{ item.sum }}</v-col>
                      <v-col md="1">{{ item.material.storageSum }}</v-col>
                      <v-col md="2">{{ item.priceTax }}</v-col>
                      <v-col md="2">{{ item.dhDate }}</v-col>
                    </v-row>
                  </template>
                </v-data-iterator>
                <div v-html="item.model+'<br/>技术参数：'+item.cnfParam"></div>
              </v-tooltip>
            </template>

            <template v-slot:item.unit.name="{item}">
              <div v-if="item.isSelected" class="red--text">{{ item.unit.name }}</div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass">{{ item.unit.name }}</div>
              <div v-else-if="item.ySum > 0" :class="blueClass">{{ item.unit.name }}</div>
              <div v-else>{{ item.unit.name }}</div>
            </template>

            <template v-slot:item.brand="{item}">
              <div v-if="item.isSelected" class="red--text text-no-wrap" style="max-width: 280px">
                {{ item.brand }}
              </div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass" class="text-no-wrap"
                   style="max-width: 280px">{{ item.brand }}
              </div>
              <div v-else-if="item.ySum > 0" class="text-no-wrap" :class="blueClass"
                   style="max-width: 280px">{{ item.brand }}
              </div>
              <div v-else class="text-no-wrap" style="max-width: 280px">{{ item.brand }}</div>
            </template>
            <template v-slot:item.sum="{item}">
              <div v-if="item.isSelected" class="red--text">{{ item.sum }}</div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass">{{ item.sum }}</div>
              <div v-else-if="item.ySum > 0" :class="blueClass">{{ item.sum }}</div>
              <div v-else>{{ item.sum }}</div>
            </template>

            <template v-slot:item.remark="props">
              <v-edit-dialog
                  :return-value.sync="updateRemark"
                  large
                  @save="saveRemark"
                  save-text="保存"
                  cancel-text="">
                <v-icon left x-small>
                  mdi-lead-pencil
                </v-icon>
                <span class="red--text" v-if="props.item.isSelected">{{ props.item.remark }}</span>
                <span v-else-if="props.item.ySum >= props.item.sum" :class="greenClass">{{ props.item.remark }}</span>
                <span v-else-if="props.item.ySum > 0" :class="blueClass">{{ props.item.remark }}</span>
                <span v-else>{{ props.item.remark }}</span>
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
              <div class="red--text" v-if="item.isSelected">{{ formatNumber(item.planPrice) }}</div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass">
                {{ formatNumber(item.planPrice) }}
              </div>
              <div v-else-if="item.ySum > 0" :class="blueClass">{{ formatNumber(item.planPrice) }}</div>
              <div v-else>{{ formatNumber(item.planPrice) }}</div>
            </template>
            <template v-slot:item.moneyTax="{item}">
              <div class="red--text" v-if="item.isSelected">{{ formatNumber(item.moneyTax) }}</div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass">{{ formatNumber(item.moneyTax) }}
              </div>
              <div v-else-if="item.ySum > 0" :class="blueClass">{{ formatNumber(item.moneyTax) }}</div>
              <div v-else>{{ formatNumber(item.moneyTax) }}</div>
            </template>
            <template v-slot:item.ySum="{item}">
              <div class="red--text" v-if="item.isSelected">
                <v-btn class="text-decoration-underline" target="_blank" link plain x-small
                       :to="'/procurement/apply/materialProHistory/'+item.major">{{ item.ySum }}
                </v-btn>
              </div>
              <div v-else-if="item.ySum >= item.sum" :class="greenClass">
                <v-btn class="text-decoration-underline" target="_blank" link plain x-small
                       :to="'/procurement/apply/materialProHistory/'+item.major">{{ item.ySum }}
                </v-btn>
              </div>
              <div v-else-if="item.ySum > 0" :class="blueClass">
                <v-btn class="text-decoration-underline" target="_blank" link plain x-small
                       :to="'/procurement/apply/materialProHistory/'+item.major">{{ item.ySum }}
                </v-btn>
              </div>
              <div v-else>
                <v-btn class="text-decoration-underline" target="_blank" link plain x-small
                       :to="'/procurement/apply/materialProHistory/'+item.major">{{ item.ySum }}
                </v-btn>
              </div>
            </template>

            <template v-slot:item.cnfParam="{item}">
              <v-tooltip bottom min-width="800" max-width="800">
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on" :class="item.isSelected ? 'red--text' : ''"
                       class="text-no-wrap text-truncate" style="width: 70px">
                    {{ item.cnfParam }}
                  </div>
                </template>
                <div v-html="item.cnfParam"></div>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>

    <v-dialog v-model="showImg" width="80%" @close="showImg = false">
      <v-card>
        <div class="text-center pt-1">
          截图成功，鼠标放在图片上，右击复制吧
          <v-btn color="error" absolute fab right @click="showImg = false">关闭</v-btn>
        </div>
        <img :src="imgPath" height="450" width="100%"/>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import excelExport from '@/utils/excel-export';
import {getApplyMaterial, getProEditInfo, loadById, saveNotify, saveRemark} from '@/api/apply'
import {search} from '@/api/project'
import {searchCity} from '@/api/city'
import {procurementMaterialHistory} from '@/api/procurement'
import html2canvas from 'html2canvas'

export default {
  name: "frame-apply-list",
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
    apply: null,
  },
  watch: {
    resetSelect: {
      handler() {
        if (this.resetSelect) {
          this.selectItems = []
          this.setMaterial(this.data, true)
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
      search(value).then(data => {
        this.projects = data;
      })
    },
    searchCitys(value) {
      if (value != "") {
        searchCity(value).then(data => this.citys = data).finally(() => {
          if (this.citys.length <= 0) {
            this.citys.push({name: value, id: -1});
          }
        })
      }
    },
    apply: {
      handler(val, old) {
        if (val && old && val.id === old.id) {
          return;
        }
        this.setData(this.apply)
      },
      deep: true
    },
    "$vuetify.breakpoint": {
      handler() {
        this.setTableHeight()
      },
      deep: true
    }
  },
  data: () => ({
    searchMater: '',
    checkLoading: false,
    applyError: null,
    updateRemark: null,
    data: {
      project: {name: null},
      city: {name: null},
      staff: {name: null}
    },
    editRow: null,
    headers: [
      {text: "材料名称", value: 'name', width: '20%'},
      {text: "型号", value: 'model', width: '15%'},
      {text: "参数", value: 'cnfParam', width: '70px'},
      {text: "单位", value: 'unit.name'},
      {text: "品牌", value: 'brand', width: '100px'},
      {text: "申请数量", value: 'sum'},
      {text: "备注", value: 'remark', width: '15%'},
      {text: "成本", value: 'planPrice'},
      {text: "合计", value: 'moneyTax'},
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
    planMaterData: [],
    planDialog: false,
    selectPlanItems: [],
    searchPlan: null,
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

    tooltipContent: '',
    tooltip: false,

    blueClass: 'blue--text text--darken-3',
    redClass: 'red--text',
    greenClass: 'green--text',
    tableHeight: 308,

    historys: [],
    imgPath: null,
    showImg: false,
  }),

  created() {

    if (this.apply) {
      this.setData(this.apply)
    } else {
      this.reset()
      this.loadData()
    }

    this.setTableHeight()

    // this.$nextTick(()=>{
    //     this.initKeyEvent()
    // })
  },
  methods: {
    // initKeyEvent(){
    //     document.onkeyup = (e)=>{
    //         if((e.keyCode || e.which) === 8 && this.searchMater.length > 0){
    //             this.searchMater = this.searchMater.substring(0,this.searchMater.length-1)
    //         }
    //     }
    //     document.onkeypress = (e)=>{
    //         let nextCode = e.keyCode || e.which
    //         let key = e.key
    //         console.log(nextCode,key)
    //         this.searchMater += key
    //         if(nextCode === 13){
    //             this.selectItem()
    //         }
    //     }
    // },

    /**
     * 键入回车时，自动选择第一行数据
     */
    selectItem() {
      this.searchMater = ''
      let currentItems = this.$refs.materTable.internalCurrentItems
      if (currentItems && currentItems.length > 0) {
        // currentItems[0].isSelected = !currentItems[0].isSelected
        this.$refs.materTable.select(currentItems[0])
        /*if(currentItems[0].isSelected){
            //选中

        }else{
            //取消选中
        }*/
      }
    },
    createImg() {
      let content = this.$refs.materTable.$el.getElementsByTagName("table")[0]
      let scrollHeight = content.scrollHeight
      let scrollWidth = content.scrollWidth
      scrollHeight = scrollHeight < this.tableHeight ? this.tableHeight : scrollHeight
      return html2canvas(content, {
        scale: window.devicePixelRatio * 2,
        useCORS: true,
        width: scrollWidth,
        height: scrollHeight,
        windowWidth: scrollWidth,
        windowHeight: scrollHeight,
        x: 0,
        y: window.pageYOffset
      }).then((canvas) => {
        let dataURL = canvas.toDataURL("image/jpg");
        this.imgPath = dataURL
        this.showImg = true
      })
    },
    inputSelect(items) {
      if (items.length <= 0) {
        this.selectItems.forEach(item => {
          item.isSelected = false
        })
      } else {
        items.forEach(item => {
          item.isSelected = true
        })
      }
      this.selectItems = items
      if (this.select) {
        this.select(items)
      }
    },
    setTableHeight() {
      if (this.$vuetify.breakpoint.lg) {
        this.tableHeight = 410
      } else if (this.$vuetify.breakpoint.md) {
        this.tableHeight = 366
      }
    },
    formatName(item) {
      return item.name;
    },
    saveNotify() {
      console.log("saveNotify", this.data.notifyDate)
      saveNotify(this.data.id, this.data.notifyDate == null ? '' : this.data.notifyDate)
      this.$refs.menu.save()
    },
    formatNumber(num) {
      if (num == null) {
        return 0
      }
      return num.toFixed(2);
    },
    closeMaterial(isOpen) {
      this.showMaterial = isOpen
    },
    openMaterial(hideTooltip) {
      if (this.$store.state.user.roles.indexOf("项目经理") !== -1 && !hideTooltip) {
        this.tooltipContent = "建议您从“计划单材料”中申请购买材料，此处材料未经设计师确认，属于应急采购，请与设计师沟通确认后采购"
        this.tooltip = true
      } else {
        this.tooltip = false
        this.showMaterial = true
      }
    },

    selectPlan(items) {
      this.selectPlanItems = items
    },
    clickPlan(item, {isSelected, select}) {
      item.isSelected = !isSelected
      select(!isSelected)
    },
    selectRow(param) {
      param.item.isSelected = param.value
    },
    clickRow(item, prop) {
      if (this.showSelect) {
        item.isSelected = !prop.isSelected
        prop.select(!prop.isSelected);
      }

      //加载材料历史价格
      this.loadMaterPrice(item)
    },
    loadMaterPrice(item) {
      procurementMaterialHistory(item.name, item.model).then(result => {
        item.historys = result
      })
    },
    loadData() {
      if (this.frameId) {
        loadById(this.frameId, this.loadNoPro).then(apply => {
          this.setData(apply)
        });
      }
    },
    setData(d) {
      let apply = Object.assign({}, d, true)
      if (apply == null || apply.id == null) {
        this.reset()
        return;
      }
      if (apply.notifyDate == null) {
        apply.notifyDate = null
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
      this.projects.push(apply.project)
      if (apply.applyMaterialList) {
        this.setMaterial(apply)
        apply.applyMoney = apply.applyMoney.toFixed(2)
        this.data = apply
      } else {
        getApplyMaterial(apply.id).then(result => {
          apply.applyMaterialList = result
          this.setMaterial(apply)
          apply.applyMoney = apply.applyMoney.toFixed(2)
          this.data = apply
        })
      }
    },
    loadEditInfo(m) {
      getProEditInfo(m.major).then(result => {
        if (result) {
          this.$set(m, 'editInfo', result)
        } else {
          this.$set(m, 'editInfo', '')
        }
      })
    },
    setMaterial(apply, resetSelected) {
      let temp = {id: apply.id, project: apply.project};
      apply.applyMoney = 0.0;
      apply.applyMaterialList.forEach((mater, index) => {
        //加载采购编辑提示信息
        // this.loadEditInfo(mater)
        mater.index = index + 1;
        mater.moneyTax = mater.planPrice * mater.sum;
        apply.applyMoney += mater.moneyTax;
        mater.apply = temp;
        if (mater.planRowId == "") {
          mater.planRowId = mater.id
        }
        if (mater.historys == null) {
          this.$set(mater, 'historys', [])
        }
        if (mater.isSelected == null) {
          let isSelected = false
          for (let i = 0; i < this.selectItems.length; i++) {
            if (this.selectItems[i].major == mater.major) {
              isSelected = true
              break;
            }
          }
          this.$set(mater, 'isSelected', isSelected)
        } else if (resetSelected) {
          mater.isSelected = false
        }
      })
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
        date: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        notifyDate: null,
      }
      if (this.frameId == null) {
        this.data.staff.name = this.$store.state.user.name
        this.data.staff.id = this.$store.state.user.id
      }
      this.startFlow = false
      this.flow = null
    },
    editRemark(item) {
      this.editRow = item
      // if (item.remark == "") {
      //     this.updateRemark = this.$store.state.user.name + ":";
      // } else {
      //     this.updateRemark = item.remark + ";" + this.$store.state.user.name + ":";
      // }
      this.updateRemark = ""
    },
    saveRemark() {
      if (this.updateRemark.trim("") != "") {
        let newRemark = this.editRow.remark + ";" + this.$store.state.user.name + ":" + this.updateRemark
        saveRemark(this.editRow.major, newRemark).then(() => {
          this.editRow.remark = newRemark;
        })
      }
      // saveRemark(this.editRow.major, this.updateRemark).then(() => {
      //     this.editRow.remark = this.updateRemark;
      // }).catch((error) => {
      //     console.log("修改失败", error)
      // });
    },
    downloadSelectMaterial() {
      let exportArray = []
      this.selectItems.forEach(item => {
        let row = Object.assign({}, item)
        row.unitName = row.unit.name
        exportArray.push(row)
      })
      excelExport([
        {key: 'name', title: '材料名称'},
        {key: 'model', title: '型号'},
        {key: 'unitName', title: '单位'},
        {key: 'brand', title: '品牌'},
        {key: 'sum', title: '申请数量'},
        {key: 'remark', title: '备注'},
        {key: 'planPrice', title: '成本'},
        {key: 'moneyTax', title: '合计'},
        {key: 'ySum', title: '已采购'},
      ], exportArray, `采购订单材料列表.xlsx`);
    },
    downloadApplyMaterial() {
      let exportArray = []
      this.apply.applyMaterialList.forEach(item => {
        let row = Object.assign({}, item)
        row.unitName = row.unit.name
        exportArray.push(row)
      })
      excelExport([
        {key: 'name', title: '材料名称'},
        {key: 'model', title: '型号'},
        {key: 'unitName', title: '单位'},
        {key: 'brand', title: '品牌'},
        {key: 'sum', title: '申请数量'},
        {key: 'remark', title: '备注'},
        {key: 'planPrice', title: '成本'},
        {key: 'moneyTax', title: '合计'},
        {key: 'ySum', title: '已采购'},
      ], exportArray, `${this.apply.serialNumber}.xlsx`);
    }
  }
}
</script>

<style scoped>
.edit-info {
  position: absolute;
  right: 0px;
  transform: scale(0.8);
  font-size: 12px;
  margin-top: -30px;

}
</style>