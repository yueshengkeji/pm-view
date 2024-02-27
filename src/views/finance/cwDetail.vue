<template>
  <div>
    <v-data-table :loading="loading"
                  class="cursor border-table"
                  @click:row="editDetailItem2"
                  calculate-widths
                  dense
                  hide-default-footer
                  height='450'
                  :items-per-page="-1"
                  :items="cwMoneyItems">
      <template v-slot:top>
        <v-btn v-if="data.id != null && !offEdit"
               class="mr-1"
               x-small
               color="primary"
               @click="newLine2(cwMoneyItems)"
               :disabled="offInsert || !permission">
          财务登记
        </v-btn>
        <v-btn class="mr-1" x-small color="primary" @click="t3Handler">
          用友T3数据
        </v-btn>
        <v-btn v-if="data.id != null && !offEdit" x-small color="primary"
               class="mr-1"
               @click="newLine3(billItems)"
               :disabled="offInsert || !permission">
          会计科目
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn v-if="detailItem.edit && !offEdit" :disabled="!offInsert" :loading="saveLoading"
               x-small
               class="mr-1"
               color="primary" @click.stop="savePay">保存
        </v-btn>
        <v-btn v-if="detailItem.edit && !offEdit" :disabled="!offInsert" :loading="saveLoading"
               x-small
               color="error" @click.stop="cancelInsert">取消
        </v-btn>
      </template>
      <template v-slot:body>
        <thead>
        <tr>
          <template v-for="(headerItem1, idx1) in headers3">
            <th :colspan="headerItem1.colspan"
                :width="headerItem1.width"
                class="text-center"
                :key="'header1'+idx1" :style="{ textAlign: headerItem1.align }">
              {{ headerItem1.text }}
            </th>
          </template>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item , idx) in cwMoneyItems" :key="'tbody'+idx">
          <td @click="editDetailItem2('payDate',item)" width="30%">
            <v-text-field v-model="item.payDate"
                          v-if="!offEdit && item.edit"
                          @keydown.enter="savePay"
                          title="收款日期"
                          :ref="item.id+'payDate'"
                          class="pa-0 mt-0"
                          autofocus
                          dense
                          hide-details></v-text-field>
            <div v-if="!offEdit && !item.edit">{{ item.payDate }}</div>
            <div v-if="offEdit">{{ item.payDate }}</div>
          </td>
          <td @click="editDetailItem('payMoney',item)" width="20%">
            <v-text-field class="pa-0 mt-0"
                          :ref="item.id+'payMoney'"
                          @keydown.enter="savePay"
                          hide-details
                          title="收款金额"
                          type="number"
                          v-if="!offEdit && item.edit"
                          v-model="item.payMoney"
                          dense></v-text-field>
            <div v-if="!offEdit && !item.edit">{{ item.payMoney }}</div>
            <div v-if="offEdit">{{ item.payMoney }}</div>
          </td>
          <td @click="editDetailItem2('proDate',item)" width="30%">
            <v-text-field v-model="item.billDate"
                          title="开票日期"
                          :ref="item.id+'proDate'"
                          @keydown.enter="savePay"
                          v-if="!offEdit && item.edit"
                          class="pa-0 mt-0"
                          autofocus
                          dense
                          hide-details></v-text-field>
            <div v-if="!offEdit && !item.edit" @click.stop="editDetailItem('proDate',item)">
              {{ item.billDate }}
            </div>
            <div v-if="offEdit">{{ item.billDate }}</div>

          </td>
          <td @click="editDetailItem('billMoney',item)" width="20%">
            <v-text-field class="pa-0 mt-0"
                          :ref="item.id+'billMoney'"
                          @keydown.enter="savePay"
                          hide-details
                          v-if="!offEdit && item.edit"
                          title="收票金额"
                          type="number"
                          v-model="item.billMoney"
                          dense></v-text-field>
            <div v-if="!offEdit && !item.edit">{{ item.billMoney }}</div>
            <div v-if="offEdit">{{ item.billMoney }}</div>
          </td>
        </tr>
        </tbody>
        <tfoot>
        <!--                合计-->
        <tr>
          <td class="border-top">合计</td>
          <td class="border-top">{{ payCount }}</td>
          <td class="border-top"></td>
          <td class="border-top">{{ billCount }}</td>
        </tr>
        <!--                会计科目-->
        <tr v-for="(billItem,idx) in billItems" :key="'tfoot'+idx">
          <td class="border-top">
            <div>账面欠款</div>
          </td>
          <td class="border-top" colspan="2" @click="editDetailItem2('series',billItem)">
            <div style="width:150px">
              <v-text-field v-if="!offEdit && billItem.edit"
                            @blur="saveBillItems(billItem)"
                            hide-details
                            dense
                            :ref="billItem.id+'series'"
                            placeholder="请输入科目名称"
                            v-model="billItem.series"></v-text-field>
              <div v-if="!offEdit && !billItem.edit">{{ billItem.series }}</div>
              <div v-if="offEdit">{{ billItem.series }}</div>
            </div>
          </td>
          <td class="border-top" style="background-color: rgba(190,160,199,1)"
              @click="editDetailItem2('money',billItem)">
            <div style="width: 150px">
              <v-text-field v-if="!offEdit && billItem.edit"
                            @blur="saveBillItems(billItem)"
                            hide-details
                            dense
                            :ref="billItem.id+'money'"
                            v-model="billItem.money"></v-text-field>
              <div v-if="!offEdit && !billItem.edit">{{ getZmMoney(billItem) }}</div>
              <div v-if="offEdit">{{ getZmMoney(billItem) }}</div>
            </div>
          </td>
        </tr>
        <!--实际欠款-->
        <tr>
          <td class="border-top">
            <div>实际欠款</div>
          </td>
          <td class="border-top" colspan="2"
              :title="`计算公式：期初欠款${data.moneyOwe.oweMoney}+采购金额${data.yearPro.toFixed(2)}-财务付款合计${data.yetMoney}`">
            {{ cwPayMoney }}
          </td>
          <td class="border-top" style="background-color: rgba(141,180,226,1)"
              :title="`实际欠款:${cwPayMoney}-实际欠票:${cwBillMoney}`">
            <div style="width: 150px">
              <div>{{ cwPayMoney - cwBillMoney }}</div>
            </div>
          </td>
        </tr>
        <!--欠票金额-->
        <tr :title="`计算公式：期初欠票${data.billOwe.oweMoney}+采购合计${data.yearPro.toFixed(2)}-财务收票合计${data.billMoney}`">
          <td class="border-top">
            <div>欠票金额</div>
          </td>
          <td class="border-top" colspan="2">
            {{ cwBillMoney }}
          </td>
          <td class="border-top" title="data.oweBillMoney" style="background-color: rgba(218,150,248,1)">
            <!--                        <div style="width: 150px">-->
            <!--                            <v-text-field v-if="data.edit"-->
            <!--                                          :ref="'oweBillMoney'+data.id"-->
            <!--                                          dense-->
            <!--                                          hide-details-->
            <!--                                          v-model="data.oweBillMoney"-->
            <!--                                          @blur="changeDataHandler"></v-text-field>-->
            <!--                            <div v-else @click="editDataHandler('oweBillMoney')">{{data.oweBillMoney}}</div>-->
            <!--                        </div>-->
          </td>
        </tr>
        </tfoot>
      </template>
    </v-data-table>
    <v-dialog width="60%" v-model="t3Dialog">
      <v-card class="pa-3">
        <t3-data ref="t3Data"
                 :permission="permission"
                 :cwMoneyItems="cwMoneyItems" :dataYear="t3Year" :series="series"
                 @onclick="t3DataHeader"></t3-data>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {insertPay, list, updatePay} from '@/api/proDetailPay'
import {insert, update} from '@/api/proDetailMoney'
import {updateBillMoney} from '@/api/proDetail'

export default {
  name: "cwDetail",
  components: {
    t3Data: () => import('@/components/t3/t3DataByPay')
  },
  data: () => ({
    loading: false,
    cwMoneyItems: [],
    data: null,
    offEdit: false,
    detailItem: {
      edit: false,
      billDate: "",
      billMoney: 0,
      payDate: "",
      payMoney: 0,
    },
    offInsert: false,
    billItems: [],
    saveLoading: false,
    headers3: [
      {text: '付款情况', value: 'payMoney', colspan: 2, width: '50%'},
      {text: '收票情况', value: 'billMoney', colspan: 2, width: '50%'},
    ],
    payCount: 0,
    billCount: 0,
    cwBillMoney: 0,
    cwPayMoney: 0,
    t3Dialog: false,
    t3Year: null,
    series: []
  }),
  watch: {
    cwPayMoney() {
      this.data.endOwe = this.cwPayMoney
    },
    cwBillMoney() {
      this.data.oweBillMoney = this.cwBillMoney
    },
    payCount() {
      this.data.yetMoney = this.payCount
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true
    },
    item: {
      handler() {
        if (this.item && this.item.id && this.item.id != this.data.id) {
          this.data = Object.assign({}, this.item)
          this.list()
        }
      }
    },
    "item.yearPro": {
      handler() {
        this.data.yearPro = this.item.yearPro
      }
    }
  },
  props: {
    item: null,
    permission: {
      type: Boolean,
      default: false
    }
  },
  created() {
    if (this.item) {
      this.data = Object.assign({}, this.item)
    }
    this.list()
  },
  methods: {
    t3Handler() {
      this.series = []
      if (this.billItems != null && this.billItems.length > 0) {
        this.billItems.forEach(item => {
          let s = parseInt(item.series)
          if (!isNaN(s)) {
            this.series.push(s + "")
          }
        })
      }
      this.t3Year = this.data.year + ""
      this.t3Dialog = true
    },
    t3DataHeader(item) {
      console.log("T3数据操作", item)
      let lastItem
      if (this.cwMoneyItems && this.cwMoneyItems.length > 0) {
        lastItem = this.cwMoneyItems[this.cwMoneyItems.length - 1]
      }
      if (lastItem) {
        if (item.type == 1 && (lastItem.billMoney == "" || lastItem.billMoney == "0")) {
          //收票登记更新
          lastItem.billMoney = item.billMoney
          lastItem.billDate = item.billDate
          this.savePay()
        } else if (lastItem.payMoney == "" || lastItem.payMoney == "0") {
          //付款登记更新
          lastItem.payMoney = item.payMoney
          lastItem.payDate = item.payDate
          this.savePay()
        } else {
          //新增登记
          lastItem = item
          lastItem.mainId = this.data.id
          insertPay(lastItem).finally(() => {
            this.saveLoading = false
            this.offInsert = false
            this.list()
            if(this.$refs.t3Data){
              this.$refs.t3Data.list()
            }
          })
        }
      } else {
        //新增登记
        lastItem = item
        lastItem.mainId = this.data.id
        insertPay(lastItem).finally(() => {
          this.saveLoading = false
          this.offInsert = false
          this.list()
          if(this.$refs.t3Data){
            this.$refs.t3Data.list()
          }
        })
      }
    },
    getZmMoney(billItem) {
      try {
        return billItem.money.toFixed(2)
      } catch (e) {
        return billItem.money;
      }
    },
    editDetailItem2(event, item) {
      this.editDetailItem(event, item)
    },
    newLine2(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        index: data.length + 1,
        billDate: "",
        billMoney: 0,
        payDate: "",
        payMoney: 0,
      }
      data.push(this.detailItem)
      this.offInsert = true
    },
    newLine3(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        money: 0,
        remark: '系统备注',
        series: ''
      }
      data.push(this.detailItem)
      this.offInsert = true
    },
    savePay() {
      this.saveLoading = true
      /*
      收票、收款保存
       */
      let size = this.cwMoneyItems.length
      let than = this
      let count = 0
      for (let i = 0; i < size; i++) {
        let detailItem = than.cwMoneyItems[i]
        if (detailItem.id != null) {
          updatePay(detailItem).finally(() => {
            count++
          })
        } else {
          insertPay(detailItem).finally(() => {
            count++
          })
        }
      }
      /*
      会计科目保存
       */

      let timeout = window.setInterval(() => {
        if (count === size) {
          than.saveLoading = false
          than.offInsert = false
          this.list()
          if(this.$refs.t3Data){
            this.$refs.t3Data.list()
          }
          window.clearInterval(timeout)
        }
      }, 1000);
    },
    saveBillItems(billItem) {
      if (billItem.remark == null) {
        billItem.remark = ''
      }
      let request
      if (billItem.id) {
        request = update(billItem)
      } else {
        request = insert(billItem).then(result => {
          if (result && result.id) {
            billItem.id = result.id
          }
        })
      }
      request.finally(() => {
        this.offInsert = false
        billItem.edit = false
      })
      /*this.billItems.length
      for (let x = 0; x < this.billItems.length; x++) {
          let item = this.billItems[x]
          item.remark = ""
          if (item.id != null) {
              update(item)
          } else {
              insert(item)
          }
      }*/
    },
    cancelInsert() {
      if (this.detailItem.id == null) {
        this.ysMoneyItems.splice(this.detailItem.index, 1)
      }
      this.offInsert = false
      this.list()
    },
    list() {
      if (this.item) {
        this.billItems = this.item.subject
        this.loading = true
        list(this.item.id).then(result => {
          this.cwMoneyItems = result
          this.setCount()
        }).finally(() => {
          this.setPayMoney()
          this.setBillMoneyCount()
          this.loading = false
          this.$emit("change", this.data)
        })
      }
    },
    setPayMoney() {
      console.log("setPayMoney", this.item.moneyOwe.oweMoney, this.item.yearPro, this.item.yetMoney)
      let result = parseFloat(this.floatAdd(this.item.moneyOwe.oweMoney, this.item.yearPro))
      result = parseFloat(this.floatSub(result, this.item.yetMoney))
      result = isNaN(result) ? 0 : result;
      this.cwPayMoney = result.toFixed(2)
    },
    setBillMoneyCount() {
      let result = parseFloat(this.floatAdd(this.item.billOwe.oweMoney, this.item.yearPro))
      result = parseFloat(this.floatSub(result, this.item.billMoney))
      result = isNaN(result) ? 0 : result;
      this.cwBillMoney = result.toFixed(2)
    },
    setCount() {
      this.payCount = 0
      this.billCount = 0
      this.cwMoneyItems.forEach(item => {
        item.edit = false
        if (item.payMoney != null) {
          this.payCount += item.payMoney
        }
        if (item.billMoney != null) {
          this.billCount += item.billMoney
        }
      })
      this.data.yetMoney = this.payCount
      this.data.billMoney = this.billCount
    },
    editDetailItem(event, param) {
      if (this.permission) {
        if (this.offInsert) {
          let isRequest = true
          if (this.detailItem.id === (event.id || param.id)) {
            isRequest = false
          }
          if (this.detailItem.id != null && isRequest) {
            this.detailItem.edit = false
            // getById(this.detailItem.id).then(detail => {
            //     detail.edit = false
            //     this.detailItem.proDate = detail.proDate
            //     this.detailItem.proMoney = detail.proMoney
            //     this.detailItem.putMoney = detail.putMoney
            //     this.detailItem.putDate = detail.putDate
            //     this.detailItem.remark = detail.remark
            // }).finally(() => {
            //     this.openEdit(event, param)
            // })
            this.openEdit(event, param)
          } else if (isRequest) {
            this.ysMoneyItems.splice(this.detailItem.index, 1)
            this.openEdit(event, param)
          }

        } else {
          this.openEdit(event, param)
        }
      }
    },
    openEdit(event, param) {
      if (param.edit == null) {
        this.$set(param, 'edit', false)
      }
      if (event.id == null) {
        window.setTimeout(() => {
          let temp
          if (this.$refs[param.id + event] instanceof Array) {
            temp = this.$refs[param.id + event][0]
          } else {
            temp = this.$refs[param.id + event]
          }
          temp.focus()
          temp.$refs.input.select()
        }, 100)
        this.detailItem = param
      } else {
        this.detailItem = param.item
      }
      this.detailItem.edit = true
      this.offInsert = true
    },
    changeDataHandler() {
      updateBillMoney(this.data).then(result => {
        this.$emit("change", result)
        this.data.edit = false
      })
    },
  }
}
</script>

<style scoped>

</style>