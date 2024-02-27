<template>
  <div>
    <div id="printCon">
      <div class="no-padding">
        <div class="text-center">
          <p class="text-h4">材料出库单</p>
          <p class="text-h6">公司地址：{{ baseAddress.title }}</p>
          <h6 class="text-h6">{{ "FAX：" + baseAddress.fax + "&nbsp;&nbsp;TEL：" + baseAddress.tel }}</h6>
          <img v-if="signImg"
               @load="loadHandler"
               ref="signImg"
               :src="signImg"
               :style="{width:imgWidth}"
               style="position: absolute;top:-20px;left:-10px;"/>
          <!--                    <img :src="printData.sign." id="sign-img-print" style="width:100%;position: absolute;top:0;"/>-->
        </div>
        <v-row dense>
          <v-col cols="4" class="pa-0">
            <p>出库单编号：<span>{{ printData.outNumber }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p class="">
              出库日期：<span>{{ printData.outDate }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="storage">发出仓库：<span>{{ printData.storage.name }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="company_print">领料单位：<span>{{ printData.company.name }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="print_data">项目：<span>{{ printData.project.name }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p id="print_person">领料人：<span>{{ printData.outPerson.name }}</span></p>
          </v-col>
          <v-col cols="8" class="pa-0">
            <p id="print_remark">备注：<span>{{ printData.remark }}</span></p>
          </v-col>
          <v-col cols="4" class="pa-0">
            <p>入库单编号：{{ putSeries }}</p>
          </v-col>
        </v-row>

      </div>
      <div class="v-data-table table-bordered text-center blank--text theme--light">
        <div class="v-data-table__wrapper" style="padding-right: 45px;">
          <table class="print-table">
            <thead>
            <tr>
              <th class="table-title" style="width: 35px" >序号</th>
              <th class="table-title" style="width: 125px">材料编码</th>
              <th class="table-title" style="width: 135px">材料名称</th>
              <th class="table-title" style="width: 120px">规格</th>
              <th class="table-title" style="width: 40px" >单位</th>
              <th class="table-title" style="width: 50px" >数量</th>
              <th class="table-title" style="width: 50px" >单价</th>
              <th class="table-title" style="width: 65px" >金额</th>
              <th class="table-title" style="width: 40px">税率</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(item,idx) in printData.materOuts"
                :key="item.id"
            >
              <td>{{ idx + 1 }}</td>
              <td>{{ formatId(item) }}</td>
              <td>{{ item.material.name }}</td>
              <td>{{ item.material.model }}</td>
              <td>{{ item.material.unit.name }}</td>
              <td>{{ item.sum }}</td>
              <td>{{ item.taxPrice.toFixed(2) }}</td>
              <td>{{ item.taxMoney.toFixed(2) }}</td>
              <td>{{ parseInt(item.tax) }}</td>
            </tr>
            <tr>
              <td class="last-td" colspan="6" style="text-align: left;">金额合计：<span>{{ upperMoney }}</span></td>
              <td class="last-td" colspan="3" style="text-align: left;">￥{{ taxMoney }}<span></span></td>
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
import {queryByPutMaterId, getByProId} from '@/api/proSign'
import {getAddress} from "@/utils/printBase";

export default {
  name: "outPrint",
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
    imgWidth: 'auto',
    baseAddress: {
      title: null,
      fax: null,
      tel: null
    },
    imgLoad: true,
  }),
  props: {
    printData: Object,
    hidePmNumber: Boolean
  },
  created() {
    getAddress().then(result => {
      this.baseAddress = result
    })
  },
  watch: {
    printData: {
      handler() {

      }
    },
    "printData.materOuts": {
      handler() {
        this.setCount()
      },
      deep: true
    }
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
      window.setTimeout(() => {
        this.imgLoad = true
      }, 50)
    },
    loadSignPrint(materOuts) {
      let putMaterIds = ''
      materOuts.forEach(item => {
        if (item.putMaterId && item.putMaterId != '') {
          putMaterIds += item.putMaterId + ","
        }
      })
      this.signImg = null
      getByProId(this.printData.id).then((result) => {
        if (result) {
          this.signImg = result.signImg
          window.setTimeout(() => {
            this.print()
          }, 100)
        } else {
          this.loadPutSign(putMaterIds)
        }
      }).catch(() => {
        this.loadPutSign(putMaterIds)
      })
    },
    loadPutSign(putMaterIds) {
      queryByPutMaterId(putMaterIds).then(result => {
        if (result.length >= 1) {
          for (let property in result) {
            if (property == "length") {
              continue;
            }
            this.signImg = result[property].signImg
            this.putSeries = JSON.parse(result[property].putobj).putSerial
          }
        }
      }).finally(() => {
        window.setTimeout(() => {
          this.print()
        }, 100)
      })
    },
    setCount() {
      let taxMoney = 0
      this.printData.materOuts.forEach(item => {
        taxMoney += item.taxMoney
      })
      this.upperMoney = this.parseUpperNum(taxMoney)
      this.taxMoney = taxMoney.toFixed(2)
    },
    formatId(item) {
      let id = item.material.id
      let x = id.indexOf("-");
      return id.substring(1, x === -1 ? id.length : x)
    },
    print() {
      // if (this.$refs.printBtn) {
      //   this.$refs.printBtn.click()
      // } else {
      //   this.$nextTick(() => {
      //     this.$refs.printBtn.click()
      //   })
      // }
      let timeout = window.setInterval(() => {
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
