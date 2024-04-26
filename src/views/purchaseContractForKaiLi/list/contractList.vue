<template>
  <v-card>
    <v-row>
      <v-col style="margin-left: 10px;color: #65CEA7;" xl="3" sm="5">
        <v-btn small color="primary" @click="addContract" style="margin-right: 1px">添加合同</v-btn>
        <v-switch label="已作废"
                  v-model="ifLose"
                  @click="loadLose"
                  class="d-inline-block mt-0"
                  style="width: 104px;"
                  dense
        >
        </v-switch>
        <v-switch label="我的"
                  v-model="ifMine"
                  @click="loadMine"
                  class="d-inline-block mt-0"
                  style="width: 104px"
                  dense
        >
        </v-switch>
        <v-btn small @click="contractTypeShow">
          合同类型
        </v-btn>
        <v-btn small class="ml-1" @click="downloadExcel">导出</v-btn>
      </v-col>

      <v-col>
        <div style="display: flex">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small color="#9aaeff" @click="loadAll" v-bind="attrs" v-on="on" style="margin-right: 1px">
                {{ btn1 }}
              </v-btn>
            </template>
            <span>所有</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small color="#7a7676" @click="loadPaid" v-bind="attrs" v-on="on" style="margin-right: 1px">
                {{ btn2 }}
              </v-btn>
            </template>
            <span>已付清</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small color="#88be14" @click="loadPaying" v-bind="attrs" v-on="on" style="margin-right: 1px">
                {{ btn3 }}
              </v-btn>
            </template>
            <span>付款中</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn small color="#d9534f" @click="loadNoPay" v-bind="attrs" v-on="on">{{ btn4 }}</v-btn>
            </template>
            <span>未付款</span>
          </v-tooltip>
          <v-menu ref="priceMenu" v-model="priceMenu"
                  offset-y
                  :close-on-click="false"
                  :close-on-content-click="false">
            <template v-slot:activator="{on,attrs}">
              <v-btn small v-on="on" v-bind="attrs">筛选</v-btn>
            </template>
            <div class="white pa-1" style="width: 300px">
              <v-text-field class="d-inline-block"
                            @keyup.enter="loadContract"
                            type="number"
                            style="width: 100px"
                            v-model="searchMinPrice"
                            hide-details
                            hint="格式(1000-9000)"
                            dense
                            label="指定最小金额范围">

              </v-text-field>
              <v-text-field class="d-inline-block ml-1"
                            @keyup.enter="loadContract"
                            type="number"
                            v-model="searchMaxPrice"
                            style="width: 100px"
                            hide-details
                            hint="格式(1000-9000)"
                            dense
                            label="指定最大金额范围">

              </v-text-field>
              <v-btn color="primary" small class="ml-1" @click="loadContract">确定</v-btn>
            </div>
            <div class="white pa-1" style="width: 300px">
              <select-company v-model="searchCompany"
                              type="id"
                              :search="$route.query.companyName"></select-company>
            </div>

          </v-menu>

        </div>
      </v-col>
      <v-col>
        <div style="display: flex">
          <v-select dense
                    v-model="searchTime"
                    label="指定日期"
                    :items="searchTimeItems"
          >
            <template v-slot:append-item>
              <v-menu v-model="dateMenu.showMenu"
                      :close-on-content-click="false"
                      :close-on-click="false"
                      offset-y>

                <template v-slot:activator="{on,attrs}">
                  <v-list-item link v-bind="attrs" v-on="on">
                    <v-list-item-title>自定义</v-list-item-title>
                  </v-list-item>
                </template>

                <v-date-picker v-model="dateMenu.date" @change="dateChange2" range>

                </v-date-picker>

              </v-menu>
            </template>
          </v-select>
          <v-select dense
                    v-model="searchContractType"
                    label="合同类型"
                    :items="searchContractTypeItems"
          >
          </v-select>
        </div>
      </v-col>
      <v-col>
        <v-text-field
            v-model="queryContract.searchText"
            :search-input.sync="searchStr"
            append-icon="mdi-magnify"
            label="搜索"
            single-line
            hide-details
            @change="loadContract"
            dense
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
        :headers="headers"
        :items="desserts"
        :options.sync="options"
        :server-items-length="totalDesserts"
        class="elevation-1"
        @dblclick:row="showContract"
        style="cursor:pointer "
    >
      <template v-slot:item.state="{item}">
        <span :style="item.colorStyle">{{ item.state | strState }}</span>
      </template>
      <template v-slot:item.actions="{item}">
        <v-btn x-small color="error" @click="deleteContract(item)" class="mr-1">删除</v-btn>
        <v-btn x-small color="primary" @click="showDetail(item)" class="mr-1">明细</v-btn>
        <v-btn x-small v-if="item.state == 1" @click="loseContract(item)" class="mr-1"
               style="background-color: #ff9800;border-color:#ff9800;color: #FFFFFF">作废
        </v-btn>
        <v-btn x-small @click="showReceiptDialog(item)">收票登记</v-btn>
        <!--                <v-btn x-small color="#f0ad4e" v-if="item.state == 2" disabled>已作废</v-btn>-->
      </template>
      <template v-slot:item.name="{ item }">
        <span :style="item.colorStyle">{{ item.name }}</span>
      </template>
      <template v-slot:item.partyB.name="{item}">
        <span :style="item.colorStyle">{{ item.partyB.name }}</span>
      </template>
      <template v-slot:item.price="{item}">
        <span :style="item.colorStyle">{{ item.price }}</span>
      </template>
      <template v-slot:item.yetPay="{item}">
        <span :style="item.colorStyle">{{ item.yetPay }}</span>
      </template>
      <template v-slot:item.applyMoney="{item}">
        <span title="申请付款金额=付款单正在审批/被驳回" :style="item.colorStyle">{{ item.applyMoney }}</span>
      </template>
      <template v-slot:item.debt="{item}">
        <span title="欠款金额=合同总金额-已付款金额" :style="item.colorStyle">{{ item.debt }}</span>
      </template>
      <template v-slot:item.staff.name="{item}">
        <span :style="item.colorStyle">{{ item.staff.name }}</span>
      </template>
      <template v-slot:item.date="{item}">
        <span :style="item.colorStyle">{{ item.date }}</span>
      </template>
    </v-data-table>
    <!--加载框-->
    <v-dialog v-model="loadDialog"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在处理。。。
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!--新增合同-->
    <v-dialog v-model="addDialog" width="70%">
      <v-card>
        <add-contract ref="add"></add-contract>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              @click="saveContract"
          >
            提交
          </v-btn>
          <v-btn
              @click="cancelContract"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--明细-->
    <instance-detail :frame="item.id" :close="close"></instance-detail>
    <!--合同详情-->
    <contract-details :id="contractId" :closeShowContract="closeShowContract"></contract-details>
    <!--操作确认-->
    <v-dialog v-model="actionConfirmDialog" width="500px">
      <v-card>
        <v-card-title class="text-h5">你确定要{{ actionName }}该记录</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary"
                 @click="actionConfirm"
          >
            确定
          </v-btn>
          <v-btn @click="actionCancel">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="contractTypeDialog" width="500px">
      <v-card>
        <contract-type></contract-type>
      </v-card>
    </v-dialog>
    <!--收票登记-->
    <v-dialog v-model="contractReceiptDialog" width="80%">
      <v-card>
        <add-contract-receipt :contract-item="contractItem" @getList="listContractReceipt"></add-contract-receipt>
        <v-data-table :items="contractReceiptList"
                      :headers="contractReceiptHeader"
                      hide-default-footer>
          <template v-slot:item.type="{item}">
            {{item.type == 0 ? '专票' : '普票'}}
          </template>
          <template v-slot:item.collectTime="{item}">
            <v-chip small outlined link @click="showMenu($event,item)">{{ subDate(item.collectTime,0,10) }}</v-chip>
          </template>
          <template v-slot:item.stateStr="{item}">
            <v-chip outlined small v-if="item.state == 0" color="red" link @click="showSate(item)">{{item.stateStr}}</v-chip>
            <v-chip outlined small v-if="item.state == 1" color="green" link @click="showSate(item)">{{item.stateStr}}</v-chip>
            <v-chip outlined small v-if="item.state == 9" color="grey" link @click="showSate(item)">{{item.stateStr}}</v-chip>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn @click="filesHandler(item)" small outlined>查看附件</v-btn>
          </template>
        </v-data-table>
        <v-menu ref="dateMenu2"
                v-model="dateMenu2"
                :close-on-content-click="false"
                offset-y
                absolute
                :position-y="y"
                :position-x="x"
        >
          <v-date-picker
              @change="updateDate"
              v-model="collectTime"
              no-title
              @input="dateMenu2 = false"
          ></v-date-picker>
        </v-menu>
      </v-card>
    </v-dialog>
    <!-- 附件 -->
    <v-dialog v-model="filePreviewDialog" width="60%">
      <file-preview :filesItem="files"></file-preview>
    </v-dialog>
    <!-- 状态 -->
    <v-dialog v-model="stateDialog" width="40%">
      <v-card>
        <v-col sm="12">
          <v-radio-group v-model="stateItem" label="确认收票" @change="updateState" mandatory row>
            <v-radio :value="0" label="未收票"></v-radio>
            <v-radio :value="1" label="已收票"></v-radio>
            <v-radio :value="9" label="作废"></v-radio>
          </v-radio-group>
        </v-col>
      </v-card>

    </v-dialog>
    <!--消息框-->
    <v-snackbar v-model="showSnackbarDialog"
                :timeout="timeout"
                :centered="true"
    >
      {{ msgStr }}
    </v-snackbar>
  </v-card>
</template>
<script>
import {deleteContract, exportExcel, getContract, loseContract} from "../../../api/contract";
import addContract from "../components/addContract";
import instanceDetail from "@/components/easyflow/instance-detail";
import ContractDetails from "../components/contractDetails";
import {getConfig} from "../../../api/systemConfig";
import contractType from "@/components/contractType"
import selectCompany from '../../company/select.vue'
import addContractReceipt from "../contractReceipt/components/addContractReceipt";
import {list,update,getContractReceiptFiles} from "../../../api/contractReceipt";

export default {
  name: "purchase_contract_for_kaiLi",
  components: {
    ContractDetails,
    addContract,
    instanceDetail,
    contractType,
    selectCompany,
    addContractReceipt,
    filePreview:() => import('@/components/filePreview.vue')
  },
  data: () => ({
    priceMenu: false,
    searchMaxPrice: null,
    searchMinPrice: null,
    ifLose: false,
    ifMine: false,
    actionConfirmDialog: false,
    actionName: null,
    tempItem: null,

    addDialog: false,

    search: null,
    searchStr: null,
    loadDialog: false,
    options: {},
    totalDesserts: null,

    headers: [
      // {text: '合同编号', value: 'serialNumber', sortable: false},
      {text: '合同名称', value: 'name', sortable: false},
      {text: '乙方', value: 'partyB.name', sortable: false},
      {text: '合同金额(￥)', value: 'price', sortable: false},
      {text: '已付款(￥)', value: 'yetPay', sortable: false},
      {text: '申请中(￥)', value: 'applyMoney', sortable: false},
      {text: '欠款金额(￥)', value: 'debt', sortable: false},
      {text: '所有者', value: 'staff.name', sortable: false},
      {text: '时间', value: 'date', sortable: false},
      {text: '状态', value: 'state', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    queryContract: {
      startDate: null,
      endDate: null,
      pageSize: null,
      pageNumber: null,
      searchText: null,
      sortName: 'a.pd00419',
      sortOrder: 'DESC',
      payState: null,
      partyA: null,
      myContract: null,
      state: null,
    },

    btn1: "所有",
    btn2: "已付款",
    btn3: "付款中",
    btn4: "未付款",

    searchTime: null,
    searchTimeItems: ["所有", "本月", "上月", "半年", "本年"],
    searchContractType: null,
    searchContractTypeItems: ["所有合同", "默认合同", "其他合同"],

    showSnackbarDialog: false,
    timeout: 2000,
    msgStr: null,

    item: {id: null},

    contractId: null,
    contractDialog: false,

    roleName: null,

    contractTypeDialog: false,

    dateMenu: {
      showMenu: false,
      date: []
    },
    searchCompany:null,

    //收票登记
    contractItem:null,
    contractReceiptDialog:false,
    contractReceiptList:[],
    contractReceiptHeader:[
      {text: '合同名称', value: 'contract.name', sortable: false},
      {text: '乙方', value: 'company.name', sortable: false},
      {text: '金额(￥)', value: 'money', sortable: false},
      {text: '类型', value: 'type', sortable: false},
      {text: '预收', value: 'advanceFlagStr', sortable: false},
      {text: '预收时间', value: 'advanceTime', sortable: false},
      {text: '收票时间', value: 'collectTime', sortable: false},
      {text: '到票', value: 'stateStr', sortable: false},
      {text: '登记人', value: 'staff.name', sortable: false},
      {text: '操作', value: 'action', sortable: false},
    ],
    thanClickItem:null,
    dateMenu2:false,
    x:0,
    y:0,
    collectTime:null,

    files:[],
    filePreviewDialog:false,
    ftpFolder: null,
    serverHost: '',

    stateDialog:false,
    stateItem:null,
  }),

  watch: {
    options: {
      handler() {
        this.loadContract()
      },
      deep: true,
    },
    searchMinPrice() {
      this.queryContract.minPrice = this.searchMinPrice
    },
    searchMaxPrice() {
      this.queryContract.maxPrice = this.searchMaxPrice
    },
    searchTime: {
      handler() {
        if (this.searchTime == "所有") {
          this.queryContract.startDate = null
          this.queryContract.endDate = null
          this.loadContract()
        } else if (this.searchTime == "本月") {
          this.queryContract.startDate = this.getFistDay()
          this.queryContract.endDate = this.getLastDay()
          this.loadContract()
        } else if (this.searchTime == "上月") {
          this.queryContract.startDate = this.getLastMonthFistDay()
          this.queryContract.endDate = this.getLastMonthLastDay()
          this.loadContract()
        } else if (this.searchTime == "半年") {
          var y = new Date().getFullYear()
          this.queryContract.startDate = y + '-01-01'
          this.queryContract.endDate = y + '-06-30'
          this.loadContract()
        } else if (this.searchTime == "本年") {
          var year = new Date().getFullYear()
          this.queryContract.startDate = year + '-01-01'
          this.queryContract.endDate = year + '-12-31'
          this.loadContract()
        }
      },
      deep: true,
    },

    searchContractType: {
      handler() {
        if (this.searchContractType == "所有合同") {
          this.queryContract.partyA = null
          this.loadContract()
        } else if (this.searchContractType == "默认合同") {
          this.queryContract.partyA = 'AB345ED1-0CBF-4210-87D6-E783E3EC3DA1'
          this.loadContract()
        } else if (this.searchContractType == "其他合同") {
          this.queryContract.partyA = '229CAD0E-7AAA-48CE-A3AF-8C97994CC3FF'
          this.loadContract()
        }
      },
      deep: true,
    },
  },

  created() {
    this.searchCompany = this.$route.query.companyId
    getConfig("ROLE_NAME").then(res => {
      if (res.id != null) {
        this.roleName = res.value
      } else {
        alert("未配置编码为‘ROLE_NAME’的参数,配置该参数值得角色可强制删除已审核的单据,只有具备管理员角色的用户可以删除")
      }
    })

    getConfig("FTP_SERVER_PATH").then(result => {
      if (result.id != null) {
        this.serverHost = result.value
      } else {
        console.log('服务器未配置文件上传路径')
      }
    })
  },

  filters: {
    strState: function (value) {
      if(value == 0){
        return "审批中"
      } else if (value == 1) {
        return '已审批'
      } else if (value == 2) {
        return '已作废'
      }
    }
  },

  methods: {
    showReceiptDialog(item){
      this.contractItem = item
      this.contractReceiptDialog = true
      this.listContractReceipt()
    },
    listContractReceipt(){
      list({pageNum:1,pageSize:100,contractId:this.contractItem.id}).then(res => {
        this.contractReceiptList = res.rows
      })
    },
    showMenu(e, item) {
      console.log(e)
      this.thanClickItem = item
      e.preventDefault()
      this.dateMenu2 = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.collectTime = item.collectTime == null ? '':item.collectTime
        this.dateMenu2 = true
      })
    },
    updateDate(){
      if (this.thanClickItem) {
        this.thanClickItem.collectTime = this.collectTime
        update(this.thanClickItem).then(() => {
          this.listContractReceipt()
        })
      }
    },
    filesHandler(item) {
      this.files = []
      getContractReceiptFiles({id:item.id}).then(res => {
        res.forEach(item => {
          this.files.push(item)
        })
        this.fileSuffix(this.files)
        this.filePreviewDialog = true
      })

    },
    fileSuffix(files) {
      files.forEach(f => {
        let name = f.showPath;
        let suffix = '';
        let index = name.lastIndexOf(".");
        index = index == -1 ? f.length : index + 1;
        suffix = f.showPath.substring(index, f.length);
        f.suffix = suffix.toLowerCase();
        f.downloadPath = decodeURIComponent(f.showPath);
        if ((this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm)
            && window.location.protocol == 'https:') {

          if (f.suffix == 'pdf') {
            if (f.pdfImgPath != null && f.pdfImgPath.length > 0) {
              f.pdfImg = true
              let paths = [];
              f.pdfImgPath.forEach(path => {
                paths.push(this.ftpFolder + "/" + encodeURIComponent(path))
              })
              f.pdfImgPath = paths
            }
          } else {
            f.showPath = this.ftpFolder + "/" + f.downloadPath
          }

        } else {
          //直接从配置的文件服务器预览
          f.showPath = this.serverHost + f.downloadPath
        }
      });
    },
    showSate(item){
      this.thanClickItem = item
      this.stateItem = this.thanClickItem.state
      this.stateDialog = true
    },
    updateState(){
      this.thanClickItem.state = this.stateItem
      update(this.thanClickItem).then(() => {
        this.listContractReceipt()
      })
    },

    downloadExcel() {
      this.queryContract.pageSize = 500
      this.queryContract.pageNumber = 1
      exportExcel(this.queryContract).then(result => {
        let a = document.createElement("a")
        a.href = result
        a.download = result
        a.click()
      })
    },
    getFistDay() {
      var y = new Date().getFullYear(); //获取年份
      var m = new Date().getMonth() + 1; //获取月份
      var d = new Date(y, m, 1).getDate(); //获取当月第一日
      m = m < 10 ? '0' + m : m; //月份补 0
      d = d < 10 ? '0' + d : d; //日数补 0
      return [y, m, d].join("-")
    },
    getLastDay() {
      var y = new Date().getFullYear(); //获取年份
      var m = new Date().getMonth() + 1; //获取月份
      var d = new Date(y, m, 0).getDate(); //获取当月最后一日
      m = m < 10 ? '0' + m : m; //月份补 0
      d = d < 10 ? '0' + d : d; //日数补 0
      return [y, m, d].join("-")
    },
    getLastMonthFistDay() {
      var y = new Date().getFullYear();
      var m = new Date().getMonth();
      var d = new Date(y, m, 1).getDate();
      m = m < 10 ? '0' + m : m; //月份补 0
      d = d < 10 ? '0' + d : d; //日数补 0
      return [y, m, d].join("-")
    },
    getLastMonthLastDay() {
      var y = new Date().getFullYear();
      var m = new Date().getMonth();
      var d = new Date(y, m, 0).getDate();
      m = m < 10 ? '0' + m : m; //月份补 0
      d = d < 10 ? '0' + d : d; //日数补 0
      return [y, m, d].join("-")
    },

    loadContract() {
      this.priceMenu = false
      this.queryContract.pageSize = this.options.itemsPerPage
      this.queryContract.pageNumber = this.options.page
      this.queryContract.partyB = this.searchCompany
      this.loadDialog = true
      getContract(this.queryContract).then(res => {
        for (let a = 0; a < res.rows.length; a++) {
          res.rows[a].debt = res.rows[a].price - res.rows[a].yetPay
          if (res.rows[a].price > res.rows[a].yetPay && res.rows[a].yetPay != 0) {
            res.rows[a].colorStyle = "color:#88be14"
          } else if (res.rows[a].yetPay == 0) {
            res.rows[a].colorStyle = "color:#d9534f"
          }
        }

        this.desserts = res.rows
        this.totalDesserts = res.total

        if (this.queryContract.payState == 0) {
          this.btn2 = res.total
        } else if (this.queryContract.payState == 1) {
          this.btn3 = res.total
        } else if (this.queryContract.payState == 2) {
          this.btn4 = res.total
        } else {
          this.btn1 = res.total
        }
        this.loadDialog = false
      })
    },

    loadAll() {
      this.loadContract()
    },
    loadPaid() {
      this.queryContract.payState = 0
      this.loadContract()
    },
    loadPaying() {
      this.queryContract.payState = 1
      this.loadContract()
    },
    loadNoPay() {
      this.queryContract.payState = 2
      this.loadContract()
    },
    loadMine() {
      if (this.ifMine == true) {
        this.queryContract.myContract = true
        this.loadContract()
      } else {
        this.queryContract.myContract = false
        this.loadContract()
      }

    },
    loadLose() {
      if (this.ifLose == true) {
        this.queryContract.state = 2
        this.loadContract()
      } else {
        this.queryContract.state = null
        this.loadContract()
      }

    },


    //新增合同
    addContract() {
      this.addDialog = true
      this.$nextTick(() => {
        this.$refs.add.resetFormRules()

      })
    },
    async saveContract() {
      if (this.$refs.add.validateForm() == true) {
        await this.$refs.add.saveContract()
        this.addDialog = false
        this.loadContract()

      }

    },
    cancelContract() {
      this.addDialog = false
      this.$refs.add.reset()
      this.$refs.add.resetFormRules()
    },

    deleteContract(item) {
      this.actionConfirmDialog = true
      this.actionName = "删除"
      this.tempItem = item

    },

    loseContract(item) {
      this.tempItem = item
      this.actionName = "作废"
      this.actionConfirmDialog = true
    },

    actionConfirm() {
      if (this.actionName == "删除") {
        let deleteFlag = false

        if (this.$store.state.user.roles.split('/').indexOf(this.roleName) != -1) {
          console.log(this.roleName)
          deleteFlag = true
        } else {
          deleteFlag = false
        }
        deleteContract({id: this.tempItem.id, force: deleteFlag}).then(res => {
          this.message(res.msg)
          this.actionConfirmDialog = false
          this.loadContract()
        })
      } else if (this.actionName == "作废") {
        loseContract({id: this.tempItem.id}).then(res => {
          if (res != null) {
            this.message("已作废")
            this.actionConfirmDialog = false
            this.loadContract()
          }
        })
      }
    },

    actionCancel() {
      this.tempItem = null
      this.actionName = null
      this.actionConfirmDialog = false
    },

    showDetail(item) {
      this.item = item
    },
    close() {
      this.item = {id: null}
    },

    showContract(e, data) {
      this.contractId = data.item.id
    },
    closeShowContract() {
      this.contractId = null
    },

    contractTypeShow() {
      this.contractTypeDialog = true
    },

    dateChange2() {
      if (this.dateMenu.date) {
        this.dateMenu.showMenu = false
        this.queryContract.startDate = this.dateMenu.date[0]
        this.queryContract.endDate = this.dateMenu.date[1]
        this.loadContract()
      } else {
        this.queryContract.startDate = null
        this.queryContract.endDate = null
        this.loadContract()
      }
    },

  },
}
</script>
<style>
.loseBtnColor {
  background-color: #ff9800;
  border-color: #ff9800;
  color: white;
}
</style>
