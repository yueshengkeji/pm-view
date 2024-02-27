<template>
    <div>
        <v-form ref="authorForm">
            <v-row dense>
                <v-col cols="8">
                    <v-text-field :rules="[v => !!v || '请输入网关地址']" label="交换机网关地址" v-model="data.address"/>
                </v-col>
                <v-col cols="4">
                    <v-text-field :rules="[v => !!v || '请输入端口号']" label="端口号" v-model="data.port"/>
                </v-col>
                <v-col cols="6">
                    <v-text-field label="登录用户名" v-model="data.username"/>
                </v-col>
                <v-col cols="6">
                    <v-text-field label="登录密码" v-model="data.password"/>
                </v-col>
                <v-col cols="6">
                    <v-menu ref="menu" v-model="menu">
                        <template v-slot:activator="{on,attrs}">
                            <v-text-field label="执行日期" v-model="data.date" v-on="on" v-bind="attrs"/>
                        </template>
                        <v-date-picker v-model="data.date" @change="$refs.menu.save()"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="6">
                    <v-menu ref="menu" v-model="menu2">
                        <template v-slot:activator="{on,attrs}">
                            <v-text-field label="执行时间" v-model="data.time" v-on="on" v-bind="attrs"/>
                        </template>
                        <v-time-picker v-model="data.time" @change="$refs.menu.save()"></v-time-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12">
                    <v-textarea rows="10"
                                v-model="data.command"
                                label="执行命令" title="多个命令，请使用';'分割"
                                hint="多个命令，请使用';'分割"/>
                </v-col>
            </v-row>
        </v-form>

        <v-snackbar v-model="msgFlag" centered>{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import {downloadApplet, getAuthor, updateAuthor} from '@/api/project'

    export default {
        name: "index",
        props: {
            projectId: String,
        },
        watch: {
            projectId() {
                this.data.projectId = this.projectId
                this.load()
            }
        },
        data: () => ({
            menu: false,
            menu2: false,
            data: {
                address: '',
                port: 23,
                username: '',
                password: '',
                date: null,
                time: null,
                command: ''
            },
            loading: false,
            msgFlag:false,
            msg:null,
        }),

        created() {
            this.data.projectId = this.projectId
            this.load()
        },
        methods: {
            download() {
                return downloadApplet(this.projectId).then((result) => {
                    let a = document.createElement("a")
                    a.href = result
                    a.click()
                    return result
                })
            },
            save() {
                if (this.$refs.authorForm.validate()) {
                    if (this.data.date && this.data.time) {
                        this.data.passDate = this.data.date + " " + this.data.time + ":00"
                    } else if (this.data.date) {
                        this.data.passDate = this.data.date + " 00:00:00"
                    } else {
                        this.data.passDate = ""
                    }
                    return updateAuthor(this.data).finally(()=>{
                        this.msg = "操作成功"
                        this.msgFlag = true
                    })
                }else{
                    return new Promise((resolve,reject)=>{
                        reject()
                    })
                }
            },
            reset() {
                this.data = {
                    address: '',
                    port: 23,
                    username: '',
                    password: '',
                    date: null,
                    time: null,
                    command: '',
                    projectId: this.projectId
                }
            },
            load() {
                getAuthor(this.projectId).then(result => {
                    if (result) {
                        result.time = result.passDate.split(" ")[1]
                        result.date = result.passDate.split(" ")[0]
                        this.data = result
                    } else {
                        this.reset()
                    }
                })
            }
        }

    }
</script>

<style scoped>

</style>