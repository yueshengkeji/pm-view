<template>
  <div>
    <v-row>
      <v-col lg="2">
        <v-autocomplete label="指定项目"
                        :items="projectList"
                        :search-input.sync="searchProject"
                        dense
                        @change="list"
                        v-model="queryParam.projectId"
                        item-value="id"
                        item-text="name"></v-autocomplete>
      </v-col>

      <v-col lg="3" cols="12">
        <v-radio-group dense v-model="queryParam.state" row class="mt-0" @change="list">
          <v-radio label="未审核" :value="0"></v-radio>
          <v-radio label="已审核" :value="1"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col lg="1">
        <v-text-field label="搜索" dense v-model="queryParam.searchText" @change="list"></v-text-field>
      </v-col>
      <v-col lg="2">
        <v-chip small>合计：{{moneyTaxSum}}元</v-chip>
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
import {getAllMaterByProject,exportAllByProjectId} from '@/api/plan'
import {search,getById} from '@/api/project'

export default {
  name: "history",
  data: () => ({
    staffList:[],
    headers: [
      {text:'材料名称',value:'material.name'},
      {text:'型号',value:'material.model'},
      {text:'品牌',value:'material.brand'},
      {text:'计划数量',value:'planSum'},
      {text:'单位',value:'material.unit.name'},
      {text:'计划单价',value:'planPrice'},
      {text:'金额合计',value:'taxMoney'}
    ],
    items: [],
    options: {
      itemsPerPage: 10,
      page: 1,
    },
    total: 0,
    queryParam: {
      companyName: null,
      projectId: null,
      staffCoding: null,
      searchText: null,
      putState: null,
      startDate: null,
      endDate: null,
      page: 1,
      itemsPerPage: 10,
      state:1
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
      this.queryParam.projectId = this.project
      this.loadProject()
      this.list()
    }
  },
  props:{
    project:String
  },
  created() {
    if(this.project){
      this.queryParam.projectId = this.project
      this.loadProject()
    }else if(this.$route.params.projectId){
      this.queryParam.projectId = this.$route.params.projectId
      this.loadProject()
    }
    this.list()
  },
  methods: {
    exportHandler(){
      this.loading = true
      this.queryParam.page = this.options.page
      this.queryParam.itemsPerPage = this.options.itemsPerPage
      exportAllByProjectId(this.queryParam.projectId,this.queryParam).then(result=>{
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
      getAllMaterByProject(this.queryParam.projectId,this.queryParam).then((result) => {
        this.items = result.rows
        this.total = result.total
        this.moneyTaxSum= result.money
      }).finally(()=>this.loading=false)
    },
    loadProject(){
      getById(this.queryParam.projectId).then(result=>{
        this.projectList.push(result)
      })
    }
  }

}
</script>

<style scoped>

</style>