<template>
  <div>
    <v-btn @click="close()" fixed fab right bottom color="error">关闭</v-btn>

    <h3 class="text-center mt-5">{{ infoData.title }}</h3>
    <h5 class="text-center">{{ infoData.staff.section.name + '-' + infoData.sendDate }}</h5>

    <v-container v-html="infoData.content"></v-container>

    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {getDataById, read} from '@/api/systemInfo'

export default {
  name: "infoDetail",
  data: () => ({
    infoData: null,
    msg: null,
    msgShow: false,
    host:null
  }),
  created() {
    if(window.location.protocol.indexOf("https") !== -1){
      this.host = window.location.origin
    }

    this.reset()
    this.infoData.id = this.$route.params.id
    this.loadDetail()
  },
  methods: {
    close() {
      window.location.href = "about:blank";
      window.close();
    },
    noData() {
      this.msg = "未查询到公告信息"
      this.msgShow = true
    },
    loadDetail() {
      if (this.infoData.id != null) {
        getDataById(this.infoData.id).then((data) => {
          if (data != null) {
            if (data.staff == null) {
              data.staff = {name: '', section: {id: null, name: ''}}
            } else if (data.staff.section == null) {
              data.staff.section = {id: null, name: ''}
            }
            this.infoData = data
            this.readHistory()
          } else {
            this.noData()
          }
        }).catch((e) => {
          console.log("loadDetail error", e)
          this.noData()
        })
      }
    },
    reset() {
      this.infoData = {
        id: null,
        title: "加载中...",
        content: "",
        staff: {id: null, name: "", section: {id: null, name: ""}},
        sendDate: "",
      }
    },
    readHistory() {
      read(this.infoData.id)
    }
  }
}
</script>

<style scoped>

</style>