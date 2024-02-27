<template>
  <div>
    <v-row>
      <v-col md="1" cols="12">
        <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryParam.startDate"
                          label="请指定开始日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryParam.startDate"
                         @change="$refs.menu.save()"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col md="1" cols="12">
        <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
          <template v-slot:activator="{attrs,on}">
            <v-text-field hide-details
                          dense
                          v-bind="attrs"
                          v-on="on"
                          v-model="queryParam.endDate"
                          label="请指定截止日期"></v-text-field>
          </template>
          <v-date-picker v-model="queryParam.endDate"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col lg="3" cols="12">
        <v-radio-group dense v-model="queryParam.putState" row class="mt-0">
          <v-radio label="未入库" value="0"></v-radio>
          <v-radio label="已入库" value="3"></v-radio>
          <v-radio label="所有" :value="null"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col lg="2">
        <v-autocomplete label="指定项目"
                        :items="projectList"
                        :search-input.sync="searchProject"
                        dense
                        @change="list"
                        v-model="queryParam.projectName"
                        item-value="name"
                        item-text="name"></v-autocomplete>
      </v-col>
      <v-col lg="2">
        <v-text-field label="指定供应商"
                        dense
                        @change="list"
                        v-model="queryParam.companyName"></v-text-field>
      </v-col>
      <v-col lg="1">
        <v-text-field label="搜索" dense v-model="queryParam.searchText"></v-text-field>
      </v-col>
      <v-col lg="2">
        <v-chip small>合计：{{moneyTaxSum}}元</v-chip>
      </v-col>
      <v-col lg="3">
        <v-radio-group v-model="queryParam.state" @change="list" dense row class="mt-0">
          <v-radio :value="0" label="未审核"></v-radio>
          <v-radio :value="1" label="已审核"></v-radio>
        </v-radio-group>
      </v-col>
      <v-spacer></v-spacer>
      <v-col lg="2">
        <v-btn @click="list" class="mr-1" small :loading="loading">查询</v-btn>
        <v-btn color="primary" small @click="exportHandler" :loading="loading">导出</v-btn>
      </v-col>

      <v-col cols="12">
        <v-data-table :headers="headers"
                      :loading="loading"
                      :server-items-length="total"
                      :options="options"
                      :items="items">

        </v-data-table>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import {materialList,exportMaterialList} from '@/api/procurement'
import {search} from '@/api/project'

export default {
  name: "history",
  data: () => ({
    staffList:[],
    headers: [
      {text:'材料名称',value:'material.name'},
      {text:'型号',value:'material.model'},
      {text:'品牌',value:'material.brand'},
      {text:'采购数量',value:'sum'},
      {text:'单位',value:'unit.name'},
      {text:'已入库数量',value:'inSum'},
      {text:'采购单价',value:'priceTax'},
      {text:'金额合计',value:'moneyTax'},
      {text:'供应单位',value:'company.name'},
      {text:'项目',value:'project.name'},
    ],
    items: [],
    options: {
      itemsPerPage: 10,
      page: 1,
    },
    total: 0,
    queryParam: {
      companyName: null,
      projectName: null,
      staffCoding: null,
      searchText: null,
      putState: null,
      startDate: null,
      endDate: null,
      page: 1,
      itemsPerPage: 10,
      state:null
    },
    menu: false,
    menu2: false,
    projectList:[],
    searchProject:null,
    loading:false,
    moneyTaxSum:0,
  }),
  watch:{
    searchProject(val){
      if(val){
        search(val).then(result=>{
          this.projectList = result
        })
      }
    },
    project(){
      this.searchProject = this.project
      this.queryParam.projectName = this.searchProject
      this.list()
    }
  },
  props:{
    project:String
  },
  created() {
    if(this.project){
      this.searchProject = this.project
      this.queryParam.projectName = this.searchProject
    }else if(this.$route.query.projectName){
      this.searchProject = this.$route.query.projectName
      this.queryParam.projectName = this.searchProject
    }
    this.list()
  },
  methods: {
    exportHandler(){
      this.loading = true
      this.queryParam.page = this.options.page
      this.queryParam.itemsPerPage = this.options.itemsPerPage
      exportMaterialList(this.queryParam).then(result=>{
        let a = document.createElement("a");
        a.download = result.substr(result.lastIndexOf("/")+1)
        a.href = result
        a.click()
      }).finally(()=>this.loading = false)
    },
    list() {
      this.loading = true
      this.queryParam.page = this.options.page
      this.queryParam.itemsPerPage = this.options.itemsPerPage
      materialList(this.queryParam).then((result) => {
        this.items = result.rows
        this.total = result.total
        this.moneyTaxSum= result.money
      }).finally(()=>this.loading=false)
    }
  }

}
</script>

<style scoped>

</style>