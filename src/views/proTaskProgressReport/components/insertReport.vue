<template>
    <v-container>
            <v-form ref="reportForm">
                <v-row>
                <v-col cols="12" md="5" sm="2">
                    <v-combobox v-model="tempProject"
                                :search-input.sync="searchProject"
                                :items="projectItems"
                                label="项目名称"
                                placeholder="项目名称"
                                item-text="name"
                                return-object
                                :rules="rules.projectNameRule"></v-combobox>
                </v-col>
                <v-col cols="12" md="5" sm="2">
                    <v-combobox v-model="proReport.constructionNode" label="施工节点" placeholder="施工节点"
                                :rules="rules.constructionNodeRule"></v-combobox>
                </v-col>
                <v-col cols="12" md="5" sm="2">
                    <v-text-field v-model="proReport.constructorsNumber" label="施工人数" placeholder="施工人数"
                                  onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                                  :rules="rules.constructorsNumberRule"></v-text-field>
                </v-col>
                <v-col cols="12" md="5" sm="2">
<!--                    <v-text-field v-model="proReport.progressNow" placeholder="当前进度百分比"-->
<!--                                  :rules="rules.progressNowRules"></v-text-field>-->
                    <v-progress-linear
                            v-model="proReport.progressNow"
                            color="green"
                            height="25"
                            style="margin-top: 20px"
                    >
                        <strong>当前进度百分比{{ Math.ceil(proReport.progressNow) }}%</strong>
                    </v-progress-linear>
                </v-col>
                </v-row>
                <v-col>
                    <v-text-field v-model="proReport.content" label="工作内容" placeholder="工作内容"
                                  :rules="rules.contentRule"></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field v-model="proReport.planForTomorrow" label="明日计划" placeholder="明日计划"
                                  :rules="rules.planForTomorrowRule"></v-text-field>
                </v-col>

                <v-col>
                    <file-upload :clear="clear" @change="fileUpload"></file-upload>
                </v-col>

            </v-form>
    </v-container>
</template>
<script>
    import fileUpload from "../../../components/fileUpload";
    import proTaskProgressReportApi from "../../../api/proTaskProgressReport";
    import {search} from "../../../api/project";

    export default {
        name: "insertReport",
        components: {fileUpload},
        data: () => ({
            tempProject:{
                name:null,
                id:null,
            },
            searchProject:null,
            projectItems:[],

            proReport: {
                projectName: null,
                projectId: null,
                content: null,
                constructionNode: null,
                constructorsNumber: null,
                planForTomorrow: null,
                picUrl: '',
                progressNow: null,
            },

            rules: {
                projectNameRule: [
                    v => !!v || '必填字段',
                ],
                constructionNodeRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 100) || '不超过100字符'
                ],
                contentRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 500) || '不超过500字符'
                ],
                planForTomorrowRule: [
                    v => !!v || '必填字段', v => (!!v && v.length < 500) || '不超过500字符'
                ],
                constructorsNumberRule: [
                    v => !!v || '必填字段', v => v > 0 || '请输入正确的数值'
                ],
                progressNowRules: [
                    v => !!v || '必填字段', v => (!!v && v.length < 100) || '不超过100字符'
                ]

            },

            clear: false,
        }),

        watch: {
            searchProject: {
                handler() {
                    if (this.searchProject != null) {
                        this.getProjectBySeek(this.searchProject)
                    }
                },
                deep: true,
            },
        },

        methods: {
            fileUpload(data) {
                console.log(data)
                for (let i = 0; i < data.files.length; i++) {
                    if (i == data.files.length - 1){
                        this.proReport.picUrl = this.proReport.picUrl + data.files[i].ftpPath
                    }else {
                        this.proReport.picUrl = this.proReport.picUrl + data.files[i].ftpPath + ','
                    }
                }
                console.log(this.proReport.picUrl)
            },

            validateForm() {
                let flag = null
                if (this.$refs['reportForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },

            resetFormRules(){
                this.$refs['reportForm'].resetValidation()
            },

            submitReport(){
                this.proReport.projectName = this.tempProject.name
                this.proReport.projectId = this.tempProject.id
                if (this.$refs['reportForm'].validate()){
                    proTaskProgressReportApi.insertReport(this.proReport).then(res => {
                        if (res == 1){
                            this.reset()
                        }
                    })
                }
            },

            getProjectBySeek(str) {
                search(str).then(res => {
                    if (res.length == 0){
                        this.tempProject.name = str
                        this.tempProject.id = null
                    }else{
                        this.projectItems = res
                    }
                })
            },

            reset(){
                this.proReport = {
                    projectName: null,
                    projectId:null,
                    content: null,
                    constructionNode: null,
                    constructorsNumber: null,
                    planForTomorrow: null,
                    picUrl: '',
                    progressNow: null,
                }
                this.tempProject = {
                    name:null,
                    id:null,
                }
                this.clear = false
            },

        }

    }
</script>
