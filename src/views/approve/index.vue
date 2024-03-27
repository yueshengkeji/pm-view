<template>
  <div>
    <v-row>
      <v-col>
        <v-radio-group v-if="tab === 1" label="消息状态" @change="statusChangeHandler" v-model="iQuery.status" row
                       style="position: absolute;z-index: 2;right: 0px;">
          <v-radio :value="5" label="未读"></v-radio>
          <v-radio :value="6" label="已读"></v-radio>
        </v-radio-group>
        <v-tabs v-model="tab" center-active>
          <v-tabs-slider color="primary"></v-tabs-slider>
          <v-tab v-for="item in tabItems"
                 :key="item.name">
            {{ item.name }}
            <v-badge :value="item.badge"
                     :size="12"
                     color="error"
                     :content="item.value"
                     :offset-x="10"
                     :offset-y="-2"></v-badge>
            <v-icon v-if="item.badge"
                    @click="markAllReadHandler"
                    small style="position: absolute;top:0px;right: -5px"
                    color="error" right title="标记所有为已读">mdi-close
            </v-icon>
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item key="我的审批">
            <v-card>
              <v-list>
                <v-toolbar dense elevation="0" :absolute="!$vuetify.breakpoint.xs"
                           style="right: 0;background-color: #00000000">
                  <v-text-field
                      autocapitalize="off"
                      @click:clear="reloadList"
                      @click:prepend="reloadList(undefined)"
                      @keydown.enter="reloadList($event)"
                      v-model="approveQuery.searchText"
                      clearable
                      placeholder="搜索待办工作"
                      hide-details
                      prepend-icon="mdi-magnify"
                      single-line
                  ></v-text-field>
                </v-toolbar>
                <v-progress-circular indeterminate color="primary" style="left: 50%;"
                                     v-show="approveQuery.loading"></v-progress-circular>
                <v-virtual-scroll
                    :bench="2"
                    :items="approveQuery.approveList"
                    :height="height"
                    item-height="64">
                  <template v-slot:default="{item}">
                    <v-list-item link :key="item.id" @click="loadSteps(item)"
                                 v-bind:style="{backgroundColor:item.approveState == 0 ? '#ECECEC' : ''}">
                      <v-list-item-avatar>
                        <v-img :src="item.icon"></v-img>
                      </v-list-item-avatar>
                      <v-list-item-content
                          v-bind:style="{color:(item.read) ? '#F44336' : ''}">
                        <v-list-item-title v-text="item.message.title"></v-list-item-title>
                        <v-list-item-subtitle v-bind:style="{color:(item.read) ? '#F44336' : ''}">
                          {{ item.acceptDate }}
                          <span>{{ getFrameName(item) }}</span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-virtual-scroll>
              </v-list>
            </v-card>
          </v-tab-item>
          <v-tab-item key="知会消息">
            <flow-msg-list ref="flowNotifyMsgList" :clickRow="loadSteps" :queryParam="iQuery"></flow-msg-list>
          </v-tab-item>
          <!--          <v-tab-item key="我知会的">-->
          <!--            <flow-msg-list :clickRow="loadSteps" :queryParam="zhQuery"></flow-msg-list>-->
          <!--          </v-tab-item>-->
          <v-tab-item key="已办">
            <flow-msg-list :clickRow="loadSteps" :queryParam="ybQuery"></flow-msg-list>
          </v-tab-item>
          <v-tab-item key="分期支付">
            <flow-msg-list :clickRow="loadSteps" :queryParam="fqQuery"></flow-msg-list>
          </v-tab-item>
          <v-tab-item key="我的发起">
            <my-start abs></my-start>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <instance-detail :approve="approve" :close="close"></instance-detail>
    <!--加载框-->
    <v-dialog v-model="consentLoading"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          加载中
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!--        申请删除订单-->
    <v-dialog v-model="applyDeleteDialog" width="70%">
      <v-card class="pa-5">
        <procurement :frameId="applyDelete.proId"></procurement>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteProcurement" :loading="deleteLoading">确定删除</v-btn>
          <v-btn @click="cancelApplyDelete">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="showMsg" bottom timeout="1500">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {getApproveList, read, notifyMyNoReadCount, readAll} from '@/api/approve'
import {getMessageByFrameId} from '@/api/usedFlowApi'
import {drawAvatar} from '@/utils/avatarUtil'
import {cancelApplyDelete, deleteProcurementByApply, getApplyDelete} from '@/api/procurement'
import {getStaffById} from '@/api/staff'


export default {
  components: {
    instanceDetail: () => import('@/components/easyflow/instance-detail'),
    flowMsgList: () => import('@/components/easyflow/FLowMsgList'),
    myStart: () => import('@/views/approve/my-start'),
    procurement: () => import('@/components/15306')
  },
  name: "index",
  data: () => ({
    deleteLoading:false,
    loading: false,
    menu: false,
    defaultTitle: "暂无代办工作",
    tab: null,
    tabItems: [
      {name: '我的审批', badge: false, value: 0},
      {name: '知会消息', badge: false, value: 0},
      // {name: '我知会的', badge: false, value: 0},
      {name: '已办', badge: false, value: 0},
      {name: '分期支付', badge: false, value: 0},
      {name: '我的发起', badge: false, value: 0}],
    tabIndex: 0,
    icon: 'mdi-chevron-down',
    approveQuery: {
      loading: true,
      searchText: null,
      approveList: [],
    },
    showDetail: false,
    approve: {
      approveState: null,
      message: {
        staff: {name: null},
        startDate: ''
      }
    },
    approveList: [],
    iframeState: true,
    frameUrl: "",
    file: null,
    consentLoading: false,

    showMsg: false,
    msg: "",
    nowApplyList: null,

    ybQuery: {
      loading: true,
      searchText: null,
      approveList: [],
      pageNumber: 1,
      pageSize: 15,
      fqFlag: false,
      type: 1,
      typeStr: '已办工作'
    },

    zhQuery: {
      loading: true,
      searchText: null,
      approveList: [],
      pageNumber: 1,
      pageSize: 15,
      fqFlag: false,
      type: 3,
      typeStr: '我的知会'
    },
    iQuery: {
      loading: true,
      searchText: null,
      approveList: [],
      pageNumber: 1,
      pageSize: 15,
      fqFlag: false,
      type: 2,
      status: 5,
      typeStr: '知会我的'
    },
    fqQuery: {
      loading: true,
      searchText: null,
      approveList: [],
      pageNumber: 1,
      pageSize: 15,
      fqFlag: true,
      type: 1,
      typeStr: '分期支付'
    },

    applyDelete: {proId: null},
    applyDeleteDialog: false,
    showApplyDelete: false,
    height: 520,
    socket: null
  }),
  created() {
    this.loadNotifyCount()
    let defaultIdx = this.$route.params.tabTag
    if (defaultIdx >= 0 && defaultIdx <= 5) {
      this.tab = parseInt(defaultIdx)
    }
    if (this.$store.state.user.roles.indexOf("采购部经理") !== -1 || this.$store.state.user.roles.indexOf("管理员") !== -1) {
      this.showApplyDelete = true;
      this.loadAll = true;
    }
    this.height = this.$vuetify.breakpoint.height - 175
  },
  mounted() {
    this.initData()
  },
  props: {
    socketData: null,
  },
  methods: {
    statusChangeHandler() {
      this.$refs.flowNotifyMsgList.loadApproveByType(true)
    },
    loadNotifyCount() {
      notifyMyNoReadCount().then(result => {
        if (result && result > 0) {
          if (result > 99) {
            result = 99
          }
          this.tabItems[1].value = result
          this.tabItems[1].badge = true
        } else {
          this.tabItems[1].value = 0
          this.tabItems[1].badge = false
        }
      })
    },
    markAllReadHandler() {
      if (!this.loading) {
        this.loading = true
        readAll().finally(() => {
          this.loadNotifyCount()
          this.loading = false
        })
      }
    },
    unshift(fa) {
      this.approveQuery.approveList.forEach((item, idx) => {
        if (item.message.frameId == fa.message.frameId) {
          this.approveQuery.approveList.splice(idx, 1)
        }
      })
      this.approveQuery.approveList.unshift(fa)
    },
    socketDataHandler(data) {
      if (data.type == 'flowApprove') {
        let flowApprove = data.data
        if (this.approveQuery.approveList.length === 1 && this.approveQuery.approveList[0].head == null) {
          this.approveQuery.approveList = []
        }
        if (flowApprove.message == null) {
          getMessageByFrameId(flowApprove.flowMessageId).then(result => {
            flowApprove.message = result
          }).finally(() => {
            this.drawName([flowApprove])
            this.unshift(flowApprove)
          })
        } else {
          if (flowApprove.message.staff == null) {
            getStaffById(flowApprove.message.staffId).then(s => {
              flowApprove.message.staff = s
              this.drawName([flowApprove])
              this.unshift(flowApprove)
            })
          } else {
            this.drawName([flowApprove])
            this.unshift(flowApprove)
          }
        }
        let msgCount = this.$store.state.api.approveMsgCount || 0
        this.$store.commit('setMsgCount', msgCount + 1)
      }
    },
    initData() {
      if (this.showApplyDelete) {
        this.getApplyDelete();
        this.change();
      } else {
        this.list();
      }
    },
    getApplyDelete() {
      this.approveQuery.loading = true;
      this.approveQuery.approveList = [];
      getApplyDelete().then(response => {
        response.forEach((item, i) => {
          try {
            if (item.procurement) {
              item.icon = drawAvatar(item.procurement.staff.name, "#0661ee");
              this.approveQuery.approveList.push({
                id: item.id,
                icon: item.icon,
                message: {title: "申请删除:" + item.remark},
                acceptDate: item.date,
                applyDeletePro: true,
                copy: item
              });
            }
          } catch (e) {
            response.slice(i, 1);
            console.log("drawAvatarError", e);
          }
        })
      }).finally(() => {
        this.approveQuery.loading = false;
        this.list()
      })
    },
    deleteProcurement() {
      this.deleteLoading = true
      deleteProcurementByApply(this.applyDelete).then(() => {
        this.applyDeleteDialog = false;
        this.deleteItem(this.applyDelete)
      }).catch(e => {
        this.msg = "删除失败,订单不存在或已入库，异常信息：" + e;
        this.showMsg = true;
      }).finally(()=>this.deleteLoading = false)
    },
    cancelApplyDelete() {
      this.applyDelete.state = true;
      cancelApplyDelete(this.applyDelete).then(() => {
        this.applyDeleteDialog = false;
        this.deleteItem(this.applyDelete)
      }).catch(e => {
        this.msg = "操作失败" + e;
        this.showMsg = true;
      })
    },
    change() {
      window.onfocus = () => {
        this.genProcurementMater = [];
        this.resetSelect = true;
      }
    },
    loadSteps(item) {
      if (item.applyDeletePro) {
        this.applyDelete = item.copy;
        this.applyDeleteDialog = true;
      } else {
        this.approve = item;
        this.read(this.approve);
      }
    },

    reloadList() {
      this.approveQuery.approveList = [];
      window.setTimeout(() => {
        this.initData()
      }, 100)
    },
    list(event) {
      if (event == undefined || event.keyCode == 13) {
        this.approveQuery.loading = true;
        getApproveList(this.approveQuery.searchText, this.$store.state.user.id, 1, 100).then(data => {
          let orderData = [];
          let lastData = [];
          data.forEach((item) => {
            if (item.lastCourse == 1 &&
                (item.message.frameCoding == '10563' || item.message.frameCoding == '15203' || item.message.frameCoding == '132029')) {
              item.read = true;
              lastData.push(item);
            } else {
              item.read = false;
              orderData.push(item);
            }
          });
          this.drawName(data);
          orderData = orderData.concat(lastData);
          this.approveQuery.approveList = this.approveQuery.approveList.concat(orderData);
          if (this.approveQuery.approveList.length <= 0) {
            this.approveQuery.approveList.push({message: {title: this.defaultTitle}});
          }
        }).catch(e => {
          this.approveQuery.approveList.push({message: {title: "审批数据加载失败，请刷新重试:" + e}});
        }).finally(() => {
          this.approveQuery.loading = false;
        })
      }

    },
    drawName(data) {
      data.forEach(item => {
        let color = "#4CAF50";
        if (item.message.frameCoding == "10563" || item.read) {
          color = "#03A9F4";
        } else if (item.message.frameCoding == "15304") {
          color = "#F44336";
        } else if (item.message.frameCoding == "10564") {
          color = "#81D4FA";
        }
        if (item.message.staff == null) {
          getStaffById(item.message.staffId).then(s => {
            item.message.staff = s
            item.icon = drawAvatar(s.name, color);
          })
        } else {
          item.icon = drawAvatar(item.message.staff.name, color);
        }
      })
    },

    read(approve) {
      if (approve.approveState === 0) {
        approve.approveState = 1;
        read(approve);
        this.clearReadBadge()
      } else if (approve.approveState === 5) {
        approve.approveState = 6;
        read(approve);
        this.clearReadBadge()
      }
    },
    clearReadBadge() {
      if (this.tab === 1) {
        this.tabItems[1].value -= 1
        if (this.tabItems[1].value <= 0) {
          this.tabItems[1].badge = false
        }
      }
      if (this.$store.state.api.approveMsgCount != null) {
        this.$store.commit('setMsgCount', this.$store.state.api.approveMsgCount - 1)
      }
    },
    close(refresh, type) {
      if (refresh) {
        if (type == "consent" || type == "break") {
          //同意事件触发，删除当前审批消息
          if (this.approve != null) {
            this.deleteItem(this.approve);
          }
        }
      } else {
        this.approve = {approveState: null, message: {staff: {name: null}, startDate: ''}};
      }
    },
    deleteItem(deleteItem) {
      this.approveQuery.approveList.forEach((item, idx) => {
        if (item.id == deleteItem.id) {
          this.approveQuery.approveList.splice(idx, 1);
        }
      })
    }

  },
  watch: {
    socketData: {
      handler() {
        this.socketDataHandler(this.socketData)
      }
    }
  }
}
</script>

<style scoped>
.v-progress-circular {
  position: absolute;
  left: 50%;
  top: 50%;
}
</style>