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
            <table width="100%">
              <caption class=" text-center">费用报销</caption>

              <tr>
                <td class="border text-center" width="30%">项目名称</td>
                <td class="border text-center" width="70%">{{ data.project }}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">报销金额合计</td>
                <td class="border text-center" width="70%">{{ data.totalMoney }}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">报销申请人</td>
                <td class="border text-center" width="70%">{{ data.staff.name }}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">开户行及账号</td>
                <td class="border text-center" width="70%">{{ data.staff.openBlank +'-'+data.staff.bankNumber}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">摘要</td>
                <td class="border text-center" width="70%">{{ data.title }}</td>
              </tr>

            </table>

            <v-data-table
                hide-default-footer
                :headers="headers"
                :items="data.expenseSubjects"
                class="elevation-1" style="text-align: left">

            </v-data-table>
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
import {getConfig} from "@/api/systemConfig";
import {selectById} from "@/api/expense";

export default {
  name: "default-print-1320284",
  data: () => ({
    printObj: {
      id: "printc",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    data: {
      remark: '',
      staff: {
        name: '',
        openBlank: null,
        bankNumber: null
      },
      totalMoney: 0,
      project: null,
      expenseSubjects: []
    },
    items: [],
    headers: [
      {text: '费用名称', value: 'course.name', sortable: false},
      {text: '费用金额', value: 'money', sortable: false, with: '20%'},
      {text: '备注', value: 'remark', sortable: false},
    ],
    serverPath: null
  }),
  props: {
    approve: Object,
    printContent: String,
    approveList: Array,
    message: {
      type: Object,
      default: () => ({staff: {name: null}})
    },
  },
  created() {
    getConfig("FTP_SERVER_PATH").then(result2 => {
      if (result2.id) {
        this.serverPath = result2.value
      }
    })
  },
  mounted() {
    let than = this
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      than.load()
    })

  },
  methods: {
    load() {
      selectById({id:this.message.frameId}).then(result => {

        this.data = result
        this.$refs.printBtn.click();
        // getStaffById(result.staffId).then(s => {
        //   this.$set(this.data, 'staff', s)
        // }).finally(() => {
        //   this.$refs.printBtn.click();
        //   window.setTimeout(() => {
        //     this.$emit("success")
        //   }, 1000)
        // })
      })
    },

    getContentHtml() {
      return (this.printContent != null && this.printContent !== "") ? this.printContent : this.message.content;
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
    },
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

.border-l {
  border-left: 1px solid black;
}

.border-top {
  border-top: 1px solid black;
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
