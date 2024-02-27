<template>
  <div>
    <div ref="print-containner" id="print-containner">
      <v-container id="printc">
        <v-row class="border" justify="center">

          <print-head :message="message"></print-head>

          <v-col cols="12" style="min-height: 200px" class="border-b">
            <v-data-table :items="per.workLogs"
                          :headers="headers"
                          dense
                          hide-default-footer
                          :items-per-page="-1">

              <template v-slot:top>
                <table style="width: 100%" class="text-center">
                  <thead>
                  <tr>
                    <td>姓名</td>
                    <td class="font-weight-black">{{per.staff.name}}</td>
                    <td>部门</td>
                    <td class="font-weight-black">{{per.section.name}}</td>
                    <td>职务</td>
                    <td v-if="per.staff.duty" class="font-weight-black">{{per.staff.duty[0].name}}</td>
                    <td>考核月份</td>
                    <td class="font-weight-black">{{per.month}}</td>
                  </tr>
                  </thead>
                </table>
              </template>

              <template v-slot:item.workDate="{item}">
                {{ formatDateStr(item.workDate, 0, 10) }}
              </template>

              <template v-slot:item.state="{item}">
                <v-checkbox v-model="item.stateFlag" dense></v-checkbox>
              </template>
              <template v-slot:body.append>
                <tr>
                  <td colspan="4" class="text-right font-weight-black">综合评分合计:</td>
                  <td>{{ per.logScore }}</td>
                  <td colspan="2" style="width: 100px;"></td>
                </tr>


                <tr>
                  <td colspan="3" class="text-center font-weight-black">月度周工作完成情况</td>
                  <td class="font-weight-black">10%</td>
                  <td colspan="3"></td>
                </tr>
                <tr v-for="(item) in weekLogs" :key="item.id">
                  <td colspan="3">
                    {{item.note}}
                  </td>
                  <td>{{item.weight}}</td>
                  <td>
                    <v-text-field dense v-model="item.score" type="number"></v-text-field>
                  </td>
                  <td>
                    <v-checkbox v-model="item.stateFlag"></v-checkbox>
                  </td>
                  <td>
                    {{item.remark}}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="font-weight-black text-center">临时或特殊事项完成情况</td>
                  <td class="font-weight-black">10%</td>
                  <td colspan="3"></td>
                </tr>
                <tr>
                  <td>情况说明</td>
                  <td colspan="3">
                    <v-text-field  v-model="per.note"></v-text-field>
                  </td>
                  <td>
                    <v-text-field type="number" v-model="per.weight"></v-text-field>
                  </td>
                  <td colspan="2"></td>
                </tr>
                <tr class="font-weight-black">
                  <td colspan="3" class="text-right">合计</td>
                  <td>{{per.scoreSum}}</td>
                  <td colspan="2"></td>
                </tr>
              </template>
            </v-data-table>
          </v-col>

          <print-approve-list :approve-list="approveList"></print-approve-list>

        </v-row>
      </v-container>
      <a ref="printBtn" v-print="printObj">打印</a>
    </div>
  </div>

</template>

<script>
import {getPerById} from '@/api/workLog'
import PrintHead from "@/components/print/head.vue";
import PrintApproveList from "@/components/print/approveList.vue";

export default {
  name: "default-print-137213",
  components: {PrintApproveList, PrintHead},
  data: () => ({
    weekLogs:[],
    headers: [
      {text: '工作性质', value: 'tag'},
      {text: '工作内容', value: 'content'},
      {text: '计划完成时间', value: 'workDate',width: '150px'},
      {text: '完成情况说明', value: 'note'},
      {text: '权重', value: 'weight'},
      {text: '综合评分', value: 'score'},
      {text: '是否完成', value: 'state'},
      {text: '备注', value: 'remark'}
    ],
    per: {
      month: null,
      staff: {
        name:null,
        duty:[]
      },
      workLogs: [],
      score: 0,
      remark: null,
      note: null,
      weight: null,
      scoreSum: null,
      logScore:null
    },
    printObj: {
      id: "printc",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
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
      this.weekLogs = []
      getPerById(this.message.frameId).then(result => {
        let logs = []
        result.workLogs.forEach((item)=>{
          if(item.content == '月度周计划'){
            this.weekLogs.push(item)
          }else{
            logs.push(item)
          }
        })
        if(result.staff.duty == null){
          result.staff.duty = []
        }


        result.workLogs = logs
        this.per = result;
        this.print()
      })
    })
  },
  methods: {
    print() {
      this.$refs.printBtn.click();
    }
  },
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
