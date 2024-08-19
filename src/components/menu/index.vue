<template>
  <div :fluid="$vuetify.breakpoint.md"
       :class="isMin ? 'pa-0' : ''"
       v-show="!this.$store.getters.hideMenu">
    <v-app-bar dense
               app
               :collapse="isMin"
               class="ma-2"
               :fixed="isMin"
               :width="isMin ? 50 : undefined">

      <v-app-bar-nav-icon @click="clickBar">
        <template v-slot:default>
          <v-icon>mdi-menu</v-icon>
          <v-badge v-if="isMin" :value="showBadge" color="error" dot></v-badge>
        </template>
      </v-app-bar-nav-icon>

      <v-toolbar-items v-if="!isMin">
        <v-menu v-for="(menu) in menus" :key="menu.id" offset-y open-on-hover>
          <template v-slot:activator="{ on, attrs }">
            <v-btn exact
                   v-if="!menu.hide"
                   active-class="primary"
                   @click="clickMenu($event,menu)"
                   :to="{path:'/'+menu.url}"
                   text
                   v-bind="attrs"
                   v-on="on">
              <v-icon class="mr-1" right dark v-if="menu.ico != ''">{{ menu.ico }}</v-icon>
              {{ menu.name }}
            </v-btn>
          </template>
          <v-list dense v-if="menu.children && menu.children.length > 0">
            <template v-for="(child) in menu.children">
              <v-list-item active-class="primary"
                           v-if="!child.outer && !child.hide"
                           :to="{path:'/'+child.url}"
                           link :key="child.id" @click="clickMenu($event,child,menu)">
                <v-list-item-icon>
                  <v-icon v-text="child.ico"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="child.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-else-if="!child.hide" link :key="child.id" @click="toExt(child,menu)">
                <v-list-item-icon>
                  <v-icon v-text="child.ico"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="child.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
        <v-menu offset-y v-if="showTotalData">
          <template v-slot:activator="{ on, attrs }">
            <v-btn exact
                   active-class="primary"
                   text
                   :title="`${query.start}至${query.end}`"
                   v-bind="attrs"
                   v-on="on">
              入库数量：{{ putSum }}
            </v-btn>
          </template>
          <v-date-picker @change="loadTotalData" v-model="query.start"></v-date-picker>
        </v-menu>
        <v-menu offset-y v-if="showTotalData">
          <template v-slot:activator="{ on, attrs }">
            <v-btn exact
                   active-class="primary"
                   text
                   :title="`${query.start}至${query.end}`"
                   v-bind="attrs"
                   v-on="on">
              出库数量：{{ outSum }}
            </v-btn>
          </template>
          <v-date-picker @change="loadTotalData" v-model="query.end"></v-date-picker>
        </v-menu>

        <!--        集团帐套切换-->
        <v-menu offset-y open-on-hover v-if="showGroup">
          <template v-slot:activator="{ on, attrs }">
            <v-btn exact
                   active-class="primary"
                   text
                   v-bind="attrs"
                   v-on="on">
              <v-icon class="mr-1" right dark>mdi-group</v-icon>
              集团帐套
            </v-btn>
          </template>
          <v-list dense>
            <template v-for="(menu) in items">
              <v-list-item active-class="primary"
                           link :key="menu.label" @click="clickGroupHandler($event,menu)">
                <v-list-item-content>
                  <v-list-item-title v-text="menu.label"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </v-toolbar-items>
      <v-menu open-on-hover bottom offset-y v-if="!isMin" :close-delay="100">
        <template v-slot:activator="{ on, attrs }">
          <v-btn small right fab absolute v-bind="attrs" v-on="on">
            <v-img class="rounded-circle" width="30" style="position: absolute"
                   :src="`/assets/img/${$store.state.user.id}.jpg`"></v-img>
            <v-badge :value="showBadge" color="error" dot :offset-x="-10" :offset-y="-10"></v-badge>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="profile" link>
            <v-list-item-title>{{ $store.state.user.name }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="profile" link>
            <v-list-item-title>个人中心</v-list-item-title>
          </v-list-item>

          <v-list-item link to="/approve/index" active-class="primary">
            <v-list-item-title>我的审批</v-list-item-title>
            <v-badge :value="showBadge" :content="approveInfoCount" color="error" :offset-x="10"
                     :offset-y="-5"></v-badge>
          </v-list-item>

          <v-list-item link to="/approve/my-start" active-class="primary">
            <v-list-item-title>我的发起</v-list-item-title>
          </v-list-item>

          <v-list-item v-show="showPayMoneys" @click="toPayment" link>
            <v-list-item-title>{{ year }}待付款合计:{{ payMoneys }}</v-list-item-title>
          </v-list-item>

          <v-list-item @click="selectNavType">
            <v-list-item-content>
              <v-list-item-title>{{ menuType }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="selectDark">
            <v-list-item-content>
              <v-list-item-title>{{ darkText }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>


          <v-list-item link @click="toOldSystemHandler">
            <v-list-item-content>
              <v-list-item-title>旧版系统</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="exitLogin" link>
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item>

        </v-list>
      </v-menu>

    </v-app-bar>
    <v-navigation-drawer v-model="drawer" absolute temporary v-if="isMin" app>
      <v-list class="overflow-y-auto" :height="$vuetify.breakpoint.height">
        <template v-for="(menu) in menus">
          <v-list-item v-if="menu.children.length <= 0"
                       active-class="primary"
                       nav
                       :key="menu.id"
                       @click="clickMenu($event,menu)"
                       :to="{path:'/'+menu.url}"
                       dense>
            <v-list-item-icon>
              <v-icon>{{ menu.ico }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ menu.name }}</v-list-item-title>
          </v-list-item>
          <v-list-group v-else
                        :prepend-icon="menu.icon"
                        :key="menu.id">

            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ menu.name }}</v-list-item-title>
              </v-list-item-content>
            </template>

            <template v-for="(child) in menu.children">
              <v-list-item active-class="primary" v-if="child.outer == false" :to="{path:'/'+child.url}"
                           link :key="child.id" @click="clickMenu($event,child,menu)">
                <v-list-item-icon>
                  <v-icon v-text="child.ico"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="child.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-else link :key="child.id" @click="toExt(child,menu)">
                <v-list-item-icon>
                  <v-icon v-text="child.ico"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="child.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-group>
        </template>

        <v-divider></v-divider>
        <v-list-item @click="profile" active-class="primary">
          <v-list-item-content>
            <v-list-item-title>{{ $store.state.user.name }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar>
            <v-img :src="'data:image/png;base64,'+$store.state.user.avatar"></v-img>
          </v-list-item-avatar>
        </v-list-item>
        <v-list-item link to="/user/profile" active-class="primary">
          <v-list-item-content>
            <v-list-item-title>个人中心</v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar>
            <v-icon>mdi-account-cog-outline</v-icon>
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item link to="/approve/index" active-class="primary">
          <v-list-item-content>
            <v-list-item-title>我的审批</v-list-item-title>
            <v-badge :value="showBadge" :content="approveInfoCount" color="error" :offset-x="25"
                     :offset-y="-4"></v-badge>
          </v-list-item-content>
          <v-list-item-avatar>
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-avatar>
        </v-list-item>
        <v-list-item link to="/approve/my-start" active-class="primary">
          <v-list-item-content>
            <v-list-item-title>我的发起</v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar>
            <v-icon>mdi-file-send</v-icon>
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item v-show="showPayMoneys" link to="/contract/payment/list" active-class="primary">
          <v-list-item-content>
            <v-list-item-title>{{ year }}待付款合计:{{ payMoneys }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar>
            <v-icon>mdi-contactless-payment</v-icon>
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item @click="selectNavType">
          <v-list-item-content>
            <v-list-item-title>{{ menuType }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="selectDark">
          <v-list-item-content>
            <v-list-item-title>{{ darkText }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>


        <v-list-item link @click="toOldSystemHandler">
          <v-list-item-content>
            <v-list-item-title>旧版系统</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="exitLogin" link>
          <v-list-item-content>
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar>
            <v-icon>mdi-exit-to-app</v-icon>
          </v-list-item-avatar>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import {getPayMoney} from '@/api/payment'
import {getTotal} from '@/api/put'
import {getOutTotal} from '@/api/outMater'
import {getUserLogin} from "@/api/staff";

export default {
  name: "pmMenu",
  data: () => ({
    showBadge: false,
    menus: null,
    url: null,
    payMoneys: 0,
    showPayMoneys: false,
    year: null,

    drawer: false,
    isMin: false,
    menuType: '竖向菜单',
    darkText: '夜间模式',
    approveInfoCount: 0,
    putSum: 0,
    outSum: 0,
    query: {
      start: null,
      end: null,
      type: 1,
    },
    showTotalData: false,

    items: [
      {label: "卓茂科技", value: 'http://222.184.233.10:8089/vuetify/login'},
      {label: "连云港恒润", value: "http://222.184.233.10:8091/vuetify/login"},
      {label: "连云港炯昌", value: "http://222.184.233.10:8096/vuetify/login"},
      {label: "九华云水", value: "http://222.184.233.10:8097/vuetify/login"},
      {label: "文峰物业", value: "http://222.184.233.10:16891/vuetify/login"},
      {label: "锦绣汇", value: "http://222.184.233.10:16894/vuetify/login"},
    ],
    showGroup: false,
  }),
  props: {
    extMenu: Function,
  },
  watch: {
    $route(to) {
      this.setBadge(to.path)
    },
    approveInfoCount: {
      handler() {
        if (this.approveInfoCount > 99) {
          this.approveInfoCount = 99
        }
        this.setBadge(this.$route.path)
      }
    },
    "$store.state.api.approveMsgCount": {
      handler() {
        this.approveInfoCount = this.$store.state.api.approveMsgCount
      }
    }
  },
  created() {
    this.setBadge(this.$route.path)
    let m = this.$store.state.menus.menus;
    let currentPath = this.$router.currentRoute.path;
    m.forEach(i => {
      let isCurrent = false;
      if (i.children != null) {
        i.children.forEach(child => {
          child.parent = i;
          let paramFlag = child.url.indexOf(":")
          if (paramFlag != -1) {
            child.url = child.url.substr(0, paramFlag - 1)
          }
          if (currentPath == ("/" + child.url)) {
            isCurrent = true;
          }
        });
        if (isCurrent) {
          i.url = currentPath.substring(1);
        }
      }
      if (i.url == "") {
        i.url = "/";
      }
    });
    this.menus = this.$store.state.menus.menus;
    if (this.$store.state.user.roles.indexOf("采购") != -1
        || this.$store.state.user.roles.indexOf("财务") != -1) {
      this.showPayMoneys = true;
      this.year = new Date().getFullYear();
    }

    if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.width <= 1024) {
      this.isMin = true
    } else {
      this.isMin = localStorage.getItem("menuType") === "0"
    }
    // this.isMin = true;
    this.menuType = this.isMin ? "横向菜单" : "竖向菜单"
    this.$vuetify.theme.dark = localStorage.getItem("darkType") === "1"
    this.darkText = this.$vuetify.theme.dark ? '正常模式' : "夜间模式"

    this.$router.history.setupListeners();

    if (this.$store.state.user.roles.indexOf("仓管") != -1 || this.$store.state.user.roles.indexOf("仓库") != -1) {
      this.query.start = this.dateFormat(new Date(), 'YYYY-mm-dd')
      this.query.end = this.query.start
      this.showTotalData = true
      this.loadTotalData()
    }

    if (this.$store.state.user.roles.indexOf("董事长") != -1
        || this.$store.state.user.roles.indexOf("财务总监") != -1) {
      this.showGroup = true
    }
    this.url = this.$route.path.substring(1)
  },
  mounted() {
    if (this.showPayMoneys) {
      this.loadPayMoney();
    }
  },
  methods: {
    clickGroupHandler(event, menu) {
      getUserLogin().then(result => {
        if (result) {
          window.location.href = menu.value + `?userName=${result.userName}&passwd=${encodeURIComponent(result.passwd)}`
        }
      })
    },
    loadTotalData() {
      getTotal(this.query).then(result => {
        this.putSum = result
      })
      getOutTotal(this.query).then(result => {
        this.outSum = result
      })
    },
    toOldSystemHandler() {
      // window.location.href = '/managent/getPage?pageName=managerIndex'
      window.location.href = '/managent/getPage?pageName=managerIndex&token=' + this.$store.state.user.token
    },
    setBadge() {
      // if (path === "/approve/index") {
      //   this.showBadge = false
      // }
      if (this.approveInfoCount > 0) {
        this.showBadge = true
      } else {
        this.showBadge = false
      }
    },
    selectDark() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      this.darkText = this.$vuetify.theme.dark ? '正常模式' : "夜间模式"
      if (this.$vuetify.theme.dark) {
        localStorage.setItem("darkType", "1");
      } else {
        localStorage.setItem("darkType", "0");
      }
    },
    selectNavType() {
      console.log("selectNavType")
      this.isMin = !this.isMin;
      if (this.isMin) {
        this.menuType = "横向菜单"
        localStorage.setItem("menuType", "0");
      } else {
        this.menuType = "竖向菜单"
        localStorage.setItem("menuType", "1");
      }
      this.$emit("selectNavType", this.isMin)
    },
    clickBar() {
      this.drawer = true
    },
    loadPayMoney() {
      getPayMoney(this.year).then(moneys => {
        if (moneys) {
          this.payMoneys = moneys.money;
        }
      })
    },
    toPayment() {
      this.$router.push({path: '/contract/payment/list'});
    },
    profile() {
      this.$router.push({path: '/user/profile'});
    },
    toExt(menu) {
      if (this.extMenu != null) {
        this.extMenu(menu);
        this.url = menu.url;
        if (menu.parent != null) {
          menu.parent.url = this.url;
        }
      }
    },
    clickMenu(event, menu) {
      if (this.url != menu.url && menu.url != null && menu.url !== "" && !menu.ext) {
        this.url = menu.url
        if (menu.parent != null) {
          menu.parent.url = this.url
        }
        if (this.extMenu != null) {
          this.extMenu(null)
        }
      } else if (this.url == null || this.url == menu.url) {
        window.location.reload()
      }
    },
    exitLogin() {
      this.$store.dispatch("LogOut").then(() => {
        console.log("退出成功");
        this.$router.replace({path: "/login"});
      })
    }
  }
}
</script>

<style scoped>
.primary {
  color: #FFF !important;
}
</style>