<template>
    <div>
        <v-row dense>
            <v-col cols="1">
                <v-btn @click="insertHandler" color="primary">新增任务</v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col lg="2" cols="12">
                <v-text-field label="搜索" v-model="searchText" @keyup.enter="list"></v-text-field>
            </v-col>
        </v-row>
        <v-data-table :items="data.rows"
                      sort-desc
                      sort-by="createTime"
                      :options.sync="options"
                      :headers="headers"
                      :server-items-length="data.total">
            <template v-slot:item.misfirePolicy="{item}">
                {{formatMisfire(item)}}
            </template>
            <template v-slot:item.concurrent="{item}">
                {{item.concurrent == 0 ? '允许' : '禁止'}}
            </template>
            <template v-slot:item.status="{item}">
                {{item.status == 0 ? '正常' : '暂停'}}
            </template>
            <template v-slot:item.action="{item}">
                <v-btn class="mr-1" x-small @click="updateHandler(item)">修改</v-btn>
                <v-btn class="mr-1" color="error" x-small @click="deleteHandler(item)">删除</v-btn>
                <v-btn x-small @click="logHandler(item)">日志</v-btn>
            </template>
        </v-data-table>

        <!--        新增/修改dialog-->
        <v-dialog width="50%" v-model="updateDialog">
            <v-card class="pa-3">
                <v-form ref="jobForm">
                    <v-row dense>
                        <v-col lg="6">
                            <v-text-field label="任务名称"
                                          :rules="[v => !!v || '任务名称不能为空']"
                                          v-model="item.jobName"></v-text-field>
                        </v-col>
                        <v-col lg="6">
                            <v-text-field label="任务组名"
                                          :rules="[v => !!v || '任务组名不能为空']"
                                          v-model="item.jobGroup"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="目标字符串"
                                          :rules="[v => !!v || '目标字符串不能为空']"
                                          v-model="item.invokeTarget"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="执行表达式"
                                          :rules="[v => !!v || '执行表达式不能为空']"
                                          v-model="item.cronExpression"></v-text-field>
                        </v-col>
                        <v-col lg="6">
                            <v-radio-group v-model="item.misfirePolicy" label="执行策略">
                                <v-radio value="0" label="默认"></v-radio>
                                <v-radio value="1" label="立即触发执行"></v-radio>
                                <v-radio value="2" label="触发一次执行"></v-radio>
                                <v-radio value="3" label="不触发立即运行"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col lg="6">
                            <v-radio-group v-model="item.concurrent" label="并发执行">
                                <v-radio value="0" label="允许"></v-radio>
                                <v-radio value="1" label="禁止"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="6">
                            <v-radio-group v-model="item.status" label="任务状态">
                                <v-radio value="0" label="正常"></v-radio>
                                <v-radio value="1" label="暂停"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="item.remark" label="备注"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="updateDialog = false">关闭</v-btn>
                    <v-btn @click="saveHandler" color="primary">提交</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--        日志dialog-->
        <v-dialog width="80%" v-model="logDialog">
            <v-card class="pa-3">
                <v-data-table :items="log.rows"
                              sort-desc
                              sort-by="createTime"
                              :loading="logLoading"
                              :options.sync="logQuery"
                              :headers="logHeaders"
                              :server-items-length="log.total">
                    <template v-slot:item.status="{item}">
                        {{item.status == '0' ? '成功' : '失败'}}
                    </template>
                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="logDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {deleteSysJob, insertJob, list, logList, updateJob} from "@/api/sysJob"

    export default {
        name: "job-list",
        data: () => ({
            headers: [
                {text: '任务名称', value: 'jobName'},
                {text: '任务组名', value: 'jobGroup'},
                {text: '目标字符', value: 'invokeTarget'},
                {text: '执行表达式', value: 'cronExpression'},
                {text: '执行策略', value: 'misfirePolicy'},
                {text: '并发执行', value: 'concurrent'},
                {text: '任务状态', value: 'status'},
                {text: '备注', value: 'remark'},
                {text: '创建时间', value: 'createTime'},
                {text: '创建人', value: 'createBy'},
                {text: '操作', value: 'action', width: '210px'},
            ],
            data: {
                rows: [],
                total: 0
            },
            options: {},
            updateDialog: false,
            item: null,
            searchText: null,

            logDialog: false,
            log: {
                rows: [],
                total: 0
            },
            logHeaders: [
                {text: '任务名称', value: 'jobName'},
                {text: '任务分组', value: 'jobGroup'},
                {text: '目标字符串', value: 'invokeTarget'},
                {text: '执行信息', value: 'jobMessage'},
                {text: '执行状态', value: 'status'},
                {text: '异常信息', value: 'exceptionInfo'},
                {text: '记录时间', value: 'createTime'},
            ],
            logQuery:{
                invokeTarget:null,
                jobName:null
            },
            logLoading:false,
        }),
        watch: {
            logQuery:{
                handler(){
                    this.logList()
                },
                deep:true
            },
            options: {
                handler() {
                    this.list()
                },
                deep: true
            }
        },
        created() {
            this.reset()
        },
        methods: {
            insertHandler() {
                this.reset()
                this.updateDialog = true
            },
            saveHandler() {
                if (this.$refs.jobForm.validate()) {
                    if (this.item.jobId) {
                        updateJob(this.item).then(this.list).finally(() => this.updateDialog = false)
                    } else {
                        insertJob(this.item).then(this.list).finally(() => this.updateDialog = false)
                    }
                }
            },
            reset() {
                this.item = {
                    jobId: null,
                    jobName: null,
                    jobGroup: null,
                    invokeTarget: null,
                    cronExpression: null,
                    misfirePolicy: "2",
                    concurrent: "0",
                    status: "0",
                    remark: null,
                }
            },
            updateHandler(item) {
                this.item = item
                this.updateDialog = true
            },
            deleteHandler(item) {
                this.confirm("删除任务:" + item.jobName + "?").then(()=>{
                    deleteSysJob(item.jobId).then(this.list)
                })
            },
            list() {
                let q = Object.assign({}, this.options)
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                q.searchText = this.searchText
                list(q).then(result => this.data = result)
            },
            formatMisfire(item) {
                switch (item.misfirePolicy) {
                    case 1:
                        return '立即触发执行'
                    case 2:
                        return '触发一次执行'
                    case 3:
                        return '不触发立即执行'
                    case 0:
                    default:
                        return '默认'
                }
            },
            logList(){
                this.logLoading = true
                let q = Object.assign({},this.logQuery)
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                logList(q).then(result=>this.log = result).finally(()=>this.logLoading = false)
            },
            logHandler(item){
                this.logQuery.invokeTarget = item.invokeTarget
                this.logQuery.jobName = item.jobName
                this.logDialog = true
            }
        }
    }
</script>

<style scoped>

</style>