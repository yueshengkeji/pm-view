<template>
  <div>
    <v-row dense>
      <v-col>
        <v-data-table :headers="headers"
                      :dense="this.$vuetify.breakpoint.width <= 1280"
                      :server-items-length="total"
                      :options.sync="options"
                      :loading="loading"
                      @dblclick:row="clickRow"
                      :footer-props="{showFirstLastPage:true}"
                      style="cursor: pointer"
                      sort-desc
                      sort-by="date"
                      :items="items">
          <template v-slot:top>
            <v-row dense>
              <v-spacer></v-spacer>
              <v-col lg="3" cols="12">
                <v-autocomplete label="指定项目"
                                :search-input.sync="sp"
                                :items.sync="projectList"
                                return-object
                                item-text="name"
                                dense
                                v-model="searchProject"></v-autocomplete>
              </v-col>
              <v-col lg="2" cols="12">
                <select-staff v-model="searchStaff" dense label="指定申请人"></select-staff>
              </v-col>
              <v-col lg="2" cols="12">
                <v-text-field dense
                              label="搜索"
                              @change="searchList"
                              @keydown.enter="searchList"
                              v-model="query.str"></v-text-field>
              </v-col>
            </v-row>
          </template>

          <template v-slot:item.project.name="{item}">
            <div v-if="selectApplyMap[item.id]" class="text-no-wrap text-truncate blue--text text--darken-3"
                 v-bind:style="{width:projectWidth}">{{ item.project.name }}
            </div>
            <div v-else-if="isNotify(item)" class="text-no-wrap text-truncate red--text text--red-1"
                 v-bind:style="{width: projectWidth}">{{ item.project.name }}
            </div>
            <div v-else class="text-no-wrap text-truncate" v-bind:style="{width: projectWidth}">
              {{ item.project.name }}
            </div>
          </template>

          <template v-slot:item.serialNumber="{item}">
            <div :title="item.serialNumber" class="text-no-wrap text-truncate"
                 :style="{width: serialWidth}">
              {{ item.serialNumber }}
            </div>
          </template>

          <template v-slot:item.remark="{item}">
            <div :title="item.remark" class="text-no-wrap text-truncate" :style="{width:remarkWidth}">
              {{ item.remark }}
            </div>
          </template>

          <template v-slot:item.audit="{item}">
            <v-chip x-small :color="formatter(item.audit)">{{ formatterText(item.audit) }}</v-chip>
          </template>

          <template v-slot:item.action="{item}">
            <v-btn @click="detail(item)" x-small>明细</v-btn>
            <v-btn class="ml-1" @click.stop="setProState(item)" x-small color="error">消单</v-btn>

          </template>

          <template v-slot:footer.prepend>
            <v-text-field v-model="options.page" label="跳转页码" hint="跳转页码"></v-text-field>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!--采购明细-->
    <v-dialog v-model="showApplyDetail" width="98%">
      <v-card class="pl-3 pr-3 pt-3">
        <v-btn :loading="loading" small style="right: 10px;" absolute right
               :disabled="index == items.length-1 && getPage() == (total-1)"
               @click="nextApply">下一个
        </v-btn>
        <v-btn :loading="loading" small style="right: 80px;" :disabled="index == 0 && options.page == 1" right
               absolute @click="prevApply">上一个
        </v-btn>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" :loading="loading" v-on="on" small absolute right style="right: 150px;">
              导出
            </v-btn>
          </template>
          <v-list>
            <v-list-item link @click="downloadApplyItems">导出当前材料</v-list-item>
            <v-list-item link @click="downloadSelectMaterial">导出选中材料</v-list-item>
          </v-list>
        </v-menu>
        <v-btn :loading="loading"
               small
               style="right: 208px;"
               right absolute
               @click.stop="switchProMater">
          {{ isNoProMater ? '所有材料' : '待采购' }}
        </v-btn>

        <apply :loadNoPro="true"
               ref="apply"
               :resetSelect="resetSelect"
               :apply="item"
               :select="selectMaterial"
               showSelect></apply>
        <v-card-actions>
          <v-col xl="4" lg="3" cols="6" class="pa-0">
            <v-text-field label="货运地址"
                          dense
                          v-model="item.city.name"></v-text-field>
          </v-col>
          <v-col sm="2" cols="6" class="pa-0 ml-1">
            <v-text-field dense label="备注" v-model="item.remark"></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <a :href="enquiryPath" v-if="enquiryPath != null">发起成功,请将此链接发给供应商报价</a>
          <v-chip small :disabled="selectApply.length <= 0" @click="prevSelect">选中材料：{{ selectApply.length }}行
          </v-chip>
          <v-btn :loading="imgLoading" @click="openImg" small class="ml-1">截图</v-btn>
          <v-btn :loading="enquiryLoading" title="发起成功后，请将报价链接发给供应商报价" @click="insertEnquiryHander"
                 small>
            发起询价
          </v-btn>
          <v-btn @click="resetSelectMater" small>清空选中材料</v-btn>
          <v-btn @click="closeApplyDetail" small>关闭</v-btn>
          <v-btn color="error" @click="setProState(item)" small>消单</v-btn>
          <v-btn v-if="!offGen" color="primary" @click="genProV2" small>生成订单</v-btn>
          <v-btn v-if="offGen" color="primary" @click="showApplyDetail = false" small>确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        消单提示-->
    <v-dialog v-model="stateDialog" width="30%">
      <v-card class="pa-5">
        <div class="text-center">确定消单吗？该申请单《{{ stateItem.serialNumber }}》将设置为完全采购</div>
        <v-card-actions class="justify-center">
          <v-btn @click="stateDialog = false">取消</v-btn>
          <v-btn color="primary" @click="setAllPro">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--        提示信息-->
    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
    <!--        预览已选材料-->
    <v-dialog v-model="prevDialog" width="98%">
      <v-card class="pa-3">
        <v-data-table :items="selectApply"
                      :headers="materialHeader"
                      hide-default-footer></v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="prevDialog=false" small>关闭</v-btn>
          <v-btn @click="downloadSelectMaterial" small>导出</v-btn>
          <v-btn color="primary" @click="genProV2" small>生成订单</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--二维码-->
    <v-dialog v-model="showCode" width="325px">
      <v-card class="pa-3 justify-center align-center text-center">
        <h3 class="text-center mt-10">将此二维码发送给询价方</h3>
        <canvas id="code" ref="code" :style="'width: '+width+'px;height:'+height+'px;'"></canvas>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import {list, updateState} from '@/api/apply'
import {getRoleUsers} from '@/api/role'
import {insertEnquiry} from '@/api/queryEnquiry'
import apply from './detail'
import {search} from '@/api/project'
import QRCode from "qrcode"
import SelectStaff from "@/views/user/select.vue"

export default {
  components: {
    SelectStaff,
    apply,
  },
  name: "proApplyList",
  data: () => ({
    detailDialog: false,
    searchStaff: null,
    searchProject: null,
    sp: null,
    projectList: [],
    id: null,
    items: [],
    headers: [
      {text: '项目名称', value: 'project.name'},
      {text: '申请单名称', value: 'serialNumber'},
      {text: '申请日期', value: 'date'},
      {text: '审批日期', value: 'approveDate'},
      {text: '申请人', value: 'staff.name', width: 100},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action', width: 150},
    ],
    materialHeader: [
      {text: "材料名称", value: 'name', width: '20%'},
      {text: "型号", value: 'model', width: '15%'},
      {text: "单位", value: 'unit.name'},
      {text: "品牌", value: 'brand', width: '100px'},
      {text: "申请数量", value: 'sum'},
      {text: "备注", value: 'remark', width: '15%'},
      {text: "成本", value: 'planPrice'},
      {text: "合计", value: 'moneyTax'},
      {text: "已采购", value: 'ySum'},
    ],
    total: 0,
    query: {
      str: null,
      approves: '1',
      proStatus: '0,1',
      staffId: null,
      isStaffId: false,
    },
    options: {},
    loading: false,
    edit: false,

    msgShow: false,
    msg: null,
    item: {
      id: null,
      city: {name: null}
    },

    showApplyDetail: false,
    index: 0,
    resetSelect: false,
    selectApply: [],
    proPersons: null,

    stateDialog: false,
    stateItem: {serialNumber: null},

    isDetail: false,
    isNoProMater: true,
    selectApplyMap: [],
    remarkWidth: '0px',
    serialWidth: '0px',
    projectWidth: '0px',
    enquiryPath: null,
    enquiryLoading: false,
    imgLoading: false,
    //窗口聚焦后自动清除选中材料
    autoClear: false,
    insertProcurement: null,
    prevDialog: false,

    //二维码
    showCode: false,
    width: 300,
    height: 250,
    qrCode: null,
  }),
  props: {
    offGen: {
      type: Boolean,
      default: false,
    }
  },
  created() {
    this.loadPersons()
    this.setTableCellWidth()

    this.$nextTick(() => {
      window.onfocus = () => {
        if (this.autoClear) {
          this.autoClear = false
          this.resetSelectMater()
          //重新加载数据
          this.isDetail = true
          this.list()
        }
      }
    })
  },
  watch: {
    sp: {
      handler(val) {
        if (val && val != '') {
          search(val).then(result => this.projectList = result)
        }
      }
    },
    searchProject: {
      handler() {
        this.list()
      }
    },
    searchStaff: {
      handler() {
        console.log("searchStaff",this.searchStaff)
        this.list()
      }
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    "$vuetify.breakpoint": {
      handler() {
        this.setTableCellWidth()
      },
      deep: true
    }
  },

  methods: {
    prevSelect() {
      this.prevDialog = true
    },
    openImg() {
      this.imgLoading = true
      this.$refs.apply.createImg().finally(() => this.imgLoading = false)
    },
    insertEnquiryHander() {
      if (this.selectApply.length <= 0) {
        this.msg = "请选择材料"
        this.msgShow = true
      } else {
        this.enquiryLoading = true
        let data = {applyId: this.item.id, name: '询价-' + this.item.serialNumber, proEnquiryMaterList: []}
        this.selectApply.forEach(item => {
          data.proEnquiryMaterList.push({
            applyId: item.applyid,
            applyMaterialId: item.major,
            materId: item.id,
            num: item.sum,
            price: item.planPrice
          })
        })
        insertEnquiry(data).then(result => {
          this.enquiryPath = this.$store.state.api.apiUrl + this.$router.options.base + `procurement/quote/quote/${result.id}`
          this.createCode(this.enquiryPath)
        }).finally(() => {
          this.enquiryLoading = false
        })
      }
    },
    createCode(url) {
      this.showCode = true
      this.$nextTick(() => {
        let val = url
        let width = this.width,
            height = this.height;
        this.$refs.code.innerHTML = ''
        // new QRCode(
        //     this.$refs.code, {
        //       text: val,
        //       width, height,
        //       colorDark: '#000',
        //       colorLight: '#FFF'
        //     });
        if (this.qrCode) {
          this.qrCode.clear()
          this.qrCode.makeCode(val)
        } else {

          console.log("code", document.getElementById('code'))
          this.qrCode = QRCode.toCanvas(
              document.getElementById('code'),
              val,
              {width, height, toSJISFunc: QRCode.toSJIS},
              error => {
                console.log(error)
              },
          )
        }
      })
    },
    setTableCellWidth() {
      if (this.$vuetify.breakpoint.md) {
        this.remarkWidth = this.$vuetify.breakpoint.width * 0.15 + 'px'
        this.serialWidth = this.$vuetify.breakpoint.width * 0.18 + 'px'
        this.projectWidth = this.$vuetify.breakpoint.width * 0.15 + 'px'
      } else {
        this.remarkWidth = this.$vuetify.breakpoint.width * 0.17 + 'px'
        this.serialWidth = this.$vuetify.breakpoint.width * 0.19 + 'px'
        this.projectWidth = this.$vuetify.breakpoint.width * 0.17 + 'px'
      }
    },
    downloadSelectMaterial() {
      this.$refs.apply.downloadSelectMaterial()
    },
    downloadApplyItems() {
      this.$refs.apply.downloadApplyMaterial()
    },
    switchProMater() {
      this.isNoProMater = !this.isNoProMater
      this.isDetail = true
      this.list()
    },
    setAllPro() {
      updateState(this.stateItem.id, 2).then(() => {
        this.stateDialog = false
        this.list()
      })
    },
    loadPersons() {
      getRoleUsers('20G28GSR').then(result => {
        this.proPersons = result
      })
    },
    isNotify(row) {
      let day = this.dateDiff(row.approveDate, new Date().getTime())
      let isRed = false
      if (row.state <= 1
          && parseInt(day.substring(0, day.indexOf('天'))) > 3) {
        if (row.notifyDate != null
            && row.notifyDate != ""
            && row.notifyDate <= this.getTomorrow()) {
          //到达指定的提醒日期
          isRed = true
        } else if (row.applyMaterialList) {
          let proRemarkCount = 0;
          for (let i = 0; i < row.applyMaterialList.length; i++) {
            let item = row.applyMaterialList[i]
            if ((item.remark == null || item.remark == '') && item.ySum <= 0) {
              isRed = true
              break
            } else if (this.proPersons != null) {
              for (let x = 0; x < this.proPersons.length; x++) {
                if (item.remark.indexOf(this.proPersons[x].name) != -1 || item.ySum > 0) {
                  proRemarkCount++
                  break;
                }
              }
            }
          }
          if (proRemarkCount !== row.applyMaterialList.length) {
            isRed = true
          }
        }
      }
      return isRed
    },
    clickRow(event, {item}) {
      this.index = this.items.indexOf(item)
      this.detail(item)
    },
    selectMaterial(items) {
      this.selectApply = items
      this.selectApplyMap = []
      this.selectApply.forEach(item => {
        this.selectApplyMap[item.applyid] = true
      })
    },
    getPage() {
      return (this.options.page * this.options.itemsPerPage - this.options.itemsPerPage + this.index)
    },
    nextApply() {

      this.index = this.index + 1
      if (this.index === this.items.length) {
        //下一页
        this.index = 0
        this.isDetail = true
        this.options.page++
      } else {
        this.item = this.items[this.index];
      }
    },
    prevApply() {
      this.index = this.index - 1
      if (this.index === -1) {
        //加载上一页
        this.index = this.options.itemsPerPage - 1
        this.isDetail = true
        this.options.page--
      } else {
        this.item = this.items[this.index];
      }
    },
    closeApplyDetail() {
      this.showApplyDetail = false
      this.item = {id: null, city: {name: null}}
      this.enquiryPath = null
      // this.resetSelect = true;
    },
    genProV2() {
      if (this.selectApply.length <= 0) {
        this.msg = "请选择购买材料"
        this.msgShow = true
      } else {
        this.autoClear = true
        this.resetSelect = false
        this.insertProcurement = {
          company: {name: null},
          city: {name: null},
          staff: {name: this.$store.state.user.name, id: this.$store.state.user.id},
          pmNumber: this.item.project.name,
          proCompany: '',
          pmDate: null,
          proMoney: 0,
          material: [],
          projectLeader: this.item.staff
        }
        if (this.item.city.id) {
          this.insertProcurement.city = this.item.city
        }
        let x = 1
        this.selectApply.forEach(item => {
          let tm = this.createProMaterial(item, x++)
          this.insertProcurement.material.push(tm)
        })

        let id = this.uuid()
        sessionStorage.setItem(id, JSON.stringify(this.insertProcurement))
        window.open(this.$router.options.base + 'procurement/form/insert/' + id)
      }
    },
    getProMaterial() {
      let x = 1
      let list = []
      this.selectApply.forEach(item => {
        let tm = this.createProMaterial(item, x++)
        list.push(tm)
      })
      return list;
    },
    createProMaterial(item, x) {
      return {
        material: item,
        //本次采购数 = 申请数 - 已采购数
        sum: item.sum - item.ySum,
        //默认申请单价 = 设计成本单价
        applyPrice: item.planPrice,
        //默认采购单价 = 设计成本单价
        priceTax: item.planPrice,
        //默认采购总金额 = 设计成本总金额
        moneyTax: item.moneyTax,
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
    setProState(item) {
      this.stateItem = item
      this.stateDialog = true
    },
    detail(item) {
      if (item.city == null) {
        item.city = {name: null}
      }
      this.item = item
      this.showApplyDetail = true
    },
    success() {
      this.detailDialog = false
      this.list()
    },
    reset() {
      this.id = null
      this.item = {id: null}
      this.resetSelectMater()
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
    formatter(state) {
      if (state == 0) {
        return "secondary"
      } else if (state == 1) {
        return ""
      } else {
        return "error"
      }
    },
    formatterText(state) {
      if (state == 0) {
        return "审核中"
      } else if (state == 1) {
        return "已审核"
      } else {
        return "未发起"
      }
    },
    getSort() {
      let sortName = "pm03415", sortOrder = this.options.sortDesc[0] ? 'DESC' : "ASC";
      switch (this.options.sortBy[0]) {
        case 'approveDate':
          sortName = "pm1.pm03415"
          break
        case 'date':
          sortName = "pm1.pm03414"
          break
        case 'staff.name':
          sortName = "pm1.pm03407"
          break
        case 'serialNumber':
          sortName = "pm1.pm03403"
          break
        case 'project.name':
          sortName = "pm1.pm03402"
          break
      }
      return [sortName, sortOrder];
    },
    searchList() {
      if (this.options.page !== 1) {
        this.options.page = 1
      } else {
        this.list()
      }
    },
    list() {
      this.loading = true
      this.item = {
        id: null,
        city: {name: null}
      }
      let {page, itemsPerPage} = this.options;
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      let sort = this.getSort()
      this.query.isNoProMater = this.isNoProMater
      this.query.sortName = sort[0]
      this.query.sortOrder = sort[1]
      if (this.searchStaff && this.searchStaff.id) {
        this.query.staffCoding = this.searchStaff.coding
      } else {
        this.query.staffCoding = null
        this.query.staffId = this.query.isStaffId ? this.$store.state.user.id : null
      }
      if (this.searchProject && this.searchProject.id) {
        this.query.projectId = this.searchProject.id
      } else {
        this.query.projectId = null
      }
      list(this.query).then(data => {
        this.total = data.total
        data.rows.forEach(item => {
          if (item.city == null) {
            item.city = {id: null, name: null}
          }
          if (item.project == null) {
            item.project = {id: null, name: null}
          }
        })
        this.items = data.rows
        if (this.isDetail) {
          if (this.items.length > 0 && this.items.length > this.index) {
            this.item = this.items[this.index]
          } else {
            this.showApplyDetail = false
          }
          this.isDetail = false
        }
      }).finally(() => {
        this.loading = false
      });
    }
  }
}
</script>

<style scoped>

</style>
