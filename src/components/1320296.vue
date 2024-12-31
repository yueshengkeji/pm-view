<template>
  <div>
      <v-card>
          <v-card-title>抵扣登记</v-card-title>
          <v-card-text>
              <v-form>
                  <v-row>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="deductionSuperiorRecordItem.staff.name" label="登记人" readonly dense></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                          <v-text-field v-model="deductionSuperiorRecordItem.deductionMoneyTotal" type="=number" label="抵扣总额" readonly dense></v-text-field>
                      </v-col>
                  </v-row>
                  <v-row>
                      <v-col>
                          <v-text-field v-model="deductionSuperiorRecordItem.remark" label="备注说明" dense readonly></v-text-field>
                      </v-col>
                  </v-row>
              </v-form>
              <v-data-table :items="deductionSuperiorRecordItem.concatBillDeductionList"
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
                  <template v-slot:item.deductionMoney="{item}">
                      <v-text-field v-model="item.deductionMoney" type="number" readonly></v-text-field>
                  </template>
                  <template v-slot:item.remark="{item}">
                      <v-text-field v-model="item.remark" readonly></v-text-field>
                  </template>

              </v-data-table>
          </v-card-text>
      </v-card>

  </div>
</template>
<script>
    import {selectById} from "@/api/deductionSuperiorRecord";

    export default {
      name:'1320296',
        props: {
            frameId: String,
        },
      data:() => ({
          deductionSuperiorRecordItem:{
              deductionMoneyTotal:0,
              remark:null,
              state:0,
              deductionRecordList:[],
              concatBillDeductionList:[],
              staff:{name:null}
          },
          headers: [
              {text: '铺位号', value: 'room'},
              {text: '品牌', value: 'brand'},
              {text: '费用名称', value: 'name'},
              {text: '应收日期', value: 'payEndDate'},
              {text: '应收金额', value: 'money'},
              {text: '已收金额', value: 'payMoney'},
              {text: '已退金额', value: 'backMoney'},
              {text: '抵扣金额', value: 'sjMoney'},
              {text: '减免金额', value: 'reduce'},
              {text: '欠费金额', value: 'arrearage'},
              {text: '开票状态', value: 'invoiceState'},
              {text: '申请抵扣金额', value: 'deductionMoney'},
              {text: '申请抵扣说明', value: 'remark'},
          ],
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
              selectById({id:this.frameId}).then(res => {
                  this.deductionSuperiorRecordItem = res
              })
          },
          reset(){
              this.deductionSuperiorRecordItem = {
                  deductionMoneyTotal:0,
                  remark:null,
                  state:0,
                  deductionRecordList:[],
                  concatBillDeductionList:[],
                  staff:{name:null}
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