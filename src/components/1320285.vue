<template>
  <div>
    <v-form class="pa-3" ref="form">
      <v-row>

        <v-col sm="2" cols="6">
          <v-text-field readonly label="报销人" v-model="data.staff.name"></v-text-field>
        </v-col>

        <v-col sm="2" cols="6">
          <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
            <template v-slot:activator="{on,attrs}">
              <v-text-field label="报销开始日期"
                            v-bind="attrs"
                            v-on="on"
                            readonly
                            :rules="[v => !!v || '请选择报销开始日期']"
                            v-model="data.startDate"></v-text-field>
            </template>
            <v-date-picker v-model="data.startDate" @change="dateChangeHandler('menu')"></v-date-picker>
          </v-menu>
        </v-col>

        <v-col sm="2" cols="6">
          <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
            <template v-slot:activator="{on,attrs}">
              <v-text-field label="报销截止日期"
                            :error-messages="dayNumberError"
                            v-bind="attrs"
                            readonly
                            :rules="[v => !!v || '请选择报销截止日期']"
                            v-on="on"
                            v-model="data.endDate"></v-text-field>
            </template>
            <v-date-picker v-model="data.endDate" @change="dateChangeHandler('menu2')"></v-date-picker>
          </v-menu>
        </v-col>

        <v-col sm="2" cols="6">
          <v-text-field label="系统计算里程合计" v-model="data.systemKm" readonly></v-text-field>
        </v-col>

        <v-col sm="2" cols="6">
          <v-text-field label="报销实际里程合计"
                        type="number"
                        @change="inputKmHandler"
                        :rules="[v => !!v || '实际里程不能为空']"
                        v-model="data.inputKm"></v-text-field>
        </v-col>
        <v-col sm="2" cols="6">
          <v-text-field label="通行费"
                        type="number"
                        readonly
                        v-model="data.toll"></v-text-field>
        </v-col>

        <v-col sm="2" cols="12">
          <v-text-field type="number" label="报销金额" :rules="[v => !!v || '报销金额不能为空']"
                        v-model="data.money"></v-text-field>
        </v-col>


        <v-col sm="4" cols="12" v-if="frameId == null">
          <upload label="上传发票" :dense="false" v-model="files"></upload>
        </v-col>

        <v-col sm="10" cols="12">
          <v-textarea rows="1" label="备注" v-model="data.remark"></v-textarea>
        </v-col>

        <v-col sm="6" cols="6" v-if="frameId != null">
          <v-text-field readonly v-model="data.staff.openBlank" label="收款开户行"></v-text-field>
        </v-col>

        <v-col sm="6" cols="6" v-if="frameId != null">
          <v-text-field readonly v-model="data.staff.bankNumber" label="收款银行账号"></v-text-field>
        </v-col>

        <v-col sm="2" cols="12">
          <easy-flow ref="flow" v-if="frameId == null" coding="1320285"></easy-flow>
          <v-btn small color="primary" v-if="frameId != null" @click="exportExcel">导出Excel</v-btn>
        </v-col>
        <v-col cols="12">
          <v-data-table :items="items"
                        group-by="project.name"
                        :no-data-text="`未查询到数据，如果${data.startDate}到${data.endDate}有申请报销记录，请先删除之前的记录，再进行报销`"
                        sort-desc
                        sort-by="startTime"
                        show-group-by
                        item-key="id"
                        :headers="headers"
                        :height="frameId == null ? 'auto' : '350px'"
                        hide-default-footer
                        :items-per-page="-1">
            <template v-slot:group.header="{group,groupBy,remove,toggle,items}">
              <td colspan="12" class="text-start">
                <v-btn icon x-small @click="toggle()">
                  <v-icon x-small>mdi-minus</v-icon>
                </v-btn>
                {{ group || '无项目' }}，{{ getSum(items) }}
                <v-btn icon x-small @click="toggle()">
                  <v-icon x-small>mdi-plus</v-icon>
                </v-btn>
              </td>
            </template>

            <template v-slot:item.systemKm="{item}">
              <p v-if="item.carType == 1" class="green--text">{{ item.systemKm }}</p>
              <p v-if="item.carType == 2" class="red--text">{{ item.systemKm }}</p>
              <p v-else>{{ item.systemKm }}</p>
            </template>

            <template v-slot:item.remark="{item}">
              <div @click="editRemarkHandler(item)">
                <v-icon v-if="data.id == null" x-small>mdi-pencil</v-icon>
                {{ item.remark }}
              </div>
            </template>

            <template v-slot:item.startImg="{item}">
              <img @click.stop="imgPrevHandler(item)" :src="serverPath+item.startImg"
                   style="width: 50px;height: 50px;">
            </template>

            <template v-slot:item.endImg="{item}">
              <img @click.stop="imgPrevHandler(item)" v-if="item.endImg" :src="serverPath+item.endImg"
                   style="width: 50px;height: 50px;">
              <p v-else>未到达</p>
            </template>

            <template v-slot:item.isParkingCost="{item}">
              <div>{{ item.isParkingCost == '0' ? '' : '有' }}</div>
            </template>

            <template v-slot:item.parkingCostImg="{item,index}">
              <v-icon @click="removeHandler(item,index)" v-if="data.id == null" x-small style="cursor: pointer"
                      title="不报销该条记录">mdi-delete
              </v-icon>
              <img @click.stop="imgPrevHandler(item.parkingCostImg)"
                   v-if="item.parkingCostImg"
                   :src="serverPath+item.parkingCostImg" style="width: 50px;height: 50px;">
            </template>

            <template v-slot:item.startAddrName="{item}">
              <div v-if="item.endImg == null">{{ item.startAddrName }}</div>
              <a v-else @click="routeDataHandler(item)">{{ item.startAddrName }}</a>
            </template>
            <template v-slot:item.endAddrName="{item}">
              <div v-if="item.endImg == null">{{ item.endAddrName }}</div>
              <a v-else @click="routeDataHandler(item)">{{ item.endAddrName }}</a>
            </template>
          </v-data-table>
        </v-col>

        <v-dialog v-model="imgDialog" width="95%">
          <v-card class="pa-2">
            <v-row>
              <v-col @mouseout="mouseOutHandler" cols="6" @wheel="wheelImgHandler($event)" style="overflow: hidden">
                <img @click="clickImgHandler($event)" :src="imgPath" style="width:100%;height: auto"/>
              </v-col>
              <v-col @mouseout="mouseOutHandler" @wheel="wheelImgHandler($event)" cols="6" style="overflow: hidden">
                <img @click="clickImgHandler($event)" :src="imgPath2" style="width:100%;height: auto"/>
              </v-col>
            </v-row>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="imgDialog = false">关闭</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="mapDialog" width="80%">
          <v-card class="pa-2">

            <map-route :data="routeData" :other-info="otherInfo"></map-route>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="mapDialog=false">关闭</v-btn>
            </v-card-actions>

          </v-card>
        </v-dialog>

      </v-row>
    </v-form>
    <v-dialog v-model="updateRemarkDialog" width="30%">
      <v-card class="pa-2">
        <p>补充事由</p>
        <v-form ref="remarkForm">
          <v-text-field label="事由" v-model="updateItem.remark" :rules="[v => !!v || '不能为空']"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="updateRemarkDialog = false">取消</v-btn>
          <v-btn color="primary" @click="saveRemarkHandler" :loading="updateLoading">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {list, insertExpense, getExpenseById, updateRemark} from '@/api/outCarHistory'
import {getStaffById} from '@/api/staff'
import {getConfig} from "@/api/systemConfig";
import excelExport from "@/utils/excel-export";

export default {
  name: "frame-1320285",
  components: {
    upload: () => import("@/components/fileUpload.vue"),
    easyFlow: () => import('@/components/easyflow/easyFlow.vue'),
    mapRoute: () => import('@/views/map/route.vue')
  },
  data: () => ({
    files: null,
    data: null,
    items: [],
    headers: [
      {text: '事由', value: 'remark'},
      {text: '出发日期', value: 'startTime', groupable: false},
      {text: '出发地点', value: 'startAddrName', groupable: false},
      {text: '出发记录', value: 'startImg', groupable: false},
      {text: '到达日期', value: 'endTime', groupable: false},
      {text: '到达地点', value: 'endAddrName', groupable: false},
      {text: '到达图片', value: 'endImg', groupable: false},
      {text: '系统里程', value: 'systemKm', groupable: false},
      {text: '实际里程', value: 'inputKm', groupable: false},
      {text: '停车费', value: 'isParkingCost', groupable: false},
      {text: '付款记录', value: 'parkingCostImg', groupable: false},
      {text: '通行费', value: 'toll', groupable: false},
    ],
    menu: false,
    menu2: false,
    serverPath: null,
    imgDialog: false,
    imgPath: null,
    dayNumber: 0,
    dayNumberError: null,
    mapDialog: false,
    routeData: {
      center: {lat: 0, lng: 0},
      position: {start: {lat: 0, lng: 0}, end: {lat: 0, lng: 0}},
    },
    otherInfo: null,
    updateRemarkDialog: false,
    updateItem: {
      remark: null,
      id: null
    },
    updateLoading: false,
    imgPath2: null,
    //图片缩放比例
    scale: 1,
    image: null,
    mouseX: 0,
    mouseY: 0,
    imageContainer: null,
  }),
  props: {
    item: Object,
    frameId: null
  },
  watch: {
    item: {
      handler() {
        if (this.item && this.data.id != this.item.id) {
          this.data = Object.assign({}, this.item)
        }
      },
      deep: true
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true
    },
    frameId: {
      handler() {
        this.loadByFrameId()
      }
    }
  },
  model: {
    prop: 'item',
    event: "change"
  },
  created() {
    getConfig("FTP_SERVER_PATH").then(result2 => {
      if (result2.id) {
        this.serverPath = result2.value
      }
    })
    if (this.frameId) {
      this.loadByFrameId()
    } else {
      this.reset();
    }
  },
  methods: {
    clickImgHandler(event) {
      if (this.scale == 1) {
        this.scale = 3.0
      } else {
        this.scale = 1
      }
      event.target.style.transform = `scale(${this.scale})`;
    },
    mouseOutHandler() {
      this.imageContainer = null
      // this.image.style.transform = `scale(1)`;
      this.image = null
      this.scale = 1
      this.mouseX = 0
      this.mouseY = 0
    },
    wheelImgHandler(event) {
      if (this.image == null) {
        if (event.target.localName == "img") {
          this.imageContainer = event.target.parentElement
          this.image = event.target
        } else {
          this.image = event.target.children[0]
          this.imageContainer = event.target
        }
      }
      // 阻止默认的滚轮事件，避免页面滚动
      event.preventDefault();

      // 获取滚轮的deltaY值，用于判断滚轮方向
      const deltaY = event.deltaY;

      // 根据滚轮方向调整缩放比例
      if (deltaY > 0) {
        // 向下滚动，缩小图片
        this.scale -= 0.05;
        if (this.scale <= 0.5) {
          this.scale = 0.5
        }
      } else {
        // 向上滚动，放大图片
        this.scale += 0.05;
        if (this.scale >= 3.0) {
          this.scale = 3.0
        }
      }

      // 获取鼠标相对于图片容器的位置
      const containerRect = this.imageContainer.getBoundingClientRect();
      this.mouseX = event.clientX - containerRect.left;
      this.mouseY = event.clientY - containerRect.top;

      // 设置图片的缩放比例和位置
      this.image.style.transform = `scale(${this.scale})`;
    },
    removeHandler(item) {
      this.confirm("确定取消报销该条记录？").then(() => {
        for (let i = 0; i < this.items.length; i++) {
          if (item.id == this.items[i].id) {
            this.items.splice(i, 1)
            break
          }
        }

        let systemKm = 0, inputKm = 0
        this.items.forEach(item => {
          if (item) {
            systemKm += item.systemKm
            inputKm += item.inputKm
          }
        })
        this.data.systemKm = systemKm.toFixed(2)
        this.data.inputKm = inputKm.toFixed(2)
        this.data.money = this.data.inputKm + this.data.toll
      })
    },
    saveRemarkHandler() {
      if (this.$refs.remarkForm.validate()) {
        this.updateLoading = true
        updateRemark(this.updateItem).finally(() => this.updateLoading = false, this.updateRemarkDialog = false)
      }
    },
    editRemarkHandler(item) {
      if (!this.data.id) {
        if (item.remark == "" || item.remark == null) {
          this.updateItem = item
          this.updateRemarkDialog = true
        } else {
          this.message("禁止修改")
        }
      }
    },
    getSum(items) {
      let inputKm = 0, systemKm = 0
      items.forEach(item => {
        if (item.inputKm) {
          inputKm += item.inputKm
        }
        if (item.systemKm) {
          systemKm += item.systemKm
        }
      })
      return `系统合计里程：${systemKm.toFixed(2)}，实际报销合计里程：${inputKm.toFixed(2)}`
    },
    routeDataHandler(item) {
      this.routeData = {
        center: {lat: item.startLatitude, lng: item.startLongitude},
        position: {
          start: {lat: item.startLatitude, lng: item.startLongitude},
          end: {lat: item.endLatitude, lng: item.endLongitude},
        }
      }
      this.otherInfo = `<h3>${item.staff.name}-${item.remark || ''}</h3><p>${item.datetime}</p><p>${item.startAddrName}</p><p>到</p><p>${item.endAddrName}</p>`
          + `<p>系统里程合计：${item.systemKm}</p>`
          + `<p>实际里程合计：${item.inputKm}</p>`
          + `<p>停车费：${item.isParkingCost == 0 ? '无' : '有'}</p>`
      this.mapDialog = true
    },
    inputKmHandler() {
      this.money = this.data.inputKm
    },
    imgPrevHandler(item) {
      this.imgPath = this.serverPath + (item.startImg || item)
      this.imgPath2 = this.serverPath + (item.endImg || null)
      this.imgDialog = true
    },
    dateChangeHandler(ref) {
      this.$refs[ref].save()
      let hour = this.getHourByDate(this.data.startDate, this.data.endDate)
      this.dayNumber = hour / 24
      if (this.dayNumber > 31) {
        this.dayNumberError = "报销日期跨度不能超过31天"
      } else {
        this.dayNumberError = null
      }
      this.reloadData()
    },
    reset() {
      let d = this.getDateByStr("上月")
      this.files = null
      if (this.item) {
        this.data = Object.assign({}, this.item)
      } else {
        this.data = {
          startDate: d.start,
          endDate: d.end,
          remark: '',
          systemKm: 0,
          inputKm: 0,
          staff: {
            name: this.$store.state.user.name,
            openBlank: null,
            bankNumber: null
          },
          detail: [],
          money: 0
        }
        getStaffById(this.$store.state.user.id).then(result => {
          this.$set(this.data, 'staff', result)
        })
      }
      this.reloadData()
    },
    reloadData() {
      if (this.data.startDate && this.data.endDate) {
        let q = {
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          staffId: this.$store.state.user.id,
          page: 1,
          itemsPerPage: 2000,
          sortBy: "startTime",
          sortDesc: "desc",
          expenseFlag: true
        }
        this.data.systemKm = 0
        this.data.inputKm = 0
        list(q).then((result) => {
          let rows = result.rows
          let data = []
          let totalToll = 0
          rows.forEach(item => {
            if (item.endImg != null && item.endImg != "") {
              item.inputKm = item.inputKm || 0
              item.systemKm = item.systemKm || 0
              if (item.isParkingCost === 1) {
                if (item.parkingCostImg != null && item.parkingCostImg != '') {
                  this.data.systemKm += item.systemKm
                  this.data.inputKm += item.inputKm
                  data.push(item)
                }
              } else {
                this.data.systemKm += item.systemKm
                this.data.inputKm += item.inputKm
                data.push(item)
              }

              if (item.toll != null) {
                totalToll += item.toll
              }
            }
          })
          this.data.money = (this.data.inputKm + totalToll).toFixed(2)
          this.data.systemKm = this.data.systemKm.toFixed(2)
          this.data.inputKm = this.data.inputKm.toFixed(2)
          this.data.toll = totalToll.toFixed(2)
          this.items = data
        })
      }
    },
    submit() {
      return new Promise((resolve, reject) => {
        if (this.$refs.form.validate()) {
          if (this.items.length <= 0) {
            this.message("未查询到报销里程数据")
            reject()
            return
          }
          this.data.files = []
          if (this.files) {
            this.data.id = this.files.mainId
            this.files.files.forEach(item => {
              this.data.files.push(item.id)
            })
          }
          this.data.files = this.data.files.join(';')

          this.data.detail = []
          this.items.forEach(item => {
            this.data.detail.push({
              outHistoryId: item.id,
              outCarExpenseId: this.data.id
            })
          })


          insertExpense(this.data).then(result => {
            this.$refs.flow.startFlow({
              title: this.$store.state.user.name + '-车费报销报销',
              content: result.remark || '',
              frameId: result.id,
              frameCoding: 1320285,
              frameColumn: 'id'
            }).then(() => {
              this.$emit("success", result)
              resolve(result)
            })
          })
        }
      })
    },
    loadByFrameId() {
      if (this.frameId) {
        getExpenseById(this.frameId).then(result => {
          this.items = result.detailHistory
          this.data = result

          getStaffById(result.staffId).then(s => {
            this.$set(this.data, 'staff', s)
          })

          let toll = 0
          this.items.forEach(item => {
            if (item.toll) {
              toll += item.toll
            }
          })
          this.$set(this.data, 'toll', toll.toFixed(2))
        })
      }
    },
    exportExcel() {
      let exportData = []
      this.items.forEach(item => {
        item.isParkingCostStr = item.isParkingCost == "0" ? '否' : '是'
        exportData.push(item)
      })
      exportData.sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      })
      excelExport([
        {key: 'remark', title: '事由'},
        {key: 'startTime', title: '出发时间'},
        {key: 'startAddrName', title: '出发地点'},
        {key: 'endTime', title: '到达时间'},
        {key: 'endAddrName', title: '到达地点'},
        {key: 'systemKm', title: '系统计算里程'},
        {key: 'inputKm', title: '报销实际里程'},
        {key: 'isParkingCostStr', title: '是否有停车费'},
      ], exportData, this.data.staff.name + this.data.startDate + "到" + this.data.endDate + "报销明细导出.xlsx");
    }
  }
}
</script>

<style scoped>

</style>