<template>
  <div>
    <v-row>
      <v-col md="4">
        <audio ref="tooltip">
          <source src="@/assets/xfcg.mp3" type="audio/mpeg"/>
        </audio>
        <audio ref="tooltip2">
          <source src="@/assets/chongfu.mp3" type="audio/mpeg"/>
        </audio>
        <audio ref="tooltip3">
          <source src="@/assets/gonghao_no.mp3" type="audio/mpeg"/>
        </audio>
        <audio ref="tooltip4">
          <source src="@/assets/yuebuzu.mp3" type="audio/mpeg"/>
        </audio>
        <audio ref="tooltip5">
          <source src="@/assets/noDiningTime.mp3" type="audio/mpeg"/>
        </audio>
        <v-row dense>
          <v-col cols="12">
            <v-img contain :aspect-ratio="16/9" :width="300" :src="staffHead"/>
          </v-col>
          <v-col cols="12">
            <v-text-field
                disabled
                readonly
                ref="staffId"
                label="当前刷卡人姓名"
                v-model="staffName"></v-text-field>
          </v-col>
          <v-col cols="12" v-if="$store.state.user.name=='1001'">
            <v-text-field label="补卡人姓名" v-model="users" @keyup.enter="usersHandler"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-chip large color="error">就餐总人数：<span class="text-lg-h2">{{ items.length }}</span></v-chip>
          </v-col>
          <v-col cols="12">
            <v-chip large color="success" class="ml-1">{{ date }}公司考勤人数：<span
                class="text-lg-h2">{{ staffToDayWorkCount }}</span>
            </v-chip>
          </v-col>
          <v-col cols="12">
            <v-chip large class="ml-1">网络状态：{{ netState }}</v-chip>
          </v-col>
        </v-row>
      </v-col>

      <v-col md="8">
        <v-data-table :items="items"
                      :items-per-page="-1"
                      height="500"
                      sort-by="datetime"
                      :headers="headers">

        </v-data-table>
      </v-col>
    </v-row>
    <v-snackbar v-model="msgFlag" :timeout="5000" centered color="error">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {dining, diningByDate, toDayList, toDayStaffCount} from '@/api/dining'
import {getStaff, getStaffHead} from '@/api/staff'

export default {
  name: "dining",
  data: () => ({
    items: [],
    headers: [
      {text: '员工姓名', value: 'staff.name'},
      {text: '消费金额', value: 'money'},
      {text: '就餐时间', value: 'datetime'},
    ],
    staff: {
      id: null,
      name: null
    },
    disabled: false,
    msgFlag: false,
    msg: null,
    staffName: null,
    staffToDayWorkCount: 0,
    date: null,
    netState: '网络正常',
    staffHead: '/vuetify/favicon.ico',
    dateDining: null,
    localStorageName: "dsa",
    localStorageMoneyName: "dsam",
    users: null
  }),
  props:{
    socketData: null,
  },
  created() {
    this.init()
    this.loadList()
    // this.initWebSocket()
    this.$store.state.menus.hide = true
    this.date = this.formatTimer(new Date())

    this.initTimer()
    //8点35分执行一次
    this.setTask(8,35,this.loadList,'定时任务执行')
    //9点3分执行一次
    this.setTask(9,3,this.loadList,'定时任务执行')

    this.checkCatchData()
  },
  watch: {
    staff: {
      handler(val) {
        console.log("职员信息变化，请求就餐扣费", val)
      },
      deep: true
    },
    netState: {
      handler(val) {
        if (val == "网络正常") {
          //检测缓存消费数据
          this.checkCatchData()
        }
      },
    },
    socketData: {
      handler() {
        if(this.socketData.type == "diningHistory"){
          this.items.push(this.socketData.data)
        }else if(this.socketData.type == "workCheckTotal"){
          this.staffToDayWorkCount = this.socketData.data
        }
      }
    }
  },
  methods: {
    usersHandler() {
      let users = this.users.split(" ")
      let userIds = []
      users.forEach(item => {
        if (item && item != "") {
          getStaff(item).then(result => {
            if (result && result.length == 1) {
              userIds.push(result[0].id)
              dining({staff: {id: result[0].id}}).then(result => {
                if (result != null) {
                  // this.$refs.tooltip.play()
                  this.staffName = result.staff.name
                  this.updateStaffMoney(result.staff.id, result.balance)
                }
              }).catch(e => {
                console.log("dining error",e.toString())
                if (e.toString().indexOf("禁止二次消费") != -1) {
                  this.$refs.tooltip2.play()
                } else if (e.toString().indexOf("员工") != -1) {
                  this.$refs.tooltip3.play()
                } else if (e.toString().indexOf("余额不足") != -1) {
                  this.$refs.tooltip4.play()
                } else if (e.toString().indexOf("未到就餐时间") != -1) {
                  this.$refs.tooltip5.play()
                }
              })
            } else {
              console.log("未查询到该职员ID:", item)
            }
          })
        }
      })
      setTimeout(() => {
        console.log(userIds.join("、"), userIds.length)
      }, 9000)
    },
    testDining(val) {
      this.staff = {id: val.split(';')[0], name: val.split(';')[1]}
      this.dining()
    },
    updateStaffMoney(staffId, money) {
      let key = this.localStorageMoneyName + ";"
          + staffId + ";"
          + this.dateFormat(new Date(), "YYYY-mm-dd")
      if (window.localStorage.getItem(key) != undefined && window.localStorage.getItem(key) != "") {
        return
      }
      window.localStorage.setItem(this.localStorageName + staffId, money)
    },
    dining() {
      if (this.netState == "网络正常") {
        dining({staff: this.staff}).then(result => {
          if (result != null) {
            this.$refs.tooltip.play()
            this.staffName = result.staff.name
            this.updateStaffMoney(result.staff.id, result.balance)
            this.loadList()
          }
        }).catch(e => {
          if (e.toString().indexOf("禁止二次消费") != -1) {
            this.$refs.tooltip2.play()
          } else if (e.toString().indexOf("员工") != -1) {
            this.$refs.tooltip3.play()
          } else if (e.toString().indexOf("余额不足") != -1) {
            this.$refs.tooltip4.play()
          } else if (e.toString().indexOf("未到就餐时间") != -1) {
            this.$refs.tooltip5.play()
          }
        })
        getStaffHead(this.staff.id).then(result => {
          this.staffHead = 'data:image/png;base64,' + result
        })
      } else {
        //从本地缓冲中读取员工消费数据，如果有，从本地扣除，并记录扣除金额，设备联网后，再更新后台消费记录
        this.catchDining()
      }
    },
    catchDining() {
      let cm = window.localStorage.getItem(this.localStorageName + this.staff.id)
      if (cm != undefined && cm != "") {
        cm = parseFloat(cm)
        if (!isNaN(cm) && cm >= 5) {
          let m = cm - 5
          //更新本地缓存余额
          this.updateStaffMoney(this.staff.id, m)
          //记录消费数据到本地缓存
          this.saveDiningHistory(this.staff.id, 5)
          //播报消费成功
          this.$refs.tooltip.play()
        } else {
          //余额不足
          this.$refs.tooltip4.play()
        }
      } else {
        this.$refs.tooltip3.play()
      }
    },
    saveDiningHistory(staffId, money) {
      let key = this.localStorageMoneyName + ";"
          + staffId + ";"
          + this.dateFormat(new Date(), "YYYY-mm-dd")
      if (window.localStorage.getItem(key) != undefined && window.localStorage.getItem(key) != "") {
        return
      }
      let keyArrays = window.localStorage.getItem(this.localStorageMoneyName + ";")
      if (keyArrays == undefined) {
        keyArrays = ""
      }
      keyArrays += key + ","
      window.localStorage.setItem(key, money + ";" + this.dateFormat(new Date(), "YYYY-mm-dd HH:MM:SS"))
      window.localStorage.setItem(this.localStorageMoneyName + ";", keyArrays)
    },
    removeDiningHistory(staffId, date) {
      let key = this.localStorageMoneyName + ";"
          + staffId + ";"
          + date
      let keyArrays = window.localStorage.getItem(this.localStorageMoneyName + ";")
      if (keyArrays != undefined) {
        keyArrays = keyArrays.replace(key + ",", "")
        window.localStorage.setItem(this.localStorageMoneyName + ";", keyArrays)
      }
      window.localStorage.removeItem(key)
    },
    checkCatchData() {
      let keyArrays = window.localStorage.getItem(this.localStorageMoneyName + ";")
      if (keyArrays != undefined) {
        let array = keyArrays.split(",")
        array.forEach(key => {
          let t = key.split(";")
          let staffId = t[1]
          let value = window.localStorage.getItem(key)
          if (value) {
            let dm = value.split(";")
            let date = dm[1]
            let money = dm[0]

            diningByDate({
              staff: {
                id: staffId,
              },
              datetime: date,
              money: money
            }).then(result => {
              this.removeDiningHistory(result.staff.id, result.datetime.substring(0, 10))
            }).catch(e => {
              let em = e.toString()
              if (em.indexOf("禁止二次消费") != -1) {
                this.removeDiningHistory(em.split(";")[1], em.split(";")[2].substring(0, 10))
              }
            })
          }

        })
      }
    },
    startRequest(code) {
      try {
        console.log("code", code)
        if (code.indexOf(";") != -1) {
          let obj = code.split(";");
          this.staff.name = obj[1]
          this.staff.id = obj[0]
        } else {
          let up = false
          let jsonIdx = code.indexOf("id")
          if (jsonIdx == -1) {
            up = true
            jsonIdx = code.indexOf("ID")
          } else {
            if (jsonIdx > 2) {
              code = "{" + code.substring(jsonIdx - 1)
            }
            code = code.replace("\\r\\n", "")
            let data = JSON.parse(code)
            console.log(data)
            if (up) {
              this.staff.id = data.ID
              this.staff.name = data.NAME
            } else {
              this.staff.id = data.id
              this.staff.name = data.name
            }
          }
        }
      } catch (e) {
        console.log(code)
        this.msg = "扫码无效"
        this.msgFlag = true
      }
      if (this.staff.id != null) {
        this.dining()
        this.staffName = this.staff.name
      }
    },
    init() {
      let code = ""
      let lastTime, nextTime
      let lastCode, nextCode
      document.onkeypress = (e) => {
        if (window.event) { // IE
          nextCode = e.keyCode;
        } else if (e.which) { // Netscape/Firefox/Opera
          nextCode = e.which;
        }
        if (nextCode === 13) {
          if (code.length < 3) {
            return
          }

          try {
            if (code.indexOf(";") != -1) {
              let obj = code.split(";");
              this.staff.name = obj[1]
              this.staff.id = obj[0]
            } else {
              this.msg = "扫码无效"
              this.msgFlag = true
            }
          } catch (e) {
            this.msg = "扫码无效"
            this.msgFlag = true
          }
          if (this.staff.id != null) {
            this.startRequest(code)
            this.staffName = this.staff.name
          }
          code = '';
          lastCode = '';
          lastTime = '';
          return;
        }
        nextTime = new Date().getTime();
        if (!lastTime && !lastCode) {
          code += e.key;
        }

        if (lastCode && lastTime && nextTime - lastTime > 500) { // 当扫码前有keypress事件时,防止首字缺失
          code = e.key;
        } else if (lastCode && lastTime) {
          code += e.key;
        }
        lastCode = nextCode;
        lastTime = nextTime;

      }
      window.addEventListener('online', function () {
        // 网络连接正常
        this.loadList()
      });

    },
    loadList(param) {
      console.log(param)
      toDayList().then(result => {
        this.items = result
        this.netState = '网络正常'
      }).catch(e => {
        this.netState = '网络异常：' + e
      })
      toDayStaffCount().then(result => {
        let than = this
        for (let day in result) {
          if (day) {
            if (day != than.date) {
              than.date = day
            }
            than.staffToDayWorkCount = result[than.date]
            break
          }
        }

      })
    },
    initTimer(timeout) {
      let time = window.setInterval(() => {
        let hours = new Date().getHours()
        if (hours >= 14) {
          window.clearInterval(time)
        } else if (hours >= 9 && hours < 11) {
          this.setTask(11,40,this.initTimer,60000)
          window.clearInterval(time)
        } else {
          this.loadList()
        }
      }, timeout || (60000 * 5))
    },
    setTask(hours,minutes,func,param) {
      let currentTime = new Date();
      let targetTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hours, minutes); // 这里将目标执行时间设置为每天上午12点
      let timeDiff = targetTime - currentTime;
      if (timeDiff < 0) {
        // 若已经过了目标执行时间，则等到明天再执行
        let nextDayTargetTime = new Date(targetTime.getTime() + 86400000); // 加上一天的毫秒数
        setTimeout(func, nextDayTargetTime - currentTime,param);
      } else {
        // 否则直接设置定时器
        setTimeout(func, timeDiff,param);
      }
    },


  }
}
</script>

<style scoped>

</style>
