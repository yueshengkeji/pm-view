<template>
  <div>
    <v-row>
      <v-col sm="1">
        <v-btn color="primary" @click="detailDialog = true">新增</v-btn>
      </v-col>
    </v-row>

    <v-data-table :headers="headers"
                  sort-desc
                  sort-by="po20408"
                  :options.sync="options"
                  :server-items-length="query.total"
                  :items="items">
      <template v-slot:item.action="{item}">
        <v-btn x-small color="error" @click="delHandler(item)">删除</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="detailDialog">
      <v-card class="pa-5">

        <frame15223 v-model="item" @success="saveSuccessHandler" ref="detailForm"></frame15223>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="save">提交</v-btn>
          <v-btn @click="detailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import {list,deleteWorkMaterial} from '@/api/workMaterial'
import frame15223 from '@/components/15223'

export default {
  name: "workMater-index",
  components: {
    frame15223
  },
  data: () => ({
    items: [],
    headers: [
      {
        text: "材料名称",
        value: 'materOut.material.name'
      },
      {
        text: "领用数量",
        value: 'materOut.sum'
      },
      {
        text: "单位",
        value: 'materOut.material.unit.name'
      }, {
        text: "时间",
        value: 'materOut.outDate'
      },{
        text: "操作",
        value: 'action'
      },
    ],
    query: {total: 0},
    options: {},
    detailDialog: false,
    item: null,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  mounted() {

  },
  methods: {
    delHandler(item){
      this.confirm("确定删除吗？").then(()=>{
        deleteWorkMaterial(item.materOut.materOutId,item.materOut.id).then(this.list)
      })
    },
    saveSuccessHandler(){
      this.detailDialog = false
      this.list()
    },
    list() {
      this.query = Object.assign({}, this.options)
      this.query.sortBy = this.query.sortBy[0]
      this.query.sortDesc = this.query.sortDesc[0] ? 'desc' : 'asc'
      list(this.query).then(result => {
        this.items = result.rows
        this.query.total = result.total
      })
    },
    save() {
      this.$refs.detailForm.save()
    }
  }
}
</script>

<style scoped>

</style>