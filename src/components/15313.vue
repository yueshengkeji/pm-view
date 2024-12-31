<template>
  <!--        出库单明细-->
  <div>
    <v-form :disabled="data.state === 1" ref="outForm">
      <v-row dense>
        <v-col sm="4">
          <v-autocomplete :items="projectList"
                          @change="projectChange"
                          label="选择项目"
                          :rules="[v => (!!v && !!v.id) || '请选择项目']"
                          :search-input.sync="searchProject"
                          item-text="name"
                          v-model="data.project"
                          return-object></v-autocomplete>
        </v-col>
        <v-col sm="4">
          <v-autocomplete label="领料单位"
                          :rules="[v => (!!v && !!v.id) || '请选择领料单位']"
                          return-object
                          item-text="name"
                          v-model="data.company"
                          :items="companyList"
                          :search-input.sync="searchCompany"></v-autocomplete>
        </v-col>
        <v-col sm="4">
          <v-text-field label="备注" v-model="data.remark"></v-text-field>
        </v-col>
        <v-col sm="1">
          <v-autocomplete :items="staffList"
                          :rules="[v => (!!v && !!v.id) || '请选择领料人']"
                          :search-input.sync="searchStaff"
                          @change="outPersonChange"
                          return-object
                          item-text="name"
                          label="领料人"
                          v-model="data.outPerson"></v-autocomplete>
        </v-col>
        <v-col sm="1">
          <v-text-field label="领料部门" :rules="[v => (!!v) || '领料人没有所属部门，无法领料']" readonly
                        v-model="data.outPerson.section.name"></v-text-field>
        </v-col>
        <v-col sm="1">
          <v-menu v-model="menu" ref="menu">
            <template v-slot:activator="{on,attrs}">
              <v-text-field label="领料日期" :rules="[v => (!!v) || '请指定领料日期']" v-model="data.outDate"
                            v-on="on" v-bind="attrs"></v-text-field>
            </template>
            <v-date-picker v-model="data.outDate" @change="$refs.menu.save()"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="1">
          <v-text-field @change="taxChange" label="税率" type="number" v-model="data.tax"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field label="领料单号" v-model="data.outNumber"></v-text-field>
        </v-col>
        <v-col sm="1">
          <storage-manager :rules="[v => !!v || '请选择发出仓库']" v-model="outStorage"></storage-manager>
        </v-col>
        <v-col sm="5">
          <v-btn small color="success" @click="selectPutHandler"
                 v-if="frameId == null && (!data.id || data.state == 0)">入库单
          </v-btn>
          <v-btn small color="success" class="ml-1" @click="selectMaterHandler"
                 v-if="frameId == null && (!data.id || data.state == 0)">材料库
          </v-btn>
          <v-chip small class="ml-1">总金额：{{ outMoney }}</v-chip>
          <v-btn small color="primary" :loading="saveLoading" class="float-right" @click="saveOut"
                 v-if="frameId == null && !data.id">确定出库
          </v-btn>
          <v-btn small
                 color="primary"
                 :loading="saveLoading"
                 class="float-right mr-1"
                 @click="saveSignOut"
                 v-if="frameId == null && !data.id"
                 title="通知领用人在线签字，确认以后出库单自动审核并出库，并通知发送人签字状态">通知签字
          </v-btn>
          <v-btn small color="primary"
                 class="float-right"
                 :loading="approveLoading"
                 @click="approve(data)"
                 v-if="frameId == null && data.id && data.state == 0">审核
          </v-btn>
          <v-btn small
                 :loading="approveLoading"
                 color="primary" class="float-right" @click="approve(data)"
                 v-if="frameId == null && data.id && data.state == 1">反审核
          </v-btn>
        </v-col>
        <!--                出库材料列表-->
        <v-col cols="12">
          <v-data-table :items.sync="data.materOuts"
                        height="500px"
                        hide-default-footer
                        :headers="headers">
            <template v-slot:item.index="{item,index}">
              <v-icon color="error" style="cursor: pointer;position:absolute;left: 5px;" small @click="deleteHandler($event,{item})">mdi-close</v-icon>
              {{ index + 1 }}
            </template>
            <template v-slot:item.id="{item}">
              <div style="max-width: 100px;" class="overflow-hidden">{{ item.material.id }}</div>
            </template>
            <template v-slot:item.sum="{item}">
              <v-text-field :rules="[v => !!v || '请输入出库数量']"
                            class="pt-0 mt-0"
                            @focus="$event.target.select()"
                            @change="setMoney(item)"
                            hide-details v-model="item.sum"
                            type="number"></v-text-field>
            </template>
            <template v-slot:item.taxPrice="{item}">
              <v-text-field :rules="[v => !!v || '请输入出库单价']"
                            @focus="$event.target.select()"
                            class="pt-0 mt-0"
                            @change="setMoney(item)"
                            hide-details v-model="item.taxPrice"
                            type="number"></v-text-field>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>
    <!--        入库单列表-->
    <v-dialog v-model="putMaterDialog" width="90%">
      <put-material-by-project :projectId="data.project.id"
                               @change="materialHandler"
                               v-model="selectMaterialList"></put-material-by-project>
    </v-dialog>
    <!--        材料库列表-->
    <select-material width="90%" v-model="materDialog"
                     repertory
                     ref="selectMaterial"
                     @select="storageMaterialHandler"
                     :storage="outStorage.id"></select-material>
    <!--        提示消息-->
    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {search} from '@/api/project'
import {list as searchCompany} from '@/api/company'
import {getStaff} from '@/api/staff'
import {approve, deleteMater, getById, outMaterList, recentlyOut, saveOut} from '@/api/outMater'
import {putStorageDetail} from '@/api/put'

import storageManager from "../views/storage/storageManager"

export default {
  name: "outDetail",
  components: {
    storageManager,
    putMaterialByProject: () => import('../views/storage/put/putMaterialByProject'),
    selectMaterial: () => import('../components/material/select')
  },
  props: {
    outData: null,
    frameId: null,
    storage: Object,
  },
  data: () => ({
    data: {
      state: '0',
      project: {id: null},
      outPerson: {
        name: null,
        section: {name: null}
      },
      company: null,
      tax: '',
      outNumber: '',
      remark: '',
      materOuts: [],
      outDate: null,
    },
    searchProject: null,
    projectList: [],
    searchCompany: null,
    companyList: [],
    searchStaff: null,
    staffList: [],
    menu: false,
    outStorage: {
      id: null
    },
    msg: null,
    msgFlag: false,
    putMaterDialog: false,
    selectMaterialList: [],
    headers: [
      {text: '序号', value: 'index', width: '60px'},
      {text: '材料编码', value: 'material.id', width: '100px'},
      {text: '材料名称', value: 'material.name', width: '200px'},
      {text: '型号', value: 'material.model', width: '200px'},
      {text: '品牌', value: 'material.brand', width: '90px'},
      {text: '单位', value: 'material.unit.name', width: '90px'},
      {text: '出库数量', value: 'sum', width: '150px'},
      {text: '库存数量', value: 'material.storageSum', width: '150px'},
      {text: '单价', value: 'taxPrice', width: '150px'},
      {text: '金额', value: 'taxMoney'},
      {text: '税率', value: 'tax'},
    ],
    outMoney: 0,
    materDialog: false,
    approveLoading: false,
    saveLoading: false,
    sign: false,
    taxCacheMap: [],
    reload: false,
  }),
  watch: {
    searchProject(val) {
      if (val && typeof val === "string") {
        search(val).then(result => this.projectList = result)
      }
    },
    searchCompany(val) {
      if (val) {
        searchCompany(val).then(result => this.companyList = result)
      }
    },
    searchStaff(val) {
      if (val) {
        getStaff(val).then(result => this.staffList = result)
      }
    },
    storage: {
      handler() {
        if (this.storage) {
          this.outStorage = this.storage
        }
      }
    },
    outData: {
      handler() {
        console.log("outData handler:", this.outData)
        if (this.outData && this.reload) {
          this.data = Object.assign({}, this.outData)
          // this.data.materOuts = []
          this.setData()
          this.refreshCountMoney()
        }
      },
      deep: true
    }
  },
  created() {
    if (this.outData) {
      this.data = Object.assign({}, this.outData)
      // this.data.materOuts = []
      this.setData()
      this.refreshCountMoney()
    } else {
      this.data.outDate = this.dateFormat(new Date(), 'YYYY-mm-dd')
    }
    if (this.storage) {
      this.outStorage = this.storage
    }
    this.recentlyOut()
  },
  methods: {
    setData() {
      if (this.data.materOuts == null) {
        this.data.materOuts = []
      }
      if (this.data.staff) {
        this.staffList.push(this.data.staff)
      }
      if (this.data.outPerson) {
        this.staffList.push(this.data.outPerson)
      }
      if (this.data.company) {
        this.companyList.push(this.data.company)
      }
      if (this.data.project) {
        this.projectList.push(this.data.project)
      }
    },
    recentlyOut() {
      recentlyOut().then(result => {
        if (result && result.id) {
          this.projectList.push(result.project)
          this.companyList.push(result.company)
          this.staffList.push(result.outPerson)
          this.data.project = result.project
          this.data.company = result.company
          this.data.outPerson = result.outPerson
        }
      })
    },
    approve(item) {
      this.approveLoading = true
      return approve(item).then(result => {
        item.outNumber = result.outNumber
        item.approveDate = result.approveDate
        item.state = result.state
        return result
      }).finally(() => this.approveLoading = false)
    },
    outPersonChange() {
      if (this.data.project && this.data.project.id && this.data.outPerson) {
        localStorage.setItem(this.data.project.id + '-out', JSON.stringify(this.data.outPerson))
      }
    },
    taxChange() {
      if (this.data.tax) {
        this.data.materOuts.forEach(item => {
          item.tax = this.data.tax
        })
      }
    },
    refreshCountMoney() {
      this.outMoney = 0
      this.data.materOuts.forEach(item => {
        this.outMoney += parseFloat(item.taxMoney)
      })
      this.outMoney = this.outMoney.toFixed(2)
    },
    setMoney(item) {
      item.taxMoney = (parseFloat(item.sum) * parseFloat(item.taxPrice)).toFixed(2)
      this.refreshCountMoney()
    },
    saveSignOut() {
      this.sign = true
      this.saveOut()
    },
    saveOut() {
      let valid = this.$refs.outForm.validate()
      if (valid) {
        if (this.data.materOuts.length <= 0) {
          this.msg = '请选择材料'
          this.msgFlag = true
          return;
        }
        this.data.storage = this.outStorage
        this.data.section = this.data.outPerson.section
        //添加出库单，自动审核
        this.saveLoading = true
        let result
        result = saveOut(this.data, '1', this.sign ? 'sign' : 'no')
        result.then(result => {
          if (result) {
            this.msg = '添加成功'
            this.msgFlag = true
            this.$emit('success', result)
          } else {
            this.msg = '添加失败'
            this.msgFlag = true
          }
        }).finally(() => {
          this.saveLoading = false
          this.sign = false
        })
      }
    },
    storageMaterialHandler(data) {
      let mids = ""
      data.forEach(item => {
        let md = {
          sum: item.storageSum,
          material: item,
          taxPrice: item.costPrice || 0,
          taxMoney: null,
          putMaterId: '',
          tax: item.tax || 0,
          storageId: this.outStorage ? this.outStorage.id : '',
        }
        md.taxMoney = md.sum * md.taxPrice
        this.data.materOuts.push(md)
        mids += item.id + ";"
        this.taxCacheMap[item.id] = md
      })
      if (mids.length > 0) {
        putStorageDetail(mids.substring(0, mids.length - 1)).then(result => {
          result.forEach(item => {
            if (item && item.tax) {
              this.taxCacheMap[item.material.id].tax = item.tax
            }
          })
        })
      }

      this.materDialog = false
      this.refreshCountMoney()
    },
    materialHandler() {
      let oldData = [], deleteMap = []
      for (let i = 0; i < this.data.materOuts.length; i++) {
        let item = this.data.materOuts[i]
        if (item.putMaterId == null || item.putMaterId == '') {
          oldData.push(item)
        } else {
          deleteMap[item.putMaterId] = item
        }
      }
      this.data.materOuts = oldData
      let tax = 0
      this.selectMaterialList.forEach(item => {
        let md = deleteMap[item.id]
        if (md == null) {
          md = {
            sum: (item.material.storageSum > item.putSum ? item.putSum : item.material.storageSum),
            material: item.material,
            taxPrice: item.price || 0,
            taxMoney: null,
            putMaterId: item.id,
            tax: item.tax || 0,
            storageId: this.outStorage ? this.outStorage.id : '',
          }
          if (item.price == null || item.price == 0) {
            md.taxPrice = item.taxPrice
          }
          md.taxPrice = md.taxPrice.toFixed(2)
          md.taxMoney = md.sum * md.taxPrice
        }
        this.data.materOuts.push(md)
        if (item.tax !== 0) {
          tax = item.tax
        }
        this.data.putId = item.storageId
      })
      if (tax !== 0) {
        this.data.tax = tax
      }
      this.putMaterDialog = false
      this.refreshCountMoney()
    },
    projectChange() {
      this.data.materOuts = []
      this.data.putId = ''
      if (this.data.project) {
        /*
        自动赋值项目历史领料人（如果领过料）
         */
        let outPerson = localStorage.getItem(this.data.project.id + '-out')
        if (outPerson && outPerson != '') {
          outPerson = JSON.parse(outPerson)
          this.staffList.push(outPerson)
          this.data.outPerson = outPerson
        }
        /*
         * 自动赋值领料单位为项目建设单位
         */
        if (this.data.project.oConstruction) {
          this.companyList.push(this.data.project.oConstruction)
          this.data.company = this.data.project.oConstruction
        }
      }
    },
    //选择入库单材料
    selectPutHandler() {
      if (this.data.project && this.data.project.id) {
        this.putMaterDialog = true
      } else {
        this.msg = "请选择项目"
        this.msgFlag = true
      }
    },
    //选择材料库材料
    selectMaterHandler() {
      if (this.$refs.selectMaterial) {
        this.$refs.selectMaterial.loadMaterial()
      }
      this.materDialog = true
    },
    deleteHandler(e, {item}) {
      if (this.data.state == '0' || this.data.state == null) {
        for (let i = 0; i < this.data.materOuts.length; i++) {
          let m = this.data.materOuts[i]
          if (m.material.id == item.material.id && m.putMaterId == item.putMaterId) {
            this.data.materOuts.splice(i, 1)
            if (m.id) {
              //从后台删除出库材料
              deleteMater(m.id)
            }
            break;
          }
        }
      } else {
        this.msg = '单据已审核，禁止删除'
        this.msgFlag = true
      }
    },
    loadById(id) {
      console.log("loadById")
      getById(id).then(result => {
        if (result) {
          outMaterList(result.id).then(resultList => {
            result.materOuts = resultList
            this.data = result
          })
        }
      })
    },
    reset() {
      this.reload = true
      this.$refs.outForm.resetValidation()
      window.setTimeout(()=>{
        this.reload = false
      },500)
    }
  }
}
</script>

<style scoped>

</style>