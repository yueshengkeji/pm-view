<template>
    <v-container :class="loginClass" fluid fill-height>
        <v-row justify="center">
            <v-col v-if="!autoLoading" lg="4" md="4" sm="5" cols="12">
                <v-card>
                    <h1 class="text-center mb-5">项目管理</h1>
                    <v-form ref="loginForm" v-model="valid" autocomplete="off" class="pa-5">
                        <v-row dense justify="end">
                            <v-col md="5" sm="6" cols="12">
                                <v-select
                                        required
                                        v-model="user.url"
                                        :rules="itemsRoles"
                                        :items="items"
                                        item-text="label"
                                        item-value="value"
                                        label="集团帐套"
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-text-field @keydown="enter"
                                      v-model="user.username"
                                      label="用户名"
                                      :rules="useNameRules"
                                      required></v-text-field>
                        <v-text-field @keydown="enter" type="password" v-model="inputPassword" label="密码"></v-text-field>
                        <v-btn :loading="loading" block color="primary" @click="login">登 录</v-btn>
                        <v-snackbar color="error" top v-model="snackbar">{{error}}</v-snackbar>
                    </v-form>
                </v-card>
            </v-col>
            <v-col class="text-center" v-if="autoLoading">
                <v-progress-circular
                        indeterminate
                        color="primary"
                ></v-progress-circular>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
    import {encrypt} from '@/utils/jsencrypt'
    import {dingBind} from "../../api/dingTalk";
    import {getUserInfo} from '@/api/user'
    import {getRoles} from '@/api/role'

    export default {
        name: "index",
        data: () => ({
            loginClass:'login grey lighten-5',
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
            itemsRoles: [
                v => !!v || "请指定帐套",
                v => v.length !== 0 || "请指定帐套"
            ],
            items: [],
            snackbar: false,
            error: "",
            loading: false,
        }),
        created() {
            console.log('dingbind')
        },

        mounted() {
            this.setDefaultUrl()
        },
        methods:{
            setDefaultUrl() {
                let port = parseInt(window.location.port)
                switch (port) {
                    case 8091:
                        this.user.url = this.items[1].value
                        break
                    case 8096:
                        this.user.url = this.items[2].value
                        break
                    case 8097:
                        this.user.url = this.items[3].value
                        break
                    case 16891:
                        this.user.url = this.items[4].value
                        break
                    case 8089:
                        this.user.url = this.items[0].value
                        break;
                    default:
                        this.user.url = "http://" + window.location.host + "/vuetify/login"
                        break;
                }
                console.log(this.user.url)
            },

            enter(event) {
                if (event.keyCode === 13) {
                    this.login();
                }
            },
            login() {
                if (this.$refs['loginForm'].validate()) {
                    this.autoLoading = true
                    dingBind({staffName:this.user.username,password:encrypt(this.inputPassword),userId:this.$route.query.userId,unionId:this.$route.query.unionId}).then(res => {
                        this.$store.commit('SET_TOKEN',res)
                        getUserInfo(res).then(user => {
                            this.$store.commit('SET_ID', user.id);
                            this.$store.commit('SET_NAME', user.name);
                            this.$store.commit('SET_CODING', user.coding);
                            this.$store.commit('SET_AVATAR', user.head);
                            this.$store.commit('SET_MENU', null);
                            this.$store.commit('SET_SECTION', user.section);
                            getRoles(res).then(roles => {
                                this.autoLoading = false
                                let rn = "";
                                roles.forEach(r => {
                                    rn += r.name + "/";
                                })
                                if (rn.length > 0) {
                                    rn = rn.substring(0, rn.length - 1);
                                }
                                this.$store.commit('SET_ROLES', rn);
                                if (this.$route.query.redirect != null){
                                    this.$router.push(this.$route.query.redirect)
                                }else {
                                    this.$router.push("/approve/index")
                                }
                            })

                        })
                    })

                }
            },
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
