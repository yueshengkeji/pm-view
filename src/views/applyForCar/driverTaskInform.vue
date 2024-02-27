<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col
                        cols="11"
                        md="1"
                        sm="2">
                    <v-btn  color="primary" @click="taskToDo">
                        待完成
                    </v-btn>
                </v-col>
                <v-col
                        cols="11"
                        md="1"
                        sm="2">
                    <v-btn  color="primary" @click="taskHadDone">
                        已完成
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-title>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                :loading="loading"
                loading-text="Loading... Please wait"
                class="elevation-1"
        >
        </v-data-table>
    </v-card>
</template>

<script>
    import applyForCarApi from "@/api/applyForCar";

    export default {
        name:'driverTaskInform',
        data:() => ({

            options: null,
            totalDesserts: null,
            loading: false,

            headers: [
                {text: '序号', value: 'index'},
                {text: '用车时间', value: 'useTime', sortable: false},
                {text: '项目名称', value: 'projectName', sortable: false},
                {text: '事由', value: 'remark', sortable: false},
                {text: '目的地', value: 'direction', sortable: false},
                {text: '司机', value: 'driver', sortable: false,},
                {text: '状态', value: 'checkState', sortable: false},
            ],
            desserts:[],

            chooseFlag:'todo',

        }),

        created() {

        },

        watch:{
            options:{
                handler(){
                    if (this.chooseFlag == "todo"){
                        this.loadDriverTaskForm()
                    }else if (this.chooseFlag == "done"){
                        this.taskHadDone()
                    }

                },
                deep:true
            }
        },

        methods:{
            loadDriverTaskForm(){
                this.loading = true
                applyForCarApi.getDriverTask({page:this.options.page,itemsPerPage:this.options.itemsPerPage}).then(result => {
                    result.rows.forEach((val, index) => {
                        val.index = index + 1;
                    });
                    this.desserts = result.rows
                    this.totalDesserts = result.total
                    this.loading = false
                })
            },

            taskToDo(){
                this.chooseFlag = 'todo'
                this.loadDriverTaskForm()
            },

            taskHadDone(){
                this.chooseFlag = 'done'
                this.loading = true
                applyForCarApi.getDriverTaskDone({page: this.options.page, itemsPerPage: this.options.itemsPerPage}).then(result => {
                    result.rows.forEach((val, index) => {
                        val.index = index + 1;
                    });
                    this.desserts = result.rows
                    this.totalDesserts = result.total
                    this.loading = false
                })
            },

            reset(){
                this.applyForCarItem = {
                    id:null,
                    useTime:null,
                    projectName:null,
                    remark:null,
                    remark2:null,
                    direction:null,
                    driver:null,
                    driverId:null,
                    checkState:null,
                    runState:null,
                    applicantId:null,
                    startTime:null,
                    endTime:null,
                    mileageStart:null,
                    mileageEnd:null,
                    createTime:null,
                    projectId:null,
                    markId:null,
                    returnTime:null,
                }
            },
        }
    }
</script>