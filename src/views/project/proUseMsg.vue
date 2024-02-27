<template>
  <div class="overflow-y-auto overflow-x-hidden" style="height: 645px;">
    <v-row>
      <v-col>
        <v-data-table :items="items"
                      :items-per-page="10"
                      :loading="loading"
                      no-data-text="没有数据，请选择项目后，点击刷新“刷新数据"
                      :height:="515"
                      :search="queryParam.searchText"
                      :show-expand="isShowDetail"
                      :expanded.sync="proList"
                      @item-expanded="loadProList"
                      @click:row="clickRow"
                      group-by="type"
                      :headers="headers">
          <template v-slot:top>
            <v-row>
              <v-col cols="12">
                <v-chip class="mr-1" @click="planHistoryHandler">设计成本合计{{ planMoneys }}</v-chip>
                <v-chip class="mr-1" @click="proHistoryHandler">采购金额合计{{ proMoneys }}</v-chip>
                <v-chip class="mr-1">入库金额合计{{ putMoneys }}</v-chip>
                <v-chip class="mr-1">出库金额合计{{ outMoneys }}</v-chip>
                <v-chip class="mr-1">退库金额合计{{ backMoneys }}</v-chip>
                <v-chip class="mr-1">报销金额合计{{ expenseMoneys }}</v-chip>
                <v-chip class="mr-1">车费报销报销合计{{ carExpenseMoneys }}</v-chip>
                <v-chip class="mr-1">材料总数{{ materialNumber }}</v-chip>
                <v-btn class="mr-1" @click="refreshProjectHistory">{{ refreshStr }}</v-btn>
                <v-btn @click="exportExcel">导出</v-btn>
              </v-col>
              <v-col lg="2">
                <v-autocomplete :items.sync="projects"
                                dense
                                item-text="name"
                                return-object
                                label="请选择项目"
                                :loading="loading"
                                :search-input.sync="searchProject"
                                @input="changeProject"
                ></v-autocomplete>
              </v-col>
              <v-col lg="2">
                <v-text-field dense v-model="queryParam.searchText" label="搜索材料"></v-text-field>
              </v-col>
              <v-col lg="2" v-if="false">
                <v-text-field dense @input="searchCompany" v-model="queryParam.companyName"
                              label="搜索供应商"></v-text-field>
              </v-col>
              <!--<v-col lg="4">
                  <v-select dense @input="getUseMaterialData" item-text="name" item-value="value"
                            :items="types"
                            v-model="queryParam.loadTypes" multiple label="数据类型"></v-select>
              </v-col>-->
            </v-row>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <template v-if="item.procurementList != null && item.procurementList.length == 1">
              <td :colspan="headers.length" :key="item.procurementList[0].id">
                采购订单编号：{{ item.procurementList[0].pmNumber }} -
                供应商：{{ item.procurementList[0].company.name }}
                -
                采购员：{{ item.procurementList[0].staff.name }} - 采购日期：{{ item.procurementList[0].pmDate }}
                <v-btn color="primary" small @click="proDetail(item.procurementList[0])">明细
                </v-btn>
              </td>
            </template>
            <template v-if="item.procurementList != null && item.procurementList.length > 1">
              <td :colspan="headers.length" :key="item.procurementList[0].id">
                采购订单编号：{{ item.procurementList[0].pmNumber }} -
                供应商：{{ item.procurementList[0].company.name }}
                -
                采购员：{{ item.procurementList[0].staff.name }} - 采购日期：{{ item.procurementList[0].pmDate }}
                <v-btn color="primary" small @click="showProcurement(item.procurementList)">更多采购订单
                </v-btn>
              </td>
            </template>
          </template>
          <template v-slot:item.applySum="{item}">
            <v-btn :disabled="!isShowApplyDetail" small @click="applyDetail(item)">{{ item.applySum }}</v-btn>
          </template>
          <template v-slot:item.planMoney="{item}">
            {{ item.planSum * item.planPrice }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="showApplyList" width="30%">
      <v-card class="pa-5">
        <v-card-title>申请记录</v-card-title>
        <v-data-table :headers="headers3"
                      sort-desc
                      sort-by="applyDate"
                      :items.sync="applyList">
          <template v-slot:item.action="{item}">
            <v-btn small color="primary" disabled @click="proDetail(item)">明细</v-btn>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showApplyList = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showProList" width="70%">
      <v-card class="pa-5">
        <v-card-title>采购订单列表</v-card-title>
        <v-data-table :headers="headers2"
                      sort-desc
                      sort-by="pmDate"
                      :items.sync="proList">
          <template v-slot:item.action="{item}">
            <v-btn small color="primary" @click="proDetail(item)">明细</v-btn>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showProList = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    采购记录-->
    <v-dialog v-model="showProHistory" width="98%">
      <v-card class="pa-2">
        <pro-history :project="queryParam.projectName"></pro-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showProHistory = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    计划记录-->
    <v-dialog v-model="showPlanHistory" width="98%">
      <v-card class="pa-2">
        <plan-history :project="queryParam.projectId"></plan-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showPlanHistory = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <instance-detail :frame="dataDetailId" :close="closeDetail"></instance-detail>
  </div>
</template>

<script>
import {getUseMaterialData, refreshMaterialHistory, search} from '@/api/project'
import {getApplyMaterMsgByPro} from '@/api/apply'
import {listByProject} from '@/api/procurement'
import instanceDetail from '@/components/easyflow/instance-detail.vue'
import excelExport from "@/utils/excel-export";

export default {
  components: {
    instanceDetail,
    proHistory:()=>import('@/views/procurement/material/history.vue'),
    planHistory:()=>import('@/views/plan/history.vue'),
  },
  name: "proUseMsg",
  props: {
    //  加载数据类型，1=计划材料，2=申请材料，3=采购材料，4=入库材料，5=出库材料，6=退料材料
    dataTypes: Object
  },
  data: () => ({
    types: [
      {value: 1, name: '计划'},
      {value: 2, name: '申请'},
      {value: 3, name: '采购'},
      {value: 4, name: '入库'},
      {value: 5, name: '出库'},
    ],
    copyItems: [],
    items: [],
    materMap: [],
    queryParam: {
      projectId: null,
      type: 0,
      searchText: null,
      companyName: null,
      loadTypes: [1, 2, 3, 4, 5, 6],
    },
    proMoneys: 0,
    outMoneys: 0,
    putMoneys: 0,
    planMoneys: 0,
    backMoneys: 0,
    expenseMoneys: 0,
    carExpenseMoneys: 0,
    materialNumber: 0,
    headers: [
      {text: '材料名称', value: 'material.name', width: '15%'},
      {text: '型号', value: 'material.model', width: '15%'},
      {text: '品牌', value: 'material.brand', width: '10%'},
      {text: '计划数量', value: 'planSum'},
      {text: '计划金额', value: 'planMoney'},
      {text: '申请', value: 'applySum'},
      {text: '采购', value: 'proSum'},
      {text: '出库', value: 'outSum'},
      {text: '单位', value: 'material.unit.name'},
    ],
    loading: false,
    searchProject: null,
    projects: [],

    showProList: false,
    headers2: [
      {text: '订单编号', value: 'pmNumber'},
      {text: '供应商', value: 'company.name'},
      {text: '采购员', value: 'staff.name'},
      {text: '采购日期', value: 'pmDate'},
      {text: '明细', value: 'action'},
    ],
    proList: [],

    showApplyList: false,
    headers3: [
      {text: '申请人', value: 'staffName'},
      {text: '申请日期', value: 'applyDate'},
      {text: '明细', value: 'action'},
    ],
    applyList: [],
    dataDetailId: null,
    isShowDetail: false,
    isShowApplyDetail: true,

    refreshStr: "刷新数据",
    showProHistory:false,
    showPlanHistory:false,
  }),
  watch: {
    searchProject(value) {
      search(value).then(data => {
        this.projects = data;
      });
    },
    dataTypes() {
      if (this.dataTypes) {
        this.queryParam.loadTypes = this.dataTypes
      }
    }
  },
  created() {
    if (this.$store.state.user.roles.indexOf('采购') !== -1
        || this.$store.state.user.roles.indexOf('总经理') != -1
        || this.$store.state.user.roles.indexOf('管理员') != -1) {
      this.isShowDetail = true
    }

    if (this.dataTypes) {
      this.queryParam.loadTypes = this.dataTypes
    }
    search("").then(data => {
      this.projects = data;
    });
  },
  methods: {
    planHistoryHandler(){
      if(this.queryParam.projectId){
        this.showPlanHistory = true
      }else{
        this.message("请选择项目")
      }
    },
    proHistoryHandler(){
      if(this.queryParam.projectName){
        this.showProHistory = true
      }else{
        this.message("请选择项目")
      }
    },
    exportExcel() {
      let data = []
      this.items.forEach(item => {
        data.push(Object.assign({
          name: item.material.name,
          model: item.material.model,
          brand: item.material.brand,
          unitName:item.material.unit ? item.material.unit.name : ''
        }, item))
      })
      excelExport([
        {key: 'name', title: '材料名称'},
        {key: 'model', title: '规格型号'},
        {key: 'brand', title: '推荐品牌'},
        {key: 'planSum', title: '计划数量'},
        {key: 'planMoney', title: '计划金额'},
        {key: 'applySum', title: '申请数量'},
        {key: 'proSum', title: '采购数量'},
        {key: 'proMoney', title: '采购金额'},
        {key: 'unitName', title: '单位'},
      ], data, "项目成本分析.xlsx")
    },
    closeDetail() {
      this.dataDetailId = null
    },
    proDetail(procurement) {
      this.dataDetailId = procurement.applyId || procurement.id;
    },
    applyDetail(item) {
      this.showApplyList = true;
      getApplyMaterMsgByPro(item.materialId, this.queryParam.projectId).then(data => {
        this.applyList = data;
      });
    },
    clickRow(data, param) {
      if (this.isShowDetail) {
        param.expand(!param.isExpanded);
      }
    },
    searchCompany() {
      if (this.queryParam.companyName != "") {
        this.loading = true;
        this.items = [];
        this.copyItems.forEach(item => {
          if (item.companyNames != null && item.companyNames.indexOf(this.queryParam.companyName) != -1) {
            this.items.push(item);
          }
        });
        this.loading = false;
      } else {
        this.items = this.copyItems;
      }
    },
    changeProject(item) {
      this.queryParam.projectId = item.id;
      this.queryParam.projectName = item.name
      this.getUseMaterialData();
    },
    getUseMaterialData() {
      if (this.queryParam.projectId != null) {
        this.loading = true;
        this.items = [];
        this.copyItems = [];
        getUseMaterialData(this.queryParam.projectId, this.queryParam.loadTypes.join(',')).then(data => {
          data.rows.forEach(item => {
            item.procurementList = []
            item.companyNames = ''
            if (item.proMoney == null && item.proSum && item.proPrice) {
              item.proMoney = (item.proSum * item.proPrice).toFixed(2)
            }
            if (!item.type) {
              item.type = '项目耗材'
            }
            this.items.push(item)
          })
          // = data.rows;
          this.copyItems = data.rows;

          this.proMoneys = data.proMoneys.toFixed(2)
          this.outMoneys = data.outMoneys.toFixed(2)
          this.putMoneys = data.putMoneys.toFixed(2)
          this.backMoneys = data.backMoneys.toFixed(2)
          this.planMoneys = data.planMoneys.toFixed(2)
          this.expenseMoneys = data.expenseMoneys.toFixed(2)
          this.materialNumber = data.materialNumber
        }).finally(() => {
          this.loading = false;
        })
      }
    },
    loadProList(row) {
      if (row.item.procurementList.length <= 0) {
        listByProject(this.queryParam.projectId, row.item.materialId).then(result => {
          let cn = "";
          result.forEach(val => {
            cn += val.company.name + ";"
          })
          row.item.companyNames = cn
          row.item.procurementList = result
          console.log(row.item)
        })
      }
    },
    showProcurement(pros) {
      this.proList = pros;
      this.showProList = true;
    },
    refreshProjectHistory() {
      if (this.queryParam.projectId) {
        this.refreshStr = "正在刷新，耗时较长，请耐心等待"
        refreshMaterialHistory(this.queryParam.projectId).then(result => {
          console.log(result)
          this.getUseMaterialData()
          this.refreshStr = "刷新数据"
        })
      } else {
        this.refreshStr = "请选择项目后操作"
        setTimeout(() => {
          this.refreshStr = "刷新数据"
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>

</style>