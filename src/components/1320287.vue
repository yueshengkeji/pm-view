<template>
  <v-container>
    <v-form ref="entertainForm">

      <v-toolbar flat>
        <v-toolbar-title>租赁信息
          <v-btn right outlined small absolute :to="`/zj/form/insert/${frameId.replace('-zujin','')}`"
                 target="_blank">
            修改
          </v-btn>
        </v-toolbar-title>
      </v-toolbar>
      <v-row>
        <!--            <v-col sm="1">-->
        <!--              <v-text-field type="number" dense label="应收租金" :rules="rules.yearRental"-->
        <!--                v-model="data.yearRental"></v-text-field>-->
        <!--            </v-col>-->
        <v-col sm="2">
          <v-select dense :items="payTypes" label="付租方式" v-model="data.payType"></v-select>
        </v-col>
        <v-col sm="2">
          <v-text-field v-model="data.startDatetime" label="合同开始日期" dense hide-details
                        readonly></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field v-model="data.endDatetime" label="截止日期" dense hide-details
                        readonly></v-text-field>
        </v-col>


        <v-col sm="2">
          <v-text-field v-model="data.planDate" label="计划进场日期" dense
                        hide-details
                        readonly></v-text-field>
        </v-col>

        <v-col sm="2">
          <v-text-field v-model="data.openDate" label="开业日期" dense hide-details
                        readonly></v-text-field>
        </v-col>

        <v-col sm="1">
          <v-text-field label="装修期（天）" v-model="data.dayNum" dense></v-text-field>
        </v-col>
        <v-col sm="1">
          <v-text-field dense label="招商经办人" v-model="data.staffName"></v-text-field>
        </v-col>

        <v-col sm="2">
          <v-radio-group dense v-model="data.zlType" style="margin-top: -30px;">
            <v-radio :value="0" label="固定商铺"></v-radio>
            <v-radio :value="1" label="机动" @click="$refs.acreage.focus()"></v-radio>
          </v-radio-group>
        </v-col>

        <v-col sm="2">
          <v-autocomplete :items="houseList" dense multiple v-model="data.houses"
                          :disabled="data.zlType === 1"
                          return-object
                          item-value="id" item-text="temp" auto-select-first placeholder="请选择商铺位置"
                          title="支持多选，可输入商铺/楼层编号筛选"
                          append-icon="mdi-map-marker" label="商铺位置">
          </v-autocomplete>
        </v-col>

        <v-col sm="2">
          <v-text-field type="number" label="租赁面积" dense ref="acreage"
                        v-model="data.acreage"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field label="预设租金" dense v-model="housesPrice"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-text-field dense rows="1" label="备注" v-model="data.remark"></v-text-field>
        </v-col>

      </v-row>

      <v-toolbar flat>
        <v-toolbar-title>商户信息</v-toolbar-title>
      </v-toolbar>
      <v-row>

        <v-col sm="2">
          <v-text-field dense label="商户名称" v-model="data.brandCompany.name"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="品牌" v-model="data.brand"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-select dense
                    label="业态"
                    placeholder="请选择业态"
                    v-model="data.yt"
                    :items="yitaiItems"
                    item-text="name"
                    return-object></v-select>
        </v-col>
        <v-col sm="2">
          <v-text-field label="银行账号" dense v-model="data.brandCompany.bankNumber"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field label="开户行" dense v-model="data.brandCompany.openAccount"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="联系人" v-model="data.brandCompany.relationP"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="联系手机号" v-model="data.brandCompany.telephoneP"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-select dense
                    label="发票类型"
                    placeholder="请选择发票类型"
                    v-model="data.billType"
                    return-object></v-select>
        </v-col>
        <v-col sm="4">
          <v-text-field dense label="发票地址" v-model="data.brandCompany.address"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-text-field dense label="纳税人识别号" v-model="data.brandCompany.taxNumber"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field v-model="data.signDate"
                        label="合同签署日期" dense hide-details
                        readonly></v-text-field>
        </v-col>
        <v-col sm="3">
          <v-text-field dense label="承租方证照名称" v-model="data.certificateName"></v-text-field>
        </v-col>
        <v-col sm="3">
          <v-text-field dense label="承租方证照号码" v-model="data.certificateCode"></v-text-field>
        </v-col>
      </v-row>

      <v-row class="mr-0">
        <v-col cols="12">
          <v-tabs v-model="tab">
            <v-tab key="zl">租赁条款</v-tab>
            <v-tab key="bzj">保证金条款</v-tab>
              <v-tab key="tgf">推广费条款</v-tab>
          </v-tabs>
        </v-col>
        <v-col cols="12">
          <v-tabs-items v-model="tab">
            <v-tab-item key="zl">
              <v-data-table :items.sync="zlItems" :headers="headers" hide-default-footer
                            :items-per-page="-1">
                <template v-slot:item.type="{item}">
                  {{ formatMoneyType(item) }}
                </template>
                <template v-slot:item.unit="{item}">
                  {{ formatUnitType(item) }}
                </template>
                <template v-slot:item.payCycle="{item}">
                  {{ formatCycleItems(item) }}
                </template>
                <template v-slot:item.monthBill="{item}">
                  {{ item.monthBill ? '是' : '否' }}
                </template>
                <template v-slot:item.payType="{item}">
                  {{ formatPayType(item) }}
                </template>
                <template v-slot:item.priceType="{item}">
                  <div class="text-truncate">{{ formatPriceType(item) }}</div>
                </template>
                <template v-slot:item.money="{item}">
                  <div v-if="item.name == '租金' && item.money < parseFloat(housesPrice)"
                       class="red--text">{{ item.money }}
                  </div>
                  <div v-else-if="item.name == '租金' && item.money > parseFloat(housesPrice)"
                       class="green--text">{{ item.money }}
                  </div>
                  <div v-else>{{ item.money }}</div>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="bzj">
              <v-data-table :items.sync="bzjItems" :headers="bzjHeader" hide-default-footer
                            :items-per-page="-1">

              </v-data-table>
            </v-tab-item>
              <v-tab-item key="tgf">
                  <v-data-table :items.sync="tgfItems" :headers="tgfHeader" hide-default-footer
                                :items-per-page="-1">
                  </v-data-table>
              </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>

      <v-row>
        <div>
          <v-btn @click="showContract = true">合同预览</v-btn>
          <v-btn @click="previewBillHandler" class="ml-1">账单预览</v-btn>
          <v-dialog v-model="showContract" width="50%">
            <iframe :srcdoc="richText" width="50%" height="800px" style="background-color: white"></iframe>
          </v-dialog>

          <v-dialog v-model="previewBillDialog" width="50%">
            <bill-preview :concat-id="data.id"></bill-preview>
          </v-dialog>
        </div>
      </v-row>
    </v-form>
  </v-container>
</template>
<script>
import {queryById} from "../api/zujin";
import {selectContractWordRecordByContractId} from "../api/contractWordModel";
import BillPreview from "@/views/zj/bill/preview.vue";

export default {
  name: '1320287',
  components: {BillPreview},
  props: {
    frameId: String
  },
  data: () => ({
    previewBillDialog: false,
    housesPrice: 0,
    showContract: false,
    zlItems: [],
    bzjItems: [],
    headers: [
      {value: 'name', text: '费用名称'},
      {value: 'startDate', text: '开始日期', width: '115px'},
      {value: 'endDate', text: '截止日期', width: '115px'},
      {value: 'unit', text: '计费单位'},
      {value: 'money', text: '金额'},
      {value: 'payCycle', text: '支付周期'},
      {value: 'payDay', text: '缴款日'},
      {value: 'firstStartDate', text: '首期开始日期', width: '115px'},
      {value: 'firstEndDate', text: '首期截止日期', width: '115px'},
      {value: 'firstMoney', text: '首期金额'},
      {value: 'priceType', text: '计价方式'},
    ],
    bzjHeader: [
      {value: 'type', text: '费用名称'},
      {value: 'startDate', text: '开始日期'},
      {value: 'datetime', text: '截止日期'},
      {value: 'endDate', text: '截止缴费日期'},
      {value: 'money', text: '应收金额'},
      {value: 'remark', text: '备注'},
    ],
    tab: 0,
    data: {
      id: null,
      series: null,
      company: null,
      brandCompany: {name: null},
      brand: null,
      payType: 0,
      acreage: 0,
      zl_person: null,
      zl_person_tel: null,
      yt: {id: null, name: null},
      staffName: null,
      dz: null,
      sh: null,
      remark: null,
      houses: [],
      zlType: 0,
      dzNumber: 0,
      zlPerson: null,
      zlPersonTel: null,
      billOwe: {oweMoney: 0},
      moneyOwe: {oweMoney: 0},
      djYsMoney: 0,
      yearRental: null,
      endDatetime: null,
      kjType: [{money: 0}],
      type: 0,
      signDate: null,
      certificateName: null,
      certificateCode: null
    },
    payTypes: [
      {text: '年付方式', value: 0},
      {text: '季度方式', value: 1},
      {text: '月付方式', value: 2},
      {text: '双月付', value: 3},
      {text: '其他', value: 4},
    ],
    typeItems: [
      {name: '租赁合同', id: 0, active: false},
      {name: '物管合同', id: 1, active: false},
    ],
    houseList: [],
    yitaiItems: [],
    richText: '',
    unitItems: [
      {value: 'month', text: '每月'},
      {value: 'one', text: '一次性付费'},
      {value: 'year', text: '每年'},
    ],
    cycleItems: [
      {value: 'month', text: '月付'},
      {value: 'towMonth', text: '两月付'},
      {value: 'quarter', text: '季付'},
      {value: 'halfYear', text: '半年付'},
      {value: 'year', text: '年付'},
      {value: 'one', text: '一次性付清'},
      {value: 'final', text: '固定扣点'},
    ],
    payTypeItems: [
      {value: 'day', text: '固定日期'},
    ],
    priceItems: [
      {value: 'area', text: '按面积单价'},
    ],
      tgfItems: [],
      tgfHeader: [
          {value: 'name', text: '费用名称'},
          {value: 'price', text: '单价(元/次)'},
          {value: 'times', text: '推广次数'},
          {value: 'money', text: '推广费用'},
          {value: 'voucher', text: '抵用券'},
          {value: 'liquidatedDamages', text: '违约金'},
          {value: 'firstBar', text: '头条单价(元/次)'},
          {value: 'secondBar', text: '次条单价(元/次)'},
          {value: 'otherBar', text: '其他单价(元/次)'},
          {value: 'payEndDate', text: '截止缴费日期'},
      ],
  }),

  watch: {
    frameId: {
      handler() {
        if (this.frameId != null) {
          this.id = this.frameId
          this.selectById()
        }
      }
    },

  },

  created() {
    this.id = this.frameId
    this.selectById()
  },

  methods: {
    previewBillHandler() {
      this.previewBillDialog = true
    },
    formatMoneyType(item) {
      let result = ''
      this.typeItems.forEach(val => {
        if (val.value == item.type) {
          result = val.text
        }
      })
      return result
    },
    formatUnitType(item) {
      let result = ''
      this.unitItems.forEach(val => {
        if (val.value == item.unit) {
          result = val.text
        }
      })
      return result
    },
    formatCycleItems(item) {
      let result = ''
      this.cycleItems.forEach(val => {
        if (val.value == item.payCycle) {
          result = val.text
        }
      })
      return result
    },
    formatPayType(item) {
      let result = ''
      this.payTypeItems.forEach(val => {
        if (val.value == item.payType) {
          result = val.text
        }
      })
      return result
    },
    formatPriceType(item) {
      let result = ''
      this.priceItems.forEach(val => {
        if (val.value == item.priceType) {
          result = val.text
        }
      })
      return result
    },
    initData(data) {

      let tempPrice = 0
      data.houses.forEach(item => {
        item.temp = item.pwNumber + ":" + item.acreage
        if (item.money && item.acreage) {
          tempPrice += item.money * item.acreage
        }
      })
      this.housesPrice = tempPrice.toFixed(2)

        this.tgfItems = data.tgfList
      this.bzjItems = data.bzjList
      this.zlItems = data.termList
      this.houseList = data.houses
      this.yitaiItems.push(data.yt)
    },

    resetData() {
      this.data = {
        series: null,
        company: null,
        brand: null,
        payType: 0,
        acreage: 0,
        zl_person: null,
        zl_person_tel: null,
        yt: {id: null, name: null},
        staffName: this.$store.state.user.name,
        dz: null,
        sh: null,
        remark: null,
        houses: [],
        zlType: 0,
        dzNumber: 0,
        zlPerson: null,
        zlPersonTel: null,
        billOwe: {oweMoney: 0},
        moneyOwe: {oweMoney: 0},
        djYsMoney: 0,
        yearRental: null,
        endDatetime: null,
        kjType: [{money: 0}],
        type: 0,
        signDate: null,
        certificateName: null,
        certificateCode: null
      }
    },

    selectById() {
      queryById((this.id + "").replaceAll("-zujin", "")).then(res => {
        this.initData(res)
        this.data = res
        this.loadHtml(this.data.id)
      })

    },

    loadHtml(contractId) {
      selectContractWordRecordByContractId({contractId: contractId}).then(result => {
        if (result != null) {
          this.richText = result.richText
        }

      })
    }
  }
}
</script>
<style>
</style>
