<template>
  <div>
    <v-data-table :items="data.rows"
                  :headers="headers"
                  :options.sync="options"
                  sort-by="backDatetime"
                  sort-desc
                  :server-items-length="data.total">
      <template v-slot:item.toApply="{item}">
        {{ item.toApply ? '已退回' : '无需退回' }}
      </template>
      <template v-slot:item.action="{item}">
        <v-btn outlined :to="`/procurement/back/update/${item.id}`" x-small target="_blank">明细</v-btn>
        <v-btn outlined @click="deleteHandler(item)" color="error" x-small class="ml-1">删除</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {deleteById, list} from '@/api/proBack'

export default {
  name: "proBack-list",
  data: () => ({
    headers: [
      {text: '退货单号', value: 'title'},
      {text: '退货原因', value: 'remark'},
      {text: '供应单位', value: 'company.name'},
      {text: '退货时间', value: 'backDatetime'},
      {text: '登记人', value: 'staff.name'},
      {text: '退货总金额', value: 'money'},
      {text: '税率', value: 'tax'},
      {text: '是否回退到申请单', value: 'toApply'},
      {text: '操作', value: 'action'},
    ],
    data: {
      rows: [],
      total: 0
    },
    options: {},
    query: {
      proId: null
    }
  }),
  props: {
    proId: null
  },
  methods: {
    deleteHandler(item){
      this.confirm("确定删除该退货单？订单采购信息将同步回滚").then(()=>{
        deleteById(item.id).then(()=>{
          this.$emit("deleteHandler",item)
          this.list()
        })
      })
    },
    list() {
      this.loading = true
      let p = Object.assign({}, this.options)
      p.proId = this.proId
      p.sortBy = p.sortBy[0]
      p.sortDesc = p.sortDesc[0]
      console.log("p",p)
      list(p).then(result => {
        this.data = result
      }).finally(() => this.loading = false)
    }
  },
  watch:{
    options:{
      handler(){
        this.list()
      },
      deep:true
    }
  }
}
</script>

<style scoped>

</style>