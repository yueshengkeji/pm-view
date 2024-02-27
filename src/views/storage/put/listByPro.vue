<template>
  <!--    入库单管理-->
  <div>

    <p>待签字列表</p>
    <v-data-table :loading="loading" hide-default-footer :items-per-page="-1" :items="signItems" :headers="signHeaders">
      <template v-slot:item.type="{item}">
        <div>{{ item.type == 0 ? '未签字' : '已签字' }}</div>
      </template>
      <template v-slot:item.signImg="{item}">
        <v-img :src="item.signImg" width="100px" @click="imgPreviewHandler(item)"></v-img>
      </template>
      <template v-slot:item.action="{item}">
        <v-btn x-small v-if="item.type == 0 && !$vuetify.breakpoint.xs" @click="notifyHandler(item)">推送到手机
        </v-btn>
      </template>
    </v-data-table>

    <p>入库单列表</p>
    <v-data-table :loading="loading"
                  :items-per-page="-1"
                  hide-default-footer
                  @dblclick:row="detail"
                  :items="items"
                  :headers="headers">

      <template v-slot:item.approveType="{item}">
        {{ formatApproveType(item.approveType) }}
      </template>

      <template v-slot:item.procurement.pmNumber="{item}">
        {{item.procurement.pmNumber}}
      </template>

      <template v-slot:item.action="{item}">
        <v-btn x-small @click="detail($event,{item})">明细</v-btn>
        <v-btn x-small color="error" @click="deleteHandler(item)" v-if="item.approveType == 0">删除</v-btn>
      </template>

    </v-data-table>
    <!--        入库单明细/新增其他入库-->
    <v-dialog v-model="putDetailDialog" width="98%">
      <v-card class="pa-3">
        <put-detail ref="putDetail" :putStorage="putStorage" v-model="putItem"></put-detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="putDetailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

<!--    图片预览-->
    <v-dialog width="70%" v-model="imgDialog">
      <v-card class="pa-3">
        <v-img :src="item.signImg" width="100%"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="imgDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {deletePut, byProId, getMaterial, queryByPutId} from '@/api/put'
import {getListByProId, wxNotify} from '@/api/proSign'

export default {
  name: "proPutList",
  components: {
    putDetail: () => import('@/components/15327'),
  },
  data: () => ({
    loading: false,
    items: [],
    headers: [
      {text: "供应单位", value: 'company.name'},
      {text: "采购单号", value: 'procurement.pmNumber', sortable: false},
      {text: "入库单号", value: 'putSerial'},
      {text: "入库时间", value: 'putDate'},
      {text: "入库人员", value: 'staff.name'},
      {text: "审核人员", value: 'approve.name'},
      {text: "审核状态", value: 'approveType'},
      {text: "操作", value: 'action', sortable: false, width: '180px'},
    ],
    signItems:[],
    signHeaders:[
      {text: '发起人', value: 'staff.name'},
      {text: '签字人员', value: 'signStaff.name'},
      {text: '发起时间', value: 'putDate'},
      {text: '过期时间', value: 'pastDate'},
      {text: '状态', value: 'type'},
      {text: '签字时间', value: 'signDate'},
      {text: '签名', value: 'signImg'},
      {text: '操作', value: 'action'},
    ],
    putDetailDialog: false,
    putStorage: {
      money: 0,
      company: null,
      project: null,
      sign: null,
      pm02620: null,
      tax: null,
      putSerial: null,
      saleMoney: null,
      moneyTax: null,
      materialList: []
    },
    putItem: {
      putSerial: null,
      procurement: {pmNumber: null},
      storage: {name: null},
      company: {name: null},
      approveDate: null,
      staff: {name: null},
      remark: null,
      materialList: null,
      saleMoney: '',
      pm02620: '',
      sign: null,
      money: 0,
      moneyTax: 0,
      putDate: null,
      tax: '0'
    },
    item:{
      signImg:null
    },
    imgDialog:false,
  }),
  props: {
    proId: String
  },
  watch: {
    proId() {
      this.list()
    }
  },
  created() {
    this.list()
  },
  methods: {
    notifyHandler(item) {
      wxNotify(item).then(() => {
        this.message('操作成功')
      })
    },
    imgPreviewHandler(item) {
      this.item = item
      this.imgDialog = true
    },
    list() {
      this.loading = true
      byProId(this.proId).then(result => {
        this.items = result
      }).finally(() => this.loading = false)

      getListByProId(this.proId).then(result=>{
        this.signItems = result
      })
    },
    showSignState() {
      queryByPutId(this.putItem.id).then(result => {
        this.$set(this.putItem,"sign",result)
      })
    },
    refreshCountMoney() {
      if (this.$refs.putDetail) {
        this.$refs.putDetail.refreshCountMoney()
      }
    },
    detail(e, {item}) {
      if (item.materialList) {
        this.putItem = Object.assign({}, item)
        this.refreshCountMoney()
        this.showSignState()
        this.putDetailDialog = true
      } else {
        getMaterial(item.id).then(result => {
          item.materialList = result
          this.putItem = Object.assign({}, item)
          this.refreshCountMoney()
          this.showSignState()
          this.putDetailDialog = true
        })
      }
    },
    deleteHandler(item) {
      if (item.procurement == null) {
        item.procurement = {pmNumber: ''}
      }
      this.confirm("确定删除:" + item.procurement.pmNumber + "?").then(() => {
        deletePut(item.id).then(this.list)
      })
    },
  }
}
</script>

<style scoped>

</style>