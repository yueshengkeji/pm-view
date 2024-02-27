<template>
    <div>
        <v-data-table :headers="headers"
                      :loading="loading"
                      :items-per-page="10"
                      :server-items-length="total"
                      :options.sync="options"
                      :items="items">
            <template v-slot:top>
                <v-row dense>
                    <v-col md="2" cols="6">
                        <v-checkbox label="只看未反馈的数据"
                                    hide-details
                                    class="shrink mr-2 mt-0"
                                    v-model="options.noReturn"></v-checkbox>
                    </v-col>
                    <v-col md="2" cols="6">
                        <v-btn :loading="loading" small class="mr-1" @click="exportHandler">导出</v-btn>
                        <v-btn small color="success" to="/projectAfter/report">数据统计报表</v-btn>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col md="3" cols="12">
                        <v-row dense>
                            <v-col md="6">
                                <v-menu
                                        ref="menu"
                                        v-model="startDateMenu"
                                        :close-on-content-click="false"
                                        transition="scale-transition"
                                        offset-y
                                        min-width="auto"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field hide-details
                                                      v-model="options.startDate"
                                                      clearable
                                                      placeholder="数据开始日期"
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      append-outer-icon="mdi-minus"
                                                      dense
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="options.startDate"
                                                   title="开始时间"
                                                   @input="$refs.menu.save()"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col md="5">
                                <v-menu
                                        ref="menu2"
                                        v-model="endDateMenu"
                                        :close-on-content-click="false"
                                        transition="scale-transition"
                                        offset-y
                                        :nudge-left="100"
                                        min-width="auto"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field hide-details
                                                      v-model="options.endDate"
                                                      clearable
                                                      placeholder="数据截止日期"
                                                      v-bind="attrs"
                                                      v-on="on"
                                                      dense
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="options.endDate"
                                                   title="截止时间"
                                                   :min="options.startDate"
                                                   @input="$refs.menu2.save()"></v-date-picker>
                                </v-menu>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col md="3" cols="12">
                        <v-text-field v-model="options.searchText"
                                      dense
                                      placeholder="搜索"></v-text-field>
                    </v-col>
                </v-row>

            </template>
            <template v-slot:item.staff.name="{item}">
                <div v-if="item.staff == null">{{item.name}}</div>
                <div v-else>{{item.staff.name}}</div>
            </template>
            <template v-slot:item.files="{item}">
                <v-img :src="item.files" width="30" class="cursor-pointer" @click="showImgDialog(item)"></v-img>
            </template>
            <template v-slot:item.returnContent="{item}">
                <a href="###" @click="returnDetailHandler(item)" title="单击查看反馈附件明细">{{item.returnContent}}</a>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn small @click="returnValue(item)" color="primary">反馈结果</v-btn>
            </template>
        </v-data-table>
        <v-dialog v-model="imgDialog" width="50%" :fullscreen="$vuetify.breakpoint.xs">
            <v-card class="pa-3">
                <h3>附件预览</h3>
                <v-img :src="item.files" style="max-width: 100%"></v-img>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="imgDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="returnDetailDialog" width="50%" :fullscreen="$vuetify.breakpoint.xs">
            <v-card class="pa-3">
                <h3>反馈明细</h3>
                <v-text-field readonly  v-model="item.returnTime" label="反馈时间"></v-text-field>
                <v-text-field readonly  v-model="item.returnStaffName" label="反馈人员"></v-text-field>
                <v-textarea readonly rows="3" v-model="item.returnContent" label="反馈内容"></v-textarea>
                <v-img :src="item.returnFile" style="max-width: 100%" title="反馈图片"></v-img>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="returnDetailDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="update" width="50%" :fullscreen="$vuetify.breakpoint.xs">
            <v-card class="pa-3">
                <update :updateData="this.item"
                        @success="update = false"></update>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {exportList, list} from '@/api/weixiu'
    import update from '@/views/projectAfter/insert.vue'

    export default {
        name: "insert",
        components: {
            update
        },
        props: {
            searchText: null,
            startDate: null,
            endDate: null,
        },
        data: () => ({
            loading: false,
            headers: [
                {text: '项目名称', value: 'projectName', sortable: false},
                {text: '报修内容', value: 'title', sortable: false},
                {text: '登记时间', value: 'datetime', sortable: false},
                {text: '登记人', value: 'staff.name', sortable: false},
                {text: '联系电话', value: 'tel', sortable: false},
                {text: '附件', value: 'files', sortable: false},
                {text: '反馈结果', value: 'returnContent', sortable: false},
                {text: '操作', value: 'action', sortable: false},
            ],
            items: [],
            options: {searchText: null, noReturn: false, startDate: null, endDate: null},
            total: 0,
            item: {files: null},
            update: false,
            endDateMenu: false,
            startDateMenu: false,

            imgDialog: false,
            returnDetailDialog:false,
        }),
        watch: {
            searchText: {
                handler() {
                    this.options.searchText = this.searchText
                }
            },
            options: {
                handler() {
                    this.list()
                },
                deep: true
            },
            startDate(value) {
                this.options.startDate = value
            },
            endDate(value) {
                this.options.endDate = value
            }
        },
        created() {
            let {searchText, startDate, endDate} = this.$route.params

            if (this.searchText != null) {
                this.options.searchText = this.searchText
            } else {
                this.options.searchText = searchText
            }
            if (this.startDate != null && this.endDate != null) {
                this.options.startDate = this.startDate
                this.options.endDate = this.endDate
            } else if (startDate != null && endDate != null) {
                this.options.startDate = startDate
                this.options.endDate = endDate
            }
        },
        methods: {
            returnDetailHandler(item){
                this.item = item
                this.returnDetailDialog = true
            },
            showImgDialog(item) {
                this.item = item
                this.imgDialog = true
            },
            returnValue(item) {
                this.item = item
                this.update = true
            },
            exportHandler(){
                this.loading = true
                exportList(this.options).then(data => {
                    let a = document.createElement("a")
                    a.download = data.substr(data.lastIndexOf("/")+1)
                    a.href = data
                    a.click()
                }).finally(() => {
                    this.loading = false
                })
            },
            list() {
                this.loading = true
                list(this.options).then(data => {
                    this.items = data.rows;
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            },
            handleSelect() {
                this.$refs['content'].focus();
            },
        }
    }
</script>

<style scoped>
    .cursor-pointer {
        cursor: pointer;
    }
</style>