<template>
  <div>
    <v-row dense>
      <v-col lg="1" sm="2">
        <v-btn color="primary" small @click="insertHandler">新增</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col>
        <v-text-field label="搜索" @change="list" dense hide-details v-model="filter.companyName"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :items="items"
                  :options="options"
                  :server-items-length="total"
                  :headers="headers" sort-desc sort-by="logDate">
      <template v-slot:item.action="{item}">
        <v-btn x-small @click="proHistoryHandler(item)">采购记录</v-btn>
        <v-btn class="ml-1" x-small @click="putHistoryHandler(item)">入库记录</v-btn>
        <v-btn class="ml-1" x-small @click="contractHistoryHandler(item)">合同记录</v-btn>
        <v-btn class="ml-1" x-small @click="payHistoryHandler(item)">付款记录</v-btn>
        <v-btn class="ml-1" x-small @click="detailHandler(item)">详情</v-btn>
      </template>
    </v-data-table>
<!--    编辑单位-->
    <v-dialog v-model="companyDialog" width="80%">
      <v-card class="pa-3">
        <add-company v-model="item" ref="companyForm"></add-company>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="companyDialog = false">取消</v-btn>
          <v-btn color="primary" @click="saveCompany" :loading="loading">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {listByPage} from "@/api/company"

export default {
  name: "index",
  components:{
    addCompany: () => import('@/components/addCompany'),
  },
  data: () => ({
    filter: {
      companyName: null,
    },
    items: [],
    options: {
      sortBy:["logDate"],
      sortDesc:[true],
      page:1,
      itemsPerPage:10
    },
    headers: [
      {text: '单位名称', value: 'name'},
      {text: '银行账号', value: 'bankNumber'},
      {text: '开户行名称', value: 'openAccount'},
      {text: '银行行号', value: 'lineNum'},
      {text: '联系人', value: 'relationP'},
      {text: '联系方式', value: 'telephoneP'},
      // {text: '本月采购', value: 'proMoney'},
      // {text: '本年采购', value: 'yearMoney'},
      // {text: '累计采购', value: 'allMoney'},
      // {text: '本月收票', value: 'bill'},
      // {text: '本年收票', value: 'yearBill'},
      // {text: '累计收票', value: 'allBill'},
      {text: '操作', value: 'action'},
    ],
    loading: false,
    total: 0,
    item:null,
    companyDialog:false,
  }),
  watch:{
    options:{
      handler(){
        this.list()
      },
      deep:true,
      immediate:true
    }
  },
  created() {

  },
  methods: {
    contractHistoryHandler(item){
      let routeUrl = this.$router.resolve({
        path: `/purchaseContractForKaiLi/list/contractList`,
        query:{companyId:item.id,companyName:item.name}
      });
      window.open(routeUrl.href, '_blank');
    },
    payHistoryHandler(item){
      let routeUrl = this.$router.resolve({
        path: `/contract/payment/list`,
        query:{companyId:item.id,companyName:item.name}
      });
      window.open(routeUrl.href, '_blank');
    },
    proHistoryHandler(item){
      let routeUrl = this.$router.resolve({
        path: `/company/proHistory/${item.id}/${item.name}`
      });
      window.open(routeUrl.href, '_blank');
    },
    putHistoryHandler(item){
      let routeUrl = this.$router.resolve({
        path: `/company/putHistory/${item.id}/${item.name}`
      });
      window.open(routeUrl.href, '_blank');
    },
    insertHandler(){
      this.companyDialog = true
      if(this.$refs.companyForm){
        this.$refs.companyForm.reset()
      }
    },
    saveCompany() {
      this.loading = true
      this.$refs.companyForm.saveCompany().then(() => {
        this.companyDialog = false
        this.list()
      }).finally(() => this.loading = false)
    },
    detailHandler(item){
      this.item = item
      this.companyDialog =  true
    },
    list() {
      let q = Object.assign({}, this.options)
      q = Object.assign(q, this.filter)
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0] ? "desc" : "asc"
      this.loading = true
      listByPage(q).then(result => {
        this.items = result.rows
        this.total = result.total
      }).finally(() => this.loading = false)
    }
  }
}
</script>

<style scoped>

</style>