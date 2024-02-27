<template>
  <div class="pa-2">
    <v-row>
      <v-col lg="4">
        <v-hover v-slot="{ hover }">
          <v-card :elevation="hover ? 12:2">
            <v-toolbar dense elevation="0" light>
              <v-subheader>最新采购申请</v-subheader>
            </v-toolbar>
            <v-virtual-scroll :bench="2" :items="applyMaterList" height="480" item-height="64">
              <template v-slot:default="{item}">
                <v-list-item @click="applyDetail(item)" link :key="item.id">
                  <v-list-item-avatar>
                    <v-img :src="'data:image/png;base64,'+item.staff.head"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.serialNumber"></v-list-item-title>
                    <v-list-item-subtitle
                        v-text="dateFormat(new Date(item.pm03416),'mm-dd HH:MM')"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-virtual-scroll>
          </v-card>
        </v-hover>
      </v-col>
      <v-col lg="4">
        <v-hover v-slot="{ hover }">
          <v-card :elevation="hover ? 12:2">
            <v-toolbar dense elevation="0" light>
              <v-subheader>最新待发送订单</v-subheader>
            </v-toolbar>
            <v-virtual-scroll :bench="2" :items="proList" height="480" item-height="64">
              <template v-slot:default="{item}">
                <v-list-item link :key="item.id" @click="openPmImg(item)">
                  <v-list-item-content>
                    <v-list-item-title v-text="item.pmNumber"></v-list-item-title>
                    <!--                                        <v-list-item-subtitle v-text="dateFormat(new Date(item.voucherDate),'mm-dd HH:MM') + '/' +item.staff.name"></v-list-item-subtitle>-->
                    <v-list-item-subtitle>
                      <p class="float-left">{{ item.company.name }}</p>
                      <p class="float-right">{{ item.staff.name }}</p>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-virtual-scroll>
          </v-card>
        </v-hover>
      </v-col>

      <v-col lg="4">
        <v-hover v-slot="{ hover }">
          <v-card :elevation="hover ? 12:2">
            <v-toolbar dense elevation="0" light>
              <v-subheader>签字入库-即将超时列表</v-subheader>
              <v-menu v-model="menu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="pastDate"
                                dense
                                label="指定过期日期"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="pastDate" @input="loadSignList"></v-date-picker>
              </v-menu>
            </v-toolbar>
            <v-virtual-scroll :bench="2" :items="signList" height="480" item-height="100">
              <template v-slot:default="{item}">
                <v-list-item link :key="item.id" @click="openProDetail($event,item)">
                  <v-list-item-avatar>
                    <v-img :src="'data:image/png;base64,'+item.signStaff.head"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      <p class="float-left">{{ item.procurement.pmNumber }}</p>
                      <v-btn :disabled="item.procurement.id == null"
                             absolute
                             right
                             x-small
                             color="primary"
                             @click="wxNotify(item)">再次发送通知
                      </v-btn>
                      <v-btn absolute
                             right
                             x-small
                             color="error"
                             :loading="signLoading"
                             style="right:25%"
                             @click="cancelDialog(item)">取消
                      </v-btn>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <p class="float-left">{{ item.signStaff.name }}:{{ item.signStaff.tel }}</p>
                      <p class="float-right">过期日期：{{ item.pastDate }}</p>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-virtual-scroll>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <v-dialog v-model="showApplyDetail" width="98%">
      <v-card class="pa-5">
        <v-btn :disabled="index == 0" right absolute @click="prevApply">上一个</v-btn>
        <v-btn style="right: 96px;" absolute right :disabled="index == (applyMaterList.length-1)"
               @click="nextApply">下一个
        </v-btn>
        <apply :loadNoPro="true"
               ref="apply"
               :resetSelect="resetSelect"
               :apply="apply"
               :select="selectApply"
               showSelect></apply>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-chip small>选中材料：{{ genProcurementMater.length }}行</v-chip>
          <v-btn :loading="imgLoading" @click="openImg" small class="ml-1">截图</v-btn>
          <v-btn @click="resetSelectMater" small>清空选中材料</v-btn>
          <v-btn @click="closeApplyDetail" small>关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--        采购订单电子凭证-->
    <v-dialog v-model="showProImg" width="99%">
      <v-card class="pa-3">
        <!--<img @contextmenu="updateProDownload" style="width:100%;"
             :src="'data:image/png;base64,'+procurement.voucherImg">-->
        <detail @loadSuccess="loadSuccess" v-model="procurement" ref="proDetail"></detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-progress-circular
              class="mr-1"
              v-if="imgPath == null && procurement.state === 1"
              indeterminate
              color="primary"
          ></v-progress-circular>
          <img title="鼠标右键，下载订单信息" class="mr-1" @contextmenu="downloadHistory"
               v-if="imgPath && procurement.state === 1"
               :src="imgPath" style="width:100px;height: auto">
          <v-btn @click="showProImg = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="showMsg" centered>{{ msg }}</v-snackbar>

    <v-dialog v-model="signProDetail">
      <v-card class="pa-5">
        <v-card-title>入库单明细
          <v-btn small
                 fixed
                 right
                 fab
                 icon
                 style="right: 4%;"
                 @click="signProDetail = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <put-detail :data="putStorage"></put-detail>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="signProDetail = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteSignDialog" width="30%">
      <v-card>
        <v-card-title class="text-center">确定删除该入库签单吗？</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="cancelSign" :loading="signLoading">确定</v-btn>
          <v-btn @click="deleteSignDialog = false" :loading="signLoading">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {list} from '@/api/apply'
import {cancel, listSign, wxNotify} from '@/api/proSign'
import apply from '@/views/procurement/apply/detail'
import putDetail from '@/components/15323'
import {listPro, updateDownloadState} from '@/api/procurement'
import {drawAvatar} from '@/utils/avatarUtil'
import detail from "../procurement/detail";

export default {
  name: "panel",
  components: {
    apply,
    putDetail,
    detail
  },
  data: () => ({
    showMsg: false,
    msg: null,
    applyMaterList: [],
    apply: {id: null, project: {name: null}, city: {name: null}},
    showApplyDetail: false,
    index: 0,
    genProcurementMater: [],
    resetSelect: false,

    proList: [],
    procurement: {voucherImg: null, state: -1},
    showProImg: false,
    loadAll: false,

    signList: [],
    signProDetail: false,
    signItem: {id: null},
    putStorage: null,
    signLoading: false,
    deleteItem: null,
    deleteSignDialog: false,

    menu: false,
    pastDate: null,
    imgLoading: false,
    imgPath: null
  }),
  created() {
    let day = 1;
    let date = new Date();
    if (date.getDay() == 6) {
      day = 2;
    }
    this.pastDate = this.dateFormat(new Date(date.getTime() + ((24 * day) * 60 * 60 * 1000)), 'YYYY-mm-dd');
    this.loadApplyList();
    this.loadProList();
    this.loadSignList();
  },
  methods: {
    downloadHistory() {
      updateDownloadState(this.procurement.id).then(() => {
        for (let i = 0; i < this.proList.length; i++) {
          if (this.procurement.id === this.proList[i].id) {
            this.proList.splice(i, 1)
          }
        }
      })
    },
    loadSuccess(data, img) {
      if (this.procurement.state === 1) {
        this.imgPath = img
      }
    },
    openImg() {
      this.imgLoading = true
      this.$refs.apply.createImg().finally(() => this.imgLoading = false)
    },
    resetSelectMater() {
      this.resetSelect = true
      this.selectApply = []
      this.selectApplyMap = []
      return new Promise((resolve) => {
        window.setTimeout(() => {
          this.resetSelect = false
          resolve()
        }, 200)
      })
    },
    cancelDialog(item) {
      this.deleteItem = item;
      this.deleteSignDialog = true;
    },
    cancelSign() {
      this.signLoading = true;
      cancel(this.deleteItem.id).then(() => {
        this.signList.forEach((del, idx) => {
          if (del.id == this.deleteItem.id) {
            this.signList.splice(idx, 1);
          }
        })
      }).catch(e => {
        this.msg = e;
        this.showMsg = true;
      }).finally(() => {
        this.signLoading = false;
        this.deleteSignDialog = false;
      })
    },
    wxNotify(item) {
      wxNotify({id: item.id, signStaff: item.signStaff}).then(() => {
        this.msg = "操作成功";
        this.showMsg = true;
      });
    },
    closeSignDetail() {
      this.signItem = {id: null};
    },
    openProDetail(event, item) {
      let tagName = event.target.tagName.toUpperCase();
      if (tagName == "BUTTON" || tagName == "SPAN") {
        return;
      }
      if (item.procurement.id == null) {
        this.msg = "采购订单已删除";
        this.showMsg = true;
        return;
      }
      this.signItem = item;
      this.signItem.putStorage.procurement = this.signItem.procurement
      this.signItem.putStorage.company = this.signItem.procurement.company
      this.signItem.putStorage.saleMoney = this.signItem.procurement.saleMoney
      this.putStorage = this.signItem.putStorage;
      this.signProDetail = true;

    },
    appendValue(form, name, value) {
      let element = document.createElement("input");
      element.name = name;
      element.value = value;
      form.appendChild(element);
    },
    updateProDownload() {
      updateDownloadState(this.procurement.id).then(() => {
        this.loadProList();
      });
    },
    loadProList() {
      this.proList = [];
      listPro({
        pageSize: 10,
        pageNumber: 1,
        sortName: 'voucherDate',
        sortDesc: 'desc',
        staffId: this.$store.state.user.id,
        // putState: "0,3",
        // approveState: 1,
        state: 1,
        isDownload: this.loadAll ? null : "1",
        searchProject: "",
        searchCompany: "",
        str: ""
      }).then(data => {
        this.proList = data.rows;
      });
    },

    selectApply(items) {
      this.genProcurementMater = items;
    },
    closeApplyDetail() {
      this.showApplyDetail = false
      this.genProcurementMater = [];
      this.apply = {id: null, project: {name: null}, city: {name: null}};
      this.resetSelect = true;
    },

    openPmImg(item) {
      this.procurement = item;
      this.showProImg = true;
    },
    applyDetail(item) {
      this.index = item.index;
      this.apply = item;
      this.showApplyDetail = true;
    },
    nextApply() {
      this.index = this.index + 1;
      this.apply = this.applyMaterList[this.index];
    },
    prevApply() {
      this.index = this.index - 1;
      this.apply = this.applyMaterList[this.index];
    },
    loadApplyList() {
      list({
        page: 1,
        itemsPerPage: 20,
        sortName: 'pm03416',
        sortOrder: "desc",
        approves: '1',
        proStatus: '0,1'
      }).then(data => {
        data.rows.forEach((val, index) => {
          val.index = index;
          if (val.staff.head == null) {
            val.staff.head = drawAvatar(val.staff.name).replace("data:image/png;base64,", "")
          }
        });
        this.applyMaterList = data.rows;
      })
    },

    loadSignList() {
      this.menu = false;
      listSign({
        pastDate: this.pastDate,
        type: 0,
        page: 1,
        itemsPerPage: 50
      }).then(data => {
        data.rows.forEach(item => {
          if (item.procurement == null) {
            item.procurement = {pmNumber: '采购订单已被删除'};
          }
        })
        this.signList = data.rows;
      })
    }
  }
}
</script>

<style scoped>

</style>