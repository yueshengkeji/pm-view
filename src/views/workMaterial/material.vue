<template>
  <div>
    <v-row>
      <v-col sm="2">
        <v-btn outlined small @click="exportHandler" :loading="loading">导出</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="2">
        <v-text-field label="库存最小值"
                      type="number"
                      v-model="options.minNumber"></v-text-field>
      </v-col>
      <v-col sm="2">
        <v-text-field label="库存最大值"
                      type="number"
                      v-model="options.maxNumber"></v-text-field>
      </v-col>
      <v-col sm="2">
        <v-text-field label="搜索" v-model="options.searchText"></v-text-field>
      </v-col>
    </v-row>

    <v-data-table :headers="headers"
                  :loading="loading"
                  sort-desc
                  sort-by="po20101"
                  :options.sync="options"
                  :server-items-length="query.total"
                  :items="items">

      <template v-slot:item.storageSum="{item}">
        <div>{{ item.putSum - item.outSum }}</div>
      </template>
      <template v-slot:item.action="{item}">
        <v-btn x-small outlined @click="putDetailHandler(item)">入库记录</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="putDialog">
      <v-card class="pa-3">
        <work-mater-put-index :materId="putHistoryId"></work-mater-put-index>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {loadMater,exportExcel} from '@/api/workMaterial'

export default {
  name: "workMater-index",
  data: () => ({
    loading:false,
    items: [],
    headers: [
      {
        text: "最后入库单号",
        value: 'put.articlePut.name'
      },
      {
        text: "最后购置部门",
        value: 'put.section.name'
      },
      {
        text: "材料名称",
        value: 'material.name'
      },
      {
        text: "型号",
        value: 'material.model'
      },
      {
        text: "库存数量",
        value: 'material.storageSum'
      },
      {
        text: "领用总数",
        value: 'material.outSum'
      },
      {
        text: "入库总数",
        value: 'material.putSum'
      },
      {
        text: "单位",
        value: 'material.unit.name'
      },
      {
        text: "操作",
        value: 'action'
      },
    ],
    query: {total: 0},
    options: {searchText: null, type: null, maxNumber: null, minNumber: null},
    detailDialog: false,
    item: null,
    http: null,
    putHistoryId: null,
    putDialog:false,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
  },
  components: {
    WorkMaterPutIndex: () => import("@/views/workMaterial/put.vue")
  },
  methods: {
    exportHandler(){
      this.loading = true
      this.query = Object.assign({}, this.options)
      this.query.sortBy = this.query.sortBy[0]
      this.query.sortDesc = this.query.sortDesc[0] ? 'desc' : 'asc'
      this.query.itemsPerPage = 5000
      exportExcel(this.query).then(f=>{
        this.downloadFile(f)
      }).finally(this.loading=false)
    },
    putDetailHandler(item) {
      this.putHistoryId = item.id
      this.putDialog = true
    },
    list() {
      this.loading = true
      this.query = Object.assign({}, this.options)
      this.query.sortBy = this.query.sortBy[0]
      this.query.sortDesc = this.query.sortDesc[0] ? 'desc' : 'asc'
      loadMater(this.query).then(result => {
        this.items = result.rows
        this.query.total = result.total
      }).finally(() => {
        this.http = null, this.loading = false
      })
    },
  }
}
</script>

<style scoped>

</style>