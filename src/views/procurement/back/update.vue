<template>
  <div>
    <v-card class="pa-3">
      <v-card-title>
        供应商退货详情
      </v-card-title>

      <v-form ref="backForm" disabled>
        <v-row>
          <v-col md="3" cols="12">
            <v-text-field label="退库单号" v-model="back.title" :rules="rules.title"></v-text-field>
          </v-col>
          <v-col md="3" cols="12">
            <select-company :dense="false" label="退库单位" v-model="back.company"
                            :rules="rules.company"></select-company>
          </v-col>
          <v-col md="6" cols="12">
            <v-text-field label="退库原因" v-model="back.remark" :rules="rules.remark"></v-text-field>
          </v-col>
          <v-col md="3" cols="12">
            <v-menu v-model="menu" transition="scale-transition" offset-y :close-on-content-click="false"
                    min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="back.backDatetime"
                              :rules="rules.backDatetime" label="退库时间" hide-details
                              readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="back.backDatetime" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col md="2" cols="12">
            <v-text-field label="退库人员" v-model="back.staff.name"></v-text-field>
          </v-col>
          <v-col md="2" cols="12">
            <v-text-field label="退库总额" v-model="back.money" readonly></v-text-field>
          </v-col>
          <v-col md="2" cols="12">
            <v-text-field label="税率" v-model="back.tax" readonly></v-text-field>
          </v-col>
          <v-col md="2" cols="12">
            <v-checkbox label="回滚申请单数量" v-model="back.toApply"></v-checkbox>
          </v-col>
        </v-row>

        <v-data-table :items="materList" :headers="headers" hide-default-footer>
          <template v-slot:item.idx="{index}">
            {{ index + 1 }}
          </template>
          <template v-slot:item.sum="{item}">
            <v-text-field @input="sumHandler(item)"
                          type="number"
                          :error="item.error"
                          hide-details
                          dense
                          v-model="item.sum"></v-text-field>
          </template>
          <template v-slot:item.price="{item}">
            <v-text-field type="number" @input="sumHandler(item)"
                          hide-details dense v-model="item.price"></v-text-field>
          </template>
        </v-data-table>
      </v-form>

      <v-card-actions>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="proDialog">
      <v-card class="pa-3">

        <v-data-table v-model="selectItems" :headers="proHeaders" :items="proItems" hide-default-footer
                      show-select></v-data-table>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="proDialog=false">取消</v-btn>
          <v-btn @click="proHandler" color="primary" :disabled="selectItems.length === 0" :loading="loading">确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SelectCompany from "@/views/company/select.vue"
import {loadById} from '@/api/procurement'
import {insert, loadById as loadBack} from '@/api/proBack'

export default {
  name: "back-insert",
  components: {SelectCompany},
  data: () => ({
    loading: false,
    selectItems: [],
    pro: null,
    proItems: [],
    proHeaders: [
      {text: "序号", value: 'index', width: '6%'},
      {text: "材料名称", value: 'material.name', width: '20%'},
      {text: "型号", value: 'material.model', width: '15%'},
      {text: "单位", value: 'material.unit.name', width: '9%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "采购总数", value: 'sum', width: '8%'},
      {text: "已入库数量", value: 'inSum', width: '10%'},
      {text: "本次入库数量", value: 'putSum', width: '10%'},
      {text: "采购单价", value: 'priceTax', width: '8%'},
      {text: "金额", value: 'moneyTax', width: '9%'},
    ],
    proDialog: false,
    menu: false,
    headers: [
      {text: '序号', value: 'idx'},
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '单位', value: 'material.unit.name'},
      {text: '品牌', value: 'material.brand'},
      {text: '退货数量', value: 'sum'},
      {text: '退货单价', value: 'price'},
      {text: '退货金额', value: 'money'},
      {text: '项目', value: 'project.name'},
    ],
    materList: [],
    rules: {
      title: [v => !!v || '请输入退库标题'],
      remark: [v => !!v || '请输入退库原因'],
      company: [v => !!v || '请选择退库单位'],
      backDatetime: [v => !!v || '请选择退库时间']
    },
    back: null,
  }),
  methods: {
    saveHandler() {
      let valid = this.$refs.backForm.validate()
      if (valid) {
        this.loading = true
        this.back.masterList = this.materList
        insert(this.back).then(() => {
          this.message("操作成功")
          this.$router.push({path: '/procurement/list/list'})
        }).finally(() => this.loading = false)
      }
    },
    sumHandler(item) {
      if (item.sum != '' && item.price != '') {
        item.money = item.sum * item.price
      }

      this.updateMoney()
    },
    updateMoney() {
      let m = 0
      this.materList.forEach(item => {
        if (item.money) {
          m += item.money
        }
      })
      this.back.money = m.toFixed(2)
    },
    proHandler() {
      this.selectItems.forEach(val => {
        let backMater = {
          sum: val.sum - val.inSum,
          material: val.material,
          price: val.priceTax,
          money: val.moneyTax,
          project: val.project,
          proRowId: val.id
        }
        this.materList.push(backMater)
      })

      this.updateMoney()
      this.proDialog = false
    },
    loadPro(id) {
      loadById(id).then(result => {
        this.pro = result
        this.back.tax = this.pro.tax
        this.back.title = this.pro.pmNumber
        this.back.company = this.pro.company
        this.back.proId = this.pro.id
        this.proItems = result.material

        this.proDialog = true
      })
    },
    reset() {
      this.back = {
        title: null,
        remark: null,
        backDatetime: this.dateFormat(new Date(), 'YYYY-mm-dd'),
        money: null,
        company: null,
        toApply: null,
        tax: null,
        staff: {name: this.$store.state.user.name},
        state: 1
      }
    },
    load(id) {
      loadBack(id).then(result => {
        this.materList = result.masterList
        this.back = result
      })
    }
  },
  created() {
    this.reset()
    let id = this.$route.params.id
    this.load(id)
  },
}
</script>

<style scoped>

</style>