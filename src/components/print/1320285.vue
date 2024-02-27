<template>
  <div>
    <div ref="print-containner" id="print-containner">
      <v-container id="printc">
        <v-row class="border" justify="center">
          <v-col cols="2" class="border-rb text-center">主题</v-col>
          <v-col cols="4" class="border-rb text-center">{{message.title}}</v-col>
          <v-col cols="2" class="border-rb text-center">状态</v-col>
          <v-col cols="4" class="border-b text-center" v-html="formatFlowMsgState(message)"></v-col>

          <v-col cols="2" class="border-rb text-center ">发起人</v-col>
          <v-col cols="4" class="border-rb text-center">{{message.staff.name}}</v-col>
          <v-col cols="2" class="border-rb text-center">发起时间</v-col>
          <v-col cols="4" class="border-b text-center">{{message.startDate}}</v-col>

          <v-col cols="12" style="min-height: 200px" class="border-b">
            <table width="100%">
              <caption class=" text-center">车费报销报销申请单</caption>
              <tr>
                <td class="border text-center" width="30%">报销申请人</td>
                <td class="border text-center" width="70%">{{data.staff.name}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">报销开始日期</td>
                <td class="border text-center" width="70%">{{data.startDate}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">截止日期</td>
                <td class="border text-center" width="70%">{{data.endDate}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">系统计算里程</td>
                <td class="border text-center" width="70%">{{data.systemKm}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">实际报销里程</td>
                <td class="border text-center" width="70%">{{data.inputKm}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">通行费合计</td>
                <td class="border text-center" width="70%">{{data.toll}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">报销金额</td>
                <td class="border text-center" width="70%">{{data.money}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">备注</td>
                <td class="border text-center" width="70%">{{data.remark}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">收款人开户行</td>
                <td class="border text-center" width="70%">{{data.staff.openBlank}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">收款人银行账号</td>
                <td class="border text-center" width="70%">{{data.staff.bankNumber}}</td>
              </tr>
              <tr>
                <td class="border text-center" width="30%">发票确认</td>
                <td class="border text-center" width="70%"> </td>
              </tr>
            </table>

            <v-data-table :items="items"
                          group-by="project.name"
                          sort-desc
                          sort-by="startTime"
                          show-group-by
                          item-key="id"
                          :headers="headers"
                          hide-default-footer
                          :items-per-page="-1">
              <template v-slot:group.header="{group,groupBy,remove,toggle,items}">
                <td colspan="12" class="text-start">
                  <v-btn icon x-small @click="toggle()"><v-icon x-small>mdi-minus</v-icon></v-btn>
                  {{group || '无项目'}}，{{getSum(items)}}
                  <v-btn icon x-small @click="toggle()"><v-icon x-small>mdi-plus</v-icon></v-btn>
                </td>
              </template>
              <template v-slot:item.startTime="{item}">
                {{subDate(item.startTime,5,16)}}
              </template>

              <template v-slot:item.endTime="{item}">
                {{subDate(item.endTime,5,16)}}
              </template>
              <template v-slot:item.startImg="{item}">
                <img :src="serverPath+item.startImg"
                     style="width: 50px;height: 50px;">
              </template>

              <template v-slot:item.endImg="{item}">
                <img v-if="item.endImg" :src="serverPath+item.endImg"
                     style="width: 50px;height: 50px;">
                <p v-else>未到达</p>
              </template>

              <template v-slot:item.isParkingCost="{item}">
                <div>{{ item.isParkingCost == '0' ? '' : '有' }}</div>
              </template>

              <template v-slot:item.parkingCostImg="{item}">
                <img v-if="item.parkingCostImg"
                     :src="serverPath+item.parkingCostImg" style="width: 50px;height: 50px;">
              </template>

              <template v-slot:item.carType="{item}">
                <span>{{formatCarType(item.carType)}}</span>
              </template>
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
                   class="border-rb text-center pa-5"><span class="vertical-center">{{fa.courseName}}</span>
            </v-col>
            <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="10" :key="fa.id+i"
                   class="border-b">
              <v-container class="full-height">
                <v-row class="full-height" style="margin-top: -20px;">
                  <v-col cols="12" class="border-b text-center" style="min-height:32px;">
                    <span class="vertical-center">{{fa.content}}</span>

                  </v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">审批人</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{fa.acceptUser.name}}</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">审批时间</v-col>
                  <v-col cols="2" class="border-r pl-5 full-height"
                         v-html="formatterDate(fa)"></v-col>
                  <v-col cols="2" class="border-r pl-5 full-height">审批结果</v-col>
                  <v-col cols="2" class="pl-5 full-height">{{formatApproveState(fa)}}</v-col>
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
import {getExpenseById} from "@/api/outCarHistory";
import {getStaffById} from "@/api/staff";
import {getConfig} from "@/api/systemConfig";

export default {
  name: "default-print-1320285",
  data: () => ({
    printObj: {
      id: "printc",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    data:{
      startDate: '',
      endDate: '',
      remark: '',
      systemKm: 0,
      inputKm: 0,
      staff: {
        name: '',
        openBlank: null,
        bankNumber: null
      },
      detail: [],
      money: 0,
      toll:0
    },
    items:[],
    headers: [
      {text: '出发时间', value: 'startTime',width:'90px'},
      {text: '出发地点', value: 'startAddrName',width:'150px'},
      {text: '出发记录', value: 'startImg'},
      {text: '到达时间', value: 'endTime',width:'90px'},
      {text: '到达地点', value: 'endAddrName',width:'150px'},
      {text: '到达图片', value: 'endImg'},
      {text: '系统里程', value: 'systemKm'},
      {text: '实际里程', value: 'inputKm'},
      {text: '通行费', value: 'toll'},
      {text: '车辆类型', value: 'carType'}
    ],
    serverPath:null
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
    getSum(items){
      let inputKm = 0,systemKm = 0
      items.forEach(item=>{
        if(item.inputKm){
          inputKm += item.inputKm
        }
        if(item.systemKm){
          systemKm += item.systemKm
        }
      })
      return `系统合计里程：${systemKm.toFixed(2)}，实际报销合计里程：${inputKm.toFixed(2)}`
    },
    load(){
      getExpenseById(this.message.frameId).then(result => {
        this.items = result.detailHistory
        let totalToll = 0
        this.items.forEach(item=>{
          if(item.toll != null){
            totalToll += item.toll
          }
        })
        result.toll = totalToll.toFixed(2)
        this.data = result
        getStaffById(result.staffId).then(s => {
          this.$set(this.data, 'staff', s)
        }).finally(() => {
          this.$refs.printBtn.click();
          window.setTimeout(() => {
            this.$emit("success")
          }, 1000)
        })
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
    formatCarType(carType){
      if (carType == 0){
        return "汽油车"
      }else if (carType == 1){
        return "电车"
      }else if (carType == 2){
        return "油电混合"
      }
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

.border-l{
  border-left: 1px solid black;
}

.border-top{
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
