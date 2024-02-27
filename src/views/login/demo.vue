<template>
  <v-container :class="loginClass" fluid fill-height>
    <v-row justify="center" v-if="dingLoginFlag == false">
      <v-col v-if="!autoLoading" lg="4" md="4" sm="5" cols="12">
        <v-card>
          <h1 class="text-center mb-5">系统登录</h1>
          <v-form ref="loginForm" v-model="valid" autocomplete="off" class="pa-5">

            <v-text-field @keydown="enter"
                          v-model="user.username"
                          label="用户名"
                          :rules="useNameRules"
                          required></v-text-field>
            <v-text-field @keydown="enter" type="password" v-model="inputPassword"
                          label="密码"></v-text-field>
            <v-checkbox
                v-model="user.remember"
                label="记住我"
            ></v-checkbox>
            <v-btn :loading="loading" block color="primary" @click="login">登 录</v-btn>
            <v-snackbar color="error" top v-model="snackbar">{{error}}</v-snackbar>
          </v-form>
        </v-card>
      </v-col>
      <v-col class="text-center" v-if="autoLoading">
        <v-progress-circular
            indeterminate
            color="primary"
        >
          {{loadingMsg}}
        </v-progress-circular>
        <div v-if="moreMsg">{{loadingMsg}}</div>
      </v-col>
    </v-row>

    <v-col class="text-center" v-if="dingLoginFlag == true">
      <v-progress-circular v-if="dingLoading"
                           indeterminate
                           color="primary"
      ></v-progress-circular>
      <!--            <v-btn color="primary" @click="go">确定</v-btn>-->
      <!--            <v-snackbar top v-model="dingLoginSuccess" timeout="2000">点击确定进入主页</v-snackbar>-->
    </v-col>

  </v-container>
</template>


<script>
import {decrypt, encrypt} from '@/utils/jsencrypt'
import {dingLogin, getCode} from "../../api/dingTalk"
import * as dd from "dingtalk-jsapi"
import {wxConfig} from '@/api/systemConfig'
import {getWxOpenId} from '@/api/weixin'

export default {
  name: "loginIndex",
  data: () => ({
    code: null,
    loginClass: 'login grey lighten-5',
    autoLoading: false,
    valid: false,
    inputPassword: '',
    user: {
      username: "",
      password: "",
      remember: false,
      url: "",
    },
    useNameRules: [
      v => !!v || "用户名不能为空",
      v => v.length <= 100 || "最多50个中文字符"
    ],
    snackbar: false,
    error: "",
    loading: false,
    dingLoginFlag: false,
    dingLoginSuccess: false,
    dingLoading: false,
    loadingMsg: '',
    moreMsg: false,
    autoWxLogin:true,
  }),
  created() {
    if (dd.env.platform !== "notInDingTalk") {
      this.loginClass = this.loginClass.replace("login", "")
      this.dingLoginFlag = true
      this.init()
    } else {
      let ua = window.navigator.userAgent.toLowerCase();
      if (ua.match(/MicroMessenger/i) == 'micromessenger' && this.autoWxLogin) {
        this.loginClass = this.loginClass.replace("login", "")
        this.autoLoading = true
        let code = this.$route.query.code
        code = code == null ? this.$route.params.code : code
        if (code == null && localStorage.getItem("oauth2") != "1") {
          this.loadingMsg = "企业授权"
          if (this.$route.query.redirect) {
            // alert("redirect"+this.$route.query.redirect)
            localStorage.setItem("oauth2Redirect", this.$route.query.redirect)
          }
          //获取微信code
          wxConfig().then(result => {
            if (result) {
              let url = encodeURIComponent(result.NOTIFYIP + this.$router.options.base + "demo")
              // let url = encodeURIComponent("http://192.168.100.119:8080" + this.$router.options.base + "login")
              let rectUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
                  "appid=" + result.APPID + "&" +
                  "redirect_uri=" + url + "&" +
                  "response_type=code&" +
                  "scope=" + result.SCOPE + "&" +
                  "state=#wechat_redirect"
              localStorage.setItem("oauth2", "1")
              let a = document.createElement('a');
              a.setAttribute('href', rectUrl);
              a.innerText = '授权'
              document.body.appendChild(a);
              a.click();
            } else {
              this.loadingMsg = "获取企业信息失败"
            }
          }).catch(e => {
            this.loadingMsg = "获取企业信息失败：" + e
            this.moreMsg = true
          })
        } else {
          this.loadingMsg = "检测权限"
          localStorage.removeItem("oauth2")
          let oauth2Redirect = localStorage.getItem("oauth2Redirect")
          getWxOpenId(code).then(result => {
            if (result && result.userId) {
              this.loadingMsg = "加载中"
              // alert("oauth2Redirect"+oauth2Redirect)
              if (oauth2Redirect) {
                this.$route.query.redirect = oauth2Redirect
                localStorage.removeItem("oauth2Redirect")
              }
              //userId登录
              this.$store
                  .dispatch("OpenIdLogin", result.userId)
                  .then(() => {
                    this.loginSuccess(oauth2Redirect)
                  })
                  .catch(() => {
                    this.loadingMsg = "绑定微信"
                    this.toWxBind(result.userId)
                  });
            } else {
              if (code == undefined) {
                window.location.href = this.$router.options.base + "login"
              } else {
                this.loadingMsg = "未查询到微信用户与企业绑定，请先关注企业微信智慧平台公众号再绑定"
                this.moreMsg = true
              }
            }
          }).catch(() => {
            this.loadingMsg = "企业微信授权失败"
            this.moreMsg = true
            window.setTimeout(() => {
              window.location.href = this.$router.options.base + "login"
            }, 1000)
          })
        }
      }
    }
  },
  mounted() {
    let {token, hideMenu, userName, passwd} = this.$route.query
    if (token != null) {
      this.loginClass = this.loginClass.replace("login", "")
      this.autoLoading = true
      this.$store.commit('MENU_HIDDEN', hideMenu)
      this.loginByToken(token)
    } else if (userName != null && userName != "") {
      this.loginClass = this.loginClass.replace("login", "")
      this.autoLoading = true
      this.user.username = userName
      this.user.password = passwd
      this.autoLogin()
    } else {
      this.$store.commit('MENU_HIDDEN', false)
      let loginUser = localStorage.getItem("login-user")
      let loginPassword = localStorage.getItem("login-password")
      if (loginPassword != null && loginPassword != "") {
        this.inputPassword = decrypt(loginPassword)
      }
      if (loginUser) {
        this.user = JSON.parse(loginUser)
      }
      this.setDefaultUrl()
    }

  },
  methods: {
    toWxBind(code) {
      this.$router.push("/wxBind/" + code)
    },
    init() {
      this.dingLoading = true
      getCode(code => {
        this.code = code
        if (this.code != null && this.code != '') {
          dingLogin({code: this.code}).then(res => {
            console.log(res)
            if (res.url != null) {
              if (this.$route.query.redirect != null) {
                const direct = res.url + '&' + 'redirect=' + this.$route.query.redirect
                this.$router.push(direct)
              } else {
                this.$router.push(res.url)
              }
            } else {
              this.$store.commit('SET_TOKEN', res.token)
              this.$store.commit('SET_ID', res.staff.id);
              this.$store.commit('SET_NAME', res.staff.name);
              this.$store.commit('SET_CODING', res.staff.coding);
              this.$store.commit('SET_AVATAR', res.staff.head);
              this.$store.commit('SET_MENU', null);
              this.$store.commit('SET_SECTION', res.staff.section);
              this.$store.commit('SET_ROLES', res.staff.role);
              this.dingLoading = false
              this.dingLoginSuccess = true
              if (this.$route.query.redirect != null) {
                this.$router.push(this.$route.query.redirect)
              } else {
                this.$router.push(this.$route.query)
              }
            }
          })
        }
      })
    },
    // go(){
    //     this.$router.push("/approve/index")
    // },
    setDefaultUrl() {
      this.user.url = "http://" + window.location.host + this.$router.options.base + "demo"
    },
    enter(event) {
      if (event.keyCode === 13) {
        this.login();
      }
    },
    loginByToken(token) {
      this.loading = true;
      this.$store
          .dispatch("TokenLogin", token)
          .then(this.loginSuccess)
          .catch(() => {
            this.error = "token过期，请重新登陆";
            this.snackbar = true;
            this.loading = false;
            this.setDefaultUrl()
          });
    },
    autoLogin() {
      this.$store
          .dispatch("PwdLogin", this.user)
          .then(this.loginSuccess)
          .catch((error) => {
            try {
              this.autoLoading = false
              this.error = error.data.msg;
            } catch (e) {
              this.error = error;
            }
            this.snackbar = true;
            this.loading = false;
            this.setDefaultUrl();
          });

    },
    login() {

      let result = this.$refs['loginForm'].validate();
      if (result) {
        this.remember()
        let redirect = this.$route.query.redirect
        if (redirect != null && redirect != "") {
          redirect = "&redirect=" + redirect
        } else {
          redirect = ""
        }
        if (this.inputPassword != '') {
          window.location.href = this.user.url + "?userName=" + this.user.username + "&passwd=" + encodeURIComponent(encrypt(this.inputPassword)) + redirect
        } else {
          window.location.href = this.user.url + "?userName=" + this.user.username + "&passwd=" + redirect
        }
      }
    },
    loginSuccess(r) {
      window.setTimeout((rect) => {
        this.loading = false;
        let defaultUrl;
        try {
          // alert("rect"+rect+","+this.$route.query.redirect)
          defaultUrl = rect || this.$route.query.redirect || "/approve/index";
          let roles = this.$store.state.user.roles;
          if (rect == null && (roles.indexOf('采购员') != -1 && roles.indexOf('采购部经理') == -1)) {
            defaultUrl = "/procurement/apply/list"
          }
        } catch (e) {
          console.log("roles error=" + e);
        }
        this.$router.replace({path: defaultUrl}).catch(e => {
          console.log("ignore error:", e)
        });
      }, 100, r);
    },
    remember() {
      if (this.user.remember) {
        localStorage.setItem("login-password", encrypt(this.inputPassword))
        localStorage.setItem("login-user", JSON.stringify(this.user))
      } else {
        localStorage.removeItem("login-password")
        localStorage.removeItem("login-user")
      }
    }
  }
}
</script>

<style scoped>
.login {
  background-size: cover;
  background-image: url("/assets/adminex/images/dq.jpg");
  width: 100%;
  height: 100%;
}
</style>
