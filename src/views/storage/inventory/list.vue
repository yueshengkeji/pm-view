<template>
  <div>
    <v-row dense>
      <v-col lg="2">
        <v-btn small @click="exportExcel">导出</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col lg="2" v-if="storage == null">
        <storage-manager dense v-model="storageObj"></storage-manager>
      </v-col>
      <v-col lg="2">
        <v-text-field dense v-model="materialNameInput" @change="loadMaterial"
                      placeholder="材料名称"></v-text-field>
      </v-col>
      <v-col lg="2">
        <v-text-field dense v-model="materialModelInput" @change="loadMaterial"
                      placeholder="型号"></v-text-field>
      </v-col>
      <v-col lg="2">
        <v-text-field dense v-model="materialBrandInput" @change="loadMaterial"
                      placeholder="品牌"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field dense placeholder="模糊查询" v-model="searchInput" @change="loadMaterial"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-data-table item-key="id"
                      ref="materialTable"
                      :items="materialData"
                      :loading="loading"
                      @click:row="handleRowClick"
                      :options.sync="options"
                      :items-per-page="10"
                      :server-items-length="queryMaterialParam.total"
                      :headers="headers2"
                      @input="selectMaterial"
                      :value="materials">
          <template v-slot:item.id="{item}">
            {{ formatId(item.id) }}
          </template>
          <template v-slot:item.name="{item}">
            <div style="max-width: 250px"
                 class="text-no-wrap text-truncate">
              {{ item.name }}
            </div>
          </template>
          <template v-slot:item.model="{item}">
            <div style="max-width: 250px"
                 class="text-no-wrap text-truncate">
              {{ item.model }}
            </div>
          </template>
          <template v-slot:item.costPrice="{item}">
            {{ item.costPrice.toFixed(2) }}
          </template>
          <template v-slot:item.moneyTax="{item}">
            {{ doubleFormat(item) }}
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small @click="putDetail(item)">入库记录</v-btn>
            <v-btn class="ml-1" x-small @click="outDetail(item)">出库记录</v-btn>
          </template>
        </v-data-table>
      </v-col>

    </v-row>
    <!--        材料入库记录-->
    <v-dialog width="98%" v-model="putDialog">
      <v-card class="pa-3">
        <put-history :material-id="item.id"></put-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small @click="putDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        材料出库记录-->
    <v-dialog width="98%" v-model="outDialog">
      <v-card class="pa-3">
        <out-history :material-id="item.id"></out-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small @click="outDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import materialApi, {exportMaterial} from '@/api/material'
import storageManager from "../storageManager";


export default {
  name: "select-material",
  components: {
    storageManager,
    putHistory: () => import('../../company/putHistory'),
    outHistory: () => import('../../outmaterial/report'),
  },
  data: () => ({
    materialNameInput: "",
    materialModelInput: "",
    materialBrandInput: "",
    materialData: [],
    caseMaterialMap: [],
    searchInput: "",
    loading: false,
    //材料查询参数
    queryMaterialParam: {
      offset: 1,
      limit: 10,
      total: 0,
      sort: "pm00217",
      order: "DESC",
      str: null,
      materialName: null,
      materialBrand: null,
      materialModel: null,
      isLoadFuCai: null,
      storage: null
    },

    headers2: [
      {text: '材料编码', value: 'id'},
      {text: '材料名称', value: 'name'},
      {text: '型号', value: 'model'},
      {text: '品牌', value: 'brand', width: '15%'},
      {text: '单位', value: 'unit.name'},
    ],
    materials: [],
    options: {},
    storageObj: null,
    item: {
      id: null
    },
    putDialog: false,
    outDialog: false,
  }),
  props: {
    repertory: {
      type: Boolean,
      default: true
    },
    storage: String,
  },
  watch: {
    materialDialog: {
      handler() {
        this.$emit("close", this.materialDialog)
      }
    },
    show: {
      handler() {
        this.materialDialog = this.show
      },
      deep: true
    },
    options: {
      handler() {
        this.loadMaterial();
      },
      deep: true
    },
  },
  created() {
    if (this.repertory) {
      this.headers2.push(
          {text: '库存数量', value: 'storageSum', width: '150px'},
          {text: '最后入库单价', value: 'costPrice', width: '150px'},
          {text: '金额合计', value: 'putMoney'},
          {text: '最后入库时间', value: 'lastPutDate',width: '120px'},
          {text: '操作', value: 'action',width:'180px'},
      )
    }
    if (this.storage == null) {
      let ls = localStorage.getItem("ls")
      if (ls != null && ls != "") {
        this.storageObj = JSON.parse(ls)
      }
    }
  },
  methods: {
    doubleFormat(item){
      return item.money;
      // try {
      //   return (item.storageSum * item.costPrice).toFixed(2)
      // } catch (e) {
      //   return 0
      // }
    },
    putDetail(item) {
      this.item = item
      this.putDialog = true
    },
    outDetail(item) {
      this.item = item
      this.outDialog = true
    },
    exportExcel() {
      this.queryMaterialParam.str = encodeURIComponent(this.searchInput);
      this.queryMaterialParam.materialName = encodeURIComponent(this.materialNameInput);
      this.queryMaterialParam.materialModel = encodeURIComponent(this.materialModelInput);
      this.queryMaterialParam.materialBrand = encodeURIComponent(this.materialBrandInput);
      this.queryMaterialParam.limit = this.options.itemsPerPage
      this.queryMaterialParam.offset = this.options.page
      this.queryMaterialParam.storage = this.storage
      this.queryMaterialParam.repertory = this.repertory
      if (this.storageObj && this.storage == null) {
        this.queryMaterialParam.storage = this.storageObj.id
      }
      exportMaterial(this.queryMaterialParam).then(result=>{
        this.downloadFile(result)
      })
      // import('xlsx').then(xlsx => {
      //   let xlsxParam = {raw: false}
      //   let wb = xlsx.utils.table_to_book(this.$refs.materialTable.$el, xlsxParam)
      //   let wbout = xlsx.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'})
      //   try {
      //     FileSaver.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), "库存清单.xlsx")
      //   } catch (e) {
      //     if (typeof console !== 'undefined') {
      //       console.log(e, wbout)
      //     }
      //   }
      // })

    },
    select() {
      this.$emit("select", this.materials)
      this.materials = []
    },
    selectMaterial(items) {
      this.materials = items;
    },
    handleRowClick(rowData, item) {
      // this.$refs.materialTable.toggleRowSelection(rowData);
      item.select(!item.isSelected);
    },
    currentMaterialChange(offset) {
      this.queryMaterialParam.offset = offset;
      this.loadMaterial();
    },

    loadMaterial() {
      let than = this;
      than.loading = true;
      this.queryMaterialParam.str = encodeURIComponent(this.searchInput);
      this.queryMaterialParam.materialName = encodeURIComponent(this.materialNameInput);
      this.queryMaterialParam.materialModel = encodeURIComponent(this.materialModelInput);
      this.queryMaterialParam.materialBrand = encodeURIComponent(this.materialBrandInput);
      this.queryMaterialParam.limit = this.options.itemsPerPage
      this.queryMaterialParam.offset = this.options.page
      this.queryMaterialParam.storage = this.storage
      this.queryMaterialParam.repertory = this.repertory
      this.queryMaterialParam.total = 50
      if (this.storageObj && this.storage == null) {
        this.queryMaterialParam.storage = this.storageObj.id
      }
      materialApi.getmaterial(than.queryMaterialParam).then(result => {
        for (let x = 0; x < result.rows.length; x++) {
          result.rows[x].isShow = false
          if (result.rows[x].costPrice == null) {
            result.rows[x].costPrice = 0
          }
        }
        than.materialData = result.rows
        than.loading = false
      }).catch(e => {
        console.log("异常信息", e);
      });

      materialApi.getMaterialTotal(than.queryMaterialParam).then(result => {
        this.queryMaterialParam.total = result
      })
    },
  }
}
</script>

<style scoped>

</style>