<template style="width: 80%">
    <v-card>
        <v-card-title>
            <v-row>
                <v-col
                        cols="11"
                        md="1"
                        sm="2"
                >
                    <v-dialog
                            v-model="dialogNew"
                            max-width="600px"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                    color="primary"
                                    dark
                                    class="mb-2"
                                    v-bind="attrs"
                                    v-on="on"
                            >
                                新增
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">新增用车申请</span>
                            </v-card-title>

                            <v-card-text>
                                <v-form ref="applyForCarItem" lazy-validation>
                                    <v-container>
                                        <v-row>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="6"
                                            >
                                                <v-menu
                                                        ref="menu3"
                                                        v-model="menu3"
                                                        :close-on-content-click="false"
                                                        :nudge-right="40"
                                                        transition="scale-transition"
                                                        offset-y
                                                        min-width="auto"
                                                >
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                                v-model="editedItem.useDate"
                                                                :rules="rules.useDateRule"
                                                                label="用车日期"
                                                                required
                                                                prepend-icon="mdi-calendar"
                                                                readonly
                                                                v-bind="attrs"
                                                                v-on="on"
                                                        ></v-text-field>
                                                    </template>
                                                    <v-date-picker
                                                            v-model="editedItem.useDate"
                                                            :min="minDate"
                                                            @change="useDateChanged"
                                                    ></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="6"
                                            >
                                                <v-radio-group
                                                        v-model="editedItem.useTime"
                                                        mandatory
                                                        label="用车时间"
                                                        row
                                                >
                                                    <v-radio
                                                            label="上午"
                                                            value="上午"
                                                    ></v-radio>
                                                    <v-radio
                                                            label="下午"
                                                            value="下午"
                                                    ></v-radio>
                                                </v-radio-group>
<!--                                                <v-select-->
<!--                                                        v-model="editedItem.useTime"-->
<!--                                                        :items="useTimeItems"-->
<!--                                                        label="用车时间"-->
<!--                                                ></v-select>-->
<!--                                                <v-menu-->
<!--                                                        ref="menu4"-->
<!--                                                        v-model="menu4"-->
<!--                                                        :close-on-content-click="false"-->
<!--                                                        :nudge-right="40"-->
<!--                                                        :return-value.sync="editedItem.useTimeDetailed"-->
<!--                                                        transition="scale-transition"-->
<!--                                                        offset-y-->
<!--                                                        max-width="290px"-->
<!--                                                        min-width="290px"-->
<!--                                                >-->
<!--                                                    <template v-slot:activator="{ on, attrs }">-->
<!--                                                        <v-text-field-->
<!--                                                                v-model="editedItem.useTimeDetailed"-->
<!--                                                                :rules="rules.useTimeRule"-->
<!--                                                                label="用车时间"-->
<!--                                                                prepend-icon="mdi-clock-time-four-outline"-->
<!--                                                                readonly-->
<!--                                                                v-bind="attrs"-->
<!--                                                                v-on="on"-->
<!--                                                        ></v-text-field>-->
<!--                                                    </template>-->
<!--                                                    <v-time-picker-->
<!--                                                            v-model="editedItem.useTimeDetailed"-->
<!--                                                            v-if="menu4"-->
<!--                                                            format="24hr"-->
<!--                                                            @click:minute="$refs.menu4.save(editedItem.useTimeDetailed)"-->
<!--                                                    ></v-time-picker>-->
<!--                                                </v-menu>-->
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="6"
                                            >
                                                <v-combobox
                                                        v-model="editedItem.projectName"
                                                        :items="projectNameItems"
                                                        :search-input.sync="projectSearch"
                                                        label="项目名称(可选)"
                                                        @change="updateMSG"
                                                ></v-combobox>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="6"
                                            >
                                                <v-text-field
                                                        v-model="editedItem.direction"
                                                        :rules="rules.directionRule"
                                                        label="目的地"
                                                        required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col
                                            >
                                                <v-text-field
                                                        v-model="editedItem.remark"
                                                        :rules="rules.remarkRule"
                                                        label="事由"
                                                        required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col
                                            >
                                                <v-text-field
                                                        v-model="editedItem.remark2"
                                                        label="备注(可指定司机，车辆)"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <easy-flow  coding="1320277"
                                                            ref="applyForCarFlow"
                                                            defaultFlowName="用车申请单"></easy-flow>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="closeInsert"
                                >
                                    取消
                                </v-btn>
                                <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="saveInsert"
                                >
                                    保存
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
                <v-col
                        cols="11"
                        md="1"
                        sm="2"
                >
                    <v-btn  color="primary" :loading="loading2" @click="exportExcel">
                        导出
                    </v-btn>
                </v-col>
                <v-col
                        cols="11"
                        sm="2"
                >

                    <v-menu
                            ref="menu1"
                            v-model="menu1"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="auto"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="dateStart"
                                    label="开始日期"
                                    prepend-icon="mdi-calendar"
                                    v-bind="attrs"
                                    v-on="on"

                            ></v-text-field>
                        </template>
                        <v-date-picker
                                v-model="dateStart"
                                no-title
                                scrollable
                                @change="dateStartChanged"
                        >
                        </v-date-picker>
                    </v-menu>
                </v-col>
                <v-col
                        cols="11"
                        sm="2"
                >
                    <v-menu
                            ref="menu2"
                            v-model="menu2"
                            :close-on-content-click="false"
                            :return-value.sync="dateEnd"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="auto"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="dateEnd"
                                    label="结束日期"
                                    prepend-icon="mdi-calendar"
                                    v-bind="attrs"
                                    v-on="on"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                                v-model="dateEnd"
                                no-title
                                scrollable
                                @change="dateEndChanged"
                        >
                        </v-date-picker>
                    </v-menu>
                </v-col>
                <v-spacer></v-spacer>
                <v-col
                        cols="11"
                        sm="2"

                >
                    <v-text-field
                            v-model="queryApplyForCar.searchText"
                            append-icon="mdi-magnify"
                            label="搜索"
                            single-line
                            hide-details
                    ></v-text-field>
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
    import easyFlow from '@/components/easyflow/easyFlow'

    export default {
        name: 'applyForCar',
        components:{easyFlow},
        data: () => ({
            loading: false,
            loading2: false,
            options: {},
            totalDesserts: null,

            search: null,
            dateStart: null,
            dateEnd: null,
            menu1: false,
            menu2: false,
            menu3: false,
            menu4: false,
            menu5: false,

            useTimeItems:["上午","下午"],

            headers: [
                {text: '序号', value: 'index'},
                {text: '用车时间', value: 'useTime', sortable: false},
                {text: '项目名称', value: 'projectName', sortable: false},
                {text: '事由', value: 'remark', sortable: false},
                {text: '目的地', value: 'direction', sortable: false},
                {text: '司机', value: 'driver', sortable: false,},
                {text: '状态', value: 'checkState', sortable: false},
            ],
            desserts: [],

            dialogNew: false,
            dialogDelete: false,
            editedItem: {
                useDate:null,
                useTime:null,
                useTimeDetailed:null,
                projectName:null,
                projectId:null,
                remark:null,
                direction:null,
                remark2:null,
            },
            defaultItem: {
                useDate:null,
                useTime:null,
                useTimeDetailed:null,
                projectName:null,
                projectId:null,
                remark:null,
                direction:null,
                remark2:null,
            },
            applyForCarItem:null,
            rules:{
                useDateRule:[
                    v => !!v || '不能为空！'
                ],
                useTimeRule:[
                    v => !!v || '不能为空！',
                ],
                remarkRule:[
                    v => !!v || '不能为空！',v => (!!v && v.length < 200) || '不能超过20个字符'
                ],
                directionRule:[
                    v => !!v || '不能为空！', v => (!!v && v.length < 100) || '不能超过100个字符',
                ],
                remark2Rule:[
                    v => (!!v && v.length < 200) || '不能超过200个字符'
                ],

            },
            minDate:null,
            driverId:null,
            projectId:null,
            queryApplyForCar:{
                pageSize:10,
                pageNumber:1,
                searchText:null,
                sortName:'create_time',
                sortOrder:'DESC',
                staffId:null,
                begin:null,
                end:null,
                driverId:null,
                projectId:null,
            },

            projectSearch:null,
            projectItems:[],
            projectNameItems:[],
            projectMSG:{
                projectId:null,
                projectName:null,
            }
        }),

        created() {
            var date = this.formatYearMonth(new Date())
            var YYYY = date.substr(0,4)
            var MM = date.substr(5, 2)
            this.dateStart = YYYY + '-' + MM + '-' + '01'
            this.dateEnd = YYYY + '-' + MM + '-' + this.getDaysInMonth(MM,YYYY)
            this.editedItem.useDate = this.formatTimer(new Date())
        },

        watch:{
            options: {
                handler() {
                    this.loadApplyForCar()
                },
                deep: true
            },
            'queryApplyForCar.searchText':{
                handler(){
                    this.searchApplyForCar()
                },
                deep:true
            },
            projectSearch(){
                this.searchProject()
            },
        },

        methods:{
            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },
            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },
            getDaysInMonth(month,year){
                var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
                if(month == '02' || month == 2){
                    year = parseInt(year);
                    daysInMonth[1] = (((0 == year % 4) && (0 != (year % 100))) ||
                        (0 == year % 400)) ? 29 : 28;
                }
                var flag = month.substr(0,1);
                if(flag == 0){
                    month = month.substr(1,1);
                }
                return daysInMonth[month-1];
            },

            dateStartChanged(){
                this.$refs.menu1.save(this.dateStart)
                this.loadApplyForCar()
            },
            dateEndChanged(){
                this.$refs.menu2.save(this.dateEnd)
                this.loadApplyForCar()
            },
            useDateChanged(){
                this.$refs.menu3.save(this.editedItem.useDate)
            },

            loadApplyForCar(){
                this.loading = true
                this.queryApplyForCar.pageNumber = this.options.page
                this.queryApplyForCar.pageSize = this.options.itemsPerPage
                this.queryApplyForCar.begin = this.dateStart
                this.queryApplyForCar.end = this.dateEnd
                this.queryApplyForCar.staffId = this.$store.state.user.id
                this.queryApplyForCar.driverId = this.driverId
                this.queryApplyForCar.projectId = this.projectId

                applyForCarApi.getApplyForCar(this.queryApplyForCar).then(result => {
                    result.rows.forEach((val, index) => {
                        val.index = index + 1;
                    });
                    this.desserts = result.rows
                    this.totalDesserts = result.total
                    this.loading = false
                })
            },

            saveInsert(){
                let valid = this.$refs['applyForCarItem'].validate();
                this.reset()
                if (this.editedItem.useTime == '上午' && this.editedItem.useTimeDetailed == null){
                    this.editedItem.useTimeDetailed = '8:30'
                }else if (this.editedItem.useTime == '下午' && this.editedItem.useTimeDetailed == null){
                    this.editedItem.useTimeDetailed = '13:30'
                }
                this.applyForCarItem.useTime = this.editedItem.useDate + ' ' + this.editedItem.useTime
                this.applyForCarItem.useTimeDetailed = this.editedItem.useDate + ' ' + this.editedItem.useTimeDetailed
                this.applyForCarItem.projectName = this.editedItem.projectName
                this.applyForCarItem.direction = this.editedItem.direction
                this.applyForCarItem.remark = this.editedItem.remark
                this.applyForCarItem.remark2 = this.editedItem.remark2
                this.applyForCarItem.projectId = this.editedItem.projectId
                if (valid){
                    applyForCarApi.insertApplyForCar(this.applyForCarItem).then(result => {
                        this.closeInsert()
                        if (result != null){
                            this.loadApplyForCar()
                        }

                        this.$refs['applyForCarFlow'].startFlow({
                            title: this.$store.state.user.name + "用车申请单",
                            content: '',
                            frameId: result.id,
                            frameCoding: '1320277',
                            frameColumn: 'id'
                        }).then()
                    })
                }
            },

            closeInsert(){
                this.dialogNew = false;
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                })
            },

            searchApplyForCar(){
                this.loadApplyForCar()
            },

            exportExcel(){
                this.loading2 = true;
                console.log(this.dateSearch)
                applyForCarApi.exportApplyForCar(this.queryApplyForCar).then(result => {
                    let a = document.createElement("a")
                    a.download = result
                    a.href = result
                    a.click()
                    console.log(a)
                }).finally(() => {
                    this.loading2 = false;
                })
            },

            searchProject(){
                applyForCarApi.getProject({str:this.projectSearch}).then(result => {
                    this.projectItems = []
                    this.projectNameItems = []
                    for (let x = 0;x < result.length;x++){
                        this.projectNameItems.push(result[x].name)
                        this.projectMSG.projectId = result[x].id
                        this.projectMSG.projectName = result[x].name
                        this.projectItems.push(this.projectMSG)
                        this.projectMSG = {
                            projectName: null,
                            projectId: null,
                        }
                    }
                })
            },

            updateMSG(){
                for (let x = 0;x < this.projectItems.length;x++){
                    if (this.projectItems[x].projectName == this.editedItem.projectName){
                        this.editedItem.projectId = this.projectItems[x].projectId
                    }
                }
            },

            reset(){
                this.applyForCarItem = {
                    id:null,
                    useTime:null,
                    useTimeDetailed:null,
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