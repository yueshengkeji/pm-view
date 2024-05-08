<template>
  <div>
    <v-dialog class="white"
              v-model="showDetail"
              :fullscreen="isFullscreen"
              scrollable
              :style="{height:dialogHeight}"
              style="max-height: 95%"
              ref="dialog"
              width="98%">
      <v-card ref="card" color="#8c8c8c" class="pb-1">
        <v-row dense ref="approveContainer" class="ma-0 pa-0"
               :style="{'padding':$vuetify.breakpoint.xs ? '0px !important' : ''}">
          <!--          左侧-->
          <v-col class="pl-0"
                 ref="leftCon"
                 :style="{'margin-left': $vuetify.breakpoint.xs ? '0px' : '-8px'}"
                 style="background-color: rgb(147, 222, 255);" lg="3" md="3"
                 sm="3" cols="12">
            <!--            审批人列表-->
            <v-timeline align-top dense>
              <v-timeline-item right small color="success">
                <h3 class="ma-0 hidden-lg-only hidden-sm-only hidden-md-only">
                  {{ approve.message.title }}</h3>
                <strong>发起人</strong>
                <v-row dense>
                  <v-col lg="4" title="图标1：显示/隐藏审批人处理时间;图标2：显示所有审批人">{{
                      approve.message.staff.name
                    }}
                  </v-col>
                  <v-icon class="pointer"
                          small
                          @click="showDatetime = !showDatetime">mdi-alarm
                  </v-icon>
                  <v-icon class="pointer" @click="loadAllSteps" small>
                    mdi-graph-outline
                  </v-icon>
                  <div style="position:absolute;left: -88px;margin-top:5px"
                       class="text-caption text-right"
                       v-if="approve.message.startDate && showDatetime">
                    {{ approve.message.startDate.substring(5, 16) }}
                  </div>
                </v-row>
              </v-timeline-item>

              <template v-for="(item,i) in steps">
                <v-timeline-item :color="getTimelineColor(item)"
                                 right
                                 small
                                 :key="i">
                  <strong>{{ item.courseName }}</strong>
                  <v-tooltip top v-for="(ua) in item.approves" :key="ua.id">
                    <template v-slot:activator="{ on, attrs }">
                      <!--                                            知会样式-->
                      <v-row v-bind="attrs" v-on="on" dense
                             v-if="ua.approveState == '5' || ua.approveState == '6'">
                        <v-col class="text--disabled">{{ ua.acceptUser.name }}</v-col>
                        <v-col class="text--disabled text-right">{{ ua.content }}</v-col>
                      </v-row>
                      <!--                                            审批样式-->
                      <v-row v-bind="attrs" v-on="on" dense v-else>
                        <v-col v-if="showDatetime" style="position:absolute;left: -88px;"
                               class="text-caption col-lg-5">{{ formatApproveDate(ua) }}
                        </v-col>
                        <v-col lg="4">{{ ua.acceptUser.name }}
                          <v-badge v-if="ua.po00421.length > 1" :label="ua.po00421"></v-badge>
                        </v-col>
                        <v-col v-if="ua.po00421 == '1'" class="text-right">
                          <v-badge bottom left offset-y="18" offset-x="-150" color="primary"
                                   content="分期支付">
                            {{ ua.content }}
                          </v-badge>
                        </v-col>
                        <v-col v-else class="text-right">
                          {{ ua.content }}
                        </v-col>
                      </v-row>
                    </template>
                    <span
                        v-if="ua.approveState == '5' || ua.approveState == '6'">{{
                        "知会-" + (ua.approveDate == '' ? '未读' : ua.approveDate.substring(5, 16))
                      }}</span>
                    <span v-else>{{ "审批时间-" + (formatApproveDate(ua)) }}</span>
                  </v-tooltip>
                </v-timeline-item>
              </template>
            </v-timeline>
            <!--            加载提示-->
            <v-progress-circular
                v-if="loadApproveLoading"
                :style="{left:defaultPos+'px'}"
                id="approveLoading"
                indeterminate
                color="primary"
            ></v-progress-circular>
          </v-col>
          <!--          右侧-->
          <v-col class="white ml-xs-0 ml-sm-2 pt-3" lg="9" md="9" sm="9" cols="12">
            <component v-bind:is="currentTabComponent"
                       v-bind:consentHandler="consentFlag"
                       v-bind:frameCoding="frameCoding"
                       v-bind:frameId="frameId"></component>
            <v-row dense class="mt-5">
              <!--                            审批内容输入-->
              <v-col lg="4" md="4" sm="4" cols="12" class="text-right">
                <v-text-field autocomplete="off"
                              hide-details
                              class="mt-0"
                              v-model="approveContent" dense
                              label="请输入审批意见"></v-text-field>
              </v-col>
              <!--                            审批操作-->
              <v-col lg="8" md="8" sm="8" cols="12" class="text-right">
                <v-dialog v-model="showSelect" :width="dialogWidth">
                  <!--                        <v-subheader>{{selectApprovePerson.name}}</v-subheader>-->
                  <v-card class="white">
                    <v-card-title>请选择{{ selectApprovePerson.name }}</v-card-title>
                    <v-card-actions>
                      <template v-for="(ap) in selectApprovePerson.personList">
                        <template v-if="ap.type == 0">
                          <v-checkbox :value="user.id"
                                      class="mr-5"
                                      v-model="selectPersons"
                                      :key="ap.coursePersonId+','+user.id"
                                      v-for="(user) in ap.staff"
                                      :label="user.name"></v-checkbox>
                        </template>
                      </template>
                    </v-card-actions>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn @click="selectApprove"
                             color="primary"
                             :loading="consentLoading"
                             :disabled="selectPersons.length <= 0">确定
                      </v-btn>
                      <v-btn @click="showSelect = false">取消</v-btn>
                    </v-card-actions>
                  </v-card>

                </v-dialog>
                <v-btn @click="consent"
                       :loading="consentLoading"
                       :small="small"
                       :block="$vuetify.breakpoint.xs"
                       :disabled="operate || approve.approveState != null && approve.approveState > 3"
                       class="mr-1"
                       :class="$vuetify.breakpoint.xs ? 'mb-3' : ''"
                       color="primary" style="color: #FFFFFF !important;">
                  {{ consentStr }}
                </v-btn>
                <v-btn @click="appendApprove"
                       :small="small"
                       :disabled="operate || approve.approveState != null && approve.approveState > 3"
                       class="mr-1">
                  加签
                </v-btn>
                <v-btn @click="fqConsent"
                       :loading="consentLoading"
                       :small="small"
                       :disabled="operate || approve.approveState != null && approve.approveState > 3"
                       class="mr-1">
                  {{ consentStr2 }}
                </v-btn>
                <v-btn :disabled="operate" :small="small"
                       @click="notifyHandler"
                       class="mr-1">
                  知会
                </v-btn>
                <v-btn @click="recall"
                       :small="small"
                       :disabled="operate || approve.approveState != 3"
                       v-if="!operate || approve.approveState == 3"
                       class="mr-1">
                  撤回
                </v-btn>
                <v-menu open-on-hover
                        v-model="breakMenu"
                        top
                        offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn class="mr-1"
                           :disabled="operate || approve.approveState != null && approve.approveState >= 3"
                           @click="breakApprove"
                           :small="small"
                           color="primary"
                           dark
                           v-bind="attrs"
                           v-on="on">
                      驳回
                      <v-icon right dark small @cli.stop="breakMenu=true">
                        mdi-arrow-up
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <template v-for="(item,i) in steps">
                      <v-list-item :key="i" v-if="approve.courseId != item.courseId" @click="breakToStep(item)">
                        <v-list-item-title>{{ item.courseName }}</v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-list-item @click="breakApprove" color="primary">
                      <v-list-item-title>到发起人</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-btn @click="printApprove"
                       :disabled="disabledPrint"
                       :small="small"
                       class="hidden-xs-only"
                       :class="$vuetify.breakpoint.xs ? 'mr-1 mt-1' : 'mr-1'">打印
                </v-btn>
                <v-btn @click="closeDialog"
                       :class="$vuetify.breakpoint.xs ? 'mr-1 mt-1' : ''"
                       :small="small">
                  关闭
                </v-btn>
              </v-col>
              <!--                            附件预览-->
              <v-col cols="12">
                <h3 class="text-center" v-if="fileTitle != '附件预览'">{{ fileTitle }}</h3>
                <v-row dense>
                  <v-col v-for="(file,i) in files"
                         :key="i"
                         class="d-flex child-flex align-center"
                         :lg="(file.suffix == 'pdf' || file.suffix == 'html' || file.suffix == 'txt') ? 12 : 4"
                         :md="(file.suffix == 'pdf' || file.suffix == 'html' || file.suffix == 'txt') ? 12 : 4"
                         cols="12">
                    <iframe style="border: 0px;width:100%;min-height:920px;" :key="i"
                            v-if="file.suffix == 'pdf' && !file.pdfImg" :src="file.showPath"></iframe>
                    <template v-else-if="file.suffix == 'pdf' && file.pdfImg">
                      <div>
                        <v-img v-for="p in file.pdfImgPath"
                               :key="p"
                               contain
                               :alt="file.fileName"
                               :aspect-ratio="16/9"
                               width="100%"
                               :height="450"
                               :src="p"
                               class="grey lighten-2 pointer prev-img">
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0"
                                   align="center"
                                   justify="center">
                              <v-progress-circular indeterminate
                                                   color="grey lighten-5"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </template>
                    <v-card class="pl-5 overflow-y-auto" @contextmenu="show($event,file)" :ripple="false"
                            v-else-if="file.suffix == 'html'" v-html="file.content"
                            :key="i"></v-card>
                    <v-img v-else-if="isImg(file)"
                           @mouseup="previewV2($event,file)"
                           @mouseout="cancelPreview($event,file)"
                           @mousedown="mouseDownHeader($event)"
                           @mousemove.stop="drag($event)"
                           @dblclick="largeImg($event)"
                           @contextmenu="show($event,file)"
                           :lazy-src="'/assets/ftptemp/'+file.id+'.JPEG'"
                           contain
                           :alt="file.fileName"
                           :aspect-ratio="16/9"
                           :height="450"
                           :src="file.showPath"
                           class="grey lighten-2 pointer prev-img">
                      <template v-slot:placeholder>
                        <v-row class="fill-height ma-0"
                               align="center"
                               justify="center">
                          <v-progress-circular indeterminate
                                               color="grey lighten-5"></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                    <template v-else-if="file.suffix == 'txt'">
                      <div class="d-block" @contextmenu="show($event,file)">
                        <p>
                          <a target="_blank" :key="file.showPath" :href="file.showPath"
                             :download="file.fileName">{{ file.fileName }}</a>
                        </p>
                        {{ file.content }}
                      </div>
                    </template>
                    <template v-else>
                      <a target="_blank" :key="file.showPath" :href="file.showPath"
                         :download="file.fileName">{{ file.fileName }}</a>
                    </template>
                  </v-col>
                </v-row>
                <component v-bind:is="print.printComponent"
                           v-bind:approveList="approveList"
                           v-bind:approve="approve"
                           v-bind:message="instaceMsg"
                           v-bind:fqFlag="fqFlag"
                           v-bind:printContent="print.printContent"></component>
                <v-menu v-model="showMenu"
                        :position-x="x"
                        :position-y="y"
                        absolute
                        offset-y>
                  <v-list>
                    <v-list-item @click="downloadFile" link>
                      <v-list-item-title>下载</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
      <v-dialog class="white"
                :fullscreen="$vuetify.breakpoint.xs"
                v-model="previewDetail">
        <v-btn class="mx-2" fab dark small color="error" absolute style="top:5px;right: 5px;"
               @click="previewDetail = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card>
          <v-carousel height="720" touchless v-model="imgItemIdx">
            <v-carousel-item v-for="(file,i) in imgFile" :key="i" link class="overflow-y-auto">
              <div :ref="file.id">
                <img :alt="file.fileName"
                     @load="loadImgHandler($event,file)"
                     @click="imgSize($event,file)"
                     :style="{height:file.height == null ? '100%' :
                                 file.height,width:file.width == null ? '100%' : file.width}"
                     :src="file.showPath"/>
              </div>
            </v-carousel-item>
            <span class="img-tooltip">支持双指缩放图片</span>
          </v-carousel>
        </v-card>
      </v-dialog>

      <v-btn small fixed @click="backTop" color="green" v-if="showBackTop && !$vuetify.breakpoint.xs" right bottom
             fab icon>
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
    </v-dialog>
    <!--加载框-->
    <v-dialog v-model="consentLoading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          加载中
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!--自由选人-->
    <v-dialog :width="dialogWidth" v-model="notify.show" persistent>
      <v-card class="pa-3">
        <v-card-title>请选择{{ notifyType }}人姓名</v-card-title>
        <v-data-table :items="notify.staffList"
                      show-select
                      hide-default-footer
                      :search="notify.searchName"
                      :items-per-page="1000"
                      @input="selectStaff"
                      height="300"
                      :headers="notify.header">
          <template v-slot:top>
            <v-text-field v-model="notify.searchName" label="搜索人员姓名"></v-text-field>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="notify.notifyStaffList.length <= 0"
                 :loading="consentLoading"
                 @click="insertNotify" color="primary">确定
          </v-btn>
          <v-btn @click="notify.show = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--提示框-->
    <v-snackbar v-model="message.show" centered>
      {{ message.content }}
      <template v-slot:action="{attrs}">
        <v-btn
            color="red"
            text
            x-small
            v-bind="attrs"
            @click="message.show = false"
        >
          关闭
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import {
  appendConsent,
  breakFlow,
  consent,
  getMessageByFrameId,
  notify,
  recall,
  getApproveSteps,
  selectPersonConsent,
  appendApprove,
  getApproveRecord, breakToCourse, saveContent
} from '@/api/approve'
import {getStaff} from '@/api/staff'
import {getFiles} from '@/api/files'
import {loadById} from '@/api/payment'
import {getConfig} from '@/api/systemConfig'
import {flowCourseInstance} from '@/api/course'
import ZoomObject from "@/utils/zoom"
import axios from 'axios'
import {updatePrint} from "@/api/usedFlowApi";

export default {
  name: "instance-detail",
  data: () => ({
    breakMenu: false,
    loadApproveLoading: false,
    defaultPos: 150,
    vertical: false,
    previewDetail: false,
    disabledPrint: true,
    operate: false,
    noWatch: false,
    showSelect: false,
    x: 0,
    y: 0,
    files: [],
    fileTitle: '加载中',
    showMenu: false,
    currentTabComponent: null,
    frameId: null,
    height: "530px",
    showDetail: false,
    isFullscreen: false,
    consentLoading: false,
    approveContent: null,
    message: {
      show: false,
      content: ""
    },
    notify: {
      show: false,
      staffList: [],
      notifyStaffList: [],
      searchName: null,
      header: [
        {text: '姓名', value: 'name', width: '100%'}
      ]
    },
    file: null,
    print: {
      printComponent: null,
      printContent: null,
    },
    steps: null,
    approveList: [],
    selectApprovePerson: {
      name: null,
      personList: null
    },
    selectPersons: [],
    consentStr: '同意',
    consentStr2: '分期支付',
    instaceMsg: {staff: {name: null}},
    imgFile: [],
    //当前流程是否存在分期付款标记
    fqFlag: false,
    dialogHeight: 0,
    footWidth: 0,

    imgOpt: {x: 0, y: 0, l: 0, t: 0, isDown: false, click: true},
    small: false,
    initScrollFlag: false,
    showBackTop: false,
    showDatetime: true,
    serverHost: '',
    frameCoding: null,
    // 预览的图片元素下标
    imgItemIdx: null,
    notifyType: null,
    ftpFolder: null,
    dialogWidth: null,
    consentFlag:false
  }),
  props: {
    approve: {
      type: Object,
      default: () => ({
        approveState: null,
        staff: {name: null},
        message: {staff: {name: null}, startDate: ''}
      })
    },
    close: Function,
    frame: null
  },
  watch: {
    approve: {
      handler() {
        if (this.approve != null && this.approve.id != null && !this.noWatch) {
          this.operate = false;
          if (this.approve.message.staff == null) {
            this.approve.message.staff = {name: null}
            this.approve.message.startDate = ''
          }
          this.instaceMsg = this.approve.message;
          this.loadSteps();
        } else {
          this.noWatch = false
        }
      },
      deep: false
    },
    showDetail: {
      handler() {
        if (!this.showDetail && this.close != null) {
          this.close(false);
        }
        this.$emit("close", this.showDetail)

        if (this.showDetail) {
          window.setTimeout(() => {
            this.defaultPos = this.$refs.leftCon.offsetWidth / 2
          }, 500)
          if (!this.initScrollFlag) {
            window.setTimeout(this.setDialogScroll, 200)
            this.initScrollFlag = true
          }
        }

      }
    },
    frame: {
      handler() {
        this.init()
      },
      deep: true
    },
    "notify.show": {
      handler() {
        if (this.notify.show && this.notify.staffList.length <= 0) {
          this.loadStaff()
        }
      }
    }
  },
  created() {
    if (this.$vuetify.breakpoint.xs) {
      this.dialogWidth = '100%'
    } else {
      this.dialogWidth = '30%'
    }
    getConfig("FTP_SERVER_PATH").then(result => {
      if (result.id != null) {
        this.serverHost = result.value
      } else {
        this.error = '服务器未配置文件上传路径'
        this.disabled = true
      }
    })
    getConfig("FTP_ROOT_FOLDER").then(result => {
      if (result.id != null) {
        this.ftpFolder = result.value
      }
    })


    // this.loadStaff()
    this.$nextTick(() => {
      this.resizeFrame()
    })
  },
  mounted() {
    window.onresize = () => {
      this.resizeFrame();
    }
  },
  methods: {
    getTimelineColor(item) {
      switch (item.status) {
        case 3:
          return "success"
        case 0:
        case 1:
          return 'primary'
        case 4:
          return "error";
        case -1:
          return 'grey'
      }
    },
    backTop() {
      this.$refs.card.$el.parentElement.scrollTop = 0
    },
    setDialogScroll() {
      if (this.$refs.card) {
        let than = this
        this.$refs.card.$el.parentElement.onscroll = function () {
          than.dialogScroll(this)
        }
      }
    },
    dialogScroll(ele) {
      if (ele.scrollTop > 100) {
        this.showBackTop = true
      } else {
        this.showBackTop = false
      }
    },
    setDialogHeight() {

      if (this.$vuetify.breakpoint.xs) {
        this.dialogHeight = document.body.clientHeight + 'px'
        this.small = false
      } else if (this.$vuetify.breakpoint.md) {
        this.dialogHeight = document.body.clientHeight * 0.99 + 'px'
        this.small = false
      } else if (this.$vuetify.breakpoint.sm) {
        this.small = false
      }
      if (this.$refs.approveContainer) {
        this.footWidth = (this.$refs.approveContainer.clientWidth * 0.98) + 'px'
      } else {
        this.footWidth = (document.body.clientWidth * 0.98 - 13) + 'px'
      }
    },
    init() {
      if (this.frame) {
        this.frameId = this.frame;
        this.operate = true;
        //根据表单id加载流程集合
        return this.loadStepsByFrameId()
      } else {
        return new Promise((resolve, reject) => {
          reject("frame is null")
        })
      }
    },
    loadImgHandler(event) {
      new ZoomObject(event.target)
    },
    imgSize(event, file) {
      if (this.$vuetify.breakpoint.xs) {
        console.log("移动缩放图片")
      } else {
        if (file.height != '200%') {
          file.height = "200%"
          file.width = '200%'
          event.target.parentNode.style.overflow = 'auto'
        } else {
          file.height = "100%"
          file.width = "100%"
          let p = event.target.parentNode
          p.scrollTop = 0
          p.scrollLeft = 0
          p.style.overflow = 'hidden'
        }
      }
    },
    cancelPreview(e, img) {
      if (this.$vuetify.breakpoint.xs) {
        return
      }
      let div = e.target
      if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
        div = div.parentElement
      }
      let cla = div.getAttribute("class")
      cla = cla.replaceAll("prev-img-large", "")
      div.setAttribute('class', cla)

      cla = div.children[1].getAttribute("class")
      cla = cla.replaceAll("prev-img-" + img.rotate, "")
      div.children[1].setAttribute("class", cla)

      img.rotate = 0
      this.imgOpt.isDown = false
      div.style.left = '0px'
      div.style.top = '0px'
    },
    largeImg(e) {
      if (this.imgOpt.click) {
        this.imgOpt.dblClick = true
        let div = e.target
        if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
          div = div.parentElement
        }
        let cla = div.getAttribute("class")
        if (cla.indexOf('prev-img-large') != -1) {
          cla = cla.replaceAll(("prev-img-large"), "")
        } else {
          cla += " prev-img-large"
        }
        div.setAttribute("class", cla)

        window.setTimeout(() => {
          this.imgOpt.dblClick = false
          this.imgOpt.isDown = false
        }, 200)
      } else {
        this.imgOpt.dblClick = false
      }
    },
    previewV2(e, img) {
      window.setTimeout(() => {
        if (!this.imgOpt.dblClick) {
          if (this.$vuetify.breakpoint.xs) {
            this.preview(img)
            return
          } else {
            let div = e.target
            if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
              div = div.parentElement
            }

            this.imgOpt.isDown = false
            div = div.children[1]
            //:class="'prev-img-'+file.rotate"
            if (this.imgOpt.click) {
              let cla = div.getAttribute("class")
              if (img.rotate == null) {
                this.$set(img, "rotate", 0)
              }
              cla = cla.replaceAll(("prev-img-" + img.rotate), "")
              img.rotate = img.rotate + 90
              if (img.rotate >= 360) {
                img.rotate = 0
                div.setAttribute("class", cla)
              } else {
                div.setAttribute("class", cla + " prev-img-" + img.rotate)
              }
            }
            window.setTimeout(() => {
              this.imgOpt.click = true
            }, 100)
          }
        }
      }, 200)
    },
    preview(img) {
      this.imgFile = []
      let idx = 0
      this.files.forEach(f => {
        if (this.isImg(f)) {
          let temp = {fileName: f.fileName, showPath: f.showPath, height: '100%', id: f.id};
          this.imgFile.push(temp);
          if (temp.id == img.id) {
            this.imgItemIdx = idx
          }
          idx++
        }
      });
      this.previewDetail = true
    },
    isImg(file) {
      let regular = new RegExp(/(bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp|jpeg|avif)$/)
      let isImg = regular.test(file.suffix);
      return isImg;
    },
    loadStaff() {
      getStaff(this.searchName).then(response => {
        this.notify.staffList = response;
      });
    },
    show(e, file) {
      this.file = file
      e.preventDefault()
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    getColorByState(state) {
      if (state == 0) {
        return '#ECECEC';
      } else {
        return "none";
      }
    },
    selectStaff(items) {
      this.notify.notifyStaffList = items;
    },
    insertNotify() {
      let staffs = [];
      this.notify.notifyStaffList.forEach(s => {
        staffs.push(s.id);
      });
      if (this.notifyType == '知会') {
        notify(staffs, this.approve.id).finally(() => {
          this.loadSteps()
          // this.message.content = "操作成功";
          // this.message.show = true;
          this.notify.notifyStaffList = [];
          this.notify.show = false;
        })
      } else {
        //加签
        this.consentLoading = true;
        let data = []
        staffs.forEach(id => {
          data.push({id: id})
        })
        if(this.approveContent != null && this.approveContent != ""){
          this.approve.content = this.approveContent
          saveContent(this.approve)
        }
        appendApprove(this.approve.id, {staff: data}).finally(() => {
          this.loadSteps()
          // this.message.content = "操作成功";
          // this.message.show = true;
          this.notify.notifyStaffList = [];
          this.notify.show = false
          this.consentLoading = false
        })
      }
    },
    printApprove() {
      //记录更新打印次数
      if(this.instaceMsg.printCount == null){
        this.instaceMsg.printCount = 0
      }
      this.instaceMsg.printCount += 1
      updatePrint({id:this.instaceMsg.id,printCount:this.instaceMsg.printCount})
      let t = () => new Promise(resolve => {
        try {
          resolve(require(`@/components/print/${this.instaceMsg.frameCoding}.vue`))
        } catch (e) {
          this.print.printComponent = () => import(`@/components/print/default.vue`);
        }
      });
      this.print.printComponent = t;
    },
    setContent() {
      if (this.approveContent == null || this.approveContent == "") {
        this.approve.content = '同意';
      } else {
        this.approve.content = this.approveContent;
      }
    },
    appendConsent() {
      this.consentLoading = true;
      this.setContent();
      appendConsent(this.approve).then(() => {
        this.closeDialog("consent");
      }).finally(() => {
        this.consentLoading = false;
      });
    },
    fqConsent() {
      if (this.approve.approveState == 3) {
        this.approve.po00421 = '1';
        this.appendConsent();
      } else {
        this.consentByParam(1);
      }
      this.consentFlag = true
    },
    notifyHandler() {
      this.notifyType = '知会'
      this.notify.show = true
    },
    appendApprove() {
      this.notifyType = '加签'
      this.notify.show = true
    },
    consent() {
      if (this.approve.approveState === 3) {
        this.appendConsent();
      } else {
        this.consentByParam(0);
      }
      if (this.$store.state.api.approveMsgCount != null) {
        this.$store.commit('setMsgCount', this.$store.state.api.approveMsgCount - 1)
      }
      this.consentFlag = true
    },
    breakToStep(step) {
      this.consentLoading = true;
      this.setContent();
      if (this.approve.content == "同意") {
        this.approve.content = "驳回";
      }
      breakToCourse({approve: this.approve, link: {id: step.courseId, name: step.courseName}}).then(() => {
        this.closeDialog("break");
      }).finally(() => {
        this.consentLoading = false;
      });
      if (this.$store.state.api.approveMsgCount != null) {
        this.$store.commit('setMsgCount', this.$store.state.api.approveMsgCount - 1)
      }
    },
    breakApprove() {
      this.consentLoading = true;
      this.setContent();
      if (this.approve.content == "同意") {
        this.approve.content = "驳回";
      }
      breakFlow(this.approve).then(() => {
        this.closeDialog("break");
      }).finally(() => {
        this.consentLoading = false;
      });
      if (this.$store.state.api.approveMsgCount != null) {
        this.$store.commit('setMsgCount', this.$store.state.api.approveMsgCount - 1)
      }
    },
    recall() {
      this.consentLoading = true;
      recall(this.approve).then((res) => {
        if (res == 0) {
          this.message.content = "撤回失败，下一节点已经审批完成";
          this.message.show = true;
        } else {
          this.closeDialog("recall");
        }

      }).finally(() => {
        this.consentLoading = false;
      });
    },
    selectApprove() {
      this.consentLoading = true;
      let newPersonList = [];
      this.selectApprovePerson.personList.forEach((item) => {
        let isSelect = false;
        let newStaff = [];
        item.staff.forEach((user) => {
          if (this.selectPersons.indexOf(user.id) != -1) {
            isSelect = true;
            newStaff.push(user);
          }
        })
        if (isSelect) {
          item.staff = newStaff;
          newPersonList.push(item);
        }
      });
      this.setContent();
      this.selectApprovePerson.personList = newPersonList;
      selectPersonConsent(this.approve, this.selectApprovePerson).then(() => {
        this.closeDialog("consent");
      }).finally(() => {
        this.consentLoading = false;
      });
    },
    downloadFile() {
      if (this.file) {

        let a = document.createElement("a");
        a.filename = this.file.fileName;
        a.download = this.file.fileName || 'download.jpg';
        let name = this.file.name
        let idx = name.indexOf("/")
        if (idx == -1) {
          idx = name.indexOf("\\")
        }
        if (idx != -1) {
          name = name.substring(idx + 1)
        }
        if (this.file.suffix == "html") {
          a.href = this.serverHost + this.file.name + this.file.id + this.file.fileName.substring(this.file.fileName.lastIndexOf("."));
        } else if (this.isImg(this.file)) {
          // axios.get(this.file.showPath).then(result=>{
          //   console.log(result)
          // })
          // console.log('/api/files/downloadFile?filePath='+encodeURIComponent(this.file.fileName)+"&downloadFile="+this.file.name)
          // window.open('/api/files/downloadFile?filePath='+encodeURIComponent(this.file.fileName)+"&downloadFile="+this.file.name)
          // a.href = this.file.showPath + "?response-content-type=application%2Foctet-stream";
          // a.target = "_blank"
          // document.body.appendChild(a)
          // a.click()
          // document.body.removeChild(a)

          axios.get('/api/files/downloadFile?filePath=' +
              encodeURIComponent(this.file.downloadPath) + "&downloadFile=" + name, {responseType: 'blob'})
              .then(result => {
                const url = window.URL.createObjectURL(result.data)
                const a = document.createElement('a')
                a.href = url
                a.download = this.file.name + "." + this.file.suffix
                // 将虚拟链接添加到文档中
                document.body.appendChild(a)
                // 模拟点击虚拟链接
                a.click()
                // 从文档中移除虚拟链接
                document.body.removeChild(a)
              })
          return;
        } else {
          a.href = this.file.showPath + "?response-content-type=application%2Foctet-stream";
        }
        a.click();

        // document.body.removeChild(a);
      }
    },
    resizeFrame() {
      let cw = document.body.clientWidth;
      if (cw > 1280 && cw <= 1381) {
        this.height = "525px";
      } else if (cw >= 768 && cw <= 1280) {
        this.isFullscreen = true;
        this.height = "86%";
      } else if (cw < 768) {
        this.isFullscreen = true;
        this.height = "75%";
      } else if (document.body.clientHeight <= 694 && cw > 768) {
        this.isFullscreen = false;
        // this.height = "100%";
      }

      this.setDialogHeight()
    },
    loadAllSteps() {
      this.loadApproveLoading = true
      flowCourseInstance(this.instaceMsg.id, this.instaceMsg.histroryId).then((result) => {
        this.disabledPrint = false;
        this.fqFlag = false;
        let steps = []
        result.forEach(item => {

          if (item.flowApproves && item.flowApproves.length > 0) {
            this.approveList = this.approveList.concat(item.flowApproves)
          } else {
            item.flowApproves = []
            let temp = {
              id: -1,
              acceptUser: null,
              approveStatus: -1,
              po00421: ''
            }
            if (item.personList) {
              item.personList.forEach(item2 => {
                if (item2 && item2.type === 0 && item2.staff) {
                  item2.staff.forEach(staff => {
                    let t = Object.assign({}, temp)
                    t.acceptUser = staff
                    item.flowApproves.push(t)
                  })
                }
              })
            }
          }

          let step = {
            approves: item.flowApproves,
            courseId: item.id,
            courseName: item.name,
            status: -1
          }
          item.flowApproves.forEach(item2 => {
            if (item2.approveState <= 1) {
              step.status = item2.approveState
            } else if (item2.approveState <= 4 && (step.status === -1 || step.status >= 5)) {
              step.status = item2.approveState
            }
          })
          steps.push(step)
        })
        this.steps = steps

        this.$emit("loadSteps", steps)
      }).finally(() => {
        this.loadApproveLoading = false
      })
    },
    loadSteps() {
      this.consentFlag = false
      this.loadApproveLoading = true
      this.files = [];
      this.approveList = [];
      let tempMap = [];
      this.disabledPrint = true;
      let approveResult;
      if (this.instaceMsg.state === 1 || this.instaceMsg.startDate > (new Date().getFullYear() - 1 + "-12-31 23:59:59")) {
        approveResult = getApproveSteps(this.instaceMsg.id)
      } else {
        approveResult = getApproveRecord(this.instaceMsg.id)
      }
      approveResult.then(steps => {
        this.disabledPrint = false;
        this.approveList = steps;
        this.fqFlag = false;
        let tempArray = []
        steps.forEach(item => {

          if (this.operate && item.approveState <= 1) {
            if (item.acceptUser.id == this.$store.state.user.id) {
              this.operate = false
              this.noWatch = true
              item.message = this.approve.message
              this.approve = item
            }
          }

          if (item.po00421 == '1') {
            this.fqFlag = true;
          }
          if (!tempMap[item.courseId]) {
            let step = {
              approves: [item],
              courseId: item.courseId,
              courseName: item.courseName,
              status: item.approveState
            };
            tempMap[item.courseId] = step;
            tempArray.push(step);
          } else {
            let step = tempMap[item.courseId]
            let approves = step.approves;
            if ((item.approveState <= 1 && step.status == 3)
                || (step.status >= 5 && (item.approveState == 3 || item.approveState == 4))) {
              //当前进度节点
              tempMap[item.courseId].status = item.approveState;
            }
            approves.push(item);
            approves.sort((a, b) => {
              if (a.approveDate == "" || b.approveDate == "") {
                return (a.approveDate < b.approveDate) ? 1 : -1;
              } else {
                return (a.approveDate > b.approveDate) ? 1 : -1;
              }
            })
          }
        });
        this.steps = tempArray
        this.$emit("loadSteps", steps)
      }).finally(() => {
        this.loadApproveLoading = false
      })

      if (this.approve.approveState == 3) {
        //设置按钮文字为追加审批意见
        this.consentStr = '补充意见';
        this.consentStr2 = '分期支付';
      } else {
        this.consentStr = '同意';
        this.consentStr2 = '分期支付';
      }
      //加载审批表单组件
      this.loadFrame();
      //加载附件
      this.loadFiles();
      //显示模态框
      this.showDetail = true;

      //    dialog foot 宽度
      window.setTimeout(() => {
        this.setDialogHeight()
      }, 200)
    },
    loadFrame() {
      try {
        if (this.frameCoding !== this.instaceMsg.frameCoding) {
          this.frameCoding = this.instaceMsg.frameCoding;
          this.currentTabComponent = () => import(`@/components/${this.frameCoding}.vue`);
        }
        this.frameId = this.instaceMsg.frameId
      } catch (e) {
        console.log(e);
      }
    },
    loadFiles() {
      this.fileTitle = "正在加载附件..."
      let mobile = (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm)
      if (this.instaceMsg.frameCoding == "10563" && this.instaceMsg.title.indexOf("&") !== -1) {
        loadById(this.instaceMsg.frameId).then(payment => {
          getMessageByFrameId(payment.details[0].contract.id).then(contractMessage => {
            getFiles(contractMessage.id, contractMessage.frameId, "10564", mobile).then(this.fileResult)
          })
        })
      } else {
        getFiles(this.instaceMsg.id, this.instaceMsg.frameId, this.instaceMsg.frameCoding, mobile).then(this.fileResult);
      }
    },
    fileResult(files) {
      this.fileSuffix(files);
      this.files = files;
      if (this.files.length > 0) {
        this.fileTitle = "附件预览";
      } else {
        this.fileTitle = "无附件";
      }
    },
    fileSuffix(files) {
      files.forEach(f => {
        let name = f.showPath;
        let suffix = '';
        let index = name.lastIndexOf(".");
        index = index == -1 ? f.length : index + 1;
        suffix = f.showPath.substring(index, f.length);
        f.suffix = suffix.toLowerCase();
        f.downloadPath = decodeURIComponent(f.showPath);
        if ((this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm)
            && window.location.protocol == 'https:') {

          if (f.suffix == 'pdf') {
            if (f.pdfImgPath != null && f.pdfImgPath.length > 0) {
              f.pdfImg = true
              let paths = [];
              f.pdfImgPath.forEach(path => {
                paths.push(this.ftpFolder + "/" + encodeURIComponent(path))
              })
              f.pdfImgPath = paths
            }
          } else {
            f.showPath = this.ftpFolder + "/" + f.downloadPath
          }

        } else {
          //直接从配置的文件服务器预览
          f.showPath = this.serverHost + f.downloadPath
        }
      });
    },
    closeDialog(type) {
      this.showSelect = false;
      this.selectApprovePerson = {
        name: null,
        personList: null
      };
      this.selectPersons = [];
      this.showDetail = false;
      // if (type != null && !type.target) {
      //   // this.message.content = "操作成功";
      //   // this.message.show = true;
      // }
      this.approveContent = null;
      if (this.close != null) {
        this.close(true, type);
      }
      this.$emit("close", this.showDetail)
    },
    setDefaultUser() {
      let userCount = 0
      let fj = null
      let fi = -1
      for (let i = 0; i < this.selectApprovePerson.personList.length; i++) {
        fi = i
        let person = this.selectApprovePerson.personList[i]
        if (person.staff) {
          for (let j = 0; j < person.staff.length; j++) {
            fj = j
            userCount++
          }
        }
      }
      //只有一位审批人，自动选择并流转 coursePersonId
      if (userCount === 1) {
        let courseRole = this.selectApprovePerson.personList[fi]
        this.selectPersons.push(courseRole.staff[fj].id)
        this.selectApprove()
      }

    },
    consentByParam(fqFlag) {
      this.consentLoading = true;
      this.setContent();
      consent(this.approve, fqFlag).then(response => {
        if (response.flowCourse != null) {
          //自由选人审批
          this.selectPersons = []
          this.selectApprovePerson = response.flowCourse
          this.showSelect = true
          this.setDefaultUser()
        } else {
          this.closeDialog("consent");
        }
      }).finally(() => {
        this.consentLoading = false;
      });
    },
    loadStepsByFrameId() {
      return getMessageByFrameId(this.frame).then(msg => {
        if (msg != null) {
          this.approve.message = msg
          if (msg.code == 200 && msg.data == null) {
            this.message.content = "审批消息不存在";
            this.message.show = true;
          } else {
            this.instaceMsg = msg;
            this.loadSteps();
          }

        } else {
          this.message.content = "审批消息不存在";
          this.message.show = true;
        }
        return msg
      })
    },
    mouseDownHeader(e) {
      this.imgOpt.isDown = true
      window.setTimeout(() => {
        if (!this.imgOpt.dblClick) {
          if (this.$vuetify.breakpoint.xs) {
            return;
          }
          //获取x坐标和y坐标
          // let div = e.target
          // if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
          //     div = div.parentElement
          // }
          this.imgOpt.x = e.offsetX
          this.imgOpt.y = e.offsetY
        }
      }, 50)
    },
    drag: function (e) {
      if (this.$vuetify.breakpoint.xs) {
        return;
      }
      if (!this.imgOpt.isDown) {
        return true;
      }
      this.imgOpt.click = false
      let div = e.target
      if (div.getAttribute("class").indexOf("v-responsive__content") != -1) {
        div = div.parentElement
      }
      let offset = {
        x: parseFloat(div.style.left),
        y: parseFloat(div.style.top),
      }
      if (isNaN(offset.x)) {
        offset.x = 0
      }
      if (isNaN(offset.y)) {
        offset.y = 0
      }
      //获取x和y
      let nx = e.offsetX - this.imgOpt.x + offset.x
      let ny = e.offsetY - this.imgOpt.y + offset.y
      div.style.left = nx + 'px'
      div.style.top = ny + 'px'
    }
  }
}
</script>

<style>
.pointer {
  cursor: pointer;
}

.pre-img {
  transform: rotate(0deg);
  position: relative;
}

.prev-img:hover {
  transform: scale(2.8, 2.5);
  transition: 0.6s transform;
  border: 1px solid black;
  cursor: move;
  z-index: 999;
}

.prev-img-90 {
  transform: rotate(90deg);
  transition: 0.6s transform;
}

.prev-img-180 {
  transform: rotate(180deg);
  transition: 0.6s transform;
}

.prev-img-270 {
  transform: rotate(270deg);
  transition: 0.6s transform;
}

.prev-img-360 {
  transform: rotate(360deg);
  transition: 0.6s transform;
}

.v-dialog:not(.v-dialog--fullscreen) {
  max-height: 95%;
}

.prev-img-large {
  transform: scale(3.8, 3.5) !important;
}

.img-tooltip {
  position: absolute;
  bottom: 10px;
  color: white;
  z-index: 99;
  left: 10px;
  font-size: 12px;
}

.img-tooltip-btn {
  position: absolute;
  bottom: 10px;
  color: white;
  z-index: 99;
  right: 10px;
}

#approveLoading {
  height: 32px;
  position: absolute;
  top: 25%;
  width: 32px;
  left: 150px;
}

@media screen and (max-width: 600px) {
  .prev-img {
    z-index: 1;
  }

  .prev-img:hover {
    transform: scale(1.0, 1.0);
    z-index: 1;
  }
}

</style>
