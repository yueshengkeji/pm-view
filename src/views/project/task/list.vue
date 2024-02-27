<template>
    <div>
        <v-data-table :items="items"
                      :loading="loading"
                      :headers="headers">
            <template v-slot:top>
                <v-row dense>
                    <v-col lg="1">
                        <v-btn small color="primary" @click="insertHandler">新增</v-btn>
                    </v-col>
                </v-row>
            </template>
            <template v-slot:item.state="{item}">
                {{item.state == 0 ? '未到时间' : '已触发'}}
            </template>
            <template v-slot:item.action="{item}">
                <v-btn x-small color="error" @click="deleteHandler(item)">删除</v-btn>
            </template>
        </v-data-table>

        <v-dialog v-model="dialog" width="50%">
            <v-card class="pa-3">
                <v-form ref="taskForm">
                    <v-text-field label="标题" :rules="[v => !!v || '请输入事项内容']" v-model="task.name"></v-text-field>
                    <v-menu v-model="menu" ref="menu">
                        <template v-slot:activator="{on,attrs}">
                            <v-text-field :rules="[v => !!v || '请选择通知时间']" label="通知日期" v-model="task.taskDatetime" v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="task.taskDatetime" @change="$refs.menu.save()"></v-date-picker>
                    </v-menu>
                    <v-menu v-model="menu2" ref="menu2">
                        <template v-slot:activator="{on,attrs}">
                            <v-text-field label="时间" v-model="task.time" v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-time-picker v-model="task.time" @change="$refs.menu2.save()"></v-time-picker>
                    </v-menu>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn small @click="dialog = false">取消</v-btn>
                    <v-btn :loading="loading" color="primary" small @click="saveTask">提交</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {deleteTask, insertTask, taskList} from '@/api/project'

    export default {
        name: "taskList",
        data: () => ({
            headers: [
                {text:'事项内容',value:'name'},
                {text:'通知时间',value:'taskDatetime'},
                {text:'通知人员',value:'staff.name'},
                {text:'状态',value:'state'},
                {text:'操作',value:'action'},
            ],
            items: [],
            id: null,
            dialog: false,
            task: {
                name: null,
                taskDatetime: null,
                projectId: null,
                time:null
            },
            menu:false,
            menu2:false,
            loading:false,
        }),
        props: {
            projectId: null,
        },
        watch: {
            projectId: {
                handler() {
                    this.id = this.projectId
                    this.list()
                }
            }
        },
        created() {
            this.id = this.projectId
            this.list()
        },
        methods: {
            list() {
                this.loading=  true
                taskList(this.id).then(result=>{
                    this.items = result
                }).finally(()=>this.loading = false)
            },
            saveTask() {
                let valid = this.$refs.taskForm.validate()
                if(valid){
                    this.loading = true
                    let data = Object.assign({},this.task)
                    data.taskDatetime += " "+data.time
                    data.project = {id:data.projectId}
                    delete data["projectId"]
                    delete data["time"]
                    insertTask(data).then(this.list).finally(()=>{this.dialog = false})
                }
            },
            insertHandler(){
              this.reset()
              this.dialog = true
            },
            reset() {
                this.task = {
                    name: null,
                    taskDatetime: this.dateFormat(new Date(),'YYYY-mm-dd'),
                    projectId: this.id,
                    time:'09:00'
                }
            },
            deleteHandler(item){
                deleteTask(item.id).then(()=>{
                    this.list()
                })
            }
        }
    }
</script>

<style scoped>

</style>