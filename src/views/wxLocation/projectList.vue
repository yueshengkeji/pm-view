<template>
<div>
  <v-row>
    <v-col sm="5" cols="12">
      <v-btn small @click="exportExcelHandler" :loading="loading" class="mr-1">导出</v-btn>
      <v-chip small class="mr-1">系统里程合计：{{systemKm}}</v-chip>
      <v-chip small>实际里程合计：{{inputKm}}</v-chip>
    </v-col>
    <v-col sm="2">
      <v-menu v-model="menu" ref="menu" :close-on-click="false" :close-on-content-click="false">
        <template v-slot:activator="{on,attrs}">
          <v-text-field clearable dense v-on="on" v-bind="attrs" label="日期范围" v-model="dates" @change="list"></v-text-field>
        </template>
        <v-date-picker range v-model="dates" @change="datesChangeHandler"></v-date-picker>
      </v-menu>
    </v-col>
    <v-col sm="1" cols="12">
      <select-staff dense v-model="staff" label="员工姓名" @change="list"></select-staff>
    </v-col>
    <v-col sm="2" cols="12">
      <v-combobox label="项目名称"
                   dense
                  v-model="query.projectName"
                  :items.sync="projectItems"
                  item-text="name"
                  item-value="name"
                  :return-object="false"
                  :search-input.sync="searchProject"></v-combobox>
    </v-col>
    <v-col sm="2" cols="12">
      <v-text-field dense label="搜索" v-model="query.searchText"></v-text-field>
    </v-col>
    <v-col cols="12">
      <v-data-table :items.sync="data.rows"
                    :options.sync="options"
                    :loading="loading"
                    :server-items-length="data.total"
                    sort-by="expense.datetime"
                    sort-desc
                    :headers="headers">
        <template v-slot:item.history.startImg="{item}">
          <img @click.stop="imgPrevHandler(item.history.startImg)" :src="serverPath+item.history.startImg"
               style="width: 50px;height: 50px;">
        </template>

        <template v-slot:item.history.endImg="{item}">
          <img @click.stop="imgPrevHandler(item.history.endImg)" v-if="item.history.endImg" :src="serverPath+item.history.endImg"
               style="width: 50px;height: 50px;">
          <p v-else>未到达</p>
        </template>

        <template v-slot:item.history.isParkingCost="{item}">
          <div>{{ item.history.isParkingCost == '0' ? '' : '有' }}</div>
        </template>

        <template v-slot:item.history.parkingCostImg="{item}">
          <img @click.stop="imgPrevHandler(item.history.parkingCostImg)" v-if="item.history.parkingCostImg"
               :src="serverPath+item.history.parkingCostImg" style="width: 50px;height: 50px;">
        </template>
      </v-data-table>
    </v-col>

    <v-dialog v-model="imgDialog" width="50%">
      <v-card class="pa-2">
        <v-img :src="imgPath" style="width:100%;height: auto"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="imgDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</div>
</template>

<script>
import {search} from "@/api/project"
import {detailList,exportDetailList} from "@/api/outCarHistory"
import {getConfig} from "@/api/systemConfig";
import SelectStaff from "@/views/user/select.vue";

export default {
  name: "projectList",
  components: {SelectStaff},
  data:()=>({
    query:{
      projectName:null,
      searchText:null
    },
    headers:[
      {text: '报销日期', value: 'expense.datetime'},
      {text: '登记人', value: 'history.staff.name'},
      {text: '事由', value: 'history.remark'},
      {text: '出发日期', value: 'history.startTime'},
      {text: '出发地点', value: 'history.startAddrName'},
      {text: '出发记录', value: 'history.startImg'},
      {text: '到达日期', value: 'history.endTime'},
      {text: '到达地点', value: 'history.endAddrName'},
      {text: '到达图片', value: 'history.endImg'},
      {text: '系统里程', value: 'history.systemKm'},
      {text: '实际里程', value: 'history.inputKm'},
      {text: '停车费', value: 'history.isParkingCost'},
      {text: '付款记录', value: 'history.parkingCostImg'},
      {text: '项目', value: 'history.project.name'},
    ],
    data:{
      rows:[],
      total:0
    },
    searchProject:null,
    projectItems:[],
    options:{
      page:1,
      itemsPerPage:10,
      sortBy:['expense.datetime'],
      sortDesc:[true]
    },
    loading:false,
    serverPath:null,
    imgDialog:false,
    imgPath:null,
    systemKm:0,
    inputKm:0,
    staff:null,
    dates:[],
    menu:false,
  }),
  watch:{
    searchProject(val)
    {
      if(val)
      {
        search(val).then(result=>{
          this.projectItems = result
        })
      }
    },
    query:{
      handler(){
        this.list()
      },
      deep:true
    },
    options:{
      handler(){
        this.list()
      },
      deep:true
    }
  },
  created() {
    getConfig("FTP_SERVER_PATH").then(result2 => {
      if (result2.id) {
        this.serverPath = result2.value
      }
    })
  },
  methods:{
    exportExcelHandler(){
      this.loading = true
      exportDetailList(this.getQuery()).then(result=>{
        this.downloadFile(result)
      }).finally(()=>this.loading = false)
    },
    datesChangeHandler(){
      this.$refs.menu.save()
      this.list()
    },
    imgPrevHandler(path) {
      this.imgPath = this.serverPath + path
      this.imgDialog = true
    },
    getQuery() {
      let q = Object.assign({},this.options)
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0] ? 'desc':'asc'
      q =  Object.assign(q,this.query)
      q.searchText = q.searchText == "" ? null : q.searchText
      q.projectName = q.projectName == "" ? null : q.projectName
      if(this.staff){
        q.staffId = this.staff.id
      }
      if(this.dates && this.dates.length === 2){
        q.startDate = this.dates[0] + " 00:00:00"
        q.endDate = this.dates[1] + " 23:59:59"
      }
      return q;
    },
    list(){
      this.loading = true
      let q = this.getQuery()
      detailList(q).then(result=>{
        this.data = result
        if(this.data.moneyTotal){
          this.systemKm = this.data.moneyTotal.title || 0
          this.inputKm = this.data.moneyTotal.money || 0
        }
      }).finally(()=>this.loading = false)
    }
  }
}
</script>

<style scoped>

</style>