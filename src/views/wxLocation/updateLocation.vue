<template>
  <div>
    <v-form ref="form" v-if="msg == null">
      <v-row>
        <v-col cols="8" v-if="showTooltip"><p class="red--text">
          苹果手机如果拍照后无限刷新页面，请关闭后台进程(地图)后再拍照即可</p>
        </v-col>
        <v-col cols="4">
          <v-checkbox label="原图上传" v-model="sourceImg" dense></v-checkbox>
        </v-col>
        <v-col cols="4">
          <v-text-field label="姓名" readonly v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field label="部门" readonly v-model="data.section.name"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="data.startAddrName" readonly label="出发地点"
                        hint="请允许定位权限，否则无法保存"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="data.endAddrName" readonly label="到达地点"
                        hint="请允许定位权限，否则无法保存"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="系统记录公里数" readonly v-model="data.systemKm"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="实际公里数(可修改)" v-model="data.inputKm"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-checkbox v-model="isParkingCostFlag" label="停车费"></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-img :src="prevImg" @click="prevImgHandler" style="width: 100%;max-height: 200px"></v-img>
        </v-col>
        <v-col cols="6">
          <v-text-field type="number" label="过路费" v-model="data.toll"></v-text-field>
        </v-col>
        <v-col cols="6">
          <img ref="prevImg" id="prevImg" :src="prevImg2" style="width: 100%;max-height: 200px"/>
        </v-col>
        <v-col cols="12">
          <v-btn :loading="loading" @click="openCamera('no')"
                 :disabled="!submit" block color="primary">{{ submit ? '到达' : '正在获取位置...' }}
          </v-btn>
          <v-btn :loading="loading" @click="openCamera('reAdd')" :disabled="!submit" block color="primary" class="mt-1">
            到达 并 再次出发
          </v-btn>
          <input style="opacity: 0;position:fixed;z-index: -1;top:-10px"
                 type="file"
                 ref="imgFileInput"
                 :multiple="false"
                 @change="fileChange"
                 accept="image/*"
                 capture="camera"/>
        </v-col>
      </v-row>
    </v-form>
    <div v-if="msg != null">
      <h3>{{ msg }}</h3>
    </div>
    <v-dialog v-model="prevImgDialog" fullscreen>
      <v-card class="pa-1">
        <v-btn small icon @click="prevImgDialog = false" absolute right color="error">
          <v-icon x-small>mdi-close</v-icon>
        </v-btn>
        <v-img style="margin-top:50%" :src="prevImg" width="100%"></v-img>
        <v-text-field label="实际公里数" v-model="data.inputKm"></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="prevImgDialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import {getConfig, wxConfig} from '@/api/systemConfig'
import {getAddressName, getRoutes, getSha1, getTicket} from '@/api/weixin'
import {upload, uploadByBase64} from '@/api/files'
import {getById, update} from '@/api/outCarHistory'

export default {
  name: "updateLocation",
  data: () => ({
    config: {
      appId: '', // 必填，公众号的唯一标识
      timestamp: '', // 必填，生成签名的时间戳
      nonceStr: '', // 必填，生成签名的随机串
      signature: '',// 必填，签名
      url: null,
      ticket: null,
      jsApiList: ["getLocation", "chooseImage", "getLocalImgData"] // 必填，需要使用的JS接口列表
    },
    data: {
      staff: {
        name: null
      },
      section: {
        name: null
      },
      startAddrName: null,
      startImg: null,
      startLatitude: null,
      startLongitude: null,
      endLatitude: null,
      endLongitude: null,
      systemKm: null,
      inputKm: null,
      endImg: null,
      endAddrName: null,
      toll: null,
    },
    submit: false,
    msg: null,
    isParkingCostFlag: false,
    prevImg: null,
    prevImg2: null,
    loading: false,
    add: "no",
    prevImgDialog: false,
    sourceImg: false,
    showTooltip: false,
    reAdd:null,
  }),
  watch: {
    "isParkingCostFlag": {
      handler() {
        this.data.isParkingCost = this.isParkingCostFlag ? 1 : 0
      }
    },
    sourceImg: {
      handler() {
        localStorage.setItem("sourceImg", this.sourceImg)
      },
      deep: true
    },
  },

  created() {
    this.sourceImg = localStorage.getItem("sourceImg") == "true"
    this.showTooltip = this.isIOS()
    getById(this.$route.params.id).then(result => {
      if (result && result.id) {
        getConfig("FTP_SERVER_PATH").then(result2 => {
          if (result2.id) {
            this.setImgPath(result, result2)
          }
        })
        this.data = result
        if (result.endImg != null && result.endImg != "") {
          this.isParkingCostFlag = result.isParkingCost == '1'
          this.message("本次出行已完成，请勿重复操作")
        } else {
          this.initWxConfig()
        }
      } else {
        this.error()
      }
    }).catch(this.error)
  },
  methods: {
  setImgPath(d, conf) {
      if (window.location.protocol == 'https:') {
        let prevImg = d.startImg.replace("\\", "/")
        this.prevImg = '/api/files/downloadFile?filePath=' + encodeURIComponent(prevImg) + "&downloadFile=t"
        if(d.endImg){
            let prevImg2 = d.endImg.replace("\\", "/")
            this.prevImg2 = '/api/files/downloadFile?filePath=' + encodeURIComponent(prevImg2) + "&downloadFile=t"
        }
      } else {
        this.prevImg = conf.value + d.startImg
        this.prevImg2 = conf.value + d.endImg
      }
    },
    prevImgHandler() {
      this.prevImgDialog = true
    },
    error() {
      this.msg = '数据不存在'
    },
    initWxConfig() {
      let st = new Date().getTime()
      wxConfig().then(res => {
        if (res) {
          // this.config.url = window.location.origin+this.$router.options.base+this.$route.fullPath.substring(1)
          this.config.url = window.location.href
          this.config.appId = res.APPID
          this.config.timestamp = new Date().getTime()
          this.config.nonceStr = this.randomStr(16)
          getTicket().then(res2 => {
            this.config.ticket = res2
            if ((new Date().getTime() - st) > 1000) {
              //相差1秒以后，此时微信工具应该加载完成直接初始化
              this.init()
            } else {
              window.setTimeout(() => {
                this.init()
              }, new Date().getTime() - st)
            }
          })
        }
      })
    },
    init() {
      // if(this.addFlag){
      //   this.config.url = window.location.origin+this.$router.options.base+"wxLocation/insertLocation"
      // }else{
      //   this.config.url = window.location.href
      // }
      let str = `jsapi_ticket=${this.config.ticket}&noncestr=${this.config.nonceStr}&timestamp=${this.config.timestamp}&url=${this.config.url}`;
      getSha1(str).then(signature => {
        window.wx.config({
          beta: true,
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: this.config.appId, // 必填，公众号的唯一标识
          timestamp: this.config.timestamp, // 必填，生成签名的时间戳
          nonceStr: this.config.nonceStr, // 必填，生成签名的随机串
          signature: signature,// 必填，签名
          jsApiList: this.config.jsApiList // 必填，需要使用的JS接口列表
        });
        let than = this
        window.wx.ready(function () {
          // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
          // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
          // 则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          than.loadLocation()
        });

        window.wx.error((e) => {
          // config信息验证失败会执行error函数，如签名过期导致验证失败，
          // 具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
          if (JSON.stringify(e).indexOf("login") != -1) {
            window.location.href = this.$router.options.base + "wxLocation/insertLocation"
          } else {
            this.message("微信授权失败，请刷新重试")
          }
          than.submit = false
        });

      })
    },
    fileChange(e) {
      this.loading = true
      if (this.sourceImg) {
        //ios 上传原图
        let formData = new FormData()
        formData.append('files', e.target.files[0])
        upload(formData).then((res) => {
          let uf = res.files[0]
          if (uf) {
            let temp = uf.name + uf.id + uf.fileName.substring(uf.fileName.lastIndexOf("."))
            this.data.endImg = temp
            this.save()
          }
        })
      } else {
        let reader = new FileReader()
        reader.onload = () => {
          let img = document.getElementById("prevImg")
          this.dealImageByTag(img, {width: 1600, height: 900}, (dealRes) => {
            img.onload = null
            this.prevImg2 = dealRes
            //上传文件到服务器
            this.uploadImg(dealRes)
          })
          this.prevImg2 = reader.result
        }
        reader.readAsDataURL(e.target.files[0])
      }

      /*if (files != null && files.length > 0) {
          this.data.files = ""
          files.forEach(item => {
              this.data.files = item.ftpPath
          })
          this.data.id = files.mainId
      }*/
    },
    uploadImg(base64) {
      // let idx = base64.indexOf('base64,')
      // if (idx == -1) {
      //   this.prevImg = "data:image/jpeg;base64," + base64
      // } else {
      //   this.prevImg = base64.substring(idx + 7)
      // }
      uploadByBase64({
        // data: idx == -1 ? base64 : base64.substring(idx + 7),
        data: base64,
        fileName: this.data.staff.name + this.formatTimer(new Date()) + Math.floor(Math.random() * 999) + "-2.jpg"
      }).then(path => {
        this.data.endImg = path
        this.save()
      })
    },
    loadLocation() {
      window.wx.getLocation({
        type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: (res) => {
          this.data.endLatitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
          this.data.endLongitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
          let bdData = this.convertGCJ02ToBD09(res.longitude, res.latitude)
          let bdStartData = this.convertGCJ02ToBD09(this.data.startLongitude, this.data.startLatitude)
          //计算经纬度
          getRoutes(bdStartData.lat, bdStartData.lng, bdData.lat, bdData.lng).then(result => {
            if (result.status == "0") {
              let km = result.result.routes[0].distance / 1000
              this.$set(this.data, 'systemKm', km)
              this.$set(this.data, 'inputKm', km)
              if (this.data.relocation == 1) {
                if(parseFloat(km) < 1){
                  this.confirmOpen(this.add)
                }else{
                  this.$refs.imgFileInput.click()
                }
              }
            } else {
              this.message("计算里程出错")
            }
          })
          //获取地址名称
          getAddressName(bdData.lat, bdData.lng).then(result => {
            let addr = result.result.addressComponent
            this.data.endAddrName = addr.city + "-" + addr.street + "-" + addr.street_number
          }).finally(() => {
            this.submit = true
          })

        }
      });
    },
    confirmOpen(reAdd){
      this.confirm("系统计算里程低于1公里，确定提交？").then(() => {
        this.add = reAdd
        this.$refs.imgFileInput.click()
      })
    },
    openCamera(reAdd) {
      if (parseFloat(this.data.systemKm) < 1) {
        if (this.data.relocation == 1) {
          this.confirmOpen(reAdd)
        } else {
          //重新计算里程
          this.add = reAdd
          this.data.relocation = 1
          this.loadLocation()
        }
        // this.message("系统计算里程低于1公里,建议右上角刷新页面，再拍照提交")
      } else {
        this.add = reAdd
        this.$refs.imgFileInput.click()
      }
      // if(this.$store.state.user.name == '宋正根'){
      //   this.$ref.imgFileInput.click()
      // }else{
      //   wx.chooseImage({
      //     count: 1, // 默认9
      //     sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      //     sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      //     success: (res) => {
      //       this.loading = true
      //       let id = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      //       window.setTimeout((localIds)=>{
      //         window.wx.getLocalImgData({
      //           localId: localIds[0], // 图片的localID
      //           success: (res) => {
      //             this.uploadImg(res.localData)
      //           }
      //         });
      //       },100,id)
      //
      //     }
      //   });
      // }

    },

    success: function () {
      this.msg = "登记完成"
      if (this.isParkingCostFlag) {
        this.msg += ",本次行驶产生停车费，请在支付停车费以后，上传付款截图凭证"
      }
    },
    save() {
      update(this.data, this.add).then(result => {
        if (result.id) {
          this.success();
        }
      }).catch(e=>{
        if((e+"").indexOf('出发时间到结束时间不能超过24小时') != -1){
          window.location.href = this.$router.options.base + "wxLocation/insertLocation"
        }
      }).finally(() => this.loading = false)
    },
  }
}
</script>

<style scoped>

</style>