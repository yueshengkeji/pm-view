<template>
  <div>
    <v-form ref="putForm" :disabled="putItem.approveType == 1">
      <v-row dense>
        <v-col sm="4">
          <v-autocomplete dense
                          :rules="[v => !!v || '请选择供应单位']"
                          :items="companyList"
                          :search-input.sync="searchCompany2"
                          return-object
                          item-text="name"
                          label="供货商"
                          v-model="putItem.company"></v-autocomplete>
        </v-col>
        <v-col sm="4" v-if="!putItem.id">
          <v-autocomplete dense
                          :rules="[v => !!v || '请选择项目']"
                          :items="projectList"
                          :search-input.sync="searchProject"
                          @change="projectChange"
                          return-object
                          item-text="name"
                          label="项目名称"
                          v-model="putItem.project"></v-autocomplete>
        </v-col>
        <v-col sm="4" v-if="putItem.id">
          <p v-if="putItem.sign">项目经理签名：{{ putItem.sign.signStaffName }}</p>
          <p v-else>该单据直接入库，无需项目经理签名</p>
        </v-col>
        <v-col sm="4">
          <v-text-field dense label="备注" v-model="putItem.remark"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-text-field v-if="putItem.id" dense label="采购单号"
                        v-model="putItem.procurement.pmNumber"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-img contain height="150px" style="position: absolute;width: 400px;" width="100%"
                 v-if="putItem.sign" :src="putItem.sign.signImg"></v-img>
        </v-col>
        <v-col sm="2">
          <v-text-field dense v-model="putItem.pm02620" label="运杂费"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense
                        :rules="[v => !!v || '请输入税率']"
                        type="number" v-model="putItem.tax" @change="taxChange"
                        label="税率"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-text-field dense v-model="putItem.putSerial" label="入库单号"></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col sm="4">
          <v-menu ref="menu" v-model="menu">
            <template v-slot:activator="{on,attrs}">
              <v-text-field v-model="putItem.putDate"
                            :rules="[v => !!v || '请选择入库日期']"
                            dense
                            label="入库日期"
                            v-on="on"
                            v-bind="attrs"></v-text-field>
            </template>
            <v-date-picker v-model="putItem.putDate" @change="$refs.menu.save()"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col class="text-right" cols="12">
          <v-btn v-if="!putItem.id" small class="mr-1" @click="materHandler">选择材料</v-btn>
          <template>
            <span class="mr-2"
                  v-if="putItem.saleMoney != '' && putItem.saleMoney != '0'">优惠金额：{{ putItem.saleMoney }}/</span>
            <span class="mr-2" v-else>无优惠/</span>
            <span class="mr-2">含税总金额：<span>{{ moneyTax }}</span>/</span>
            <span class="mr-2">不含税总金额：<span>{{ money }}</span></span>
          </template>
        </v-col>
        <v-col cols="12">
          <v-data-table :headers="materHeaders"
                        hide-default-footer
                        :items-per-page="-1"
                        dense
                        :items="putItem.materialList">
            <template v-slot:item.material.id="{item}">
              {{ formatId(item.material.id) }}
            </template>
            <template v-slot:item.putSum="{item}">
              <v-text-field class="mt-0 pt-0"
                            @blur="countMoney(item)"
                            type="number"
                            @focus="$event.target.select()"
                            :rules="[v => !!v || '入库数量不能为空']"
                            hide-details
                            v-model="item.putSum"></v-text-field>
            </template>
            <template v-slot:item.taxPrice="{item}">
              <v-text-field class="mt-0 pt-0"
                            @blur="countMoney(item)"
                            type="number"
                            @focus="$event.target.select()"
                            :rules="[v => !!v || '入库单价不能为空']"
                            hide-details
                            v-model="item.taxPrice"></v-text-field>
            </template>
            <template v-slot:item.taxMoney="{item}">
              {{ item.taxMoney.toFixed(2) }}
            </template>
            <template v-slot:item.project.name="{item}">
              <div :title="item.project.name"
                   class="overflow-hidden text-truncate ma-0"
                   style="max-width:150px;height: 20px;">{{ item.project.name }}
              </div>
            </template>
            <template v-slot:item.index="{item,index}">
              <v-icon v-if="data.approveType == '0'" color="error" style="cursor: pointer;position:absolute;left: 5px;" small @click="deleteHandler($event,{item})">mdi-close</v-icon>
              {{ index + 1 }}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>

    <!--       其他入库 选择材料-->
    <select-material @close="closeHandler" :show="materDialog" @select="selectMaterial"></select-material>
  </div>
</template>

<script>
import {list as companyList} from '@/api/company'
import {search as searchProject} from '@/api/project'
import {deleteMaterial} from '@/api/put.js'

export default {
  name: "frame-15327",
  components: {
    selectMaterial: () => import("@/components/material/select"),
  },
  data: () => ({
    moneyTax:0,
    money:0,
    putItem: {
      company:null,
      project:null,
      sign:null,
      pm02620:null,
      tax:null,
      putSerial:null,
      saleMoney:null,
      materialList:[]
    },
    searchCompany2: null,
    searchProject: null,
    companyList: [],
    projectList: [],
    materDialog: false,
    materHeaders: [
      {text: '序号', value: 'index', width: '60px'},
      {text: '材料编码', value: 'material.id'},
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '单位', value: 'material.unit.name'},
      {text: '数量', value: 'putSum', width: '150px'},
      {text: '单价', value: 'taxPrice', width: '150px'},
      {text: '金额', value: 'moneyTax'},
      {text: '税额', value: 'taxMoney'},
      {text: '项目', value: 'project.name', width: '150px'},
    ],
    menu: false
  }),
  props: {
    putStorage: Object,
    data: Object
  },
  model: {
    event: "change",
    prop: "data"
  },
  watch: {
    data: {
      handler() {
        if (this.data) {
          if (this.data.company) {
            this.companyList = [this.data.company]
          }
          this.putItem = this.data
          this.refreshCountMoney()
        }
      },
      deep: true
    },
    putItem: {
      handler() {
        this.$emit("change", this.putItem)
      },
      deep: true
    },
    searchProject(val) {
      searchProject(val).then(result => {
        this.projectList = result
      })
    },
    searchCompany2(val) {
      companyList(val).then(result => {
        this.companyList = result
      })
    },
  },
  created() {
    if (this.data) {
      if (this.data.company) {
        this.companyList = [this.data.company]
      }
      this.putItem = this.data
      this.refreshCountMoney()
    }
  },
  methods: {
    deleteHandler(event,{item}){
      if(this.data.approveType == "0"){
        deleteMaterial(this.data.id,item.id).then(result=>{
          for (let i = 0; i < this.putItem.materialList.length; i++) {
            let row = this.putItem.materialList[i]
            if(row.id == result){
              this.putItem.materialList.splice(i,1);
              this.refreshCountMoney()
              return;
            }
          }
        })
      }else{
        this.message("已审核，禁止删除");
      }

    },
    validate() {
      return this.$refs.putForm.validate()
    },
    countMoney(mater) {
      if (mater.putSum && mater.putSum !== '' && mater.taxPrice && mater.taxPrice !== '') {
        //含税总金额 = 入库数量 * 含税单价
        mater.moneyTax = mater.putSum * mater.taxPrice
        //不含税单价
        this.setPrice(mater)
        this.setMoney(mater)
        this.refreshCountMoney()
      }
    },
    //设置不含税单价
    setPrice(mater) {
      if (this.putItem.tax == "" || this.putItem.tax <= 0) {
        mater.price = 0
      } else {
        mater.price = mater.taxPrice / (parseInt(1) + (parseFloat(this.putItem.tax) / 100))
      }
    },
    //设置税额、不含税总金额
    setMoney(mater) {
      if (mater.price == 0) {
        mater.money = mater.moneyTax
        mater.taxMoney = 0
      } else {
        //不含税总金额 = 入库数量 * 不含税单价
        mater.money = new Number((mater.putSum * mater.price).toFixed(2))
        //税额 = 含税总金额 - 不含税总金额
        mater.taxMoney = new Number((mater.moneyTax - mater.money).toFixed(2))
      }

    },
    refreshCountMoney() {
      let money = 0, moneyTax = 0
      this.putItem.materialList.forEach(item => {
        moneyTax += parseFloat(item.moneyTax)
        money += parseFloat(item.money)
      })
      this.money = new Number(money.toFixed(2))
      this.moneyTax = new Number(moneyTax.toFixed(2))
    },
    selectMaterial(data) {
      data.forEach(item => {
        let p = this.putItem.project || {name: null, id: ''}
        this.putItem.materialList.push({
          material: item,
          putSum: '0',
          price: '0',
          money: 0,
          moneyTax: 0,
          taxPrice: '0',
          taxMoney: 0,
          project: p,
          projectId: p.id,
          proMaterId: '',
          storageId: this.putStorage.id
        })
      })
      this.materDialog = false
    },
    closeHandler(dialog) {
      if (!dialog) {
        this.materDialog = dialog
      }
    },
    projectChange() {
      this.putItem.materialList.forEach(item => {
        if (this.putItem.project) {
          item.project = this.putItem.project
          item.projectId = this.project.id
        } else {
          item.project = {name: null, id: ''}
          item.projectId = ''
        }
      })
    },
    taxChange() {
      this.putItem.materialList.forEach(item => {
        this.setPrice(item)
        this.setMoney(item)
      })
      this.refreshCountMoney()
    },
    materHandler() {
      this.materDialog = true
    },
  }
}
</script>

<style scoped>

</style>