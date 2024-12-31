<template>
  <div>
    <div ref="print-containner" id="print-containner">
      <v-container id="printc">
        <v-row class="border" justify="center">
          <v-col cols="2" class="border-rb text-center">主题</v-col>
          <v-col cols="4" class="border-rb text-center">{{ message.title }}</v-col>
          <v-col cols="2" class="border-rb text-center">状态</v-col>
          <v-col cols="4" class="border-b text-center" v-html="formatFlowMsgState(message)"></v-col>

          <v-col cols="2" class="border-rb text-center ">发起人</v-col>
          <v-col cols="4" class="border-rb text-center">{{ message.staff.name }}</v-col>
          <v-col cols="2" class="border-rb text-center">发起时间</v-col>
          <v-col cols="4" class="border-b text-center">{{ message.startDate }}</v-col>

          <v-col cols="12" style="min-height: 200px" class="border-b">
            <div v-html="remark"></div>
            <table style="width:100%">
              <thead>
              <tr>
                <td class="border-black" width="20%">合同名称</td>
                <td class="border-black" width="10%">总价</td>
                <td class="border-black" width="10%">已付款</td>
                <td class="border-black" width="15%">本次申请付款</td>
                <td class="border-black" width="15%">款项性质</td>
                <td class="border-black" width="10%">说明</td>
                <td class="border-black" width="20%">项目名称</td>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item) in payment.details" :key="item.id">
                <td class="border-black">{{ item.contract.name }}</td>
                <td class="border-black">{{ item.contract.price }}</td>
                <td class="border-black" style="color:#93deff">{{ item.contract.yetPay }}</td>
                <td class="border-black" style="color:red">{{ item.applyMoney }}</td>
                <td class="border-black">{{ item.paymentType.name }}</td>
                <td class="border-black">{{ item.remark }}</td>
                <td class="border-black">{{ item.contract.projects[0].name }}</td>
              </tr>
              </tbody>
              <tfoot>
              <tr>
                <td style="width: 15%;">合计</td>
                <td style="width:10%;">{{ price }}</td>
                <td style="width:10%;color: #93deff">{{ yetMoneys }}</td>
                <td style="width:15%;color: red">{{ applyMoney }}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              </tfoot>
            </table>
          </v-col>

          <template v-for="(fa,i) in approveList">
            <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="2" :key="fa.id"
                   class="border-rb text-center pa-5"><span class="vertical-center">{{ fa.courseName }}</span>
            </v-col>
            <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="10" :key="fa.id+i"
                   class="border-b">
              <v-container class="full-height">
                <v-row class="full-height" style="margin-top: -20px;">
                  <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                    <span class="vertical-center">{{ fa.content }}</span>

                  </v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">知会人</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{ fa.acceptUser.name }}
                  </v-col>
                  <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">知会时间</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height"
                         v-html="formatterDate(fa)"></v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">知会结果</v-col>
                  <v-col cols="2" class="pl-5 full-height">{{ formatApproveState(fa) }}</v-col>
                </v-row>
              </v-container>
            </v-col>
            <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="2" :key="fa.id"
                   class="border-rb text-center pa-5"><span class="vertical-center">{{ fa.courseName }}</span>
            </v-col>
            <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="10" :key="fa.id+i"
                   class="border-b">
              <v-container class="full-height">
                <v-row class="full-height" style="margin-top: -20px;">
                  <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                    <span class="vertical-center">{{ fa.content }}</span>

                  </v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">审批人</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{ fa.acceptUser.name }}
                  </v-col>
                  <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">审批时间</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height"
                         v-html="formatterDate(fa)"></v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">审批结果</v-col>
                  <v-col cols="2" class="pl-5 full-height">{{ formatApproveState(fa) }}</v-col>
                </v-row>
              </v-container>

            </v-col>
          </template>

        </v-row>
      </v-container>
      <a ref="printBtn" v-print="printObj">打印</a>
    </div>
  </div>

</template>

<script>
import {loadById, savePrintHistory} from '@/api/payment'

export default {
  name: "default-print-10563",
  data: () => ({
    openAccount2: false,
    headers: [
      {text: "合同名称", value: "contract.name", width: '20%'},
      {text: "总价", value: "contract.price", width: '10%'},
      {text: "已付款", value: "contract.yetPay", width: '10%'},
      {text: "本次申请付款", value: "applyMoney", width: '15%'},
      {text: "款项性质", value: "paymentType.name", width: '15%'},
      {text: "说明", value: "remark", width: '10%'},
      {text: "项目名称", value: "contract.projects[0].name", width: '20%'},
    ],
    remark: null,
    payment: {
      details: []
    },
    printObj: {
      id: "printc",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    price: 0,
    yetMoneys: 0,
    applyMoney: 0,
  }),
  props: {
    approve: Object,
    printContent: String,
    approveList: Array,
    message: {
      type: Object,
      default: () => ({staff: {name: null}})
    },
    fqFlag: Boolean,
  },
  mounted() {
    this.$nextTick(function () {
      loadById(this.message.frameId).then(payment => {
        payment.proCompanyName = this.$store.state.api.cname;
        payment.moneys = 0.0;
        this.openAccount2 = (payment.payBankNumber && payment.payBankNumber != '')
        if (payment.details) {
          let temp = 0
          payment.details.forEach((item, i) => {
            item.index = i + 1;
            if (item.contract.partyA.id != "229CAD0E-7AAA-48CE-A3AF-8C97994CC3FF") {
              payment.proCompanyName = item.contract.partyA.name;
            }
            payment.moneys += item.applyMoney
            this.price += item.contract.price
            if (this.fqFlag) {
              item.contract.yetPay = item.contract.yetPay - item.applyMoney
            }
            temp += item.contract.yetPay
          });
          this.yetMoneys = temp.toFixed(2)
          payment.moneys = payment.moneys.toFixed(2);
          this.applyMoney = payment.moneys;
        }
        if (this.openAccount2) {
          this.remark = `采购单位：${payment.proCompanyName}<br/>收款单位：${payment.company.name}<br/>开户行：${payment.company.openAccount2}<br/>账户：${payment.company.bankNumber2}`;
        } else {
          this.remark = `采购单位：${payment.proCompanyName}<br/>收款单位：${payment.company.name}<br/>开户行：${payment.company.openAccount}<br/>账户：${payment.company.bankNumber}`;
        }
        if (payment.company.lineNum != '') {
          this.remark += `<br/>银行行号：${payment.company.lineNum}`
        }
        this.remark += `<br/><span style="color:red;font-width: 600;">${payment.remark}</span>`
        this.payment = payment;
        this.checkPrintHistory()
      })
    })
  },
  methods: {
    print() {
      this.saveHistory()
      this.$refs.printBtn.click();
    },
    saveHistory() {
      savePrintHistory(this.payment.id)
    },
    checkPrintHistory() {
      if (this.payment.printDate != null && this.payment.printDate != '') {
        this.confirm("该单据已被打印过，打印日志：" + this.payment.printDate + "，需要再次打印吗？").then(this.print)
      } else {
        this.print()
      }
    },
    formatterDate(fa) {
      if (fa.approveDate != "") {
        //审批时间
        return fa.approveDate.substring(5, 16);
      } else if (fa.readDate != "") {
        //阅读时间
        return fa.readDate.substring(5, 16);
      }
      return "-";
    }
  }
}
</script>

<style scoped>
#print-containner {
  position: fixed;
  opacity: 0;
  left: 1000%;
}

.border {
  border: 1px solid black;
}

.border-rb {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
}

.border-r {
  border-right: 1px solid black;
}

.border-b {
  border-bottom: 1px solid black;
}

div {
  padding: 0px;
}

.full-height {
  height: 100%;
}

#printc {
  padding: 12px;
}

.container {
  padding: 12px;
}

.text-center {
  text-align: center;
}

.vertical-center {
  position: relative;
  top: 25%;
}

.pl-5 {
  padding-left: 5px;
}

.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child > th {
  border-bottom: 1px solid black !important;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

.border-black {
  border-bottom: 1px solid black !important;
}
</style>
