<template>
  <div>
    <v-form ref="form" v-if="msg == null">
      <v-row>
        <v-col cols="6">
          <v-text-field label="姓名" readonly v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="部门" readonly v-model="data.section.name"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="data.startAddrName" readonly label="出发地点"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="data.endAddrName" readonly label="到达地点"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="系统记录公里数" readonly v-model="data.systemKm"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="实际公里数" v-model="data.inputKm"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-img :src="prevImg" style="width: 100%;max-height: 100px"></v-img>
        </v-col>
        <v-col cols="6">
          <v-img :src="prevImg2" style="width: 100%;max-height: 100px"></v-img>
        </v-col>
        <v-col cols="12">
          <img ref="prevImg" :src="prevImg3" style="width: 100%;max-height: 200px"/>
        </v-col>
        <v-col cols="12">
          <v-btn :loading="loading" @click="openCamera" :disabled="!submit" block color="primary">上传停车费凭证</v-btn>
          <input style="opacity: 0;position:fixed;z-index: -1;top:-10px"
                 type="file"
                 ref="imgFileInput"
                 :multiple="false"
                 @change="fileChange"
                 accept="image/*"/>
        </v-col>
      </v-row>
    </v-form>
    <div v-if="msg != null">
      <h3>{{ msg }}</h3>
    </div>
  </div>
</template>

<script>

import {getConfig, wxConfig} from '@/api/systemConfig'
import {getTicket, getSha1} from '@/api/weixin'
import { getById,updateParkingCost} from '@/api/outCarHistory'
import {uploadByBase64} from "@/api/files";

export default {
  name: "updateParkingCost",
  data: () => ({
    config: {
      appId: '', // 必填，公众号的唯一标识
      timestamp: '', // 必填，生成签名的时间戳
      nonceStr: '', // 必填，生成签名的随机串
      signature: '',// 必填，签名
      url: null,
      ticket: null,
      jsApiList: ["chooseImage", "getLocalImgData","uploadImage"] // 必填，需要使用的JS接口列表
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
      endAddrName:null
    },
    submit: false,
    msg: null,
    isParkingCostFlag: false,
    prevImg:null,
    prevImg2:null,
    prevImg3:null,
    loading:false,
  }),
  watch: {
    "isParkingCostFlag": {
      handler() {
        this.data.isParkingCost = this.isParkingCostFlag ? 1 : 0
      }
    }
  },
  created() {
    getById(this.$route.params.id).then(result => {
      if (result && result.id) {
        getConfig("FTP_SERVER_PATH").then(result2 => {
          if(result2.id){
            this.prevImg = result2.value + result.startImg
            this.prevImg2 = result2.value + result.endImg
          }
        })
        this.data = result
        if(result.parkingCostImg != null && result.parkingCostImg != ""){
          this.message("本次出行已完成，请勿重复操作")
        }else{
          this.initWxConfig()
        }
      } else {
        this.error()
      }
    })
  },
  methods: {
    error() {
      this.msg = '数据不存在'
    },
    initWxConfig() {
      this.config.url = window.location.href
      wxConfig().then(res => {
        if (res) {
          this.config.appId = res.APPID
          this.config.timestamp = new Date().getTime()
          this.config.nonceStr = this.randomStr(16)
          getTicket().then(res2 => {
            this.config.ticket = res2
            this.init()
          })
        }
      })
    },
    init() {
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
          than.submit = true
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
      const reader = new FileReader()
      reader.onload = () => {
        this.prevImg3 = reader.result
        let img = this.$refs.prevImg
        this.dealImageByTag(img, {width: 1500, height: 700}, (dealRes) => {
          img.onload = null
          this.prevImg3 = dealRes
          //上传文件到服务器
          this.uploadImg(dealRes)
        })
      }
      reader.readAsDataURL(e.target.files[0])
      /*if (files != null && files.length > 0) {
          this.data.files = ""
          files.forEach(item => {
              this.data.files = item.ftpPath
          })
          this.data.id = files.mainId
      }*/
    },
    uploadImg(base64){
      let idx = base64.indexOf('base64,')
      let source;
      if (idx == -1) {
        source = base64
        this.prevImg3 = "data:image/jpeg;base64," + base64
      } else {
        source = base64.substring(base64.indexOf('base64,') + 7)
        this.prevImg3 = base64
      }
      uploadByBase64({
        data: source,
        fileName: this.data.staff.name + this.formatTimer(new Date()) + Math.floor(Math.random() * 99) + "-3.jpg"
      }).then(path => {
        this.data.parkingCostImg = path
        this.save()
      })
    },
    openCamera() {
      this.$refs.imgFileInput.click()
      // if(this.$store.state.user.name == '宋正根'){
      //   this.$ref.imgFileInput.click()
      // }else{
      //   wx.chooseImage({
      //     count: 1, // 默认9
      //     sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      //     sourceType:['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      //     success: (res) => {
      //       this.loading = true
      //       let localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      //       wx.getLocalImgData({
      //         localId: localIds[0], // 图片的localID
      //         success: (res) => {
      //           this.uploadImg(res.localData)
      //         }
      //       });
      //     }
      //   });
      // }

    },
    save() {
      updateParkingCost({id:this.data.id,parkingCostImg:this.data.parkingCostImg}).then(() => {
        this.msg = "登记完成"
      }).finally(()=>this.loading=false)
    }
  }
}
</script>

<style scoped>

</style>