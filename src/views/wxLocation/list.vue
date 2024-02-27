<template>
  <div>
    <v-row dense>
      <v-col sm="2">
        <select-staff v-model="searchStaff" label="指定员工" dense></select-staff>
      </v-col>
      <v-col sm="1">
        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{on,attrs}">
            <v-text-field dense v-on="on" v-bind="attrs" label="开始日期" v-model="q.startDate"></v-text-field>
          </template>
          <v-date-picker v-model="q.startDate" @change="$refs.menu.save()"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="1">
        <v-menu ref="menu2" v-model="menu2">
          <template v-slot:activator="{on,attrs}">
            <v-text-field dense v-on="on" v-bind="attrs" label="截止日期" v-model="q.endDate"></v-text-field>
          </template>
          <v-date-picker v-model="q.endDate" @change="list"></v-date-picker>
        </v-menu>
      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="1" cols="3">
        <v-btn small color="primary" @click="extraInsertDialogAction">报销补登</v-btn>
      </v-col>
      <v-col sm="1" cols="3">
        <v-btn small color="primary" @click="expenseDialog=true">报销记录</v-btn>
      </v-col>
    </v-row>
    <v-data-table :items="data.rows"
                  sort-by="startTime"
                  sort-desc
                  :options.sync="options"
                  :server-items-length="data.total" :headers="headers">

      <template v-slot:item.startTime="{item}">
        {{formatDateStr(item.startTime,5,16)}}
      </template>

      <template v-slot:item.endTime="{item}">
        {{formatDateStr(item.endTime,5,16)}}
      </template>

      <template v-slot:item.startImg="{item}">
        <img @click.stop="imgPrevHandler(item.startImg)" :src="serverPath+item.startImg"
             style="width: 50px;height: 50px;">
      </template>

      <template v-slot:item.endImg="{item}">
        <img @click.stop="imgPrevHandler(item.endImg)" v-if="item.endImg" :src="serverPath+item.endImg"
             style="width: 50px;height: 50px;">
        <p v-else>未到达</p>
      </template>

      <template v-slot:item.isParkingCost="{item}">
        <div>{{ item.isParkingCost == '0' ? '' : '有' }}</div>
      </template>

      <template v-slot:item.parkingCostImg="{item}">
        <img @click.stop="imgPrevHandler(item.parkingCostImg)" v-if="item.parkingCostImg"
             :src="serverPath+item.parkingCostImg" style="width: 50px;height: 50px;">
      </template>

      <template v-slot:item.startAddrName="{item}">
        <div v-if="item.endImg == null">{{item.startAddrName}}</div>
        <a v-else @click="routeDataHandler(item)">{{item.startAddrName}}</a>
      </template>
      <template v-slot:item.endAddrName="{item}">
        <div v-if="item.endImg == null">{{item.endAddrName}}</div>
        <a v-else @click="routeDataHandler(item)">{{item.endAddrName}}</a>
      </template>

    </v-data-table>

    <v-dialog v-model="imgDialog" width="50%">
      <v-card class="pa-2">
        <v-img :src="imgPath" style="width:100%;height: auto"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="imgDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

<!--    地图-->
    <v-dialog v-model="mapDialog" width="80%">
      <v-card class="pa-2">

        <map-route :data="routeData" :other-info="otherInfo"></map-route>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="mapDialog=false">关闭</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

<!--    报销统计-->
    <v-dialog v-model="expenseDialog" width="98%">
      <v-card class="pa-2">
        <expense-list :query="q"></expense-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary">导出</v-btn>
          <v-btn @click="expenseDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="extraInsertDialog" width="80%">
      <v-card class="pa-2">
        <extra-insert-location ref="extraInsert"></extra-insert-location>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="extraInsert">提交</v-btn>
          <v-btn @click="extraInsertDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import {list} from '@/api/outCarHistory'
import {getConfig} from "@/api/systemConfig"
import SelectStaff from "@/views/user/select.vue";
import extraInsertLocation from "./extraInsertLocation";

export default {
  name: "locationList",
  components:{
    SelectStaff,
    extraInsertLocation,
    mapRoute:()=>import('@/views/map/route.vue'),
    expenseList:()=>import('@/views/wxLocation/expenseList.vue')
  },
  data: () => ({
    data: {
      rows: [],
      total: 0
    },
    headers: [
      {text: '登记人', value: 'staff.name'},
      {text: '事由', value: 'remark'},
      {text: '出发日期', value: 'startTime'},
      {text: '出发地点', value: 'startAddrName'},
      {text: '出发记录', value: 'startImg'},
      {text: '到达日期', value: 'endTime'},
      {text: '到达地点', value: 'endAddrName'},
      {text: '到达图片', value: 'endImg'},
      {text: '系统里程', value: 'systemKm'},
      {text: '实际里程', value: 'inputKm'},
      {text: '停车费', value: 'isParkingCost'},
      {text: '付款记录', value: 'parkingCostImg'},
      {text: '项目', value: 'project.name'},
    ],
    options: {
      page: 1,
      itemsPerPage: 10
    },
    q: {
      startDate: '',
      endDate: ''
    },
    menu: false,
    menu2: false,
    serverPath: null,
    imgDialog: false,
    imgPath: null,
    mapDialog: false,
    routeData:{
      center:{lat:0,lng:0},
      position:{start:{lat:0,lng:0},end:{lat:0,lng:0}},
    },
    otherInfo:null,
    searchStaff:null,
    expenseDialog:false,

    extraInsertDialog:false
  }),
  watch: {
    searchStaff:{
      handler(){
        this.list()
      }
    },
    options: {
      handler() {
        console.log("options")
        this.list()
      },
      deep: true,
    },
  },
  created() {
    getConfig("FTP_SERVER_PATH").then(result2 => {
      if (result2.id) {
        this.serverPath = result2.value
      }
    })
  },
  methods: {
    routeDataHandler(item)
    {
      this.routeData = {
        center:{lat:item.startLatitude,lng:item.startLongitude},
        position:{
          start:{lat:item.startLatitude,lng:item.startLongitude},
          end:{lat:item.endLatitude,lng:item.endLongitude},
        }
      }
      this.otherInfo = `<h3>${item.staff.name}-${item.remark || ''}</h3><p>${item.datetime}</p><p>${item.startAddrName}</p><p>到</p><p>${item.endAddrName}</p>`
      + `<p>系统里程合计：${item.systemKm}</p>`
      + `<p>实际里程合计：${item.inputKm}</p>`
      + `<p>停车费：${item.isParkingCost == 0 ? '无' : '有'}</p>`
      this.mapDialog = true
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.options)
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0] ? 'desc' : 'asc'
      q.startDate = this.q.startDate
      q.endDate = this.q.endDate
      if(this.searchStaff){
        q.staffId = this.searchStaff.id
      }
      list(q).then((result) => this.data = result).finally(() => this.loading = false)
    },
    imgPrevHandler(path) {
      this.imgPath = this.serverPath + path
      this.imgDialog = true
    },
    extraInsertDialogAction(){
      this.extraInsertDialog = true
      this.$nextTick(() => {
        this.$refs.extraInsert.resetFormRules()
      })
    },
    extraInsert(){
      if (this.$refs.extraInsert.validateForm()) {
        this.$refs.extraInsert.submitExtraInsert().then(res => {
          if (res != null) {
            this.list()
          }
        })
        this.extraInsertDialog = false
      }
    }
  }
}
</script>

<style scoped>

</style>
