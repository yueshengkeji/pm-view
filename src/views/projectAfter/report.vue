<template>
    <div>
        <v-row>
            <v-col md="8" cols="12">
                <v-chip class="mr-1">{{`昨日报修总数：${countData.prevDayCount || 0}`}}</v-chip>
                <v-chip color="success" class="mr-1">{{`今日报修总数：${countData.dayCount || 0}`}}</v-chip>
                <v-chip color="error" class="mr-1">{{`未反馈总数：${countData.noReturnCount || 0}`}}</v-chip>
                <v-chip color="info" class="mr-1">{{`本月报修总数：${countData.monthCount || 0}`}}</v-chip>
                <v-chip color="info" class="mr-1">{{`上月报修总数：${countData.prevMonthCount || 0}`}}</v-chip>
                <v-chip color="info">{{`本年报修总数：${countData.yearCount || 0}`}}</v-chip>
            </v-col>
            <v-col md="3" cols="12">
                <v-row dense>
                    <v-col md="6">
                        <v-menu
                                ref="menu"
                                v-model="queryParam.startDateMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field hide-details
                                              v-model="queryParam.startDate"
                                              v-bind="attrs"
                                              v-on="on"
                                              append-outer-icon="mdi-minus"
                                              dense
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="queryParam.startDate"
                                           title="开始时间"
                                           @input="$refs.menu.save()"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col md="5">
                        <v-menu
                                ref="menu2"
                                v-model="queryParam.endDateMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                :nudge-left="100"
                                min-width="auto"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field hide-details
                                              v-model="queryParam.endDate"
                                              v-bind="attrs"
                                              v-on="on"
                                              dense
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="queryParam.endDate"
                                           title="截止时间"
                                           :min="queryParam.startDate"
                                           @input="$refs.menu2.save()"></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-col>
            <v-col md="1">
                <p :title="'合计报修：'+weixiuCount+'次'">{{weixiuCount}}次</p>
            </v-col>
            <v-col md="12" cols="12">
                默认加载30天内，右上方可调整时间区间，报修项目分组统计：<v-btn right absolute color="primary" @click="exportExcel" small>导出excel<v-icon small>mdi-download</v-icon></v-btn>
                <v-data-table
                        :loading="loading"
                        hide-default-footer
                        :items-per-page="-1"
                        :headers="headers"
                        :items="projects">
                    <template v-slot:item.projectManager="{item}">
                        {{formatManager(item.projectManager)}}
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn x-small @click="detail(item)">明细</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-dialog v-model="dialog">
            <v-card class="pa-5">
                <wei-xiu-list :searchText="searchText"
                              :start-date="queryParam.startDate"
                              :end-date="queryParam.endDate"
                ></wei-xiu-list>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {exportExcel, getByProjectGroup, getWeiXiuCount} from '@/api/weixiu'
    import weiXiuList from './list'


    export default {
        name: "report",
        components: {
            weiXiuList
        },
        data: () => ({
            headers: [
                {
                    text: '项目名称',
                    value: 'projectName'
                }, {
                    text: '项目经理',
                    value: 'projectManager'
                }, {
                    text: '业务员(立项人员)',
                    value: 'saleStaff.name'
                }, {
                    text: '报修次数',
                    value: 'count'
                }, {
                    text: '操作',
                    value: 'action'
                }
            ],
            projects: [],
            countData: {
                dayCount: 0,
                prevDayCount: 0,
                monthCount: 0,
                prevMonthCount: 0,
                yearCount: 0,
                noReturnCount: 0,
            },
            noReturnData: [],

            dialog: false,
            searchText: null,
            queryParam:{
                startDateMenu: false,
                startDate: null,
                endDate: null,
                endDateMenu: false,
            },
            weixiuCount:0,
            loading:false,
        }),
        watch:{
          queryParam:{
              handler(){
                  this.loadProjectGroup()
              },
              deep:true,
          }
        },
        created() {
            this.loadCount()
            this.loadProjectGroup()
        },
        methods: {
            exportExcel(){
                exportExcel(this.queryParam).then(result=>{
                    let a = document.createElement("a");
                    a.download = result.substr(result.lastIndexOf('/')+1)
                    a.href = result
                    a.click()
                })
            },
            formatManager(staffList) {
                let str = "";

                if (staffList == null) {
                    return str;
                }

                staffList.forEach(item => {
                    str += item.name + "/"
                })
                if (str.length === 0) {
                    str = "-"
                } else {
                    str = str.substr(0, str.length - 1)
                }
                return str;
            },
            detail(item) {
                this.searchText = item.projectName
                this.dialog = true
            },
            loadCount() {
                getWeiXiuCount().then(result => {
                    this.countData = result
                    this.noReturnData = result.noReturn
                })
            },
            loadProjectGroup() {
                if (this.queryParam.startDate == null) {
                    this.queryParam.startDate = this.dateAfter(-30);
                    this.queryParam.endDate = this.dateFormat(new Date(), "YYYY-mm-dd")
                }else{
                    this.loading = true
                    getByProjectGroup(this.queryParam).then(result => {
                        this.projects = result
                        this.weixiuCount = 0
                        this.projects.forEach(item=>{
                            this.weixiuCount += item.count
                        })
                    }).finally(()=>this.loading = false)
                }
            }
        }
    }
</script>

<style scoped>

</style>