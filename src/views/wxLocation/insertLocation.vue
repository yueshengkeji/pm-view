<template>
  <div>
    <v-form ref="form" v-if="msg == null">
      <v-row>
        <v-col cols="12" v-if="showTooltip"><p class="red--text">
          苹果手机如果拍照后无限刷新页面，请关闭后台进程(地图)后再拍照即可</p>
        </v-col>
        <v-col cols="4">
          <v-checkbox label="原图上传" v-model="sourceImg" dense></v-checkbox>
        </v-col>
        <v-col cols="4">
          <v-text-field label="姓名" readonly v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-autocomplete label="部门"
                          auto-select-first
                          v-model="data.section"
                          :rules="[v => !!v || '请选择部门']"
                          :items="deptItems"
                          :search-input.sync="searchDeptStr"
                          item-text="name"
                          return-object>
          </v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="data.startAddrName" readonly label="出发地点"
                        hint="请允许定位权限，否则无法保存"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-autocomplete label="项目名称"
                          auto-select-first
                          @change="projectChangeHandler"
                          v-model="data.project"
                          return-object
                          :search-input.sync="searchProject"
                          item-text="name"
                          item-value="id"
                          :items="projectItems"></v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-text-field autofocus label="事由" :rules="[v => !!v || '请输入事由']" hint="请输入事由"
                        v-model="data.remark"></v-text-field>
        </v-col>
        <v-col cols="12">
          <img ref="prevImg" id="prevImg" :src="prevImg" style="width: 100%;max-height: 200px"/>
        </v-col>
        <v-col cols="12">
          <v-radio-group row v-model="data.carType" :rules="[v => (!!v || v == 0) || '请选择车辆类型']">
            <v-radio label="汽油车" :value="0"></v-radio>
            <v-radio label="新能源车" :value="1"></v-radio>
            <v-radio label="油电混动" :value="2"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12">
          <v-btn :loading="loading" @click="openCamera" :disabled="!submit" block color="primary">
            {{ submit ? '拍照出发' : '正在获取位置...' }}
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
    <div v-if="msg != null" class="mt-5">
      <h3>{{ msg }}</h3>
      <v-btn color="primary" block @click="toUpdateHandler">{{ timeout + '秒后或点击跳转' }}</v-btn>
    </div>
  </div>
</template>

<script>

import {getConfig, wxConfig} from '@/api/systemConfig'
import {getTicket, getSha1, getAddressName} from '@/api/weixin'
import {upload, uploadByBase64} from '@/api/files'
import {insert, getLastData} from '@/api/outCarHistory'
import {getSections} from "@/api/section"
import {search} from '@/api/project'

export default {
  name: "insertLocation",
  data: () => ({
    projectItems: [],
    searchProject: null,
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
        name: ""
      },
      section: {
        name: ""
      },
      startAddrName: null,
      startImg: null,
      startLatitude: null,
      startLongitude: null,
      remark: null,
      project: {
        name: null,
        id: null,
      },
      carType:null
    },
    submit: false,
    msg: null,
    loading: false,
    prevImg: null,
    timeout: 3,
    searchDeptStr: null,
    deptItems: [],
    showTooltip: false,
    serverPath: null,
    sourceImg: false,
  }),
  created() {
    try {
      this.sourceImg = localStorage.getItem("sourceImg") == "true"

      getConfig("FTP_SERVER_PATH").then(result2 => {
        if (result2.id) {
          this.serverPath = result2.value
        }
      })
      this.showTooltip = this.isIOS()
      let p = localStorage.getItem("locationProject")
      if (p && p != "") {
        p = JSON.parse(p)
        this.projectItems.push(p)
        this.data.project = p
      } else {
        search("").then(result => {
          this.projectItems = result
        })
      }

      // let carType = localStorage.getItem("carType")
      // if(carType && carType != ''){
      //   this.data.carType = parseInt(carType)
      // }

    } catch (e) {
      console.log(e)
    }
    getLastData().then(result => {
      if (result && (result.endImg == null || result.endImg == '')) {
        // this.$router.replace({path: '/wxLocation/updateLocation/' + result.id+"/add"})
        window.location.href = this.$router.options.base + `wxLocation/updateLocation/${result.id}`
      } else {
        this.wxConfig()
      }
    }).catch(() => {
      this.wxConfig()
    })

  },
  watch: {
    "data.carType":{
      handler(){
        localStorage.setItem("carType", this.data.carType)
      },
      deep:true
    },
    sourceImg: {
      handler() {
        localStorage.setItem("sourceImg", this.sourceImg)
      },
      deep: true
    },
    searchProject(val) {
      if (val && val != "" && val != this.data.project.name) {
        this.projectItems = []
        search(val).then(result => {
          if (result.length <= 0) {
            this.projectItems.push({id: '-1', name: val})
          } else {
            this.projectItems = result
          }
        })
      }
    },
    searchDeptStr(val) {
      if (val) {
        getSections(val).then(result => this.deptItems = result)
      }
    }
  },
  methods: {
    projectChangeHandler() {
      if (this.data.project && this.data.project.id && this.data.project.id != "") {
        localStorage.setItem("locationProject", JSON.stringify(this.data.project))
      }
    },
    wxConfig() {
      let st = new Date().getTime()
      this.data.staff.name = this.$store.state.user.name
      // this.data.section.name = this.$store.state.user.sectionName
      this.searchDeptStr = this.$store.state.user.sectionName
      getSections(this.searchDeptStr).then(result => {
        if (result && result.length > 0) {
          this.data.section = result[0]
          this.deptItems = result
        }
      })
      this.config.url = window.location.href
      wxConfig().then(res => {
        if (res) {
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
              }, new Date().getTime() - st + 100)
            }
          }).catch(() => {
            this.message("企业微信参数不正确")
          })
        } else {
          this.message("未配置企业微信参数")
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
    uploadImg(base64) {
      uploadByBase64({
        data: base64,
        fileName: this.data.staff.name + this.formatTimer(new Date()) + Math.floor(Math.random() * 999) + "-1.jpg"
      }).then(path => {
        this.data.startImg = path
        this.save()
      }).catch((e) => {
        this.message("上传图片失败:" + JSON.stringify(e))
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
            this.data.startImg = temp
            this.save()
          }
        })
      } else {
        let reader = new FileReader()
        reader.onload = () => {
          let img = document.getElementById('prevImg')
          this.dealImageByTag(img, {width: 1600, height: 900}, (dealRes) => {
            img.onload = null
            this.prevImg = dealRes
            //上传文件到服务器
            this.uploadImg(dealRes)
          })
          this.prevImg = reader.result
        }
        reader.readAsDataURL(e.target.files[0])
      }
    },
    loadLocation() {
      window.wx.getLocation({
        type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: (res) => {
          this.data.startLatitude = res.latitude + ""; // 纬度，浮点数，范围为90 ~ -90
          this.data.startLongitude = res.longitude + ""; // 经度，浮点数，范围为180 ~ -180。
          getAddressName(res.latitude, res.longitude).then(result => {
            let addr = result.result.addressComponent
            this.data.startAddrName = addr.city + "-" + addr.street + "-" + addr.street_number
          }).finally(() => {
            this.submit = true
          })
        },
        error: () => {
          this.message("获取位置失败，请允许获取位置权限")
        }
      });
    },
    openCamera() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.loading = true
      this.$refs.imgFileInput.click()
      // if(this.$store.state.user.name == '宋正根'){
      //
      // }else{
      //   window.wx.chooseImage({
      //     count: 1, // 默认9
      //     sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      //     sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      //     success: (res) => {
      //       let ids = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      //       window.setTimeout((localIds)=>{
      //         window.wx.getLocalImgData({
      //           localId: localIds[0], // 图片的localID
      //           success: (res) => {
      //             this.uploadImg(res.localData)
      //             /*let idx = res.localData.indexOf('base64,')
      //             let source;
      //             if (idx == -1) {
      //               source = res.localData
      //               this.prevImg = "data:image/jpeg;base64," + res.localData
      //             } else {
      //               source = res.localData.substring(res.localData.indexOf('base64,') + 7)
      //               this.prevImg = res.localData
      //             }
      //             uploadByBase64({
      //               data: source,
      //               fileName: this.data.staff.name + this.formatTimer(new Date()) + Math.floor(Math.random() * 99) + "-2.jpg"
      //             }).then(path => {
      //               this.data.startImg = path
      //               this.save()
      //             })*/
      //           }
      //         });
      //       },100,ids)
      //
      //     },
      //     error: () => {
      //       this.message("拍照失败,请刷新页面重试")
      //     }
      //   });
      // }
    },
    save() {
      insert(this.data).then(result => {
        if (result.id) {
          this.data.id = result.id
          this.msg = "登记完成，请到达目的地以后，点击到达并拍照"
          this.toUpdate()
        } else {
          this.msg = '登记失败'
        }
      }).finally(() => this.loading = false)
    },
    toUpdateHandler() {
      window.location.href = this.$router.options.base + `wxLocation/updateLocation/${this.data.id}`
    },
    toUpdate() {
      window.setInterval(() => {
        this.timeout--
        if (this.timeout == 0) {
          this.toUpdateHandler()
        }
      }, 1000)
    }
  }
}
</script>

<style scoped>

</style>