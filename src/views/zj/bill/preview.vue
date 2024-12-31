<template>
  <v-card class="pa-3">
    <v-data-table :loading="loading"
                  :items="previewItems"
                  :headers="previewHeader"
                  :items-per-page="-1"
                  show-group-by
                  group-by="name"
                  sort-by="payEndDate"
                  hide-default-footer>
      <template v-slot:group.summary="{group,items}">
        <td colspan="3">{{ group }}合计</td>
        <td>{{ formatSummary(items) }}</td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import {previewBill} from "@/api/zujin";

export default {
  name: "bill-preview",
  props: {
    concatId: null
  },
  data: () => ({
    loading: false,
    previewItems: [],
    previewHeader: [
      {text: '费用名称', value: 'name'},
      {text: '应收日期', value: 'payEndDate'},
      {text: '区间开始日期', value: 'startDate'},
      {text: '区间截止日期', value: 'endDate'},
      {text: '应收金额', value: 'money'}
    ],
  }),
  watch: {
    concatId() {
      this.list()
    }
  },
  created() {
    this.list()
  },
  methods: {
    formatSummary(items) {
      let money = 0
      items.forEach(val => {
        money += val.money
      })
      return money.toFixed(2)
    },
    list() {
      if (this.concatId) {
        this.loading = true
        previewBill(this.concatId).then(result => {
          console.log("previewItems", result)
          this.previewItems = result
        }).finally(() => this.loading = false)
      }
    }
  }
}
</script>

<style scoped>

</style>