<template>
    <div>
        <v-list id="scroll-target"
                style="max-height: 520px"
                class="overflow-y-auto">
            <div v-scroll:#scroll-target="onScroll">
                <v-toolbar dense elevation="0" light :absolute="!$vuetify.breakpoint.xs" style="right: 0;background-color: #00000000">
                    <v-text-field
                            autocapitalize="off"
                            @click:clear="reloadOkApprove()"
                            @click:prepend="loadApproveByType(true)"
                            @keydown="loadApproveByType($event)"
                            v-model="okQuery.searchText"
                            clearable
                            placeholder="搜索消息"
                            hide-details
                            prepend-icon="mdi-magnify"
                            single-line
                    ></v-text-field>
                </v-toolbar>
                <!--<v-dialog v-model="okQuery.loading"
                          hide-overlay
                          persistent
                          width="300">
                    <v-card color="primary"
                            dark>
                        <v-card-text>
                            加载中
                            <v-progress-linear
                                    indeterminate
                                    color="white"
                                    class="mb-0"
                            ></v-progress-linear>
                        </v-card-text>
                    </v-card>
                </v-dialog>-->
                <!--<v-progress-circular indeterminate color="primary"
                                     v-show="okQuery.loading"></v-progress-circular>-->

                <template v-for="(item) in okQuery.approveList">
                    <v-list-item link :key="item.id" @click="loadSteps(item)"
                                 v-bind:style="{backgroundColor:item.approveState == 5 ? '#ECECEC' : ''}">
                        <v-list-item-avatar>
                            <v-img :src="item.icon"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>
                              <template>
                                {{item.message.title}}
                              </template>

                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{item.acceptDate || item.accrptDate}}
                              <span>{{getFrameName(item)}}</span>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </div>
            <v-progress-circular indeterminate color="primary" style="left: 50%;"
                                 v-show="okQuery.loading"></v-progress-circular>
        </v-list>
    </div>
</template>

<script>
    import {getINotify, getNotifyMy, getOkApproveList} from '@/api/approve'
    import {drawAvatar} from '@/utils/avatarUtil';

    export default {
        name: "FLowMsgList",
        data: () => ({
            okQuery: {
                loading: true,
                searchText: null,
                approveList: [],
                pageNumber: 1,
                pageSize: 10,
                fqFlag: false,
                type: 1,
                typeStr: '已办工作'
            },
        }),
        created() {
            if (this.queryParam != null) {
                this.okQuery = this.queryParam;
                this.loadApproveByType(true);
            }
        },
        props: {
            clickRow: Function,
            queryParam: Object,
        },
        watch: {
            queryParam: {
                handler() {
                  console.log("queryParam handler",this.queryParam)
                    if (this.queryParam != null) {
                        this.okQuery = this.queryParam
                        this.loadApproveByType(true);
                    }
                },
                deep: false
            }
        },
        methods: {
            loadSteps(item) {
                if (this.clickRow != null && item.id != -1) {
                    this.clickRow(item);
                }
            },
            onScroll(event) {
                let target = event.target;
                if (parseInt((target.scrollTop + target.clientHeight)) >= (target.scrollHeight-10) && !this.okQuery.loading && this.okQuery.pageNumber != -1) {
                    this.okQuery.pageNumber++;
                    // this.getOkApproveList(true, null, this.okQuery);
                    this.loadApproveByType(true, this.okQuery);
                }
            },
            reloadOkApprove() {
                window.setTimeout(() => {
                    this.loadApproveByType(true);
                }, 100);
            },
            loadApproveByType(event, page) {
                if ((event == true || event == false) || event.keyCode == 13) {
                    if (page == null) {
                        this.okQuery.pageNumber = 1;
                        this.okQuery.approveList = [];
                    }
                    if (this.okQuery.type == 1) {
                        this.getOkApproveList();
                    } else if (this.okQuery.type == 2) {
                        this.getNotifyMy();
                    } else {
                        this.getINotify();
                    }
                }
            },
            stateFilter(type, str) {
                if (this.okQuery.type !== type) {
                    this.okQuery.typeStr = str;
                    this.okQuery.type = type;
                    this.okQuery.pageNumber = 1;
                    this.okQuery.approveList = [];
                    this.loadApproveByType(true);
                }
            },
            getOkApproveList() {
                this.okQuery.loading = true;
                getOkApproveList(this.okQuery.searchText,
                    this.$store.state.user.id,
                    this.okQuery.pageNumber,
                    this.okQuery.pageSize,
                    this.okQuery.fqFlag ? "1" : "0").then(this.result).catch(e => {
                    this.okQuery.approveList.push({message: {title: "数据加载失败:" + e}});
                }).finally(() => {
                    this.okQuery.loading = false;
                })
            },
            getINotify() {
                this.okQuery.loading = true;
                getINotify(this.okQuery.searchText,
                    this.$store.state.user.id,
                    this.okQuery.pageNumber,
                    this.okQuery.pageSize,
                    this.okQuery.fqFlag ? "1" : "0").then(this.result).catch(e => {
                    this.okQuery.approveList.push({message: {title: "数据加载失败:" + e}});
                }).finally(() => {
                    this.okQuery.loading = false;
                })
            },
            getNotifyMy() {
                this.okQuery.loading = true
                getNotifyMy(this.okQuery.searchText,
                    this.$store.state.user.id,
                    this.okQuery.pageNumber,
                    this.okQuery.pageSize,
                    this.okQuery.fqFlag ? "1" : "0",this.okQuery.status).then(this.result).catch(e => {
                    this.okQuery.approveList.push({message: {title: "数据加载失败:" + e}});
                }).finally(() => {
                    this.okQuery.loading = false;
                })
            },
            result(data) {
                if (data.length <= 0) {
                    this.okQuery.approveList.push({id: -1, message: {title: "到底啦"}});
                    this.okQuery.pageNumber = -1;
                    return;
                }
                this.drawName(data);
                if (this.okQuery.pageNumber == 1) {
                    this.okQuery.approveList = data;
                } else {
                    this.okQuery.approveList = this.okQuery.approveList.concat(data);
                }
                if (data.length < this.okQuery.pageSize) {
                    this.okQuery.approveList.push({id: -1, message: {title: "到底啦"}});
                    this.okQuery.pageNumber = -1;
                }
            },
            drawName(data) {
                data.forEach(item => {
                    let color = "#4CAF50";
                    if (item.message.frameCoding == "10563") {
                        color = "#03A9F4";
                    } else if (item.message.frameCoding == "15304") {
                        color = "#F44336";
                    } else if (item.message.frameCoding == "10564") {
                        color = "#81D4FA";
                    }
                    item.icon = drawAvatar(item.message.staff.name, color);
                })
            },
        }
    }
</script>

<style scoped>

</style>