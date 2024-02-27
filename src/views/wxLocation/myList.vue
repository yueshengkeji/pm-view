<template>
  <div>
    <v-row dense>
      <v-col sm="4">
        <v-btn small color="primary" @click="applyExpenseHandler">申请报销</v-btn>
        <v-btn class="ml-1" small @click="historyDialog = true">报销记录</v-btn>
      </v-col>
    </v-row>

    <v-data-table :items="data.rows"
                  sort-by="startTime"
                  sort-desc
                  :options.sync="options"
                  :server-items-length="data.total" :headers="headers">

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

      <template v-slot:item.parkingCostImg="{item}">
        <img @click.stop="imgPrevHandler(item.parkingCostImg)" v-if="item.parkingCostImg"
             :src="serverPath+item.parkingCostImg" style="width: 50px;height: 50px;">
      </template>

    </v-data-table>

    <v-dialog v-model="imgDialog" width="90%">
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
          <span>左侧为出发时里程表；右侧为到达时里程表；点击图片/滚轮滚动：放大/缩小图片</span>
          <v-spacer></v-spacer>
          <v-btn @click="imgDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="applyExpenseDialog" width="95%">
      <v-card class="pa-3">
        <car-out-history v-model="item" ref="carOutForm"></car-out-history>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="exportHandler">导出</v-btn>
          <v-btn @click="applyExpenseDialog=false">关闭</v-btn>
          <v-btn color="primary" @click="submitHandler" :loading="submitLoading">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" width="95%">
      <v-card class="pa-3">

        <expense-list :query="{staffId:$store.state.user.id}" hidetool></expense-list>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="historyDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {list} from '@/api/outCarHistory'
import {getConfig} from "@/api/systemConfig"

export default {
  name: "myLocationList",
  components: {
    ExpenseList: () => import('@/views/wxLocation/expenseList.vue'),
    carOutHistory: () => import('@/components/1320285.vue')
  },
  data: () => ({
    data: {
      rows: [],
      total: 0
    },
    headers: [
      {text: '事由', value: 'remark'},
      {text: '出发日期', value: 'startTime'},
      {text: '出发地点', value: 'startAddrName'},
      {text: '出发记录', value: 'startImg'},
      {text: '到达日期', value: 'endTime'},
      {text: '到达地点', value: 'endAddrName'},
      {text: '到达图片', value: 'endImg'},
      {text: '系统里程', value: 'systemKm'},
      {text: '实际里程', value: 'inputKm'},
      {text: '停车费', value: 'isParkingCost'},
      {text: '付款记录', value: 'parkingCostImg'},
    ],
    options: {
      page: 1,
      itemsPerPage: 10
    },
    q: {
      startDate: '',
      endDate: ''
    },
    menu: false,
    menu2: false,
    serverPath: null,
    imgDialog: false,
    imgPath: null,
    imgPath2: null,

    applyExpenseDialog: false,
    item: null,
    submitLoading: false,
    //图片缩放比例
    scale: 1,
    image: null,
    mouseX: 0,
    mouseY: 0,
    imageContainer: null,
    historyDialog: false,
  }),
  watch: {
    options: {
      handler() {
        console.log("options")
        this.list()
      },
      deep: true,
    },
  },
  created() {
    this.q.staffId = this.$store.state.user.id
    getConfig("FTP_SERVER_PATH").then(result2 => {
      if (result2.id) {
        this.serverPath = result2.value
      }
    })
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
    exportHandler() {
      this.$refs.carOutForm.exportExcel()
    },
    submitHandler() {
      this.submitLoading = true
      this.$refs.carOutForm.submit().then(() => {
        this.applyExpenseDialog = false
      }).finally(() => {
        this.submitLoading = false
      })
    },
    applyExpenseHandler() {
      this.applyExpenseDialog = true
    },
    list() {
      this.loading = true
      let q = Object.assign({}, this.options)
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0] ? 'desc' : 'asc'
      q.staffId = this.q.staffId
      q.startDate = this.q.startDate
      q.endDate = this.q.endDate
      list(q).then((result) => {
        this.data = result
      }).finally(() => this.loading = false)
    },
    imgPrevHandler(item) {
      this.imgPath = this.serverPath + item.startImg || item
      if (item.endImg) {
        this.imgPath2 = this.serverPath + item.endImg
      } else {
        this.imgPath2 = null
      }
      this.imgDialog = true
    }
  }
}
</script>

<style scoped>

</style>