<template>
  <div>
    <v-row dense>
      <v-col sm="3" cols="12">
        <v-text-field label="材料名称" v-model="query.name" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-col sm="3" cols="12">
        <v-text-field label="型号" v-model="query.model" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-col sm="3" cols="12">
        <v-text-field label="品牌" v-model="query.brand" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="1">
        <v-btn @click="list">搜索</v-btn>
      </v-col>
    </v-row>
    <v-data-table :loading="loading" :items="items" :headers="headers" sort-desc sort-by="dhDate" :items-per-page="-1">
      <template v-slot:item.index="{index}">
        {{index+1}}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {procurementMaterialHistory} from '@/api/procurement'

export default {
  name: "proMaterialPriceList",
  data: () => ({
    loading:false,
    items: [],
    headers: [
      {text: '序号', value: 'index'},
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '品牌', value: 'material.brand'},
      {text: '含税单价', value: 'priceTax'},
      {text: '单位', value: 'material.unit.name'},
      {text: '采购时间', value: 'dhDate',width:'150px'},
    ],
    query: {
      name: null,
      model: null,
      brand: null,
    }
  }),
  created() {
    this.list()
  },
  methods: {
    list() {
      this.loading = true
      procurementMaterialHistory(this.query.name, this.query.model, this.query.brand,200).then(result => {
        this.items = result
      }).finally(()=>this.loading=false)
    }
  }
}
</script>

<style scoped>

</style>