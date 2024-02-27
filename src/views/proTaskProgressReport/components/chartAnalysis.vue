<template>
    <v-card>
        <v-container>
            <h2 style="text-align: center;color: #0000cc">{{this.proNameSearch}}时间节点图</h2>
            <v-timeline>
                <v-timeline-item
                        v-for="(report, i) in reports"
                        :key="i"
                        small
                >
                    <template v-slot:opposite>
                        <span
                                :class="`headline font-weight-bold --text`"
                                v-text="report.createTime"
                        ></span>
                    </template>
                    <div class="py-4">
                        <div>
                            <span><strong>汇报人:</strong>{{report.staff.name}}</span><br>
                            <span><strong>施工节点:</strong>{{report.constructionNode}}</span><br>
                            <span><strong>施工人数:</strong>{{report.constructorsNumber}}</span><br>
                            <span><strong>工作内容:</strong>{{report.content}}</span><br>
                            <span><strong>明日计划:</strong>{{report.planForTomorrow}}</span><br>
                            <span><strong>附件:</strong></span><v-btn small color="primary" @click="showFilesDialog(report)">查看附件</v-btn>
                        </div>
                    </div>

                </v-timeline-item>
            </v-timeline>
        </v-container>

        <v-dialog v-model="filesDialog" width="80%">
            <detail :id="tempDetailId"></detail>
        </v-dialog>
    </v-card>
</template>
<script>
    import proTaskProgressReport from "../../../api/proTaskProgressReport";
    import detail from "./detail";

    export default {
        name: 'chartAnalysis',
        components:{detail},
        props: {
            projectName: String
        },
        data: () => ({
            reports: [],
            proNameSearch: null,

            filesDialog:false,
            tempDetailId:null,
        }),

        watch: {
            projectName: {
                handler() {
                    this.reset()
                    if (this.projectName != null) {
                        this.proNameSearch = this.projectName
                        this.getByProName()
                    }
                },
                deep: true,
            },
        },

        created() {
            this.reset()
            if (this.projectName != null) {
                this.proNameSearch = this.projectName
                this.getByProName()
            }
        },

        methods: {
            getByProName() {
                proTaskProgressReport.getByProName({projectName: this.proNameSearch}).then(res => {
                    if (res.rows.length > 0){
                        for(let i = 0;i<res.rows.length;i++){

                            res.rows[i].createTime = res.rows[i].createTime.substr(0,10)
                        }
                    }
                    this.reports = res.rows
                })
            },

            showFilesDialog(report){
                this.tempDetailId = report.id
                this.filesDialog = true
            },

            reset() {
                this.reports = []
                this.proNameSearch = null
            },
        }

    }
</script>
