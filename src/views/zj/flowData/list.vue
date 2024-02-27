<template>
  <div>
    <v-row dense>
      <v-col cols="12" sm="3">
        <v-btn small color="primary" class="mr-1" @click="insertHandler">登记</v-btn>
        <v-btn small class="mr-1" @click="exportHandler" :loading="loading">导入</v-btn>
        <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
               type="file"
               ref="excelUpload"
               id="excelUpload"
               @change="importChange" accept=".xlsx,.xls"/>
        <v-btn small @click="downloadTemplateHandler">下载导入模版</v-btn>
        <v-btn class="ml-1" small to="/zj/flowData/analysis">数据分析</v-btn>
      </v-col>
      <v-col sm="1">
        <v-menu ref="menu" v-model="menu">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field clearable dense
                          v-model="query.saleStartDate"
                          v-on="on" v-bind="attrs" label="开始日期"></v-text-field>
          </template>
          <v-date-picker @change="$refs.menu.save()" v-model="query.saleStartDate"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="1">
        <v-menu ref="menu2" v-model="menu2">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field clearable dense
                          v-model="query.saleEndDate" v-on="on"
                          v-bind="attrs" label="截止日期"></v-text-field>
          </template>
          <v-date-picker @change="$refs.menu2.save()" v-model="query.saleEndDate"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12">
        <v-data-table sort-by="saleDate" sort-desc :loading="loading" :headers="headers" :options.sync="options"
                      :items.sync="data.rows" :server-items-length="data.total">

          <template v-slot:item.action="{item}">
            <v-btn x-small color="error" @click="deleteHandler(item)">删除</v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="insertDialog" width="70%">
      <v-card class="pa-2">
        <v-form ref="form">
          <v-menu ref="menu3" v-model="menu3">
            <template v-slot:activator="{on,attrs}">
              <v-text-field v-on="on" v-bind="attrs" label="流量日期" v-model="item.countDate"></v-text-field>
            </template>
            <v-date-picker v-model="item.countDate" @change="$refs.menu3.save()"></v-date-picker>
          </v-menu>
          <v-text-field label="天气" v-model="item.weather" :rules="[v => !!v || '请输入天气信息']"></v-text-field>

          <v-text-field label="人流量" v-model="item.personCount" type="number"
                        :rules="[v => !!v || '请输入人流量']"></v-text-field>
          <v-text-field label="车流量" v-model="item.carCount" type="number"
                        :rules="[v => !!v || '请输入车流量']"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="insertDialog = false" :loading="saveLoading">关闭</v-btn>
          <v-btn color="primary" @click="saveHandler" :loading="saveLoading">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="errorDialog" width="70%">
      <v-card class="pa-2">
        <p>成功导入：{{exportData.length}}条,导入失败:{{errorData.length}}条</p>
        <v-data-table :headers="headers" :items="errorData" hide-default-footer></v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="errorDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {list,exportArray,insert,deleteById} from '@/api/flowCount'
import excelExport from "@/utils/excel-export";

export default {
  components: {},
  name: "flowCountDataList",
  data: () => ({
    errorDialog:false,
    headers: [
      {text: '日期', value: 'countDate'},
      {text: '星期', value: 'week'},
      {text: '天气', value: 'weather'},
      {text: '车流量', value: 'carCount'},
      {text: '人流量', value: 'personCount'},
      {text: '操作', value: 'action'},
    ],
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['countDate'],
      sortDesc: [true]
    },
    data: {
      rows: [],
      total: 0,
      money: 0,
    },
    query: {startDate: null, endDate: null},
    loading: false,
    menu: false,
    menu2: false,
    insertDialog: false,
    item: {
      countDate: null,
      personCount: null,
      carCount: null,
      weather:null
    },
    saveLoading: false,
    menu3: false,
    brand: null,
    exportData: [],
    errorData: [],
  }),
  created() {
    this.list()
  },
  watch: {
    query: {
      handler() {
        this.list()
      },
      deep: true
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  methods: {
    importChange(event) {
      import("xlsx").then(xlsx => {
        let reader = new FileReader()
        let than = this;
        this.errorData = []
        reader.onload = function (e) {
          const workbook = xlsx.read(e.target.result, {type: 'binary'})
          let sheetList = workbook.SheetNames
          sheetList.forEach((name) => {
            let worksheet = workbook.Sheets[name]
            let sheet = xlsx.utils.sheet_to_json(worksheet, {
              header: ["series", "countDate", "personCount", "carCount","weather"]
            })
            for (let i = 1; i < sheet.length; i++) {
              let r = sheet[i]
              r.countDate = than.materialTrim(r.countDate)
              r.personCount = than.materialTrim(r.personCount)
              r.carCount = than.materialTrim(r.carCount)
              r.weather = than.materialTrim(r.weather)

              if (r.countDate != null && r.personCount != null
                  && r.carCount != null) {
                r.personCount = parseFloat(r.personCount)
                r.carCount = parseFloat(r.carCount)
                if (isNaN(r.personCount) || isNaN(r.carCount)) {
                  than.errorData.push(r)
                } else {
                  than.exportData.push(r)
                }
              } else {
                than.errorData.push(r)
              }
            }
          })
          than.loading = true
          exportArray(than.exportData).then(() => {
            than.errorDialog = true
            than.list()
          }).finally(() => {
            than.loading = false
          })
        }
        let file = event.target.files[0]
        if (file != null) {
          //读取数据
          reader.readAsBinaryString(file)
        }
      })
    },
    exportHandler() {
      this.exportData = []
      this.$refs.excelUpload.click()
    },
    downloadTemplateHandler() {
      excelExport([
        {key: 'index', title: '序号'},
        {key: 'countDate', title: '日期'},
        {key: 'personCount', title: '客流量'},
        {key: 'carCount', title: '车流量'},
        {key: 'weather', title: '天气'},
      ], [
        {index: '1', countDate: '2023-06-01', personCount: "", carCount: ""},
      ], "客/车流导入模版-时间格式(yyyy-mm-dd).xlsx");
    },
    saveHandler() {
      if (this.$refs.form.validate()) {
        if (typeof this.item.yetai === 'object') {
          this.item.yetai = this.item.yetai.name
        }
        insert(this.item).then(() => {
          this.insertDialog = false
          this.list()
        })
      }
    },
    insertHandler() {
      this.item = {
        countDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        personCount: null,
        carCount: null,
        weather:null
      }
      this.insertDialog = true
    },
    deleteHandler(item) {
      this.confirm(`删除${item.countDate}}统计数据？`).then(()=>{
        deleteById(item.id).then(this.list)
      })
    },

    getParam() {
      let q = Object.assign({}, this.options)
      q = Object.assign(q, this.query)
      if (q.sortBy) {
        q.sortBy = q.sortBy[0]
        q.sortDesc = q.sortDesc[0] ? 'desc' : 'asc'
      }
      return q
    },
    list() {
      this.loading = true
      let q = this.getParam()
      list(q).then(result => {
        if (!result.money) {
          result.money = 0
        }
        this.data = result
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped></style>