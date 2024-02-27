<template>
  <div>
    <v-row dense>
      <v-col md="3" cols="12">
        <v-radio-group v-model="queryParam.type" row @change="list">
          <v-radio :value="0" label="未签字"></v-radio>
          <v-radio :value="1" label="已签字">≈</v-radio>
          <v-radio :value="2" label="超时自动入库"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
    <v-data-table :items="items"
                  :options.sync="options"
                  :server-items-length="total"
                  sort-desc
                  sort-by="putDate"
                  :loading="loading"
                  hide-default-footer
                  :headers="headers">
      <template v-slot:item.procurement.pmNumber="{item}">
        <a v-if="item.procurement" href="###"
           @click.stop="proDetailHandler(item.procurement.id)">{{ item.procurement.pmNumber }}</a>
      </template>
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
    <v-dialog width="70%" v-model="imgDialog">
      <v-card class="pa-3">
        <v-img :src="item.signImg" width="100%"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="imgDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar centered v-model="msgFlag">{{ msg }}</v-snackbar>

    <instance-detail :frame="frameId" @close="closeHandler"></instance-detail>

  </div>
</template>

<script>
import { wxNotify, listSign} from '@/api/proSign'

export default {
  name: "signList",
  components:{
    instanceDetail:()=>import('@/components/easyflow/instance-detail')
  },
  data: () => ({
    imgDialog: false,
    items: [],
    headers: [
      {text: '采购单编号', value: 'procurement.pmNumber'},
      {text: '采购员', value: 'procurement.staff.name'},
      {text: '签字人员', value: 'signStaff.name'},
      {text: '发起时间', value: 'putDate'},
      {text: '过期时间', value: 'pastDate'},
      {text: '状态', value: 'type'},
      {text: '签字时间', value: 'signDate'},
      {text: '签名', value: 'signImg'},
      {text: '操作', value: 'action'},
    ],
    loading: false,
    options: {},
    msgFlag: false,
    msg: null,
    item: {
      signImg: null
    },
    queryParam:{
      // 0=未签字，1=已签字，2=超时自动入库
      type:0,
      // 入库人员
      staffId:null
    },
    total:0,
    frameId:null,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  created() {
    this.queryParam.staffId = this.$store.state.user.id
  },
  methods: {
    closeHandler(isClose){
      if(isClose){
        this.frameId= null
      }
    },
    proDetailHandler(id){
      this.frameId = id
    },
    imgPreviewHandler(item) {
      this.item = item
      this.imgDialog = true
    },
    notifyHandler(item) {
      wxNotify(item).then(() => {
        this.msg = '操作成功'
        this.msgFlag = true
      })
    },
    list() {
      let q = Object.assign({}, this.options)
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0] ? "DESC" : "ASC"
      this.loading = true
      let promise;
      q.type = this.queryParam.type
      q.staffId = this.queryParam.staffId
      promise = listSign(q)
      promise.then(result => {
        this.items = result.rows
        this.total= result.total
      }).finally(() => this.loading = false)
    }
  }
}
</script>

<style scoped>

</style>