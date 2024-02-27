<template>
    <div>
        <v-row>
            <v-col>
                <v-data-table :items="items" :headers="headers" :search="search">
                    <template v-slot:top>
                        <v-row>
                            <v-col lg="1">
                                <v-btn icon @click="$router.go(-1)"><v-icon>mdi-arrow-left</v-icon>返回</v-btn>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col lg="4">
                                <v-text-field label="搜索" v-model="search"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.gainTime="{item}">
                        <span>{{item.gainTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.expirationTime="{item}">
                        <span>{{item.expirationTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.uploadTime="{item}">
                        <span>{{item.uploadTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn :loading="loading" small @click="update(item)">更新</v-btn>
                        <v-btn class="ml-1" :loading="loading" small @click="openDeleteDialog(item)" color="error">删除</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-dialog v-model="updateDialog" width="50%">
            <v-card class="pa-5">
                <v-form ref="cerFrom">
                    <v-text-field disabled label="证书序号" v-model="item.serialNumber"></v-text-field>
                    <v-text-field disabled label="证书名称" v-model="item.name"></v-text-field>
                    <v-menu ref="menu1" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field label="领证时间" v-model="item.gainTime" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="item.gainTime" @change="save"></v-date-picker>
                    </v-menu>
                    <v-menu ref="menu2" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field label="到期时间" v-model="item.expirationTime" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="item.expirationTime" @change="save"></v-date-picker>
                    </v-menu>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="insertCer" color="primary">确定</v-btn>
                    <v-btn @click="updateDialog = false;clear = true">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="deleteDialog" width="50%">
            <v-card class="pa-5">
                <h3 class="text-center">确定删除：{{item.name}}?</h3>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="deleteCer" color="primary">确定</v-btn>
                    <v-btn @click="deleteDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {deleteCer, overdue, updateCer} from "@/api/certificate";

    export default {
        name: "overdue",
        data: () => ({
            search: null,
            items: [],
            loading: false,
            updateDialog: false,
            deleteDialog: false,
            item: [],
            headers: [
                {text: '证书序号', value: 'serialNumber'},
                {text: '证书名称', value: 'name'},
                {text: '领证时间', value: 'gainTime'},
                {text: '到期时间', value: 'expirationTime'},
                {text: '上传人员', value: 'uploadUserName'},
                {text: '上传时间', value: 'uploadTime'},
                {text: '操作', value: 'action'},
            ]
        }),
        created() {
            this.reset();
            this.list();
        },
        filters: {
            formatTimer(value) {
                if(value == null){
                    return null;
                }
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },
        },
        methods: {
            formatTimer(value) {
                if(value == null){
                    return null;
                }
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },
            list() {
                overdue().then(data => {
                    this.items = data;
                })
            },
            reset() {
                this.item = {
                    serialNumber: null,
                    name: null,
                    fileUrl: null,
                    gainTime: null,
                    expirationTime: null,
                    uploadUserName: null,
                    uploadTime: null,
                    updateUserName: null,
                    updateTime: null,
                    state: null,
                    recordText: null
                };
            },
            save(date) {
                this.$refs.menu1.save(date);
                this.$refs.menu2.save(date);
            },
            update(item) {
                this.reset();
                this.item = item;
                this.updateDialog = true;
                this.item.gainTime = this.formatTimer(item.gainTime);
                this.item.expirationTime = this.formatTimer(item.expirationTime);
            },
            insertCer() {
                this.loading = true;
                let valid = this.$refs['cerFrom'].validate();
                if (valid) {
                    updateCer(this.item).then(() => {
                        this.list();
                    }).finally(() => {
                        this.loading = false;
                        this.updateDialog = false;
                    })
                }
            },
            openDeleteDialog(item) {
                this.item = item;
                this.deleteDialog = true;
            },
            deleteCer() {
                this.loading = true;
                deleteCer(this.item.id).then(() => {
                    this.list();
                }).finally(() => {
                    this.loading = false;
                    this.deleteDialog = false;
                })
            },
        }
    }
</script>

<style scoped>

</style>