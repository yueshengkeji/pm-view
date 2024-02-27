<template>
  <div>
    <v-row dense>
      <v-col sm="2" cols="6">
        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{on,attrs}">
            <v-text-field dense label="考核表月份" readonly v-model="per.month" v-on="on" v-bind="attrs"></v-text-field>
          </template>
          <v-date-picker readonly v-model="per.month" type="month"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="2" cols="6">
        <v-btn small @click="exportHandler">导出</v-btn>
      </v-col>
    </v-row>
    <v-data-table :items="items" :items-per-page="-1" :headers="headers"></v-data-table>
  </div>
</template>

<script>
import {getPerList,exportPer} from "@/api/workLog";

export default {
  name: "performance",
  data: () => ({
    items: [],
    menu: false,
    headers: [
      {text: '序号', value: 'index'},
      {text: '部门', value: 'section.name'},
      {text: '姓名', value: 'staff.name'},
      {text: '考核分数', value: 'scoreSum'},
      {text: '被考核人签字', value: 'sign.name'},
      {text: '备注', value: 'remark'}
    ],
    per: {
      month: null
    },
    query: {
      page:1,
      itemsPerPage:-1,
      staffId: null,
      sectionId: null,
      startDate: null,
      endDate: null,
    }
  }),
  watch: {
    "per.month": {
      handler() {
        this.setDate()
        this.list()
      }
    }
  },
  created() {
    this.per.month = this.dateFormat(new Date(), 'YYYY-mm')
    this.setDate()
    this.list()
  },
  methods: {
    setDate() {
      this.query.startDate = this.per.month + "-01"
      this.query.endDate = this.per.month + "-31"
    },
    list() {
      getPerList(this.query).then(result => {
        this.items = result
      })
    },
    exportHandler(){
      exportPer(this.query).then(result => {
        this.downloadFile(result)
      })
    }
  }
}
</script>

<style scoped>

</style>