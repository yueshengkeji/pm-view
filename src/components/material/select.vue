<template>
  <v-dialog :width="width"
            hide-overlay
            v-model="materialDialog"
            title="选择材料"
            @close="materialDialog=false">
    <v-card class="pa-3">
      <v-text-field placeholder="模糊查询" v-model="searchInput" @change="loadMaterial"></v-text-field>

      <v-form>
        <v-row>
          <v-col lg="4">
            <v-text-field v-model="materialNameInput" @change="loadMaterial"
                          placeholder="材料名称"></v-text-field>
          </v-col>
          <v-col lg="4">
            <v-text-field v-model="materialModelInput" @change="loadMaterial"
                          placeholder="型号"></v-text-field>
          </v-col>
          <v-col lg="4">
            <v-text-field v-model="materialBrandInput" @change="loadMaterial"
                          placeholder="品牌"></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <v-data-table item-key="id"
                    ref="materialTable"
                    :items="materialData"
                    :loading="loading"
                    @click:row="handleRowClick"
                    :options.sync="options"
                    :items-per-page="10"
                    :server-items-length="queryMaterialParam.total"
                    :headers="headers2"
                    selectable-key="id"
                    show-select
                    @input="selectMaterial"
                    :value="materials">
        <template v-slot:item.moneyTax="{item}">
          {{ (item.storageSum * item.costPrice).toFixed(2) }}
        </template>
      </v-data-table>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="select">确 定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import materialApi from '@/api/material'

export default {
  name: "select-material",
  data: () => ({
    materialDialog: false,
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
      isLoadFuCai: null
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
  }),
  props: {
    show: Boolean,
    isLoadFuCai: null,
    width: {
      type: String,
      default: '60%'
    },
    repertory: Boolean,
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
  model: {
    event: 'close',
    prop: 'show'
  },
  created() {
    if (this.repertory) {
      this.headers2.push(
          {text: '库存数量', value: 'storageSum', width: '150px'},
          {text: '最后入库单价', value: 'costPrice', width: '150px'},
          {text: '金额合计', value: 'moneyTax'},
      )
    }
    if (this.materialArray) {
      this.materials = this.materialArray
    }
    this.queryMaterialParam.isLoadFuCai = this.isLoadFuCai
  },
  methods: {
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
      materialApi.getmaterial(than.queryMaterialParam).then(result => {
        for (let x = 0; x < result.rows.length; x++) {
          let m = result.rows[x]
          m.isShow = false
          try {
            m.costPrice = m.costPrice.toFixed(2);
          } catch (e) {
            m.costPrice = 0
          }
        }
        than.materialData = result.rows;
        than.loading = false;
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