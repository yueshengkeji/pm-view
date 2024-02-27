<template>
  <div class="pa-3">
    <div class="text-subtitle-1">合同付款明细</div>
    <v-form ref="paymentForm" autocomplete="off" dense>
      <div>
        <v-row>
          <!--<v-col lg="3" md="4" cols="12" >
              <v-text-field title="根据合同甲方显示，无需填写"
                            dense
                            disabled
                            label="采购单位"
                            v-model=""></v-text-field>
          </v-col>-->
          <v-col lg="3" md="4" cols="12">
            <v-text-field label="付款编号" @blur="checkSeries" :error-messages="errorMsg" :error="seriesError" dense
                          v-model="data.series"></v-text-field>
          </v-col>
          <v-col lg="3" md="3" cols="12">
            <v-autocomplete @change="selectCompany" :rules="rules[0]" :loading="loading" label="收款单位"
                            v-model="data.company" dense :search-input.sync="searchCompany" auto-select-first
                            :items.sync="companys" return-object :readonly="isKaiLiPurchase"
                            item-text="name"></v-autocomplete>
          </v-col>
          <v-col lg="3" md="2" cols="12">
            <v-text-field label="开户行"
                          dense v-model="data.company.openAccount"
                          @change="updateCompany">
              <template v-slot:prepend-inner>
                <v-checkbox title="使用开户行1付款" :disabled="!offEdit" v-model="openAccount" style="margin-top: -3px"
                            dense
                            hide-details></v-checkbox>
              </template>
            </v-text-field>
          </v-col>
          <v-col lg="3" md="3" cols="12">
            <v-text-field label="银行账号" dense v-model="data.company.bankNumber"
                          @change="updateCompany"></v-text-field>
          </v-col>
          <v-col lg="3" md="3" cols="12" v-if="offEdit || openAccount2">
            <easyFlow v-show="offEdit" :searchName="false" dense :instance="flowModel" coding="10563"
                      :change="changeFlow"
                      :start="startFlow"></easyFlow>
          </v-col>
          <v-col md="2" cols="6">
            <v-text-field label="申请付款总额" dense v-model="data.moneys" :rules="rules[1]" readonly
                          :color="getColor(data.moneys)"></v-text-field>
          </v-col>
          <v-col md="1" cols="6">
            <v-text-field label="申请人" dense v-model="data.staff.name" disabled></v-text-field>
          </v-col>

          <v-col md="3" cols="12" v-show="offEdit || (!offEdit && openAccount2)">
            <v-text-field label="开户行2"
                          dense
                          v-model="data.company.openAccount2"
                          @change="updateCompany">
              <template v-slot:prepend-inner>
                <v-checkbox title="使用开户行2付款" :disabled="!offEdit" v-model="openAccount2" style="margin-top: -3px"
                            dense
                            hide-details></v-checkbox>
              </template>
            </v-text-field>
          </v-col>
          <v-col lg="3" md="3" cols="12" v-show="offEdit || (!offEdit && openAccount2)">
            <v-text-field label="银行账号2" dense v-model="data.company.bankNumber2"
                          @change="updateCompany"></v-text-field>
          </v-col>
          <v-col lg="3" cols="12">
            <v-text-field label="银行行号" dense v-model="data.company.lineNum"></v-text-field>
          </v-col>
          <v-col md="12" cols="12">
            <v-text-field label="备注" dense v-model="data.remark"></v-text-field>
          </v-col>
          <v-col md="6" cols="12" v-if="offEdit">
            <v-autocomplete label="请选择合同" v-if="data.company.id != null" hide-selected class="text-no-wrap"
                            height="26" :loading="loadingContract" single-line dense ref="ci" @focus="loadContract"
                            :items="contracts" item-text="name" item-value="id" return-object multiple
                            @input="selectContract" :search-input.sync="searchContract" title="请先选择供应单位"
                            v-model="payDetails"></v-autocomplete>
          </v-col>
          <v-col lg="10" md="10" cols="12" v-if="offEdit">
            <file-upload :clear="clearFile" dense :mainId="data.id" :loadFile="loadFile" mainCoding="10563"
                         @change="fileChange"></file-upload>
          </v-col>
          <v-col lg="2" md="2" cols="12" v-if="offEdit">
            <v-checkbox v-model="isColie" dense class="mt-1 mb-0" @change="filterContract(contracts)"
                        label="其他付款"></v-checkbox>
          </v-col>
        </v-row>
      </div>
      <v-data-table :items="data.details"
                    dense :headers="headers"
                    :items-per-page="10000"
                    height="282" hide-default-footer>
        <template v-slot:item.index="{item}">
          <v-icon color="error" style="cursor: pointer" small @click="deleteRow($event,{item})">mdi-close</v-icon>{{ item.index }}
        </template>
        <template v-slot:item.contract.name="{ item }">
          <a target="_blank" :href="$router.options.base + 'approve/by-frame-id/' + item.contract.id">{{
              item.contract.name
            }}</a>
        </template>
        <template v-slot:item.paymentType.name="{ item }">
          <!--<v-autocomplete dense
                          height="26"
                          v-if="item.edit3"
                          autofocus
                          @blur="item.edit3 = false"
                          :items="types"
                          return-object
                          item-text="name"
                          v-model="item.paymentType"></v-autocomplete>-->
          <v-chip small @click="show($event, item)">{{ item.paymentType.name }}</v-chip>
        </template>
        <template v-slot:item.ratio="{ item }">
          <v-text-field type="number" full-width style="width:45px;height: 40px" dense v-if="item.edit2" autofocus
                        v-model="ratio" @blur="exitRatio(item)" @keyup.enter="exitRatio(item)"></v-text-field>
          <v-chip small v-else @click="item.edit2 = true">
            {{ item.ratio }}
          </v-chip>
        </template>
        <template v-slot:item.applyMoney="{ item }">
          <v-text-field full-width style="width:100px;height: 40px" dense v-if="item.edit" autofocus
                        v-model="item.applyMoney" @keyup.enter="exitItem(item)" @blur="exitItem(item)"></v-text-field>
          <v-chip v-else small :color="getColor(item.applyMoney, item.contract.price)" dark @click="editRow(item)">
            {{ item.applyMoney }}
          </v-chip>
        </template>
        <template v-slot:item.remark="{ item }">
          <v-edit-dialog :return-value.sync="item.remark" large save-text="确定" cancel-text="取消">
            <v-icon left x-small>mdi-lead-pencil</v-icon>
            {{ item.remark }}
            <template v-slot:input>
              <div class="mt-4 title">
                说明
              </div>
              <v-textarea v-model="item.remark" rows="3" label="备注" counter autofocus></v-textarea>
            </template>
          </v-edit-dialog>
        </template>
      </v-data-table>
    </v-form>
    <v-snackbar top v-model="msg.show">{{ msg.content }}</v-snackbar>

    <v-menu absolute v-model="showMenu" offset-y :position-x="x" :position-y="y">
      <v-list>
        <v-list-item v-for="(item, index) in types" :key="index" link @click="selectType(item)">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import {getBySeries, getPayType, loadById} from '@/api/payment'
import {getCompanyById, list, update} from '@/api/company'
import {getNoPayByCompany} from '@/api/contract'
import easyFlow from '@/components/easyflow/easyFlow'
import fileUpload from '@/components/fileUpload'

export default {
  name: "frame-10563",
  components: {
    easyFlow,
    fileUpload
  },
  props: {
    frameId: String,
    //禁止编辑
    offEdit: {
      type: Boolean,
      default: false
    },
    //文件修改事件
    change: {
      type: Function,
      default: null,
    },
    //发起流程开关
    startFlow: {
      type: Boolean,
      default: false,
    },
    flowModel: {
      type: Object,
      default: null
    },
    updateItem: {
      type: Object,
      default: null
    },
    clearFile: Boolean,
    //采购合同用
    isKaiLiPurchase: Boolean,
    purchaseContractItem: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    openAccount: true,
    openAccount2: false,
    searchContract: null,
    contractName: null,
    isColie: false,
    fileLoading: false,
    files: [],
    rules: [
      [
        v => !!v.id || "请选择收款单位",
      ],
      [
        v => v > 0 || "请选择付款合同,不能付款0元"
      ]
    ],
    updateRemark: null,
    ratio: "",
    payDetails: [],
    contracts: [],
    searchCompany: null,
    loading: false,
    companys: [],
    data: {},
    msg: {
      show: false,
      content: ''
    },
    id: null,
    headers: [
      {text: "序号", value: 'index'},
      {text: "合同名称", value: "contract.name"},
      {text: "合同总价", value: "contract.price"},
      {text: "已付款", value: "contract.yetPay"},
      {text: "比例(%)", value: "ratio", width: '8%'},
      {text: "本次申请付款", value: "applyMoney", width: "14%"},
      {text: "申请中", value: "contract.applyMoney", width: "100px"},
      {text: "款项性质", value: "paymentType.name", width: '10%'},
      {text: "说明", value: "remark", width: '10%'},
      {text: "项目名称", value: "contract.projects[0].name"},
    ],
    types: [],
    typeMap: [],
    flow: null,
    loadFile: false,

    loadingContract: false,
    showMenu: false,
    x: 0,
    y: 0,
    contractItem: null,

    errorMsg: null,
    seriesError: false,
  }),
  created() {
    this.reset();
    this.id = this.$route.params.id;
    if (this.frameId == null && this.id) {
      this.loadData();
    } else {
      this.id = this.frameId;
      if (this.id) {
        this.loadData();
      } else {
        if (this.isKaiLiPurchase != true) {
          this.loadCompany();
        }
        this.loadType();
        this.data.staff = {
          name: this.$store.state.user.name,
          id: this.$store.state.user.id
        }
      }
    }

  },
  watch: {
    openAccount() {
      this.openAccount2 = !this.openAccount
    },
    openAccount2() {
      this.openAccount = !this.openAccount2
    },
    'updateItem.company.name': {
      handler() {
        if (this.updateItem) {
          if (this.updateItem.company.name != null) {
            this.searchCompany = this.updateItem.company.name
            console.log(11)
            this.loadCompany(this.searchCompany)
          }
        }
      },
      immediate: true,
    },
    purchaseContractItem: {
      handler() {
        if (this.isKaiLiPurchase) {
          this.loadType()
          this.loadContract()
        }
      },
      immediate: true,
      deep: true,
    },
    updateItem: {
      handler() {
        if (this.updateItem != null) {
          this.data = this.updateItem
          window.setTimeout(() => {
            this.loadFile = true
          }, 1000);
        } else {
          this.reset();
        }
      },
      deep: true,
    },
    data: {
      handler() {
        console.log("change data",this.data,this.change)
        this.$emit("change", this.data, "data")
        if (this.change != null) {
          this.change(this.data, "data");
        }
      },
      deep: true,
    },
    $route(to) {
      // 对路由变化作出响应...
      this.id = to.params.id;
      if (this.id) {
        this.reset();
        this.loadData();
      }
    },
    searchCompany(value) {
      if (value != null) {
        this.loadCompany(value);
      }

    },
    searchContract(value) {
      if (value != null) {
        this.contractName = value
        this.loadContract()
      }
    },
    frameId: {
      handler() {
        if (this.frameId) {
          this.id = this.frameId
          this.loadData()
        }
      }
    }
  },
  model:{
    prop: 'updateItem',
    event: 'change'
  },
  methods: {
    getBankAccount2() {
      return this.openAccount2;
    },
    getSeriesState() {
      console.log("seriesError", this.seriesError, this.$refs.paymentForm.validate())
      if (!this.seriesError) {
        return this.$refs.paymentForm.validate()
      } else {
        return !this.seriesError
      }
    },
    checkSeries() {
      getBySeries(this.data.series).then(result => {
        if (result && result.id && result.id !== this.data.id) {
          this.errorMsg = '编号已存在，请重新输入！'
          this.seriesError = true
        } else {
          this.errorMsg = ''
          this.seriesError = false
        }
      })
    },
    selectType(item) {
      this.contractItem.paymentType = item
    },
    show(e, item) {
      this.contractItem = item
      e.preventDefault()
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    fileChange(files) {
      this.$emit("change", files, "files")
      if (this.change) {
        this.change(files, "files");
      }
    },
    filterContract(items) {
      let filterData = [];
      items.forEach(c => {
        filterData.push(c);

      })
      this.contracts = filterData;
      if (this.isKaiLiPurchase) {
        this.payDetails = this.contracts
        this.selectContract(this.payDetails)
      }
      return filterData;
    },
    updateCompany() {
      if (this.data.company.id != null) {
        update(this.data.company);
      }
    },
    changeFlow(flow) {
      this.flow = flow;
      this.$emit("change", this.flow, "flow")
      if (this.change != null) {
        this.change(this.flow, "flow");
      }
    },
    loadType() {
      getPayType().then(data => {
        this.types = data;
        this.types.forEach(type => {
          this.typeMap[type.id] = type;
        })
        if (this.types.length <= 0) {
          this.msg.content = '请设置付款类型'
          this.msg.show = true
        }
      })
    },
    deleteRow(event, {item}) {
      if (!this.offEdit) {
        return;
      }
      this.data.details.splice((item.index - 1), 1);
      this.payDetails.splice((item.index - 1), 1);
      this.setPayment(this.data)
    },
    editRow(item) {
      item.edit = true;
    },
    selectContract(items) {
      if (this.isKaiLiPurchase == false) {
        let i = this.$refs.ci.$el.getElementsByTagName("input")[0]
        i.value = ''
        i.dispatchEvent(new Event('input'))
      }
      this.data.details = []
      items.forEach((item, index) => {
        let payType = "EBWF$U11";
        if (item.yetPay <= 0) {
          payType = "E0LWOI11";
        }
        if (this.typeMap[payType] == undefined) {
          payType = this.types[0].id
        }
        let detail = null;
        if (item.payClone != null) {
          detail = item.payClone;
        } else {
          detail = {
            contract: item,
            index: index + 1,
            applyMoney: (item.price - item.yetPay).toFixed(2),
            remark: '',
            edit: false,
            ratio: 0,
            edit2: false,
            paymentType: {id: payType, name: this.typeMap[payType].name},
            edit3: false,
          }
        }
        this.setRatio(detail, item.price);
        this.data.details.push(detail)
      })
      this.setPayment(this.data)
    },
    exitRatio(item) {
      if (this.ratio != '') {
        item.ratio = this.ratio;
        item.applyMoney = (item.contract.price * (item.ratio / 100)).toFixed(2)
        item.edit2 = false;
        this.ratio = "";
        this.warn(item);
        this.setPayment(this.data)
      } else {
        this.msg.content = "请输入付款比例";
        this.msg.show = true;
      }
    },
    exitItem(item) {
      if (item.applyMoney == "") {
        this.msg.content = "请输入付款金额";
        this.msg.show = true;
      } else {
        item.edit = false
        this.setRatio(item, item.contract.price);
        this.warn(item);
        this.setPayment(this.data)
      }
    },
    warn(item) {
      if (item.contract.price < (parseFloat(item.applyMoney) + item.contract.yetPay)) {
        this.msg.content = "付款金额超过合同总价！";
        this.msg.show = true;
      }
    },
    setRatio(detail, total) {
      if (detail.applyMoney > 0) {
        detail.ratio = Math.round((detail.applyMoney / total) * 10000) / 100.00;
      }
    },
    selectCompany() {
      this.data.details = []
      this.payDetails = []
    },
    loadContract() {
      if (this.isKaiLiPurchase) {
        this.loadingContract = true
        getNoPayByCompany(this.purchaseContractItem.partyB.id, this.purchaseContractItem.name, "2").then(data => {
          this.filterContract(data)
        }).finally(() => {
          this.loadingContract = false
        })

      } else if (this.data.company.id != null) {
        this.loadingContract = true
        getNoPayByCompany(this.data.company.id, this.contractName, "2").then(data => {
          this.filterContract(data)
        }).finally(() => {
          this.loadingContract = false
        })
        this.data.details.forEach(detailItem => {
          detailItem.contract.payClone = detailItem;
          let isAdd = true;
          try {
            this.payDetails.forEach(old => {
              if (old.id == detailItem.contract.id) {
                isAdd = false
                throw new Error("this id is exist")
              }
            })
          } catch (ingore) {
            // ingore
          }
          if (isAdd) {
            this.payDetails.push(detailItem.contract);
          }
        })
      }
    },
    loadCompany(value) {
      this.loading = true;
      if (this.isKaiLiPurchase) {
        getCompanyById(this.updateItem.company.id).then(res => {
          this.companys.push(res)
          this.data.company = res
          console.log('data' + this.data.company.name)
        }).finally(() => {
          this.loading = false
        })
      } else {
        list(value).then(data => {
          this.companys = data;
        }).finally(() => {
          this.loading = false;
        })
      }
    },
    loadData() {
      loadById(this.id).then(payment => {
        if (payment != null) {
          this.setPayment(payment);
          this.companys.push(payment.company);
          this.data = payment;
        } else {
          this.msg.content = "单据已被删除";
          this.msg.show = true;
        }
      });
    },
    setPayment(payment) {
      payment.proCompanyName = this.$store.state.api.cname;
      payment.moneys = 0.0;
      if (payment.payBankNumber != null && payment.payBankNumber != '') {
        this.openAccount2 = true
      } else {
        this.openAccount2 = false
      }
      if (payment.details) {
        payment.details.forEach((item, i) => {
          item.index = i + 1;
          try {
            if (item.contract.partyA.id != "229CAD0E-7AAA-48CE-A3AF-8C97994CC3FF") {
              payment.proCompanyName = item.contract.partyA.name;
            }
          } catch (e) {
            console.log(e);
          }
          payment.moneys += parseFloat(item.applyMoney);
          this.setRatio(item, item.contract.price);
        });
        payment.moneys = payment.moneys.toFixed(2);
      }
    },
    reset() {
      this.data = {
        series: null,
        proCompanyName: null,
        company: {
          name: null,
          openAccount: null,
          bankNumber: null
        },
        staff: {name: null},
        remark: null,
        moneys: 0.0,
        details: []
      }
      this.payDetails = []
      this.contracts = []
      this.loadFile = false;
    },
    getColor(applyMoney, contractMoney) {
      if (contractMoney && applyMoney > contractMoney) {
        return 'red'
      } else if (applyMoney > 100000) {
        return 'warning'
      } else if (applyMoney > 20000) return 'orange'
      else return 'green'
    },
  }
}
</script>

<style scoped></style>