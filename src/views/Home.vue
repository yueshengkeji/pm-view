<template>
  <div class="home">

    <pmMenu :extMenu="ext" @selectNavType="setIsMin"></pmMenu>

    <div id="isLeader" :data-id="$store.state.user.id"
         :data-coding="$store.state.user.coding"
         :data-role="$store.state.user.roles"
         :data-staff="$store.state.user.name"
         :data-section-manager="$store.state.user.leader"
         :data-section="$store.state.user.sectionName"></div>
    <v-main :class="($store.getters.hideMenu || this.isMin) ? 'pa-0' : ''">
      <v-container fluid class="pt-5">
        <router-view v-if="extHtml == null" class="mb-7" v-bind:socketData="socketData"/>
        <iframe frameborder="none" ref="iframe" v-else :src="extHtml" style="width: 100%;"></iframe>
      </v-container>
    </v-main>

    <v-bottom-navigation hide-on-scroll height="30" horizontal absolute v-if="infoList.length > 0">
      <v-carousel v-model="infoModel" height="30" class="pt-1" :show-arrows="false" hide-delimiters cycle>
        <v-carousel-item v-for="(info) in infoList"
                         :key="info.id"
                         target="_blank"
                         :to="'/infoDetail/'+info.id"
                         class="cursor">
          <v-fab-transition>
            <div class="black--text text-center info-hover">{{ info.title }}</div>
          </v-fab-transition>
        </v-carousel-item>
      </v-carousel>
    </v-bottom-navigation>
  </div>
</template>

<script>
// @ is an alias to /src
import pmMenu from '@/components/menu/index.vue'
import {list, saveError} from '@/api/systemInfo'
import {getApproveList, notifyMyNoReadCount} from "@/api/approve"
import {updateMobileInfo} from "@/api/staff"

export default {
  name: 'Home',
  components: {
    pmMenu
  },
  data: () => ({
    socketData: null,
    extHtml: null,
    infoModel: true,
    infoList: [],
    isMin: false,
    timeout:null,
  }),
  created() {
    if (window.location.hostname == "192.168.2.254") {
      let linkElement = document.createElement('link');

      // 设置 link 元素的属性
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = '/vuetify/font/materialdesignicons.min.css';

      // 获取 head 元素
      let headElement = document.head || document.getElementsByTagName('head')[0];

      // 将 link 元素添加到 head 中
      headElement.appendChild(linkElement);
    }
    //设置服务端api地址
    let t = localStorage.getItem("timeout")
    if (t) {
      window.clearTimeout(t)
    }
    this.$store
        .dispatch("loadApiUrl").then(() => {
      this.$store
          .dispatch("loadCname")
      this.loadApproveDataCount()
      this.loadInfoList()
      let loginError = localStorage.getItem("loginError")
      if (loginError) {
        saveError(loginError)
      }
      if (this.$vuetify.breakpoint.xs) {
        this.uploadMobileInfo()
      }
    })

    this.setIsMin()
    this.initWebSocket()

  },
  methods: {
    uploadMobileInfo() {
      let userAgent = navigator.userAgent;
      let brand, model;

      if (userAgent.match(/Android/i)) {
        brand = "Android";
        model = userAgent.match(/Android\s([^\s]*);/i)[1];
      } else if (userAgent.match(/iPhone|iPod|iPad/i)) {
        brand = "Apple";
        model = userAgent.match(/iPhone\sOS\s([^\s]*)/i)[1];
      } else {
        brand = "Unknown";
        model = "Unknown";
      }

      updateMobileInfo({id: this.$store.state.user.id, mobileBrand: brand, mobileModel: model})

    },
    loadApproveDataCount() {
      let approveInfoCount = 0
      let x = 2
      getApproveList(null, this.$store.state.user.id, 1, 100).then(result => {
        result.forEach(item => {
          if (item.approveState === 0) {
            approveInfoCount++
          }
        })
      }).finally(() => {
        x--
        if (x === 0) {
          this.$store.commit('setMsgCount', approveInfoCount)
        }
      })
      notifyMyNoReadCount().then(result => {
        if (result && result > 0) {
          if (result > 99) {
            result = 99
          }
          approveInfoCount += result
        }
      }).finally(() => {
        x--
        if (x === 0) {
          this.$store.commit('setMsgCount', approveInfoCount)
        }
      })
    },
    initWebSocket() {
      // this.socket = new WebSocket(`${protocol}://${window.location.host}/api/infoTest`)
      let protocol = 'ws'
      if (window.location.protocol == "https:") {
        protocol = "wss";
      }
      this.socket = new WebSocket(`${protocol}://${window.location.host}/infoTest`)
      // this.socket = new WebSocket(`${protocol}://192.168.3.46:8089/infoTest`)
      this.socket.onmessage = (data) => {
        try {
          if(data.data == "ok"){
            console.log("socket心跳")
            return
          }
          this.socketData = JSON.parse(data.data)
          console.log("socketData", this.socketData)
        } catch (e) {
          console.log("socketOnMessage error:",e)
        }
      }
      this.socket.onerror = (e) => {
        console.log("socket通讯异常", e)
      }
      this.socket.onclose = (e)=>{
        console.log("socket关闭，重新连接",e)
        window.setTimeout(()=>{
          this.initWebSocket()
        },1500)
      }
      this.socket.onopen = () => {
        console.log("socket连接成功")
        this.webSocketPing(50000)
      }
    },
    webSocketPing(timeout){
      if(this.timeout){
        clearInterval(this.timeout)
      }
      this.timeout = setInterval(()=>{
        if(this.socket.readyState == 1){
          this.socket.send("ping")
        }
      },timeout)
    },
    setIsMin() {
      this.isMin = localStorage.getItem("menuType") == "0"
    },
    loadInfoList() {
      list({itemsPerPage: 5, page: 1}).then(data => {
        if (data != null && data.rows != null) {
          this.infoList = data.rows
        }
      }).catch(e => {
        console.log(e)
      })
    },
    ext(menu) {
      if (menu == null) {
        this.extHtml = null;
      } else {
        this.extHtml = menu.outerPath;
        window.setTimeout(() => {
          this.setIframeHeight(this.$refs['iframe']);
        }, 1000);
      }
    },
  }
}
</script>
<style>
.cursor {
  cursor: pointer;
}

.info-hover {
  transition: background-color .5s;
}

.info-hover:hover {
  background: rgba(229, 229, 229, 1)
}
</style>
