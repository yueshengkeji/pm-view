<template>
  <div>
    <div id="printCon">
      <h1 style="text-align: center">{{ title }}-缴费通知单</h1>
      <table>
        <tr>
          <td class="border-black">商户名称</td>
          <td class="border-black" colspan="6">{{ concat.brandCompany.name }}</td>
        </tr>
        <tr>
          <td class="border-black">商铺号</td>
          <td class="border-black" colspan="1">{{ concat.houses[0].pwNumber }}</td>
          <td class="border-black">经营品牌</td>
          <td class="border-black" colspan="1">{{ concat.brand }}</td>
          <td class="border-black">租赁面积</td>
          <td class="border-black" colspan="2">{{ concat.acreage }}</td>
        </tr>
        <tr>
          <td class="border-black">费用名称</td>
          <td class="border-black">金额</td>
          <td class="border-black">期间</td>
          <td class="border-black">缴费截止日期</td>
          <td class="border-black">收款单位</td>
          <td class="border-black">开户行</td>
          <td class="border-black">账户</td>
        </tr>
        <tr v-for="item in billList" :key="item.id">
          <td class="border-black">{{ item.name }}</td>
          <td class="border-black">{{ item.money }}</td>
          <td class="border-black">{{ item.startDate }}-{{ item.endDate }}</td>
          <td class="border-black">{{ item.payEndDate }}</td>
          <td class="border-black">{{ concat.receivedCompany.name }}</td>
          <td class="border-black">{{ concat.receivedCompany.openAccount }}</td>
          <td class="border-black">{{ concat.receivedCompany.bankNumber }}</td>
        </tr>
        <tr>
          <td class="border-black">合计：</td>
          <td class="border-black" colspan="2">{{ payMoney }}</td>
          <td class="border-black">合计(大写)：</td>
          <td class="border-black" colspan="3">{{ upperPayMoney }}</td>
        </tr>
      </table>
      <p>友情提示:请按合同规定时间缴纳相关费用.逾期我公司将按合同约定收取违约金!</p>
      <div style="text-align: right;padding-right: 20px;margin-top: 15px;margin-bottom: 15px">
        <p>{{ title }}</p>
        <p>{{ date }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import {getConfig} from '@/api/systemConfig'
export default {
  name: "payNotify",
  props: {
    billList: [],
    concat: {
      brandCompany: {
        name: null
      },
      houses: [
        {pwNumber: null}
      ]
    },
  },
  data: () => ({
    title: '',
    payMoney: null,
    upperPayMoney: null,
    date: null,
  }),
  methods: {
    setCount() {
      this.payMoney = 0
      this.billList.forEach(val => {
        this.payMoney += val.sjMoney || val.money
      })
      this.payMoney = this.payMoney.toFixed(2)
      this.upperPayMoney = this.parseUpperNum(this.payMoney)
    }
  },
  created() {
    getConfig("NOTIFY_T").then(result=>{
      this.title = result ? result.value : ''
    })
    this.date = this.dateFormat(new Date(), 'YYYY-mm-dd')
    this.setCount()
  },
  watch: {
    billList() {
      this.setCount()
    }
  }
}
</script>

<style scoped>

table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.border-black {
  padding: 5px;
  font-size: 16px;
  border: 1px solid black !important;
}
</style>