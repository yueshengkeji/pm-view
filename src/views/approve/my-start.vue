<template>
  <div>
    <v-row dense :style="abs ? 'top:-30px;position:absolute;width:100%;' : ''">
      <v-spacer></v-spacer>
      <v-col lg="4" cols="12">
        <v-text-field placeholder="搜索" v-model="queryParam.str" @keyup.enter="list"></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table :items="items"
                      @dblclick:row="rowEditHandler"
                      :headers="headers"
                      :items-per-page="queryParam.pageSize"
                      :server-items-length="total"
                      :loading="loading"
                      :options.sync="options">
          <template v-slot:item.date="{item}">
            <v-tooltip top open-on-hover>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">{{ dateFormat(item.date) }}</span>
              </template>
              <span>{{ item.date }}</span>
            </v-tooltip>
          </template>
          <template v-slot:item.state="{item}">
            <v-chip small :color="getStateColor(item)">{{ getStateStr(item) }}</v-chip>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn :disabled="item.state != 1" color="info" x-small @click="cancel(item)">取消</v-btn>
            <v-btn class="ml-1" color="primary" x-small @click="detail(item)">详情</v-btn>
            <v-btn :disabled="(item.state != 1 && item.state != 4)" class="ml-1" color="error" x-small
                   @click="deleteMsg(item)">删除
            </v-btn>
            <v-btn :disabled="(item.state !== 1)"
                   title="再次发送通知到当前审批人"
                   class="ml-1" x-small
                   @click="notifyFlowHandler(item)">通知
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <instance-detail :frame="frameId" :close="close"></instance-detail>
  </div>
</template>

<script>
import {getMyApproveList} from "@/api/approveManager"
import {backFLowMessage} from "@/api/approve"
import {deleteMsg,reNotify} from "@/api/usedFlowApi"
import instanceDetail from '@/components/easyflow/instance-detail'

export default {
  name: "my-start",
  components: {
    instanceDetail
  },
  props:{
    abs:{
      type:Boolean,
      default:false,
    },
  },
  data: () => ({
    frameId: null,
    queryParam: {
      pageSize: 10,
      pageNumber: 1,
      sortName: '',
      sortOrder: '',
      str: ''
    },
    options: {},
    total: 0,
    items: [],
    loading: false,
    headers: [
      {text: '办文标题', value: 'title', width: '30%'},
      {text: '发起时间', value: 'startDate', width: '20%'},
      {text: '状态', value: 'state', width: '10%'},
      {text: '流程名称', value: 'flow.name', width: '20%'},
      {text: '操作', value: 'action', width: '20%'},
    ]
  }),
  watch: {
    options: {
      handler() {
        this.list();
      },
      deep: true,
    }
  },
  methods: {
    notifyFlowHandler(item){
      reNotify(item).then(()=>{
        this.message("操作成功")
      })
    },
    restartHandler(item){
      console.log("restartHandler",item)
    },
    rowEditHandler(event,{item}){
      this.detail(item)
    },
    deleteMsg(item) {
      this.confirm("确定删除？").then(() => {
        this.loading = true
        deleteMsg(item.id).then(this.list)
      })
    },
    dateFormat(date) {
      return date.substring(5, 16);
    },
    close() {
      this.frameId = null;
    },
    cancel(item) {
      this.confirm("确定取消？").then(() => {
        backFLowMessage(item.id).then(() => {
          this.list();
        });
      })
    },
    detail(item) {
      console.log(item)
      this.frameId = item.frameId;
      console.log(this.frameId);
    },
    getStateColor(item) {
      switch (item.state) {
        case 1:
          return "primary";
        case 3:
          return "error";
        case 4:
          return "waring";
        default:
          return "success";
      }
    },
    getStateStr(item) {
      switch (item.state) {
        case 1:
          return "审批中";
        case 3:
          return "被驳回";
        case 4:
          return "中断";
        default:
          return "已完成";
      }
    },
    getOrder(by, desc) {
      switch (by[0]) {
        case "flow.name":
          by = "b.po00102";
          break;
        case "state":
          by = "a.po00308";
          break;
        case "title":
          by = "a.po00304";
          break;
        case "date":
          by = "a.po00302";
          break;
        default:
          by = "a.po00302"
          desc[0] = true
          break;
      }
      return [by, (desc[0] ? "desc" : "asc")];
    },
    list() {
      this.loading = true;
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      let order = this.getOrder(sortBy, sortDesc);
      this.queryParam.pageSize = itemsPerPage;
      this.queryParam.pageNumber = page;
      this.queryParam.sortName = order[0];
      this.queryParam.sortOrder = order[1];
      getMyApproveList(this.queryParam).then(data => {
        this.items = data.rows;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
}
</script>

<style scoped>

</style>