<template>
  <div>
    <v-row>
      <v-col sm="2">
        <v-btn outlined small @click="exportHandler" :loading="loading">导出</v-btn>
        <v-btn outlined small @click="folderHandler" class="ml-1">分类管理</v-btn>
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
      <template v-slot:item.material.folderObj.name="{item}">
        <v-chip small outlined @click="editFolderHandler(item)" v-if="item.material.folderObj">{{ item.material.folderObj.name }}</v-chip>
      </template>
      <template v-slot:item.material.tag="{item}">
        <v-chip v-if="item.material.tag != ''" small outlined @click="editFolderHandler(item)">{{ item.material.tag }}</v-chip>
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
    <!--分类管理-->
    <v-dialog v-model="folderDialog" width="50%">
      <v-card class="pa-3">
        <work-mater-folder-list></work-mater-folder-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="folderDialog =false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--    修改分类-->
    <v-dialog v-model="editFolderDialog" width="50%">
      <v-card class="pa-3">
        <v-form ref="form">
          <v-autocomplete :loading="folderItems.length === 0"
                          :rules="[v => !!v || '请选择目录']"
                          :items.sync="folderItems"
                          item-text="name"
                          return-object
                          v-model="item.material.folderObj"></v-autocomplete>

          <v-text-field label="标签" v-model="item.material.tag"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveFolderHandler" outlined small :loading="folderLoading">保存</v-btn>
          <v-btn @click="editFolderDialog=false" outlined small>取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {exportExcel, folderList, loadMater, updateMaterial} from '@/api/workMaterial'
import WorkMaterFolderList from "@/views/workMaterial/folderList.vue";

export default {
  name: "workMater-index",
  data: () => ({
    loading: false,
    items: [],
    headers: [
      {
        text: "最后入库单号",
        value: 'put.putNumber'
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
        text: "分类",
        value: 'material.folderObj.name'
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
        text: "标签",
        value: 'material.tag'
      },
      {
        text: "操作",
        value: 'action'
      },
    ],
    query: {total: 0},
    options: {searchText: null, type: null, maxNumber: null, minNumber: null},
    detailDialog: false,
    item: {
      material:{
        folderObj: {}
      }
    },
    http: null,
    putHistoryId: null,
    putDialog: false,

    folderDialog: false,
    editFolderDialog: false,
    folderItems: [],
    folderLoading: false
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
    WorkMaterFolderList,
    WorkMaterPutIndex: () => import("@/views/workMaterial/put.vue")
  },
  methods: {
    saveFolderHandler() {
      if (this.$refs.form.validate()) {
        this.folderLoading = true
        this.item.material.folder = this.item.material.folderObj.id
        updateMaterial(this.item.material).finally(() => {
          this.folderLoading = false
          this.editFolderDialog = false
        })
      }
    },
    editFolderHandler(item) {
      folderList().then((res) => this.folderItems = res).finally(() => {
        this.item = item
        this.editFolderDialog = true
      })
    },
    folderHandler() {
      this.folderDialog = true
    },
    exportHandler() {
      this.setQuery()
      this.query.itemsPerPage = 5000
      exportExcel(this.query).then(f => {
        this.downloadFile(f)
      }).finally(this.loading = false)
    },
    putDetailHandler(item) {
      this.putHistoryId = item.id
      this.putDialog = true
    },
    setQuery() {
      this.loading = true
      this.query.page = this.options.page
      this.query.itemsPerPage = this.options.itemsPerPage
      this.query.sortBy = this.options.sortBy[0]
      this.query.sortDesc = this.options.sortDesc[0] ? 'desc' : 'asc'
      this.query.tag = this.$store.state.user.sectionCoding
      if (this.query.tag == "") {
        this.query.tag = null
      }
    },
    list() {
      this.setQuery()
      loadMater(this.query).then(result => {
        result.rows.forEach(item=>{
          if(item.material.folderObj == null){
            item.material.folderObj = {name:null}
          }
        })
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