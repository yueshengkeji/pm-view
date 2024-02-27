<template>
    <div>
        <v-row>
            <v-col cols="3"  class="overflow-y-auto" style="max-height: 550px;">
                <template>
                    <v-btn small @click="insertCat">添加</v-btn>
                    <v-btn class="ml-1 primary" small @click="updateCatShow">修改</v-btn>
                    <v-btn class="ml-1" color="error" small @click="deleteCatShow">删除</v-btn>
                </template>
                <v-treeview :active.sync="active" activatable :items="cataloguesTree" item-text="name"
                            return-object @update:active="getCerOfCat">
                    <template v-slot:append="{item}">
                        <v-btn v-if="updateCatBut" x-small @click="updateCat(item)" class="primary">修改</v-btn>
                        <v-btn v-if="deleteCatBut" x-small @click="deleteCat(item)" color="error">删除</v-btn>
                    </template>
                </v-treeview>
            </v-col>
            <v-col cols="9">
                <v-data-table :items="items" :headers="headers" :search="search">
                    <template v-slot:top>
                        <v-row>
                            <v-col cols="12" lg="5">
                                <v-btn @click="addCertificate" small><v-icon>mdi-plus</v-icon>证书录入</v-btn>
                                <v-btn to="downloadRecord" class="ml-1" small><v-icon>mdi-history</v-icon>下载记录</v-btn>
                                <v-btn to="nearOverdue" class="ml-1" color="warning" small>临近过期证书</v-btn>
                                <v-btn to="overdue" class="ml-1" color="error" small>已过期证书</v-btn>
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-text-field v-model="totalSubsidy" label="当前证书总补贴费用" readonly style="margin-top: -12px"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-text-field v-model="totalMoney" label="总计" readonly style="margin-top: -12px"></v-text-field>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="12" md="3">
                                <v-text-field label="搜索" v-model="search" style="margin-top: -12px"></v-text-field>
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
                    <template v-slot:item.updateTime="{item}">
                        <span>{{item.updateTime | formatTimer}}</span>
                    </template>
                    <template v-slot:item.state="{item}">
                        <span>{{item.state | formatSta}}</span>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-icon :loading="loading" small @click="update(item)">mdi-pencil</v-icon>
                        <v-icon :loading="loading" small @click="openDeleteDialog(item)" color="error">mdi-delete</v-icon>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-dialog v-model="insertCatLog" width="50%">
            <v-card class="pa-5">
                <v-form ref="catRef">
                    <v-text-field :rules="catNameRul" label="目录名称" v-model="catItem.name"></v-text-field>
                    <v-autocomplete item-value="id" item-text="name" label="父目录名称" :items="cataloguesTree" :search-input.sync="searchCat" v-model="catItem.parent"></v-autocomplete>
                    <v-text-field label="排序序号" v-model="catItem.sort"></v-text-field>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn small @click="insertCatRel" color="primary">确定</v-btn>
                    <v-btn small @click="insertCatLog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="updateDialog" width="50%">
            <v-card class="pa-5">
                <v-form ref="cerFrom">
                    <v-text-field :disabled="disable" :rules="serRul" label="证书序号" v-model="item.serialNumber"></v-text-field>
                    <v-text-field :disabled="disable" :rules="nameRul" label="证书名称" v-model="item.name"></v-text-field>
                    <file-upload :clear="clear" @change="fileUpload"></file-upload>
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
                    <v-autocomplete :rules="cerOfCatRul" item-value="id" item-text="name" return-object label="证书分类" :items="catalogues" :search-input.sync="searchCat" v-model="item.catalogue"></v-autocomplete>
                    <v-row>
                        <v-col>
                            <v-autocomplete :items="holders" item-text="name" return-object :search-input.sync="searchHolder" label="持有者" v-model="item.holder"></v-autocomplete>
                        </v-col>
                        <v-col>
                            <v-text-field type="number" placeholder="补贴" v-model="item.subsidy"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-card elevation="0" v-show="autDialog">
                        <v-autocomplete multiple item-value="id" :items="users" item-text="name" return-object :search-input.sync="searchUser" label="添加授权人员" v-model="addPersons"></v-autocomplete>
                        <v-data-table :items="autPersons" :headers="headers2">
                            <template v-slot:item.action="{item}">
                                <v-btn small color="error" @click="clearBind(item)" :loading="loading">删除</v-btn>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="insertCer" color="primary">确定</v-btn>
                    <v-btn @click="updateDialog = false;clear = true">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteCatLog" width="50%">
            <v-card class="pa-5">
                <h3 class="text-center">确定删除：{{catItem.name}}</h3>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="deleteCatRel" color="primary">确定</v-btn>
                    <v-btn @click="deleteCatLog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="deleteDialog" width="50%">
            <v-card class="pa-5">
                <h3 class="text-center">确定删除：{{deleteItem.name}}?</h3>
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
    import {
        deleteCer,
        deleteStaff,
        insertCer,
        insertStaff,
        selectCerByCat,
        selectStaffByCer,
        updateCer,
        selectCer
    } from '@/api/certificate'
    import {getStaff} from '@/api/staff'
    import {deleteCat, getAll, getById, insertCat, selectCat, updateCat} from '@/api/catalogue';
    import fileUpload from "@/components/fileUpload";

    import (fileUpload)

    export default {
        name: "list",
        components: {fileUpload},
        data: () => ({
            totalSubsidy: 0,
            totalMoney: 0,
            search: null,
            items: [],
            clear: false,
            searchUser: null,
            autPersons: [],
            loading: false,
            cataloguesTree: [],
            catalogues: [],
            catSave: null,
            searchCat: null,
            insertCatLog: false,
            deleteCatLog: false,
            updateCatBut: false,
            deleteCatBut: false,
            active: [],
            catItem: [],
            catNameRul: [
                v => !!v || "请输入目录名称",
            ],
            autDialog: false,
            headers: [
                {text: '证书序号', value: 'serialNumber'},
                {text: '证书名称', value: 'name'},
                {text: '持有人', value: 'holder.name'},
                {text: '补贴', value: 'subsidy'},
                {text: '领证时间', value: 'gainTime', dateType: 'Date'},
                {text: '到期时间', value: 'expirationTime', dateType: 'Date'},
                // {text: '上传人员', value: 'uploadUserName'},
                // {text: '上传时间', value: 'uploadTime'},
                // {text: '更新人员', value: 'updateUserName'},
                // {text: '更新时间', value: 'updateTime'},
                {text: '授权状态', value: 'state'},
                {text: '操作', value: 'action'}
            ],
            headers2: [
                {text: '姓名', value: 'name'},
                {text: '部门', value: 'section.name'},
                {text: '操作', value: 'action'},
            ],
            item: [],
            searchHolder: null,
            holder: {},
            holders: [],
            users: [],
            addPersons: [],
            updateDialog: false,
            deleteDialog: false,
            deleteItem:{
                name:null
            },
            disable:true,
            serRul: [
                v => !!v || "请输入证书序号",
            ],
            nameRul: [
                v => !!v || "请输入证书名称",
            ],
            cerOfCatRul: [
                v => !!v || "请选择分类名称",
            ]
        }),
        watch: {
            searchUser(value) {
                getStaff(value).then(data => {
                    this.users = data;
                });
            },
            searchHolder(value){
                getStaff(value).then(data => {
                    this.holders = data;
                });
            },
        },
        created() {
            this.reset();
            this.list();
            this.getCatList();
            this.selectCer();
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
            formatSta(value) {
                if(value === 1){
                  return "已授权";
                }else {
                  return "未授权";
                }
            }
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
            insertCer() {
                this.loading = true;
                this.item.catalogueId = this.item.catalogue.id;
                let valid = this.$refs['cerFrom'].validate();
                if (valid) {
                    if(this.item.id != null){
                        this.insertStaff();
                        updateCer(this.item).then(() => {
                            this.list();
                            this.getCerOfCat(this.active);
                        }).catch((e) => {
                            console.log(e);
                        }).finally(() => {
                            this.loading = false;
                            this.updateDialog = false;
                            this.clear = true;
                        })
                    }else {
                        insertCer(this.item).then(() => {
                            this.list();
                            this.getCerOfCat(this.active);
                        }).catch((e) => {
                            console.log(e);
                        }).finally(() => {
                            this.loading = false;
                            this.updateDialog = false;
                            this.clear = true;
                        })
                    }
                }
            },
            insertStaff() {
                this.item.staffList = this.addPersons;
                insertStaff(this.item).then(() => {
                    this.selectStaffByCer();
                })
            },
            addCertificate() {
                this.reset();
                this.disable = false;
                this.updateDialog = true;
            },
            list() {
                getAll().then(data => {
                    this.catalogues = data;
                }).catch((e) => {
                    console.log(e)
                })
            },
            reset() {
                this.clear = false;
                this.autDialog = false;
                this.item = {
                    serialNumber: "-",
                    name: null,
                    fileUrl: null,
                    gainTime: null,
                    expirationTime: null,
                    uploadUserName: null,
                    uploadTime: null,
                    updateUserName: null,
                    updateTime: null,
                    state: null,
                    holder: null,
                    subsidy: null,
                    catalogue: {
                        id: null,
                        name: null,
                    },
                    catalogueId: null
                };
                if (this.catSave != null){
                    this.item.catalogue = this.catSave;
                }
                this.catItem = {
                    name: null,
                    parent: null,
                    sort: null
                };
                this.addPersons = [];
                this.autPersons = [];
            },
            update(item) {
                this.reset();
                this.item = item;
                this.selectCatById(item.catalogueId);
                this.disable = true;
                this.updateDialog = true;
                this.autDialog = true;
                this.selectStaffByCer();
                this.item.gainTime = this.formatTimer(item.gainTime);
                this.item.expirationTime = this.formatTimer(item.expirationTime);
            },
            deleteCer() {
                this.loading = true;
                deleteCer(this.deleteItem.id).then(() => {
                    this.list();
                    this.getCerOfCat(this.active);
                }).finally(() => {
                    this.loading = false;
                    this.deleteDialog = false;
                })
            },
            openDeleteDialog(item) {
                this.deleteItem = item;
                this.deleteDialog = true;
            },
            fileUpload(res) {
                this.item.fileUrl = res.files[0].name+res.files[0].id+res.files[0].fileName.substring(res.files[0].fileName.lastIndexOf("."));
            },
            clearBind(person) {
                this.loading = true;
                deleteStaff(person.id,this.item.id).then(() => {
                    this.selectStaffByCer();
                }).finally(() => {
                    this.loading = false;
                })
            },
            selectStaffByCer(value) {
                this.item.persons = "";
                selectStaffByCer(value || this.item.id).then(data => {
                    data.forEach(user => {
                        this.item.persons += user.name + ";";
                    })
                    this.autPersons = data;
                })
            },
            save(date) {
                this.$refs.menu1.save(date);
                this.$refs.menu2.save(date);
            },
            insertCat() {
                this.reset();
                this.insertCatLog = true;
            },
            updateCatShow() {
                this.updateCatBut = !this.updateCatBut;
            },
            deleteCatShow() {
                this.deleteCatBut = !this.deleteCatBut;
            },
            updateCat(catItem) {
                this.reset();
                this.catItem = catItem;
                this.insertCatLog = true;
            },
            deleteCat(catItem) {
                this.reset();
                this.catItem = catItem;
                this.deleteCatLog = true;
            },
            insertCatRel() {
                let valid = this.$refs['catRef'].validate();
                if (valid){
                    if (this.catItem.id != null){
                        updateCat(this.catItem).then(() => {
                            this.list();
                            this.getCatList();
                        }).finally(() => {
                            this.insertCatLog = false;
                        })
                    }else {
                        insertCat(this.catItem).then(() => {
                            this.list();
                            this.getCatList();
                        }).finally(() => {
                            this.insertCatLog = false;
                        })
                    }
                }
            },
            deleteCatRel() {
                deleteCat(this.catItem).then(() => {
                    this.list();
                    this.getCatList();
                }).catch((e) =>{
                    alert(e.data.msg)
                }).finally(() => {
                    this.deleteCatLog = false;
                })
            },
            getCatList(){
                selectCat().then(data => {
                    this.cataloguesTree = data;
                })
            },
            getCerOfCat(cat){
                this.totalSubsidy = 0
                this.catSave = cat[0];
                selectCerByCat(cat[0]).then(data => {
                    console.log("cerbycat",data)
                    for (let a = 0;a < data.length;a++){
                        if (data[a].subsidy){
                            this.totalSubsidy += data[a].subsidy
                        }
                    }
                    this.items = data;
                })
            },
            selectCatById(id){
                getById(id).then(data => {
                    this.item.catalogue = data;
                })
            },
            selectCer(){
                this.totalMoney = 0
                selectCer('').then(res => {
                    for (let a = 0;a < res.length;a++){
                        if (res[a].subsidy){
                            this.totalMoney += res[a].subsidy
                        }
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>
