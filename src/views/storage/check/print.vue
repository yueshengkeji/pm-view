<template>
  <div>
    <div id="printCon">
      <div class="no-padding">
        <div class="text-center">
          <p class="text-h4">库存盘点单</p>
          <p class="text-h6">公司地址：{{ baseAddress.title }}</p>
          <h6 class="text-h6">{{ "FAX：" + baseAddress.fax + "&nbsp;&nbsp;TEL：" + baseAddress.tel }}</h6>
        </div>
        <v-row dense>
          <v-col cols="4" class="pa-0">
            <p>盘点单编号：<span>{{ printData.checkNumber }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p class="">
              盘点日期：<span>{{ printData.checkDate }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="storage">盘点仓库：<span>{{ printData.storage.name }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="print_person">制单人：<span>{{ printData.staff.name }}</span></p>
          </v-col>
          <v-col cols="8" class="pa-0">
            <p id="print_remark">备注：<span>{{ printData.remark }}</span></p>
          </v-col>
        </v-row>

      </div>
      <v-simple-table class="table-bordered text-center">
        <template v-slot:default>
          <thead>
          <tr>
            <th class="table-title" width="60">序号</th>
            <th class="table-title">材料编码</th>
            <th class="table-title">材料名称</th>
            <th class="table-title">规格</th>
            <th class="table-title">单位</th>
            <th class="table-title">实际数量</th>
            <th class="table-title">单价</th>
            <th class="table-title">金额</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(item,idx) in printData.materList"
              :key="item.id"
          >
            <td>{{ idx + 1 }}</td>
            <td>{{ formatId(item.material.id) }}</td>
            <td>{{ item.material.name }}</td>
            <td>{{ item.material.model }}</td>
            <td>{{ item.material.unit.name }}</td>
            <td>{{ item.realitySum }}</td>
            <td>{{ item.price.toFixed(2) }}</td>
            <td>{{ item.money.toFixed(2) }}</td>
          </tr>
          <tr>
            <td class="last-td" colspan="6" style="text-align: left;">金额合计：<span>{{ upperMoney }}</span></td>
            <td class="last-td" colspan="3" style="text-align: left;">￥{{ taxMoney }}<span></span></td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>

    </div>
    <a ref="printBtn" v-print="printObj">打印</a>
  </div>
</template>

<script>

import {getAddress} from "@/utils/printBase";

export default {
  name: "checkPrint",
  data: () => ({
    printObj: {
      id: "printCon",
      popTitle: '打印',
      extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
    },
    upperMoney: '',
    taxMoney: 0,
    signImg: null,
    putSeries: null,
    baseAddress: {
      title: null,
      fax: null,
      tel: null
    }
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
    "printData.materList": {
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
    setCount() {
      let taxMoney = 0
      this.printData.materList.forEach(item => {
        taxMoney += item.money
      })
      this.upperMoney = this.parseUpperNum(taxMoney)
      this.taxMoney = taxMoney.toFixed(2)
    },
    print() {
      this.setCount()
      if (this.$refs.printBtn) {
        this.$refs.printBtn.click()
      } else {
        this.$nextTick(() => {
          this.$refs.printBtn.click()
        })
      }
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
}

.table-bordered tfoot > tr > td {
  border-bottom: 1px solid black !important;
}

.table-bordered thead > tr > th:last-child,
.table-bordered tbody > tr > td:last-child,
.table-bordered tfoot > tr > td:last-child {
  border-right: 1px solid black !important;
}

.last-td{
  border-bottom: 1px solid black;
}
</style>
