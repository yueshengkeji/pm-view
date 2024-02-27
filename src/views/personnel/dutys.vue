<template>
    <div>
        <v-btn @click="treeview = !treeview" fab absolute small>{{treeview ? '视图' : '列表'}}</v-btn>
        <v-row>
            <v-col lg="5" style="height: 750px" v-if="treeview">
                <v-treeview return-object
                            activatable
                            @update:open="openItem"
                            :active="open"
                            :open="defaultOpen"
                            @update:active="active"
                            open-on-click
                            style="height: 550px;overflow: auto"
                            :items="items"
                            item-text="name"
                            item-key="id">
                    <template v-slot:append="{item}">
                        <v-btn x-small @click="editDuty(item)" class="mr-1">修改</v-btn>
                        <v-btn x-small @click="deleteDuty(item)" color="error">删除</v-btn>
                    </template>
                </v-treeview>
            </v-col>
            <v-col lg="12" v-if="!treeview">
                <vue-okr-tree node-key="id"
                              @node-click="nodeClickHandler"
                              :render-content="renderContent"
                              :data="items" default-expand-all
                              show-collapsable></vue-okr-tree>
            </v-col>
            <v-col lg="7" v-if="treeview">
                <v-data-table :items="users" :headers="headers" :search="searchPersons">
                    <template v-slot:top>
                        <v-row>
                            <v-col lg="4">
                                <v-btn @click="addDuty">新增</v-btn>
                            </v-col>
                            <v-col lg="8">
                                <v-text-field dense v-model="searchPersons" label="搜索人员"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn @click="deleteUser(item)" small color="error" title="从职务中删除">删除</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-dialog v-model="dutyDialog" width="50%">
            <v-card class="pa-5">
                <v-form>
                    <v-text-field v-model="activeItem.name"
                                  :rules="rules.name"
                                  label="职务名称"></v-text-field>
                    <v-autocomplete :search-input.sync="search"
                                    auto-select-first
                                    item-text="name"
                                    item-value="id"
                                    :items="searchDutys"
                                    v-model="activeItem.parentId"
                                    label="上级职务"></v-autocomplete>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :loading="loading" @click="insertDuty">确定</v-btn>
                    <v-btn @click="dutyDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog width="30%"
                  v-model="deleteDialog">
            <v-card class="pa-5">
                <h3 class="text-center">确定删除：{{deleteItem.name}}?</h3>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :loading="loading" @click="submitDelete">确定</v-btn>
                    <v-btn @click="deleteDialog=false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

    import {deleteDuty, deletePerson, getDuty, getStaffByDutyId, insert, list, update} from '@/api/duty'

    import {VueOkrTree} from 'vue-okr-tree'
    import 'vue-okr-tree/dist/vue-okr-tree.css'


    export default {
        components: {
            VueOkrTree
        },
        name: "dutys",
        data: () => ({
            treeview: true,

            loading: false,
            dutyDialog: false,
            items: [],
            open: [],
            activeItem: null,
            itemsMap: [],

            users: [],
            headers: [
                {text: '姓名', value: 'name'},
                {text: '部门', value: 'section.name'},
                {text: '最后登陆时间', value: 'lastDate'},
                {text: '操作', value: 'action'},
            ],

            searchDutys: [],
            search: null,
            searchPersons: null,

            rules: {
                name: [v => !!v || "职务名称不能为空"]
            },

            deleteItem: {
                name: null
            },
            deleteDialog: false,
            searchValue: null,
            loadItems: [],
            defaultOpen: [],
        }),
        props: {
            duty: null,
        },
        watch: {
            search: {
                handler(value) {
                    if (this.searchValue != value) {
                        this.searchDutys = []
                        getDuty(value).then(data => {
                            this.filterDuty(data, this.activeItem.id)
                        });
                        this.searchValue = value
                    }
                },
                deep: true
            },
            duty: {
                handler() {
                    this.setDefaultOpen()
                }
            },
            open: {
                handler() {
                    console.log(this.open)
                }
            }
        },
        created() {
            this.reset();
            this.list();
        },
        methods: {
            nodeClickHandler(item) {
                this.activeItem = item
                this.editDuty(item)
            },
            filterParent(item) {
                let parent = this.itemsMap[item.parentId]
                if (parent != null) {
                    this.defaultOpen.push(this.itemsMap[parent.id])
                    this.filterParent(parent)
                }
            },
            setDefaultOpen() {
                if (this.duty != null) {
                    window.setTimeout(() => {
                        this.defaultOpen.splice(0, this.defaultOpen.length)
                        this.open.splice(0, this.open.length)
                        this.filterParent(this.duty)
                        this.open.push(this.itemsMap[this.duty.parentId])
                    }, 300)
                }
            },
            renderContent(i, node) {
                return i('div', node.data.name);
            },
            filterDuty(data, id) {
                data.forEach(item => {
                    if (item.id != id) {
                        this.searchDutys.push(item)
                    }
                })
            },
            editDuty(item) {
                this.filterDuty(this.loadItems, item.id)
                this.reset();
                this.activeItem = item;
                this.dutyDialog = true;

                console.log(this.searchDutys, this.activeItem);
            },
            submitDelete() {
                this.loading = true;
                deleteDuty(this.deleteItem.id).then(() => {
                    this.deleteDialog = false;
                    this.list();
                }).finally(() => {
                    this.loading = false
                });
            },
            deleteDuty(item) {
                this.deleteItem = item;
                this.deleteDialog = true;
            },
            insertDuty() {
                if (this.activeItem.id != null) {
                    update(this.activeItem).then(() => {
                        this.list();
                        this.dutyDialog = false;
                    });
                } else {
                    insert(this.activeItem).then(() => {
                        this.list();
                        this.dutyDialog = false;
                    });
                }
            },
            addDuty() {
                this.reset();
                this.dutyDialog = true
            },
            reset() {
                this.activeItem = {
                    name: null,
                    parentId: null,
                    id: null
                }
            },
            list() {
                list().then(data => {
                    this.items = data;
                    this.items.forEach(duty => {
                        this.setDuty(duty);
                    })
                    this.setDefaultOpen()
                })
            },
            setDuty(duty) {
                this.loadItems.push(duty);
                this.itemsMap[duty.id] = duty
                duty.children.forEach(child => {
                    this.setDuty(child);
                })
            },
            active(item) {
                if (item.length > 0) {
                    this.activeItem = item[item.length - 1];
                    this.loadPersons();
                }
            },
            loadPersons() {
                getStaffByDutyId(this.activeItem.id).then(users => {
                    this.users = users;
                })
            },
            openItem(item) {
                if (item.length > 0 && this.duty == null) {
                    this.open.push(item[item.length - 1]);
                } else if (item.length <= 0) {
                    console.log(item)
                }
            },
            deleteUser(item) {
                deletePerson(this.activeItem.id, item.id).then(() => {
                    alert("deleteUser");
                    this.loadPersons();
                })
            }
        }
    }
</script>

<style scoped>

</style>
