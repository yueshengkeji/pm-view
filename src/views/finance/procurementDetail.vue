<template>
  <div class="pa-3">
    <v-form ref="proDetailForm">
      <v-row dense class="mr-0">
        <v-col sm="4">
          <v-combobox dense
                      :disabled="data.id != null"
                      :search-input.sync="searchCompany"
                      :items="companyItems"
                      item-text="name"
                      return-object
                      label="单位名称"
                      :rules="rules.comName"
                      v-model="data.company"></v-combobox>
        </v-col>
        <v-col sm="2">
          <v-combobox dense
                      :items="settleTypeItems"
                      label="结账方式"
                      :rules="rules.settleType"
                      v-model="data.settleType"></v-combobox>
        </v-col>
        <v-col sm="1">
          <v-text-field type="number"
                        dense
                        label="税率"
                        :rules="rules.tax"
                        v-model="data.tax"></v-text-field>
        </v-col>
        <v-col sm="1">
          <v-select item-value="id"
                    label="单据所属"
                    dense
                    item-text="name"
                    :items="companyTypeItems"
                    v-model="data.companyBelong"></v-select>
        </v-col>
        <v-col sm="4" class="text-right">
          <v-spacer></v-spacer>
          <!--<v-btn x-small class="mr-1" v-if="data.id">
              <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn x-small class="mr-1" v-if="data.id">
              <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>-->
          <v-btn :disabled="!proPermission" @click="saveHandler" x-small color="primary" class="mr-1"
                 :loading="saveLoading">
            <v-icon small>mdi-check</v-icon>
          </v-btn>
          <v-btn x-small color="error" @click="$emit('close')">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-col>

        <v-col sm="1">
          <v-text-field dense label="联系人" v-model="data.saleName"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="联系手机号" v-model="data.tel"></v-text-field>
        </v-col>
        <v-col sm="1">
          <v-select dense
                    label="供应商性质"
                    item-text="name"
                    item-value="id"
                    :items="typeItems"
                    v-model="data.type"></v-select>
        </v-col>
        <v-col sm="4">
          <div v-if="false">
            <v-chip small class="ml-1" v-for="subject in data.subject" :key="subject.id">{{ subject.series }}
            </v-chip>
          </div>
        </v-col>

        <v-col sm="4">
          <v-row key="row-sm-2" dense class="white">
            <v-col style="background-color: rgba(218, 150, 148, 1);" cols="6">
              {{ data.year }}期初欠票
            </v-col>
            <v-col class="cursor" cols="6" style="background-color: rgba(218, 150, 148, 1)">
              <v-text-field @change="updateQcOweMoney(data.billOwe)" type="number"
                            :readonly="!cwPermission && !proPermission"
                            @focus="$event.target.select()" hide-details dense
                            v-model="data.billOwe.oweMoney"></v-text-field>
            </v-col>

            <v-col style="background-color: rgba(0, 176, 240, 1)" cols="6">{{ data.year }}期初欠款</v-col>
            <v-col class="cursor" cols="6" style="background-color: rgba(0, 176, 240, 1)">
              <v-text-field @change="updateQcOweMoney(data.moneyOwe)" type="number"
                            :readonly="!cwPermission && !proPermission"
                            @focus="$event.target.select()" hide-details dense
                            v-model="data.moneyOwe.oweMoney"></v-text-field>
            </v-col>
          </v-row>
        </v-col>

        <v-col sm="4">
          <v-textarea dense rows="2" label="备注" v-model="data.remark"></v-textarea>
        </v-col>
      </v-row>
    </v-form>

    <v-row dense class="mr-0">
      <v-col cols="7" class="overflow-y-auto">
        <div style="position:absolute;" class="white">
          <v-btn v-if="data.id != null"
                 x-small
                 color="primary"
                 @click="newLine(ysMoneyItems)"
                 :disabled="offInsert || !proPermission">
            <v-icon x-small>mdi-plus</v-icon>
          </v-btn>
          <v-btn class="ml-1" v-if="data.id != null" x-small color="primary" @click="pmListHandler"
                 :disabled="offInsert || !proPermission">
            系统数据
          </v-btn>
          <v-btn v-if="data.id != null"
                 x-small
                 color="primary"
                 class="ml-1"
                 @click="saveProHandler"
                 :disabled="!offInsert">
            保存
          </v-btn>
          <v-btn :disabled="!offInsert"
                 color="error"
                 class="ml-1"
                 v-if="data.id != null"
                 x-small
                 @click="cancelInsert()">取消
          </v-btn>
          <v-menu ref="monthMenu" top offset-y v-model="monthMenu">
            <template v-slot:activator="{on,attrs}">
              <v-btn v-on="on" v-bind="attrs" class="ml-1" x-small>{{ month }}
                <v-icon>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item v-for="m in monthItems" :key="m" @click="selectMonthHandler(m)">
                <v-list-item-title>{{ m }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn title="标记指定的金额，进行统计"
                 v-if="data.id != null"
                 :disabled="offInsert"
                 x-small
                 :class="markFlag ? 'ml-1 red--text' : 'ml-1'"
                 @click="markHandler">
            {{ markFlag ? '取消' : '标记' }}
          </v-btn>
          <div style="width: 200px;display: inline-block;" class="ml-1">
            <v-text-field dense hide-details label="搜索" v-model="searchProStr"></v-text-field>
          </div>
          <v-chip v-if="markFlag" label class="ml-1 red--text" x-small>采购合计:{{ markItemValue.toFixed(2) }}
          </v-chip>
          <v-chip v-else label class="ml-1" x-small title="本年采购金额合计">年采购：{{ data.yearPro }}</v-chip>
          <v-chip v-if="markFlag" label class="ml-1 red--text" x-small>
            入库合计:{{ markItemValue2.toFixed(2) }}
          </v-chip>
          <v-chip v-else label class="ml-1" x-small title="本年入库金额合计">年入库：{{ data.putMoney }}</v-chip>
        </div>
        <v-data-table class="cursor border no-padding-table border-table"
                      style="max-height: 450px;margin-top: 30px;"
                      :loading="detailLoading"
                      @click:row="editDetailItem"
                      hide-default-footer
                      dense
                      :items-per-page="-1">

          <template v-slot:body>
            <thead>
            <tr>
              <th v-if="markFlag" class="text-center" style="width:70px">标记</th>
              <template v-for="(headerItem1, idx1) in headers2">
                <th :colspan="headerItem1.colspan"
                    :width="headerItem1.width"
                    class="text-center"
                    :key="'header1'+idx1" :style="{ textAlign: headerItem1.align }">
                  <template v-if="idx1 == 0">
                    <v-icon title="点击图标，加载采购金额信息" x-small @click="loadProMoney = !loadProMoney">
                      {{ loadProMoney ? 'mdi-plus' : 'mdi-minus' }}
                    </v-icon>
                  </template>
                  {{ headerItem1.text }}
                </th>
              </template>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(item,idx) in ysMoneyItems" :key="'proTbody'+idx">
              <td v-if="markFlag">
                <div style="width: 70px">
                  <v-checkbox class="ma-0" dense hide-details v-model="item.markFlag"
                              @change="markItemHandler(item)"></v-checkbox>
                </div>
              </td>
              <td title="点击空白处修改，点击工程名称，查询采购订单">
                <div style="min-height:20px;min-width: 150px" @click="editDetailItem('project',item)">
                  <v-autocomplete :items="projectItems"
                                  @change="savePro"
                                  hide-details
                                  dense
                                  :ref="item.id+'project'"
                                  v-if="item.edit"
                                  :search-input.sync="searchProject"
                                  v-model="item.project"
                                  item-text="name"
                                  item-value="id"
                                  return-object>

                  </v-autocomplete>
                  <a v-else @click.stop="proDetailHandler(item)" href="###">{{ item.projectName }}</a>
                </div>
              </td>
              <td>
                <div style="width: 85px">
                  <v-menu :ref="item.id"
                          v-if="item.edit"
                          v-model="menu"
                          top
                          offset-y
                          :close-on-content-click="false"
                          transition="scale-transition"
                          min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="item.proDate"
                                    class="pa-0"
                                    :ref="item.id+'proDate'"
                                    autofocus
                                    dense
                                    hide-details
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"></v-text-field>
                    </template>
                    <v-date-picker @input="dateChange(item,'proDate')"
                                   v-model="item.proDate"
                                   no-title
                                   scrollable>
                      <v-spacer></v-spacer>
                      <v-btn text
                             color="primary"
                             @click="clearProDateHandler"
                      >
                        清空
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                  <div style="min-height:20px;" v-else @click.stop="editDetailItem('proDate',item)">
                    {{ item.proDate }}
                  </div>
                </div>
              </td>
              <td class="text-right">
                <div style="width:72px">
                  <v-text-field hide-details
                                :ref="item.id+'proMoney'"
                                type="number"
                                class="pa-0"
                                dense
                                @change="savePro"
                                v-if="item.edit"
                                v-model="item.proMoney"></v-text-field>
                  <div v-else @click.stop="editDetailItem('proMoney',item)">{{ item.proMoney }}</div>
                </div>

              </td>
              <td>
                <div style="width: 85px">
                  <v-menu :ref="item.id"
                          v-if="item.edit"
                          v-model="menu2"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          top
                          min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="item.putDate"
                                    class="pa-0"
                                    :ref="item.id+'putDate'"
                                    autofocus
                                    dense
                                    hide-details
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"></v-text-field>
                    </template>
                    <v-date-picker @input="dateChange(item,'putDate')" v-model="item.putDate"
                                   no-title
                                   scrollable></v-date-picker>
                  </v-menu>
                  <div style="min-height:20px;" v-else @click.stop="editDetailItem('putDate',item)">
                    {{ item.putDate }}
                  </div>
                </div>
              </td>
              <td class="text-right">
                <div style="width: 72px">
                  <v-text-field hide-details
                                :ref="item.id+'putMoney'"
                                type="number"
                                class="pa-0"
                                dense
                                @change="savePro"
                                v-if="item.edit"
                                v-model="item.putMoney"></v-text-field>
                  <div style="min-height:20px;" v-else @click.stop="editDetailItem('putMoney',item)">
                    {{ item.putMoney }}
                  </div>
                </div>
              </td>
              <td>
                <div>

                  <div class="float-left">
                    <a title="单击管理付款/到票报表" class="mr-1" href="###"
                       @click="payDetailHandler(item)">付款：{{ item.payMoneys }}/到票：{{ item.dpMoneys }}
                    </a>
                  </div>

                  <div class="float-left">
                    <v-edit-dialog large
                                   cancel-text="取消"
                                   save-text="保存"
                                   @open="editRemarkHandler(item)"
                                   :return-value.sync="item.remark" @save="savePro">
                      <a title="单击编辑备注信息" href="###">{{
                          (item.remark == null || item.remark == '') ?
                              '备注' :
                              item.remark
                        }}</a>
                      <template v-slot:input>
                        <v-text-field
                            style="margin: 0px 80px"
                            v-model="item.remark"
                            label="备注"
                            single-line
                            counter
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                  </div>
                  <div class="float-left" v-if="showReSet">
                    <a href="###" @click="setProMoneyHandler(item)">修复</a>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="ysMoneyItems.length == 0">
              <td class="text-center" colspan="6">
                <div>未查询到数据</div>
              </td>
            </tr>
            </tbody>

            <tfoot>
            <tr>
              <td v-if="markFlag">

              </td>
              <td>

              </td>
              <td colspan="2">
                <v-chip label class="ml-1" x-small>采购合计:{{ ysMoneyCount.toFixed(2) }}</v-chip>
              </td>
              <td colspan="2">
                <v-chip label class="ml-1" x-small>入库合计:{{ sjMoneyCount.toFixed(2) }}</v-chip>
              </td>
              <td>
                <v-chip label class="ml-1" x-small>误差:{{ (ysMoneyCount - sjMoneyCount).toFixed(2) }}</v-chip>
              </td>
            </tr>
            </tfoot>
          </template>

        </v-data-table>
      </v-col>

      <v-col cols="5" class="overflow-y-auto">
        <cw-detail :permission="cwPermission" ref="cwDetail" @change="cwChangeHandler" :item="data"></cw-detail>
      </v-col>
    </v-row>

    <instance-detail :frame="frameId" @close="closeHandler"></instance-detail>

    <v-dialog width="70%" v-model="dialog">
      <v-card class="pa-3">
        <pay-and-bill-list :detailC="proItem" @update="updatePayAndDpHandler"></pay-and-bill-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog width="90%" v-model="pmListDialog">
      <v-card class="pa-3">
        <pro-history :query="historyQuery" ref="proHistory"></pro-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="pmListDialog = false" :loading="proHistoryLoding">关闭</v-btn>
          <v-btn color="error" @click="$refs.proHistory.clear()" :loading="proHistoryLoding">清空</v-btn>
          <v-btn color="primary" @click="savePmListHandler" :loading="proHistoryLoding">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {list as companyList} from '@/api/company'
import {updateQcOwe} from '@/api/proOwe'
import {insert, update} from '@/api/proDetail'
import {getMoneyCount} from '@/api/proDetailDp'
import {search as searchProject} from '@/api/project'
import {getById, getByMainId, insertProPutDetail, updateProPutDetail, setProMoneyHandler} from '@/api/proPutDetail'


export default {
  name: "procurementDetail",
  components: {
    instanceDetail: () => import('@/components/easyflow/instance-detail.vue'),
    payAndBillList: () => import('./payAndBillList'),
    cwDetail: () => import('./cwDetail'),
    proHistory: () => import('./proHistory'),
  },
  props: {
    item: null,
    companyBelong: {
      type: Number,
      default: 1
    },
    year: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    showReSet: false,
    loadProMoney: false,
    searchProStr: null,
    typeItems: [
      {name: '本地', id: 0},
      {name: '外地', id: 1},
    ],
    companyTypeItems: [
      {name: '单位1', id: 1},
      {name: '单位2', id: 2},
    ],
    searchCompany: null,
    companyItems: [],
    settleTypeItems: ["现结", "年账期", "月账期", "60天账期", "90天账期", "全款发货"],
    rules: {
      comName: [v => !!v || '请输入单位名称'],
      settleType: [v => !!v || '请输入结账方式'],
      tax: [v => !!v || '请输入税率'],
    },
    data: null,
    saveLoading: false,
    headers2: [
      {text: '对应工程', value: 'project', width: '35%', colspan: 1},
      {text: '采购情况', value: 'proMoney', width: '20%', colspan: 2},
      {text: '入库情况', value: 'putDate', width: '20%', colspan: 2},
      {text: '付款明细', value: 'putMoney', width: '25%', colspan: 1},
    ],
    detailLoading: false,
    ysMoneyItems: [],
    ysMoneyItemsSource: [],
    offInsert: false,
    menu: false,
    menu2: false,
    dataId: null,
    ysMoneyCount: 0,
    sjMoneyCount: 0,
    searchProject: null,
    projectItems: [],
    frameId: null,
    proItem: null,
    dialog: false,
    detailItem: null,

    month: null,
    startDate: null,
    endDate: null,
    monthItems: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "全部"],
    monthMenu: false,

    markFlag: false,
    markItemValue: 0,
    markItemValue2: 0,

    pmListDialog: false,
    historyQuery: {
      companyId: null,
      start: null,
      end: null
    },
    proHistoryLoding: false,

    proPermission: false,
    storagePermission: false,
    cwPermission: false
  }),
  watch: {
    loadProMoney() {
      this.loadProDetail()
    },
    searchProject(val) {
      if (val) {
        searchProject(val).then(result => {
          this.projectItems = result
        }).finally(() => {
          if (this.projectItems.length <= 0) {
            this.projectItems.push({
              id: '-1',
              name: val
            })
          }
        })
      }
    },
    searchCompany(val) {
      if (val) {
        companyList(val).then(result => {
          this.companyItems = result
        })
      }
    },
    item: {
      handler() {
        if (this.item && this.item.id && this.item.id != this.dataId) {
          console.log("handler yearPro:", this.item.yearPro, this.item.proMoney)
          this.data = Object.assign({}, this.item)
          this.dataId = this.data.id
          this.loadProDetail()
        }
      }
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true
    },
    searchProStr(val) {
      if (val) {
        this.ysMoneyItems = []
        this.ysMoneyItemsSource.forEach(item => {
          let str = item.project.name + item.proDate + item.proMoney + item.putMoney + item.putDate + item.remark
          if (str.indexOf(val) != -1) {
            this.ysMoneyItems.push(item)
          }
        })
      } else {
        this.ysMoneyItems = this.ysMoneyItemsSource
      }
    },
  },
  created() {
    let roles = this.$store.state.user.roles
    if (roles.indexOf("采购") !== -1 || roles.indexOf("管理员") !== -1) {
      this.proPermission = true
    } else if (roles.indexOf("仓库") !== -1 || roles.indexOf("仓管") !== -1) {
      this.storagePermission = true
    } else if (roles.indexOf("财务") !== -1 || roles.indexOf("会计") !== -1) {
      this.cwPermission = true
    }
    if (roles.indexOf('管理员') !== -1 || roles.indexOf('维护') !== -1) {
      this.showReSet = true
    }
    let d = new Date();
    d.setFullYear(this.year)
    this.month = d.getMonth() + 1 + "月"
    console.log("this.year",this.year)

    this.startDate = this.getMonthFirst(d)
    this.endDate = this.getMonthEnd(d)
    if (this.item && this.item.id) {
      this.data = Object.assign({}, this.item)
    } else {
      this.reset()
    }
  },
  model: {
    prop: 'item',
    event: 'change'
  },
  methods: {
    setProMoneyHandler(item) {
      setProMoneyHandler(item)
    },
    savePmListHandler() {
      let data = this.$refs.proHistory.getSaveItems()
      let count = data.length
      this.proHistoryLoding = true
      data.forEach(item => {
        item.mainId = this.item.id
        insertProPutDetail(item).finally(() => count--)
      })
      let t = window.setInterval(() => {
        if (count == 0) {
          this.loadProDetail()
          this.proHistoryLoding = false
          this.pmListDialog = false
          clearInterval(t)
        }
      }, 500)
    },
    pmListHandler() {
      if (this.item.company && this.item.company.id) {
        this.historyQuery.companyId = this.item.company.id
        this.historyQuery.start = this.getMonthFirst(new Date())
        this.historyQuery.end = this.getMonthEnd(new Date())
        this.pmListDialog = true
      }
    },
    cwChangeHandler(data) {
      this.data = data
    },
    markItemHandler(item) {
      if (this.markFlag) {
        this.setMarkValue(item)
      }
    },
    setMarkValue(item) {
      if (item.markFlag) {
        this.markItemValue += item.proMoney
        this.markItemValue2 += item.putMoney
      } else {
        this.markItemValue -= item.proMoney
        this.markItemValue2 -= item.putMoney
      }
      this.markItemValue = isNaN(this.markItemValue) ? 0 : this.markItemValue
      this.markItemValue2 = isNaN(this.markItemValue2) ? 0 : this.markItemValue2
    },
    markHandler() {
      this.markFlag = !this.markFlag
      if (!this.markFlag) {
        this.markItemValue = 0
        this.markItemValue2 = 0
        this.ysMoneyItems.forEach(item => {
          item.markFlag = false
        })
      }
    },
    selectMonthHandler(m) {
      if (m == "全部") {
        this.startDate = null
        this.endDate = null
        this.month = '全部'
      } else {
        this.month = m
        let mn = parseInt(m)
        let sd = this.switchMonth(this.year,mn)
        this.startDate = sd.start
        this.endDate = sd.end
      }
      this.loadProDetail()
    },
    editRemarkHandler(item) {
      this.detailItem = item
    },
    updatePayAndDpHandler(detail) {
      getMoneyCount(detail.id).then(result => {
        if (result.payMoneys) {
          this.proItem.payMoneys = result.payMoneys
        }
        if (result.dpMoneys) {
          this.proItem.dpMoneys = result.dpMoneys
        }
      })
    },
    payDetailHandler(item) {
      this.proItem = item
      this.dialog = true
    },
    clearProDateHandler() {
      this.detailItem.proDate = ''
      this.savePro()
    },
    closeHandler(close) {
      if (close) {
        this.frameId = null
      }
    },
    proDetailHandler(item) {
      if (item.proId) {
        this.frameId = item.proId
      } else {
        this.message("没有查询到采购订单")
      }
    },
    saveHandler() {
      if (this.$refs.proDetailForm.validate()) {
        this.saveLoading = true
        if (this.data.id) {
          //更新
          update(this.data).then(result => {
            this.data = result
          }).finally(() => this.saveLoading = false)
        } else {
          //新增
          insert(this.data).then(result => {
            this.data = result
          }).finally(() => this.saveLoading = false)
        }
      }
    },
    reset() {
      this.data = {
        comName: null,
        tax: 0,
        settleType: '',
        saleName: '',
        tel: '',
        remark: '',
        billOwe: {
          oweMoney: 0,
        },
        moneyOwe: {
          oweMoney: 0,
        },
        companyBelong: this.companyBelong,
        type: 0,
        company: null,
        yearPro: 0,
      }
      this.$nextTick(() => {
        this.$refs.proDetailForm.resetValidation()
      })
      this.ysMoneyItems = []
    },
    cancelInsert() {
      if (this.detailItem.id == null) {
        this.ysMoneyItems.splice(this.detailItem.index - 1, 1)
      }
      this.detailItem.edit = false
      this.offInsert = false
    },
    saveProHandler(){
      this.savePro("forc")
    },
    savePro(forc) {
      this.detailItem.projectName = ""
      if (this.detailItem.id != null) {
        updateProPutDetail(this.detailItem).then((result) => {
          this.data.yearPro = result.proMoney
          this.data.putMoney = result.putMoney
          this.loadProDetail()
        }).finally(() => {
          this.offInsert = false
        })
      } else {
        if(forc == "forc"){
          insertProPutDetail(this.detailItem).then(() => {
            this.loadProDetail()
          }).finally(() => {
            this.offInsert = false
          })
        }
      }

    },
    loadProDetail() {
      this.detailLoading = true
      this.ysMoneyCount = 0
      this.sjMoneyCount = 0
      this.ysMoneyItems = []
      //采购/入库
      getByMainId(this.item.id, this.startDate, this.endDate, this.loadProMoney).then(data => {
        if (data != null) {
          data.forEach((item, idx) => {
            item.edit = false
            item.index = idx + 1
            if (item.proMoney != null) {
              this.ysMoneyCount += item.proMoney
            }
            if (item.putMoney != null) {
              this.sjMoneyCount += item.putMoney
            }
            if (item.project == null) {
              item.project = {name: '', id: '-1'}
            }
          })
          this.ysMoneyItems = data
          this.ysMoneyItemsSource = data
        }
      }).catch(() => {
        this.ysMoneyItems = []
      }).finally(() => {
        this.detailLoading = false
        //财务应付/收票
        if (this.$refs.cwDetail) {
          this.$refs.cwDetail.list()
        }
      })

      /*this.detailLoading2 = true
      getPayDetails(this.item.id).then(data => {
          this.payCount = 0
          this.billCount = 0
          if (data != null) {
              data.forEach(item => {
                  item.edit = false
                  if (item.payMoney != null) {
                      this.payCount += item.payMoney
                  }
                  if (item.billMoney != null) {
                      this.billCount += item.billMoney
                  }
              })
              this.cwMoneyItems = data

          }
      }).catch((() => this.cwMoneyItems = [])).finally(() => {
          this.detailLoading2 = false
      })*/

    },
    dateChange(item, prop) {
      if (prop == "putDate") {
        // this.$refs[prop].save()
        this.menu2 = false
      } else {
        this.menu = false
      }
      this.savePro()
    },
    checkPermission(event) {
      if (this.proPermission) {
        if (event != 'proDate' && event != 'proMoney' && event != 'project') {
          return false
        }
      } else if (this.storagePermission) {
        if (event != 'putDate' && event != 'putMoney') {
          return false
        }
      } else if (!this.proPermission && !this.storagePermission) {
        return false
      }
      return true
    },
    editDetailItem(event, param) {
      if (this.checkPermission(event)) {
        if (this.markFlag) {
          //标记行的状态，禁止编辑操作
          if (param.markFlag == null || !param.markFlag) {
            this.$set(param, 'markFlag', true)
          } else {
            param.markFlag = !param.markFlag
          }
          this.setMarkValue(param)
          return;
        }
        if (this.offInsert) {
          let isRequest = true
          if (this.detailItem.id === (event.id || param.id)) {
            isRequest = false
          }
          if (this.detailItem.id != null && isRequest) {
            this.detailItem.edit = false
            getById(this.detailItem.id).then(detail => {
              detail.edit = false
              this.detailItem.proDate = detail.proDate
              this.detailItem.proMoney = detail.proMoney
              this.detailItem.putMoney = detail.putMoney
              this.detailItem.putDate = detail.putDate
              this.detailItem.remark = detail.remark
            }).finally(() => {
              this.openEdit(event, param)
            })
          } else if (isRequest) {
            this.ysMoneyItems.splice(this.detailItem.index, 1)
            this.openEdit(event, param)
          }

        } else {
          this.openEdit(event, param)
        }
      }
    },
    openEdit(event, param) {
      if (event.id == null) {
        window.setTimeout(() => {
          let temp
          if (this.$refs[param.id + event] instanceof Array) {
            temp = this.$refs[param.id + event][0]
          } else {
            temp = this.$refs[param.id + event]
          }
          temp.focus()
          temp.$refs.input.select()
        }, 100)
        this.detailItem = param
      } else {
        this.detailItem = param.item
      }
      if (this.detailItem.project) {
        this.projectItems.push(this.detailItem.project)
      }
      if (event == "proDate") {
        this.menu = true
      } else if (event == "putDate") {
        this.menu2 = true
      } else {
        this.menu = false
        this.menu2 = false
      }
      this.detailItem.edit = true
      this.offInsert = true
    },
    updateQcOweMoney(data) {
      if (this.data.id) {
        updateQcOwe(data).then(() => {
          if (this.$refs.cwDetail) {
            this.$refs.cwDetail.list()
          }
        })
      }
    },
    newLine(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        index: data.length + 1,
        proDate: "",
        proMoney: 0,
        putDate: "",
        putMoney: 0,
      }
      data.push(this.detailItem)
      this.offInsert = true
    },
  }
}
</script>

<style>
.no-padding-table td {
  padding: 0px !important;
}

.border-table th {
  border-top: 1px solid #e0e0e0;
}

.border-table th:last-child {
  border-right: 1px solid #e0e0e0;
}

.border-table td, .border-table th {
  border-left: 1px solid #e0e0e0;
  padding: 2px !important;
}

.border-table td:last-child {
  border-right: 1px solid #e0e0e0;
}

.border-table tfoot > tr > td {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}
</style>