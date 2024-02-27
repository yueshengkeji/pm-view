<template>
    <v-container :class="loginClass" fluid fill-height>
        <v-row justify="center">
            <v-col v-if="!autoLoading" lg="4" md="4" sm="5" cols="12">
                <v-card>
                    <h1 class="text-center mb-5">系统绑定</h1>
                    <p class="text-center">首次登录，请绑定微信</p>
                    <v-form ref="loginForm" v-model="valid" autocomplete="off" class="pa-5">
                        <v-text-field @keydown.enter="login"
                                      v-model="user.username"
                                      label="用户名"
                                      :rules="useNameRules"
                                      required></v-text-field>
                        <v-text-field @keydown.enter="login" type="password" v-model="inputPassword"
                                      label="密码"></v-text-field>
                        <v-btn :loading="loading" block color="primary" @click="login">绑 定</v-btn>
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
    import {bindWx} from '@/api/user'

    export default {
        name: "wxBind",
        data: () => ({
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
        }),
        mounted() {

        },
        methods: {
            login() {
                if (this.$refs['loginForm'].validate()) {
                    this.autoLoading = true
                    bindWx({name:this.user.username,passwd:encrypt(this.inputPassword)},this.$route.params.openId).then(result => {
                        this.loginByToken(result)
                    })
                }
            },
            loginByToken(token) {
                this.loading = true;
                this.$store
                    .dispatch("TokenLogin", token)
                    .then(this.loginSuccess)
                    .catch(() => {
                        this.loading = false
                    });
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
                }, 100,r);
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
