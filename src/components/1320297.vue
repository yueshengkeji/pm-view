<template>
  <div>
      <v-card>
          <v-card-title>收款记录<v-spacer></v-spacer></v-card-title>
          <v-card-text>
              <v-form ref="addForm">
                  <v-row>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="collectSuperiorItem.staff.name" label="登记人" readonly dense></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="collectSuperiorItem.collectMoneyTotal" type="=number" label="收款总额" readonly dense></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="collectSuperiorItem.collectCompanyName" label="付款单位" dense readonly></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="collectSuperiorItem.collectCompanyOpenAccount" label="开户行" dense readonly></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="collectSuperiorItem.collectCompanyBankNumber" label="银行账号" dense readonly></v-text-field>
                      </v-col>
                  </v-row>
                  <v-row>
                      <v-col>
                          <v-text-field v-model="collectSuperiorItem.remark" label="备注说明" dense readonly></v-text-field>
                      </v-col>
                  </v-row>
              </v-form>
              <v-data-table :items="collectSuperiorItem.concatBillList"
                            hide-default-footer
                            :headers="headers">
                  <template v-slot:item.brand="{item}">
                      <v-chip small outlined>{{ item.brand }}</v-chip>
                  </template>
                  <template v-slot:item.state="{item}">
                      {{ formatState(item.state) }}
                  </template>
                  <template v-slot:item.concatType="{item}">
                      {{ formatConcat(item.concatType) }}
                  </template>
                  <template v-slot:item.invoiceState="{item}">
                      {{ formatInvoiceState(item.invoiceState) }}
                  </template>
                  <template v-slot:item.arrearageDay="{item}">
                      <div v-if="item.arrearageDay > 0">{{ item.arrearageDay }}</div>
                  </template>
                  <template v-slot:item.collectMoney="{item}">
                      <v-text-field v-model="item.collectMoney" type="number" readonly></v-text-field>
                  </template>
                  <template v-slot:item.remark="{item}">
                      <v-text-field v-model="item.remark" readonly></v-text-field>
                  </template>

              </v-data-table>
              <v-row>
                  <v-col md="2">
                      <span style="font-size: large">合计：</span>
                  </v-col>
                  <v-col md="3">
                      <v-text-field v-model="moneyTotal" label="应收合计" readonly dense></v-text-field>
                  </v-col>
                  <v-col md="3">
                      <v-text-field v-model="arrearageTotal" label="欠费合计" readonly dense></v-text-field>
                  </v-col>
                  <v-col md="3">
                      <v-text-field v-model="collectSuperiorItem.collectMoneyTotal" label="收款合计" readonly dense></v-text-field>
                  </v-col>
              </v-row>
          </v-card-text>
      </v-card>
  </div>
</template>
<script>
import {selectCollectSuperiorById} from "@/api/zuJinCollect";

export default {
    name:'1320297',
    props: {
        frameId: String,
    },
    data:() => ({
        collectSuperiorItem:{
            collectCompanyName : null,
            collectCompanyOpenAccount : null,
            collectCompanyBankNumber: null,
            collectMoneyTotal:0,
            remark:null,
            state:0,
            zuJinCollectList:[],
            concatBillList:[],
            staff:{
                name:null,
            },
        },
        headers: [
            {text: '铺位号', value: 'room'},
            {text: '品牌', value: 'brand'},
            {text: '费用名称', value: 'name'},
            {text: '区间开始日期', value: 'startDate'},
            {text: '区间截止日期', value: 'endDate'},
            {text: '应收日期', value: 'payEndDate'},
            {text: '应收金额', value: 'money'},
            {text: '已收金额', value: 'payMoney'},
            {text: '已退金额', value: 'backMoney'},
            {text: '抵扣金额', value: 'sjMoney'},
            {text: '欠费金额', value: 'arrearage'},
            // {text: '合同类型', value: 'concatType'},
            // {text: '开票状态', value: 'invoiceState'},
            {text: '本次收款金额', value: 'collectMoney'},
            {text: '收款日期', value: 'collectDate'},
            {text: '备注说明', value: 'remark'},
        ],
        //合计
        moneyTotal:0,
        arrearageTotal:0,
    }),
    created() {
        this.reset()
        this.loadData()
    },

    watch:{
        frameId: {
            handler() {
                this.reset();
                this.loadData();
            },
            deep: true,
        },
    },
    methods:{
        loadData(){
            selectCollectSuperiorById({id:this.frameId}).then(res => {
                this.collectSuperiorItem = res
                this.moneyTotal = 0
                this.arrearageTotal = 0
                for (let a = 0;a < this.collectSuperiorItem.concatBillList.length;a++){
                    this.moneyTotal = (Number(this.moneyTotal) + Number(this.collectSuperiorItem.concatBillList[a].money)).toFixed(2)
                    this.arrearageTotal = (Number(this.arrearageTotal) + Number(this.collectSuperiorItem.concatBillList[a].arrearage)).toFixed(2)
                }
            })
        },
        reset(){
            this.deductionSuperiorRecordItem = {
                collectCompanyName : null,
                collectCompanyOpenAccount : null,
                collectCompanyBankNumber: null,
                collectMoneyTotal:0,
                remark:null,
                state:0,
                zuJinCollectList:[],
                concatBillList:[],
                staff:null,
            }
        },
        formatConcat(state) {
            switch (state) {
                case '0':
                    return '租赁合同'
                case '2':
                    return '多经类合同'
                case '1':
                    return '物业合同'
            }
        },
        formatState(state) {
            switch (state) {
                case 'wait':
                    return '未支付'
                case 'pay':
                    return '部分支付'
                case '1':
                    return '已支付'
            }
        },
        formatInvoiceState(state) {
            switch (state) {
                case 1:
                    return '已开票'
                default:
                case 0:
                    return '未开票'
            }
        },
    }
}
</script>