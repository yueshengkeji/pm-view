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
      </v-col>
      <v-col sm="2">
        <v-chip small>销售金额合计:{{ data.money }}</v-chip>
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
      <v-col sm="1">
        <v-text-field dense label="搜索" v-model="query.searchText"></v-text-field>
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
              <v-text-field v-on="on" v-bind="attrs" label="销售日期" v-model="item.saleDate"></v-text-field>
            </template>
            <v-date-picker v-model="item.saleDate" @change="$refs.menu3.save()"></v-date-picker>
          </v-menu>
          <v-combobox label="品牌"
                      item-text="brand"
                      @change="brandChangeHandler()"
                      item-value="brand"
                      :items="brandItems"
                      return-object
                      :search-input.sync="searchBrand"
                      v-model="brand" :rules="[v => !!v || '请选择品牌']">

          </v-combobox>
          <v-combobox :items="ytItems"
                      label="业态"
                      :search-input.sync="searchYt"
                      item-value="name"
                      item-text="name"
                      v-model="item.yetai"
                      :rules="[v => !!v || '请选择业态']">

          </v-combobox>
          <v-text-field label="销售金额" v-model="item.money" type="number"
                        :rules="[v => !!v || '请输入销售金额']"></v-text-field>
          <v-text-field label="联系人" v-model="item.person"></v-text-field>
          <v-text-field label="联系电话" v-model="item.tel"></v-text-field>
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
import {listBrand} from '@/api/zujin'
import {list as yetaiList} from '@/api/yetai'
import {list, insert, exportArray,deleteById} from '@/api/saleData'
import excelExport from "@/utils/excel-export";

export default {
  components: {},
  name: "saleDataList",
  data: () => ({
    errorDialog:false,
    headers: [
      {text: '品牌', value: 'brand'},
      {text: '业态', value: 'yetai'},
      {text: '销售日期', value: 'saleDate'},
      {text: '销售金额', value: 'money'},
      {text: '联系电话', value: 'tel'},
      {text: '联系人', value: 'person'},
      {text: '登记人', value: 'staff.name'},
      {text: '操作', value: 'action'},
    ],
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['saleDate'],
      sortDesc: [true]
    },
    data: {
      rows: [],
      total: 0,
      money: 0,
    },
    query: {saleStartDate: null, saleEndDate: null, type: null, contractType: null, searchText: null},
    loading: false,
    menu: false,
    menu2: false,
    insertDialog: false,
    item: {
      saleDate: null,
      brand: null,
      yetai: null,
      money: null,
      person: null,
      tel: null
    },
    ytItems: [],
    brandItems: [],
    searchBrand: null,
    saveLoading: false,
    searchYt: null,
    menu3: false,
    brand: null,
    exportData: [],
    errorData: [],
  }),
  created() {
    this.list()
  },
  watch: {
    searchBrand(val) {
      if (val) {
        listBrand(val).then(result => {
          this.brandItems = result
        })
      }
    },
    searchYt(val) {
      if (val) {
        yetaiList(val).then(result => {
          this.ytItems = result
        })
      }
    },
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
              header: ["series", "saleDate", "brand",
                "yetai", "money", "person", "tel"]
            })
            for (let i = 1; i < sheet.length; i++) {
              let r = sheet[i]
              r.saleDate = than.materialTrim(r.saleDate)
              r.brand = than.materialTrim(r.brand)
              r.yetai = than.materialTrim(r.yetai)
              r.money = than.materialTrim(r.money)
              if (r.saleDate != null && r.brand != null
                  && r.yetai != null && r.money != null) {
                r.money = parseFloat(r.money)
                console.log("isNaN", isNaN(r.money))
                if (isNaN(r.money)) {
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
        {key: 'saleDate', title: '销售日期'},
        {key: 'brand', title: '品牌'},
        {key: 'yetai', title: '业态'},
        {key: 'money', title: '销售金额'},
        {key: 'person', title: '联系人'},
        {key: 'tel', title: '联系电话'},
      ], [
        {index: '1', saleDate: '2023-06-01', brand: "", yetai: "", money: "", person: "", tel: ""},
      ], "销售数据导入模版-时间格式(yyyy-mm-dd).xlsx");
    },
    brandChangeHandler() {
      if (this.brand.id) {
        this.item.brand = this.brand.brand
        this.item.person = this.brand.zlPerson
        this.item.tel = this.brand.zlPersonTel
        if (this.brand.yt) {
          this.item.yetai = this.brand.yt.name
        }
      } else {
        this.item.brand = this.brand
      }
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
        saleDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        brand: null,
        yetai: null,
        money: null,
        person: null,
        tel: null
      }
      this.insertDialog = true
      if (this.ytItems.length === 0) {
        yetaiList().then(result => {
          this.ytItems = result
        })
      }
    },
    deleteHandler(item) {
      this.confirm(`删除${item.saleDate}+${item.brand}数据？`).then(()=>{
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
      if (q.contractType == -1) {
        q.contractType = null
      }

      if (q.type == -1) {
        q.type = null
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