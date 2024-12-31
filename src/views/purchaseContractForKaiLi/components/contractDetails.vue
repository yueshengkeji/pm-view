<template>
  <div>
    <v-dialog v-model="contractDialog" width="90%">
      <v-card>
        <v-card-title>
          <v-row>
            <v-col>
              <span style="font-size: 20px">合同详情</span>
            </v-col>
            <v-spacer></v-spacer>
            <div style="display: flex">
              <v-btn class="mr-1" @click="saveContract()">保存</v-btn>
              <v-btn class="mr-1" @click="showPayment">合同付款</v-btn>
              <v-btn icon style="margin-top: 10px;margin-right: 10px" @click="closeContractDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>

            </div>
          </v-row>
        </v-card-title>
        <v-row style="margin-left: 10px;margin-right: 10px">
          <v-col md="3">
            <v-text-field
                v-model="contract.serialNumber"
                label="编号"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field
                v-model="contract.name"
                label="名称"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field
                v-model="project.name"
                label="项目集合"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field
                v-model="contract.partyA.name"
                label="甲方"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field
                v-model="contract.partyB.name"
                label="乙方"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field
                v-model="contract.type.name"
                label="类型"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field
                v-model="contract.price"
                label="合同总价"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field
                v-model="proMoney"
                label="订单总价"
                readonly
            ></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field
                v-model="contract.yetPay"
                label="已付款"
            ></v-text-field>
          </v-col>
          <v-col md="1">
            <v-text-field
                v-model="contract.applyMoney"
                label="申请中"
                readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-data-table
            :headers="ProMaterialHeader"
            :items="ProMaterialDesserts"
            :loading="proMaterialLoading"
            hide-default-footer
        >
        </v-data-table>

        <v-data-table
            :headers="PaymentDetailHeader"
            :items="PaymentDetailDesserts"
            :loading="paymentDetailLoading"
            hide-default-footer
        >
          <template v-slot:item.payment.approveStatus="{item}">
            <span>{{ item.payment.approveStatus | formatStatus }}</span>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn x-small class="ml-1" @click="detail(item.payment)">明细</v-btn>
          </template>
        </v-data-table>
        <instance-detail :frame="item.id" :close="close"></instance-detail>
      </v-card>
    </v-dialog>
    <v-dialog v-model="paymentDialog" width="80%">
      <v-card>
        <add-payment
            :updateItem="updateItem"
            :purchaseContractItem="purchaseContractItem"
            :offEdit="true"
            :clearFile="clearFile"
            :change="dataChange"
            :startFlow="startFlow"
            :flowModel="flowModel"
            ref="addPaymentRef"
            :isKaiLiPurchase="isKaiLiPurchase"
        ></add-payment>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submitPayment">提交</v-btn>
          <v-btn @click="closePaymentDialog">取消</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar v-model="show" :centered="true" :timeout="timeout">{{ msg }}</v-snackbar>
    </v-dialog>
  </div>
</template>
<script>
import {getDetailByContractId, getProjectByContract, loadById, updateYetPayMoney} from "../../../api/contract";
import {getProByContract} from "../../../api/procurement";
import addPayment from '@/components/10563'
import {insert} from "../../../api/payment";
import instanceDetail from "@/components/easyflow/instance-detail.vue";


export default {
  name: "contract-details",
  components: {instanceDetail, addPayment},
  props: {
    id: String,
    closeShowContract: Function,
  },
  data: () => ({
    proMoney: 0,
    isKaiLiPurchase: true,
    timeout: 2000,
    paymentDialog: false,
    contractId: null,
    contract: null,
    projects: [{}],
    project: {name: null},
    payment: null,

    contractDialog: false,

    ProMaterialHeader: [
      {text: '订单号', value: 'pmNumber'},
      {text: '材料编码', value: 'material.id'},
      {text: '材料名称', value: 'material.name'},
      {text: '材料型号', value: 'material.model'},
      {text: '材料品牌', value: 'material.brand'},
      {text: '产地', value: 'material.producingArea'},
      {text: '单位', value: 'material.unitName'},
      {text: '采购数量', value: 'sum'},
      {text: '采购单价', value: 'priceTax'},
      {text: '采购金额', value: 'moneyTax'},
      {text: '税额', value: 'taxMoney'},
    ],
    ProMaterialDesserts: [],
    proMaterialLoading: false,

    PaymentDetailHeader: [
      {text: '付款日期', value: 'applyDate'},
      {text: '申请人', value: 'payment.staff.name'},
      {text: '申请付款金额', value: 'applyMoney'},
      {text: '付款性质', value: 'paymentType.name'},
      {text: '状态', value: 'payment.approveStatus'},
      {text: '操作', value: 'action'},
    ],
    PaymentDetailDesserts: [],
    paymentDetailLoading: false,

    companyItemName: {},
    clearFile: false,
    updateItem: {},
    purchaseContractItem: {},
    startFlow: false,
    flowModel: {
      message: {}
    },

    show: false,
    msg: "",

    item: {id: null}
  }),

  watch: {
    contractDialog(val) {
      val || this.closeContractDialog()
    },
    paymentDialog(val) {
      val || this.closePaymentDialog()
    },
    id: {
      handler() {
        this.reset()
        this.resetUpdateItem()
        if (this.id != null) {
          this.contractId = this.id
          this.loadById()
          this.getProjectByContract()
          this.getDetailByContractId()
          this.getProByContract()
        }
      },
      deep: true,
    }
  },

  created() {
    this.reset()
    this.resetUpdateItem()
    this.contractId = this.id
    if (this.contractId != null) {
      this.loadById()
      this.getProjectByContract()
      this.getDetailByContractId()
      this.getProByContract()
    }
  },

  filters: {
    formatStatus: function (value) {
      if (value == 0) {
        return '审批中'
      } else if (value == 1) {
        return '已通过'
      }
    }
  },

  methods: {
    saveContract() {
      //保存合同修改
      console.log("saveContract", this.contract)
      updateYetPayMoney(this.contract).then(() => {
        this.message("操作成功")
        this.contractDialog = false
        this.$emit("update")
      })
    },
    detail(item) {
      console.log('item', item)
      this.item = item;
    },
    close() {
      this.item = {id: null}
    },
    getProjectByContract() {
      getProjectByContract({contractId: this.contractId}).then(res => {
        this.projects = res
        if (this.projects[0] != null) {
          this.project = this.projects[0]
        } else {
          this.project = {name: null}
        }
      }).catch(e => {
        console.log(e)
      })
    },

    getDetailByContractId() {
      this.paymentDetailLoading = true
      getDetailByContractId(this.contractId).then(res => {
        this.PaymentDetailDesserts = res
        this.paymentDetailLoading = false
      }).catch(e => {
        console.log(e)
      })
    },

    getProByContract() {
      this.proMaterialLoading = true
      this.ProMaterialDesserts = []
      getProByContract({contractId: this.contractId}).then(res => {
        this.proMoney = 0
        if (res != null && res.length > 0) {
          for (let a = 0; a < res.length; a++) {
            if (res[a].material.length > 0) {
              for (let b = 0; b < res[a].material.length; b++) {
                res[a].material[b].pmNumber = res[a].pmNumber
                this.ProMaterialDesserts.push(res[a].material[b])
                this.proMoney += res[a].material[b].moneyTax
              }
            }
          }
        }
        this.proMoney = this.proMoney.toFixed(2)
        this.proMaterialLoading = false
      }).catch(e => {
        console.log(e)
      })

    },
    loadById() {
      loadById(this.contractId).then(res => {
        this.contract = res
        this.contractDialog = true
      }).catch(e => {
        console.log(e)
      })
    },

    closeContractDialog() {
      this.contractDialog = false
      this.$nextTick(() => {
        this.reset()
        this.resetUpdateItem()
        this.closeShowContract()
      })
    },

    showPayment() {
      this.paymentDialog = true
      this.updateItem.company = this.contract.partyB
      this.updateItem.staff.name = this.$store.state.user.name
      this.purchaseContractItem = this.contract
    },
    closePaymentDialog() {
      this.paymentDialog = false
    },

    dataChange(data, type) {
      console.log("dataChange", data, type)
      if (type == "data") {
        // console.log('here')
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
      if (this.updateItem.moneys <= 0) {
        this.msg = "付款金额不能为0";
        this.show = true;
        valid = false;
        return;
      }
      if (this.updateItem.company.id == null) {
        this.msg = "请选择付款单位";
        this.show = true;
        valid = false;
        return;
      }
      if (this.updateItem.series == null || this.updateItem.series == "") {
        this.updateItem.series = "关于对《" + this.updateItem.company.name + "》的付款申请";
      }
      let uploadFiles = [];
      if (this.files != null) {
        this.files.forEach(file => {
          if (file.id != null) {
            uploadFiles.push(file.id);
          }
        })
      }
      if (valid) {
        this.updateItem.details.forEach(item => {
          if (item != null) {
            delete item.contract['payClone']
          }
        })
        insert({pay: this.updateItem, attachs: uploadFiles}).then(this.nextFLow).catch((e) => {
          console.log("添加合同付款失败", e);
        });
      }
    },
    nextFLow(data) {
      if (this.flow != null) {
        this.flowModel.message = {
          title: "关于对《" + this.updateItem.company.name + "》的付款申请",
          content: this.updateItem.remark == null ? "" : this.updateItem.remark,
          frameCoding: 10563,
          frameId: data.id,
          frameColumn: "pd06401"
        }
        this.startFlow = true;
      }
      this.paymentDialog = false;
      this.resetUpdateItem();
    },

    reset() {
      this.contract = {
        serialNumber: null,
        name: null,
        partyA: {
          name: null,
          id: null,
        },
        partyB: {
          name: null,
          id: null,
        },
        type: {
          name: null,
          id: null,
        },
        price: null,
        yetPay: null,
        applyMoney: null,
      },
          this.projects = [{}]
      this.project = {
        name: null,
      }
      this.payment = {}
      this.clearFile = true

    },
    resetUpdateItem() {
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
      window.setTimeout(() => {
        this.clearFile = false;
        this.startFlow = false;
        this.flowModel.message = {}
      }, 1000);
    },

  },
}
</script>
<style>

</style>