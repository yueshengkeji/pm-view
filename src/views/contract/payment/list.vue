<template>
  <div>
    <v-row :dense="dense">
      <v-col>
        <v-data-table :server-items-length="total"
                      :dense="dense"
                      :loading="loading"
                      :headers="headers"
                      :items="items"
                      :items-per-page="options.itemsPerPage"
                      :options.sync="options"
                      sort-desc sort-by="payDate">
          <template v-slot:top>
            <v-row dense>
              <v-col lg="2" md="2">
                <v-btn @click="addPayment" color="primary" small @input="changeYear">
                  新增付款单
                </v-btn>
                <v-btn small class="ml-1" title="单次最大导出2000条数据" @click="exportDialogHandler">导出</v-btn>
              </v-col>
              <v-col lg="1" md="2">
                <v-select label="审核状态" dense @change="list" v-model="queryParam.approveStatus"
                          :items="approveState"></v-select>
              </v-col>
              <v-col lg="2">
                <v-select dense v-model="paymentYear" label="待付款年份" @input="loadPaymentMoney" :items="years"
                          prepend-icon="mdi-calendar">

                </v-select>
              </v-col>
              <v-col lg="2">
                <v-chip @click="loadPayData()">待付款合计：{{ paymentMoney }}</v-chip>
              </v-col>
              <v-col lg="1" md="2">
                <v-checkbox class="mt-1" dense @change="changeUser" label="我的单据"></v-checkbox>
              </v-col>
              <v-col lg="2">
                <select-company v-model="queryParam.company" type="id"
                                :search="$route.query.companyName"></select-company>
              </v-col>
              <v-col lg="2">
                <v-text-field class="mt-1" dense label="搜索" @keyup.enter="list"
                              v-model="queryParam.searchText"></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:item.company.name="{ item }">
            <template v-if="item.company != null && item.company.name != null">
              {{ item.company.name.replaceAll('有限公司', '') }}
            </template>

          </template>
          <template v-slot:item.approveStatus="{ item }">
            <div v-if="item.courseName == '已审核'" style="height: 30px;width: 100px;"
                 class="text-truncate text-decoration-underline">
              <v-icon color="green">mdi-check</v-icon>
            </div>
            <div v-else style="height: 30px;width: 100px;" class="text-truncate text-decoration-underline">
              {{ item.courseName }}
            </div>
          </template>
          <template v-slot:item.details="{ item }">
            <v-tooltip top open-on-hover>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on" v-html="formatContract(item, false)"></span>
              </template>
              <span v-html="formatContract(item, true)"></span>
            </v-tooltip>
          </template>
          <template v-slot:item.payDate="{ item }">
            <div :title="item.payDate">{{ dateFormat(new Date(item.payDate), 'YYYY-mm-dd') }}</div>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn x-small color="primary" @click="edit(item)">编辑</v-btn>
            <v-btn x-small class="ml-1" @click="detail(item)">明细</v-btn>
            <v-btn x-small color="error" class="ml-1" @click="openDeleteDialog(item)">删除</v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <instance-detail :frame="item.id" :close="close"></instance-detail>
    <v-dialog v-model="paymentDialog" width="90%" style="margin-top: -5%;">
      <v-card class="pa-5">
        <add-payment :updateItem="updateItem"
                     ref="addPayment"
                     :submit="submit"
                     @change="dataChange"
                     :offEdit="true"
                     :startFlow="startFlow"
                     :clearFile="clearFile" :flowModel="flowModel"></add-payment>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submitPayment">提交</v-btn>
          <v-btn @click="paymentDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" title="删除合同付款" width="30%">
      <v-card class="pa-5">
        <v-card-title class="text-center">确定删除:{{ deleteItem.series }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="deletePayment" :loading="deleteLoading">确定
          </v-btn>
          <v-btn @click="deleteDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="show">{{ msg }}</v-snackbar>
    <v-dialog v-model="showData" width="50%" style="min-height: 90%;">
      <payment-data></payment-data>
    </v-dialog>

    <v-dialog v-model="exportDialog" width="30%">
      <v-card class="pa-3">
        <v-row>
          <v-col>
            <v-menu v-model="exportMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    ref="exportMenu"
                    min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="exportParam.startDate"
                              label="开始时间"
                              readonly
                              v-bind="attrs"
                              v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="exportParam.startDate" no-title @change="$refs.exportMenu.save()"
                             scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col>
            <v-menu v-model="exportMenu2"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    ref="exportMenu2"
                    min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="exportParam.endDate"
                              label="开始时间"
                              readonly
                              v-bind="attrs"
                              v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="exportParam.endDate" no-title @change="$refs.exportMenu2.save()"
                             scrollable></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="exportDialog = false">取消</v-btn>
          <v-btn @click="exportHandler" color="primary" :loading="exportLoading">下载</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {deletePay, exportExcel, getDetail, getPayMoney, insert, list} from '@/api/payment'
import instanceDetail from '@/components/easyflow/instance-detail'
import addPayment from '@/components/10563'
import paymentData from '@/components/companyPayMoney'
import {getFlowStateByFrame} from '@/api/usedFlowApi'

export default {
  components: {
    instanceDetail,
    addPayment,
    paymentData,
    selectCompany: import('../../company/select.vue')
  },
  name: "list",
  data: () => ({
    exportLoading: false,
    exportParam: {
      startDate: null,
      endDate: null
    },
    exportMenu: false,
    exportMenu2: false,
    exportDialog: false,
    date: [],
    deleteLoading: false,
    years: [],
    menu: false,
    paymentYear: null,
    paymentMoney: 0,
    items: [],
    headers: [
      {text: '付款单编号', value: 'series', width: '25%'},
      {text: '供应单位', value: 'company.name', width: '15%'},
      {text: '日期', value: 'payDate', width: '9%'},
      {text: '申请人', value: 'staff.name', width: '7%'},
      {text: '付款金额', value: 'moneys', width: '7%', sortable: false},
      {text: '类型', value: 'paymentType.name', width: '7%', sortable: false},
      {text: '审批状态', value: 'approveStatus', width: '10%'},
      {text: '合同列表', value: 'details', width: '17%', sortable: false},
      {text: '操作', value: 'action', width: '180px', sortable: false},
    ],
    options: {},
    queryParam: {
      searchText: null,
      pageSize: 10,
      pageNumber: 1,
      sortName: '',
      sortOrder: '',
      staffId: null,
      approveStatus: null,
      company: null
    },
    total: 0,
    item: {id: null},
    updateItem: {},
    deleteItem: {name: null},
    paymentDialog: false,
    submit: false,
    show: false,
    msg: "",
    deleteDialog: false,
    loading: false,
    startFlow: false,
    flow: null,
    flowModel: {
      message: {}
    },
    files: null,
    clearFile: false,

    approveState: [
      {text: "所有", value: null},
      {text: "已审核", value: 1},
      {text: "未审核", value: 0},
    ],
    showData: false,
    dense: true,
    cacheItem: [],
  }),
  watch: {
    options: {
      handler() {
        this.list();
      },
      deep: true,
    },
    '$vuetify.breakpoint': {
      handler() {
        this.setDense()
      },
      deep: true
    }
  },
  created() {
    this.initYears();
    this.loadPaymentMoney();
    this.reset();
    this.setDense()
    if (this.$route.query.companyId) {
      this.queryParam.company = this.$route.query.companyId
    }
    // this.searchCompany =
    // if(this.searchCompany){
    //   companyList(this.searchCompany).then(result=>{
    //     this.companyList = result
    //     this.queryParam.company = this.$route.query.companyId
    //   })
    // }
  },
  methods: {
    exportDialogHandler() {
      if (this.exportParam.startDate == null) {
        let date = this.getDateByStr('本年')
        this.exportParam.startDate = date.start
        this.exportParam.endDate = date.end
      }
      this.exportDialog = true
    },
    exportHandler() {
      if (this.exportParam.startDate == null || this.exportParam.endDate == null) {
        this.message("请选择下载的时间范围");
        return;
      }
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      this.queryParam.sortName = sortBy[0];
      this.queryParam.sortOrder = sortDesc[0] ? "DESC" : "ASC";
      this.queryParam.pageSize = itemsPerPage;
      this.queryParam.pageNumber = page;
      this.queryParam.startDate = this.exportParam.startDate;
      this.queryParam.endDate = this.exportParam.endDate;
      this.exportLoading = true
      exportExcel(this.queryParam).then(filePath => {
        let a = document.createElement("a")
        a.target = "_blank"
        a.href = filePath
        a.download = filePath.substring(filePath.lastIndexOf('/') + 1)
        a.click()
      }).finally(() => {
        this.exportLoading = false
        this.queryParam.startDate = null;
        this.queryParam.endDate = null;
        this.exportDialog = false
      })
    },
    setDense() {
      if (this.$vuetify.breakpoint.width > 1280) {
        this.dense = false
      } else {
        this.dense = true
      }
    },
    loadPayData() {
      this.showData = true
    },
    changeUser(value) {
      if (value) {
        //我的单据
        this.queryParam.staffId = this.$store.state.user.id
      } else {
        //所有单据
        this.queryParam.staffId = null
      }
      this.list();
    },
    initYears() {
      this.years = [];
      let startYear = 2015;
      let endYear = new Date().getFullYear();
      for (let i = startYear; i <= endYear; i++) {
        this.years.push(i);
      }
      this.paymentYear = endYear;
    },
    loadPaymentMoney() {
      getPayMoney(this.paymentYear).then(data => {
        if (data && data.money) {
          this.paymentMoney = data.money
        } else {
          this.paymentMoney = 0
        }
      });
    },
    changeYear() {
      this.menu = false
      this.loadPaymentMoney();
    },
    formatState(item) {
      switch (item.approveStatus) {
        case 0:
          if (item.courseName) {
            return item.courseName;
          } else {
            this.cacheItem[item.id] = item
            getFlowStateByFrame(item.id).then(result => {
              this.$set(this.cacheItem[result.frameId], "courseName", result.state)
            })
            return ""
          }
        case 1:
          return "已审核";
        default:
          return "-";
      }
    },
    edit(item) {
      if (item.approveStatus == 0) {
        this.addPayment()
        window.setTimeout(() => {
          if (item.details == null || item.details.length <= 0) {
            getDetail(item.id).then(detail => {
              detail.forEach(detailItem => {
                detailItem.exit = false
                detailItem.exit2 = false
                detailItem.exit3 = false
              })
              this.item.details = detail;
            })
          } else {
            this.updateItem = item;
          }
        }, 500);
      } else {
        this.msg = "已审核，禁止修改";
        this.show = true;
      }
    },
    deletePayment() {
      this.deleteLoading = true;
      deletePay(this.deleteItem.id).then(() => {
        this.list();
        this.deleteDialog = false;
      }).catch(e => {
        this.msg = e;
        this.show = true;
      }).finally(() => {
        this.deleteLoading = false;
      });
    },
    openDeleteDialog(item) {
      this.deleteItem = item
      this.deleteDialog = true
    },
    dataChange(data, type) {
      if (type == "data") {
        this.updateItem = data
      } else if (type == "files") {
        this.files = data.files
        this.updateItem.id = data.mainId
      } else {
        this.flow = data
      }
    },
    submitPayment() {
      let valid = true;
      // if (this.updateItem.moneys <= 0) {
      //   this.msg = "付款金额不能为0";
      //   this.show = true;
      //   valid = false;
      //   return;
      // }
      // if (this.updateItem.company.id == null) {
      //   this.msg = "请选择付款单位";
      //   this.show = true;
      //   valid = false;
      //   return;
      // }
      valid = this.$refs.addPayment.getSeriesState()
      let bankAccount2 = this.$refs.addPayment.getBankAccount2()
      let uploadFiles = []
      if (this.files != null) {
        this.files.forEach(file => {
          if (file.id != null) {
            uploadFiles.push(file.id);
          }
        })
      }
      if (valid) {
        if (this.updateItem.series == null || this.updateItem.series == "") {
          this.updateItem.series = "关于对《" + this.updateItem.company.name + "》" + this.dateFormat(new Date(), 'm-d') + "的付款申请";
        }
        this.updateItem.details.forEach(item => {
          if (item != null) {
            delete item.contract['payClone']
          }
        })
        if (bankAccount2) {
          //使用第二付款账户进行付款
          this.updateItem.payOpenAccount = this.updateItem.company.openAccount2
          this.updateItem.payBankNumber = this.updateItem.company.bankNumber2
        }
        insert({pay: this.updateItem, attachs: uploadFiles}).then(this.nextFLow).catch((e) => {
          console.log("添加合同付款失败", e);
        });
      }
    },
    nextFLow(data) {
      this.list();
      if (this.flow != null) {
        this.flowModel.message = {
          title: "关于对《" + this.updateItem.company.name + "》的付款申请，付款金额：" + (this.updateItem.moneys || ''),
          content: this.updateItem.remark || "",
          frameCoding: 10563,
          frameId: data.id,
          frameColumn: "pd06401"
        }
        this.startFlow = true;
      }
      this.paymentDialog = false;
      this.reset();
    },
    reset() {
      this.updateItem = {
        id: null,
        name: null,
        proCompanyName: null,
        series: null,
        company: {name: null, openAccount: null, bankNumber: null},
        remark: null,
        moneys: 0,
        staff: {name: null},
        details: []
      };
      this.files = [];
      this.clearFile = true;
      window.setTimeout(() => {
        this.startFlow = false;
        this.flowModel.message = {}
        this.clearFile = false;
      }, 1000);
    },
    addPayment() {
      this.updateItem = null;
      this.paymentDialog = true;
    },
    close() {
      this.item = {id: null}
    },
    detail(item) {
      this.item = item;
    },
    formatContract(item, type) {
      let resultString = "";
      if (item.details) {
        item.details.forEach(val => {
          resultString += val.contract.name + ";<br/>";
        });
      } else {
        return "";
      }
      if (!type) {
        if (item.details.length > 1) {
          resultString = resultString.substring(0, resultString.indexOf(';') - 1) + "..."
        } else {
          resultString = resultString.substring(0, resultString.indexOf(';') - 1)
        }
      } else {
        resultString = resultString.substring(0, resultString.indexOf(';') - 1)
      }
      return resultString;
    },
    list() {
      this.loading = true;
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      this.queryParam.sortName = sortBy[0];
      this.queryParam.sortOrder = sortDesc[0] ? "DESC" : "ASC";
      this.queryParam.pageSize = itemsPerPage;
      this.queryParam.pageNumber = page;
      list(this.queryParam).then(data => {
        data.rows.forEach(item => {
          let details = item.details;
          item.courseName = this.formatState(item)
          if (details != null && details.length > 0) {
            details.forEach((detailItem, index) => {
              detailItem.index = index + 1;
              detailItem.edit = false
              detailItem.edit2 = false
              detailItem.edit3 = false
              try {
                detailItem.ratio = Math.round((detailItem.applyMoney / detailItem.contract.price) * 10000) / 100.00;
              } catch (e) {
                console.log("合同总价异常", e);
                detailItem.ratio = 0;
              }
            })
          }
        })
        this.items = data.rows;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
}
</script>

<style scoped>
.single-line {
  width: 250px !important;
  display: inline-block;

  white-space: nowrap;
  overflow: hidden;
  word-break: keep-all;
  text-overflow: ellipsis;
}
</style>