<template>
  <div>
    <v-row justify="center" class="mt-5">
      <v-col md="3" sm="5" cols="12" class="text-center">
        <canvas id="code" ref="code" style="display: inline-block;text-align: center"></canvas>
        <p class="text-h6 text-center mb-0">余额：{{ account.balance }}</p>
        <p class="text-h6 text-center mb-0 gray--text">就餐码可以截图保存，方便下次使用</p>
        <p class="text-h2 text-center">{{ msgState }}</p>
      </v-col>
    </v-row>
    <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {getByStaffId} from '@/api/account'
import QRCode from "qrcode"

export default {
  name: "diningCode",
  data: () => ({
    code: null,
    width: 300,
    height: 300,
    msgState: '等待扫码',
    account: {
      balance: '',
      lastDatetime: '',
    },
    msgFlag: false,
    msg: ''
  }),
  created() {

    if (this.$vuetify.breakpoint.width < 300) {
      this.width = this.$vuetify.breakpoint.width - 20
    }
    this.content = this.$store.state.user.id + ";"
    this.$nextTick(() => {
      this.createCode()
    })

    getByStaffId(this.$store.state.user.id).then(result => {
      if (result.id == null) {
        this.msg = '未查询到账户信息，请联系管理员'
        this.msgFlag = true
      } else {
        this.account = result
      }
    })

    this.socketDataHandler(this.socketData)
  },
  props: {
    socketData: null,
  },
  watch:{
    socketData: {
      handler() {
        this.socketDataHandler(this.socketData)
      }
    }
  },
  methods: {
    createCode() {
      let width = this.width,
          height = this.height;
      QRCode.toCanvas(
          document.getElementById('code'),
          this.content,
          {width, height, toSJISFunc: QRCode.toSJIS},
          error => {
            console.log(error)
          }
      );
    },
    socketDataHandler(data) {
      if (data && data.type === 'diningSuccess') {
        this.msgState = data.msg
      }
    }
  }
}
</script>

<style scoped>

</style>