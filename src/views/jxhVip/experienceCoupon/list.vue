<template>
  <div>
      <v-card>
          <v-row>
              <v-col md="1">
                  <v-btn color="primary" @click="insertStart">新增</v-btn>
              </v-col>
              <v-col md="2">
                  <v-text-field v-model="queryParams.name" label="券名" dense></v-text-field>
              </v-col>
              <v-col md="2">
                  <v-text-field v-model="queryParams.suitableShop" label="适用商铺" dense></v-text-field>
              </v-col>
              <v-col md="2">
                  <v-select v-model="queryParams.newUserFlag" :items="flagItems" label="是否新人券" dense></v-select>
              </v-col>
              <v-col md="2">
                  <v-select v-model="queryParams.universalFlag" :items="flagItems" label="是否通用" dense></v-select>
              </v-col>
              <v-col md="2">
                  <v-select v-model="queryParams.vipFlag" :items="flagItems" label="是否会员券" dense></v-select>
              </v-col>
              <v-col md="2">
                  <v-select v-model="queryParams.autoFlag" :items="flagItems" label="是否自动发放" dense></v-select>
              </v-col>
              <v-spacer></v-spacer>
              <v-col md="2">
                  <div>
                      <v-btn small @click="list">搜索</v-btn>
                      <v-icon @click="resetQueryParams" style="margin-left: 5px">mdi-refresh</v-icon>
                  </div>
              </v-col>
          </v-row>
          <v-data-table
                  :headers="headers"
                  :items="desserts"
                  :loading="loading"
                  :server-items-length="total"
                  :options.sync="options"
                  class="elevation-1"
          >
              <template v-slot:item.newUserFlag="{item}">
                  <span>{{item.newUserFlag == 0 ? "否" : "是"}}</span>
              </template>

              <template v-slot:item.universalFlag="{item}">
                  <span>{{item.universalFlag == 0 ? "否" : "是"}}</span>
              </template>

              <template v-slot:item.vipFlag="{item}">
                  <span>{{item.vipFlag == 0 ? "否" : "是"}}</span>
              </template>

              <template v-slot:item.suitableShops="{item}">
                  <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                          <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                              {{item.suitableShops}}
                          </div>
                      </template>
                      <span>{{item.suitableShops}}</span>
                  </v-tooltip>
              </template>

              <template v-slot:item.actions="{ item }">

                  <v-icon
                      small
                      @click="updateStart(item)"
                  >
                      mdi-pencil
                  </v-icon>
              </template>

          </v-data-table>

          <v-dialog v-model="insertDialog" width="100%">
              <v-card>
                  <v-card-title>新增体验券</v-card-title>
                  <add ref="addExperienceCoupon"></add>
                  <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" :loading="subLoading" @click="addSubmit">提交</v-btn>
                      <v-btn @click="insertDialog = false">取消</v-btn>
                  </v-card-actions>
              </v-card>
          </v-dialog>

          <v-dialog v-model="updateDialog" width="100%">
              <v-card>
                  <v-card-title>修改体验券</v-card-title>
                  <update ref="updateExperienceCoupon" :item="item"></update>
                  <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" :loading="subLoading" @click="updateSubmit">提交</v-btn>
                      <v-btn @click="updateDialog = false">取消</v-btn>
                  </v-card-actions>
              </v-card>
          </v-dialog>
      </v-card>
  </div>
</template>
<script>
  import {listExperienceCoupon} from "@/api/jxhExperienceCoupon";
  import add from "@/views/jxhVip/experienceCoupon/component/add.vue";
  import update from "@/views/jxhVip/experienceCoupon/component/update.vue"

  export default {
      name:'experienceCoupon',
      components:{add,update},
      data:() => ({
          loading:false,
          headers: [
              {text: '券名', value: 'name'},
              {text: '适用商铺', value: 'suitableShops'},
              {text: '是否新人券', value: 'newUserFlag'},
              {text: '发放总量', value: 'totalNum'},
              {text: '已发数量', value: 'sentNum'},
              {text: '开始时间', value: 'startTime'},
              {text: '截止时间', value: 'endTime'},
              {text: '是否通用', value: 'universalFlag'},
              {text: '是否会员券', value: 'vipFlag'},
              {text: '操作',value: 'actions'}
          ],
          desserts: [],
          total:0,
          options:{},

          queryParams:{
              page: 1,
              itemsPerPage: 10,
              name:null,
              suitableShop:null,
              useFlag:null,
              newUserFlag:null,
              vipFlag:null,
              universalFlag:null,
              autoFlag:null,
          },
          flagItems: [
              {text: '否', value: 0},
              {text: '是', value: 1}
          ],

          //新增
          insertDialog:false,
          subLoading:false,
          //更新修改
          item:null,
          updateDialog: false,
      }),

      created() {
          this.list()
      },

      watch:{
          options:{
              handler(){
                  this.list()
              },
              deep:true
          }
      },

      methods:{
          list(){
              this.loading = true
              this.queryParams.itemsPerPage = this.options.itemsPerPage
              this.queryParams.page = this.options.page
              listExperienceCoupon(this.queryParams).then(res => {
                  this.desserts = res.rows
                  this.total = res.total

                  this.loading = false
              })
          },
          insertStart(){
              this.insertDialog = true
          },
          addSubmit(){
              if (this.$refs.addExperienceCoupon.validateForm()) {
                  this.subLoading = true
                  this.$refs.addExperienceCoupon.submitAdd().then(() => {
                      this.list()
                      this.$refs.addExperienceCoupon.reset()
                      this.subLoading = false
                  })
                  this.insertDialog = false
              }
          },
          updateStart(item){
              this.updateDialog = true
              this.item = item
          },
          updateSubmit(){
              if (this.$refs.updateExperienceCoupon.validateForm()){
                  this.subLoading = true
                  this.$refs.updateExperienceCoupon.submitAdd().then(() => {
                      this.list()
                      this.$refs.updateExperienceCoupon.reset()
                      this.subLoading = false
                  })
                  this.updateDialog = false
              }
          },
          resetQueryParams(){
              this.queryParams = {
                  page: 1,
                  itemsPerPage: 10,
                  name:null,
                  suitableShop:null,
                  useFlag:null,
                  newUserFlag:null,
                  vipFlag:null,
                  universalFlag:null,
                  autoFlag:null,
              }
          }
      }
  }
</script>