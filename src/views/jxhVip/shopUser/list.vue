<template>
  <div>
      <v-row>
          <v-col md="1">
              <v-btn color="primary" @click="insertStart">新增</v-btn>
          </v-col>
          <v-col md="2">
              <v-text-field v-model="queryParams.shopName" label="商铺" dense></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col md="2">
              <div>
                  <v-btn small @click="list">搜索</v-btn>
                  <v-icon @click="resetQueryParams" style="margin-left: 5px">mdi-refresh</v-icon>
              </div>
          </v-col>
      </v-row>
      <v-card>
          <v-data-table
                  :headers="headers"
                  :items="desserts"
                  :loading="loading"
                  :server-items-length="total"
                  :options.sync="options"
                  class="elevation-1"
                  hide-default-footer
          >
              <template v-slot:item.actions="{ item }">

                  <v-icon
                          small
                          @click="updateStart(item)"
                  >
                      mdi-pencil
                  </v-icon>
              </template>
          </v-data-table>
      </v-card>

      <v-dialog v-model="insertDialog" width="100%">
          <v-card>
              <v-card-title>新增商户账号</v-card-title>
              <add ref="addShopUser"></add>
              <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" :loading="subLoading" @click="addSubmit">提交</v-btn>
                  <v-btn @click="insertDialog = false">取消</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>

      <v-dialog v-model="updateDialog" width="100%">
          <v-card>
              <v-card-title>修改商户账号</v-card-title>
              <update ref="updateShopUser" :item="item"></update>
              <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" :loading="subLoading" @click="updateSubmit">提交</v-btn>
                  <v-btn @click="updateDialog = false">取消</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>
  </div>
</template>
<script>
import {listShopUser} from "@/api/jxhShopUser";
import add from "@/views/jxhVip/shopUser/component/add.vue";
import update from "@/views/jxhVip/shopUser/component/update.vue";

export default {
    name:'shopUserList',
    components: {add,update},
    data:() => ({
        loading:false,
        headers: [
            {text: '昵称', value: 'name'},
            {text: '账号', value: 'loginName'},
            {text: '商铺', value: 'shopName'},
            {text: '创建时间', value: 'createTime'},
            {text: '操作',value: 'actions'}
        ],
        desserts: [],
        total:0,
        options:{},

        queryParams:{
            page: 1,
            itemsPerPage: 10,
            shopName: null,
        },

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

    methods:{
        list(){
            this.loading = true
            this.queryParams.itemsPerPage = this.options.itemsPerPage
            this.queryParams.page = this.options.page
            listShopUser(this.queryParams).then(res => {
                this.desserts = res.rows
                this.total = res.total

                this.loading = false
            })
        },

        insertStart(){
            this.insertDialog = true
        },
        addSubmit(){
            if (this.$refs.addShopUser.validateForm()) {
                this.subLoading = true
                this.$refs.addShopUser.submitAdd().then(() => {
                    this.list()
                    this.$refs.addShopUser.reset()
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
            if (this.$refs.updateShopUser.validateForm()){
                this.subLoading = true
                this.$refs.updateShopUser.submitUpdate().then(() => {
                    this.list()
                    this.$refs.updateShopUser.reset()
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
                shopName:null
            }
        }
    }
}
</script>