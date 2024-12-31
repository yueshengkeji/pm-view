<template>
  <div>
      <v-row>
          <v-col md="2">
              <v-autocomplete v-model="shopSelected" :items="shopItems" :search-input.sync="searchItemText" label="商铺" return-object item-text="brand" dense></v-autocomplete>
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
          </v-data-table>
      </v-card>
  </div>
</template>
<script>
import {listVerificationRecords} from "@/api/jxhExperienceCouponVerification";
import {zujinList} from "@/api/zujin";

export default {
    name:'verificationRecords',
    data:() => ({
        loading:false,
        headers: [
            {text: '优惠券名', value: 'experienceCoupon.name'},
            {text: '核销商铺', value: 'proZujin.brand'},
            {text: '使用人', value: 'user.mobilePhone'},
            {text: '核销时间', value: 'createTime'},
        ],
        desserts: [],
        total:0,
        options:{},

        queryParams: {
            page: 1,
            itemsPerPage: 10,
            shopId:null,
            userId:null,
        },

        //zujinList
        shopsQueryParams: {
            page: 1,
            itemsPerPage:10,
            searchText:null,
            endFlag2: 9
        },
        shopItems:[],
        shopSelected:null,
        searchItemText:null
    }),
    watch:{
        searchItemText:{
            handler(){
                if (this.searchItemText != null){
                    this.listShops()
                }
            }
        }
    },
    created() {
        this.list()
    },
    methods:{
        list(){
            this.loading = true
            this.queryParams.itemsPerPage = this.options.itemsPerPage
            this.queryParams.page = this.options.page
            listVerificationRecords(this.queryParams).then(res => {
                this.desserts = res.rows
                this.total = res.total

                this.loading = false
            })
        },
        resetQueryParams(){
            this.queryParams = {
                page: 1,
                itemsPerPage: 10,
                shopId:null,
                userId:null,
            }
        },
        listShops() {
            this.shopsQueryParams.searchText = this.searchItemText
            zujinList(this.shopsQueryParams).then(res => {
                this.shopItems = res.rows
            })
        },
    }
}
</script>