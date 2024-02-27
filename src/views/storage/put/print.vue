<template>
  <div>
    <div id="printCon">
      <div class="no-padding">
        <div class="text-center">
          <p class="text-h4">材料入库单</p>
          <p class="text-h6">公司地址：{{ baseAddress.title }}</p>
          <h6 class="text-h6">{{ "FAX：" + baseAddress.fax + "&nbsp;&nbsp;TEL：" + baseAddress.tel }}</h6>
          <img v-if="printData.sign"
               ref="signImg"
               @load="loadHandler"
               :style="{width:imgWidth}"
               :src="printData.sign.signImg"
               style="position: absolute;top:0px;left:-10px;"/>
          <!--                    <img :src="printData.sign." id="sign-img-print" style="width:100%;position: absolute;top:0;"/>-->
        </div>
        <v-row dense>
          <v-col cols="4" class="pa-0">
            <p id="putNumber">入库单编号：<span>{{ printData.putSerial }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p class="" id="proNumber" v-if="!hidePmNumber">
              商品订单号：<span>{{ printData.procurement.pmNumber }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="storage">收入仓库：<span>{{ printData.storage.name }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="company_print">供应商：<span>{{ printData.company.name }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="print_data">审核日期：<span>{{ printData.approveDate }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="print_person">收货人：<span>{{ printData.staff.name }}</span></p>
          </v-col>
          <v-col cols="12" class="pa-0">
            <p id="print_remark">备注：<span>{{ printData.remark }}</span></p>
          </v-col>
        </v-row>

      </div>
      <div class="v-data-table table-bordered text-center blank--text theme--light">
        <div class="v-data-table__wrapper">
          <table class="print-table">
            <thead style="display: table-header-group !important;">
            <tr>
              <th class="table-title" style="width: 35px">序号</th>
              <th class="table-title" style="width: 125px">材料编码</th>
              <th class="table-title" style="width: 135px">材料名称</th>
              <th class="table-title" style="width: 120px">规格</th>
              <th class="table-title" style="width: 40px">单位</th>
              <th class="table-title" style="width: 50px">数量</th>
              <th class="table-title" style="width: 50px">单价</th>
              <th class="table-title" style="width: 35px">税率</th>
              <th class="table-title" style="width: 65px">税额</th>
              <th class="table-title" style="width: 65px">金额</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(item,idx) in printData.materialList"
                :key="item.id"
            >
              <td>{{ idx + 1 }}</td>
              <td>{{ formatId(item) }}</td>
              <td>{{ item.material.name }}</td>
              <td>{{ item.material.model }}</td>
              <td>{{ item.material.unit.name }}</td>
              <td>{{ item.putSum }}</td>
              <td>{{ item.taxPrice }}</td>
              <td>{{ parseInt(printData.tax) }}</td>
              <td>{{ item.taxMoney.toFixed(2) }}</td>
              <td>{{ item.moneyTax }}</td>
            </tr>
            <tr>
              <td class="last-td" colspan="6" style="text-align: left;">不含税合计：<span>{{ upperMoney }}</span></td>
              <td class="last-td" colspan="2" style="text-align: left;" id="moneyCount">￥{{ money }}<span></span></td>
              <td class="last-td" colspan="2" style="text-align: left;">￥{{ moneyTax }}<span></span></td>
            </tr>
            </tbody>


          </table>
        </div>
      </div>


    </div>
    <a ref="printBtn" v-print="printObj">打印</a>
  </div>
</template>

<script>


import {getAddress} from "@/utils/printBase";

export default {
  name: "putPrint",
  data: () => ({
    printObj: {
      id: "printCon",
      popTitle: '打印',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    money: 0,
    upperMoney: '',
    moneyTax: 0,
    baseAddress: {
      title: null,
      fax: null,
      tel: null
    },
    imgWidth: 'auto',
    imgLoad: true,
  }),
  props: {
    printData: Object,
    hidePmNumber: Boolean
  },
  watch: {
    printData: {
      handler() {

      }
    },
    "printData.materialList": {
      handler() {
        this.setCount()
      },
      deep: true
    }
  },
  created() {
    getAddress().then(result => {
      this.baseAddress = result
    })
  },
  methods: {
    loadHandler() {
      let img = this.$refs.signImg
      let width = img.width;
      let height = img.height;
      if (width < height || height > 150) {
        this.imgWidth = '150px'
      } else if (width >= height && height <= 150) {
        this.imgWidth = '500px'
      }
      this.imgLoad = false
      console.log(width, height, this.imgWidth)
      window.setTimeout(() => {
        this.imgLoad = true
      }, 50)
    },
    setCount() {
      let moneyTax = 0
      let money = 0
      this.printData.materialList.forEach(item => {
        moneyTax += item.moneyTax
        money += item.money
      })
      this.upperMoney = this.parseUpperNum(money)
      this.moneyTax = moneyTax.toFixed(2)
      this.money = money.toFixed(2)
    },
    formatId(item) {
      let id = item.material.id
      let x = id.indexOf("-");
      return id.substring(0, x === -1 ? id.length : x)
    },
    print() {
      let timeout = window.setInterval(() => {
        console.log("开始打印", this.imgLoad)
        if (this.imgLoad) {
          window.clearInterval(timeout)
          if (this.$refs.printBtn) {
            this.$refs.printBtn.click()
          } else {
            this.$nextTick(() => {
              this.$refs.printBtn.click()
            })
          }
        }
      }, 50)

    }
  }
}
</script>

<style scoped>
.text-center {
  text-align: center;
}

.text-h4 {
  font-size: 26px;
}

.table-bordered thead > tr > th, .table-bordered thead > tr > td {
  border-bottom-width: 1px;
}

.table-bordered thead > tr > th,
.table-bordered tbody > tr > th,
.table-bordered tfoot > tr > th,
.table-bordered thead > tr > td,
.table-bordered tbody > tr > td,
.table-bordered tfoot > tr > td {
  border-left: 1px solid black !important;
  border-top: 1px solid black !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  height: 20px;
  line-height: 20px;
  padding-left: 5px;
  padding-right: 5px;
  color: black;
}

.table-bordered tfoot > tr > td {
  border-bottom: 1px solid black !important;
  color: black;
}

.table-bordered thead > tr > th:last-child,
.table-bordered tbody > tr > td:last-child,
.table-bordered tfoot > tr > td:last-child {
  border-right: 1px solid black !important;
}

.blank--text td {
  color: black;
}

.print-table {
  table-layout: fixed;
  flex-wrap: wrap;
  word-break: break-all;
}
.last-td{
  border-bottom: 1px solid black;
}
</style>
