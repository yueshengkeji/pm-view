<template>

    <v-card>
        <v-row>
            <v-col>
                <v-btn color="primary" @click="insertDialog = true">新增汇报</v-btn>
            </v-col>
        </v-row>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                class="elevation-1"
        >
            <template v-slot:item.actions="{ item }">
                <v-btn x-small @click="showDetail(item)">明细</v-btn>
                <v-btn x-small @click="showChartAnalysis(item)">图表分析</v-btn>
            </template>
        </v-data-table>

        <!--新增汇报-->
        <v-dialog v-model="insertDialog" width="80%">
            <v-card>
                <insert-report ref="insertReport"></insert-report>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            @click="saveInsert"
                    >
                        提交
                    </v-btn>
                    <v-btn
                            @click="cancelInsert"
                    >
                        取消
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--明细-->
        <v-dialog v-model="detailDialog" width="80%">
            <detail :id="tempDetailId"></detail>
        </v-dialog>

        <!--图标分析-->
        <v-dialog v-model="chartDialog" width="80%">
            <chart-analysis :projectName="tempProjectName"></chart-analysis>
        </v-dialog>

        <!--加载框-->
        <v-dialog v-model="loadDialog"
                  hide-overlay
                  persistent
                  width="300">
            <v-card
                    color="primary"
                    dark>
                <v-card-text>
                    正在加载。。。
                    <v-progress-linear
                            indeterminate
                            color="white"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

    </v-card>

</template>
<script>
    import proTaskProgressReportApi from "../../../api/proTaskProgressReport";
    import insertReport from "../components/insertReport";
    import detail from "../components/detail";
    import chartAnalysis from "../components/chartAnalysis";

    export default {
        name: "reportList",
        components:{insertReport,detail,chartAnalysis},
        data: () => ({

            loadDialog:false,

            insertDialog:false,

            options: {},
            totalDesserts: null,

            headers: [
                {text: '项目名称', value: 'projectName', sortable: false},
                {text: '工作内容', value: 'content', sortable: false},
                {text: '汇报人', value: 'staff.name', sortable: false},
                {text: '汇报日期', value: 'createTime', sortable: false},
                {text: '明日计划', value: 'planForTomorrow', sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],

            detailDialog:false,
            tempDetailId:null,

            tempProjectName:null,
            chartDialog:false,
        }),

        computed:{

        },

        watch: {
            insertDialog(val){
                val || this.cancelInsert()
            },

            options:{
                handler(){
                    this.loadReport()
                }
            }
        },

        created() {
        },

        methods: {
            loadReport(){
                this.loadDialog = true
                proTaskProgressReportApi.getReports({itemsPerPage:this.options.itemsPerPage,page:this.options.page}).then(res => {
                    if (res != null){
                        this.desserts = res.rows
                        this.totalDesserts = res.total
                        this.loadDialog = false
                    }
                })
            },

            insertReport() {
                this.insertDialog = true
                this.$refs.insertReport.data().clear = true
                this.$nextTick(() => {
                    this.$refs.insertReport.resetFormRules()
                })
            },

            async saveInsert(){
                await this.$refs.insertReport.submitReport()
                this.insertDialog = false
                this.loadReport()
            },

            cancelInsert(){
                this.insertDialog = false
                this.$refs.insertReport.reset()
                this.$refs.insertReport.resetFormRules()
            },

            showDetail(item){
                this.tempDetailId = item.id
                this.detailDialog = true
                // proTaskProgressReportApi.getById(item.id).then()
            },

            showChartAnalysis(item){
                this.tempProjectName = item.projectName
                this.chartDialog = true
            },
        },
    }
</script>
