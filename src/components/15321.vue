<template>
  <div>
    <v-form ref="outBackForm" :disabled="data.approveState == 1">
      <v-row dense>
        <v-col sm="4" cols="12">
          <v-autocomplete label="项目名称"
                          :rules="rules.p"
                          v-model="data.project"
                          :items="projectList"
                          :search-input.sync="searchProject"
                          item-text="name"
                          return-object></v-autocomplete>
        </v-col>
        <v-col sm="3" cols="12">
          <v-autocomplete label="退料单位"
                          v-model="data.company"
                          :rules="rules.c"
                          :items="companyList"
                          :search-input.sync="searchCompany"
                          item-text="name"
                          return-object>

          </v-autocomplete>
        </v-col>
        <v-col sm="2">
          <v-autocomplete label="退料人"
                          @change="staffChangeHandler"
                          v-model="data.backStaff"
                          :rules="rules.s"
                          :items="staffList"
                          :search-input.sync="searchStaff"
                          item-text="name"
                          return-object>

          </v-autocomplete>
        </v-col>
        <v-col sm="2" cols="12">
          <v-autocomplete label="部门名称"
                          v-model="data.section"
                          :rules="rules.d"
                          :items="deptList"
                          :search-input.sync="searchDept"
                          item-text="name"
                          return-object>

          </v-autocomplete>
        </v-col>
        <v-col sm="2">
          <v-menu ref="menu" v-model="menu">
            <template v-slot:activator="{on,attrs}">
              <v-text-field v-model="data.backDate" :rules="rules.bd" label="退库日期" v-bind="attrs"
                            v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.backDate" @change="$refs.menu.save()"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="2">
          <v-text-field v-model="data.backNumber" label="退库单号"/>
        </v-col>
        <v-col sm="3">
          <v-text-field v-model="data.remark" label="备注"/>
        </v-col>
        <v-col sm="2">
          <storage-manager v-model="data.storage" :rules="rules.st" label="退回仓库"/>
        </v-col>
        <v-col sm="3">
          <v-btn :disabled="data.approveState == 1" small @click="showOutListHandler" class="mr-1" color="success">出库单</v-btn>
          <v-btn :disabled="data.approveState == 1" small @click="selectMaterHandler" class="mr-1">选择材料</v-btn>
          <v-chip small>金额合计：{{sumMoney}}</v-chip>
        </v-col>
        <v-col cols="12">
          <v-data-table :headers="materHeaders"
                        dense
                        :items-per-page="-1"
                        hide-default-footer
                        :items="data.maters">
            <template v-slot:item.material.id="{item}">{{ formatId(item.material.id) }}</template>
            <template v-slot:item.index="{item,index}">
              <v-icon v-if="data.approveState != 1" color="error" style="cursor: pointer;position:absolute;left: 5px;" small @click="deleteHandler($event,{item})">mdi-close</v-icon>
              {{ index + 1 }}
            </template>
            <template v-slot:item.sum="{item}">
              <v-text-field type="number"
                            :rules="rules.sum"
                            @focus="$event.target.select()"
                            label="退库数量" @change="countSum(item)"
                            v-model="item.sum"></v-text-field>
            </template>
            <template v-slot:item.price="{item}">
              <v-text-field type="number"
                            label="单价"
                            :rules="rules.num"
                            @focus="$event.target.select()"
                            @change="countSum(item)"
                            v-model="item.price"></v-text-field>
            </template>
            <template v-slot:item.money="{item}">
              <v-text-field type="number"
                            label="金额"
                            :rules="rules.num"
                            @change="countMoney(item)"
                            @focus="$event.target.select()"
                            v-model="item.money"></v-text-field>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>

    <select-material :show="materialDialog"
                     width="98%"
                     @close="closeMaterialHandler"
                     @select="selectMaterial"></select-material>

    <v-dialog v-model="outListDialog" hide-overlay fullscreen>
      <v-card class="pa-1">
        <out-list :project-id="data.project.id" ref="outList"></out-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="outListCloseHandler" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {search} from '@/api/project'
import {list as searchCompany} from '@/api/company'
import {getStaff} from '@/api/staff'
import {getSections} from '@/api/section'
import storageManager from "../views/storage/storageManager"
import selectMaterial from '@/components/material/select'
import {getLastOutMater} from '@/api/outMater'
import {getById, insert, update} from '@/api/backMater'

export default {
  name: "frame-15321",
  components: {
    storageManager,
    selectMaterial,
    outList: () => import('@/views/storage/out/listByProject.vue')
  },
  data: () => ({
    rules: {
      p: [
        v => !!v.id || '请选择项目名称'
      ],
      s: [
        v => !!v.id || '请选择退库人员'
      ],
      c: [
        v => !!v.id || '请选择退库单位'
      ],
      d: [
        v => !!v.id || '请选择退库部门'
      ],
      st: [
        v => !!v.id || '请选择退回仓库'
      ],
      bd: [
        v => !!v || '请选择退库时间'
      ],
      sum: [
        v => (!!v && parseFloat(v) > 0) || '请输入退库数量'
      ],
      num: [
        v => (!!v && parseFloat(v) > 0) || '请输入退库单价或金额'
      ],
    },
    searchProject: null,
    projectList: [],
    searchCompany: null,
    companyList: [],
    searchStaff: null,
    staffList: [],
    searchDept: null,
    deptList: [],
    menu: false,
    materialDialog: false,
    data: null,
    loading: false,
    materHeaders: [
      {text: '序号', value: 'index'},
      {text: '材料编码', value: 'material.id'},
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '品牌', value: 'material.brand'},
      {text: '退库数量', value: 'sum'},
      {text: '单位', value: 'material.unit.name'},
      {text: '单价', value: 'price'},
      {text: '金额', value: 'money'},
    ],
    temp: [],
    outListDialog: false,
    sumMoney:0
  }),
  created() {
    if (this.frameId) {
      this.loadById(this.frameId)
    } else if (this.back && this.back.id) {
      this.setData()
    } else {
      this.reset()
    }
  },
  watch: {

    searchProject(val) {
      search(val).then(result => this.projectList = result)
    },
    searchCompany(val) {
      searchCompany(val).then(result => this.companyList = result)
    },
    searchStaff(val) {
      getStaff(val).then(result => this.staffList = result)
    },
    searchDept(val) {
      getSections(val).then(result => this.deptList = result)
    },
    back: {
      handler() {
        if (this.back) {
          this.setData()
        }
      },
      deep: true
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true
    },
    frameId() {
      this.loadById(this.frameId)
    },
    "data.maters":{
      handler(){
        this.sumMoney = 0
        if(this.data.maters){
          let temp = 0
          this.data.maters.forEach(item=>{
            temp += parseFloat(item.money)
          })

          this.sumMoney = temp.toFixed(2)
        }
      },
      deep: true
    }
  },
  props: {
    back: Object,
    frameId: String,
  },
  model: {
    event: "change",
    prop: 'back'
  },
  methods: {
    outListCloseHandler() {
      let items = this.$refs.outList.getSelectItems()
      let outItem = this.$refs.outList.getItem()
      if (this.data.out == null) {
        this.data.out = {id: null}
      }
      if (outItem) {
        this.data.project = outItem.project
        this.data.out.id = outItem.id
        this.data.company = outItem.company
        this.data.section = outItem.section
        this.data.backStaff = outItem.outPerson
      }
      items.forEach(item => {
        let t = {
          material: item.material,
          price: item.taxPrice,
          money: item.taxMoney,
          remark: '',
          outId: item.id,
          sum: item.sum
        }
        this.data.maters.push(t)
      })
      this.outListDialog = false
      this.$refs.outList.clearSelectItems()
    },
    showOutListHandler() {
      this.outListDialog = true
      /*if (this.data.project && this.data.project.id) {

      } else {
        this.message("请选择项目")
      }*/
    },
    setData() {
      if (this.back.backStaff == null) {
        this.back.backStaff = {name: ''}
      }
      if (this.back.section == null) {
        this.back.section = {name: ''}
      }
      this.projectList.push(this.back.project)
      this.companyList.push(this.back.company)
      this.staffList.push(this.back.backStaff)
      this.deptList.push(this.back.section)
      if (this.back.out == null) {
        this.back.out = {id: null}
      }
      this.data = this.back
    },
    loadById(id) {
      getById(id).then(result => {
        if (result.backStaff == null) {
          result.backStaff = {name: ''}
        }
        if (result.section == null) {
          result.section = {name: ''}
        }
        if (result.out == null) {
          result.out = {id: null}
        }
        this.data = result
      })
    },
    save() {
      if (this.$refs.outBackForm.validate()) {
        if (this.data.out.id == '') {
          return this.confirm("所选材料未查询到出库记录，确定强制退库吗？").then(() => {
            this.loading = true
            return insert(this.data).finally(() => this.loading = false)
          })
        } else {
          this.loading = true
          if (this.data.id) {
            return update(this.data).finally(() => this.loading = false)
          } else {
            return insert(this.data).finally(() => this.loading = false)
          }
        }
      } else {
        return new Promise((resolve, reject) => {
          reject()
        })
      }
    },
    deleteHandler(event, {item}) {
      for (let i = 0; i < this.data.maters.length; i++) {
        if (this.data.maters[i].material.id == item.material.id) {
          this.data.maters.splice(i, 1)
          break
        }
      }
    },
    countSum(item) {
      let s = parseFloat(item.sum)
      let p = parseFloat(item.price)
      let m = parseFloat(item.money)
      if (!isNaN(s) && !isNaN(p)) {
        item.money = (s * p).toFixed(2)
      } else if (!isNaN(s) && !isNaN(m)) {
        item.price = (m / s).toFixed(2)
      }
    },
    countMoney(item) {
      let m = parseFloat(item.money)
      let s = parseFloat(item.sum)
      if (!isNaN(m) && !isNaN(s)) {
        item.price = (m / s).toFixed(2)
      }
    },
    closeMaterialHandler(state) {
      this.materialDialog = state
    },
    selectMaterHandler() {
      this.materialDialog = true
    },
    selectMaterial(materialArray) {
      this.temp = []
      //查询材料最新的出库价格、出库数量
      materialArray.forEach(item => {
        let t = {
          material: item,
          price: 0.0,
          money: 0.0,
          remark: '',
          outId: '',
          sum: ''
        }
        this.temp[item.id] = t
        getLastOutMater(item.id).then(result => {
          if (result && result.material) {
            this.temp[result.material.id].price = result.taxPrice
            this.temp[result.material.id].outId = result.id
            this.setProjectInfo(result.materOut)
          }
        })
        this.data.maters.push(t)
      })
      this.materialDialog = false
    },
    reset() {
      this.data = {
        project: {name: ''},
        company: {name: ''},
        backStaff: {name: ''},
        section: {name: ''},
        backDate: this.dateFormat(new Date(), "YYYY-mm-dd"),
        backNumber: '',
        remark: '',
        storage: null,
        maters: [],
        out: {id: ''},
        approveState: 0
      }
      if (this.$refs.outBackForm) {
        this.$refs.outBackForm.resetValidation()
      }
    },
    staffChangeHandler() {
      if (this.data.backStaff) {
        this.deptList.push(this.data.backStaff.section)
        this.data.section = this.data.backStaff.section
      }
    },
    setProjectInfo(outInfo) {
      if (outInfo) {
        if (this.data.project.id == null) {
          this.projectList.push(outInfo.project)
          this.data.project = outInfo.project
        }
        if (this.data.company.id == null) {
          this.companyList.push(outInfo.company)
          this.data.company = outInfo.company
        }
        if (this.data.backStaff.id == null) {
          this.staffList.push(outInfo.outPerson)
          this.data.backStaff = outInfo.outPerson

          this.deptList.push(this.data.backStaff.section)
          this.data.section = outInfo.outPerson.section
        }
        this.data.out.id = outInfo.id
      }
    }
  }
}
</script>

<style scoped>

</style>