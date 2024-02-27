<template>
  <div>
    <v-row dense>
      <v-col sm="6" cols="12">
        <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
               type="file"
               ref="excelUpload"
               id="excelUpload"
               @change="implUserExcel" accept=".xlsx,.xls"/>
        <v-btn color="primary" @click="exportHandler" :loading="loading">导入</v-btn>
        <v-btn @click="downloadExcel" class="ml-1">下载导入模板</v-btn>
        <v-btn v-if="!selectFlag" @click="selectFlag = true" class="ml-1">批量打印</v-btn>
        <v-btn v-if="selectFlag" @click="selectPrintHandler" class="ml-1">打印</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="2" cols="12">
        <v-text-field label="搜索" v-model="searchText" @change="list"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :items="td.rows"
                  :show-select="selectFlag"
                  v-model="selectItems"
                  :options.sync="options"
                  :loading="loading"
                  :server-items-length="td.total"
                  :headers="headers">
      <template v-slot:item.action="{item}">
        <v-btn x-small color="error" class="mr-1" @click="deleteHandler(item)">删除</v-btn>
        <v-btn x-small @click="printHandler(item)">打印</v-btn>
      </template>
    </v-data-table>

    <v-row dense style="position: absolute;z-index: -1">
      <v-col cols="12">
        <v-row dense id="print">
          <v-col cols="3" v-for="p in selectItems" :key="p.id">
            <canvas :id="p.id"></canvas>
          </v-col>
        </v-row>
      </v-col>
      <a href="###" ref="print" v-print="printObj">确定</a>
    </v-row>
  </div>
</template>

<script>
import {deleteDetail, detailList, importList} from '@/api/fixedAssets'
import excelExport from '@/utils/excel-export'

import QRCode from "qrcode";

export default {
  name: "fixedApplyList",
  data: () => ({
    td: {
      rows: [],
      total: 0,
    },
    headers: [
      {text: '类别', value: 'folderObj.name'},
      {text: '资产名称', value: 'name'},
      {text: '资产编号', value: 'series'},
      {text: '资产型号', value: 'model'},
      {text: '购买日期', value: 'proDate'},
      {text: '总价', value: 'money'},
      {text: '存放地点', value: 'section'},
      {text: '使用人', value: 'person'},
      {text: '申请数量', value: 'haveSum'},
      {text: '盘点数量', value: 'checkSum'},
      {text: '复盘数量', value: 'reSum'},
      {text: '操作', value: 'action'},
    ],
    loading: false,
    options: {},
    selectItems: [],
    spWidth: 225,
    spHeight: 225,
    printObj: {
      id: "print",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    selectFlag: false,
    searchText: null,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  methods: {
    selectPrintHandler() {
      this.selectFlag = false
      this.print()
    },
    print() {
      window.setTimeout(() => {
        let width = this.spWidth,
            height = this.spHeight;
        this.selectItems.forEach(item => {
          let val = this.$store.state.api.apiUrl + this.$router.options.base + `fixedAssets/detail/${item.id}`
          QRCode.toCanvas(
              document.getElementById(item.id),
              val,
              {width, height, toSJISFunc: QRCode.toSJIS},
              () => {
                // console.log(error)
              },
              success => {
                console.log("success", success)
              }
          )
        })
        window.setTimeout(() => {
          this.$refs.print.click()
        }, 500)
      }, 300)
    },
    printHandler(item) {
      this.selectItems = [item]
      this.print()
    },
    implUserExcel(e) {
      import("xlsx").then(xlsx => {
        this.loading = true
        let reader = new FileReader()
        let than = this;
        reader.onload = function (e) {
          than.errorMaterData = []
          const workbook = xlsx.read(e.target.result, {type: 'binary'})
          let sheetList = workbook.SheetNames
          sheetList.forEach(async (name) => {
            let importArray = []
            let worksheet = workbook.Sheets[name]
            let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["folder", "name", "series", "model", "proDate","money", "section", "person", "haveSum", "checkSum", "reSum"]})
            for (let x = 1; x < newMater.length; x++) {
              let m = newMater[x]
              if (m.name != null && m.folder != null) {
                m.folderObj = {name: m.folder}
                m.series = m.series == null ? '' : m.series
                m.proDate = m.proDate == null ? '' : m.proDate
                m.model = m.model == null ? '' : m.model
                m.section = m.section == null ? '' : m.section
                m.person = m.person == null ? '' : m.person
                m.money = m.money == null ? 0 : m.money
                importArray.push(m)
              }
            }
            importList(importArray).then(() => than.list())
          })
        }
        if (e.target.files[0] != null) {
          //读取数据
          reader.readAsBinaryString(e.target.files[0])
        }
      })

    },
    exportHandler() {
      this.$refs.excelUpload.click()
    },
    downloadExcel() {
      excelExport([
        {key: 'folder', title: '资产类别'},
        {key: 'name', title: '资产名称'},
        {key: 'series', title: '编号'},
        {key: 'model', title: '型号/规格'},
        {key: 'proDate', title: '购买日期'},
        {key: 'money', title: '总价'},
        {key: 'section', title: '存放地点'},
        {key: 'person', title: '使用人'},
        {key: 'haveSum', title: '数量'},
        {key: 'checkSum', title: '盘点数量'},
        {key: 'reSum', title: '复盘数量'},
      ], [
        {
          folder: '',
          name: '',
          series: "",
          model: "",
          proDate: "",
          money: "",
          section: "",
          person: "",
          haveSum: '',
          checkSum: '',
          reSum: ''
        },
      ], "固定资产导入模板.xlsx");
    },
    deleteHandler(item) {
      this.confirm("确定删除：" + item.name + "?").then(() => {
        deleteDetail(item.id).then(this.list)
      })
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.options)
      q.searchText = this.searchText
      detailList(q).then(result => {
        this.td = result
      }).finally(() => this.loading = false)
    }
  }

}
</script>

<style scoped>

</style>