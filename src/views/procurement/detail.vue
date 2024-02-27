<template>
  <div>
    <v-form ref="paymentForm" class="pt-3">
      <v-row dense>
        <v-col lg="1" md="1">
          <v-chip color="error" small outlined ripple>{{ data.proCompanyName }}</v-chip>
        </v-col>
        <v-col lg="2" md="2" cols="12">
          <v-text-field dense label="供应单位" v-model="data.company.name"></v-text-field>
        </v-col>
        <v-col lg="2" md="2">
          <v-text-field dense label="合同名称" v-model="data.contract.name"></v-text-field>
        </v-col>
        <v-col lg="1" md="2">
          <v-text-field @focus="$event.target.select()" dense label="税率" v-model="data.tax"></v-text-field>
        </v-col>
        <v-col lg="2" md="2">
          <v-text-field dense label="采购日期" v-model="data.pmDate"></v-text-field>
        </v-col>
        <v-col lg="2" md="2">
          <v-text-field dense label="采购员" v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col lg="1" md="1">
          <v-text-field @focus="$event.target.select()" dense label="优惠后总额" color="primary" primary
                        v-model="data.saleMoney"></v-text-field>
        </v-col>
      </v-row>
      <v-data-table
          :hide-default-header="hideHeader"
          :loading="loading"
          :items="data.material"
          :headers="headers"
          style="height: auto;min-height: 380px;"
          dense
          :items-per-page="10000"
          hide-default-footer>
        <template v-slot:item.material.name="{item}">
          <v-tooltip color="warning">
            <template v-slot:activator="{on,attrs}">
              <div class="overflow-hidden" :style="{maxHeight:maxHeight+'px'}" v-bind="attrs" v-on="on">
                {{ item.material.name }}
              </div>
            </template>
            <div>{{ item.material.name }}</div>
          </v-tooltip>
        </template>
        <template v-slot:item.material.model="{item}">
          <v-tooltip color="warning">
            <template v-slot:activator="{on,attrs}">
              <div class="overflow-hidden" :style="{maxHeight:maxHeight+'px'}" v-bind="attrs" v-on="on">
                {{ item.material.model }}
              </div>
            </template>
            <div>{{ item.material.model }}</div>
          </v-tooltip>
        </template>
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
        <template v-slot:item.taxMoney="{item}">
          <span>{{ item.taxMoney.toFixed(2) }}</span>
        </template>
        <template v-slot:item.remark="{item}">
          <v-tooltip color="warning">
            <template v-slot:activator="{on,attrs}">
              <div class="overflow-hidden" :style="{maxHeight:maxHeight+'px'}" v-bind="attrs" v-on="on">
                {{ item.remark }}
              </div>
            </template>
            <div>{{ item.remark }}</div>
          </v-tooltip>
        </template>
        <template v-slot:item.inSum="{item}">
          <div v-if="item.inSum <= 0">{{ item.inSum }}</div>
          <a v-else target="_blank"
             :href="$router.options.base+'storage/put/detailByProMaterId/'+item.id+'/'+data.id">{{ item.inSum }}</a>
        </template>
        <template v-slot:item.ySum="{item}">
          <div v-if="item.ySum <= 0">{{ item.ySum }}</div>
          <a v-else @click="applyDetailHandler(item.major)">
            {{ item.ySum }}</a>
        </template>
        <template v-slot:footer>
          <table style="width: 100%">
            <tr class="bottom-border-table top-border-table">
              <td style="width:6%">合计:</td>
              <td style="width:25%"></td>
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
                  <v-chip color="white" outlined label>采购合计：{{ data.proMoney }}</v-chip>
                </v-tooltip>
              </td>
              <td style="width:10%"></td>
              <td style="width:5%"></td>
            </tr>
            <tr class="bottom-border-table">
              <td style="width:6%">地址:</td>
              <td class="text-left" style="width:32%" colspan="8">{{ item.city.name }}</td>
            </tr>

            <tr class="bottom-border-table">
              <td style="width:6%">项目:</td>
              <td class="text-left" style="width:32%" colspan="3">{{ projectRemark }}</td>
              <td style="width:5%"></td>
              <td style="width:8%"></td>
              <td style="width:8%"></td>
              <td style="width:9%"></td>
              <td style="width:10%"></td>
              <td style="width:5%">
                <div id="approve-flag" v-if="data.state === 1">{{ companyName }}<br>采购专用章</div>
                <div style="position: absolute;right: 0px;bottom:45px" v-if="data.state === 1">
                  <canvas id="code" ref="code" :style="'width: 150px;height:15px;display:inline-table'"></canvas>
                  <p class="pl-5 text-caption" style="line-height: 1;">扫码上传物流<br/>发票等信息
                  </p>
                </div>
              </td>
            </tr>
            <tr class="bottom-border-table">
              <td colspan="12" class="red--text">送货时请附带随货清单(不带采购金额)，并将物流信息发给采购员</td>
            </tr>
          </table>
        </template>
      </v-data-table>
    </v-form>

    <instance-detail :frame="applyId" @close="closeInstanceHandler"></instance-detail>
  </div>
</template>

<script>
import {getConfig, list as scList} from '@/api/systemConfig'
import {getAllMaterial, getApproveImg} from '@/api/procurement'
import {getApplyByMaterialId} from '@/api/apply'
import QRCode from "qrcode"


export default {
  name: "procurementDetail",
  components: {
    instanceDetail: () => import('@/components/easyflow/instance-detail')
  },
  props: {
    item: Object,
    socketData: null
  },
  model: {
    prop: 'item',
    event: 'change'
  },
  watch: {
  socketData:{
    handler(val) {
            if(val.type == "upp"){
                this.loadData(true)
            }
          },
  },
    item: {
      handler() {
        if (this.item.id != this.data.id) {
          this.reset();
        }
      },
      deep: true,
    },
    hideHeader: {
      handler() {
        localStorage.setItem("hideHeader", this.hideHeader)
      },
    }
  },
  data: () => ({
    data: null,
    headers: [
      {text: "序号", value: 'index', width: '5%'},
      {text: "材料名称", value: 'material.name', width: '20%'},
      {text: "型号", value: 'material.model', width: '20%'},
      {text: "单位", value: 'material.unit.name', width: '7%'},
      {text: "品牌", value: 'material.brand', width: '8%'},
      {text: "采购数量", value: 'sum', width: '5%'},
      {text: "已入库", value: 'inSum', width: '5%'},
      {text: "成本", value: 'applyPrice', width: '8%'},
      {text: "单价", value: 'priceTax', width: '8%'},
      {text: "金额", value: 'moneyTax', width: '9%'},
      {text: "税额", value: 'taxMoney', width: '9%'},
      {text: "备注", value: 'remark', width: '10%'},
      {text: "申请", value: 'ySum', width: '10%'}
    ],
    hideHeader: false,
    projectRemark: null,
    companyTypeList: [],
    showAvgMoney: false,
    imgPath: null,
    maxHeight: 30,
    companyName: null,
    loading: false,
    tempMap: [],
    applyId: null
  }),
  created() {
    this.hideHeader = localStorage.getItem('hideHeader') == "true"
    this.loadConfig()
    this.reset();

    this.$nextTick(() => {
          window.onfocus = () => {
            if (localStorage.getItem("upp") == "1") {
              this.loadData(true)
              localStorage.setItem("upp","0")
            }
          }
        })
  },
  methods: {
    closeInstanceHandler(isClose) {
      if (!isClose) {
        this.applyId = null
      }
    },
    applyDetailHandler(applyDetailMajor) {
      getApplyByMaterialId(applyDetailMajor).then(result => {
        this.applyId = result.id
      })
    },
    switchRemark() {
      if (this.headers.length == 13) {
        this.headers.splice(this.headers.length - 2, 1)
        return true
      } else {
        this.headers.splice(this.headers.length - 2, 0, {text: "备注", value: 'remark', width: '10%'})
        return false
      }

    },
    loadImgSuccess(data, img) {
      this.imgPath = img
      this.$emit("loadSuccess", data, img)
      this.showAvg()
    },
    switchHeader() {
      return this.hideHeader = !this.hideHeader
    },
    switchHeight() {
      if (this.maxHeight === 30) {
        this.maxHeight = 1000
      } else {
        this.maxHeight = 30
      }
      return this.maxHeight
    },
    createCode() {
      if (this.data.state === 1) {
        let timeout = 80
        if (this.$refs.code == null) {
          timeout = 500
        }
        window.setTimeout(() => {
          this.$nextTick(() => {
            let width = 150,
                height = 150;
            let url = this.$store.state.api.apiUrl + this.$router.options.base + `procurement/express/${this.data.id}`
            this.$refs.code.innerHTML = ''
            QRCode.toCanvas(
                document.getElementById('code'),
                url,
                {width, height, toSJISFunc: QRCode.toSJIS},
                error => {
                  console.log(error)
                }
            );
          })
        }, timeout)
      }
    },
    getImgPath() {
      if (this.imgPath == null) {
        return null
      } else {
        return this.imgPath
      }
    },
    loadConfig() {
      getConfig('PRO_COMPANY_TYPE').then(c => {
        scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
          if (result.rows.length > 0) {
            result.rows.forEach(item => {
              item.value = item.value || ''
            })
            this.companyTypeList = result.rows
          }
        })
      })
    },
    setMaterial(procurement) {
      procurement.material.forEach((mater, index) => {
        mater.index = index + 1;
        procurement.proMoney += mater.moneyTax;
        procurement.avgMoneys += mater.sum * mater.applyPrice;

        if (mater.project && this.projectRemark === "" && mater.project.name) {
          this.projectRemark = mater.project.name
        }
      })
      procurement.proMoney = procurement.proMoney.toFixed(2);
      procurement.avgMoneys = procurement.avgMoneys.toFixed(2);
    },
    loadSuccess(procurement) {
      if (procurement.pm01326 == '1') {
        procurement.proCompanyName = '子公司采购'
        this.companyName = '子公司名称'
      } else {
        procurement.proCompanyName = '默认采购'
        this.companyName = this.$store.state.api.cname
      }
      if (procurement.saleMoney == 0 || procurement.saleMoney == "") {
        procurement.saleMoney = "无优惠"
      }
      if (procurement.state === 1) {
        if (this.tempMap[procurement.id]) {
          this.loadImgSuccess(procurement, this.tempMap[procurement.id])
        } else {
          getApproveImg(procurement.id).then(result => {
            if (result) {
              result = 'data:image/png;base64,' + result
              this.tempMap[procurement.id] = result
              this.loadImgSuccess(procurement, result)
            } else {
              this.loadImgSuccess(procurement, null)
            }
          })
        }
      } else {
        this.$emit("loadSuccess", procurement)
        this.showAvg()
      }

    },
    loadData(foc) {
      this.projectRemark = ""
      let procurement = this.data
      if (procurement != null) {
        this.createCode()
        if (procurement.city == null) {
          procurement.city = {name: null};
        }
        procurement.proMoney = 0.0;
        procurement.avgMoneys = 0.0;
        if (procurement.material == null || foc || procurement.material.length <= 0) {
          this.loading = true
          getAllMaterial(procurement.id,true).then(result => {
            this.$set(procurement, 'material', result)
            this.setMaterial(procurement);
            this.loadSuccess(procurement);
          }).finally(() => this.loading = false)
        } else {
          this.setMaterial(procurement);
          this.loadSuccess(procurement);
        }
      }
    },
    reset() {
      let temp = Object.assign(this.item,{})
      if (!temp.contract) {
        temp.contract = {}
      }
      if(!temp.material){
        temp.material = []
      }
      this.data = this.item
      if (this.data.id) {
        this.imgPath = null
        this.loadData()
      }
    },
    showAvg() {
      this.showAvgMoney = true
      this.maxHeight = 30
    }
  }
}
</script>

<style scoped>
#approve-flag {
  position: absolute;
  right: 180px;
  text-align: center;
  color: red;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid red;
  padding: 2px;
  transform: rotate(7deg);
  user-select: none;
  bottom: 100px;
}

.bottom-border-table > td {
  border-bottom: thin solid rgba(0, 0, 0, 0.12)
}

.top-border-table > td {
  border-top: thin solid rgba(0, 0, 0, 0.12)
}

#approve-voucher {
  position: absolute;
  top: 0px;
  z-index: -1;
}
</style>