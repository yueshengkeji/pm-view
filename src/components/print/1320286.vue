<template>
  <div>
    <div ref="print-containner" id="print-containner">
      <v-container id="printc">
        <v-row class="border" justify="center">
          <v-col cols="2" class="border-rb text-center">主题</v-col>
          <v-col cols="4" class="border-rb text-center">{{ message.title }}</v-col>
          <v-col cols="2" class="border-rb text-center">状态</v-col>
          <v-col cols="2" class="border-b text-center" v-html="formatFlowMsgState(message)"></v-col>
          <v-col cols="2" class="border-b text-center">打印次数：{{ message.printCount }}</v-col>

          <v-col cols="2" class="border-rb text-center ">发起人</v-col>
          <v-col cols="4" class="border-rb text-center">{{ message.staff.name }}</v-col>
          <v-col cols="2" class="border-rb text-center">发起时间</v-col>
          <v-col cols="4" class="border-b text-center">{{ message.startDate }}</v-col>

          <v-col cols="12" style="min-height: 200px" class="border-b">
            <v-container>
              <v-row>
                <v-col cols="6">
                  <span>接待部门:</span>
                  <v-text-field v-model="entertain.section.name"
                                readonly
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <span>接待负责人:</span>
                  <v-text-field v-model="entertain.staff.name"
                                readonly></v-text-field>
                </v-col>
                <v-col cols="6">
                  <span>宴请(来客)单位:</span>
                  <v-text-field v-model="entertain.entertainObject"
                                readonly></v-text-field>
                </v-col>
                <v-col cols="3">
                  <span>预计费用:</span>
                  <v-text-field v-model="entertain.costPlan" readonly
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <span>实际费用:</span>
                  <v-text-field v-model="entertain.costActual"
                                readonly></v-text-field>
                </v-col>
                <v-col cols="12">
                  <span>招待事由:</span>
                  <v-text-field v-model="entertain.entertainReason"
                                readonly></v-text-field>
                </v-col>
                <v-col cols="12">
                  <span>备注:</span>
                  <v-text-field v-model="entertain.remark" readonly></v-text-field>
                </v-col>
                <v-col cols="4">
                  <span>招待日期:</span>
                  <v-text-field hide-details
                                v-model="entertain.entertainTime"
                                readonly></v-text-field>
                </v-col>
                <v-col cols="4">
                  <span>宴请人数:</span>
                  <v-text-field v-model="entertain.entertainNumber"
                                readonly></v-text-field>
                </v-col>
                <v-col cols="4">
                  <span>陪同人数:</span>
                  <v-text-field v-model="entertain.accompanyingNumber"
                                readonly></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <span>招待方式:</span>
                <v-radio-group
                    v-model="entertain.entertainWay"
                    row
                    readonly
                    style="margin: -2px 10px;"
                >
                  <v-radio
                      label="自行安排"
                      value="0"
                  ></v-radio>
                  <v-radio
                      label="公司安排"
                      value="1"
                  ></v-radio>
                  <v-radio
                      label="外出"
                      value="2"
                  ></v-radio>
                </v-radio-group>
              </v-row>
              <v-row>
                <span>招待类别:</span>
                <v-checkbox
                    v-model="entertainCategoryItem"
                    label="六楼小餐厅"
                    value="0"
                    hide-details
                    readonly
                    style="margin: -2px 10px;"
                ></v-checkbox>
              </v-row>
              <v-row style="margin-top: 30px">
                <span>接待用餐标准:</span>
                <v-radio-group
                    v-model="entertain.entertainDiningStandard"
                    row
                    readonly
                    style="margin: -2px 10px;"
                >
                  <v-radio
                      label="A类 300/人"
                      value="0"
                  ></v-radio>
                  <v-radio
                      label="B类 200/人"
                      value="1"
                  ></v-radio>
                  <v-radio
                      label="C类 150/人"
                      value="2"
                  ></v-radio>
                  <v-radio
                      label="其它"
                      value="3"
                  ></v-radio>

                  <v-text-field
                      ref="diningOtherFocus"
                      v-model="entertain.entertainDiningOther"
                      readonly
                      style="margin-left: 20px;"
                  ></v-text-field>

                </v-radio-group>

              </v-row>
              <v-row>
                <span>招待类型:</span>
                <v-checkbox
                    v-model="entertainTypesItem"
                    label="就餐"
                    value="0"
                    hide-details
                    readonly
                    style="margin: -2px 10px;"
                ></v-checkbox>
                <v-checkbox
                    v-model="entertainTypesItem"
                    label="住宿"
                    value="1"
                    hide-details
                    style="margin: -2px 20px"
                    readonly
                ></v-checkbox>
                <v-checkbox
                    v-model="entertainTypesItem"
                    label="招待用品"
                    value="2"
                    hide-details
                    style="margin: -2px 20px"
                    readonly
                ></v-checkbox>
                <v-checkbox
                    v-model="entertainTypesItem"
                    label="其它"
                    value="3"
                    hide-details
                    style="margin: -2px 20px"
                    readonly
                ></v-checkbox>
                <v-text-field
                    ref="focus"
                    v-model="entertain.entertainTypeOther"
                    required
                    readonly
                    style="margin-left: 20px;"
                ></v-text-field>
              </v-row>
              <v-row v-if="entertainTobaccoAlcoholFlag">
                <v-col cols="4">
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="A级白酒"
                      value="A0"
                      hide-details
                      readonly
                  ></v-checkbox>
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="A级红酒"
                      value="A1"
                      hide-details
                      readonly
                  ></v-checkbox>
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="A级香烟"
                      value="A2"
                      hide-details
                      readonly
                  ></v-checkbox>
                </v-col>
                <v-col cols="4">
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="B级白酒"
                      value="B0"
                      hide-details
                      readonly
                  ></v-checkbox>
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="B级红酒"
                      value="B1"
                      hide-details
                      readonly
                  ></v-checkbox>
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="B级香烟"
                      value="B2"
                      hide-details
                      readonly
                  ></v-checkbox>
                </v-col>
                <v-col cols="4">
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="C级白酒"
                      value="C0"
                      hide-details
                      readonly
                  ></v-checkbox>
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="C级红酒"
                      value="C1"
                      hide-details
                      readonly
                  ></v-checkbox>
                  <v-checkbox
                      v-model="entertainTobaccoAlcoholItem"
                      label="C级香烟"
                      value="C2"
                      hide-details
                      readonly
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row style="margin-top: 30px">
                <span>商务用车:</span>
                <v-radio-group
                    v-model="entertain.entertainCar"
                    row
                    readonly
                    style="margin: -2px 20px"
                >
                  <v-radio
                      label="否"
                      value="0"
                  ></v-radio>
                  <v-radio
                      label="是"
                      value="1"
                  ></v-radio>
                </v-radio-group>
              </v-row>
            </v-container>
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
import {selectById} from "../../api/entertain";

export default {
  name: "default-print-1320281",
  data: () => ({
    printObj: {
      id: "printc",
      popTitle: '打印',
      extraCss: '',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },

    entertain: {
      section: {name: null},
      staff: {name: null},
      entertainObject: null,
      entertainNumber: null,
      accompanyingNumber: null,
      entertainReason: null,
      costPlan: null,
      costActual: null,
      remark: null,
      entertainTypes: null,
      entertainTypeOther: null,
      entertainTobaccoAlcohol: null,
      entertainWay: null,
      entertainCategory: null,
      entertainTime: null,
      entertainDiningStandard: null,
      entertainDiningOther: null,
      entertainCar: null,
      createTime: null,
      updateTime: null,
    },
    sections: [],

    menu: false,
    entertainTypesItem: [],
    entertainTobaccoAlcoholFlag: false,
    entertainTobaccoAlcoholItem: [],
    entertainCategoryItem: [],
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
  mounted() {
    let than = this
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      than.load()
    })

  },
  watch: {
    entertainTypesItem: {
      handler() {
        if (this.entertainTypesItem.indexOf('2') != -1) {
          this.entertainTobaccoAlcoholFlag = true
        } else {
          this.entertainTobaccoAlcoholFlag = false
          this.entertainTobaccoAlcoholItem = []
        }
      },
      deep: true,
    },
  },
  methods: {
    resetData() {
      this.entertain = {
        section: {name: null},
        staff: {name: null},
        entertainObject: null,
        entertainNumber: null,
        accompanyingNumber: null,
        entertainReason: null,
        costPlan: null,
        costActual: null,
        remark: null,
        entertainTypes: null,
        entertainTypeOther: null,
        entertainTobaccoAlcohol: null,
        entertainWay: null,
        entertainCategory: null,
        entertainTime: null,
        entertainDiningStandard: null,
        entertainDiningOther: null,
        entertainCar: null,
        createTime: null,
        updateTime: null,
      }
      this.entertainTobaccoAlcoholItem = []
      this.entertainCategoryItem = []
      this.entertainTypesItem = []
    },
    load() {
      this.resetData()
      selectById({id: this.message.frameId}).then(res => {
        if (res.id == null) {
          this.$store.state.showTooltip.msg = "未查询到审批数据，无法打印"
          this.$store.state.showTooltip.show = true
          this.$store.state.showTooltip.back = () => {
            this.$store.state.showTooltip.show = false
            this.$emit("success")
          }
        } else {
          // res.entertainCar = res.entertainCar + ''
          // res.entertainDiningStandard = res.entertainDiningStandard + ''
          // res.entertainWay = res.entertainWay + ''
          this.entertain = res
          this.initData(this.entertain)

        }
      }).finally(() => {

        window.setTimeout(() => {
          this.$refs.printBtn.click();
          this.$emit("success")
        }, 1000)
      })
    },

    initData(data) {
      let a = data.entertainTypes.split(',')
      a.forEach(item => {
        if (item != '') {
          this.entertainTypesItem.push(item)
        }
      })

      let b = data.entertainTobaccoAlcohol.split(',')
      b.forEach(item => {
        if (item != '') {
          this.entertainTobaccoAlcoholItem.push(item)
        }
      })

      let c = data.entertainCategory.split(',')
      c.forEach(item => {
        if (item != '') {
          this.entertainCategoryItem.push(item)
        }
      })

      this.entertain.entertainCar = data.entertainCar + ''
      this.entertain.entertainDiningStandard = data.entertainDiningStandard + ''
      this.entertain.entertainWay = data.entertainWay + ''

      this.entertain.entertainTime = data.entertainTime.substring(0, 10)

      console.log('entertainCar1', data.entertainCar)
      console.log('entertainCar2', this.entertain.entertainCar)
      console.log('entertainDiningStandard1', data.entertainDiningStandard)
      console.log('entertainDiningStandard2', this.entertain.entertainDiningStandard)
      console.log('entertainWay1', data.entertainWay)
      console.log('entertainWay2', this.entertain.entertainWay)
      console.log(this.entertain)
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
