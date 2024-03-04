<template>
  <v-card class="pa-3">
    <v-form ref="zujinForm" class="pt-5">
      <v-toolbar flat>
        <v-toolbar-title>租赁信息</v-toolbar-title>
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
          <v-menu v-model="menu6" transition="scale-transition" offset-y :close-on-content-click="false"
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="data.startDatetime"
                            :rules="rules.startDatetime" label="合同开始日期" dense hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.startDatetime" no-title scrollable></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="2">
          <v-menu v-model="menu4" transition="scale-transition" offset-y :close-on-content-click="false"
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="data.endDatetime" :rules="rules.endDatetime" label="截止日期" dense hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.endDatetime" no-title scrollable></v-date-picker>
          </v-menu>
        </v-col>


        <v-col sm="2">
          <v-menu v-model="menu7" transition="scale-transition" offset-y
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="data.planDate" :rules="rules.planDate" label="计划进场日期" dense
                            hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.planDate" no-title scrollable></v-date-picker>
          </v-menu>
        </v-col>

        <v-col sm="2">
          <v-menu v-model="menu8" transition="scale-transition" offset-y
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="data.openDate" :rules="rules.openDate" label="开业日期" dense hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.openDate" no-title scrollable></v-date-picker>
          </v-menu>
        </v-col>

        <v-col sm="1">
          <v-text-field label="装修期（天）" v-model="data.dayNum" dense></v-text-field>
        </v-col>
        <v-col sm="1">
          <v-text-field dense label="招商经办人" v-model="data.staffName"></v-text-field>
        </v-col>

        <v-col sm="2">
          <v-radio-group dense v-model="data.zlType" @change="houseSelect" style="margin-top: -30px;">
            <v-radio :value="0" label="固定商铺"></v-radio>
            <v-radio :value="1" label="机动" @click="$refs.acreage.focus()"></v-radio>
          </v-radio-group>
        </v-col>

        <v-col sm="2">
          <v-autocomplete :items="houseList" dense multiple v-model="data.houses" :search-input.sync="searchHouse"
                          :disabled="data.zlType === 1" :error-messages="houseMessage" @change="houseChange"
                          return-object
                          item-value="id" item-text="temp" auto-select-first placeholder="请选择商铺位置"
                          title="支持多选，可输入商铺/楼层编号筛选"
                          append-icon="mdi-map-marker" @click:append="openMap" label="商铺位置">
          </v-autocomplete>
        </v-col>

        <v-col sm="2">
          <v-text-field type="number" label="租赁面积" dense ref="acreage" :error-messages="acreageMessage"
                        @change="acreageMessage = null" v-model="data.acreage"></v-text-field>
        </v-col>

        <v-col sm="4">
          <v-text-field dense rows="1" label="备注" v-model="data.remark"></v-text-field>
        </v-col>
        <v-col sm="2">
          <select-company :error="receivedError" v-model="data.receivedCompany" label="收款账户*"></select-company>
        </v-col>

      </v-row>

      <v-toolbar flat>
        <v-toolbar-title>商户信息</v-toolbar-title>
      </v-toolbar>
      <v-row>

        <v-col sm="2">
          <v-text-field dense label="商户名称" :rules="rules.company" v-model="data.brandCompany.name"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="品牌" :rules="rules.brand" v-model="data.brand"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-select dense
                    label="业态"
                    placeholder="请选择业态"
                    v-model="data.yt"
                    :items="yitaiItems"
                    item-text="name"
                    :rules="rules.yt"
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
                    :items="billTypes"
                    return-object></v-select>
        </v-col>
        <v-col sm="4">
          <v-text-field dense label="发票地址" v-model="data.brandCompany.address"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-text-field dense label="纳税人识别号" v-model="data.brandCompany.taxNumber"></v-text-field>
        </v-col>
      </v-row>

      <v-row class="mr-0">
        <v-col cols="12">
          <v-tabs v-model="tab">
            <v-tab key="zl">租赁条款</v-tab>
            <v-tab key="bzj">保证金条款</v-tab>
          </v-tabs>
          <v-btn @click="insertMoneyHandler" small outlined absolute color="primary" right style="margin-top:-20px">
            新增
          </v-btn>
        </v-col>
        <v-col cols="12">
          <v-tabs-items v-model="tab">
            <v-tab-item key="zl">
              <v-data-table :items.sync="zlItems" :headers="headers" hide-default-footer :items-per-page="-1">
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
                  {{ item.monthBill ? '否' : '是' }}
                </template>
                <template v-slot:item.payType="{item}">
                  {{ formatPayType(item) }}
                </template>
                <template v-slot:item.priceType="{item}">
                  {{ formatPriceType(item) }}
                </template>
                <template v-slot:item.action="{item}">
                  <v-btn color="error" x-small outlined @click="editMoneyHandler(item)" class="mr-1">修改</v-btn>
                  <v-btn color="error" x-small outlined @click="deleteMoneyHandler(item)">删除</v-btn>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="bzj">
              <v-data-table :items.sync="bzjItems" :headers="bzjHeader" hide-default-footer :items-per-page="-1">
                <template v-slot:item.action="{item}">
                  <v-btn color="error" x-small outlined @click="deleteBzjHandler(item)">删除</v-btn>
                </template>
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-form>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-col sm="2" v-if="data.id == null">
        <easy-flow coding="1320287" dense ref="easyFlow" :default-flow-name="defaultFlow"></easy-flow>
      </v-col>
      <v-col sm="2" v-if="data.id == null">
        <file-upload ref="file" @change="fileChangeHandler"></file-upload>
      </v-col>
      <v-radio-group
          v-model="data.type"
          mandatory
          row
      >
        <v-radio label="租赁合同" :value="0"></v-radio>
        <v-radio label="物管合同" :value="1"></v-radio>
        <v-radio label="多经类" :value="2"></v-radio>
      </v-radio-group>
      <v-btn @click="printContractWord">打印</v-btn>
      <v-btn @click="insertZujin" color="primary" :loading="loading">确定</v-btn>
      <v-btn @click="saveData" :loading="loading">仅保存数据</v-btn>
      <v-btn @click="filesHandler">查看附件</v-btn>
      <v-btn @click="$emit('close')">取消</v-btn>
    </v-card-actions>

    <v-dialog width="50%" v-model="moneyTypeDialog">
      <v-card class="pa-3">
        <v-form ref="moneyForm">
          <v-row>
            <v-col cols="12">
              <v-combobox v-model="t.name" label="费用名称*" aria-required="true" :rules="rules.name"
                          :items="nameItems"></v-combobox>
            </v-col>
            <v-col cols="6">
              <v-menu v-model="menu" transition="scale-transition" offset-y
                      min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="t.startDate"
                                :rules="rules.startDate"
                                label="开始日期*"
                                readonly
                                v-bind="attrs"
                                v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="t.startDate" no-title scrollable></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu v-model="menu2" transition="scale-transition" offset-y
                      min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="t.endDate"
                                :rules="rules.endDate"
                                label="截止日期*"
                                readonly
                                v-bind="attrs"
                                v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="t.endDate" no-title scrollable></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="3">
              <v-select v-model="t.type" :items="typeItems" label="计费方式*"></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field type="number" v-model="t.money" label="金额*"
                            :rules="[v => !!v || '请输入计费金额']"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select v-model="t.unit" :items="unitItems" label="计费单位*" :rules="rules.unit"></v-select>
            </v-col>
            <v-col cols="6">
              <v-select v-model="t.payCycle" :items="cycleItems" label="支付周期*" :rules="rules.payCycle"></v-select>
            </v-col>
            <v-col cols="6">
              <v-radio-group v-model="t.monthBill" label="是否自然月账单*"
                             style="margin-top: -30px">
                <v-radio :value="false" label="否"></v-radio>
                <v-radio :value="true" label="是"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="6">
              <v-select v-model="t.payType" :items="payTypeItems" label="付款方式*" :rules="rules.payType"></v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="t.payDay" label="缴款日*" :rules="rules.payDay"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-menu v-model="menu3" transition="scale-transition" offset-y
                      min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="t.firstStartDate"
                                label="首期开始日期"
                                dense
                                hide-details
                                readonly
                                v-bind="attrs"
                                v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="t.firstStartDate" no-title scrollable></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu v-model="menu5" transition="scale-transition" offset-y
                      min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="t.firstEndDate"
                                label="截止日期"
                                dense
                                hide-details
                                readonly
                                v-bind="attrs"
                                v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="t.firstEndDate" no-title scrollable></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-text-field type="number" v-model="t.firstMoney" label="首期金额"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select v-model="t.priceType" :items="priceItems" label="计价方式*" :rules="rules.priceType"></v-select>
            </v-col>
          </v-row>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveMoneyHandler">确定</v-btn>
          <v-btn @click="moneyTypeDialog=false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="bzjDialog" @click="bzjDialog = false" width="30%">
      <v-card class="pa-5">
        <v-card-title>保证金登记</v-card-title>
        <v-form ref="bzjForm">
          <v-text-field :rules="bzjRules.money" label="保证金金额" type="number" v-model="bzj.money"></v-text-field>
          <v-autocomplete label="类型"
                          :rules="bzjRules.type"
                          :items="bzjTypeItems"
                          auto-select-first
                          v-model="bzj.type"></v-autocomplete
          >
          <v-menu v-model="bzjMenu" transition="scale-transition" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="bzj.startDate" :rules="bzjRules.startDatetime" label="开始日期" readonly
                            v-bind="attrs"
                            v-on="on"></v-text-field>
            </template>
            <v-date-picker @change="bzjMenu = false" v-model="bzj.startDate" no-title scrollable></v-date-picker>
          </v-menu>

          <v-menu v-model="bzjMenu2" transition="scale-transition" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="bzj.datetime" :rules="bzjRules.datetime" label="截止日期" readonly v-bind="attrs"
                            v-on="on"></v-text-field>
            </template>
            <v-date-picker @change="bzjMenu2 = false" v-model="bzj.datetime" no-title scrollable></v-date-picker>
          </v-menu>

          <v-menu v-model="bzjMenu3" transition="scale-transition" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="bzj.endDate" :rules="bzjRules.endDatetime" label="缴费截止日期" readonly
                            v-bind="attrs"
                            v-on="on"></v-text-field>
            </template>
            <v-date-picker @change="bzjMenu3 = false" v-model="bzj.endDate" no-title scrollable></v-date-picker>
          </v-menu>
          <v-text-field label="备注" v-model="bzj.remark"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="insertBzjEvent" :disabled="bzj.money == 0 || bzj.money == ''">提交</v-btn>
          <v-btn @click="bzjDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import {houseList} from '@/api/house'
import {insertZujin, updateZujin, queryById, updateTerm, deleteTerm, deleteBzj} from "@/api/zujin";
import {insertContractWordRecord} from "@/api/contractWordModel";
import EasyFlow from "@/components/easyflow/easyFlow.vue";
import FileUpload from "@/components/fileUpload.vue";
import SelectCompany from "@/views/company/select.vue";

export default {
  name: "zj-insert",
  components: {
    SelectCompany,
    FileUpload,
    EasyFlow,
  },
  data: () => ({
    receivedError:null,
    loading: false,
    bzj: {
      money: "",
      remark: "",
      datetime: '',
      type: '',
      startDate: '',
      endDate: '',
    },
    bzjMenu: false,
    bzjMenu2: false,
    bzjMenu3: false,
    bzjRules: {
      money: [v => !!v || '请输入金额', v => (!!v && v.length < 11) || '金额字符太长'],
      type: [v => !!v || '请选择或手动输入类型', v => (!!v) || '金额类型过长'],
      datetime: [v => !!v || '请选择时间'],
    },
    bzjTypeItems: ['履约保证金', '质保保证金', '装修保证金'],
    bzjDialog: false,
    menu: false,
    menu2: false,
    menu3: false,
    menu5: false,
    moneyTypeDialog: false,
    tab: '0',
    billTypes: ['增值税专用发票', '增值税普通发票'],
    rules: {
      series: [v => !!v || '请输入合同编号', v => (!!v && v.length < 100) || '合同编号不能超过10个字符'],
      company: [v => !!v || '请输入租赁方', v => (!!v && v.length < 100) || '租赁方不能超过10个字符'],
      brand: [v => !!v || '请输入品牌', v => (!!v && v.length < 100) || '品牌不能超过10个字符'],
      yt: [v => !!v || '请选择业态'],
      yearRental: [v => !!v || '请输入应收租金'],
      endDatetime: [v => !!v || '请选择合同截止日期'],
      planDate: [v => !!v || '请选择计划进场日期'],
      openDate: [v => !!v || '请选择开业日期'],
      startDatetime: [v => !!v || '请选择合同截止日期'],
      startDate: [v => !!v || '请选择开始日期'],
      endDate: [v => !!v || '请选择截止日期'],
      monthBill: [v => !!v || '请选择账单类型'],
      payCycle: [v => !!v || '请选择支付周期'],
      unit: [v => !!v || '请选择计费单位'],
      payType: [v => !!v || '请选择付款方式'],
      payDay: [v => !!v || '请输入缴款日'],
      priceType: [v => !!v || '请选择计价方式'],
      name: [v => !!v || '请选择费用名称'],
    },
    yitaiItems: [],
    data: {},
    payTypes: [
      {text: '年付方式', value: 0},
      {text: '季度方式', value: 1},
      {text: '月付方式', value: 2},
      {text: '双月付', value: 3},
      {text: '其他', value: 4},
    ],
    menu4: false,
    menu6: false,
    menu7: false,
    menu8: false,
    houseList: [],
    searchHouse: null,
    houseMessage: null,
    acreageMessage: null,
    defaultFlow: null,
    dialog: false,

    zlItems: [],
    headers: [
      {value: 'name', text: '费用名称'},
      {value: 'startDate', text: '开始日期'},
      {value: 'endDate', text: '截止日期'},
      {value: 'type', text: '计费方式'},
      {value: 'unit', text: '计费单位'},
      {value: 'payCycle', text: '支付周期'},
      {value: 'monthBill', text: '是否自然月账单'},
      {value: 'payType', text: '付款方式'},
      {value: 'payDay', text: '缴款日'},
      {value: 'firstStartDate', text: '首期开始日期'},
      {value: 'firstEndDate', text: '首期截止日期'},
      {value: 'firstMoney', text: '首期金额'},
      {value: 'priceType', text: '计价方式'},
      {value: 'action', text: '操作'},
    ],
    bzjHeader: [
      {value: 'type', text: '费用名称'},
      {value: 'startDate', text: '开始日期'},
      {value: 'datetime', text: '截止日期'},
      {value: 'endDate', text: '截止缴费日期'},
      {value: 'money', text: '应收金额'},
      {value: 'remark', text: '备注'},
      {value: 'action', text: '操作'}
    ],
    typeItems: [
      {value: 'regular', text: '固定金额'},
    ],
    unitItems: [
      {value: 'month', text: '每月'},
      {value: 'one', text: '一次性付费'},
    ],
    cycleItems: [
      {value: 'month', text: '月付'},
      {value: 'towMonth', text: '两月付'},
      {value: 'quarter', text: '季付'},
      {value: 'one', text: '一次性付清'},
    ],
    payTypeItems: [
      {value: 'day', text: '固定日期'},
    ],
    priceItems: [
      {value: 'area', text: '按面积单价'},
    ],
    nameItems: ["租金", "管理费", "推广服务费", "二清管理费", "装修管理费"],
    t: {
      name: null,
      startDate: null,
      endDate: null,
      type: 'regular',
      unit: null,
      payCycle: null,
      monthBill: null,
      payType: 'day',
      payDay: null,
      firstStartDate: null,
      firstEndDate: null,
      firstMoney: null,
      priceType: null
    },
    bzjItems: [],

    update: false,
  }),
  props: {
    type: {
      type: Number,
      default: 0
    },
    id: {
      type: String,
      default: null
    }
  },
  watch: {
    searchHouse(value) {
      if (value != null) {
        this.loadHouses(value);
      }
    },
    id() {
      this.loadById(this.id)
    }
  },
  created() {
    this.loadHouses()
    this.reset()

    if (this.type == 0) {
      this.defaultFlow = "租赁合同审批单"
    } else if (this.type == 2) {
      this.defaultFlow = "多经类合同审批单"
    } else {
      this.defaultFlow = "物业管理费合同审批"
    }

    if (this.id) {
      this.loadById(this.id)
    }
  },
  methods: {
    loadById(id) {
      if (id) {
        queryById(id).then(result => {
          if (result.houses.length > 0) {
            result.houses.forEach(item => {
              item.temp = item.pwNumber + ":" + item.acreage
              this.houseList.push(item)
            })
          }
          if(!result.brandCompany){
            result.brandCompany = {name:'-'}
          }
          this.data = result
          result.termList.forEach((val, idx) => {
            val.idx = idx
          })
          result.bzjList.forEach((val, idx) => {
            val.idx = idx
          })

          this.zlItems = result.termList
          this.bzjItems = result.bzjList
        })
      }
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

    editMoneyHandler(item) {
      this.update = true
      this.t = item
      this.moneyTypeDialog = true
    },
    /*editBzjHandler(item) {
      this.update = true
      this.bzj = item
      this.bzjDialog = true
    },*/
    deleteMoneyHandler(item) {
      if (item.id) {
        deleteTerm(item.id)
      }
      this.zlItems.forEach((val, idx) => {
        if (val.idx == item.idx) {
          this.zlItems.splice(idx, 1)
        }
      })
    },
    deleteBzjHandler(item) {
      if (item.id) {
        deleteBzj(item.id)
      }
      this.bzjItems.forEach((val, idx) => {
        if (item.idx == val.idx) {
          this.bzjItems.splice(idx, 1)
        }
      })
    },
    insertBzjEvent() {
      let valid = this.$refs['bzjForm'].validate();
      if (valid && !this.update) {
        this.bzj.idx = this.bzjItems.length
        this.bzjItems.push(this.bzj)
        this.bzjDialog = false
      }
      this.update = false
    },
    saveMoneyHandler() {
      let valid = this.$refs.moneyForm.validate()
      if (valid) {
        if (!this.update) {
          this.t.idx = this.zlItems.length
          this.zlItems.push(this.t)
          this.moneyTypeDialog = false
        } else {
          if (this.t.id) {
            updateTerm(this.t).then(() => this.moneyTypeDialog = false)
          }
        }
        this.update = false
      }
    },
    insertMoneyHandler() {
      if (this.tab == '0') {
        this.resetMoneyType()
        this.moneyTypeDialog = true
      } else {
        this.bzj = Object.assign({
          money: "",
          remark: "",
          datetime: this.data.endDatetime,
          type: '',
          startDate: this.data.startDatetime,
          endDate: '',
        }, {})
        this.bzjDialog = true
      }
    },
    resetMoneyType() {
      let startDate = null
      let endDate = null
      if (this.data.startDatetime) {
        startDate = this.data.startDatetime
      }
      if (this.data.endDatetime) {
        endDate = this.data.endDatetime
      }

      this.t = Object.assign({
        name: null,
        startDate: startDate,
        endDate: endDate,
        type: 'regular',
        unit: null,
        payCycle: null,
        monthBill: null,
        payType: 'day',
        payDay: null,
        firstStartDate: null,
        firstEndDate: null,
        firstMoney: null,
        priceType: null,
      }, {})
    },
    filesHandler() {
      console.log("fileshandler", this.item)
      this.frameId = this.item.id + "-zujin"
    },
    saveData() {
      let valid = this.$refs['zujinForm'].validate();
      if (valid) {
        if (this.data.zlType == 0) {
          if (this.data.houses.length <= 0) {
            this.houseMessage = "请选择租赁商铺"
            return;
          }
        }
        if (this.data.acreage <= 0) {
          this.acreageMessage = "请输入租赁面积"
          return;
        }

        if(!this.data.receivedCompany || !this.data.receivedCompany.id){
          this.receivedError = '请选择收款单位'
          return;
        }

        this.loading = true
        this.data.companyTypeId = this.data.yt.id

        this.data.termList = this.zlItems
        this.data.bzjList = this.bzjItems
        if (this.data.id != null) {
          if (!this.offEdit) {
            updateZujin(this.data).then((result) => {
              insertContractWordRecord(result)
            }).finally(() => {
              this.$emit("close")
              this.loading = false
            })
          }
        } else {
          insertZujin(this.data).then(result => {

            insertContractWordRecord(result)
            this.$refs.easyFlow.startFlow({
              title: result.company + "合同审批",
              content: result.remark || '',
              frameId: result.id + "-zujin",
              frameCoding: 1320287,
              frameColumn: 'id'
            })

          }).finally(() => {
            this.$emit("close")
            this.loading = false
          })
        }
      }
    },
    printContractWord() {
      this.contractId = this.data.id
      this.printComponent = () => import('@/components/print/contractWordModelRecord.vue')
    },
    fileChangeHandler({files}) {
      this.data.files = ""
      files.forEach(item => {
        this.data.files += item.id + ";"
      })
    },
    insertZujin() {
      let valid = this.$refs['zujinForm'].validate();
      if (valid) {
        if (this.data.zlType == 0) {
          if (this.data.houses.length <= 0) {
            this.houseMessage = "请选择租赁商铺"
            return;
          }
        }
        if (this.data.acreage <= 0) {
          this.acreageMessage = "请输入租赁面积"
          return;
        }

        this.loading = true
        this.data.companyTypeId = this.data.yt.id
        this.data.termList = this.zlItems
        this.data.bzjList = this.bzjItems
        if (this.data.id != null) {
          if (!this.offEdit) {
            updateZujin(this.data).then((result) => {
              if (this.$refs.easyFlow) {
                //发起审批流程
                this.$refs.easyFlow.startFlow({
                  title: result.company + "合同审批",
                  content: result.remark || '',
                  frameId: result.id + "-zujin",
                  frameCoding: 1320287,
                  frameColumn: 'id'
                })
              }
              insertContractWordRecord(result)
              this.loading = false
              this.$emit("close")
            })
          }
        } else {
          insertZujin(this.data).then((result) => {
            if (this.$refs.easyFlow) {
              //发起审批流程
              this.$refs.easyFlow.startFlow({
                title: result.company + "合同审批",
                content: result.remark || '',
                frameId: result.id + "-zujin",
                frameCoding: 1320287,
                frameColumn: 'id'
              })
            }
            insertContractWordRecord(result)
            this.loading = false
            this.$emit("close")
          })
        }
      }
    },
    loadHouses(value) {
      houseList({searchText: value, page: 1, itemsPerPage: 50, flag: this.data.type == 0 ? 0 : null}).then(data => {
        data.rows.forEach(item => {
          item.temp = item.pwNumber + ":" + item.acreage
        })
        this.houseList = data.rows
      })
    },
    houseSelect() {
      if (this.data.zlType != 0) {
        this.data.houses = []
        this.data.acreage = 0
      }
    },
    openMap() {
      if (this.item.houses != null && this.item.houses.length > 0 && this.loadDetailByHouse == null) {
        this.mapFloor = this.item.houses[0].floor
        this.mapDialog = true
      }
    },
    houseChange() {
      this.data.acreage = 0
      this.data.houses.forEach(item => {
        let acreage = parseFloat(item.acreage);
        if (isNaN(acreage)) {
          acreage = 0
        }
        this.data.acreage += acreage
      })
      this.data.acreage = this.data.acreage.toFixed(2)
      let last = 0;
      if ((last = this.data.houses.length) > 0) {
        last = this.data.houses[last - 1]
        if (last.yetaiId != null) {
          this.data.yt = {id: last.yetaiId, name: ''}
          for (let x = 0; x < this.yitaiItems.length; x++) {
            let item = this.yitaiItems[x]
            if (item.id == last.yetaiId) {
              this.data.yt.name = item.name
              break
            }
          }
        }
        this.houseMessage = null
        this.acreageMessage = null
      }
    },
    reset() {
      this.data = {
        receivedCompany: null,
        dayNum: null,
        series: null,
        brandCompany: {
          bankNumber: null,
          name: null,
          address: null,
          taxNumber: null,
          relationP:null,
          openAccount:null,
          telephoneP:null
        },
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
        type: this.type,
        files: null,
        planDate: null,
        openDate: null,
        billType: ''
      }
    }
  }
}
</script>

<style scoped>

</style>