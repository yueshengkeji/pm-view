<template>
  <div>
    <v-form ref="paymentForm">
      <v-row dense>
        <v-col lg="4" md="4" cols="12" v-if="showCompany">
          <v-text-field dense label="供应单位" v-model="data.company.name"></v-text-field>
        </v-col>
        <v-col lg="6" md="6" cols="10" v-if="showCompany">
          <v-text-field dense label="订单名称" v-model="data.pmNumber"></v-text-field>
        </v-col>
        <v-col lg="2" md="2" cols="2">
          <v-text-field dense label="采购员" v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field dense label="货运地址" v-model="data.city.name"></v-text-field>
        </v-col>
        <v-col lg="2" md="2">
          <v-text-field dense label="采购日期" v-model="data.pmDate"></v-text-field>
        </v-col>
        <v-col lg="2" md="2">
          <v-text-field dense label="采购单位" color="error" error v-model="data.proCompany"></v-text-field>
        </v-col>
        <v-col lg="2" md="2">
          <v-text-field dense label="优惠后总额" color="primary" primary v-model="data.saleMoney"></v-text-field>
        </v-col>
        <v-col lg="6" md="6" cols="12">
          <v-textarea style="margin-top:-2px;" rows="1" dense label="备注" v-model="data.remark"></v-textarea>
        </v-col>
      </v-row>
      <v-data-table
          :loading="loading"
          :items="data.material"
          :headers="headers"
          :show-select="select"
          v-model="selectItems"
          style="height: auto;min-height: 290px;"
          dense
          @click:row="selectRow"
          :items-per-page="10000"
          hide-default-footer>
        <template v-slot:item.applyPrice="props">
          <v-chip color="error"
                  outlined
                  small
                  label
                  v-if="props.item.applyPrice <= props.item.priceTax">
            {{ props.item.applyPrice }}
          </v-chip>
          <v-chip small color="success" outlined v-else label>{{ props.item.applyPrice }}</v-chip>
        </template>
        <template v-slot:item.priceTax="props2">
          <v-chip small color="error" outlined label v-if="props2.item.applyPrice <= props2.item.priceTax">
            {{ props2.item.priceTax }}
          </v-chip>
          <v-chip small color="success" outlined label v-else>{{ props2.item.priceTax }}</v-chip>
        </template>
        <template v-slot:item.remark="{item}">
          <div class="text-no-wrap text-truncate" style="width: 100px" @mouseout="hideTooltip" @mouseover="showTooltip($event,item)">
            {{ item.remark }}
          </div>
        </template>
        <template v-slot:footer>
          <table style="width: 100%">
            <tr>
              <td colspan="2" style="width:22%">合计:</td>
              <td style="width:15%"></td>
              <td style="width:9%"></td>
              <td style="width:8%"></td>
              <td style="width:5%"></td>
              <td style="width:8%"></td>
              <td style="width:8%">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip small color="primary" outlined label v-bind="attrs" v-on="on">
                      {{ data.avgMoneys }}
                    </v-chip>
                  </template>
                  <v-chip small color="white" outlined label>成本合计：{{ data.avgMoneys }}</v-chip>
                </v-tooltip>
              </td>
              <td style="width:9%">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip small color="primary" outlined label v-bind="attrs" v-on="on">
                      {{ data.proMoney }}
                    </v-chip>
                  </template>
                  <v-chip small color="white" outlined label>采购合计：{{ data.proMoney }}</v-chip>
                </v-tooltip>
              </td>
              <td style="width:10%">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip small color="primary" outlined label v-bind="attrs" v-on="on">
                      {{ data.saleMoney }}
                    </v-chip>
                  </template>
                  <v-chip small color="white" outlined label>优惠后合计：{{ data.saleMoney }}</v-chip>
                </v-tooltip>
              </td>
              <td style="width:5%"></td>
            </tr>
          </table>
        </template>
      </v-data-table>
      <v-tooltip max-width="500px" :close-delay="3000" bottom absolute :position-y="tooltipY" :position-x="tooltipX" v-model="msgFlag">
        <div v-html="msg"></div>
      </v-tooltip>
    </v-form>
  </div>
</template>

<script>
import {loadById} from '@/api/procurement'
import {getConfig, list as scList} from '@/api/systemConfig'
// 172.20.0.103    255.255.0.0    172.20.0.1
//172.20.0.3  - 172.20.0.9   admin
export default {
  name: "frame-15306",
  props: {
    frameId: String,
    select: Boolean,
    frameCoding: String
  },
  watch: {
    frameId: {
      handler() {
        this.reset();
        this.loadData();
      },
      deep: true,
    },
    selectItems: {
      handler() {
        this.$emit("selectItems", this.selectItems)
      }
    }
  },
  //
  data: () => ({
    loading:false,
    tooltipX: 0,
    tooltipY: 0,
    msgFlag: false,
    thanTooltip: null,
    msg: null,
    selectItems: [],
    data: null,
    headers: [
      {text: "序号", value: 'index', width: '6%'},
      {text: "材料名称", value: 'material.name', width: '20%'},
      {text: "型号", value: 'material.model', width: '15%'},
      {text: "单位", value: 'material.unit.name', width: '9%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "计划数量", value: 'planSum', width: '5%'},
      {text: "采购数量", value: 'sum', width: '5%'},
      {text: "成本单价", value: 'applyPrice', width: '8%'},
      {text: "采购单价", value: 'priceTax', width: '8%'},
      {text: "金额", value: 'moneyTax', width: '9%'},
      {text: "备注", value: 'remark', width: '10%'},
    ],
    showCompany: false,
    companyTypeList: []
  }),
  created() {
    let lkey = "PC_ROLE_VALUE" + this.dateFormat(new Date(), "YYYY-mm-dd")
    let prv = window.localStorage.getItem(lkey)
    if (prv != undefined && prv != "") {
      if (prv.indexOf(this.$store.state.user.name) != -1) {
        this.showCompany = true
      }
    } else {
      getConfig("PC_ROLE").then(result => {
        if (result && result.value.indexOf(this.$store.state.user.name) != -1) {
          this.showCompany = true
        }
        if (result) {
          window.localStorage.setItem(lkey, result.value)
        }
      })
      for (let x = -7; x < 0; x++) {
        window.localStorage.removeItem("PC_ROLE_VALUE" + this.dateAfter(x))
      }
    }

    getConfig('PRO_COMPANY_TYPE').then(c => {
      scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
        if (result.rows.length > 0) {
          result.rows.forEach(item => {
            item.value = item.value || ''
            this.companyTypeList[item.value] = item
          })
          if (this.data && this.data.pm01326) {
            this.data.proCompany = this.companyTypeList[this.data.pm01326].name
          }
        }
      })
    })

    this.reset();
    this.loadData();
  },
  methods: {
    hideTooltip(){
      this.msgFlag = false
    },
    showTooltip(e, item) {
      this.tooltipX = e.clientX
      this.tooltipY = e.clientY + 20
      this.thanTooltip = e.target
      this.msg = item.remark
      this.msgFlag = true
    },
    selectRow(data, param) {
      param.select(!param.isSelected)
    },
    loadData() {
      this.loading = true
      loadById(this.frameId).then(procurement => {
        if (procurement != null) {
          if (procurement.city == null) {
            procurement.city = {name: null};
          }
          procurement.proMoney = 0.0;
          procurement.avgMoneys = 0.0;
          procurement.material.forEach((mater, index) => {
            mater.index = index + 1;
            procurement.proMoney += mater.moneyTax;
            procurement.avgMoneys += mater.sum * mater.applyPrice;
          })
          procurement.proMoney = procurement.proMoney.toFixed(2);
          procurement.avgMoneys = procurement.avgMoneys.toFixed(2);
          if (procurement.pm01326 == "true") {
            procurement.pm01326 = ''
          }
          try {
            procurement.proCompany = this.companyTypeList[procurement.pm01326].name
          } catch (e) {
            console.log(e)
          }
          if (procurement.saleMoney == 0 || procurement.saleMoney == "") {
            procurement.saleMoney = "无优惠";
          }
          this.data = procurement;
          this.$emit("loadSuccess", this.data)
        }
      }).finally(() => this.loading = false)
    },
    reset() {
      this.data = {
        company: {name: null},
        city: {name: null},
        staff: {name: null},
        pmNumber: null,
        proCompany: null,
        pmDate: null,
        proMoney: 0,
        material: []
      }
    }
  }
}
</script>

<style scoped>

</style>