<template>
  <div>
    <div>
      <v-row>
        <v-col>
          <v-data-table
              :headers="headers"
              :items-per-page="query.pageSize"
              :server-items-length="query.total"
              :options.sync="options"
              sort-by="date"
              sort-desc
              :items="items">
            <template v-slot:item.date="{item}">
              {{ dateFormat(new Date(item.date), 'mm-dd HH:MM') }}
            </template>
            <template v-slot:item.actions="{item}">
              <v-btn small @click="close(item)" title="关闭该询价单，禁止供应商再次报价">关闭</v-btn>
              <v-btn small @click="detail(item)" color="primary" class="mr-1">明细</v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </div>
    <v-dialog v-model="showQuotes" fullscreen>
      <v-card class="pa-5">
        <v-row class="pa-1">
          <v-col lg="2" md="2" sm="3" cols="12">
            <v-text-field v-model="search" autocapitalize="off" label="搜索"></v-text-field>
          </v-col>
          <v-col lg="6" md="7" sm="8" cols="12">
            <v-chip>成本合计金额:{{ planMoney }}</v-chip>
            <v-chip>报价合计金额:{{ quoteMoney }}</v-chip>
            <v-chip>材料总数:{{ materialSum }}</v-chip>
          </v-col>
        </v-row>
        <v-data-table
            @current-items="currentItems"
            @click:row="clickHandler"
            @input="selected"
            show-select
            :search="search"
            selectable-key="id"
            height="400px"
            :items-per-page="-1"
            :headers="headers2"
            :items="quoteList">
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="toProcurement"
                 :disabled="selectList.length <= 0"
                 color="primary">申请采购
          </v-btn>
          <v-btn @click="showQuotes = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {closeEnquiry, list, queryQuote} from '@/api/queryEnquiry'

export default {
  name: "list",
  data: () => ({
    items: [],
    query: {
      total: 0,
      pageSize: 10,
      pageNumber: 1,
      str: null,
      order: null,
    },
    headers: [
      {text: '序号', value: 'index', width: '8%'},
      {text: '标题', value: 'name', width: '40%'},
      {text: '日期', value: 'date', width: '15%'},
      {text: '询价人', value: 'staff.name', width: '10%'},
      {text: '报价数', value: 'quoteCount', width: '10%'},
      {text: '操作', value: 'actions', width: '22%'},
    ],
    options: {},
    quoteList: [],
    headers2: [
      {text: '材料名称', value: 'enquiryMater.material.name', width: '15%'},
      {text: '型号', value: 'enquiryMater.material.model', width: '15%'},
      {text: '品牌', value: 'enquiryMater.material.brand'},
      {text: '单位', value: 'enquiryMater.material.unit.name'},
      {text: '报价人', value: 'name'},
      {text: '联系方式', value: 'tel'},
      {text: '采购数', value: 'enquiryMater.num'},
      {text: '成本单价', value: 'enquiryMater.price'},
      {text: '单价', value: 'price'},
      {text: '总价', value: 'money'},
      {text: '备注', value: 'remark', width: '15%'},
    ],
    selectList: [],
    search: null,
    planMoney: 0,
    quoteMoney: 0,
    materialSum: 0,

    showQuotes: false,
    item:null,
  }),
  watch: {
    options: {
      handler() {
        this.list();
      },
      deep: true
    }
  },
  created() {
    // this.list()
  },
  methods: {
    currentItems(items) {
      this.materialSum = items.length;
      this.planMoney = 0;
      this.quoteMoney = 0;
      items.forEach(item => {
        this.planMoney += item.enquiryMater.num * item.enquiryMater.price
        this.quoteMoney += item.money
      })
      this.planMoney = this.planMoney.toFixed(2);
      this.quoteMoney = this.quoteMoney.toFixed(2);
    },
    clickHandler(data, param) {
      param.select(!param.isSelected)
    },
    toProcurement() {
      this.genProV2();
    },
    selected(items) {
      this.selectList = items;
    },
    close(item) {
      closeEnquiry(1, item.id).then(this.list());
    },
    detail(item) {
      this.item = item
      queryQuote(item.id).then(quotes => {
        quotes.forEach(item => {
          if (item.remark == "undefined") {
            item.remark = "";
          }
          if (item.money <= 0) {
            item.money = item.enquiryMater.num * item.price;
          } else if(item.price == null || item.price == 'NaN') {
            item.price = (item.money / item.enquiryMater.num).toFixed(2);
          }
        })
        this.quoteList = quotes;
        this.showQuotes = true;
      })
    },
    list() {
      let sortName = this.options.sortBy[0];
      let sortOrder = this.options.sortDesc[0];
      this.query.sortName = sortName;
      this.query.sortOrder = sortOrder ? "DESC" : "ASC";
      this.query.pageSize = this.options.itemsPerPage
      this.query.pageNumber = this.options.page
      list(this.query).then(data => {
        data.rows.forEach((item, idx) => {
          item.index = idx + 1;
        })
        this.items = data.rows;
        this.query.total = data.total;
      })
    },
    genProV2() {
      if (this.selectList.length <= 0) {
        this.msg = "请选择购买材料"
        this.msgShow = true
      } else {
        this.insertProcurement = {
          company: {name: this.selectList[0].company},
          city: {name: null},
          staff: {name: this.$store.state.user.name, id: this.$store.state.user.id},
          pmNumber: this.item.apply.project.name,
          proCompany: '',
          pmDate: null,
          proMoney: 0,
          material: [],
          projectLeader: this.item.apply.staff
        }
        let x = 1
        this.selectList.forEach(item => {
          let tm = this.createProMaterial(item, x++)
          this.insertProcurement.material.push(tm)
        })

        let id = this.uuid()
        sessionStorage.setItem(id, JSON.stringify(this.insertProcurement))
        window.open(this.$router.options.base + 'procurement/form/insert/' + id)
      }
    },
    createProMaterial(queryItem, x) {
      let item = queryItem.applyMaterial
      return {
        material: queryItem.enquiryMater.material,
        //本次采购数 = 申请数 - 已采购数
        sum: item.sum - item.ySum,
        //默认申请单价 = 设计成本单价
        applyPrice: item.planPrice,
        //默认采购单价 = 供应商报价价格
        priceTax: queryItem.price,
        //默认采购总金额 = 设计成本总金额
        moneyTax: queryItem.money,
        remark: item.remark,
        index: x,
        ySum: item.ySum,
        //默认到货日期
        dhDate: '',
        major: item.major
      }
    },
    appendValue(form, name, value) {
      let element = document.createElement("input");
      element.name = name;
      element.value = value;
      form.appendChild(element);
    },
  }
}
</script>

<style scoped>

</style>
