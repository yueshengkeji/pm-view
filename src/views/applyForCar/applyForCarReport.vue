<template style="width: 80%">
    <v-card>
        <v-card-title>
            <v-row>
                <v-col
                        cols="11"
                        md="1"
                        sm="2"
                >
                    <v-btn  color="primary" @click="changeProjectShow">
                        按项目统计
                    </v-btn>
                </v-col>
                <v-col
                        cols="11"
                        md="1"
                        sm="2"
                >
                    <v-btn  color="primary" @click="changeDriverShow">
                        按司机统计
                    </v-btn>
                </v-col>
                <v-col
                        v-if="driverShow"
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
                        v-if="driverShow"
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
            </v-row>
        </v-card-title>
        <v-data-table
                v-if="projectShow"
                :headers="projectHeaders"
                :items="projectDesserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                :loading="loading"
                loading-text="Loading... Please wait"
                class="elevation-1"
        >
        </v-data-table>

        <v-data-table
                v-if="driverShow"
                :headers="driverHeaders"
                :items="driverDesserts"
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
        name:'applyForCarReport',
        data:() => ({
            dateStart: null,
            dateEnd: null,
            menu1: false,
            menu2: false,

            projectShow:true,
            driverShow:false,

            loading:false,
            loading2:false,

            options: {},
            totalDesserts: null,

            projectHeaders:[
                {text:'序号',value:'index'},
                {text:'项目名称',value: 'projectName'},
                {text:'用车量',value: 'count'},
            ],
            projectDesserts:[],

            driverHeaders:[
                {text:'序号',value:'index'},
                {text: '司机',value: 'driverName'},
                {text: '出勤量',value: 'count'},
            ],
            driverDesserts:[],

        }),

        created() {
            var date = this.formatYearMonth(new Date())
            var YYYY = date.substr(0,4)
            var MM = date.substr(5, 2)
            this.dateStart = YYYY + '-' + MM + '-' + '01'
            this.dateEnd = YYYY + '-' + MM + '-' + this.getDaysInMonth(MM,YYYY)
        },

        watch:{
            options: {
                handler() {
                    if (this.projectShow == true){
                        this.statisticByProject()
                    }else if (this.driverShow == true){
                        this.statisticByDriver()
                    }
                },
                deep: true
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
                this.statisticByDriver()
            },
            dateEndChanged(){
                this.$refs.menu2.save(this.dateEnd)
                this.statisticByDriver()
            },
            changeProjectShow(){
                this.projectShow = true
                this.driverShow = false
                this.statisticByProject()
            },
            changeDriverShow(){
                this.driverShow = true
                this.projectShow = false
                this.statisticByDriver()
            },
            statisticByProject(){
                this.loading = true
                applyForCarApi.getStatisticByProject({page:this.options.page,itemsPerPage:this.options.itemsPerPage}).then(result => {
                    result.rows.forEach((val, index) => {
                        val.index = index + 1;
                    });
                    this.projectDesserts = result.rows
                    this.totalDesserts = result.total
                    this.loading = false
                })
            },
            statisticByDriver(){
                this.loading = true
                applyForCarApi.getStatisticByDriver({page:this.options.page,itemsPerPage:this.options.itemsPerPage,startDate:this.dateStart,endDate:this.dateEnd}).then(result => {
                    result.rows.forEach((val, index) => {
                        val.index = index + 1;
                    });
                    this.driverDesserts = result.rows
                    this.totalDesserts = result.total
                    this.loading = false
                })
            },
        },
    }
</script>