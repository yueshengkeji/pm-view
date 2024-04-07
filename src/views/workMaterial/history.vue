<template>
  <div>
    <v-row>
      <v-col>
        <v-btn outlined small :loading="btnLoading" @click="downloadExcel">导出</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col sm="3">
        <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field v-model="options.date"
                          label="指定日期范围"
                          readonly
                          clearable
                          v-bind="attrs"
                          v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="options.date" @change="$refs.menu.save()" range>

          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col sm="2">
        <!--                指定部门-->
        <v-autocomplete item-value="id"
                        item-text="name"
                        v-model="options.sectionId"
                        clearable
                        :items.sync="sectionItems"
                        :search-input.sync="searchSection"
                        label="指定部门"></v-autocomplete>
      </v-col>
      <v-col sm="2">
        <!--                指定员工-->
        <v-autocomplete item-value="id"
                        item-text="name"
                        v-model="options.staffId"
                        no-data-text="请输入员工姓名"
                        clearable
                        :items.sync="staffItems"
                        :search-input.sync="searchStaff"
                        label="指定员工"></v-autocomplete>
      </v-col>
      <v-col sm="2">
        <!--搜索办公用品领用记录-->
        <v-text-field label="搜索" v-model="options.searchText"></v-text-field>
      </v-col>
    </v-row>

    <v-data-table :headers="headers"
                  :loading="loading"
                  sort-desc
                  sort-by="po20408"
                  :options.sync="options"
                  :server-items-length="total"
                  :items.sync="items">
    </v-data-table>

    <v-dialog v-model="detailDialog">
      <v-card class="pa-5">


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
import {downloadList, listAll} from '@/api/workMaterial'
import {getStaff} from '@/api/staff'
import {getSections} from '@/api/section'

export default {
  name: "workMater-index",
  components: {},
  data: () => ({
    btnLoading: false,
    items: [],
    headers: [
      {
        text: "最后购置日期",
        value: 'materOut.material.lastPutDate',
        sortable: false,
      },
      {
        text: "出库单号",
        value: 'out.series',
        sortable: false,
      },
      {
        text: "资产名称",
        value: 'materOut.material.name',
        sortable: false,
      },
      {
        text: "剩余数量",
        value: 'materOut.material.storageSum',
        sortable: false,
      },
      {
        text: "规格型号",
        value: 'materOut.material.model',
        sortable: false,
      },
      {
        text: "单位",
        value: 'materOut.material.unit.name',
        sortable: false,
      },
      {
        text: "领用数量",
        value: 'materOut.sum',
        sortable: false,
      },
      {
        text: "单价",
        value: 'materOut.taxPrice',
        sortable: false,
      },
      {
        text: "金额",
        value: 'materOut.taxMoney',
        sortable: false,
      }, {
        text: "领用时间",
        value: 'materOut.outDate',
        sortable: false,
      }, {
        text: "部门",
        value: 'staff.section.name',
        sortable: false,
      },{
        text: "领用人",
        value: 'staff.name',
        sortable: false,
      },{
        text: "备注",
        value: 'out.remark',
        sortable: false,
      },
    ],
    total: 0,
    query: {},
    options: {searchText: null, staffId: null, sectionId: null, date: []},
    detailDialog: false,
    item: null,
    staffItems: [],
    searchStaff: null,

    sectionItems: [],
    searchSection: null,

    menu: false,
    loading: false,
  }),
  watch: {
    searchStaff(val) {
      getStaff(val).then(result => {
        this.staffItems = result
      })
    },
    searchSection(val) {
      getSections(val).then(result => {
        this.sectionItems = result
      })
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  mounted() {
    getSections().then(result => {
      this.sectionItems = result
    })

    this.options.date = [this.formatTimer(this.getMonthFirst(new Date())), this.formatTimer(new Date())]
  },
  methods: {
    downloadExcel() {
      this.btnLoading = true
      this.setQuery()
      downloadList(this.query).then(result => {
        let a = document.createElement("a")
        a.href = result
        a.download = '办公用品领用记录.xlsx'
        a.click()
      }).finally(() => this.btnLoading = false)
    },
    list() {
      this.loading = true
      this.setQuery()
      listAll(this.query).then(result => {
        this.items = result.rows
        this.total = result.total
      }).finally(() => this.loading = false)
    },
    setQuery() {
      this.query = Object.assign({}, this.options)
      if (this.query.date && this.query.date.length > 1) {
        this.query.startDate = this.query.date[0] + ' 00:00:00'
        this.query.endDate = this.query.date[1] + ' 23:59:59'
      }
      delete this.query['date']
      this.query.sortBy = this.query.sortBy[0]
      this.query.sortDesc = this.query.sortDesc[0] ? 'desc' : 'asc'
    },
    save() {
      this.$refs.detailForm.save()
    }
  }
}
</script>

<style scoped>

</style>