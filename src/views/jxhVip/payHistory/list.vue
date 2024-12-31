<template>
  <v-card>
    <v-data-table
        :headers="headers"
        :items="data.rows"
        :options.sync="options"
        :server-items-length="data.total"
        class="elevation-1"
    >
      <template v-slot:item.payState="{item}">
        {{ item.payState == 0 ? '待支付' : '已支付' }}
      </template>
      <template v-slot:item.payAmount="{item}">
        {{ (item.payAmount / 100).toFixed(2) }}
      </template>
      <template v-slot:item.payTimeStamp="{item}">
        {{ formatTimestamp(item.payTimeStamp) }}
      </template>

    </v-data-table>
  </v-card>
</template>
<script>
import {list} from "@/api/jxhPayHistory";

export default {
  name: 'jxhVipPayHistory',
  data: () => ({
    headers: [
      {text: '手机号', value: 'userTel', sortable: false},
      {text: '付款状态', value: 'payState', sortable: false},
      {text: '付款金额', value: 'payAmount', sortable: false},
      {text: '支付说明', value: 'remark', sortable: false},
      {text: '商户订单号', value: 'outTradeNo', sortable: false},
      {text: '微信订单号', value: 'tradeNo', sortable: false},
      {text: '支付时间', value: 'payTimeStamp', sortable: false},
    ],
    options: {},
    data: {
      rows: [],
      total: 0
    },
    queryParams: {
      page: 1,
      itemsPerPage: 10,
      userId: null
    },
  }),
  watch: {
    options() {
      this.loadList()
    }
  },

  created() {

  },

  methods: {
    formatTimestamp(datetime) {
      if (datetime) {
        let dt = new Date(datetime)
        return this.dateFormat(dt, 'YYYY-mm-dd HH:MM:SS')
      } else {
        return ''
      }
    },
    loadList() {
      this.queryParams.itemsPerPage = this.options.itemsPerPage
      this.queryParams.page = this.options.page
      list(this.queryParams).then(res => {
        this.data = res
      })
    },
    resetQueryParams() {
      this.queryParams = {
        page: 1,
        itemsPerPage: 10,
        userId: null
      }
    }
  }
}
</script>