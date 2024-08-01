<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-data-table
            :loading="loading"
            :items="items"
            :options.sync="options"
            item-key="index"
            :server-items-length="total"
            :headers="headers">

          <template v-slot:top>
            <v-row dense>
              <v-col lg="1">
                <v-btn color="primary" :loading="downloadLoading" small @click="exportExcel">导出</v-btn>
              </v-col>
              <v-col lg="2">
                <v-text-field dense v-model="query.name" label="材料名称"></v-text-field>
              </v-col>
              <v-col lg="2">
                <v-text-field dense v-model="query.model" label="材料型号"></v-text-field>
              </v-col>
              <v-col lg="1">
                <v-text-field dense v-model="query.brand" label="材料品牌"></v-text-field>
              </v-col>
              <v-col lg="2">
                <v-menu ref="menu"
                        v-model="menu"
                        transition="scale-transition"
                        :close-on-content-click="false"
                        offset-y
                        min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        clearable
                        @click:clear="clearDateHandler"
                        dense
                        v-model="date"
                        label="指定开始/截止日期"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="date"
                      range
                      :max="new Date().toISOString().substr(0, 10)"
                      min="1950-01-01"
                      @change="changeDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col lg="2">
                <v-autocomplete :items="projectList"
                                @change="projectHandler"
                                label="选择项目"
                                placeholder="支持多选"
                                multiple
                                item-text="name"
                                dense
                                item-value="id"
                                v-model="query.projectsId"
                                :search-input.sync="searchProject">

                </v-autocomplete>
              </v-col>
              <v-col lg="1">
                <v-chip small title="合计金额">{{ outMoneySum }}</v-chip>
              </v-col>
              <v-spacer></v-spacer>
              <v-col lg="1" class="text-right">
                <v-btn small @click="list" :loading="loading">查询</v-btn>
              </v-col>
            </v-row>
          </template>

          <template v-slot:item.outNumber="{item}">
            <a href="###" v-if="showPrice" @click="outDetailHandler(item)">{{ item.outNumber }}</a>
            <div v-else>{{ item.outNumber }}</div>
          </template>

          <template v-slot:item.material.id="{item}">
            {{ formatId(item.material.id) }}
          </template>

          <template v-slot:item.outPrice="{item}">
            {{ item.outPrice.toFixed(2) }}
          </template>
          <template v-slot:item.outMoney="{item}">
            {{ item.outMoney.toFixed(2) }}
          </template>

        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog width="80%" v-model="detailDialog">
      <v-card class="pa-3">
        <out-detail :out-data="detailItem"></out-detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="detailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {exportOutHistory, getOutHistory} from '@/api/material'
import {getById, search} from '@/api/project'
import {getOutByNumber, getOutHistoryMoney, outMaterList} from '@/api/outMater'

export default {
  name: "out-report",
  components: {
    outDetail: () => import('@/components/15313')
  },
  data: () => ({
    downloadLoading: false,
    detailItem: null,
    headers: [
      {text: '序号', value: 'index', width: '70px'},
      {text: '项目名称', value: 'project.name'},
      {text: '出库单号', value: 'outNumber'},
      {text: '材料编码', value: 'material.id'},
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '品牌', value: 'material.brand', width: '100px'},
      {text: '时间', value: 'outDate'},
      {text: '数量', value: 'outSum'},
      {text: '单位', value: 'material.unit.name'},
    ],
    items: [],
    options: {},
    total: 0,
    query: {
      name: null,
      model: null,
      brand: null,
      page: 1,
      itemsPerPage: 10,
      projectsId: []
    },
    loading: false,
    date: null,
    menu: false,
    searchProject: null,
    projectList: [],
    lock: false,
    detailDialog: false,
    outMoneySum: 0
  }),
  watch: {
    searchProject(val) {
      if (val) {
        search(val).then(result => {
          this.projectList = result
        })
      }
    },
    options: {
      handler() {
        this.list();
      },
      deep: true
    },
    projectId: {
      handler() {
        getById(this.projectId).then((result) => {
          this.lock = false
          this.projectList.push(result)
          this.query.projectsId.push(this.projectId)
        })
      }
    },
    materialId: {
      handler() {
        this.list()
      }
    },
    'query.projectsId': {
      handler() {
        if (!this.lock) {
          this.list()
        }
      }
    }
  },
  created() {
    if (this.showPrice) {
      this.headers.push({text: '单价', value: 'outPrice'}, {text: '总额', value: 'outMoney'})
    }
    let start = this.$route.params.start
    let end = this.$route.params.end
    if (start) {
      this.date = [start, end]
    } else if (!this.noDateFilter) {
      this.date = [this.getMonthFirst(new Date()), this.getMonthEnd(new Date())]
    }
    if (this.date) {
      this.query.startDate = this.date[0]
      this.query.endDate = this.date[1]
    }

    if (this.projectId) {
      this.query.projectsId.push(this.projectId)
      getById(this.projectId).then((result) => {
        this.projectList.push(result)
      })
    }
  },
  props: {
    projectId: String,
    materialId: String,
    showPrice: {
      type: Boolean,
      default: true
    },
    noDateFilter: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    projectHandler(val) {
      this.projectList.forEach(item => {
        if (item.id == val[0]) {
          this.query.pn = item.name
        }
      })
    },
    clearDateHandler() {
      this.query.startDate = null;
      this.query.endDate = null;
      this.date = []
      this.list()
    },
    outDetailHandler(item) {
      getOutByNumber(item.outNumber).then(result => {
        outMaterList(result.id).then(resultList => {
          result.materOuts = resultList
          this.detailItem = result
          this.detailDialog = true
        })
      })
    },
    changeDate() {
      if (this.date.length > 0) {
        let date1 = this.date[0];
        let date2 = this.date[1];
        if (date1 <= date2) {
          this.query.startDate = date1;
          this.query.endDate = date2;
        } else {
          this.query.startDate = date2;
          this.query.endDate = date1;
        }
        this.menu = false;
      } else {
        this.query.startDate = null;
        this.query.endDate = null;
      }
      this.list()
    },
    list() {
      this.loading = true
      this.query.page = this.options.page
      this.query.itemsPerPage = this.options.itemsPerPage
      let p = Object.assign({}, this.query)
      if (p.projectsId && p.projectsId.length > 0) {
        p.projectsId = p.projectsId.join(",")
      }
      p.materialId = this.materialId
      p.pn = null
      getOutHistory(p).then(data => {
        data.rows.forEach((item, idx) => {
          item.index = idx + 1
          if (item.outPrice == null) {
            item.outPrice = 0
            item.outMoney = 0
          }
        })
        this.total = data.total
        this.items = data.rows
      }).finally(() => {
        this.loading = false
      });

      if (!this.noDateFilter || this.outMoneySum == 0) {
        getOutHistoryMoney(p).then(outMoney => {
          if (outMoney) {
            this.outMoneySum = outMoney.toFixed(2)
          }
        })
      }

    },
    exportExcel() {
      this.downloadLoading = true
      this.loading = true
      this.query.page = this.options.page
      this.query.itemsPerPage = this.options.itemsPerPage
      let p = Object.assign({}, this.query)
      if (p.projectsId && p.projectsId.length > 0) {
        p.projectsId = p.projectsId.join(",")
      }
      p.materialId = this.materialId
      p.showPrice = this.showPrice

      exportOutHistory(p).then((filePath) => {
        let a = document.createElement("a");
        a.target = "_blank"
        a.href = filePath
        a.download = filePath.substring(filePath.lastIndexOf('/') + 1)
        a.click()
      }).finally(() => {
        this.loading = false
        this.downloadLoading = false
      })
    },
    clearProject() {
      this.lock = true
      this.query.projectsId = []
    }
  }
}
</script>

<style scoped>

</style>