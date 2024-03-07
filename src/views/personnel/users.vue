<template>
  <div>
    <v-row>
      <v-col>
        <v-data-table :loading="loading"
                      :items="items"
                      sort-by="pj00425"
                      sort-desc
                      :items-per-page="10"
                      :server-items-length="total"
                      :options.sync="options"
                      :headers="headers"
                      :search="search">
          <template v-slot:top>
            <v-row>
              <v-col lg="3">
                <v-btn color="primary" @click="addStaff" class="mr-1" outlined>新增</v-btn>
                <v-btn @click="exportHandler" class="mr-1" outlined>导出</v-btn>
                <v-btn outlined v-if="$store.state.user.name == '1001'" :loading="syncLoading"
                       title="拉取微信用户手机号、邮箱信息" @click="syncWeiCharUser">同步微信信息
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col lg="2">
                <v-checkbox dense @change="list" v-model="leave" label="离职人员"></v-checkbox>
              </v-col>
              <v-col lg="3" cols="12">
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="搜索"
                    single-line
                    hide-details></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:item.dutys="{item}">
            <div v-html="item.dutys"></div>
          </template>
          <template v-slot:item.roleName="{item}">
            {{ formatRoleName(item) }}
          </template>
          <template v-slot:item.plates="{item}">
            <div v-html="item.plates"></div>
          </template>
          <template v-slot:item.additionInfo="{item}">
            <div v-if="item.additionInfo == null">-</div>
            <v-icon v-else color="green" :title="item.additionInfo.wxUserId">mdi-cellphone-link</v-icon>
          </template>
          <template v-slot:item.dingTalkStaffInfo="{item}">
            <div v-if="item.dingTalkStaffInfo == null">-</div>
            <v-icon v-else color="blue" :title="item.dingTalkStaffInfo.dingTalkUserId">mdi-cellphone-link</v-icon>
          </template>
          <template v-slot:item.duty="{item}">
            <template v-for="d in item.duty">
              <v-chip :key="d.id" v-if="d != null" x-small link @click="showDuty(d)">{{ d.name }}</v-chip>
            </template>
          </template>
          <template v-slot:item.lastLogin="{item}">
            <div>{{ dateFormat(new Date(item.lastLogin), 'm-d H:M') }}</div>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn class="mr-1" x-small @click="update(item)">修改</v-btn>
            <v-btn v-if="item.isLogin == '1'" x-small @click="updateLogin(item,0)" color="error">恢复</v-btn>
            <v-btn v-else x-small @click="updateLogin(item,1)" color="error">离职</v-btn>
            <v-btn v-if="$store.state.user.name='1001'"
                   class="ml-1"
                   x-small @click="createCode(item)">就餐码
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="updateDialog" width="70%">
      <v-card>
        <v-form ref="userForm">
          <v-container>
            <v-row>
              <v-col lg="2">
                <v-text-field label="登录用户名" v-model="user.userName" v-if="user.id == null"></v-text-field>
              </v-col>
              <v-col lg="2">
                <v-text-field label="姓名" v-model="user.name"></v-text-field>
              </v-col>
              <v-col lg="2">
                <v-select label="部门" :items="sections" return-object item-text="name"
                          v-model="user.section"></v-select>
              </v-col>
              <v-col lg="3">
                <v-text-field label="手机号" v-model="user.tel"></v-text-field>
              </v-col>
              <v-col lg="3">
                <v-text-field label="邮箱" v-model="user.email"></v-text-field>
              </v-col>
              <v-col lg="3">
                <v-autocomplete
                    height="30px"
                    :allow-overflow="false"
                    single-line
                    label="职务"
                    :items="dutyList"
                    multiple
                    return-object
                    item-value="id" item-text="name" v-model="user.duty"></v-autocomplete>
              </v-col>
              <v-col lg="3">
                <v-autocomplete single-line
                                height="30px"
                                :allow-overflow="false"
                                :search-input.sync="loadRoles"
                                multiple :items="roles"
                                return-object item-value="id" item-text="name" v-model="user.role"
                                label="角色"></v-autocomplete>
              </v-col>
              <v-col lg="3">
                <v-file-input show-size accept="image/*" v-model="file" @change="fileChange"
                              :multiple="false" label="请选择头像"></v-file-input>
              </v-col>
              <v-col lg="3">
                <v-avatar size="80">
                  <img :src="headAvatar" width="150"/>
                </v-avatar>
              </v-col>
              <v-col lg="3"  v-if="user.id == null">
                <v-text-field label="登录密码" v-model="user.passwd" type="password"></v-text-field>
              </v-col>
              <v-col lg="3">
                <v-text-field label="车牌号,输入后按回车确定" @keyup.enter="insertNewPlate"
                              v-model="newPlate"></v-text-field>
              </v-col>
              <v-col lg="3">
                <v-switch label="微信绑定"
                          v-model="bdWeixinFlag"
                          @change="unBdWeixin"></v-switch>
              </v-col>
              <v-col lg="3">
                <v-switch label="钉钉绑定"
                          v-model="bdDingTalkFlag"
                          @change="unBdDingTalk"
                ></v-switch>
              </v-col>
              <v-col lg="3">
                <v-btn x-small color="error" title="重置密码为：@123@123" @click="resetPasswd">重置密码</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col lg="3" v-for="p in user.plate" :key="p.id">
                <v-chip close @click:close="deleteCarPlateHandler(p.plate)">
                  {{ p.plate }}
                </v-chip>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="updateDialog = false">关闭</v-btn>
          <v-btn @click="syncHead">同步考勤机信息</v-btn>
          <v-btn color="primary" @click="submitUser">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dutyDialog">
      <v-card>
        <dutys :duty="duty"></dutys>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dutyDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="codeDialog" width="50%">
      <canvas id="code" ref="code" style="display: inline-block;text-align: center"></canvas>
    </v-dialog>
  </div>
</template>

<script>
import {
  deleteCarPlate, exportAll,
  getInfoByStDevice,
  getStaffAll,
  getStaffHead,
  resetPasswd,
  syncWeiCharUser,
  unBindDingTalk,
  unBindWeiChar
} from '@/api/staff'
import {insertStaff, updateUser} from '@/api/user'
import {getSections} from '@/api/section'
import {getDuty} from '@/api/duty'
import {searchRoles} from '@/api/role'
import {encrypt} from '@/utils/jsencrypt'
import dutys from './dutys'
import QRCode from "qrcode";

export default {
  name: "users",
  components: {
    dutys,
  },
  data: () => ({
    options: {},
    total: 0,
    loadRoles: null,
    updateDialog: false,
    loading: false,
    search: '',
    items: [],
    headers: [
      {text: '姓名', value: 'name', width: '8%'},
      {text: '部门', value: 'section.name', width: '12%'},
      {text: '手机号', value: 'tel', width: '10%'},
      {text: '车牌号', value: 'plates', width: '10%', sortable: false},
      {text: '微信绑定', value: 'additionInfo', width: '5%', sortable: false},
      {text: '钉钉绑定', value: 'dingTalkStaffInfo', width: '5%', sortable: false},
      {text: '职务', value: 'duty', width: '15%', sortable: false},
      {text: '角色', value: 'roleName', width: '20%', sortable: false},
      {text: '最后登录', value: 'lastLogin', width: '10%'},
      {text: '操作', value: 'action', width: '150px', sortable: false},
    ],
    user: {
      section: {name: null},
      duty: [],
      role: [],
      head: null,
      plate: []
    },
    sections: [],
    dutyList: [],
    roles: [],
    file: null,
    headAvatar: null,
    leave: false,
    newPlate: null,

    bdWeixinFlag: false,
    bdDingTalkFlag: false,

    duty: null,
    dutyDialog: false,
    syncLoading: false,
    codeDialog: false,
  }),
  created() {
    this.loadSection();
    this.loadDutys();
    this.roleList();
    // this.list();

  },
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    loadRoles(value) {
      this.roleList(value)
    },
    search() {
      if (!this.leave) {
        if (this.options.page > 1) {
          this.options.page = 1
        } else {
          this.list()
        }
      }
    }
  },
  methods: {
    createCode(item) {
      this.codeDialog = true
      let width = 300,
          height = 300;
      if (this.$refs.code) {
        this.$refs.code.innerHTML = ''
      }
      this.$nextTick(() => {
        QRCode.toCanvas(
            document.getElementById('code'),
            item.id + ';',
            {width, height, toSJISFunc: QRCode.toSJIS},
            error => {
              console.log(error)
            }
        );
        // new QRCode(
        //     this.$refs.code, {
        //       text: item.id + ';',
        //       width, height,
        //       colorDark: '#000',
        //       colorLight: '#FFF',
        //       correctLevel: QRCode.CorrectLevel.H
        //     });
      })

    },
    syncHead() {
      getInfoByStDevice(this.user.id).then(result => {
        if (result) {
          this.headAvatar = 'data:image/png;base64,' + result.head
          this.user.head = result.head
        }
      })
    },
    syncWeiCharUser() {
      this.syncLoading = true
      syncWeiCharUser().then(() => this.list()).finally(() => this.syncLoading = false)
    },
    showDuty(duty) {
      this.duty = duty
      this.dutyDialog = true
    },
    deleteCarPlateHandler(plate) {
      deleteCarPlate(plate).then(() => {
        this.user.plate.forEach((item, idx) => {
          if (item.plate == plate) {
            this.user.plate.splice(idx, 1)
          }
        })
      })
    },
    insertNewPlate() {
      this.user.plate.push({id: "-1", plate: this.newPlate, staffId: this.user.id})
    },
    formatPlate(item) {
      let result = ""
      item.plate.forEach(item => {
        result += item.plate + "<br/>"
      })
      if (result != "") {
        return result.substring(0, result.length - 1)
      } else {
        return "-"
      }
    },
    dealImg(path, callback, obj) {
      let img = new Image();
      img.src = path;
      img.onload = function () {
        let that = this;
        // 默认按比例压缩
        let w = that.width,
            h = that.height,
            scale = w / h;
        w = obj.width || w;
        h = obj.height || (w / scale);
        let quality = 0.7;  // 默认图片质量为0.7
        //生成canvas
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        // 创建属性节点
        let anw = document.createAttribute("width");
        anw.nodeValue = w;
        let anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
          quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        let base64 = canvas.toDataURL('image/jpeg', quality);
        // 回调函数返回base64的值
        callback(base64);
      }
    },
    addStaff() {
      this.reset();
      this.updateDialog = true;
    },
    reset() {
      this.user = {
        section: {name: null},
        duty: [],
        role: [],
        head: null,
        plate: null,
        additionInfo: {wxUserId: null},
        dingTalkStaffInfo: {dingTalkUserId: null},
      }
      this.headAvatar = null
      this.file = null
    },
    fileChange(files) {
      let reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        this.dealImg(reader.result, (base64) => {
          this.headAvatar = base64;
          this.user.head = base64.substring(base64.indexOf('base64,') + 7)
        }, {width: 960});
      }
    },
    submitUser() {
      this.loading = true;
      if (this.user.password && this.user.password != '') {
        this.user.passwd = encrypt(this.user.passwd);
      }
      if (this.user.id != null) {
        updateUser(this.user).then(() => {
          this.list();
          this.updateDialog = false;
        }).catch(e => {
          console.log("修改失败", e);
        }).finally(() => {
          this.loading = false;
        });
      } else {
        insertStaff(this.user).then(() => {
          this.list();
          this.updateDialog = false;
        }).catch(e => {
          console.log("修改失败", e);
        }).finally(() => {
          this.loading = false;
        })
      }
    },
    roleList(value) {
      searchRoles(value).then(data => {
        this.roles = data;
      })
    },
    update(item) {
      this.reset();
      if (item.head == null) {
        getStaffHead(item.id).then(head => {
          if (head) {
            this.headAvatar = 'data:image/png;base64,' + head;
          } else {
            this.headAvatar = null;
          }
          item.head = head
          this.updateDialog = true;
          this.user = item;
          if (this.user.additionInfo != null && this.user.additionInfo.wxUserId != null) {
            this.bdWeixinFlag = true
          }
          if (this.user.dingTalkStaffInfo != null && this.user.dingTalkStaffInfo.dingTalkUserId != null) {
            this.bdDingTalkFlag = true
          }
        });
      } else {
        this.headAvatar = 'data:image/png;base64,' + item.head
        this.updateDialog = true
        this.user = item
        if (this.user.additionInfo != null && this.user.additionInfo.wxUserId != null) {
          this.bdWeixinFlag = true
        }
        if (this.user.dingTalkStaffInfo != null && this.user.dingTalkStaffInfo.dingTalkUserId != null) {
          this.bdDingTalkFlag = true
        }
      }
    },
    loadSection() {
      getSections().then((data) => {
        this.sections = data;
      })
    },
    loadDutys() {
      getDuty().then(data => {
        this.dutyList = data;
      });
    },
    updateLogin(item, login) {
      this.loading = true;
      item.isLogin = login;
      updateUser(item).then(() => {
        this.list();
      }).finally(() => {
        this.loading = false;
      })
    },
    formatDuty(item) {
      if (item.duty != null) {
        let dutys = "";
        item.duty.forEach(d => {
          if (d != null)
            dutys += d.name + ",";
        });
        let index = -1;
        if ((index = dutys.length) > 0) {
          dutys = dutys.substring(0, index - 1);
        }
        return dutys;
      } else {
        return "-";
      }
    },
    formatRoleName(item) {
      try {
        return item.roleName.join(",");
      } catch (e) {
        return "-";
      }
    },
    exportHandler(){
      this.loading = true;
      let param = Object.assign({}, this.options)
      param.sortBy = this.options.sortBy[0]
      param.sortDesc = this.options.sortDesc[0]
      param.searchText = this.search
      param.status = this.leave ? "unLogin" : null
      exportAll(param).then(href=>{
        this.downloadFile(href)
      })
    },
    list() {
      this.loading = true;
      let param = Object.assign({}, this.options)
      param.sortBy = this.options.sortBy[0]
      param.sortDesc = this.options.sortDesc[0]
      param.searchText = this.search
      param.status = this.leave ? "unLogin" : null
      getStaffAll(param).then(data => {
        let rows = data.rows;
        rows.forEach(val => {
          val.head = null;
          val.plates = this.formatPlate(val)
        })
        this.items = rows;
        this.total = data.count
      }).finally(() => {
        this.loading = false;
      })
    },
    unBdWeixin() {
      if (!this.bdWeixinFlag) {
        unBindWeiChar(this.user.id).then(() => {
          this.user.additionInfo = null
          this.bdWeixinFlag = false
        })
      } else {
        this.$store.state.showTooltip.snackbarMsg = "该用户未绑定微信"
        this.$store.state.showTooltip.snackbar = true
        setTimeout(() => this.bdWeixinFlag = false, 500)

      }
    },
    unBdDingTalk() {
      if (!this.bdDingTalkFlag) {
        unBindDingTalk(this.user.id).then(() => {
          this.user.dingTalkStaffInfo = null
          this.bdDingTalkFlag = false
        })
      } else {
        this.$store.state.showTooltip.snackbarMsg = "该用户未绑定钉钉"
        this.$store.state.showTooltip.snackbar = true
        setTimeout(() => this.bdDingTalkFlag = false, 500)
      }
    },
    resetPasswd() {
      resetPasswd(this.user.id).then((res) => {
        this.$store.state.showTooltip.snackbarMsg = res
        this.$store.state.showTooltip.snackbar = true
      })
    }
  }
}
</script>

<style scoped>

</style>
