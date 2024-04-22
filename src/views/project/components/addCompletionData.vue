<template>
    <v-container>
        <v-row>
            <v-col sm="3">
                <v-text-field dense label="项目名称" readonly
                              v-model="completionData.project.name"></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-text-field dense label="建设单位" readonly
                              v-model="completionData.project.oConstruction.name"></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-text-field dense label="项目人员" readonly
                              v-model="completionData.project.staff.name"></v-text-field>
            </v-col>
            <v-col sm="3">
                <easy-flow dense coding="1320291" ref="easyFlow" default-flow-name="竣工资料"></easy-flow>
            </v-col>
            <v-col sm="9">
                <v-form ref="form">
                    <file-upload :dense="true" @change="fileChangeHandler" :key="keyData"></file-upload>
                </v-form>
            </v-col>
            <v-col sm="3">
                <v-btn :disabled="completionData.files == ''" @click="submitAdd" small color="primary" style="margin: 10px">确认上传</v-btn>
            </v-col>
        </v-row>

    </v-container>
</template>
<script>
    import EasyFlow from "@/components/easyflow/easyFlow.vue";
    import FileUpload from "@/components/fileUpload.vue";
    import {insert} from "../../../api/completionData";

    export default {
        name: 'addCompletionData',
        props: {
            projectItem: Object
        },
        components: {EasyFlow, FileUpload},
        data: () => ({
            completionData: {
                project: null,
                staff: null,
                files: ''
            },
            keyData:null,
        }),

        created() {
            if (this.projectItem != null) {
                this.completionData.project = this.projectItem
            }
        },

        watch: {
            projectItem: {
                handler() {
                    if (this.projectItem != null) {
                        this.completionData.project = this.projectItem
                    }
                },
                deep: true
            }
        },

        methods: {

            submitAdd() {
                return insert(this.completionData).then(res => {
                    this.completionData.files = ''
                    this.$refs.easyFlow.startFlow({
                        title: res.project.name + "竣工资料审批",
                        content: res.remark || '',
                        frameId: res.id,
                        frameCoding: 1320291,
                        frameColumn: 'id'
                    })
                    this.keyData = new Date().getTime()
                    this.reset()
                    this.$emit('getList')
                })

            },
            reset () {
                this.$refs.form.reset()
            },

             fileChangeHandler({files}) {
                this.completionData.files = ""
                files.forEach(item => {
                    this.completionData.files += item.id + ";"
                })
                console.log(this.completionData.files)
            },

        }
    }
</script>
