<template>
    <div>
        <v-form ref="updateForm">
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="placeUseContractItem.contractName"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-autocomplete v-model="placeUseContractItem.partB"
                                    :items="companyItems"
                                    :loading="isLoading"
                                    :search-input.sync="searchCompany"
                                    return-object
                                    item-text="name"
                                    :append-icon=" 'mdi-plus' "
                                    @click:append="showAddCompanyDialog"
                                    label="乙方"></v-autocomplete>
                </v-col>
                <v-col md="3">
                    <v-text-field label="证件号码" v-model="placeUseContractItem.partB.idNumber"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方地址" v-model="placeUseContractItem.partB.address"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="联系电话" v-model="placeUseContractItem.partB.telephoneP"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="开户行" v-model="placeUseContractItem.partB.openAccount"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="银行账号" v-model="placeUseContractItem.partB.bankNumber"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="placeUseContractItem.startDate"
                                          :rules="[v => !!v || '请选择合同开始日期']" label="合同开始日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="placeUseContractItem.startDate" no-title scrollable
                                       @change="menu1 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="placeUseContractItem.endDate"
                                          :rules="[v => !!v || '请选择合同截止日期']" label="合同截止日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="placeUseContractItem.endDate" no-title scrollable
                                       @change="menu2 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="3">
                    <v-text-field label="场地编号" v-model="placeUseContractItem.placeNum"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field type="number" label="场地面积"
                                  v-model="placeUseContractItem.placeArea"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="场地用途" v-model="placeUseContractItem.placeUseFor"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费标准(含税 元/月)"
                                  v-model="placeUseContractItem.price"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费总额(含税)"
                                  v-model="placeUseContractItem.money"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="场地费税率(%)"
                                  v-model="placeUseContractItem.taxRate"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="交费结算期(/月)"
                                  v-model="placeUseContractItem.payCycle"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="水费(元/m³)"
                                  v-model="placeUseContractItem.waterPrice"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="保证金" v-model="placeUseContractItem.bond"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-select v-model="placeUseContractItem.electricType"
                              :items="electricType"
                              item-value="value"
                              label="电费支付方式"
                              item-text="name">
                    </v-select>
                </v-col>
                <v-col md="2">
                    <v-text-field label="电费" v-model="placeUseContractItem.electricPrice"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-autocomplete v-model="placeUseContractItem.receivedCompany"
                                    :items="receivedCompanyItems"
                                    :loading="isLoading2"
                                    :search-input.sync="searchReceivedCompany"
                                    return-object
                                    item-text="name"
                                    :rules="[v => !!v || '请选择收款单位']"
                                    :append-icon=" 'mdi-plus' "
                                    @click:append="showAddCompanyDialog"
                                    label="收款单位"></v-autocomplete>
                </v-col>
                <v-col sm="3">
                    <file-upload ref="file" @change="fileChangeHandler" :dense="false"></file-upload>
                </v-col>
                <v-col sm="2">
                    <easy-flow coding="1320288" ref="easyFlow" default-flow-name="场地使用合同-多经"></easy-flow>
                </v-col>

            </v-row>
        </v-form>
        <v-row class="mr-0">
            <v-col cols="12">
                <v-tabs v-model="tab">
                    <v-tab key="zl">场地费条款</v-tab>
                    <v-tab key="bzj">保证金条款</v-tab>
                </v-tabs>
                <v-btn @click="insertMoneyHandler" small outlined absolute color="primary" right
                       style="margin-top:-20px">
                    新增
                </v-btn>
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
                                {{ formatPriceType(item) }}
                            </template>
                            <template v-slot:item.action="{item}">
                                <v-btn color="error" x-small outlined @click="editMoneyHandler(item)" class="mr-1">
                                    修改
                                </v-btn>
                                <v-btn color="error" x-small outlined @click="deleteMoneyHandler(item)">删除</v-btn>
                            </template>
                        </v-data-table>
                    </v-tab-item>
                    <v-tab-item key="bzj">
                        <v-data-table :items.sync="bzjItems" :headers="bzjHeader" hide-default-footer
                                      :items-per-page="-1">
                            <template v-slot:item.action="{item}">
                                <v-btn color="error" x-small outlined @click="deleteBzjHandler(item)">删除</v-btn>
                            </template>
                        </v-data-table>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>
        <!--新增公司组件-->
        <v-dialog v-model="addCompanyDialog" width="70%">
            <v-card>
                <v-card-title>新增公司信息</v-card-title>
                <add-company ref="addCompany"></add-company>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="saveCompany">提交</v-btn>
                    <v-btn @click="addCompanyDialog = false,this.$refs.addCompany.reset()">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--新增场地缴费-->
        <v-dialog width="50%" v-model="moneyTypeDialog">
            <v-card class="pa-3">
                <v-form ref="moneyForm">
                    <v-row>
                        <v-col cols="12">
                            <v-combobox v-model="t.name" label="费用名称*" aria-required="true" :rules="rules.name"
                                        :items="nameItems"></v-combobox>
                        </v-col>
                        <v-col cols="6">
                            <v-menu v-model="menu3" transition="scale-transition" offset-y
                                    min-width="auto" :close-on-content-click="false" ref="menu">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="t.startDate"
                                                  :rules="rules.startDate"
                                                  label="开始日期*"
                                                  readonly
                                                  v-bind="attrs"
                                                  v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="t.startDate" no-title scrollable @change="menu3 = false"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="6">
                            <v-menu v-model="menu4" transition="scale-transition" offset-y
                                    min-width="auto" :close-on-content-click="false" ref="menu2">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="t.endDate"
                                                  :rules="rules.endDate"
                                                  label="截止日期*"
                                                  readonly
                                                  v-bind="attrs"
                                                  v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="t.endDate" no-title scrollable @change="menu4 = false"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="3">
                            <v-select v-model="t.type" :items="typeItems" label="计费方式*"></v-select>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field type="number" v-model="t.money" label="金额(元/月)*"
                                          :rules="[v => !!v || '请输入计费金额']"></v-text-field>
                        </v-col>
<!--                        <v-col cols="1.5">-->
<!--                            <v-text-field type="number" v-model="t.price" label="单价*"-->
<!--                            ></v-text-field>-->
<!--                        </v-col>-->
                        <v-col cols="1.5">
                            <v-text-field type="number" v-model="t.fixPercent" label="固定扣点*"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-select v-model="t.unit" :items="unitItems" label="计费单位*" :rules="rules.unit"></v-select>
                        </v-col>
                        <v-col cols="3">
                            <v-select v-model="t.payCycle" :items="cycleItems" label="支付周期*"
                                      :rules="rules.payCycle"></v-select>
                        </v-col>
                        <v-col cols="3">
                            <v-radio-group v-model="t.monthBill" label="是否自然月账单*"
                                           style="margin-top: -30px">
                                <v-radio :value="false" label="否"></v-radio>
                                <v-radio :value="true" label="是"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field type="number" label="每期折扣" v-model="t.disMoney" disabled></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select v-model="t.payType" :items="payTypeItems" label="付款方式*"
                                      :rules="rules.payType"></v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-text-field v-model="t.payDay" label="缴款日*" :rules="rules.payDay"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-radio-group style="margin-top: -30px" v-model="t.billType" label="账单类型"
                                           title="账单生成类型：下期=到达每月账单日，生成下一个对应的‘月/季度’账单；本期=到达每月账单日，生成本月应收账单；上期=到达每月账单日，生成上一个‘月/季度’账单（适合扣点提成类型的合同账单）">
                                <v-radio :value="0" label="下期" title="下期=到达每月账单日，生成下一个对应的‘月/季度’账单"></v-radio>
                                <v-radio :value="1" label="本期" title="本期=到达每月账单日，生成本月应收账单；"></v-radio>
                                <v-radio :value="2" label="上期"
                                         title="上期=到达每月账单日，生成上一个‘月/季度’账单（适合扣点提成类型的合同账单）"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="6">
                            <v-menu v-model="menu5" transition="scale-transition" offset-y :close-on-content-click="false"
                                    min-width="auto" ref="menu3">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="t.firstStartDate"
                                                  label="首期开始日期"
                                                  dense
                                                  hide-details
                                                  readonly
                                                  v-bind="attrs"
                                                  v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="t.firstStartDate" no-title scrollable
                                               @change="menu5 = false"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="6">
                            <v-menu v-model="menu6" transition="scale-transition" offset-y :close-on-content-click="false"
                                    min-width="auto" ref="menu5">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="t.firstEndDate"
                                                  label="截止日期"
                                                  dense
                                                  hide-details
                                                  readonly
                                                  v-bind="attrs"
                                                  v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="t.firstEndDate" no-title scrollable
                                               @change="menu6 = false"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field type="number" v-model="t.firstMoney" label="首期金额"></v-text-field>
                        </v-col>
<!--                        <v-col cols="6">-->
<!--                            <v-select v-model="t.priceType" :items="priceItems" label="计价方式*"-->
<!--                                      :rules="rules.priceType"></v-select>-->
<!--                        </v-col>-->
                    </v-row>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="saveMoneyHandler">确定</v-btn>
                    <v-btn @click="moneyTypeDialog=false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--新增保证金-->
        <v-dialog v-model="bzjDialog" @click="bzjDialog = false" width="30%">
            <v-card class="pa-5">
                <v-card-title>保证金登记</v-card-title>
                <v-form ref="bzjForm">
                    <v-autocomplete label="类型*"
                                    :rules="bzjRules.type"
                                    :items="bzjTypeItems"
                                    auto-select-first
                                    v-model="bzj.type"></v-autocomplete
                    >
                    <v-text-field :rules="bzjRules.money" label="保证金金额*" type="number"
                                  v-model="bzj.money"></v-text-field>

                    <v-radio-group v-if="bzj.type == '履约保证金'" v-model="bzj.payAll" label="是否一口价" mandatory>
                        <v-radio :value="true" label="是"></v-radio>
                        <v-radio :value="false" label="否"></v-radio>
                    </v-radio-group>
                    <v-text-field v-if="bzj.type == '履约保证金' && bzj.payAll == false" :rules="bzjRules.requiredProperty"
                                  label="租金月数" type="number"
                                  v-model="bzj.zjMonth"></v-text-field>
                    <v-text-field v-if="bzj.type == '履约保证金' && bzj.payAll == false" :rules="bzjRules.requiredProperty"
                                  label="管理费月数" type="number"
                                  v-model="bzj.wgMonth"></v-text-field>
                    <v-menu v-model="bzjMenu" transition="scale-transition" offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="bzj.startDate" :rules="bzjRules.startDatetime" label="区间开始日期*"
                                          readonly
                                          v-bind="attrs"
                                          v-on="on"></v-text-field>
                        </template>
                        <v-date-picker @change="bzjMenu = false" v-model="bzj.startDate" no-title
                                       scrollable></v-date-picker>
                    </v-menu>

                    <v-menu v-model="bzjMenu2" transition="scale-transition" offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="bzj.datetime" :rules="bzjRules.datetime" label="区间截止日期*" readonly
                                          v-bind="attrs"
                                          v-on="on"></v-text-field>
                        </template>
                        <v-date-picker @change="bzjMenu2 = false" v-model="bzj.datetime" no-title
                                       scrollable></v-date-picker>
                    </v-menu>

                    <v-menu v-model="bzjMenu3" transition="scale-transition" offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="bzj.endDate" :rules="bzjRules.datetime" label="缴费截止日期*" readonly
                                          v-bind="attrs"
                                          v-on="on"></v-text-field>
                        </template>
                        <v-date-picker @change="bzjMenu3 = false" v-model="bzj.endDate" no-title
                                       scrollable></v-date-picker>
                    </v-menu>
                    <v-text-field label="备注" v-model="bzj.remark"></v-text-field>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="insertBzjEvent" :disabled="bzj.money == 0 || bzj.money == ''">提交
                    </v-btn>
                    <v-btn @click="bzjDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>

import {update,selectById} from "../../../../api/placeUseContract";
import addCompany from "../../../../components/addCompany";
import {list} from '@/api/company';
import {insertPlaceContractWordRecord} from "@/api/contractWordModel";
import EasyFlow from "@/components/easyflow/easyFlow.vue";
import FileUpload from "@/components/fileUpload.vue";
import {deleteBzj, deleteTerm, updateTerm} from "@/api/zujin";

export default {
    name: 'updatePlaceContract',
    components: {addCompany, EasyFlow, FileUpload},
    props: {
        item: {
            type: Object,
        }
    },
    data: () => ({
        placeUseContractItem: {
            id: null,
            contractName: null,
            partB: {
                name: null,
                idNumber: null,
                address: null,
                telephoneP: null,
                openAccount: null,
                bankNumber: null,
            },
            placeNum: null,
            placeArea: null,
            placeUseFor: null,
            startDate: null,
            endDate: null,
            price: null,
            money: null,
            taxRate: null,
            payCycle: null,
            waterPrice: null,
            type: null,
            electricPrice: null,
            bond: null,
            electricType: null,
            files: '',
            receivedCompany:{
                name:null,
            }
        },
        companyItems: [],
        isLoading: false,
        searchCompany: null,
        receivedCompanyItems: [],
        isLoading2:false,
        searchReceivedCompany:null,

        menu1: false,
        menu2: false,
        menu3: false,
        menu4: false,
        menu5: false,
        menu6: false,
        electricType: [
            {
                name: '甲方电表通知',
                value: 0
            },
            {
                name: '甲方电表预付',
                value: 1
            },
            {
                name: '月付',
                value: 2
            },
            {
                name: '一次性付',
                value: 3
            },
        ],

        addCompanyDialog: false,

        //
        moneyTypeDialog:false,
        update: false,
        zlItems: [],
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
            priceType: null,
            money: null,
            price: null,
            fixPercent: null,
            disMoney: null,
            billType: 0
        },
        nameItems: ["多经场地费"],
        typeItems: [
            {value: 'regular', text: '固定金额'},
            {value: 'regularPreferential', text: '固定租金(优惠阶段)'},
            {value: 'commission', text: '提成租金'},
            {value: 'compare', text: '提成固定较高租金'},
        ],
        unitItems: [
            {value: 'month', text: '每月'},
            {value: 'one', text: '一次性付费'},
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
            signDate: [v => !!v || '请选择合同签署日期'],
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
        //
        bzjDialog:false,
        bzj: {
            money: "",
            remark: "",
            datetime: '',
            type: '',
            startDate: '',
            endDate: '',
            payAll: false,
            zjMonth: 2,
            wgMonth: 2
        },
        bzjMenu: false,
        bzjMenu2: false,
        bzjMenu3: false,
        bzjMenu4: false,
        bzjRules: {
            money: [v => !!v || '请输入金额', v => (!!v && (v + '').length < 11) || '金额字符太长'],
            type: [v => !!v || '请选择或手动输入类型', v => (!!v) || '金额类型过长'],
            datetime: [v => !!v || '请选择时间'],
            requiredProperty: [v => !!v || '必填项']
        },
        bzjTypeItems: ['场地保证金'],

        //
        tab:'0',
        headers: [
            {value: 'name', text: '费用名称'},
            {value: 'startDate', text: '开始日期'},
            {value: 'endDate', text: '截止日期'},
            {value: 'type', text: '计费方式'},
            {value: 'unit', text: '计费单位'},
            {value: 'money', text: '金额'},
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
        bzjItems: [],
        bzjHeader: [
            {value: 'type', text: '费用名称'},
            {value: 'startDate', text: '开始日期'},
            {value: 'datetime', text: '截止日期'},
            {value: 'endDate', text: '截止缴费日期'},
            {value: 'money', text: '应收金额'},
            {value: 'remark', text: '备注'},
            {value: 'action', text: '操作'}
        ],
    }),
    created() {

    },
    watch: {
        'placeUseContractItem.electricType': {
            handler() {
                if (this.placeUseContractItem.electricType == 0) {
                    this.placeUseContractItem.electricPrice = '实时电价'
                } else if (this.placeUseContractItem.electricType == 1) {
                    this.placeUseContractItem.electricPrice = '实时电价'
                }
            },
            deep: true
        },
        searchCompany: {
            handler() {
                if (this.searchCompany != null) {
                    this.loadCompany(this.searchCompany)
                }
            },
            deep: true
        },
        searchReceivedCompany:{
          handler(){
              if (this.searchReceivedCompany != null){
                  this.loadReceivedCompany(this.searchReceivedCompany)
              }
          }  ,
            deep:true
        },
        item: {
            handler() {
                if (this.item != null) {
                    this.loadPlaceUseContract(this.item)
                }
            },
            deep: true
        }
    },

    methods: {
        validateForm() {
            let flag = null
            if (this.$refs['updateForm'].validate()) {
                flag = true
            } else {
                flag = false
            }
            return flag
        },
        submitUpdate() {
            this.placeUseContractItem.termList = this.zlItems
            this.placeUseContractItem.bzlList = this.bzjItems
            return update(this.placeUseContractItem).then(res => {
                insertPlaceContractWordRecord(this.placeUseContractItem)
                this.$refs.easyFlow.startFlow({
                    title: this.placeUseContractItem.partB.name + "合同审批",
                    content: this.placeUseContractItem.remark || '',
                    frameId: this.placeUseContractItem.id,
                    frameCoding: 1320288,
                    frameColumn: 'id'
                })
                return res
            })
        },
        savePlaceContract() {
            this.placeUseContractItem.termList = this.zlItems
            this.placeUseContractItem.bzlList = this.bzjItems
            return update(this.placeUseContractItem).then(res => {
                insertPlaceContractWordRecord(this.placeUseContractItem)
                return res
            })
        },
        loadCompany(str) {
            list(str).then(res => {
                this.companyItems = res
            })
        },
        loadReceivedCompany(str){
            list(str).then(res => {
                this.receivedCompanyItems = res
            })
        },
        showAddCompanyDialog() {
            this.addCompanyDialog = true
        },
        saveCompany() {
            if (this.$refs.addCompany.validateForm() == true) {
                this.$refs.addCompany.saveCompany()
                this.addCompanyDialog = false
            }
        },
        fileChangeHandler({files}) {
            this.placeUseContractItem.files = ""
            files.forEach(item => {
                this.placeUseContractItem.files += item.id + ";"
            })
        },
        reset() {
            this.placeUseContractItem = {
                id: null,
                contractName: null,
                partB: {
                    name: null,
                    idNumber: null,
                    address: null,
                    telephoneP: null,
                    openAccount: null,
                    bankNumber: null,
                },
                placeNum: null,
                placeArea: null,
                placeUseFor: null,
                startDate: null,
                endDate: null,
                price: null,
                money: null,
                taxRate: null,
                payCycle: null,
                waterPrice: null,
                type: null,
                electricPrice: null,
                bond: null,
                electricType: null,
                files: '',
                receivedCompany:{
                    name:null,
                },
            }
        },
        loadPlaceUseContract(item){
            selectById({id:item.id}).then(res => {
                this.zlItems = res.termList
                this.bzjItems = res.bzjList
                this.placeUseContractItem = res
                this.searchCompany = this.placeUseContractItem.partB.name
                this.searchReceivedCompany = this.placeUseContractItem.receivedCompany.name
            })
        },

        //
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
        insertBzjEvent() {
            let valid = this.$refs['bzjForm'].validate();
            if (valid) {
                if (!this.update) {
                    this.bzj.idx = this.bzjItems.length
                    this.bzjItems.push(this.bzj)
                    this.bzjDialog = false
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
                    datetime: this.placeUseContractItem.endDate,
                    type: '多经场地保证金',
                    startDate: this.placeUseContractItem.startDate,
                    endDate: '',
                    zjMonth: 2,
                    wgMonth: 2
                }, {})
                this.bzjDialog = true
            }
        },
        editMoneyHandler(item) {
            this.update = true
            if (item.money) {
                item.money = item.money + ""
            }
            this.t = item
            this.moneyTypeDialog = true
        },
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
        resetMoneyType() {
            let startDate = null
            let endDate = null
            if (this.placeUseContractItem.startDate) {
                startDate = this.placeUseContractItem.startDate
            }
            if (this.placeUseContractItem.endDate) {
                endDate = this.placeUseContractItem.endDate
            }
            let payCycle = null
            if (this.placeUseContractItem.payCycle == 1){
                payCycle = 'month'
            }else if (this.placeUseContractItem.payCycle == 2){
                payCycle = 'towMonth'
            }else if (this.placeUseContractItem.payCycle == 3){
                payCycle = 'quarter'
            }else if (this.placeUseContractItem.payCycle == 6){
                payCycle = 'halfYear'
            }else if (this.placeUseContractItem.payCycle == 12){
                payCycle = 'year'
            }

            let price = this.placeUseContractItem.price

            this.t = Object.assign({
                name: '多经场地费',
                startDate: startDate,
                endDate: endDate,
                type: 'regular',
                unit: null,
                payCycle: payCycle,
                monthBill: null,
                payType: 'day',
                payDay: null,
                firstStartDate: null,
                firstEndDate: null,
                firstMoney: null,
                priceType: null,
                money: price,
                price: 0,
                fixPercent: null,
                disMoney: null,
                billType: 0
            }, {})
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
    }
}
</script>
