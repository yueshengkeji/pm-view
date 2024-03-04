<template>
  <div>
    <v-card class="pa-3">
      <v-card-title>收款登记</v-card-title>
      <v-form ref="form">
        <v-row>
          <v-col cols="3">
            <v-autocomplete label="客户名称"
                            item-text="brandCompany.name"
                            return-object
                            :search-input.sync="searchConcat"
                            :items.sync="zujinList"
                            v-model="concat"
                            @change="zujinChangeHandler"></v-autocomplete>
          </v-col>
          <v-col cols="3">
            <v-text-field label="铺位号" v-model="d.room"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field label="楼层" v-model="d.floor"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field label="品牌" v-model="d.brand"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-combobox label="费用名称*" v-model="d.name" :items="nameItems"
                        :rules="[v => !!v || '请选择费用名称']"></v-combobox>
          </v-col>
          <v-col cols="3">
            <v-menu v-model="menu" transition="scale-transition" offset-y :close-on-content-click="false"
                    min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="d.payEndDate"
                              :rules="[v => !!v || '请选择应收日期']"
                              label="应收日期*"
                              readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="d.payEndDate" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="3">
            <v-text-field type="number" label="应收金额*" v-model="d.money"
                          :rules="[v => !!v || '请输入应收金额']"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field type="number" label="已收金额" v-model="d.payMoney"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field type="number" label="已退金额" v-model="d.backMoney"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field type="number" label="调整金额" v-model="d.sjMoney"></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-select label="合同类型"
                      :items="concatTypes"
                      v-model="d.concatType"></v-select>
          </v-col>

          <v-col cols="3">
            <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                    min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="d.startDate"
                              label="账单区间开始日期"
                              readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="d.startDate" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="3">
            <v-menu v-model="menu3" transition="scale-transition" offset-y :close-on-content-click="false"
                    min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="d.endDate"
                              label="账单区间截止日期"
                              readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="d.endDate" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="3">
            <v-checkbox label="已开票" v-model="d.invoiceState"></v-checkbox>
          </v-col>
        </v-row>
      </v-form>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn outlined @click="deleteHandler" :disabled="d.id == null" color="error">作废单据</v-btn>
        <v-btn outlined @click="ysHandler" :disabled="d.money <= 0" color="success">确认已收款</v-btn>
        <v-btn @click="saveHandler" color="primary">保存</v-btn>
        <v-btn @click="$emit('close')">关闭</v-btn>
      </v-card-actions>

    </v-card>
  </div>
</template>

<script>
import {insertBill, queryById, zujinList,updateBill,deleteBill} from "@/api/zujin";

export default {
  name: "bill-insert",
  data: () => ({
    searchConcat: null,
    menu: false,
    nameItems: ["租金", "管理费", "推广服务费", "二清管理费", "装修管理费"],
    zujinList: [],
    d: {
      room: null,
      floor: null,
      brand: null,
      name: null,
      payEndDate: null,
      money: null,
      payMoney: null,
      backMoney: null,
      sjMoney: null,
      concatType: null,
      startDate: null,
      endDate: null,
      invoiceState:false
    },
    concatTypes: [
      {value: '0', text: '租赁合同'},
      {value: '2', text: '多经类合同'},
      {value: '1', text: '物业管理'},],
    concat: null,
    menu2: false,
    menu3: false,
  }),
  methods: {
    deleteHandler(){
      this.confirm("确定作废吗？不可恢复").then(()=>{
        deleteBill(this.d.id).then(result=>{
          this.$emit("close", result)
        })
      })
    },
    saveHandler() {
      let valid = this.$refs.form.validate()
      if (valid) {
        let req
        if(this.d.id){
          req = updateBill(this.d)
        }else{
          req = insertBill(this.d)
        }
        req.then(result => {
          this.$emit("close", result)
        }).finally(() => {
          this.reset()
        })
      }
    },
    reset() {
      this.d = {
        room: null,
        floor: null,
        brand: null,
        name: null,
        payEndDate: null,
        money: null,
        payMoney: null,
        backMoney: null,
        sjMoney: null,
        concatType: null,
        startDate: null,
        endDate: null,
      }
    },
    zujinChangeHandler() {
      this.d.concatId = this.concat.id
      this.d.brand = this.concat.brand
      this.d.concatType = this.concat.companyType
      queryById(this.concat.id).then(result => {
        if (result.houses) {
          result.houses.forEach(item => {
            this.d.floor = item.floor
            this.d.room = item.pwNumber
          })
        }
      })
    },
    ysHandler(){
      this.d.payMoney = this.d.sjMoney || this.d.money
      this.saveHandler()
    }
  },
  created() {
    if (this.item) {
      this.d = Object.assign(this.item, {})
    }
  },
  props: {
    item: Object
  },
  model: {
    prop: "item",
    event: "change"
  },
  watch: {
    item: {
      handler() {
        this.d = Object.assign(this.item, {})
      }
    },
    searchConcat(val) {
      zujinList({searchText: val, page: 1, itemsPerPage: 10}).then(result => {
        this.zujinList = result.rows
        console.log("zujinList", this.zujinList)
      })
    },
    d: {
      handler() {
        this.$emit("change", this.d)
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>