<template style="width: 80%">
  <v-card>
    <v-row>
      <v-col cols="1">
        <v-btn class="ml-1" :loading="loading" @click="exportExcel" outlined small>
          导出
        </v-btn>
      </v-col>
      <v-col offset="3" cols="12" sm="2">
        <v-combobox
            v-model="sectionName"
            :items="sectionNameItems"
            label="部门筛选"
            @change="sectionChanged"
        ></v-combobox>
      </v-col>
      <v-col cols="12" sm="2">
        <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="dateSearch"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
                v-model="dateSearch"
                label="查询年月"
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                v-on="on"

            ></v-text-field>
          </template>
          <v-date-picker
              v-model="dateSearch"
              type="month"
              no-title
              scrollable
              @change="monthChanged"

          >
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="搜索"
            @change="searchMSG"
            single-line
            hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
        :headers="headers"
        :items="desserts"
        :options.sync="options"
        :server-items-length="totalDesserts"
        @dblclick:row="showDetail"
        class="elevation-1"
    >
      <template v-slot:item.createTime="{ item }">
        <span>{{ item.createTime | formatTimer }}</span>
      </template>
      <template v-slot:item.startTime="{ item }">
        <span>{{ item.startTime | formatTimer }}</span>
      </template>

    </v-data-table>
    <v-dialog v-model="showDetailDialog" width="80%">
      <travel-detail :frame-id="item.id"></travel-detail>
    </v-dialog>
  </v-card>
</template>

<script>
import travelApplicationApi from "@/api/travelApplication";
import {list} from "../../api/section";
import travelDetail from "@/components/1320274";

export default {
  name: 'travelApplication',
  components: {travelDetail},
  data: () => ({
    showDetailDialog: false,
    item: {id: null},

    sectionName: null,
    sectionNameItems: ['全部'],
    sections: [],
    sectionNameRef: false,

    dialogDelete: false,
    menu: false,
    dateSearch: null,
    search: '',
    loading: false,

    options: {},
    totalDesserts: null,


    headers: [
      {text: '序号', value: 'index'},
      {text: '出差人员', value: 'traveller'},
      {text: '填报日期', value: 'createTime', sortable: false},
      {text: '出差地点', value: 'place', sortable: false},
      {text: '交通工具', value: 'transportation', sortable: false},
      {text: '出差时间', value: 'startTime', sortable: false},
      {text: '出差时长(天)', value: 'totalTime', sortable: false},
      {text: '出差类型', value: 'travelType', sortable: false},
      {text: '交通费', value: 'travelFee', sortable: false},
      {text: '住宿费', value: 'stayFee', sortable: false},
      {text: '其他费用', value: 'otherFee', sortable: false},
      {text: '费用总计', value: 'totalFee', sortable: false},
    ],
    desserts: [],
  }),

  computed: {},

  watch: {
    options: {
      handler() {
        this.loadTravelApplication()
      },
      deep: true,
    },
  },

  created() {
    this.loadSections()
  },

  filters: {
    formatTimer: function (value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      // let h = date.getHours();
      // h = h < 10 ? "0" + h : h;
      // let m = date.getMinutes();
      // m = m < 10 ? "0" + m : m;
      // let s = date.getSeconds();
      // s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d;
    },
  },

  methods: {

    formatYearMonth(value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      return y + "-" + MM;
    },

    loadSections() {
      var dateYM = this.formatYearMonth(new Date())
      this.dateSearch = dateYM;
      list().then(result => {
        console.log(result)
        for (let x = 0; x < result.length; x++) {
          this.sectionNameItems.push(result[x].name)
          this.sections.push(result[x])
        }
      })
    },

    loadTravelApplication() {
      var index = this.sectionNameItems.indexOf(this.sectionName) - 1;
      var departmentId = null;
      if (index != -2 && index != -1) {
        departmentId = this.sections[index].id
      } else if (index == -1) {
        departmentId = "全部"
      }

      travelApplicationApi.getMonthTravelApplication({
        dateSearch: this.dateSearch,
        page: this.options.page,
        itemsPerPage: this.options.itemsPerPage,
        departmentId: departmentId
      }).then(result => {
        if (result != null) {
          for (let x = 0; x < result.travelApplications.length; x++) {
            try {
              var item = result.travelApplications[x]
              if (item.travelType == 0) {
                result.travelApplications[x].travelType = '市内公务'
              } else if (item.travelType == 1) {
                result.travelApplications[x].travelType = '外地出差'
              }
            } catch (e) {
              console.log(e)
            }
          }
        }
        this.desserts = result.travelApplications
        this.totalDesserts = result.totalDesserts;

      }).catch(e => {
        console.log("异常信息", e);
      });
    },

    sectionChanged() {
      this.loadTravelApplication()
    },

    monthChanged() {
      this.$refs.menu.save(this.dateSearch)
      this.loadTravelApplication()
    },

    searchMSG() {
      console.log(this.search)
      travelApplicationApi.getSearchMSG({search: this.search}).then(result => {
        if (result != null) {
          for (let x = 0; x < result.travelApplications.length; x++) {
            try {
              var item = result.travelApplications[x]
              if (item.travelType == 0) {
                result.travelApplications[x].travelType = '市内公务'
              } else if (item.travelType == 1) {
                result.travelApplications[x].travelType = '外地出差'
              }
            } catch (e) {
              console.log(e)
            }
          }
        }
        this.desserts = result.travelApplications
        this.totalDesserts = result.totalDesserts;
      })
    },

    exportExcel() {
      this.loading = true;
      var index = this.sectionNameItems.indexOf(this.sectionName) - 1;
      var departmentId = null;
      if (index != -2 && index != -1) {
        departmentId = this.sections[index].id
        console.log(departmentId)
      } else if (index == -1) {
        departmentId = "全部"
      }
      travelApplicationApi.exportTravelApplication({
        dateSearch: this.dateSearch,
        departmentId: departmentId
      }).then(result => {
        let a = document.createElement("a")
        a.download = result
        a.href = result
        a.click()
      }).finally(() => {
        this.loading = false;
      })
    },
    showDetail(e, data) {
      this.item = data.item
      this.showDetailDialog = true
    }
  }
}
</script>
