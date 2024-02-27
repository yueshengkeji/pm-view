<template>
  <div>
    <v-data-table :items="items"
                  :headers="headers"
                  hide-default-footer
                  :items-per-page="-1">
      <template v-slot:item.type="{item}">
        {{ formatType(item) }}
      </template>
      <template v-slot:item.payDate="{item}">
        <div v-if="item.type == 0">{{ item.payDate }}</div>
        <div v-if="item.type == 1">{{ item.billDate }}</div>
      </template>
      <template v-slot:item.action="{item}">
        <v-btn v-if="item.type == 0" :disabled="(!permission || item.disable)" color="success" x-small
               @click="insertHandler(item)">{{ item.disable ? '已登记' : '付款登记' }}
        </v-btn>
        <v-btn v-if="item.type == 1" :disabled="(!permission || item.disable2)" color="success" x-small
               @click="insertHandler(item)">{{ item.disable2 ? '已登记' : '收票登记' }}
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {list} from '@/api/yonyouData'

export default {
  name: "T3DataByPay",
  data: () => ({
    headers: [
      {text: '单据日期', value: 'date'},
      {text: '付款金额', value: 'payMoney'},
      {text: '收票金额', value: 'billMoney'},
      {text: '备注', value: 'remark'},
      {text: '类型', value: 'type'},
      {text: '编号', value: 'payDate'},
      {text: '操作', value: 'action'},
    ],
    items: []
  }),
  props: {
    //数据年份
    dataYear: {
      type: String,
      default: ''
    },
    //会计科目号
    series: {
      type: Array,
    },
    cwMoneyItems: {
      type: Array
    },
    permission: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    series: {
      handler() {
        this.list()
      }
    },
    items: {
      handler() {
        if (this.cwMoneyItems && this.cwMoneyItems.length > 0) {
          this.items.forEach(item => {
            this.cwMoneyItems.forEach(cwItem => {
              if (item.type == 0) {
                if (cwItem.payDate == item.payDate) {
                  this.$set(item, "disable", true)
                }
              } else {
                if (cwItem.billDate == item.billDate) {
                  this.$set(item, "disable2", true)
                }
              }
            })
          })
        }
      },
      deep: true
    }
  },
  created() {
    this.list()
  },
  methods: {
    list() {
      this.items = []
      this.series.forEach(s => {
        list({year: this.dataYear, leaveNumber: s}).then(result => {
          this.items = this.items.concat(JSON.parse(result))
        })
      })
    },
    formatType(item) {
      return item.type === 0 ? '付款' : '收票'
    },
    insertHandler(item) {
      let money = 0
      let type = item.type
      this.items.forEach(item2 => {
        if (item.type == type) {
          if (item.type == 0) {
            if (item2.payDate == item2.payDate) {
              money += item2.payMoney
            }
          } else {
            if (item2.billDate == item.billDate) {
              money += item2.billMoney
            }
          }
        }

      })
      let temp = Object.assign({}, item)
      if (item.type == 0) {
        temp.payMoney = money
      } else {
        temp.billMoney = money
      }
      this.$emit('onclick', temp)
    }
  }
}
</script>

<style scoped>

</style>